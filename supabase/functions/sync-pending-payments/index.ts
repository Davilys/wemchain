import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const asaasApiKey = Deno.env.get("ASAAS_API_KEY");

  if (!asaasApiKey) {
    return new Response(
      JSON.stringify({ error: "ASAAS API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const ASAAS_BASE_URL = "https://api.asaas.com/v3";

  try {
    // Buscar todos pagamentos PENDING
    const { data: pendingPayments, error: fetchError } = await supabase
      .from("asaas_payments")
      .select("*")
      .eq("status", "PENDING")
      .order("created_at", { ascending: true });

    if (fetchError) throw fetchError;
    if (!pendingPayments || pendingPayments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "Nenhum pagamento pendente", synced: 0, total: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[SYNC] Found ${pendingPayments.length} pending payments`);

    const results: Array<{ paymentId: string; asaasStatus: string; synced: boolean; credits: number; error?: string }> = [];

    for (const payment of pendingPayments) {
      try {
        if (!payment.asaas_payment_id) {
          results.push({ paymentId: "unknown", asaasStatus: "NO_ID", synced: false, credits: 0, error: "No ASAAS payment ID" });
          continue;
        }

        // Consultar status real no ASAAS
        const asaasResponse = await fetch(`${ASAAS_BASE_URL}/payments/${payment.asaas_payment_id}`, {
          headers: { "access_token": asaasApiKey },
        });

        if (!asaasResponse.ok) {
          const errorText = await asaasResponse.text();
          results.push({ paymentId: payment.asaas_payment_id, asaasStatus: "API_ERROR", synced: false, credits: 0, error: errorText });
          continue;
        }

        const asaasData = await asaasResponse.json();
        console.log(`[SYNC] Payment ${payment.asaas_payment_id}: ASAAS status = ${asaasData.status}, DB status = ${payment.status}`);

        const isConfirmed = ["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(asaasData.status);

        if (isConfirmed) {
          // Liberar créditos via função atômica
          const { data: creditResult, error: creditError } = await supabase.rpc("add_credits_atomic", {
            p_user_id: payment.user_id,
            p_amount: payment.credits_amount,
            p_reason: `Créditos liberados via sincronização - ${payment.plan_type}`,
            p_reference_type: "payment",
            p_reference_id: payment.asaas_payment_id,
            p_is_subscription: !!payment.asaas_subscription_id,
            p_metadata: { plan_type: payment.plan_type, sync_source: "sync-pending-payments", asaas_status: asaasData.status },
          });

          if (creditError) {
            console.error(`[SYNC] Credit error for ${payment.asaas_payment_id}:`, creditError);
            results.push({ paymentId: payment.asaas_payment_id, asaasStatus: asaasData.status, synced: false, credits: 0, error: creditError.message });
            continue;
          }

          const rpcResult = creditResult as { success: boolean; idempotent?: boolean; amount_added?: number } | null;

          // Atualizar status do pagamento
          await supabase
            .from("asaas_payments")
            .update({ status: "CONFIRMED", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("asaas_payment_id", payment.asaas_payment_id);

          const wasSynced = rpcResult?.success || rpcResult?.idempotent;
          results.push({
            paymentId: payment.asaas_payment_id,
            asaasStatus: asaasData.status,
            synced: !!wasSynced,
            credits: rpcResult?.amount_added || payment.credits_amount,
          });

          console.log(`[SYNC] ✅ Payment ${payment.asaas_payment_id} synced! Credits: ${payment.credits_amount}`);
        } else {
          // Pagamento ainda não confirmado no ASAAS
          results.push({ paymentId: payment.asaas_payment_id, asaasStatus: asaasData.status, synced: false, credits: 0 });
          console.log(`[SYNC] ⏳ Payment ${payment.asaas_payment_id} still ${asaasData.status} in ASAAS`);
        }
      } catch (err) {
        results.push({ paymentId: payment.asaas_payment_id || "unknown", asaasStatus: "ERROR", synced: false, credits: 0, error: String(err) });
      }
    }

    const syncedCount = results.filter(r => r.synced).length;
    const totalCredits = results.filter(r => r.synced).reduce((sum, r) => sum + r.credits, 0);

    return new Response(
      JSON.stringify({
        success: true,
        total: pendingPayments.length,
        synced: syncedCount,
        totalCreditsReleased: totalCredits,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[SYNC] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

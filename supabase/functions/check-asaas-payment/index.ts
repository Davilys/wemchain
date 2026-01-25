import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const asaasApiKey = Deno.env.get("ASAAS_API_KEY");

  if (!asaasApiKey) {
    return new Response(
      JSON.stringify({ error: "ASAAS API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Autenticação do usuário
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
  
  if (claimsError || !claimsData.user) {
    return new Response(
      JSON.stringify({ error: "Invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userId = claimsData.user.id;

  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");
    const subscriptionId = url.searchParams.get("subscriptionId");

    const ASAAS_BASE_URL = "https://api.asaas.com/v3";

    if (paymentId) {
      // Verificar status de pagamento avulso
      const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments/${paymentId}`, {
        headers: { "access_token": asaasApiKey },
      });

      const paymentData = await paymentResponse.json();

      // Verificar se o pagamento pertence ao usuário
      const { data: dbPayment } = await supabase
        .from("asaas_payments")
        .select("*")
        .eq("asaas_payment_id", paymentId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!dbPayment) {
        return new Response(
          JSON.stringify({ error: "Payment not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: paymentId,
            status: paymentData.status,
            value: paymentData.value,
            dueDate: paymentData.dueDate,
            confirmedDate: paymentData.confirmedDate,
            paymentDate: paymentData.paymentDate,
            invoiceUrl: paymentData.invoiceUrl,
            dbStatus: dbPayment.status,
            credits: dbPayment.credits_amount,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else if (subscriptionId) {
      // Verificar status de assinatura
      const subscriptionResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions/${subscriptionId}`, {
        headers: { "access_token": asaasApiKey },
      });

      const subscriptionData = await subscriptionResponse.json();

      // Verificar se a assinatura pertence ao usuário
      const { data: dbSubscription } = await supabase
        .from("asaas_subscriptions")
        .select("*")
        .eq("asaas_subscription_id", subscriptionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!dbSubscription) {
        return new Response(
          JSON.stringify({ error: "Subscription not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          subscription: {
            id: subscriptionId,
            status: subscriptionData.status,
            value: subscriptionData.value,
            cycle: subscriptionData.cycle,
            nextDueDate: subscriptionData.nextDueDate,
            dbStatus: dbSubscription.status,
            currentCycle: dbSubscription.current_cycle,
            creditsPerCycle: dbSubscription.credits_per_cycle,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );

    } else {
      // Buscar último pagamento e assinatura ativa do usuário
      const { data: payments } = await supabase
        .from("asaas_payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: subscriptions } = await supabase
        .from("asaas_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const { data: credits } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          success: true,
          payments: payments || [],
          subscriptions: subscriptions || [],
          credits: credits || { available_credits: 0, total_credits: 0, used_credits: 0 },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Check ASAAS Payment Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

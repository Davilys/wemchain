import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Configuração de planos - PLANO BUSINESS CORRIGIDO
const PLAN_CONFIG: Record<string, { credits: number; isSubscription: boolean }> = {
  BASICO: { credits: 1, isSubscription: false },
  PROFISSIONAL: { credits: 5, isSubscription: false },
  BUSINESS: { credits: 3, isSubscription: true }, // CORRIGIDO: 3 créditos por mês
  ADICIONAL: { credits: 1, isSubscription: false }, // Registro adicional R$ 39
};

// Eventos ASAAS que liberam créditos
const CREDIT_RELEASE_EVENTS = [
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED_IN_CASH",
];

// Eventos de estorno
const REFUND_EVENTS = [
  "PAYMENT_REFUNDED",
  "PAYMENT_CHARGEBACK",
];

// Eventos de falha
const FAILURE_EVENTS = [
  "PAYMENT_FAILED",
  "PAYMENT_REFUSED",
  "PAYMENT_OVERDUE",
];

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id: string;
    customer: string;
    value: number;
    status: string;
    externalReference?: string;
    subscription?: string;
  };
  subscription?: {
    id: string;
    customer: string;
    value: number;
    status: string;
    externalReference?: string;
  };
}

interface HandlerResult {
  action: string;
  credits: number;
  error: string | null;
}

interface SimpleResult {
  action: string;
  error: string | null;
}

// deno-lint-ignore no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Apenas POST é permitido
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const webhookSecret = Deno.env.get("ASAAS_WEBHOOK_SECRET");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const rawPayload = await req.text();
    const payload: AsaasWebhookPayload = JSON.parse(rawPayload);

    // Validar webhook secret (se configurado e não vazio)
    const asaasToken = req.headers.get("asaas-access-token");
    const maskedToken = asaasToken ? asaasToken.substring(0, 6) + "***" : "NONE";
    console.log(`[ASAAS Webhook] Token recebido (mascarado): ${maskedToken}`);

    if (webhookSecret && webhookSecret.trim().length > 0) {
      if (asaasToken !== webhookSecret) {
        console.error(`[ASAAS Webhook] Invalid signature. Expected secret length: ${webhookSecret.length}, received token length: ${asaasToken?.length || 0}`);
        
        // Log tentativa inválida
        await supabase.from("asaas_webhook_logs").insert({
          event_type: payload.event || "UNKNOWN",
          raw_payload: payload,
          processed: false,
          action_taken: "REJECTED - Invalid signature",
          error_message: `Assinatura do webhook inválida. Token: ${maskedToken}`,
          ip_address: req.headers.get("x-forwarded-for") || "unknown",
        });

        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("[ASAAS Webhook] ⚠️ ASAAS_WEBHOOK_SECRET não configurado ou vazio. Aceitando webhook sem validação de token.");
    }

    const eventType = payload.event;
    const paymentId = payload.payment?.id || null;
    const subscriptionId = payload.payment?.subscription || payload.subscription?.id || null;
    const externalReference = payload.payment?.externalReference || payload.subscription?.externalReference;

    console.log(`[ASAAS Webhook] Event: ${eventType}, Payment: ${paymentId}, Subscription: ${subscriptionId}`);

    // Verificar idempotência - se já processamos este evento exato
    if (paymentId) {
      const { data: existingLog } = await supabase
        .from("asaas_webhook_logs")
        .select("id")
        .eq("asaas_payment_id", paymentId)
        .eq("event_type", eventType)
        .eq("processed", true)
        .maybeSingle();

      if (existingLog) {
        console.log(`[ASAAS Webhook] Event already processed, skipping (idempotent)`);
        
        return new Response(
          JSON.stringify({ success: true, message: "Event already processed", idempotent: true }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let actionTaken = "LOGGED";
    let creditsReleased = 0;
    let errorMessage: string | null = null;

    // Processar evento
    if (CREDIT_RELEASE_EVENTS.includes(eventType)) {
      // PAGAMENTO CONFIRMADO - Liberar créditos via ledger atômico
      const result = await handlePaymentConfirmed(supabase, payload, externalReference);
      actionTaken = result.action;
      creditsReleased = result.credits;
      errorMessage = result.error;

    } else if (eventType === "SUBSCRIPTION_PAYMENT_CONFIRMED") {
      // PAGAMENTO DE ASSINATURA - Resetar e liberar créditos
      const result = await handleSubscriptionPaymentConfirmed(supabase, payload);
      actionTaken = result.action;
      creditsReleased = result.credits;
      errorMessage = result.error;

    } else if (eventType === "SUBSCRIPTION_CREATED") {
      // ASSINATURA CRIADA - Apenas registrar, não liberar créditos ainda
      const result = await handleSubscriptionCreated(supabase, payload, externalReference);
      actionTaken = result.action;
      errorMessage = result.error;

    } else if (eventType === "SUBSCRIPTION_CANCELED") {
      // ASSINATURA CANCELADA - Bloquear novos créditos (manter existentes)
      const result = await handleSubscriptionCanceled(supabase, payload);
      actionTaken = result.action;
      errorMessage = result.error;

    } else if (REFUND_EVENTS.includes(eventType)) {
      // ESTORNO / CHARGEBACK - Processar via ledger
      const result = await handlePaymentRefund(supabase, payload);
      actionTaken = result.action;
      creditsReleased = result.credits;
      errorMessage = result.error;

    } else if (FAILURE_EVENTS.includes(eventType)) {
      // PAGAMENTO FALHOU - Registrar falha, NÃO consumir crédito
      const result = await handlePaymentFailed(supabase, payload);
      actionTaken = result.action;
      errorMessage = result.error;
    }

    // Registrar log do webhook (auditoria imutável)
    await supabase.from("asaas_webhook_logs").insert({
      event_type: eventType,
      asaas_payment_id: paymentId,
      asaas_subscription_id: subscriptionId,
      raw_payload: payload,
      processed: true,
      action_taken: actionTaken,
      credits_released: creditsReleased,
      error_message: errorMessage,
      ip_address: req.headers.get("x-forwarded-for") || "unknown",
    });

    console.log(`[ASAAS Webhook] Completed: ${actionTaken}, Credits: ${creditsReleased}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: actionTaken, 
        credits_released: creditsReleased 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ASAAS Webhook] Error:", error);

    // Tentar logar o erro
    try {
      await supabase.from("asaas_webhook_logs").insert({
        event_type: "ERROR",
        raw_payload: { error: String(error) },
        processed: false,
        action_taken: "ERROR",
        error_message: String(error),
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
      });
    } catch (logError) {
      console.error("[ASAAS Webhook] Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Handler para pagamento confirmado (avulso) - USA LEDGER ATÔMICO
async function handlePaymentConfirmed(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload,
  externalReference?: string
): Promise<HandlerResult> {
  const paymentId = payload.payment?.id;
  
  if (!paymentId) {
    return { action: "SKIPPED - No payment ID", credits: 0, error: "Payment ID não encontrado" };
  }

  // Buscar pagamento no banco
  const { data: payment } = await supabase
    .from("asaas_payments")
    .select("user_id, plan_type, status, credits_amount")
    .eq("asaas_payment_id", paymentId)
    .maybeSingle();

  let userId: string;
  let planType: string;
  let credits: number;

  if (!payment) {
    // Tentar encontrar pelo external reference (user_id)
    if (externalReference) {
      userId = externalReference;
      planType = determinePlanType(payload.payment?.value || 0);
      const planConfig = PLAN_CONFIG[planType];
      credits = planConfig?.credits || 1;
    } else {
      return { action: "SKIPPED - Payment not found", credits: 0, error: "Pagamento não encontrado no banco" };
    }
  } else {
    if (payment.status === "CONFIRMED") {
      return { action: "SKIPPED - Already confirmed", credits: 0, error: null };
    }
    userId = payment.user_id;
    planType = payment.plan_type;
    credits = payment.credits_amount || PLAN_CONFIG[planType]?.credits || 1;
  }

  // Usar função atômica do ledger
  const { data: result, error } = await supabase.rpc("add_credits_atomic", {
    p_user_id: userId,
    p_amount: credits,
    p_reason: `Pagamento confirmado - Plano ${planType}`,
    p_reference_type: "payment",
    p_reference_id: paymentId,
    p_is_subscription: false,
    p_metadata: { 
      payment_value: payload.payment?.value,
      event: payload.event 
    },
  });

  if (error) {
    console.error("Error in add_credits_atomic:", error);
    return { action: "ERROR - RPC failed", credits: 0, error: error.message };
  }

  const rpcResult = result as { success: boolean; idempotent?: boolean; amount_added?: number; error?: string } | null;

  if (!rpcResult?.success) {
    if (rpcResult?.idempotent) {
      return { action: "SKIPPED - Already processed (idempotent)", credits: 0, error: null };
    }
    return { action: "ERROR - " + (rpcResult?.error || "Unknown"), credits: 0, error: rpcResult?.error || null };
  }

  // Atualizar status do pagamento
  await supabase
    .from("asaas_payments")
    .update({ status: "CONFIRMED", paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("asaas_payment_id", paymentId);

  return { 
    action: "CREDITS_RELEASED_ATOMIC", 
    credits: rpcResult.amount_added || credits, 
    error: null 
  };
}

// Handler para pagamento de assinatura confirmado
async function handleSubscriptionPaymentConfirmed(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload
): Promise<HandlerResult> {
  const subscriptionId = payload.payment?.subscription;
  const paymentId = payload.payment?.id;

  if (!subscriptionId) {
    return { action: "SKIPPED - No subscription ID", credits: 0, error: null };
  }

  // Buscar subscription e user_id
  const { data: subscription } = await supabase
    .from("asaas_subscriptions")
    .select("user_id, plan_type, credits_per_cycle")
    .eq("asaas_subscription_id", subscriptionId)
    .maybeSingle();

  if (!subscription) {
    return { action: "SKIPPED - Subscription not found", credits: 0, error: "Assinatura não encontrada" };
  }

  const credits = subscription.credits_per_cycle || 3; // CORRIGIDO: Default para 3 créditos

  // Usar função atômica do ledger com reset (assinatura)
  const { data: result, error } = await supabase.rpc("add_credits_atomic", {
    p_user_id: subscription.user_id,
    p_amount: credits,
    p_reason: `Renovação de assinatura mensal - ${subscription.plan_type}`,
    p_reference_type: "subscription",
    p_reference_id: paymentId,
    p_is_subscription: true,
    p_metadata: { 
      subscription_id: subscriptionId,
      event: payload.event 
    },
  });

  if (error) {
    return { action: "ERROR - RPC failed", credits: 0, error: error.message };
  }

  const rpcResult = result as { success: boolean; amount_added?: number; was_subscription_reset?: boolean } | null;

  // Atualizar status da assinatura
  await supabase.rpc("update_subscription_status", {
    p_asaas_subscription_id: subscriptionId,
    p_status: "ACTIVE",
  });

  return { 
    action: rpcResult?.was_subscription_reset ? "SUBSCRIPTION_CREDITS_RESET" : "SUBSCRIPTION_CREDITS_RELEASED", 
    credits: rpcResult?.amount_added || credits, 
    error: null 
  };
}

// Handler para assinatura criada
async function handleSubscriptionCreated(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload,
  externalReference?: string
): Promise<SimpleResult> {
  const subscriptionId = payload.subscription?.id;
  const customerId = payload.subscription?.customer;

  if (!subscriptionId) {
    return { action: "SKIPPED - No subscription ID", error: null };
  }

  // Verificar se já existe
  const { data: existing } = await supabase
    .from("asaas_subscriptions")
    .select("id")
    .eq("asaas_subscription_id", subscriptionId)
    .maybeSingle();

  if (existing) {
    return { action: "SKIPPED - Subscription already exists", error: null };
  }

  // Usar externalReference como user_id se disponível
  if (externalReference) {
    await supabase.from("asaas_subscriptions").insert({
      user_id: externalReference,
      asaas_subscription_id: subscriptionId,
      asaas_customer_id: customerId,
      plan_type: "BUSINESS",
      status: "PENDING",
      credits_per_cycle: 3, // CORRIGIDO: 3 créditos por ciclo
    });

    return { action: "SUBSCRIPTION_CREATED", error: null };
  }

  return { action: "SKIPPED - No user reference", error: "Referência de usuário não encontrada" };
}

// Handler para assinatura cancelada
async function handleSubscriptionCanceled(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload
): Promise<SimpleResult> {
  const subscriptionId = payload.subscription?.id;

  if (!subscriptionId) {
    return { action: "SKIPPED - No subscription ID", error: null };
  }

  // Atualizar status - NÃO remove créditos existentes
  await supabase
    .from("asaas_subscriptions")
    .update({ status: "CANCELED", updated_at: new Date().toISOString() })
    .eq("asaas_subscription_id", subscriptionId);

  return { action: "SUBSCRIPTION_CANCELED - Credits preserved", error: null };
}

// Handler para estorno/chargeback - USA LEDGER
async function handlePaymentRefund(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload
): Promise<HandlerResult> {
  const paymentId = payload.payment?.id;

  if (!paymentId) {
    return { action: "SKIPPED - No payment ID", credits: 0, error: null };
  }

  // Usar função específica de estorno
  const { data: result, error } = await supabase.rpc("handle_payment_refund", {
    p_asaas_payment_id: paymentId,
  });

  if (error) {
    return { action: "ERROR - Refund RPC failed", credits: 0, error: error.message };
  }

  const refundResult = result as { 
    success: boolean; 
    credits_refunded?: number; 
    admin_action_required?: boolean;
    error?: string;
  } | null;

  if (!refundResult?.success) {
    if (refundResult?.admin_action_required) {
      return { 
        action: "REFUND_PENDING_ADMIN", 
        credits: 0, 
        error: refundResult.error || "Pendência administrativa criada"
      };
    }
    return { action: "ERROR - " + (refundResult?.error || "Unknown"), credits: 0, error: refundResult?.error || null };
  }

  return { 
    action: "PAYMENT_REFUNDED", 
    credits: -(refundResult.credits_refunded || 0), 
    error: null 
  };
}

// Handler para pagamento falhou
async function handlePaymentFailed(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload
): Promise<SimpleResult> {
  const paymentId = payload.payment?.id;

  if (paymentId) {
    // NÃO liberar créditos, apenas marcar como falhou
    await supabase
      .from("asaas_payments")
      .update({ status: "FAILED", updated_at: new Date().toISOString() })
      .eq("asaas_payment_id", paymentId);
  }

  return { action: "PAYMENT_FAILED_LOGGED - No credits released", error: null };
}

// Determinar tipo de plano pelo valor
function determinePlanType(value: number): string {
  if (value >= 149) return "PROFISSIONAL";
  if (value >= 99) return "BUSINESS";
  if (value >= 49) return "BASICO";
  if (value >= 39) return "ADICIONAL";
  return "BASICO";
}

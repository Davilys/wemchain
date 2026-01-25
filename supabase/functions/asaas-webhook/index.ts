import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

// Configuração de planos
const PLAN_CONFIG: Record<string, { credits: number; isSubscription: boolean }> = {
  BASICO: { credits: 1, isSubscription: false },
  PROFISSIONAL: { credits: 5, isSubscription: false },
  MENSAL: { credits: 5, isSubscription: true },
};

// Eventos ASAAS que liberam créditos
const CREDIT_RELEASE_EVENTS = [
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED_IN_CASH",
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

    // Validar webhook secret (se configurado)
    const asaasToken = req.headers.get("asaas-access-token");
    if (webhookSecret && asaasToken !== webhookSecret) {
      console.error("Invalid webhook signature");
      
      // Log tentativa inválida
      await supabase.from("asaas_webhook_logs").insert({
        event_type: payload.event || "UNKNOWN",
        raw_payload: payload,
        processed: false,
        action_taken: "REJECTED - Invalid signature",
        error_message: "Assinatura do webhook inválida",
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
      });

      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const eventType = payload.event;
    const paymentId = payload.payment?.id || null;
    const subscriptionId = payload.payment?.subscription || payload.subscription?.id || null;
    const externalReference = payload.payment?.externalReference || payload.subscription?.externalReference;

    console.log(`[ASAAS Webhook] Event: ${eventType}, Payment: ${paymentId}, Subscription: ${subscriptionId}`);

    // Verificar idempotência - se já processamos este evento
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
      // PAGAMENTO CONFIRMADO - Liberar créditos
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
      // ASSINATURA CANCELADA - Bloquear novos créditos
      const result = await handleSubscriptionCanceled(supabase, payload);
      actionTaken = result.action;
      errorMessage = result.error;

    } else if (FAILURE_EVENTS.includes(eventType)) {
      // PAGAMENTO FALHOU - Registrar falha
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

// Handler para pagamento confirmado (avulso)
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
    .select("user_id, plan_type, status")
    .eq("asaas_payment_id", paymentId)
    .maybeSingle();

  if (!payment) {
    // Tentar encontrar pelo external reference (user_id)
    if (externalReference) {
      const planType = determinePlanType(payload.payment?.value || 0);
      const planConfig = PLAN_CONFIG[planType];
      const credits = planConfig?.credits || 1;
      
      const { data: result, error } = await supabase.rpc("release_credits_from_payment", {
        p_user_id: externalReference,
        p_credits: credits,
        p_plan_type: planType,
        p_asaas_payment_id: paymentId,
        p_is_subscription: false,
      });

      if (error) {
        return { action: "ERROR - RPC failed", credits: 0, error: error.message };
      }

      const rpcResult = result as { idempotent?: boolean; credits_released?: number } | null;

      if (rpcResult?.idempotent) {
        return { action: "SKIPPED - Already processed", credits: 0, error: null };
      }

      return { 
        action: "CREDITS_RELEASED", 
        credits: rpcResult?.credits_released || credits, 
        error: null 
      };
    }
    return { action: "SKIPPED - Payment not found", credits: 0, error: "Pagamento não encontrado no banco" };
  }

  if (payment.status === "CONFIRMED") {
    return { action: "SKIPPED - Already confirmed", credits: 0, error: null };
  }

  const planType = payment.plan_type as string;
  const planConfig = PLAN_CONFIG[planType];
  const credits = planConfig?.credits || 1;

  // Liberar créditos via função do banco
  const { data: result, error } = await supabase.rpc("release_credits_from_payment", {
    p_user_id: payment.user_id,
    p_credits: credits,
    p_plan_type: planType,
    p_asaas_payment_id: paymentId,
    p_is_subscription: false,
  });

  if (error) {
    return { action: "ERROR - RPC failed", credits: 0, error: error.message };
  }

  const rpcResult = result as { idempotent?: boolean; credits_released?: number } | null;

  if (rpcResult?.idempotent) {
    return { action: "SKIPPED - Already processed", credits: 0, error: null };
  }

  return { 
    action: "CREDITS_RELEASED", 
    credits: rpcResult?.credits_released || credits, 
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

  const credits = subscription.credits_per_cycle || 5;

  // Liberar créditos (resetar para assinatura)
  const { data: result, error } = await supabase.rpc("release_credits_from_payment", {
    p_user_id: subscription.user_id,
    p_credits: credits,
    p_plan_type: subscription.plan_type,
    p_asaas_payment_id: paymentId,
    p_is_subscription: true,
  });

  if (error) {
    return { action: "ERROR - RPC failed", credits: 0, error: error.message };
  }

  const rpcResult = result as { credits_released?: number } | null;

  // Atualizar status da assinatura
  await supabase.rpc("update_subscription_status", {
    p_asaas_subscription_id: subscriptionId,
    p_status: "ACTIVE",
  });

  return { 
    action: "SUBSCRIPTION_CREDITS_RELEASED", 
    credits: rpcResult?.credits_released || credits, 
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
      plan_type: "MENSAL",
      status: "PENDING",
      credits_per_cycle: 5,
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

  // Atualizar status
  await supabase
    .from("asaas_subscriptions")
    .update({ status: "CANCELED", updated_at: new Date().toISOString() })
    .eq("asaas_subscription_id", subscriptionId);

  return { action: "SUBSCRIPTION_CANCELED", error: null };
}

// Handler para pagamento falhou
async function handlePaymentFailed(
  supabase: AnySupabaseClient,
  payload: AsaasWebhookPayload
): Promise<SimpleResult> {
  const paymentId = payload.payment?.id;

  if (paymentId) {
    await supabase
      .from("asaas_payments")
      .update({ status: "FAILED", updated_at: new Date().toISOString() })
      .eq("asaas_payment_id", paymentId);
  }

  return { action: "PAYMENT_FAILED_LOGGED", error: null };
}

// Determinar tipo de plano pelo valor
function determinePlanType(value: number): string {
  if (value >= 149) return "PROFISSIONAL";
  if (value >= 99) return "MENSAL";
  return "BASICO";
}

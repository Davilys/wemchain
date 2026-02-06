import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Configuração de planos - PLANO BUSINESS CORRIGIDO
const PLANS: Record<string, {
  name: string;
  value: number;
  credits: number;
  description: string;
  isSubscription: boolean;
  cycle?: string;
}> = {
  BASICO: {
    name: "Básico",
    value: 49.00,
    credits: 1,
    description: "1 Registro de Propriedade em Blockchain",
    isSubscription: false,
  },
  PROFISSIONAL: {
    name: "Profissional",
    value: 149.00,
    credits: 5,
    description: "5 Registros de Propriedade em Blockchain",
    isSubscription: false,
  },
  BUSINESS: {
    name: "Business",
    value: 99.00,
    credits: 3, // 3 créditos inclusos por mês
    description: "Plano Business - Registro de Propriedade Intelectual (3 créditos/mês)",
    isSubscription: true,
    cycle: "MONTHLY",
  },
  ADICIONAL: {
    name: "Registro Adicional",
    value: 39.00, // CORRIGIDO: R$ 39,00 por registro adicional
    credits: 1,
    description: "Registro Adicional de Propriedade",
    isSubscription: false,
  },
};

interface CreatePaymentRequest {
  planType: "BASICO" | "PROFISSIONAL" | "BUSINESS" | "ADICIONAL";
  quantity?: number; // Quantidade de créditos (apenas para BASICO)
  customerName: string;
  customerEmail: string;
  customerCpfCnpj: string;
  customerPhone?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
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
  const userEmail = claimsData.user.email;

  try {
    const body: CreatePaymentRequest = await req.json();
    const { planType, quantity, customerName, customerEmail, customerCpfCnpj, customerPhone } = body;

    const plan = PLANS[planType];
    if (!plan) {
      return new Response(
        JSON.stringify({ error: "Invalid plan type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate dynamic values for BASICO plan with quantity
    let finalValue = plan.value;
    let finalCredits = plan.credits;
    let finalDescription = plan.description;

    if (planType === "BASICO" && quantity && quantity > 1) {
      // Validate quantity (1-50)
      const validQuantity = Math.max(1, Math.min(50, Math.floor(quantity)));
      finalValue = validQuantity * 49.00;
      finalCredits = validQuantity;
      finalDescription = `${validQuantity} Registros de Propriedade em Blockchain`;
    }

    // ASAAS API Base URL (Produção)
    const ASAAS_BASE_URL = "https://api.asaas.com/v3";

    // 1. Criar ou buscar cliente no ASAAS
    const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": asaasApiKey,
      },
      body: JSON.stringify({
        name: customerName,
        email: customerEmail || userEmail,
        cpfCnpj: customerCpfCnpj.replace(/\D/g, ""),
        phone: customerPhone?.replace(/\D/g, ""),
        externalReference: userId,
      }),
    });

    const customerData = await customerResponse.json();
    
    // Se cliente já existe, usar o existente
    let customerId = customerData.id;
    if (customerData.errors?.[0]?.code === "invalid_cpfCnpj") {
      // Buscar cliente existente pelo CPF/CNPJ
      const searchResponse = await fetch(
        `${ASAAS_BASE_URL}/customers?cpfCnpj=${customerCpfCnpj.replace(/\D/g, "")}`,
        {
          headers: { "access_token": asaasApiKey },
        }
      );
      const searchData = await searchResponse.json();
      if (searchData.data?.[0]?.id) {
        customerId = searchData.data[0].id;
      }
    }

    if (!customerId) {
      console.error("ASAAS Customer Error:", customerData);
      return new Response(
        JSON.stringify({ error: "Failed to create customer", details: customerData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let paymentData: Record<string, unknown>;
    let asaasPaymentId: string;
    let asaasSubscriptionId: string | null = null;

    if (plan.isSubscription) {
      // 2a. Criar assinatura recorrente
      const subscriptionResponse = await fetch(`${ASAAS_BASE_URL}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": asaasApiKey,
        },
        body: JSON.stringify({
          customer: customerId,
          billingType: "PIX", // Usar PIX para ter QR Code
          value: plan.value,
          cycle: "MONTHLY",
          description: `WebMarcas - Plano ${plan.name}`,
          externalReference: userId,
        }),
      });

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionData.id) {
        console.error("ASAAS Subscription Error:", subscriptionData);
        return new Response(
          JSON.stringify({ error: "Failed to create subscription", details: subscriptionData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      asaasSubscriptionId = subscriptionData.id;

      // Buscar o primeiro pagamento da assinatura para obter o QR Code
      let pixQrCode = null;
      let pixCopyPaste = null;
      let firstPaymentId = null;

      // Aguardar um pouco e buscar os pagamentos da assinatura
      await new Promise(resolve => setTimeout(resolve, 1000));

      const paymentsResponse = await fetch(
        `${ASAAS_BASE_URL}/subscriptions/${asaasSubscriptionId}/payments`,
        {
          headers: { "access_token": asaasApiKey },
        }
      );

      const paymentsData = await paymentsResponse.json();
      
      if (paymentsData.data?.[0]?.id) {
        firstPaymentId = paymentsData.data[0].id;
        
        // Buscar QR Code Pix do primeiro pagamento
        const pixResponse = await fetch(
          `${ASAAS_BASE_URL}/payments/${firstPaymentId}/pixQrCode`,
          {
            headers: { "access_token": asaasApiKey },
          }
        );

        const pixData = await pixResponse.json();
        pixQrCode = pixData.encodedImage || null;
        pixCopyPaste = pixData.payload || null;
      }

      asaasPaymentId = firstPaymentId || subscriptionData.id;

      // Registrar assinatura no banco
      const serviceClient = createClient(
        supabaseUrl,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await serviceClient.from("asaas_subscriptions").insert({
        user_id: userId,
        asaas_subscription_id: asaasSubscriptionId,
        asaas_customer_id: customerId,
        plan_type: planType,
        status: "PENDING",
        credits_per_cycle: plan.credits,
      });

      paymentData = {
        type: "subscription",
        subscriptionId: asaasSubscriptionId,
        paymentId: firstPaymentId,
        invoiceUrl: subscriptionData.invoiceUrl || `https://www.asaas.com/c/${subscriptionData.id}`,
        status: subscriptionData.status,
        pixQrCode: pixQrCode,
        pixCopyPaste: pixCopyPaste,
      };

    } else {
      // 2b. Criar cobrança avulsa com Pix
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias

      const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access_token": asaasApiKey,
        },
        body: JSON.stringify({
          customer: customerId,
          billingType: "PIX",
          value: finalValue,
          dueDate: dueDate.toISOString().split("T")[0],
          description: `WebMarcas - ${finalDescription}`,
          externalReference: userId,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResult.id) {
        console.error("ASAAS Payment Error:", paymentResult);
        return new Response(
          JSON.stringify({ error: "Failed to create payment", details: paymentResult }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      asaasPaymentId = paymentResult.id;

      // 3. Buscar QR Code Pix
      const pixResponse = await fetch(`${ASAAS_BASE_URL}/payments/${asaasPaymentId}/pixQrCode`, {
        headers: { "access_token": asaasApiKey },
      });

      const pixData = await pixResponse.json();

      paymentData = {
        type: "payment",
        paymentId: asaasPaymentId,
        invoiceUrl: paymentResult.invoiceUrl,
        status: paymentResult.status,
        dueDate: paymentResult.dueDate,
        pixQrCode: pixData.encodedImage,
        pixCopyPaste: pixData.payload,
      };
    }

    // 4. Registrar pagamento no banco
    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient.from("asaas_payments").insert({
      user_id: userId,
      asaas_payment_id: asaasPaymentId,
      asaas_subscription_id: asaasSubscriptionId,
      plan_type: planType,
      valor: finalValue,
      credits_amount: finalCredits,
      status: "PENDING",
      payment_method: plan.isSubscription ? "SUBSCRIPTION" : "PIX",
      pix_qr_code: paymentData.pixQrCode as string || null,
      pix_copy_paste: paymentData.pixCopyPaste as string || null,
      invoice_url: paymentData.invoiceUrl as string || null,
      due_date: paymentData.dueDate as string || null,
    });

    return new Response(
      JSON.stringify({
        success: true,
        plan: {
          type: planType,
          name: plan.name,
          value: finalValue,
          credits: finalCredits,
        },
        payment: paymentData,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Create ASAAS Payment Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

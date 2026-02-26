import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is super_admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check super_admin role
    const { data: isSuperAdmin } = await adminClient.rpc("is_super_admin", {
      _user_id: userData.user.id,
    });
    if (!isSuperAdmin) {
      return new Response(
        JSON.stringify({ error: "Apenas super admins podem unificar contas" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { primary_user_id, secondary_user_id } = await req.json();

    if (!primary_user_id || !secondary_user_id) {
      return new Response(
        JSON.stringify({ error: "primary_user_id e secondary_user_id são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (primary_user_id === secondary_user_id) {
      return new Response(
        JSON.stringify({ error: "IDs devem ser diferentes" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transfer registros
    await adminClient
      .from("registros")
      .update({ user_id: primary_user_id })
      .eq("user_id", secondary_user_id);

    // Transfer certificates
    await adminClient
      .from("certificates")
      .update({ user_id: primary_user_id })
      .eq("user_id", secondary_user_id);

    // Transfer credits_ledger
    await adminClient
      .from("credits_ledger")
      .update({ user_id: primary_user_id })
      .eq("user_id", secondary_user_id);

    // Transfer asaas_payments
    await adminClient
      .from("asaas_payments")
      .update({ user_id: primary_user_id })
      .eq("user_id", secondary_user_id);

    // Transfer asaas_subscriptions
    await adminClient
      .from("asaas_subscriptions")
      .update({ user_id: primary_user_id })
      .eq("user_id", secondary_user_id);

    // Transfer projects
    await adminClient
      .from("projects")
      .update({ owner_user_id: primary_user_id })
      .eq("owner_user_id", secondary_user_id);

    // Reconcile credits for primary user
    await adminClient.rpc("reconcile_credit_balance", {
      p_user_id: primary_user_id,
    });

    // Block secondary account
    await adminClient
      .from("profiles")
      .update({
        is_blocked: true,
        blocked_at: new Date().toISOString(),
        blocked_reason: "Conta unificada com conta principal",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", secondary_user_id);

    // Log admin action
    await adminClient.from("admin_action_logs").insert({
      admin_id: userData.user.id,
      admin_role: "super_admin",
      action_type: "client_merge",
      target_type: "user",
      target_id: secondary_user_id,
      details: {
        primary_user_id,
        secondary_user_id,
        merged_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Contas unificadas com sucesso",
        primary_user_id,
        secondary_user_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error merging clients:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

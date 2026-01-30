import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user token to verify admin status
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client to verify caller is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get calling user
    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !callingUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller has admin rights using RPC
    const { data: adminRole, error: roleError } = await userClient.rpc("get_user_admin_role", {
      _user_id: callingUser.id,
    });

    if (roleError || !adminRole || !["super_admin", "admin"].includes(adminRole)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const { action, user_id, plan_type, credits_per_cycle } = await req.json();

    if (!action || !user_id) {
      return new Response(JSON.stringify({ error: "action and user_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin client to manage subscriptions
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "grant") {
      // Grant business plan to user
      const subscriptionId = `ADMIN_GRANTED_${user_id}_${Date.now()}`;
      const targetPlanType = plan_type || "BUSINESS";
      const targetCredits = credits_per_cycle || 5;
      
      // Check if user already has an active subscription of this plan
      const { data: existingSub } = await adminClient
        .from("asaas_subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("plan_type", targetPlanType)
        .eq("status", "ACTIVE")
        .maybeSingle();

      let subscription;
      let isRenewal = false;

      if (existingSub) {
        // RENOVAR: Atualizar assinatura existente
        isRenewal = true;
        const { data: updatedSub, error: updateError } = await adminClient
          .from("asaas_subscriptions")
          .update({
            credits_per_cycle: targetCredits,
            current_cycle: existingSub.current_cycle + 1,
            last_credit_reset_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingSub.id)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        subscription = updatedSub;
      } else {
        // CRIAR: Nova assinatura
        const { data: newSub, error: subError } = await adminClient
          .from("asaas_subscriptions")
          .insert({
            user_id,
            asaas_subscription_id: subscriptionId,
            asaas_customer_id: `ADMIN_GRANTED_${callingUser.id}`,
            plan_type: targetPlanType,
            status: "ACTIVE",
            credits_per_cycle: targetCredits,
            current_cycle: 1,
            next_billing_date: null, // Manual - no auto billing
          })
          .select()
          .single();

        if (subError) {
          return new Response(JSON.stringify({ error: subError.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        subscription = newSub;
      }

      // Add credits (both for new and renewal)
      await adminClient.rpc("add_credits_admin", {
        p_user_id: user_id,
        p_amount: targetCredits,
        p_reason: isRenewal 
          ? `Renovação do plano ${targetPlanType} pelo admin ${callingUser.email}`
          : `Créditos do plano ${targetPlanType} concedido pelo admin ${callingUser.email}`,
        p_admin_id: callingUser.id,
      });

      // Log admin action
      await adminClient.from("admin_action_logs").insert({
        admin_id: callingUser.id,
        admin_role: adminRole,
        action_type: isRenewal ? "subscription_renewed" : "subscription_granted",
        target_type: "user",
        target_id: user_id,
        details: {
          plan_type: targetPlanType,
          credits_per_cycle: targetCredits,
          subscription_id: subscription.id,
          is_renewal: isRenewal,
        },
      });

      return new Response(JSON.stringify({
        success: true,
        message: isRenewal 
          ? "Assinatura renovada com sucesso" 
          : "Assinatura concedida com sucesso",
        subscription,
        renewed: isRenewal,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "revoke") {
      // Revoke/cancel subscription
      const { error: updateError } = await adminClient
        .from("asaas_subscriptions")
        .update({
          status: "CANCELLED",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("plan_type", plan_type || "BUSINESS")
        .eq("status", "ACTIVE");

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log admin action
      await adminClient.from("admin_action_logs").insert({
        admin_id: callingUser.id,
        admin_role: adminRole,
        action_type: "subscription_revoked",
        target_type: "user",
        target_id: user_id,
        details: {
          plan_type: plan_type || "BUSINESS",
        },
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Assinatura revogada com sucesso",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "update") {
      // Update subscription credits
      const { error: updateError } = await adminClient
        .from("asaas_subscriptions")
        .update({
          credits_per_cycle: credits_per_cycle,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user_id)
        .eq("plan_type", plan_type || "BUSINESS")
        .eq("status", "ACTIVE");

      if (updateError) {
        return new Response(JSON.stringify({ error: updateError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Log admin action
      await adminClient.from("admin_action_logs").insert({
        admin_id: callingUser.id,
        admin_role: adminRole,
        action_type: "subscription_updated",
        target_type: "user",
        target_id: user_id,
        details: {
          plan_type: plan_type || "BUSINESS",
          new_credits_per_cycle: credits_per_cycle,
        },
      });

      return new Response(JSON.stringify({
        success: true,
        message: "Assinatura atualizada com sucesso",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action. Use grant, revoke, or update" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error: unknown) {
    console.error("Error managing subscription:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

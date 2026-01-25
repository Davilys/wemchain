import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AlertLevel = "INFO" | "WARN" | "ERROR" | "CRITICAL";

interface AlertPayload {
  level: AlertLevel;
  title: string;
  message: string;
  service?: string;
  metadata?: Record<string, unknown>;
}

interface AlertLog {
  level: AlertLevel;
  title: string;
  message: string;
  service: string;
  metadata: Record<string, unknown>;
  sent_at: string;
  delivery_status: "pending" | "sent" | "failed";
  error?: string;
}

/**
 * Sistema de Alertas Críticos
 * 
 * Envia alertas para eventos críticos do sistema:
 * - Worker caiu
 * - Fila travou
 * - Webhook ASAAS falhou
 * - Muitos registros FAILED
 * - Erros CRITICAL
 * 
 * Canal primário: Logs + Dashboard (Resend email pode ser adicionado)
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date().toISOString();

  try {
    // Handle different request types
    if (req.method === "POST") {
      // Receive and process alert
      const body: AlertPayload = await req.json();
      
      const alertLog: AlertLog = {
        level: body.level || "INFO",
        title: body.title || "Alert",
        message: body.message || "",
        service: body.service || "unknown",
        metadata: body.metadata || {},
        sent_at: now,
        delivery_status: "pending",
      };

      console.log(`[ALERT] [${alertLog.level}] ${alertLog.title}: ${alertLog.message}`);

      // Store alert in audit_logs for persistence
      const { error: logError } = await supabase.from("audit_logs").insert({
        action_type: `alert_${alertLog.level.toLowerCase()}`,
        document_type: alertLog.service,
        metadata: {
          alert: alertLog,
          timestamp: now,
        },
      });

      if (logError) {
        console.error("[ALERT] Failed to store alert:", logError);
        alertLog.delivery_status = "failed";
        alertLog.error = logError.message;
      } else {
        alertLog.delivery_status = "sent";
      }

      // For CRITICAL alerts, we could send email (if Resend is configured)
      if (alertLog.level === "CRITICAL") {
        // TODO: Implement email sending via Resend when configured
        console.log("[ALERT] CRITICAL alert would trigger email notification");
      }

      return new Response(
        JSON.stringify({ 
          success: alertLog.delivery_status === "sent", 
          alert: alertLog 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      // Retrieve recent alerts
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "50");
      const level = url.searchParams.get("level");

      let query = supabase
        .from("audit_logs")
        .select("*")
        .like("action_type", "alert_%")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (level) {
        query = query.eq("action_type", `alert_${level.toLowerCase()}`);
      }

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ alerts: data || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[ALERT] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

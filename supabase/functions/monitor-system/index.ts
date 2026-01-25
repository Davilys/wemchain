import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonitorResult {
  timestamp: string;
  checks_performed: string[];
  alerts_triggered: AlertTriggered[];
  system_healthy: boolean;
}

interface AlertTriggered {
  level: "WARN" | "ERROR" | "CRITICAL";
  title: string;
  message: string;
  service: string;
}

/**
 * Monitor do Sistema - Verificações Automáticas
 * 
 * Pode ser chamado periodicamente (via cron) para:
 * - Detectar fila travada
 * - Detectar muitos registros falhando
 * - Detectar erros de webhook
 * - Verificar saúde geral do sistema
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const timestamp = now.toISOString();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000).toISOString();

  const alerts: AlertTriggered[] = [];
  const checksPerformed: string[] = [];

  try {
    // Check 1: Stuck Processing Jobs
    checksPerformed.push("stuck_processing_jobs");
    const { data: stuckJobs } = await supabase
      .from("registros")
      .select("id, updated_at")
      .eq("status", "processando")
      .lt("updated_at", fifteenMinutesAgo);

    if (stuckJobs && stuckJobs.length > 0) {
      alerts.push({
        level: "ERROR",
        title: "Registros Travados em Processamento",
        message: `${stuckJobs.length} registros estão em status 'processando' há mais de 15 minutos`,
        service: "queue",
      });
    }

    // Check 2: High Failure Rate (last hour)
    checksPerformed.push("failure_rate");
    const [failedResult, totalResult] = await Promise.all([
      supabase
        .from("registros")
        .select("id", { count: "exact", head: true })
        .eq("status", "falhou")
        .gte("updated_at", oneHourAgo),
      supabase
        .from("registros")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneHourAgo),
    ]);

    const failedCount = failedResult.count || 0;
    const totalCount = totalResult.count || 0;

    if (failedCount > 5) {
      const failureRate = totalCount > 0 ? (failedCount / totalCount) * 100 : 0;
      
      if (failureRate > 50) {
        alerts.push({
          level: "CRITICAL",
          title: "Taxa de Falha Crítica",
          message: `${failedCount} de ${totalCount} registros falharam na última hora (${failureRate.toFixed(1)}%)`,
          service: "processing",
        });
      } else if (failureRate > 20) {
        alerts.push({
          level: "ERROR",
          title: "Alta Taxa de Falha",
          message: `${failedCount} de ${totalCount} registros falharam na última hora (${failureRate.toFixed(1)}%)`,
          service: "processing",
        });
      }
    }

    // Check 3: Webhook Errors (last hour)
    checksPerformed.push("webhook_errors");
    const { data: webhookErrors, count: webhookErrorCount } = await supabase
      .from("asaas_webhook_logs")
      .select("id, error_message", { count: "exact" })
      .gte("created_at", oneHourAgo)
      .not("error_message", "is", null);

    if (webhookErrorCount && webhookErrorCount > 5) {
      alerts.push({
        level: "ERROR",
        title: "Erros de Webhook ASAAS",
        message: `${webhookErrorCount} webhooks com erro na última hora`,
        service: "asaas",
      });
    }

    // Check 4: Pending Queue Backlog
    checksPerformed.push("queue_backlog");
    const { count: pendingCount } = await supabase
      .from("registros")
      .select("id", { count: "exact", head: true })
      .eq("status", "pendente");

    if (pendingCount && pendingCount > 50) {
      alerts.push({
        level: "WARN",
        title: "Fila de Processamento Acumulada",
        message: `${pendingCount} registros pendentes aguardando processamento`,
        service: "queue",
      });
    }

    // Check 5: Recent Processing Log Errors
    checksPerformed.push("processing_log_errors");
    const { count: logErrorCount } = await supabase
      .from("processing_logs")
      .select("id", { count: "exact", head: true })
      .eq("success", false)
      .gte("created_at", oneHourAgo);

    if (logErrorCount && logErrorCount > 10) {
      alerts.push({
        level: "WARN",
        title: "Muitas Tentativas de Processamento Falhando",
        message: `${logErrorCount} erros de processamento na última hora`,
        service: "processing",
      });
    }

    // Check 6: Credits System Health
    checksPerformed.push("credits_health");
    const { data: negativeCredits } = await supabase
      .from("credits")
      .select("user_id, available_credits")
      .lt("available_credits", 0);

    if (negativeCredits && negativeCredits.length > 0) {
      alerts.push({
        level: "CRITICAL",
        title: "Créditos Negativos Detectados",
        message: `${negativeCredits.length} usuários com créditos negativos - possível bug`,
        service: "credits",
      });
    }

    // Send alerts to the alert system
    for (const alert of alerts) {
      try {
        await supabase.from("audit_logs").insert({
          action_type: `alert_${alert.level.toLowerCase()}`,
          document_type: alert.service,
          metadata: {
            alert,
            triggered_by: "monitor-system",
            timestamp,
          },
        });
      } catch (e) {
        console.error("[MONITOR] Failed to log alert:", e);
      }
    }

    const result: MonitorResult = {
      timestamp,
      checks_performed: checksPerformed,
      alerts_triggered: alerts,
      system_healthy: alerts.filter(a => a.level === "CRITICAL" || a.level === "ERROR").length === 0,
    };

    console.log(`[MONITOR] Completed: ${checksPerformed.length} checks, ${alerts.length} alerts`);

    return new Response(
      JSON.stringify(result),
      { 
        status: result.system_healthy ? 200 : 503, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("[MONITOR] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

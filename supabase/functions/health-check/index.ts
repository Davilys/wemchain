import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthStatus {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  version: string;
  uptime_ms: number;
  services: {
    database: ServiceStatus;
    storage: ServiceStatus;
    queue: QueueStatus;
    asaas: ServiceStatus;
    opentimestamps: ServiceStatus;
  };
  metrics: SystemMetrics;
}

interface ServiceStatus {
  status: "ok" | "degraded" | "error";
  latency_ms?: number;
  message?: string;
  last_check?: string;
}

interface QueueStatus extends ServiceStatus {
  pending_jobs: number;
  failed_jobs: number;
  processing_jobs: number;
  avg_execution_time_ms?: number;
}

interface SystemMetrics {
  total_registros: number;
  registros_24h: number;
  failed_registros: number;
  pending_registros: number;
  processing_registros: number;
  active_subscriptions: number;
  credits_in_circulation: number;
  webhooks_24h: number;
  webhook_errors_24h: number;
}

const startTime = Date.now();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();
  const now = new Date();
  const timestamp = now.toISOString();

  try {
    // Simple health endpoints for external monitors
    if (path === "ping" || path === "live") {
      return new Response(
        JSON.stringify({ status: "ok", timestamp }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "ready") {
      // Check database connectivity
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from("profiles").select("id").limit(1);
      const dbLatency = Date.now() - dbStart;

      if (dbError) {
        return new Response(
          JSON.stringify({ status: "error", message: "Database not ready", timestamp }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ status: "ok", database_latency_ms: dbLatency, timestamp }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Full health check (default)
    const healthStatus = await performFullHealthCheck(supabase, now);

    const httpStatus = healthStatus.status === "ok" ? 200 : 
                       healthStatus.status === "degraded" ? 200 : 503;

    return new Response(
      JSON.stringify(healthStatus),
      { status: httpStatus, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[HEALTH-CHECK] Error:", error);
    
    return new Response(
      JSON.stringify({
        status: "error",
        timestamp,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// deno-lint-ignore no-explicit-any
async function performFullHealthCheck(supabase: any, now: Date): Promise<HealthStatus> {
  const timestamp = now.toISOString();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  // Check all services in parallel
  const [
    databaseStatus,
    storageStatus,
    queueStatus,
    metrics,
  ] = await Promise.all([
    checkDatabase(supabase),
    checkStorage(supabase),
    checkQueue(supabase, twentyFourHoursAgo),
    getSystemMetrics(supabase, twentyFourHoursAgo),
  ]);

  // Determine overall status
  const statuses = [databaseStatus.status, storageStatus.status, queueStatus.status];
  let overallStatus: "ok" | "degraded" | "error" = "ok";

  if (statuses.includes("error")) {
    overallStatus = "error";
  } else if (statuses.includes("degraded")) {
    overallStatus = "degraded";
  }

  // Check for queue health issues
  if (queueStatus.failed_jobs > 10) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp,
    version: "1.0.0",
    uptime_ms: Date.now() - startTime,
    services: {
      database: databaseStatus,
      storage: storageStatus,
      queue: queueStatus,
      asaas: { status: "ok", message: "Webhook-based - check logs" },
      opentimestamps: { status: "ok", message: "External service - check processing logs" },
    },
    metrics,
  };
}

// deno-lint-ignore no-explicit-any
async function checkDatabase(supabase: any): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const { error } = await supabase.from("profiles").select("id").limit(1);
    const latency = Date.now() - start;

    if (error) {
      return { status: "error", latency_ms: latency, message: error.message };
    }

    // Latency thresholds
    if (latency > 5000) {
      return { status: "degraded", latency_ms: latency, message: "High latency" };
    }

    return { status: "ok", latency_ms: latency };
  } catch (e) {
    return { 
      status: "error", 
      latency_ms: Date.now() - start, 
      message: e instanceof Error ? e.message : "Connection failed" 
    };
  }
}

// deno-lint-ignore no-explicit-any
async function checkStorage(supabase: any): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const { error } = await supabase.storage.from("registros").list("", { limit: 1 });
    const latency = Date.now() - start;

    if (error) {
      return { status: "error", latency_ms: latency, message: error.message };
    }

    return { status: "ok", latency_ms: latency };
  } catch (e) {
    return { 
      status: "error", 
      latency_ms: Date.now() - start, 
      message: e instanceof Error ? e.message : "Storage check failed" 
    };
  }
}

// deno-lint-ignore no-explicit-any
async function checkQueue(supabase: any, since: string): Promise<QueueStatus> {
  try {
    const [pendingResult, failedResult, processingResult, avgTimeResult] = await Promise.all([
      supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "falhou"),
      supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "processando"),
      supabase.from("processing_logs")
        .select("execution_time_ms")
        .eq("success", true)
        .gte("created_at", since)
        .not("execution_time_ms", "is", null),
    ]);

    const pending = pendingResult.count || 0;
    const failed = failedResult.count || 0;
    const processing = processingResult.count || 0;

    // Calculate average execution time
    let avgTime: number | undefined;
    if (avgTimeResult.data && avgTimeResult.data.length > 0) {
      const times = avgTimeResult.data.map((r: { execution_time_ms: number }) => r.execution_time_ms);
      avgTime = Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length);
    }

    // Determine queue status
    let status: "ok" | "degraded" | "error" = "ok";
    let message: string | undefined;

    if (processing > 50) {
      status = "degraded";
      message = "High processing load";
    }
    if (failed > 20) {
      status = "degraded";
      message = "Many failed jobs";
    }
    if (pending > 100) {
      status = "degraded";
      message = "Queue backlog growing";
    }

    return {
      status,
      pending_jobs: pending,
      failed_jobs: failed,
      processing_jobs: processing,
      avg_execution_time_ms: avgTime,
      message,
    };
  } catch (e) {
    return {
      status: "error",
      pending_jobs: 0,
      failed_jobs: 0,
      processing_jobs: 0,
      message: e instanceof Error ? e.message : "Queue check failed",
    };
  }
}

// deno-lint-ignore no-explicit-any
async function getSystemMetrics(supabase: any, since: string): Promise<SystemMetrics> {
  try {
    const [
      totalResult,
      recentResult,
      failedResult,
      pendingResult,
      processingResult,
      subsResult,
      creditsResult,
      webhooksResult,
      webhookErrorsResult,
    ] = await Promise.all([
      supabase.from("registros").select("id", { count: "exact", head: true }),
      supabase.from("registros").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "falhou"),
      supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "processando"),
      supabase.from("asaas_subscriptions").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
      supabase.from("credits").select("available_credits"),
      supabase.from("asaas_webhook_logs").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("asaas_webhook_logs").select("id", { count: "exact", head: true })
        .gte("created_at", since)
        .not("error_message", "is", null),
    ]);

    const totalCredits = creditsResult.data?.reduce(
      (acc: number, c: { available_credits: number }) => acc + (c.available_credits || 0), 
      0
    ) || 0;

    return {
      total_registros: totalResult.count || 0,
      registros_24h: recentResult.count || 0,
      failed_registros: failedResult.count || 0,
      pending_registros: pendingResult.count || 0,
      processing_registros: processingResult.count || 0,
      active_subscriptions: subsResult.count || 0,
      credits_in_circulation: totalCredits,
      webhooks_24h: webhooksResult.count || 0,
      webhook_errors_24h: webhookErrorsResult.count || 0,
    };
  } catch (e) {
    console.error("[HEALTH-CHECK] Metrics error:", e);
    return {
      total_registros: 0,
      registros_24h: 0,
      failed_registros: 0,
      pending_registros: 0,
      processing_registros: 0,
      active_subscriptions: 0,
      credits_in_circulation: 0,
      webhooks_24h: 0,
      webhook_errors_24h: 0,
    };
  }
}

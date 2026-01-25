import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  Loader2,
  RefreshCw,
  Server,
  TrendingDown,
  TrendingUp,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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

interface ProcessingLog {
  id: string;
  registro_id: string;
  attempt_number: number;
  started_at: string;
  completed_at: string | null;
  execution_time_ms: number | null;
  success: boolean;
  error_message: string | null;
  calendar_used: string | null;
}

interface RecentAlert {
  id: string;
  action_type: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

export default function AdminMonitoramento() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [processingLogs, setProcessingLogs] = useState<ProcessingLog[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (showToast = false) => {
    try {
      // Fetch health status from edge function
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/health-check`;
      
      const healthResponse = await fetch(healthUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData);
      }

      // Fetch processing logs
      const { data: logs } = await supabase
        .from("processing_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      setProcessingLogs(logs || []);

      // Fetch recent alerts from audit_logs
      const { data: alerts } = await supabase
        .from("audit_logs")
        .select("id, action_type, created_at, metadata")
        .like("action_type", "alert_%")
        .order("created_at", { ascending: false })
        .limit(20);

      setRecentAlerts((alerts || []) as unknown as RecentAlert[]);

      if (showToast) {
        toast.success("Dados atualizados");
      }
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
      if (showToast) {
        toast.error("Erro ao atualizar dados");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ok: "bg-green-500/10 text-green-500",
      degraded: "bg-yellow-500/10 text-yellow-500",
      error: "bg-red-500/10 text-red-500",
    };
    return <Badge className={colors[status] || "bg-gray-500/10"}>{status.toUpperCase()}</Badge>;
  };

  const getAlertLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      info: "bg-blue-500/10 text-blue-500",
      warn: "bg-yellow-500/10 text-yellow-500",
      error: "bg-red-500/10 text-red-500",
      critical: "bg-red-600/20 text-red-600 font-bold",
    };
    return <Badge className={colors[level.toLowerCase()] || "bg-gray-500/10"}>{level}</Badge>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monitoramento</h1>
            <p className="text-muted-foreground">
              Status em tempo real do sistema WebMarcas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-refresh</span>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "ON" : "OFF"}
              </Button>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        {health && (
          <Card className={
            health.status === "ok" ? "border-green-500/50" :
            health.status === "degraded" ? "border-yellow-500/50" :
            "border-red-500/50"
          }>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${
                    health.status === "ok" ? "bg-green-500/10" :
                    health.status === "degraded" ? "bg-yellow-500/10" :
                    "bg-red-500/10"
                  }`}>
                    {getStatusIcon(health.status)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Sistema {health.status === "ok" ? "Operacional" : 
                              health.status === "degraded" ? "Degradado" : "Com Problemas"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Última verificação: {format(new Date(health.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Versão {health.version}</p>
                  <p className="text-sm text-muted-foreground">
                    Uptime: {Math.floor(health.uptime_ms / 1000 / 60)} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Grid */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  {getStatusBadge(health.services.database.status)}
                </div>
                {health.services.database.latency_ms && (
                  <p className="text-xs text-muted-foreground">
                    Latência: {health.services.database.latency_ms}ms
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  {getStatusBadge(health.services.storage.status)}
                </div>
                {health.services.storage.latency_ms && (
                  <p className="text-xs text-muted-foreground">
                    Latência: {health.services.storage.latency_ms}ms
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Fila</span>
                  </div>
                  {getStatusBadge(health.services.queue.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pendentes: {health.services.queue.pending_jobs} | 
                  Falhos: {health.services.queue.failed_jobs}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">ASAAS</span>
                  </div>
                  {getStatusBadge(health.services.asaas.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {health.services.asaas.message}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Blockchain</span>
                  </div>
                  {getStatusBadge(health.services.opentimestamps.status)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {health.services.opentimestamps.message}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Metrics Cards */}
        {health && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Total Registros</span>
                </div>
                <p className="text-2xl font-bold">{health.metrics.total_registros}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Últimas 24h</span>
                </div>
                <p className="text-2xl font-bold">{health.metrics.registros_24h}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Pendentes</span>
                </div>
                <p className="text-2xl font-bold">{health.metrics.pending_registros}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Falhos</span>
                </div>
                <p className="text-2xl font-bold">{health.metrics.failed_registros}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-muted-foreground">Webhook Erros (24h)</span>
                </div>
                <p className="text-2xl font-bold">{health.metrics.webhook_errors_24h}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs for Logs and Alerts */}
        <Tabs defaultValue="processing">
          <TabsList>
            <TabsTrigger value="processing" className="gap-2">
              <Server className="h-4 w-4" />
              Logs de Processamento
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas Recentes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="processing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Processamentos</CardTitle>
                <CardDescription>
                  Log de execução dos registros em blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead>Tentativa</TableHead>
                      <TableHead>Duração</TableHead>
                      <TableHead>Calendário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processingLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {format(new Date(log.started_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.registro_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{log.attempt_number}</TableCell>
                        <TableCell>
                          {log.execution_time_ms ? `${log.execution_time_ms}ms` : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {log.calendar_used || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={log.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}>
                            {log.success ? "Sucesso" : "Falhou"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-destructive max-w-[200px] truncate">
                          {log.error_message || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
                <CardDescription>
                  Alertas críticos e avisos gerados automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentAlerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>Nenhum alerta recente</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Nível</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Serviço</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAlerts.map((alert) => {
                        const alertData = alert.metadata as Record<string, unknown> | null;
                        const alertInfo = alertData?.alert as Record<string, string> | undefined;
                        return (
                          <TableRow key={alert.id}>
                            <TableCell className="text-sm">
                              {format(new Date(alert.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {getAlertLevelBadge(alertInfo?.level || "info")}
                            </TableCell>
                            <TableCell className="font-medium">
                              {alertInfo?.title || "—"}
                            </TableCell>
                            <TableCell className="text-sm max-w-[300px] truncate">
                              {alertInfo?.message || "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {alertInfo?.service || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

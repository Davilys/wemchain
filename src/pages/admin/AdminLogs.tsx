import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, ScrollText, Download, Webhook } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: string;
  document_type: string | null;
  created_at: string;
  metadata: any;
}

interface WebhookLog {
  id: string;
  event_type: string;
  asaas_payment_id: string | null;
  processed: boolean;
  action_taken: string | null;
  credits_released: number | null;
  error_message: string | null;
  created_at: string;
}

export default function AdminLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const [auditResult, webhookResult] = await Promise.all([
        supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("asaas_webhook_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);

      setAuditLogs(auditResult.data || []);
      setWebhookLogs(webhookResult.data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV(data: any[], filename: string) {
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map(item => 
      Object.values(item).map(v => 
        typeof v === "object" ? JSON.stringify(v) : v
      ).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  }

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      terms_accepted: "bg-green-500/10 text-green-500",
      privacy_accepted: "bg-green-500/10 text-green-500",
      blockchain_policy_accepted: "bg-green-500/10 text-green-500",
      login: "bg-blue-500/10 text-blue-500",
      logout: "bg-gray-500/10 text-gray-500",
      registro_created: "bg-purple-500/10 text-purple-500",
      certificado_downloaded: "bg-cyan-500/10 text-cyan-500",
      data_export_requested: "bg-yellow-500/10 text-yellow-500",
      data_deletion_requested: "bg-red-500/10 text-red-500",
    };
    return <Badge className={colors[action] || "bg-gray-500/10 text-gray-500"}>{action}</Badge>;
  };

  const getEventBadge = (event: string) => {
    const colors: Record<string, string> = {
      PAYMENT_CONFIRMED: "bg-green-500/10 text-green-500",
      PAYMENT_RECEIVED: "bg-green-500/10 text-green-500",
      PAYMENT_CREATED: "bg-blue-500/10 text-blue-500",
      PAYMENT_FAILED: "bg-red-500/10 text-red-500",
      SUBSCRIPTION_CREATED: "bg-purple-500/10 text-purple-500",
      SUBSCRIPTION_CANCELED: "bg-orange-500/10 text-orange-500",
    };
    return <Badge className={colors[event] || "bg-gray-500/10 text-gray-500"}>{event}</Badge>;
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.includes(searchTerm);
    
    const matchesAction = actionFilter === "all" || log.action_type === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Logs e Auditoria</h1>
          <p className="text-muted-foreground">
            Visualize logs de auditoria e webhooks do sistema
          </p>
        </div>

        <Tabs defaultValue="audit">
          <TabsList>
            <TabsTrigger value="audit" className="gap-2">
              <ScrollText className="h-4 w-4" />
              Logs de Auditoria
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks ASAAS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audit" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as ações</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
                        <SelectItem value="registro_created">Registro Criado</SelectItem>
                        <SelectItem value="terms_accepted">Termos Aceitos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => exportToCSV(filteredAuditLogs, "audit_logs")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>User ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{getActionBadge(log.action_type)}</TableCell>
                          <TableCell className="text-sm">
                            {log.document_type || "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {log.user_id?.slice(0, 8)}...
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Webhooks ASAAS</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => exportToCSV(webhookLogs, "webhook_logs")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Evento</TableHead>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Processado</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Créditos</TableHead>
                        <TableHead>Erro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                          </TableCell>
                          <TableCell>{getEventBadge(log.event_type)}</TableCell>
                          <TableCell className="text-xs font-mono">
                            {log.asaas_payment_id?.slice(0, 12) || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.processed ? "default" : "secondary"}>
                              {log.processed ? "Sim" : "Não"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">
                            {log.action_taken || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {log.credits_released || "—"}
                          </TableCell>
                          <TableCell className="text-sm text-destructive max-w-[150px] truncate">
                            {log.error_message || "—"}
                          </TableCell>
                        </TableRow>
                      ))}
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

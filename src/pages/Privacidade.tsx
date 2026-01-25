import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  Download,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BlockchainImmutabilityNotice, LGPDNotice } from "@/components/legal/LegalNotice";

interface DataRequest {
  id: string;
  request_type: string;
  status: string;
  created_at: string;
  processed_at: string | null;
}

export default function Privacidade() {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("data_requests")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    if (data) {
      setRequests(data);
    }
    setLoading(false);
  };

  const handleExportRequest = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("data_requests").insert({
        user_id: user?.id,
        request_type: "export",
      });

      if (error) throw error;

      await logAction({
        actionType: "data_export_requested",
        metadata: { request_time: new Date().toISOString() },
      });

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de exportação foi registrada. Você receberá seus dados por e-mail em até 15 dias úteis.",
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletionRequest = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("data_requests").insert({
        user_id: user?.id,
        request_type: "deletion",
      });

      if (error) throw error;

      await logAction({
        actionType: "data_deletion_requested",
        metadata: { request_time: new Date().toISOString() },
      });

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de exclusão foi registrada. Entraremos em contato para confirmar.",
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-400 border-yellow-400/30"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
      case "processing":
        return <Badge variant="outline" className="text-blue-400 border-blue-400/30"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Em processamento</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-400 border-green-400/30"><CheckCircle className="h-3 w-3 mr-1" /> Concluído</Badge>;
      case "rejected":
        return <Badge variant="outline" className="text-red-400 border-red-400/30"><AlertTriangle className="h-3 w-3 mr-1" /> Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const hasPendingExport = requests.some((r) => r.request_type === "export" && r.status === "pending");
  const hasPendingDeletion = requests.some((r) => r.request_type === "deletion" && r.status === "pending");

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">Privacidade e Dados</h1>
            <p className="text-muted-foreground font-body">
              Gerencie seus dados pessoais conforme a LGPD (Lei nº 13.709/2018)
            </p>
          </div>

          <div className="space-y-6">
            <LGPDNotice />

            {/* Seus Direitos */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Seus Direitos (LGPD)
                </CardTitle>
                <CardDescription className="font-body">
                  Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Exportar Dados */}
                  <Card className="border-border bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Download className="h-5 w-5 text-blue-400" />
                        Exportar Dados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Solicite uma cópia de todos os seus dados pessoais armazenados em nossa plataforma.
                      </p>
                      <Button
                        onClick={handleExportRequest}
                        disabled={submitting || hasPendingExport}
                        variant="outline"
                        className="w-full"
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {hasPendingExport ? "Solicitação pendente" : "Solicitar exportação"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Excluir Dados */}
                  <Card className="border-border bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-400" />
                        Excluir Dados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Solicite a exclusão dos seus dados pessoais. Registros em blockchain são imutáveis.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full"
                            disabled={submitting || hasPendingDeletion}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {hasPendingDeletion ? "Solicitação pendente" : "Solicitar exclusão"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-display">Confirmar Exclusão de Dados</AlertDialogTitle>
                            <AlertDialogDescription className="font-body space-y-2">
                              <p>
                                Ao solicitar a exclusão dos seus dados pessoais, serão removidos:
                              </p>
                              <ul className="list-disc list-inside text-sm">
                                <li>Seus dados de cadastro (nome, e-mail, telefone)</li>
                                <li>Arquivos armazenados em nossa plataforma</li>
                                <li>Histórico de pagamentos</li>
                              </ul>
                              <p className="font-semibold text-amber-400">
                                ⚠️ Importante: Registros em blockchain são imutáveis e NÃO podem ser excluídos.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeletionRequest}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirmar Exclusão
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <BlockchainImmutabilityNotice />

            {/* Histórico de Solicitações */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Histórico de Solicitações
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : requests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Você ainda não fez nenhuma solicitação.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                      >
                        <div>
                          <p className="font-medium">
                            {request.request_type === "export" ? "Exportação de dados" : "Exclusão de dados"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Solicitado em {new Date(request.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Contato */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-display">Canal de Contato LGPD</CardTitle>
              </CardHeader>
              <CardContent className="font-body">
                <p className="text-muted-foreground mb-4">
                  Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de seus dados:
                </p>
                <div className="space-y-2">
                  <p><strong>E-mail:</strong> ola@webmarcas.net</p>
                  <p><strong>WhatsApp:</strong> (11) 91112-0225</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Responderemos em até 15 dias úteis conforme previsto na LGPD.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

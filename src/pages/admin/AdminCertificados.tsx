import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, Download, RefreshCw, Eye, Loader2, FileText, Award, ChevronDown, ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { downloadCertificate } from "@/services/certificateService";

interface Certificate {
  id: string;
  registro_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  issued_at: string;
  last_downloaded_at: string | null;
  reissued_count: number;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
  registro?: {
    nome_ativo: string;
    hash_sha256: string | null;
    status: string;
  };
}

interface UserGroup {
  userId: string;
  userName: string;
  certificates: Certificate[];
}

export default function AdminCertificados() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [reissuingId, setReissuingId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCertificates();
  }, []);

  // Groups start closed by default

  async function fetchCertificates() {
    try {
      const { data: certsData, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const userIds = [...new Set(certsData?.map(c => c.user_id) || [])];
      const registroIds = certsData?.map(c => c.registro_id) || [];

      const [profilesResult, registrosResult] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
        supabase.from("registros").select("id, nome_ativo, hash_sha256, status").in("id", registroIds),
      ]);

      const profilesMap = new Map(profilesResult.data?.map(p => [p.user_id, p]));
      const registrosMap = new Map(registrosResult.data?.map(r => [r.id, r]));

      const certsWithData = certsData?.map(c => ({
        ...c,
        profile: profilesMap.get(c.user_id),
        registro: registrosMap.get(c.registro_id),
      })) || [];

      setCertificates(certsWithData);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Erro ao carregar certificados");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(cert: Certificate) {
    setDownloadingId(cert.id);
    try {
      await downloadCertificate(cert.registro_id);
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action_type: "admin_certificate_downloaded",
        metadata: { certificate_id: cert.id, registro_id: cert.registro_id, admin_action: true },
      });
      toast.success("Certificado baixado com sucesso");
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(error.message || "Erro ao baixar certificado");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleReissue(cert: Certificate) {
    setReissuingId(cert.id);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-certificate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({ registroId: cert.registro_id, forceRegenerate: true }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao reemitir certificado");
      }
      await supabase.from("certificates").update({ reissued_count: cert.reissued_count + 1, updated_at: new Date().toISOString() }).eq("id", cert.id);
      await supabase.from("audit_logs").insert({
        user_id: user?.id,
        action_type: "admin_certificate_reissued",
        metadata: { certificate_id: cert.id, registro_id: cert.registro_id, previous_reissue_count: cert.reissued_count, admin_action: true },
      });
      toast.success("Certificado reemitido com sucesso");
      fetchCertificates();
    } catch (error: any) {
      console.error("Reissue error:", error);
      toast.error(error.message || "Erro ao reemitir certificado");
    } finally {
      setReissuingId(null);
    }
  }

  function toggleGroup(userId: string) {
    setOpenGroups(prev => {
      if (prev.has(userId)) return new Set();
      return new Set([userId]);
    });
  }

  const filteredCertificates = certificates.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.profile?.full_name?.toLowerCase().includes(search) ||
      c.registro?.nome_ativo?.toLowerCase().includes(search) ||
      c.file_name.toLowerCase().includes(search) ||
      c.registro?.hash_sha256?.includes(search)
    );
  });

  function getGroupedCertificates(): UserGroup[] {
    const groupMap = new Map<string, UserGroup>();
    filteredCertificates.forEach(c => {
      if (!groupMap.has(c.user_id)) {
        groupMap.set(c.user_id, {
          userId: c.user_id,
          userName: c.profile?.full_name || "Usuário sem nome",
          certificates: [],
        });
      }
      groupMap.get(c.user_id)!.certificates.push(c);
    });
    return Array.from(groupMap.values()).sort((a, b) => {
      const aNewest = a.certificates[0]?.created_at || "";
      const bNewest = b.certificates[0]?.created_at || "";
      return bNewest.localeCompare(aNewest);
    });
  }

  const totalCerts = certificates.length;
  const reissuedCerts = certificates.filter(c => c.reissued_count > 0).length;
  const userGroups = getGroupedCertificates();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">Certificados</h1>
          <p className="text-muted-foreground font-body">
            Visualize e gerencie todos os certificados emitidos — organizados por usuário
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Total Emitidos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalCerts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Reemitidos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{reissuedCerts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Este Mês</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {certificates.filter(c => {
                  const certDate = new Date(c.created_at);
                  const now = new Date();
                  return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, ativo, arquivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Badge variant="outline">
                {filteredCertificates.length} certificados · {userGroups.length} usuários
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userGroups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Nenhum certificado encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userGroups.map((group) => (
                  <Collapsible
                    key={group.userId}
                    open={openGroups.has(group.userId)}
                    onOpenChange={() => toggleGroup(group.userId)}
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left">
                        {openGroups.has(group.userId) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <User className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-sm flex-1 truncate">{group.userName}</span>
                        <Badge variant="secondary" className="shrink-0">
                          {group.certificates.length} {group.certificates.length === 1 ? "certificado" : "certificados"}
                        </Badge>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="overflow-x-auto mt-1 border rounded-lg">
                        <Table className="min-w-[650px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ativo</TableHead>
                              <TableHead>Arquivo</TableHead>
                              <TableHead>Emitido</TableHead>
                              <TableHead className="text-center">Reemissões</TableHead>
                              <TableHead>Último Download</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.certificates.map((cert) => (
                              <TableRow key={cert.id}>
                                <TableCell className="font-medium max-w-[200px] truncate">
                                  {cert.registro?.nome_ativo || "—"}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">
                                  {cert.file_name}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {format(new Date(cert.issued_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={cert.reissued_count > 0 ? "secondary" : "outline"}>
                                    {cert.reissued_count}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {cert.last_downloaded_at
                                    ? format(new Date(cert.last_downloaded_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                    : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedCert(cert); setDetailDialogOpen(true); }}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDownload(cert)} disabled={downloadingId === cert.id}>
                                      {downloadingId === cert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleReissue(cert)} disabled={reissuingId === cert.id}>
                                      {reissuingId === cert.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Detalhes do Certificado
              </DialogTitle>
            </DialogHeader>
            
            {selectedCert && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuário</p>
                    <p className="font-medium">{selectedCert.profile?.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ativo Registrado</p>
                    <p className="font-medium">{selectedCert.registro?.nome_ativo || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arquivo</p>
                    <p className="font-medium text-sm">{selectedCert.file_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status do Registro</p>
                    <Badge variant={selectedCert.registro?.status === "confirmado" ? "default" : "secondary"}>
                      {selectedCert.registro?.status || "—"}
                    </Badge>
                  </div>
                </div>

                {selectedCert.registro?.hash_sha256 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Hash SHA-256</p>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-xs break-all">{selectedCert.registro.hash_sha256}</code>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Emitido em</p>
                    <p className="font-medium">{format(new Date(selectedCert.issued_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Reemissões</p>
                    <p className="font-medium">{selectedCert.reissued_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Último Download</p>
                    <p className="font-medium">
                      {selectedCert.last_downloaded_at
                        ? format(new Date(selectedCert.last_downloaded_at), "dd/MM/yyyy", { locale: ptBR })
                        : "Nunca"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Fechar</Button>
              {selectedCert && (
                <Button onClick={() => handleDownload(selectedCert)} disabled={downloadingId === selectedCert.id}>
                  {downloadingId === selectedCert.id ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Baixar Certificado
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

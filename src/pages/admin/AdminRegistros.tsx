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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, RefreshCw, ExternalLink, Loader2, FileText, Copy, ChevronDown, ChevronRight, User } from "lucide-react";
import { format } from "date-fns";
import { getBlockchainVerificationUrl } from "@/lib/blockchainUtils";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface Registro {
  id: string;
  user_id: string;
  nome_ativo: string;
  tipo_ativo: string;
  status: string;
  hash_sha256: string | null;
  arquivo_nome: string;
  created_at: string;
  error_message: string | null;
  profile?: {
    full_name: string | null;
  };
  transacao?: {
    tx_hash: string;
    network: string;
    confirmed_at: string | null;
  };
}

interface UserGroup {
  userId: string;
  userName: string;
  registros: Registro[];
}

export default function AdminRegistros() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reprocessing, setReprocessing] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRegistros();
  }, []);

  // Open all groups by default when data loads
  useEffect(() => {
    const groups = getGroupedRegistros();
    setOpenGroups(new Set(groups.map(g => g.userId)));
  }, [registros]);

  async function fetchRegistros() {
    try {
      const { data: registrosData, error } = await supabase
        .from("registros")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      const userIds = [...new Set(registrosData?.map(r => r.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const registroIds = registrosData?.map(r => r.id) || [];
      const { data: transacoesData } = await supabase
        .from("transacoes_blockchain")
        .select("registro_id, tx_hash, network, confirmed_at")
        .in("registro_id", registroIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));
      const transacoesMap = new Map(transacoesData?.map(t => [t.registro_id, t]));

      const registrosWithData = registrosData?.map(r => ({
        ...r,
        profile: profilesMap.get(r.user_id),
        transacao: transacoesMap.get(r.id),
      })) || [];

      setRegistros(registrosWithData);
    } catch (error) {
      console.error("Error fetching registros:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleReprocess(registro: Registro) {
    setReprocessing(registro.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-registro`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
          body: JSON.stringify({ registroId: registro.id }),
        }
      );
      if (!response.ok) throw new Error("Erro ao reprocessar");
      toast({ title: "Reprocessamento iniciado", description: "O registro está sendo reprocessado." });
      setTimeout(fetchRegistros, 3000);
    } catch (error: any) {
      toast({ title: "Erro", description: error.message || "Erro ao reprocessar registro", variant: "destructive" });
    } finally {
      setReprocessing(null);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Hash copiado para a área de transferência" });
  }

  function toggleGroup(userId: string) {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  const filteredRegistros = registros.filter((r) => {
    const matchesSearch =
      r.nome_ativo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hash_sha256?.includes(searchTerm) ||
      r.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function getGroupedRegistros(): UserGroup[] {
    const groupMap = new Map<string, UserGroup>();
    filteredRegistros.forEach(r => {
      if (!groupMap.has(r.user_id)) {
        groupMap.set(r.user_id, {
          userId: r.user_id,
          userName: r.profile?.full_name || "Usuário sem nome",
          registros: [],
        });
      }
      groupMap.get(r.user_id)!.registros.push(r);
    });
    return Array.from(groupMap.values()).sort((a, b) => {
      const aNewest = a.registros[0]?.created_at || "";
      const bNewest = b.registros[0]?.created_at || "";
      return bNewest.localeCompare(aNewest);
    });
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      confirmado: { variant: "default", label: "Confirmado" },
      pendente: { variant: "secondary", label: "Pendente" },
      processando: { variant: "outline", label: "Processando" },
      falhou: { variant: "destructive", label: "Falhou" },
    };
    const { variant, label } = config[status] || { variant: "secondary", label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTipoAtivoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      marca: "bg-blue-500/10 text-blue-500",
      logotipo: "bg-purple-500/10 text-purple-500",
      obra_autoral: "bg-green-500/10 text-green-500",
      documento: "bg-orange-500/10 text-orange-500",
      outro: "bg-gray-500/10 text-gray-500",
    };
    return <Badge className={colors[tipo] || colors.outro}>{tipo}</Badge>;
  };

  const userGroups = getGroupedRegistros();

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Registros Blockchain</h1>
          <p className="text-muted-foreground font-body text-sm md:text-base">
            Visualize e gerencie todos os registros do sistema — organizados por usuário
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, hash, usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="falhou">Falhou</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="whitespace-nowrap">
                  {filteredRegistros.length} registros · {userGroups.length} usuários
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : userGroups.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                <p>Nenhum registro encontrado</p>
              </div>
            ) : (
              <div className="space-y-3 px-4 sm:px-0 pb-4 sm:pb-0">
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
                          {group.registros.length} {group.registros.length === 1 ? "registro" : "registros"}
                        </Badge>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="overflow-x-auto mt-1 border rounded-lg">
                        <Table className="min-w-[650px]">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ativo</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Hash</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.registros.map((registro) => (
                              <TableRow key={registro.id}>
                                <TableCell className="font-medium max-w-[200px] truncate">
                                  {registro.nome_ativo}
                                </TableCell>
                                <TableCell>{getTipoAtivoBadge(registro.tipo_ativo)}</TableCell>
                                <TableCell>{getStatusBadge(registro.status)}</TableCell>
                                <TableCell>
                                  {registro.hash_sha256 ? (
                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                      {registro.hash_sha256.slice(0, 12)}...
                                    </code>
                                  ) : "—"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {format(new Date(registro.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedRegistro(registro); setDialogOpen(true); }}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {registro.status === "falhou" && (
                                      <Button variant="outline" size="sm" onClick={() => handleReprocess(registro)} disabled={reprocessing === registro.id}>
                                        {reprocessing === registro.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                      </Button>
                                    )}
                                    {registro.transacao?.tx_hash && (
                                      <Button variant="ghost" size="sm" asChild>
                                        <a
                                          href={getBlockchainVerificationUrl(registro.transacao, registro.hash_sha256) || "#"}
                                          target={registro.transacao.network === "polygon" ? "_blank" : "_self"}
                                          rel={registro.transacao.network === "polygon" ? "noopener noreferrer" : undefined}
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    )}
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

        {/* Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes do Registro
              </DialogTitle>
            </DialogHeader>
            
            {selectedRegistro && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome do Ativo</p>
                    <p className="font-medium">{selectedRegistro.nome_ativo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    {getTipoAtivoBadge(selectedRegistro.tipo_ativo)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usuário</p>
                    <p className="font-medium">{selectedRegistro.profile?.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arquivo</p>
                    <p className="font-medium">{selectedRegistro.arquivo_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(selectedRegistro.status)}
                  </div>
                </div>

                {selectedRegistro.hash_sha256 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Hash SHA-256</p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-xs flex-1 break-all">{selectedRegistro.hash_sha256}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedRegistro.hash_sha256!)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRegistro.transacao && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transação Blockchain</p>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-xs flex-1 break-all">{selectedRegistro.transacao.tx_hash}</code>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`https://polygonscan.com/tx/${selectedRegistro.transacao.tx_hash}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                {selectedRegistro.error_message && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Erro</p>
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{selectedRegistro.error_message}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

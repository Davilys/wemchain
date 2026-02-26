import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminActionLog } from "@/hooks/useAdminActionLog";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { 
  Search, Eye, Coins, FileCheck, Loader2, MoreVertical, UserPlus, Edit, Ban, 
  CheckCircle, Crown, CrownIcon, Plus, Minus, Users, Merge, AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  cpf_cnpj: string | null;
  cpf: string | null;
  cnpj: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  is_blocked: boolean;
  blocked_at: string | null;
  blocked_reason: string | null;
}

interface UserCredits {
  available_credits: number;
  used_credits: number;
  total_credits: number;
  plan_type: string;
}

interface UserRegistro {
  id: string;
  nome_ativo: string;
  status: string;
  created_at: string;
}

interface UserSubscription {
  id: string;
  plan_type: string;
  status: string;
  credits_per_cycle: number;
}

interface DuplicateGroup {
  cpf: string;
  profiles: UserProfile[];
}

export default function AdminUsuarios() {
  const { user: adminUser } = useAuth();
  const { logAction } = useAdminActionLog();
  const { can } = useAdminPermissions();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [userRegistros, setUserRegistros] = useState<UserRegistro[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", cpf_cnpj: "", phone: "", company_name: "" });
  const [saving, setSaving] = useState(false);

  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createData, setCreateData] = useState({ email: "", password: "", full_name: "", initial_credits: 0 });
  const [creating, setCreating] = useState(false);

  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [subscriptionAction, setSubscriptionAction] = useState<"grant" | "revoke" | "update">("grant");
  const [subscriptionData, setSubscriptionData] = useState({ credits_per_cycle: 5 });

  const [grantCreditsDialogOpen, setGrantCreditsDialogOpen] = useState(false);
  const [grantCreditsAmount, setGrantCreditsAmount] = useState(1);
  const [grantCreditsReason, setGrantCreditsReason] = useState("");
  const [grantingCredits, setGrantingCredits] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);

  // Merge dialog
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeGroup, setMergeGroup] = useState<DuplicateGroup | null>(null);
  const [mergePrimaryId, setMergePrimaryId] = useState<string>("");
  const [merging, setMerging] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, cpf_cnpj, cpf, cnpj, phone, company_name, created_at, is_blocked, blocked_at, blocked_reason")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data || []) as unknown as UserProfile[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  // Detect duplicates by CPF
  const duplicateGroups: DuplicateGroup[] = (() => {
    const cpfMap = new Map<string, UserProfile[]>();
    users.forEach(u => {
      const cpf = u.cpf || (u.cpf_cnpj ? u.cpf_cnpj.replace(/\D/g, "") : null);
      if (cpf && cpf.length === 11 && !u.is_blocked) {
        const existing = cpfMap.get(cpf) || [];
        existing.push(u);
        cpfMap.set(cpf, existing);
      }
    });
    const groups: DuplicateGroup[] = [];
    cpfMap.forEach((profiles, cpf) => {
      if (profiles.length > 1) groups.push({ cpf, profiles });
    });
    return groups;
  })();

  const duplicateUserIds = new Set(duplicateGroups.flatMap(g => g.profiles.map(p => p.user_id)));

  function getDuplicateGroupForUser(userId: string): DuplicateGroup | undefined {
    return duplicateGroups.find(g => g.profiles.some(p => p.user_id === userId));
  }

  async function viewUserDetails(user: UserProfile) {
    setSelectedUser(user);
    setDialogOpen(true);
    setDetailsLoading(true);
    try {
      const [creditsResult, registrosResult, subscriptionResult] = await Promise.all([
        supabase.from("credits").select("*").eq("user_id", user.user_id).maybeSingle(),
        supabase.from("registros").select("id, nome_ativo, status, created_at")
          .eq("user_id", user.user_id).order("created_at", { ascending: false }).limit(10),
        supabase.from("asaas_subscriptions").select("id, plan_type, status, credits_per_cycle")
          .eq("user_id", user.user_id).eq("status", "ACTIVE").maybeSingle(),
      ]);
      setUserCredits(creditsResult.data);
      setUserRegistros(registrosResult.data || []);
      setUserSubscription(subscriptionResult.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function openEditDialog(user: UserProfile) {
    setSelectedUser(user);
    setEditData({
      full_name: user.full_name || "",
      cpf_cnpj: user.cpf_cnpj || "",
      phone: user.phone || "",
      company_name: user.company_name || "",
    });
    setEditDialogOpen(true);
  }

  async function handleSaveEdit() {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editData.full_name || null,
          cpf_cnpj: editData.cpf_cnpj || null,
          phone: editData.phone || null,
          company_name: editData.company_name || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedUser.id);
      if (error) throw error;
      await logAction({
        actionType: "user_edited",
        targetType: "user",
        targetId: selectedUser.user_id,
        details: { changes: editData, previous_name: selectedUser.full_name },
      });
      toast.success("Cliente atualizado com sucesso");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar cliente");
    } finally {
      setSaving(false);
    }
  }

  async function openBlockDialog(user: UserProfile) {
    setSelectedUser(user);
    setBlockReason("");
    setBlockDialogOpen(true);
  }

  async function handleBlockUser() {
    if (!selectedUser || !blockReason.trim()) { toast.error("Motivo é obrigatório"); return; }
    setBlocking(true);
    try {
      const isBlocking = !selectedUser.is_blocked;
      const { error } = await supabase
        .from("profiles")
        .update({
          is_blocked: isBlocking,
          blocked_at: isBlocking ? new Date().toISOString() : null,
          blocked_reason: isBlocking ? blockReason : null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", selectedUser.id);
      if (error) throw error;
      await logAction({
        actionType: isBlocking ? "user_blocked" : "user_unblocked",
        targetType: "user",
        targetId: selectedUser.user_id,
        details: { reason: blockReason, user_name: selectedUser.full_name },
      });
      toast.success(isBlocking ? "Cliente bloqueado" : "Cliente desbloqueado");
      setBlockDialogOpen(false);
      setBlockReason("");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao bloquear/desbloquear");
    } finally {
      setBlocking(false);
    }
  }

  async function handleCreateUser() {
    if (!createData.email || !createData.password || !createData.full_name) {
      toast.error("Preencha todos os campos obrigatórios"); return;
    }
    if (createData.password.length < 6) { toast.error("Senha deve ter pelo menos 6 caracteres"); return; }
    setCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Sessão não encontrada");
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            email: createData.email, password: createData.password,
            full_name: createData.full_name, initial_credits: createData.initial_credits || 0,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao criar cliente");
      await logAction({
        actionType: "user_created", targetType: "user", targetId: result.user?.id,
        details: { email: createData.email, full_name: createData.full_name, initial_credits: createData.initial_credits },
      });
      toast.success(`Cliente ${createData.full_name} criado com sucesso!`);
      setCreateDialogOpen(false);
      setCreateData({ email: "", password: "", full_name: "", initial_credits: 0 });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar cliente");
    } finally {
      setCreating(false);
    }
  }

  async function openSubscriptionDialog(user: UserProfile, action: "grant" | "revoke" | "update") {
    setSelectedUser(user);
    setSubscriptionAction(action);
    setSubscriptionData({ credits_per_cycle: 5 });
    if (action === "update") {
      const { data } = await supabase.from("asaas_subscriptions").select("credits_per_cycle")
        .eq("user_id", user.user_id).eq("status", "ACTIVE").maybeSingle();
      if (data) setSubscriptionData({ credits_per_cycle: data.credits_per_cycle });
    }
    setSubscriptionDialogOpen(true);
  }

  async function handleManageSubscription() {
    if (!selectedUser) return;
    setManagingSubscription(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Sessão não encontrada");
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-manage-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            action: subscriptionAction, user_id: selectedUser.user_id,
            plan_type: "BUSINESS", credits_per_cycle: subscriptionData.credits_per_cycle,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erro ao gerenciar assinatura");
      const messages = { grant: "Plano Business concedido!", revoke: "Plano Business revogado!", update: "Plano Business atualizado!" };
      toast.success(messages[subscriptionAction]);
      setSubscriptionDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerenciar assinatura");
    } finally {
      setManagingSubscription(false);
    }
  }

  function openGrantCreditsDialog(user: UserProfile) {
    setSelectedUser(user);
    setGrantCreditsAmount(1);
    setGrantCreditsReason("");
    setGrantCreditsDialogOpen(true);
  }

  async function handleGrantCredits() {
    if (!selectedUser || !adminUser) return;
    if (grantCreditsAmount < 1 || grantCreditsAmount > 100) { toast.error("Quantidade deve ser entre 1 e 100"); return; }
    if (!grantCreditsReason.trim() || grantCreditsReason.trim().length < 10) { toast.error("Motivo é obrigatório (mín 10 caracteres)"); return; }
    setGrantingCredits(true);
    try {
      const { data, error } = await supabase.rpc("add_credits_admin", {
        p_user_id: selectedUser.user_id, p_amount: grantCreditsAmount,
        p_reason: grantCreditsReason.trim(), p_admin_id: adminUser.id,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; new_balance?: number };
      if (!result.success) throw new Error(result.error || "Erro ao conceder créditos");
      await logAction({
        actionType: "credits_added", targetType: "user", targetId: selectedUser.user_id,
        details: { amount: grantCreditsAmount, reason: grantCreditsReason, new_balance: result.new_balance, user_name: selectedUser.full_name },
      });
      toast.success(`${grantCreditsAmount} crédito(s) concedido(s)`);
      setGrantCreditsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao conceder créditos");
    } finally {
      setGrantingCredits(false);
    }
  }

  function openMergeDialog(group: DuplicateGroup) {
    setMergeGroup(group);
    // Default to oldest profile as primary
    const sorted = [...group.profiles].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    setMergePrimaryId(sorted[0].user_id);
    setMergeDialogOpen(true);
  }

  async function handleMerge() {
    if (!mergeGroup || !mergePrimaryId) return;
    setMerging(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) throw new Error("Sessão não encontrada");

      const secondaryProfiles = mergeGroup.profiles.filter(p => p.user_id !== mergePrimaryId);

      for (const secondary of secondaryProfiles) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-merge-clients`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
            body: JSON.stringify({
              primary_user_id: mergePrimaryId,
              secondary_user_id: secondary.user_id,
            }),
          }
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Erro ao unificar contas");
      }

      toast.success("Contas unificadas com sucesso!");
      setMergeDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao unificar contas");
    } finally {
      setMerging(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.cpf_cnpj?.includes(search) ||
      user.cpf?.includes(search) ||
      user.phone?.includes(search) ||
      user.company_name?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmado: "default", pendente: "secondary", processando: "outline", falhou: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display">Gestão de Clientes</h1>
            <p className="text-muted-foreground font-body text-sm md:text-base">
              Visualize e gerencie clientes do sistema
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Duplicate Alert */}
        {duplicateGroups.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-warning">
                    {duplicateGroups.length} grupo(s) de clientes duplicados detectados
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clientes com o mesmo CPF foram identificados. Unifique as contas para evitar inconsistências.
                  </p>
                  <div className="mt-3 space-y-2">
                    {duplicateGroups.map((group) => (
                      <div key={group.cpf} className="flex items-center justify-between p-3 rounded-lg bg-background border">
                        <div>
                          <p className="text-sm font-medium">
                            CPF: {group.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {group.profiles.map(p => p.full_name || p.email || "Sem nome").join(" • ")}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => openMergeDialog(group)}>
                          <Merge className="h-4 w-4 mr-1" />
                          Unificar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total de Clientes</span>
              </div>
              <p className="text-2xl font-bold mt-1">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Ativos</span>
              </div>
              <p className="text-2xl font-bold mt-1">{users.filter(u => !u.is_blocked).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Este Mês</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {users.filter(u => {
                  const d = new Date(u.created_at);
                  const now = new Date();
                  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email, CPF, telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Badge variant="outline">{filteredUsers.length} clientes</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.full_name || "—"}
                            {duplicateUserIds.has(user.user_id) && (
                              <Badge variant="outline" className="text-warning border-warning/40 text-[10px] px-1.5">
                                Duplicado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.email || "—"}</TableCell>
                        <TableCell>{user.cpf || user.cpf_cnpj || "—"}</TableCell>
                        <TableCell>{user.phone || "—"}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_blocked ? "destructive" : "default"}>
                            {user.is_blocked ? "Bloqueado" : "Ativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-popover border">
                              <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                                <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="h-4 w-4 mr-2" /> Editar Dados
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openGrantCreditsDialog(user)}>
                                <Coins className="h-4 w-4 mr-2 text-yellow-500" /> Conceder Créditos
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openSubscriptionDialog(user, "grant")}>
                                <Crown className="h-4 w-4 mr-2" /> Conceder Plano Business
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSubscriptionDialog(user, "update")}>
                                <Edit className="h-4 w-4 mr-2" /> Editar Plano Business
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSubscriptionDialog(user, "revoke")}>
                                <CrownIcon className="h-4 w-4 mr-2 text-destructive" /> Revogar Plano Business
                              </DropdownMenuItem>
                              {getDuplicateGroupForUser(user.user_id) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => openMergeDialog(getDuplicateGroupForUser(user.user_id)!)}>
                                    <Merge className="h-4 w-4 mr-2 text-warning" /> Unificar Conta
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openBlockDialog(user)}>
                                {user.is_blocked ? (
                                  <><CheckCircle className="h-4 w-4 mr-2" /> Desbloquear</>
                                ) : (
                                  <><Ban className="h-4 w-4 mr-2" /> Bloquear</>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Detalhes do Cliente</DialogTitle></DialogHeader>
            {detailsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{selectedUser.full_name || "—"}</p></div>
                  <div><p className="text-sm text-muted-foreground">CPF</p><p className="font-medium">{selectedUser.cpf || selectedUser.cpf_cnpj || "—"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{selectedUser.phone || "—"}</p></div>
                  <div><p className="text-sm text-muted-foreground">Empresa</p><p className="font-medium">{selectedUser.company_name || "—"}</p></div>
                </div>
                <div className="flex gap-4">
                  <Card className="flex-1">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2"><Coins className="h-5 w-5 text-yellow-500" /><span className="text-sm text-muted-foreground">Créditos</span></div>
                      <p className="text-2xl font-bold mt-1">{userCredits?.available_credits || 0}</p>
                      <p className="text-xs text-muted-foreground">Plano: {userCredits?.plan_type || "Nenhum"}</p>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-green-500" /><span className="text-sm text-muted-foreground">Registros</span></div>
                      <p className="text-2xl font-bold mt-1">{userRegistros.length}</p>
                    </CardContent>
                  </Card>
                </div>
                {userRegistros.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Últimos Registros</h4>
                    <div className="space-y-2">
                      {userRegistros.slice(0, 5).map((registro) => (
                        <div key={registro.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <span className="text-sm">{registro.nome_ativo}</span>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(registro.status)}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(registro.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>Atualize os dados do cliente.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome Completo</Label><Input value={editData.full_name} onChange={(e) => setEditData({ ...editData, full_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>CPF/CNPJ</Label><Input value={editData.cpf_cnpj} onChange={(e) => setEditData({ ...editData, cpf_cnpj: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} /></div>
              <div className="space-y-2"><Label>Empresa</Label><Input value={editData.company_name} onChange={(e) => setEditData({ ...editData, company_name: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block Dialog */}
        <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{selectedUser?.is_blocked ? "Desbloquear" : "Bloquear"} Cliente</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.is_blocked 
                  ? "Deseja desbloquear este cliente?"
                  : "Deseja bloquear este cliente? Ele não poderá acessar a plataforma."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-4">
              <Label>Motivo *</Label>
              <Textarea placeholder="Descreva o motivo..." value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleBlockUser} disabled={blocking || !blockReason.trim()}
                className={selectedUser?.is_blocked ? "" : "bg-destructive hover:bg-destructive/90"}>
                {blocking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {selectedUser?.is_blocked ? "Desbloquear" : "Bloquear"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create User Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
              <DialogDescription>Crie uma nova conta de cliente.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nome Completo *</Label><Input placeholder="João da Silva" value={createData.full_name} onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>E-mail *</Label><Input type="email" placeholder="joao@exemplo.com" value={createData.email} onChange={(e) => setCreateData({ ...createData, email: e.target.value })} /></div>
              <div className="space-y-2"><Label>Senha * (mín. 6 caracteres)</Label><Input type="password" placeholder="••••••••" value={createData.password} onChange={(e) => setCreateData({ ...createData, password: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Créditos Iniciais</Label>
                <Input type="number" min="0" placeholder="0" value={createData.initial_credits || ""} onChange={(e) => setCreateData({ ...createData, initial_credits: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateUser} disabled={creating || !createData.email || !createData.password || !createData.full_name}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Cliente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subscription Dialog */}
        <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-warning" />
                {subscriptionAction === "grant" && "Conceder Plano Business"}
                {subscriptionAction === "revoke" && "Revogar Plano Business"}
                {subscriptionAction === "update" && "Editar Plano Business"}
              </DialogTitle>
            </DialogHeader>
            {(subscriptionAction === "grant" || subscriptionAction === "update") && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Créditos por Ciclo</Label>
                  <Input type="number" min="1" value={subscriptionData.credits_per_cycle}
                    onChange={(e) => setSubscriptionData({ credits_per_cycle: parseInt(e.target.value) || 5 })} />
                </div>
              </div>
            )}
            {subscriptionAction === "revoke" && (
              <div className="py-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive"><strong>Atenção:</strong> O cliente perderá acesso ao Plano Business.</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSubscriptionDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleManageSubscription} disabled={managingSubscription}
                variant={subscriptionAction === "revoke" ? "destructive" : "default"}>
                {managingSubscription && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {subscriptionAction === "grant" && "Conceder"}
                {subscriptionAction === "revoke" && "Revogar"}
                {subscriptionAction === "update" && "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Grant Credits Dialog */}
        <Dialog open={grantCreditsDialogOpen} onOpenChange={setGrantCreditsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" /> Conceder Créditos
              </DialogTitle>
              <DialogDescription>Para: <strong>{selectedUser?.full_name || "cliente"}</strong></DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Quantidade</Label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 5, 10, 20].map((qty) => (
                    <Button key={qty} variant={grantCreditsAmount === qty ? "default" : "outline"} size="sm"
                      onClick={() => setGrantCreditsAmount(qty)} className="w-12">{qty}</Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setGrantCreditsAmount(Math.max(1, grantCreditsAmount - 1))} disabled={grantCreditsAmount <= 1}><Minus className="h-4 w-4" /></Button>
                  <Input type="number" min="1" max="100" value={grantCreditsAmount}
                    onChange={(e) => setGrantCreditsAmount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} className="w-20 text-center" />
                  <Button variant="outline" size="icon" onClick={() => setGrantCreditsAmount(Math.min(100, grantCreditsAmount + 1))} disabled={grantCreditsAmount >= 100}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Motivo (obrigatório)</Label>
                <Textarea placeholder="Ex: Bonificação, compensação..." value={grantCreditsReason} onChange={(e) => setGrantCreditsReason(e.target.value)} rows={3} />
                <p className="text-xs text-muted-foreground">Mínimo 10 caracteres</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setGrantCreditsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGrantCredits} disabled={grantingCredits || grantCreditsAmount < 1 || grantCreditsReason.trim().length < 10}>
                {grantingCredits && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Conceder {grantCreditsAmount} Crédito(s)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Merge Dialog */}
        <AlertDialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Merge className="h-5 w-5 text-warning" /> Unificar Contas Duplicadas
              </AlertDialogTitle>
              <AlertDialogDescription>
                Selecione a conta principal. Os registros, certificados e créditos das outras contas serão transferidos para ela.
                As contas secundárias serão bloqueadas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {mergeGroup && (
              <div className="space-y-3 py-4">
                <p className="text-sm font-medium">
                  CPF: {mergeGroup.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                </p>
                {mergeGroup.profiles.map((p) => (
                  <div key={p.user_id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      mergePrimaryId === p.user_id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setMergePrimaryId(p.user_id)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{p.full_name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Cadastro: {format(new Date(p.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {mergePrimaryId === p.user_id && (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Principal</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleMerge} disabled={merging}>
                {merging && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Unificar Contas
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

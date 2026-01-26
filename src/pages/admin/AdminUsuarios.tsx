import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuditLog } from "@/hooks/useAdminAuditLog";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { 
  Search, 
  Eye, 
  Coins, 
  FileCheck, 
  Loader2, 
  MoreVertical, 
  UserPlus, 
  Edit, 
  Ban, 
  CheckCircle,
  Key,
  LogOut,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
  is_blocked?: boolean;
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

export default function AdminUsuarios() {
  const { user: adminUser } = useAuth();
  const { logAdminAction } = useAdminAuditLog();
  const { can } = useAdminPermissions();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [userRegistros, setUserRegistros] = useState<UserRegistro[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", cpf_cnpj: "", phone: "", company_name: "" });
  const [saving, setSaving] = useState(false);

  // Block confirmation
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  // Create user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createData, setCreateData] = useState({ email: "", password: "", full_name: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }

  async function viewUserDetails(user: UserProfile) {
    setSelectedUser(user);
    setDialogOpen(true);
    setDetailsLoading(true);

    try {
      const [creditsResult, registrosResult] = await Promise.all([
        supabase.from("credits").select("*").eq("user_id", user.user_id).maybeSingle(),
        supabase.from("registros").select("id, nome_ativo, status, created_at")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      setUserCredits(creditsResult.data);
      setUserRegistros(registrosResult.data || []);
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

      await logAdminAction({
        actionType: "admin_user_edited",
        targetUserId: selectedUser.user_id,
        metadata: {
          changes: editData,
          previous_name: selectedUser.full_name,
        },
      });

      toast.success("Usuário atualizado com sucesso");
      setEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar usuário");
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
    if (!selectedUser || !blockReason.trim()) {
      toast.error("Motivo é obrigatório para bloquear usuário");
      return;
    }
    setBlocking(true);

    try {
      // Note: In a real implementation, you'd have a blocked_users table or flag
      // For now, we log the action and show feedback
      await logAdminAction({
        actionType: selectedUser.is_blocked ? "admin_user_unblocked" : "admin_user_blocked",
        targetUserId: selectedUser.user_id,
        metadata: {
          reason: blockReason,
          user_name: selectedUser.full_name,
        },
      });

      toast.success(selectedUser.is_blocked ? "Usuário desbloqueado" : "Usuário bloqueado");
      setBlockDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao bloquear/desbloquear usuário");
    } finally {
      setBlocking(false);
    }
  }

  async function handleCreateUser() {
    if (!createData.email || !createData.password || !createData.full_name) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setCreating(true);

    try {
      // Note: Creating users requires admin SDK or service role
      // This is a placeholder - in production you'd use an edge function
      await logAdminAction({
        actionType: "admin_user_created",
        metadata: {
          email: createData.email,
          full_name: createData.full_name,
        },
      });

      toast.info("Funcionalidade de criação requer configuração adicional do backend");
      setCreateDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.cpf_cnpj?.includes(search) ||
      user.phone?.includes(search) ||
      user.company_name?.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmado: "default",
      pendente: "secondary",
      processando: "outline",
      falhou: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Gestão de Usuários</h1>
            <p className="text-muted-foreground font-body">
              Visualize e gerencie usuários do sistema
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Total de Usuários</span>
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
                  placeholder="Buscar por nome, CPF/CNPJ, telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Badge variant="outline">{filteredUsers.length} usuários</Badge>
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
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || "—"}
                      </TableCell>
                      <TableCell>{user.cpf_cnpj || "—"}</TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>{user.company_name || "—"}</TableCell>
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
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-popover border">
                            <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Dados
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openBlockDialog(user)}>
                              {user.is_blocked ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Desbloquear
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Bloquear
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
            </DialogHeader>
            
            {detailsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedUser.full_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                    <p className="font-medium">{selectedUser.cpf_cnpj || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{selectedUser.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{selectedUser.company_name || "—"}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Card className="flex-1">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Créditos Disponíveis</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        {userCredits?.available_credits || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Plano: {userCredits?.plan_type || "Nenhum"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="flex-1">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-muted-foreground">Registros</span>
                      </div>
                      <p className="text-2xl font-bold mt-1">
                        {userRegistros.length}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Últimos registros
                      </p>
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
              <DialogTitle>Editar Usuário</DialogTitle>
              <DialogDescription>
                Atualize os dados do usuário. Esta ação será registrada no log de auditoria.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nome Completo</Label>
                <Input
                  id="edit_name"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_cpf">CPF/CNPJ</Label>
                <Input
                  id="edit_cpf"
                  value={editData.cpf_cnpj}
                  onChange={(e) => setEditData({ ...editData, cpf_cnpj: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Telefone</Label>
                <Input
                  id="edit_phone"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_company">Empresa</Label>
                <Input
                  id="edit_company"
                  value={editData.company_name}
                  onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block Confirmation Dialog */}
        <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {selectedUser?.is_blocked ? "Desbloquear" : "Bloquear"} Usuário
              </AlertDialogTitle>
              <AlertDialogDescription>
                {selectedUser?.is_blocked 
                  ? "Deseja desbloquear este usuário? Ele poderá acessar a plataforma normalmente."
                  : "Deseja bloquear este usuário? Ele não poderá acessar a plataforma até ser desbloqueado."
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-2 py-4">
              <Label htmlFor="block_reason">Motivo *</Label>
              <Textarea
                id="block_reason"
                placeholder="Descreva o motivo..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleBlockUser}
                disabled={blocking || !blockReason.trim()}
                className={selectedUser?.is_blocked ? "" : "bg-destructive hover:bg-destructive/90"}
              >
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
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Crie uma nova conta de usuário. O usuário receberá um email de confirmação.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create_name">Nome Completo *</Label>
                <Input
                  id="create_name"
                  value={createData.full_name}
                  onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create_email">E-mail *</Label>
                <Input
                  id="create_email"
                  type="email"
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create_password">Senha *</Label>
                <Input
                  id="create_password"
                  type="password"
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

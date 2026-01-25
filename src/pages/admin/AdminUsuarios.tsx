import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, Coins, FileCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
  company_name: string | null;
  created_at: string;
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userCredits, setUserCredits] = useState<UserCredits | null>(null);
  const [userRegistros, setUserRegistros] = useState<UserRegistro[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

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
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie usuários do sistema
          </p>
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
      </div>
    </AdminLayout>
  );
}

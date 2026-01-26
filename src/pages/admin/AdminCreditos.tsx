import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Search, Edit, History, Loader2, Coins, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface UserCredits {
  id: string;
  user_id: string;
  available_credits: number;
  used_credits: number;
  total_credits: number;
  plan_type: string;
  updated_at: string;
  profile?: {
    full_name: string | null;
    cpf_cnpj: string | null;
  };
}

interface LedgerEntry {
  id: string;
  operation: string;
  amount: number;
  balance_after: number;
  reason: string;
  created_at: string;
}

export default function AdminCreditos() {
  const { user } = useAuth();
  const { can } = useAdminPermissions();
  const [credits, setCredits] = useState<UserCredits[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Adjust dialog state
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedCredits, setSelectedCredits] = useState<UserCredits | null>(null);
  const [newBalance, setNewBalance] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Ledger dialog state
  const [ledgerDialogOpen, setLedgerDialogOpen] = useState(false);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  useEffect(() => {
    fetchCredits();
  }, []);

  async function fetchCredits() {
    try {
      const { data: creditsData, error } = await supabase
        .from("credits")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each user
      const userIds = creditsData?.map(c => c.user_id) || [];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, cpf_cnpj")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      const creditsWithProfiles = creditsData?.map(c => ({
        ...c,
        profile: profilesMap.get(c.user_id),
      })) || [];

      setCredits(creditsWithProfiles);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  }

  async function openAdjustDialog(credit: UserCredits) {
    setSelectedCredits(credit);
    setNewBalance(credit.available_credits.toString());
    setAdjustReason("");
    setAdjustDialogOpen(true);
  }

  async function openLedgerDialog(credit: UserCredits) {
    setSelectedCredits(credit);
    setLedgerDialogOpen(true);
    setLedgerLoading(true);

    try {
      const { data, error } = await supabase
        .from("credits_ledger")
        .select("*")
        .eq("user_id", credit.user_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLedgerEntries(data || []);
    } catch (error) {
      console.error("Error fetching ledger:", error);
    } finally {
      setLedgerLoading(false);
    }
  }

  async function handleAdjustCredits() {
    if (!selectedCredits || !user || !adjustReason.trim()) {
      toast({
        title: "Erro",
        description: "Motivo é obrigatório para ajuste de créditos.",
        variant: "destructive",
      });
      return;
    }

    setAdjusting(true);

    try {
      const { data, error } = await supabase.rpc("adjust_credit_atomic", {
        p_user_id: selectedCredits.user_id,
        p_new_balance: parseInt(newBalance),
        p_reason: adjustReason,
        p_admin_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || "Erro ao ajustar créditos");
      }

      toast({
        title: "Sucesso",
        description: "Créditos ajustados com sucesso.",
      });

      setAdjustDialogOpen(false);
      fetchCredits();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao ajustar créditos",
        variant: "destructive",
      });
    } finally {
      setAdjusting(false);
    }
  }

  const filteredCredits = credits.filter((c) => {
    const search = searchTerm.toLowerCase();
    return (
      c.profile?.full_name?.toLowerCase().includes(search) ||
      c.profile?.cpf_cnpj?.includes(search) ||
      c.user_id.includes(search)
    );
  });

  const getOperationBadge = (operation: string) => {
    const colors: Record<string, string> = {
      ADD: "bg-green-500/10 text-green-500",
      CONSUME: "bg-orange-500/10 text-orange-500",
      REFUND: "bg-blue-500/10 text-blue-500",
      ADJUST: "bg-purple-500/10 text-purple-500",
      EXPIRE: "bg-red-500/10 text-red-500",
    };
    return (
      <Badge className={colors[operation] || "bg-gray-500/10 text-gray-500"}>
        {operation}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Créditos</h1>
          <p className="text-muted-foreground">
            Ajuste e monitore créditos dos usuários
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF/CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead className="text-center">Disponíveis</TableHead>
                    <TableHead className="text-center">Usados</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead>Atualizado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCredits.map((credit) => (
                    <TableRow key={credit.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{credit.profile?.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{credit.profile?.cpf_cnpj || "—"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{credit.plan_type}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-lg font-bold text-green-500">
                          {credit.available_credits}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-muted-foreground">
                          {credit.used_credits}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {credit.total_credits}
                      </TableCell>
                      <TableCell>
                        {format(new Date(credit.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openLedgerDialog(credit)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <PermissionGate permission="credits.adjust">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAdjustDialog(credit)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Ajustar
                            </Button>
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Adjust Credits Dialog */}
        <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Créditos</DialogTitle>
            </DialogHeader>
            
            {selectedCredits && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Usuário</p>
                  <p className="font-medium">{selectedCredits.profile?.full_name || "—"}</p>
                  <p className="text-sm text-muted-foreground mt-2">Saldo Atual</p>
                  <p className="text-2xl font-bold text-green-500">
                    {selectedCredits.available_credits} créditos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newBalance">Novo Saldo</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewBalance(String(Math.max(0, parseInt(newBalance || "0") - 1)))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="newBalance"
                      type="number"
                      min="0"
                      value={newBalance}
                      onChange={(e) => setNewBalance(e.target.value)}
                      className="text-center text-lg font-bold"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setNewBalance(String(parseInt(newBalance || "0") + 1))}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo do Ajuste *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Descreva o motivo do ajuste..."
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este ajuste será registrado no histórico de auditoria.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAdjustCredits}
                disabled={adjusting || !adjustReason.trim()}
              >
                {adjusting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Confirmar Ajuste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ledger Dialog */}
        <Dialog open={ledgerDialogOpen} onOpenChange={setLedgerDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Histórico de Créditos
              </DialogTitle>
            </DialogHeader>
            
            {ledgerLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead className="text-center">Saldo Após</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledgerEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm">
                        {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{getOperationBadge(entry.operation)}</TableCell>
                      <TableCell className="text-center font-mono">
                        {entry.operation === "CONSUME" ? "-" : "+"}{entry.amount}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {entry.balance_after}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.reason}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

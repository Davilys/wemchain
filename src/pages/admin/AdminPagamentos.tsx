import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, CreditCard, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Payment {
  id: string;
  user_id: string;
  asaas_payment_id: string | null;
  plan_type: string;
  valor: number;
  credits_amount: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  paid_at: string | null;
  profile?: {
    full_name: string | null;
  };
}

export default function AdminPagamentos() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Summary stats
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    try {
      const { data: paymentsData, error } = await supabase
        .from("asaas_payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      // Fetch profiles
      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      const paymentsWithProfiles = paymentsData?.map(p => ({
        ...p,
        profile: profilesMap.get(p.user_id),
      })) || [];

      setPayments(paymentsWithProfiles);

      // Calculate totals
      const confirmed = paymentsWithProfiles
        .filter(p => p.status === "CONFIRMED")
        .reduce((acc, p) => acc + Number(p.valor), 0);
      const pending = paymentsWithProfiles
        .filter(p => p.status === "PENDING")
        .reduce((acc, p) => acc + Number(p.valor), 0);

      setTotalConfirmed(confirmed);
      setTotalPending(pending);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.asaas_payment_id?.includes(searchTerm) ||
      p.plan_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      CONFIRMED: { color: "bg-green-500/10 text-green-500", label: "Confirmado" },
      PENDING: { color: "bg-yellow-500/10 text-yellow-500", label: "Pendente" },
      RECEIVED_IN_CASH: { color: "bg-green-500/10 text-green-500", label: "Recebido" },
      OVERDUE: { color: "bg-orange-500/10 text-orange-500", label: "Vencido" },
      REFUNDED: { color: "bg-blue-500/10 text-blue-500", label: "Estornado" },
      FAILED: { color: "bg-red-500/10 text-red-500", label: "Falhou" },
    };
    const { color, label } = config[status] || { color: "bg-gray-500/10 text-gray-500", label: status };
    return <Badge className={color}>{label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      BASICO: "bg-blue-500/10 text-blue-500",
      PROFISSIONAL: "bg-purple-500/10 text-purple-500",
      MENSAL: "bg-cyan-500/10 text-cyan-500",
    };
    return <Badge className={colors[plan] || "bg-gray-500/10 text-gray-500"}>{plan}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Pagamentos ASAAS</h1>
          <p className="text-muted-foreground font-body text-sm md:text-base">
            Visualize todos os pagamentos processados
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Total Confirmado</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1 text-green-500 truncate">
                R$ {totalConfirmed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Total Pendente</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1 text-yellow-500 truncate">
                R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="p-3 md:pt-4 md:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total de Pagamentos</span>
              </div>
              <p className="text-xl md:text-2xl font-bold mt-1">{payments.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, ID, plano..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="REFUNDED">Estornado</SelectItem>
                  <SelectItem value="FAILED">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 sm:mx-0">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Criado</TableHead>
                      <TableHead>Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.profile?.full_name || "—"}
                        </TableCell>
                        <TableCell>{getPlanBadge(payment.plan_type)}</TableCell>
                        <TableCell className="font-mono">
                          R$ {Number(payment.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          {payment.credits_amount}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm">
                          {payment.payment_method || "PIX"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(payment.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.paid_at 
                            ? format(new Date(payment.paid_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "—"
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

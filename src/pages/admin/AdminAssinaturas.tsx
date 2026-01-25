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
import { Search, Loader2, CalendarCheck, CalendarX } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscription {
  id: string;
  user_id: string;
  asaas_subscription_id: string;
  plan_type: string;
  status: string;
  credits_per_cycle: number;
  current_cycle: number;
  next_billing_date: string | null;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

export default function AdminAssinaturas() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    try {
      const { data: subsData, error } = await supabase
        .from("asaas_subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles
      const userIds = [...new Set(subsData?.map(s => s.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));

      const subsWithProfiles = subsData?.map(s => ({
        ...s,
        profile: profilesMap.get(s.user_id),
      })) || [];

      setSubscriptions(subsWithProfiles);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  }

  const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length;
  const canceledCount = subscriptions.filter(s => s.status === "CANCELED").length;

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchesSearch =
      s.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.asaas_subscription_id.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      ACTIVE: { color: "bg-green-500/10 text-green-500", label: "Ativa" },
      PENDING: { color: "bg-yellow-500/10 text-yellow-500", label: "Pendente" },
      CANCELED: { color: "bg-red-500/10 text-red-500", label: "Cancelada" },
      EXPIRED: { color: "bg-gray-500/10 text-gray-500", label: "Expirada" },
    };
    const { color, label } = config[status] || { color: "bg-gray-500/10 text-gray-500", label: status };
    return <Badge className={color}>{label}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Assinaturas</h1>
          <p className="text-muted-foreground">
            Gerencie assinaturas recorrentes do sistema
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Assinaturas Ativas</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-green-500">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CalendarX className="h-5 w-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Canceladas</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-red-500">{canceledCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold mt-1">{subscriptions.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ACTIVE">Ativa</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CANCELED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Créditos/Ciclo</TableHead>
                    <TableHead className="text-center">Ciclo Atual</TableHead>
                    <TableHead>Próxima Cobrança</TableHead>
                    <TableHead>Criada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.profile?.full_name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{sub.plan_type}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="text-center">
                        {sub.credits_per_cycle}
                      </TableCell>
                      <TableCell className="text-center">
                        {sub.current_cycle}
                      </TableCell>
                      <TableCell className="text-sm">
                        {sub.next_billing_date 
                          ? format(new Date(sub.next_billing_date), "dd/MM/yyyy", { locale: ptBR })
                          : "—"
                        }
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(sub.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

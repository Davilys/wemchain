import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  FileCheck,
  Clock,
  AlertTriangle,
  Coins,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface DashboardMetrics {
  totalUsers: number;
  totalRegistros: number;
  pendingRegistros: number;
  failedRegistros: number;
  totalCreditsActive: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      // Fetch all metrics in parallel
      const [
        usersResult,
        registrosResult,
        pendingResult,
        failedResult,
        creditsResult,
        paymentsResult,
        monthlyResult,
        subsResult,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("registros").select("id", { count: "exact", head: true }),
        supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "pendente"),
        supabase.from("registros").select("id", { count: "exact", head: true }).eq("status", "falhou"),
        supabase.from("credits").select("available_credits"),
        supabase.from("asaas_payments").select("valor").eq("status", "CONFIRMED"),
        supabase.from("asaas_payments")
          .select("valor")
          .eq("status", "CONFIRMED")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("asaas_subscriptions").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
      ]);

      const totalCredits = creditsResult.data?.reduce((acc, c) => acc + (c.available_credits || 0), 0) || 0;
      const totalRevenue = paymentsResult.data?.reduce((acc, p) => acc + Number(p.valor || 0), 0) || 0;
      const monthlyRevenue = monthlyResult.data?.reduce((acc, p) => acc + Number(p.valor || 0), 0) || 0;

      setMetrics({
        totalUsers: usersResult.count || 0,
        totalRegistros: registrosResult.count || 0,
        pendingRegistros: pendingResult.count || 0,
        failedRegistros: failedResult.count || 0,
        totalCreditsActive: totalCredits,
        totalRevenue,
        monthlyRevenue,
        activeSubscriptions: subsResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  }

  const metricCards = [
    { title: "Total de Usuários", value: metrics?.totalUsers || 0, icon: Users, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { title: "Registros Realizados", value: metrics?.totalRegistros || 0, icon: FileCheck, color: "text-green-500", bgColor: "bg-green-500/10" },
    { title: "Registros Pendentes", value: metrics?.pendingRegistros || 0, icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
    { title: "Registros Falhos", value: metrics?.failedRegistros || 0, icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
    { title: "Créditos Ativos", value: metrics?.totalCreditsActive || 0, icon: Coins, color: "text-purple-500", bgColor: "bg-purple-500/10" },
    { title: "Receita Total", value: `R$ ${(metrics?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { title: "Receita Mensal", value: `R$ ${(metrics?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    { title: "Assinaturas Ativas", value: metrics?.activeSubscriptions || 0, icon: CalendarCheck, color: "text-pink-500", bgColor: "bg-pink-500/10" },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display">Visão Geral</h1>
          <p className="text-muted-foreground font-body text-sm md:text-base">
            Métricas e estatísticas do sistema WebMarcas
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {metricCards.map((card) => (
            <div key={card.title} className="card-premium p-4 md:p-5 group">
              <div className="flex flex-row items-start justify-between gap-2 pb-2">
                <p className="text-xs md:text-sm font-medium text-muted-foreground font-body line-clamp-2">
                  {card.title}
                </p>
                <div className={`p-2 md:p-2.5 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  <card.icon className={`h-4 w-4 md:h-5 md:w-5 ${card.color}`} />
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold font-display truncate">{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

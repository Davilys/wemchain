import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Shield,
  Loader2,
  Coins,
  Award
} from "lucide-react";

interface Registro {
  id: string;
  nome_ativo: string;
  tipo_ativo: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  confirmados: number;
  pendentes: number;
  processando: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, confirmados: 0, pendentes: 0, processando: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch recent registros
      const { data, error } = await supabase
        .from("registros")
        .select("id, nome_ativo, tipo_ativo, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setRegistros(data || []);

      // Fetch stats
      const { data: allData } = await supabase
        .from("registros")
        .select("status");

      if (allData) {
        setStats({
          total: allData.length,
          confirmados: allData.filter(r => r.status === "confirmado").length,
          pendentes: allData.filter(r => r.status === "pendente").length,
          processando: allData.filter(r => r.status === "processando").length,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmado: { icon: CheckCircle2, label: "Confirmado", className: "bg-success/10 text-success border-success/20" },
      processando: { icon: Clock, label: "Processando", className: "bg-primary/10 text-primary border-primary/20" },
      pendente: { icon: Clock, label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
      falhou: { icon: AlertCircle, label: "Falhou", className: "bg-destructive/10 text-destructive border-destructive/20" },
    };
    const config = styles[status as keyof typeof styles] || styles.pendente;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} font-body text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Title */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="font-body text-sm text-muted-foreground">
            Gerencie seus Registros de Propriedade em Blockchain
          </p>
        </div>

        {/* Stats Cards - Compact Horizontal */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Credits */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Créditos</p>
                  <p className="text-2xl font-bold text-primary font-display">
                    {creditsLoading ? "..." : credits?.available_credits || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Registros */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Propriedades</p>
                  <p className="text-2xl font-bold text-foreground font-display">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processando */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Processando</p>
                  <p className="text-2xl font-bold text-foreground font-display">{stats.processando}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmados */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body">Certificados</p>
                  <p className="text-2xl font-bold text-foreground font-display">{stats.confirmados}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            asChild 
            size="lg" 
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold h-12"
          >
            <Link to="/novo-registro">
              <Plus className="h-5 w-5 mr-2" />
              Novo Registro de Propriedade
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="lg"
            className="flex-1 sm:flex-none font-body h-12"
          >
            <Link to="/checkout">
              <Coins className="h-5 w-5 mr-2" />
              Registros de Propriedade
            </Link>
          </Button>
        </div>

        {/* Recent Registros */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="font-display text-lg font-semibold">Registros de Propriedade</h2>
              <Button variant="ghost" size="sm" asChild className="font-body text-primary">
                <Link to="/meus-registros">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : registros.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">Nenhum registro ainda</h3>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Comece registrando seu primeiro arquivo em blockchain
                </p>
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link to="/novo-registro">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Registro
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {registros.map((registro) => (
                  <Link
                    key={registro.id}
                    to={`/certificado/${registro.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-body font-medium text-foreground text-sm">
                          {registro.nome_ativo}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {formatDate(registro.created_at)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(registro.status)}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legal Notice - Compact */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Prova de Anterioridade:</strong> Seus registros em blockchain garantem prova técnica de anterioridade com validade jurídica conforme CPC Art. 369. Este serviço não substitui o registro junto ao INPI.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

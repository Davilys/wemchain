import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LegalNotice } from "@/components/legal/LegalNotice";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Shield,
  Download,
  Loader2,
  TrendingUp,
  Sparkles,
  Activity
} from "lucide-react";

interface Registro {
  id: string;
  nome_ativo: string;
  tipo_ativo: string;
  status: string;
  hash_sha256: string | null;
  created_at: string;
  transacoes_blockchain?: {
    tx_hash: string;
    network: string;
  } | null;
}

interface Stats {
  total: number;
  confirmados: number;
  pendentes: number;
  processando: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
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
      fetchRegistros();
    }
  }, [user]);

  const fetchRegistros = async () => {
    try {
      const { data, error } = await supabase
        .from("registros")
        .select(`
          id,
          nome_ativo,
          tipo_ativo,
          status,
          hash_sha256,
          created_at,
          transacoes_blockchain (
            tx_hash,
            network
          )
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setRegistros(data || []);

      const { data: allData } = await supabase
        .from("registros")
        .select("status");

      if (allData) {
        const statsData = {
          total: allData.length,
          confirmados: allData.filter(r => r.status === "confirmado").length,
          pendentes: allData.filter(r => r.status === "pendente").length,
          processando: allData.filter(r => r.status === "processando").length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error("Erro ao buscar registros:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return (
          <Badge className="bg-success/10 text-success border-success/20 font-body font-medium">
            <CheckCircle2 className="h-3 w-3 mr-1.5" />
            Confirmado
          </Badge>
        );
      case "processando":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 font-body font-medium">
            <Clock className="h-3 w-3 mr-1.5 animate-pulse" />
            Processando
          </Badge>
        );
      case "falhou":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-body font-medium">
            <AlertCircle className="h-3 w-3 mr-1.5" />
            Falhou
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground font-body font-medium">
            <Clock className="h-3 w-3 mr-1.5" />
            Pendente
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-body">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Legal Notice */}
      <LegalNotice />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          </div>
          <p className="font-body text-muted-foreground">Gerencie seus registros em blockchain</p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold rounded-xl shadow-lg btn-premium group">
          <Link to="/novo-registro">
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Novo Registro
          </Link>
        </Button>
      </div>

      {/* Stats Cards - Premium */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-premium border-border/50 overflow-hidden group">
          <CardContent className="pt-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="font-body text-sm text-muted-foreground mb-1">Total de Registros</p>
                <p className="font-display text-4xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-7 w-7 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-border/50 overflow-hidden group">
          <CardContent className="pt-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="font-body text-sm text-muted-foreground mb-1">Confirmados</p>
                <p className="font-display text-4xl font-bold text-success">{stats.confirmados}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-border/50 overflow-hidden group">
          <CardContent className="pt-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-muted/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="font-body text-sm text-muted-foreground mb-1">Pendentes</p>
                <p className="font-display text-4xl font-bold text-muted-foreground">{stats.pendentes}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-7 w-7 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-premium border-border/50 overflow-hidden group">
          <CardContent className="pt-6 relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-warning/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center justify-between relative">
              <div>
                <p className="font-body text-sm text-muted-foreground mb-1">Processando</p>
                <p className="font-display text-4xl font-bold text-warning">{stats.processando}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-warning/20 to-warning/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Loader2 className="h-7 w-7 text-warning animate-spin" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Registros - Premium */}
        <div className="lg:col-span-2">
          <Card className="card-premium border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="font-display text-xl">Últimos Registros</CardTitle>
                  <CardDescription className="font-body">Seus registros mais recentes</CardDescription>
                </div>
              </div>
              <Button variant="ghost" asChild className="font-body text-primary hover:text-primary/80 group">
                <Link to="/meus-registros">
                  Ver todos
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground font-body">Carregando registros...</p>
                  </div>
                </div>
              ) : registros.length === 0 ? (
                <div className="text-center py-16">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">Nenhum registro ainda</h3>
                  <p className="font-body text-muted-foreground mb-6 max-w-sm mx-auto">
                    Comece registrando sua primeira marca em blockchain.
                  </p>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl btn-premium">
                    <Link to="/novo-registro">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Registro
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {registros.map((registro, index) => (
                    <div 
                      key={registro.id} 
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 hover:border-primary/30 transition-all duration-300 group animate-fade-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-body font-semibold text-foreground group-hover:text-primary transition-colors">{registro.nome_ativo}</p>
                          <p className="font-body text-sm text-muted-foreground capitalize">
                            {registro.tipo_ativo.replace("_", " ")} • {formatDate(registro.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(registro.status)}
                        {registro.status === "confirmado" && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-primary/10">
                            <Download className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Info - Premium */}
        <div className="space-y-6">
          <Card className="card-premium border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-secondary" />
                </div>
                <CardTitle className="font-display text-xl">Ações Rápidas</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start font-body border-border/50 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 rounded-xl h-12 group">
                <Link to="/novo-registro">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center mr-3 group-hover:bg-green-500/20 transition-colors">
                    <Plus className="h-4 w-4 text-green-400" />
                  </div>
                  Novo Registro
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start font-body border-border/50 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-400 rounded-xl h-12 group">
                <Link to="/meus-registros">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center mr-3 group-hover:bg-purple-500/20 transition-colors">
                    <FileText className="h-4 w-4 text-purple-400" />
                  </div>
                  Meus Registros
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start font-body border-border/50 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 rounded-xl h-12 group">
                <Link to="/verificar">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  Verificar Certificado
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <CardHeader className="pb-4 relative">
              <CardTitle className="font-display text-lg flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                Proteção Ativa
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="font-body text-sm text-muted-foreground mb-5 leading-relaxed">
                Seus registros em blockchain garantem prova de anterioridade com validade jurídica conforme CPC Art. 369.
              </p>
              <Button asChild variant="link" className="p-0 h-auto font-body text-primary font-semibold group">
                <Link to="/vantagens">
                  Saiba mais sobre as vantagens
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

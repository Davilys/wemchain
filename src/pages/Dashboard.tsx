import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Shield,
  Upload,
  Download,
  ExternalLink,
  Loader2
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

      // Calculate stats
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
        return <Badge className="bg-success/10 text-success border-success/20"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case "processando":
        return <Badge className="bg-warning/10 text-warning border-warning/20"><Clock className="h-3 w-3 mr-1" />Processando</Badge>;
      case "falhou":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20"><AlertCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
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
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="font-body text-muted-foreground">Gerencie seus registros em blockchain</p>
            </div>
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold">
              <Link to="/novo-registro">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Total de Registros</p>
                    <p className="font-display text-3xl font-bold text-foreground">{stats.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Confirmados</p>
                    <p className="font-display text-3xl font-bold text-success">{stats.confirmados}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Pendentes</p>
                    <p className="font-display text-3xl font-bold text-muted-foreground">{stats.pendentes}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Processando</p>
                    <p className="font-display text-3xl font-bold text-warning">{stats.processando}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-warning animate-spin" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Registros */}
            <div className="lg:col-span-2">
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">Últimos Registros</CardTitle>
                    <CardDescription className="font-body">Seus registros mais recentes</CardDescription>
                  </div>
                  <Button variant="ghost" asChild className="font-body">
                    <Link to="/meus-registros">
                      Ver todos
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : registros.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-display text-lg font-semibold mb-2">Nenhum registro ainda</h3>
                      <p className="font-body text-muted-foreground mb-4">
                        Comece registrando sua primeira marca em blockchain.
                      </p>
                      <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        <Link to="/novo-registro">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Registro
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registros.map((registro) => (
                        <div 
                          key={registro.id} 
                          className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-body font-medium">{registro.nome_ativo}</p>
                              <p className="font-body text-sm text-muted-foreground capitalize">
                                {registro.tipo_ativo.replace("_", " ")} • {formatDate(registro.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getStatusBadge(registro.status)}
                            {registro.status === "confirmado" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
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

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start font-body">
                    <Link to="/novo-registro">
                      <Upload className="h-4 w-4 mr-3" />
                      Novo Registro
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start font-body">
                    <Link to="/meus-registros">
                      <FileText className="h-4 w-4 mr-3" />
                      Meus Registros
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start font-body">
                    <Link to="/verificar">
                      <ExternalLink className="h-4 w-4 mr-3" />
                      Verificar Certificado
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-secondary/30 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-secondary" />
                    Proteção Ativa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Seus registros em blockchain garantem prova de anterioridade com validade jurídica.
                  </p>
                  <Button asChild variant="link" className="p-0 h-auto font-body text-secondary">
                    <Link to="/vantagens">
                      Saiba mais sobre as vantagens
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

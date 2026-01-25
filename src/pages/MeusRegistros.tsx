import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Shield,
  Download,
  ExternalLink,
  Loader2,
  Eye
} from "lucide-react";

interface Registro {
  id: string;
  nome_ativo: string;
  tipo_ativo: string;
  arquivo_nome: string;
  status: string;
  hash_sha256: string | null;
  created_at: string;
  transacoes_blockchain?: {
    tx_hash: string;
    network: string;
  } | null;
}

export default function MeusRegistros() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
          arquivo_nome,
          status,
          hash_sha256,
          created_at,
          transacoes_blockchain (
            tx_hash,
            network
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistros(data || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistros = registros.filter(r => {
    const matchesSearch = r.nome_ativo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.arquivo_nome.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      confirmado: { 
        icon: CheckCircle2, 
        label: "Confirmado", 
        className: "bg-success/10 text-success border-success/20",
        dotColor: "bg-success"
      },
      processando: { 
        icon: Clock, 
        label: "Processando", 
        className: "bg-primary/10 text-primary border-primary/20",
        dotColor: "bg-primary"
      },
      pendente: { 
        icon: Clock, 
        label: "Pendente", 
        className: "bg-warning/10 text-warning border-warning/20",
        dotColor: "bg-warning"
      },
      falhou: { 
        icon: AlertCircle, 
        label: "Falhou", 
        className: "bg-destructive/10 text-destructive border-destructive/20",
        dotColor: "bg-destructive"
      },
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {statusFilter === "confirmado" ? "Certificados" : "Registros de Propriedade"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {filteredRegistros.length} registro{filteredRegistros.length !== 1 ? 's' : ''} de propriedade encontrado{filteredRegistros.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 font-body"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link to="/meus-registros">
            <Badge 
              variant={!statusFilter ? "default" : "outline"}
              className={`cursor-pointer font-body ${!statusFilter ? 'bg-primary text-primary-foreground' : ''}`}
            >
              Todos
            </Badge>
          </Link>
          <Link to="/meus-registros?status=pendente">
            <Badge 
              variant={statusFilter === "pendente" ? "default" : "outline"}
              className={`cursor-pointer font-body ${statusFilter === "pendente" ? 'bg-warning text-warning-foreground' : ''}`}
            >
              🟡 Pendente
            </Badge>
          </Link>
          <Link to="/meus-registros?status=processando">
            <Badge 
              variant={statusFilter === "processando" ? "default" : "outline"}
              className={`cursor-pointer font-body ${statusFilter === "processando" ? 'bg-primary text-primary-foreground' : ''}`}
            >
              🔵 Processando
            </Badge>
          </Link>
          <Link to="/meus-registros?status=confirmado">
            <Badge 
              variant={statusFilter === "confirmado" ? "default" : "outline"}
              className={`cursor-pointer font-body ${statusFilter === "confirmado" ? 'bg-success text-success-foreground' : ''}`}
            >
              🟢 Confirmado
            </Badge>
          </Link>
          <Link to="/meus-registros?status=falhou">
            <Badge 
              variant={statusFilter === "falhou" ? "default" : "outline"}
              className={`cursor-pointer font-body ${statusFilter === "falhou" ? 'bg-destructive text-destructive-foreground' : ''}`}
            >
              🔴 Falhou
            </Badge>
          </Link>
        </div>

        {/* Registros List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRegistros.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="text-center py-16">
              <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">
                {searchQuery ? "Tente buscar por outro termo" : "Comece registrando sua primeira propriedade"}
              </p>
              {!searchQuery && (
                <Button asChild className="bg-primary text-primary-foreground">
                  <Link to="/novo-registro">Novo Registro de Propriedade</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRegistros.map((registro) => {
              const statusConfig = getStatusConfig(registro.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={registro.id} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Icon + Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-body font-medium text-foreground text-sm truncate">
                            {registro.nome_ativo}
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            {registro.tipo_ativo.replace("_", " ")} • {formatDate(registro.created_at)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Status + Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`${statusConfig.className} font-body text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>

                        {/* Blockchain Link */}
                        {registro.status === "confirmado" && registro.transacoes_blockchain && (
                          <a
                            href={`https://polygonscan.com/tx/${registro.transacoes_blockchain.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                            title="Ver na blockchain"
                          >
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}

                        {/* View Details */}
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link to={`/certificado/${registro.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        {/* Download - Only for confirmed */}
                        {registro.status === "confirmado" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Baixar certificado"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

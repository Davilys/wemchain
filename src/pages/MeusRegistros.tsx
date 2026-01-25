import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Download,
  Loader2,
  Search,
  Eye,
  ExternalLink
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

export default function MeusRegistros() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistros(data || []);
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRegistros = registros.filter(
    (r) =>
      r.nome_ativo.toLowerCase().includes(search.toLowerCase()) ||
      r.tipo_ativo.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Meus Registros</h1>
            <p className="font-body text-muted-foreground">
              {registros.length} registro{registros.length !== 1 ? "s" : ""} encontrado{registros.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold rounded-xl shadow-lg btn-premium group">
            <Link to="/novo-registro">
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Novo Registro
            </Link>
          </Button>
        </div>

        {/* Busca */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar registros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lista de Registros */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredRegistros.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="text-center py-16">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">
                {search ? "Nenhum resultado encontrado" : "Nenhum registro ainda"}
              </h3>
              <p className="font-body text-muted-foreground mb-6 max-w-sm mx-auto">
                {search
                  ? "Tente buscar com outros termos"
                  : "Comece registrando sua primeira marca em blockchain."}
              </p>
              {!search && (
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl btn-premium">
                  <Link to="/novo-registro">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Registro
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRegistros.map((registro, index) => (
              <Card
                key={registro.id}
                className="card-premium border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-body font-semibold text-lg text-foreground">
                          {registro.nome_ativo}
                        </h3>
                        <p className="font-body text-sm text-muted-foreground">
                          {registro.tipo_ativo.replace("_", " ")} • {formatDate(registro.created_at)}
                        </p>
                        {registro.hash_sha256 && (
                          <p className="font-mono text-xs text-muted-foreground truncate max-w-xs mt-1">
                            Hash: {registro.hash_sha256.substring(0, 20)}...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(registro.status)}

                      {registro.status === "confirmado" && registro.transacoes_blockchain && (
                        <a
                          href={`https://polygonscan.com/tx/${registro.transacoes_blockchain.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-9 w-9 rounded-lg hover:bg-primary/10"
                      >
                        <Link to={`/certificado/${registro.id}`}>
                          <Eye className="h-4 w-4 text-primary" />
                        </Link>
                      </Button>

                      {registro.status === "confirmado" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-lg hover:bg-primary/10"
                        >
                          <Download className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

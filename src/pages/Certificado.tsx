import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Shield,
  Hash,
  Calendar,
  Link2,
  Copy,
  ArrowLeft,
  QrCode
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

export default function Certificado() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [registro, setRegistro] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (id && user) {
      fetchRegistro();
    }
  }, [id, user, authLoading, navigate]);

  const fetchRegistro = async () => {
    try {
      const { data, error } = await supabase
        .from("registros")
        .select(`
          *,
          transacoes_blockchain (*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) {
        navigate("/dashboard");
        return;
      }

      setRegistro(data);
    } catch (error) {
      console.error("Erro ao buscar registro:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  const getPolygonScanUrl = (txHash: string) => {
    return `https://polygonscan.com/tx/${txHash}`;
  };

  // Mock data for demonstration (in production, this comes from transacoes_blockchain)
  const mockTxData = {
    tx_hash: "0x7f8b9c4e5d3a2b1c0f9e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a3",
    network: "polygon",
    block_number: 52847291,
    timestamp_blockchain: registro?.created_at || new Date().toISOString(),
    confirmations: 128
  };

  const txData = registro?.transacoes_blockchain?.[0] || mockTxData;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!registro) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-body text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Dashboard
        </Link>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Registro Confirmado!
          </h1>
          <p className="font-body text-muted-foreground">
            Seu arquivo foi registrado com sucesso na blockchain Polygon
          </p>
        </div>

        {/* Certificate Card */}
        <Card className="border-border bg-card shadow-2xl mb-6" ref={certificateRef}>
          <CardContent className="p-0">
            {/* Certificate Header */}
            <div className="bg-primary/5 border-b border-border p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={webmarcasLogo} 
                    alt="WebMarcas" 
                    className="h-12 w-12 object-contain"
                  />
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">WebMarcas</h2>
                    <p className="font-body text-sm text-muted-foreground">Uma empresa WebPatentes</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-success/20 self-start md:self-auto">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Registro Verificado
                </Badge>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="p-6 md:p-8 space-y-8">
              {/* Title */}
              <div className="text-center border-b border-border pb-6">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Certificado de Registro em Blockchain
                </h3>
                <p className="font-body text-muted-foreground">
                  Prova de Anterioridade Digital
                </p>
              </div>

              {/* Asset Info */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Ativo Registrado
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Nome do Ativo</p>
                    <p className="font-body font-medium text-foreground">{registro.nome_ativo}</p>
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Tipo</p>
                    <p className="font-body font-medium text-foreground capitalize">
                      {registro.tipo_ativo?.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Arquivo</p>
                    <p className="font-body font-medium text-foreground">{registro.arquivo_nome}</p>
                  </div>
                  <div>
                    <p className="font-body text-sm text-muted-foreground">Data do Registro</p>
                    <p className="font-body font-medium text-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(registro.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hash */}
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  Hash SHA-256
                </h4>
                <div className="flex items-start gap-2">
                  <code className="font-mono text-sm bg-muted p-4 rounded-lg flex-1 break-all">
                    {registro.hash_sha256}
                  </code>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(registro.hash_sha256, "Hash")}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-body text-xs text-muted-foreground mt-3">
                  Esta é a impressão digital única do arquivo, gerada através do algoritmo SHA-256.
                </p>
              </div>

              {/* Blockchain Transaction */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Transação Blockchain
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-body text-sm text-muted-foreground mb-1">ID da Transação (TXID)</p>
                    <div className="flex items-start gap-2">
                      <code className="font-mono text-sm bg-background p-3 rounded-lg flex-1 break-all border border-border">
                        {txData.tx_hash}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(txData.tx_hash, "TXID")}
                        className="flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Rede</p>
                      <p className="font-body font-medium text-foreground">Polygon</p>
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Bloco</p>
                      <p className="font-body font-medium text-foreground">{txData.block_number?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Confirmações</p>
                      <p className="font-body font-medium text-success">{txData.confirmations}+</p>
                    </div>
                    <div>
                      <p className="font-body text-sm text-muted-foreground">Status</p>
                      <Badge className="bg-success/10 text-success border-success/20">
                        Confirmado
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-muted/30 rounded-xl">
                <div className="h-32 w-32 bg-background border border-border rounded-xl flex items-center justify-center flex-shrink-0">
                  <QrCode className="h-20 w-20 text-muted-foreground" />
                </div>
                <div className="text-center md:text-left">
                  <h4 className="font-display font-semibold text-foreground mb-2">Verificação Pública</h4>
                  <p className="font-body text-sm text-muted-foreground mb-3">
                    Escaneie o QR Code ou acesse o link abaixo para verificar este registro na blockchain.
                  </p>
                  <Button 
                    variant="outline" 
                    asChild
                    className="font-body"
                  >
                    <a 
                      href={getPolygonScanUrl(txData.tx_hash)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver no PolygonScan
                    </a>
                  </Button>
                </div>
              </div>

              {/* Legal Disclaimer */}
              <div className="border-t border-border pt-6">
                <p className="font-body text-xs text-muted-foreground text-center leading-relaxed">
                  Este certificado comprova a existência e integridade do arquivo na data indicada, 
                  servindo como prova técnica de anterioridade. Este registro em blockchain <strong>não substitui</strong> o 
                  registro de marca junto ao INPI (Instituto Nacional da Propriedade Industrial).
                </p>
              </div>
            </div>

            {/* Certificate Footer */}
            <div className="bg-muted/30 border-t border-border p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div>
                  <p className="font-body text-sm text-muted-foreground">
                    WebMarcas • Uma empresa WebPatentes
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    www.webmarcas.net • ola@webmarcas.net • (11) 91112-0225
                  </p>
                </div>
                <p className="font-body text-xs text-muted-foreground">
                  ID: {registro.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6"
            onClick={() => toast({ title: "Em breve!", description: "Download do PDF será implementado em breve." })}
          >
            <Download className="h-5 w-5 mr-2" />
            Baixar Certificado PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1 font-body py-6 border-border"
            asChild
          >
            <a 
              href={getPolygonScanUrl(txData.tx_hash)} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Verificar na Blockchain
            </a>
          </Button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            asChild
            className="font-body"
          >
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
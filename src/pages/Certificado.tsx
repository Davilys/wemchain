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
  QrCode,
  Clock,
  Info,
  Search,
  Eye
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import webmarcasLogo from "@/assets/webmarcas-logo.png";
import { downloadCertificate } from "@/services/certificateService";
import { CertificatePreviewModal } from "@/components/certificates/CertificatePreviewModal";
import { TIPO_ATIVO_LABELS } from "./NovoRegistro";

interface TransacaoBlockchain {
  id: string;
  tx_hash: string;
  network: string;
  timestamp_method?: string;
  proof_data?: string;
  confirmed_at?: string;
  timestamp_blockchain?: string;
  block_number?: number;
  confirmations?: number;
}

export default function Certificado() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [registro, setRegistro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [profile, setProfile] = useState<{ full_name?: string; cpf_cnpj?: string } | null>(null);

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
      
      // Fetch user profile for holder info
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, cpf_cnpj")
        .eq("user_id", user?.id)
        .single();
        
      if (profileData) {
        setProfile(profileData);
      }
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

  const handleOpenPreview = () => {
    if (!id || registro.status !== 'confirmado') {
      toast({
        title: "Não disponível",
        description: "Preview só está disponível para registros confirmados.",
        variant: "destructive",
      });
      return;
    }
    setShowPreview(true);
  };

  const handleDownloadPDF = async () => {
    if (!id || registro.status !== 'confirmado') {
      toast({
        title: "Não disponível",
        description: "Certificado só pode ser baixado para registros confirmados.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingPDF(true);
    try {
      await downloadCertificate(id);
      toast({
        title: "Download iniciado!",
        description: "Seu certificado PDF foi gerado com sucesso.",
      });
      setShowPreview(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Erro ao gerar certificado",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

  const getVerificationUrl = (txHash: string, network: string) => {
    if (network === "opentimestamps") {
      return `https://opentimestamps.org`;
    }
    if (network === "polygon") {
      return `https://polygonscan.com/tx/${txHash}`;
    }
    return null;
  };

  const getMethodDisplayInfo = (method?: string) => {
    switch (method) {
      case "OPEN_TIMESTAMP":
        return {
          label: "OpenTimestamps",
          description: "Bitcoin Blockchain",
          color: "text-orange-400",
          bgColor: "bg-orange-400/10",
          borderColor: "border-orange-400/20"
        };
      case "BYTESTAMP":
        return {
          label: "ByteStamp",
          description: "Blockchain Timestamp",
          color: "text-blue-400",
          bgColor: "bg-blue-400/10",
          borderColor: "border-blue-400/20"
        };
      case "SMART_CONTRACT":
      default:
        return {
          label: "Sistema WebMarcas",
          description: "Timestamp Interno",
          color: "text-primary",
          bgColor: "bg-primary/10",
          borderColor: "border-primary/20"
        };
    }
  };

  // Get transaction data
  const txData: TransacaoBlockchain | null = registro?.transacoes_blockchain?.[0] || null;
  const methodInfo = getMethodDisplayInfo(txData?.timestamp_method);

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
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Decorative overlays - matching Home */}
      <div className="absolute inset-0 bg-gradient-radial" />
      <div className="absolute inset-0 pattern-dots" />
      
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px]" />
      
      <div className="relative z-10 py-8 px-4">
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
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 glow-primary">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-2 tracking-tight">
              Registro <span className="text-primary text-shadow-glow">Confirmado!</span>
            </h1>
            <p className="font-body text-muted-foreground">
              Seu arquivo foi registrado com sucesso via {methodInfo.label}
            </p>
          </div>

          {/* Certificate Card */}
          <Card className="card-premium border-border/50 shadow-2xl mb-6" ref={certificateRef}>
            <CardContent className="p-0">
              {/* Certificate Header */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20 p-6 md:p-8">
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
                  <div className="flex flex-wrap gap-2 self-start md:self-auto">
                    <Badge className="bg-success/10 text-success border-success/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Registro Verificado
                    </Badge>
                    <Badge className={`${methodInfo.bgColor} ${methodInfo.color} ${methodInfo.borderColor}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {methodInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-6 md:p-8 space-y-8">
                {/* Premium Badge + Title */}
                <div className="text-center border-b border-border/50 pb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Prova de Anterioridade Digital</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-extrabold text-foreground mb-2 tracking-tight">
                    Certificado de Registro em <span className="text-primary">Blockchain</span>
                  </h3>
                </div>

                {/* Asset Info */}
                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-lg">
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
                      <p className="font-body font-medium text-foreground">
                        {TIPO_ATIVO_LABELS[registro.tipo_ativo] || registro.tipo_ativo?.replace("_", " ")}
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
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/30 shadow-lg">
                  <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" />
                    Hash SHA-256
                  </h4>
                  <div className="flex items-start gap-2">
                    <code className="font-mono text-sm bg-background/80 p-4 rounded-lg flex-1 break-all border border-border/50">
                      {registro.hash_sha256}
                    </code>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => copyToClipboard(registro.hash_sha256, "Hash")}
                      className="flex-shrink-0 btn-premium"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-3">
                    Esta é a impressão digital única do arquivo, gerada através do algoritmo SHA-256.
                  </p>
                </div>

                {/* Timestamp/Blockchain Transaction */}
                {txData && (
                  <div className={`${methodInfo.bgColor} rounded-xl p-6 border ${methodInfo.borderColor} shadow-lg`}>
                    <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Link2 className={`h-5 w-5 ${methodInfo.color}`} />
                      Prova de Existência - {methodInfo.label}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="font-body text-sm text-muted-foreground mb-1">ID da Prova / Transação</p>
                        <div className="flex items-start gap-2">
                          <code className="font-mono text-sm bg-background/80 p-3 rounded-lg flex-1 break-all border border-border/50">
                            {txData.tx_hash}
                          </code>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => copyToClipboard(txData.tx_hash, "ID da Prova")}
                            className="flex-shrink-0 btn-premium"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-body text-sm text-muted-foreground">Método</p>
                          <p className={`font-body font-medium ${methodInfo.color}`}>
                            {methodInfo.label}
                          </p>
                        </div>
                        <div>
                          <p className="font-body text-sm text-muted-foreground">Rede</p>
                          <p className="font-body font-medium text-foreground capitalize">
                            {txData.network === "opentimestamps" ? "Bitcoin" : txData.network}
                          </p>
                        </div>
                        <div>
                          <p className="font-body text-sm text-muted-foreground">Confirmado em</p>
                          <p className="font-body font-medium text-foreground">
                            {txData.confirmed_at ? formatDate(txData.confirmed_at) : "Pendente"}
                          </p>
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
                )}

                {/* Method Explanation */}
                <div className="bg-card rounded-xl p-6 border border-border/50 shadow-lg">
                  <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Sobre este Método de Prova
                  </h4>
                  {txData?.timestamp_method === "OPEN_TIMESTAMP" ? (
                    <div className="space-y-3">
                      <p className="font-body text-sm text-foreground">
                        <strong>A prova de existência foi registrada por meio do protocolo OpenTimestamps</strong>, 
                        ancorado na blockchain pública do Bitcoin, garantindo imutabilidade e datação confiável, 
                        sem custo de transação para o usuário.
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        Este método utiliza timestamping criptográfico gratuito, onde o hash do arquivo é 
                        incluído em uma árvore merkle e ancorado em transações públicas do Bitcoin. A prova 
                        pode ser verificada de forma independente em opentimestamps.org.
                      </p>
                    </div>
                  ) : txData?.timestamp_method === "BYTESTAMP" ? (
                    <p className="font-body text-sm text-foreground">
                      <strong>Prova de existência gerada via ByteStamp</strong>, utilizando timestamping 
                      em blockchain público. Esta prova é imutável e auditável, fornecendo evidência 
                      técnica da existência e integridade do arquivo na data registrada.
                    </p>
                  ) : (
                    <p className="font-body text-sm text-foreground">
                      <strong>Timestamp registrado no sistema seguro WebMarcas</strong> com backup criptografado. 
                      Este registro fornece prova de existência com data e hora certificadas pelo nosso sistema.
                    </p>
                  )}
                </div>

                {/* Independent Verification Section */}
                <div className="bg-success/5 rounded-xl p-6 border border-success/20 shadow-lg">
                  <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    Verificação Independente
                  </h4>
                  <p className="font-body text-sm text-foreground mb-4">
                    <strong>Esta prova pode ser verificada de forma independente</strong>, sem qualquer 
                    intervenção da WebMarcas, por meio do protocolo OpenTimestamps, utilizando 
                    blockchain pública do Bitcoin.
                  </p>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="h-24 w-24 bg-background/80 border border-border/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <p className="font-body text-sm text-muted-foreground mb-3">
                        A WebMarcas <strong className="text-foreground">não controla a blockchain</strong>, 
                        <strong className="text-foreground"> não gera a data</strong> e 
                        <strong className="text-foreground"> não pode alterar o registro</strong>.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {txData && getVerificationUrl(txData.tx_hash, txData.network) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            className="font-body btn-premium"
                          >
                            <a 
                              href={getVerificationUrl(txData.tx_hash, txData.network)!} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {txData.timestamp_method === "OPEN_TIMESTAMP" 
                                ? "OpenTimestamps.org"
                                : "Verificar Blockchain"}
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                          className="font-body btn-premium"
                        >
                          <a href="/verificar-registro">
                            <Search className="h-4 w-4 mr-2" />
                            Verificação Pública
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal Disclaimer */}
                <div className="border-t border-border/50 pt-6 space-y-3">
                  {txData?.timestamp_method === "OPEN_TIMESTAMP" && (
                    <p className="font-body text-xs text-foreground text-center leading-relaxed bg-orange-400/5 p-3 rounded-lg border border-orange-400/20">
                      <strong>Sobre a infraestrutura:</strong> A prova de existência foi registrada por meio do 
                      protocolo OpenTimestamps, ancorado na blockchain pública do Bitcoin, garantindo imutabilidade 
                      e datação confiável, sem custo de transação para o usuário.
                    </p>
                  )}
                  <p className="font-body text-xs text-muted-foreground text-center leading-relaxed">
                    Este certificado constitui prova técnica de anterioridade, demonstrando a existência 
                    e integridade do arquivo na data indicada. Este registro em blockchain <strong>não substitui</strong> o 
                    registro de marca junto ao INPI (Instituto Nacional da Propriedade Industrial). 
                    A validade jurídica desta prova pode ser utilizada como elemento complementar em 
                    disputas ou defesa de direitos autorais, patente ou marca.
                  </p>
                </div>
              </div>

              {/* Certificate Footer */}
              <div className="bg-gradient-to-r from-primary/5 to-transparent border-t border-border/50 p-6">
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
              variant="outline"
              className="flex-1 font-body py-6 border-border/50 btn-premium"
              onClick={handleOpenPreview}
              disabled={registro.status !== 'confirmado'}
            >
              <Eye className="h-5 w-5 mr-2" />
              Visualizar Certificado
            </Button>
            <Button
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold py-6 btn-premium glow-primary"
              onClick={handleDownloadPDF}
              disabled={downloadingPDF || registro.status !== 'confirmado'}
            >
              {downloadingPDF ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : registro.status !== 'confirmado' ? (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Aguardando Confirmação
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Baixar Certificado PDF
                </>
              )}
            </Button>
          </div>

          {/* External Verification */}
          {txData && getVerificationUrl(txData.tx_hash, txData.network) && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                className="font-body"
                asChild
              >
                <a 
                  href={getVerificationUrl(txData.tx_hash, txData.network)!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verificar na Blockchain
                </a>
              </Button>
            </div>
          )}

          {/* Back to Dashboard */}
          <div className="text-center mt-4">
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
      
      {/* Bottom gradient transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownloadPDF}
        isDownloading={downloadingPDF}
        data={registro ? {
          id: registro.id,
          nome_ativo: registro.nome_ativo,
          tipo_ativo: registro.tipo_ativo,
          arquivo_nome: registro.arquivo_nome,
          hash_sha256: registro.hash_sha256,
          created_at: registro.created_at,
          holder_name: profile?.full_name,
          holder_document: profile?.cpf_cnpj,
          timestamp_method: txData?.timestamp_method,
          network: txData?.network,
          confirmed_at: txData?.confirmed_at,
        } : null}
      />
    </div>
  );
}
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Shield,
  Info,
  AlertTriangle,
  Copy,
  Share2,
  ExternalLink,
  FileText,
  Hash,
  HelpCircle,
  Download
} from "lucide-react";
import { toast } from "sonner";
import webmarcasLogo from "@/assets/webmarcas-logo.png";
import { downloadVerificationPDF } from "@/services/verificationPdfService";

type VerificationStatus = 
  | 'VERIFICADO'
  | 'EM_PROCESSAMENTO'
  | 'NAO_ENCONTRADO'
  | 'FORMATO_INVALIDO';

interface VerificationResult {
  status?: VerificationStatus;
  found: boolean;
  verified: boolean;
  hash: string;
  message?: string;
  suggestion?: string;
  registro?: {
    id: string;
    nome_ativo: string;
    tipo_ativo: string;
    arquivo_nome: string;
    created_at: string;
  };
  blockchain?: {
    network: string;
    method: string;
    methodDescription: string;
    tx_hash: string;
    confirmed_at: string;
    block_number: number | null;
    confirmations: number | null;
    bitcoin_anchored: boolean;
  };
  verificationInstructions?: string;
  legal_notice?: string;
}

export default function VerificacaoPublica() {
  const { hash } = useParams<{ hash: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (hash) {
      verifyHash(hash);
    }
  }, [hash]);

  const verifyHash = async (hashToVerify: string) => {
    const normalizedHash = hashToVerify.trim().toLowerCase();
    const hashRegex = /^[a-fA-F0-9]{64}$/;

    if (!hashRegex.test(normalizedHash)) {
      setResult({
        status: 'FORMATO_INVALIDO',
        found: false,
        verified: false,
        hash: hashToVerify,
        message: 'Formato de hash inválido. O hash SHA-256 deve conter exatamente 64 caracteres hexadecimais.',
      });
      setLoading(false);
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const params = new URLSearchParams({ hash: normalizedHash });
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/verify-timestamp?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const data: VerificationResult = await response.json();
      setResult(data);
      
    } catch (error) {
      console.error("Erro na verificação:", error);
      setResult({
        status: 'NAO_ENCONTRADO',
        found: false,
        verified: false,
        hash: normalizedHash,
        message: 'Erro ao processar verificação. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      dateStyle: "long",
      timeStyle: "short"
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Verificação de Registro WebMarcas',
          text: `Verifique este registro em blockchain: ${result?.registro?.nome_ativo || 'Documento'}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    
    setIsDownloading(true);
    try {
      await downloadVerificationPDF({
        hash: result.hash,
        registro: result.registro,
        blockchain: result.blockchain,
      });
      toast.success("PDF de verificação baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF de verificação");
    } finally {
      setIsDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-center">
            <img src={webmarcasLogo} alt="WebMarcas" className="h-8" />
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verificando registro...</p>
          </div>
        </main>
      </div>
    );
  }

  const status = result?.status || (result?.verified ? 'VERIFICADO' : 'NAO_ENCONTRADO');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <img src={webmarcasLogo} alt="WebMarcas" className="h-8" />
          <Badge variant="outline" className="text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Verificação Pública
          </Badge>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Verificação Pública de Registro em Blockchain
            </h1>
            <p className="text-muted-foreground text-sm">
              Prova técnica independente e verificável por qualquer pessoa
            </p>
          </div>

          {/* VERIFICADO */}
          {status === 'VERIFICADO' && result && (
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="border-2 border-green-500 bg-green-500/5">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-7 w-7 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-green-500">
                        ✔ Registro Confirmado
                      </CardTitle>
                      <CardDescription>
                        Prova de existência válida e imutável em blockchain pública
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hash */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      Hash SHA-256
                    </div>
                    <code className="block font-mono text-xs break-all bg-muted p-3 rounded-lg">
                      {result.hash}
                    </code>
                  </div>

                  {/* Blockchain Info */}
                  {result.blockchain && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Método</p>
                        <p className="font-medium text-foreground">
                          {result.blockchain.methodDescription || result.blockchain.method}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Blockchain</p>
                        <p className="font-medium text-foreground">
                          {result.blockchain.bitcoin_anchored ? 'Bitcoin' : result.blockchain.network}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground">Status</p>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                          Confirmado
                        </Badge>
                      </div>
                      {result.blockchain.confirmed_at && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Confirmado em</p>
                          <p className="font-medium text-foreground text-xs">
                            {formatDate(result.blockchain.confirmed_at)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Registro Info (limited) */}
                  {result.registro && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <FileText className="h-4 w-4" />
                        Dados do Registro
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">ID do Registro</p>
                          <p className="font-mono text-xs">{result.registro.id.slice(0, 8)}...</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Registrado em</p>
                          <p className="font-medium text-foreground text-xs">
                            {formatDate(result.registro.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Independence Notice */}
              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">
                      Esta verificação utiliza o protocolo público <strong>OpenTimestamps</strong>, ancorado na blockchain do Bitcoin. 
                      A WebMarcas <strong>não controla</strong> nem pode alterar este resultado.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3">
                <Button variant="outline" onClick={handleCopyLink} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button variant="outline" onClick={handleShare} className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button 
                  onClick={handleDownloadPDF} 
                  disabled={isDownloading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Baixar PDF
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full text-muted-foreground"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                {showInstructions ? 'Ocultar' : 'Ver'} instruções de verificação independente
              </Button>

              {/* Independent Verification Instructions */}
              {showInstructions && (
                <Card className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-primary" />
                      Verificação Independente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Você pode verificar este timestamp de forma 100% independente usando o protocolo OpenTimestamps:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Acesse <strong>opentimestamps.org</strong></li>
                      <li>Faça upload do arquivo original</li>
                      <li>Faça upload do arquivo <code>.ots</code> correspondente</li>
                      <li>O sistema validará a prova de forma independente</li>
                    </ol>
                    <Button variant="outline" asChild className="w-full">
                      <a 
                        href="https://opentimestamps.org" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Acessar OpenTimestamps.org
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Legal Notice */}
              {result.legal_notice && (
                <Card className="bg-yellow-500/5 border-yellow-500/20">
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <strong>Aviso Legal:</strong> {result.legal_notice}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* EM_PROCESSAMENTO */}
          {status === 'EM_PROCESSAMENTO' && result && (
            <Card className="border-2 border-yellow-500 bg-yellow-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-7 w-7 text-yellow-500 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-yellow-600">
                      ⏳ Em Processamento
                    </CardTitle>
                    <CardDescription>
                      {result.message || "Registro em fase de ancoragem na blockchain."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        Este registro foi recebido e está sendo processado. A confirmação na blockchain Bitcoin 
                        pode levar de alguns minutos até algumas horas.
                      </p>
                      <p>
                        Volte mais tarde para verificar o status atualizado.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FORMATO_INVALIDO */}
          {status === 'FORMATO_INVALIDO' && result && (
            <Card className="border-2 border-orange-500 bg-orange-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-orange-500">
                      ⚠ Formato Inválido
                    </CardTitle>
                    <CardDescription>
                      {result.message || "O hash informado não possui formato válido."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">
                        O hash SHA-256 deve conter exatamente <strong>64 caracteres hexadecimais</strong> (0-9, a-f).
                      </p>
                      <p>
                        Verifique se o link está correto ou acesse a página de verificação principal.
                      </p>
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full mt-4">
                  <a href="/verificar">
                    Ir para Verificação
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* NAO_ENCONTRADO */}
          {status === 'NAO_ENCONTRADO' && result && (
            <Card className="border-2 border-destructive bg-destructive/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-destructive">
                      ❌ Registro Não Encontrado
                    </CardTitle>
                    <CardDescription>
                      {result.message || "Nenhum registro confirmado para este hash."}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-2">Possíveis causas:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>O link pode estar incorreto ou incompleto</li>
                        <li>O registro pode não ter sido confirmado ainda</li>
                        <li>O arquivo pode não ter sido registrado nesta plataforma</li>
                      </ul>
                      {result.suggestion && (
                        <p className="mt-3 text-foreground font-medium">{result.suggestion}</p>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full mt-4">
                  <a href="/verificar">
                    Ir para Verificação
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 bg-card/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} WebMarcas. Verificação pública de registro em blockchain.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <a href="/termos-de-uso" className="hover:text-foreground transition-colors">Termos de Uso</a>
            {" · "}
            <a href="/politica-privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

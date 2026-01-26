import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Hash,
  Clock,
  Loader2,
  Shield,
  Info,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Lock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Status de verificação possíveis
 */
type VerificationStatus = 
  | 'VERIFICADO'        // ✔ Hash confirmado em blockchain
  | 'EM_PROCESSAMENTO'  // ⏳ Registro existe mas ainda não confirmado
  | 'NAO_ENCONTRADO'    // ❌ Hash não existe no sistema
  | 'FORMATO_INVALIDO'; // ❌ Hash com formato incorreto

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

export default function Verificar() {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o hash SHA-256 do arquivo.",
        variant: "destructive"
      });
      return;
    }

    // Validate hash format before sending
    const normalizedHash = searchValue.trim().toLowerCase();
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    
    if (!hashRegex.test(normalizedHash)) {
      setResult({
        status: 'FORMATO_INVALIDO',
        found: false,
        verified: false,
        hash: searchValue,
        message: 'Formato de hash inválido. O hash SHA-256 deve conter exatamente 64 caracteres hexadecimais.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

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

  // Render status-based result card
  const renderResultCard = () => {
    if (!result) return null;

    const status = result.status || (result.verified ? 'VERIFICADO' : 'NAO_ENCONTRADO');

    // VERIFICADO
    if (status === 'VERIFICADO') {
      return (
        <Card className="max-w-2xl mx-auto mt-8 card-premium border-2 border-green-500/50 bg-green-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-7 w-7 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-green-500 tracking-tight">
                  Registro Verificado
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {result.message || "Registro confirmado em blockchain pública (Bitcoin)."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {result.registro && (
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground">Dados do Registro</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Nome do Ativo</span>
                    <p className="font-medium text-foreground mt-1">{result.registro.nome_ativo}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</span>
                    <p className="font-medium text-foreground capitalize mt-1">{result.registro.tipo_ativo}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Hash SHA-256</span>
                    <p className="font-mono text-xs break-all bg-muted/50 p-3 rounded-lg mt-1 border border-border/30 text-foreground">
                      {result.hash}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Registrado em</span>
                    <p className="font-medium text-foreground mt-1">{formatDate(result.registro.created_at)}</p>
                  </div>
                </div>
              </div>
            )}

            {result.blockchain && (
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-foreground">Dados da Blockchain</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Rede</span>
                    <p className="font-medium text-foreground mt-1">{result.blockchain.methodDescription}</p>
                  </div>
                  {result.blockchain.block_number && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Bloco</span>
                      <p className="font-medium text-foreground mt-1">{result.blockchain.block_number}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">ID da Transação</span>
                    <p className="font-mono text-xs break-all bg-muted/50 p-3 rounded-lg mt-1 border border-border/30 text-foreground">
                      {result.blockchain.tx_hash}
                    </p>
                  </div>
                  {result.blockchain.confirmed_at && (
                    <div className="md:col-span-2 flex items-center gap-2 text-muted-foreground p-3 rounded-lg bg-muted/30">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm">Confirmado na blockchain em: <span className="text-foreground font-medium">{formatDate(result.blockchain.confirmed_at)}</span></span>
                    </div>
                  )}
                </div>
                
                <div className="w-full p-4 bg-green-500/10 rounded-xl text-center text-sm text-foreground border border-green-500/20">
                  <Shield className="h-4 w-4 inline-block mr-2 text-green-500" />
                  {result.verificationInstructions || "Verificado via OpenTimestamps (ancorado no Bitcoin)"}
                </div>

                {result.blockchain.bitcoin_anchored && (
                  <Button variant="outline" asChild className="w-full rounded-xl border-primary/30 hover:bg-primary/5 font-semibold">
                    <a 
                      href="https://opentimestamps.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Verificar em OpenTimestamps.org
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}

                {result.legal_notice && (
                  <div className="w-full p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-muted-foreground">
                    <strong className="text-yellow-600">Aviso Legal:</strong> {result.legal_notice}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // EM_PROCESSAMENTO
    if (status === 'EM_PROCESSAMENTO') {
      return (
        <Card className="max-w-2xl mx-auto mt-8 card-premium border-2 border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="h-7 w-7 text-yellow-500 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-yellow-500 tracking-tight">
                  Em Processamento
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {result.message || "Registro em fase de ancoragem na blockchain."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-3 text-foreground font-medium">
                    Este registro foi recebido e está sendo processado.
                  </p>
                  <p className="mb-2">
                    A confirmação na blockchain Bitcoin pode levar de alguns minutos até algumas horas.
                  </p>
                  <p className="text-foreground font-medium">
                    Volte mais tarde para verificar o status atualizado.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // FORMATO_INVALIDO
    if (status === 'FORMATO_INVALIDO') {
      return (
        <Card className="max-w-2xl mx-auto mt-8 card-premium border-2 border-orange-500/50 bg-orange-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-7 w-7 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-orange-500 tracking-tight">
                  Formato Inválido
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {result.message || "O hash informado não possui formato válido."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-3">
                    O hash SHA-256 deve conter exatamente <strong className="text-foreground">64 caracteres hexadecimais</strong> (0-9, a-f).
                  </p>
                  <p className="text-foreground font-medium">
                    Verifique se você copiou o hash corretamente do seu certificado digital.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // NAO_ENCONTRADO
    return (
      <Card className="max-w-2xl mx-auto mt-8 card-premium border-2 border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-destructive tracking-tight">
                Não Encontrado
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {result.message || "Nenhum registro encontrado para este hash."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 rounded-xl p-6 border border-destructive/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="mb-3 text-foreground font-medium">Possíveis causas:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>O hash pode estar incorreto ou incompleto</li>
                  <li>O arquivo pode não ter sido registrado nesta plataforma</li>
                  <li>O arquivo original pode ter sido modificado após o registro</li>
                </ul>
                {result.suggestion && (
                  <p className="mt-4 text-foreground font-medium p-3 rounded-lg bg-card border border-border/50">{result.suggestion}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      {/* Hero Section - Premium Style matching Home */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots" />
        
        {/* Decorative blurs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-up">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide">Verificação Pública</span>
          </div>
          
          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight animate-fade-up delay-100">
            Verificar <span className="text-primary text-shadow-glow">Certificado</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-up delay-200">
            Confirme a <span className="text-foreground font-medium">autenticidade</span> de um registro em blockchain
          </p>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-card to-transparent" />
      </section>

      {/* Legal Disclaimer - OBRIGATÓRIO */}
      <section className="py-4 bg-yellow-500/5 border-y border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 max-w-2xl mx-auto">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
              <Info className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Esta verificação utiliza o protocolo público <strong className="text-foreground">OpenTimestamps</strong>, ancorado na blockchain do Bitcoin. 
              A WebMarcas <strong className="text-foreground">não controla</strong> nem pode alterar o resultado desta verificação.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="section-padding bg-background relative">
        <div className="absolute inset-0 bg-gradient-radial-bottom opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-2xl mx-auto card-premium">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl md:text-2xl tracking-tight text-foreground">Verificar Registro</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Insira o hash SHA-256 do arquivo
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="hash" className="flex items-center gap-2 text-foreground font-medium">
                  <Hash className="h-4 w-4 text-primary" />
                  Hash SHA-256 do arquivo
                </Label>
                <Input
                  id="hash"
                  placeholder="Ex: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="font-mono text-sm bg-background border-border/50 focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  O hash está no seu certificado digital ou pode ser gerado a partir do arquivo original
                </p>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold btn-premium"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Verificar Registro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {renderResultCard()}
        </div>
      </section>

      {/* How to Verify */}
      <section className="section-padding bg-card relative border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Passo a Passo</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Como <span className="text-primary">Verificar</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Duas formas de confirmar a autenticidade do seu registro
              </p>
            </div>

            <div className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Hash className="h-5 w-5 text-blue-500" />
                    </div>
                    Verificação por Hash
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Localize o <strong className="text-foreground">hash SHA-256</strong> no seu certificado digital</li>
                    <li>Cole o hash no campo de busca acima</li>
                    <li>Clique em "<strong className="text-foreground">Verificar Registro</strong>"</li>
                    <li>Confira se os dados correspondem ao seu certificado</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3 text-foreground">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <ExternalLink className="h-5 w-5 text-purple-500" />
                    </div>
                    Verificação Externa Independente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Baixe o arquivo <strong className="text-foreground">.ots</strong> do seu certificado</li>
                    <li>Acesse <strong className="text-foreground">opentimestamps.org</strong></li>
                    <li>Faça upload do arquivo original e do .ots</li>
                    <li>A verificação é <strong className="text-foreground">pública e independente</strong> da WebMarcas</li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

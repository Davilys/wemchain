import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Hash,
  FileText,
  Clock,
  Loader2,
  Upload,
  Shield,
  AlertTriangle,
  Info,
  HelpCircle
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
  verified: boolean;
  message?: string;
  error?: string;
  hash?: string;
  details?: {
    hashAlgorithm: string;
    fileHash: string;
    protocol: string;
    blockchain: string;
    status: string;
    instructions: string;
  };
  registro?: {
    id?: string;
    nome_ativo: string;
    tipo_ativo: string;
    hash_sha256: string;
    created_at: string;
    status?: string;
  };
  transacao?: {
    tx_hash: string;
    block_number: number;
    network: string;
    timestamp_blockchain: string;
    timestamp_method?: string;
  };
  blockchain?: {
    network: string;
    method: string;
    methodDescription?: string;
    tx_hash: string;
    confirmed_at?: string;
    timestamp_blockchain?: string;
    bitcoin_anchored?: boolean;
  };
  proof?: {
    exists: boolean;
    type: string;
    bitcoin_anchored: boolean;
    note: string;
    valid_ots_format?: boolean;
    proof_size_bytes?: number;
  };
  verificationInstructions?: string;
  legal_notice?: string;
}

export default function VerificarRegistro() {
  const [verifyMode, setVerifyMode] = useState<"file" | "hash">("file");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  
  // File verification state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [otsFile, setOtsFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");
  
  // Hash verification state
  const [manualHash, setManualHash] = useState<string>("");
  
  const originalFileRef = useRef<HTMLInputElement>(null);
  const otsFileRef = useRef<HTMLInputElement>(null);

  // Generate SHA-256 hash from file
  const generateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // Handle original file selection
  const handleOriginalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      setResult(null);
      try {
        const hash = await generateHash(file);
        setFileHash(hash);
      } catch (error) {
        console.error("Error generating hash:", error);
        toast({
          title: "Erro ao processar arquivo",
          description: "Não foi possível gerar o hash do arquivo.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle OTS file selection
  const handleOtsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.ots')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo .ots válido.",
          variant: "destructive"
        });
        return;
      }
      setOtsFile(file);
      setResult(null);
    }
  };

  // Verify with OTS file
  const handleFileVerification = async () => {
    if (!originalFile || !otsFile) {
      toast({
        title: "Arquivos obrigatórios",
        description: "Por favor, selecione o arquivo original e o arquivo .ots.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call edge function to verify OTS
      const formData = new FormData();
      formData.append('otsFile', otsFile);
      formData.append('fileHash', fileHash);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-ots-proof`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          }
        }
      );

      const data = await response.json();

      setResult({
        status: data.status,
        verified: data.verified,
        message: data.message,
        hash: data.hash,
        registro: data.registro ? {
          id: data.registro.id,
          nome_ativo: data.registro.nome_ativo,
          tipo_ativo: data.registro.tipo_ativo,
          hash_sha256: data.registro.hash_sha256 || fileHash,
          created_at: data.registro.created_at,
          status: data.registro.status,
        } : undefined,
        transacao: data.blockchain ? {
          tx_hash: data.blockchain.tx_hash,
          block_number: data.blockchain.block_number || 0,
          network: data.blockchain.network,
          timestamp_blockchain: data.blockchain.timestamp_blockchain || data.blockchain.confirmed_at || "",
          timestamp_method: data.blockchain.method
        } : undefined,
        proof: data.proof,
        verificationInstructions: data.verificationInstructions,
        legal_notice: data.legal_notice,
      });

    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        status: 'NAO_ENCONTRADO',
        verified: false,
        message: "Erro ao verificar prova. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify with hash only
  const handleHashVerification = async () => {
    const hashToVerify = manualHash.trim().toLowerCase();
    
    if (!hashToVerify) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira o hash SHA-256.",
        variant: "destructive"
      });
      return;
    }

    // Validate hash format
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(hashToVerify)) {
      setResult({
        status: 'FORMATO_INVALIDO',
        verified: false,
        message: "Formato de hash inválido. O hash SHA-256 deve conter exatamente 64 caracteres hexadecimais."
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-ots-proof`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          },
          body: JSON.stringify({ hash: hashToVerify })
        }
      );

      const data = await response.json();

      setResult({
        status: data.status,
        verified: data.verified,
        message: data.message,
        hash: data.hash,
        registro: data.registro ? {
          id: data.registro.id,
          nome_ativo: data.registro.nome_ativo,
          tipo_ativo: data.registro.tipo_ativo,
          hash_sha256: data.registro.hash_sha256 || hashToVerify,
          created_at: data.registro.created_at,
          status: data.registro.status,
        } : undefined,
        transacao: data.blockchain ? {
          tx_hash: data.blockchain.tx_hash,
          block_number: data.blockchain.block_number || 0,
          network: data.blockchain.network,
          timestamp_blockchain: data.blockchain.timestamp_blockchain || data.blockchain.confirmed_at || "",
          timestamp_method: data.blockchain.method
        } : undefined,
        proof: data.proof,
        verificationInstructions: data.verificationInstructions,
        legal_notice: data.legal_notice,
      });

    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        status: 'NAO_ENCONTRADO',
        verified: false,
        message: "Erro ao verificar. Tente novamente."
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

  const resetForm = () => {
    setOriginalFile(null);
    setOtsFile(null);
    setFileHash("");
    setManualHash("");
    setResult(null);
    if (originalFileRef.current) originalFileRef.current.value = "";
    if (otsFileRef.current) otsFileRef.current.value = "";
  };

  // Render status-based result card
  const renderResultCard = () => {
    if (!result) return null;

    const status = result.status || (result.verified ? 'VERIFICADO' : 'NAO_ENCONTRADO');

    // VERIFICADO
    if (status === 'VERIFICADO') {
      return (
        <Card className="max-w-3xl mx-auto mt-8 border-2 border-green-500 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <div>
                <CardTitle className="font-display text-xl text-green-500">
                  ✔ Registro Verificado
                </CardTitle>
                <CardDescription>
                  {result.message || "Registro confirmado em blockchain pública. Prova técnica válida e imutável."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Proof Details */}
            {result.proof && (
              <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Detalhes da Verificação
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Protocolo</p>
                    <p className="font-medium text-foreground">{result.proof.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blockchain</p>
                    <p className="font-medium text-foreground">{result.proof.bitcoin_anchored ? 'Bitcoin' : 'Interno'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Confirmado
                    </Badge>
                  </div>
                </div>
                {result.hash && (
                  <div className="mt-4 pt-4 border-t border-green-500/20">
                    <p className="text-muted-foreground text-sm mb-1">Hash do Arquivo</p>
                    <code className="font-mono text-xs break-all bg-background p-2 rounded block">
                      {result.hash}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* Registro Info */}
            {result.registro && (
              <div className="bg-muted/30 rounded-xl p-6 border border-border">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Dados do Registro
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nome do Ativo</p>
                    <p className="font-medium text-foreground">{result.registro.nome_ativo}</p>
                  </div>
                  {result.registro.tipo_ativo && (
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium text-foreground capitalize">{result.registro.tipo_ativo}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Data do Registro</p>
                    <p className="font-medium text-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(result.registro.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Info */}
            {result.transacao && (
              <div className="bg-orange-400/5 rounded-xl p-6 border border-orange-400/20">
                <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-400" />
                  Prova Blockchain
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Método</p>
                    <p className="font-medium text-orange-400">
                      {result.transacao.timestamp_method === "OPEN_TIMESTAMP" ? "OpenTimestamps" : result.transacao.timestamp_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rede</p>
                    <p className="font-medium text-foreground capitalize">
                      {result.transacao.network === "opentimestamps" ? "Bitcoin" : result.transacao.network}
                    </p>
                  </div>
                  {result.transacao.timestamp_blockchain && (
                    <div>
                      <p className="text-muted-foreground">Confirmado em</p>
                      <p className="font-medium text-foreground">
                        {formatDate(result.transacao.timestamp_blockchain)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-orange-400/20">
                  <p className="text-muted-foreground text-sm mb-1">ID da Prova</p>
                  <code className="font-mono text-xs break-all bg-background p-2 rounded block">
                    {result.transacao.tx_hash}
                  </code>
                </div>
              </div>
            )}

            {/* External Verification */}
            <div className="bg-muted/30 rounded-xl p-6 border border-border">
              <h4 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Verificação Externa Independente
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {result.verificationInstructions || "Para verificação completa e independente, use as ferramentas oficiais OpenTimestamps. A WebMarcas não controla nem pode alterar este resultado."}
              </p>
              <Button variant="outline" asChild className="w-full md:w-auto">
                <a 
                  href="https://opentimestamps.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verificar em OpenTimestamps.org
                </a>
              </Button>
            </div>

            {/* Legal Notice */}
            {result.legal_notice && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Aviso Legal:</strong> {result.legal_notice}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // EM_PROCESSAMENTO
    if (status === 'EM_PROCESSAMENTO') {
      return (
        <Card className="max-w-3xl mx-auto mt-8 border-2 border-yellow-500 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-10 w-10 text-yellow-500 animate-pulse" />
              <div>
                <CardTitle className="font-display text-xl text-yellow-600">
                  ⏳ Em Processamento
                </CardTitle>
                <CardDescription>
                  {result.message || "Registro ainda em fase de ancoragem na blockchain."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {result.registro && (
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Ativo:</strong> {result.registro.nome_ativo}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // FORMATO_INVALIDO
    if (status === 'FORMATO_INVALIDO') {
      return (
        <Card className="max-w-3xl mx-auto mt-8 border-2 border-orange-500 bg-orange-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-10 w-10 text-orange-500" />
              <div>
                <CardTitle className="font-display text-xl text-orange-500">
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
      <Card className="max-w-3xl mx-auto mt-8 border-2 border-destructive bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <XCircle className="h-10 w-10 text-destructive" />
            <div>
              <CardTitle className="font-display text-xl text-destructive">
                ❌ Não Encontrado
              </CardTitle>
              <CardDescription>
                {result.message || "Nenhum registro confirmado foi localizado para este hash."}
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
                  <li>O hash pode estar incorreto ou incompleto</li>
                  <li>O arquivo pode não ter sido registrado nesta plataforma</li>
                  <li>O arquivo original pode ter sido modificado após o registro</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      {/* Hero Section - Premium Visual Identity */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Decorative overlays */}
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute inset-0 pattern-dots" />
        
        {/* Floating blurs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary/3 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 text-center">
          {/* Premium Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-up">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide">
              Verificação Independente
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 md:mb-8 leading-[1.1] animate-fade-up delay-100 tracking-tight">
            <span className="text-foreground">Verificar </span>
            <span className="text-primary text-shadow-glow">Prova de Existência</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200 px-4">
            Verifique a <span className="text-foreground font-medium">autenticidade</span> de um registro em blockchain de forma pública e independente, 
            sem necessidade de login ou intervenção da WebMarcas.
          </p>
        </div>
      </section>

      {/* Legal Disclaimer - OBRIGATÓRIO */}
      <section className="py-6 bg-orange-400/5 border-y border-orange-400/20">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <Info className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <strong>Verificação Pública:</strong> Esta verificação utiliza o protocolo público OpenTimestamps, 
              ancorado na blockchain do Bitcoin. A WebMarcas <strong>não controla</strong> nem pode alterar 
              o resultado desta verificação.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Section */}
      {/* Verification Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto card-premium border-border/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/20">
              <CardTitle className="font-display text-2xl flex items-center gap-2 text-foreground">
                <Search className="h-6 w-6 text-primary" />
                Verificar Registro
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Escolha o método de verificação abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs 
                value={verifyMode} 
                onValueChange={(v) => { 
                  setVerifyMode(v as "file" | "hash"); 
                  resetForm(); 
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Arquivo + .OTS
                  </TabsTrigger>
                  <TabsTrigger value="hash" className="gap-2">
                    <Hash className="h-4 w-4" />
                    Por Hash
                  </TabsTrigger>
                </TabsList>

                {/* File + OTS Verification */}
                <TabsContent value="file" className="mt-6 space-y-6">
                  {/* Original File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="original-file">Arquivo Original</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => originalFileRef.current?.click()}
                    >
                      <input
                        ref={originalFileRef}
                        id="original-file"
                        type="file"
                        className="hidden"
                        onChange={handleOriginalFileChange}
                      />
                      {originalFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-foreground">{originalFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(originalFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            Clique para selecionar o arquivo original
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, PNG, DOC, MP4, ZIP
                          </p>
                        </>
                      )}
                    </div>
                    {fileHash && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Hash SHA-256 gerado:</p>
                        <code className="font-mono text-xs break-all text-foreground">{fileHash}</code>
                      </div>
                    )}
                  </div>

                  {/* OTS File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="ots-file">Arquivo de Prova (.ots)</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => otsFileRef.current?.click()}
                    >
                      <input
                        ref={otsFileRef}
                        id="ots-file"
                        type="file"
                        accept=".ots"
                        className="hidden"
                        onChange={handleOtsFileChange}
                      />
                      {otsFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <Shield className="h-8 w-8 text-orange-400" />
                          <div className="text-left">
                            <p className="font-medium text-foreground">{otsFile.name}</p>
                            <p className="text-sm text-muted-foreground">Arquivo OpenTimestamps</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            Clique para selecionar o arquivo .ots
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Arquivo de prova OpenTimestamps
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={handleFileVerification} 
                    disabled={loading || !originalFile || !otsFile} 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 btn-premium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Verificar Prova
                      </>
                    )}
                  </Button>
                </TabsContent>

                {/* Hash Only Verification */}
                <TabsContent value="hash" className="mt-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hash-input">Hash SHA-256 do arquivo</Label>
                    <Input
                      id="hash-input"
                      placeholder="Ex: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
                      value={manualHash}
                      onChange={(e) => setManualHash(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      O hash está no seu certificado digital ou pode ser gerado a partir do arquivo original
                    </p>
                  </div>

                  <Button 
                    onClick={handleHashVerification} 
                    disabled={loading || !manualHash.trim()} 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 btn-premium"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Verificar Hash
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results */}
          {renderResultCard()}
        </div>
      </section>

      {/* How to Verify Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial-bottom" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                Como <span className="text-primary text-shadow-glow">Verificar</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Três níveis de verificação para máxima transparência e segurança jurídica
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level 1 */}
              <Card className="card-premium border-border/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle className="text-lg text-foreground">Verificação Interna</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Hash salvo no sistema WebMarcas</li>
                    <li>• Certificado emitido</li>
                    <li>• Arquivo .ots armazenado</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Level 2 */}
              <Card className="card-premium border-primary/30 bg-primary/5">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <CardTitle className="text-lg text-foreground">Verificação Técnica</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Download do arquivo .ots</li>
                    <li>• Verificação em opentimestamps.org</li>
                    <li>• Sem login, sem custo</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Level 3 */}
              <Card className="card-premium border-orange-500/30 bg-orange-500/5">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-orange-500">3</span>
                  </div>
                  <CardTitle className="text-lg text-foreground">Verificação Externa</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-2">
                    <li>• Qualquer perito pode verificar</li>
                    <li>• Confirma ancoragem no Bitcoin</li>
                    <li>• Confirma data e integridade</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Notice Section */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-t from-muted/30 to-transparent border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="h-14 w-14 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="font-display text-xl font-extrabold text-foreground mb-4 tracking-tight">
              Blindagem <span className="text-primary">Jurídica</span>
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                A WebMarcas <strong className="text-foreground">não controla a blockchain</strong>, 
                <strong className="text-foreground"> não gera a data</strong> e 
                <strong className="text-foreground"> não pode alterar o registro</strong>.
              </p>
              <p>
                A prova é <strong className="text-foreground">técnica</strong>, 
                <strong className="text-foreground"> pública</strong>, 
                <strong className="text-foreground"> imutável</strong> e 
                <strong className="text-foreground"> auditável</strong>.
              </p>
              <p className="pt-4 border-t border-border/50">
                Este registro constitui prova técnica de anterioridade. <strong>Não substitui</strong> o 
                registro de marca junto ao INPI (Instituto Nacional da Propriedade Industrial).
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

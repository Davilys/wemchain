import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VerificationResult {
  verified: boolean;
  message?: string;
  error?: string;
  details?: {
    hashAlgorithm: string;
    fileHash: string;
    protocol: string;
    blockchain: string;
    status: string;
    instructions: string;
  };
  // Database lookup results
  registro?: {
    nome_ativo: string;
    tipo_ativo: string;
    hash_sha256: string;
    created_at: string;
  };
  transacao?: {
    tx_hash: string;
    block_number: number;
    network: string;
    timestamp_blockchain: string;
    timestamp_method?: string;
  };
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

      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-ots-proof`,
        {
          method: 'POST',
          body: formData,
          headers: session?.access_token ? {
            'Authorization': `Bearer ${session.access_token}`
          } : {}
        }
      );

      const otsResult = await response.json();

      // Also check database for registro info
      const { data: registro } = await supabase
        .from("registros")
        .select(`
          nome_ativo,
          tipo_ativo,
          hash_sha256,
          created_at,
          transacoes_blockchain (
            tx_hash,
            block_number,
            network,
            timestamp_blockchain,
            timestamp_method
          )
        `)
        .eq("hash_sha256", fileHash)
        .eq("status", "confirmado")
        .maybeSingle();

      if (registro) {
        const transacao = Array.isArray(registro.transacoes_blockchain) 
          ? registro.transacoes_blockchain[0] 
          : registro.transacoes_blockchain;

        setResult({
          ...otsResult,
          registro: {
            nome_ativo: registro.nome_ativo,
            tipo_ativo: registro.tipo_ativo,
            hash_sha256: registro.hash_sha256 || "",
            created_at: registro.created_at
          },
          transacao: transacao ? {
            tx_hash: transacao.tx_hash,
            block_number: transacao.block_number || 0,
            network: transacao.network,
            timestamp_blockchain: transacao.timestamp_blockchain || "",
            timestamp_method: transacao.timestamp_method
          } : undefined
        });
      } else {
        setResult(otsResult);
      }

    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        verified: false,
        error: "Erro ao verificar prova. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify with hash only
  const handleHashVerification = async () => {
    const hashToVerify = manualHash.trim();
    
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
      toast({
        title: "Hash inválido",
        description: "O hash deve ter 64 caracteres hexadecimais (SHA-256).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data: registro, error } = await supabase
        .from("registros")
        .select(`
          nome_ativo,
          tipo_ativo,
          hash_sha256,
          created_at,
          transacoes_blockchain (
            tx_hash,
            block_number,
            network,
            timestamp_blockchain,
            timestamp_method
          )
        `)
        .eq("hash_sha256", hashToVerify)
        .eq("status", "confirmado")
        .maybeSingle();

      if (error) throw error;

      if (registro) {
        const transacao = Array.isArray(registro.transacoes_blockchain) 
          ? registro.transacoes_blockchain[0] 
          : registro.transacoes_blockchain;
        
        setResult({
          verified: true,
          message: "Registro encontrado e verificado!",
          registro: {
            nome_ativo: registro.nome_ativo,
            tipo_ativo: registro.tipo_ativo,
            hash_sha256: registro.hash_sha256 || "",
            created_at: registro.created_at
          },
          transacao: transacao ? {
            tx_hash: transacao.tx_hash,
            block_number: transacao.block_number || 0,
            network: transacao.network,
            timestamp_blockchain: transacao.timestamp_blockchain || "",
            timestamp_method: transacao.timestamp_method
          } : undefined
        });
      } else {
        setResult({
          verified: false,
          error: "Nenhum registro confirmado encontrado com este hash."
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        verified: false,
        error: "Erro ao verificar. Tente novamente."
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

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 mb-4">
            <Shield className="h-3 w-3 mr-1" />
            Verificação Independente
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Verificar <span className="text-secondary">Prova de Existência</span>
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Verifique a autenticidade de um registro em blockchain de forma pública e independente, 
            sem necessidade de login ou intervenção da WebMarcas.
          </p>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-6 bg-orange-400/5 border-y border-orange-400/20">
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <Info className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              <strong>Verificação Pública:</strong> Esta verificação utiliza o protocolo público OpenTimestamps, 
              ancorado na blockchain do Bitcoin. A WebMarcas <strong>não controla</strong> nem pode alterar 
              o resultado desta verificação. A prova é técnica, pública, imutável e auditável.
            </p>
          </div>
        </div>
      </section>

      {/* Verification Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle className="font-display text-2xl flex items-center gap-2">
                <Search className="h-6 w-6 text-secondary" />
                Verificar Registro
              </CardTitle>
              <CardDescription>
                Escolha o método de verificação abaixo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={verifyMode} onValueChange={(v) => { setVerifyMode(v as "file" | "hash"); resetForm(); }}>
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
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-secondary/50 transition-colors"
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
                          <FileText className="h-8 w-8 text-secondary" />
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
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-secondary/50 transition-colors"
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
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
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
          {result && (
            <Card className={`max-w-3xl mx-auto mt-8 border-2 ${
              result.verified ? "border-success bg-success/5" : "border-destructive bg-destructive/5"
            }`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {result.verified ? (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-success" />
                      <div>
                        <CardTitle className="font-display text-xl text-success">
                          ✓ Prova Válida
                        </CardTitle>
                        <CardDescription>
                          {result.message || "A prova de existência foi verificada com sucesso"}
                        </CardDescription>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-10 w-10 text-destructive" />
                      <div>
                        <CardTitle className="font-display text-xl text-destructive">
                          ✗ Verificação Falhou
                        </CardTitle>
                        <CardDescription>
                          {result.error || "Não foi possível verificar a prova"}
                        </CardDescription>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>

              {result.verified && (
                <CardContent className="space-y-6">
                  {/* Verification Details */}
                  {result.details && (
                    <div className="bg-success/10 rounded-xl p-6 border border-success/20">
                      <h4 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-success" />
                        Detalhes da Verificação
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Protocolo</p>
                          <p className="font-medium text-foreground">{result.details.protocol}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Blockchain</p>
                          <p className="font-medium text-foreground">{result.details.blockchain}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Algoritmo</p>
                          <p className="font-medium text-foreground">{result.details.hashAlgorithm}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <Badge className="bg-success/10 text-success border-success/20">
                            {result.details.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-success/20">
                        <p className="text-muted-foreground text-sm mb-1">Hash do Arquivo</p>
                        <code className="font-mono text-xs break-all bg-background p-2 rounded block">
                          {result.details.fileHash}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Registro Info from Database */}
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
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p className="font-medium text-foreground capitalize">{result.registro.tipo_ativo}</p>
                        </div>
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
                      Para verificação completa e independente, use as ferramentas oficiais OpenTimestamps. 
                      A WebMarcas não controla nem pode alterar este resultado.
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
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </section>

      {/* How to Verify Section */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Como Verificar
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Três níveis de verificação para máxima transparência e segurança jurídica
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Level 1 */}
              <Card className="border-border/50">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <CardTitle className="text-lg">Verificação Interna</CardTitle>
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
              <Card className="border-secondary/50 bg-secondary/5">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-secondary">2</span>
                  </div>
                  <CardTitle className="text-lg">Verificação Técnica</CardTitle>
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
              <Card className="border-orange-400/50 bg-orange-400/5">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-orange-400/10 flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-orange-400">3</span>
                  </div>
                  <CardTitle className="text-lg">Verificação Externa</CardTitle>
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
      <section className="py-16 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <AlertTriangle className="h-10 w-10 text-orange-400 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-4">
              Blindagem Jurídica
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
              <p className="pt-4 border-t border-border">
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

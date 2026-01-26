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
  Shield
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VerificationResult {
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
        description: "Por favor, insira o hash ou ID da transação.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Use the public verify-timestamp edge function (no auth required)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const params = new URLSearchParams({ hash: searchValue.trim().toLowerCase() });
      
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na verificação");
      }

      const data: VerificationResult = await response.json();
      setResult(data);
      
    } catch (error) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro na verificação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao verificar. Tente novamente.",
        variant: "destructive"
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

  const getVerificationUrl = (txHash: string, network: string) => {
    if (network === "opentimestamps") {
      return "https://opentimestamps.org";
    }
    return `https://polygonscan.com/tx/${txHash}`;
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-gradient-hero py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Verificação Pública</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Verificar <span className="text-primary">Certificado</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Confirme a autenticidade de um registro em blockchain
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto card-premium">
            <CardHeader>
              <CardTitle className="text-2xl tracking-tight">Verificar Registro</CardTitle>
              <CardDescription>
                Insira o hash SHA-256 do arquivo para verificar seu registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hash" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Hash SHA-256 do arquivo
                </Label>
                <Input
                  id="hash"
                  placeholder="Ex: 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  O hash está no seu certificado digital ou pode ser gerado a partir do arquivo original
                </p>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verificar Registro
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className={`max-w-2xl mx-auto mt-8 border-2 ${
              result.found ? "border-green-500 bg-green-500/5" : "border-destructive bg-destructive/5"
            }`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {result.found ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                      <div>
                        <CardTitle className="text-xl text-green-500 tracking-tight">
                          Registro Verificado
                        </CardTitle>
                        <CardDescription>
                          Este registro existe na blockchain e é válido
                        </CardDescription>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-destructive" />
                      <div>
                        <CardTitle className="text-xl text-destructive tracking-tight">
                          Registro Não Encontrado
                        </CardTitle>
                        <CardDescription>
                          Não encontramos nenhum registro com esses dados
                        </CardDescription>
                      </div>
                    </>
                  )}
                </div>
              </CardHeader>

              {result.found && (
                <CardContent className="space-y-6">
                  {result.registro && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Dados do Registro</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nome do Ativo:</span>
                          <p className="font-medium">{result.registro.nome_ativo}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <p className="font-medium capitalize">{result.registro.tipo_ativo}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">Hash SHA-256:</span>
                          <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                            {result.hash}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Registrado em:</span>
                          <p className="font-medium">{formatDate(result.registro.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.blockchain && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-foreground">Dados da Blockchain</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rede:</span>
                          <p className="font-medium">{result.blockchain.methodDescription}</p>
                        </div>
                        {result.blockchain.block_number && (
                          <div>
                            <span className="text-muted-foreground">Bloco:</span>
                            <p className="font-medium">{result.blockchain.block_number}</p>
                          </div>
                        )}
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">ID da Transação:</span>
                          <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                            {result.blockchain.tx_hash}
                          </p>
                        </div>
                        {result.blockchain.confirmed_at && (
                          <div className="md:col-span-2 flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Confirmado na blockchain em: {formatDate(result.blockchain.confirmed_at)}</span>
                          </div>
                        )}
                      </div>
                      
                      {result.blockchain.network === "polygon" ? (
                        <Button variant="outline" asChild className="w-full mt-4 rounded-xl">
                          <a 
                            href={getVerificationUrl(result.blockchain.tx_hash, result.blockchain.network)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Ver na Blockchain (PolygonScan)
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      ) : (
                        <div className="w-full mt-4 p-3 bg-muted rounded-xl text-center text-sm text-muted-foreground">
                          <Shield className="h-4 w-4 inline-block mr-2" />
                          {result.verificationInstructions || "Verificado via OpenTimestamps (ancorado no Bitcoin)"}
                        </div>
                      )}

                      {result.legal_notice && (
                        <div className="w-full mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-xs text-muted-foreground">
                          <strong>Aviso Legal:</strong> {result.legal_notice}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )}
        </div>
      </section>

      {/* How to Verify */}
      <section className="py-20 md:py-28 bg-card border-y border-border/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                Como Verificar
              </h2>
            </div>

            <div className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Hash className="h-4 w-4 text-blue-500" />
                    </div>
                    Verificação por Hash
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Localize o hash SHA-256 no seu certificado digital</li>
                    <li>Cole o hash no campo de busca acima</li>
                    <li>Clique em "Verificar Registro"</li>
                    <li>Confira se os dados correspondem ao seu certificado</li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-purple-500" />
                    </div>
                    Verificação Externa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Para registros Polygon, você pode verificar diretamente no PolygonScan</li>
                    <li>Para OpenTimestamps, acesse opentimestamps.org</li>
                    <li>O ID da transação está no seu certificado digital</li>
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

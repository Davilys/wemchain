import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Hash,
  FileText,
  Clock,
  Loader2,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface VerificationResult {
  found: boolean;
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
  };
}

export default function Verificar() {
  const [searchType, setSearchType] = useState<"hash" | "txid">("hash");
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
      if (searchType === "hash") {
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
              timestamp_blockchain
            )
          `)
          .eq("hash_sha256", searchValue.trim())
          .eq("status", "confirmado")
          .maybeSingle();

        if (error) throw error;

        if (registro) {
          const transacao = Array.isArray(registro.transacoes_blockchain) 
            ? registro.transacoes_blockchain[0] 
            : registro.transacoes_blockchain;
          
          setResult({
            found: true,
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
              timestamp_blockchain: transacao.timestamp_blockchain || ""
            } : undefined
          });
        } else {
          setResult({ found: false });
        }
      } else {
        const { data: transacao, error } = await supabase
          .from("transacoes_blockchain")
          .select(`
            tx_hash,
            block_number,
            network,
            timestamp_blockchain,
            registros (
              nome_ativo,
              tipo_ativo,
              hash_sha256,
              created_at
            )
          `)
          .eq("tx_hash", searchValue.trim())
          .maybeSingle();

        if (error) throw error;

        if (transacao) {
          const registro = Array.isArray(transacao.registros) 
            ? transacao.registros[0] 
            : transacao.registros;

          setResult({
            found: true,
            registro: registro ? {
              nome_ativo: registro.nome_ativo,
              tipo_ativo: registro.tipo_ativo,
              hash_sha256: registro.hash_sha256 || "",
              created_at: registro.created_at
            } : undefined,
            transacao: {
              tx_hash: transacao.tx_hash,
              block_number: transacao.block_number || 0,
              network: transacao.network,
              timestamp_blockchain: transacao.timestamp_blockchain || ""
            }
          });
        } else {
          setResult({ found: false });
        }
      }
    } catch (error) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro na verificação",
        description: "Ocorreu um erro ao verificar. Tente novamente.",
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

  const getPolygonScanUrl = (txHash: string) => {
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
                Insira o hash do arquivo ou o ID da transação blockchain para verificar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "hash" | "txid")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="hash" className="gap-2">
                    <Hash className="h-4 w-4" />
                    Por Hash
                  </TabsTrigger>
                  <TabsTrigger value="txid" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Por TXID
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hash" className="mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="hash">Hash SHA-256 do arquivo</Label>
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
                </TabsContent>

                <TabsContent value="txid" className="mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="txid">ID da Transação (TXID)</Label>
                    <Input
                      id="txid"
                      placeholder="Ex: 0x1234567890abcdef..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      O TXID está no seu certificado digital
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

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
                            {result.registro.hash_sha256}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Registrado em:</span>
                          <p className="font-medium">{formatDate(result.registro.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.transacao && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-foreground">Dados da Blockchain</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rede:</span>
                          <p className="font-medium capitalize">{result.transacao.network}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Bloco:</span>
                          <p className="font-medium">{result.transacao.block_number}</p>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-muted-foreground">ID da Transação:</span>
                          <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                            {result.transacao.tx_hash}
                          </p>
                        </div>
                        {result.transacao.timestamp_blockchain && (
                          <div className="md:col-span-2 flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Confirmado na blockchain em: {formatDate(result.transacao.timestamp_blockchain)}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button variant="outline" asChild className="w-full mt-4 rounded-xl">
                        <a 
                          href={getPolygonScanUrl(result.transacao.tx_hash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Ver na Blockchain (PolygonScan)
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
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
                      <FileText className="h-4 w-4 text-purple-500" />
                    </div>
                    Verificação por TXID
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Localize o ID da Transação (TXID) no seu certificado</li>
                    <li>Cole o TXID no campo de busca</li>
                    <li>Você também pode verificar diretamente no PolygonScan</li>
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

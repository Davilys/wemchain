import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Loader2,
  Shield,
  Hash,
  ArrowRight,
  X,
  File,
  Image,
  FileVideo,
  FileArchive
} from "lucide-react";

const tiposAtivo = [
  { value: "marca", label: "Marca" },
  { value: "logotipo", label: "Logotipo" },
  { value: "obra_autoral", label: "Obra Autoral" },
  { value: "documento", label: "Documento" },
  { value: "outro", label: "Outro" },
];

const acceptedTypes = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg,.jpeg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "video/mp4": ".mp4",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
};

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return FileVideo;
  if (type.includes("zip")) return FileArchive;
  return FileText;
};

export default function NovoRegistro() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [nomeAtivo, setNomeAtivo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoAtivo, setTipoAtivo] = useState("marca");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hashLoading, setHashLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Generate SHA-256 hash from file
  const generateHash = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 10MB.",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setHashLoading(true);

    try {
      const fileHash = await generateHash(selectedFile);
      setHash(fileHash);
    } catch (error) {
      console.error("Erro ao gerar hash:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível gerar o hash do arquivo.",
        variant: "destructive"
      });
    } finally {
      setHashLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setHash(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !hash || !user) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos e selecione um arquivo.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Upload file to storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("registros")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create registro record
      const { data: registro, error: registroError } = await supabase
        .from("registros")
        .insert({
          user_id: user.id,
          nome_ativo: nomeAtivo.trim(),
          descricao: descricao.trim() || null,
          tipo_ativo: tipoAtivo as any,
          arquivo_path: filePath,
          arquivo_nome: file.name,
          arquivo_tamanho: file.size,
          hash_sha256: hash,
          status: "pendente" as any,
        })
        .select()
        .single();

      if (registroError) throw registroError;

      toast({
        title: "Registro criado!",
        description: "Seu registro foi criado. Prossiga para o pagamento.",
      });

      // Navigate to payment
      navigate(`/pagamento/${registro.id}`);
    } catch (error: any) {
      console.error("Erro ao criar registro:", error);
      toast({
        title: "Erro ao criar registro",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Novo Registro</h1>
            <p className="font-body text-muted-foreground">
              Registre sua marca, logotipo ou documento em blockchain com prova de anterioridade.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
              <span className="font-body font-medium text-sm hidden sm:inline">Upload</span>
            </div>
            <div className="h-px w-8 bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">2</div>
              <span className="font-body text-muted-foreground text-sm hidden sm:inline">Pagamento</span>
            </div>
            <div className="h-px w-8 bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">3</div>
              <span className="font-body text-muted-foreground text-sm hidden sm:inline">Blockchain</span>
            </div>
            <div className="h-px w-8 bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">4</div>
              <span className="font-body text-muted-foreground text-sm hidden sm:inline">Certificado</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* File Upload */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload do Arquivo
                  </CardTitle>
                  <CardDescription className="font-body">
                    Envie o arquivo que deseja registrar. Formatos: PDF, JPG, PNG, SVG, DOC, DOCX, MP4, ZIP (máx. 10MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!file ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-body font-medium mb-1">Clique para selecionar ou arraste o arquivo</p>
                        <p className="font-body text-sm text-muted-foreground">PDF, JPG, PNG, SVG, DOC, DOCX, MP4, ZIP</p>
                      </div>
                      <input
                        type="file"
                        accept={Object.values(acceptedTypes).join(",")}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            {(() => {
                              const Icon = getFileIcon(file.type);
                              return <Icon className="h-6 w-6 text-primary" />;
                            })()}
                          </div>
                          <div>
                            <p className="font-body font-medium truncate max-w-[200px] sm:max-w-[300px]">{file.name}</p>
                            <p className="font-body text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Hash Display */}
                      {hashLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="font-body text-sm">Gerando hash SHA-256...</span>
                        </div>
                      ) : hash && (
                        <div className="p-4 rounded-lg border border-success/30 bg-success/5">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="font-body font-medium text-sm text-success">Hash SHA-256 gerado</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <code className="font-mono text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                              {hash}
                            </code>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Asset Details */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Dados do Ativo
                  </CardTitle>
                  <CardDescription className="font-body">
                    Informe os detalhes do ativo que está registrando
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomeAtivo" className="font-body font-medium">Nome do Ativo *</Label>
                      <Input
                        id="nomeAtivo"
                        placeholder="Ex: Logo da Minha Empresa"
                        value={nomeAtivo}
                        onChange={(e) => setNomeAtivo(e.target.value)}
                        className="font-body"
                        required
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoAtivo" className="font-body font-medium">Tipo de Ativo *</Label>
                      <Select value={tipoAtivo} onValueChange={setTipoAtivo}>
                        <SelectTrigger className="font-body">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposAtivo.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value} className="font-body">
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao" className="font-body font-medium">Descrição (opcional)</Label>
                    <Textarea
                      id="descricao"
                      placeholder="Descreva brevemente o ativo..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      className="font-body resize-none"
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold mb-1">O que acontece a seguir?</h4>
                      <p className="font-body text-sm text-muted-foreground">
                        Após o pagamento, o hash do seu arquivo será registrado na blockchain Polygon, 
                        gerando um certificado digital com timestamp imutável como prova de anterioridade.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold py-6"
                disabled={loading || !file || !hash || !nomeAtivo.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Continuar para Pagamento
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

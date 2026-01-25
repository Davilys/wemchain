import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
  ArrowLeft,
  X,
  File,
  Image,
  FileVideo,
  FileArchive,
  Lock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

// File type categories
const fileCategories = [
  { 
    id: "documento", 
    label: "Documento", 
    icon: FileText, 
    description: "PDF, DOC, DOCX",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10"
  },
  { 
    id: "imagem", 
    label: "Imagem", 
    icon: Image, 
    description: "JPG, PNG, SVG",
    color: "text-green-400",
    bgColor: "bg-green-400/10"
  },
  { 
    id: "video", 
    label: "Vídeo", 
    icon: FileVideo, 
    description: "MP4",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10"
  },
  { 
    id: "outro", 
    label: "Outros", 
    icon: FileArchive, 
    description: "ZIP e outros",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10"
  },
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

const steps = [
  { id: 1, label: "Tipo", shortLabel: "Tipo" },
  { id: 2, label: "Upload", shortLabel: "Upload" },
  { id: 3, label: "Confirmação", shortLabel: "Confirmar" },
];

export default function NovoRegistro() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [fileCategory, setFileCategory] = useState<string | null>(null);
  const [nomeAtivo, setNomeAtivo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hashLoading, setHashLoading] = useState(false);
  const [acceptLegalTerms, setAcceptLegalTerms] = useState(false);
  const [loading, setLoading] = useState(false);

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
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(Math.min(progress, 90));
      if (progress >= 90) clearInterval(interval);
    }, 100);

    try {
      const fileHash = await generateHash(selectedFile);
      setHash(fileHash);
      setUploadProgress(100);
    } catch (error) {
      console.error("Erro ao gerar hash:", error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível gerar o hash do arquivo.",
        variant: "destructive"
      });
      setUploadProgress(0);
    } finally {
      setHashLoading(false);
      clearInterval(interval);
    }
  };

  const removeFile = () => {
    setFile(null);
    setHash(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const nextStep = () => {
    if (currentStep === 1 && !fileCategory) {
      toast({
        title: "Selecione o tipo",
        description: "Por favor, escolha o tipo de arquivo que deseja registrar.",
        variant: "destructive"
      });
      return;
    }
    if (currentStep === 2 && (!file || !hash || !nomeAtivo.trim())) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, faça upload do arquivo e preencha o nome do ativo.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!file || !hash || !user || !acceptLegalTerms) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, confirme o aviso jurídico antes de continuar.",
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

      // 2. Map file category to tipo_ativo
      const tipoAtivoMap: Record<string, string> = {
        "documento": "documento",
        "imagem": "logotipo",
        "video": "obra_autoral",
        "outro": "outro"
      };

      // 3. Create registro record
      const { data: registro, error: registroError } = await supabase
        .from("registros")
        .insert({
          user_id: user.id,
          nome_ativo: nomeAtivo.trim(),
          descricao: descricao.trim() || null,
          tipo_ativo: (tipoAtivoMap[fileCategory || "outro"] || "outro") as any,
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
        title: "Registro criado com sucesso!",
        description: "Prossiga para o pagamento para concluir.",
      });

      // Navigate to processing/payment
      navigate(`/processando/${registro.id}`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Novo Registro</h1>
          <p className="font-body text-muted-foreground">
            Registre sua marca, logotipo ou documento em blockchain
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep >= step.id 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className={cn(
                  "font-body text-xs mt-2 hidden sm:block",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "h-0.5 w-12 sm:w-20 mx-2",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: File Type Selection */}
      {currentStep === 1 && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Que tipo de arquivo você deseja registrar?</CardTitle>
            <CardDescription className="font-body">
              Escolha a categoria que melhor descreve seu arquivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fileCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setFileCategory(category.id)}
                  className={cn(
                    "p-6 rounded-xl border-2 transition-all text-left hover:border-primary/50",
                    fileCategory === category.id 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card hover:bg-muted/50"
                  )}
                >
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4", category.bgColor)}>
                    <category.icon className={cn("h-6 w-6", category.color)} />
                  </div>
                  <h3 className="font-body font-semibold text-foreground mb-1">{category.label}</h3>
                  <p className="font-body text-xs text-muted-foreground">{category.description}</p>
                </button>
              ))}
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
              <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-body text-sm font-medium text-foreground">Seu arquivo é privado</p>
                <p className="font-body text-xs text-muted-foreground">
                  O arquivo fica armazenado com segurança. Apenas o hash criptográfico é registrado na blockchain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Upload & Details */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* File Upload */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload do Arquivo
              </CardTitle>
              <CardDescription className="font-body">
                Arraste ou clique para selecionar o arquivo (máx. 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 hover:bg-muted/30 transition-all">
                    <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="font-body font-medium text-foreground mb-2">
                      Clique para selecionar ou arraste o arquivo
                    </p>
                    <p className="font-body text-sm text-muted-foreground">
                      PDF, JPG, PNG, SVG, DOC, DOCX, MP4, ZIP
                    </p>
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
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        {(() => {
                          const Icon = getFileIcon(file.type);
                          return <Icon className="h-7 w-7 text-primary" />;
                        })()}
                      </div>
                      <div>
                        <p className="font-body font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                          {file.name}
                        </p>
                        <p className="font-body text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-body text-muted-foreground">Processando...</span>
                        <span className="font-body text-muted-foreground">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}

                  {/* Hash Display */}
                  {hashLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground p-4 rounded-lg bg-muted/30">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-body text-sm">Gerando hash SHA-256...</span>
                    </div>
                  ) : hash && (
                    <div className="p-4 rounded-xl border border-success/30 bg-success/5">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        <span className="font-body font-medium text-success">Hash gerado com sucesso!</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                        <code className="font-mono text-xs bg-muted p-3 rounded-lg flex-1 overflow-x-auto break-all">
                          {hash}
                        </code>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-3">
                        Esta é a "impressão digital" única do seu arquivo. Ela será registrada na blockchain.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Asset Details */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Dados do Ativo
              </CardTitle>
              <CardDescription className="font-body">
                Informe os detalhes para identificação do registro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeAtivo" className="font-body font-medium">Nome do Ativo *</Label>
                <Input
                  id="nomeAtivo"
                  placeholder="Ex: Logo da Minha Empresa"
                  value={nomeAtivo}
                  onChange={(e) => setNomeAtivo(e.target.value)}
                  className="font-body bg-background border-border"
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao" className="font-body font-medium">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva brevemente o ativo..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="font-body resize-none bg-background border-border"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Legal Confirmation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Resumo do Registro</CardTitle>
              <CardDescription className="font-body">
                Confira os dados antes de confirmar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-body text-sm text-muted-foreground mb-1">Nome do Ativo</p>
                  <p className="font-body font-medium text-foreground">{nomeAtivo}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-body text-sm text-muted-foreground mb-1">Arquivo</p>
                  <p className="font-body font-medium text-foreground truncate">{file?.name}</p>
                </div>
              </div>
              {descricao && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-body text-sm text-muted-foreground mb-1">Descrição</p>
                  <p className="font-body text-foreground">{descricao}</p>
                </div>
              )}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-body text-sm text-muted-foreground mb-1">Hash SHA-256</p>
                <code className="font-mono text-xs break-all text-foreground">{hash}</code>
              </div>
            </CardContent>
          </Card>

          {/* Legal Warning */}
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-semibold text-foreground mb-2">Aviso Jurídico Importante</h4>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Este registro em blockchain comprova a existência e integridade do arquivo na data indicada, 
                    como prova técnica de anterioridade, <strong className="text-foreground">não substituindo o registro de marca junto ao INPI</strong>.
                  </p>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="legalTerms"
                      checked={acceptLegalTerms}
                      onCheckedChange={(checked) => setAcceptLegalTerms(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="legalTerms" className="font-body text-sm leading-relaxed cursor-pointer text-foreground">
                      Estou ciente de que este serviço não substitui o registro no INPI e compreendo que 
                      o registro em blockchain serve como prova complementar de anterioridade.
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Happens Next */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground mb-2">O que acontece a seguir?</h4>
                  <ol className="font-body text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">1</span>
                      Seu arquivo será processado e o hash será preparado
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">2</span>
                      Você será direcionado para o pagamento
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">3</span>
                      Após confirmação, o hash será registrado na blockchain Polygon
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">4</span>
                      Você receberá o certificado digital com TXID
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            className="font-body border-border"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold"
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !acceptLegalTerms}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Confirmar e Prosseguir
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NoCreditModal } from "@/components/credits/NoCreditModal";
import { CreditConsumptionInfo } from "@/components/credits/CreditConsumptionInfo";
import { AuthorsList } from "@/components/registro/AuthorsList";
import { Author } from "@/components/registro/AddAuthorModal";
import { 
  Upload, 
  CheckCircle2, 
  Loader2,
  Shield,
  Hash,
  ArrowLeft,
  X,
  File,
  Lock,
  AlertTriangle,
  Coins,
  Globe,
  EyeOff,
  Info
} from "lucide-react";

const acceptedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "application/zip",
  "application/x-zip-compressed",
];

const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "imagem";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.includes("zip")) return "outro";
  return "documento";
};

const getTipoAtivo = (category: string): string => {
  const map: Record<string, string> = {
    documento: "documento",
    imagem: "logotipo",
    video: "obra_autoral",
    outro: "outro",
  };
  return map[category] || "outro";
};

interface UserProfile {
  full_name: string | null;
  cpf_cnpj: string | null;
}

export default function NovoRegistro() {
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [nomeAtivo, setNomeAtivo] = useState("");
  const [hash, setHash] = useState<string | null>(null);
  const [hashLoading, setHashLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNoCreditModal, setShowNoCreditModal] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  
  // Author state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [coauthors, setCoauthors] = useState<Author[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch user profile for primary author
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, cpf_cnpj")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const hasCredits = (credits?.available_credits || 0) > 0;

  // Primary author derived from profile
  const primaryAuthor: Omit<Author, "id" | "display_order"> | null = profile?.full_name 
    ? {
        name: profile.full_name,
        email: user?.email || "",
        document_type: (profile.cpf_cnpj?.replace(/\D/g, "").length || 0) > 11 ? "CNPJ" : "CPF",
        document_number: profile.cpf_cnpj?.replace(/\D/g, "") || "",
        role: "PRIMARY",
      }
    : null;

  const generateHash = useCallback(async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 10MB.",
        variant: "destructive"
      });
      return;
    }

    if (!acceptedTypes.includes(selectedFile.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Envie PDF, JPG, PNG, DOC, DOCX, MP4 ou ZIP.",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    setNomeAtivo(selectedFile.name.replace(/\.[^/.]+$/, ""));
    setHashLoading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 15, 90));
    }, 100);

    try {
      const fileHash = await generateHash(selectedFile);
      setHash(fileHash);
      setUploadProgress(100);
    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível gerar o hash.",
        variant: "destructive"
      });
      setUploadProgress(0);
      setFile(null);
    } finally {
      setHashLoading(false);
      clearInterval(interval);
    }
  };

  const removeFile = () => {
    setFile(null);
    setHash(null);
    setNomeAtivo("");
    setUploadProgress(0);
    setAcceptTerms(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async () => {
    if (!file || !hash || !user || !acceptTerms || !nomeAtivo.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos e aceite os termos.",
        variant: "destructive"
      });
      return;
    }

    if (!primaryAuthor) {
      toast({
        title: "Perfil incompleto",
        description: "Complete seu perfil com nome e documento antes de registrar.",
        variant: "destructive"
      });
      return;
    }

    if (!hasCredits) {
      setShowNoCreditModal(true);
      return;
    }

    setLoading(true);

    try {
      // Upload file
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("registros")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const category = getFileCategory(file.type);

      // Create registro
      const { data: registro, error: registroError } = await supabase
        .from("registros")
        .insert({
          user_id: user.id,
          nome_ativo: nomeAtivo.trim(),
          tipo_ativo: getTipoAtivo(category) as any,
          arquivo_path: filePath,
          arquivo_nome: file.name,
          arquivo_tamanho: file.size,
          hash_sha256: hash,
          status: "pendente" as any,
        })
        .select()
        .single();

      if (registroError) throw registroError;

      // Insert authors (primary + coauthors)
      const authorsToInsert = [
        {
          registro_id: registro.id,
          name: primaryAuthor.name,
          email: primaryAuthor.email,
          document_type: primaryAuthor.document_type,
          document_number: primaryAuthor.document_number,
          role: "PRIMARY",
          display_order: 0,
        },
        ...coauthors.map((author, index) => ({
          registro_id: registro.id,
          name: author.name,
          email: author.email,
          document_type: author.document_type,
          document_number: author.document_number,
          role: "COAUTHOR",
          display_order: index + 1,
        })),
      ];

      const { error: authorsError } = await supabase
        .from("record_authors")
        .insert(authorsToInsert);

      if (authorsError) throw authorsError;

      toast({
        title: "Registro criado!",
        description: "Seu arquivo está sendo processado.",
      });

      navigate(`/processando/${registro.id}`);
    } catch (error: any) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao criar registro",
        description: error.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || creditsLoading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Novo Registro de Propriedade
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              Registre seu arquivo em blockchain com prova de anterioridade. <span className="font-medium text-primary">Este registro consumirá 1 crédito.</span>
            </p>
          </div>
        </div>

        {/* No Credits Warning */}
        {!hasCredits && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-warning">
                    Você não possui créditos
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Adquira créditos para continuar registrando.
                  </p>
                </div>
                <Button asChild size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90">
                  <Link to="/checkout">
                    <Coins className="h-4 w-4 mr-1" />
                    Comprar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Warning */}
        {!primaryAuthor && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-destructive">
                    Perfil incompleto
                  </p>
                  <p className="font-body text-xs text-muted-foreground">
                    Complete seu perfil com nome e documento para ser o autor principal.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/dashboard">
                    Completar Perfil
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Card */}
        <Card className="border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* Authors Section */}
            {primaryAuthor && (
              <AuthorsList
                authors={coauthors}
                onAuthorsChange={setCoauthors}
                primaryAuthor={primaryAuthor}
                readOnly={false}
              />
            )}

            {/* Visibility Toggle */}
            <div className="space-y-3">
              <Label className="font-body font-medium">Visibilidade do registro</Label>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-primary" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-body text-sm font-medium text-foreground">
                      {isPublic ? "Público" : "Privado"}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {isPublic 
                        ? "Qualquer pessoa pode verificar este registro" 
                        : "Apenas você pode ver os detalhes"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>
                          <strong>Público:</strong> O hash e metadados ficam visíveis para verificação externa.
                        </p>
                        <p className="mt-1">
                          <strong>Privado:</strong> Apenas você tem acesso aos detalhes do registro.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="font-body font-medium">Arquivo</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-4 w-4 text-warning cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>⚠️ Atenção: o nome do arquivo será usado como título do registro e não poderá ser alterado após o registro.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {!file ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-all">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="font-body font-medium text-foreground text-sm mb-1">
                      Clique ou arraste o arquivo
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      PDF, JPG, PNG, DOC, DOCX, MP4, ZIP (máx. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <File className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress */}
                  {hashLoading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Processando...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1.5" />
                    </div>
                  )}

                  {/* Hash Display */}
                  {hash && !hashLoading && (
                    <div className="p-3 rounded-lg border border-success/30 bg-success/5">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-body text-xs font-medium text-success">
                          Hash SHA-256 gerado
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Hash className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                        <code className="font-mono text-[10px] bg-muted p-2 rounded flex-1 overflow-x-auto break-all text-muted-foreground">
                          {hash}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Asset Name */}
            {file && hash && (
              <div className="space-y-2">
                <Label htmlFor="nome" className="font-body font-medium">
                  Nome do ativo
                </Label>
                <Input
                  id="nome"
                  value={nomeAtivo}
                  onChange={(e) => setNomeAtivo(e.target.value)}
                  placeholder="Ex: Logo da minha empresa"
                  className="font-body"
                />
              </div>
            )}

            {/* Legal Notice */}
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-body text-sm text-foreground font-medium">
                    🔒 Seu arquivo é mantido privado.
                  </p>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    Apenas o hash criptográfico é registrado em blockchain pública para gerar prova técnica de anterioridade.
                    Este serviço não substitui o registro junto ao INPI.
                  </p>
                </div>
              </div>
            </div>

            {/* Credit Consumption Info */}
            {file && hash && hasCredits && (
              <CreditConsumptionInfo variant="default" />
            )}

            {/* Terms Checkbox */}
            {file && hash && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-0.5"
                />
              <Label htmlFor="terms" className="font-body text-sm text-muted-foreground cursor-pointer">
                  Estou ciente que este Registro de Propriedade consome <strong className="text-foreground">1 crédito</strong>
                </Label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1 font-body"
              >
                Voltar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!file || !hash || !acceptTerms || !nomeAtivo.trim() || loading || !primaryAuthor}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Registrar Propriedade
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* No Credit Modal */}
        <NoCreditModal 
          open={showNoCreditModal} 
          onClose={() => setShowNoCreditModal(false)} 
        />
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";
import { useAuth } from "@/hooks/useAuth";
import { ColorPicker } from "./ColorPicker";
import { CertificateBrandingPreview } from "./CertificateBrandingPreview";
import { supabase } from "@/integrations/supabase/client";
import {
  Palette,
  Crown,
  Lock,
  Upload,
  Trash2,
  Save,
  Loader2,
  User,
  FileText,
  ImageIcon,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export function CertificateCustomization() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isBusinessPlan, loading: businessLoading } = useBusinessPlan();
  const { settings, loading: settingsLoading, saving, saveSettings, uploadLogo, removeLogo } = useBrandingSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local form state
  const [displayName, setDisplayName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0a3d6e");
  const [secondaryColor, setSecondaryColor] = useState("#0066cc");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // DO NOT pre-fill from profile - user must explicitly configure branding
  // This ensures certificates default to WebMarcas until user opts in

  // Load settings when available
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName);
      setDocumentNumber(settings.documentNumber);
      setPrimaryColor(settings.primaryColor);
      setSecondaryColor(settings.secondaryColor);
      setLogoPreview(settings.logoUrl);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (!settings) {
      setHasChanges(displayName !== "" || documentNumber !== "" || pendingLogoFile !== null);
      return;
    }
    
    const changed = 
      displayName !== settings.displayName ||
      documentNumber !== settings.documentNumber ||
      primaryColor !== settings.primaryColor ||
      secondaryColor !== settings.secondaryColor ||
      pendingLogoFile !== null;
    
    setHasChanges(changed);
  }, [displayName, documentNumber, primaryColor, secondaryColor, pendingLogoFile, settings]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo: 2MB");
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de arquivo inválido. Use: PNG, JPG, SVG ou WebP");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setPendingLogoFile(file);
  };

  const handleRemoveLogo = async () => {
    if (settings?.logoPath) {
      await removeLogo();
    }
    setLogoPreview(null);
    setPendingLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      alert("Informe o nome que aparecerá no certificado");
      return;
    }
    if (!documentNumber.trim()) {
      alert("Informe o CPF ou CNPJ");
      return;
    }

    let logoPath = settings?.logoPath || null;

    // Upload logo if pending
    if (pendingLogoFile) {
      const newPath = await uploadLogo(pendingLogoFile);
      if (newPath) {
        logoPath = newPath;
        setPendingLogoFile(null);
      }
    }

    await saveSettings({
      displayName,
      documentNumber,
      primaryColor,
      secondaryColor,
      logoPath,
    });
  };

  if (businessLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Block for non-Business users
  if (!isBusinessPlan) {
    return (
      <Card className="card-premium relative overflow-hidden">
        {/* Locked overlay */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-bold text-center mb-2">
            Recurso Exclusivo Business
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Personalize seus certificados com sua logo, nome e cores. 
            Disponível apenas para assinantes do Plano Business.
          </p>
          <Button 
            onClick={() => navigate("/checkout?plan=BUSINESS")}
            className="btn-premium"
          >
            <Crown className="h-4 w-4 mr-2" />
            Assinar Business – R$99/mês
          </Button>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Sua logo no certificado
            </li>
            <li className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Seu nome como titular
            </li>
            <li className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Cores personalizadas
            </li>
          </ul>
        </div>

        {/* Blurred background content */}
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Personalizar Certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="opacity-30 pointer-events-none">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-32 bg-muted/30 rounded-xl" />
              <div className="h-10 bg-muted/30 rounded-lg" />
              <div className="h-10 bg-muted/30 rounded-lg" />
            </div>
            <div className="aspect-[1/1.4] bg-muted/20 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-premium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Personalizar Certificado
            </CardTitle>
            <CardDescription className="mt-1">
              Configure como seus certificados serão emitidos
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent-foreground border-accent/20">
            <Crown className="h-3 w-3 mr-1" />
            Business
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Info alert - explain default WebMarcas behavior */}
        {!settings && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Certificados Padrão WebMarcas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seus certificados serão emitidos em nome da <strong>WebMarcas</strong> até você 
                configurar sua personalização abaixo. Preencha os campos e salve para usar sua identidade.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Column */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="font-body text-sm font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                Logo da Empresa
              </Label>
              
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? "Trocar Logo" : "Enviar Logo"}
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, SVG ou WebP. Máximo 2MB.
              </p>
            </div>

            <Separator />

            {/* Display Name */}
            <div className="space-y-2">
              <Label className="font-body text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Nome no Certificado
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nome da empresa ou pessoa"
              />
              <p className="text-xs text-muted-foreground">
                Este nome aparecerá como titular do certificado
              </p>
            </div>

            {/* Document Number */}
            <div className="space-y-2">
              <Label className="font-body text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                CPF ou CNPJ
              </Label>
              <Input
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="00.000.000/0001-00"
              />
            </div>

            <Separator />

            {/* Colors */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorPicker
                value={primaryColor}
                onChange={setPrimaryColor}
                label="Cor Principal"
              />
              <ColorPicker
                value={secondaryColor}
                onChange={setSecondaryColor}
                label="Cor Secundária"
              />
            </div>

            {/* Not active warning */}
            {settings && !settings.isActive && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Personalização desativada</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sua assinatura Business está inativa. Renove para usar a personalização.
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <Button 
              onClick={handleSave} 
              disabled={saving || !hasChanges}
              className="w-full btn-premium"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Configurações
            </Button>
          </div>

          {/* Preview Column */}
          <div className="space-y-3">
            <Label className="font-body text-sm font-medium">
              Pré-visualização
            </Label>
            <div className="sticky top-4">
              <CertificateBrandingPreview
                logoUrl={logoPreview}
                displayName={displayName}
                documentNumber={documentNumber}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
              <p className="text-xs text-muted-foreground text-center mt-3">
                Os certificados exibirão "Emitido via WebMarcas"
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

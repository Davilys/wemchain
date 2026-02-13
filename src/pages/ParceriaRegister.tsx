import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Handshake, Instagram, AlertCircle, CheckCircle2, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

const partnerSchema = z.object({
  full_name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  instagram_url: z.string().trim().url("URL inválida").regex(/instagram\.com|instagr\.am/i, "Deve ser um link do Instagram"),
  tiktok_url: z.string().trim().url("URL inválida").regex(/tiktok\.com/i, "Deve ser um link do TikTok"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ParceriaRegister() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    instagram_url: "",
    tiktok_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!refCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-destructive/30">
          <CardContent className="pt-8 pb-8 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Link Inválido</h2>
            <p className="text-muted-foreground">
              Este link de parceria é inválido ou expirou. Entre em contato com o administrador para obter um novo link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-primary/30">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Cadastro em Análise</h2>
            <p className="text-muted-foreground mb-4">
              Seu cadastro foi recebido com sucesso! Nossa equipe de parcerias irá analisar e entrar em contato em breve.
            </p>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Aguardando Aprovação
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = partnerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/partner-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            code: refCode,
            email: formData.email.trim(),
            password: formData.password,
            full_name: formData.full_name.trim(),
            instagram_url: formData.instagram_url.trim(),
            tiktok_url: formData.tiktok_url.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao realizar cadastro");
      }

      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <img src={webmarcasLogo} alt="WebMarcas" className="h-9 w-9 object-contain" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-display">Programa de Parcerias</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              Cadastre-se como influenciador parceiro da WebMarcas
            </p>
          </div>
          <Badge className="mx-auto bg-primary/10 text-primary border-primary/20">
            <Handshake className="h-3 w-3 mr-1" />
            Parceria Exclusiva
          </Badge>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                placeholder="Seu nome completo"
                value={formData.full_name}
                onChange={(e) => updateField("full_name", e.target.value)}
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mín. 6 caracteres"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repita a senha"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-primary" />
                Redes Sociais (obrigatório)
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram_url" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram *
                  </Label>
                  <Input
                    id="instagram_url"
                    placeholder="https://instagram.com/seuperfil"
                    value={formData.instagram_url}
                    onChange={(e) => updateField("instagram_url", e.target.value)}
                    className={errors.instagram_url ? "border-destructive" : ""}
                  />
                  {errors.instagram_url && <p className="text-xs text-destructive">{errors.instagram_url}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.01a8.16 8.16 0 004.76 1.53v-3.4a4.85 4.85 0 01-1-.45z"/>
                    </svg>
                    TikTok *
                  </Label>
                  <Input
                    id="tiktok_url"
                    placeholder="https://tiktok.com/@seuperfil"
                    value={formData.tiktok_url}
                    onChange={(e) => updateField("tiktok_url", e.target.value)}
                    className={errors.tiktok_url ? "border-destructive" : ""}
                  />
                  {errors.tiktok_url && <p className="text-xs text-destructive">{errors.tiktok_url}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 text-base">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Handshake className="h-4 w-4 mr-2" />
                  Cadastrar como Parceiro
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

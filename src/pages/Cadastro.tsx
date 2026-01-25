import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, Mail, Lock, User } from "lucide-react";
import { z } from "zod";

const cadastroSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  email: z.string().email("E-mail inválido").max(255, "E-mail muito longo"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos")
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Cadastro() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = cadastroSchema.safeParse({ 
      fullName, 
      email, 
      password, 
      confirmPassword, 
      acceptTerms 
    });
    
    if (!validation.success) {
      toast({
        title: "Dados inválidos",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message === "User already registered" 
          ? "Este e-mail já está cadastrado" 
          : error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <Link to="/" className="flex items-center justify-center gap-2">
                <Shield className="h-10 w-10 text-secondary" />
                <span className="font-display text-2xl font-bold text-primary">
                  Web<span className="text-secondary">Marcas</span>
                </span>
              </Link>
            </div>
            <div>
              <CardTitle className="font-display text-2xl">Criar Conta</CardTitle>
              <CardDescription>Comece a proteger sua marca hoje mesmo</CardDescription>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  Concordo com os{" "}
                  <Link to="/termos" className="text-secondary hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacidade" className="text-secondary hover:underline">
                    Política de Privacidade
                  </Link>
                </Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={loading || !acceptTerms}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-secondary font-medium hover:underline">
                  Entrar
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

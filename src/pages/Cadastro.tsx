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
import { Loader2, Shield, Mail, Lock, User, ArrowLeft, CheckCircle2 } from "lucide-react";
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

const benefits = [
  "Registro em blockchain instantâneo",
  "Certificado digital verificável",
  "Dashboard completo",
  "Suporte especializado"
];

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
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 bg-muted/30">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits */}
          <div className="hidden lg:block">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-body text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </Link>
            
            <div className="space-y-6">
              <div>
                <Link to="/" className="flex items-center gap-2 mb-4">
                  <Shield className="h-12 w-12 text-primary" />
                  <span className="font-display text-3xl font-bold">
                    <span className="text-primary">Web</span>
                    <span className="text-secondary">Marcas</span>
                  </span>
                </Link>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Proteja sua marca hoje
                </h1>
                <p className="font-body text-muted-foreground">
                  Crie sua conta e comece a registrar suas marcas em blockchain com prova de anterioridade.
                </p>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <span className="font-body font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div>
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-body text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </Link>

            <Card className="border-border/50 shadow-lg">
              <CardHeader className="text-center space-y-2 pb-2">
                <div className="lg:hidden mx-auto mb-2">
                  <Link to="/" className="flex items-center justify-center gap-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <span className="font-display text-xl font-bold">
                      <span className="text-primary">Web</span>
                      <span className="text-secondary">Marcas</span>
                    </span>
                  </Link>
                </div>
                <CardTitle className="font-display text-2xl">Criar Conta</CardTitle>
                <CardDescription className="font-body">Comece a proteger sua marca hoje mesmo</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-body font-medium">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body font-medium">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 font-body"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-body font-medium">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 font-body"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-body font-medium">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Repita sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 font-body"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed font-body font-normal cursor-pointer">
                      Concordo com os{" "}
                      <Link to="/termos" className="text-primary hover:text-secondary transition-colors">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link to="/privacidade" className="text-primary hover:text-secondary transition-colors">
                        Política de Privacidade
                      </Link>
                    </Label>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-body font-semibold"
                    disabled={loading || !acceptTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar Conta Grátis"
                    )}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center font-body">
                    Já tem uma conta?{" "}
                    <Link to="/login" className="text-primary font-medium hover:text-secondary transition-colors">
                      Entrar
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

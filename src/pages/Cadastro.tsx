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
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2, Shield, Sparkles } from "lucide-react";
import { z } from "zod";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

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
  { text: "Registro em blockchain instantâneo", icon: Shield },
  { text: "Certificado digital verificável", icon: CheckCircle2 },
  { text: "Dashboard completo", icon: Sparkles },
  { text: "Suporte especializado", icon: User }
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
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 bg-gradient-hero relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-radial" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center relative z-10">
          {/* Left side - Benefits */}
          <div className="hidden lg:block animate-fade-up">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10 font-body text-sm transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para o site
            </Link>
            
            <div className="space-y-8">
              <div>
                <Link to="/" className="flex items-center gap-4 mb-6 group">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src={webmarcasLogo} 
                      alt="WebMarcas" 
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <span className="font-display text-3xl font-bold text-foreground">
                    WebMarcas
                  </span>
                </Link>
                <h1 className="font-display text-4xl font-bold text-foreground mb-4">
                  Crie sua conta <span className="text-gradient-cyan">gratuita</span>
                </h1>
                <p className="font-body text-lg text-muted-foreground leading-relaxed">
                  Cadastre-se em segundos e comece a registrar suas marcas em blockchain com prova de anterioridade imutável.
                </p>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-background/30 border border-border/30 backdrop-blur-sm animate-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-success" />
                    </div>
                    <span className="font-body font-semibold text-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="animate-fade-up delay-200">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-body text-sm transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para o site
            </Link>

            <Card className="glass-card border-border/50 shadow-2xl">
              <CardHeader className="text-center space-y-4 pb-4">
                <div className="lg:hidden mx-auto mb-2">
                  <Link to="/" className="flex items-center justify-center gap-3 group">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <img 
                        src={webmarcasLogo} 
                        alt="WebMarcas" 
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <span className="font-display text-xl font-bold text-foreground">
                      WebMarcas
                    </span>
                  </Link>
                </div>
                <CardTitle className="font-display text-2xl">Crie sua conta gratuita</CardTitle>
                <CardDescription className="font-body">Comece a proteger sua marca em segundos</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-body font-semibold">Nome Completo</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 font-body bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background rounded-xl transition-all text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body font-semibold">E-mail</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 font-body bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background rounded-xl transition-all text-base"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-body font-semibold">Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 h-12 font-body bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background rounded-xl transition-all text-base"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-body font-semibold">Confirmar Senha</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Repita sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-11 h-12 font-body bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background rounded-xl transition-all text-base"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-2 p-4 rounded-xl bg-muted/20 border border-border/30">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed font-body font-normal cursor-pointer">
                      Concordo com os{" "}
                      <Link to="/termos-de-uso" className="text-primary hover:underline transition-colors font-medium">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link to="/politica-privacidade" className="text-primary hover:underline transition-colors font-medium">
                        Política de Privacidade
                      </Link>
                    </Label>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-5 pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-bold text-lg rounded-xl shadow-lg btn-premium group"
                    disabled={loading || !acceptTerms}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                        Criar conta gratuita
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-muted-foreground text-center font-body">
                    Já tem uma conta?{" "}
                    <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
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

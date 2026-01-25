import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, ArrowLeft, Sparkles } from "lucide-react";
import { z } from "zod";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ email, password });
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
      await signIn(email, password);
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message === "Invalid login credentials" 
          ? "E-mail ou senha incorretos" 
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
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/3 rounded-full blur-[80px]" />
        
        <div className="w-full max-w-md relative z-10 animate-fade-up">
          {/* Back link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 text-sm transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para o site
          </Link>

          <Card className="glass-card border-border/50 shadow-2xl">
            <CardHeader className="text-center space-y-6 pb-4">
              <div className="mx-auto">
                <Link to="/" className="flex items-center justify-center gap-3 group">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src={webmarcasLogo} 
                      alt="WebMarcas" 
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    <span>Web</span>
                    <span className="text-primary">Marcas</span>
                  </span>
                </Link>
              </div>
              <div>
                <CardTitle className="text-3xl mb-2 tracking-tight">Bem-vindo de volta</CardTitle>
                <CardDescription className="text-base">Acesse sua conta para gerenciar seus registros</CardDescription>
              </div>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">E-mail</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background rounded-xl transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-semibold">Senha</Label>
                    <Link to="/recuperar-senha" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background rounded-xl transition-all"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-5 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl shadow-lg btn-premium group"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                      Entrar
                    </>
                  )}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-4 text-muted-foreground">ou</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Ainda não tem conta?{" "}
                  <Link to="/cadastro" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Criar conta grátis
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

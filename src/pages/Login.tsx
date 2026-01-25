import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Shield, Mail, Lock } from "lucide-react";
import { z } from "zod";

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
              <CardTitle className="font-display text-2xl">Bem-vindo de volta</CardTitle>
              <CardDescription>Acesse sua conta para gerenciar seus registros</CardDescription>
            </div>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link to="/recuperar-senha" className="text-sm text-secondary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                Ainda não tem conta?{" "}
                <Link to="/cadastro" className="text-secondary font-medium hover:underline">
                  Criar conta grátis
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

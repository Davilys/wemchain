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
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2, Phone, Building2 } from "lucide-react";
import { z } from "zod";
import webmarcasLogo from "@/assets/webmarcas-logo.png";

const cadastroSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido").max(18, "CPF/CNPJ inválido"),
  email: z.string().email("E-mail inválido").max(255, "E-mail muito longo"),
  phone: z.string().min(10, "Telefone inválido").max(15, "Telefone inválido"),
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

// Format CPF/CNPJ as user types
const formatCpfCnpj = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 11) {
    // CPF format: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ format: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
};

// Format phone as user types
const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "");
  if (numbers.length <= 10) {
    // (00) 0000-0000
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
};

export default function Cadastro() {
  const [fullName, setFullName] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleCpfCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpfCnpj(e.target.value);
    if (formatted.length <= 18) {
      setCpfCnpj(formatted);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.length <= 15) {
      setPhone(formatted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = cadastroSchema.safeParse({ 
      fullName, 
      cpfCnpj: cpfCnpj.replace(/\D/g, ""),
      email, 
      phone: phone.replace(/\D/g, ""),
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
      await signUp(email, password, fullName, cpfCnpj.replace(/\D/g, ""), phone.replace(/\D/g, ""));
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
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 bg-gradient-hero">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Benefits */}
          <div className="hidden lg:block">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 font-body text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o site
            </Link>
            
            <div className="space-y-6">
              <div>
                <Link to="/" className="flex items-center gap-3 mb-4">
                  <img 
                    src={webmarcasLogo} 
                    alt="WebMarcas" 
                    className="h-12 w-12 object-contain"
                  />
                  <span className="font-display text-3xl font-bold text-foreground">
                    WebMarcas
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
                    <span className="font-body font-medium text-foreground">{benefit}</span>
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

            <Card className="border-border bg-card shadow-xl">
              <CardHeader className="text-center space-y-2 pb-2">
                <div className="lg:hidden mx-auto mb-2">
                  <Link to="/" className="flex items-center justify-center gap-3">
                    <img 
                      src={webmarcasLogo} 
                      alt="WebMarcas" 
                      className="h-10 w-10 object-contain"
                    />
                    <span className="font-display text-xl font-bold text-foreground">
                      WebMarcas
                    </span>
                  </Link>
                </div>
                <CardTitle className="font-display text-2xl">Criar Conta</CardTitle>
                <CardDescription className="font-body">Comece a proteger sua marca hoje mesmo</CardDescription>
              </CardHeader>
              
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-body font-medium">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Seu nome completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 font-body bg-background border-border"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cpfCnpj" className="font-body font-medium">CPF ou CNPJ *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="cpfCnpj"
                          type="text"
                          placeholder="000.000.000-00"
                          value={cpfCnpj}
                          onChange={handleCpfCnpjChange}
                          className="pl-10 font-body bg-background border-border"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-body font-medium">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(00) 00000-0000"
                          value={phone}
                          onChange={handlePhoneChange}
                          className="pl-10 font-body bg-background border-border"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body font-medium">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 font-body bg-background border-border"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="font-body font-medium">Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 font-body bg-background border-border"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="font-body font-medium">Confirmar Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Repita sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 font-body bg-background border-border"
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
                      <Link to="/termos" className="text-primary hover:underline transition-colors">
                        Termos de Uso
                      </Link>{" "}
                      e{" "}
                      <Link to="/privacidade" className="text-primary hover:underline transition-colors">
                        Política de Privacidade
                      </Link>
                    </Label>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold"
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
                    <Link to="/login" className="text-primary font-medium hover:underline transition-colors">
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
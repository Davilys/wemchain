import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  CreditCard, 
  Loader2, 
  Check, 
  Shield, 
  Zap, 
  Calendar,
  Copy,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  BarChart3,
  FileText,
  FolderKanban
} from "lucide-react";

interface Plan {
  id: "BASICO" | "PROFISSIONAL" | "BUSINESS" | "ADICIONAL";
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
  popular?: boolean;
  isSubscription?: boolean;
  isAdditional?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "BASICO",
    name: "Básico",
    price: 49,
    credits: 1,
    description: "Registro avulso de propriedade",
    features: [
      "1 Registro de Propriedade em Blockchain",
      "Certificado digital em PDF",
      "Prova de anterioridade",
      "Validade perpétua",
      "Verificação pública",
    ],
  },
  {
    id: "PROFISSIONAL",
    name: "Profissional",
    price: 149,
    credits: 5,
    description: "Para quem precisa de mais registros",
    features: [
      "5 Registros de Propriedade em Blockchain",
      "Certificados digitais em PDF",
      "Prova de anterioridade",
      "Validade perpétua",
      "Economia de 40%",
    ],
    popular: true,
  },
  {
    id: "BUSINESS",
    name: "Business",
    price: 99,
    credits: 1,
    description: "Gestão de Propriedade Intelectual",
    features: [
      "1 crédito de registro incluso por mês",
      "Registros adicionais por R$ 49,00 cada",
      "Gestão de projetos e registros de propriedade",
      "Organização por linha do tempo",
      "Cadastro e gestão de clientes",
      "Definição de funções para equipe",
      "Transferência de propriedade de registros",
      "Dashboard completo",
      "Certificados digitais em PDF",
      "Verificação pública em blockchain",
    ],
    isSubscription: true,
  },
];

// Plano adicional separado (só aparece para assinantes Business)
const PLANO_ADICIONAL: Plan = {
  id: "ADICIONAL",
  name: "Registro Adicional",
  price: 49,
  credits: 1,
  description: "Para assinantes Business",
  features: [
    "1 Registro de Propriedade em Blockchain",
    "Certificado digital em PDF",
    "Prova de anterioridade",
    "Disponível para assinantes Business",
  ],
  isAdditional: true,
};

interface PaymentData {
  type: "payment" | "subscription";
  paymentId?: string;
  subscriptionId?: string;
  invoiceUrl?: string;
  status: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  dueDate?: string;
}

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { credits, loading: creditsLoading, refetch: refetchCredits } = useCredits();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<"plans" | "form" | "payment">("plans");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [copied, setCopied] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Formulário
  const [customerName, setCustomerName] = useState("");
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Auto-preencher dados do perfil do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfileLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, cpf_cnpj, phone")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          if (data.full_name) setCustomerName(data.full_name);
          if (data.cpf_cnpj) {
            // Formatar CPF/CNPJ
            const numbers = data.cpf_cnpj.replace(/\D/g, "");
            if (numbers.length <= 11) {
              setCustomerCpfCnpj(formatCpfCnpj(numbers));
            } else {
              setCustomerCpfCnpj(formatCpfCnpj(numbers));
            }
          }
          if (data.phone) {
            setCustomerPhone(formatPhone(data.phone.replace(/\D/g, "")));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Verificar plano na URL
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId) {
      const plan = [...PLANS, PLANO_ADICIONAL].find(p => p.id === planId.toUpperCase());
      if (plan) {
        setSelectedPlan(plan);
        setStep("form");
      }
    }
  }, [searchParams]);

  // Polling para verificar status do pagamento
  useEffect(() => {
    if (!paymentData?.paymentId && !paymentData?.subscriptionId) return;

    const interval = setInterval(async () => {
      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session) return;

        const response = await supabase.functions.invoke("check-asaas-payment", {
          body: null,
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        });

        if (response.data?.payments?.[0]?.status === "CONFIRMED") {
          toast.success("Pagamento confirmado! Créditos liberados.");
          refetchCredits();
          clearInterval(interval);
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [paymentData, navigate, refetchCredits]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setStep("form");
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return numbers
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan || !customerName || !customerCpfCnpj) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/login");
        return;
      }

      const response = await supabase.functions.invoke("create-asaas-payment", {
        body: {
          planType: selectedPlan.id,
          customerName,
          customerEmail: user?.email,
          customerCpfCnpj: customerCpfCnpj.replace(/\D/g, ""),
          customerPhone: customerPhone.replace(/\D/g, ""),
        },
        headers: {
          Authorization: `Bearer ${session.data.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Erro ao criar pagamento");
      }

      setPaymentData(response.data.payment);
      setStep("payment");
      toast.success("Pagamento criado! Escaneie o QR Code ou copie o código Pix.");

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (paymentData?.pixCopyPaste) {
      await navigator.clipboard.writeText(paymentData.pixCopyPaste);
      setCopied(true);
      toast.success("Código Pix copiado!");
      setTimeout(() => setCopied(false), 3000);
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
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          {step !== "plans" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(step === "payment" ? "form" : "plans")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              {step === "plans" && "Registros de Propriedade"}
              {step === "form" && "Dados para Pagamento"}
              {step === "payment" && "Pagamento via Pix"}
            </h1>
            <p className="text-muted-foreground font-body">
              {step === "plans" && "Escolha a melhor opção para seus registros em blockchain"}
              {step === "form" && `${selectedPlan?.name} - R$ ${selectedPlan?.price}${selectedPlan?.isSubscription ? '/mês' : ''}`}
              {step === "payment" && "Escaneie o QR Code ou copie o código Pix"}
            </p>
          </div>
        </div>

        {/* Créditos atuais */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-body text-foreground">
                Você possui <strong className="text-primary">{credits?.available_credits || 0} crédito{(credits?.available_credits || 0) !== 1 ? 's' : ''}</strong> disponíve{(credits?.available_credits || 0) !== 1 ? 'is' : 'l'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Seleção de Planos */}
        {step === "plans" && (
          <div className="space-y-8">
            {/* Planos Principais */}
            <div className="grid md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    plan.id === "BUSINESS" 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : plan.popular 
                        ? "border-primary/50"
                        : "border-border/50"
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.id === "BUSINESS" && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Recomendado
                    </Badge>
                  )}
                  {plan.popular && plan.id !== "BUSINESS" && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {plan.id === "BUSINESS" ? (
                        <Building2 className="h-7 w-7 text-primary" />
                      ) : plan.popular ? (
                        <Zap className="h-7 w-7 text-primary" />
                      ) : (
                        <Shield className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                    <CardDescription className="font-body">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm text-muted-foreground">R$</span>
                        <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                        {plan.isSubscription && (
                          <span className="text-muted-foreground">/mês</span>
                        )}
                      </div>
                      <p className="text-sm text-primary font-medium mt-1">
                        {plan.credits} crédito{plan.credits > 1 ? "s" : ""} {plan.isSubscription ? "por mês" : ""}
                      </p>
                    </div>

                    <ul className="space-y-2.5">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm font-body">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.id === "BUSINESS"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : plan.popular
                            ? "bg-primary/80 text-primary-foreground hover:bg-primary/70"
                            : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      Selecionar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Seção Registro Adicional */}
            <div className="border-t border-border/50 pt-8">
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Precisa de mais registros?
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  Assinantes Business podem adquirir registros adicionais a qualquer momento
                </p>
              </div>
              
              <Card 
                className="max-w-md mx-auto cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handleSelectPlan(PLANO_ADICIONAL)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-foreground">Registro Adicional</p>
                        <p className="font-body text-sm text-muted-foreground">1 Registro de Propriedade</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl font-bold text-primary">R$ 49</p>
                      <p className="font-body text-xs text-muted-foreground">por registro</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* O que pode ser registrado */}
            <div className="border-t border-border/50 pt-8">
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  O que pode ser registrado com a WebMarcas?
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  O Registro de Propriedade em Blockchain pode ser realizado com qualquer tipo de arquivo digital
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {[
                  { icon: "🖼️", label: "Imagens", desc: "Fotos, ilustrações, logotipos, plantas, artes gráficas" },
                  { icon: "📄", label: "PDFs", desc: "Textos, apresentações, branding, documentos" },
                  { icon: "💬", label: "Evidências Digitais", desc: "Conversas de WhatsApp, e-mails, mensagens" },
                  { icon: "📑", label: "Documentos", desc: "Contratos, declarações, registros internos" },
                  { icon: "🎬", label: "Vídeos", desc: "Curtas, animações, filmes, comerciais" },
                  { icon: "🎧", label: "Áudios", desc: "Músicas, gravações de voz, narrações" },
                  { icon: "💻", label: "Códigos", desc: "Qualquer código-fonte de programação" },
                  { icon: "📊", label: "Planilhas", desc: "Contabilidade, dados, registros de pagamentos" },
                ].map((item, index) => (
                  <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border/50 text-center">
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="font-body font-medium text-sm text-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Formulário */}
        {step === "form" && selectedPlan && (
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Dados do Pagador
              </CardTitle>
              <CardDescription className="font-body">
                Informe seus dados para gerar o pagamento via Pix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                  <Input
                    id="cpfCnpj"
                    value={customerCpfCnpj}
                    onChange={(e) => setCustomerCpfCnpj(formatCpfCnpj(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={18}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                  />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Plano selecionado:</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  {selectedPlan.isSubscription && (
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium text-primary">Assinatura mensal</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      R$ {selectedPlan.price},00
                      {selectedPlan.isSubscription && <span className="text-sm font-normal">/mês</span>}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando Pagamento...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gerar Pix
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Pagamento Pix */}
        {step === "payment" && paymentData && (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                <Clock className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="font-display">Aguardando Pagamento</CardTitle>
              <CardDescription className="font-body">
                Escaneie o QR Code com o app do seu banco ou copie o código Pix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              {paymentData.pixQrCode && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    <img
                      src={`data:image/png;base64,${paymentData.pixQrCode}`}
                      alt="QR Code Pix"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Código Pix */}
              {paymentData.pixCopyPaste && (
                <div className="space-y-2">
                  <Label>Código Pix Copia e Cola</Label>
                  <div className="flex gap-2">
                    <Input
                      value={paymentData.pixCopyPaste}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Link de pagamento */}
              {paymentData.invoiceUrl && (
                <div className="text-center">
                  <a
                    href={paymentData.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm font-body"
                  >
                    Abrir página de pagamento completa
                  </a>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>

              {/* Aviso */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <p className="font-body text-xs text-muted-foreground text-center">
                  Após o pagamento, seus créditos serão liberados automaticamente e você poderá começar a registrar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

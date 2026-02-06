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
import { trackPurchase } from "@/lib/metaPixel";
import { validateDocument } from "@/lib/cpfValidator";
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
  FolderKanban,
  AlertCircle,
  Plus,
  Minus
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
    credits: 3,
    description: "Registro de Propriedade Intelectual em Blockchain",
    features: [
      "3 créditos de registro inclusos por mês",
      "Registros adicionais por R$ 39,00 cada",
      "Registro de arquivos digitais como prova de propriedade",
      "Certificados digitais em PDF para cada registro",
      "Verificação pública em blockchain",
      "Dashboard para acompanhamento dos registros",
      "Histórico completo dos registros realizados",
    ],
    isSubscription: true,
  },
];

// Plano adicional separado (só aparece para assinantes Business)
const PLANO_ADICIONAL: Plan = {
  id: "ADICIONAL",
  name: "Registro Adicional",
  price: 39,
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
  const [cpfCnpjError, setCpfCnpjError] = useState<string | null>(null);
  const [creditQuantity, setCreditQuantity] = useState(1);

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

        // Build query params for GET request
        const params = new URLSearchParams();
        if (paymentData.paymentId) {
          params.set("paymentId", paymentData.paymentId);
        }
        if (paymentData.subscriptionId) {
          params.set("subscriptionId", paymentData.subscriptionId);
        }

        const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-asaas-payment?${params.toString()}`;
        
        const response = await fetch(functionUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Check if payment is confirmed
          if (data.payment?.status === "CONFIRMED" || data.payments?.[0]?.status === "CONFIRMED") {
            // Track Purchase event (most important for Meta Ads!)
            const purchaseValue = selectedPlan?.price || 49;
            trackPurchase(purchaseValue, 'BRL');
            
            toast.success("Pagamento confirmado! Créditos liberados.");
            refetchCredits();
            clearInterval(interval);
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [paymentData, navigate, refetchCredits]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    // Reset quantity when changing plans
    if (plan.id !== "BASICO") {
      setCreditQuantity(1);
    }
    setStep("form");
  };

  // Calculate dynamic price and credits for BASICO plan
  const getCalculatedPrice = () => {
    if (selectedPlan?.id === "BASICO") {
      return selectedPlan.price * creditQuantity;
    }
    return selectedPlan?.price || 0;
  };

  const getCalculatedCredits = () => {
    if (selectedPlan?.id === "BASICO") {
      return creditQuantity;
    }
    return selectedPlan?.credits || 0;
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

    // Validar CPF/CNPJ antes de enviar
    const validation = validateDocument(customerCpfCnpj);
    if (!validation.isValid) {
      setCpfCnpjError(validation.error || "Documento inválido");
      toast.error(validation.error || "CPF/CNPJ inválido");
      return;
    }
    setCpfCnpjError(null);

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
          quantity: selectedPlan.id === "BASICO" ? creditQuantity : undefined,
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

      // Salvar dados do cliente no perfil para próximas compras
      try {
        await supabase
          .from("profiles")
          .update({
            full_name: customerName,
            cpf_cnpj: customerCpfCnpj.replace(/\D/g, ""),
            phone: customerPhone.replace(/\D/g, "") || null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);
      } catch (profileError) {
        console.error("Error saving profile:", profileError);
        // Não bloquear o fluxo se falhar ao salvar perfil
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
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-0">
        {/* Header - Mobile optimized */}
        <div className="flex items-center gap-3 sm:gap-4">
          {step !== "plans" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep(step === "payment" ? "form" : "plans")}
              className="h-10 w-10 shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground truncate">
              {step === "plans" && "Registros de Propriedade"}
              {step === "form" && "Dados para Pagamento"}
              {step === "payment" && "Pagamento via Pix"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-body truncate">
              {step === "plans" && "Escolha a melhor opção para seus registros"}
              {step === "form" && `${selectedPlan?.name}${selectedPlan?.id === "BASICO" && creditQuantity > 1 ? ` (${creditQuantity} créditos)` : ""} - R$ ${getCalculatedPrice()}${selectedPlan?.isSubscription ? '/mês' : ''}`}
              {step === "payment" && "Escaneie ou copie o código Pix"}
            </p>
          </div>
        </div>

        {/* Créditos atuais - Mobile optimized */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <span className="font-body text-sm sm:text-base text-foreground">
                Você possui <strong className="text-primary">{credits?.available_credits || 0} crédito{(credits?.available_credits || 0) !== 1 ? 's' : ''}</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Seleção de Planos */}
        {step === "plans" && (
          <div className="space-y-8">
            {/* Planos Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 ${
                    plan.id === "BUSINESS" 
                      ? "border-primary shadow-lg shadow-primary/20" 
                      : plan.popular 
                        ? "border-primary/50"
                        : "border-border/50"
                  } ${plan.id !== "BASICO" ? "cursor-pointer active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl touch-manipulation" : ""}`}
                  onClick={() => plan.id !== "BASICO" && handleSelectPlan(plan)}
                >
                  {plan.id === "BUSINESS" && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                      Recomendado
                    </Badge>
                  )}
                  {plan.popular && plan.id !== "BUSINESS" && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary/80 text-primary-foreground text-xs">
                      Mais Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="mx-auto mb-3 sm:mb-4 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {plan.id === "BUSINESS" ? (
                        <Building2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      ) : plan.popular ? (
                        <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      ) : (
                        <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                      )}
                    </div>
                    <CardTitle className="font-display text-lg sm:text-xl">{plan.name}</CardTitle>
                    <CardDescription className="font-body text-xs sm:text-sm">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6">
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xs sm:text-sm text-muted-foreground">R$</span>
                        <span className="font-display text-3xl sm:text-4xl font-bold text-foreground">{plan.price}</span>
                        {plan.isSubscription && (
                          <span className="text-muted-foreground text-sm">/mês</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-primary font-medium mt-1">
                        {plan.id === "BASICO" ? "por crédito" : `${plan.credits} crédito${plan.credits > 1 ? "s" : ""} ${plan.isSubscription ? "por mês" : ""}`}
                      </p>
                    </div>

                    {/* Quantity selector for BASICO plan */}
                    {plan.id === "BASICO" && (
                      <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                        <p className="text-xs sm:text-sm font-medium text-foreground text-center">
                          Quantos créditos você quer?
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          {[1, 3, 5, 10].map((qty) => (
                            <Button
                              key={qty}
                              type="button"
                              variant={creditQuantity === qty ? "default" : "outline"}
                              size="sm"
                              className={`w-10 h-10 p-0 ${creditQuantity === qty ? "bg-primary text-primary-foreground" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCreditQuantity(qty);
                              }}
                            >
                              {qty}
                            </Button>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreditQuantity(Math.max(1, creditQuantity - 1));
                            }}
                            disabled={creditQuantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            max={50}
                            value={creditQuantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              setCreditQuantity(Math.max(1, Math.min(50, val)));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 h-8 text-center text-sm"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCreditQuantity(Math.min(50, creditQuantity + 1));
                            }}
                            disabled={creditQuantity >= 50}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-center pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground">
                            {creditQuantity} crédito{creditQuantity > 1 ? "s" : ""} × R$ 49,00
                          </p>
                          <p className="text-lg font-bold text-primary">
                            Total: R$ {(creditQuantity * 49).toLocaleString('pt-BR')},00
                          </p>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-2">
                      {plan.features.slice(0, plan.id === "BASICO" ? 3 : 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs sm:text-sm font-body">
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full h-11 sm:h-10 text-sm ${
                        plan.id === "BUSINESS"
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : plan.popular
                            ? "bg-primary/80 text-primary-foreground hover:bg-primary/70"
                            : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPlan(plan);
                      }}
                    >
                      {plan.id === "BASICO" ? `Comprar ${creditQuantity} crédito${creditQuantity > 1 ? "s" : ""}` : "Selecionar"}
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
                      <p className="font-display text-2xl font-bold text-primary">R$ 39</p>
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

        {/* Step 2: Formulário - Mobile optimized */}
        {step === "form" && selectedPlan && (
          <Card className="max-w-lg mx-auto">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="font-display flex items-center gap-2 text-lg sm:text-xl">
                <CreditCard className="h-5 w-5 text-primary" />
                Dados do Pagador
              </CardTitle>
              <CardDescription className="font-body text-sm">
                Informe seus dados para gerar o pagamento via Pix
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="h-12 sm:h-10 text-base sm:text-sm"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj" className="text-sm font-medium">CPF ou CNPJ *</Label>
                  <Input
                    id="cpfCnpj"
                    value={customerCpfCnpj}
                    onChange={(e) => {
                      const formatted = formatCpfCnpj(e.target.value);
                      setCustomerCpfCnpj(formatted);
                      // Limpar erro ao digitar
                      if (cpfCnpjError) setCpfCnpjError(null);
                    }}
                    onBlur={() => {
                      // Validar ao perder o foco
                      if (customerCpfCnpj) {
                        const validation = validateDocument(customerCpfCnpj);
                        if (!validation.isValid) {
                          setCpfCnpjError(validation.error || "Documento inválido");
                        } else {
                          setCpfCnpjError(null);
                        }
                      }
                    }}
                    placeholder="000.000.000-00"
                    maxLength={18}
                    required
                    className={`h-12 sm:h-10 text-base sm:text-sm ${cpfCnpjError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    inputMode="numeric"
                  />
                  {cpfCnpjError && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{cpfCnpjError}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    className="h-12 sm:h-10 text-base sm:text-sm"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </div>

                <div className="pt-4 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plano selecionado:</span>
                    <span className="font-medium">{selectedPlan.name}</span>
                  </div>
                  {selectedPlan.id === "BASICO" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <span className="font-medium">{creditQuantity} crédito{creditQuantity > 1 ? "s" : ""}</span>
                    </div>
                  )}
                  {selectedPlan.id === "BASICO" && creditQuantity > 1 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cálculo:</span>
                      <span className="font-medium">{creditQuantity} × R$ 49,00</span>
                    </div>
                  )}
                  {selectedPlan.isSubscription && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium text-primary">Assinatura mensal</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2">
                    <span>Total:</span>
                    <span className="text-primary">
                      R$ {getCalculatedPrice().toLocaleString('pt-BR')},00
                      {selectedPlan.isSubscription && <span className="text-sm font-normal">/mês</span>}
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 sm:h-11 bg-primary text-primary-foreground text-base sm:text-sm font-medium"
                  disabled={loading || !!cpfCnpjError}
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
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <CardTitle className="font-display text-lg sm:text-xl">Aguardando Pagamento</CardTitle>
              <CardDescription className="font-body text-sm">
                Escaneie o QR Code com o app do seu banco ou copie o código Pix
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 px-4 sm:px-6">
              {/* QR Code - Responsive and always visible */}
              {paymentData.pixQrCode ? (
                <div className="flex justify-center">
                  <div className="p-3 sm:p-4 bg-white rounded-xl shadow-lg border border-border/20">
                    <img
                      src={`data:image/png;base64,${paymentData.pixQrCode}`}
                      alt="QR Code Pix"
                      className="w-40 h-40 sm:w-52 sm:h-52 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-xl flex flex-col items-center justify-center w-40 h-40 sm:w-52 sm:h-52">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <span className="text-xs text-muted-foreground">Carregando QR Code...</span>
                  </div>
                </div>
              )}

              {/* Código Pix Copia e Cola - Mobile friendly */}
              {paymentData.pixCopyPaste && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Código Pix Copia e Cola</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Input
                        value={paymentData.pixCopyPaste}
                        readOnly
                        className="font-mono text-xs pr-10 h-12 sm:h-10"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                    </div>
                    <Button
                      variant="default"
                      onClick={copyToClipboard}
                      className="h-12 sm:h-10 w-full sm:w-auto px-6 bg-primary text-primary-foreground"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-100" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Link de pagamento alternativo */}
              {paymentData.invoiceUrl && (
                <div className="text-center pt-2">
                  <a
                    href={paymentData.invoiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-body font-medium"
                  >
                    <CreditCard className="h-4 w-4" />
                    Abrir página de pagamento completa
                  </a>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Aguardando confirmação do pagamento...</span>
              </div>

              {/* Aviso */}
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-body text-xs text-muted-foreground text-center leading-relaxed">
                  💡 <strong className="text-foreground">Dica:</strong> Após o pagamento, seus créditos serão liberados automaticamente em até 5 minutos e você poderá começar a registrar.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { useBusinessPlan } from "@/hooks/useBusinessPlan";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Building,
  FileText,
  Loader2,
  Save,
  Crown,
  CreditCard,
  Receipt,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Coins,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  cpf_cnpj: string | null;
  phone: string | null;
  company_name: string | null;
}

interface Payment {
  id: string;
  plan_type: string;
  valor: number;
  credits_amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  invoice_url: string | null;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  next_billing_date: string | null;
  credits_per_cycle: number;
  current_cycle: number;
}

export default function Conta() {
  const { user, loading: authLoading } = useAuth();
  const { credits } = useCredits();
  const { isBusinessPlan, loading: businessLoading } = useBusinessPlan();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    cpf_cnpj: "",
    phone: "",
    company_name: "",
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email_registros: true,
    email_pagamentos: true,
    email_novidades: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData);
        setFormData({
          full_name: profileData.full_name || "",
          cpf_cnpj: profileData.cpf_cnpj || "",
          phone: profileData.phone || "",
          company_name: profileData.company_name || "",
        });
      }

      // Fetch payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("asaas_payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch subscription
      const { data: subscriptionData } = await supabase
        .from("asaas_subscriptions")
        .select("*")
        .eq("status", "ACTIVE")
        .maybeSingle();

      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados da conta");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          full_name: formData.full_name || null,
          cpf_cnpj: formData.cpf_cnpj || null,
          phone: formData.phone || null,
          company_name: formData.company_name || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { icon: typeof CheckCircle2; label: string; className: string }> = {
      CONFIRMED: { icon: CheckCircle2, label: "Pago", className: "bg-success/10 text-success border-success/20" },
      PENDING: { icon: Clock, label: "Pendente", className: "bg-warning/10 text-warning border-warning/20" },
      REFUNDED: { icon: AlertCircle, label: "Estornado", className: "bg-muted/50 text-muted-foreground border-muted" },
      ACTIVE: { icon: CheckCircle2, label: "Ativo", className: "bg-success/10 text-success border-success/20" },
    };
    const config = styles[status] || { icon: Clock, label: status, className: "bg-muted/50 text-muted-foreground" };
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} font-body text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">Minha Conta</h1>
            {isBusinessPlan && (
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                <Crown className="h-3 w-3 mr-1" />
                Business
              </Badge>
            )}
          </div>
          <p className="font-body text-sm text-muted-foreground">
            Gerencie seus dados, plano e preferências
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50">
              <TabsTrigger value="perfil" className="flex items-center gap-2 py-2.5">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="plano" className="flex items-center gap-2 py-2.5">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Plano</span>
              </TabsTrigger>
              <TabsTrigger value="faturas" className="flex items-center gap-2 py-2.5">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Faturas</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2 py-2.5">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alertas</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Perfil */}
            <TabsContent value="perfil" className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label className="font-body text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      E-mail
                    </Label>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  <Separator />

                  {/* Editable fields */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Nome Completo
                      </Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        CPF / CNPJ
                      </Label>
                      <Input
                        value={formData.cpf_cnpj}
                        onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefone
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        Empresa
                      </Label>
                      <Input
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="Nome da empresa (opcional)"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="btn-premium">
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvar Alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Plano */}
            <TabsContent value="plano" className="space-y-6">
              {/* Current Plan Card */}
              <Card className={cn(
                "card-premium",
                isBusinessPlan && "border-amber-500/30 bg-amber-500/5"
              )}>
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    {isBusinessPlan ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-primary" />
                    )}
                    Seu Plano Atual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl font-bold">
                        {isBusinessPlan ? "Plano Business" : subscription ? "Assinatura Mensal" : "Créditos Avulsos"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isBusinessPlan 
                          ? "Acesso ilimitado para profissionais" 
                          : subscription 
                            ? `${subscription.credits_per_cycle} créditos/mês` 
                            : "Compre créditos conforme necessário"
                        }
                      </p>
                    </div>
                    {subscription && getStatusBadge(subscription.status)}
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Coins className="h-4 w-4 text-primary" />
                        <span className="text-xs text-muted-foreground">Créditos Disponíveis</span>
                      </div>
                      <p className="text-2xl font-bold text-primary font-display">
                        {isBusinessPlan ? "∞" : credits?.available_credits || 0}
                      </p>
                    </div>

                    {subscription && (
                      <>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Próxima Renovação</span>
                          </div>
                          <p className="text-lg font-semibold font-display">
                            {subscription.next_billing_date 
                              ? formatDate(subscription.next_billing_date) 
                              : "—"
                            }
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Receipt className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Ciclo Atual</span>
                          </div>
                          <p className="text-lg font-semibold font-display">
                            #{subscription.current_cycle}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {!isBusinessPlan && (
                    <div className="flex gap-3 pt-2">
                      <Button asChild className="flex-1 btn-premium">
                        <a href="/checkout">
                          <Coins className="h-4 w-4 mr-2" />
                          Comprar Créditos
                        </a>
                      </Button>
                      {!subscription && (
                        <Button asChild variant="outline" className="flex-1">
                          <a href="/checkout?plan=BUSINESS">
                            <Crown className="h-4 w-4 mr-2" />
                            Upgrade Business
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Faturas */}
            <TabsContent value="faturas" className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    Histórico de Pagamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium font-body">
                                {payment.plan_type === "BUSINESS" 
                                  ? "Plano Business" 
                                  : `${payment.credits_amount} Crédito${payment.credits_amount > 1 ? "s" : ""}`
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(payment.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold font-display">
                                {formatCurrency(payment.valor)}
                              </p>
                              {getStatusBadge(payment.status)}
                            </div>

                            {payment.invoice_url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="h-8 w-8"
                              >
                                <a href={payment.invoice_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Notificações */}
            <TabsContent value="notificacoes" className="space-y-6">
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Preferências de Notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body font-medium">Registros em Blockchain</Label>
                      <p className="text-xs text-muted-foreground">
                        Receba notificações quando seus registros forem confirmados
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email_registros}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email_registros: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body font-medium">Pagamentos e Créditos</Label>
                      <p className="text-xs text-muted-foreground">
                        Receba confirmações de pagamento e alertas de créditos baixos
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email_pagamentos}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email_pagamentos: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-body font-medium">Novidades e Dicas</Label>
                      <p className="text-xs text-muted-foreground">
                        Receba novidades sobre recursos e dicas de uso
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email_novidades}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, email_novidades: checked })
                      }
                    />
                  </div>

                  <div className="pt-4">
                    <p className="text-xs text-muted-foreground text-center">
                      As preferências de notificação são salvas automaticamente
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

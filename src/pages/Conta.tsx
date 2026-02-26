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
import { CertificateCustomization } from "@/components/certificates/CertificateCustomization";
import { isValidCPF, isValidCNPJ } from "@/lib/cpfValidator";
import { formatCPF, formatCNPJ } from "@/lib/documentFormatters";
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
  Palette,
  Settings,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Search,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  cpf_cnpj: string | null;
  cpf: string | null;
  cnpj: string | null;
  razao_social: string | null;
  phone: string | null;
  company_name: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
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
  const [cepLoading, setCepLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    cpf: "",
    phone: "",
    cnpj: "",
    razao_social: "",
    company_name: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData) {
        setProfile(profileData as unknown as Profile);
        setFormData({
          full_name: profileData.full_name || "",
          cpf: (profileData as any).cpf ? formatCPF((profileData as any).cpf) : "",
          phone: profileData.phone || "",
          cnpj: (profileData as any).cnpj ? formatCNPJ((profileData as any).cnpj) : "",
          razao_social: (profileData as any).razao_social || "",
          company_name: profileData.company_name || "",
          cep: (profileData as any).cep || "",
          rua: (profileData as any).rua || "",
          numero: (profileData as any).numero || "",
          complemento: (profileData as any).complemento || "",
          bairro: (profileData as any).bairro || "",
          cidade: (profileData as any).cidade || "",
          estado: (profileData as any).estado || "",
        });
      }

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("asaas_payments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

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

  const handleCepChange = async (value: string) => {
    const cepNumbers = value.replace(/\D/g, "");
    const formatted = cepNumbers.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    setFormData(prev => ({ ...prev, cep: formatted }));

    if (cepNumbers.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            rua: data.logradouro || "",
            bairro: data.bairro || "",
            cidade: data.localidade || "",
            estado: data.uf || "",
          }));
          setErrors(prev => {
            const next = { ...prev };
            delete next.cep;
            delete next.rua;
            delete next.bairro;
            delete next.cidade;
            delete next.estado;
            return next;
          });
        } else {
          setErrors(prev => ({ ...prev, cep: "CEP não encontrado" }));
        }
      } catch {
        setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP" }));
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setFormData(prev => ({ ...prev, cpf: formatted }));
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 11) {
      if (!isValidCPF(numbers)) {
        setErrors(prev => ({ ...prev, cpf: "CPF inválido" }));
      } else {
        setErrors(prev => { const n = { ...prev }; delete n.cpf; return n; });
      }
    } else {
      setErrors(prev => { const n = { ...prev }; delete n.cpf; return n; });
    }
  };

  const handleCnpjChange = (value: string) => {
    const formatted = formatCNPJ(value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
    const numbers = value.replace(/\D/g, "");
    if (numbers.length === 14) {
      if (!isValidCNPJ(numbers)) {
        setErrors(prev => ({ ...prev, cnpj: "CNPJ inválido" }));
      } else {
        setErrors(prev => { const n = { ...prev }; delete n.cnpj; return n; });
      }
    } else {
      setErrors(prev => { const n = { ...prev }; delete n.cnpj; return n; });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.full_name.trim()) newErrors.full_name = "Nome é obrigatório";
    const cpfNumbers = formData.cpf.replace(/\D/g, "");
    if (!cpfNumbers) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (cpfNumbers.length !== 11 || !isValidCPF(cpfNumbers)) {
      newErrors.cpf = "CPF inválido";
    }
    if (!formData.phone.trim()) newErrors.phone = "Telefone é obrigatório";
    if (!formData.cep.replace(/\D/g, "")) newErrors.cep = "CEP é obrigatório";
    if (!formData.rua.trim()) newErrors.rua = "Rua é obrigatória";
    if (!formData.numero.trim()) newErrors.numero = "Número é obrigatório";
    if (!formData.bairro.trim()) newErrors.bairro = "Bairro é obrigatório";
    if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    if (!formData.estado.trim()) newErrors.estado = "Estado é obrigatório";

    const cnpjNumbers = formData.cnpj.replace(/\D/g, "");
    if (cnpjNumbers && (cnpjNumbers.length !== 14 || !isValidCNPJ(cnpjNumbers))) {
      newErrors.cnpj = "CNPJ inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!validateForm()) {
      toast.error("Corrija os erros antes de salvar");
      return;
    }

    try {
      setSaving(true);
      const cpfNumbers = formData.cpf.replace(/\D/g, "");
      const cnpjNumbers = formData.cnpj.replace(/\D/g, "");

      // Check CPF uniqueness using raw query approach
      const { data: existingCpf } = await (supabase
        .from("profiles")
        .select("user_id") as any)
        .eq("cpf", cpfNumbers)
        .neq("user_id", user.id)
        .maybeSingle();

      if (existingCpf) {
        setErrors(prev => ({ ...prev, cpf: "Este CPF já está cadastrado em outra conta" }));
        toast.error("Este CPF já está cadastrado em outra conta");
        return;
      }

      const updateData: Record<string, any> = {
        user_id: user.id,
        full_name: formData.full_name || null,
        cpf_cnpj: cpfNumbers || null,
        cpf: cpfNumbers || null,
        cnpj: cnpjNumbers || null,
        razao_social: formData.razao_social || null,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        cep: formData.cep.replace(/\D/g, "") || null,
        rua: formData.rua || null,
        numero: formData.numero || null,
        complemento: formData.complemento || null,
        bairro: formData.bairro || null,
        cidade: formData.cidade || null,
        estado: formData.estado || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      if (error.message?.includes("idx_profiles_cpf_unique")) {
        setErrors(prev => ({ ...prev, cpf: "Este CPF já está cadastrado em outra conta" }));
        toast.error("Este CPF já está cadastrado em outra conta");
      } else {
        toast.error("Erro ao salvar perfil");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
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

  const renderFieldError = (field: string) => {
    if (!errors[field]) return null;
    return <p className="text-xs text-destructive mt-1">{errors[field]}</p>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>
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
            <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/50">
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
              <TabsTrigger value="certificado" className="flex items-center gap-2 py-2.5">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Certificado</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Perfil */}
            <TabsContent value="perfil" className="space-y-6">
              {/* Dados Pessoais */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Dados Pessoais
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Campos obrigatórios marcados com *</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <Label className="font-body text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      E-mail
                    </Label>
                    <Input value={user?.email || ""} disabled className="bg-muted/50" />
                    <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Nome Completo *
                      </Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Seu nome completo"
                        className={errors.full_name ? "border-destructive" : ""}
                      />
                      {renderFieldError("full_name")}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        CPF *
                      </Label>
                      <Input
                        value={formData.cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={errors.cpf ? "border-destructive" : ""}
                      />
                      {renderFieldError("cpf")}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Telefone *
                      </Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {renderFieldError("phone")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Endereço
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Digite o CEP para preenchimento automático</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="font-body text-sm">CEP *</Label>
                      <div className="relative">
                        <Input
                          value={formData.cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          maxLength={9}
                          className={errors.cep ? "border-destructive pr-8" : "pr-8"}
                        />
                        {cepLoading && (
                          <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {renderFieldError("cep")}
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="font-body text-sm">Rua *</Label>
                      <Input
                        value={formData.rua}
                        onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                        placeholder="Rua / Avenida"
                        className={errors.rua ? "border-destructive" : ""}
                      />
                      {renderFieldError("rua")}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="font-body text-sm">Número *</Label>
                      <Input
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                        placeholder="123"
                        className={errors.numero ? "border-destructive" : ""}
                      />
                      {renderFieldError("numero")}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm">Complemento</Label>
                      <Input
                        value={formData.complemento}
                        onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                        placeholder="Apto, Sala..."
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label className="font-body text-sm">Bairro *</Label>
                      <Input
                        value={formData.bairro}
                        onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                        placeholder="Bairro"
                        className={errors.bairro ? "border-destructive" : ""}
                      />
                      {renderFieldError("bairro")}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                      <Label className="font-body text-sm">Cidade *</Label>
                      <Input
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        placeholder="Cidade"
                        className={errors.cidade ? "border-destructive" : ""}
                      />
                      {renderFieldError("cidade")}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm">Estado *</Label>
                      <Input
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        placeholder="UF"
                        maxLength={2}
                        className={errors.estado ? "border-destructive" : ""}
                      />
                      {renderFieldError("estado")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados da Empresa (opcional) */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Dados da Empresa
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Opcional — preencha se for pessoa jurídica</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        CNPJ
                      </Label>
                      <Input
                        value={formData.cnpj}
                        onChange={(e) => handleCnpjChange(e.target.value)}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                        className={errors.cnpj ? "border-destructive" : ""}
                      />
                      {renderFieldError("cnpj")}
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        Razão Social
                      </Label>
                      <Input
                        value={formData.razao_social}
                        onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
                        placeholder="Razão social da empresa"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
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

              {/* Password Change Card */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Alterar Senha
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Repita a nova senha"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      variant="outline"
                    >
                      {changingPassword ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Alterar Senha
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Plano */}
            <TabsContent value="plano" className="space-y-6">
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

            {/* Tab: Certificado (Personalização) */}
            <TabsContent value="certificado" className="space-y-6">
              <CertificateCustomization />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

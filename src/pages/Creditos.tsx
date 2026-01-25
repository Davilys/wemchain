import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { CreditBalanceCard } from "@/components/credits/CreditBalanceCard";
import { CreditHistory } from "@/components/credits/CreditHistory";
import { 
  Plus, 
  ArrowLeft,
  Loader2,
  Info,
  Shield,
  CheckCircle2,
  Zap,
  Building2,
  FileText
} from "lucide-react";

export default function Creditos() {
  const { user, loading: authLoading } = useAuth();
  const { credits, ledger, loading: creditsLoading } = useCredits();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || creditsLoading) {
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="h-9 w-9">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">Meus Créditos</h1>
            <p className="font-body text-sm text-muted-foreground">
              Gerencie seus créditos para Registros de Propriedade em Blockchain
            </p>
          </div>
        </div>

        {/* Credit Balance Card */}
        <CreditBalanceCard 
          availableCredits={credits?.available_credits || 0}
          totalCredits={credits?.total_credits || 0}
          usedCredits={credits?.used_credits || 0}
          loading={creditsLoading}
        />

        {/* Info Block */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Info className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-body text-sm text-foreground font-medium mb-1">
                  Como funcionam os créditos?
                </p>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">
                  Cada crédito corresponde a <strong className="text-foreground">um Registro de Propriedade em Blockchain</strong> com emissão de certificado digital.
                  Os créditos são liberados após confirmação do pagamento e utilizados somente após a conclusão do registro.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Section */}
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Registros de Propriedade
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Básico */}
            <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg group">
              <CardContent className="p-5">
                <div className="mb-4">
                  <p className="font-display font-bold text-foreground text-lg">Básico</p>
                  <p className="font-body text-xs text-muted-foreground">Registro avulso de propriedade</p>
                </div>
                <p className="font-display text-3xl font-bold text-primary mb-4">
                  R$ 49
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    1 Registro de Propriedade
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Certificado PDF
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Verificação pública
                  </li>
                </ul>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium">
                  <Link to="/checkout?plan=basico">
                    Comprar agora
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profissional */}
            <Card className="border-primary/40 bg-primary/5 relative hover:shadow-xl transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground font-body text-xs px-3">
                  <Zap className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
              <CardContent className="p-5 pt-6">
                <div className="mb-4">
                  <p className="font-display font-bold text-foreground text-lg">Profissional</p>
                  <p className="font-body text-xs text-muted-foreground">Economia de 40%</p>
                </div>
                <p className="font-display text-3xl font-bold text-primary mb-4">
                  R$ 149
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    <strong className="text-foreground">5 Registros</strong> de Propriedade
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Certificados PDF
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Dashboard completo
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Suporte prioritário
                  </li>
                </ul>
                <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold shadow-lg">
                  <Link to="/checkout?plan=profissional">
                    Comprar agora
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Business */}
            <Card className="border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-display font-bold text-foreground text-lg">Business</p>
                    <p className="font-body text-xs text-muted-foreground">Gestão de Propriedade Intelectual</p>
                  </div>
                </div>
                <p className="font-display text-3xl font-bold text-primary mb-1">
                  R$ 99
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <p className="font-body text-xs text-muted-foreground mb-4">1 crédito incluso + gestão completa</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    1 crédito incluso por mês
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Registros adicionais R$ 49
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Gestão de projetos
                  </li>
                  <li className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    Dashboard completo
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full font-body font-medium border-primary/30 hover:bg-primary/5">
                  <Link to="/checkout?plan=business">
                    Assinar plano
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Registration */}
        <Card className="border-dashed border-2 border-border/50 hover:border-primary/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">Registro Adicional</p>
                  <p className="font-body text-sm text-muted-foreground">1 Registro de Propriedade em Blockchain</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-bold text-primary">R$ 49</p>
                <Button asChild size="sm" variant="outline" className="mt-2 font-body">
                  <Link to="/checkout?plan=adicional">
                    <Plus className="h-4 w-4 mr-1" />
                    Comprar
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit History */}
        <CreditHistory entries={ledger} />

        {/* Transparency Notice */}
        <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Transparência:</strong> Os créditos são liberados após confirmação do pagamento e utilizados somente após a conclusão do Registro de Propriedade em Blockchain. Cada registro gera prova técnica de anterioridade com validade jurídica.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

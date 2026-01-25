import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";
import { 
  Coins, 
  Plus, 
  ArrowLeft,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOperationBadge = (operation: string) => {
    const styles = {
      ADD: { icon: TrendingUp, label: "Adição", className: "bg-success/10 text-success" },
      CONSUME: { icon: TrendingDown, label: "Consumo", className: "bg-destructive/10 text-destructive" },
      REFUND: { icon: TrendingUp, label: "Estorno", className: "bg-primary/10 text-primary" },
      ADJUST: { icon: Clock, label: "Ajuste", className: "bg-warning/10 text-warning" },
      EXPIRE: { icon: Clock, label: "Expirado", className: "bg-muted text-muted-foreground" },
    };
    const config = styles[operation as keyof typeof styles] || styles.ADJUST;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} font-body text-xs`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

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
      <div className="max-w-3xl mx-auto space-y-6">
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
              Gerencie seus créditos para registros em blockchain
            </p>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Coins className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-body text-sm text-muted-foreground">Créditos Disponíveis</p>
                  <p className="font-display text-4xl font-bold text-primary">
                    {credits?.available_credits || 0}
                  </p>
                </div>
              </div>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium">
                <Link to="/checkout">
                  <Plus className="h-4 w-4 mr-2" />
                  Comprar créditos
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-primary/10">
              <div>
                <p className="font-body text-xs text-muted-foreground">Total adquirido</p>
                <p className="font-display text-xl font-bold text-foreground">
                  {credits?.total_credits || 0}
                </p>
              </div>
              <div>
                <p className="font-body text-xs text-muted-foreground">Utilizados</p>
                <p className="font-display text-xl font-bold text-foreground">
                  {credits?.used_credits || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit History */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Histórico de Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ledger.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  Nenhuma movimentação ainda
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {ledger.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        entry.operation === 'ADD' || entry.operation === 'REFUND' 
                          ? 'bg-success/10' 
                          : 'bg-destructive/10'
                      }`}>
                        {entry.operation === 'ADD' || entry.operation === 'REFUND' ? (
                          <TrendingUp className={`h-5 w-5 ${
                            entry.operation === 'ADD' ? 'text-success' : 'text-primary'
                          }`} />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">
                          {entry.reason}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {formatDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-display font-bold ${
                        entry.operation === 'ADD' || entry.operation === 'REFUND'
                          ? 'text-success'
                          : 'text-destructive'
                      }`}>
                        {entry.operation === 'ADD' || entry.operation === 'REFUND' ? '+' : '-'}
                        {entry.amount}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        Saldo: {entry.balance_after}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plans Preview */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Planos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {/* Básico */}
              <div className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <p className="font-display font-bold text-foreground">Básico</p>
                <p className="font-display text-2xl font-bold text-primary mt-1">R$ 49</p>
                <p className="font-body text-xs text-muted-foreground">1 crédito</p>
              </div>

              {/* Profissional */}
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2">
                  <p className="font-display font-bold text-foreground">Profissional</p>
                  <Badge className="bg-primary/10 text-primary text-[10px]">Popular</Badge>
                </div>
                <p className="font-display text-2xl font-bold text-primary mt-1">R$ 149</p>
                <p className="font-body text-xs text-muted-foreground">5 créditos</p>
              </div>

              {/* Mensal */}
              <div className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                <p className="font-display font-bold text-foreground">Mensal</p>
                <p className="font-display text-2xl font-bold text-primary mt-1">R$ 99<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                <p className="font-body text-xs text-muted-foreground">5 créditos/mês</p>
              </div>
            </div>

            <Button asChild className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-medium">
              <Link to="/checkout">
                Comprar créditos
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

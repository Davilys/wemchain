import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus, TrendingUp, AlertCircle } from "lucide-react";

interface CreditBalanceCardProps {
  availableCredits: number;
  totalCredits: number;
  usedCredits: number;
  loading?: boolean;
}

export function CreditBalanceCard({ 
  availableCredits, 
  totalCredits, 
  usedCredits,
  loading 
}: CreditBalanceCardProps) {
  const usagePercentage = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  if (loading) {
    return (
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-12 w-20 bg-muted rounded" />
            <div className="h-2 w-full bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      
      <CardContent className="pt-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-body text-sm text-muted-foreground">Créditos Disponíveis</p>
              <p className="font-display text-3xl font-bold text-primary">{availableCredits}</p>
            </div>
          </div>
          
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg">
            <Link to="/checkout">
              <Plus className="h-4 w-4 mr-1" />
              Comprar
            </Link>
          </Button>
        </div>

        {/* Barra de progresso */}
        {totalCredits > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Utilizados: {usedCredits}</span>
              <span>Total: {totalCredits}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Alerta de créditos baixos */}
        {availableCredits === 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-xs text-warning font-body">
              Você não possui créditos. Adquira um plano para continuar registrando.
            </p>
          </div>
        )}

        {availableCredits > 0 && availableCredits <= 2 && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <TrendingUp className="h-4 w-4 text-warning flex-shrink-0" />
            <p className="text-xs text-warning font-body">
              Restam apenas {availableCredits} crédito{availableCredits > 1 ? 's' : ''}. Considere adquirir mais.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

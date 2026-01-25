import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RotateCcw, 
  Settings, 
  Clock,
  Sparkles
} from "lucide-react";

interface LedgerEntry {
  id: string;
  operation: "ADD" | "CONSUME" | "REFUND" | "ADJUST" | "EXPIRE";
  amount: number;
  balance_after: number;
  reason: string;
  reference_type: string | null;
  created_at: string;
}

interface CreditHistoryProps {
  entries: LedgerEntry[];
  loading?: boolean;
}

const operationConfig = {
  ADD: {
    label: "Adição",
    icon: ArrowUpCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    sign: "+",
  },
  CONSUME: {
    label: "Consumo",
    icon: ArrowDownCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    sign: "-",
  },
  REFUND: {
    label: "Estorno",
    icon: RotateCcw,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    sign: "+",
  },
  ADJUST: {
    label: "Ajuste",
    icon: Settings,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    sign: "±",
  },
  EXPIRE: {
    label: "Expiração",
    icon: Clock,
    color: "text-gray-500",
    bgColor: "bg-gray-500/10",
    sign: "-",
  },
};

export function CreditHistory({ entries, loading }: CreditHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Histórico de Créditos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 animate-pulse">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="card-premium">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Histórico de Créditos
          </CardTitle>
          <CardDescription className="font-body">
            Acompanhe todas as movimentações de créditos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8 font-body">
            Nenhuma movimentação registrada ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-premium">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Histórico de Créditos
        </CardTitle>
        <CardDescription className="font-body">
          Últimas {entries.length} movimentações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {entries.map((entry, index) => {
              const config = operationConfig[entry.operation];
              const Icon = config.icon;

              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors animate-fade-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${config.color} border-current/30 text-xs`}>
                        {config.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {entry.reference_type && `via ${entry.reference_type}`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1 font-body">
                      {entry.reason}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`font-display font-bold ${config.color}`}>
                      {config.sign}{entry.amount}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: {entry.balance_after}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

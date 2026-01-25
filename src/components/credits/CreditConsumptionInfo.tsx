import { Info, Coins } from "lucide-react";

interface CreditConsumptionInfoProps {
  variant?: "default" | "compact";
}

export function CreditConsumptionInfo({ variant = "default" }: CreditConsumptionInfoProps) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
        <Coins className="h-3 w-3" />
        <span>Este Registro de Propriedade consumirá <strong className="text-foreground">1 crédito</strong></span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Coins className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-body text-sm font-medium text-foreground">
            Este Registro de Propriedade consumirá 1 crédito
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Os créditos são liberados após confirmação do pagamento e utilizados somente após a conclusão do registro em blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}

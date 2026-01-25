import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface LegalNoticeProps {
  variant?: "warning" | "info";
  className?: string;
  showIcon?: boolean;
}

export function LegalNotice({ variant = "warning", className, showIcon = true }: LegalNoticeProps) {
  const Icon = variant === "warning" ? AlertTriangle : Info;
  
  return (
    <Alert 
      className={cn(
        "border-amber-500/30 bg-amber-500/10",
        variant === "info" && "border-cyan-500/30 bg-cyan-500/10",
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(
          "h-4 w-4",
          variant === "warning" ? "text-amber-500" : "text-cyan-500"
        )} />
      )}
      <AlertDescription className={cn(
        "text-sm",
        variant === "warning" ? "text-amber-200" : "text-cyan-200"
      )}>
        Este serviço não substitui o registro de marca, patente ou direito autoral junto aos órgãos oficiais competentes.
      </AlertDescription>
    </Alert>
  );
}

export function BlockchainImmutabilityNotice({ className }: { className?: string }) {
  return (
    <Alert className={cn("border-blue-500/30 bg-blue-500/10", className)}>
      <Info className="h-4 w-4 text-blue-400" />
      <AlertDescription className="text-sm text-blue-200">
        Registros em blockchain são imutáveis e não podem ser alterados ou excluídos.
      </AlertDescription>
    </Alert>
  );
}

export function LGPDNotice({ className }: { className?: string }) {
  return (
    <Alert className={cn("border-purple-500/30 bg-purple-500/10", className)}>
      <Info className="h-4 w-4 text-purple-400" />
      <AlertDescription className="text-sm text-purple-200">
        Seus dados são tratados conforme a LGPD (Lei nº 13.709/2018). 
        Para exercer seus direitos, acesse a seção "Privacidade" nas configurações.
      </AlertDescription>
    </Alert>
  );
}

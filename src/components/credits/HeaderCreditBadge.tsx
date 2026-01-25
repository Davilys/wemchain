import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coins, Plus, AlertTriangle } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderCreditBadgeProps {
  showBuyButton?: boolean;
  compact?: boolean;
}

export function HeaderCreditBadge({ showBuyButton = true, compact = false }: HeaderCreditBadgeProps) {
  const { credits, loading } = useCredits();
  
  const availableCredits = credits?.available_credits || 0;
  const isLowCredits = availableCredits > 0 && availableCredits <= 2;
  const noCredits = availableCredits === 0;

  return (
    <div className="flex items-center gap-2">
      {/* Credit Display */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link 
            to="/creditos"
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
              ${noCredits 
                ? 'bg-warning/10 border border-warning/20 hover:bg-warning/15' 
                : isLowCredits 
                  ? 'bg-warning/10 border border-warning/20 hover:bg-warning/15'
                  : 'bg-primary/10 border border-primary/20 hover:bg-primary/15'
              }
            `}
          >
            {noCredits || isLowCredits ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <Coins className="h-4 w-4 text-primary" />
            )}
            <span className={`font-body font-bold text-sm ${noCredits || isLowCredits ? 'text-warning' : 'text-primary'}`}>
              {loading ? "..." : availableCredits}
            </span>
            {!compact && (
              <span className="hidden sm:inline text-xs text-muted-foreground">
                crédito{availableCredits !== 1 ? 's' : ''}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-body">
          <p>Créditos disponíveis: {availableCredits}</p>
          {noCredits && <p className="text-warning text-xs">Compre créditos para registrar</p>}
        </TooltipContent>
      </Tooltip>

      {/* Buy Button */}
      {showBuyButton && (
        <Button 
          asChild 
          size="sm" 
          className={`
            hidden md:flex font-body font-medium h-8 px-3 text-xs
            ${noCredits 
              ? 'bg-warning text-warning-foreground hover:bg-warning/90' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }
          `}
        >
          <Link to="/checkout">
            <Plus className="h-3 w-3 mr-1" />
            Comprar
          </Link>
        </Button>
      )}
    </div>
  );
}

import { ReactNode } from "react";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Permission, permissionDeniedMessages } from "@/lib/adminPermissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PermissionGateProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
  hideWhenDenied?: boolean;
  showTooltip?: boolean;
}

/**
 * Componente para controlar visibilidade/habilitação baseado em permissões.
 * 
 * - Por padrão, mostra o children desabilitado quando sem permissão
 * - Com hideWhenDenied=true, esconde completamente
 * - Com showTooltip=true, mostra tooltip explicando a limitação
 */
export function PermissionGate({
  children,
  permission,
  fallback,
  hideWhenDenied = false,
  showTooltip = true,
}: PermissionGateProps) {
  const { can } = useAdminPermissions();
  const hasPermission = can(permission);

  // Se tem permissão, renderiza normalmente
  if (hasPermission) {
    return <>{children}</>;
  }

  // Se deve esconder quando negado
  if (hideWhenDenied) {
    return fallback ? <>{fallback}</> : null;
  }

  // Mensagem padrão ou customizada
  const tooltipMessage = permissionDeniedMessages[permission] || 
    "Você não tem permissão para esta ação.";

  // Renderiza desabilitado com tooltip
  const disabledContent = (
    <div className="opacity-50 cursor-not-allowed pointer-events-none">
      {children}
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            {disabledContent}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return disabledContent;
}

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission;
  children: ReactNode;
}

/**
 * Botão que é automaticamente desabilitado sem permissão
 */
export function PermissionButton({ 
  permission, 
  children, 
  disabled,
  ...props 
}: PermissionButtonProps) {
  const { can } = useAdminPermissions();
  const hasPermission = can(permission);
  
  const tooltipMessage = permissionDeniedMessages[permission] || 
    "Você não tem permissão para esta ação.";

  if (!hasPermission) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button {...props} disabled className="opacity-50 cursor-not-allowed">
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <button {...props} disabled={disabled}>
      {children}
    </button>
  );
}

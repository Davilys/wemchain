import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { Permission } from "@/lib/adminPermissions";
import { Loader2, ShieldAlert, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminGuardProps {
  children: ReactNode;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
}

export function AdminGuard({ 
  children, 
  requiredPermissions = [], 
  requireAll = false 
}: AdminGuardProps) {
  const { isAdmin, loading, can, canAny, canAll, getRoleLabel } = useAdminPermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Não é admin de nenhum tipo
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta área. Esta seção é restrita a administradores.
          </p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  // Verificar permissões específicas se fornecidas
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? canAll(requiredPermissions)
      : canAny(requiredPermissions);

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md p-8">
            <ShieldX className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Permissão Insuficiente</h1>
            <p className="text-muted-foreground mb-4">
              Seu perfil de <span className="font-medium text-foreground">{getRoleLabel()}</span> não 
              tem acesso a esta funcionalidade.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Entre em contato com um Super Admin caso precise de acesso.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

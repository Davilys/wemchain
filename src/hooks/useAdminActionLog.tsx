import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useAdminPermissions } from "./useAdminPermissions";

type AdminActionType =
  // Usuários
  | "user_viewed"
  | "user_created"
  | "user_edited"
  | "user_blocked"
  | "user_unblocked"
  | "user_password_reset"
  // Créditos
  | "credits_viewed"
  | "credits_adjusted"
  | "credits_added"
  | "credits_removed"
  | "credits_refunded"
  // Registros
  | "registro_viewed"
  | "registro_reprocessed"
  | "registro_invalidated"
  // Certificados
  | "certificate_viewed"
  | "certificate_downloaded"
  | "certificate_reissued"
  // Pagamentos
  | "payment_viewed"
  | "payment_synced"
  | "subscription_viewed"
  // Configurações
  | "config_viewed"
  | "config_changed"
  | "maintenance_enabled"
  | "maintenance_disabled"
  // Logs
  | "logs_viewed"
  | "logs_exported"
  // Admin
  | "admin_login"
  | "admin_logout"
  | "admin_created"
  | "admin_role_changed"
  | "admin_removed";

interface LogActionParams {
  actionType: AdminActionType;
  targetType?: "user" | "registro" | "certificate" | "payment" | "subscription" | "config" | "admin";
  targetId?: string;
  details?: Record<string, unknown>;
}

export function useAdminActionLog() {
  const { user } = useAuth();
  const { role } = useAdminPermissions();

  const logAction = useCallback(
    async ({ actionType, targetType, targetId, details }: LogActionParams): Promise<boolean> => {
      if (!user || !role) return false;

      try {
        // Usar type assertion pois a tabela foi criada recentemente
        const { error } = await supabase
          .from("admin_action_logs" as any)
          .insert({
            admin_id: user.id,
            admin_role: role,
            action_type: actionType,
            target_type: targetType || null,
            target_id: targetId || null,
            details: details || null,
            user_agent: navigator.userAgent,
          } as any);

        if (error) {
          console.error("Error logging admin action:", error);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error in admin action log:", error);
        return false;
      }
    },
    [user, role]
  );

  return { logAction };
}

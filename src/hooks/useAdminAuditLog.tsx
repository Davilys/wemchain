import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AdminActionType = 
  | "admin_user_created"
  | "admin_user_edited"
  | "admin_user_blocked"
  | "admin_user_unblocked"
  | "admin_user_password_reset"
  | "admin_credits_adjusted"
  | "admin_credits_added"
  | "admin_credits_removed"
  | "admin_registro_reprocessed"
  | "admin_registro_invalidated"
  | "admin_certificate_downloaded"
  | "admin_certificate_reissued"
  | "admin_config_changed"
  | "admin_login"
  | "admin_logout";

interface AdminAuditLogData {
  actionType: AdminActionType;
  targetUserId?: string;
  metadata?: Record<string, any>;
}

export function useAdminAuditLog() {
  const { user } = useAuth();

  const logAdminAction = useCallback(
    async ({ actionType, targetUserId, metadata }: AdminAuditLogData) => {
      if (!user) return false;

      try {
        const { error } = await supabase.from("audit_logs").insert({
          user_id: user.id,
          action_type: actionType,
          metadata: {
            ...metadata,
            admin_id: user.id,
            target_user_id: targetUserId,
            admin_action: true,
            timestamp: new Date().toISOString(),
          },
        });

        if (error) {
          console.error("Error logging admin action:", error);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error in admin audit log:", error);
        return false;
      }
    },
    [user]
  );

  return { logAdminAction };
}

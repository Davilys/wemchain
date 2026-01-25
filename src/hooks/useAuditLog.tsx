import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type AuditActionType = 
  | "terms_accepted"
  | "privacy_accepted"
  | "blockchain_policy_accepted"
  | "data_export_requested"
  | "data_deletion_requested"
  | "login"
  | "logout"
  | "registro_created"
  | "certificado_downloaded";

interface AuditLogData {
  actionType: AuditActionType;
  documentType?: string;
  documentVersion?: string;
  metadata?: Record<string, any>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = useCallback(
    async ({ actionType, documentType, documentVersion, metadata }: AuditLogData) => {
      if (!user) return false;

      try {
        const { error } = await supabase.from("audit_logs").insert({
          user_id: user.id,
          action_type: actionType,
          document_type: documentType || null,
          document_version: documentVersion || null,
          user_agent: navigator.userAgent,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        });

        if (error) {
          console.error("Error logging action:", error);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Error in audit log:", error);
        return false;
      }
    },
    [user]
  );

  return { logAction };
}

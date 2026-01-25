import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingRegistro?: {
    id: string;
    nome_ativo: string;
    status: string;
    created_at: string;
  };
}

export function useDuplicateCheck() {
  const [checking, setChecking] = useState(false);

  const checkDuplicateHash = useCallback(
    async (hash: string): Promise<DuplicateCheckResult> => {
      setChecking(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          return { isDuplicate: false };
        }

        const { data, error } = await supabase.rpc("check_duplicate_hash", {
          p_user_id: userData.user.id,
          p_hash: hash,
        });

        if (error) {
          console.error("Error checking duplicate:", error);
          return { isDuplicate: false };
        }

        const result = data as { 
          is_duplicate: boolean; 
          existing_registro?: {
            id: string;
            nome_ativo: string;
            status: string;
            created_at: string;
          };
        } | null;

        return {
          isDuplicate: result?.is_duplicate || false,
          existingRegistro: result?.existing_registro,
        };
      } finally {
        setChecking(false);
      }
    },
    []
  );

  return {
    checkDuplicateHash,
    checking,
  };
}

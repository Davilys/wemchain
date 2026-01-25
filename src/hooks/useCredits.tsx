import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Credits {
  id: string;
  user_id: string;
  total_credits: number;
  available_credits: number;
  used_credits: number;
  plan_type: string;
  version: number;
  last_ledger_id: string | null;
  created_at: string;
  updated_at: string;
}

interface LedgerEntry {
  id: string;
  user_id: string;
  operation: "ADD" | "CONSUME" | "REFUND" | "ADJUST" | "EXPIRE";
  amount: number;
  balance_after: number;
  reason: string;
  reference_type: string | null;
  reference_id: string | null;
  created_at: string;
}

interface UseCreditsReturn {
  credits: Credits | null;
  ledger: LedgerEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasCredits: boolean;
  consumeCredit: (registroId: string) => Promise<{ success: boolean; error?: string; remaining?: number }>;
  reconcile: () => Promise<{ success: boolean; wasConsistent: boolean }>;
}

export function useCredits(): UseCreditsReturn {
  const { user } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLedger([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar cache de créditos
      const { data: creditsData, error: creditsError } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creditsError) {
        throw creditsError;
      }

      // Buscar últimas entradas do ledger
      const { data: ledgerData, error: ledgerError } = await supabase
        .from("credits_ledger")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (ledgerError) {
        console.error("Error fetching ledger:", ledgerError);
      }

      setCredits(creditsData as Credits | null);
      setLedger((ledgerData as LedgerEntry[]) || []);
    } catch (err) {
      console.error("Error fetching credits:", err);
      setError(err instanceof Error ? err.message : "Erro ao buscar créditos");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Escutar mudanças em tempo real nos créditos
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("credits-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "credits",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Credits updated:", payload);
          if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
            setCredits(payload.new as Credits);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "credits_ledger",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Ledger entry added:", payload);
          setLedger((prev) => [payload.new as LedgerEntry, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Função para consumir crédito atomicamente
  const consumeCredit = useCallback(
    async (registroId: string): Promise<{ success: boolean; error?: string; remaining?: number }> => {
      if (!user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      try {
        const { data, error } = await supabase.rpc("consume_credit_atomic", {
          p_user_id: user.id,
          p_registro_id: registroId,
          p_reason: "Consumo para registro em blockchain",
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const result = data as { 
          success: boolean; 
          error?: string; 
          remaining_balance?: number; 
          idempotent?: boolean;
        } | null;

        if (!result?.success) {
          return { 
            success: false, 
            error: result?.idempotent 
              ? "Crédito já consumido para este registro" 
              : result?.error || "Erro ao consumir crédito" 
          };
        }

        // Atualizar estado local
        await fetchCredits();

        return { 
          success: true, 
          remaining: result.remaining_balance 
        };
      } catch (err) {
        return { 
          success: false, 
          error: err instanceof Error ? err.message : "Erro ao consumir crédito" 
        };
      }
    },
    [user, fetchCredits]
  );

  // Função para reconciliar saldo (cache vs ledger)
  const reconcile = useCallback(async (): Promise<{ success: boolean; wasConsistent: boolean }> => {
    if (!user) {
      return { success: false, wasConsistent: true };
    }

    try {
      const { data, error } = await supabase.rpc("reconcile_credit_balance", {
        p_user_id: user.id,
      });

      if (error) {
        console.error("Reconciliation error:", error);
        return { success: false, wasConsistent: true };
      }

      const result = data as { was_consistent: boolean; corrected: boolean } | null;

      if (result?.corrected) {
        await fetchCredits();
      }

      return { 
        success: true, 
        wasConsistent: result?.was_consistent ?? true 
      };
    } catch (err) {
      console.error("Reconciliation error:", err);
      return { success: false, wasConsistent: true };
    }
  }, [user, fetchCredits]);

  return {
    credits,
    ledger,
    loading,
    error,
    refetch: fetchCredits,
    hasCredits: (credits?.available_credits || 0) > 0,
    consumeCredit,
    reconcile,
  };
}

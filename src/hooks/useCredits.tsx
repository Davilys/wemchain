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
  created_at: string;
  updated_at: string;
}

interface UseCreditsReturn {
  credits: Credits | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasCredits: boolean;
}

export function useCredits(): UseCreditsReturn {
  const { user } = useAuth();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("credits")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setCredits(data);
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

  // Escutar mudanças em tempo real
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    credits,
    loading,
    error,
    refetch: fetchCredits,
    hasCredits: (credits?.available_credits || 0) > 0,
  };
}

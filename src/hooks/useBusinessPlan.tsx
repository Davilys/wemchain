import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface BusinessPlanStatus {
  isActive: boolean;
  subscription: {
    id: string;
    plan_type: string;
    status: string;
    credits_per_cycle: number;
    current_cycle: number;
    next_billing_date: string | null;
  } | null;
}

interface UseBusinessPlanReturn {
  isBusinessPlan: boolean;
  subscription: BusinessPlanStatus["subscription"];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBusinessPlan(): UseBusinessPlanReturn {
  const { user } = useAuth();
  const [isBusinessPlan, setIsBusinessPlan] = useState(false);
  const [subscription, setSubscription] = useState<BusinessPlanStatus["subscription"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessPlanStatus = useCallback(async () => {
    if (!user) {
      setIsBusinessPlan(false);
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Super admin sempre tem acesso a recursos Business
      const { data: isSuperAdmin, error: superAdminError } = await supabase.rpc(
        "is_super_admin",
        { _user_id: user.id }
      );

      if (superAdminError) {
        console.error("Error checking super admin:", superAdminError);
      }

      // Se for super_admin, conceder acesso automaticamente
      if (isSuperAdmin === true) {
        setIsBusinessPlan(true);
        setSubscription({
          id: "super_admin",
          plan_type: "BUSINESS",
          status: "ACTIVE",
          credits_per_cycle: -1, // Ilimitado
          current_cycle: 0,
          next_billing_date: null,
        });
        setLoading(false);
        return;
      }

      // Verificar via RPC se tem plano business ativo
      const { data: hasActive, error: rpcError } = await supabase.rpc(
        "has_active_business_plan",
        { _user_id: user.id }
      );

      if (rpcError) {
        console.error("Error checking business plan:", rpcError);
      }

      // Buscar detalhes da assinatura
      const { data: subscriptionData, error: subError } = await supabase
        .from("asaas_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_type", "BUSINESS")
        .maybeSingle();

      if (subError) {
        console.error("Error fetching subscription:", subError);
      }

      const isActive = hasActive === true || subscriptionData?.status === "ACTIVE";
      
      setIsBusinessPlan(isActive);
      setSubscription(subscriptionData ? {
        id: subscriptionData.id,
        plan_type: subscriptionData.plan_type,
        status: subscriptionData.status,
        credits_per_cycle: subscriptionData.credits_per_cycle,
        current_cycle: subscriptionData.current_cycle,
        next_billing_date: subscriptionData.next_billing_date,
      } : null);
    } catch (err) {
      console.error("Error in useBusinessPlan:", err);
      setError(err instanceof Error ? err.message : "Erro ao verificar plano");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBusinessPlanStatus();
  }, [fetchBusinessPlanStatus]);

  // Escutar mudanças em tempo real na assinatura
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("business-plan-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "asaas_subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Subscription updated:", payload);
          fetchBusinessPlanStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBusinessPlanStatus]);

  return {
    isBusinessPlan,
    subscription,
    loading,
    error,
    refetch: fetchBusinessPlanStatus,
  };
}

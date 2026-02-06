import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { 
  AdminRole, 
  Permission, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  isAdminRole,
  roleLabels,
  roleColors,
} from "@/lib/adminPermissions";

interface AdminPermissionsState {
  role: AdminRole | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useAdminPermissions() {
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<AdminPermissionsState>({
    role: null,
    loading: true,
    isAdmin: false,
  });
  
  // Track if we've already fetched for the current user to avoid race conditions
  const lastFetchedUserId = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    async function fetchAdminRole() {
      // If no user, clear state and stop loading
      if (!user) {
        if (isMounted.current) {
          setState({ role: null, loading: false, isAdmin: false });
          lastFetchedUserId.current = null;
        }
        return;
      }

      // Skip if we already fetched for this user
      if (lastFetchedUserId.current === user.id && !state.loading) {
        return;
      }

      // Set loading state
      if (isMounted.current) {
        setState(prev => ({ ...prev, loading: true }));
      }

      try {
        // Usar a função RPC para obter o role admin
        const { data, error } = await supabase.rpc('get_user_admin_role', {
          _user_id: user.id
        });

        if (!isMounted.current) return;

        if (error) {
          console.error("Error fetching admin role:", error);
          setState({ role: null, loading: false, isAdmin: false });
          return;
        }

        const role = data as string | null;
        lastFetchedUserId.current = user.id;
        
        if (role && isAdminRole(role)) {
          setState({ role, loading: false, isAdmin: true });
        } else {
          setState({ role: null, loading: false, isAdmin: false });
        }
      } catch (err) {
        console.error("Error in admin role check:", err);
        if (isMounted.current) {
          setState({ role: null, loading: false, isAdmin: false });
        }
      }
    }

    // Only fetch when auth is done loading
    if (!authLoading) {
      fetchAdminRole();
    }
  }, [user?.id, authLoading]);

  // Verificar permissão específica
  const can = useCallback((permission: Permission): boolean => {
    return hasPermission(state.role, permission);
  }, [state.role]);

  // Verificar se tem qualquer uma das permissões
  const canAny = useCallback((permissions: Permission[]): boolean => {
    return hasAnyPermission(state.role, permissions);
  }, [state.role]);

  // Verificar se tem todas as permissões
  const canAll = useCallback((permissions: Permission[]): boolean => {
    return hasAllPermissions(state.role, permissions);
  }, [state.role]);

  // Obter label do role
  const getRoleLabel = useCallback((): string => {
    if (!state.role) return '';
    return roleLabels[state.role];
  }, [state.role]);

  // Obter cores do role
  const getRoleColors = useCallback(() => {
    if (!state.role) return null;
    return roleColors[state.role];
  }, [state.role]);

  return {
    ...state,
    can,
    canAny,
    canAll,
    getRoleLabel,
    getRoleColors,
    // Loading should be true if auth is loading OR if permissions are loading
    loading: authLoading || state.loading,
  };
}

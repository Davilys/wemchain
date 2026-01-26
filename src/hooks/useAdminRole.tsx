import { useAdminPermissions } from "./useAdminPermissions";

/**
 * @deprecated Use useAdminPermissions instead for more granular control
 * This hook is kept for backward compatibility
 */
export function useAdminRole() {
  const { isAdmin, loading, role } = useAdminPermissions();
  
  return { 
    isAdmin, 
    loading,
    // Para compatibilidade - considera qualquer role admin como admin
    role,
  };
}

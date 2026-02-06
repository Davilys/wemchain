import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AdminLogin from "./AdminLogin";

/**
 * Smart entry point for /admin route.
 * - If loading → show spinner
 * - If not authenticated → show AdminLogin
 * - If authenticated as admin → redirect to /admin/dashboard
 * - If authenticated but not admin → redirect to /dashboard (without logout)
 */
export default function AdminEntry() {
  const { user, loading: authLoading } = useAuth();
  const [checkingRole, setCheckingRole] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAdminRole = async () => {
      if (!user) {
        if (isMounted) {
          setIsAdmin(null);
          setCheckingRole(false);
        }
        return;
      }

      setCheckingRole(true);

      try {
        const { data: adminRole, error } = await supabase.rpc('get_user_admin_role', {
          _user_id: user.id
        });

        if (isMounted) {
          // adminRole will be the role string if admin, or null if not
          setIsAdmin(!!adminRole && adminRole !== null);
          setCheckingRole(false);
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        if (isMounted) {
          setIsAdmin(false);
          setCheckingRole(false);
        }
      }
    };

    checkAdminRole();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Still loading auth or checking role
  if (authLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login
  if (!user) {
    return <AdminLogin />;
  }

  // Authenticated and is admin → redirect to dashboard
  if (isAdmin === true) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Authenticated but not admin → redirect to user dashboard (no logout!)
  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
    </div>
  );
}

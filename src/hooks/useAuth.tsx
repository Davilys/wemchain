import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, cpfCnpj?: string, phone?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Track if user intentionally signed out
  const isIntentionalSignOut = useRef(false);
  // Track if initial session has been loaded
  const initialSessionLoaded = useRef(false);

  useEffect(() => {
    // First, get the initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
        
        initialSessionLoaded.current = true;
        setLoading(false);
      } catch (error) {
        console.error("Error getting initial session:", error);
        initialSessionLoaded.current = true;
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        // Only update state after initial session is loaded to prevent race conditions
        if (!initialSessionLoaded.current) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === "SIGNED_IN") {
          // User just signed in - navigation is handled by signIn function
        } else if (event === "SIGNED_OUT") {
          // Only navigate if it was an intentional sign out
          if (isIntentionalSignOut.current) {
            isIntentionalSignOut.current = false;
            navigate("/");
          }
        } else if (event === "TOKEN_REFRESHED") {
          // Token was refreshed, session is still valid
          console.log("Token refreshed successfully");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, fullName: string, cpfCnpj?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          cpf_cnpj: cpfCnpj,
          phone: phone,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Update profile with additional data if user was created
    if (data.user && (cpfCnpj || phone)) {
      await supabase
        .from("profiles")
        .update({
          cpf_cnpj: cpfCnpj || null,
          phone: phone || null,
        })
        .eq("user_id", data.user.id);
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Você já pode acessar sua conta.",
    });

    navigate("/dashboard");
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Check if user has admin role
    if (data.user) {
      const { data: adminRole } = await supabase.rpc('get_user_admin_role', {
        _user_id: data.user.id
      });

      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });

      // Redirect to admin panel if user has admin role
      if (adminRole) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const signOut = async () => {
    // Mark this as intentional sign out before calling signOut
    isIntentionalSignOut.current = true;
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      isIntentionalSignOut.current = false;
      throw error;
    }

    toast({
      title: "Até logo!",
      description: "Você saiu da sua conta.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

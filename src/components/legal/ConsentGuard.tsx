import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useConsent } from "@/hooks/useConsent";
import { ConsentModal } from "@/components/legal/ConsentModal";
import { Loader2 } from "lucide-react";

interface ConsentGuardProps {
  children: ReactNode;
}

/**
 * Wraps authenticated routes and ensures user has accepted required terms
 */
export function ConsentGuard({ children }: ConsentGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAllConsents, loading: consentLoading, refreshConsents } = useConsent();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !consentLoading && user && !hasAllConsents) {
      setShowModal(true);
    }
  }, [authLoading, consentLoading, user, hasAllConsents]);

  // Still loading auth or consent status
  if (authLoading || (user && consentLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No user - just render children (will be redirected by auth guard)
  if (!user) {
    return <>{children}</>;
  }

  // User exists, check consent
  return (
    <>
      {children}
      <ConsentModal
        open={showModal}
        onComplete={() => {
          setShowModal(false);
          refreshConsents();
        }}
      />
    </>
  );
}

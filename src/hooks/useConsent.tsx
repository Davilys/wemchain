import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ConsentStatus {
  terms_of_use: boolean;
  privacy_policy: boolean;
  blockchain_policy: boolean;
}

interface LegalDocument {
  document_type: string;
  version: string;
  title: string;
  content: string;
}

export function useConsent() {
  const { user } = useAuth();
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({
    terms_of_use: false,
    privacy_policy: false,
    blockchain_policy: false,
  });
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);

  const fetchDocuments = useCallback(async () => {
    const { data } = await supabase
      .from("legal_documents")
      .select("document_type, version, title, content")
      .eq("is_active", true);
    
    if (data) {
      setDocuments(data);
    }
  }, []);

  const checkConsents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get active document versions
      const { data: activeDocs } = await supabase
        .from("legal_documents")
        .select("document_type, version")
        .eq("is_active", true);

      if (!activeDocs) {
        setLoading(false);
        return;
      }

      // Get user consents
      const { data: consents } = await supabase
        .from("user_consents")
        .select("document_type, document_version")
        .eq("user_id", user.id);

      const status: ConsentStatus = {
        terms_of_use: false,
        privacy_policy: false,
        blockchain_policy: false,
      };

      activeDocs.forEach((doc) => {
        const hasConsent = consents?.some(
          (c) => c.document_type === doc.document_type && c.document_version === doc.version
        );
        if (doc.document_type in status) {
          status[doc.document_type as keyof ConsentStatus] = !!hasConsent;
        }
      });

      setConsentStatus(status);
    } catch (error) {
      console.error("Error checking consents:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
    checkConsents();
  }, [fetchDocuments, checkConsents]);

  const acceptDocument = async (documentType: string) => {
    if (!user) return false;

    try {
      // Get current version
      const doc = documents.find((d) => d.document_type === documentType);
      if (!doc) return false;

      // Insert consent
      const { error: consentError } = await supabase.from("user_consents").insert({
        user_id: user.id,
        document_type: documentType,
        document_version: doc.version,
        ip_address: null, // Will be captured server-side if needed
      });

      if (consentError) throw consentError;

      // Log the action
      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action_type: `${documentType.replace("_", "_")}_accepted` as any,
        document_type: documentType,
        document_version: doc.version,
        metadata: { timestamp: new Date().toISOString() },
      });

      // Update local state
      setConsentStatus((prev) => ({
        ...prev,
        [documentType]: true,
      }));

      return true;
    } catch (error) {
      console.error("Error accepting document:", error);
      return false;
    }
  };

  const hasAllConsents = consentStatus.terms_of_use && consentStatus.privacy_policy && consentStatus.blockchain_policy;

  const getDocument = (type: string) => documents.find((d) => d.document_type === type);

  return {
    consentStatus,
    loading,
    documents,
    acceptDocument,
    hasAllConsents,
    getDocument,
    refreshConsents: checkConsents,
  };
}

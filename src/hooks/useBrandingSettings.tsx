import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BrandingSettings {
  id: string;
  logoPath: string | null;
  logoUrl: string | null;
  displayName: string;
  documentNumber: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
}

interface UseBrandingSettingsReturn {
  settings: BrandingSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveSettings: (data: Partial<Omit<BrandingSettings, 'id' | 'logoUrl' | 'isActive'>>) => Promise<boolean>;
  uploadLogo: (file: File) => Promise<string | null>;
  removeLogo: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useBrandingSettings(): UseBrandingSettingsReturn {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BrandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("business_branding_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching branding settings:", fetchError);
        setError(fetchError.message);
        return;
      }

      if (data) {
        // Get signed URL for logo if exists
        let logoUrl: string | null = null;
        if (data.logo_path) {
          const { data: signedData } = await supabase.storage
            .from("business-branding")
            .createSignedUrl(data.logo_path, 3600); // 1 hour
          logoUrl = signedData?.signedUrl || null;
        }

        setSettings({
          id: data.id,
          logoPath: data.logo_path,
          logoUrl,
          displayName: data.display_name,
          documentNumber: data.document_number,
          primaryColor: data.primary_color || "#0a3d6e",
          secondaryColor: data.secondary_color || "#0066cc",
          isActive: data.is_active,
        });
      } else {
        setSettings(null);
      }
    } catch (err) {
      console.error("Error in useBrandingSettings:", err);
      setError(err instanceof Error ? err.message : "Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (data: Partial<Omit<BrandingSettings, 'id' | 'logoUrl' | 'isActive'>>): Promise<boolean> => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: Record<string, unknown> = {};
      
      if (data.displayName !== undefined) updateData.display_name = data.displayName;
      if (data.documentNumber !== undefined) updateData.document_number = data.documentNumber;
      if (data.primaryColor !== undefined) updateData.primary_color = data.primaryColor;
      if (data.secondaryColor !== undefined) updateData.secondary_color = data.secondaryColor;
      if (data.logoPath !== undefined) updateData.logo_path = data.logoPath;

      if (settings) {
        // Update existing
        const { error: updateError } = await supabase
          .from("business_branding_settings")
          .update(updateData)
          .eq("id", settings.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("business_branding_settings")
          .insert({
            user_id: user.id,
            display_name: data.displayName || "",
            document_number: data.documentNumber || "",
            primary_color: data.primaryColor || "#0a3d6e",
            secondary_color: data.secondaryColor || "#0066cc",
            logo_path: data.logoPath || null,
          });

        if (insertError) throw insertError;
      }

      toast.success("Configurações salvas com sucesso!");
      await fetchSettings();
      return true;
    } catch (err) {
      console.error("Error saving branding settings:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao salvar configurações";
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return null;
    }

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo: 2MB");
      return null;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipo de arquivo inválido. Use: PNG, JPG, SVG ou WebP");
      return null;
    }

    try {
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Remove old logo if exists
      if (settings?.logoPath) {
        await supabase.storage
          .from("business-branding")
          .remove([settings.logoPath]);
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("business-branding")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      toast.success("Logo enviada com sucesso!");
      return filePath;
    } catch (err) {
      console.error("Error uploading logo:", err);
      toast.error("Erro ao enviar logo");
      return null;
    }
  };

  const removeLogo = async (): Promise<void> => {
    if (!user || !settings?.logoPath) return;

    try {
      // Remove from storage
      await supabase.storage
        .from("business-branding")
        .remove([settings.logoPath]);

      // Update database
      await supabase
        .from("business_branding_settings")
        .update({ logo_path: null })
        .eq("id", settings.id);

      toast.success("Logo removida");
      await fetchSettings();
    } catch (err) {
      console.error("Error removing logo:", err);
      toast.error("Erro ao remover logo");
    }
  };

  return {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    uploadLogo,
    removeLogo,
    refetch: fetchSettings,
  };
}

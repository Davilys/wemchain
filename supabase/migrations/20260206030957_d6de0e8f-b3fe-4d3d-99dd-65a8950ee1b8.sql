-- ==============================================
-- BUSINESS BRANDING SETTINGS TABLE
-- ==============================================

-- Tabela para armazenar configurações de branding dos usuários Business
CREATE TABLE public.business_branding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  logo_path TEXT,
  display_name TEXT NOT NULL,
  document_number TEXT NOT NULL,
  primary_color TEXT DEFAULT '#0a3d6e',
  secondary_color TEXT DEFAULT '#0066cc',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_branding_settings ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
CREATE TRIGGER update_business_branding_updated_at
BEFORE UPDATE ON public.business_branding_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==============================================
-- RLS POLICIES
-- ==============================================

-- Usuários podem ver suas próprias configurações
CREATE POLICY "Users can view own branding"
  ON public.business_branding_settings FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários Business podem inserir suas configurações
CREATE POLICY "Business users can insert branding"
  ON public.business_branding_settings FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Usuários Business podem atualizar suas configurações
CREATE POLICY "Business users can update branding"
  ON public.business_branding_settings FOR UPDATE
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Super admins podem ver e editar todas configurações
CREATE POLICY "Admins can view all branding"
  ON public.business_branding_settings FOR SELECT
  USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can manage all branding"
  ON public.business_branding_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ==============================================
-- STORAGE BUCKET FOR BUSINESS LOGOS
-- ==============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-branding', 
  'business-branding', 
  false,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
);

-- Storage policies para logos

-- Upload: apenas usuários Business podem fazer upload na sua pasta
CREATE POLICY "Business users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM public.asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Select: usuários podem visualizar seus próprios logos
CREATE POLICY "Users can view own logos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Update: usuários podem atualizar seus logos
CREATE POLICY "Users can update own logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM public.asaas_subscriptions
      WHERE user_id = auth.uid()
      AND plan_type = 'BUSINESS'
      AND status = 'ACTIVE'
    )
  );

-- Delete: usuários podem deletar seus logos
CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-branding' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ==============================================
-- TRIGGER PARA DESATIVAR BRANDING QUANDO ASSINATURA VENCE
-- ==============================================

CREATE OR REPLACE FUNCTION public.deactivate_branding_on_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se assinatura Business foi cancelada/expirada/suspensa
  IF NEW.status IN ('CANCELLED', 'EXPIRED', 'SUSPENDED') 
     AND OLD.status = 'ACTIVE' 
     AND OLD.plan_type = 'BUSINESS' THEN
    UPDATE public.business_branding_settings
    SET is_active = false, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Se assinatura Business foi reativada
  IF NEW.status = 'ACTIVE' 
     AND OLD.status != 'ACTIVE' 
     AND NEW.plan_type = 'BUSINESS' THEN
    UPDATE public.business_branding_settings
    SET is_active = true, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_branding_on_subscription_change
AFTER UPDATE ON public.asaas_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.deactivate_branding_on_subscription_change();
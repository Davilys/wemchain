
-- =============================================
-- SISTEMA DE PARCERIAS (INFLUENCIADORES)
-- =============================================

-- 1. Tabela partner_links
CREATE TABLE public.partner_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;

-- Somente super_admin pode gerenciar links de parceria
CREATE POLICY "Super admins can manage partner links"
  ON public.partner_links
  FOR ALL
  USING (public.is_super_admin(auth.uid()));

-- 2. Novos campos na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN is_partner BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN partner_status TEXT DEFAULT NULL,
  ADD COLUMN partner_link_id UUID REFERENCES public.partner_links(id) DEFAULT NULL,
  ADD COLUMN instagram_url TEXT DEFAULT NULL,
  ADD COLUMN tiktok_url TEXT DEFAULT NULL,
  ADD COLUMN unlimited_credits BOOLEAN NOT NULL DEFAULT false;

-- 3. Função para aprovar/bloquear parceiro
CREATE OR REPLACE FUNCTION public.handle_partner_approval(
  p_user_id UUID,
  p_action TEXT, -- 'approve' ou 'block'
  p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_current_status TEXT;
BEGIN
  -- Verificar se é super_admin
  SELECT public.is_super_admin(p_admin_id) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas super admins podem gerenciar parcerias');
  END IF;

  -- Verificar status atual
  SELECT partner_status INTO v_current_status
  FROM public.profiles
  WHERE user_id = p_user_id AND is_partner = true;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não é parceiro');
  END IF;

  IF p_action = 'approve' THEN
    UPDATE public.profiles
    SET partner_status = 'approved',
        unlimited_credits = true,
        is_blocked = false,
        blocked_at = NULL,
        blocked_reason = NULL,
        updated_at = now()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('success', true, 'action', 'approved');

  ELSIF p_action = 'block' THEN
    UPDATE public.profiles
    SET partner_status = 'blocked',
        unlimited_credits = false,
        is_blocked = true,
        blocked_at = now(),
        blocked_reason = 'Parceria bloqueada pelo administrador',
        updated_at = now()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object('success', true, 'action', 'blocked');

  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Ação inválida. Use approve ou block');
  END IF;
END;
$$;

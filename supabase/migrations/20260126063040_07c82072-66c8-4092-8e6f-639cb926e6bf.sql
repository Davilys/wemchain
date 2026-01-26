-- 1. Criar função para verificar múltiplos roles admin
CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'suporte', 'financeiro', 'auditor')
  )
$$;

-- 2. Criar função para obter role admin do usuário
CREATE OR REPLACE FUNCTION public.get_user_admin_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin', 'suporte', 'financeiro', 'auditor')
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'suporte' THEN 3
      WHEN 'financeiro' THEN 4
      WHEN 'auditor' THEN 5
    END
  LIMIT 1
$$;

-- 3. Atualizar políticas RLS para profiles - admins podem ver todos
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_any_admin_role(auth.uid()));

-- 4. Atualizar políticas RLS para credits - admins podem ver todos
DROP POLICY IF EXISTS "Admins can view all credits" ON public.credits;
CREATE POLICY "Admins can view all credits"
ON public.credits FOR SELECT
USING (has_any_admin_role(auth.uid()));

-- 5. Criar tabela de log de ações administrativas
CREATE TABLE IF NOT EXISTS public.admin_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_role text NOT NULL,
  action_type text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Habilitar RLS
ALTER TABLE public.admin_action_logs ENABLE ROW LEVEL SECURITY;

-- 7. Política: Super admins e auditores podem ver todos os logs
CREATE POLICY "Super admins and auditors can view all admin logs"
ON public.admin_action_logs FOR SELECT
USING (
  has_role(auth.uid(), 'super_admin') OR 
  has_role(auth.uid(), 'auditor')
);

-- 8. Política: Admins podem ver logs (somente leitura)
CREATE POLICY "Admins can view admin logs"
ON public.admin_action_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 9. Política: Qualquer admin pode inserir logs
CREATE POLICY "Any admin can insert logs"
ON public.admin_action_logs FOR INSERT
WITH CHECK (has_any_admin_role(auth.uid()));

-- 10. Índices para performance
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_id ON public.admin_action_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON public.admin_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_action_type ON public.admin_action_logs(action_type);
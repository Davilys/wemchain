-- Adicionar coluna is_blocked na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN is_blocked boolean NOT NULL DEFAULT false;

-- Adicionar coluna blocked_at para registro de data
ALTER TABLE public.profiles 
ADD COLUMN blocked_at timestamp with time zone DEFAULT NULL;

-- Adicionar coluna blocked_reason para motivo
ALTER TABLE public.profiles 
ADD COLUMN blocked_reason text DEFAULT NULL;

-- Criar índice para consultas de usuários bloqueados
CREATE INDEX idx_profiles_is_blocked ON public.profiles(is_blocked);

-- Permitir que admins atualizem profiles de outros usuários (para bloquear)
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_any_admin_role(auth.uid()));
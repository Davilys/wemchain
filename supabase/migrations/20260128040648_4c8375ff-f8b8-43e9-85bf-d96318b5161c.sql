-- =====================================================
-- CORREÇÃO DE SEGURANÇA CRÍTICA: Políticas RLS
-- WebMarcas - Auditoria Final
-- =====================================================

-- 1. CORREÇÃO CRÍTICA: Restringir acesso público à tabela registros
-- Problema: A política atual permite SELECT de TODOS os registros confirmados
-- Solução: Limitar busca pública APENAS por hash específico via função

-- Remover política pública permissiva existente
DROP POLICY IF EXISTS "Public can verify confirmed registros by hash only" ON public.registros;

-- Criar view pública segura que expõe apenas dados necessários para verificação
CREATE OR REPLACE VIEW public.registros_verificacao_publica
WITH (security_invoker=on) AS
  SELECT 
    id,
    nome_ativo,
    tipo_ativo,
    arquivo_nome,
    hash_sha256,
    status,
    created_at
  FROM public.registros
  WHERE status = 'confirmado';

-- Política de acesso à view (para usuários anônimos via service role nas edge functions)
-- A edge function verify-timestamp já usa service role, então não precisa de política pública

-- 2. BLOQUEIO de UPDATE/DELETE em tabelas financeiras (proteção adicional)
-- Política explícita de DENY para updates em asaas_payments por usuários
CREATE POLICY "Users cannot update payment records"
ON public.asaas_payments
FOR UPDATE
USING (false);

CREATE POLICY "Users cannot delete payment records"
ON public.asaas_payments
FOR DELETE
USING (false);

-- 3. BLOQUEIO de UPDATE/DELETE em pagamentos
CREATE POLICY "Users cannot update pagamentos records"
ON public.pagamentos
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "Users cannot delete pagamentos records"
ON public.pagamentos
FOR DELETE
TO authenticated
USING (false);

-- 4. Garantir que tabela profiles não é acessível publicamente
-- A tabela já tem RLS habilitado e políticas corretas, mas vamos reforçar
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 5. Adicionar índice para buscas por hash (performance na verificação pública)
CREATE INDEX IF NOT EXISTS idx_registros_hash_status 
ON public.registros (hash_sha256, status) 
WHERE status = 'confirmado';

-- 6. Política para bloquear acesso anônimo direto à tabela registros
CREATE POLICY "Block anonymous access to registros"
ON public.registros
FOR SELECT
TO anon
USING (false);
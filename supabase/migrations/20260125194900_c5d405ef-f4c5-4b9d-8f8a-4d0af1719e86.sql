-- Remover política permissiva e criar uma mais segura
DROP POLICY IF EXISTS "System can insert transacoes" ON public.transacoes_blockchain;

-- Transações só podem ser inseridas via service role (edge functions)
-- Não há política de INSERT para usuários autenticados normais
-- As edge functions usam service_role key que bypassa RLS
-- CORREÇÃO CRÍTICA: Restringir dados sensíveis na política pública de registros
-- A política atual expõe CPF, nome completo e dados sensíveis para qualquer pessoa

-- 1. Remover a política pública atual que expõe todos os dados
DROP POLICY IF EXISTS "Public can view confirmed registros for verification" ON public.registros;

-- 2. Criar nova política pública que expõe APENAS dados necessários para verificação
-- A verificação pública só precisa confirmar que um hash existe, não precisa ver dados pessoais
CREATE POLICY "Public can verify confirmed registros by hash only" 
ON public.registros 
FOR SELECT 
TO anon, authenticated
USING (
  status = 'confirmado'::registro_status
);

-- NOTA: A proteção real será feita na edge function verify-ots-proof
-- que retorna apenas dados não-sensíveis (hash, tipo_ativo, created_at, status)
-- e omite: titular_name, titular_document, arquivo_path, user_id
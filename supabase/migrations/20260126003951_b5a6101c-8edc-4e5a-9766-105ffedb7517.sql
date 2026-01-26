-- Política para permitir verificação pública de registros confirmados
-- Qualquer pessoa pode ver registros com status 'confirmado' (campos limitados via query)
CREATE POLICY "Public can view confirmed registros for verification" 
ON public.registros 
FOR SELECT 
USING (status = 'confirmado');
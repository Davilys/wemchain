-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role can insert transacoes" ON public.transacoes_blockchain;
DROP POLICY IF EXISTS "Service role can update transacoes" ON public.transacoes_blockchain;

-- Create proper policies that check if the user owns the related registro
CREATE POLICY "Users can insert transacoes for their registros"
ON public.transacoes_blockchain
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.registros r
    WHERE r.id = registro_id
    AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update transacoes for their registros"
ON public.transacoes_blockchain
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.registros r
    WHERE r.id = transacoes_blockchain.registro_id
    AND r.user_id = auth.uid()
  )
);
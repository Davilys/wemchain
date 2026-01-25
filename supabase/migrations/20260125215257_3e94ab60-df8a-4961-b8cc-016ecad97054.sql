-- Tabela de logs de execução de processamento
CREATE TABLE IF NOT EXISTS public.processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID NOT NULL REFERENCES public.registros(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  calendar_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processing_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para processing_logs
CREATE POLICY "Users can view logs of their own registros"
ON public.processing_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.registros r
    WHERE r.id = processing_logs.registro_id
    AND r.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all processing logs"
ON public.processing_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Adicionar coluna error_message na tabela registros para armazenar erros
ALTER TABLE public.registros 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Atualizar função consume_credit para retornar mais informações
CREATE OR REPLACE FUNCTION public.consume_credit_safe(p_user_id uuid, p_registro_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available INTEGER;
  v_registro_status TEXT;
BEGIN
  -- Verificar se o registro existe e está confirmado
  SELECT status INTO v_registro_status
  FROM public.registros
  WHERE id = p_registro_id AND user_id = p_user_id;

  IF v_registro_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro não encontrado');
  END IF;

  IF v_registro_status != 'confirmado' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Registro não está confirmado, crédito não pode ser consumido');
  END IF;

  -- Obter créditos disponíveis com lock
  SELECT available_credits INTO v_available
  FROM public.credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_available IS NULL OR v_available < 1 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Créditos insuficientes', 'available', COALESCE(v_available, 0));
  END IF;

  -- Consumir crédito
  UPDATE public.credits
  SET 
    available_credits = available_credits - 1,
    used_credits = used_credits + 1,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('success', true, 'remaining_credits', v_available - 1);
END;
$$;
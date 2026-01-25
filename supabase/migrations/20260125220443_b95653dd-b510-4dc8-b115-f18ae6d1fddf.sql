-- =====================================================
-- INTEGRAÇÃO ASAAS EM PRODUÇÃO
-- Tabelas e funções para processamento de webhooks
-- =====================================================

-- 1. Tabela de Assinaturas ASAAS (Recorrência)
CREATE TABLE public.asaas_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    asaas_subscription_id TEXT UNIQUE NOT NULL,
    asaas_customer_id TEXT,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    credits_per_cycle INTEGER NOT NULL DEFAULT 5,
    current_cycle INTEGER NOT NULL DEFAULT 0,
    next_billing_date DATE,
    last_credit_reset_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Tabela de Logs de Webhooks (Auditoria Imutável)
CREATE TABLE public.asaas_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    asaas_payment_id TEXT,
    asaas_subscription_id TEXT,
    raw_payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    action_taken TEXT,
    credits_released INTEGER DEFAULT 0,
    error_message TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Índices para performance
CREATE INDEX idx_asaas_subscriptions_user_id ON public.asaas_subscriptions(user_id);
CREATE INDEX idx_asaas_subscriptions_status ON public.asaas_subscriptions(status);
CREATE INDEX idx_asaas_webhook_logs_event_type ON public.asaas_webhook_logs(event_type);
CREATE INDEX idx_asaas_webhook_logs_payment_id ON public.asaas_webhook_logs(asaas_payment_id);
CREATE INDEX idx_asaas_payments_asaas_id ON public.asaas_payments(asaas_payment_id);

-- 4. Enable RLS
ALTER TABLE public.asaas_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asaas_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies para asaas_subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.asaas_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
ON public.asaas_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. RLS Policies para asaas_webhook_logs (somente admins e sistema)
CREATE POLICY "Admins can view all webhook logs"
ON public.asaas_webhook_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Service role pode inserir logs (webhooks não têm auth)
-- Webhook logs são inseridos via service_role, não precisam de policy de INSERT para usuários

-- 7. Função para liberar créditos via webhook (IDEMPOTENTE)
CREATE OR REPLACE FUNCTION public.release_credits_from_payment(
    p_user_id UUID,
    p_credits INTEGER,
    p_plan_type TEXT,
    p_asaas_payment_id TEXT,
    p_is_subscription BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_already_processed BOOLEAN;
    v_current_credits INTEGER;
BEGIN
    -- IDEMPOTÊNCIA: Verificar se este payment_id já foi processado
    SELECT EXISTS (
        SELECT 1 FROM public.asaas_payments 
        WHERE asaas_payment_id = p_asaas_payment_id 
        AND status = 'CONFIRMED'
    ) INTO v_already_processed;
    
    IF v_already_processed THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Pagamento já processado anteriormente',
            'idempotent', true
        );
    END IF;
    
    -- Atualizar status do pagamento para CONFIRMED
    UPDATE public.asaas_payments
    SET status = 'CONFIRMED', paid_at = now(), updated_at = now()
    WHERE asaas_payment_id = p_asaas_payment_id;
    
    -- Se for assinatura mensal, resetar créditos (não acumulam)
    IF p_is_subscription THEN
        -- Verificar se usuário já tem créditos
        IF EXISTS (SELECT 1 FROM public.credits WHERE user_id = p_user_id) THEN
            UPDATE public.credits
            SET 
                available_credits = p_credits,
                total_credits = p_credits,
                used_credits = 0,
                plan_type = p_plan_type,
                updated_at = now()
            WHERE user_id = p_user_id;
        ELSE
            INSERT INTO public.credits (user_id, total_credits, available_credits, plan_type)
            VALUES (p_user_id, p_credits, p_credits, p_plan_type);
        END IF;
    ELSE
        -- Planos avulsos: acumular créditos
        INSERT INTO public.credits (user_id, total_credits, available_credits, plan_type)
        VALUES (p_user_id, p_credits, p_credits, p_plan_type)
        ON CONFLICT (user_id) DO UPDATE SET
            total_credits = credits.total_credits + p_credits,
            available_credits = credits.available_credits + p_credits,
            plan_type = p_plan_type,
            updated_at = now();
    END IF;
    
    -- Retornar créditos atualizados
    SELECT available_credits INTO v_current_credits
    FROM public.credits WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'credits_released', p_credits,
        'available_credits', v_current_credits
    );
END;
$$;

-- 8. Função para atualizar subscription status
CREATE OR REPLACE FUNCTION public.update_subscription_status(
    p_asaas_subscription_id TEXT,
    p_status TEXT,
    p_next_billing_date DATE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.asaas_subscriptions
    SET 
        status = p_status,
        next_billing_date = COALESCE(p_next_billing_date, next_billing_date),
        current_cycle = CASE WHEN p_status = 'ACTIVE' THEN current_cycle + 1 ELSE current_cycle END,
        last_credit_reset_at = CASE WHEN p_status = 'ACTIVE' THEN now() ELSE last_credit_reset_at END,
        updated_at = now()
    WHERE asaas_subscription_id = p_asaas_subscription_id;
    
    RETURN FOUND;
END;
$$;

-- 9. Função para obter user_id de uma subscription
CREATE OR REPLACE FUNCTION public.get_subscription_user_id(
    p_asaas_subscription_id TEXT
)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT user_id FROM public.asaas_subscriptions
    WHERE asaas_subscription_id = p_asaas_subscription_id
    LIMIT 1;
$$;

-- 10. Função para obter user_id de um pagamento
CREATE OR REPLACE FUNCTION public.get_payment_user_id(
    p_asaas_payment_id TEXT
)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT user_id FROM public.asaas_payments
    WHERE asaas_payment_id = p_asaas_payment_id
    LIMIT 1;
$$;

-- 11. Trigger para updated_at nas subscriptions
CREATE TRIGGER update_asaas_subscriptions_updated_at
BEFORE UPDATE ON public.asaas_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
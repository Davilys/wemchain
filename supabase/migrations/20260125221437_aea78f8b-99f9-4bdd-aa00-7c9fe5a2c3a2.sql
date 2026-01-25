-- =====================================================
-- SISTEMA DE CRÉDITOS - EDGE CASES & LIVRO-RAZÃO
-- Consistência transacional e tolerância a falhas
-- =====================================================

-- 1. Tipo ENUM para operações de crédito
CREATE TYPE public.credit_operation AS ENUM ('ADD', 'CONSUME', 'REFUND', 'ADJUST', 'EXPIRE');

-- 2. Tabela LIVRO-RAZÃO (source of truth)
CREATE TABLE public.credits_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    operation credit_operation NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    reason TEXT NOT NULL,
    reference_type TEXT, -- 'payment' | 'registro' | 'admin' | 'subscription'
    reference_id TEXT, -- payment_id, registro_id, admin_user_id
    metadata JSONB,
    ip_address TEXT,
    created_by UUID, -- admin que fez ajuste manual
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Índices para performance
CREATE INDEX idx_credits_ledger_user_id ON public.credits_ledger(user_id);
CREATE INDEX idx_credits_ledger_operation ON public.credits_ledger(operation);
CREATE INDEX idx_credits_ledger_reference ON public.credits_ledger(reference_type, reference_id);
CREATE INDEX idx_credits_ledger_created_at ON public.credits_ledger(created_at DESC);

-- 4. Adicionar coluna de idempotência na tabela credits
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS last_ledger_id UUID;
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- 5. Enable RLS no ledger
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para ledger
CREATE POLICY "Users can view their own ledger"
ON public.credits_ledger
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ledger entries"
ON public.credits_ledger
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Ledger é INSERT-only via service role (imutável)

-- 7. Função para calcular saldo atual via ledger (source of truth)
CREATE OR REPLACE FUNCTION public.get_ledger_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT COALESCE(
        (SELECT balance_after FROM public.credits_ledger 
         WHERE user_id = p_user_id 
         ORDER BY created_at DESC 
         LIMIT 1),
        0
    ) INTO v_balance;
    
    RETURN v_balance;
END;
$$;

-- 8. Função ATÔMICA para adicionar créditos (via pagamento)
CREATE OR REPLACE FUNCTION public.add_credits_atomic(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_reference_type TEXT,
    p_reference_id TEXT,
    p_is_subscription BOOLEAN DEFAULT false,
    p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_ledger_id UUID;
    v_already_processed BOOLEAN;
BEGIN
    -- LOCK: Prevenir race conditions
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
    
    -- IDEMPOTÊNCIA: Verificar se reference_id já foi processado
    SELECT EXISTS (
        SELECT 1 FROM public.credits_ledger 
        WHERE reference_id = p_reference_id 
        AND reference_type = p_reference_type
        AND operation = 'ADD'
    ) INTO v_already_processed;
    
    IF v_already_processed THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Referência já processada anteriormente',
            'idempotent', true
        );
    END IF;
    
    -- Obter saldo atual via ledger
    v_current_balance := public.get_ledger_balance(p_user_id);
    
    -- Para assinatura mensal: resetar saldo
    IF p_is_subscription THEN
        -- Registrar expiração dos créditos antigos (se houver)
        IF v_current_balance > 0 THEN
            INSERT INTO public.credits_ledger (
                user_id, operation, amount, balance_after, reason,
                reference_type, reference_id, metadata
            ) VALUES (
                p_user_id, 'EXPIRE', v_current_balance, 0,
                'Expiração de créditos por renovação de assinatura',
                'subscription', p_reference_id,
                jsonb_build_object('expired_credits', v_current_balance)
            );
        END IF;
        v_new_balance := p_amount;
    ELSE
        -- Plano avulso: acumular
        v_new_balance := v_current_balance + p_amount;
    END IF;
    
    -- Inserir no ledger
    INSERT INTO public.credits_ledger (
        user_id, operation, amount, balance_after, reason,
        reference_type, reference_id, metadata
    ) VALUES (
        p_user_id, 'ADD', p_amount, v_new_balance, p_reason,
        p_reference_type, p_reference_id, p_metadata
    )
    RETURNING id INTO v_ledger_id;
    
    -- Atualizar cache de saldo
    INSERT INTO public.credits (user_id, total_credits, available_credits, used_credits, plan_type, last_ledger_id, version)
    VALUES (p_user_id, p_amount, v_new_balance, 0, COALESCE(p_reference_type, 'BASICO'), v_ledger_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_credits = CASE WHEN p_is_subscription THEN p_amount ELSE credits.total_credits + p_amount END,
        available_credits = v_new_balance,
        used_credits = CASE WHEN p_is_subscription THEN 0 ELSE credits.used_credits END,
        last_ledger_id = v_ledger_id,
        version = credits.version + 1,
        updated_at = now();
    
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'amount_added', p_amount,
        'new_balance', v_new_balance,
        'was_subscription_reset', p_is_subscription AND v_current_balance > 0
    );
END;
$$;

-- 9. Função ATÔMICA para consumir crédito (registro em blockchain)
CREATE OR REPLACE FUNCTION public.consume_credit_atomic(
    p_user_id UUID,
    p_registro_id UUID,
    p_reason TEXT DEFAULT 'Consumo para registro em blockchain'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_ledger_id UUID;
    v_registro_status TEXT;
    v_registro_hash TEXT;
    v_already_consumed BOOLEAN;
BEGIN
    -- LOCK: Prevenir race conditions por usuário
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
    
    -- Verificar se registro existe e pertence ao usuário
    SELECT status, hash_sha256 INTO v_registro_status, v_registro_hash
    FROM public.registros
    WHERE id = p_registro_id AND user_id = p_user_id;
    
    IF v_registro_status IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Registro não encontrado ou não pertence ao usuário'
        );
    END IF;
    
    -- IDEMPOTÊNCIA: Verificar se crédito já foi consumido para este registro
    SELECT EXISTS (
        SELECT 1 FROM public.credits_ledger 
        WHERE reference_id = p_registro_id::text 
        AND reference_type = 'registro'
        AND operation = 'CONSUME'
    ) INTO v_already_consumed;
    
    IF v_already_consumed THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Crédito já consumido para este registro',
            'idempotent', true
        );
    END IF;
    
    -- Obter saldo atual via ledger
    v_current_balance := public.get_ledger_balance(p_user_id);
    
    -- Verificar saldo suficiente
    IF v_current_balance < 1 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Créditos insuficientes',
            'available', v_current_balance
        );
    END IF;
    
    v_new_balance := v_current_balance - 1;
    
    -- Inserir no ledger
    INSERT INTO public.credits_ledger (
        user_id, operation, amount, balance_after, reason,
        reference_type, reference_id, metadata
    ) VALUES (
        p_user_id, 'CONSUME', 1, v_new_balance, p_reason,
        'registro', p_registro_id::text,
        jsonb_build_object('registro_hash', v_registro_hash)
    )
    RETURNING id INTO v_ledger_id;
    
    -- Atualizar cache de saldo
    UPDATE public.credits
    SET 
        available_credits = v_new_balance,
        used_credits = used_credits + 1,
        last_ledger_id = v_ledger_id,
        version = version + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'credits_consumed', 1,
        'remaining_balance', v_new_balance
    );
END;
$$;

-- 10. Função para estorno de crédito (apenas admin)
CREATE OR REPLACE FUNCTION public.refund_credit_atomic(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT,
    p_reference_id TEXT,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_ledger_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Verificar se é admin
    SELECT public.has_role(p_admin_id, 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Apenas administradores podem estornar créditos'
        );
    END IF;
    
    -- LOCK
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
    
    v_current_balance := public.get_ledger_balance(p_user_id);
    v_new_balance := v_current_balance + p_amount;
    
    -- Inserir no ledger
    INSERT INTO public.credits_ledger (
        user_id, operation, amount, balance_after, reason,
        reference_type, reference_id, created_by, metadata
    ) VALUES (
        p_user_id, 'REFUND', p_amount, v_new_balance, p_reason,
        'admin', p_reference_id, p_admin_id,
        jsonb_build_object('refunded_by', p_admin_id)
    )
    RETURNING id INTO v_ledger_id;
    
    -- Atualizar cache
    UPDATE public.credits
    SET 
        available_credits = v_new_balance,
        total_credits = total_credits + p_amount,
        last_ledger_id = v_ledger_id,
        version = version + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'amount_refunded', p_amount,
        'new_balance', v_new_balance
    );
END;
$$;

-- 11. Função para ajuste administrativo
CREATE OR REPLACE FUNCTION public.adjust_credit_atomic(
    p_user_id UUID,
    p_new_balance INTEGER,
    p_reason TEXT,
    p_admin_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_balance INTEGER;
    v_difference INTEGER;
    v_ledger_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Verificar se é admin
    SELECT public.has_role(p_admin_id, 'admin') INTO v_is_admin;
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Apenas administradores podem ajustar créditos'
        );
    END IF;
    
    IF p_new_balance < 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Saldo não pode ser negativo'
        );
    END IF;
    
    -- LOCK
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
    
    v_current_balance := public.get_ledger_balance(p_user_id);
    v_difference := ABS(p_new_balance - v_current_balance);
    
    IF v_difference = 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Novo saldo igual ao atual, nenhuma alteração necessária'
        );
    END IF;
    
    -- Inserir no ledger
    INSERT INTO public.credits_ledger (
        user_id, operation, amount, balance_after, reason,
        reference_type, reference_id, created_by, metadata
    ) VALUES (
        p_user_id, 'ADJUST', v_difference, p_new_balance, p_reason,
        'admin', 'manual_adjustment', p_admin_id,
        jsonb_build_object(
            'previous_balance', v_current_balance,
            'adjusted_by', p_admin_id,
            'adjustment_type', CASE WHEN p_new_balance > v_current_balance THEN 'increase' ELSE 'decrease' END
        )
    )
    RETURNING id INTO v_ledger_id;
    
    -- Atualizar cache
    UPDATE public.credits
    SET 
        available_credits = p_new_balance,
        last_ledger_id = v_ledger_id,
        version = version + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    -- Se não existir, criar
    IF NOT FOUND THEN
        INSERT INTO public.credits (user_id, total_credits, available_credits, last_ledger_id)
        VALUES (p_user_id, p_new_balance, p_new_balance, v_ledger_id);
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'previous_balance', v_current_balance,
        'new_balance', p_new_balance,
        'difference', v_difference
    );
END;
$$;

-- 12. Função para verificar e reconciliar saldo (cache vs ledger)
CREATE OR REPLACE FUNCTION public.reconcile_credit_balance(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ledger_balance INTEGER;
    v_cache_balance INTEGER;
    v_is_consistent BOOLEAN;
BEGIN
    v_ledger_balance := public.get_ledger_balance(p_user_id);
    
    SELECT available_credits INTO v_cache_balance
    FROM public.credits WHERE user_id = p_user_id;
    
    v_is_consistent := (COALESCE(v_cache_balance, 0) = v_ledger_balance);
    
    IF NOT v_is_consistent THEN
        -- Corrigir cache automaticamente
        UPDATE public.credits
        SET available_credits = v_ledger_balance, updated_at = now()
        WHERE user_id = p_user_id;
    END IF;
    
    RETURN jsonb_build_object(
        'ledger_balance', v_ledger_balance,
        'cache_balance', COALESCE(v_cache_balance, 0),
        'was_consistent', v_is_consistent,
        'corrected', NOT v_is_consistent
    );
END;
$$;

-- 13. Função para verificar hash duplicado
CREATE OR REPLACE FUNCTION public.check_duplicate_hash(
    p_user_id UUID,
    p_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_registro RECORD;
BEGIN
    SELECT id, nome_ativo, status, created_at
    INTO v_existing_registro
    FROM public.registros
    WHERE user_id = p_user_id 
    AND hash_sha256 = p_hash
    AND status != 'falhou'
    LIMIT 1;
    
    IF FOUND THEN
        RETURN jsonb_build_object(
            'is_duplicate', true,
            'existing_registro', jsonb_build_object(
                'id', v_existing_registro.id,
                'nome_ativo', v_existing_registro.nome_ativo,
                'status', v_existing_registro.status,
                'created_at', v_existing_registro.created_at
            )
        );
    END IF;
    
    RETURN jsonb_build_object('is_duplicate', false);
END;
$$;

-- 14. Função para processar estorno de pagamento ASAAS
CREATE OR REPLACE FUNCTION public.handle_payment_refund(
    p_asaas_payment_id TEXT,
    p_refund_amount NUMERIC DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_payment RECORD;
    v_current_balance INTEGER;
    v_credits_to_refund INTEGER;
    v_ledger_id UUID;
BEGIN
    -- Buscar pagamento
    SELECT * INTO v_payment
    FROM public.asaas_payments
    WHERE asaas_payment_id = p_asaas_payment_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Pagamento não encontrado'
        );
    END IF;
    
    -- LOCK
    PERFORM pg_advisory_xact_lock(hashtext(v_payment.user_id::text));
    
    v_current_balance := public.get_ledger_balance(v_payment.user_id);
    
    -- Determinar créditos a estornar
    IF v_current_balance >= v_payment.credits_amount THEN
        -- Créditos não utilizados: estorno total
        v_credits_to_refund := v_payment.credits_amount;
        
        INSERT INTO public.credits_ledger (
            user_id, operation, amount, balance_after, reason,
            reference_type, reference_id, metadata
        ) VALUES (
            v_payment.user_id, 'REFUND', v_credits_to_refund, 
            v_current_balance - v_credits_to_refund,
            'Estorno por cancelamento de pagamento ASAAS',
            'payment', p_asaas_payment_id,
            jsonb_build_object('refund_type', 'full', 'original_credits', v_payment.credits_amount)
        )
        RETURNING id INTO v_ledger_id;
        
        UPDATE public.credits
        SET 
            available_credits = v_current_balance - v_credits_to_refund,
            last_ledger_id = v_ledger_id,
            updated_at = now()
        WHERE user_id = v_payment.user_id;
        
    ELSIF v_current_balance > 0 THEN
        -- Créditos parcialmente utilizados: estorno parcial
        v_credits_to_refund := v_current_balance;
        
        INSERT INTO public.credits_ledger (
            user_id, operation, amount, balance_after, reason,
            reference_type, reference_id, metadata
        ) VALUES (
            v_payment.user_id, 'REFUND', v_credits_to_refund, 0,
            'Estorno parcial - créditos parcialmente utilizados',
            'payment', p_asaas_payment_id,
            jsonb_build_object(
                'refund_type', 'partial', 
                'original_credits', v_payment.credits_amount,
                'used_credits', v_payment.credits_amount - v_credits_to_refund
            )
        )
        RETURNING id INTO v_ledger_id;
        
        UPDATE public.credits
        SET 
            available_credits = 0,
            last_ledger_id = v_ledger_id,
            updated_at = now()
        WHERE user_id = v_payment.user_id;
        
    ELSE
        -- Todos créditos utilizados: pendência administrativa
        v_credits_to_refund := 0;
        
        -- Marcar pagamento com pendência
        UPDATE public.asaas_payments
        SET status = 'REFUND_PENDING_ADMIN', updated_at = now()
        WHERE asaas_payment_id = p_asaas_payment_id;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Todos os créditos foram utilizados. Pendência administrativa criada.',
            'admin_action_required', true,
            'used_credits', v_payment.credits_amount
        );
    END IF;
    
    -- Atualizar status do pagamento
    UPDATE public.asaas_payments
    SET status = 'REFUNDED', updated_at = now()
    WHERE asaas_payment_id = p_asaas_payment_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'credits_refunded', v_credits_to_refund,
        'new_balance', v_current_balance - v_credits_to_refund,
        'refund_type', CASE WHEN v_credits_to_refund = v_payment.credits_amount THEN 'full' ELSE 'partial' END
    );
END;
$$;
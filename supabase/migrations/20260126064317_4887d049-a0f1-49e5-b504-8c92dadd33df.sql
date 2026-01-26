-- 1. Criar função para verificar se usuário é super_admin (créditos ilimitados)
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
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
      AND role = 'super_admin'
  )
$$;

-- 2. Atualizar consume_credit_atomic para pular consumo se for super_admin
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
    v_is_super_admin BOOLEAN;
BEGIN
    -- LOCK: Prevenir race conditions por usuário
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
    
    -- Verificar se é super_admin (créditos ilimitados)
    SELECT public.is_super_admin(p_user_id) INTO v_is_super_admin;
    
    IF v_is_super_admin THEN
        RETURN jsonb_build_object(
            'success', true,
            'unlimited', true,
            'remaining_balance', -1,
            'message', 'Super admin - créditos ilimitados'
        );
    END IF;
    
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

-- 3. Função para adicionar créditos a um usuário (para admin distribuir)
CREATE OR REPLACE FUNCTION public.add_credits_admin(
    p_user_id UUID,
    p_amount INTEGER,
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
    v_new_balance INTEGER;
    v_ledger_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- Verificar se é admin ou super_admin
    SELECT public.has_any_admin_role(p_admin_id) INTO v_is_admin;
    IF NOT v_is_admin THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Apenas administradores podem adicionar créditos'
        );
    END IF;
    
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Quantidade deve ser maior que zero'
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
        p_user_id, 'ADD', p_amount, v_new_balance, p_reason,
        'admin', 'admin_distribution', p_admin_id,
        jsonb_build_object('added_by', p_admin_id, 'type', 'admin_distribution')
    )
    RETURNING id INTO v_ledger_id;
    
    -- Atualizar ou criar cache de saldo
    INSERT INTO public.credits (user_id, total_credits, available_credits, last_ledger_id)
    VALUES (p_user_id, p_amount, v_new_balance, v_ledger_id)
    ON CONFLICT (user_id) DO UPDATE SET
        total_credits = credits.total_credits + p_amount,
        available_credits = v_new_balance,
        last_ledger_id = v_ledger_id,
        version = credits.version + 1,
        updated_at = now();
    
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'amount_added', p_amount,
        'new_balance', v_new_balance
    );
END;
$$;
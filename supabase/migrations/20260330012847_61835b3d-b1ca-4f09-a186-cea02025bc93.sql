ALTER TABLE public.credits DROP CONSTRAINT valid_plan_type;
ALTER TABLE public.credits ADD CONSTRAINT valid_plan_type CHECK (plan_type = ANY (ARRAY['BASICO'::text, 'PROFISSIONAL'::text, 'MENSAL'::text, 'FREE'::text, 'ADICIONAL'::text, 'BUSINESS'::text]));

CREATE OR REPLACE FUNCTION public.add_credits_atomic(p_user_id uuid, p_amount integer, p_reason text, p_reference_type text, p_reference_id text, p_is_subscription boolean DEFAULT false, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_ledger_id UUID;
    v_already_processed BOOLEAN;
    v_plan_type TEXT;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
    
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
    
    v_current_balance := public.get_ledger_balance(p_user_id);
    
    v_plan_type := COALESCE(
        p_metadata->>'plan_type',
        (SELECT plan_type FROM public.credits WHERE user_id = p_user_id),
        'BASICO'
    );
    IF v_plan_type NOT IN ('BASICO', 'PROFISSIONAL', 'MENSAL', 'FREE', 'ADICIONAL', 'BUSINESS') THEN
        v_plan_type := 'BASICO';
    END IF;
    
    IF p_is_subscription THEN
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
        v_new_balance := v_current_balance + p_amount;
    END IF;
    
    INSERT INTO public.credits_ledger (
        user_id, operation, amount, balance_after, reason,
        reference_type, reference_id, metadata
    ) VALUES (
        p_user_id, 'ADD', p_amount, v_new_balance, p_reason,
        p_reference_type, p_reference_id, p_metadata
    )
    RETURNING id INTO v_ledger_id;
    
    INSERT INTO public.credits (user_id, total_credits, available_credits, used_credits, plan_type, last_ledger_id, version)
    VALUES (p_user_id, p_amount, v_new_balance, 0, v_plan_type, v_ledger_id, 1)
    ON CONFLICT (user_id) DO UPDATE SET
        total_credits = CASE WHEN p_is_subscription THEN p_amount ELSE credits.total_credits + p_amount END,
        available_credits = v_new_balance,
        used_credits = CASE WHEN p_is_subscription THEN 0 ELSE credits.used_credits END,
        plan_type = v_plan_type,
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
$function$;
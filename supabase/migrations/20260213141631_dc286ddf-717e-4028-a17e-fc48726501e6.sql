
-- Atualizar a função handle_new_user para dar 1 crédito grátis ao novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_ledger_id UUID;
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Dar 1 crédito grátis ao novo usuário
    INSERT INTO public.credits (user_id, total_credits, available_credits, used_credits, plan_type)
    VALUES (NEW.id, 1, 1, 0, 'FREE');
    
    -- Registrar no ledger para auditoria
    INSERT INTO public.credits_ledger (user_id, operation, amount, balance_after, reason, reference_type, reference_id)
    VALUES (NEW.id, 'ADD', 1, 1, 'Crédito grátis de boas-vindas', 'signup', 'welcome_credit')
    RETURNING id INTO v_ledger_id;
    
    -- Atualizar o last_ledger_id
    UPDATE public.credits SET last_ledger_id = v_ledger_id WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$function$;

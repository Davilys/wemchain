
-- Add email column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill email from auth.users
UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE au.id = p.user_id;

-- Update handle_new_user trigger to also save email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_ledger_id UUID;
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    INSERT INTO public.credits (user_id, total_credits, available_credits, used_credits, plan_type)
    VALUES (NEW.id, 1, 1, 0, 'FREE');
    
    INSERT INTO public.credits_ledger (user_id, operation, amount, balance_after, reason, reference_type, reference_id)
    VALUES (NEW.id, 'ADD', 1, 1, 'Crédito grátis de boas-vindas', 'signup', 'welcome_credit')
    RETURNING id INTO v_ledger_id;
    
    UPDATE public.credits SET last_ledger_id = v_ledger_id WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$function$;

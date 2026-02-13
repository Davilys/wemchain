-- Fix: Add 'FREE' to valid_plan_type constraint so the handle_new_user trigger works
ALTER TABLE public.credits DROP CONSTRAINT valid_plan_type;
ALTER TABLE public.credits ADD CONSTRAINT valid_plan_type CHECK (plan_type = ANY (ARRAY['BASICO', 'PROFISSIONAL', 'MENSAL', 'FREE']));

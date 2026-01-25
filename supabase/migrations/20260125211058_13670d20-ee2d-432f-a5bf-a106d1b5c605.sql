-- Create credits table for managing user credits
CREATE TABLE public.credits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_credits INTEGER NOT NULL DEFAULT 0,
    used_credits INTEGER NOT NULL DEFAULT 0,
    available_credits INTEGER NOT NULL DEFAULT 0,
    plan_type TEXT NOT NULL DEFAULT 'BASICO',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id),
    CONSTRAINT valid_plan_type CHECK (plan_type IN ('BASICO', 'PROFISSIONAL', 'MENSAL')),
    CONSTRAINT valid_credits CHECK (available_credits >= 0 AND used_credits >= 0 AND total_credits >= 0)
);

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Policies for credits table
CREATE POLICY "Users can view their own credits"
ON public.credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
ON public.credits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create asaas_payments table for tracking payments
CREATE TABLE public.asaas_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asaas_payment_id TEXT,
    asaas_subscription_id TEXT,
    plan_type TEXT NOT NULL,
    credits_amount INTEGER NOT NULL,
    valor NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    payment_method TEXT,
    pix_qr_code TEXT,
    pix_copy_paste TEXT,
    invoice_url TEXT,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_asaas_plan CHECK (plan_type IN ('BASICO', 'PROFISSIONAL', 'MENSAL'))
);

-- Enable RLS
ALTER TABLE public.asaas_payments ENABLE ROW LEVEL SECURITY;

-- Policies for asaas_payments table
CREATE POLICY "Users can view their own asaas payments"
ON public.asaas_payments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own asaas payments"
ON public.asaas_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on credits
CREATE TRIGGER update_credits_updated_at
BEFORE UPDATE ON public.credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on asaas_payments
CREATE TRIGGER update_asaas_payments_updated_at
BEFORE UPDATE ON public.asaas_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to consume credit (called when registering)
CREATE OR REPLACE FUNCTION public.consume_credit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_available INTEGER;
BEGIN
    -- Get current available credits
    SELECT available_credits INTO v_available
    FROM public.credits
    WHERE user_id = p_user_id
    FOR UPDATE;
    
    -- Check if user has credits
    IF v_available IS NULL OR v_available < 1 THEN
        RETURN FALSE;
    END IF;
    
    -- Consume one credit
    UPDATE public.credits
    SET 
        available_credits = available_credits - 1,
        used_credits = used_credits + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$;

-- Function to add credits (called after payment confirmation)
CREATE OR REPLACE FUNCTION public.add_credits(p_user_id UUID, p_credits INTEGER, p_plan_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert or update credits
    INSERT INTO public.credits (user_id, total_credits, available_credits, plan_type)
    VALUES (p_user_id, p_credits, p_credits, p_plan_type)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_credits = credits.total_credits + p_credits,
        available_credits = credits.available_credits + p_credits,
        plan_type = p_plan_type,
        updated_at = now();
    
    RETURN TRUE;
END;
$$;
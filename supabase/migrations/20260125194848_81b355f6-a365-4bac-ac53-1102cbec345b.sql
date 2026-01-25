-- Enum para status de registro
CREATE TYPE public.registro_status AS ENUM ('pendente', 'processando', 'confirmado', 'falhou');

-- Enum para tipo de ativo
CREATE TYPE public.tipo_ativo AS ENUM ('marca', 'logotipo', 'obra_autoral', 'documento', 'outro');

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    cpf_cnpj TEXT,
    phone TEXT,
    company_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de roles de usuário (separada para segurança)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    UNIQUE (user_id, role)
);

-- Tabela de registros blockchain
CREATE TABLE public.registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome_ativo TEXT NOT NULL,
    descricao TEXT,
    tipo_ativo tipo_ativo NOT NULL DEFAULT 'marca',
    arquivo_path TEXT NOT NULL,
    arquivo_nome TEXT NOT NULL,
    arquivo_tamanho BIGINT,
    hash_sha256 TEXT,
    status registro_status NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de transações blockchain
CREATE TABLE public.transacoes_blockchain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID REFERENCES public.registros(id) ON DELETE CASCADE NOT NULL UNIQUE,
    tx_hash TEXT NOT NULL,
    block_number BIGINT,
    network TEXT NOT NULL DEFAULT 'polygon',
    timestamp_blockchain TIMESTAMP WITH TIME ZONE,
    gas_used NUMERIC,
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE public.pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID REFERENCES public.registros(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT,
    valor NUMERIC NOT NULL,
    moeda TEXT NOT NULL DEFAULT 'BRL',
    status TEXT NOT NULL DEFAULT 'pendente',
    metodo_pagamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_blockchain ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Registros policies
CREATE POLICY "Users can view their own registros"
ON public.registros FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own registros"
ON public.registros FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registros"
ON public.registros FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registros"
ON public.registros FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Transacoes blockchain policies
CREATE POLICY "Users can view their own transacoes"
ON public.transacoes_blockchain FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.registros r 
    WHERE r.id = registro_id AND r.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert transacoes"
ON public.transacoes_blockchain FOR INSERT
WITH CHECK (true);

-- Pagamentos policies
CREATE POLICY "Users can view their own pagamentos"
ON public.pagamentos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pagamentos"
ON public.pagamentos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para criar profile automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registros_updated_at
BEFORE UPDATE ON public.registros
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pagamentos_updated_at
BEFORE UPDATE ON public.pagamentos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket para arquivos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('registros', 'registros', false);

-- Storage policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'registros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'registros' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'registros' AND auth.uid()::text = (storage.foldername(name))[1]);
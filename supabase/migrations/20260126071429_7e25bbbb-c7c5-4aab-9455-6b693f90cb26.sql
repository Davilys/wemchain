
-- ============================================
-- TABELA: projects (Projetos para Plano Business)
-- Cada projeto representa um cliente/titular para
-- usuários com plano Business fazerem registros em nome de terceiros
-- ============================================

-- Criar tabela de projetos
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL,
    name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('CPF', 'CNPJ')),
    document_number TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_projects_owner ON public.projects(owner_user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_document ON public.projects(document_number);

-- Habilitar RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuários só podem ver/gerenciar seus próprios projetos
CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = owner_user_id);

-- Admins podem ver todos os projetos
CREATE POLICY "Admins can view all projects"
    ON public.projects FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ALTERAÇÃO: registros - adicionar project_id
-- ============================================

-- Adicionar coluna project_id na tabela registros
ALTER TABLE public.registros 
    ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    ADD COLUMN titular_name TEXT,
    ADD COLUMN titular_document TEXT,
    ADD COLUMN titular_type TEXT CHECK (titular_type IN ('CPF', 'CNPJ', NULL));

-- Índice para buscar registros por projeto
CREATE INDEX idx_registros_project ON public.registros(project_id);

-- ============================================
-- TABELA: project_logs (Histórico de ações nos projetos)
-- ============================================

CREATE TABLE public.project_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_project_logs_project ON public.project_logs(project_id);
CREATE INDEX idx_project_logs_action ON public.project_logs(action_type);
CREATE INDEX idx_project_logs_created ON public.project_logs(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.project_logs ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver logs dos seus projetos
CREATE POLICY "Users can view logs of their own projects"
    ON public.project_logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = project_logs.project_id 
        AND p.owner_user_id = auth.uid()
    ));

-- Usuários podem inserir logs nos seus projetos
CREATE POLICY "Users can insert logs to their own projects"
    ON public.project_logs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.projects p 
        WHERE p.id = project_logs.project_id 
        AND p.owner_user_id = auth.uid()
    ));

-- Admins podem ver todos os logs
CREATE POLICY "Admins can view all project logs"
    ON public.project_logs FOR SELECT
    USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- FUNÇÃO: verificar se usuário tem plano Business ativo
-- ============================================

CREATE OR REPLACE FUNCTION public.has_active_business_plan(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.asaas_subscriptions
        WHERE user_id = _user_id
        AND plan_type = 'BUSINESS'
        AND status = 'ACTIVE'
    )
$$;

-- ============================================
-- FUNÇÃO: contar registros de um projeto
-- ============================================

CREATE OR REPLACE FUNCTION public.get_project_registros_count(_project_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT COALESCE(COUNT(*)::INTEGER, 0)
    FROM public.registros
    WHERE project_id = _project_id
$$;

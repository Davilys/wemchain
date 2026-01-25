-- Tabela de autores/coautores para registros
CREATE TABLE public.record_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID NOT NULL REFERENCES public.registros(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('CPF', 'CNPJ')),
    document_number TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('PRIMARY', 'COAUTHOR')),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_record_authors_registro ON public.record_authors(registro_id);
CREATE INDEX idx_record_authors_role ON public.record_authors(role);

-- Habilitar RLS
ALTER TABLE public.record_authors ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can view authors of their own registros"
ON public.record_authors
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.registros r
        WHERE r.id = record_authors.registro_id
        AND r.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert authors for their own registros"
ON public.record_authors
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.registros r
        WHERE r.id = record_authors.registro_id
        AND r.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update authors for pending registros"
ON public.record_authors
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.registros r
        WHERE r.id = record_authors.registro_id
        AND r.user_id = auth.uid()
        AND r.status = 'pendente'
    )
);

CREATE POLICY "Users can delete coauthors for pending registros"
ON public.record_authors
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.registros r
        WHERE r.id = record_authors.registro_id
        AND r.user_id = auth.uid()
        AND r.status = 'pendente'
    )
    AND role = 'COAUTHOR'
);

-- Admins podem ver todos
CREATE POLICY "Admins can view all record authors"
ON public.record_authors
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Add new columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cpf text,
  ADD COLUMN IF NOT EXISTS cnpj text,
  ADD COLUMN IF NOT EXISTS razao_social text,
  ADD COLUMN IF NOT EXISTS cep text,
  ADD COLUMN IF NOT EXISTS rua text,
  ADD COLUMN IF NOT EXISTS numero text,
  ADD COLUMN IF NOT EXISTS complemento text,
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS cidade text,
  ADD COLUMN IF NOT EXISTS estado text;

-- Migrate existing cpf_cnpj data to new fields
UPDATE public.profiles
SET cpf = CASE
    WHEN LENGTH(REGEXP_REPLACE(cpf_cnpj, '\D', '', 'g')) = 11 THEN REGEXP_REPLACE(cpf_cnpj, '\D', '', 'g')
    ELSE NULL
  END,
  cnpj = CASE
    WHEN LENGTH(REGEXP_REPLACE(cpf_cnpj, '\D', '', 'g')) = 14 THEN REGEXP_REPLACE(cpf_cnpj, '\D', '', 'g')
    ELSE NULL
  END
WHERE cpf_cnpj IS NOT NULL AND cpf IS NULL AND cnpj IS NULL;

-- For duplicate CPFs, keep only the oldest profile's CPF and null out the rest
WITH ranked AS (
  SELECT id, cpf, ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY created_at ASC) as rn
  FROM public.profiles
  WHERE cpf IS NOT NULL
)
UPDATE public.profiles p
SET cpf = NULL
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

-- Now create the unique index
CREATE UNIQUE INDEX idx_profiles_cpf_unique ON public.profiles (cpf) WHERE cpf IS NOT NULL;

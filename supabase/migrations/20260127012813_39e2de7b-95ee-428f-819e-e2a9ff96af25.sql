-- Expandir o enum tipo_ativo com novas categorias de conteúdo
-- Adicionando: imagem, video, audio, codigo, planilha, evidencia, pdf, texto

-- Adicionar novos valores ao enum existente
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'imagem';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'video';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'codigo';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'planilha';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'evidencia';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'pdf';
ALTER TYPE public.tipo_ativo ADD VALUE IF NOT EXISTS 'texto';
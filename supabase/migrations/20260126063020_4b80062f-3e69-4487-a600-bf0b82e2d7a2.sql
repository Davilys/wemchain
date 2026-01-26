-- Parte 1: Adicionar novos valores ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'suporte';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'financeiro';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'auditor';
-- Add timestamp_method enum type
CREATE TYPE public.timestamp_method AS ENUM ('OPEN_TIMESTAMP', 'BYTESTAMP', 'SMART_CONTRACT');

-- Add new columns to transacoes_blockchain table
ALTER TABLE public.transacoes_blockchain
ADD COLUMN timestamp_method public.timestamp_method DEFAULT 'SMART_CONTRACT',
ADD COLUMN proof_data TEXT,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;

-- Create storage bucket for proof files (.ots files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('timestamp-proofs', 'timestamp-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for timestamp-proofs bucket
CREATE POLICY "Users can view their own proof files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'timestamp-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own proof files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'timestamp-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add policy for service role to insert blockchain transactions
CREATE POLICY "Service role can insert transacoes"
ON public.transacoes_blockchain
FOR INSERT
WITH CHECK (true);

-- Add policy for service role to update transacoes
CREATE POLICY "Service role can update transacoes"
ON public.transacoes_blockchain
FOR UPDATE
USING (true);
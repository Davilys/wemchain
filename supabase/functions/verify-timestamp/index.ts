import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransacaoBlockchain {
  id: string;
  tx_hash: string;
  network: string;
  timestamp_method: string;
  proof_data: string | null;
  confirmed_at: string | null;
  timestamp_blockchain: string | null;
  block_number: number | null;
  confirmations: number | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get query parameters
    const url = new URL(req.url);
    const fileHash = url.searchParams.get('hash');

    if (!fileHash) {
      return new Response(
        JSON.stringify({ error: 'hash parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate hash format
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(fileHash)) {
      return new Response(
        JSON.stringify({ error: 'Invalid hash format. Expected SHA-256 (64 hex characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search for registro with this hash
    const { data: registro, error: registroError } = await supabase
      .from('registros')
      .select(`
        id,
        nome_ativo,
        tipo_ativo,
        hash_sha256,
        status,
        created_at,
        transacoes_blockchain (
          id,
          tx_hash,
          network,
          timestamp_method,
          proof_data,
          confirmed_at,
          timestamp_blockchain,
          block_number,
          confirmations
        )
      `)
      .eq('hash_sha256', fileHash)
      .eq('status', 'confirmado')
      .maybeSingle();

    if (registroError) {
      console.error('Database error:', registroError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!registro) {
      return new Response(
        JSON.stringify({
          verified: false,
          message: 'No confirmed registro found with this hash'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle the transaction - it's a one-to-one relation but comes as array
    const transactions = registro.transacoes_blockchain as unknown as TransacaoBlockchain[];
    const transaction = Array.isArray(transactions) ? transactions[0] : transactions;
    
    // Determine verification method description
    let methodDescription = '';
    let verificationInstructions = '';

    if (transaction?.timestamp_method === 'OPEN_TIMESTAMP') {
      methodDescription = 'OpenTimestamps (Bitcoin Blockchain)';
      verificationInstructions = 'Este timestamp pode ser verificado de forma independente usando o arquivo .ots e ferramentas OpenTimestamps oficiais em opentimestamps.org';
    } else if (transaction?.timestamp_method === 'BYTESTAMP') {
      methodDescription = 'ByteStamp';
      verificationInstructions = 'Verificação disponível através do serviço ByteStamp';
    } else {
      methodDescription = 'Sistema Interno WebMarcas';
      verificationInstructions = 'Timestamp registrado no banco de dados seguro da WebMarcas com backup criptografado';
    }

    return new Response(
      JSON.stringify({
        verified: true,
        hash: fileHash,
        assetName: registro.nome_ativo,
        assetType: registro.tipo_ativo,
        registeredAt: registro.created_at,
        confirmedAt: transaction?.confirmed_at || transaction?.timestamp_blockchain,
        method: transaction?.timestamp_method || 'INTERNAL',
        methodDescription,
        network: transaction?.network || 'internal',
        txHash: transaction?.tx_hash,
        blockNumber: transaction?.block_number,
        confirmations: transaction?.confirmations,
        verificationInstructions,
        message: 'Registro verificado com sucesso. Este documento possui prova de existência válida.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

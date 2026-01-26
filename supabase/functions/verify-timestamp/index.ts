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

/**
 * Public endpoint for verifying timestamps by hash
 * No authentication required - anyone can verify
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`[VERIFY-TIMESTAMP] Request at ${new Date().toISOString()}`);

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Support both GET (query param) and POST (JSON body)
    let fileHash: string | null = null;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      fileHash = url.searchParams.get('hash');
    } else if (req.method === 'POST') {
      const body = await req.json();
      fileHash = body.hash;
    }

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

    // Search for registro with this hash - use limit(1) to handle duplicates
    const { data: registros, error: registroError } = await supabase
      .from('registros')
      .select(`
        id,
        nome_ativo,
        tipo_ativo,
        arquivo_nome,
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
      .eq('hash_sha256', fileHash.toLowerCase())
      .eq('status', 'confirmado')
      .order('created_at', { ascending: false })
      .limit(1);
    
    const registro = registros && registros.length > 0 ? registros[0] : null;

    if (registroError) {
      console.error('[VERIFY-TIMESTAMP] Database error:', registroError);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!registro) {
      return new Response(
        JSON.stringify({
          found: false,
          verified: false,
          hash: fileHash.toLowerCase(),
          message: 'Nenhum registro encontrado para este hash.',
          suggestion: 'Verifique se o hash está correto ou se o arquivo foi registrado nesta plataforma.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle the transaction
    const transactions = registro.transacoes_blockchain as unknown as TransacaoBlockchain[];
    const transaction = Array.isArray(transactions) ? transactions[0] : transactions;
    
    // Determine verification method description
    let methodDescription = '';
    let verificationInstructions = '';
    let bitcoinAnchored = false;

    if (transaction?.timestamp_method === 'OPEN_TIMESTAMP') {
      methodDescription = 'OpenTimestamps (Bitcoin Blockchain)';
      verificationInstructions = 'Este timestamp pode ser verificado de forma independente usando o arquivo .ots em opentimestamps.org';
      bitcoinAnchored = true;
    } else if (transaction?.timestamp_method === 'BYTESTAMP') {
      methodDescription = 'ByteStamp';
      verificationInstructions = 'Verificação disponível através do serviço ByteStamp';
    } else {
      methodDescription = 'Sistema Interno WebMarcas';
      verificationInstructions = 'Timestamp registrado no banco de dados seguro da WebMarcas';
    }

    console.log(`[VERIFY-TIMESTAMP] Found registro: ${registro.id}`);

    return new Response(
      JSON.stringify({
        found: true,
        verified: true,
        hash: fileHash.toLowerCase(),
        registro: {
          id: registro.id,
          nome_ativo: registro.nome_ativo,
          tipo_ativo: registro.tipo_ativo,
          arquivo_nome: registro.arquivo_nome,
          created_at: registro.created_at,
        },
        blockchain: {
          network: transaction?.network || 'internal',
          method: transaction?.timestamp_method || 'INTERNAL',
          methodDescription,
          tx_hash: transaction?.tx_hash,
          confirmed_at: transaction?.confirmed_at || transaction?.timestamp_blockchain,
          block_number: transaction?.block_number,
          confirmations: transaction?.confirmations,
          bitcoin_anchored: bitcoinAnchored,
        },
        verificationInstructions,
        legal_notice: 'Este registro constitui prova de anterioridade válida conforme Art. 411 do CPC (Código de Processo Civil Brasileiro). Não substitui o registro de marca junto ao INPI.',
        message: 'Registro verificado com sucesso. Este documento possui prova de existência válida.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[VERIFY-TIMESTAMP] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Tipos de status de verificação
 */
type VerificationStatus = 
  | 'VERIFICADO'        // Hash confirmado em blockchain
  | 'EM_PROCESSAMENTO'  // Registro existe mas ainda não confirmado
  | 'NAO_ENCONTRADO'    // Hash não existe no sistema
  | 'FORMATO_INVALIDO'; // Hash com formato incorreto

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
 * 
 * REGRA CRÍTICA: Nunca retornar erro falso para registro CONFIRMED
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
        JSON.stringify({ 
          status: 'FORMATO_INVALIDO',
          found: false,
          verified: false,
          message: 'É necessário informar o hash SHA-256 do arquivo.',
          legal_notice: getLegalNotice(),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize hash
    const normalizedHash = fileHash.trim().toLowerCase();

    // Validate hash format
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(normalizedHash)) {
      return new Response(
        JSON.stringify({ 
          status: 'FORMATO_INVALIDO',
          found: false,
          verified: false,
          hash: fileHash,
          message: 'Formato de hash inválido. O hash SHA-256 deve conter exatamente 64 caracteres hexadecimais.',
          legal_notice: getLegalNotice(),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASSO 1: Buscar registros CONFIRMADOS
    const { data: confirmedRegistros, error: confirmedError } = await supabase
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
      .eq('hash_sha256', normalizedHash)
      .eq('status', 'confirmado')
      .order('created_at', { ascending: false });

    if (confirmedError) {
      console.error('[VERIFY-TIMESTAMP] Database error:', confirmedError);
      return new Response(
        JSON.stringify({ 
          status: 'NAO_ENCONTRADO',
          found: false,
          verified: false,
          message: 'Erro ao consultar o banco de dados. Tente novamente.',
          legal_notice: getLegalNotice(),
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Se encontrou registro confirmado
    if (confirmedRegistros && confirmedRegistros.length > 0) {
      const registro = confirmedRegistros[0];
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

      console.log(`[VERIFY-TIMESTAMP] VERIFIED: ${registro.id}`);

      return new Response(
        JSON.stringify({
          status: 'VERIFICADO',
          found: true,
          verified: true,
          hash: normalizedHash,
          message: 'Registro verificado com sucesso! Este documento possui prova de existência válida e imutável.',
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
          legal_notice: getLegalNotice(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASSO 2: Verificar se existe em processamento
    const { data: pendingRegistros } = await supabase
      .from('registros')
      .select('id, nome_ativo, status, created_at')
      .eq('hash_sha256', normalizedHash)
      .in('status', ['pendente', 'processando'])
      .limit(1);

    if (pendingRegistros && pendingRegistros.length > 0) {
      const registro = pendingRegistros[0];
      console.log(`[VERIFY-TIMESTAMP] EM_PROCESSAMENTO: ${registro.id}`);

      return new Response(
        JSON.stringify({
          status: 'EM_PROCESSAMENTO',
          found: true,
          verified: false,
          hash: normalizedHash,
          message: 'Este registro está em fase de ancoragem na blockchain. A confirmação pode levar de alguns minutos a algumas horas.',
          registro: {
            id: registro.id,
            nome_ativo: registro.nome_ativo,
            created_at: registro.created_at,
          },
          legal_notice: getLegalNotice(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PASSO 3: Não encontrado
    console.log(`[VERIFY-TIMESTAMP] NAO_ENCONTRADO: ${normalizedHash}`);

    return new Response(
      JSON.stringify({
        status: 'NAO_ENCONTRADO',
        found: false,
        verified: false,
        hash: normalizedHash,
        message: 'Nenhum registro encontrado para este hash.',
        suggestion: 'Verifique se o hash está correto ou se o arquivo foi registrado nesta plataforma.',
        legal_notice: getLegalNotice(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[VERIFY-TIMESTAMP] Error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'NAO_ENCONTRADO',
        found: false,
        verified: false,
        message: 'Erro interno ao processar verificação. Tente novamente.',
        legal_notice: getLegalNotice(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getLegalNotice(): string {
  return 'Este registro constitui prova técnica de anterioridade válida conforme Art. 411 do CPC (Código de Processo Civil Brasileiro). Não substitui o registro de marca junto ao INPI.';
}

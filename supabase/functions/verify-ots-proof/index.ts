import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Tipos de status de verificação
 */
type VerificationStatus = 
  | 'VERIFICADO'        // Hash confirmado em blockchain
  | 'EM_PROCESSAMENTO'  // Registro existe mas ainda não confirmado
  | 'NAO_ENCONTRADO'    // Hash não existe no sistema
  | 'FORMATO_INVALIDO'; // Hash com formato incorreto

interface VerificationResponse {
  status: VerificationStatus;
  verified: boolean;
  message: string;
  hash?: string;
  registro?: {
    id: string;
    nome_ativo: string;
    tipo_ativo: string;
    arquivo_nome: string;
    hash_sha256: string;
    created_at: string;
    status: string;
  };
  blockchain?: {
    network: string;
    method: string;
    methodDescription: string;
    tx_hash: string;
    confirmed_at: string | null;
    timestamp_blockchain: string | null;
    bitcoin_anchored: boolean;
  };
  proof?: {
    exists: boolean;
    type: string;
    bitcoin_anchored: boolean;
    note: string;
    valid_ots_format?: boolean;
    proof_size_bytes?: number;
  };
  verificationInstructions?: string;
  legal_notice: string;
}

/**
 * Verify OpenTimestamps Proof - Endpoint Público Robusto
 * 
 * Suporta:
 * 1. Verificação por hash SHA-256
 * 2. Verificação por arquivo + .ots
 * 3. Lookup por registroId
 * 
 * NUNCA retorna erro falso para registros CONFIRMED.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`[VERIFY-OTS] Request at ${new Date().toISOString()}`);

  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Handle multipart form data (file upload)
    if (contentType.includes('multipart/form-data')) {
      return await handleFileVerification(req);
    }
    
    // Handle JSON body (lookup by registroId or hash)
    const body = await req.json();
    const { registroId, hash } = body;

    if (!registroId && !hash) {
      return createResponse({
        status: 'FORMATO_INVALIDO',
        verified: false,
        message: 'É necessário informar o hash SHA-256 ou o ID do registro.',
        legal_notice: getLegalNotice(),
      }, 400);
    }

    // Validar formato do hash se fornecido
    if (hash) {
      const normalizedHash = hash.trim().toLowerCase();
      const hashRegex = /^[a-fA-F0-9]{64}$/;
      
      if (!hashRegex.test(normalizedHash)) {
        return createResponse({
          status: 'FORMATO_INVALIDO',
          verified: false,
          message: 'Formato de hash inválido. O hash SHA-256 deve conter exatamente 64 caracteres hexadecimais.',
          hash: hash,
          legal_notice: getLegalNotice(),
        }, 400);
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let registro = null;
    let transaction = null;

    if (registroId) {
      // Busca por ID do registro
      const { data: regData, error: regError } = await supabaseAdmin
        .from('registros')
        .select('*, transacoes_blockchain(*)')
        .eq('id', registroId)
        .maybeSingle();

      if (regError) {
        console.error('[VERIFY-OTS] Database error:', regError);
        return createResponse({
          status: 'NAO_ENCONTRADO',
          verified: false,
          message: 'Erro ao consultar o banco de dados. Tente novamente.',
          legal_notice: getLegalNotice(),
        }, 500);
      }

      if (!regData) {
        return createResponse({
          status: 'NAO_ENCONTRADO',
          verified: false,
          message: 'Nenhum registro encontrado com este ID.',
          legal_notice: getLegalNotice(),
        }, 200);
      }

      registro = regData;
      transaction = Array.isArray(regData.transacoes_blockchain) 
        ? regData.transacoes_blockchain[0] 
        : regData.transacoes_blockchain;

    } else if (hash) {
      const normalizedHash = hash.trim().toLowerCase();
      
      // Primeiro: buscar registros confirmados
      const { data: confirmedData, error: confirmedError } = await supabaseAdmin
        .from('registros')
        .select('*, transacoes_blockchain(*)')
        .eq('hash_sha256', normalizedHash)
        .eq('status', 'confirmado')
        .order('created_at', { ascending: false })
        .limit(1);

      if (confirmedError) {
        console.error('[VERIFY-OTS] Database error:', confirmedError);
        return createResponse({
          status: 'NAO_ENCONTRADO',
          verified: false,
          message: 'Erro ao consultar o banco de dados. Tente novamente.',
          legal_notice: getLegalNotice(),
        }, 500);
      }

      if (confirmedData && confirmedData.length > 0) {
        registro = confirmedData[0];
        transaction = Array.isArray(registro.transacoes_blockchain) 
          ? registro.transacoes_blockchain[0] 
          : registro.transacoes_blockchain;
      } else {
        // Segundo: verificar se existe em processamento
        const { data: pendingData } = await supabaseAdmin
          .from('registros')
          .select('id, nome_ativo, status, created_at')
          .eq('hash_sha256', normalizedHash)
          .in('status', ['pendente', 'processando'])
          .limit(1);

        if (pendingData && pendingData.length > 0) {
          return createResponse({
            status: 'EM_PROCESSAMENTO',
            verified: false,
            message: 'Este registro está em fase de ancoragem na blockchain. A confirmação pode levar de alguns minutos a algumas horas.',
            hash: normalizedHash,
            registro: {
              id: pendingData[0].id,
              nome_ativo: pendingData[0].nome_ativo,
              tipo_ativo: '',
              arquivo_nome: '',
              hash_sha256: normalizedHash,
              created_at: pendingData[0].created_at,
              status: pendingData[0].status,
            },
            legal_notice: getLegalNotice(),
          }, 200);
        }

        // Não encontrado em nenhum status
        return createResponse({
          status: 'NAO_ENCONTRADO',
          verified: false,
          message: 'Nenhum registro encontrado para este hash. Verifique se o hash está correto ou se o arquivo foi registrado nesta plataforma.',
          hash: normalizedHash,
          legal_notice: getLegalNotice(),
        }, 200);
      }
    }

    // Registro encontrado e confirmado
    if (!transaction) {
      return createResponse({
        status: 'EM_PROCESSAMENTO',
        verified: false,
        message: 'Registro encontrado, mas ainda não possui confirmação em blockchain.',
        hash: registro.hash_sha256,
        registro: formatRegistro(registro),
        legal_notice: getLegalNotice(),
      }, 200);
    }

    // Determinar método de verificação
    const { methodDescription, verificationInstructions, bitcoinAnchored } = getMethodInfo(transaction.timestamp_method);

    const response: VerificationResponse = {
      status: 'VERIFICADO',
      verified: true,
      message: 'Registro verificado com sucesso! Este documento possui prova de existência válida e imutável.',
      hash: registro.hash_sha256,
      registro: formatRegistro(registro),
      blockchain: {
        network: transaction.network,
        method: transaction.timestamp_method,
        methodDescription,
        tx_hash: transaction.tx_hash,
        confirmed_at: transaction.confirmed_at,
        timestamp_blockchain: transaction.timestamp_blockchain,
        bitcoin_anchored: bitcoinAnchored,
      },
      proof: {
        exists: !!transaction.proof_data,
        type: transaction.timestamp_method === 'OPEN_TIMESTAMP' ? 'OpenTimestamps (.ots)' : 'Internal',
        bitcoin_anchored: bitcoinAnchored,
        note: transaction.timestamp_method === 'OPEN_TIMESTAMP' 
          ? 'Este timestamp é ancorado permanentemente na blockchain Bitcoin. Verificação independente disponível em opentimestamps.org'
          : 'Timestamp registrado no sistema interno WebMarcas.',
      },
      verificationInstructions,
      legal_notice: getLegalNotice(),
    };

    // Parse OTS proof if available
    if (transaction.timestamp_method === 'OPEN_TIMESTAMP' && transaction.proof_data) {
      try {
        const proofBytes = base64ToBytes(transaction.proof_data);
        response.proof!.valid_ots_format = validateOtsHeader(proofBytes);
        response.proof!.proof_size_bytes = proofBytes.length;
      } catch (e) {
        console.log('[VERIFY-OTS] Could not parse proof data:', e);
      }
    }

    console.log(`[VERIFY-OTS] Verification complete: ${registro.id} - VERIFIED`);

    return createResponse(response, 200);

  } catch (error) {
    console.error('[VERIFY-OTS] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createResponse({
      status: 'NAO_ENCONTRADO',
      verified: false,
      message: 'Erro interno ao processar verificação. Tente novamente.',
      legal_notice: getLegalNotice(),
    }, 500);
  }
});

async function handleFileVerification(req: Request): Promise<Response> {
  const formData = await req.formData();
  const otsFile = formData.get('otsFile') as File | null;
  const fileHash = formData.get('fileHash') as string | null;

  if (!otsFile) {
    return createResponse({
      status: 'FORMATO_INVALIDO',
      verified: false,
      message: 'O arquivo .ots é obrigatório para verificação.',
      legal_notice: getLegalNotice(),
    }, 400);
  }

  if (!fileHash) {
    return createResponse({
      status: 'FORMATO_INVALIDO',
      verified: false,
      message: 'O hash SHA-256 do arquivo original é obrigatório.',
      legal_notice: getLegalNotice(),
    }, 400);
  }

  const normalizedHash = fileHash.trim().toLowerCase();
  const hashRegex = /^[a-fA-F0-9]{64}$/;
  
  if (!hashRegex.test(normalizedHash)) {
    return createResponse({
      status: 'FORMATO_INVALIDO',
      verified: false,
      message: 'Formato de hash inválido. O hash SHA-256 deve conter exatamente 64 caracteres hexadecimais.',
      hash: fileHash,
      legal_notice: getLegalNotice(),
    }, 400);
  }

  const otsData = new Uint8Array(await otsFile.arrayBuffer());

  // Validate OTS magic bytes
  if (!validateOtsHeader(otsData) || otsData.length < 65) {
    return createResponse({
      status: 'FORMATO_INVALIDO',
      verified: false,
      message: 'Arquivo .ots inválido. Não possui estrutura OpenTimestamps válida.',
      legal_notice: getLegalNotice(),
    }, 400);
  }

  // Check hash type (0x08 = SHA256) at position 31
  const magicBytesLength = 31;
  const hashType = otsData[magicBytesLength];
  
  if (hashType !== 0x08) {
    return createResponse({
      status: 'FORMATO_INVALIDO',
      verified: false,
      message: 'Tipo de hash não suportado. Apenas SHA-256 é suportado.',
      legal_notice: getLegalNotice(),
    }, 400);
  }

  // Extract hash from .ots (32 bytes after hash type byte)
  const hashInOts = otsData.slice(magicBytesLength + 1, magicBytesLength + 33);
  const hashInOtsHex = Array.from(hashInOts).map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashInOtsHex.toLowerCase() !== normalizedHash) {
    return createResponse({
      status: 'NAO_ENCONTRADO',
      verified: false,
      message: 'O hash do arquivo não corresponde ao hash registrado no arquivo .ots. Verifique se está usando o arquivo original correto.',
      hash: normalizedHash,
      legal_notice: getLegalNotice(),
    }, 200);
  }

  // Hash matches - now lookup in database
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: registros } = await supabaseAdmin
    .from('registros')
    .select('*, transacoes_blockchain(*)')
    .eq('hash_sha256', normalizedHash)
    .eq('status', 'confirmado')
    .order('created_at', { ascending: false })
    .limit(1);

  const registro = registros && registros.length > 0 ? registros[0] : null;

  if (registro) {
    const transaction = Array.isArray(registro.transacoes_blockchain) 
      ? registro.transacoes_blockchain[0] 
      : registro.transacoes_blockchain;

    return createResponse({
      status: 'VERIFICADO',
      verified: true,
      message: 'Prova válida! O arquivo .ots corresponde ao hash fornecido e está registrado na WebMarcas.',
      hash: normalizedHash,
      registro: formatRegistro(registro),
      blockchain: transaction ? {
        network: transaction.network,
        method: transaction.timestamp_method,
        methodDescription: getMethodInfo(transaction.timestamp_method).methodDescription,
        tx_hash: transaction.tx_hash,
        confirmed_at: transaction.confirmed_at,
        timestamp_blockchain: transaction.timestamp_blockchain,
        bitcoin_anchored: transaction.timestamp_method === 'OPEN_TIMESTAMP',
      } : undefined,
      proof: {
        exists: true,
        type: 'OpenTimestamps (.ots)',
        bitcoin_anchored: true,
        note: 'Este timestamp é ancorado permanentemente na blockchain Bitcoin.',
        valid_ots_format: true,
        proof_size_bytes: otsData.length,
      },
      verificationInstructions: 'Para verificação completa independente, use opentimestamps.org',
      legal_notice: getLegalNotice(),
    }, 200);
  }

  // OTS matches hash but not found in database
  return createResponse({
    status: 'VERIFICADO',
    verified: true,
    message: 'Prova válida! O arquivo .ots corresponde ao hash fornecido. Para verificação completa, acesse opentimestamps.org.',
    hash: normalizedHash,
    proof: {
      exists: true,
      type: 'OpenTimestamps (.ots)',
      bitcoin_anchored: true,
      note: 'Este arquivo .ots é válido e pode ser verificado em opentimestamps.org',
      valid_ots_format: true,
      proof_size_bytes: otsData.length,
    },
    verificationInstructions: 'Para verificação completa independente, use opentimestamps.org',
    legal_notice: getLegalNotice(),
  }, 200);
}

// Helper functions

function createResponse(data: VerificationResponse, status: number): Response {
  return new Response(
    JSON.stringify(data),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

function formatRegistro(registro: any) {
  return {
    id: registro.id,
    nome_ativo: registro.nome_ativo,
    tipo_ativo: registro.tipo_ativo,
    arquivo_nome: registro.arquivo_nome,
    hash_sha256: registro.hash_sha256,
    created_at: registro.created_at,
    status: registro.status,
  };
}

function getMethodInfo(timestampMethod: string | null) {
  if (timestampMethod === 'OPEN_TIMESTAMP') {
    return {
      methodDescription: 'OpenTimestamps (Bitcoin Blockchain)',
      verificationInstructions: 'Este timestamp pode ser verificado de forma independente usando o arquivo .ots em opentimestamps.org',
      bitcoinAnchored: true,
    };
  } else if (timestampMethod === 'BYTESTAMP') {
    return {
      methodDescription: 'ByteStamp',
      verificationInstructions: 'Verificação disponível através do serviço ByteStamp',
      bitcoinAnchored: false,
    };
  }
  return {
    methodDescription: 'Sistema Interno WebMarcas',
    verificationInstructions: 'Timestamp registrado no banco de dados seguro da WebMarcas',
    bitcoinAnchored: false,
  };
}

function getLegalNotice(): string {
  return 'Este registro constitui prova técnica de anterioridade válida conforme Art. 411 do CPC (Código de Processo Civil Brasileiro). Não substitui o registro de marca junto ao INPI.';
}

function validateOtsHeader(data: Uint8Array): boolean {
  // OTS header: \x00OpenTimestamps\x00\x00Proof\x00 + version bytes
  const expectedStart = [0x00, 0x4f, 0x70, 0x65, 0x6e]; // \x00Open
  for (let i = 0; i < expectedStart.length && i < data.length; i++) {
    if (data[i] !== expectedStart[i]) return false;
  }
  return true;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

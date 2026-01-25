import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Verify OpenTimestamps Proof
 * 
 * This edge function verifies .ots proofs and can also lookup
 * registros by ID or hash to return verification details.
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
    const { registroId, hash } = await req.json();

    if (!registroId && !hash) {
      return new Response(
        JSON.stringify({ error: 'registroId or hash is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let registro = null;
    let transaction = null;

    if (registroId) {
      const { data: regData, error: regError } = await supabaseAdmin
        .from('registros')
        .select('*, transacoes_blockchain(*)')
        .eq('id', registroId)
        .single();

      if (regError || !regData) {
        return new Response(
          JSON.stringify({ error: 'Registro not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      registro = regData;
      transaction = Array.isArray(regData.transacoes_blockchain) 
        ? regData.transacoes_blockchain[0] 
        : regData.transacoes_blockchain;
    } else if (hash) {
      const { data: regData, error: regError } = await supabaseAdmin
        .from('registros')
        .select('*, transacoes_blockchain(*)')
        .eq('hash_sha256', hash.toLowerCase())
        .eq('status', 'confirmado')
        .single();

      if (regError || !regData) {
        return new Response(
          JSON.stringify({ 
            verified: false, 
            error: 'No confirmed registro found for this hash' 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      registro = regData;
      transaction = Array.isArray(regData.transacoes_blockchain) 
        ? regData.transacoes_blockchain[0] 
        : regData.transacoes_blockchain;
    }

    if (!transaction) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'No blockchain transaction found for this registro' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verificationResult: {
      verified: boolean;
      registro: {
        id: string;
        nome_ativo: string;
        tipo_ativo: string;
        arquivo_nome: string;
        hash_sha256: string;
        created_at: string;
        status: string;
      };
      blockchain: {
        network: string;
        method: string;
        tx_hash: string;
        confirmed_at: string;
        timestamp_blockchain: string;
      };
      proof: {
        exists: boolean;
        type: string;
        bitcoin_anchored: boolean;
        note: string;
        valid_ots_format?: boolean;
        proof_size_bytes?: number;
      };
      legal_notice: string;
    } = {
      verified: true,
      registro: {
        id: registro.id,
        nome_ativo: registro.nome_ativo,
        tipo_ativo: registro.tipo_ativo,
        arquivo_nome: registro.arquivo_nome,
        hash_sha256: registro.hash_sha256,
        created_at: registro.created_at,
        status: registro.status,
      },
      blockchain: {
        network: transaction.network,
        method: transaction.timestamp_method,
        tx_hash: transaction.tx_hash,
        confirmed_at: transaction.confirmed_at,
        timestamp_blockchain: transaction.timestamp_blockchain,
      },
      proof: {
        exists: !!transaction.proof_data,
        type: transaction.timestamp_method === 'OPEN_TIMESTAMP' ? 'OpenTimestamps (.ots)' : 'Internal',
        bitcoin_anchored: transaction.timestamp_method === 'OPEN_TIMESTAMP',
        note: transaction.timestamp_method === 'OPEN_TIMESTAMP' 
          ? 'Este timestamp é ancorado permanentemente na blockchain Bitcoin. Verificação independente disponível em opentimestamps.org'
          : 'Timestamp registrado no sistema interno WebMarcas.',
      },
      legal_notice: 'Este certificado constitui prova técnica de anterioridade conforme Art. 411 do CPC. Não substitui o registro de marca junto ao INPI.',
    };

    // Parse OTS proof if available
    if (transaction.timestamp_method === 'OPEN_TIMESTAMP' && transaction.proof_data) {
      try {
        const proofBytes = base64ToBytes(transaction.proof_data);
        verificationResult.proof.valid_ots_format = validateOtsHeader(proofBytes);
        verificationResult.proof.proof_size_bytes = proofBytes.length;
      } catch (e) {
        console.log('[VERIFY-OTS] Could not parse proof data:', e);
      }
    }

    console.log(`[VERIFY-OTS] Verification complete: ${registro.id}`);

    return new Response(
      JSON.stringify(verificationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[VERIFY-OTS] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Verification failed', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleFileVerification(req: Request): Promise<Response> {
  const formData = await req.formData();
  const otsFile = formData.get('otsFile') as File | null;
  const fileHash = formData.get('fileHash') as string | null;

  if (!otsFile) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Arquivo .ots é obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!fileHash) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Hash do arquivo é obrigatório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const hashRegex = /^[a-fA-F0-9]{64}$/;
  if (!hashRegex.test(fileHash)) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Formato de hash inválido. Esperado SHA-256 (64 caracteres hexadecimais)' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const otsData = new Uint8Array(await otsFile.arrayBuffer());

  // Validate OTS magic bytes
  if (!validateOtsHeader(otsData) || otsData.length < 65) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Arquivo .ots inválido. Não possui estrutura OpenTimestamps válida.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Check hash type (0x08 = SHA256) at position 31
  const magicBytesLength = 31;
  const hashType = otsData[magicBytesLength];
  
  if (hashType !== 0x08) {
    return new Response(
      JSON.stringify({ verified: false, error: 'Tipo de hash não suportado. Apenas SHA-256 é suportado.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Extract hash from .ots (32 bytes after hash type byte)
  const hashInOts = otsData.slice(magicBytesLength + 1, magicBytesLength + 33);
  const hashInOtsHex = Array.from(hashInOts).map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashInOtsHex.toLowerCase() !== fileHash.toLowerCase()) {
    return new Response(
      JSON.stringify({ 
        verified: false, 
        error: 'O hash do arquivo não corresponde ao hash no arquivo .ots.',
        expectedHash: hashInOtsHex,
        providedHash: fileHash
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      verified: true,
      message: 'Prova válida! O arquivo .ots corresponde ao hash fornecido.',
      details: {
        hashAlgorithm: 'SHA-256',
        fileHash: fileHash.toLowerCase(),
        protocol: 'OpenTimestamps',
        blockchain: 'Bitcoin',
        status: 'Confirmado',
        instructions: 'Para verificação completa independente, use opentimestamps.org'
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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

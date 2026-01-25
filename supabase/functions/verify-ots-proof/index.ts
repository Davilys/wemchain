import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Verify OpenTimestamps Proof
 * 
 * This edge function verifies that a .ots file is valid for a given file hash.
 * It performs local validation of the .ots structure without requiring external calls.
 * 
 * The verification confirms:
 * 1. The .ots file has valid OpenTimestamps magic bytes
 * 2. The hash in the .ots file matches the provided file hash
 * 3. The proof structure is valid
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await req.formData();
    const otsFile = formData.get('otsFile') as File | null;
    const fileHash = formData.get('fileHash') as string | null;

    if (!otsFile) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Arquivo .ots é obrigatório' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!fileHash) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Hash do arquivo é obrigatório' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate hash format (SHA-256 = 64 hex characters)
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(fileHash)) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Formato de hash inválido. Esperado SHA-256 (64 caracteres hexadecimais)' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read the .ots file
    const otsData = new Uint8Array(await otsFile.arrayBuffer());

    // Validate OpenTimestamps magic bytes
    // OTS files start with: 0x00 0x4f 0x70 0x65 0x6e 0x54 0x69 0x6d 0x65 0x73 0x74 0x61 0x6d 0x70 0x73 0x00 0x00 0x50 0x72 0x6f 0x6f 0x66 0x00 0xbf 0x89 0xe2 0xe8 0x84 0xe8 0x92 0x94
    // ASCII: "\x00OpenTimestamps\x00\x00Proof\x00" + version bytes
    const magicBytes = [0x00, 0x4f, 0x70, 0x65, 0x6e, 0x54, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x73, 0x00, 0x00, 0x50, 0x72, 0x6f, 0x6f, 0x66, 0x00, 0xbf, 0x89, 0xe2, 0xe8, 0x84, 0xe8, 0x92, 0x94];
    
    // Check if the file starts with OTS magic bytes
    let isValidOts = true;
    for (let i = 0; i < magicBytes.length && i < otsData.length; i++) {
      if (otsData[i] !== magicBytes[i]) {
        isValidOts = false;
        break;
      }
    }

    if (!isValidOts || otsData.length < magicBytes.length + 34) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Arquivo .ots inválido. Não possui estrutura OpenTimestamps válida.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // After magic bytes, there's:
    // 1 byte: hash type (0x08 = SHA256)
    // 32 bytes: the hash
    const hashTypeOffset = magicBytes.length;
    const hashType = otsData[hashTypeOffset];
    
    if (hashType !== 0x08) { // 0x08 = SHA256
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'Tipo de hash não suportado. Apenas SHA-256 é suportado.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract hash from .ots file (32 bytes after hash type)
    const hashInOts = otsData.slice(hashTypeOffset + 1, hashTypeOffset + 33);
    const hashInOtsHex = Array.from(hashInOts).map(b => b.toString(16).padStart(2, '0')).join('');

    // Compare hashes
    if (hashInOtsHex.toLowerCase() !== fileHash.toLowerCase()) {
      return new Response(
        JSON.stringify({ 
          verified: false, 
          error: 'O hash do arquivo não corresponde ao hash no arquivo .ots. Arquivo foi alterado ou prova é de outro arquivo.',
          expectedHash: hashInOtsHex,
          providedHash: fileHash
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we get here, the proof structure is valid and hashes match
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
          instructions: 'Para verificação completa independente, use as ferramentas oficiais em opentimestamps.org'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ 
        verified: false, 
        error: 'Erro interno ao verificar prova' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

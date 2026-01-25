import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenTimestamps calendar servers (free, public, real)
const OTS_CALENDARS = [
  'https://a.pool.opentimestamps.org',
  'https://b.pool.opentimestamps.org',
  'https://a.pool.eternitywall.com',
  'https://ots.btc.calendar.catallaxy.com',
];

// Maximum retry attempts for OTS
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

interface ProcessResult {
  success: boolean;
  registroId: string;
  hash: string;
  method: 'OPEN_TIMESTAMP' | 'INTERNAL';
  calendar?: string;
  transactionId: string;
  txHash: string;
  confirmedAt: string;
  otsProofStored: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[PROCESS-REGISTRO] Job started at ${new Date().toISOString()}`);

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[PROCESS-REGISTRO] Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create client with user's token for auth validation
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate user token
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('[PROCESS-REGISTRO] Invalid token:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`[PROCESS-REGISTRO] User authenticated: ${userId}`);

    // Parse request body
    const { registroId } = await req.json();

    if (!registroId) {
      return new Response(
        JSON.stringify({ error: 'registroId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PROCESS-REGISTRO] Processing registro: ${registroId}`);

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get registro details and verify ownership
    const { data: registro, error: registroError } = await supabaseAdmin
      .from('registros')
      .select('*')
      .eq('id', registroId)
      .eq('user_id', userId)
      .single();

    if (registroError || !registro) {
      console.error('[PROCESS-REGISTRO] Registro not found or access denied:', registroError?.message);
      return new Response(
        JSON.stringify({ error: 'Registro not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already processed
    if (registro.status === 'confirmado') {
      console.log('[PROCESS-REGISTRO] Registro already confirmed');
      return new Response(
        JSON.stringify({ error: 'Registro already processed', status: 'confirmado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to PROCESSING
    await supabaseAdmin
      .from('registros')
      .update({ status: 'processando' })
      .eq('id', registroId);

    console.log('[PROCESS-REGISTRO] Status updated to PROCESSING');

    // Step 1: Download file and generate hash if not already present
    let fileHash = registro.hash_sha256;

    if (!fileHash) {
      console.log('[PROCESS-REGISTRO] Downloading file to generate hash...');
      const { data: fileData, error: fileError } = await supabaseAdmin.storage
        .from('registros')
        .download(registro.arquivo_path);

      if (fileError || !fileData) {
        console.error('[PROCESS-REGISTRO] Failed to download file:', fileError?.message);
        await supabaseAdmin
          .from('registros')
          .update({ status: 'falhou' })
          .eq('id', registroId);
        
        return new Response(
          JSON.stringify({ error: 'Failed to download file for hashing' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Generate SHA-256 hash
      const arrayBuffer = await fileData.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Update registro with hash
      await supabaseAdmin
        .from('registros')
        .update({ hash_sha256: fileHash })
        .eq('id', registroId);

      console.log(`[PROCESS-REGISTRO] Hash generated: ${fileHash}`);
    } else {
      console.log(`[PROCESS-REGISTRO] Using existing hash: ${fileHash}`);
    }

    // Step 2: Submit to OpenTimestamps calendars with retry logic
    const hashHex = fileHash.toLowerCase();
    let timestampResult: Uint8Array | null = null;
    let usedCalendar: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`[PROCESS-REGISTRO] OpenTimestamps attempt ${attempt}/${MAX_RETRIES}`);

      for (const calendar of OTS_CALENDARS) {
        try {
          console.log(`[PROCESS-REGISTRO] Trying calendar: ${calendar}`);
          
          const response = await fetch(`${calendar}/digest`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/vnd.opentimestamps.v1',
            },
            body: hashHex,
          });

          if (response.ok) {
            const otsData = await response.arrayBuffer();
            timestampResult = new Uint8Array(otsData);
            usedCalendar = calendar;
            console.log(`[PROCESS-REGISTRO] Success from calendar: ${calendar}, proof size: ${timestampResult.length} bytes`);
            break;
          } else {
            console.log(`[PROCESS-REGISTRO] Calendar ${calendar} returned status: ${response.status}`);
          }
        } catch (calendarError) {
          console.log(`[PROCESS-REGISTRO] Calendar ${calendar} failed:`, calendarError);
          continue;
        }
      }

      if (timestampResult) break;

      if (attempt < MAX_RETRIES) {
        console.log(`[PROCESS-REGISTRO] Waiting ${RETRY_DELAY_MS}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    const now = new Date().toISOString();
    let txData;
    let otsProofStored = false;

    if (timestampResult) {
      // Successfully got timestamp from OpenTimestamps
      const otsBase64 = bytesToBase64(timestampResult);
      
      // Store the .ots proof file in storage
      const otsFileName = `${userId}/${registroId}.ots`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('timestamp-proofs')
        .upload(otsFileName, timestampResult, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (uploadError) {
        console.error('[PROCESS-REGISTRO] Failed to upload OTS file:', uploadError);
      } else {
        otsProofStored = true;
        console.log(`[PROCESS-REGISTRO] OTS proof stored: ${otsFileName}`);
      }

      // Create blockchain transaction record
      const { data, error } = await supabaseAdmin
        .from('transacoes_blockchain')
        .insert({
          registro_id: registroId,
          tx_hash: `ots:${fileHash.substring(0, 16)}:${Date.now()}`,
          network: 'opentimestamps',
          timestamp_method: 'OPEN_TIMESTAMP',
          proof_data: otsBase64,
          confirmed_at: now,
          timestamp_blockchain: now,
        })
        .select()
        .single();

      if (error) {
        console.error('[PROCESS-REGISTRO] Failed to create transaction record:', error);
        throw error;
      }
      txData = data;
      console.log(`[PROCESS-REGISTRO] Transaction created: ${txData.id}`);
    } else {
      // Fallback: Create internal timestamp record
      console.log('[PROCESS-REGISTRO] OpenTimestamps unavailable, using internal timestamping');
      
      const { data, error } = await supabaseAdmin
        .from('transacoes_blockchain')
        .insert({
          registro_id: registroId,
          tx_hash: `internal:${fileHash.substring(0, 16)}:${Date.now()}`,
          network: 'internal',
          timestamp_method: 'SMART_CONTRACT',
          proof_data: JSON.stringify({
            hash: fileHash,
            timestamp: now,
            method: 'internal_database',
            note: 'OpenTimestamps calendars unavailable, using internal timestamping as fallback'
          }),
          confirmed_at: now,
          timestamp_blockchain: now,
        })
        .select()
        .single();

      if (error) {
        console.error('[PROCESS-REGISTRO] Failed to create fallback transaction:', error);
        throw error;
      }
      txData = data;
    }

    // Update registro to CONFIRMED
    await supabaseAdmin
      .from('registros')
      .update({ status: 'confirmado' })
      .eq('id', registroId);

    const totalTime = Date.now() - startTime;
    console.log(`[PROCESS-REGISTRO] Job completed in ${totalTime}ms`);

    const result: ProcessResult = {
      success: true,
      registroId,
      hash: fileHash,
      method: timestampResult ? 'OPEN_TIMESTAMP' : 'INTERNAL',
      calendar: usedCalendar || undefined,
      transactionId: txData.id,
      txHash: txData.tx_hash,
      confirmedAt: now,
      otsProofStored,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[PROCESS-REGISTRO] Job failed after ${totalTime}ms:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Processing failed', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

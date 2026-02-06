import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// OpenTimestamps calendar servers (free, public, Bitcoin-anchored)
const OTS_CALENDARS = [
  'https://a.pool.opentimestamps.org',
  'https://b.pool.opentimestamps.org',
  'https://a.pool.eternitywall.com',
  'https://ots.btc.calendar.catallaxy.com',
];

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/**
 * Free timestamp service using OpenTimestamps
 * - No cost to WebMarcas
 * - Anchored to Bitcoin blockchain
 * - Legally defensible proof of existence
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[TIMESTAMP-FREE] Job started at ${new Date().toISOString()}`);

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[TIMESTAMP-FREE] Missing authorization');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate user token
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      console.error('[TIMESTAMP-FREE] Invalid token');
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    console.log(`[TIMESTAMP-FREE] User: ${userId}`);

    // Parse request body
    const { fileHash, registroId } = await req.json();

    if (!fileHash || !registroId) {
      return new Response(
        JSON.stringify({ error: 'fileHash and registroId are required' }),
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

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify registro ownership
    const { data: registro, error: registroError } = await supabaseAdmin
      .from('registros')
      .select('id, user_id, status')
      .eq('id', registroId)
      .eq('user_id', userId)
      .single();

    if (registroError || !registro) {
      console.error('[TIMESTAMP-FREE] Registro not found or access denied');
      return new Response(
        JSON.stringify({ error: 'Registro not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already processed
    if (registro.status === 'confirmado') {
      return new Response(
        JSON.stringify({ error: 'Registro already timestamped' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from('registros')
      .update({ status: 'processando' })
      .eq('id', registroId);

    // Submit to OpenTimestamps with retry logic
    const hashHex = fileHash.toLowerCase();
    let timestampResult: Uint8Array | null = null;
    let usedCalendar: string | null = null;
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`[TIMESTAMP-FREE] Attempt ${attempt}/${MAX_RETRIES}`);

      for (const calendar of OTS_CALENDARS) {
        try {
          console.log(`[TIMESTAMP-FREE] Trying: ${calendar}`);
          
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
            console.log(`[TIMESTAMP-FREE] Success! Calendar: ${calendar}, Size: ${timestampResult.length} bytes`);
            break;
          } else {
            lastError = `Calendar ${calendar} returned ${response.status}`;
            console.log(`[TIMESTAMP-FREE] ${lastError}`);
          }
        } catch (calendarError) {
          lastError = `Calendar ${calendar} error: ${calendarError}`;
          console.log(`[TIMESTAMP-FREE] ${lastError}`);
          continue;
        }
      }

      if (timestampResult) break;

      if (attempt < MAX_RETRIES) {
        console.log(`[TIMESTAMP-FREE] Waiting ${RETRY_DELAY_MS}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }

    const now = new Date().toISOString();
    let txData;
    let method: 'OPEN_TIMESTAMP' | 'INTERNAL' = 'INTERNAL';

    if (timestampResult) {
      method = 'OPEN_TIMESTAMP';
      const otsBase64 = bytesToBase64(timestampResult);
      
      // Store .ots proof
      const otsFileName = `${userId}/${registroId}.ots`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('timestamp-proofs')
        .upload(otsFileName, timestampResult, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (uploadError) {
        console.error('[TIMESTAMP-FREE] Failed to upload OTS proof:', uploadError);
      } else {
        console.log(`[TIMESTAMP-FREE] OTS proof stored: ${otsFileName}`);
      }

      // Create transaction record
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

      if (error) throw error;
      txData = data;
    } else {
      // Fallback to internal timestamp
      console.log('[TIMESTAMP-FREE] OpenTimestamps unavailable, using internal fallback');
      
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
            note: 'OpenTimestamps calendars unavailable after retries',
            last_error: lastError,
          }),
          confirmed_at: now,
          timestamp_blockchain: now,
        })
        .select()
        .single();

      if (error) throw error;
      txData = data;
    }

    // Update registro status and hash
    await supabaseAdmin
      .from('registros')
      .update({ status: 'confirmado', hash_sha256: fileHash })
      .eq('id', registroId);

    const totalTime = Date.now() - startTime;
    console.log(`[TIMESTAMP-FREE] Completed in ${totalTime}ms, method: ${method}`);

    return new Response(
      JSON.stringify({
        success: true,
        method,
        calendar: usedCalendar,
        hash: fileHash,
        timestamp: now,
        proofId: txData.id,
        txHash: txData.tx_hash,
        processingTimeMs: totalTime,
        message: method === 'OPEN_TIMESTAMP' 
          ? 'Timestamp registrado via OpenTimestamps (Bitcoin blockchain)' 
          : 'Timestamp registrado via sistema interno (OpenTimestamps indisponível)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[TIMESTAMP-FREE] Failed after ${totalTime}ms:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Timestamp failed', details: errorMessage }),
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

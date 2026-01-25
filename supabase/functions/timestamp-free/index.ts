import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenTimestamps calendar servers
const OTS_CALENDARS = [
  'https://a.pool.opentimestamps.org',
  'https://b.pool.opentimestamps.org',
  'https://a.pool.eternitywall.com',
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
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
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;

    // Parse request body
    const { fileHash, registroId } = await req.json();

    if (!fileHash || !registroId) {
      return new Response(
        JSON.stringify({ error: 'fileHash and registroId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate hash format (SHA-256 = 64 hex characters)
    const hashRegex = /^[a-fA-F0-9]{64}$/;
    if (!hashRegex.test(fileHash)) {
      return new Response(
        JSON.stringify({ error: 'Invalid hash format. Expected SHA-256 (64 hex characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the registro belongs to the user
    const { data: registro, error: registroError } = await supabaseAdmin
      .from('registros')
      .select('id, user_id, status')
      .eq('id', registroId)
      .eq('user_id', userId)
      .single();

    if (registroError || !registro) {
      return new Response(
        JSON.stringify({ error: 'Registro not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert hash to hex string for OpenTimestamps
    const hashHex = fileHash.toLowerCase();
    
    // Try to get timestamp from OpenTimestamps calendars
    let timestampResult: Uint8Array | null = null;
    let usedCalendar: string | null = null;

    for (const calendar of OTS_CALENDARS) {
      try {
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
          break;
        }
      } catch (calendarError) {
        console.log(`Calendar ${calendar} failed:`, calendarError);
        continue;
      }
    }

    const now = new Date().toISOString();

    if (timestampResult) {
      // Successfully got timestamp from OpenTimestamps
      const otsBase64 = bytesToBase64(timestampResult);
      
      // Store the .ots proof in storage
      const otsFileName = `${userId}/${registroId}.ots`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('timestamp-proofs')
        .upload(otsFileName, timestampResult, {
          contentType: 'application/octet-stream',
          upsert: true
        });

      if (uploadError) {
        console.error('Failed to upload OTS file:', uploadError);
      }

      // Create blockchain transaction record
      const { data: txData, error: txError } = await supabaseAdmin
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

      if (txError) {
        console.error('Failed to create transaction record:', txError);
        return new Response(
          JSON.stringify({ error: 'Failed to save timestamp record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update registro status
      await supabaseAdmin
        .from('registros')
        .update({ status: 'confirmado', hash_sha256: fileHash })
        .eq('id', registroId);

      return new Response(
        JSON.stringify({
          success: true,
          method: 'OPEN_TIMESTAMP',
          calendar: usedCalendar,
          hash: fileHash,
          timestamp: now,
          proofId: txData.id,
          message: 'Timestamp created successfully via OpenTimestamps'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Fallback: Create a simple timestamp record without external service
      // This is still valid as internal proof with database timestamp
      const { data: txData, error: txError } = await supabaseAdmin
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
            note: 'OpenTimestamps calendars unavailable, using internal timestamping'
          }),
          confirmed_at: now,
          timestamp_blockchain: now,
        })
        .select()
        .single();

      if (txError) {
        return new Response(
          JSON.stringify({ error: 'Failed to save timestamp record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update registro status
      await supabaseAdmin
        .from('registros')
        .update({ status: 'confirmado', hash_sha256: fileHash })
        .eq('id', registroId);

      return new Response(
        JSON.stringify({
          success: true,
          method: 'INTERNAL',
          hash: fileHash,
          timestamp: now,
          proofId: txData.id,
          message: 'Timestamp created via internal system (OpenTimestamps unavailable)'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Timestamp error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
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

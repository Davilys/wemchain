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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseUser.auth.getUser(token);
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    const { registroId } = await req.json();

    if (!registroId) {
      return new Response(
        JSON.stringify({ error: 'registroId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get registro details
    const { data: registro, error: registroError } = await supabaseAdmin
      .from('registros')
      .select('*')
      .eq('id', registroId)
      .eq('user_id', userId)
      .single();

    if (registroError || !registro) {
      return new Response(
        JSON.stringify({ error: 'Registro not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from('registros')
      .update({ status: 'processando' })
      .eq('id', registroId);

    // Download the file from storage to generate hash
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from('registros')
      .download(registro.arquivo_path);

    if (fileError || !fileData) {
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
    const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Update registro with hash
    await supabaseAdmin
      .from('registros')
      .update({ hash_sha256: fileHash })
      .eq('id', registroId);

    // Try OpenTimestamps - send hex string
    const hashHex = fileHash.toLowerCase();
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
    let txData;

    if (timestampResult) {
      const otsBase64 = bytesToBase64(timestampResult);
      
      // Store .ots file
      const otsFileName = `${userId}/${registroId}.ots`;
      await supabaseAdmin.storage
        .from('timestamp-proofs')
        .upload(otsFileName, timestampResult, {
          contentType: 'application/octet-stream',
          upsert: true
        });

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
            method: 'internal_database'
          }),
          confirmed_at: now,
          timestamp_blockchain: now,
        })
        .select()
        .single();

      if (error) throw error;
      txData = data;
    }

    // Update registro to confirmed
    await supabaseAdmin
      .from('registros')
      .update({ status: 'confirmado' })
      .eq('id', registroId);

    return new Response(
      JSON.stringify({
        success: true,
        registroId,
        hash: fileHash,
        method: timestampResult ? 'OPEN_TIMESTAMP' : 'INTERNAL',
        calendar: usedCalendar,
        transactionId: txData.id,
        txHash: txData.tx_hash,
        confirmedAt: now
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Process error:', error);
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

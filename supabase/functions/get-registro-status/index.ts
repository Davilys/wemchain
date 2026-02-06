import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * API: GET /get-registro-status
 * Consulta o status real do registro para polling do frontend
 * 
 * Query params:
 * - registroId: UUID do registro
 * 
 * Response:
 * {
 *   status: 'pendente' | 'processando' | 'confirmado' | 'falhou',
 *   hash_sha256: string | null,
 *   confirmed_at: string | null,
 *   error_message: string | null,
 *   transaction: { ... } | null
 * }
 */
serve(async (req) => {
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

    // Validate user token
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

    // Get registroId from query params
    const url = new URL(req.url);
    const registroId = url.searchParams.get('registroId');

    if (!registroId) {
      return new Response(
        JSON.stringify({ error: 'registroId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to get registro with transaction
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: registro, error: registroError } = await supabaseAdmin
      .from('registros')
      .select(`
        id,
        status,
        hash_sha256,
        error_message,
        created_at,
        updated_at,
        transacoes_blockchain (
          id,
          tx_hash,
          network,
          timestamp_method,
          confirmed_at,
          timestamp_blockchain
        )
      `)
      .eq('id', registroId)
      .eq('user_id', userId)
      .single();

    if (registroError || !registro) {
      return new Response(
        JSON.stringify({ error: 'Registro not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get processing logs for this registro
    const { data: logs } = await supabaseAdmin
      .from('processing_logs')
      .select('*')
      .eq('registro_id', registroId)
      .order('attempt_number', { ascending: false })
      .limit(5);

    // transacoes_blockchain is one-to-one, but Supabase returns it as object or null
    // deno-lint-ignore no-explicit-any
    const transaction: any = registro.transacoes_blockchain;
    
    // Handle case where transaction might be an array (shouldn't happen with one-to-one)
    const txn = Array.isArray(transaction) ? transaction[0] : transaction;
    
    return new Response(
      JSON.stringify({
        registroId: registro.id,
        status: registro.status,
        hash_sha256: registro.hash_sha256,
        error_message: registro.error_message,
        created_at: registro.created_at,
        updated_at: registro.updated_at,
        confirmed_at: txn?.confirmed_at || null,
        transaction: txn ? {
          id: txn.id,
          txHash: txn.tx_hash,
          network: txn.network,
          method: txn.timestamp_method,
          confirmedAt: txn.confirmed_at,
          timestampBlockchain: txn.timestamp_blockchain,
        } : null,
        processingLogs: logs || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[GET-REGISTRO-STATUS] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

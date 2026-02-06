import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Mapeamento de labels para exibição no certificado
const TIPO_ATIVO_LABELS: Record<string, string> = {
  audio: "Áudio",
  video: "Vídeo",
  imagem: "Imagem",
  logotipo: "Marca/Logo",
  obra_autoral: "Obra Autoral",
  documento: "Documento",
  evidencia: "Evidência Digital",
  codigo: "Código",
  planilha: "Planilha",
  outro: "Outro",
  marca: "Marca",
  pdf: "PDF",
  texto: "Texto"
};

// PDF Generation using base64 encoding
function generatePDFContent(data: {
  registroId: string;
  nomeAtivo: string;
  tipoAtivo: string;
  arquivoNome: string;
  hashSha256: string;
  createdAt: string;
  userName: string;
  userDocument: string;
  txHash: string;
  network: string;
  timestampMethod: string;
  confirmedAt: string;
  blockNumber?: number;
  branding?: {
    logoPath: string | null;
    primaryColor: string;
    secondaryColor: string;
    displayName: string;
    documentNumber: string;
  } | null;
}): string {
  const now = new Date();
  const emissionDate = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  
  const registrationDate = new Date(data.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const confirmationDate = data.confirmedAt 
    ? new Date(data.confirmedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : registrationDate;

  const methodDisplay = data.timestampMethod === "OPEN_TIMESTAMP" 
    ? "OpenTimestamps (Bitcoin)" 
    : data.timestampMethod === "BYTESTAMP" 
      ? "ByteStamp" 
      : "Sistema WebMarcas";

  const networkDisplay = data.network === "opentimestamps" || data.timestampMethod === "OPEN_TIMESTAMP"
    ? "Bitcoin"
    : data.network.charAt(0).toUpperCase() + data.network.slice(1);

  // Usar label amigável para o tipo de ativo
  const tipoAtivoLabel = TIPO_ATIVO_LABELS[data.tipoAtivo] || data.tipoAtivo.replace("_", " ").toUpperCase();

  // Create PDF content as text (will be rendered by jspdf on frontend)
  // This returns structured data for the frontend to render
  return JSON.stringify({
    title: "CERTIFICADO DE PROVA DE ANTERIORIDADE EM BLOCKCHAIN",
    subtitle: "WebMarcas - Uma empresa WebPatentes",
    emissionDate,
    registrationDate,
    confirmationDate,
    
    holder: {
      name: data.userName || "Não informado",
      document: data.userDocument || "Não informado",
    },
    
    asset: {
      name: data.nomeAtivo,
      type: tipoAtivoLabel,
      fileName: data.arquivoNome,
    },
    
    technical: {
      hash: data.hashSha256,
      method: methodDisplay,
      network: networkDisplay,
      txHash: data.txHash,
      blockNumber: data.blockNumber,
      registroId: data.registroId,
    },
    
    legal: {
      validity: "Este certificado comprova a existência e integridade do arquivo identificado pelo hash acima, com base em timestamp registrado em blockchain pública, servindo como prova técnica de anterioridade conforme Art. 411 do CPC (Código de Processo Civil Brasileiro).",
      disclaimer: "Este certificado NÃO SUBSTITUI o registro de marca, patente ou direito autoral junto ao INPI (Instituto Nacional da Propriedade Industrial) ou a outros órgãos oficiais. A prova de anterioridade em blockchain é um elemento técnico complementar, não constituindo, por si só, direito de propriedade intelectual.",
      verification: "Esta prova pode ser verificada de forma independente através do protocolo OpenTimestamps em opentimestamps.org ou através da verificação pública em webmarcas.net/verificar-registro",
    },
    
    footer: {
      company: "WebMarcas • Uma empresa WebPatentes",
      contact: "www.webmarcas.net • ola@webmarcas.net • (11) 91112-0225",
      certificateId: data.registroId,
    },
    
    // Branding data for frontend PDF customization
    branding: data.branding || null,
  });
}

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

    // Create client with user's token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('[GENERATE-CERTIFICATE] Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    
    // Parse request body
    const { registroId } = await req.json();
    
    if (!registroId) {
      return new Response(
        JSON.stringify({ error: 'registroId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[GENERATE-CERTIFICATE] Processing for registro: ${registroId}, user: ${userId}`);

    // Use service role client for full data access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch registro
    const { data: registro, error: registroError } = await supabaseAdmin
      .from('registros')
      .select('*')
      .eq('id', registroId)
      .eq('user_id', userId)
      .single();

    if (registroError || !registro) {
      console.error('[GENERATE-CERTIFICATE] Registro not found:', registroError);
      return new Response(
        JSON.stringify({ error: 'Registro não encontrado ou não pertence ao usuário' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch transaction data separately
    const { data: txData, error: txError } = await supabaseAdmin
      .from('transacoes_blockchain')
      .select('*')
      .eq('registro_id', registroId)
      .maybeSingle();

    console.log('[GENERATE-CERTIFICATE] Transaction data:', txData, 'Error:', txError);

    // CRITICAL: Only generate for CONFIRMED registros
    if (registro.status !== 'confirmado') {
      console.error(`[GENERATE-CERTIFICATE] Invalid status: ${registro.status}`);
      return new Response(
        JSON.stringify({ 
          error: 'Certificado só pode ser gerado para registros confirmados',
          status: registro.status 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Require hash
    if (!registro.hash_sha256) {
      console.error('[GENERATE-CERTIFICATE] Missing hash');
      return new Response(
        JSON.stringify({ error: 'Registro sem hash SHA-256 válido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transaction data - already fetched above
    if (!txData) {
      console.error('[GENERATE-CERTIFICATE] Missing transaction data');
      return new Response(
        JSON.stringify({ error: 'Registro sem dados de transação blockchain' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile (kept for reference but not used for certificate identity)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, cpf_cnpj')
      .eq('user_id', userId)
      .single();

    // Check if user has active Business branding configured
    const { data: brandingSettings } = await supabaseAdmin
      .from('business_branding_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    // Decide which identity to use:
    // Only use custom branding if Business user has EXPLICITLY configured it
    const useBranding = brandingSettings && 
      brandingSettings.display_name && 
      brandingSettings.display_name.trim() !== '' &&
      brandingSettings.document_number &&
      brandingSettings.document_number.trim() !== '';

    console.log(`[GENERATE-CERTIFICATE] Using branding: ${useBranding}, Settings: ${JSON.stringify(brandingSettings)}`);

    // Default WebMarcas data - Dados oficiais da empresa
    const WEBMARCAS_NAME = "Webmarcas Patentes Ltda";
    const WEBMARCAS_CNPJ = "39.528.012/0001-29";

    // Generate certificate data
    const certificateData = generatePDFContent({
      registroId: registro.id,
      nomeAtivo: registro.nome_ativo,
      tipoAtivo: registro.tipo_ativo,
      arquivoNome: registro.arquivo_nome,
      hashSha256: registro.hash_sha256,
      createdAt: registro.created_at,
      // Use custom branding if configured, otherwise WebMarcas
      userName: useBranding ? brandingSettings.display_name : WEBMARCAS_NAME,
      userDocument: useBranding ? brandingSettings.document_number : WEBMARCAS_CNPJ,
      txHash: txData.tx_hash,
      network: txData.network,
      timestampMethod: txData.timestamp_method || 'SMART_CONTRACT',
      confirmedAt: txData.confirmed_at || registro.updated_at,
      blockNumber: txData.block_number,
      // Pass branding for frontend to apply custom colors/logo
      branding: useBranding ? {
        logoPath: brandingSettings.logo_path,
        primaryColor: brandingSettings.primary_color || '#0a3d6e',
        secondaryColor: brandingSettings.secondary_color || '#0066cc',
        displayName: brandingSettings.display_name,
        documentNumber: brandingSettings.document_number,
      } : null,
    });

    // Check if certificate already exists
    const { data: existingCert } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('registro_id', registroId)
      .single();

    const fileName = `certificado-${registroId}.json`;
    const filePath = `${userId}/${registroId}/${fileName}`;

    // Store certificate data in storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('timestamp-proofs')
      .upload(filePath, new Blob([certificateData], { type: 'application/json' }), {
        upsert: true,
        contentType: 'application/json'
      });

    if (uploadError) {
      console.error('[GENERATE-CERTIFICATE] Upload error:', uploadError);
      // Continue anyway, data is returned directly
    }

    // Insert or update certificate record
    if (existingCert) {
      // Reissue - update existing record
      await supabaseAdmin
        .from('certificates')
        .update({
          reissued_count: existingCert.reissued_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCert.id);

      console.log(`[GENERATE-CERTIFICATE] Reissued certificate for registro: ${registroId}`);
    } else {
      // First issue
      await supabaseAdmin
        .from('certificates')
        .insert({
          registro_id: registroId,
          user_id: userId,
          file_path: filePath,
          file_name: fileName,
        });

      console.log(`[GENERATE-CERTIFICATE] Created new certificate for registro: ${registroId}`);
    }

    // Log audit event
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action_type: existingCert ? 'certificado_reissued' : 'certificado_generated',
        metadata: {
          registro_id: registroId,
          timestamp: new Date().toISOString(),
          reissue_count: existingCert ? existingCert.reissued_count + 1 : 0,
        }
      });

    console.log(`[GENERATE-CERTIFICATE] Success for registro: ${registroId}`);

    return new Response(
      JSON.stringify({
        success: true,
        certificateData: JSON.parse(certificateData),
        filePath,
        isReissue: !!existingCert,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[GENERATE-CERTIFICATE] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, email, password, full_name, instagram_url, tiktok_url } =
      await req.json();

    // Validações
    if (!code || !email || !password || !full_name || !instagram_url || !tiktok_url) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Senha deve ter pelo menos 6 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar URLs de redes sociais (formato básico)
    const urlPattern = /^https?:\/\/.+/i;
    const instagramPattern = /instagram\.com|instagr\.am/i;
    const tiktokPattern = /tiktok\.com/i;

    if (!urlPattern.test(instagram_url) || !instagramPattern.test(instagram_url)) {
      return new Response(
        JSON.stringify({ error: "URL do Instagram inválida. Use o link completo do seu perfil." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!urlPattern.test(tiktok_url) || !tiktokPattern.test(tiktok_url)) {
      return new Response(
        JSON.stringify({ error: "URL do TikTok inválida. Use o link completo do seu perfil." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cliente admin (service role)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verificar se o código do link existe e está ativo
    const { data: linkData, error: linkError } = await supabaseAdmin
      .from("partner_links")
      .select("id, is_active")
      .eq("code", code)
      .single();

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: "Link de parceria inválido ou expirado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!linkData.is_active) {
      return new Response(
        JSON.stringify({ error: "Este link de parceria foi desativado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar usuário via Admin API (auto-confirma email)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (userError) {
      if (userError.message?.includes("already been registered")) {
        return new Response(
          JSON.stringify({ error: "Este email já está cadastrado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw userError;
    }

    if (!userData.user) {
      throw new Error("Erro ao criar usuário");
    }

    // Atualizar profile com dados de parceria
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        is_partner: true,
        partner_status: "pending",
        partner_link_id: linkData.id,
        instagram_url: instagram_url.trim(),
        tiktok_url: tiktok_url.trim(),
      })
      .eq("user_id", userData.user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cadastro realizado! Aguardando aprovação do administrador.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Partner register error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

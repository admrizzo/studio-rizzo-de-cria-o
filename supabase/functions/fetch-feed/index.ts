import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log(`[Fetch Feed] Recebendo requisição para: ${url}`);

    if (!url) {
      throw new Error("URL é obrigatória");
    }

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json, text/xml, application/xml, text/plain, */*",
        "User-Agent": "RizzoStudio/1.0",
        "Cache-Control": "no-cache",
      },
    });

    console.log(`[Fetch Feed] Status HTTP: ${response.status} (${response.statusText})`);
    console.log(`[Fetch Feed] Content-Type: ${response.headers.get("content-type")}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("A URL do feed retornou 404 ou não existe. Confira o link no RobustCRM.");
      }
      if (response.status === 403 || response.status === 401) {
        throw new Error("O RobustCRM recusou o acesso ao feed. Verifique se o link é público ou se precisa de token/API key.");
      }
      throw new Error(`Erro ao buscar feed: ${response.status} ${response.statusText}`);
    }

    const body = await response.text();
    let data;

    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error("[Fetch Feed] Resposta não é um JSON válido");
      throw new Error("A resposta da API não é um JSON válido.");
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[Fetch Feed] Erro crítico:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

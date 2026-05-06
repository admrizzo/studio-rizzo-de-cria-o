import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { property, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const styleInstructions: Record<string, string> = {
      informativo: "Tom profissional e informativo. Apresente os dados do imóvel de forma clara e organizada, como um boletim técnico.",
      emocional: "Tom acolhedor e envolvente. Fale sobre como é viver ali, o dia a dia, a rotina. Sem exageros, mas com calor humano.",
      urgente: "Tom direto e com senso de oportunidade. Destaque valor, condições ou diferenciais que justifiquem ação rápida. Sem ser apelativo.",
      minimalista: "Tom enxuto e elegante. Poucas palavras, máximo impacto. Cada frase deve ser precisa e essencial.",
    };

    const propertyId = (property.id || "").replace(/^u-/, "");

    const prompt = `Você é um especialista em marketing imobiliário para Instagram. Gere uma legenda pronta para publicação.

Dados do imóvel (USE APENAS ESTES — NÃO INVENTE NADA):
- Código: ${propertyId}
- Tipo: ${property.tipo}
- Título: ${property.titulo}
- Preço: ${property.preco ? `R$ ${property.preco.toLocaleString("pt-BR")}` : "Sob consulta"}
${property.valorLocacao ? `- Locação: R$ ${property.valorLocacao.toLocaleString("pt-BR")}/mês` : ""}
- Bairro: ${property.bairro || "não informado"}
- Cidade: ${property.cidade || "não informada"}${property.estado ? ` - ${property.estado}` : ""}
- Quartos: ${property.quartos || 0}
${property.suites ? `- Suítes: ${property.suites}` : ""}
- Banheiros: ${property.banheiros || 0}
- Vagas: ${property.vagas || 0}
- Área: ${property.area ? `${property.area}m²` : "não informada"}
${property.condominio ? `- Condomínio: ${property.condominio}` : ""}
${property.destinacao ? `- Destinação: ${property.destinacao}` : ""}
${property.descricao ? `- Descrição: ${property.descricao.substring(0, 500)}` : ""}

Estilo: ${styleInstructions[style] || styleInstructions.informativo}

Regras OBRIGATÓRIAS:
- Legenda completa para Instagram, pronta para copiar e colar
- Inclua emojis relevantes (🏠 🛏️ 🚗 📍 etc.) mas sem exagero
- PROIBIDO inventar informações que não existem nos dados acima. Se um dado é 0 ou "não informado", NÃO mencione.
- PROIBIDO alterar preço, número de quartos, área ou qualquer dado numérico. Copie EXATAMENTE como fornecido.
- PROIBIDO palavras: "sonho", "paraíso", "deslumbrante", "magnífico", "incrível", "perfeito", "imperdível", "exclusivo", "espetacular", "maravilhoso", "premium", "luxo" (a menos que o preço seja acima de R$ 2.000.000)
- PROIBIDO superlativos inventados
- PROIBIDO mencionar status de ocupação do imóvel (ex: "ocupado pelo proprietário", "desocupado", "ocupado pelo inquilino"). Isso é irrelevante para o cliente — foque apenas no que ATRAI para a visita: localização, características, diferenciais, preço.
- Seja FACTUAL — use apenas dados reais do imóvel
- Máximo 280 palavras na legenda (sem contar hashtags)
- Inclua o preço quando disponível
- Inclua uma chamada para contato antes do rodapé

RODAPÉ OBRIGATÓRIO (SEMPRE incluir exatamente assim no final, antes das hashtags):

🔍 Encontre esse imóvel no site da imobiliária pesquisando pelo código ${propertyId}

- Depois do rodapé, inclua 8-12 hashtags relevantes`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você gera legendas de Instagram para imóveis. Responda APENAS com a tool call. Seja factual e profissional." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_caption",
              description: "Return the generated Instagram caption",
              parameters: {
                type: "object",
                properties: {
                  caption: { type: "string", description: "The full Instagram caption with emojis and hashtags" },
                  hashtags: { type: "string", description: "Just the hashtags portion" },
                },
                required: ["caption", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_caption" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI error:", status, text);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-caption error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

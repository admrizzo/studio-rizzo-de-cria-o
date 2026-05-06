import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { property, photoCount, photoUrls } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build messages with photo URLs for vision analysis
    const imageMessages = [];
    if (photoUrls && photoUrls.length > 0) {
      // Send up to 10 photos to avoid token limits
      const photosToAnalyze = photoUrls.slice(0, Math.min(photoCount, 10));
      for (let i = 0; i < photosToAnalyze.length; i++) {
        imageMessages.push({
          type: "image_url",
          image_url: { url: photosToAnalyze[i] },
        });
      }
    }

    const textPrompt = `Você é um copywriter imobiliário sofisticado para vídeos de redes sociais (Instagram Reels, TikTok, Stories).

Dados do imóvel:
- Tipo: ${property.tipo}
- Título: ${property.titulo}
- Preço: R$ ${property.preco?.toLocaleString("pt-BR")}
- Bairro: ${property.bairro}
- Cidade: ${property.cidade}
- Quartos: ${property.quartos}
- Suítes: ${property.suites || 0}
- Banheiros: ${property.banheiros}
- Vagas: ${property.vagas}
- Área: ${property.area}m²
- Descrição: ${property.descricao?.substring(0, 300) || ""}

${imageMessages.length > 0 
  ? `IMPORTANTE: Acima estão ${imageMessages.length} fotos do imóvel na ordem em que serão exibidas no vídeo. 
Analise CADA foto e gere uma frase que descreva o que se vê, com elegância.
- Se a foto mostra a fachada: fale sobre arquitetura ou localização
- Se mostra a sala: fale sobre amplitude, luz, convivência
- Se mostra o quarto: fale sobre descanso, privacidade
- Se mostra a cozinha: fale sobre praticidade, funcionalidade
- Se mostra o banheiro: fale sobre acabamento, design
- Se mostra área externa/varanda: fale sobre lazer, ar livre
- Se mostra garagem: fale sobre praticidade, segurança
A frase PRECISA corresponder à foto. NÃO escreva "sala ampla" se a foto mostra um quarto.`
  : `Gere ${photoCount} frases variadas sobre o imóvel.`}

Gere EXATAMENTE ${photoCount} frases (uma por foto, na mesma ordem), mais uma headline e um CTA.

Regras OBRIGATÓRIAS:
- Frases de 4 a 7 palavras cada — SEMPRE gramaticalmente corretas em português
- Use conectivos naturais: "e", "com", "para", "de" — evite listar adjetivos soltos sem conexão
- Exemplos BOM: "Sala ampla e bem iluminada", "Cozinha prática com bancada generosa", "Vista aberta para o verde"
- Exemplos RUIM: "Sala ampla arejada", "Living aconchegante relaxante" (falta o "e")
- Tom SÓBRIO, direto e descritivo — como um arquiteto descrevendo o imóvel, NÃO como vendedor
- PROIBIDO TOTALMENTE palavras exageradas ou clichês: "sonho", "sonhos", "paraíso", "deslumbrante", "magnífico", "incrível", "perfeito", "imperdível", "exclusivo", "luxo", "espetacular", "maravilhoso", "encantador", "apaixone-se", "surpreendente", "extraordinário", "fantástico", "sublime", "esplêndido", "único", "premium", "sofisticado", "requinte", "requintado", "excepcional", "incomparável", "irresistível", "deslumbre", "oportunidade única", "não perca"
- PROIBIDO usar superlativos ("o melhor", "a mais", "o maior")
- PROIBIDO repetir qualquer palavra entre frases diferentes (exceto artigos, preposições e conectivos)
- Seja FACTUAL e específico — descreva o que se VÊ, não invente qualidades
- Baseie-se APENAS nas informações reais do imóvel e no que aparece nas fotos. NÃO invente.
- Headline: frase direta e factual (máx 6 palavras), sem exagero
- CTA: convite simples e natural para visita (máx 8 palavras), sem urgência artificial`;

    // Build the user message content with images + text
    const userContent = imageMessages.length > 0
      ? [...imageMessages, { type: "text", text: textPrompt }]
      : textPrompt;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          { role: "system", content: "Responda APENAS com a tool call solicitada. Seja sóbrio e factual. NUNCA use palavras exageradas, clichês imobiliários ou superlativos. Descreva o que se vê nas fotos de forma direta e precisa." },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_copy",
              description: "Return the generated property copy with photo-specific phrases",
              parameters: {
                type: "object",
                properties: {
                  phrases: {
                    type: "array",
                    items: { type: "string" },
                    description: "Impact phrases, one per photo, matching the visual content of each photo",
                  },
                  headline: { type: "string", description: "Main headline" },
                  cta: { type: "string", description: "Call to action text" },
                },
                required: ["phrases", "headline", "cta"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_copy" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("generate-property-copy error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { useState, useEffect } from "react";
import { Property } from "@/types/property";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyCopy {
  phrases: string[];
  headline: string;
  cta: string;
}

const CACHE_KEY = "sgflix-copy-";

export function usePropertyCopy(property: Property, photoCount: number, photoUrls?: string[]) {
  const [copy, setCopy] = useState<PropertyCopy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use photo URLs in cache key so new photos invalidate stale copy
    const photosHash = photoUrls?.slice(0, 5).map(u => u.slice(-20)).join(",") || "";
    const cacheKey = CACHE_KEY + property.id + "-" + photosHash;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as PropertyCopy;
        if (parsed.phrases?.length >= photoCount) {
          setCopy(parsed);
          setLoading(false);
          return;
        }
      } catch {}
    }

    const fetchCopy = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-property-copy", {
          body: {
            property: {
              tipo: property.tipo,
              titulo: property.titulo,
              preco: property.preco,
              bairro: property.bairro,
              cidade: property.cidade,
              quartos: property.quartos,
              suites: property.suites,
              banheiros: property.banheiros,
              vagas: property.vagas,
              area: property.area,
              descricao: property.descricao,
            },
            photoCount,
            photoUrls: photoUrls || property.fotos?.slice(0, photoCount),
          },
        });

        if (error) throw error;
        if (data?.phrases) {
          setCopy(data as PropertyCopy);
          localStorage.setItem(cacheKey, JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to generate copy:", err);
        // Fallback phrases
        const fallback: PropertyCopy = {
          phrases: Array.from({ length: photoCount }, (_, i) => {
            const defaults = [
              "Ambientes bem distribuídos",
              "Acabamento de qualidade",
              "Boa localização no bairro",
              "Espaço para toda a família",
              "Iluminação natural generosa",
              "Área útil bem aproveitada",
              "Planta funcional e prática",
              "Entorno com boa infraestrutura",
            ];
            return defaults[i % defaults.length];
          }),
          headline: property.titulo,
          cta: "Agende sua visita agora!",
        };
        setCopy(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchCopy();
  }, [property.id, photoCount]);

  return { copy, loading };
}

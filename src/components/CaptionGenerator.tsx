import React, { useState } from "react";
import { Property } from "@/types/property";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Loader2, RefreshCw, Type, Sparkles, Zap, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CaptionGeneratorProps {
  property: Property;
  onClose: () => void;
}

const STYLES = [
  { id: "informativo", label: "Informativo", desc: "Dados claros e organizados", icon: Type },
  { id: "emocional", label: "Envolvente", desc: "Como é viver ali", icon: Sparkles },
  { id: "urgente", label: "Oportunidade", desc: "Direto e com urgência sutil", icon: Zap },
  { id: "minimalista", label: "Minimalista", desc: "Poucas palavras, máximo impacto", icon: Minus },
] as const;

const CACHE_KEY = "sgcreator-caption-";

const CaptionGenerator = ({ property, onClose }: CaptionGeneratorProps) => {
  const [style, setStyle] = useState<string>("informativo");
  const [caption, setCaption] = useState<string | null>(() => {
    const cached = localStorage.getItem(CACHE_KEY + property.id + "-" + "informativo");
    return cached || null;
  });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async (selectedStyle?: string) => {
    const s = selectedStyle || style;
    setLoading(true);
    setCaption(null);
    try {
      const { data, error } = await supabase.functions.invoke("generate-caption", {
        body: {
          property: {
            id: property.id,
            tipo: property.tipo,
            titulo: property.titulo,
            preco: property.preco,
            valorVenda: property.valorVenda,
            valorLocacao: property.valorLocacao,
            bairro: property.bairro,
            cidade: property.cidade,
            estado: property.estado,
            quartos: property.quartos,
            suites: property.suites,
            banheiros: property.banheiros,
            vagas: property.vagas,
            area: property.area,
            condominio: property.condominio,
            descricao: property.descricao,
            situacao: property.situacao,
            destinacao: property.destinacao,
          },
          style: s,
        },
      });

      if (error) throw error;
      if (data?.caption) {
        setCaption(data.caption);
        localStorage.setItem(CACHE_KEY + property.id + "-" + s, data.caption);
      }
    } catch (err: any) {
      console.error("Caption error:", err);
      toast.error("Erro ao gerar legenda: " + (err.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = (s: string) => {
    setStyle(s);
    const cached = localStorage.getItem(CACHE_KEY + property.id + "-" + s);
    if (cached) {
      setCaption(cached);
    } else {
      setCaption(null);
    }
  };

  const copyToClipboard = async () => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      toast.success("Legenda copiada!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-2xl border border-border/50 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
          <div>
            <h2 className="text-sm font-bold text-foreground">Gerar Legenda</h2>
            <p className="text-[10px] text-muted-foreground truncate max-w-[280px]">{property.titulo}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Style picker */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tom da legenda</span>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => {
                const isSelected = style === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleStyleChange(s.id)}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <s.icon className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{s.label}</p>
                      <p className="text-[9px] opacity-60">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <Button
            onClick={() => generate()}
            disabled={loading}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-10"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gerando legenda...
              </>
            ) : caption ? (
              <>
                <RefreshCw className="w-4 h-4" />
                Gerar nova legenda
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Gerar legenda
              </>
            )}
          </Button>

          {/* Caption result */}
          <AnimatePresence>
            {caption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="bg-muted/50 rounded-xl p-4 border border-border/30">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{caption}</p>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  className="w-full gap-2 h-9"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar legenda
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CaptionGenerator;

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useDemo } from "@/contexts/DemoContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Palette, Save, Image, Phone, Eye, EyeOff,
  Gauge, Type, MapPin, DollarSign, BarChart3,
  MessageCircle, Play, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { VideoDisplayConfig } from "@/types/property";

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const VIDEO_TOGGLE_OPTIONS: {
  key: keyof VideoDisplayConfig;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  { key: "showLogo", label: "Logo", description: "Marca d'água no canto do vídeo", icon: Image },
  { key: "showBrandName", label: "Nome da marca", description: "Exibido junto à logo e no CTA", icon: Type },
  { key: "showPrice", label: "Preço", description: "Valor em destaque no intro e slides", icon: DollarSign },
  { key: "showStats", label: "Características", description: "Quartos, banheiros, vagas, m²", icon: BarChart3 },
  { key: "showLocation", label: "Localização", description: "Bairro e cidade nos slides", icon: MapPin },
  { key: "showAIPhrases", label: "Frases da IA", description: "Legendas geradas automaticamente", icon: Sparkles },
  { key: "showContact", label: "Contato / CTA", description: "WhatsApp e telefone no final", icon: MessageCircle },
  { key: "showProgressBar", label: "Barra de progresso", description: "Barra navegável na parte inferior", icon: Play },
];

const SPEED_OPTIONS = [
  { value: "slow" as const, label: "Lento", desc: "~4s por foto" },
  { value: "normal" as const, label: "Normal", desc: "~2.8s por foto" },
  { value: "fast" as const, label: "Rápido", desc: "~1.8s por foto" },
];

const COLOR_INFO = [
  {
    field: "corPrimaria" as const,
    label: "Cor Principal",
    description: "Fundo do CTA, ícones de destaque, barra de progresso, badges",
  },
  {
    field: "corSecundaria" as const,
    label: "Cor de Destaque",
    description: "Preço, ícones dos stats, glow do valor, detalhes de brilho",
  },
];

const BrandConfig = () => {
  const { brand, setBrand } = useApp();
  const { blockWrite } = useDemo();
  const [form, setForm] = useState({ ...brand });
  const [logoPreview, setLogoPreview] = useState(brand.logoUrl);

  useEffect(() => {
    setForm({ ...brand });
    setLogoPreview(brand.logoUrl);
  }, [brand]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (blockWrite()) return;
    const toSave = { ...form, logoUrl: logoPreview };
    setBrand(toSave);
    // Verify persistence
    try {
      const check = localStorage.getItem("sgflix-brand");
      if (check) {
        const parsed = JSON.parse(check);
        if (parsed.nome === toSave.nome) {
          toast.success("Marca salva com sucesso!");
        } else {
          toast.warning("Marca salva parcialmente — verifique se a logo não é muito grande.");
        }
      } else {
        toast.error("Erro ao salvar — armazenamento cheio. Tente reduzir o tamanho da logo.");
      }
    } catch {
      toast.error("Erro ao verificar salvamento.");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limit to 500KB to avoid localStorage quota issues
    if (file.size > 500 * 1024) {
      toast.error("Logo muito grande. Máximo 500KB para garantir salvamento.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setLogoPreview(base64);
      toast.success("Logo carregada! Clique em Salvar.");
    } catch {
      toast.error("Erro ao carregar logo.");
    }
  };

  const toggleVideoOption = (key: keyof VideoDisplayConfig) => {
    setForm(prev => ({
      ...prev,
      videoDisplay: { ...prev.videoDisplay, [key]: !prev.videoDisplay[key] },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <Palette className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Configuração da Marca</h3>
          <p className="text-xs text-muted-foreground">Tudo que aparece nos seus vídeos</p>
        </div>
      </div>

      {/* === SECTION: Identity === */}
      <section className="glass rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" />
          Identidade
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome da Imobiliária</Label>
            <Input
              id="nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Sua Imobiliária"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contato">Telefone de contato</Label>
            <Input
              id="contato"
              value={form.contato}
              onChange={(e) => setForm({ ...form, contato: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp (com DDI, sem espaços)</Label>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              id="whatsapp"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="553240098611"
              className="font-mono"
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Usado no botão "Fale no WhatsApp" do CTA</p>
        </div>

        <div className="space-y-1.5">
          <Label>Logo da marca</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <Image className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                {logoPreview ? "Trocar logo" : "Upload logo"}
              </Button>
              <p className="text-[10px] text-muted-foreground">PNG ou SVG transparente, até 2MB</p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <Label htmlFor="feedUrl">URL do feed do seu CRM</Label>
          <Input
            id="feedUrl"
            value={form.feedUrl || ""}
            onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
            placeholder="https://api.robustcrm.io/feeds/..."
            className="font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">Cole aqui a URL do seu feed RobustCRM ou similar.</p>
        </div>
      </section>

      {/* === SECTION: Colors === */}
      <section className="glass rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary" />
          Cores do vídeo
        </h4>

        <div className="grid gap-4 sm:grid-cols-2">
          {COLOR_INFO.map((c) => (
            <div key={c.field} className="space-y-2">
              <Label>{c.label}</Label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={form[c.field]}
                    onChange={(e) => setForm({ ...form, [c.field]: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-border/50"
                    style={{ padding: 0 }}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-mono text-foreground">{form[c.field]}</span>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{c.description}</p>
                </div>
              </div>
              {/* Live preview stripe */}
              <div className="h-2 rounded-full" style={{ backgroundColor: form[c.field] }} />
            </div>
          ))}
        </div>

        {/* Preview miniature */}
        <div className="rounded-xl overflow-hidden border border-border/30">
          <div className="relative h-28 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${form.corPrimaria}, ${form.corPrimaria}cc)` }}>
            {logoPreview && <img src={logoPreview} alt="" className="w-10 h-10 object-contain absolute top-3 left-3 opacity-60" />}
            <div className="text-center">
              <p className="text-white/60 text-[10px] uppercase tracking-widest">Preview</p>
              <p className="text-2xl font-bold" style={{ color: form.corSecundaria }}>R$ 850.000</p>
              <p className="text-white/50 text-xs">{form.nome || "Sua marca"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* === SECTION: Video Elements === */}
      <section className="glass rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          Elementos do vídeo
        </h4>
        <p className="text-xs text-muted-foreground">Escolha o que aparece na apresentação</p>

        <div className="grid gap-2">
          {VIDEO_TOGGLE_OPTIONS.map((opt) => {
            const isOn = form.videoDisplay[opt.key];
            return (
              <div
                key={opt.key}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  isOn ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border/30"
                }`}
                onClick={() => toggleVideoOption(opt.key)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isOn ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
                    <opt.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isOn ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</p>
                    <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isOn}
                  onCheckedChange={() => toggleVideoOption(opt.key)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* === SECTION: Slide Speed === */}
      <section className="glass rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          Velocidade dos slides
        </h4>

        <div className="grid grid-cols-3 gap-2">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setForm({ ...form, slideSpeed: s.value })}
              className={`p-3 rounded-lg border text-center transition-all ${
                form.slideSpeed === s.value
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20"
                  : "bg-muted/20 border-border/30 hover:bg-muted/40"
              }`}
            >
              <p className={`text-sm font-semibold ${form.slideSpeed === s.value ? "text-primary" : "text-foreground"}`}>{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Save button — sticky */}
      <div className="sticky bottom-4 z-10">
        <Button onClick={handleSave} className="w-full gap-2 h-12 text-base shadow-lg">
          <Save className="w-5 h-5" /> Salvar Configurações
        </Button>
      </div>
    </motion.div>
  );
};

export default BrandConfig;

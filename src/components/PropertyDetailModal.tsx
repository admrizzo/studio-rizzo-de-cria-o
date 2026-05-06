import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Property, PresentationMode } from "@/types/property";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Play, Bed, Bath, Car, Maximize,
  MapPin, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Film, Palette, Type,
  Video, Image, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TemplateGallery from "@/components/templates/TemplateGallery";
import CaptionGenerator from "@/components/CaptionGenerator";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

type ModalStep = "choose" | "video" | "arte" | "legenda";

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
}

const PropertyDetailModal = ({ property, onClose }: PropertyDetailModalProps) => {
  const { setSelectedProperty, setPresentationMode, setSelectedPhotos, brand, curatedPhotosMap, setCuratedPhotos, setActiveExport, presentationMode, activeExport } = useApp();
  const [step, setStep] = useState<ModalStep>("choose");
  const [isMounted, setIsMounted] = useState(false);

  // Video-specific state
  const [orderedPhotos, setOrderedPhotos] = useState<string[]>(() => {
    const saved = curatedPhotosMap[property.id];
    return saved && saved.length > 0 ? saved : [...property.fotos];
  });

  const selectedSet = useMemo(() => new Set(orderedPhotos), [orderedPhotos]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setCuratedPhotos(property.id, orderedPhotos);
    }, 300);
    return () => clearTimeout(saveTimerRef.current);
  }, [orderedPhotos]);

  const togglePhoto = useCallback((url: string) => {
    setOrderedPhotos(prev => {
      const set = new Set(prev);
      if (set.has(url)) return prev.filter(p => p !== url);
      return [...prev, url];
    });
  }, []);

  const selectAll = useCallback(() => setOrderedPhotos([...property.fotos]), [property.fotos]);
  const deselectAll = useCallback(() => setOrderedPhotos([]), []);

  const removeFromOrder = useCallback((url: string) => {
    setOrderedPhotos(prev => prev.filter(p => p !== url));
  }, []);

  const launchPresentation = useCallback((mode: PresentationMode) => {
    if (orderedPhotos.length === 0) return;
    setCuratedPhotos(property.id, orderedPhotos);
    setSelectedPhotos(orderedPhotos);
    setSelectedProperty(property);
    setPresentationMode(mode);
  }, [orderedPhotos, property]);

  const openPreview = useCallback(() => {
    if (orderedPhotos.length === 0) return;
    setCuratedPhotos(property.id, orderedPhotos);
    setActiveExport({ property, brand, photos: orderedPhotos });
  }, [orderedPhotos, property, brand]);

  const stats = [
    { icon: Bed, value: property.quartos, label: property.quartos === 1 ? "Quarto" : "Quartos" },
    { icon: Bath, value: property.banheiros, label: property.banheiros === 1 ? "Banheiro" : "Banheiros" },
    { icon: Car, value: property.vagas, label: property.vagas === 1 ? "Vaga" : "Vagas" },
    { icon: Maximize, value: property.area, label: "m²" },
  ].filter(s => s.value > 0);

  const propertyId = property.id.replace(/^u-/, "");

  // ────────────────────────────────────────────────
  // STEP: CHOOSE — "O que quer fazer?"
  // ────────────────────────────────────────────────
  const renderChoose = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-3xl border border-border/50 w-full max-w-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with property info */}
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {property.tipo}
              </span>
              <span className="text-xs text-muted-foreground font-mono">ID {propertyId}</span>
              {property.condominio && (
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-secondary/15 text-secondary">
                  {property.condominio}
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-foreground leading-tight">{property.titulo}</h2>
            <p className="text-muted-foreground text-xs flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-primary/70 shrink-0" />
              <span className="truncate">
                {property.bairro}
              </span>
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {property.preco > 0 && (
                <span className="text-lg font-black text-secondary tracking-tight">
                  {formatPrice(property.preco)}
                </span>
              )}
              <div className="flex gap-1.5 text-xs text-muted-foreground flex-wrap">
                {stats.map((stat) => (
                  <span key={stat.label} className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                    <stat.icon className="w-3.5 h-3.5 text-primary/60" />
                    <span className="font-medium text-foreground">{stat.value}</span>
                    <span className="text-[10px]">{stat.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0 -mt-1 -mr-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Foto principal pequena */}
        {property.fotos[0] && (
          <div className="px-6 pb-3">
            <img
              src={property.fotosSmall?.[0] || property.fotos[0]}
              alt={property.titulo}
              className="w-full h-40 rounded-2xl object-cover border border-border/50"
            />
          </div>
        )}

        {/* Ações */}
        <div className="px-6 pb-6 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">O que deseja criar?</p>
          <div className="grid gap-3">
            <button
              onClick={() => setStep("video")}
              className="flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left transition-all hover:bg-primary/10 hover:border-primary/40 group"
            >
              <div className="rounded-xl bg-primary/15 p-3 text-primary group-hover:bg-primary/25 transition-colors">
                <Video className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Vídeo</p>
                <p className="text-xs text-muted-foreground">Apresente ou exporte vídeo com as fotos do imóvel</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              onClick={() => setStep("arte")}
              className="flex items-center gap-4 rounded-2xl border border-secondary/20 bg-secondary/5 p-4 text-left transition-all hover:bg-secondary/10 hover:border-secondary/40 group"
            >
              <div className="rounded-xl bg-secondary/15 p-3 text-secondary group-hover:bg-secondary/25 transition-colors">
                <Palette className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Arte</p>
                <p className="text-xs text-muted-foreground">Crie artes profissionais para Stories e Posts</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            <button
              onClick={() => setStep("legenda")}
              className="flex items-center gap-4 rounded-2xl border border-border bg-muted/30 p-4 text-left transition-all hover:bg-muted/50 hover:border-border group"
            >
              <div className="rounded-xl bg-muted p-3 text-foreground group-hover:bg-muted/80 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Legenda</p>
                <p className="text-xs text-muted-foreground">Gere textos profissionais para publicação</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  // ────────────────────────────────────────────────
  // STEP: VIDEO — seleção de fotos + ações
  // ────────────────────────────────────────────────
  const renderVideo = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background"
    >
      {/* Header — mesmo padrão do Criador de Artes */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0 bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground leading-tight">Criador de Vídeo</h2>
            <p className="text-sm text-muted-foreground truncate">{property.titulo}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selecione as fotos e a ordem para o vídeo. <span className="text-primary font-semibold">{orderedPhotos.length}</span> de {property.fotos.length} selecionadas
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setStep("choose")} className="gap-2 shrink-0">
          <X className="w-4 h-4" /> Fechar
        </Button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100vh - 73px)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => launchPresentation("video")}
              disabled={orderedPhotos.length === 0}
              className="gap-2"
            >
              <Play className="w-3.5 h-3.5" /> Apresentar vídeo
            </Button>
            <Button
              variant="outline"
              onClick={openPreview}
              disabled={orderedPhotos.length === 0}
              className="gap-2"
            >
              <Film className="w-3.5 h-3.5" /> Exportar vídeo
            </Button>
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={selectAll} className="text-xs">
              Selecionar todas
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs text-muted-foreground">
              Limpar
            </Button>
          </div>

          {/* Ordem das fotos selecionadas */}
          {orderedPhotos.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Ordem do vídeo</h3>
                <span className="text-xs text-muted-foreground ml-auto">Arraste para reordenar · X para remover</span>
              </div>
              <div className="relative group/strip">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget.parentElement?.querySelector('[data-scroll-strip]');
                    if (container) container.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                  className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-card to-transparent flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const container = e.currentTarget.parentElement?.querySelector('[data-scroll-strip]');
                    if (container) container.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                  className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-card to-transparent flex items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
                <div
                  data-scroll-strip
                  className="overflow-x-auto scrollbar-none"
                  style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
                >
                  <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                    {orderedPhotos.map((url, i) => (
                      <div
                        key={url}
                        className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden group border-2 border-primary/30 hover:border-primary/60 transition-colors"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold w-5 h-5 rounded-md flex items-center justify-center pointer-events-none shadow-sm">
                          {i + 1}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFromOrder(url); }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-md bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderedPhotos(prev => {
                                const next = [...prev];
                                [next[i - 1], next[i]] = [next[i], next[i - 1]];
                                return next;
                              });
                            }}
                            className="absolute bottom-1 left-1 w-5 h-5 rounded-md bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {i < orderedPhotos.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOrderedPhotos(prev => {
                                const next = [...prev];
                                [next[i], next[i + 1]] = [next[i + 1], next[i]];
                                return next;
                              });
                            }}
                            className="absolute bottom-1 right-1 w-5 h-5 rounded-md bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Todas as fotos */}
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Fotos do imóvel</h3>
            <p className="text-xs text-muted-foreground mb-3">Clique para selecionar ou remover fotos do vídeo</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {property.fotos.map((foto, index) => {
              const isSelected = selectedSet.has(foto);
              const orderNum = orderedPhotos.indexOf(foto);
              return (
                <div
                  key={index}
                  onClick={() => togglePhoto(foto)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 ${
                    isSelected
                      ? "ring-2 ring-primary shadow-md"
                      : "opacity-50 hover:opacity-80 hover:shadow-sm"
                  }`}
                >
                  <img
                    src={property.fotosSmall?.[index] || foto}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 transition-colors ${
                    isSelected ? "bg-primary/10" : "bg-black/30 group-hover:bg-black/10"
                  }`} />
                  <div className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground scale-100"
                      : "bg-black/40 text-white/50 scale-90 group-hover:scale-100"
                  }`}>
                    {isSelected ? <span className="text-xs font-bold">{orderNum + 1}</span> : <span className="text-xs font-mono">{index + 1}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  if (!isMounted) return null;

  // Hide modal when presentation or export is active (they render their own overlays)
  if (presentationMode || activeExport) return null;

  return createPortal(
    <>
      <AnimatePresence mode="wait">
        {step === "choose" && <React.Fragment key="choose">{renderChoose()}</React.Fragment>}
        {step === "video" && <React.Fragment key="video">{renderVideo()}</React.Fragment>}
      </AnimatePresence>

      {/* Arte — full-screen overlay via portal */}
      {step === "arte" && (
        <TemplateGallery
          property={property}
          brand={brand}
          onClose={() => setStep("choose")}
        />
      )}

      {/* Legenda */}
      {step === "legenda" && (
        <div onClick={(e) => e.stopPropagation()}>
          <CaptionGenerator
            property={property}
            onClose={() => setStep("choose")}
          />
        </div>
      )}
    </>,
    document.body,
  );
};

export default PropertyDetailModal;

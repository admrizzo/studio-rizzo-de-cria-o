import React, { useState, useEffect, useCallback } from "react";
import { Property, BrandConfig } from "@/types/property";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Bed, BedDouble, Bath, Car, Maximize, MapPin, Building, TreePalm, ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePropertyCopy } from "@/hooks/usePropertyCopy";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

interface VideoPresentationProps {
  property: Property;
  brand: BrandConfig;
  onClose: () => void;
}

// === TRANSITION TYPES ===
type TransitionType = "zoom-punch" | "slide-right" | "flash" | "glitch" | "hard-cut";
const TRANSITIONS: TransitionType[] = ["zoom-punch", "slide-right", "flash", "glitch", "hard-cut"];

const getTransitionVariants = (type: TransitionType) => {
  // All exits use a smooth crossfade so text never cuts abruptly
  const smoothExit = { opacity: 0, transition: { duration: 0.5, ease: "easeIn" } };
  switch (type) {
    case "zoom-punch":
      return {
        initial: { opacity: 0, scale: 1.15 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
        exit: smoothExit,
      };
    case "slide-right":
      return {
        initial: { opacity: 0.3, x: "60%" },
        animate: { opacity: 1, x: "0%", transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
        exit: smoothExit,
      };
    case "flash":
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15 } },
        exit: smoothExit,
      };
    case "glitch":
      return {
        initial: { opacity: 0, x: -5, skewX: -2 },
        animate: { opacity: 1, x: 0, skewX: 0, transition: { duration: 0.25 } },
        exit: smoothExit,
      };
    case "hard-cut":
      return {
        initial: { opacity: 0.8 },
        animate: { opacity: 1, transition: { duration: 0.1 } },
        exit: smoothExit,
      };
  }
};

// Ken Burns presets
const kenBurnsStyles = [
  { transform: "scale(1.05) translate(0%, 0%)", transformEnd: "scale(1.22) translate(-2%, -1.5%)" },
  { transform: "scale(1.2) translate(-2%, 1%)", transformEnd: "scale(1.05) translate(2%, -1%)" },
  { transform: "scale(1.05) translate(0%, 0%)", transformEnd: "scale(1.25) translate(1.5%, 2%)" },
  { transform: "scale(1.2) translate(2%, -2%)", transformEnd: "scale(1.06) translate(-1.5%, 1%)" },
  { transform: "scale(1.06) translate(-1%, 1%)", transformEnd: "scale(1.2) translate(2%, -2%)" },
  { transform: "scale(1.15) translate(1%, -1%)", transformEnd: "scale(1.05) translate(-2%, 1.5%)" },
  { transform: "scale(1.05) translate(-2%, 1.5%)", transformEnd: "scale(1.18) translate(1%, -1%)" },
  { transform: "scale(1.18) translate(1.5%, -1%)", transformEnd: "scale(1.04) translate(-1%, 1.5%)" },
];

// Timing - base values, adjusted by speed setting
const BASE_SLIDE_DURATION = 2800;
const SLIDE_ANIM_EXTRA = 800;
const INTRO_DURATION = 5500;
const CTA_SLIDE_DURATION = 7000;
const VINHETA_URL_MP4 = "";
const VINHETA_URL_MOV = "";

const getSpeedMultiplier = (speed: "slow" | "normal" | "fast") => {
  switch (speed) {
    case "slow": return 1.4;
    case "fast": return 0.65;
    default: return 1;
  }
};

const getSlideDuration = (index: number, speed: "slow" | "normal" | "fast") => {
  const mul = getSpeedMultiplier(speed);
  const variations = [2800, 2400, 3200, 2600, 3000, 2200, 2800, 3400];
  return Math.round(variations[index % variations.length] * mul);
};

// === TYPEWRITER COMPONENT ===
const TypewriterText = ({ text, delay = 0, className = "", style = {} }: { text: string; delay?: number; className?: string; style?: React.CSSProperties }) => {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 40);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  return <span className={className} style={style}>{displayed}<span className="animate-pulse">|</span></span>;
};

// === ANIMATED PRICE COUNTER ===
// Pre-calculates final text width so position never shifts during animation
const PriceCounter = ({ target, duration = 1500, delay = 0, className = "", style = {} }: {
  target: number; duration?: number; delay?: number; className?: string; style?: React.CSSProperties;
}) => {
  const [value, setValue] = useState(0);
  const finalText = formatPrice(target);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(target * eased));
        if (progress >= 1) clearInterval(interval);
      }, 16);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return (
    <span className={`inline-block ${className}`} style={{ ...style, fontVariantNumeric: "tabular-nums" }}>
      {/* Invisible final value to reserve exact width */}
      <span className="invisible block h-0 overflow-hidden" aria-hidden="true">{finalText}</span>
      <span>{formatPrice(value)}</span>
    </span>
  );
};

const VideoPresentation = ({ property, brand, onClose }: VideoPresentationProps) => {
  const { selectedPhotos } = useApp();
  const vd = brand.videoDisplay;
  const speedMul = getSpeedMultiplier(brand.slideSpeed);
  const SLIDE_ANIM_DURATION = Math.round((BASE_SLIDE_DURATION + SLIDE_ANIM_EXTRA) * speedMul);
  const photos = selectedPhotos.length > 0 ? selectedPhotos : property.fotos;
  const totalSlides = photos.length + 2; // INTRO + PHOTOS + VINHETA (no CTA)
  const [current, setCurrent] = useState(0);
  const [vinhetaDuration, setVinhetaDuration] = useState(5000);
  const [showFlash, setShowFlash] = useState(false);
  const [vinhetaError, setVinhetaError] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const vinhetaRef = React.useRef<HTMLVideoElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const slideStartRef = React.useRef(Date.now());
  const slideDurRef = React.useRef(INTRO_DURATION);

  const { copy } = usePropertyCopy(property, photos.length, photos);
  const bgMusic = useBackgroundMusic();

  const next = useCallback(() => setCurrent((c) => (c + 1) % totalSlides), [totalSlides]);

  const isIntro = current === 0;
  const isVinheta = current === totalSlides - 1;
  const isLastPhoto = !isIntro && !isVinheta && (current - 1) === photos.length - 1;
  const isCTA = false; // kept for compat

  // Generate background music on mount
  useEffect(() => {
    const totalDuration = Math.ceil((INTRO_DURATION + photos.length * 2800) / 1000);
    bgMusic.generate(Math.min(totalDuration, 60));
  }, []);

  // Play music as soon as ready (retry on every click for autoplay policy)
  useEffect(() => {
    if (bgMusic.ready && !isVinheta) {
      bgMusic.play();
    }
  }, [bgMusic.ready, isVinheta]);

  // Retry playing music on user interaction (autoplay policy workaround)
  useEffect(() => {
    if (!bgMusic.ready || isVinheta) return;
    const handleClick = () => {
      bgMusic.play();
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [bgMusic.ready, isVinheta]);

  const photoIndex = current - 1;

  // Flash effect for "flash" transitions
  useEffect(() => {
    if (!isIntro && !isCTA && !isVinheta && photoIndex >= 0) {
      const transType = TRANSITIONS[photoIndex % TRANSITIONS.length];
      if (transType === "flash") {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 100);
      }
    }
  }, [photoIndex, isIntro, isCTA, isVinheta]);

  // Track slide progress for the progress bar
  useEffect(() => {
    const photoIdx = current - 1;
    const dur = isVinheta ? vinhetaDuration : isIntro ? INTRO_DURATION : isLastPhoto ? CTA_SLIDE_DURATION : getSlideDuration(photoIdx, brand.slideSpeed);
    slideStartRef.current = Date.now();
    slideDurRef.current = dur;
    setSlideProgress(0);

    if (!isVinheta) {
      const frame = () => {
        const elapsed = Date.now() - slideStartRef.current;
        setSlideProgress(Math.min(elapsed / slideDurRef.current, 1));
        if (elapsed < slideDurRef.current) requestAnimationFrame(frame);
      };
      const raf = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(raf);
    }
  }, [current, isVinheta, isIntro, isCTA]);

  // Preload vinheta video
  useEffect(() => {
    const link1 = document.createElement("link");
    link1.rel = "preload";
    link1.as = "video";
    link1.href = VINHETA_URL_MP4;
    document.head.appendChild(link1);
    const link2 = document.createElement("link");
    link2.rel = "preload";
    link2.as = "video";
    link2.href = VINHETA_URL_MOV;
    document.head.appendChild(link2);
    return () => { 
      document.head.removeChild(link1); 
      document.head.removeChild(link2); 
    };
  }, []);

  // Play vinheta when it becomes active
  useEffect(() => {
    if (!isVinheta) return;
    bgMusic.stop();

    const vid = vinhetaRef.current;
    if (!vid) {
      // Should never happen since video is always mounted now
      setTimeout(() => setCurrent(0), 3000);
      return;
    }

    vid.currentTime = 0;
    vid.muted = false;
    vid.volume = 1;
    
    const playPromise = vid.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked — try muted first, then unmute
        vid.muted = true;
        vid.play().then(() => {
          // Unmute after a tiny delay
          setTimeout(() => { vid.muted = false; }, 100);
        }).catch(() => {
          console.error("Vinheta play completely blocked");
          setVinhetaError(true);
          setTimeout(() => setCurrent(0), 4000);
        });
      });
    }

    const fallback = setTimeout(() => setCurrent(0), 15000);
    return () => clearTimeout(fallback);
  }, [isVinheta]);

  // Main timer (non-vinheta)
  useEffect(() => {
    if (isVinheta) return;
    const photoIdx = current - 1;
    const duration = isIntro ? INTRO_DURATION : isLastPhoto ? CTA_SLIDE_DURATION : getSlideDuration(photoIdx, brand.slideSpeed);
    const timer = setTimeout(next, duration);
    return () => clearTimeout(timer);
  }, [current, next, totalSlides, isCTA, isVinheta, isIntro]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + totalSlides) % totalSlides);
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, onClose, totalSlides]);

  // Detect condo features from description
  const desc = (property.descricao || "").toLowerCase();
  const hasElevador = desc.includes("elevador");
  const tipoLower = (property.tipo || "").toLowerCase();
  const isApartmentType = tipoLower.includes("apartamento") || tipoLower.includes("cobertura") || tipoLower.includes("flat") || tipoLower.includes("kitnet") || tipoLower.includes("loft") || tipoLower.includes("studio");
  const hasLazer = isApartmentType && (desc.includes("lazer") || desc.includes("piscina") || desc.includes("academia") || desc.includes("churrasqueira") || desc.includes("salão de festas"));
  const hasCondominio = !!property.condominio;

  const stats: { icon: any; value: number; suffix: string; hideValue?: boolean }[] = [
    { icon: Bed, value: property.quartos, suffix: property.quartos === 1 ? "quarto" : "quartos" },
    ...(property.suites ? [{ icon: BedDouble, value: property.suites, suffix: property.suites === 1 ? "suíte" : "suítes" }] : []),
    { icon: Car, value: property.vagas, suffix: property.vagas === 1 ? "vaga" : "vagas" },
    { icon: Bath, value: property.banheiros, suffix: property.banheiros === 1 ? "banheiro" : "banheiros" },
    { icon: Maximize, value: property.area, suffix: "m²" },
    ...(hasElevador ? [{ icon: ArrowUpDown, value: 1, suffix: "Elevador", hideValue: true }] : []),
    ...(hasLazer ? [{ icon: TreePalm, value: 1, suffix: "Lazer", hideValue: true }] : []),
    ...(hasCondominio ? [{ icon: Building, value: 1, suffix: property.condominio!, hideValue: true }] : []),
  ].filter(s => s.value && s.value !== 0);

  const currentTransition = photoIndex >= 0 ? TRANSITIONS[photoIndex % TRANSITIONS.length] : "zoom-punch";
  const transVariants = getTransitionVariants(currentTransition);

  const keyframesCSS = kenBurnsStyles.map((kb, i) => `
    @keyframes kenburns-${i} {
      0% { transform: ${kb.transform}; }
      100% { transform: ${kb.transformEnd}; }
    }
  `).join("\n");

  const currentPhrase = copy?.phrases?.[photoIndex] || "";

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: keyframesCSS }} />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black overflow-hidden font-sans flex items-center justify-center"
    >
      {/* Phone-shaped container on desktop, full screen on mobile */}
      <div
        className="relative w-full h-full sm:w-auto sm:h-full cursor-pointer overflow-hidden"
        style={{ aspectRatio: "9/16", maxHeight: "100vh" }}
        onClick={() => { if (!isVinheta) next(); }}
      >
      {/* WHITE FLASH overlay */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 z-30 bg-white"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="sync">
        {/* === INTRO (no countdown, starts directly) === */}
        {isIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <motion.img
              src={photos[0]}
              alt=""
              className="w-full h-full object-cover"
              initial={{ scale: 1.4 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 5.5, ease: "easeOut" }}
            />
            <div className="absolute inset-0 bg-black/70" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="px-4 py-1.5 rounded-full border border-white/20 text-white/60 text-xs uppercase tracking-[0.4em] mb-6 font-normal"
              >
                {property.tipo}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                <TypewriterText
                  text={property.titulo}
                  className="text-white text-2xl font-normal tracking-wide leading-snug"
                />
              </motion.div>

              {vd.showPrice && property.preco > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, x: [0, -3, 3, -2, 2, 0] }}
                  transition={{ duration: 0.5, x: { delay: 0.5, duration: 0.3 } }}
                >
                  <PriceCounter
                    target={property.preco}
                    delay={200}
                    duration={1200}
                    className="text-3xl font-bold tracking-tighter"
                    style={{
                      color: brand.corSecundaria,
                      textShadow: `0 0 60px ${brand.corSecundaria}60, 0 0 120px ${brand.corSecundaria}30`,
                    }}
                  />
                </motion.div>
              )}

              {vd.showLocation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center gap-2 text-white/50 text-sm mt-6"
              >
                <MapPin className="w-5 h-5" />
                <span>{property.bairro}</span>
              </motion.div>
              )}

              {vd.showStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex gap-3 mt-8 flex-wrap justify-center"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full border border-white/10"
                  >
                    <stat.icon className="w-5 h-5" style={{ color: brand.corSecundaria }} />
                    {!stat.hideValue && <span className="text-white font-bold text-base">{stat.value}</span>}
                    <span className="text-white/40 text-xs">{stat.suffix}</span>
                  </motion.div>
                ))}
              </motion.div>
              )}
            </div>

            {vd.showLogo && brand.logoUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute top-6 left-6"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
              >
                <img src={brand.logoUrl} alt="" className="w-8 h-8 object-contain" />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* === PHOTO SLIDES === */}
        {!isIntro && !isCTA && !isVinheta && (() => {
          return (
          <motion.div
            key={`photo-${photoIndex}`}
            initial={transVariants.initial}
            animate={transVariants.animate}
            exit={transVariants.exit}
            className="absolute inset-0 overflow-hidden"
          >
            <div
              className="absolute inset-0"
              style={{
                animation: `kenburns-${photoIndex % kenBurnsStyles.length} ${SLIDE_ANIM_DURATION}ms linear forwards`,
              }}
            >
              <img
                src={photos[photoIndex]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
            <div className="absolute inset-0" style={{
              background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)"
            }} />
            <div className="absolute inset-0 opacity-[0.02] bg-noise pointer-events-none" />

            {/* Glitch RGB effect overlay */}
            {currentTransition === "glitch" && (
              <>
                <motion.div
                  className="absolute inset-0 mix-blend-screen pointer-events-none"
                  initial={{ x: -4, opacity: 0.7 }}
                  animate={{ x: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ background: "rgba(255,0,0,0.15)" }}
                />
                <motion.div
                  className="absolute inset-0 mix-blend-screen pointer-events-none"
                  initial={{ x: 4, opacity: 0.7 }}
                  animate={{ x: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ background: "rgba(0,0,255,0.15)" }}
                />
              </>
            )}

            {/* AI PHRASE + price/stats overlays OR CTA on last photo */}
            {isLastPhoto ? (
              <>
                {/* Darker overlay for CTA readability */}
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  {vd.showLogo && brand.logoUrl && (
                    <motion.img
                      src={brand.logoUrl}
                      alt=""
                      className="w-24 h-24 object-contain rounded-2xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}

                  {vd.showPrice && property.preco > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <PriceCounter
                        target={property.preco}
                        delay={300}
                        duration={800}
                        className="text-3xl font-bold"
                        style={{ color: brand.corSecundaria, textShadow: `0 0 40px ${brand.corSecundaria}40` }}
                      />
                    </motion.div>
                  )}

                  {vd.showLocation && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-white/70 text-sm"
                  >
                    {property.bairro}
                  </motion.p>
                  )}

                  {vd.showContact && (
                  <motion.a
                    href={`https://wa.me/${brand.whatsapp}?text=Olá! Tenho interesse no imóvel: ${property.titulo} (ID: ${property.id}) - ${formatPrice(property.preco)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    className="space-y-1 cursor-pointer"
                  >
                    <p className="text-white text-base font-bold">Agende sua visita</p>
                    <p className="text-white/80 text-lg font-bold tracking-wide">
                      {brand.contato || (brand.whatsapp || "").replace(/^55/, "").replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}
                    </p>
                  </motion.a>
                  )}

                  {/* Property ID for broker reference */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="mt-2 space-y-0.5"
                  >
                    <p className="text-white/40 text-xs">No site da imobiliária</p>
                    <p className="text-white/60 text-xs font-medium">pesquise o ID {property.id.replace(/^[a-zA-Z]-/, "")}</p>
                  </motion.div>

                  {/* Condominium name if available */}
                  {property.condominio && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      className="text-white/50 text-xs"
                    >
                      {property.condominio}
                    </motion.p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* AI phrase - centered in the middle of the screen */}
                {vd.showAIPhrases && currentPhrase && (
                  <div className="absolute inset-0 flex items-center justify-center px-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                      className="text-center"
                    >
                      <TypewriterText
                        text={currentPhrase}
                        delay={300}
                        className="text-white text-base tracking-wide font-medium"
                        style={{
                          textShadow: "0 1px 6px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.3)",
                        }}
                      />
                    </motion.div>
                  </div>
                )}

                {/* Price + icons + location - at the bottom, safe zone for Reels */}
                <div className="absolute bottom-0 left-0 right-0 pb-20 px-6 flex flex-col items-center gap-3">
                  {vd.showPrice && (photoIndex === 0 || isLastPhoto) && property.preco > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1, x: [0, -2, 2, -1, 1, 0] }}
                      transition={{ delay: 0.4, duration: 0.4, x: { delay: 0.6, duration: 0.25 } }}
                    >
                      <span
                        className="text-2xl font-bold tracking-tight"
                        style={{ color: brand.corSecundaria, textShadow: `0 0 40px ${brand.corSecundaria}40` }}
                      >
                        {formatPrice(property.preco)}
                      </span>
                    </motion.div>
                  )}

                  {vd.showStats && photoIndex % 3 === 1 && (
                    <div className="flex gap-2 flex-wrap justify-center">
                      {stats.map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                          className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
                        >
                          <stat.icon className="w-5 h-5" style={{ color: brand.corSecundaria }} />
                          {!stat.hideValue && <span className="text-white text-sm font-bold">{stat.value}</span>}
                          <span className="text-white/40 text-xs">{stat.suffix}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {vd.showLocation && photoIndex % 3 === 2 && (
                    <motion.div
                      initial={{ x: -15, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2 justify-center"
                    >
                      <MapPin className="w-5 h-5" style={{ color: brand.corSecundaria }} />
                      <span className="text-white text-lg font-light">{property.bairro}</span>
                    </motion.div>
                  )}
                </div>

                {/* Brand watermark — logo only with shadow */}
                {vd.showLogo && brand.logoUrl && (
                <div className="absolute top-10 left-5" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}>
                  <img src={brand.logoUrl} alt="" className="w-8 h-8 object-contain" />
                </div>
                )}
              </>
            )}
          </motion.div>
          );
        })()}


      </AnimatePresence>

      {/* === VINHETA VIDEO (always mounted for preload, shown when active) === */}
      <div
        className={`absolute inset-0 z-30 flex items-center justify-center ${isVinheta ? '' : 'pointer-events-none opacity-0'}`}
        style={{ backgroundColor: isVinheta ? "#000" : "transparent" }}
      >
        {!vinhetaError ? (
          <video
            ref={vinhetaRef}
            playsInline
            preload="auto"
            onEnded={() => setCurrent(0)}
            onLoadedMetadata={(e) => {
              const dur = (e.currentTarget.duration || 5) * 1000;
              setVinhetaDuration(dur);
            }}
            onError={(e) => {
              const vid = e.currentTarget;
              if (vid.src.includes(".mp4")) {
                console.warn("MP4 failed, trying MOV...");
                vid.src = VINHETA_URL_MOV;
                vid.load();
              } else {
                console.error("Vinheta video failed to load");
                setVinhetaError(true);
              }
            }}
            className="w-full h-full object-contain"
            src={VINHETA_URL_MP4}
          />
        ) : isVinheta ? (
          <div className="text-center space-y-6">
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt={brand.nome}
                className="w-40 h-40 object-contain mx-auto"
              />
            )}
            <h2 className="text-white text-3xl font-headline uppercase tracking-wider">
              {brand.nome}
            </h2>
            <p className="text-white/50 text-sm">
              {brand.contato}
            </p>
          </div>
        ) : null}
      </div>

      {/* Scrubable video-style progress bar */}
      {vd.showProgressBar && !isVinheta && (
        <div
          ref={progressBarRef}
          className="absolute bottom-0 left-0 right-0 z-30 h-6 group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            const bar = progressBarRef.current;
            if (!bar) return;
            const rect = bar.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;
            const targetSlide = Math.floor(pct * totalSlides);
            setCurrent(Math.max(0, Math.min(targetSlide, totalSlides - 2)));
          }}
        >
          {/* Track background */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] group-hover:h-[5px] transition-all bg-white/20">
            {/* Filled portion */}
            <div
              className="h-full transition-none"
              style={{
                width: `${((current + slideProgress) / totalSlides) * 100}%`,
                backgroundColor: brand.corSecundaria,
              }}
            />
          </div>
        </div>
      )}

      {/* Close button — z-40 to stay above vinheta */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => { e.stopPropagation(); bgMusic.stop(); onClose(); }}
        className="absolute top-4 right-4 text-white hover:bg-white/10 z-40 rounded-full"
      >
        <X className="w-6 h-6" />
      </Button>
      </div>{/* end phone container */}
    </motion.div>
    </>
  );
};

export default VideoPresentation;

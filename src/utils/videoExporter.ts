import { Property, BrandConfig } from "@/types/property";
import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import { supabase } from "@/integrations/supabase/client";

const SLIDE_DURATION = 2800;
const INTRO_DURATION = 5500;
const CTA_DURATION = 7000;
const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;
const VINHETA_URL = "";

export type ExportFormat = "vertical" | "square" | "horizontal";

const FORMAT_DIMENSIONS: Record<ExportFormat, { w: number; h: number }> = {
  vertical: { w: 1080, h: 1920 },
  square: { w: 1080, h: 1080 },
  horizontal: { w: 1920, h: 1080 },
};

interface ExportOptions {
  property: Property;
  brand: BrandConfig;
  photos: string[];
  onProgress: (pct: number) => void;
  format: "mp4" | "gif";
  audioBlob?: Blob | null;
  exportFormat?: ExportFormat;
  autoDownload?: boolean; // default true
  previewMode?: boolean; // low-res fast render
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);

// Load image via edge function proxy to avoid CORS canvas taint
const loadImage = async (src: string): Promise<HTMLImageElement> => {
  if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/") || !src.startsWith("http")) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const proxyRes = await fetch(`${supabaseUrl}/functions/v1/image-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ url: src }),
  });

  if (!proxyRes.ok) {
    const errText = await proxyRes.text().catch(() => "");
    throw new Error(`Proxy HTTP ${proxyRes.status}: ${errText.substring(0, 100)}`);
  }

  const blob = await proxyRes.blob();
  if (blob.size < 100) throw new Error("Proxy returned empty blob");

  const objectUrl = URL.createObjectURL(blob);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const imgEl = new Image();
    imgEl.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(imgEl);
    };
    imgEl.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode proxied image"));
    };
    imgEl.src = objectUrl;
  });
  return img;
};

// Draw image with Ken Burns (zoom + pan)
const drawKenBurns = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  progress: number,
  variant: number
) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const patterns = [
    { scaleFrom: 1, scaleTo: 1.3, xFrom: 0, xTo: -0.05, yFrom: 0, yTo: -0.03 },
    { scaleFrom: 1.25, scaleTo: 1, xFrom: -0.04, xTo: 0.04, yFrom: 0.02, yTo: -0.02 },
    { scaleFrom: 1, scaleTo: 1.35, xFrom: 0, xTo: 0.03, yFrom: 0, yTo: 0.04 },
    { scaleFrom: 1.3, scaleTo: 1.05, xFrom: 0.05, xTo: -0.03, yFrom: -0.04, yTo: 0.02 },
    { scaleFrom: 1.05, scaleTo: 1.25, xFrom: -0.02, xTo: 0.04, yFrom: 0.01, yTo: -0.04 },
  ];

  const p = patterns[variant % patterns.length];
  const t = progress;
  const scale = p.scaleFrom + (p.scaleTo - p.scaleFrom) * t;
  const xOff = (p.xFrom + (p.xTo - p.xFrom) * t) * w;
  const yOff = (p.yFrom + (p.yTo - p.yFrom) * t) * h;

  const imgRatio = img.width / img.height;
  const canvasRatio = w / h;

  let drawW: number, drawH: number;
  if (imgRatio > canvasRatio) {
    drawH = h * scale;
    drawW = drawH * imgRatio;
  } else {
    drawW = w * scale;
    drawH = drawW / imgRatio;
  }

  const x = (w - drawW) / 2 + xOff;
  const y = (h - drawH) / 2 + yOff;

  ctx.drawImage(img, x, y, drawW, drawH);
};

const drawOverlay = (ctx: CanvasRenderingContext2D) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const grad = ctx.createLinearGradient(0, h * 0.5, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.85)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.25);
  topGrad.addColorStop(0, "rgba(0,0,0,0.4)");
  topGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, w, h * 0.25);
};

const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color: string,
  align: CanvasTextAlign = "left",
  font = "bold"
) => {
  ctx.save();
  ctx.font = `${font} ${fontSize}px sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = fontSize * 0.25;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = color;

  const W = ctx.canvas.width;
  const padding = W * 0.06; // 6% padding on each side
  const maxWidth = W - padding * 2;
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  const lineHeight = fontSize * 1.25;

  for (const word of words) {
    const testLine = line + (line ? " " : "") + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  ctx.restore();
};

const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

// === Render a single frame to canvas ===
// Mirrors the VideoPresentation.tsx React component as closely as possible
// Font scale F maps Tailwind px sizes (designed for ~400px container) to canvas pixels

// Draw a small icon indicator (colored circle with letter) since canvas can't render SVG icons
function drawIconDot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, letter: string) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.font = `bold ${radius * 1.2}px sans-serif`;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, x, y);
  ctx.restore();
}

// Draw clean geometric icons on canvas (replaces ugly emojis)
function drawStatIcon(ctx: CanvasRenderingContext2D, type: string, cx: number, cy: number, size: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const s = size * 0.45; // half-size

  if (type === "bed") {
    // Bed icon
    ctx.beginPath();
    ctx.moveTo(cx - s, cy + s * 0.4);
    ctx.lineTo(cx - s, cy - s * 0.3);
    ctx.lineTo(cx - s * 0.3, cy - s * 0.3);
    ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.7, cx, cy - s * 0.7);
    ctx.quadraticCurveTo(cx + s * 0.3, cy - s * 0.7, cx + s * 0.3, cy - s * 0.3);
    ctx.lineTo(cx + s, cy - s * 0.3);
    ctx.lineTo(cx + s, cy + s * 0.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.1, cy + s * 0.4);
    ctx.lineTo(cx + s * 1.1, cy + s * 0.4);
    ctx.stroke();
  } else if (type === "suite") {
    // Double bed icon (suíte) — wider bed with two pillows
    ctx.beginPath();
    ctx.moveTo(cx - s, cy + s * 0.4);
    ctx.lineTo(cx - s, cy - s * 0.3);
    ctx.lineTo(cx + s, cy - s * 0.3);
    ctx.lineTo(cx + s, cy + s * 0.4);
    ctx.stroke();
    // Two pillows
    ctx.beginPath();
    ctx.roundRect(cx - s * 0.85, cy - s * 0.65, s * 0.7, s * 0.3, size * 0.04);
    ctx.roundRect(cx + s * 0.15, cy - s * 0.65, s * 0.7, s * 0.3, size * 0.04);
    ctx.stroke();
    // Base line
    ctx.beginPath();
    ctx.moveTo(cx - s * 1.1, cy + s * 0.4);
    ctx.lineTo(cx + s * 1.1, cy + s * 0.4);
    ctx.stroke();
  } else if (type === "bath") {
    // Bathtub / shower icon — showerhead with water
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.6, cy - s * 0.8);
    ctx.lineTo(cx - s * 0.6, cy - s * 0.2);
    ctx.stroke();
    // Showerhead
    ctx.beginPath();
    ctx.arc(cx - s * 0.6, cy - s * 0.85, s * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    // Bathtub base
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.9, cy - s * 0.2);
    ctx.lineTo(cx + s * 0.9, cy - s * 0.2);
    ctx.lineTo(cx + s * 0.7, cy + s * 0.5);
    ctx.lineTo(cx - s * 0.7, cy + s * 0.5);
    ctx.closePath();
    ctx.stroke();
  } else if (type === "car") {
    // Car / garage icon — car silhouette with wheels
    // Car body
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.9, cy + s * 0.1);
    ctx.lineTo(cx - s * 0.7, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.7, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.9, cy + s * 0.1);
    ctx.closePath();
    ctx.stroke();
    // Roof
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.5, cy - s * 0.3);
    ctx.lineTo(cx - s * 0.3, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.5, cy - s * 0.3);
    ctx.stroke();
    // Wheels
    ctx.beginPath();
    ctx.arc(cx - s * 0.5, cy + s * 0.3, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + s * 0.5, cy + s * 0.3, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    // Ground line
    ctx.beginPath();
    ctx.moveTo(cx - s, cy + s * 0.1);
    ctx.lineTo(cx + s, cy + s * 0.1);
    ctx.stroke();
  } else if (type === "area") {
    // Maximize/area icon
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.7, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.7, cy - s * 0.7);
    ctx.lineTo(cx + s * 0.7, cy + s * 0.7);
    ctx.lineTo(cx - s * 0.7, cy + s * 0.7);
    ctx.closePath();
    ctx.stroke();
    // Diagonal arrows
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy + s * 0.3);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.3);
    ctx.stroke();
  } else if (type === "pin") {
    // Map pin icon
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.3, s * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy + s * 0.05);
    ctx.lineTo(cx, cy + s * 0.7);
    ctx.lineTo(cx + s * 0.3, cy + s * 0.05);
    ctx.stroke();
  } else if (type === "palm") {
    // Palm tree icon (lazer)
    // Trunk
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.8);
    ctx.quadraticCurveTo(cx - s * 0.1, cy, cx + s * 0.05, cy - s * 0.3);
    ctx.stroke();
    // Leaves
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.05, cy - s * 0.3);
    ctx.quadraticCurveTo(cx + s * 0.8, cy - s * 0.6, cx + s * 0.9, cy - s * 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.05, cy - s * 0.3);
    ctx.quadraticCurveTo(cx - s * 0.7, cy - s * 0.7, cx - s * 0.8, cy - s * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.05, cy - s * 0.3);
    ctx.quadraticCurveTo(cx + s * 0.3, cy - s * 0.9, cx + s * 0.5, cy - s * 0.7);
    ctx.stroke();
  } else if (type === "elevator") {
    // Elevator icon — up/down arrows
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.8);
    ctx.lineTo(cx - s * 0.4, cy - s * 0.3);
    ctx.moveTo(cx, cy - s * 0.8);
    ctx.lineTo(cx + s * 0.4, cy - s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.8);
    ctx.lineTo(cx - s * 0.4, cy + s * 0.3);
    ctx.moveTo(cx, cy + s * 0.8);
    ctx.lineTo(cx + s * 0.4, cy + s * 0.3);
    ctx.stroke();
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.8);
    ctx.lineTo(cx, cy + s * 0.8);
    ctx.stroke();
  } else {
    // Generic dot
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function getStatIconType(suffix: string): string {
  const s = suffix.toLowerCase();
  if (s.includes("suíte") || s.includes("suite")) return "suite";
  if (s.includes("quarto") || s.includes("qto")) return "bed";
  if (s.includes("vaga")) return "car";
  if (s.includes("banheiro") || s.includes("ban")) return "bath";
  if (s.includes("m²")) return "area";
  if (s.includes("lazer")) return "palm";
  if (s.includes("elevador")) return "elevator";
  return "dot";
}

function renderFrame(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  images: HTMLImageElement[],
  property: Property,
  brand: BrandConfig,
  logoImg: HTMLImageElement | null,
  W: number,
  H: number,
  aiPhrases?: string[]
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // Aspect ratio detection
  const isHorizontal = W > H * 1.2;
  const isSquare = !isHorizontal && Math.abs(W - H) < H * 0.2;

  // F = font scale — use the SHORTER dimension so text stays proportional across formats
  // For horizontal (YouTube), scale down further so elements aren't oversized on wide screens
  const baseF = Math.min(W, H) / 400;
  const F = isHorizontal ? baseF * 0.7 : baseF;
  const S = Math.min(W, H) / 1080;

  // Aspect-aware layout positions (vertical=9:16, square=1:1, horizontal=16:9)
  const L = {
    // Intro positions — horizontal: vertically centered content block
    pillY:    isHorizontal ? H * 0.24 : isSquare ? H * 0.22 : H * 0.30,
    titleY:   isHorizontal ? H * 0.37 : isSquare ? H * 0.32 : H * 0.38,
    priceY:   isHorizontal ? H * 0.50 : isSquare ? H * 0.44 : H * 0.48,
    locY:     isHorizontal ? H * 0.62 : isSquare ? H * 0.54 : H * 0.56,
    statsY:   isHorizontal ? H * 0.76 : isSquare ? H * 0.62 : H * 0.63,
    // CTA positions — centered block
    ctaLogoY: isHorizontal ? H * 0.12 : isSquare ? H * 0.18 : H * 0.24,
    ctaPriceY:isHorizontal ? H * 0.34 : isSquare ? H * 0.34 : H * 0.38,
    ctaLocY:  isHorizontal ? H * 0.46 : isSquare ? H * 0.44 : H * 0.46,
    ctaVisitY:isHorizontal ? H * 0.56 : isSquare ? H * 0.52 : H * 0.53,
    ctaPhoneY:isHorizontal ? H * 0.64 : isSquare ? H * 0.58 : H * 0.58,
    ctaIdY:   isHorizontal ? H * 0.76 : isSquare ? H * 0.70 : H * 0.68,
    ctaCondoY:isHorizontal ? H * 0.84 : isSquare ? H * 0.78 : H * 0.74,
    // Slide positions
    phraseY:  isHorizontal ? H * 0.45 : isSquare ? H * 0.40 : H * 0.45,
    bottomPad: isHorizontal ? 35 * baseF : 80 * baseF,
    // Logo scale — smaller for horizontal
    logoScale: isHorizontal ? 0.55 : 1.0,
  };

  const totalPhotoDuration = images.length * SLIDE_DURATION;
  const lastPhotoStart = INTRO_DURATION + (images.length - 1) * SLIDE_DURATION;
  const isLastPhoto = images.length > 1 && timeMs >= lastPhotoStart && timeMs < lastPhotoStart + CTA_DURATION;

  // Build stats array (matches React component)
  const desc = (property.descricao || "").toLowerCase();
  const hasElevador = desc.includes("elevador");
  const tipoLower = (property.tipo || "").toLowerCase();
  const isApartmentType = tipoLower.includes("apartamento") || tipoLower.includes("cobertura") || tipoLower.includes("flat") || tipoLower.includes("kitnet") || tipoLower.includes("loft") || tipoLower.includes("studio");
  const hasLazer = isApartmentType && (desc.includes("lazer") || desc.includes("piscina") || desc.includes("academia"));
  const statsArr: { value: string; suffix: string; hideValue?: boolean }[] = [];
  if (property.quartos > 0) statsArr.push({ value: String(property.quartos), suffix: property.quartos === 1 ? "quarto" : "quartos" });
  if (property.suites && property.suites > 0) statsArr.push({ value: String(property.suites), suffix: property.suites === 1 ? "suíte" : "suítes" });
  if (property.vagas > 0) statsArr.push({ value: String(property.vagas), suffix: property.vagas === 1 ? "vaga" : "vagas" });
  if (property.banheiros > 0) statsArr.push({ value: String(property.banheiros), suffix: property.banheiros === 1 ? "banheiro" : "banheiros" });
  if (property.area > 0) statsArr.push({ value: String(property.area), suffix: "m²" });
  if (hasElevador) statsArr.push({ value: "", suffix: "Elevador", hideValue: true });
  if (hasLazer) statsArr.push({ value: "", suffix: "Lazer", hideValue: true });

  if (timeMs < INTRO_DURATION) {
    // === INTRO SLIDE (animated) ===
    const t = timeMs / INTRO_DURATION;

    // Ken Burns: scale from 1.4 → 1.05
    const scale = 1.4 - 0.35 * ease(t);
    const imgRatio = images[0].width / images[0].height;
    const canvasRatio = W / H;
    let drawW: number, drawH: number;
    if (imgRatio > canvasRatio) { drawH = H * scale; drawW = drawH * imgRatio; }
    else { drawW = W * scale; drawH = drawW / imgRatio; }
    ctx.drawImage(images[0], (W - drawW) / 2, (H - drawH) / 2, drawW, drawH);

    // Dark overlay
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, W, H);

    // White flash at start
    if (t < 0.07) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - t / 0.07) * 0.5})`;
      ctx.fillRect(0, 0, W, H);
    }

    // Property type pill
    const typeT = Math.min(t / 0.15, 1);
    ctx.globalAlpha = ease(typeT);
    const typeText = property.tipo.toUpperCase();
    ctx.font = `400 ${12 * F}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = `${0.4 * 12 * F}px`;
    const typeMetrics = ctx.measureText(typeText);
    const pillW = typeMetrics.width + 32 * F;
    const pillH = 24 * F;
    const pillX = (W - pillW) / 2;
    const pillY = L.pillY;
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 2 * S;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 12 * F);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText(typeText, W / 2, pillY + pillH / 2);
    ctx.letterSpacing = "0px";

    // Title with typewriter
    if (t > 0.05) {
      const titleT = Math.min((t - 0.05) / 0.25, 1);
      ctx.globalAlpha = ease(Math.min(titleT * 2, 1));
      const titulo = property.titulo;
      const charsToShow = Math.floor(titulo.length * ease(titleT));
      const displayTitle = titulo.substring(0, charsToShow) + (titleT < 1 ? "|" : "");
      drawText(ctx, displayTitle, W / 2, L.titleY, 18 * F, "#fff", "center", "400");
    }

    // Price counter
    if (t > 0.1 && property.preco > 0) {
      const priceT = Math.min((t - 0.1) / 0.25, 1);
      const eased = 1 - Math.pow(1 - ease(priceT), 3);
      const displayPrice = Math.floor(property.preco * eased);
      ctx.globalAlpha = ease(priceT);
      ctx.save();
      ctx.shadowColor = `${brand.corSecundaria}60`;
      ctx.shadowBlur = 60 * S;
      drawText(ctx, formatPrice(displayPrice), W / 2, L.priceY, 30 * F, brand.corSecundaria, "center", "bold");
      ctx.restore();
    }

    // Location
    if (t > 0.25) {
      const locT = Math.min((t - 0.25) / 0.2, 1);
      ctx.globalAlpha = ease(locT);
      const locText = [property.bairro, property.cidade].filter(Boolean).join(", ");
      const pinSize = 14 * F;
      ctx.font = `normal ${14 * F}px sans-serif`;
      ctx.save();
      drawStatIcon(ctx, "pin", W / 2 - ctx.measureText(locText).width * 0.5 - pinSize, L.locY + pinSize * 0.5, pinSize, "rgba(255,255,255,0.5)");
      ctx.restore();
      drawText(ctx, locText, W / 2, L.locY, 14 * F, "rgba(255,255,255,0.5)", "center", "normal");
    }

    // Stats badges animated
    if (t > 0.4) {
      const iconSize = 18 * F;
      const valueFontSize = 14 * F;
      const suffixFontSize = 11 * F;
      const badgePadX = 10 * F;
      const badgePadY = 6 * F;
      const badgeGap = 8 * F;
      const innerGap = 6 * F;
      const rowGap = 8 * F;

      const badgeInfos = statsArr.map(stat => {
        const iconW = iconSize;
        let textW = 0;
        if (!stat.hideValue) {
          ctx.font = `bold ${valueFontSize}px sans-serif`;
          textW += ctx.measureText(stat.value).width + innerGap;
        }
        ctx.font = `400 ${suffixFontSize}px sans-serif`;
        textW += ctx.measureText(stat.suffix).width;
        return { totalW: badgePadX * 2 + iconW + innerGap + textW };
      });

      const maxRowW = W * 0.88;
      const rows: number[][] = [[]];
      let currentRowW = 0;
      badgeInfos.forEach((info, i) => {
        const addW = info.totalW + (rows[rows.length - 1].length > 0 ? badgeGap : 0);
        if (currentRowW + addW > maxRowW && rows[rows.length - 1].length > 0) {
          rows.push([]);
          currentRowW = 0;
        }
        rows[rows.length - 1].push(i);
        currentRowW += info.totalW + (rows[rows.length - 1].length > 1 ? badgeGap : 0);
      });

      const badgeH = iconSize + badgePadY * 2;
      const totalRowsH = rows.length * badgeH + (rows.length - 1) * rowGap;
      let rowStartY = L.statsY - totalRowsH / 2 + badgeH / 2;

      rows.forEach(row => {
        const rowTotalW = row.reduce((a, idx) => a + badgeInfos[idx].totalW, 0) + (row.length - 1) * badgeGap;
        let bx = (W - rowTotalW) / 2;
        const badgeY = rowStartY - badgeH / 2;

        row.forEach(idx => {
          const stat = statsArr[idx];
          const itemT = Math.min((t - 0.4 - idx * 0.03) / 0.15, 1);
          if (itemT <= 0) { bx += badgeInfos[idx].totalW + badgeGap; return; }
          ctx.globalAlpha = ease(itemT);
          const bw = badgeInfos[idx].totalW;

          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.beginPath();
          ctx.roundRect(bx, badgeY, bw, badgeH, badgeH / 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = S;
          ctx.beginPath();
          ctx.roundRect(bx, badgeY, bw, badgeH, badgeH / 2);
          ctx.stroke();

          let cx = bx + badgePadX + iconSize / 2;
          drawStatIcon(ctx, getStatIconType(stat.suffix), cx, badgeY + badgeH / 2, iconSize, brand.corSecundaria);
          cx = bx + badgePadX + iconSize + innerGap;

          if (!stat.hideValue) {
            ctx.font = `bold ${valueFontSize}px sans-serif`;
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(stat.value, cx, badgeY + badgeH / 2);
            cx += ctx.measureText(stat.value).width + innerGap * 0.5;
          }

          ctx.font = `400 ${suffixFontSize}px sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(stat.suffix, cx, badgeY + badgeH / 2);

          bx += bw + badgeGap;
        });

        rowStartY += badgeH + rowGap;
      });
    }

    // Logo watermark
    if (logoImg) {
      ctx.globalAlpha = ease(Math.min(t / 0.3, 1)) * 0.5;
      const logoH = 32 * F * L.logoScale;
      const logoRatio = logoImg.width / logoImg.height;
      const logoW = logoH * logoRatio;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 6 * F;
      ctx.shadowOffsetY = 2 * F;
      ctx.drawImage(logoImg, 24 * F, 24 * F, logoW, logoH);
      ctx.restore();
    }
    ctx.globalAlpha = 1;

  } else if (isLastPhoto) {
    // === LAST PHOTO = CTA SLIDE ===
    const ctaStart = lastPhotoStart;
    const t = (timeMs - ctaStart) / CTA_DURATION;
    const img = images[images.length - 1];

    drawKenBurns(ctx, img, t * 0.5, images.length - 1);

    // bg-black/50 + gradient
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);

    // Logo (delicate, ~40px in preview scale)
    if (logoImg) {
      const logoT = Math.min(t / 0.2, 1);
      ctx.globalAlpha = ease(logoT) * 0.7;
      const maxLogoH = 40 * F * L.logoScale;
      const logoRatio = logoImg.width / logoImg.height;
      const logoH = maxLogoH;
      const logoW = logoH * logoRatio;
      ctx.drawImage(logoImg, (W - logoW) / 2, L.ctaLogoY, logoW, logoH);
    }

    // Price (text-3xl = 30px) — fast entrance so signature stays visible longer before vinheta
    if (property.preco > 0 && t > 0.04) {
      const priceT = Math.min((t - 0.04) / 0.12, 1);
      const eased2 = 1 - Math.pow(1 - ease(priceT), 3);
      const displayPrice = Math.floor(property.preco * eased2);
      ctx.globalAlpha = ease(priceT);
      ctx.save();
      ctx.shadowColor = `${brand.corSecundaria}40`;
      ctx.shadowBlur = 40 * S;
      drawText(ctx, formatPrice(displayPrice), W / 2, L.ctaPriceY, 30 * F, brand.corSecundaria, "center", "bold");
      ctx.restore();
    }

    // Location
    if (t > 0.08) {
      const locT = Math.min((t - 0.08) / 0.1, 1);
      ctx.globalAlpha = ease(locT);
      const loc = [property.bairro, property.cidade].filter(Boolean).join(" · ");
      drawText(ctx, loc, W / 2, L.ctaLocY, 14 * F, "rgba(255,255,255,0.7)", "center", "normal");
    }

    // "Agende sua visita"
    if (t > 0.12) {
      const ctaT = Math.min((t - 0.12) / 0.1, 1);
      ctx.globalAlpha = ease(ctaT);
      drawText(ctx, "Agende sua visita", W / 2, L.ctaVisitY, 16 * F, "#fff", "center", "bold");
    }

    // Phone — prefer brand.contato (already formatted)
    if (t > 0.16) {
      const btnT = Math.min((t - 0.16) / 0.1, 1);
      ctx.globalAlpha = ease(btnT);
      const phone = brand.contato || (brand.whatsapp || "").replace(/^55/, "").replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
      drawText(ctx, phone, W / 2, L.ctaPhoneY, 18 * F, "rgba(255,255,255,0.8)", "center", "bold");
    }

    // Property ID for broker reference
    if (t > 0.20) {
      const idT = Math.min((t - 0.20) / 0.12, 1);
      ctx.globalAlpha = ease(idT) * 0.5;
      drawText(ctx, "No site da imobiliária", W / 2, L.ctaIdY, 11 * F, "rgba(255,255,255,0.6)", "center", "normal");
      drawText(ctx, `pesquise o ID ${property.id.replace(/^[a-zA-Z]-/, "")}`, W / 2, L.ctaIdY + 16 * F, 11 * F, "rgba(255,255,255,0.8)", "center", "bold");
    }

    // Condominium name
    if (property.condominio && t > 0.18) {
      const condoT = Math.min((t - 0.18) / 0.1, 1);
      ctx.globalAlpha = ease(condoT) * 0.6;
      drawText(ctx, property.condominio, W / 2, L.ctaCondoY, 12 * F, "rgba(255,255,255,0.5)", "center", "normal");
    }

    ctx.globalAlpha = 1;

  } else if (timeMs < INTRO_DURATION + totalPhotoDuration) {
    // === REGULAR PHOTO SLIDES ===
    const slideTime = timeMs - INTRO_DURATION;
    const slideIdx = Math.floor(slideTime / SLIDE_DURATION);
    const slideProgress = (slideTime % SLIDE_DURATION) / SLIDE_DURATION;
    const img = images[Math.min(slideIdx, images.length - 1)];

    // Ken Burns
    drawKenBurns(ctx, img, slideProgress, slideIdx);

    // Gradient overlays (matching React: from-black/70 via-transparent to-black/20)
    const botGrad = ctx.createLinearGradient(0, H * 0.3, 0, H);
    botGrad.addColorStop(0, "rgba(0,0,0,0)");
    botGrad.addColorStop(1, "rgba(0,0,0,0.7)");
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 0, W, H);

    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.2);
    topGrad.addColorStop(0, "rgba(0,0,0,0.2)");
    topGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, H * 0.2);

    // Flash effect
    if (slideProgress < 0.03) {
      ctx.fillStyle = `rgba(255,255,255,${(1 - slideProgress / 0.03) * 0.3})`;
      ctx.fillRect(0, 0, W, H);
    }

    const infoFade = Math.min(slideProgress / 0.1, 1);

    // Brand watermark — logo only with drop shadow
    if (logoImg) {
      ctx.globalAlpha = 0.5;
      const wmLogoH = 32 * F * L.logoScale;
      const wmLogoRatio = logoImg.width / logoImg.height;
      const wmLogoW = wmLogoH * wmLogoRatio;
      const wmX = 20 * F;
      const wmY = 40 * F;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 6 * F;
      ctx.shadowOffsetY = 2 * F;
      ctx.drawImage(logoImg, wmX, wmY, wmLogoW, wmLogoH);
      ctx.restore();
    }

    ctx.globalAlpha = ease(infoFade);

    // Bottom safe zone (pb-20 = 80px in preview container)
    const bottomY = H - L.bottomPad;

    // AI phrase centered on screen with typewriter effect
    if (aiPhrases && aiPhrases[slideIdx]) {
      const phrase = aiPhrases[slideIdx];
      const phraseT = Math.min((slideProgress - 0.08) / 0.12, 1);
      // Typewriter: reveal chars over 60% of slide duration after initial fade
      const typewriterStart = 0.1;
      const typewriterEnd = 0.7;
      const typeProgress = Math.min(Math.max((slideProgress - typewriterStart) / (typewriterEnd - typewriterStart), 0), 1);
      const charsToShow = Math.floor(phrase.length * typeProgress);
      const displayPhrase = phrase.substring(0, charsToShow) + (typeProgress < 1 ? "|" : "");
      if (phraseT > 0 && charsToShow > 0) {
        ctx.globalAlpha = ease(phraseT);
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 6 * F;
        ctx.shadowOffsetY = 1 * F;
        drawText(ctx, displayPhrase, W / 2, L.phraseY, 16 * F, "#fff", "center", "500");
        ctx.restore();
      }
    }

    ctx.globalAlpha = ease(infoFade);

    // Price on first slide (text-2xl = 24px)
    if (slideIdx === 0 && property.preco > 0) {
      ctx.save();
      ctx.shadowColor = `${brand.corSecundaria}40`;
      ctx.shadowBlur = 30 * S;
      const priceT = Math.min(slideProgress / 0.15, 1);
      ctx.globalAlpha = ease(priceT);
      drawText(ctx, formatPrice(property.preco), W / 2, bottomY - 30 * F, 24 * F, brand.corSecundaria, "center", "bold");
      ctx.restore();
    }

    // Stats on every 3rd slide — same multi-row layout as intro for readability
    if (slideIdx % 3 === 1) {
      const iconSize = 22 * F;
      const valueFontSize = 16 * F;
      const suffixFontSize = 13 * F;
      const badgePadX = 12 * F;
      const badgePadY = 8 * F;
      const badgeGap = 8 * F;
      const innerGap = 6 * F;
      const rowGap = 8 * F;

      const badgeInfos = statsArr.map(stat => {
        const iconW = iconSize;
        let textW = 0;
        if (!stat.hideValue) {
          ctx.font = `bold ${valueFontSize}px sans-serif`;
          textW += ctx.measureText(stat.value).width + innerGap;
        }
        ctx.font = `400 ${suffixFontSize}px sans-serif`;
        textW += ctx.measureText(stat.suffix).width;
        return { totalW: badgePadX * 2 + iconW + innerGap + textW, iconW };
      });

      // Split into rows that fit within 88% of canvas width
      const maxRowW = W * 0.88;
      const rows: number[][] = [[]];
      let currentRowW = 0;
      badgeInfos.forEach((info, i) => {
        const addW = info.totalW + (rows[rows.length - 1].length > 0 ? badgeGap : 0);
        if (currentRowW + addW > maxRowW && rows[rows.length - 1].length > 0) {
          rows.push([]);
          currentRowW = 0;
        }
        rows[rows.length - 1].push(i);
        currentRowW += info.totalW + (rows[rows.length - 1].length > 1 ? badgeGap : 0);
      });

      const badgeH = iconSize + badgePadY * 2;
      const totalRowsH = rows.length * badgeH + (rows.length - 1) * rowGap;
      // Position rows above bottomY
      let rowStartY = bottomY - totalRowsH - 12 * F;

      rows.forEach(row => {
        const rowTotalW = row.reduce((a, idx) => a + badgeInfos[idx].totalW, 0) + (row.length - 1) * badgeGap;
        let bx = (W - rowTotalW) / 2;
        const badgeY2 = rowStartY;

        row.forEach(idx => {
          const stat = statsArr[idx];
          const sT = Math.min((slideProgress - 0.1 - idx * 0.03) / 0.1, 1);
          if (sT <= 0) { bx += badgeInfos[idx].totalW + badgeGap; return; }
          ctx.globalAlpha = ease(sT);
          const bw = badgeInfos[idx].totalW;

          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.beginPath();
          ctx.roundRect(bx, badgeY2, bw, badgeH, badgeH / 2);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = S;
          ctx.beginPath();
          ctx.roundRect(bx, badgeY2, bw, badgeH, badgeH / 2);
          ctx.stroke();

          let cx = bx + badgePadX + iconSize / 2;
          drawStatIcon(ctx, getStatIconType(stat.suffix), cx, badgeY2 + badgeH / 2, iconSize, brand.corSecundaria);
          cx = bx + badgePadX + iconSize + innerGap;

          if (!stat.hideValue) {
            ctx.font = `bold ${valueFontSize}px sans-serif`;
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(stat.value, cx, badgeY2 + badgeH / 2);
            cx += ctx.measureText(stat.value).width + innerGap * 0.5;
          }

          ctx.font = `400 ${suffixFontSize}px sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(stat.suffix, cx, badgeY2 + badgeH / 2);

          bx += bw + badgeGap;
        });

        rowStartY += badgeH + rowGap;
      });
    }

    // Location on every 3rd slide
    if (slideIdx % 3 === 2 && property.bairro) {
      const locT = Math.min((slideProgress - 0.1) / 0.1, 1);
      if (locT > 0) {
        ctx.globalAlpha = ease(locT);
        const locText = property.bairro + (property.cidade ? ` · ${property.cidade}` : "");
        drawText(ctx, locText, W / 2, bottomY - 20 * F, 18 * F, "#fff", "center", "300");
      }
    }

    // Slide counter
    ctx.globalAlpha = 0.3;
    drawText(
      ctx,
      `${String(slideIdx + 1).padStart(2, "0")}/${String(images.length).padStart(2, "0")}`,
      W - 20 * F, bottomY, 12 * F, "rgba(255,255,255,0.3)", "right", "normal"
    );

    ctx.globalAlpha = 1;
  }
}

// === Load vinheta video for frame-by-frame rendering ===

async function loadVinhetaVideoOnce(timeoutMs: number): Promise<HTMLVideoElement> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = VINHETA_URL + "?t=" + Date.now(); // cache-bust

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = () => reject(new Error("Vinheta failed to load"));
    setTimeout(() => reject(new Error("Vinheta load timeout")), timeoutMs);
  });

  return video;
}

async function loadVinhetaVideo(): Promise<HTMLVideoElement | null> {
  // Try up to 3 times with increasing timeouts
  const timeouts = [15000, 25000, 35000];
  for (let i = 0; i < timeouts.length; i++) {
    try {
      const video = await loadVinhetaVideoOnce(timeouts[i]);
      console.log("[VideoExporter] Vinheta loaded on attempt", i + 1);
      return video;
    } catch (err) {
      console.warn(`[VideoExporter] Vinheta attempt ${i + 1} failed:`, err);
      if (i === timeouts.length - 1) {
        console.error("[VideoExporter] All vinheta load attempts failed");
        return null;
      }
    }
  }
  return null;
}

// Draw a video frame onto canvas, fitting to dimensions
function drawVinhetaFrame(ctx: CanvasRenderingContext2D, source: HTMLVideoElement | ImageBitmap, W: number, H: number) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  
  const srcW = source instanceof HTMLVideoElement ? source.videoWidth : source.width;
  const srcH = source instanceof HTMLVideoElement ? source.videoHeight : source.height;
  const vRatio = srcW / srcH;
  const cRatio = W / H;
  let dw: number, dh: number;
  if (vRatio > cRatio) {
    dw = W;
    dh = W / vRatio;
  } else {
    dh = H;
    dw = H * vRatio;
  }
  ctx.drawImage(source, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

// Fetch vinheta as audio blob for encoding
async function fetchVinhetaAudio(): Promise<Blob | null> {
  try {
    const res = await fetch(VINHETA_URL);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

// Seek video to a specific time and wait for the frame to be ready
async function seekVideoToTime(video: HTMLVideoElement, time: number): Promise<void> {
  const target = Math.min(time, video.duration);
  if (Math.abs(video.currentTime - target) < 0.01) return;
  return new Promise<void>((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = target;
    // Fallback timeout in case seeked never fires
    setTimeout(resolve, 300);
  });
}

// === Audio encoding helpers (for WebCodecs path) ===

async function decodeAudioBlob(audioBlob: Blob): Promise<AudioBuffer> {
  const arrayBuf = await audioBlob.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 44100,
  });
  const decoded = await audioCtx.decodeAudioData(arrayBuf);
  await audioCtx.close();
  return decoded;
}

async function encodeAudioForMuxer(
  audioBuffer: AudioBuffer,
  durationSec: number,
  muxer: Muxer<ArrayBufferTarget>
): Promise<void> {
  if (typeof AudioEncoder === "undefined") return;

  const sampleRate = audioBuffer.sampleRate;
  const numberOfChannels = Math.min(audioBuffer.numberOfChannels, 2);
  const totalSamples = Math.min(
    Math.ceil(durationSec * sampleRate),
    audioBuffer.length
  );

  let codec = "mp4a.40.2";
  try {
    const support = await AudioEncoder.isConfigSupported({ codec, sampleRate, numberOfChannels, bitrate: 128000 });
    if (!support.supported) throw new Error("AAC not supported");
  } catch {
    codec = "opus";
    try {
      const support = await AudioEncoder.isConfigSupported({ codec, sampleRate, numberOfChannels, bitrate: 128000 });
      if (!support.supported) return;
    } catch { return; }
  }

  return new Promise<void>((resolve, reject) => {
    const encoder = new AudioEncoder({
      output: (chunk, meta) => { muxer.addAudioChunk(chunk, meta); },
      error: (e) => reject(e),
    });

    encoder.configure({ codec, sampleRate, numberOfChannels, bitrate: 128000 });

    const chunkSize = 1024;
    const channelData: Float32Array[] = [];
    for (let ch = 0; ch < numberOfChannels; ch++) {
      channelData.push(audioBuffer.getChannelData(ch));
    }

    for (let offset = 0; offset < totalSamples; offset += chunkSize) {
      const frameCount = Math.min(chunkSize, totalSamples - offset);
      const audioData = new AudioData({
        format: "f32-planar",
        sampleRate,
        numberOfFrames: frameCount,
        numberOfChannels,
        timestamp: Math.round((offset / sampleRate) * 1_000_000),
        data: createPlanarBuffer(channelData, offset, frameCount, numberOfChannels).buffer as ArrayBuffer,
      });
      encoder.encode(audioData);
      audioData.close();
    }

    encoder.flush().then(() => { encoder.close(); resolve(); }).catch(reject);
  });
}

function createPlanarBuffer(
  channelData: Float32Array[],
  offset: number,
  frameCount: number,
  numberOfChannels: number
): Float32Array {
  const buffer = new Float32Array(frameCount * numberOfChannels);
  for (let ch = 0; ch < numberOfChannels; ch++) {
    const chData = channelData[ch];
    for (let i = 0; i < frameCount; i++) {
      buffer[ch * frameCount + i] = chData[offset + i] || 0;
    }
  }
  return buffer;
}

// === Download/share helper ===

async function downloadOrShare(blob: Blob, filename: string) {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // On iOS, <a download> doesn't work with blob URLs — must use share sheet
  // User should tap "Save Video" in the share sheet to save to Camera Roll
  if (isIOS && navigator.share && navigator.canShare) {
    try {
      const mimeType = blob.type || "video/mp4";
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        // Show a brief hint before share sheet opens
        await navigator.share({ 
          files: [file], 
          title: "Salvar Vídeo",
        });
        return;
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.warn("[VideoExporter] Share failed, trying link download:", err);
    }
  }

  // Desktop / Android — normal download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// === Detect if we should use MediaRecorder (iOS/Safari) or WebCodecs ===

function shouldUseMediaRecorder(): boolean {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  // Use MediaRecorder on iOS or Safari — WebCodecs is unreliable there
  if (isIOS || isSafari) return true;
  // Also use it if VideoEncoder is not available
  if (typeof VideoEncoder === "undefined") return true;
  return false;
}

// === MediaRecorder-based export (iOS/Safari compatible) ===
// Uses captureStream(FPS) with setInterval for consistent real-time rendering

async function exportWithMediaRecorder(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  property: Property,
  brand: BrandConfig,
  logoImg: HTMLImageElement | null,
  onProgress: (pct: number) => void,
  audioBlob: Blob | null,
  vinhetaVideo: HTMLVideoElement | null,
  aiPhrases?: string[],
): Promise<{ blob: Blob; ext: string }> {
  const W = canvas.width;
  const H = canvas.height;
  const mainDuration = INTRO_DURATION + (images.length - 1) * SLIDE_DURATION + CTA_DURATION;
  const vinhetaDurationMs = vinhetaVideo ? vinhetaVideo.duration * 1000 : 0;
  const totalDuration = mainDuration + vinhetaDurationMs;

  // On iOS Safari, captureStream(0) is more reliable — frames are captured on-demand
  // We manually request frames by drawing to the canvas
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const stream = canvas.captureStream(isIOS ? 0 : FPS);

  // Add audio if available
  let audioCtx: AudioContext | null = null;
  let audioSource: AudioBufferSourceNode | null = null;
  if (audioBlob && audioBlob.size > 0) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // iOS requires user gesture to resume AudioContext
      if (audioCtx.state === "suspended") {
        await audioCtx.resume().catch(() => {});
      }
      const arrayBuf = await audioBlob.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuf);
      const dest = audioCtx.createMediaStreamDestination();
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = decoded;
      audioSource.connect(dest);
      dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
      audioSource.start(0);
    } catch (err) {
      console.warn("[VideoExporter] Could not add audio:", err);
    }
  }

  // Find supported MIME — on iOS prefer simpler mime strings
  const mimeTypes = isIOS ? [
    "video/mp4",
    "video/mp4;codecs=avc1",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  ] : [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=h264",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  let mimeType = "";
  for (const mt of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mt)) { mimeType = mt; break; }
  }
  if (!mimeType) throw new Error("Nenhum formato de vídeo suportado neste dispositivo.");

  const isActuallyMp4 = mimeType.startsWith("video/mp4");
  console.log("[VideoExporter] MediaRecorder using:", mimeType, "iOS:", isIOS);

  const chunks: Blob[] = [];
  // On iOS use lower bitrate to avoid encoder stalls
  const bitrate = isIOS ? 2_000_000 : 4_000_000;
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recorderDone = new Promise<{ blob: Blob; ext: string }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.warn("[VideoExporter] onstop timeout — forcing blob");
      try { recorder.stop(); } catch {}
      setTimeout(() => {
        const finalMime = isActuallyMp4 ? "video/mp4" : "video/webm";
        if (chunks.length > 0) resolve({ blob: new Blob(chunks, { type: finalMime }), ext: isActuallyMp4 ? "mp4" : "webm" });
        else reject(new Error("MediaRecorder não gerou dados. Tente novamente ou use outro navegador."));
      }, 500);
    }, totalDuration + 15000);

    recorder.onstop = () => {
      clearTimeout(timeout);
      // Give a small delay for final ondataavailable to fire
      setTimeout(() => {
        const finalMime = isActuallyMp4 ? "video/mp4" : "video/webm";
        if (chunks.length > 0) {
          resolve({ blob: new Blob(chunks, { type: finalMime }), ext: isActuallyMp4 ? "mp4" : "webm" });
        } else {
          reject(new Error("MediaRecorder não gerou dados. Tente novamente."));
        }
      }, 300);
    };
    recorder.onerror = (e) => {
      clearTimeout(timeout);
      reject(new Error("MediaRecorder error"));
    };
  });

  // Collect data frequently on iOS (every 500ms) so chunks accumulate
  recorder.start(isIOS ? 500 : 1000);

  // Get video track for manual frame requests (needed for captureStream(0) on iOS)
  const videoTrack = stream.getVideoTracks()[0] as any;
  const needsRequestFrame = isIOS && typeof videoTrack?.requestFrame === "function";

  // Use setInterval — requestAnimationFrame pauses when tab loses focus on iOS
  await new Promise<void>((resolve) => {
    const startTime = performance.now();
    const mobileFPS = isIOS ? 10 : FPS; // Lower FPS on iOS to reduce CPU pressure
    const intervalMs = 1000 / mobileFPS;

    // Render first frame immediately
    renderFrame(ctx, 0, images, property, brand, logoImg, W, H, aiPhrases);
    if (needsRequestFrame) videoTrack.requestFrame();

    const interval = setInterval(() => {
      try {
        const elapsed = performance.now() - startTime;

        if (elapsed >= totalDuration) {
          clearInterval(interval);
          renderFrame(ctx, mainDuration - 1, images, property, brand, logoImg, W, H, aiPhrases);
          if (needsRequestFrame) videoTrack.requestFrame();
          resolve();
          return;
        }

        if (elapsed < mainDuration) {
          renderFrame(ctx, elapsed, images, property, brand, logoImg, W, H, aiPhrases);
          if (vinhetaVideo && elapsed > mainDuration - 500 && vinhetaVideo.paused) {
            vinhetaVideo.muted = false;
            vinhetaVideo.currentTime = 0;
            vinhetaVideo.play().catch(() => {});
            if (audioSource) { try { audioSource.stop(); } catch {} }
          }
        } else if (vinhetaVideo) {
          drawVinhetaFrame(ctx, vinhetaVideo, W, H);
        }

        // Signal new frame to MediaRecorder on iOS
        if (needsRequestFrame) videoTrack.requestFrame();

        const pct = 15 + Math.round((elapsed / totalDuration) * 75);
        try { onProgress(pct); } catch {};
      } catch (err) {
        console.error("[VideoExporter] Frame error:", err);
      }
    }, intervalMs);
  });

  onProgress(91);

  // Give recorder time to capture final frames — longer on iOS
  await new Promise(r => setTimeout(r, isIOS ? 2000 : 1000));

  // Request any remaining data
  try { recorder.requestData(); } catch {}
  await new Promise(r => setTimeout(r, isIOS ? 500 : 300));

  recorder.stop();
  if (audioSource) { try { audioSource.stop(); } catch {} }
  if (audioCtx) { try { audioCtx.close(); } catch {} }

  onProgress(92);

  const result = await recorderDone;
  if (result.blob.size < 100) throw new Error("O vídeo gerado está vazio.");

  return result;
}

// === WebCodecs-based export (Chrome/desktop) ===

async function exportWithWebCodecs(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  property: Property,
  brand: BrandConfig,
  logoImg: HTMLImageElement | null,
  onProgress: (pct: number) => void,
  audioBlob: Blob | null,
  vinhetaVideo: HTMLVideoElement | null,
  aiPhrases?: string[],
): Promise<Blob> {
  const mainDuration = INTRO_DURATION + (images.length - 1) * SLIDE_DURATION + CTA_DURATION;
  const vinhetaDurationMs = vinhetaVideo ? vinhetaVideo.duration * 1000 : 0;
  const totalDuration = mainDuration + vinhetaDurationMs;
  const totalFrames = Math.ceil((totalDuration / 1000) * FPS);
  const durationSec = totalDuration / 1000;

  let W = canvas.width;
  let H = canvas.height;

  // Find supported codec
  const codecCandidates = ["avc1.42001f", "avc1.42e01f", "avc1.4d001f", "avc1.64001f"];
  // Fallback resolution must respect the chosen aspect ratio
  const fallbackW = W > H ? 1280 : W === H ? 720 : 720;
  const fallbackH = W > H ? 720 : W === H ? 720 : 1280;
  const resolutions = [{ w: W, h: H }, { w: fallbackW, h: fallbackH }];

  let videoConfig: VideoEncoderConfig | null = null;
  
  findConfig:
  for (const res of resolutions) {
    for (const codec of codecCandidates) {
      const cfg: VideoEncoderConfig = {
        codec,
        width: res.w,
        height: res.h,
        bitrate: res.w >= 1080 ? 4_000_000 : 2_500_000,
        framerate: FPS,
      };
      try {
        const support = await VideoEncoder.isConfigSupported(cfg);
        if (support.supported) {
          videoConfig = support.config || cfg;
          W = res.w;
          H = res.h;
          break findConfig;
        }
      } catch {}
    }
  }

  if (!videoConfig) {
    throw new Error("Nenhum codec H.264 suportado.");
  }

  canvas.width = W;
  canvas.height = H;

  // Decode audio (background music + vinheta audio combined)
  let audioBuffer: AudioBuffer | null = null;
  const mainDurationSec = mainDuration / 1000;
  
  // Decode background music
  let bgAudioBuffer: AudioBuffer | null = null;
  if (audioBlob && audioBlob.size > 0) {
    try {
      bgAudioBuffer = await decodeAudioBlob(audioBlob);
      console.log("[VideoExporter] BG Audio decoded:", bgAudioBuffer.sampleRate, "Hz,", bgAudioBuffer.duration.toFixed(1), "s");
    } catch (err) {
      console.error("[VideoExporter] BG Audio decode failed:", err);
    }
  }
  
  // Decode vinheta audio
  let vinhetaAudioBuffer: AudioBuffer | null = null;
  if (vinhetaVideo) {
    try {
      const vinhetaBlob = await fetchVinhetaAudio();
      if (vinhetaBlob) {
        vinhetaAudioBuffer = await decodeAudioBlob(vinhetaBlob);
        console.log("[VideoExporter] Vinheta audio decoded:", vinhetaAudioBuffer.duration.toFixed(1), "s");
      }
    } catch (err) {
      console.warn("[VideoExporter] Vinheta audio decode failed:", err);
    }
  }
  
  // Combine bg music + vinheta into single buffer
  if (bgAudioBuffer || vinhetaAudioBuffer) {
    const sampleRate = bgAudioBuffer?.sampleRate || vinhetaAudioBuffer?.sampleRate || 44100;
    const channels = Math.min(bgAudioBuffer?.numberOfChannels || vinhetaAudioBuffer?.numberOfChannels || 2, 2);
    const totalSamples = Math.ceil(durationSec * sampleRate);
    const offlineCtx = new OfflineAudioContext(channels, totalSamples, sampleRate);
    
    if (bgAudioBuffer) {
      const bgSource = offlineCtx.createBufferSource();
      bgSource.buffer = bgAudioBuffer;
      const bgGain = offlineCtx.createGain();
      bgGain.gain.value = 1.0;
      // Fade out bg music before vinheta starts
      if (vinhetaAudioBuffer) {
        bgGain.gain.setValueAtTime(1.0, Math.max(0, mainDurationSec - 1));
        bgGain.gain.linearRampToValueAtTime(0, mainDurationSec);
      }
      bgSource.connect(bgGain);
      bgGain.connect(offlineCtx.destination);
      bgSource.start(0);
    }
    
    if (vinhetaAudioBuffer) {
      const vSource = offlineCtx.createBufferSource();
      vSource.buffer = vinhetaAudioBuffer;
      vSource.connect(offlineCtx.destination);
      vSource.start(mainDurationSec); // Start at the vinheta portion
    }
    
    try {
      audioBuffer = await offlineCtx.startRendering();
      console.log("[VideoExporter] Combined audio:", audioBuffer.duration.toFixed(1), "s");
    } catch (err) {
      console.error("[VideoExporter] Audio combine failed:", err);
      audioBuffer = bgAudioBuffer; // Fallback
    }
  }

  // Audio codec detection
  let audioCodec: "aac" | "opus" | null = null;
  if (audioBuffer && typeof AudioEncoder !== "undefined") {
    try {
      const s = await AudioEncoder.isConfigSupported({ codec: "mp4a.40.2", sampleRate: audioBuffer.sampleRate, numberOfChannels: Math.min(audioBuffer.numberOfChannels, 2), bitrate: 128000 });
      if (s.supported) audioCodec = "aac";
    } catch {}
    if (!audioCodec) {
      try {
        const s = await AudioEncoder.isConfigSupported({ codec: "opus", sampleRate: audioBuffer.sampleRate, numberOfChannels: Math.min(audioBuffer.numberOfChannels, 2), bitrate: 128000 });
        if (s.supported) audioCodec = "opus";
      } catch {}
    }
  }

  // Setup encoder + muxer
  let muxer: Muxer<ArrayBufferTarget> | null = null;

  const encoder = new VideoEncoder({
    output: (chunk, meta) => { if (muxer) muxer.addVideoChunk(chunk, meta); },
    error: (e) => { console.error("[VideoExporter] Encoder error:", e); },
  });

  encoder.configure(videoConfig);

  const muxerOptions: any = {
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width: W, height: H },
    fastStart: "in-memory",
  };
  if (audioCodec && audioBuffer) {
    muxerOptions.audio = {
      codec: audioCodec,
      numberOfChannels: Math.min(audioBuffer.numberOfChannels, 2),
      sampleRate: audioBuffer.sampleRate,
    };
  }
  muxer = new Muxer(muxerOptions) as Muxer<ArrayBufferTarget>;

  // Render and encode frames — yield frequently to keep UI responsive
  let lastReportedPct = 15;
  for (let frame = 0; frame < totalFrames; frame++) {
    const timeMs = (frame / FPS) * 1000;
    // Render main content or vinheta
    if (timeMs < mainDuration) {
      renderFrame(ctx, timeMs, images, property, brand, logoImg, W, H, aiPhrases);
    } else if (vinhetaVideo) {
      // Seek vinheta video to the correct time and draw directly
      const vinhetaTime = (timeMs - mainDuration) / 1000;
      // Only seek every 3rd vinheta frame — intermediate frames reuse last position
      const vinhetaFrameIdx = Math.floor(vinhetaTime * FPS);
      if (vinhetaFrameIdx % 3 === 0 || vinhetaFrameIdx === 0) {
        await seekVideoToTime(vinhetaVideo, vinhetaTime);
      }
      drawVinhetaFrame(ctx, vinhetaVideo, W, H);
    }

    const videoFrame = new VideoFrame(canvas, { timestamp: frame * (1_000_000 / FPS) });
    encoder.encode(videoFrame, { keyFrame: frame % (FPS * 2) === 0 });
    videoFrame.close();

    // Throttle progress updates to avoid excessive React re-renders
    const pct = 15 + Math.round((frame / totalFrames) * 65);
    if (pct !== lastReportedPct) {
      lastReportedPct = pct;
      onProgress(pct);
    }

    // Yield to main thread every 3 frames to keep UI responsive
    if (frame % 3 === 0) {
      await new Promise(r => setTimeout(r, 0));
      // Wait for encoder queue to drain if backed up (prevents memory bloat + freezing)
      while (encoder.encodeQueueSize > 10) {
        await new Promise(r => setTimeout(r, 5));
      }
    }
  }

  await encoder.flush();
  encoder.close();

  // Encode audio
  if (audioBuffer && audioCodec && muxer) {
    try {
      console.log("[VideoExporter] Encoding audio:", audioCodec, "sampleRate:", audioBuffer.sampleRate, "channels:", audioBuffer.numberOfChannels, "duration:", durationSec + "s");
      await encodeAudioForMuxer(audioBuffer, durationSec, muxer);
      console.log("[VideoExporter] Audio encoding complete");
    } catch (err) {
      console.error("[VideoExporter] Audio encoding failed:", err);
    }
  } else {
    console.warn("[VideoExporter] No audio to encode. audioBuffer:", !!audioBuffer, "audioCodec:", audioCodec);
  }

  muxer.finalize();
  const buffer = (muxer.target as ArrayBufferTarget).buffer;
  const blob = new Blob([buffer], { type: "video/mp4" });

  if (blob.size < 100) throw new Error("O vídeo gerado está vazio.");

  return blob;
}

// === Main export entry point ===

let activeExport: Promise<Blob> | null = null;

export const exportVideo = async (options: ExportOptions): Promise<Blob> => {
  if (activeExport) return activeExport;

  const doExport = async (): Promise<Blob> => {
    const { property, brand, photos, onProgress, audioBlob, exportFormat = "vertical", autoDownload = true, previewMode = false } = options;
    
    // Resolution based on format and preview mode
    const dims = FORMAT_DIMENSIONS[exportFormat];
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let exportW: number, exportH: number;
    
    if (previewMode) {
      // Low resolution for fast preview
      const scale = 0.33;
      exportW = Math.round(dims.w * scale);
      exportH = Math.round(dims.h * scale);
    } else if (isMobile) {
      // iOS MediaRecorder struggles with high resolutions — use 540p for stability
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const scale = isIOS ? 0.5 : 0.67;
      exportW = Math.round(dims.w * scale);
      exportH = Math.round(dims.h * scale);
    } else {
      exportW = dims.w;
      exportH = dims.h;
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext("2d")!;

    // Preload images
    onProgress(0);
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < photos.length; i++) {
      try { images.push(await loadImage(photos[i])); } catch {}
      onProgress(Math.round((i / photos.length) * 10));
    }
    if (images.length === 0) throw new Error("No images could be loaded");

    // Test canvas taint
    ctx.drawImage(images[0], 0, 0, exportW, exportH);
    try { ctx.getImageData(0, 0, 1, 1); } catch {
      throw new Error("As imagens não puderam ser carregadas pelo proxy.");
    }
    ctx.clearRect(0, 0, exportW, exportH);

    // Load logo
    let logoImg: HTMLImageElement | null = null;
    if (brand.logoUrl) {
      try { logoImg = await loadImage(brand.logoUrl); } catch {}
    }

    onProgress(12);

    // Fetch AI phrases
    let aiPhrases: string[] | undefined;
    if (!previewMode) {
      try {
        const CACHE_KEY = "sgflix-copy-" + property.id;
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.phrases?.length >= images.length) {
            aiPhrases = parsed.phrases;
          }
        }
        if (!aiPhrases) {
          const { data } = await supabase.functions.invoke("generate-property-copy", {
            body: {
              property: { tipo: property.tipo, titulo: property.titulo, preco: property.preco, bairro: property.bairro, cidade: property.cidade, quartos: property.quartos, suites: property.suites, banheiros: property.banheiros, vagas: property.vagas, area: property.area, descricao: property.descricao },
              photoCount: images.length,
              photoUrls: photos.slice(0, images.length),
            },
          });
          if (data?.phrases) {
            aiPhrases = data.phrases;
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.warn("[VideoExporter] AI phrases failed:", err);
      }
    }

    // Audio — skip for preview mode for speed
    let resolvedAudio: Blob | null = previewMode ? null : (audioBlob || null);

    // Load vinheta video (skip for preview mode)
    let vinhetaVideo: HTMLVideoElement | null = null;
    if (!previewMode) {
      vinhetaVideo = await loadVinhetaVideo();
      if (vinhetaVideo) {
        console.log("[VideoExporter] Vinheta loaded:", vinhetaVideo.duration.toFixed(1), "s");
      }
    }

    onProgress(15);

    // Pre-extract vinheta frames for WebCodecs (eliminates per-frame seeking)
    // (Vinheta frames are now rendered directly from video during encoding)

    const useMediaRecorder = shouldUseMediaRecorder();
    console.log("[VideoExporter] Strategy:", useMediaRecorder ? "MediaRecorder" : "WebCodecs", "format:", exportFormat, "resolution:", exportW + "x" + exportH, "preview:", previewMode, "vinheta:", !!vinhetaVideo, "aiPhrases:", aiPhrases?.length || 0);

    let blob: Blob;
    let fileExt = "mp4";

    if (useMediaRecorder) {
      const result = await exportWithMediaRecorder(canvas, ctx, images, property, brand, logoImg, onProgress, resolvedAudio, vinhetaVideo, aiPhrases);
      blob = result.blob;
      fileExt = result.ext;
    } else {
      blob = await exportWithWebCodecs(canvas, ctx, images, property, brand, logoImg, onProgress, resolvedAudio, vinhetaVideo, aiPhrases);
    }

    onProgress(95);

    if (autoDownload) {
      const formatLabel = exportFormat === "vertical" ? "Reels" : exportFormat === "square" ? "Feed" : "YouTube";
      const filename = `${property.titulo.replace(/[^a-zA-Z0-9À-ú ]/g, "").substring(0, 35)}_${formatLabel}.${fileExt}`;
      await downloadOrShare(blob, filename);
    }

    onProgress(100);
    return blob;
  };

  activeExport = doExport().finally(() => { activeExport = null; });
  return activeExport;
};

// Default music track URL
const DEFAULT_MUSIC_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/audio-assets/trilha-padrao.mp3`;
let cachedMusicBlob: Blob | null = null;

export async function fetchBackgroundMusic(): Promise<Blob | null> {
  if (cachedMusicBlob) return cachedMusicBlob;
  try {
    const response = await fetch(DEFAULT_MUSIC_URL);
    if (!response.ok) return null;
    const blob = await response.blob();
    if (blob.size > 100) { cachedMusicBlob = blob; return blob; }
    return null;
  } catch {
    return null;
  }
}

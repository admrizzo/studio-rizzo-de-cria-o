import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal, flushSync } from "react-dom";
import { Property, BrandConfig } from "@/types/property";
import { useAuth } from "@/contexts/AuthContext";
import { allTemplates } from "./templateRegistry";
import { TemplateConfig, TemplateProps } from "./templateTypes";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Download, X, ChevronLeft, ChevronRight, Palette, ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BASE_WIDTH = 1080;
const STORY_HEIGHT = 1920;
const POST_HEIGHT = 1350;

const FOCUSES = [
  { key: "all", label: "Todos" },
  { key: "geral", label: "Geral" },
  { key: "preco", label: "Preço" },
  { key: "bairro", label: "Bairro" },
  { key: "area", label: "Área" },
  { key: "condominio", label: "Condomínio" },
  { key: "corretor", label: "Corretor" },
] as const;

type FormatTab = "stories" | "post";

interface TemplateGalleryProps {
  property: Property;
  brand: BrandConfig;
  onClose: () => void;
}

const waitForImages = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          // Safety timeout — never block export longer than 4s per image
          setTimeout(done, 4000);
        }),
    ),
  );
};

const loadImageElement = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });

type ImageOptimizationOptions = {
  maxSide?: number;
  quality?: number;
};

const imageBlobToOptimizedDataUrl = async (blob: Blob, options: ImageOptimizationOptions = {}) => {
  const maxSide = options.maxSide ?? 1400;
  const quality = options.quality ?? 0.82;
  if (blob.type.includes("png") || blob.type.includes("svg") || blob.type.includes("gif")) {
    return blobToDataUrl(blob);
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await loadImageElement(objectUrl);
    const largestSide = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
    const scale = largestSide > maxSide ? maxSide / largestSide : 1;
    const width = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível");
    ctx.drawImage(img, 0, 0, width, height);
    const optimizedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((nextBlob) => (nextBlob ? resolve(nextBlob) : reject(new Error("Falha ao otimizar imagem"))), "image/jpeg", quality);
    });
    return blobToDataUrl(optimizedBlob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const resolveObjectPosition = (value: string, freeSpace: number) => {
  const normalized = value.trim().toLowerCase();
  if (normalized.endsWith("%")) return (parseFloat(normalized) / 100) * freeSpace;
  if (normalized.endsWith("px")) return parseFloat(normalized);
  if (normalized === "left" || normalized === "top") return 0;
  if (normalized === "right" || normalized === "bottom") return freeSpace;
  return freeSpace / 2;
};

const drawImageLikeObjectFit = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number, fit: string, position: string) => {
  const sourceWidth = img.naturalWidth || img.width;
  const sourceHeight = img.naturalHeight || img.height;
  if (!sourceWidth || !sourceHeight) return;

  let drawWidth = width;
  let drawHeight = height;
  if (fit !== "fill") {
    const ratio = fit === "contain" ? Math.min(width / sourceWidth, height / sourceHeight) : Math.max(width / sourceWidth, height / sourceHeight);
    drawWidth = sourceWidth * ratio;
    drawHeight = sourceHeight * ratio;
  }

  const [xPosition = "50%", yPosition = "50%"] = position.split(/\s+/);
  const dx = resolveObjectPosition(xPosition, width - drawWidth);
  const dy = resolveObjectPosition(yPosition, height - drawHeight);
  ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
};

const replaceImagesWithCanvases = async (node: HTMLElement) => {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map(async (img) => {
    const src = img.currentSrc || img.getAttribute("src") || img.src;
    const rect = img.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || img.width || img.naturalWidth));
    const height = Math.max(1, Math.round(rect.height || img.height || img.naturalHeight));
    if (!src || !width || !height) return;

    const computed = getComputedStyle(img);
    const rasterImg = src === img.src && img.complete && img.naturalWidth > 0 ? img : await loadImageElement(src);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.className = img.className;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = img.style.cssText;
    canvas.style.display = computed.display === "inline" ? "inline-block" : computed.display;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.objectFit = computed.objectFit;
    canvas.style.objectPosition = computed.objectPosition;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    drawImageLikeObjectFit(ctx, rasterImg, width, height, computed.objectFit || "cover", computed.objectPosition || "50% 50%");
    img.replaceWith(canvas);
  }));
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Falha ao converter imagem"));
    };
    reader.onerror = () => reject(new Error("Falha ao ler imagem"));
    reader.readAsDataURL(blob);
  });

const downloadPng = async (blob: Blob, filename: string) => {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  try {
    if (isIOS && navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: blob.type || "image/png" });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    }

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  } catch (error) {
    const dataUrl = await blobToDataUrl(blob);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if ((error as Error)?.name === "AbortError") return;
  }
};

const ScaledCanvas = ({
  Component,
  props,
  nativeH,
  className,
  innerClassName,
  style,
}: {
  Component: React.FC<TemplateProps>;
  props: TemplateProps;
  nativeH: number;
  className?: string;
  innerClassName?: string;
  style?: React.CSSProperties;
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const scaledWidth = BASE_WIDTH * scale;
  const scaledHeight = nativeH * scale;

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const updateScale = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      setScale(Math.min(width / BASE_WIDTH, height / nativeH));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nativeH]);

  return (
    <div ref={frameRef} className={cn("relative overflow-hidden", className)} style={style}>
      <div
        className={cn("absolute left-1/2 top-1/2", innerClassName)}
        style={{
          width: scaledWidth || 0,
          height: scaledHeight || 0,
          transform: "translate(-50%, -50%)",
          opacity: scale > 0 ? 1 : 0,
        }}
      >
        <div
          style={{
            width: BASE_WIDTH,
            height: nativeH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            fontSize: "16px",
            willChange: "transform",
          }}
        >
          <Component {...props} />
        </div>
      </div>
    </div>
  );
};

const TemplateThumb = ({
  template,
  templateProps,
  nativeH,
  onPreview,
  onDownload,
  exporting,
  recommended,
}: {
  template: TemplateConfig;
  templateProps: TemplateProps;
  nativeH: number;
  onPreview: (t: TemplateConfig) => void;
  onDownload: (t: TemplateConfig) => void;
  exporting: boolean;
  recommended?: boolean;
}) => {
  const isStories = nativeH === STORY_HEIGHT;

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border bg-card p-2 text-left shadow-sm",
        recommended ? "border-primary ring-2 ring-primary/30" : "border-border",
      )}
      onClick={(event) => event.stopPropagation()}
    >
      {recommended && (
        <span className="absolute -top-2 left-3 z-10 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
          Recomendado
        </span>
      )}
      <ScaledCanvas
        Component={template.component}
        props={templateProps}
        nativeH={nativeH}
        className="w-full rounded-xl border border-border/60 bg-muted/30 shadow-sm"
        innerClassName="pointer-events-none"
        style={{ aspectRatio: isStories ? "9 / 16" : "3 / 4" } as React.CSSProperties}
      />
      <div className="mt-2 flex items-center justify-between gap-2 px-1 py-1">
        <p className="truncate text-xs font-medium text-foreground">{template.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              onPreview(template);
            }}
            className="gap-1.5 h-7 text-xs px-2.5"
          >
            <Eye className="h-3.5 w-3.5" />
            Ver grande
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onDownload(template);
            }}
            disabled={exporting}
            className="gap-1.5 h-7 text-xs px-2.5"
          >
            <Download className="h-3.5 w-3.5" />
            {exporting ? "..." : "Baixar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TemplateGallery = ({ property, brand, onClose }: TemplateGalleryProps) => {
  const { profile } = useAuth();
  const [focusFilter, setFocusFilter] = useState<string>("all");
  const [formatTab, setFormatTab] = useState<FormatTab>("stories");
  const [exportingTemplate, setExportingTemplate] = useState<TemplateConfig | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateConfig | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [secondaryPhotoIdx, setSecondaryPhotoIdx] = useState<number>(1);
  const [exporting, setExporting] = useState(false);
  const [exportTemplateProps, setExportTemplateProps] = useState<TemplateProps | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const proxyCacheRef = useRef<Map<string, string>>(new Map());

  const photos = property.fotos?.length ? property.fotos : property.fotosSmall || [];
  const thumbs = property.fotosSmall?.length === photos.length ? property.fotosSmall : photos;
  const currentPhoto = photos[selectedPhotoIdx] || photos[0] || "";
  const currentSecondaryPhoto =
    photos.length > 1 && secondaryPhotoIdx !== selectedPhotoIdx
      ? photos[secondaryPhotoIdx] || ""
      : "";

  // Negotiation hint: which Rizzo template to recommend
  const hasVenda = (property.valorVenda ?? 0) > 0;
  const hasLocacao = (property.valorLocacao ?? 0) > 0;
  const recommendedRizzoId =
    hasVenda && !hasLocacao
      ? "sr-venda"
      : hasLocacao && !hasVenda
      ? "sr-locacao"
      : null; // both or neither — recommend none, show both

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      proxyCacheRef.current.forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      proxyCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (selectedPhotoIdx >= photos.length) setSelectedPhotoIdx(0);
    if (secondaryPhotoIdx >= photos.length) setSecondaryPhotoIdx(photos.length > 1 ? 1 : 0);
    if (secondaryPhotoIdx === selectedPhotoIdx && photos.length > 1) {
      setSecondaryPhotoIdx((selectedPhotoIdx + 1) % photos.length);
    }
  }, [photos.length, selectedPhotoIdx, secondaryPhotoIdx]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const filtered = useMemo(
    () =>
      allTemplates.filter((t) => {
        if (t.format !== formatTab) return false;
        if (focusFilter !== "all" && t.focus !== focusFilter) return false;
        return true;
      }),
    [focusFilter, formatTab],
  );

  const storiesCount = useMemo(() => allTemplates.filter((t) => t.format === "stories").length, []);
  const postsCount = useMemo(() => allTemplates.filter((t) => t.format === "post").length, []);

  const liveTemplateProps = useMemo<TemplateProps>(
    () => ({
      property,
      brand,
      agent: profile,
      photoUrl: currentPhoto,
      secondaryPhotoUrl: currentSecondaryPhoto,
    }),
    [property, brand, profile, currentPhoto, currentSecondaryPhoto],
  );

  const proxifyUrl = useCallback(async (src?: string | null) => {
    if (!src) return "";
    if (src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/") || !src.startsWith("http")) {
      return src;
    }

    const cached = proxyCacheRef.current.get(src);
    if (cached) return cached;

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const proxyRes = await fetch(`${supabaseUrl}/functions/v1/image-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ url: src }),
    });

    if (!proxyRes.ok) {
      const errText = await proxyRes.text().catch(() => "");
      throw new Error(`Proxy HTTP ${proxyRes.status}: ${errText.substring(0, 120)}`);
    }

    const blob = await proxyRes.blob();
    if (blob.size < 100) throw new Error("Proxy retornou imagem vazia");

    const dataUrl = await imageBlobToOptimizedDataUrl(blob);
    proxyCacheRef.current.set(src, dataUrl);
    return dataUrl;
  }, []);

  const buildExportProps = useCallback(async (): Promise<TemplateProps> => {
    const [photoUrl, secondaryPhotoUrl, logoUrl, agentPhoto] = await Promise.all([
      proxifyUrl(currentPhoto).catch(() => currentPhoto),
      currentSecondaryPhoto
        ? proxifyUrl(currentSecondaryPhoto).catch(() => currentSecondaryPhoto)
        : Promise.resolve(""),
      proxifyUrl(brand.logoUrl).catch(() => brand.logoUrl || ""),
      proxifyUrl(profile?.foto_url).catch(() => profile?.foto_url || ""),
    ]);

    return {
      property,
      photoUrl,
      secondaryPhotoUrl,
      brand: { ...brand, logoUrl },
      agent: profile ? { ...profile, foto_url: agentPhoto } : profile,
    };
  }, [brand, currentPhoto, currentSecondaryPhoto, profile, property, proxifyUrl]);

  const handleExport = useCallback(async (template: TemplateConfig) => {
    flushSync(() => {
      setExportingTemplate(template);
      setExporting(true);
    });
    try {
      const nextProps = await buildExportProps();
      flushSync(() => {
        setExportTemplateProps(nextProps);
      });

      // Wait for React to render the component with new props
      await new Promise((resolve) => setTimeout(resolve, 100));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => setTimeout(resolve, 120));

      if (!exportRef.current) throw new Error("Preview de exportação não encontrado");

      // Belt-and-suspenders: convert ANY remaining http(s) <img> src to data URL via proxy.
      // html-to-image cannot inline cross-origin images without CORS, so this prevents blank artwork.
      const allImgs = Array.from(exportRef.current.querySelectorAll("img"));
      await Promise.all(
        allImgs.map(async (img) => {
          const src = img.getAttribute("src") || "";
          if (!src || src.startsWith("data:") || src.startsWith("blob:")) return;
          if (!src.startsWith("http")) return;
          try {
            const dataUrl = await proxifyUrl(src);
            if (dataUrl && dataUrl.startsWith("data:")) {
              img.setAttribute("crossorigin", "anonymous");
              img.src = dataUrl;
            }
          } catch (err) {
            console.warn("[Export] Failed to proxify image:", src, err);
          }
        }),
      );

      await document.fonts?.ready;

      // Wait for all images to finish loading after src swap
      for (let attempt = 0; attempt < 3; attempt++) {
        await waitForImages(exportRef.current);
        const imgs = Array.from(exportRef.current.querySelectorAll("img"));
        await Promise.all(
          imgs.map(async (img) => {
            try {
              await img.decode?.();
            } catch {
              // ignore decode failures and fall back to naturalWidth checks below
            }
          }),
        );
        const allLoaded = imgs.every((img) => img.complete && img.naturalWidth > 0);
        if (allLoaded) break;
        await new Promise((resolve) => setTimeout(resolve, 250));
      }

      // Mobile Safari/Chrome can still drop <img> pixels during DOM rasterization.
      // Canvas pixels are already local in the document, so html-to-image captures them reliably.
      await replaceImagesWithCanvases(exportRef.current);
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const canvas = await html2canvas(exportRef.current, {
        width: BASE_WIDTH,
        height: template.format === "stories" ? STORY_HEIGHT : POST_HEIGHT,
        scale: 1,
        useCORS: false,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 0,
        removeContainer: true,
        windowWidth: BASE_WIDTH,
        windowHeight: template.format === "stories" ? STORY_HEIGHT : POST_HEIGHT,
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));

      if (!blob) throw new Error("Falha ao gerar imagem da arte");

      const cleanTitle = property.titulo
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .substring(0, 40);

      await downloadPng(blob, `${cleanTitle || "arte"}_${template.id}.png`);
      toast.success("Arte baixada com sucesso!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erro ao baixar arte");
    } finally {
      setExporting(false);
      setExportingTemplate(null);
      setExportTemplateProps(null);
    }
  }, [buildExportProps, property.titulo, proxifyUrl]);

  const prevPhoto = useCallback(() => {
    if (!photos.length) return;
    setSelectedPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  const nextPhoto = useCallback(() => {
    if (!photos.length) return;
    setSelectedPhotoIdx((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const content = (
    <>
      <div className="fixed inset-0 z-[80] bg-background" onClick={(event) => event.stopPropagation()}>
        <div className="fixed inset-x-0 top-0 z-20 border-b border-border bg-background/96 backdrop-blur-md" onClick={(event) => event.stopPropagation()}>
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-primary/10 p-2 text-primary">
                  <Palette className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground" style={{ fontFamily: "'Barlow', sans-serif" }}>
                    Criador de Artes
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">{property.titulo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Escolheu a foto? Já veja abaixo cada arte completa, pronta e no tamanho real do download.
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={(event) => { event.stopPropagation(); onClose(); }} className="gap-2 shrink-0">
                <X className="h-4 w-4" /> Fechar
              </Button>
            </div>
          </div>
        </div>

        <div className="h-screen overflow-y-auto pt-28 sm:pt-28" onClick={(event) => event.stopPropagation()}>
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Foto base da arte</p>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  A foto selecionada abaixo será usada em todos os previews desta tela.
                </p>
                {photos.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {thumbs.map((thumb, idx) => (
                      <button
                        key={`${thumb}-${idx}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedPhotoIdx(idx);
                        }}
                        className={cn(
                          "h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all sm:h-20 sm:w-20",
                          idx === selectedPhotoIdx
                            ? "border-primary shadow-md"
                            : "border-border opacity-70 hover:opacity-100",
                        )}
                      >
                        <img src={thumb} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-muted/40 px-3 py-4 text-sm text-muted-foreground">
                    Este imóvel tem uma única foto disponível para as artes.
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-border bg-card p-3 shadow-sm">
                <p className="mb-2 text-sm font-semibold text-foreground">Formato</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFormatTab("stories");
                    }}
                    className={cn(
                      "min-w-[140px] rounded-2xl border px-4 py-3 text-left transition-all",
                      formatTab === "stories"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <p className="text-sm font-semibold">Stories</p>
                    <p className="text-xs opacity-75">9:16 · {storiesCount} opções</p>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setFormatTab("post");
                    }}
                    className={cn(
                      "min-w-[140px] rounded-2xl border px-4 py-3 text-left transition-all",
                      formatTab === "post"
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <p className="text-sm font-semibold">Post</p>
                    <p className="text-xs opacity-75">3:4 · {postsCount} opções</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {FOCUSES.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFocusFilter(c.key);
                  }}
                  className={cn(
                    "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all",
                    focusFilter === c.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-border bg-card text-sm text-muted-foreground">
                Nenhuma arte encontrada nessa combinação.
              </div>
            ) : (
              <div className="space-y-4 pb-10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {formatTab === "stories" ? "Artes para Stories" : "Artes para Post"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      O corretor já vê aqui a arte pronta, sem precisar abrir uma por uma.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{filtered.length} opções</p>
                </div>

                <div
                  className={cn(
                    "grid gap-3",
                    formatTab === "stories"
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                  )}
                >
                  {filtered.map((template) => (
                    <TemplateThumb
                      key={template.id}
                      template={template}
                      templateProps={liveTemplateProps}
                      nativeH={formatTab === "stories" ? STORY_HEIGHT : POST_HEIGHT}
                      onPreview={setPreviewTemplate}
                      onDownload={handleExport}
                      exporting={exporting}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden opacity-[0.001]">
        {exportingTemplate && (
          <div
            ref={exportRef}
            style={{
              width: BASE_WIDTH,
              height: exportingTemplate.format === "stories" ? STORY_HEIGHT : POST_HEIGHT,
              position: "absolute",
              top: 0,
              left: 0,
              overflow: "hidden",
            }}
          >
            {React.createElement(exportingTemplate.component, exportTemplateProps ?? liveTemplateProps)}
          </div>
        )}
      </div>

      {previewTemplate && (
        <div className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm p-4 sm:p-6" onClick={() => setPreviewTemplate(null)}>
          <div className="mx-auto flex h-full max-w-7xl flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3 rounded-3xl border border-border bg-card px-4 py-3 shadow-sm">
              <div>
                <h3 className="text-base font-semibold text-foreground">{previewTemplate.name}</h3>
                <p className="text-sm text-muted-foreground">Preview ampliado para validar leitura real da arte.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => handleExport(previewTemplate)}
                  disabled={exporting}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {exporting ? "Baixando..." : "Baixar arte"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setPreviewTemplate(null)} className="gap-2">
                  <X className="h-4 w-4" />
                  Fechar
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-3xl border border-border bg-card p-4 shadow-sm">
              <div
                className={cn(
                  "mx-auto h-full",
                  previewTemplate.format === "stories" ? "max-w-[520px]" : "max-w-[900px]",
                )}
              >
                <ScaledCanvas
                  Component={previewTemplate.component}
                  props={liveTemplateProps}
                  nativeH={previewTemplate.format === "stories" ? STORY_HEIGHT : POST_HEIGHT}
                  className="h-full w-full rounded-2xl border border-border/60 bg-muted/20"
                  innerClassName="pointer-events-none"
                  style={{
                    aspectRatio: previewTemplate.format === "stories" ? "9 / 16" : "4 / 5",
                    minHeight: previewTemplate.format === "stories" ? "70vh" : "60vh",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return createPortal(content, document.body);
};

export default TemplateGallery;

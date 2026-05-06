import React, { useState } from "react";
import { Property, BrandConfig } from "@/types/property";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, Smartphone, Square, Monitor, Check, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { exportVideo, fetchBackgroundMusic, ExportFormat } from "@/utils/videoExporter";
import { toast } from "sonner";

interface VideoPreviewModalProps {
  property: Property;
  brand: BrandConfig;
  photos: string[];
  onClose: () => void;
}

const FORMAT_OPTIONS: { id: ExportFormat; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "vertical", label: "Reels / TikTok", desc: "9:16 · 1080×1920", icon: Smartphone },
  { id: "square", label: "Feed", desc: "1:1 · 1080×1080", icon: Square },
  { id: "horizontal", label: "YouTube", desc: "16:9 · 1920×1080", icon: Monitor },
];

const VideoPreviewModal = ({ property, brand, photos, onClose }: VideoPreviewModalProps) => {
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("vertical");
  const [minimized, setMinimized] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportProgress(0);
    try {
      toast.info("Preparando trilha sonora...");
      const audioBlob = await fetchBackgroundMusic();

      await exportVideo({
        property,
        brand,
        photos,
        onProgress: (p) => { try { setExportProgress(p); } catch {} },
        format: "mp4",
        audioBlob,
        exportFormat: selectedFormat,
        autoDownload: true,
        previewMode: false,
      });
      toast.success("Vídeo exportado com sucesso!");
      onClose();
    } catch (err: any) {
      console.error("Export error:", err);
      toast.error("Erro ao exportar: " + (err.message || "Tente novamente"));
      setExporting(false);
    }
  };

  const progressLabel = exportProgress < 15 ? "Carregando imagens..." :
    exportProgress < 90 ? "Renderizando frames..." :
    exportProgress < 95 ? "Finalizando..." : "Salvando...";

  // Minimized floating pill at bottom-right
  if (minimized && exporting) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="fixed bottom-4 right-4 z-[60] bg-card border border-border/50 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
        onClick={() => setMinimized(false)}
      >
        <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-foreground truncate">Exportando vídeo</span>
          <div className="flex items-center gap-2">
            <Progress value={exportProgress} className="w-20 h-1.5" />
            <span className="text-xs font-bold text-primary">{exportProgress}%</span>
          </div>
        </div>
        <Maximize2 className="w-4 h-4 text-muted-foreground shrink-0" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={!exporting ? onClose : undefined}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-2xl border border-border/50 w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h2 className="text-sm font-bold text-foreground">
            {exporting ? "Exportando vídeo..." : "Exportar vídeo"}
          </h2>
          <div className="flex items-center gap-1">
            {exporting && (
              <Button variant="ghost" size="icon" onClick={() => setMinimized(true)} className="rounded-full h-8 w-8" title="Minimizar">
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8" disabled={exporting}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {!exporting ? (
            <>
              {/* Format picker */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Formato</span>
                <div className="grid grid-cols-3 gap-2">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5">
                            <Check className="w-3.5 h-3.5 text-primary" />
                          </div>
                        )}
                        <fmt.icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{fmt.label}</span>
                        <span className="text-[10px] opacity-60">{fmt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleExport}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              >
                <Download className="w-4 h-4" />
                Exportar vídeo com música e vinheta
              </Button>

              <p className="text-[10px] text-center text-muted-foreground">
                O vídeo será gerado em alta qualidade com trilha sonora e vinheta final.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">{progressLabel}</span>
              <span className="text-2xl font-bold text-foreground">{exportProgress}%</span>
              <Progress value={exportProgress} className="w-3/4 h-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMinimized(true)}
                className="gap-2 text-xs mt-2"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                Minimizar e continuar navegando
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VideoPreviewModal;

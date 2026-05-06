import React from "react";
import { useApp } from "@/contexts/AppContext";
import { useDemo } from "@/contexts/DemoContext";
import PropertyGrid from "@/components/PropertyGrid";
import VideoPresentation from "@/components/presentations/VideoPresentation";
import VideoPreviewModal from "@/components/VideoPreviewModal";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, ImageIcon, FileText } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DEMO_PROPERTIES } from "@/data/demoProperties";
import { useEffect } from "react";

const DemoPage = () => {
  const { setProperties, selectedProperty, presentationMode, brand,
    setSelectedProperty, setPresentationMode, setSelectedPhotos,
    activeExport, setActiveExport } = useApp();
  const { isDemo } = useDemo();
  const nav = useNavigate();

  useEffect(() => {
    setProperties(DEMO_PROPERTIES);
  }, []);

  const closePresentation = () => {
    setSelectedProperty(null);
    setPresentationMode(null);
    setSelectedPhotos([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground text-center py-2 text-xs sm:text-sm font-bold uppercase tracking-wider">
        Modo demonstração, dados fictícios
      </div>

      <header className="fixed top-9 left-0 right-0 z-40 h-16 glass-strong flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => nav("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <BrandMark size="md" />
        </div>
        <Button onClick={() => nav("/")} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Criar conta
        </Button>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-32 pb-8">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow', sans-serif" }}>
              Studios de Criação
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Vídeos, artes e legendas profissionais. Selecione um imóvel para experimentar.
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { icon: Video, label: "Vídeos" },
              { icon: ImageIcon, label: "Artes" },
              { icon: FileText, label: "Legendas" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary text-xs font-medium">
                <f.icon className="w-3.5 h-3.5" />
                {f.label}
              </div>
            ))}
          </div>
        </div>
        <PropertyGrid />
      </main>

      <AnimatePresence>
        {selectedProperty && presentationMode === "video" && (
          <motion.div key="video-presentation" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VideoPresentation property={selectedProperty} brand={brand} onClose={closePresentation} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeExport && (
          <VideoPreviewModal
            property={activeExport.property}
            brand={activeExport.brand}
            photos={activeExport.photos}
            onClose={() => setActiveExport(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoPage;

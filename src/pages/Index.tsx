import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import JsonImporter from "@/components/JsonImporter";
import PropertyGrid from "@/components/PropertyGrid";
import BrandConfig from "@/components/BrandConfig";
import VideoPresentation from "@/components/presentations/VideoPresentation";
import VideoPreviewModal from "@/components/VideoPreviewModal";
import AgentProfileEditor from "@/components/AgentProfileEditor";
import AdminUsers from "@/components/AdminUsers";
import AuthPage from "@/pages/AuthPage";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid, Import, Palette, Menu, X, User, LogOut,
  Video, ImageIcon, FileText, Sparkles, ChevronRight, Users as UsersIcon, PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ActiveView = "catalogo" | "importar" | "marca" | "perfil" | "usuarios";

const NAV_ITEMS: { key: ActiveView; label: string; icon: React.ElementType }[] = [
  { key: "catalogo", label: "Catálogo", icon: LayoutGrid },
  { key: "importar", label: "Importar Feed", icon: Import },
  { key: "marca", label: "Configurar Marca", icon: Palette },
  { key: "perfil", label: "Meu Perfil", icon: User },
];

const Index = () => {
  const {
    properties, brand, selectedProperty, setSelectedProperty,
    presentationMode, setPresentationMode, setSelectedPhotos,
    loading, activeExport, setActiveExport, lastFeedUpdate,
  } = useApp();

  const { user, profile, signOut, isAdmin, loading: authLoading } = useAuth();
  const [view, setView] = useState<ActiveView>("catalogo");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closePresentation = () => {
    setSelectedProperty(null);
    setPresentationMode(null);
    setSelectedPhotos([]);
  };

  const navigateTo = (v: ActiveView) => {
    setView(v);
    setMenuOpen(false);
  };

  const isMainView = view === "catalogo";

  // Gate: enquanto auth carrega, mostra splash.
  // Sem usuário, mostra login criativo (sem catálogo, sem header).
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08090a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/40 text-sm">
          <Sparkles className="w-4 h-4 animate-pulse text-[#d4a843]" />
          Preparando o set...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* ── Top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 glass-strong flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            className="w-10 h-10 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <button onClick={() => navigateTo("catalogo")} className="flex items-center hover:opacity-80 transition-opacity">
            <BrandMark size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          {properties.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-bold text-foreground text-base">{properties.length}</span> imóveis
              {lastFeedUpdate && (
                <span className="text-xs opacity-60 hidden sm:inline">
                  · {lastFeedUpdate.toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          )}
          {user && profile?.foto_url && (
            <button onClick={() => navigateTo("perfil")} className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30 hover:border-primary/60 transition-colors">
              <img src={profile.foto_url} alt="" className="w-full h-full object-cover" />
            </button>
          )}
          {!user && (
            <Button variant="ghost" size="sm" onClick={() => navigateTo("perfil")} className="gap-1.5">
              <User className="w-4 h-4" /> Login
            </Button>
          )}
        </div>
      </header>

      {/* ── Slide-out menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border shadow-xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <BrandMark size="sm" />
                <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <nav className="flex-1 p-3 space-y-1">
                {[
                  ...NAV_ITEMS,
                  ...(isAdmin
                    ? [{ key: "usuarios" as ActiveView, label: "Usuários", icon: UsersIcon }]
                    : []),
                ].map((item) => {
                  const isActive = view === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => navigateTo(item.key)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-border space-y-3">
                {user && (
                  <div className="flex items-center gap-2">
                    {profile?.foto_url && <img src={profile.foto_url} alt="" className="w-8 h-8 rounded-full object-cover border border-primary/20" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium truncate">{profile?.nome || user.email}</p>
                      {profile?.creci && <p className="text-[9px] text-muted-foreground">CRECI {profile.creci}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={signOut} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground text-center opacity-60">
                  Conteúdo imobiliário em escala
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-20 pb-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-border"
            >
              <Sparkles className="w-7 h-7 text-primary" />
            </motion.div>
            <p className="text-muted-foreground text-sm">Carregando imóveis...</p>
          </div>
        ) : properties.length === 0 ? (
          /* ── Empty state — hero ── */
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6 max-w-xl"
            >
              <div className="flex justify-center"><BrandMark size="xl" /></div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                STUDIO
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Crie <span className="text-foreground font-semibold">vídeos</span>, <span className="text-foreground font-semibold">artes</span> e <span className="text-foreground font-semibold">legendas</span> profissionais para seus imóveis
              </p>
              <Button
                onClick={() => navigate("/demo")}
                size="lg"
                className="gap-2 h-14 px-8 text-base font-bold uppercase tracking-wider"
              >
                <PlayCircle className="w-5 h-5" /> Ver demonstração
              </Button>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {[
                  { icon: Video, label: "Vídeos", color: "text-primary" },
                  { icon: ImageIcon, label: "Artes", color: "text-secondary" },
                  { icon: FileText, label: "Legendas", color: "text-blue-400" },
                ].map((f, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-3 text-center space-y-1.5 shadow-sm">
                    <f.icon className={`w-5 h-5 mx-auto ${f.color}`} />
                    <p className="text-xs font-semibold text-foreground">{f.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-full max-w-lg">
              <JsonImporter />
            </motion.div>
          </div>
        ) : (
          <>
            {isMainView && (
              <>
                {/* Hero banner above grid */}
                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <BrandMark size="lg" showText={false} />
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                        STUDIO
                      </h1>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        Vídeos, artes e legendas profissionais para seus imóveis
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { icon: Video, label: "Vídeos", color: "bg-primary/10 text-primary border-primary/20" },
                      { icon: ImageIcon, label: "Artes", color: "bg-secondary/10 text-secondary border-secondary/20" },
                      { icon: FileText, label: "Legendas", color: "bg-blue-50 text-blue-600 border-blue-200" },
                    ].map((f, i) => (
                      <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${f.color}`}>
                        <f.icon className="w-3.5 h-3.5" />
                        {f.label}
                      </div>
                    ))}
                  </div>
                </div>
                <PropertyGrid />
              </>
            )}
            {view === "importar" && <JsonImporter />}
            {view === "marca" && <BrandConfig />}
            {view === "perfil" && (
              user ? <AgentProfileEditor onClose={() => setView("catalogo")} /> : <AuthPage />
            )}
            {view === "usuarios" && isAdmin && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <AdminUsers onClose={() => setView("catalogo")} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Presentation Modals */}
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

export default Index;

import React, { useState, useMemo, useCallback } from "react";
import { Property, PresentationMode } from "@/types/property";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Film, Layout, SlidersHorizontal, X, Search, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailModal from "@/components/PropertyDetailModal";

const formatPriceShort = (price: number) => {
  if (price >= 1_000_000) return `R$ ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `R$ ${(price / 1_000).toFixed(0)}k`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
};

const PropertyGrid = () => {
  const { properties, setSelectedProperty, setPresentationMode, setSelectedPhotos } = useApp();
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [bairroFilter, setBairroFilter] = useState<string>("todos");
  const [condominioFilter, setCondominioFilter] = useState<string>("todos");
  const [quartosFilter, setQuartosFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // Selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const pricesWithValue = properties.filter(p => p.preco > 0).map(p => p.preco);
  const minPrice = pricesWithValue.length > 0 ? Math.min(...pricesWithValue) : 0;
  const maxPrice = pricesWithValue.length > 0 ? Math.max(...pricesWithValue) : 1_000_000;
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice || 1_000_000]);

  const tipos = useMemo(() => {
    const set = new Set(properties.map(p => p.tipo));
    return Array.from(set).sort();
  }, [properties]);

  const bairros = useMemo(() => {
    const set = new Set(properties.map(p => p.bairro).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  const condominios = useMemo(() => {
    const set = new Set(properties.map(p => p.condominio).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  const quartosOptions = useMemo(() => {
    const set = new Set(properties.filter(p => p.quartos > 0).map(p => p.quartos));
    return Array.from(set).sort((a, b) => a - b);
  }, [properties]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const isIdSearch = q.length > 0 && /^\d+$/.test(q);

    return properties.filter(p => {
      // For ID searches, skip all other filters — just match ID
      if (isIdSearch) {
        const idNum = p.id.replace(/^[a-zA-Z]-/, "");
        return idNum.includes(q) || p.id.includes(q);
      }

      if (tipoFilter !== "todos" && p.tipo !== tipoFilter) return false;
      if (bairroFilter !== "todos" && p.bairro !== bairroFilter) return false;
      if (condominioFilter !== "todos" && p.condominio !== condominioFilter) return false;
      if (quartosFilter !== "todos" && p.quartos !== Number(quartosFilter)) return false;
      if (p.preco > 0 && (p.preco < priceRange[0] || p.preco > priceRange[1])) return false;
      if (q) {
        if (
          !p.titulo.toLowerCase().includes(q) &&
          !p.bairro.toLowerCase().includes(q) &&
          !p.endereco.toLowerCase().includes(q) &&
          !(p.condominio || "").toLowerCase().includes(q) &&
          !p.id.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [properties, tipoFilter, bairroFilter, condominioFilter, quartosFilter, priceRange, searchQuery]);

  const paginatedProperties = useMemo(() => filtered.slice(0, page * PER_PAGE), [filtered, page]);

  const hasActiveFilters = tipoFilter !== "todos" || bairroFilter !== "todos" || condominioFilter !== "todos" || quartosFilter !== "todos" || priceRange[0] > 0 || priceRange[1] < (maxPrice || 1_000_000) || searchQuery.length > 0;

  const clearFilters = () => {
    setTipoFilter("todos");
    setBairroFilter("todos");
    setCondominioFilter("todos");
    setQuartosFilter("todos");
    setPriceRange([0, maxPrice || 1_000_000]);
    setSearchQuery("");
    setPage(1);
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filtered.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const generateForSelected = () => {
    const selected = properties.filter(p => selectedIds.has(p.id));
    if (selected.length > 0) {
      // Open detail modal so user can curate photos before presenting/exporting
      setDetailProperty(selected[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-2xl font-bold">{filtered.length} Imóveis</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                placeholder="Buscar por nome, ID, bairro..."
                className="pl-9 w-48 h-9 bg-background text-sm"
              />
            </div>
            <Button size="sm" onClick={() => setPage(1)} className="gap-1.5 h-9">
              <Search className="w-4 h-4" /> Buscar
            </Button>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
              <X className="w-4 h-4" /> Limpar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </Button>
          <Button
            variant={selectionMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
            className="gap-2"
          >
            {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            {selectionMode ? "Selecionando" : "Selecionar"}
          </Button>
        </div>
      </div>

      {/* Selection actions bar */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-strong rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 border border-primary/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">
                <span className="text-primary font-bold">{selectedIds.size}</span> selecionado{selectedIds.size !== 1 ? "s" : ""}
              </span>
              <Button variant="ghost" size="sm" onClick={selectAllFiltered} className="text-xs">
                Selecionar todos ({filtered.length})
              </Button>
              {selectedIds.size > 0 && (
                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs text-muted-foreground">
                  Limpar seleção
                </Button>
              )}
            </div>
            {selectedIds.size > 0 && (
              <Button size="sm" onClick={() => generateForSelected()} className="gap-1.5 bg-primary hover:bg-primary/90">
                <Play className="w-3.5 h-3.5" /> Gerar Vídeo ({selectedIds.size})
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tipo</label>
            <Select value={tipoFilter} onValueChange={(v) => { setTipoFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tipos.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bairro</label>
            <Select value={bairroFilter} onValueChange={(v) => { setBairroFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Todos os bairros" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                <SelectItem value="todos">Todos os bairros</SelectItem>
                {bairros.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Condomínio</label>
            <Select value={condominioFilter} onValueChange={(v) => { setCondominioFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Todos os condomínios" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                <SelectItem value="todos">Todos os condomínios</SelectItem>
                {condominios.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quartos</label>
            <Select value={quartosFilter} onValueChange={(v) => { setQuartosFilter(v); setPage(1); }}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                <SelectItem value="todos">Todos</SelectItem>
                {quartosOptions.map(q => <SelectItem key={q} value={String(q)}>{q} {q === 1 ? "quarto" : "quartos"}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {pricesWithValue.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Preço: {formatPriceShort(priceRange[0])} — {formatPriceShort(priceRange[1])}
              </label>
              <Slider
                min={0}
                max={maxPrice || 1_000_000}
                step={10_000}
                value={priceRange}
                onValueChange={(v) => { setPriceRange(v as [number, number]); setPage(1); }}
                className="mt-3"
              />
            </div>
          )}
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {paginatedProperties.map((p, i) => (
          <PropertyCard
            key={p.id}
            property={p}
            index={i}
            selectionMode={selectionMode}
            isSelected={selectedIds.has(p.id)}
            onToggleSelect={toggleSelect}
            onOpenDetail={setDetailProperty}
          />
        ))}
      </div>

      {paginatedProperties.length < filtered.length && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => setPage(p => p + 1)} className="gap-2">
            Carregar mais ({filtered.length - paginatedProperties.length} restantes)
          </Button>
        </div>
      )}

      {filtered.length === 0 && properties.length > 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Nenhum imóvel encontrado com esses filtros.</p>
          <Button variant="link" onClick={clearFilters}>Limpar filtros</Button>
        </div>
      )}

      {/* Detail modal */}
      <AnimatePresence>
        {detailProperty && (
          <PropertyDetailModal
            property={detailProperty}
            onClose={() => setDetailProperty(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyGrid;

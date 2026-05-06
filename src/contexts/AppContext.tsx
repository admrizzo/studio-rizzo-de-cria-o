import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Property, BrandConfig, PresentationMode, defaultVideoDisplay } from "@/types/property";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { parseCRMFeed } from "@/utils/feedParser";

export interface ActiveExport {
  property: Property;
  brand: BrandConfig;
  photos: string[];
}

interface AppState {
  properties: Property[];
  setProperties: (p: Property[]) => void;
  brand: BrandConfig;
  setBrand: (b: BrandConfig | ((prev: BrandConfig) => BrandConfig)) => void;
  selectedProperty: Property | null;
  setSelectedProperty: (p: Property | null) => void;
  presentationMode: PresentationMode | null;
  setPresentationMode: (m: PresentationMode | null) => void;
  selectedPhotos: string[];
  setSelectedPhotos: (p: string[]) => void;
  curatedPhotosMap: Record<string, string[]>;
  setCuratedPhotos: (propertyId: string, photos: string[]) => void;
  loading: boolean;
  lastFeedUpdate: Date | null;
  refreshFeed: () => Promise<void>;
  activeExport: ActiveExport | null;
  setActiveExport: (e: ActiveExport | null) => void;
}

const defaultBrand: BrandConfig = {
  nome: "",
  contato: "",
  whatsapp: "",
  logoUrl: null,
  corPrimaria: "#39FF14",
  corSecundaria: "#ec5a8a",
  videoDisplay: { ...defaultVideoDisplay },
  slideSpeed: "normal",
  feedUrl: "",
};

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

const loadBrandFromStorage = (): BrandConfig => {
  try {
    const saved = localStorage.getItem("sgflix-brand");
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        nome: "nome" in parsed ? parsed.nome : defaultBrand.nome,
        contato: "contato" in parsed ? parsed.contato : defaultBrand.contato,
        whatsapp: "whatsapp" in parsed ? parsed.whatsapp : defaultBrand.whatsapp,
        logoUrl: "logoUrl" in parsed ? parsed.logoUrl : defaultBrand.logoUrl,
        corPrimaria: "corPrimaria" in parsed ? parsed.corPrimaria : defaultBrand.corPrimaria,
        corSecundaria: "corSecundaria" in parsed ? parsed.corSecundaria : defaultBrand.corSecundaria,
        videoDisplay: parsed.videoDisplay ? { ...defaultVideoDisplay, ...parsed.videoDisplay } : { ...defaultVideoDisplay },
        slideSpeed: parsed.slideSpeed || defaultBrand.slideSpeed,
        feedUrl: "feedUrl" in parsed ? parsed.feedUrl : "",
      };
    }
  } catch {}
  return defaultBrand;
};

const CACHE_KEY = "sgflix-feed-cache";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface FeedCache {
  properties: Property[];
  clientName: string;
  total: number;
  timestamp: number;
}

const loadCachedFeed = (): FeedCache | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FeedCache;
  } catch {
    return null;
  }
};

const saveFeedCache = (data: FeedCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full — clear feed cache (brand is more important) and retry
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Still fails — skip caching, brand data is preserved
      console.warn("[Feed] Could not cache feed — localStorage full. Brand config preserved.");
    }
  }
};

const isCacheStale = (cache: FeedCache): boolean => {
  return Date.now() - cache.timestamp > CACHE_TTL;
};

export const AppProvider = ({ children, demo = false }: { children: ReactNode; demo?: boolean }) => {
  const [properties, setPropertiesRaw] = useState<Property[]>([]);
  
  // Always sort properties by ID descending (newest first)
  const setProperties = (p: Property[]) => {
    const sorted = [...p].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ""), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ""), 10) || 0;
      return numB - numA;
    });
    setPropertiesRaw(sorted);
  };
  const [brand, setBrandState] = useState<BrandConfig>(loadBrandFromStorage);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [presentationMode, setPresentationMode] = useState<PresentationMode | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [curatedPhotosMap, setCuratedPhotosMap] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastFeedUpdate, setLastFeedUpdate] = useState<Date | null>(null);
  const [activeExport, setActiveExport] = useState<ActiveExport | null>(null);

  const setCuratedPhotos = (propertyId: string, photos: string[]) => {
    setCuratedPhotosMap(prev => ({ ...prev, [propertyId]: photos }));
  };

  const setBrand = (b: BrandConfig | ((prev: BrandConfig) => BrandConfig)) => {
    setBrandState(prev => {
      const next = typeof b === 'function' ? b(prev) : b;
      try {
        const json = JSON.stringify(next);
        localStorage.setItem("sgflix-brand", json);
        console.log("[Brand] Saved to localStorage:", json.length, "chars");
      } catch (err) {
        console.error("[Brand] localStorage save failed:", err);
        // If it's a quota error, try saving without the logo
        try {
          const slim = { ...next, logoUrl: null };
          localStorage.setItem("sgflix-brand", JSON.stringify(slim));
          console.warn("[Brand] Saved without logo (storage full)");
        } catch {
          console.error("[Brand] Could not save brand at all");
        }
      }
      return next;
    });
  };

  const fetchFeedFromAPI = async (urlOverride?: string): Promise<FeedCache | null> => {
    const feedUrl = urlOverride || brand.feedUrl;
    if (!feedUrl) return null;
    try {
      const { data, error } = await supabase.functions.invoke("fetch-feed", {
        body: { url: feedUrl },
      });
      if (error) throw error;
      const parsed = parseCRMFeed(data);
      if (parsed.properties.length) {
        const cache: FeedCache = {
          properties: parsed.properties,
          clientName: parsed.clientName,
          total: parsed.total,
          timestamp: Date.now(),
        };
        saveFeedCache(cache);
        return cache;
      }
    } catch (err) {
      console.error("Failed to fetch feed from API:", err);
    }
    return null;
  };

  const refreshFeed = async () => {
    if (!brand.feedUrl) {
      toast("Configure o feed do seu CRM em Configurações.");
      return;
    }
    const result = await fetchFeedFromAPI();
    if (result) {
      setProperties(result.properties);
      setLastFeedUpdate(new Date(result.timestamp));
      toast.success(`Catálogo atualizado! ${result.total} imóveis.`);
    }
  };

  useEffect(() => {
    if (demo) {
      setLoading(false);
      return;
    }
    const userHasCustomBrand = !!localStorage.getItem("sgflix-brand");
    const loadFeed = async () => {
      const cached = loadCachedFeed();
      if (cached?.properties?.length) {
        setProperties(cached.properties);
        setLastFeedUpdate(new Date(cached.timestamp));
        setLoading(false);
        if (!userHasCustomBrand) {
          setBrand(prev => ({ ...prev, nome: cached.clientName }));
        }
        if (isCacheStale(cached) && brand.feedUrl) {
          const fresh = await fetchFeedFromAPI();
          if (fresh) {
            setProperties(fresh.properties);
            setLastFeedUpdate(new Date(fresh.timestamp));
          }
        }
        return;
      }
      try {
        if (brand.feedUrl) {
          const result = await fetchFeedFromAPI();
          if (result) {
            setProperties(result.properties);
            setLastFeedUpdate(new Date(result.timestamp));
            if (!userHasCustomBrand) {
              setBrand(prev => ({ ...prev, nome: result.clientName }));
            }
          }
        }
      } catch (err) {
        console.error("Failed to load feed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  return (
    <AppContext.Provider
      value={{
        properties, setProperties,
        brand, setBrand,
        selectedProperty, setSelectedProperty,
        presentationMode, setPresentationMode,
        selectedPhotos, setSelectedPhotos,
        curatedPhotosMap, setCuratedPhotos,
        loading,
        lastFeedUpdate,
        refreshFeed,
        activeExport, setActiveExport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

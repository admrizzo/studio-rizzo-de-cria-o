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

  const fetchBrandFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("studio_brand_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (data && !error) {
        const mappedBrand: BrandConfig = {
          nome: data.nome || "",
          contato: data.contato || "",
          whatsapp: data.whatsapp || "",
          logoUrl: data.logo_url || null,
          corPrimaria: data.cor_primaria || "#39FF14",
          corSecundaria: data.cor_secundaria || "#ec5a8a",
          videoDisplay: data.video_display ? { ...defaultVideoDisplay, ...(data.video_display as any) } : { ...defaultVideoDisplay },
          slideSpeed: (data.slide_speed as "slow" | "normal" | "fast") || "normal",
          feedUrl: data.feed_url || "",
        };
        setBrandState(mappedBrand);
        localStorage.setItem("sgflix-brand", JSON.stringify(mappedBrand));
      }
    } catch (err) {
      console.error("Error fetching brand from DB:", err);
    }
  };

  const setBrand = (b: BrandConfig | ((prev: BrandConfig) => BrandConfig)) => {
    setBrandState(prev => {
      const next = typeof b === 'function' ? b(prev) : b;
      
      // Save to localStorage as fallback
      try {
        localStorage.setItem("sgflix-brand", JSON.stringify(next));
      } catch (err) {
        console.error("[Brand] localStorage save failed:", err);
      }

      // Save to DB (async)
      const saveToDB = async () => {
        try {
          const { data: existing } = await supabase.from("studio_brand_settings").select("id").limit(1).maybeSingle();
          const dbData: any = {
            nome: next.nome,
            contato: next.contato,
            whatsapp: next.whatsapp,
            logo_url: next.logoUrl,
            cor_primaria: next.corPrimaria,
            cor_secundaria: next.corSecundaria,
            video_display: next.videoDisplay,
            slide_speed: next.slideSpeed,
            feed_url: next.feedUrl,
          };

          if (existing) {
            await supabase.from("studio_brand_settings").update(dbData).eq("id", existing.id);
          } else {
            await supabase.from("studio_brand_settings").insert([dbData]);
          }
        } catch (err) {
          console.error("Error saving brand to DB:", err);
        }
      };
      
      if (!demo) saveToDB();
      
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
      toast.error("Erro ao carregar feed. Verifique a URL nas configurações.");
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
    fetchBrandFromDB();
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

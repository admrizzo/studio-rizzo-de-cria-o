import { Property } from "@/types/property";

interface RobustCRMImage {
  legenda: string | null;
  url: {
    full: string;
    small: string;
    mini: string;
  };
}

interface RobustCRMEndereco {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude?: string;
  longitude?: string;
}

interface RobustCRMUnidade {
  id: number;
  index: number;
  titulo?: string;
  tipo?: string;
  subtipo?: string;
  destinacao?: string;
  area_privativa?: number;
  area_total?: number;
  dormitorios?: number;
  suites?: number;
  banheiros?: number;
  vagas_garagem?: number;
  valor_venda?: number;
  valor_locacao?: number;
  descricao?: string;
  media?: { imagens?: RobustCRMImage[] };
  condominio?: {
    id: number;
    nome: string;
    endereco?: RobustCRMEndereco;
    media?: { imagens?: RobustCRMImage[] };
  };
  endereco?: RobustCRMEndereco;
  exibicao?: string;
  situacao?: string;
}

interface RobustCRMCondominio {
  id: number;
  index: number;
  nome?: string;
  descricao?: string;
  destinacao?: string;
  endereco?: RobustCRMEndereco;
  media?: { imagens?: RobustCRMImage[] };
  area_lazer?: string[];
  estagio?: string;
}

interface RobustCRMFeed {
  client: string;
  data: {
    condominios?: { items: RobustCRMCondominio[] };
    unidades?: { items: RobustCRMUnidade[] };
  };
}

const extractPhotos = (media?: { imagens?: RobustCRMImage[] }): string[] => {
  if (!media?.imagens?.length) return [];
  return media.imagens
    .map((img) => img.url?.full || img.url?.small || "")
    .filter(Boolean);
};

const formatAddress = (end?: RobustCRMEndereco): string => {
  if (!end) return "";
  return [end.logradouro, end.numero].filter(Boolean).join(", ");
};

export const parseRobustCRMFeed = (data: any): { properties: Property[]; clientName: string } => {
  const feed = data as RobustCRMFeed;
  const clientName = feed.client || "Imobiliária";
  const properties: Property[] = [];

  // Parse unidades (individual units — main property listings)
  if (feed.data?.unidades?.items?.length) {
    feed.data.unidades.items.forEach((unit, i) => {
      const endereco = unit.endereco || unit.condominio?.endereco;
      const fotos = extractPhotos(unit.media);
      // Fallback to condominium photos if unit has none
      const condoFotos = unit.condominio ? extractPhotos(unit.condominio.media) : [];
      const allFotos = fotos.length > 0 ? fotos : condoFotos;
      
      if (allFotos.length === 0) return; // Skip items without photos

      const titulo = unit.titulo || 
        [unit.subtipo || unit.tipo, unit.condominio?.nome, endereco?.bairro]
          .filter(Boolean).join(" - ") || 
        `Imóvel #${unit.id}`;

      properties.push({
        id: `u-${unit.id}`,
        titulo,
        tipo: unit.subtipo || unit.tipo || "Imóvel",
        preco: unit.valor_venda || unit.valor_locacao || 0,
        endereco: formatAddress(endereco),
        bairro: endereco?.bairro || "",
        cidade: endereco?.cidade || "",
        estado: endereco?.estado || "",
        area: unit.area_privativa || unit.area_total || 0,
        quartos: unit.dormitorios || 0,
        banheiros: (unit.suites || 0) + (unit.banheiros || 0),
        vagas: unit.vagas_garagem || 0,
        descricao: unit.descricao || "",
        fotos: allFotos,
        destaque: unit.exibicao === "destaque",
        condominio: unit.condominio?.nome || undefined,
        suites: unit.suites || 0,
        valorVenda: unit.valor_venda || 0,
        valorLocacao: unit.valor_locacao || 0,
        situacao: unit.situacao || undefined,
        destinacao: unit.destinacao || undefined,
      });
    });
  }

  // If no units, parse condominios as fallback
  if (properties.length === 0 && feed.data?.condominios?.items?.length) {
    feed.data.condominios.items.forEach((condo) => {
      const fotos = extractPhotos(condo.media);
      if (fotos.length === 0) return;

      properties.push({
        id: `c-${condo.id}`,
        titulo: condo.nome || `Condomínio #${condo.id}`,
        tipo: condo.destinacao || "Condomínio",
        preco: 0,
        endereco: formatAddress(condo.endereco),
        bairro: condo.endereco?.bairro || "",
        cidade: condo.endereco?.cidade || "",
        estado: condo.endereco?.estado || "",
        area: 0,
        quartos: 0,
        banheiros: 0,
        vagas: 0,
        descricao: condo.descricao || (condo.area_lazer?.join(", ") || ""),
        fotos,
        destaque: false,
      });
    });
  }

  return { properties, clientName };
};

export const isRobustCRMFeed = (data: any): boolean => {
  return data && typeof data === "object" && "client" in data && "data" in data;
};

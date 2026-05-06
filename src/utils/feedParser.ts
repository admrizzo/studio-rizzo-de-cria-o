import { Property } from "@/types/property";

interface CRMImage {
  legenda: string | null;
  url: { full: string; small: string; mini: string };
}

const MAX_PHOTOS = 12;

const isPlanta = (img: CRMImage): boolean => {
  const l = (img.legenda || "").toLowerCase();
  const u = (img.url?.full || img.url?.small || "").toLowerCase();
  return l.includes("planta") || u.includes("planta");
};

const extractPhotos = (media?: { imagens?: CRMImage[] }): { full: string[]; small: string[] } => {
  if (!media?.imagens?.length) return { full: [], small: [] };
  const full: string[] = [];
  const small: string[] = [];
  for (const img of media.imagens) {
    if (full.length >= MAX_PHOTOS) break;
    if (isPlanta(img)) continue;
    const f = img.url?.full || img.url?.small || "";
    const s = img.url?.small || img.url?.full || "";
    if (f) full.push(f);
    if (s) small.push(s);
  }
  return { full, small };
};

const getNum = (v: any): number => {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "valor" in v) return Number(v.valor) || 0;
  if (v && typeof v === "object") {
    let sum = 0;
    for (const val of Object.values(v)) sum += Number(val) || 0;
    return sum;
  }
  return Number(v) || 0;
};

export interface ParsedFeed {
  clientName: string;
  properties: Property[];
  total: number;
}

export function parseCRMFeed(feed: any): ParsedFeed {
  const clientName = feed.client || "Imobiliária";
  const imoveis = feed.data?.imoveis?.items || feed.data?.unidades?.items || [];
  const rawCondos = feed.data?.condominios?.items || [];

  // Build lightweight condo map
  const condoMap = new Map<number, { nome: string; photos: { full: string[]; small: string[] }; endereco: any }>();
  for (const c of rawCondos) {
    condoMap.set(c.id, {
      nome: c.nome || "",
      photos: extractPhotos(c.media),
      endereco: c.endereco,
    });
  }

  const properties: Property[] = [];

  for (const unit of imoveis) {
    // Skip archived (status=2) or hidden properties
    if (unit.status === 2) continue;
    if (unit.exibicao === "nao_exibir") continue;

    const condoId = typeof unit.condominio === "number" ? unit.condominio : (unit.condominio?.id || null);
    const fullCondo = condoId ? condoMap.get(condoId) : null;
    const condoObj = typeof unit.condominio === "object" && unit.condominio ? unit.condominio : null;

    const endereco = unit.endereco || condoObj?.endereco || fullCondo?.endereco;
    const unitPhotos = extractPhotos(unit.media);

    let condoPhotos = { full: [] as string[], small: [] as string[] };
    let condoName = "";
    if (condoObj) {
      condoPhotos = extractPhotos(condoObj.media);
      condoName = condoObj.nome || "";
    }
    if (fullCondo) {
      if (condoPhotos.full.length === 0) condoPhotos = fullCondo.photos;
      condoName = condoName || fullCondo.nome;
    }

    const allFull = [...condoPhotos.full, ...unitPhotos.full];
    const allSmall = [...condoPhotos.small, ...unitPhotos.small];

    if (allFull.length === 0) continue;

    const area = unit.areas?.area_privativa || unit.areas?.area_total || unit.area_privativa || unit.area_total || 0;
    const vVenda = getNum(unit.valor_venda);
    const vLocacao = getNum(unit.valor_locacao);
    const endStr = endereco ? [endereco.logradouro, endereco.numero].filter(Boolean).join(", ") : "";

    const titulo = unit.titulo ||
      [unit.tipo, condoName, endereco?.bairro].filter(Boolean).join(" - ") ||
      `Imóvel #${unit.id}`;

    properties.push({
      id: `u-${unit.id}`,
      titulo,
      tipo: unit.tipo || "Imóvel",
      preco: vVenda || vLocacao || 0,
      endereco: endStr,
      bairro: endereco?.bairro || "",
      cidade: endereco?.cidade || "",
      estado: endereco?.estado || "",
      area,
      quartos: getNum(unit.quartos) || getNum(unit.dormitorios) || 0,
      banheiros: getNum(unit.suites) + getNum(unit.banheiros),
      vagas: getNum(unit.vagas) || getNum(unit.vagas_garagem) || 0,
      descricao: "",
      fotos: allFull,
      fotosSmall: allSmall,
      destaque: unit.exibicao === "destaque",
      suites: getNum(unit.suites),
      valorVenda: vVenda,
      valorLocacao: vLocacao,
      situacao: unit.situacao || "",
      condominio: condoName,
      destinacao: unit.destinacao || "",
      hasUnitPhotos: unitPhotos.full.length > 0,
    } as Property);
  }

  // Sort by ID descending (newest first)
  properties.sort((a, b) => {
    const idA = parseInt(a.id.replace(/^u-/, ""), 10) || 0;
    const idB = parseInt(b.id.replace(/^u-/, ""), 10) || 0;
    return idB - idA;
  });

  return { clientName, properties, total: properties.length };
}

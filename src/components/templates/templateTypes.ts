import { Property, BrandConfig } from "@/types/property";
import { AgentProfile } from "@/contexts/AuthContext";

export interface TemplateProps {
  property: Property;
  brand: BrandConfig;
  agent?: AgentProfile | null;
  photoUrl: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  category: "luxo" | "moderno" | "vibrante" | "editorial" | "bairro" | "preco" | "area" | "condominio";
  format: "stories" | "post";
  component: React.FC<TemplateProps>;
  /** What this template highlights */
  focus?: "bairro" | "preco" | "area" | "condominio" | "geral" | "corretor";
}

export const formatPrice = (price: number): string => {
  if (!price) return "";
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
};

export const formatArea = (area: number): string => {
  if (!area) return "";
  return `${area}m²`;
};

export const getPropertyId = (id: string): string => {
  return id.replace(/^u-/, "");
};

/** Remove "Juiz de Fora" e variantes do bairro — só mostra o nome do bairro */
export const cleanBairro = (bairro: string): string => {
  if (!bairro) return "";
  return bairro
    .replace(/[,\-–—]\s*Juiz de Fora.*/i, "")
    .replace(/Juiz de Fora[,\-–—\s]*/i, "")
    .replace(/\s*\/\s*Juiz de Fora.*/i, "")
    .trim();
};

/** Build stats array from property — inclui banheiros */
/** Os 3 stats mais importantes: quartos, suítes, vagas */
export const buildStats = (property: { quartos: number; suites?: number; banheiros: number; area: number; vagas: number }) => {
  const stats: { value: number; label: string }[] = [];
  if (property.quartos > 0) stats.push({ value: property.quartos, label: "quartos" });
  if ((property.suites ?? 0) > 0) stats.push({ value: property.suites!, label: "suítes" });
  if (property.vagas > 0) stats.push({ value: property.vagas, label: "vagas" });
  return stats;
};

/** Detecta destinação real a partir dos valores do JSON */
export const getDestinacao = (property: Property): string => {
  if ((property.valorLocacao ?? 0) > 0 && (property.valorVenda ?? 0) === 0) return "LOCAÇÃO";
  if ((property.valorVenda ?? 0) > 0 && (property.valorLocacao ?? 0) === 0) return "VENDA";
  if ((property.valorVenda ?? 0) > 0 && (property.valorLocacao ?? 0) > 0) return "VENDA/LOCAÇÃO";
  return property.destinacao?.toUpperCase() || "À VENDA";
};

/** Calcula preço por m² para templates de investidor */
export const getPricePerSqm = (property: Property): string | null => {
  if (!property.preco || !property.area) return null;
  const ppm = Math.round(property.preco / property.area);
  return ppm.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
};

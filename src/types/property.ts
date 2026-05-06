export interface Property {
  id: string;
  titulo: string;
  tipo: string;
  preco: number;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  descricao: string;
  fotos: string[];
  fotosSmall?: string[];
  destaque?: boolean;
  condominio?: string;
  destinacao?: string;
  suites?: number;
  valorVenda?: number;
  valorLocacao?: number;
  situacao?: string;
}

export interface VideoDisplayConfig {
  showLogo: boolean;
  showBrandName: boolean;
  showPrice: boolean;
  showStats: boolean;
  showLocation: boolean;
  showAIPhrases: boolean;
  showContact: boolean;
  showProgressBar: boolean;
}

export const defaultVideoDisplay: VideoDisplayConfig = {
  showLogo: true,
  showBrandName: true,
  showPrice: true,
  showStats: true,
  showLocation: true,
  showAIPhrases: true,
  showContact: true,
  showProgressBar: true,
};

export interface BrandConfig {
  nome: string;
  contato: string;
  whatsapp: string;
  logoUrl: string | null;
  corPrimaria: string;
  corSecundaria: string;
  videoDisplay: VideoDisplayConfig;
  slideSpeed: "slow" | "normal" | "fast";
  feedUrl?: string;
}

export type PresentationMode = 'video';

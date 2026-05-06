import { Property } from "@/types/property";

// Stock images from unsplash for demo purposes (generic real estate, no real listings)
const IMG = {
  apt1: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  ],
  cobertura: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
  ],
  casa: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80",
    "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=1200&q=80",
  ],
  studio: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
  ],
  comercial: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80",
  ],
  loft: [
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=80",
  ],
  galpao: [
    "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1200&q=80",
    "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1200&q=80",
  ],
};

export const DEMO_PROPERTIES: Property[] = [
  {
    id: "1001", titulo: "APARTAMENTO 3 QUARTOS NO ITAIM", tipo: "Apartamento",
    preco: 1850000, endereco: "Rua Joaquim Floriano", bairro: "Itaim Bibi", cidade: "São Paulo", estado: "SP",
    area: 95, quartos: 3, suites: 1, banheiros: 2, vagas: 2, condominio: "Edifício Itaim Premium",
    descricao: "Apartamento moderno com vista panorâmica, totalmente reformado.",
    fotos: IMG.apt1, destaque: true, situacao: "venda", destinacao: "residencial",
  },
  {
    id: "1002", titulo: "COBERTURA DUPLEX EM COPACABANA", tipo: "Cobertura",
    preco: 4200000, endereco: "Av. Atlântica", bairro: "Copacabana", cidade: "Rio de Janeiro", estado: "RJ",
    area: 240, quartos: 4, suites: 2, banheiros: 4, vagas: 3,
    descricao: "Cobertura duplex com terraço, piscina privativa e vista para o mar.",
    fotos: IMG.cobertura, destaque: true, situacao: "venda", destinacao: "residencial",
  },
  {
    id: "1003", titulo: "CASA TÉRREA NO BOQUEIRÃO", tipo: "Casa",
    preco: 890000, endereco: "Rua Marechal Deodoro", bairro: "Boqueirão", cidade: "Curitiba", estado: "PR",
    area: 180, quartos: 3, suites: 1, banheiros: 3, vagas: 2,
    descricao: "Casa térrea espaçosa com quintal amplo e área gourmet.",
    fotos: IMG.casa, situacao: "venda", destinacao: "residencial",
  },
  {
    id: "1004", titulo: "STUDIO MOBILIADO EM PINHEIROS", tipo: "Studio",
    preco: 0, valorLocacao: 3200, endereco: "Rua dos Pinheiros", bairro: "Pinheiros", cidade: "São Paulo", estado: "SP",
    area: 38, quartos: 1, banheiros: 1, vagas: 1,
    descricao: "Studio totalmente mobiliado, pronto para morar, próximo ao metrô.",
    fotos: IMG.studio, situacao: "locacao", destinacao: "residencial",
  },
  {
    id: "1005", titulo: "SALA COMERCIAL NA FARIA LIMA", tipo: "Sala Comercial",
    preco: 2100000, endereco: "Av. Brigadeiro Faria Lima", bairro: "Itaim Bibi", cidade: "São Paulo", estado: "SP",
    area: 75, quartos: 0, banheiros: 2, vagas: 1,
    descricao: "Sala comercial em prédio AAA, andar alto, vista privilegiada.",
    fotos: IMG.comercial, situacao: "venda", destinacao: "comercial",
  },
  {
    id: "1006", titulo: "APARTAMENTO 2 QUARTOS NA SAVASSI", tipo: "Apartamento",
    preco: 720000, endereco: "Rua Antônio de Albuquerque", bairro: "Savassi", cidade: "Belo Horizonte", estado: "MG",
    area: 65, quartos: 2, suites: 1, banheiros: 2, vagas: 1,
    descricao: "Apartamento bem localizado na Savassi, próximo a bares e restaurantes.",
    fotos: IMG.apt1, situacao: "venda", destinacao: "residencial",
  },
  {
    id: "1007", titulo: "CASA EM CONDOMÍNIO EM ALPHAVILLE", tipo: "Casa",
    preco: 3500000, endereco: "Alameda das Acácias", bairro: "Alphaville", cidade: "Barueri", estado: "SP",
    area: 320, quartos: 4, suites: 3, banheiros: 5, vagas: 4, condominio: "Alphaville Residencial",
    descricao: "Casa em condomínio fechado com piscina, área gourmet e jardim.",
    fotos: IMG.casa, destaque: true, situacao: "venda", destinacao: "residencial",
  },
  {
    id: "1008", titulo: "LOFT EM MOINHOS DE VENTO", tipo: "Loft",
    preco: 0, valorLocacao: 4500, endereco: "Rua Padre Chagas", bairro: "Moinhos de Vento", cidade: "Porto Alegre", estado: "RS",
    area: 80, quartos: 1, banheiros: 1, vagas: 1,
    descricao: "Loft com pé direito alto, design contemporâneo em região nobre.",
    fotos: IMG.loft, situacao: "locacao", destinacao: "residencial",
  },
  {
    id: "1009", titulo: "APARTAMENTO 4 QUARTOS EM BOA VIAGEM", tipo: "Apartamento",
    preco: 1450000, endereco: "Av. Boa Viagem", bairro: "Boa Viagem", cidade: "Recife", estado: "PE",
    area: 180, quartos: 4, suites: 2, banheiros: 4, vagas: 2,
    descricao: "Apartamento amplo com vista para o mar, varanda gourmet.",
    fotos: IMG.apt1, situacao: "venda", destinacao: "residencial",
  },
  {
    id: "1010", titulo: "GALPÃO LOGÍSTICO EM SÃO JOSÉ DOS PINHAIS", tipo: "Galpão",
    preco: 0, valorLocacao: 18000, endereco: "Rod. BR-277", bairro: "Distrito Industrial", cidade: "São José dos Pinhais", estado: "PR",
    area: 600, quartos: 0, banheiros: 2, vagas: 6,
    descricao: "Galpão logístico com pé direito de 9m, doca de carga e descarga.",
    fotos: IMG.galpao, situacao: "locacao", destinacao: "comercial",
  },
];

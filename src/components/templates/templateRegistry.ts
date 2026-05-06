import { TemplateConfig } from "./templateTypes";
import { S1_PrecoImpacto, S2_Lifestyle, S3_Editorial, S4_Urgencia, S5_Moderno } from "./TemplatesSet1";
import { P1_HeroImovel, P2_PrecoDominante, P3_InformativoPremium, P4_Conceitual, P5_CorretorDestaque } from "./TemplatesSet2";
import { S6_DarkGold, S7_Glass, S8_SplitDiagonal, S10_Terracota, S11_FichaClean, P6_Investidor, P7_SplitClean, P8_LifestylePost, P9_UrgenciaPost, P10_RupturaPost } from "./TemplatesSet3";

export const allTemplates: TemplateConfig[] = [
  // ─── STORIES 9:16 ───
  { id: "s1",  name: "Preço Impacto",       category: "vibrante",  format: "stories", focus: "preco",    component: S1_PrecoImpacto },
  { id: "s2",  name: "Lifestyle",           category: "luxo",      format: "stories", focus: "geral",    component: S2_Lifestyle },
  { id: "s3",  name: "Editorial",           category: "editorial", format: "stories", focus: "geral",    component: S3_Editorial },
  { id: "s4",  name: "Urgência",            category: "vibrante",  format: "stories", focus: "preco",    component: S4_Urgencia },
  { id: "s5",  name: "Moderno",             category: "moderno",   format: "stories", focus: "geral",    component: S5_Moderno },
  { id: "s6",  name: "Dark Gold",           category: "luxo",      format: "stories", focus: "preco",    component: S6_DarkGold },
  { id: "s7",  name: "Glass Premium",       category: "luxo",      format: "stories", focus: "geral",    component: S7_Glass },
  { id: "s8",  name: "Split Diagonal",      category: "moderno",   format: "stories", focus: "geral",    component: S8_SplitDiagonal },
  
  { id: "s10", name: "Terracota",           category: "editorial", format: "stories", focus: "geral",    component: S10_Terracota },
  { id: "s11", name: "Ficha Clean",         category: "editorial", format: "stories", focus: "corretor", component: S11_FichaClean },

  // ─── POST 4:5 ───
  { id: "p1",  name: "Hero Imóvel",         category: "luxo",      format: "post",    focus: "geral",    component: P1_HeroImovel },
  { id: "p2",  name: "Preço Dominante",     category: "vibrante",  format: "post",    focus: "preco",    component: P2_PrecoDominante },
  { id: "p3",  name: "Informativo Premium", category: "editorial", format: "post",    focus: "geral",    component: P3_InformativoPremium },
  { id: "p4",  name: "Conceitual",          category: "luxo",      format: "post",    focus: "geral",    component: P4_Conceitual },
  { id: "p5",  name: "Corretor Destaque",   category: "editorial", format: "post",    focus: "corretor", component: P5_CorretorDestaque },
  { id: "p6",  name: "Investidor",          category: "moderno",   format: "post",    focus: "preco",    component: P6_Investidor },
  { id: "p7",  name: "Split Clean",         category: "editorial", format: "post",    focus: "geral",    component: P7_SplitClean },
  { id: "p8",  name: "Lifestyle Post",      category: "luxo",      format: "post",    focus: "geral",    component: P8_LifestylePost },
  { id: "p9",  name: "Urgência Post",       category: "vibrante",  format: "post",    focus: "preco",    component: P9_UrgenciaPost },
  { id: "p10", name: "Ruptura Post",        category: "moderno",   format: "post",    focus: "geral",    component: P10_RupturaPost },
];

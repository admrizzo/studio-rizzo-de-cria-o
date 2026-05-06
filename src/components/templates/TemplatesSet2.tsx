import React from "react";
import { TemplateProps, formatPrice, cleanBairro, getDestinacao } from "./templateTypes";
import { TemplateStat, getTemplateStats } from "./TemplateStat";
import { AgentSignature } from "./AgentSignature";
import { LuxuryFrame, DecorativeLine, DiamondAccent, GlassCard, Pill, NoiseOverlay, DotPattern, ArcDecor } from "./TemplateDecorations";

/* ═══ P1 · HERO SPLIT ═══
   Photo 60% left with rounded corners, data on dark teal right */
export const P1_HeroImovel: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const destinacao = getDestinacao(property);
  const stats = getTemplateStats(property);
  const teal = "#0b3d3d";
  const orange = "#f5922a";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: teal }}>
      {/* Left photo panel */}
      <div style={{ position: "absolute", top: 60, left: 60, bottom: 60, width: "52%", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)" }} />
        {/* Logo on photo */}
        <div style={{ position: "absolute", left: 30, top: 30 }}>
          {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 44, objectFit: "contain", filter: "brightness(10)", opacity: 0.85 }} />}
        </div>
      </div>

      {/* Right data panel */}
      <div style={{ position: "absolute", right: 60, top: 60, bottom: 60, left: "56%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {/* Destination badge */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pill bg={orange} fontSize={22}>{destinacao}</Pill>
        </div>

        {/* Title block */}
        <div>
          <DecorativeLine color="rgba(245,146,42,0.4)" width="60px" height={3} style={{ marginBottom: 20 }} />
          <h2 style={{ color: "white", fontSize: 48, fontWeight: 900, lineHeight: 1.08, margin: 0, textTransform: "uppercase" as const }}>{property.titulo}</h2>
          {property.condominio && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 28, fontWeight: 500, marginTop: 10 }}>{property.condominio}</p>}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
            <DiamondAccent size={8} color={orange} />
            <span style={{ color: orange, fontSize: 36, fontWeight: 700 }}>{bairro}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <TemplateStat {...s} color="#5bc5b8" numColor="white" labelColor="rgba(255,255,255,0.6)" />
            </div>
          ))}
        </div>

        {/* Price + agent */}
        <div>
          {property.preco > 0 && (
            <div style={{ background: orange, borderRadius: 16, padding: "16px 28px", textAlign: "center", marginBottom: 18, boxShadow: "0 6px 24px rgba(245,146,42,0.35)" }}>
              <span style={{ color: "white", fontSize: 56, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
            </div>
          )}
          <AgentSignature agent={agent} nameColor="white" creciColor="rgba(255,255,255,0.5)" borderColor="rgba(91,197,184,0.4)" badgeColor="#5bc5b8" photoSize={56} />
        </div>
      </div>
    </div>
  );
};

/* ═══ P2 · PREÇO STATEMENT ═══
   Giant price as central element, circular photo above, minimal layout */
export const P2_PrecoDominante: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const destinacao = getDestinacao(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#050505" }}>
      <NoiseOverlay opacity={0.03} />
      <DotPattern color="rgba(26,107,71,0.04)" spacing={60} dotSize={1.5} />

      {/* Top bar */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", opacity: 0.7 }} />}
        <Pill bg="transparent" color="rgba(255,255,255,0.4)" border="1px solid rgba(255,255,255,0.15)" fontSize={22}>{destinacao}</Pill>
      </div>

      {/* Circular photo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 180, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 320, height: 320, borderRadius: "50%", overflow: "hidden", border: `3px solid rgba(26,107,71,0.4)`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>

      {/* Price giant */}
      {property.preco > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center" }}>
          <span style={{ fontSize: 140, fontWeight: 900, color: "white", fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, letterSpacing: "0.02em" }}>{formatPrice(property.preco)}</span>
        </div>
      )}

      {/* Diamond separator */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
        <DecorativeLine color="rgba(26,107,71,0.4)" width="100px" height={1} />
        <DiamondAccent size={8} color={green} />
        <DecorativeLine color="rgba(26,107,71,0.4)" width="100px" height={1} />
      </div>

      {/* Title */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 740, textAlign: "center" }}>
        <h3 style={{ color: "white", fontSize: 48, fontWeight: 300, lineHeight: 1.1, textTransform: "uppercase" as const, margin: 0, letterSpacing: "0.06em" }}>{property.titulo}</h3>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 36, fontWeight: 700, marginTop: 14 }}>{bairro}</p>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 28, fontWeight: 500, marginTop: 8 }}>{property.condominio}</p>}
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 220, display: "flex", justifyContent: "center", gap: 40 }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={green} numColor="white" labelColor="rgba(255,255,255,0.5)" />)}
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 80 }}>
        <AgentSignature agent={agent} nameColor="white" creciColor="rgba(255,255,255,0.4)" borderColor="rgba(26,107,71,0.3)" badgeColor={green} />
      </div>
    </div>
  );
};

/* ═══ P3 · EDITORIAL SPREAD ═══
   Magazine layout with serif headings, photo with editorial framing */
export const P3_InformativoPremium: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "'Playfair Display', serif", background: "#f8f4ec" }}>
      <DotPattern color="rgba(26,22,16,0.03)" spacing={50} dotSize={1} />

      {/* Top bar */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", opacity: 0.8 }} />}
        <span style={{ color: "#8a7654", fontSize: 20, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase" as const, fontFamily: "'Barlow', sans-serif" }}>{property.tipo}</span>
      </div>

      {/* Photo with white border (printed photo style) */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 170, height: 460, background: "white", padding: 16, boxShadow: "0 12px 40px rgba(26,22,16,0.1)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Editorial title */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 680 }}>
        <h2 style={{ color: "#1a1610", fontSize: 48, fontWeight: 700, lineHeight: 1.1, margin: 0, fontStyle: "italic" }}>{property.titulo}</h2>
        {property.condominio && <p style={{ color: "#8a7654", fontSize: 28, fontWeight: 400, marginTop: 10, fontFamily: "'Barlow', sans-serif" }}>{property.condominio}</p>}
      </div>

      {/* Decorative line + bairro */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 830 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <DiamondAccent size={7} color={green} />
          <DecorativeLine color="#d4c9b0" width="120px" height={1} />
          <span style={{ color: green, fontSize: 32, fontWeight: 700, fontFamily: "'Barlow', sans-serif" }}>{bairro}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 910, display: "flex", gap: 28 }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={green} numColor="#1a1610" labelColor="#8a7654" />)}
      </div>

      {/* Price + situação */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 200, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        {property.preco > 0 && <span style={{ color: green, fontSize: 68, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>}
        {property.situacao && <span style={{ color: "#8a7654", fontSize: 26, fontWeight: 700, textTransform: "uppercase" as const, fontFamily: "'Barlow', sans-serif" }}>{property.situacao}</span>}
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 80 }}>
        <AgentSignature agent={agent} nameColor="#1a1610" creciColor="#8a7654" borderColor="#d4c9b0" badgeColor={green} />
      </div>
    </div>
  );
};

/* ═══ P4 · TEXTO PROTAGONISTA ═══
   Solid vibrant background, dramatic conceptual text, tiny photo accent */
export const P4_Conceitual: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const concepts = ["NÃO É SOBRE\nMETRAGEM.\nÉ SOBRE COMO\nVOCÊ VIVE.", "SEU UPGRADE\nJÁ TEM\nENDEREÇO.", "ONDE MEMÓRIAS\nSÃO\nCONSTRUÍDAS.", "A CASA ONDE\nSEU FINAL DE\nSEMANA COMEÇA."];
  const concept = concepts[(property.area + property.quartos) % concepts.length];
  const deepGreen = "#0d2e1f";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: deepGreen }}>
      <NoiseOverlay opacity={0.05} />

      {/* Tiny photo accent - top right circle */}
      <div style={{ position: "absolute", right: 80, top: 80, width: 160, height: 160, borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,255,255,0.1)", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Logo */}
      <div style={{ position: "absolute", left: 80, top: 90 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", filter: "brightness(10)", opacity: 0.7 }} />}
      </div>

      {/* Giant conceptual text */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 300 }}>
        <p style={{ color: "white", fontSize: 64, fontWeight: 900, lineHeight: 1.05, whiteSpace: "pre-line" as const, textTransform: "uppercase" as const, margin: 0 }}>{concept}</p>
      </div>

      {/* Bottom info */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 80 }}>
        <DecorativeLine color="rgba(255,255,255,0.15)" width="100%" height={1} style={{ marginBottom: 24 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <DiamondAccent size={7} color="#4ade80" />
          <span style={{ color: "#4ade80", fontSize: 36, fontWeight: 700 }}>{bairro}</span>
        </div>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, fontWeight: 500, marginBottom: 8 }}>{property.condominio}</p>}
        {property.preco > 0 && <p style={{ color: "white", fontSize: 68, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", margin: "8px 0 16px" }}>{formatPrice(property.preco)}</p>}
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor="rgba(74,222,128,0.3)" badgeColor="#4ade80" />
      </div>
    </div>
  );
};

/* ═══ P5 · CORRETOR CARD ═══
   White card with shadow floating over dark background,
   agent photo + property data integrated */
export const P5_CorretorDestaque: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#091a10" }}>
      {/* Background photo faded */}
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.08, filter: "saturate(0.2)" }} />
      <NoiseOverlay opacity={0.04} />

      {/* Logo centered top */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 80, display: "flex", justifyContent: "center" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", opacity: 0.7 }} />}
      </div>

      {/* White floating card */}
      <div style={{
        position: "absolute", left: 60, right: 60, top: 160, bottom: 80,
        background: "white", borderRadius: 28,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        padding: "40px 44px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        {/* Agent section */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {agent?.foto_url ? (
            <img src={agent.foto_url} alt="" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: `4px solid ${green}` }} />
          ) : (
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 48, fontWeight: 900 }}>{(agent?.nome || "C")[0]}</span>
            </div>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h3 style={{ color: "#1a1610", fontSize: 40, fontWeight: 900, margin: 0 }}>{agent?.nome || "Corretor"}</h3>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill={green} /><path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            {agent?.creci && <p style={{ color: green, fontSize: 22, fontWeight: 700, marginTop: 2 }}>CRECI {agent.creci}</p>}
            <p style={{ color: "#888", fontSize: 24, fontWeight: 600, marginTop: 2 }}>{agent?.telefone || brand.contato}</p>
          </div>
        </div>

        {/* Property photo inside card */}
        <div style={{ borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
          <img src={photoUrl} alt="" style={{ width: "100%", height: 320, objectFit: "cover" }} />
        </div>

        {/* Property info */}
        <div>
          <h2 style={{ color: "#1a1610", fontSize: 40, fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" as const, margin: 0 }}>{property.titulo}</h2>
          {property.condominio && <p style={{ color: "#888", fontSize: 26, fontWeight: 500, marginTop: 6 }}>{property.condominio}</p>}
          <p style={{ color: "#666", fontSize: 32, fontWeight: 700, marginTop: 8 }}>{bairro}</p>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 20, padding: "14px 0", borderTop: "1.5px solid #eee", borderBottom: "1.5px solid #eee" }}>
          {stats.map((s, i) => <TemplateStat key={i} {...s} color={green} numColor="#1a1610" labelColor="#999" />)}
        </div>

        {/* Price */}
        {property.preco > 0 && (
          <div style={{ textAlign: "center" }}>
            <span style={{ color: green, fontSize: 64, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

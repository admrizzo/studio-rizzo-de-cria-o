import React from "react";
import { TemplateProps, formatPrice, cleanBairro, getDestinacao } from "./templateTypes";
import { TemplateStat, getTemplateStats } from "./TemplateStat";
import { AgentSignature } from "./AgentSignature";
import { LuxuryFrame, DecorativeLine, DiamondAccent, DotPattern, NoiseOverlay, Pill, ArcDecor, DiagonalPattern } from "./TemplateDecorations";

/* ═══ S1 · MOLDURA LUXO ═══
   Full-bleed photo with elegant inner gold frame,
   translucent price box centered, sophisticated typography */
export const S1_PrecoImpacto: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const destinacao = getDestinacao(property);
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const gold = "#c9a84c";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif" }}>
      {/* Full-bleed photo */}
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.55) contrast(1.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 80%)" }} />
      <NoiseOverlay opacity={0.04} />

      {/* Elegant inner frame */}
      <LuxuryFrame color={gold} weight={1.5} inset={32} cornerSize={80} />

      {/* Logo top-left inside frame */}
      <div style={{ position: "absolute", left: 80, top: 280 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 52, objectFit: "contain", filter: "brightness(10)", opacity: 0.9 }} />}
      </div>

      {/* Destination pill top-right */}
      <div style={{ position: "absolute", right: 80, top: 280 }}>
        <Pill bg="transparent" color={gold} border={`1.5px solid ${gold}`} fontSize={24}>{destinacao}</Pill>
      </div>

      {/* Central price in translucent box */}
      {property.preco > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "38%", display: "flex", justifyContent: "center" }}>
          <div style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", borderRadius: 20, padding: "28px 60px", border: `1px solid rgba(201,168,76,0.3)` }}>
            <span style={{ fontSize: 110, fontWeight: 900, color: "white", fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1, letterSpacing: "0.02em" }}>{formatPrice(property.preco)}</span>
          </div>
        </div>
      )}

      {/* Diamond separator */}
      <div style={{ position: "absolute", left: 0, right: 0, top: "58%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
        <DecorativeLine color={gold} width="120px" height={1} />
        <DiamondAccent size={10} color={gold} />
        <DecorativeLine color={gold} width="120px" height={1} />
      </div>

      {/* Title & location */}
      <div style={{ position: "absolute", left: 80, right: 80, top: "62%", textAlign: "center" }}>
        <h3 style={{ color: "white", fontSize: 52, fontWeight: 300, lineHeight: 1.1, textTransform: "uppercase" as const, margin: 0, letterSpacing: "0.08em" }}>{property.titulo}</h3>
        <p style={{ color: gold, fontSize: 38, fontWeight: 700, marginTop: 16 }}>{bairro}</p>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 30, fontWeight: 500, marginTop: 8, fontStyle: "italic" }}>{property.condominio}</p>}
      </div>

      {/* Stats row */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 280, display: "flex", justifyContent: "center", gap: 48 }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={gold} numColor="white" labelColor="rgba(255,255,255,0.6)" />)}
      </div>

      {/* Agent signature */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 140, display: "flex", justifyContent: "center" }}>
        <AgentSignature agent={agent} nameColor="white" creciColor="rgba(255,255,255,0.5)" borderColor={`rgba(201,168,76,0.5)`} badgeColor={gold} />
      </div>
    </div>
  );
};

/* ═══ S2 · MAGAZINE COVER ═══
   Full-bleed photo, massive overlapping title with mixed weights,
   stats in pills at the footer, editorial feel */
export const S2_Lifestyle: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const titleWords = property.titulo.toUpperCase().split(" ");
  const half = Math.ceil(titleWords.length / 2);
  const line1 = titleWords.slice(0, half).join(" ");
  const line2 = titleWords.slice(half).join(" ");
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif" }}>
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) contrast(1.2) saturate(1.1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.95) 100%)" }} />

      {/* Top bar: logo + type */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 280, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 52, objectFit: "contain", filter: "brightness(10)", opacity: 0.9 }} />}
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 24, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase" as const }}>{property.tipo}</span>
      </div>

      {/* Giant overlapping title */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 520 }}>
        <p style={{ color: "white", fontSize: 92, fontWeight: 300, lineHeight: 0.95, textTransform: "uppercase" as const, margin: 0, letterSpacing: "-0.02em", fontFamily: "'Playfair Display', serif" }}>{line1}</p>
        <p style={{ color: "white", fontSize: 92, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase" as const, margin: 0, letterSpacing: "-0.02em", fontFamily: "'Barlow', sans-serif" }}>{line2}</p>
      </div>

      {/* Bairro + condo */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 520 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 3, background: "white" }} />
          <span style={{ color: "white", fontSize: 40, fontWeight: 700, letterSpacing: "0.05em" }}>{bairro}</span>
        </div>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 30, fontWeight: 500, marginTop: 8, marginLeft: 64 }}>{property.condominio}</p>}
      </div>

      {/* Stats as pills */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 360, display: "flex", gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "12px 20px" }}>
            <TemplateStat {...s} color="rgba(255,255,255,0.6)" numColor="white" labelColor="rgba(255,255,255,0.5)" />
          </div>
        ))}
      </div>

      {/* Price + Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 160, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          {property.preco > 0 && <p style={{ color: "white", fontSize: 72, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", margin: 0 }}>{formatPrice(property.preco)}</p>}
        </div>
        <AgentSignature agent={agent} nameColor="white" creciColor="rgba(255,255,255,0.5)" borderColor="rgba(255,255,255,0.3)" />
      </div>
    </div>
  );
};

/* ═══ S3 · GALERIA ═══
   Cream background, photo in portrait format with thick white border
   (like a printed photograph), elegant serif typography */
export const S3_Editorial: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "'Playfair Display', serif", background: "#f8f4ec" }}>
      <DotPattern color="rgba(26,22,16,0.04)" spacing={50} dotSize={1.5} />

      {/* Top: logo + type */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 280, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", opacity: 0.8 }} />}
        <span style={{ color: "#8a7654", fontSize: 22, fontWeight: 400, letterSpacing: "0.3em", textTransform: "uppercase" as const, fontFamily: "'Barlow', sans-serif" }}>{property.tipo}</span>
      </div>

      {/* Photo as "printed photograph" with thick white border + shadow */}
      <div style={{ position: "absolute", left: 100, right: 100, top: 380, height: 640, background: "white", padding: 20, borderRadius: 4, boxShadow: "0 12px 50px rgba(26,22,16,0.12), 0 2px 8px rgba(26,22,16,0.08)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Title in serif */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1070 }}>
        <h2 style={{ color: "#1a1610", fontSize: 52, fontWeight: 700, lineHeight: 1.1, margin: 0, fontStyle: "italic" }}>{property.titulo}</h2>
        {property.condominio && <p style={{ color: "#8a7654", fontSize: 30, fontWeight: 400, marginTop: 10, fontFamily: "'Barlow', sans-serif" }}>{property.condominio}</p>}
      </div>

      {/* Decorative line + bairro */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1240 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <DiamondAccent size={8} color={green} />
          <DecorativeLine color="#d4c9b0" width="160px" height={1} />
          <span style={{ color: green, fontSize: 36, fontWeight: 700, fontFamily: "'Barlow', sans-serif", letterSpacing: "0.06em" }}>{bairro}</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, display: "flex", gap: 36 }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={green} numColor="#1a1610" labelColor="#8a7654" />)}
      </div>

      {/* Price */}
      {property.preco > 0 && (
        <div style={{ position: "absolute", left: 80, bottom: 320 }}>
          <span style={{ color: green, fontSize: 72, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
        </div>
      )}

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 180 }}>
        <AgentSignature agent={agent} nameColor="#1a1610" creciColor="#8a7654" borderColor="#d4c9b0" badgeColor={green} />
      </div>
    </div>
  );
};

/* ═══ S4 · FAIXA DIAGONAL ═══
   Photo background with dramatic red diagonal stripe
   crossing the canvas, text at an angle, real urgency */
export const S4_Urgencia: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const destinacao = getDestinacao(property);
  const isLocacao = destinacao === "LOCAÇÃO";
  const red = "#dc2626";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif" }}>
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) contrast(1.2)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(40,0,0,0.4) 50%, rgba(20,0,0,0.92) 85%)" }} />

      {/* Diagonal red stripe */}
      <div style={{
        position: "absolute", top: "28%", left: "-10%", right: "-10%",
        height: 140, background: red,
        transform: "rotate(-8deg)", transformOrigin: "center",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 40px rgba(220,38,38,0.5)",
        zIndex: 3,
      }}>
        <span style={{ color: "white", fontSize: 52, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
          {isLocacao ? "ALUGUE JÁ" : "OPORTUNIDADE ÚNICA"}
        </span>
      </div>

      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: red }} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 280, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 52, objectFit: "contain", filter: "brightness(10)", opacity: 0.85 }} />}
      </div>

      {/* Content bottom section */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 160 }}>
        <h3 style={{ color: "white", fontSize: 56, fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" as const, margin: 0, textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{property.titulo}</h3>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 38, fontWeight: 700, marginTop: 12 }}>{bairro}</p>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 30, fontWeight: 500, marginTop: 6 }}>{property.condominio}</p>}

        <div style={{ display: "flex", gap: 20, marginTop: 28, flexWrap: "wrap" as const }}>
          {stats.map((s, i) => <TemplateStat key={i} {...s} color="#ef4444" numColor="white" labelColor="rgba(255,255,255,0.7)" />)}
        </div>

        {property.preco > 0 && (
          <div style={{ marginTop: 28, borderRadius: 16, padding: "20px 36px", textAlign: "center", background: `linear-gradient(135deg, ${red}, #991b1b)`, boxShadow: `0 8px 32px rgba(220,38,38,0.4)` }}>
            <span style={{ color: "white", fontSize: 80, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <AgentSignature agent={agent} nameColor="white" creciColor="rgba(255,255,255,0.5)" borderColor={`rgba(220,38,38,0.5)`} badgeColor={red} />
        </div>
      </div>
    </div>
  );
};

/* ═══ S5 · ARQUITECTO ═══
   Grid-based modular layout with thin lines,
   blueprint/architect aesthetic, structured data modules */
export const S5_Moderno: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const accent = "#4a9eff";
  const lineColor = "rgba(74,158,255,0.15)";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#0a0e14" }}>
      {/* Blueprint grid pattern */}
      <DiagonalPattern color="rgba(74,158,255,0.03)" spacing={40} weight={1} />

      {/* Horizontal grid lines */}
      {[280, 380, 900, 1000, 1300, 1400, 1700].map(y => (
        <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 1, background: lineColor }} />
      ))}
      {/* Vertical grid lines */}
      {[80, 540, 1000].map(x => (
        <div key={x} style={{ position: "absolute", top: 0, bottom: 0, left: x, width: 1, background: lineColor }} />
      ))}

      {/* Module: Logo */}
      <div style={{ position: "absolute", left: 80, top: 288, right: 540 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", opacity: 0.7 }} />}
      </div>

      {/* Module: Type label */}
      <div style={{ position: "absolute", left: 560, top: 290, right: 80 }}>
        <span style={{ color: accent, fontSize: 22, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase" as const }}>{property.tipo}</span>
      </div>

      {/* Module: Photo */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 400, height: 480, overflow: "hidden" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85) contrast(1.1) saturate(0.9)" }} />
        <div style={{ position: "absolute", inset: 0, border: `1px solid ${lineColor}` }} />
      </div>

      {/* Module: Title */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 920 }}>
        <p style={{ color: "white", fontSize: 62, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase" as const, fontFamily: "'Bebas Neue', sans-serif", margin: 0, letterSpacing: "0.04em" }}>{property.titulo.toUpperCase()}</p>
      </div>

      {/* Module: Location */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1060 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 36, fontWeight: 600 }}>{bairro}</span>
        </div>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, fontWeight: 400, marginTop: 8, marginLeft: 20 }}>{property.condominio}</p>}
      </div>

      {/* Module: Stats in data cards */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1200, display: "flex", gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, border: `1px solid ${lineColor}`, borderRadius: 8, padding: "16px 14px", background: "rgba(74,158,255,0.03)" }}>
            <TemplateStat {...s} color={accent} numColor="white" labelColor="rgba(255,255,255,0.5)" />
          </div>
        ))}
      </div>

      {/* Module: Price */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1420 }}>
        {property.preco > 0 && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span style={{ color: accent, fontSize: 20, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase" as const }}>VALOR</span>
            <span style={{ color: "white", fontSize: 72, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
          </div>
        )}
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 200 }}>
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor={lineColor} badgeColor={accent} />
      </div>

      {/* Corner marks */}
      <ArcDecor size={120} color="rgba(74,158,255,0.12)" weight={1} quarter="tl" style={{ position: "absolute", top: 260, left: 60 }} />
      <ArcDecor size={120} color="rgba(74,158,255,0.12)" weight={1} quarter="br" style={{ position: "absolute", bottom: 160, right: 60 }} />
    </div>
  );
};

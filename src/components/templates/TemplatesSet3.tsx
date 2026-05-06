import React from "react";
import { TemplateProps, formatPrice, cleanBairro, getDestinacao, getPricePerSqm } from "./templateTypes";
import { TemplateStat, getTemplateStats } from "./TemplateStat";
import { AgentSignature } from "./AgentSignature";
import { LuxuryFrame, DecorativeLine, DiamondAccent, GlassCard, Pill, NoiseOverlay, DotPattern, ArcDecor, DiagonalPattern } from "./TemplateDecorations";
import { TrendingUp, ArrowRight } from "lucide-react";

/* ═══ S6 · OURO NOIR ═══
   Photo with golden gradient overlay, noise texture, condensed typography */
export const S6_DarkGold: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const gold = "#d4a843";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#050403" }}>
      {/* Full photo with golden gradient from right */}
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.5) contrast(1.15) saturate(0.85)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, transparent 20%, rgba(50,35,10,0.5) 50%, rgba(30,20,5,0.95) 80%)" }} />
      <NoiseOverlay opacity={0.05} />

      {/* Elegant frame */}
      <LuxuryFrame color="rgba(212,168,67,0.25)" weight={1} inset={36} cornerSize={70} />

      {/* Logo */}
      <div style={{ position: "absolute", left: 80, top: 280 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", filter: "brightness(10)", opacity: 0.7 }} />}
      </div>

      {/* Type pill */}
      <div style={{ position: "absolute", right: 80, top: 280 }}>
        <Pill bg="transparent" color={gold} border={`1px solid rgba(212,168,67,0.4)`} fontSize={22}>{property.tipo}</Pill>
      </div>

      {/* Title block - condensed */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 520 }}>
        <h2 style={{ color: "white", fontSize: 60, fontWeight: 900, lineHeight: 0.95, textTransform: "uppercase" as const, margin: 0, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}>{property.titulo}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
          <DiamondAccent size={8} color={gold} />
          <span style={{ color: gold, fontSize: 36, fontWeight: 700 }}>{bairro}</span>
        </div>
        {property.condominio && <p style={{ color: "rgba(212,168,67,0.5)", fontSize: 28, fontWeight: 500, marginTop: 10, marginLeft: 22 }}>{property.condominio}</p>}
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 520, display: "flex", gap: 28 }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={gold} numColor="white" labelColor="rgba(255,255,255,0.5)" />)}
      </div>

      {/* Price */}
      {property.preco > 0 && (
        <div style={{ position: "absolute", left: 80, right: 80, bottom: 340 }}>
          <DecorativeLine color="rgba(212,168,67,0.2)" width="100%" height={1} gradient style={{ marginBottom: 20 }} />
          <span style={{ color: gold, fontSize: 76, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
        </div>
      )}

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 180 }}>
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.85)" creciColor="rgba(255,255,255,0.4)" borderColor={`rgba(212,168,67,0.4)`} badgeColor={gold} />
      </div>
    </div>
  );
};

/* ═══ S7 · GLASS CARD ═══
   Glassmorphism with large central card, blurred photo behind */
export const S7_Glass: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const gold = "#d4a843";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif" }}>
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45) saturate(1.2) blur(2px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 40%, transparent 10%, rgba(0,0,0,0.6) 100%)" }} />

      {/* Logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 280, display: "flex", justifyContent: "center" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 52, objectFit: "contain", filter: "brightness(10)", opacity: 0.8 }} />}
      </div>

      {/* Central glass card */}
      <div style={{ position: "absolute", left: 50, right: 50, top: 380, bottom: 320 }}>
        <GlassCard blur={32} opacity={0.1} borderColor="rgba(255,255,255,0.15)" borderRadius={32} padding="40px 44px" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Type */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <DiamondAccent size={7} color={gold} />
            <span style={{ color: gold, fontSize: 24, fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase" as const }}>{property.tipo}</span>
          </div>

          {/* Title */}
          <div>
            <h2 style={{ color: "white", fontSize: 52, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase" as const, margin: 0 }}>{property.titulo}</h2>
            {property.condominio && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 30, fontWeight: 500, marginTop: 10 }}>{property.condominio}</p>}
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 38, fontWeight: 700, marginTop: 12 }}>{bairro}</p>
          </div>

          {/* Separator */}
          <DecorativeLine color="rgba(255,255,255,0.12)" width="100%" height={1} gradient />

          {/* Stats */}
          <div style={{ display: "flex", gap: 24 }}>
            {stats.map((s, i) => <TemplateStat key={i} {...s} color="rgba(255,255,255,0.6)" numColor="white" labelColor="rgba(255,255,255,0.5)" />)}
          </div>

          {/* Price */}
          {property.preco > 0 && (
            <div style={{ textAlign: "center" }}>
              <span style={{ color: "white", fontSize: 80, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 180 }}>
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.85)" creciColor="rgba(255,255,255,0.4)" borderColor="rgba(255,255,255,0.2)" />
      </div>
    </div>
  );
};

/* ═══ S8 · DUO TONE ═══
   Canvas split diagonally: photo one side, solid color other, text at intersection */
export const S8_SplitDiagonal: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#0f1a14" }}>
      {/* Photo side (top-left triangle) */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", overflow: "hidden", clipPath: "polygon(0 0, 100% 0, 100% 65%, 0 100%)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.8) contrast(1.1)" }} />
      </div>

      {/* Diagonal accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", clipPath: "polygon(0 98%, 100% 63%, 100% 65%, 0 100%)", background: green, opacity: 0.7 }} />

      {/* Logo */}
      <div style={{ position: "absolute", left: 80, top: 280, zIndex: 2 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", filter: "brightness(10)", opacity: 0.85 }} />}
      </div>

      {/* Content on solid side */}
      <div style={{ position: "absolute", left: 80, right: 80, top: "56%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 6, height: 40, background: green, borderRadius: 3 }} />
          <span style={{ color: green, fontSize: 24, fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase" as const }}>{property.tipo}</span>
        </div>
        <h2 style={{ color: "white", fontSize: 54, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase" as const, marginTop: 16, margin: "16px 0 0" }}>{property.titulo}</h2>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 30, fontWeight: 500, marginTop: 10 }}>{property.condominio}</p>}
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 38, fontWeight: 700, marginTop: 12 }}>{bairro}</p>
      </div>

      {/* Stats in cards */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 380, display: "flex", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, background: "rgba(26,107,71,0.12)", border: "1px solid rgba(26,107,71,0.2)", borderRadius: 14, padding: "12px 14px" }}>
            <TemplateStat {...s} color={green} numColor="white" labelColor="rgba(255,255,255,0.5)" />
          </div>
        ))}
      </div>

      {/* Price */}
      {property.preco > 0 && (
        <div style={{ position: "absolute", left: 80, bottom: 240 }}>
          <span style={{ color: "white", fontSize: 72, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
        </div>
      )}

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 140 }}>
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor={`rgba(26,107,71,0.35)`} badgeColor={green} />
      </div>
    </div>
  );
};

/* ═══ S10 · EARTH TONES ═══
   Terracotta palette with circular photo, organic feel */
export const S10_Terracota: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const terra = "#c47848";
  const cream = "#f5ede0";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#1a0e08" }}>
      <NoiseOverlay opacity={0.04} />

      {/* Decorative large circle background accent */}
      <div style={{ position: "absolute", right: -120, top: 200, width: 500, height: 500, borderRadius: "50%", border: `1.5px solid rgba(196,120,72,0.12)` }} />
      <div style={{ position: "absolute", left: -80, bottom: 200, width: 300, height: 300, borderRadius: "50%", border: `1px solid rgba(196,120,72,0.08)` }} />

      {/* Top bar */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 280, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 48, objectFit: "contain", filter: "brightness(10)", opacity: 0.7 }} />}
        <Pill bg="transparent" color={terra} border={`1px solid rgba(196,120,72,0.3)`} fontSize={22}>{property.tipo}</Pill>
      </div>

      {/* Large circular photo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 520, height: 520, borderRadius: "50%", overflow: "hidden", border: `3px solid rgba(196,120,72,0.3)`, boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
          <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85) contrast(1.08) saturate(1.1)" }} />
        </div>
      </div>

      {/* Title */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 980, textAlign: "center" }}>
        <h2 style={{ color: cream, fontSize: 52, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase" as const, margin: 0 }}>{property.titulo}</h2>
        {property.condominio && <p style={{ color: `rgba(196,120,72,0.6)`, fontSize: 28, fontWeight: 500, marginTop: 10 }}>{property.condominio}</p>}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 14 }}>
          <DecorativeLine color={`rgba(196,120,72,0.3)`} width="80px" height={1} />
          <span style={{ color: terra, fontSize: 36, fontWeight: 700 }}>{bairro}</span>
          <DecorativeLine color={`rgba(196,120,72,0.3)`} width="80px" height={1} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 380, display: "flex", justifyContent: "center", gap: 36 }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={terra} numColor={cream} labelColor={`rgba(196,120,72,0.7)`} />)}
      </div>

      {/* Price */}
      {property.preco > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 240, textAlign: "center" }}>
          <span style={{ color: terra, fontSize: 76, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
        </div>
      )}

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 130 }}>
        <AgentSignature agent={agent} nameColor={`rgba(240,220,200,0.85)`} creciColor={`rgba(196,120,72,0.5)`} borderColor={`rgba(196,120,72,0.35)`} badgeColor={terra} />
      </div>
    </div>
  );
};

/* ═══ S11 · FICHA TÉCNICA ═══
   Rigorous grid layout, photo in frame, data organized like premium form */
export const S11_FichaClean: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const destinacao = getDestinacao(property);
  const destLabel = destinacao === "LOCAÇÃO" ? "Valor de locação" : "Valor de venda";
  const stats = getTemplateStats(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#f4f0e8" }}>
      <DotPattern color="rgba(26,22,16,0.03)" spacing={40} dotSize={1} />

      {/* Top: Agent + Logo */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 280, display: "flex", alignItems: "center", gap: 20 }}>
        {agent?.foto_url ? (
          <img src={agent.foto_url} alt="" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: `4px solid ${green}`, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }} />
        ) : (
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: 44, fontWeight: 900 }}>{(agent?.nome || "C")[0]}</span>
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ color: "#1a1a1a", fontSize: 36, fontWeight: 900, margin: 0 }}>{agent?.nome || "Corretor"}</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill={green} /><path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          {agent?.creci && <p style={{ color: green, fontSize: 20, fontWeight: 700, marginTop: 2 }}>CRECI {agent.creci}</p>}
        </div>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 44, objectFit: "contain", opacity: 0.7 }} />}
      </div>

      {/* Photo in frame */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 420, height: 560, border: "8px solid white", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Title row */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1020 }}>
        <h2 style={{ color: "#1a1a1a", fontSize: 44, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{property.condominio || property.titulo}</h2>
        <p style={{ color: "#666", fontSize: 30, fontWeight: 600, marginTop: 6 }}>{property.tipo} · {bairro}</p>
      </div>

      {/* Stats in grid */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1150, display: "flex", gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, background: "white", borderRadius: 12, padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <TemplateStat {...s} color={green} numColor="#1a1a1a" labelColor="#888" />
          </div>
        ))}
      </div>

      {/* Price footer */}
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 180, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <p style={{ color: "#888", fontSize: 22, fontWeight: 600, margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{destLabel}</p>
          {property.preco > 0 && <p style={{ color: green, fontSize: 56, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", margin: "4px 0 0" }}>{formatPrice(property.preco)}</p>}
        </div>
      </div>
    </div>
  );
};

/* ═══ P6 · DASHBOARD ═══
   UI/data-inspired layout with metric cards, investment analysis feel */
export const P6_Investidor: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const destinacao = getDestinacao(property);
  const pricePerSqm = getPricePerSqm(property);
  const accent = "#22c55e";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#070d18" }}>
      <DiagonalPattern color="rgba(34,197,94,0.02)" spacing={50} weight={1} />

      {/* Top bar */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 12, padding: "12px 22px" }}>
          <TrendingUp size={24} color={accent} />
          <span style={{ color: accent, fontSize: 24, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>INVESTIMENTO</span>
        </div>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 44, objectFit: "contain", opacity: 0.6 }} />}
      </div>

      {/* Photo card */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 170, height: 340, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85) contrast(1.08)" }} />
      </div>

      {/* Metric cards row */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 540, display: "flex", gap: 12 }}>
        {property.preco > 0 && (
          <div style={{ flex: 2, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Valor</span>
            <p style={{ color: "white", fontSize: 48, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", margin: "4px 0 0" }}>{formatPrice(property.preco)}</p>
          </div>
        )}
        {pricePerSqm && (
          <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 20px" }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>R$/m²</span>
            <p style={{ color: accent, fontSize: 36, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", margin: "4px 0 0" }}>{pricePerSqm}</p>
          </div>
        )}
      </div>

      {/* Title + location */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 680 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ color: accent, fontSize: 22, fontWeight: 700, textTransform: "uppercase" as const }}>{destinacao}</span>
          {property.situacao && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22 }}>· {property.situacao}</span>}
        </div>
        <h3 style={{ color: "white", fontSize: 44, fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" as const, margin: 0 }}>{property.titulo}</h3>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, fontWeight: 500, marginTop: 6 }}>{property.condominio}</p>}
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 34, fontWeight: 700, marginTop: 10 }}>{bairro}</p>
      </div>

      {/* Stats */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 180, display: "flex", gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 16px" }}>
            <TemplateStat {...s} color={accent} numColor="white" labelColor="rgba(255,255,255,0.5)" />
          </div>
        ))}
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 60 }}>
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor="rgba(34,197,94,0.2)" badgeColor={accent} />
      </div>
    </div>
  );
};

/* ═══ P7 · CLEAN WHITE ═══
   Pure white background, rounded photo, black typography, green accents */
export const P7_SplitClean: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const destinacao = getDestinacao(property);
  const green = "#1a6b47";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#ffffff" }}>
      {/* Logo */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 44, objectFit: "contain", opacity: 0.8 }} />}
      </div>

      {/* Type pill */}
      <div style={{ position: "absolute", right: 80, top: 80 }}>
        <Pill bg={green} fontSize={20}>{property.tipo}</Pill>
      </div>

      {/* Photo with rounded corners */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 160, height: 440, borderRadius: 24, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.1)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Title */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 640 }}>
        <h2 style={{ color: "#111", fontSize: 48, fontWeight: 900, lineHeight: 1.06, textTransform: "uppercase" as const, margin: 0 }}>{property.titulo}</h2>
        {property.condominio && <p style={{ color: "#bbb", fontSize: 28, fontWeight: 500, marginTop: 6 }}>{property.condominio}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: green }} />
          <span style={{ color: "#666", fontSize: 34, fontWeight: 700 }}>{bairro}</span>
        </div>
      </div>

      {/* Stats in bordered row */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 840, display: "flex", gap: 24, padding: "16px 0", borderTop: "1.5px solid #eee", borderBottom: "1.5px solid #eee" }}>
        {stats.map((s, i) => <TemplateStat key={i} {...s} color={green} numColor="#111" labelColor="#aaa" />)}
      </div>

      {/* Price + destination + agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 80, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          {property.preco > 0 && <p style={{ color: "#111", fontSize: 64, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif", margin: 0 }}>{formatPrice(property.preco)}</p>}
          <span style={{ color: green, fontSize: 24, fontWeight: 900, textTransform: "uppercase" as const }}>{destinacao}</span>
        </div>
        <AgentSignature agent={agent} nameColor="#222" creciColor="#999" borderColor="#ddd" badgeColor={green} photoSize={56} />
      </div>
    </div>
  );
};

/* ═══ P8 · CINEMATIC ═══
   Full photo with cinema letterbox bars, text on the bars */
export const P8_LifestylePost: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const barH = 200;
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif" }}>
      {/* Full photo */}
      <img src={photoUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75) contrast(1.15) saturate(1.05)" }} />

      {/* Top letterbox bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: barH, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px" }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 40, objectFit: "contain", filter: "brightness(10)", opacity: 0.7 }} />}
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 22, fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase" as const }}>{property.tipo}</span>
      </div>

      {/* Bottom letterbox bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: barH + 120, background: "rgba(0,0,0,0.92)", padding: "24px 80px 80px" }}>
        <h2 style={{ color: "white", fontSize: 48, fontWeight: 900, lineHeight: 1.05, textTransform: "uppercase" as const, margin: 0 }}>{property.titulo}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 34, fontWeight: 700 }}>{bairro}</span>
          {property.condominio && (
            <>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 28, fontWeight: 500 }}>{property.condominio}</span>
            </>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
          {stats.map((s, i) => <TemplateStat key={i} {...s} color="rgba(255,255,255,0.5)" numColor="white" labelColor="rgba(255,255,255,0.4)" />)}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 18 }}>
          {property.preco > 0 && <span style={{ color: "white", fontSize: 60, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>}
          <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor="rgba(255,255,255,0.2)" photoSize={52} />
        </div>
      </div>
    </div>
  );
};

/* ═══ P9 · ALERT BANNER ═══
   Red bands top + bottom, photo center, notification urgency aesthetic */
export const P9_UrgenciaPost: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const destinacao = getDestinacao(property);
  const isLocacao = destinacao === "LOCAÇÃO";
  const red = "#dc2626";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#0a0a0a" }}>
      {/* Top red band */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 180, background: red, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ArrowRight size={32} color="white" />
          <span style={{ color: "white", fontSize: 36, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{isLocacao ? "ALUGUE JÁ" : "OPORTUNIDADE"}</span>
        </div>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 44, objectFit: "contain", filter: "brightness(10)", opacity: 0.9 }} />}
      </div>

      {/* Center photo */}
      <div style={{ position: "absolute", left: 40, right: 40, top: 200, bottom: 380, borderRadius: 16, overflow: "hidden" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.85) contrast(1.1)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.6) 100%)" }} />
        {/* Title over photo bottom */}
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 30 }}>
          <h3 style={{ color: "white", fontSize: 44, fontWeight: 900, lineHeight: 1.1, textTransform: "uppercase" as const, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>{property.titulo}</h3>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 32, fontWeight: 700, marginTop: 6 }}>{bairro}</p>
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 80 }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "10px 14px" }}>
              <TemplateStat {...s} color="#ef4444" numColor="white" labelColor="rgba(255,255,255,0.5)" />
            </div>
          ))}
        </div>

        {/* Price band */}
        {property.preco > 0 && (
          <div style={{ background: `linear-gradient(135deg, ${red}, #991b1b)`, borderRadius: 14, padding: "16px 28px", textAlign: "center", marginBottom: 20, boxShadow: `0 6px 24px rgba(220,38,38,0.35)` }}>
            <span style={{ color: "white", fontSize: 64, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
          </div>
        )}

        {/* Agent */}
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor={`rgba(220,38,38,0.3)`} badgeColor={red} />
      </div>
    </div>
  );
};

/* ═══ P10 · BOLD TIPO ═══
   Title occupies 70% of canvas in monumental typography, small photo accent */
export const P10_RupturaPost: React.FC<TemplateProps> = ({ property, brand, agent, photoUrl }) => {
  const bigText = property.titulo.toUpperCase();
  const bairro = cleanBairro(property.bairro);
  const stats = getTemplateStats(property);
  const terra = "#c47848";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "Barlow, sans-serif", background: "#0a0a0a" }}>
      <NoiseOverlay opacity={0.03} />

      {/* Small photo in top-right corner */}
      <div style={{ position: "absolute", right: 80, top: 80, width: 200, height: 260, borderRadius: 16, overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}>
        <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Logo */}
      <div style={{ position: "absolute", left: 80, top: 80 }}>
        {brand.logoUrl && <img src={brand.logoUrl} alt="" style={{ height: 44, objectFit: "contain", opacity: 0.6 }} />}
      </div>

      {/* Type */}
      <div style={{ position: "absolute", left: 80, top: 150 }}>
        <span style={{ color: terra, fontSize: 22, fontWeight: 300, letterSpacing: "0.3em", textTransform: "uppercase" as const }}>{property.tipo}</span>
      </div>

      {/* MONUMENTAL TITLE */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 220 }}>
        <p style={{ color: "white", fontSize: 110, fontWeight: 900, lineHeight: 0.88, textTransform: "uppercase" as const, fontFamily: "'Bebas Neue', sans-serif", margin: 0, letterSpacing: "0.02em" }}>{bigText}</p>
      </div>

      {/* Bairro + condo */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 3, background: terra }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 36, fontWeight: 700 }}>{bairro}</span>
        </div>
        {property.condominio && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 26, fontWeight: 500, marginTop: 8, marginLeft: 54 }}>{property.condominio}</p>}
      </div>

      {/* Stats + price */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 180, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 24 }}>
          {stats.map((s, i) => <TemplateStat key={i} {...s} color={terra} numColor="white" labelColor="rgba(255,255,255,0.5)" />)}
        </div>
        {property.preco > 0 && (
          <div style={{ background: terra, borderRadius: 14, padding: "12px 24px", boxShadow: `0 6px 24px rgba(196,120,72,0.3)` }}>
            <span style={{ color: "white", fontSize: 56, fontWeight: 900, fontFamily: "'Bebas Neue', sans-serif" }}>{formatPrice(property.preco)}</span>
          </div>
        )}
      </div>

      {/* Agent */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 60 }}>
        <AgentSignature agent={agent} nameColor="rgba(255,255,255,0.8)" creciColor="rgba(255,255,255,0.4)" borderColor={`rgba(196,120,72,0.35)`} badgeColor={terra} />
      </div>
    </div>
  );
};

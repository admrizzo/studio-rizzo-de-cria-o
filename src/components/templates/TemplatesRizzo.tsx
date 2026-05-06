import React from "react";
import { TemplateProps, cleanBairro, formatPrice } from "./templateTypes";
import { AreaIcon, QuartosIcon, SuitesIcon, VagasIcon } from "./PropertyIcons";
import { AgentSignature } from "./AgentSignature";

/**
 * Templates oficiais Rizzo Imobiliária (baseados nos PSDs do marketing).
 * Story 1080x1920. Suporta duas fotos: principal (topo) + secundária (base).
 * Se houver apenas uma foto, ocupa toda a área.
 * Se não houver foto, mostra estado claro pedindo imagem.
 */

const PIN_ICON = (
  <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-7.5 8-13a8 8 0 10-16 0c0 5.5 8 13 8 13z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" />
  </svg>
);

interface RizzoTemplateProps extends TemplateProps {
  /** Pink/magenta = venda. Yellow = locacao. */
  variant: "venda" | "locacao";
}

const formatPriceOrConsult = (price: number) => {
  if (!price || price <= 0) return "Sob consulta";
  return formatPrice(price);
};

const NoPhotoState: React.FC<{ accent: string }> = ({ accent }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#1a1a1a",
      color: "white",
      fontFamily: "Barlow, sans-serif",
      padding: 80,
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 48, fontWeight: 900, color: accent, marginBottom: 24 }}>📷</div>
    <p style={{ fontSize: 44, fontWeight: 800, margin: 0 }}>Este template precisa de fotos</p>
    <p style={{ fontSize: 26, fontWeight: 400, marginTop: 16, opacity: 0.7 }}>
      Adicione pelo menos uma foto ao imóvel para gerar este story.
    </p>
  </div>
);

const RizzoStory: React.FC<RizzoTemplateProps> = ({ property, brand, agent, photoUrl, secondaryPhotoUrl, variant }) => {
  const isVenda = variant === "venda";
  // Reference palette
  const accent = isVenda ? "#E8345E" : "#F5C033"; // pink vs yellow
  const accentText = isVenda ? "white" : "#1a1a1a";
  const accentSoft = isVenda ? "rgba(232,52,94,0.92)" : "rgba(245,192,51,0.95)";

  const bairro = cleanBairro(property.bairro);
  const tipo = (property.tipo || "Imóvel").trim();
  const tipoBairro = bairro ? `${tipo} - ${bairro}` : tipo;
  const destinacaoLabel = isVenda ? "VENDA" : "ALUGUEL";

  const price = isVenda
    ? property.valorVenda ?? property.preco
    : property.valorLocacao ?? property.preco;
  const priceText = formatPriceOrConsult(price || 0);

  const hasMain = !!photoUrl;
  const hasSecondary = !!secondaryPhotoUrl && secondaryPhotoUrl !== photoUrl;

  if (!hasMain) {
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <NoPhotoState accent={accent} />
      </div>
    );
  }

  // Stats row (only show what exists)
  const stats: { icon: React.FC<any>; text: string }[] = [];
  if (property.area > 0) stats.push({ icon: AreaIcon, text: `${property.area.toLocaleString("pt-BR")} m²` });
  if (property.quartos > 0) stats.push({ icon: QuartosIcon, text: `${property.quartos} quartos` });
  if ((property.suites ?? 0) > 0) stats.push({ icon: SuitesIcon, text: `${property.suites} suítes` });
  if (property.vagas > 0) stats.push({ icon: VagasIcon, text: `${property.vagas} vagas` });

  // Layout heights (1920 total)
  // Header: 0-260 (safe top buffer for IG UI ~250)
  // Photo area: 260-1480 (or split if 2 photos)
  // Bottom info: 1480-1700 (price + stats)
  // Footer: 1700-1920 (logo + safe bottom)

  const photoTop = 260;
  const photoBottom = 1480;
  const photoHeight = photoBottom - photoTop;
  const gap = hasSecondary ? 12 : 0;
  const splitHeight = hasSecondary ? Math.floor((photoHeight - gap) / 2) : photoHeight;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#ECECEC",
        fontFamily: "Barlow, sans-serif",
      }}
    >
      {/* ── HEADER: Pill "Dê um endereço ao seu sonho" ───────── */}
      <div
        style={{
          position: "absolute",
          top: 130,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            background: accent,
            color: accentText,
            padding: "22px 56px 38px",
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: "0.01em",
            borderRadius: "0 0 200px 200px",
            minWidth: 480,
            textAlign: "center",
            boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
          }}
        >
          Dê um <strong style={{ fontWeight: 900 }}>endereço</strong> ao seu <strong style={{ fontWeight: 900 }}>sonho</strong>
        </div>
      </div>

      {/* ── PHOTOS ─────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: photoTop,
          height: photoHeight,
          background: "#0a0a0a",
        }}
      >
        <img
          src={photoUrl}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            width: "100%",
            height: splitHeight,
            objectFit: "cover",
            display: "block",
          }}
        />
        {hasSecondary && (
          <img
            src={secondaryPhotoUrl}
            alt=""
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: splitHeight + gap,
              width: "100%",
              height: splitHeight,
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        {/* Pill row: VENDA/ALUGUEL + tipo+bairro — overlaid on first photo */}
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: 200,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              background: accent,
              color: accentText,
              padding: "18px 38px",
              borderRadius: 999,
              fontSize: 32,
              fontWeight: 900,
              letterSpacing: "0.08em",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
            }}
          >
            {destinacaoLabel}
          </div>

          <div
            style={{
              background: "rgba(40,40,40,0.78)",
              color: "white",
              padding: "16px 28px",
              borderRadius: 999,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: `1.5px solid ${accentSoft}`,
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              maxWidth: "calc(100% - 220px)",
            }}
          >
            <span style={{ color: accent, display: "flex", alignItems: "center" }}>{PIN_ICON}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tipoBairro}</span>
          </div>
        </div>

        {/* Price pill — overlaid centered near bottom of photos */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 90,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: accent,
              color: accentText,
              padding: "20px 56px",
              borderRadius: 999,
              fontSize: 50,
              fontWeight: 900,
              letterSpacing: "0.01em",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              fontFamily: "Barlow, sans-serif",
            }}
          >
            {priceText}
          </div>
        </div>

        {/* Stats pill — translucent, just under price */}
        {stats.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 40,
              right: 40,
              bottom: 24,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "rgba(40,40,40,0.78)",
                borderRadius: 16,
                padding: "16px 22px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "white",
                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              }}
            >
              {stats.map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.25)", margin: "0 6px" }} />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <s.icon size={36} color={accent} />
                    <span style={{ fontSize: 26, fontWeight: 700, whiteSpace: "nowrap" }}>{s.text}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER: Logo + corretor opcional ──────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1920 - photoBottom,
          background: "#ECECEC",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px 80px",
        }}
      >
        {/* ID + brand block */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "0.08em",
              writingMode: "vertical-rl" as const,
              transform: "rotate(180deg)",
              textTransform: "uppercase",
              opacity: 0.85,
            }}
          >
            CJ {property.id.replace(/^u-/, "")}
          </div>

          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.nome || "Logo"}
              style={{ height: 110, maxWidth: 460, objectFit: "contain" }}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 80, fontWeight: 900, color: "#1a1a1a", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {brand.nome || "Imobiliária"}
              </div>
            </div>
          )}
        </div>

        {/* Optional agent line */}
        {agent?.nome && (
          <div style={{ marginTop: 18 }}>
            <AgentSignature
              agent={agent}
              nameColor="#1a1a1a"
              creciColor="rgba(26,26,26,0.55)"
              borderColor="rgba(26,26,26,0.2)"
              badgeColor={accent}
              photoSize={56}
            />
          </div>
        )}

        {/* Optional WhatsApp/contact CTA */}
        {brand.whatsapp && !agent?.nome && (
          <div
            style={{
              marginTop: 14,
              fontSize: 22,
              fontWeight: 600,
              color: "#1a1a1a",
              opacity: 0.7,
            }}
          >
            WhatsApp {brand.whatsapp}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   STORY VENDA RIZZO (rosa/magenta)
   ═══════════════════════════════════════════════════════════════ */
export const SR_VendaRizzo: React.FC<TemplateProps> = (props) => (
  <RizzoStory {...props} variant="venda" />
);

/* ═══════════════════════════════════════════════════════════════
   STORY LOCAÇÃO RIZZO (amarelo)
   ═══════════════════════════════════════════════════════════════ */
export const SR_LocacaoRizzo: React.FC<TemplateProps> = (props) => (
  <RizzoStory {...props} variant="locacao" />
);

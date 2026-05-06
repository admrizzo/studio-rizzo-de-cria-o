import React from "react";
import { TemplateProps, cleanBairro, formatPrice } from "./templateTypes";
import { AreaIcon, QuartosIcon, SuitesIcon, VagasIcon } from "./PropertyIcons";

/**
 * Templates oficiais Rizzo Imobiliária.
 * Story 1080x1920.
 * Design refinado para fidelidade total ao PNG do marketing.
 */

const OFFICIAL_COLORS = {
  azulEscuro: "#344650",
  verde: "#61ac81",
  amarelo: "#f0ae00",
  azulClaro: "#658bc8",
  branco: "#ffffff",
  pinkRizzo: "#e50046",
};

const PIN_ICON_RIZZO = (
  <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const formatPriceRefined = (price: number) => {
  if (!price || price <= 0) return "Sob consulta";
  // Remove .00 if present
  return formatPrice(price).replace(",00", "");
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

interface RizzoStoryProps extends TemplateProps {
  variant: "venda" | "locacao";
}

const RizzoStory: React.FC<RizzoStoryProps> = ({
  property,
  brand,
  photoUrl,
  secondaryPhotoUrl,
  variant,
}) => {
  const isVenda = variant === "venda";
  const accent = isVenda ? OFFICIAL_COLORS.pinkRizzo : OFFICIAL_COLORS.amarelo;
  const destinacaoLabel = isVenda ? "VENDA" : "ALUGUEL";

  const bairro = cleanBairro(property.bairro);
  const tipo = (property.tipo || "Imóvel").trim();
  const tipoBairro = bairro ? `${tipo} - ${bairro}` : tipo;

  const price = isVenda
    ? property.valorVenda || property.preco
    : property.valorLocacao || property.preco;
  const priceText = formatPriceRefined(price || 0);

  const photo1 = photoUrl;
  const photo2 = secondaryPhotoUrl || photoUrl;

  if (!photo1) {
    return <NoPhotoState accent={accent} />;
  }

  // Stats for the stats bar - fixed order: área, quartos, suítes, vagas
  const statsList = [
    { icon: AreaIcon, value: property.area, label: "m²", show: property.area > 0 },
    { icon: QuartosIcon, value: property.quartos, label: "quartos", show: property.quartos > 0 },
    { icon: SuitesIcon, value: property.suites, label: "suítes", show: (property.suites ?? 0) > 0 },
    { icon: VagasIcon, value: property.vagas, label: "vagas", show: property.vagas > 0 },
  ].filter((s) => s.show);

  return (
    <div
      style={{
        position: "relative",
        width: 1080,
        height: 1920,
        background: "#000",
        fontFamily: "'Barlow', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── PHOTOS (50/50 visual split) ─────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 1740, // Area before white footer
          display: "flex",
          flexDirection: "column",
          gap: 4, // Subtle elegant gap
          background: "#000",
        }}
      >
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <img
            src={photo1}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <img
            src={photo2}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      </div>

      {/* ── OVERLAYS ─────────────────────────────────────────── */}

      {/* 1. Header Bar: Destinação + Endereço (Higher up, refined) */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 50,
          right: 50,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            background: accent,
            color: isVenda ? "#fff" : "#000",
            padding: "12px 32px",
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: "0.08em",
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
          }}
        >
          {destinacaoLabel}
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 999,
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `1.5px solid ${accent}`,
            boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
            maxWidth: "100%",
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ color: accent, display: "flex" }}>{PIN_ICON_RIZZO}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tipoBairro}
          </span>
        </div>
      </div>

      {/* 2. Price Pill (Lower profile, centered over second photo) */}
      <div
        style={{
          position: "absolute",
          top: 1350, // Positioned over second photo
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: accent,
            color: isVenda ? "#fff" : "#000",
            padding: "16px 50px",
            borderRadius: 999,
            fontSize: 52,
            fontWeight: 900,
            boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          }}
        >
          {priceText}
        </div>
      </div>

      {/* 3. Stats Bar (Lifted slightly, refined background) */}
      <div
        style={{
          position: "absolute",
          top: 1530,
          left: 50,
          right: 50,
          height: 120,
          background: "rgba(0,0,0,0.6)",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 20px",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
        }}
      >
        {statsList.map((stat, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{ width: 1.5, height: 44, background: "rgba(255,255,255,0.15)" }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <stat.icon size={40} color={accent} />
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <span
                  style={{
                    color: "#fff",
                    fontSize: 34,
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 16,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginTop: 2,
                    letterSpacing: "0.02em",
                  }}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── FOOTER: Logo Only (Taller, centered logo) ────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: "#666",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              opacity: 0.5,
              letterSpacing: "0.05em",
            }}
          >
            CJ {property.id.replace(/^u-/, "")}
          </div>
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt=""
              style={{ height: 100, maxWidth: 500, objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 64, fontWeight: 900, color: "#e50046", letterSpacing: "-0.02em" }}>RIZZO</span>
          )}
        </div>
      </div>
    </div>
  );
};


export const SR_VendaRizzo: React.FC<TemplateProps> = (props) => (
  <RizzoStory {...props} variant="venda" />
);

export const SR_LocacaoRizzo: React.FC<TemplateProps> = (props) => (
  <RizzoStory {...props} variant="locacao" />
);


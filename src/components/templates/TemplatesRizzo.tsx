import React from "react";
import { TemplateProps, cleanBairro, formatPrice } from "./templateTypes";
import { AreaIcon, QuartosIcon, SuitesIcon, VagasIcon } from "./PropertyIcons";

/**
 * Templates oficiais Rizzo Imobiliária.
 * Story 1080x1920.
 * Design fiel ao PNG do marketing.
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
  <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 21s-7-4.5-7-10a7 7 0 1 1 14 0c0 5.5-7 10-7 10z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="11" r="2.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

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
  const priceText = formatPriceOrConsult(price || 0);

  const photo1 = photoUrl;
  const photo2 = secondaryPhotoUrl || photoUrl;

  if (!photo1) {
    return <NoPhotoState accent={accent} />;
  }

  // Stats for the stats bar
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
        width: "100%",
        height: "100%",
        background: "#000",
        fontFamily: "'Barlow', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── PHOTOS (50/50 split) ─────────────────────────────── */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "50%" }}>
        <img
          src={photo1}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "50%" }}>
        <img
          src={photo2}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* ── OVERLAYS ─────────────────────────────────────────── */}

      {/* 1. Header Bar: Destinação + Endereço (Top of first photo) */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 40,
          right: 40,
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
            padding: "16px 36px",
            borderRadius: 999,
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: "0.08em",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
        >
          {destinacaoLabel}
        </div>

        <div
          style={{
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            padding: "14px 30px",
            borderRadius: 999,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: `2px solid ${accent}`,
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            maxWidth: "100%",
          }}
        >
          <span style={{ color: accent, display: "flex" }}>{PIN_ICON_RIZZO}</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {tipoBairro}
          </span>
        </div>
      </div>

      {/* 2. Price Pill (Above stats bar, over second photo) */}
      <div
        style={{
          position: "absolute",
          bottom: 340,
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
            padding: "20px 60px",
            borderRadius: 999,
            fontSize: 58,
            fontWeight: 900,
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          {priceText}
        </div>
      </div>

      {/* 3. Stats Bar (Bottom of second photo) */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          left: 40,
          right: 40,
          height: 110,
          background: "rgba(0,0,0,0.7)",
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 20px",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        {statsList.map((stat, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{ width: 2, height: 40, background: "rgba(255,255,255,0.2)" }} />
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <stat.icon size={38} color={accent} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span
                  style={{
                    color: "#fff",
                    fontSize: 32,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 18,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* ── FOOTER: Logo Only ────────────────────────────────── */}
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
          paddingBottom: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#333",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              opacity: 0.6,
            }}
          >
            CJ {property.id.replace(/^u-/, "")}
          </div>
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt=""
              style={{ height: 80, maxWidth: 400, objectFit: "contain" }}
            />
          ) : (
            <span style={{ fontSize: 48, fontWeight: 900, color: "#e50046" }}>RIZZO</span>
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


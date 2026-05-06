import React from "react";

/**
 * Ícones autorais para stats de imóveis, estilo editorial premium.
 * Traço grosso (strokeWidth 2.5), cantos arredondados, preenchimento limpo.
 * Uso: <QuartosIcon size={40} color="#fff" />
 */

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

/** Cama — quartos */
export const QuartosIcon: React.FC<IconProps> = ({ size = 40, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="24" width="40" height="12" rx="3" stroke={color} strokeWidth="2.5" />
    <path d="M8 24V16a4 4 0 014-4h24a4 4 0 014 4v8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <rect x="10" y="16" width="10" height="8" rx="2" stroke={color} strokeWidth="2" />
    <rect x="28" y="16" width="10" height="8" rx="2" stroke={color} strokeWidth="2" />
    <path d="M8 36v4M40 36v4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/** Cama com estrela — suítes */
export const SuitesIcon: React.FC<IconProps> = ({ size = 40, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="4" y="24" width="40" height="12" rx="3" stroke={color} strokeWidth="2.5" />
    <path d="M8 24V16a4 4 0 014-4h24a4 4 0 014 4v8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <rect x="12" y="16" width="24" height="8" rx="2" stroke={color} strokeWidth="2" />
    <path d="M8 36v4M40 36v4" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    {/* Estrela — indica suíte */}
    <circle cx="38" cy="10" r="6" fill={color} opacity="0.15" />
    <path d="M38 6l1.2 2.4 2.8.4-2 2 .5 2.6L38 12l-2.5 1.4.5-2.6-2-2 2.8-.4z" fill={color} />
  </svg>
);

/** Carro — vagas de garagem */
export const VagasIcon: React.FC<IconProps> = ({ size = 40, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M10 30l3-12a4 4 0 013.87-3h14.26A4 4 0 0135 18l3 12" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="6" y="28" width="36" height="10" rx="3" stroke={color} strokeWidth="2.5" />
    <circle cx="14" cy="38" r="3" stroke={color} strokeWidth="2.5" />
    <circle cx="34" cy="38" r="3" stroke={color} strokeWidth="2.5" />
    <path d="M14 28v-2M34 28v-2" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Chuveiro — banheiros */
export const BanheirosIcon: React.FC<IconProps> = ({ size = 40, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M20 6v8a4 4 0 004 4h0" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="14" r="4" stroke={color} strokeWidth="2.5" />
    <path d="M16 22v2M24 22v4M32 22v2M20 26v3M28 26v3M24 30v3" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M12 42h24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M14 42l2-6M34 42l-2-6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** Setas expandir — área m² */
export const AreaIcon: React.FC<IconProps> = ({ size = 40, color = "currentColor", className }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M6 16V8a2 2 0 012-2h8M32 6h8a2 2 0 012 2v8M42 32v8a2 2 0 01-2 2h-8M16 42H8a2 2 0 01-2-2v-8" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="14" y="14" width="20" height="20" rx="2" stroke={color} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
  </svg>
);

/** Helper: retorna array de ícones + valores para stats do imóvel */
export const buildIconStats = (property: { quartos: number; suites?: number; banheiros: number; area: number; vagas: number }) => {
  const stats: { icon: React.FC<IconProps>; value: number; label: string; unit?: string }[] = [];
  if (property.quartos > 0) stats.push({ icon: QuartosIcon, value: property.quartos, label: "quartos" });
  if ((property.suites ?? 0) > 0) stats.push({ icon: SuitesIcon, value: property.suites!, label: "suítes" });
  if (property.vagas > 0) stats.push({ icon: VagasIcon, value: property.vagas, label: "vagas" });
  return stats;
};

/** Mapeia label de stat para o ícone autoral */
export const getStatIcon = (label: string): React.FC<IconProps> => {
  switch (label) {
    case "quartos": return QuartosIcon;
    case "suítes": return SuitesIcon;
    case "vagas": return VagasIcon;
    case "m²": return AreaIcon;
    case "banhos": return BanheirosIcon;
    default: return QuartosIcon;
  }
};

/**
 * StatItem reutilizável — ícone + número + label, sem sobreposição.
 * Vertical: ícone em cima, número, label embaixo.
 * Inline: ícone + "3 quartos" lado a lado.
 */
interface StatItemProps {
  label: string;
  value: number;
  iconColor?: string;
  iconSize?: number;
  numSize?: string;    // e.g. "48px"
  labelSize?: string;  // e.g. "28px"
  numColor?: string;
  labelColor?: string;
  layout?: "vertical" | "inline";
  numFont?: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  label, value, iconColor = "currentColor", iconSize = 44,
  numSize = "56px", labelSize = "30px",
  numColor = "white", labelColor = "rgba(255,255,255,0.6)",
  layout = "vertical", numFont
}) => {
  const Icon = getStatIcon(label);

  if (layout === "inline") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          minWidth: 150,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: iconSize, height: iconSize, flexShrink: 0 }}>
          <Icon size={iconSize} color={iconColor} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", minWidth: 0 }}>
          <span style={{ fontSize: numSize, fontWeight: 900, color: numColor, lineHeight: 0.9, fontFamily: numFont }}>{value}</span>
          <span style={{ fontSize: labelSize, fontWeight: 700, color: labelColor, textTransform: "uppercase", lineHeight: 0.95, marginTop: 2 }}>{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: 132 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: iconSize }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: iconSize, height: iconSize, flexShrink: 0 }}>
          <Icon size={iconSize} color={iconColor} />
        </div>
        <span style={{ fontSize: numSize, fontWeight: 900, color: numColor, lineHeight: 0.9, fontFamily: numFont }}>{value}</span>
      </div>
      <span style={{ fontSize: labelSize, fontWeight: 700, color: labelColor, textTransform: "uppercase", lineHeight: 0.95, marginTop: 6, textAlign: "center" }}>{label}</span>
    </div>
  );
};
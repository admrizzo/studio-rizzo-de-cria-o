import React from "react";

/* ═══════════════════════════════════════════════
   DECORATIVE ELEMENTS LIBRARY
   Reusable visual accents for premium templates
   ═══════════════════════════════════════════════ */

/** Elegant inner frame with corner accents */
export const LuxuryFrame: React.FC<{
  color?: string;
  weight?: number;
  inset?: number;
  cornerSize?: number;
}> = ({ color = "rgba(212,168,67,0.5)", weight = 1.5, inset = 40, cornerSize = 60 }) => {
  const cs = cornerSize;
  return (
    <div style={{ position: "absolute", inset, pointerEvents: "none", zIndex: 2 }}>
      {/* Top-left */}
      <div style={{ position: "absolute", top: 0, left: 0, width: cs, height: cs }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: cs, height: weight, background: color }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: weight, height: cs, background: color }} />
      </div>
      {/* Top-right */}
      <div style={{ position: "absolute", top: 0, right: 0, width: cs, height: cs }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: cs, height: weight, background: color }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: weight, height: cs, background: color }} />
      </div>
      {/* Bottom-left */}
      <div style={{ position: "absolute", bottom: 0, left: 0, width: cs, height: cs }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: cs, height: weight, background: color }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: weight, height: cs, background: color }} />
      </div>
      {/* Bottom-right */}
      <div style={{ position: "absolute", bottom: 0, right: 0, width: cs, height: cs }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: cs, height: weight, background: color }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: weight, height: cs, background: color }} />
      </div>
    </div>
  );
};

/** Thin decorative line separator */
export const DecorativeLine: React.FC<{
  color?: string;
  width?: string;
  height?: number;
  gradient?: boolean;
  style?: React.CSSProperties;
}> = ({ color = "rgba(255,255,255,0.2)", width = "100%", height = 1, gradient = false, style }) => (
  <div
    style={{
      width,
      height,
      background: gradient
        ? `linear-gradient(90deg, transparent, ${color}, transparent)`
        : color,
      flexShrink: 0,
      ...style,
    }}
  />
);

/** Diamond / losango accent */
export const DiamondAccent: React.FC<{
  size?: number;
  color?: string;
  filled?: boolean;
  style?: React.CSSProperties;
}> = ({ size = 12, color = "rgba(212,168,67,0.6)", filled = true, style }) => (
  <div
    style={{
      width: size,
      height: size,
      transform: "rotate(45deg)",
      background: filled ? color : "transparent",
      border: filled ? "none" : `1.5px solid ${color}`,
      flexShrink: 0,
      ...style,
    }}
  />
);

/** Subtle dot grid pattern background */
export const DotPattern: React.FC<{
  color?: string;
  spacing?: number;
  dotSize?: number;
  style?: React.CSSProperties;
}> = ({ color = "rgba(255,255,255,0.04)", spacing = 40, dotSize = 2, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `radial-gradient(circle, ${color} ${dotSize}px, transparent ${dotSize}px)`,
      backgroundSize: `${spacing}px ${spacing}px`,
      pointerEvents: "none",
      ...style,
    }}
  />
);

/** Diagonal lines pattern */
export const DiagonalPattern: React.FC<{
  color?: string;
  spacing?: number;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ color = "rgba(255,255,255,0.03)", spacing = 30, weight = 1, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent ${spacing - weight}px, ${color} ${spacing - weight}px, ${color} ${spacing}px)`,
      pointerEvents: "none",
      ...style,
    }}
  />
);

/** Circular arc decoration */
export const ArcDecor: React.FC<{
  size?: number;
  color?: string;
  weight?: number;
  quarter?: "tl" | "tr" | "bl" | "br";
  style?: React.CSSProperties;
}> = ({ size = 200, color = "rgba(212,168,67,0.3)", weight = 1.5, quarter = "br", style }) => {
  const borderMap = {
    tl: { borderTop: `${weight}px solid ${color}`, borderLeft: `${weight}px solid ${color}`, borderTopLeftRadius: size },
    tr: { borderTop: `${weight}px solid ${color}`, borderRight: `${weight}px solid ${color}`, borderTopRightRadius: size },
    bl: { borderBottom: `${weight}px solid ${color}`, borderLeft: `${weight}px solid ${color}`, borderBottomLeftRadius: size },
    br: { borderBottom: `${weight}px solid ${color}`, borderRight: `${weight}px solid ${color}`, borderBottomRightRadius: size },
  };
  return (
    <div
      style={{
        width: size,
        height: size,
        ...borderMap[quarter],
        pointerEvents: "none",
        ...style,
      }}
    />
  );
};

/** Glassmorphism card wrapper */
export const GlassCard: React.FC<{
  children: React.ReactNode;
  blur?: number;
  opacity?: number;
  borderColor?: string;
  borderRadius?: number;
  padding?: number | string;
  style?: React.CSSProperties;
}> = ({ children, blur = 28, opacity = 0.12, borderColor = "rgba(255,255,255,0.18)", borderRadius = 28, padding = 44, style }) => (
  <div
    style={{
      background: `rgba(255,255,255,${opacity})`,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      border: `1.5px solid ${borderColor}`,
      borderRadius,
      padding,
      boxShadow: "0 24px 70px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pill / badge for labels */
export const Pill: React.FC<{
  children: React.ReactNode;
  bg?: string;
  color?: string;
  fontSize?: number;
  border?: string;
  style?: React.CSSProperties;
}> = ({ children, bg = "#1a6b47", color = "white", fontSize = 26, border, style }) => (
  <span
    style={{
      display: "inline-block",
      background: bg,
      color,
      fontSize,
      fontWeight: 900,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      padding: "10px 24px",
      borderRadius: 999,
      border: border || "none",
      lineHeight: 1.1,
      ...style,
    }}
  >
    {children}
  </span>
);

/** Noise texture overlay */
export const NoiseOverlay: React.FC<{
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ opacity = 0.03, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      opacity,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "256px 256px",
      pointerEvents: "none",
      mixBlendMode: "overlay",
      ...style,
    }}
  />
);
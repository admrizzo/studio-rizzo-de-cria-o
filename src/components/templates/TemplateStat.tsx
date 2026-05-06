import React from "react";
import { buildIconStats } from "./PropertyIcons";

type StatIcon = React.FC<{ size?: number; color?: string; className?: string }>;

export interface TemplateStatItem {
  icon: StatIcon;
  value: number;
  label: string;
}

interface TemplateStatProps {
  icon: StatIcon;
  value: number;
  label: string;
  color: string;
  numColor?: string;
  labelColor?: string;
  iconSize?: number;
  valueSize?: number;
  labelSize?: number;
  gap?: number;
}

export const getTemplateStats = (property: {
  quartos: number;
  suites?: number;
  banheiros: number;
  area: number;
  vagas: number;
}): TemplateStatItem[] => buildIconStats(property);

export const TemplateStat: React.FC<TemplateStatProps> = ({
  icon: Icon,
  value,
  label,
  color,
  numColor = "white",
  labelColor = "rgba(255,255,255,0.72)",
  iconSize = 80,
  valueSize = 42,
  labelSize = 18,
  gap = 16,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap, flexShrink: 0, minWidth: 0 }}>
    <div
      style={{
        width: iconSize,
        height: iconSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={iconSize} color={color} />
    </div>
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
      <span
        style={{
          fontSize: valueSize,
          fontWeight: 900,
          color: numColor,
          lineHeight: 0.92,
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: labelSize,
          fontWeight: 800,
          color: labelColor,
          textTransform: "uppercase",
          lineHeight: 1,
          letterSpacing: "0.06em",
          marginTop: 4,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  </div>
);
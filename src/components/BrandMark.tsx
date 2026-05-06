import React from "react";
import { Clapperboard } from "lucide-react";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "light" | "dark";
}

const SIZE_MAP = {
  sm: { icon: 18, text: "text-sm", gap: "gap-1.5" },
  md: { icon: 24, text: "text-base", gap: "gap-2" },
  lg: { icon: 32, text: "text-xl", gap: "gap-2.5" },
  xl: { icon: 48, text: "text-3xl", gap: "gap-3" },
};

const BrandMark: React.FC<BrandMarkProps> = ({
  size = "md",
  className = "",
  showText = true,
  variant = "light",
}) => {
  const s = SIZE_MAP[size];
  const colorClass = variant === "dark" ? "text-white" : "text-foreground";
  return (
    <div className={`inline-flex items-center ${s.gap} ${className}`}>
      <span
        className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground"
        style={{ width: s.icon + 12, height: s.icon + 12 }}
      >
        <Clapperboard size={s.icon} strokeWidth={2.2} />
      </span>
      {showText && (
        <span
          className={`font-bold tracking-tight uppercase ${s.text} ${colorClass}`}
          style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 800 }}
        >
          Studio de Criação
        </span>
      )}
    </div>
  );
};

export default BrandMark;

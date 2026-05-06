import React from "react";
import { AgentProfile } from "@/contexts/AuthContext";

interface AgentSignatureProps {
  agent?: AgentProfile | null;
  /** Primary text color for the name */
  nameColor?: string;
  /** Secondary color for CRECI badge */
  creciColor?: string;
  /** Border color around the photo */
  borderColor?: string;
  /** Badge/checkmark background color */
  badgeColor?: string;
  /** Photo size in px */
  photoSize?: number;
}

/**
 * Agent signature block — matches the "Dra. Natália Segheto ✓" pattern:
 * circular photo on the left, bold name + verified badge, CRECI subtitle below.
 */
export const AgentSignature: React.FC<AgentSignatureProps> = ({
  agent,
  nameColor = "white",
  creciColor = "rgba(255,255,255,0.55)",
  borderColor = "rgba(255,255,255,0.3)",
  badgeColor = "#1a6b47",
  photoSize = 72,
}) => {
  if (!agent?.nome) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {agent.foto_url ? (
        <img
          src={agent.foto_url}
          alt=""
          style={{
            width: photoSize,
            height: photoSize,
            borderRadius: "50%",
            objectFit: "cover",
            border: `3px solid ${borderColor}`,
          }}
        />
      ) : (
        <div
          style={{
            width: photoSize,
            height: photoSize,
            borderRadius: "50%",
            background: borderColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: nameColor, fontSize: photoSize * 0.45, fontWeight: 900 }}>
            {agent.nome[0]}
          </span>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              color: nameColor,
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.1,
              fontFamily: "'Barlow', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {agent.nome}
          </span>
          {/* Verified badge */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="12" fill={badgeColor} />
            <path
              d="M7.5 12.5L10.5 15.5L16.5 9.5"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {agent.creci && (
          <span
            style={{
              color: creciColor,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginTop: 2,
              fontFamily: "'Barlow', sans-serif",
            }}
          >
            CRECI {agent.creci}
          </span>
        )}
      </div>
    </div>
  );
};

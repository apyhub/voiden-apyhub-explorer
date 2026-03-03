import React from "react";
import type { Service, Category } from "./api";

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

/** Resolve the display name from a category (API uses `display`, fallback to `name`) */
function catName(cat: Category): string {
  return cat.display || cat.name || "";
}

/** Resolve the color for a category (prefer API-provided dark color) */
function catColor(cat: Category): string {
  if (cat.dark) return cat.dark;
  if (cat.light) return cat.light;
  return fallbackColor(catName(cat));
}

const fallbackColors: Record<string, string> = {
  "artificial intelligence": "#6366f1",
  "data extraction": "#0ea5e9",
  "data validation": "#3b82f6",
  "e-commerce quick tools": "#f59e0b",
  "file conversion": "#f97316",
  "file manipulation": "#14b8a6",
  "file security": "#51CF66",
  "hr": "#6366f1",
  "image processing": "#8b5cf6",
  "marketing": "#3b82f6",
  "seo": "#10b981",
  "smart generation": "#CC5DE8",
  "standard data": "#6366f1",
  "travel": "#06b6d4",
  "text processing": "#14b8a6",
  "authentication": "#ec4899",
  "data generation": "#10b981",
};

function fallbackColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(fallbackColors)) {
    if (lower.includes(key)) return color;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

function getCategoryIconPaths(name: string): React.ReactNode {
  const lower = (name || "").toLowerCase();

  if (lower.includes("artificial intelligence")) {
    return (
      <>
        <circle cx="12" cy="4" r="1.8" fill="white" />
        <circle cx="5" cy="12" r="1.8" fill="white" />
        <circle cx="19" cy="12" r="1.8" fill="white" />
        <circle cx="12" cy="20" r="1.8" fill="white" />
        <line x1="12" y1="6" x2="5.5" y2="10" />
        <line x1="12" y1="6" x2="18.5" y2="10" />
        <line x1="5.5" y1="14" x2="12" y2="18" />
        <line x1="18.5" y1="14" x2="12" y2="18" />
      </>
    );
  }
  if (lower.includes("data extraction")) {
    return (
      <>
        <polygon points="12,2 22,7 12,12 2,7" />
        <polyline points="2,12 12,17 22,12" />
        <polyline points="2,17 12,22 22,17" />
      </>
    );
  }
  if (lower.includes("data validation")) {
    return (
      <>
        <rect x="5" y="4" width="14" height="18" rx="2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <polyline points="9,13 11,15 15,11" />
      </>
    );
  }
  if (lower.includes("e-commerce")) {
    return (
      <>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    );
  }
  if (lower.includes("file conversion")) {
    return (
      <>
        <polyline points="17,1 21,5 17,9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7,23 3,19 7,15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </>
    );
  }
  if (lower.includes("file manipulation")) {
    return (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </>
    );
  }
  if (lower.includes("file security")) {
    return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
  }
  if (lower.includes("hr")) {
    return (
      <>
        <rect x="4" y="2" width="16" height="20" rx="1" />
        <rect x="8" y="6" width="3" height="3" rx="0.5" />
        <rect x="13" y="6" width="3" height="3" rx="0.5" />
        <rect x="8" y="12" width="3" height="3" rx="0.5" />
        <rect x="13" y="12" width="3" height="3" rx="0.5" />
        <rect x="10" y="18" width="4" height="4" />
      </>
    );
  }
  if (lower.includes("image processing")) {
    return (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </>
    );
  }
  if (lower.includes("marketing")) {
    return (
      <>
        <rect x="4" y="14" width="4" height="8" rx="0.5" />
        <rect x="10" y="8" width="4" height="14" rx="0.5" />
        <rect x="16" y="3" width="4" height="19" rx="0.5" />
      </>
    );
  }
  if (lower.includes("seo")) {
    return (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z" />
      </>
    );
  }
  if (lower.includes("smart generation")) {
    return <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="white" />;
  }
  if (lower.includes("standard data")) {
    return (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </>
    );
  }
  if (lower.includes("travel")) {
    return (
      <>
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22,2 15,22 11,13 2,9" />
      </>
    );
  }
  if (lower.includes("text processing")) {
    return (
      <>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="4" y1="14" x2="16" y2="14" />
        <line x1="4" y1="18" x2="12" y2="18" />
      </>
    );
  }
  if (lower.includes("authentication")) {
    return (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    );
  }
  if (lower.includes("data generation")) {
    return <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" fill="white" />;
  }

  // Default: code brackets
  return (
    <>
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </>
  );
}

function CategoryIcon({ category, size = 36 }: { category: Category; size?: number }) {
  const color = catColor(category);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={Math.round(size * 0.5)}
        height={Math.round(size * 0.5)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {getCategoryIconPaths(catName(category))}
      </svg>
    </div>
  );
}

function formatAtoms(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const categories = service.categories || [];
  const category = categories[0];
  const desc = service.about || service.description;
  const color = category ? catColor(category) : undefined;
  const name = category ? catName(category) : undefined;
  const badgeBg = color
    ? color.startsWith("#") ? color + "18" : color.replace("hsl(", "hsla(").replace(")", ", 0.1)")
    : undefined;

  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "0 0 12px rgba(100, 108, 255, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
      style={{
        background: "var(--panel)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.15s, box-shadow 0.15s",
        minHeight: 180,
      }}
    >
      {/* Title row with category icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {category && <CategoryIcon category={category} size={36} />}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {service.name}
        </div>
      </div>

      {/* Category badge */}
      {name && color && (
        <div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              padding: "3px 8px",
              borderRadius: 4,
              color: color,
              background: badgeBg,
            }}
          >
            {name}
          </span>
        </div>
      )}

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          color: "var(--comment)",
          lineHeight: 1.5,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          flex: 1,
        }}
      >
        {desc}
      </div>

      {/* Footer: provider + atoms */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 8,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--comment)" }}>
          {service.provider?.logo && (
            <img src={service.provider.logo} alt="" style={{ width: 16, height: 16, borderRadius: 3 }} />
          )}
          <span>{service.provider?.name}</span>
          {service.provider?.verified && (
            <span style={{ color: "var(--accent)", fontSize: 12 }}>&#10003;</span>
          )}
        </div>
        {service.coins && (
          <div style={{ fontSize: 13, color: "var(--comment)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 14 }}>&#9004;</span>
            {formatAtoms(service.coins.coins_per_request)} Atoms
          </div>
        )}
      </div>
    </div>
  );
}

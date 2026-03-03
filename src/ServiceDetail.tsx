import React, { useState, useEffect, useRef } from "react";
import type { Service } from "./api";
import { fetchServiceDetail, type ServiceDetail as ServiceDetailData, type DetailRoute } from "./api";
import { getPluginContext } from "./index";

interface ServiceDetailProps {
  service: Service;
  slug: string;
  onBack: () => void;
}

const methodColors: Record<string, { bg: string; text: string }> = {
  GET: { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
  POST: { bg: "rgba(16,185,129,0.15)", text: "#10b981" },
  PUT: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  PATCH: { bg: "rgba(209,154,102,0.15)", text: "#d19a66" },
  DELETE: { bg: "rgba(239,68,68,0.15)", text: "#ef4444" },
};

const categoryColorMap: Record<string, string> = {
  "file security": "#e8453c",
  "data validation": "#3b82f6",
  "e-commerce quick tools": "#f59e0b",
  "artificial intelligence": "#6366f1",
  "file conversion": "#ef6c00",
  "data extraction": "#0ea5e9",
  "standard data": "#6366f1",
  "image processing": "#8b5cf6",
  "data generation": "#10b981",
  "text processing": "#14b8a6",
  "authentication": "#ec4899",
};

function getCategoryColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(categoryColorMap)) {
    if (lower.includes(key)) return color;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 60%, 55%)`;
}

function formatAtoms(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return String(n);
}

function extractCurl(qs: string): string {
  return qs.replace(/```cURL\n?/i, "").replace(/```\s*$/g, "").trim();
}

/* ── Reusable styles ────────────────────────────────────── */

const heading: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  margin: "28px 0 12px",
};

const tagPill: React.CSSProperties = {
  fontSize: 12,
  padding: "3px 10px",
  borderRadius: 6,
  background: "var(--bg)",
  color: "var(--comment)",
  border: "1px solid var(--border)",
};

const tableTh: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--text)",
  background: "var(--bg)",
  borderBottom: "1px solid var(--border)",
};

const tableTd: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--comment)",
  borderBottom: "1px solid var(--border)",
};

const btnBase: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--border)",
  borderRadius: 6,
  color: "var(--text)",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
};

/* ── Simple markdown renderer ───────────────────────────── */

const codeBg: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 12,
  padding: "1px 5px",
  borderRadius: 4,
  background: "var(--bg)",
  color: "var(--accent)",
  border: "1px solid var(--border)",
};

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={key++} style={{ color: "var(--text)", fontWeight: 600 }}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<code key={key++} style={codeBg}>{match[3]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function renderMdTable(lines: string[], key: number): React.ReactNode {
  const dataLines = lines.filter((l) => !/^\|[\s\-:|]+\|?\s*$/.test(l.trim()));
  if (dataLines.length === 0) return null;

  const parseRow = (line: string) =>
    line.split("|").map((c) => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);

  const headers = parseRow(dataLines[0]);
  const rows = dataLines.slice(1).map(parseRow);

  return (
    <div key={key} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", margin: "12px 0", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={tableTh}>{renderInline(h)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={tableTd}>{renderInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (line.trim() === "") { i++; continue; }

    // fenced code block ```
    if (line.trim().startsWith("```")) {
      i++; // skip opening fence
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      blocks.push(
        <pre
          key={blocks.length}
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            lineHeight: 1.6,
            color: "var(--text)",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 14,
            margin: "10px 0",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
          }}
        >
          {codeLines.join("\n")}
        </pre>
      );
      continue;
    }

    // table
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push(renderMdTable(tableLines, blocks.length));
      continue;
    }

    // list
    if (/^\s*[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={blocks.length} style={{ margin: "8px 0", paddingLeft: 24, color: "var(--text)", fontSize: 13, lineHeight: 1.7 }}>
          {items.map((item, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // heading (### or ##)
    const headingMatch = line.match(/^(#{2,4})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const size = level === 2 ? 16 : level === 3 ? 14 : 13;
      blocks.push(
        <div key={blocks.length} style={{ fontSize: size, fontWeight: 700, color: "var(--text)", margin: "16px 0 6px" }}>
          {renderInline(headingMatch[2])}
        </div>
      );
      i++;
      continue;
    }

    // paragraph (collect consecutive non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith("```") &&
      !lines[i].trim().match(/^#{2,4}\s/) &&
      !/^\s*[-*]\s/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    const joined = paraLines.join(" ");
    blocks.push(
      <p key={blocks.length} style={{ margin: "8px 0", fontSize: 13, lineHeight: 1.7, color: "var(--text)" }}>
        {renderInline(joined)}
      </p>
    );
  }

  return <>{blocks}</>;
}

/* ── Route documentation block ──────────────────────────── */

function RouteDoc({ route, serviceName, anchorId }: { route: DetailRoute; serviceName: string; anchorId: string }) {
  const [copied, setCopied] = useState(false);
  const [tested, setTested] = useState(false);
  const method = route.method.toUpperCase();
  const mc = methodColors[method] || { bg: "var(--bg)", text: "var(--text)" };
  const curl = extractCurl(route.qs || "");
  const curlLines = curl ? curl.split("\n") : [];

  const handleCopy = async () => {
    if (!curl) return;
    await navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTest = async () => {
    if (!curl) return;
    const ctx = getPluginContext();
    if (ctx?.project?.importCurl) {
      await ctx.project.importCurl(`ApyHub - ${serviceName}`, curl);
    } else {
      await navigator.clipboard.writeText(curl);
    }
  };

  return (
    <div id={anchorId} style={{ marginBottom: 32, scrollMarginTop: 20 }}>
      {/* Route name badge */}
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            padding: "5px 12px",
            borderRadius: 4,
            color: "#fff",
            background: "#1a1a2e",
          }}
        >
          {route.name}
        </span>
      </div>

      {/* Method + endpoint URL */}
      {route.endpoint && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span
            style={{
              fontWeight: 700,
              fontFamily: "monospace",
              fontSize: 13,
              color: mc.text,
            }}
          >
            {method}
          </span>
          <code
            style={{
              fontFamily: "monospace",
              fontSize: 13,
              color: "var(--text)",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {route.endpoint}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(route.endpoint)}
            style={{ ...btnBase, padding: "3px 8px", fontSize: 11 }}
            title="Copy URL"
          >
            &#128203;
          </button>
        </div>
      )}

      {/* Request example (curl) */}
      {curlLines.length > 0 && (
        <>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "0 0 8px" }}>
            Request example
          </h4>
          <div style={{ position: "relative" }}>
            <pre
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                lineHeight: 1.7,
                color: "var(--text)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "12px 12px 12px 0",
                margin: 0,
                overflowX: "auto",
              }}
            >
              {curlLines.map((line, i) => (
                <div key={i} style={{ display: "flex" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 36,
                      textAlign: "right",
                      paddingRight: 12,
                      color: "var(--comment)",
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </div>
              ))}
            </pre>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <button onClick={handleCopy} style={btnBase}>
                {copied ? "Copied!" : "Copy curl"}
              </button>
              <button
                onClick={handleTest}
                style={{
                  ...btnBase,
                  background: "var(--accent)",
                  color: "#1a1a2e",
                  borderColor: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                Test
              </button>
              {tested && (
                <span style={{ fontSize: 11, color: "var(--accent)" }}>
                  Curl copied — paste (Cmd+V) to create the request
                </span>
              )}
            </div>
          </div>
        </>
      )}

      {/* Method + Content-Type badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20, margin: "16px 0" }}>
        <div style={{ fontSize: 13 }}>
          <strong style={{ color: "var(--text)" }}>Method: </strong>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 4,
              background: mc.bg,
              color: mc.text,
              fontWeight: 600,
            }}
          >
            {method}
          </span>
        </div>
        {route.input && (
          <div style={{ fontSize: 13 }}>
            <strong style={{ color: "var(--text)" }}>Input: </strong>
            <span style={{
              fontFamily: "monospace", fontSize: 12, padding: "2px 8px",
              borderRadius: 4, background: "var(--bg)", color: "var(--comment)",
              border: "1px solid var(--border)",
            }}>
              {route.input}
            </span>
          </div>
        )}
        {route.output && (
          <div style={{ fontSize: 13 }}>
            <strong style={{ color: "var(--text)" }}>Output: </strong>
            <span style={{
              fontFamily: "monospace", fontSize: 12, padding: "2px 8px",
              borderRadius: 4, background: "var(--bg)", color: "var(--comment)",
              border: "1px solid var(--border)",
            }}>
              {route.output}
            </span>
          </div>
        )}
      </div>

      {/* Documentation (about) */}
      {route.about && (
        <div style={{ marginBottom: 16 }}>
          <Markdown text={route.about} />
        </div>
      )}

      {/* Sample response */}
      {route.sample_response && (() => {
        let sr = typeof route.sample_response === "string"
          ? route.sample_response
          : JSON.stringify(route.sample_response, null, 2);
        // Strip markdown code fences and language tags
        sr = sr.replace(/^```\w*\n?/gm, "").replace(/```\s*$/gm, "").trim();
        return (
          <>
            <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "20px 0 8px" }}>
              Sample Response
            </h4>
            <pre
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "var(--text)",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 14,
                margin: 0,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                maxHeight: 300,
                overflow: "auto",
              }}
            >
              {sr}
            </pre>
          </>
        );
      })()}

      {/* HTTP Response Codes */}
      {route.http_response_codes && Object.keys(route.http_response_codes).length > 0 && (
        <>
          <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: "20px 0 8px" }}>
            HTTP Response Codes
          </h4>
          <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableTh}>Status Code</th>
                  <th style={tableTh}>Description</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(route.http_response_codes).map(([code, desc]) => (
                  <tr key={code}>
                    <td
                      style={{
                        ...tableTd,
                        fontFamily: "monospace",
                        fontWeight: 600,
                        width: 100,
                        color: code.startsWith("2") ? "#10b981"
                          : code.startsWith("4") ? "#f59e0b"
                          : code.startsWith("5") ? "#ef4444"
                          : "var(--text)",
                      }}
                    >
                      {code}
                    </td>
                    <td style={tableTd}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main detail component ──────────────────────────────── */

export function ServiceDetail({ service, slug, onBack }: ServiceDetailProps) {
  const [detail, setDetail] = useState<ServiceDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchServiceDetail(slug)
      .then((data) => { if (!cancelled) setDetail(data); })
      .catch((e) => { if (!cancelled) setError(e.message || "Failed to load service details"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  const d = detail || service;
  const atoms = detail?.coins?.coins_per_request ?? service.coins?.coins_per_request;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 860 }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          ...btnBase,
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 24,
          fontSize: 13,
        }}
      >
        &larr; Back
      </button>

      {/* ── Title ────────────────────────────────────── */}
      <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--text)" }}>
        {d.name}
      </h1>

      {/* Category + tag badges */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 10 }}>
        {(d.categories || []).filter((cat) => cat?.display || cat?.name).map((cat, i) => {
          const label = cat.display || cat.name;
          const color = cat.dark || cat.light || getCategoryColor(label);
          const bg = color.startsWith("#") ? color + "18" : color.replace("hsl(", "hsla(").replace(")", ", 0.1)");
          return (
            <span
              key={`cat-${i}`}
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                padding: "3px 10px",
                borderRadius: 4,
                color: color,
                background: bg,
              }}
            >
              {label}
            </span>
          );
        })}
        {(d.tags || []).map((tag, i) => (
          <span key={`tag-${i}`} style={tagPill}>
            #{tag}
          </span>
        ))}
      </div>

      {/* ── Provider info bar ────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginTop: 16,
          paddingTop: 14,
          paddingBottom: 14,
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)" }}>
          {d.provider?.logo && (
            <img src={d.provider.logo} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
          )}
          <span style={{ fontWeight: 500 }}>{d.provider?.name}</span>
          {d.provider?.verified && (
            <span style={{ color: "var(--accent)", fontSize: 12 }}>&#10003;</span>
          )}
        </div>
        {atoms != null && (
          <div style={{ fontSize: 13, color: "var(--comment)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 15 }}>&#9004;</span>
            {formatAtoms(atoms)} ATOMS
          </div>
        )}
        {d.certificate && (
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 600, padding: "4px 10px",
            border: "1px solid var(--border)", borderRadius: 6, color: "var(--comment)",
            cursor: "default",
          }}>
            {d.certificate.gdpr ? "GDPR" : ""}{d.certificate.gdpr && d.certificate.data_retention ? " | " : ""}{d.certificate.data_retention || ""}
          </span>
        )}
      </div>

      {/* ── About ────────────────────────────────────── */}
      {d.about && (
        <>
          <h2 style={heading}>About</h2>
          <Markdown text={d.about} />
        </>
      )}

      {!d.about && d.description && (
        <p style={{ fontSize: 14, color: "var(--comment)", lineHeight: 1.6, marginTop: 16 }}>
          {d.description}
        </p>
      )}

      {/* ── Select API Endpoints (input/output overview) ── */}
      {detail && (detail.routes || []).length > 0 && (() => {
        const routes = detail.routes || [];
        const inputs = [...new Set(routes.map((r) => r.input).filter(Boolean))];
        const outputs = [...new Set(routes.map((r) => r.output).filter(Boolean))];

        const scrollToRoute = (field: "input" | "output", value: string) => {
          const route = routes.find((r) => r[field] === value);
          if (route) {
            const el = document.getElementById(`route-${route.id}`);
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        };

        return (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", margin: "24px 0 8px" }}>
              Select API Endpoints
            </h3>
            <div style={{ display: "flex", gap: 24, marginBottom: 8 }}>
              {inputs.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--comment)", marginBottom: 4 }}>Input</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {inputs.map((input, i) => (
                      <span
                        key={i}
                        onClick={() => scrollToRoute("input", input)}
                        style={{
                          fontSize: 12, padding: "3px 10px", borderRadius: 14, cursor: "pointer",
                          fontWeight: i === 0 ? 700 : 400,
                          background: i === 0 ? "var(--accent)" : "var(--bg)",
                          color: i === 0 ? "#1a1a2e" : "var(--comment)",
                          border: i === 0 ? "none" : "1px solid var(--border)",
                        }}
                      >
                        {input}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {outputs.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--comment)", marginBottom: 4 }}>Output</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {outputs.map((output, i) => (
                      <span
                        key={i}
                        onClick={() => scrollToRoute("output", output)}
                        style={{
                          fontSize: 12, padding: "3px 10px", borderRadius: 14, cursor: "pointer",
                          fontWeight: i === 0 ? 700 : 400,
                          background: i === 0 ? "var(--accent)" : "var(--bg)",
                          color: i === 0 ? "#1a1a2e" : "var(--comment)",
                          border: i === 0 ? "none" : "1px solid var(--border)",
                        }}
                      >
                        {output}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* ── API Documentation ────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32, color: "var(--comment)", fontSize: 13 }}>
          Loading endpoint details...
        </div>
      ) : error ? (
        <div style={{ padding: 16, color: "#ef4444", fontSize: 13 }}>{error}</div>
      ) : detail && (detail.routes || []).length > 0 ? (
        <>
          <h2 style={heading}>API Documentation</h2>
          {(detail.routes || []).map((route) => (
            <RouteDoc key={route.id} route={route} serviceName={d.name} anchorId={`route-${route.id}`} />
          ))}
        </>
      ) : (service.routes || []).length > 0 ? (
        <>
          <h2 style={heading}>Endpoints</h2>
          <FallbackRouteTable routes={service.routes} />
        </>
      ) : null}

      {/* ── Voiden collection link ───────────────────── */}
      {d.voiden_path && (
        <div style={{ marginTop: 24 }}>
          <a
            href={d.voiden_path}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--accent)",
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Download Voiden Collection &rarr;
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Fallback table ─────────────────────────────────────── */

function FallbackRouteTable({ routes }: { routes: Service["routes"] }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={tableTh}>Name</th>
            <th style={tableTh}>Method</th>
            <th style={tableTh}>Input</th>
            <th style={tableTh}>Output</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route, i) => {
            const method = route.method.toUpperCase();
            const mc = methodColors[method] || { bg: "var(--bg)", text: "var(--text)" };
            return (
              <tr key={i}>
                <td style={tableTd}>{route.name}</td>
                <td style={tableTd}>
                  <span style={{
                    fontFamily: "monospace", fontSize: 12, fontWeight: 600,
                    padding: "2px 6px", borderRadius: 4, background: mc.bg, color: mc.text,
                  }}>
                    {method}
                  </span>
                </td>
                <td style={tableTd}>{route.input || "\u2014"}</td>
                <td style={tableTd}>{route.output || "\u2014"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

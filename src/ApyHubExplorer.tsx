import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchServices, type Service, type Meta } from "./api";
import { ServiceCard } from "./ServiceCard";
import { ServiceDetail } from "./ServiceDetail";

export function ApyHubExplorer() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadServices = useCallback(async (q: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchServices(q, p, 12);
      setServices(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e.message || "Failed to fetch services");
      setServices([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices(query, page);
  }, [page, loadServices]);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      loadServices(value, 0);
    }, 350);
  };

  const handleSearchSubmit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPage(0);
    loadServices(query, 0);
  };

  if (selectedService) {
    return (
      <div style={{ height: "100%", overflow: "auto" }}>
        <ServiceDetail service={selectedService} slug={selectedService.slug} onBack={() => setSelectedService(null)} />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--text)" }}>
          API Catalog
        </h2>

        {/* Search bar */}
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
              fontSize: 14, color: "var(--comment)", pointerEvents: "none",
            }}>
              &#128269;
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="Search for APIs"
              style={{
                width: "100%",
                padding: "10px 14px 10px 34px",
                fontSize: 14,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={handleSearchSubmit}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              background: "var(--accent)",
              color: "#1a1a2e",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--comment)", fontSize: 14 }}>
            Loading...
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: 40, color: "#e06c75", fontSize: 14 }}>
            {error}
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--comment)", fontSize: 14 }}>
            No APIs found{query ? ` for "${query}"` : ""}.
          </div>
        ) : (
          <>
            {!query && (
              <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
                {page === 0 ? "Featured APIs" : "APIs"}
              </h3>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div
          style={{
            padding: "10px 24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: page === 0 ? "var(--comment)" : "var(--text)",
              padding: "6px 14px",
              cursor: page === 0 ? "default" : "pointer",
              fontSize: 13,
              opacity: page === 0 ? 0.5 : 1,
            }}
          >
            &larr; Prev
          </button>
          <span style={{ fontSize: 12, color: "var(--comment)" }}>
            Page {page + 1} of {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages - 1}
            onClick={() => setPage((p) => Math.min(meta.pages - 1, p + 1))}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: page >= meta.pages - 1 ? "var(--comment)" : "var(--text)",
              padding: "6px 14px",
              cursor: page >= meta.pages - 1 ? "default" : "pointer",
              fontSize: 13,
              opacity: page >= meta.pages - 1 ? 0.5 : 1,
            }}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

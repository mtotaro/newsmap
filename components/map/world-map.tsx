"use client";

import { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { useTranslations } from "next-intl";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO numeric country codes → ISO alpha-2
const NUMERIC_TO_ALPHA2: Record<string, string> = {
  "032": "AR", "076": "BR", "152": "CL", "170": "CO", "604": "PE",
  "484": "MX", "840": "US", "826": "GB", "724": "ES", "250": "FR",
  "276": "DE", "380": "IT",
};

const COUNTRIES_WITH_SOURCES = new Set([
  "AR", "BR", "CL", "CO", "PE", "MX", "US", "GB", "ES", "FR", "DE", "IT",
]);

type Source = {
  id: string;
  name: string;
  slug: string;
  country_code: string;
  logo_url: string | null;
  subscribed: boolean;
};

type Props = {
  locale: string;
};

export function WorldMap({ locale }: Props) {
  const t = useTranslations("Map");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  async function loadSources(countryCode: string) {
    setLoadingSources(true);
    setSources([]);
    try {
      const res = await fetch(`/api/sources?country=${countryCode}`);
      const data = await res.json();
      setSources(data);
    } finally {
      setLoadingSources(false);
    }
  }

  function handleCountryClick(numericId: string) {
    const alpha2 = NUMERIC_TO_ALPHA2[numericId];
    if (!alpha2 || !COUNTRIES_WITH_SOURCES.has(alpha2)) return;
    setSelectedCountry(alpha2);
    loadSources(alpha2);
  }

  async function toggleSubscription(source: Source) {
    setSubscribing(source.id);
    try {
      if (source.subscribed) {
        await fetch("/api/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source_id: source.id }),
        });
      } else {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source_id: source.id }),
        });
      }
      setSources((prev) =>
        prev.map((s) =>
          s.id === source.id ? { ...s, subscribed: !s.subscribed } : s
        )
      );
    } finally {
      setSubscribing(null);
    }
  }

  const selectedCountryName =
    selectedCountry
      ? new Intl.DisplayNames([locale], { type: "region" }).of(selectedCountry)
      : null;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Map */}
      <div className="flex-1 rounded-[var(--radius-card)] overflow-hidden bg-[var(--color-bg-2)] border border-[var(--color-border)]">
        <ComposableMap
          projectionConfig={{ scale: 147 }}
          style={{ width: "100%", height: "100%", minHeight: 320 }}
        >
          <ZoomableGroup>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const numericId = geo.id as string;
                  const alpha2 = NUMERIC_TO_ALPHA2[numericId];
                  const hasSources = alpha2
                    ? COUNTRIES_WITH_SOURCES.has(alpha2)
                    : false;
                  const isSelected = alpha2 === selectedCountry;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleCountryClick(numericId)}
                      style={{
                        default: {
                          fill: isSelected
                            ? "var(--color-blue)"
                            : hasSources
                            ? "var(--color-bg-3)"
                            : "var(--color-border)",
                          stroke: "var(--color-border)",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: hasSources ? "pointer" : "default",
                        },
                        hover: {
                          fill: hasSources
                            ? isSelected
                              ? "var(--color-blue)"
                              : "var(--color-text-3)"
                            : "var(--color-border)",
                          stroke: "var(--color-border)",
                          strokeWidth: 0.5,
                          outline: "none",
                          cursor: hasSources ? "pointer" : "default",
                        },
                        pressed: {
                          fill: "var(--color-blue)",
                          stroke: "var(--color-border)",
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Source panel */}
      <div className="lg:w-72 rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] overflow-hidden">
        {!selectedCountry ? (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <p className="text-sm text-[var(--color-text-2)]">
              {t("subtitle")}
            </p>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="font-semibold text-[var(--color-text)]">
                {t("panel_title", { country: selectedCountryName ?? selectedCountry })}
              </h2>
              {!loadingSources && (
                <p className="text-xs text-[var(--color-text-2)] mt-0.5">
                  {t("sources_available", { count: sources.length })}
                </p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
              {loadingSources ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 flex items-center gap-3">
                    <div className="skeleton h-4 w-4 rounded-full" />
                    <div className="skeleton h-3 flex-1" />
                    <div className="skeleton h-7 w-20 rounded" />
                  </div>
                ))
              ) : sources.length === 0 ? (
                <p className="px-4 py-6 text-sm text-[var(--color-text-2)]">
                  {t("no_sources")}
                </p>
              ) : (
                sources.map((source) => (
                  <div
                    key={source.id}
                    className="px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-sm font-medium text-[var(--color-text)] flex-1 truncate">
                      {source.name}
                    </span>
                    <button
                      onClick={() => toggleSubscription(source)}
                      disabled={subscribing === source.id}
                      className={`shrink-0 px-3 py-1 rounded-[var(--radius-button)] text-xs font-medium transition-colors disabled:opacity-50 ${
                        source.subscribed
                          ? "bg-[var(--color-green)]/15 text-[var(--color-green)] hover:bg-[var(--color-red)]/15 hover:text-[var(--color-red)]"
                          : "bg-[var(--color-blue)]/15 text-[var(--color-blue)] hover:bg-[var(--color-blue)]/25"
                      }`}
                    >
                      {subscribing === source.id
                        ? "…"
                        : source.subscribed
                        ? t("subscribed")
                        : t("subscribe")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

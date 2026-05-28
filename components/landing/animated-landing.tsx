"use client";

import { useEffect, useState } from "react";
import { NewsMapIntro } from "./newsmap-intro";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Props = { locale: string; onDone: () => void; onReady?: () => void };

export default function AnimatedLanding({ locale, onDone, onReady }: Readonly<Props>) {
  const [topology, setTopology] = useState<Record<string, unknown> | null>(
    null
  );
  const skipLabel = locale === "en" ? "Skip ->" : "Saltar ->";

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  // Fetch topology in background — animation starts immediately without waiting
  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((t: Record<string, unknown>) => setTopology(t))
      .catch(() => setTopology({}));
  }, []);

  return (
    <>
      {/* Animation starts immediately; map fades in once topology arrives */}
      <NewsMapIntro locale={locale} topology={topology} onDone={onDone} />

      <button
        onClick={onDone}
        style={{
          position: "absolute",
          // Safe-area-aware positioning so the button doesn't sit under iOS's
          // home indicator or behind a notch on landscape phones.
          bottom: "max(20px, env(safe-area-inset-bottom, 20px))",
          right: "max(20px, env(safe-area-inset-right, 20px))",
          background: "rgba(20,20,20,0.6)",
          border: "1px solid #383838",
          borderRadius: 6,
          color: "#ccc",
          fontSize: 14,
          cursor: "pointer",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "0.03em",
          // ≥44 px tap target on every axis
          padding: "10px 16px",
          minHeight: 44,
          minWidth: 44,
          transition: "background 0.2s, color 0.2s",
          zIndex: 10,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.background = "rgba(40,40,40,0.85)";
          el.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.background = "rgba(20,20,20,0.6)";
          el.style.color = "#ccc";
        }}
      >
        {skipLabel}
      </button>
    </>
  );
}

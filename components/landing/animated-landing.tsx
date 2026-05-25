"use client";

import { useEffect, useState } from "react";
import { NewsMapIntro } from "./newsmap-intro";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Props = { locale: string; onDone: () => void };

export default function AnimatedLanding({ locale, onDone }: Props) {
  const [topology, setTopology] = useState<Record<string, unknown> | null>(
    null
  );

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
          bottom: 24,
          right: 24,
          background: "none",
          border: "none",
          color: "#888",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "0.03em",
          padding: "4px 8px",
          transition: "color 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "#ccc")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "#888")
        }
      >
        Saltar →
      </button>
    </>
  );
}

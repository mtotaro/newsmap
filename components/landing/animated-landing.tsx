"use client";

import { useEffect, useRef, useState } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { NewsMapIntro } from "./newsmap-intro";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type Props = { locale: string; onDone: () => void };

export default function AnimatedLanding({ locale, onDone }: Props) {
  const playerRef = useRef<PlayerRef>(null);
  const [topology, setTopology] = useState<Record<string, unknown> | null>(
    null
  );
  // Match composition size to actual viewport so Remotion fills the screen
  // without letterboxing. Set once on mount (SSR-safe: this file is client-only).
  const [dims, setDims] = useState({ w: 800, h: 450 });

  useEffect(() => {
    setDims({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  // Pre-fetch topology so the map is ready when the Player starts
  useEffect(() => {
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((t: Record<string, unknown>) => setTopology(t))
      .catch(() => setTopology({})); // empty map on fetch error — animation still runs
  }, []);

  // topology is in deps so this effect re-runs when the Player actually mounts
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.play();
    player.addEventListener("ended", onDone);
    return () => player.removeEventListener("ended", onDone);
  }, [onDone, topology]);

  // Keep the dark overlay visible while topology loads (seamless with the bg)
  if (!topology) return null;

  return (
    <>
      <Player
        ref={playerRef}
        component={NewsMapIntro}
        inputProps={{ locale, topology }}
        durationInFrames={215}
        fps={30}
        compositionWidth={dims.w}
        compositionHeight={dims.h}
        style={{ width: "100%", height: "100%" }}
        acknowledgeRemotionLicense
      />
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

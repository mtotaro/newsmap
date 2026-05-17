"use client";

import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const PINS = [
  {
    id: "ar",
    coords: [-64, -34] as [number, number],
    headline: "Economía en alza",
    source: "Infobae · Buenos Aires",
    startFrame: 30,
  },
  {
    id: "us",
    coords: [-98, 39] as [number, number],
    headline: "Markets at record high",
    source: "AP News · Washington",
    startFrame: 68,
  },
  {
    id: "es",
    coords: [-4, 40] as [number, number],
    headline: "Madrid lidera la Liga",
    source: "El País · Madrid",
    startFrame: 106,
  },
  {
    id: "de",
    coords: [10, 52] as [number, number],
    headline: "EU summit in Berlin",
    source: "Der Spiegel · Berlín",
    startFrame: 144,
  },
];

export function NewsMapIntro({ locale = "es" }: { locale?: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tagline =
    locale === "en"
      ? "Your world news, on the map"
      : "Tus noticias del mundo, en el mapa";
  const sub =
    locale === "en"
      ? "Pick your sources. No algorithm."
      : "Elige tus fuentes. Sin algoritmos.";

  const mapOpacity = interpolate(frame, [0, 28], [0, 1], {
    extrapolateRight: "clamp",
  });
  const taglineOpacity = interpolate(frame, [172, 195], [0, 1], {
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [172, 195], [14, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f0f" }}>
      {/* Map */}
      <div style={{ position: "absolute", inset: 0, opacity: mapOpacity }}>
        <ComposableMap
          projectionConfig={{ scale: 147 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: "#1c1c1c",
                      stroke: "#2e2e2e",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    hover: {
                      fill: "#1c1c1c",
                      stroke: "#2e2e2e",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    pressed: { fill: "#1c1c1c", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {PINS.map((pin) => {
            const pf = frame - pin.startFrame;
            if (pf < 0) return null;

            const dotScale = spring({
              fps,
              frame: pf,
              config: { damping: 14, stiffness: 280 },
            });

            const cardOpacity = interpolate(pf, [10, 24], [0, 1], {
              extrapolateRight: "clamp",
            });
            const cardDx = interpolate(pf, [10, 24], [0, 8], {
              extrapolateRight: "clamp",
            });

            const rf1 = pf % 58;
            const r1 = interpolate(rf1, [0, 58], [4, 20], {
              extrapolateRight: "clamp",
            });
            const o1 = interpolate(rf1, [0, 58], [0.45, 0], {
              extrapolateRight: "clamp",
            });
            const rf2 = Math.max(0, pf - 20) % 58;
            const r2 = interpolate(rf2, [0, 58], [4, 20], {
              extrapolateRight: "clamp",
            });
            const o2 = interpolate(rf2, [0, 58], [0.45, 0], {
              extrapolateRight: "clamp",
            });

            return (
              <Marker key={pin.id} coordinates={pin.coords}>
                <circle
                  r={r1}
                  fill="none"
                  stroke="#4a9eff"
                  strokeWidth={0.7}
                  opacity={o1}
                />
                <circle
                  r={r2}
                  fill="none"
                  stroke="#4a9eff"
                  strokeWidth={0.7}
                  opacity={o2}
                />
                <circle r={3.5 * dotScale} fill="#4a9eff" />
                <g
                  opacity={cardOpacity}
                  transform={`translate(${8 + cardDx}, -33)`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={120}
                    height={28}
                    rx={3.5}
                    ry={3.5}
                    fill="#1a1a1a"
                    stroke="#333"
                    strokeWidth={0.5}
                  />
                  <text
                    x={8}
                    y={12}
                    fill="#e8e8e8"
                    fontSize={7.5}
                    fontWeight="600"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {pin.headline}
                  </text>
                  <text
                    x={8}
                    y={23}
                    fill="#666"
                    fontSize={6}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {pin.source}
                  </text>
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Tagline overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "16%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            color: "#e8e8e8",
            fontSize: 28,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
            fontFamily: "system-ui, -apple-system, sans-serif",
            textShadow: "0 2px 40px rgba(0,0,0,0.9)",
          }}
        >
          {tagline}
        </p>
        <p
          style={{
            color: "#555",
            fontSize: 14,
            margin: "6px 0 0",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {sub}
        </p>
      </div>
    </AbsoluteFill>
  );
}

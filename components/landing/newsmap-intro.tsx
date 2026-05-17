"use client";

import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// Approximate % positions over the 800×450 canvas for geoEqualEarth scale=147
const PINS = [
  {
    id: "ar",
    pos: { x: 26, y: 70 },
    headline: "Economía en alza",
    source: "Infobae · Buenos Aires",
    startFrame: 20,
  },
  {
    id: "us",
    pos: { x: 17, y: 37 },
    headline: "Markets at record high",
    source: "AP News · Washington",
    startFrame: 58,
  },
  {
    id: "es",
    pos: { x: 46, y: 36 },
    headline: "Madrid lidera la Liga",
    source: "El País · Madrid",
    startFrame: 96,
  },
  {
    id: "de",
    pos: { x: 50, y: 28 },
    headline: "EU summit in Berlin",
    source: "Der Spiegel · Berlín",
    startFrame: 134,
  },
];

export function NewsMapIntro({
  locale = "es",
  topology = {},
}: {
  locale?: string;
  topology?: Record<string, unknown>;
}) {
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

  const taglineOpacity = interpolate(frame, [165, 188], [0, 1], {
    extrapolateRight: "clamp",
  });
  const taglineY = interpolate(frame, [165, 188], [16, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f0f" }}>
      {/* World map — just background geography */}
      <div style={{ position: "absolute", inset: 0 }}>
        <ComposableMap
          projectionConfig={{ scale: 147 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={topology}>
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
        </ComposableMap>
      </div>

      {/* HTML pin layer — avoids SVG coordinate system issues */}
      {PINS.map((pin) => {
        const pf = frame - pin.startFrame;
        if (pf < 0) return null;

        const dotScale = spring({
          fps,
          frame: pf,
          config: { damping: 12, stiffness: 260 },
        });

        const cardOpacity = interpolate(pf, [8, 22], [0, 1], {
          extrapolateRight: "clamp",
        });
        const cardDx = interpolate(pf, [8, 22], [-8, 0], {
          extrapolateRight: "clamp",
        });

        // Repeating pulse ring
        const rf = pf % 55;
        const ringScale = interpolate(rf, [0, 55], [1, 3], {
          extrapolateRight: "clamp",
        });
        const ringOpacity = interpolate(rf, [0, 55], [0.6, 0], {
          extrapolateRight: "clamp",
        });

        const dotSize = 10 * dotScale;

        return (
          <div
            key={pin.id}
            style={{
              position: "absolute",
              left: `${pin.pos.x}%`,
              top: `${pin.pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Pulse ring */}
            <div
              style={{
                position: "absolute",
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "1.5px solid #4a9eff",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${ringScale})`,
                opacity: ringOpacity,
              }}
            />

            {/* Dot */}
            <div
              style={{
                position: "absolute",
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                backgroundColor: "#4a9eff",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* Headline card */}
            <div
              style={{
                position: "absolute",
                left: 14,
                top: -22,
                width: 168,
                background: "rgba(20,20,20,0.92)",
                border: "1px solid #383838",
                borderRadius: 6,
                padding: "5px 9px",
                opacity: cardOpacity,
                transform: `translateX(${cardDx}px)`,
                pointerEvents: "none",
              }}
            >
              <p
                style={{
                  color: "#e8e8e8",
                  fontSize: 11,
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.3,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {pin.headline}
              </p>
              <p
                style={{
                  color: "#666",
                  fontSize: 9,
                  margin: "3px 0 0",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {pin.source}
              </p>
            </div>
          </div>
        );
      })}

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
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
            fontFamily: "system-ui, sans-serif",
            textShadow: "0 2px 32px rgba(0,0,0,0.9)",
          }}
        >
          {tagline}
        </p>
        <p
          style={{
            color: "#555",
            fontSize: 13,
            margin: "5px 0 0",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {sub}
        </p>
      </div>
    </AbsoluteFill>
  );
}

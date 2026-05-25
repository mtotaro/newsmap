"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const PINS = [
  {
    id: "ar",
    pos: { x: 26, y: 70 },
    headline: "Economía en alza",
    source: "Infobae · Buenos Aires",
    delay: 500,
  },
  {
    id: "us",
    pos: { x: 17, y: 37 },
    headline: "Markets at record high",
    source: "AP News · Washington",
    delay: 1300,
  },
  {
    id: "es",
    pos: { x: 46, y: 36 },
    headline: "Madrid lidera la Liga",
    source: "El País · Madrid",
    delay: 2100,
  },
  {
    id: "de",
    pos: { x: 50, y: 28 },
    headline: "EU summit in Berlin",
    source: "Der Spiegel · Berlín",
    delay: 2900,
  },
];

const TAGLINE_DELAY = 4000;
const DONE_DELAY = 5800;

type Props = {
  locale: string;
  /** May be null while fetching — map renders as solid dark until ready */
  topology: Record<string, unknown> | null;
  onDone: () => void;
};

export function NewsMapIntro({ locale, topology, onDone }: Props) {
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    PINS.forEach((pin) => {
      timers.push(
        setTimeout(() => {
          setVisiblePins((prev) => new Set([...prev, pin.id]));
        }, pin.delay)
      );
    });

    timers.push(setTimeout(() => setShowTagline(true), TAGLINE_DELAY));
    timers.push(setTimeout(() => onDone(), DONE_DELAY));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const tagline =
    locale === "en"
      ? "Your world news, on the map"
      : "Tus noticias del mundo, en el mapa";
  const sub =
    locale === "en"
      ? "Pick your sources. No algorithm."
      : "Elige tus fuentes. Sin algoritmos.";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0f0f0f",
        overflow: "hidden",
      }}
    >
      {/* Keyframe for pulse ring — scoped to this component */}
      <style>{`
        @keyframes nm-ping {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0;   }
        }
      `}</style>

      {/* World map — renders once when topology arrives */}
      {topology && Object.keys(topology).length > 0 && (
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
      )}

      {/* Pins layer — animates independently of topology load */}
      {PINS.map((pin) => {
        const visible = visiblePins.has(pin.id);
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
            {/* Pulsing ring */}
            {visible && (
              <div
                style={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "1.5px solid #4a9eff",
                  top: "50%",
                  left: "50%",
                  animation: "nm-ping 1.5s ease-out infinite",
                }}
              />
            )}

            {/* Dot — spring-like pop via cubic-bezier */}
            <div
              style={{
                position: "absolute",
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#4a9eff",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${visible ? 1 : 0})`,
                transition:
                  "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />

            {/* Headline card — slides in from left */}
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
                opacity: visible ? 1 : 0,
                transform: `translateX(${visible ? 0 : -10}px)`,
                transition:
                  "opacity 0.4s ease 0.15s, transform 0.4s ease 0.15s",
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

      {/* Tagline — fades up after all pins */}
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: showTagline ? 1 : 0,
          transform: `translateY(${showTagline ? 0 : 16}px)`,
          transition: "opacity 0.7s ease, transform 0.7s ease",
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
    </div>
  );
}

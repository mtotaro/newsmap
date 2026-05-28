"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

type PinConfig = {
  id: string;
  pos: { x: number; y: number };
  headline: string;
  source: string;
  delay: {
    desktop: number;
    mobile: number;
  };
  cardOffset: {
    desktop: { x: number; y: number };
    mobile: { x: number; y: number };
  };
};

const PINS = [
  {
    id: "ar",
    pos: { x: 26, y: 70 },
    headline: "Economía en alza",
    source: "Infobae · Buenos Aires",
    delay: { desktop: 500, mobile: 280 },
    cardOffset: {
      desktop: { x: 14, y: -22 },
      mobile: { x: 10, y: -52 },
    },
  },
  {
    id: "us",
    pos: { x: 17, y: 37 },
    headline: "Markets at record high",
    source: "AP News · Washington",
    delay: { desktop: 1300, mobile: 900 },
    cardOffset: {
      desktop: { x: 14, y: -22 },
      mobile: { x: 10, y: 12 },
    },
  },
  {
    id: "es",
    pos: { x: 46, y: 36 },
    headline: "Madrid lidera la Liga",
    source: "El País · Madrid",
    delay: { desktop: 2100, mobile: 1520 },
    cardOffset: {
      desktop: { x: 14, y: -22 },
      mobile: { x: -138, y: -8 },
    },
  },
  {
    id: "de",
    pos: { x: 50, y: 28 },
    headline: "EU summit in Berlin",
    source: "Der Spiegel · Berlín",
    delay: { desktop: 2900, mobile: 2140 },
    cardOffset: {
      desktop: { x: 14, y: -22 },
      mobile: { x: -138, y: -54 },
    },
  },
] as const satisfies readonly PinConfig[];

const INTRO_LAYOUT = {
  desktop: {
    taglineDelay: 4000,
    doneDelay: 5800,
    mapScale: 147,
    dotSize: 10,
    ringSize: 14,
    taglineBottom: "14%",
    cardWidth: 168,
  },
  mobile: {
    taglineDelay: 3000,
    doneDelay: 4500,
    mapScale: 126,
    dotSize: 8,
    ringSize: 12,
    taglineBottom: "18%",
    cardWidth: 132,
  },
} as const;

type Props = {
  locale: string;
  /** May be null while fetching — map renders as solid dark until ready */
  topology: Record<string, unknown> | null;
  onDone: () => void;
};

function isCompactViewport() {
  return typeof globalThis.window !== "undefined" && globalThis.window.innerWidth <= 640;
}

export function NewsMapIntro({ locale, topology, onDone }: Readonly<Props>) {
  const [isCompact, setIsCompact] = useState(
    () => isCompactViewport()
  );
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [showTagline, setShowTagline] = useState(false);
  const layout = isCompact ? INTRO_LAYOUT.mobile : INTRO_LAYOUT.desktop;

  const revealPin = (pinId: string) => {
    setVisiblePins((prev) => {
      const next = new Set(prev);
      next.add(pinId);
      return next;
    });
    setActivePinId(pinId);
  };

  useEffect(() => {
    if (typeof globalThis.window === "undefined") {
      return;
    }

    const handleResize = () => {
      setIsCompact(isCompactViewport());
    };

    handleResize();
    globalThis.window.addEventListener("resize", handleResize);

    return () => globalThis.window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setVisiblePins(new Set());
    setActivePinId(null);
    setShowTagline(false);

    const timers: ReturnType<typeof setTimeout>[] = [];
    const queueTimer = (callback: () => void, delay: number) => {
      timers.push(setTimeout(callback, delay));
    };

    PINS.forEach((pin) => {
      queueTimer(
        () => {
          revealPin(pin.id);
        },
        isCompact ? pin.delay.mobile : pin.delay.desktop
      );
    });

    if (isCompact) {
      queueTimer(
        () => {
          setActivePinId(null);
        },
        layout.taglineDelay - 220
      );
    }

    queueTimer(() => setShowTagline(true), layout.taglineDelay);
    queueTimer(() => onDone(), layout.doneDelay);

    return () => timers.forEach(clearTimeout);
  }, [isCompact, layout.doneDelay, layout.taglineDelay, onDone]);

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
        background:
          "radial-gradient(circle at 50% 35%, rgba(34, 53, 76, 0.52) 0%, #101216 38%, #08090b 100%)",
        overflow: "hidden",
      }}
    >
      {/* Keyframe for pulse ring — scoped to this component */}
      <style>{`
        @keyframes nm-ping {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0;   }
        }
        .nm-headline-card {
          max-width: min(168px, calc(100vw - 52px));
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .nm-headline-card-title {
          display: -webkit-box;
          overflow: hidden;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
        @media (max-width: 640px) {
          .nm-headline-card {
            width: min(132px, calc(100vw - 48px)) !important;
            border-radius: 12px !important;
            padding: 6px 8px !important;
          }
          .nm-headline-card-title {
            font-size: 10px !important;
            line-height: 1.25 !important;
          }
          .nm-headline-card-source {
            display: none;
          }
          .nm-tagline {
            font-size: 24px !important;
            padding: 0 24px;
          }
          .nm-subtagline {
            font-size: 12px !important;
            padding: 0 28px;
          }
        }
      `}</style>

      {/* World map — renders once when topology arrives.
          We use the default `preserveAspectRatio` ("meet") so the map keeps
          its proportions and the pin coordinates (which are in % of viewBox)
          stay accurate across portrait/landscape mobile and desktop. */}
      {topology && Object.keys(topology).length > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: 0.94 }}>
          <ComposableMap
            projectionConfig={{ scale: layout.mapScale }}
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
        const showCard = visible && (!isCompact || activePinId === pin.id);
        const cardOffset = isCompact ? pin.cardOffset.mobile : pin.cardOffset.desktop;
        const cardRestX = cardOffset.x >= 0 ? -10 : 10;
        const cardRestY = showCard ? 0 : 6;

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
                  width: layout.ringSize,
                  height: layout.ringSize,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(120, 186, 255, 0.95)",
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
                width: layout.dotSize,
                height: layout.dotSize,
                borderRadius: "50%",
                backgroundColor: "#4a9eff",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${visible ? 1 : 0})`,
                boxShadow: "0 0 0 5px rgba(74, 158, 255, 0.12), 0 0 18px rgba(74, 158, 255, 0.45)",
                transition:
                  "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />

            {/* Headline card — desktop keeps revealed cards visible; mobile
                shows only the active one so the dots never turn into a pileup. */}
            <div
              className="nm-headline-card"
              style={{
                position: "absolute",
                left: cardOffset.x,
                top: cardOffset.y,
                width: layout.cardWidth,
                background: "rgba(15, 17, 21, 0.88)",
                border: "1px solid rgba(120, 186, 255, 0.16)",
                borderRadius: 10,
                padding: "6px 9px",
                opacity: showCard ? 1 : 0,
                transform: `translate(${showCard ? 0 : cardRestX}px, ${cardRestY}px) scale(${showCard ? 1 : 0.96})`,
                transition:
                  "opacity 0.35s ease 0.1s, transform 0.35s ease 0.1s",
                pointerEvents: "none",
              }}
            >
              <p
                className="nm-headline-card-title"
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
                className="nm-headline-card-source"
                style={{
                  color: "#90a7bf",
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
          bottom: layout.taglineBottom,
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
          className="nm-tagline"
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
          className="nm-subtagline"
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

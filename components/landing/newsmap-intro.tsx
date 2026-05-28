"use client";

import { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

type PinConfig = {
  id: string;
  coordinates: [number, number];
  headline: string;
  source: string;
  delay: {
    desktop: number;
    mobile: number;
  };
  desktopCardOffset: { x: number; y: number };
};

const MAP_WIDTH = 920;
const MAP_HEIGHT = 520;

const PINS = [
  {
    id: "ar",
    coordinates: [-58.3816, -34.6037],
    headline: "Economía en alza",
    source: "Infobae · Buenos Aires",
    delay: { desktop: 500, mobile: 280 },
    desktopCardOffset: { x: 18, y: -18 },
  },
  {
    id: "us",
    coordinates: [-77.0369, 38.9072],
    headline: "Markets at record high",
    source: "AP News · Washington",
    delay: { desktop: 1300, mobile: 900 },
    desktopCardOffset: { x: 18, y: -16 },
  },
  {
    id: "es",
    coordinates: [-3.7038, 40.4168],
    headline: "Madrid lidera la Liga",
    source: "El País · Madrid",
    delay: { desktop: 2100, mobile: 1520 },
    desktopCardOffset: { x: 18, y: 12 },
  },
  {
    id: "de",
    coordinates: [13.405, 52.52],
    headline: "EU summit in Berlin",
    source: "Der Spiegel · Berlín",
    delay: { desktop: 2900, mobile: 2140 },
    desktopCardOffset: { x: 18, y: -42 },
  },
] as const satisfies readonly PinConfig[];

const INTRO_LAYOUT = {
  desktop: {
    taglineDelay: 4000,
    doneDelay: 5800,
    mapScale: 150,
    mapInset: { top: "0%", right: "0%", bottom: "0%", left: "0%" },
    dotRadius: 5,
    ringStartRadius: 8,
    ringEndRadius: 24,
    taglineBottom: "14%",
    storyBottom: "23%",
    cardWidth: 170,
    cardHeight: 46,
  },
  mobile: {
    taglineDelay: 3000,
    doneDelay: 4500,
    mapScale: 160,
    mapInset: { top: "5%", right: "0%", bottom: "34%", left: "0%" },
    dotRadius: 4.5,
    ringStartRadius: 7,
    ringEndRadius: 20,
    storyBottom: "23%",
    taglineBottom: "11%",
    cardWidth: 170,
    cardHeight: 46,
  },
} as const;

type IntroLayout = (typeof INTRO_LAYOUT)[keyof typeof INTRO_LAYOUT];

type Props = {
  locale: string;
  /** May be null while fetching — map renders as solid dark until ready */
  topology: Record<string, unknown> | null;
  onDone: () => void;
};

type IntroSequenceProps = Readonly<Props & {
  isCompact: boolean;
  layout: IntroLayout;
}>;

function isCompactViewport() {
  return typeof globalThis.window !== "undefined" && globalThis.window.innerWidth <= 640;
}

function IntroSequence({
  locale,
  topology,
  onDone,
  isCompact,
  layout,
}: IntroSequenceProps) {
  const [visiblePins, setVisiblePins] = useState<Set<string>>(new Set());
  const [activePinId, setActivePinId] = useState<string | null>(null);
  const [showTagline, setShowTagline] = useState(false);
  const activePin = activePinId
    ? PINS.find((pin) => pin.id === activePinId) ?? null
    : null;

  const revealPin = (pinId: string) => {
    setVisiblePins((prev) => {
      const next = new Set(prev);
      next.add(pinId);
      return next;
    });
    setActivePinId(pinId);
  };

  useEffect(() => {
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
          transition: opacity 0.3s ease;
        }
        @media (max-width: 640px) {
          .nm-tagline {
            font-size: 18px !important;
            line-height: 1.15 !important;
            padding: 0 20px;
          }
          .nm-subtagline {
            font-size: 11px !important;
            padding: 0 22px;
          }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: layout.mapInset.top,
          right: layout.mapInset.right,
          bottom: layout.mapInset.bottom,
          left: layout.mapInset.left,
          opacity: 0.96,
        }}
      >
        <ComposableMap
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          projectionConfig={{ scale: layout.mapScale }}
          style={{ width: "100%", height: "100%" }}
        >
          {topology && Object.keys(topology).length > 0 && (
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
          )}

          {PINS.map((pin) => {
            const visible = visiblePins.has(pin.id);
            const showCard = visible && !isCompact;

            return (
              <Marker key={pin.id} coordinates={pin.coordinates}>
                <g>
                  {visible && (
                    <circle
                      r={layout.ringStartRadius}
                      fill="none"
                      stroke="rgba(120, 186, 255, 0.95)"
                      strokeWidth="1.5"
                    >
                      <animate
                        attributeName="r"
                        from={String(layout.ringStartRadius)}
                        to={String(layout.ringEndRadius)}
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.7"
                        to="0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  <circle
                    r={layout.dotRadius + 5}
                    fill="rgba(74, 158, 255, 0.14)"
                    opacity={visible ? 1 : 0}
                    style={{ transition: "opacity 0.2s ease-out" }}
                  />
                  <circle
                    r={layout.dotRadius}
                    fill="#4a9eff"
                    opacity={visible ? 1 : 0}
                    style={{ transition: "opacity 0.2s ease-out" }}
                  />

                  {!isCompact && (
                    <g
                      className="nm-headline-card"
                      transform={`translate(${pin.desktopCardOffset.x} ${pin.desktopCardOffset.y})`}
                      opacity={showCard ? 1 : 0}
                    >
                      <rect
                        width={layout.cardWidth}
                        height={layout.cardHeight}
                        rx="12"
                        fill="rgba(15, 17, 21, 0.9)"
                        stroke="rgba(120, 186, 255, 0.16)"
                      />
                      <text
                        x="12"
                        y="18"
                        fill="#e8e8e8"
                        fontSize="11"
                        fontWeight="700"
                        fontFamily="system-ui, sans-serif"
                      >
                        {pin.headline}
                      </text>
                      <text
                        x="12"
                        y="32"
                        fill="#90a7bf"
                        fontSize="9"
                        fontFamily="system-ui, sans-serif"
                      >
                        {pin.source}
                      </text>
                    </g>
                  )}
                </g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {isCompact && activePin && !showTagline && (
        <div
          key={activePin.id}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: layout.storyBottom,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "min(320px, calc(100vw - 32px))",
              borderRadius: 16,
              border: "1px solid rgba(120, 186, 255, 0.14)",
              background: "rgba(15, 17, 21, 0.9)",
              padding: "12px 14px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.28)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#e8e8e8",
                fontSize: 15,
                fontWeight: 700,
                lineHeight: 1.3,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {activePin.headline}
            </p>
            <p
              style={{
                margin: "5px 0 0",
                color: "#90a7bf",
                fontSize: 11,
                lineHeight: 1.35,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {activePin.source}
            </p>
          </div>
        </div>
      )}

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

export function NewsMapIntro({ locale, topology, onDone }: Readonly<Props>) {
  const [isCompact, setIsCompact] = useState(
    () => isCompactViewport()
  );
  const layout = isCompact ? INTRO_LAYOUT.mobile : INTRO_LAYOUT.desktop;

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

  return (
    <IntroSequence
      key={isCompact ? "compact" : "desktop"}
      locale={locale}
      topology={topology}
      onDone={onDone}
      isCompact={isCompact}
      layout={layout}
    />
  );
}

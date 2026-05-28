type Props = {
  locale: string;
};

const SIGNALS = [
  { id: "ar", label: "Buenos Aires", left: "28%", top: "69%", delay: "0s" },
  { id: "us", label: "Washington", left: "19%", top: "38%", delay: "0.3s" },
  { id: "eu", label: "Madrid", left: "47%", top: "34%", delay: "0.6s" },
] as const;

export function LandingIntroFallback({ locale }: Readonly<Props>) {
  const title = locale === "en"
    ? "Your world news, on the map"
    : "Tus noticias del mundo, en el mapa";
  const subtitle = locale === "en"
    ? "Loading live sources..."
    : "Cargando fuentes en vivo...";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 35%, rgba(34, 53, 76, 0.52) 0%, #101216 38%, #08090b 100%)",
      }}
    >
      <style>{`
        @keyframes nm-fallback-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
          50% { transform: translate(-50%, -50%) scale(1.75); opacity: 0.1; }
        }
        @keyframes nm-fallback-dot {
          0%, 100% { transform: translate(-50%, -50%) scale(0.9); }
          50% { transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes nm-fallback-fade {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.9; }
        }
        .nm-fallback-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(120, 186, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 186, 255, 0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at center, black, transparent 78%);
          opacity: 0.35;
        }
        .nm-fallback-blob {
          position: absolute;
          width: min(64vw, 720px);
          aspect-ratio: 1.6;
          left: 50%;
          top: 48%;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: radial-gradient(circle, rgba(74, 158, 255, 0.14), transparent 70%);
          filter: blur(24px);
          opacity: 0.8;
        }
        .nm-fallback-signal {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #6eb1ff;
          box-shadow: 0 0 0 6px rgba(74, 158, 255, 0.14), 0 0 20px rgba(74, 158, 255, 0.42);
          animation: nm-fallback-dot 1.5s ease-in-out infinite;
        }
        .nm-fallback-ring {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          border: 1px solid rgba(120, 186, 255, 0.85);
          animation: nm-fallback-pulse 1.6s ease-out infinite;
        }
        .nm-fallback-chip {
          position: absolute;
          top: -12px;
          left: 12px;
          padding: 5px 8px;
          border-radius: 999px;
          background: rgba(15, 17, 21, 0.82);
          border: 1px solid rgba(120, 186, 255, 0.14);
          color: rgba(232, 232, 232, 0.82);
          font: 500 10px/1.1 system-ui, sans-serif;
          white-space: nowrap;
          animation: nm-fallback-fade 1.6s ease-in-out infinite;
        }
        .nm-fallback-copy {
          position: absolute;
          left: 50%;
          bottom: max(14%, 88px);
          transform: translateX(-50%);
          width: min(420px, calc(100vw - 48px));
          text-align: center;
          color: #e8e8e8;
        }
        .nm-fallback-title {
          margin: 0;
          font: 700 clamp(1.6rem, 3vw, 2.15rem)/1.1 system-ui, sans-serif;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 32px rgba(0, 0, 0, 0.9);
        }
        .nm-fallback-subtitle {
          margin: 10px 0 0;
          font: 500 12px/1.4 system-ui, sans-serif;
          color: #9bb0c7;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        @media (max-width: 640px) {
          .nm-fallback-grid {
            background-size: 40px 40px;
          }
          .nm-fallback-chip {
            font-size: 9px;
            padding: 4px 7px;
            left: 10px;
          }
          .nm-fallback-copy {
            bottom: max(18%, 110px);
            width: calc(100vw - 40px);
          }
          .nm-fallback-subtitle {
            letter-spacing: 0.04em;
          }
        }
      `}</style>

      <div className="nm-fallback-grid" />
      <div className="nm-fallback-blob" />

      {SIGNALS.map((signal) => (
        <div
          key={signal.id}
          style={{
            position: "absolute",
            left: signal.left,
            top: signal.top,
          }}
        >
          <div
            className="nm-fallback-ring"
            style={{ animationDelay: signal.delay }}
          />
          <div
            className="nm-fallback-signal"
            style={{ animationDelay: signal.delay }}
          />
          <div
            className="nm-fallback-chip"
            style={{ animationDelay: signal.delay }}
          >
            {signal.label}
          </div>
        </div>
      ))}

      <div className="nm-fallback-copy">
        <p className="nm-fallback-title">{title}</p>
        <p className="nm-fallback-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
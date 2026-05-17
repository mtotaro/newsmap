"use client";

import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { NewsMapIntro } from "./newsmap-intro";

type Props = {
  locale: string;
  onDone: () => void;
};

export default function AnimatedLanding({ locale, onDone }: Props) {
  const playerRef = useRef<PlayerRef>(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.addEventListener("ended", onDone);
    return () => player.removeEventListener("ended", onDone);
  }, [onDone]);

  return (
    <>
      <Player
        ref={playerRef}
        component={NewsMapIntro}
        inputProps={{ locale }}
        durationInFrames={215}
        fps={30}
        compositionWidth={800}
        compositionHeight={450}
        style={{ width: "100%", height: "100%" }}
        autoPlay
      />
      <button
        onClick={onDone}
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          background: "none",
          border: "none",
          color: "#444",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "0.03em",
          padding: "4px 8px",
          transition: "color 0.2s",
          zIndex: 10,
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "#888")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "#444")
        }
      >
        Saltar →
      </button>
    </>
  );
}

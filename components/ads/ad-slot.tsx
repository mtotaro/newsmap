"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type Props = {
  slot: string;
  /** "infeed" → fluid in-feed unit. "display" → responsive display unit for sidebars. */
  variant?: "infeed" | "display";
  className?: string;
};

const PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_ID ?? "ca-pub-5899330070144720";

export function AdSlot({ slot, variant = "infeed", className = "" }: Props) {
  useEffect(() => {
    if (!slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not loaded yet
    }
  }, [slot]);

  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`flex items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-dashed border-[var(--color-border)] select-none ${variant === "display" ? "min-h-[250px]" : "h-[90px]"} ${className}`}
        aria-hidden="true"
      >
        <span className="text-xs text-[var(--color-text-3)] text-center px-2">
          {variant === "display" ? "Display ad" : "In-feed ad"}
          {slot ? ` · ${slot}` : " · slot not set"}
        </span>
      </div>
    );
  }

  if (!slot) return null;

  if (variant === "display") {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={PUBLISHER_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
      />
    </div>
  );
}

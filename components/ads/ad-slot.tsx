"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[];
  }
}

type Props = {
  /** AdSense ad slot ID (data-ad-slot). */
  slot: string;
  /** Optional Tailwind classes for the wrapper div. */
  className?: string;
};

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID; // e.g. "ca-pub-1234567890"

/**
 * Renders a single AdSense in-feed unit.
 *
 * - Requires NEXT_PUBLIC_ADSENSE_ID in env to activate.
 * - In development, shows a placeholder box even without the env var so you
 *   can verify layout before applying for AdSense.
 * - Returns null in production when NEXT_PUBLIC_ADSENSE_ID is not set.
 */
export function AdSlot({ slot, className = "" }: Props) {
  useEffect(() => {
    if (!PUBLISHER_ID) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Script not ready yet — AdSense will re-scan on load
    }
  }, []);

  // Development placeholder — visible even without a real publisher ID
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        className={`flex items-center justify-center h-[90px] rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-dashed border-[var(--color-border)] select-none ${className}`}
        aria-hidden="true"
      >
        <span className="text-xs text-[var(--color-text-3)]">
          Ad slot {slot ? `· ${slot}` : "(NEXT_PUBLIC_ADSENSE_SLOT_FEED not set)"}
        </span>
      </div>
    );
  }

  // Production: no publisher ID → don't render anything
  if (!PUBLISHER_ID) return null;

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

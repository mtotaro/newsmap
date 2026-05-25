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

// Public publisher ID — same value hardcoded in layout.tsx.
// NEXT_PUBLIC_ADSENSE_ID env var kept for local overrides.
const PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_ID ?? "ca-pub-5899330070144720";

/**
 * Renders a single AdSense in-feed unit.
 *
 * - In development, shows a placeholder so you can verify layout.
 * - In production, ads only appear once AdSense approves the site
 *   and NEXT_PUBLIC_ADSENSE_SLOT_FEED is set to a valid slot ID.
 */
export function AdSlot({ slot, className = "" }: Props) {
  useEffect(() => {
    if (!slot) return; // no slot ID yet — skip push
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script not ready yet
    }
  }, [slot]);

  // Development placeholder — always visible so layout is testable
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

  // No slot ID yet → render nothing (avoids blank <ins> that confuses AdSense)
  if (!slot) return null;

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

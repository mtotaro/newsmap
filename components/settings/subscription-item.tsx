"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FLAG_MAP: Record<string, string> = {
  AR: "🇦🇷", BR: "🇧🇷", CL: "🇨🇱", CO: "🇨🇴", PE: "🇵🇪",
  MX: "🇲🇽", US: "🇺🇸", GB: "🇬🇧", ES: "🇪🇸", FR: "🇫🇷",
  DE: "🇩🇪", IT: "🇮🇹", QA: "🇶🇦",
};

export type SubscriptionData = {
  source_id: string;
  source_name: string;
  source_slug: string;
  country_code: string;
  logo_url: string | null;
  section_keys: string[] | null;
};

type Props = {
  sub: SubscriptionData;
  removeLabel: string;
  allSectionsLabel: string;
};

export function SubscriptionItem({ sub, removeLabel, allSectionsLabel }: Props) {
  const [removed, setRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setLoading(true);
    try {
      await fetch("/api/subscriptions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sub.source_id }),
      });
      setRemoved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (removed) return null;

  const flag = FLAG_MAP[sub.country_code] ?? "🗞";
  const sectionSummary =
    sub.section_keys && sub.section_keys.length > 0
      ? sub.section_keys.join(", ")
      : allSectionsLabel;

  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="text-xl leading-none mt-0.5">{flag}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text)] font-medium">
          {sub.source_name}
        </p>
        <p className="text-xs text-[var(--color-text-2)] mt-0.5 truncate">
          {sectionSummary}
        </p>
      </div>
      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-xs text-[var(--color-red)] hover:opacity-70 disabled:opacity-40 transition-opacity mt-0.5 shrink-0"
      >
        {loading ? "…" : removeLabel}
      </button>
    </div>
  );
}

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
};

type Props = {
  sub: SubscriptionData;
  removeLabel: string;
};

export function SubscriptionItem({ sub, removeLabel }: Props) {
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

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-xl leading-none">{flag}</span>
      <span className="flex-1 text-sm text-[var(--color-text)]">
        {sub.source_name}
      </span>
      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-xs text-[var(--color-red)] hover:opacity-70 disabled:opacity-40 transition-opacity"
      >
        {loading ? "…" : removeLabel}
      </button>
    </div>
  );
}

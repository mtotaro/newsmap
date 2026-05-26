"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useStreak } from "@/lib/storage/use-streak";
import { useWeeklyCount } from "@/lib/storage/use-weekly-count";

/**
 * Small habit badge for the nav: "🔥 5 · 27 leídos". Renders nothing on
 * SSR / before mount to avoid hydration mismatch (numbers come from
 * localStorage, which is per-client). Once hydrated, fades in.
 */
export function StatsBadge() {
  const t = useTranslations("Habits");
  const [mounted, setMounted] = useState(false);
  const streak = useStreak();
  const { count } = useWeeklyCount();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional SSR hydration guard
    setMounted(true);
  }, []);

  // Hide entirely on first paint (avoid layout shift + hydration mismatch).
  // Also hide for users who haven't built up any signal yet — no
  // "Day 1 · 0 read" noise on their first visit.
  if (!mounted || (streak <= 1 && count === 0)) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 text-[11px] text-[var(--color-text-3)] mr-2 fade-in-up">
      {streak >= 2 && (
        <span
          className="flex items-center gap-1 uppercase tracking-wider"
          title={t("streak_title")}
        >
          <span className="text-[var(--color-accent)]">🔥</span>
          <span className="font-semibold text-[var(--color-text-2)]">
            {t("streak_short", { count: streak })}
          </span>
        </span>
      )}
      {count > 0 && (
        <>
          {streak >= 2 && <span className="opacity-30">·</span>}
          <span
            className="uppercase tracking-wider"
            title={t("read_this_week_title")}
          >
            {t("read_this_week_short", { count })}
          </span>
        </>
      )}
    </div>
  );
}

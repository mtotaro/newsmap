"use client";

import { useTranslations } from "next-intl";
import { useSaved } from "@/lib/storage/use-saved";

type Props = {
  locale: string;
};

/**
 * Reward state shown when the user has scrolled to the bottom of the feed.
 * Replaces the previous single "·" character with a calmer "you're caught up"
 * moment + CTAs to keep them on-site (map, saved, refresh).
 */
export function EndOfFeed({ locale }: Props) {
  const t = useTranslations("Habits");
  const { items: saved } = useSaved();

  return (
    <div className="text-center py-10 border-t border-[var(--color-border)] mt-4">
      {/* Ornamental rule — newspaper end-of-section flourish */}
      <div
        className="mx-auto mb-4 text-[var(--color-text-3)] tracking-[1em] text-sm select-none"
        aria-hidden="true"
      >
        ❦
      </div>

      <h3 className="font-display text-2xl text-[var(--color-text)] mb-2">
        {t("end_of_feed_title")}
      </h3>
      <p className="text-sm text-[var(--color-text-2)] max-w-sm mx-auto px-4 leading-relaxed">
        {t("end_of_feed_desc")}
      </p>

      <div className="mt-5 flex items-center justify-center gap-2 flex-wrap px-4">
        <a
          href={`/${locale}/map`}
          className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors"
        >
          {t("end_of_feed_cta_map")}
        </a>
        {saved.length > 0 && (
          <a
            href={`/${locale}/saved`}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[var(--color-accent)] border border-[var(--color-accent)]/40 hover:border-[var(--color-accent)] transition-colors"
          >
            {t("end_of_feed_cta_saved", { count: saved.length })}
          </a>
        )}
        <button
          onClick={() => {
            window.dispatchEvent(new Event("feed:refresh"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors"
        >
          ↑ {t("end_of_feed_cta_top")}
        </button>
      </div>
    </div>
  );
}

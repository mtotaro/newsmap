"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSaved } from "@/lib/storage/use-saved";
import { SectionChip } from "@/components/ui/section-chip";
import { FLAG_MAP } from "@/lib/utils/flags";
import { timeAgo, truncate } from "@/lib/utils/time";
import type { SectionKey } from "@/lib/db/schema";

type Props = {
  locale: string;
};

/**
 * Renders the user's localStorage bookmark list as a newspaper-style feed.
 * No backend — everything reads from `useSaved`. Each item links out to the
 * publisher URL and supports inline removal.
 */
export function SavedList({ locale }: Props) {
  const t = useTranslations("Saved");
  const tSec = useTranslations("Sections");
  const { items, remove } = useSaved();

  // Skip first render to avoid hydration mismatch (items come from localStorage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-[720px] mx-auto py-10 px-4">
        <div className="h-7 w-40 bg-[var(--color-bg-3)] mb-6 skeleton" />
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[720px] mx-auto py-6 px-4">
      <header className="mb-6 pb-4 border-b border-[var(--color-accent)]">
        <p className="eyebrow text-[var(--color-accent)] mb-1">
          {t("eyebrow")}
        </p>
        <h1 className="font-display text-4xl text-[var(--color-text)] font-bold">
          {t("title")}
        </h1>
        {items.length > 0 && (
          <p className="mt-2 text-sm text-[var(--color-text-2)]">
            {t("count", { count: items.length })}
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-4 opacity-40">🔖</p>
          <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">
            {t("empty_title")}
          </h2>
          <p className="text-sm text-[var(--color-text-2)] max-w-sm mx-auto leading-relaxed">
            {t("empty_desc")}
          </p>
          <a
            href={`/${locale}/feed`}
            className="inline-block mt-5 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-[var(--color-ink)] border border-[var(--color-border)] hover:border-[var(--color-ink)] transition-colors"
          >
            {t("empty_cta")}
          </a>
        </div>
      ) : (
        <ul className="space-y-5">
          {items.map((item) => {
            const flag = FLAG_MAP[item.country_code] ?? "🗞";
            const desc = item.description ? truncate(item.description, 180) : null;
            return (
              <li
                key={item.id}
                className="fade-in-up border-b border-[var(--color-border)] pb-5 group"
              >
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 text-[11px] text-[var(--color-text-3)]">
                      <span className="eyebrow text-[var(--color-text-2)]">
                        {item.source_name}
                      </span>
                      <span className="opacity-30">·</span>
                      <SectionChip
                        section={item.section_key}
                        label={tSec(item.section_key as SectionKey)}
                      />
                      <span className="ml-auto shrink-0">
                        {t("saved_ago", { time: timeAgo(item.saved_at, locale) })}
                      </span>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block headline-serif text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors"
                      style={{ fontSize: "clamp(1.05rem, 2vw, 1.25rem)" }}
                    >
                      {item.title}
                    </a>

                    {desc && (
                      <p className="mt-1.5 text-[13.5px] text-[var(--color-text-2)] leading-snug line-clamp-2">
                        {desc}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[var(--color-text-3)]">
                      <span className="text-sm leading-none">{flag}</span>
                      <button
                        onClick={() => remove(item.id)}
                        className="ml-auto hover:text-[var(--color-accent)] transition-colors uppercase tracking-wider"
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0 w-[100px] sm:w-[120px]">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-[4/3] bg-[var(--color-bg-3)] overflow-hidden"
                    >
                      {item.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                          {flag}
                        </div>
                      )}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

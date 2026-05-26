"use client";

import { useTranslations } from "next-intl";
import { useHistory } from "@/lib/storage/use-history";
import { FLAG_MAP } from "@/lib/utils/flags";
import { CONTINUE_READING_LIMIT } from "@/lib/storage/types";

/**
 * Horizontal rail of the user's most recently read articles. Renders only
 * when there's at least one entry — keeps the page clean for first-time
 * visitors. Items link directly to the publisher URL (already marked read).
 */
export function ContinueReadingStrip() {
  const t = useTranslations("Habits");
  const { items } = useHistory();

  if (items.length === 0) return null;

  const visible = items.slice(0, CONTINUE_READING_LIMIT);

  return (
    <section className="px-4 py-2 border-b border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="eyebrow text-[var(--color-text-2)]">
          {t("continue_reading")}
        </h2>
        {items.length > CONTINUE_READING_LIMIT && (
          <span className="text-[10px] text-[var(--color-text-3)] uppercase tracking-wider">
            {items.length}
          </span>
        )}
      </div>

      {/* Horizontal scroll, ~3 cards visible per screen on mobile */}
      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 snap-x snap-mandatory scrollbar-hidden">
        {visible.map((entry) => {
          const flag = FLAG_MAP[entry.country_code] ?? "🗞";
          return (
            <a
              key={entry.id}
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 w-[150px] sm:w-[200px] snap-start group"
            >
              <div className="aspect-[16/10] bg-[var(--color-bg-3)] overflow-hidden mb-1.5">
                {entry.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">
                    {flag}
                  </div>
                )}
              </div>
              <p className="text-[12.5px] leading-tight text-[var(--color-text-2)] line-clamp-2 group-hover:text-[var(--color-text)] transition-colors">
                {entry.title}
              </p>
              <p className="text-[10px] text-[var(--color-text-3)] mt-0.5 uppercase tracking-wider">
                {entry.source_name}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

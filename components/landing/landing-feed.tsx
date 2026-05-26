"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArticleCard, type ArticleCardData } from "@/components/feed/article-card";
import { ArticleModal } from "@/components/feed/article-modal";
import type { SectionKey } from "@/lib/db/schema";

const SECTION_ORDER: SectionKey[] = [
  "politics", "economy", "world", "sports", "tech",
  "culture", "health", "science", "entertainment",
];

type Props = {
  items: ArticleCardData[];
  locale: string;
  sectionLabels: Record<string, string>;
  /** Show section filter chips at the top (true on source pages, false on section pages) */
  showSectionFilter?: boolean;
  emptyLabel: string;
};

/**
 * Shared list renderer for /section/[k] and /source/[slug] landing pages.
 *
 * Uses the same ArticleCard ("standard" variant) as the main feed, so the
 * visual identity stays consistent across all browse surfaces.
 */
export function LandingFeed({
  items,
  locale,
  sectionLabels,
  showSectionFilter = false,
  emptyLabel,
}: Props) {
  const tArt = useTranslations("Article");
  const tFeed = useTranslations("Feed");
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [previewArticle, setPreviewArticle] =
    useState<ArticleCardData | null>(null);

  // For source pages: surface the sections this source has covered, by count
  const availableSections = useMemo(() => {
    if (!showSectionFilter) return [];
    const counts = new Map<SectionKey, number>();
    for (const a of items) {
      const k = a.section_key as SectionKey;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return SECTION_ORDER.filter((k) => counts.has(k));
  }, [items, showSectionFilter]);

  const filtered = activeSection
    ? items.filter((a) => a.section_key === activeSection)
    : items;

  return (
    <>
      <ArticleModal
        article={previewArticle}
        onClose={() => setPreviewArticle(null)}
        locale={locale}
      />

      {showSectionFilter && availableSections.length > 1 && (
        <div className="max-w-[720px] mx-auto px-4 mb-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            <button
              onClick={() => setActiveSection(null)}
              className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                activeSection === null
                  ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                  : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
              }`}
            >
              {tFeed("filter_all")}
            </button>
            {availableSections.map((key) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                  activeSection === key
                    ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                    : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                }`}
              >
                {sectionLabels[key] ?? key}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-[720px] mx-auto px-4 pb-12 space-y-5">
        {filtered.length === 0 ? (
          <p className="text-center py-16 text-sm text-[var(--color-text-2)]">
            {emptyLabel}
          </p>
        ) : (
          filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              sectionLabel={
                sectionLabels[article.section_key as SectionKey] ??
                article.section_key
              }
              readLabel={tArt("read_full")}
              locale={locale}
              variant="standard"
              onOpenPreview={
                article.content_html &&
                article.content_html.replace(/<[^>]+>/g, "").trim().length > 350
                  ? setPreviewArticle
                  : undefined
              }
            />
          ))
        )}
      </div>
    </>
  );
}

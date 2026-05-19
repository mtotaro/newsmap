"use client";

import { useState, useMemo } from "react";
import { ArticleCard, type ArticleCardData } from "@/components/feed/article-card";
import type { SectionKey } from "@/lib/db/schema";

const SECTION_ORDER: SectionKey[] = [
  "politics", "economy", "world", "sports", "tech",
  "culture", "health", "science", "entertainment",
];

type Props = {
  items: ArticleCardData[];
  locale: string;
  filterAllLabel: string;
  readLabel: string;
  noArticlesLabel: string;
  sectionLabels: Record<string, string>;
  signupCta: string;
  signupDesc: string;
  signupBtn: string;
};

export function CountryNews({
  items,
  locale,
  filterAllLabel,
  readLabel,
  noArticlesLabel,
  sectionLabels,
  signupCta,
  signupDesc,
  signupBtn,
}: Props) {
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);

  // Only show section chips that have actual articles, ordered by count
  const availableSections = useMemo(() => {
    const counts = new Map<SectionKey, number>();
    for (const a of items) {
      const k = a.section_key as SectionKey;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return SECTION_ORDER.filter((k) => counts.has(k));
  }, [items]);

  const filtered = activeSection
    ? items.filter((a) => a.section_key === activeSection)
    : items;

  return (
    <div className="max-w-[640px] mx-auto pb-16 space-y-4">
      {/* Section filter chips */}
      {availableSections.length > 1 && (
        <div className="px-4 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            <button
              onClick={() => setActiveSection(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeSection === null
                  ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                  : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
              }`}
            >
              {filterAllLabel}
            </button>
            {availableSections.map((key) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeSection === key
                    ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                    : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
                }`}
              >
                {sectionLabels[key] ?? key}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Article list */}
      {filtered.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="text-[var(--color-text-2)]">{noArticlesLabel}</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              sectionLabel={sectionLabels[article.section_key] ?? article.section_key}
              readLabel={readLabel}
              locale={locale}
            />
          ))}
        </div>
      )}

      {/* Sign-up CTA */}
      <div className="mx-4 mt-6 rounded-[var(--radius-card)] bg-[var(--color-blue)]/10 border border-[var(--color-blue)]/30 p-6 text-center space-y-3">
        <p className="font-semibold text-[var(--color-text)]">{signupCta}</p>
        <p className="text-sm text-[var(--color-text-2)]">{signupDesc}</p>
        <a
          href={`/${locale}/auth`}
          className="inline-block px-6 py-2 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {signupBtn}
        </a>
      </div>
    </div>
  );
}

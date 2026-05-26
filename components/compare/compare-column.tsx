import { SectionChip } from "@/components/ui/section-chip";
import { timeAgo, truncate } from "@/lib/utils/time";
import type { SectionKey } from "@/lib/db/schema";

export type CompareItem = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  section_key: string;
  thumbnail_url: string | null;
  published_at: string;
  source_name: string;
  source_slug: string;
  cluster_key: string | null;
  /** True when this story's cluster also has members in the other country */
  isShared: boolean;
};

type Props = {
  countryName: string;
  countrySlug: string;
  flag: string;
  items: CompareItem[];
  locale: string;
  sectionLabels: Record<string, string>;
  sharedLabel: string;
  readLabel: string;
  emptyLabel: string;
};

/**
 * One column of the side-by-side country comparison. Renders a compact
 * newspaper-style list (no thumbnails — keeps both columns readable on
 * desktop) with shared-story highlights when an article's cluster spans
 * both countries.
 */
export function CompareColumn({
  countryName,
  countrySlug,
  flag,
  items,
  locale,
  sectionLabels,
  sharedLabel,
  readLabel,
  emptyLabel,
}: Props) {
  return (
    <section aria-label={countryName} className="min-w-0">
      {/* Column masthead — separates the two countries visually */}
      <header className="mb-4 pb-3 border-b border-[var(--color-text-3)]">
        <p className="eyebrow text-[var(--color-text-3)] mb-1">
          {countryName}
        </p>
        <a
          href={`/${locale}/news/${countrySlug}`}
          className="font-display text-2xl text-[var(--color-text)] flex items-center gap-2 hover:text-[var(--color-accent)] transition-colors group"
        >
          <span>{flag}</span>
          <span className="font-bold">{countryName}</span>
          <span
            className="ml-auto text-[10px] uppercase tracking-wider text-[var(--color-text-3)] group-hover:text-[var(--color-accent)] transition-colors"
            aria-hidden="true"
          >
            ↗
          </span>
        </a>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-2)] py-8 text-center">
          {emptyLabel}
        </p>
      ) : (
        <ul className="space-y-4">
          {items.map((item) => {
            const desc = item.description
              ? truncate(item.description, 140)
              : null;
            return (
              <li
                key={item.id}
                className={`pb-4 border-b border-[var(--color-border)] last:border-b-0 ${
                  item.isShared ? "fade-in-up" : ""
                }`}
              >
                {/* Shared-story badge — strongest visual signal on the page */}
                {item.isShared && (
                  <p className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold bg-[var(--color-accent)] text-white rounded-sm">
                    <span aria-hidden="true">↔</span>
                    {sharedLabel}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-2 mb-1 text-[11px] text-[var(--color-text-3)]">
                  <span className="eyebrow text-[var(--color-text-2)] truncate">
                    {item.source_name}
                  </span>
                  <SectionChip
                    section={item.section_key as SectionKey}
                    label={sectionLabels[item.section_key] ?? item.section_key}
                  />
                  <span className="ml-auto shrink-0">
                    {timeAgo(item.published_at, locale)}
                  </span>
                </div>

                {/* Headline */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block headline-serif text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
                  style={{ fontSize: "clamp(1rem, 1.6vw, 1.15rem)" }}
                >
                  {item.title}
                </a>

                {/* Description */}
                {desc && (
                  <p className="mt-1.5 text-[13px] text-[var(--color-text-2)] leading-snug line-clamp-2">
                    {desc}
                  </p>
                )}

                <p className="mt-2 text-right">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] uppercase tracking-wider text-[var(--color-ink)] font-semibold hover:underline"
                  >
                    {readLabel} →
                  </a>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

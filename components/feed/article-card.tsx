"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionChip } from "@/components/ui/section-chip";
import { timeAgo, truncate } from "@/lib/utils/time";
import { FLAG_MAP } from "@/lib/utils/flags";
import type { SectionKey } from "@/lib/db/schema";

/**
 * Returns true only when content:encoded has substantial text (not just a paywall teaser).
 * El País, AS and similar sources send short teasers ending in "Seguir leyendo" — we don't
 * want to show the "✦ full" badge for those.
 */
function hasRichContent(html: string | null): boolean {
  if (!html) return false;
  return html.replace(/<[^>]+>/g, "").trim().length > 350;
}

export type ArticleCardData = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  /** Sanitized HTML from <content:encoded> — null when the feed omits it */
  content_html: string | null;
  section_key: SectionKey;
  thumbnail_url: string | null;
  published_at: string;
  source_name: string;
  source_logo: string | null;
  source_slug: string;
  country_code: string;
};

/**
 * Visual variant for the card:
 *  - "lead":     hero treatment for the top story (large image, big serif headline, dek)
 *  - "standard": normal feed card (hairline rule, compact serif headline)
 */
export type ArticleCardVariant = "lead" | "standard";

type Props = {
  article: ArticleCardData;
  sectionLabel: string;
  readLabel: string;
  locale: string;
  /** Called when user clicks thumbnail or title — opens preview modal */
  onOpenPreview?: (article: ArticleCardData) => void;
  /** Show paywall disclaimer (NYT) */
  paywallNotice?: string;
  /** Card variant — defaults to "standard" */
  variant?: ArticleCardVariant;
  /** Hint to Next.js Image to prioritize the LCP image (use true for the lead card) */
  priority?: boolean;
};

export function ArticleCard({
  article,
  sectionLabel,
  readLabel,
  locale,
  onOpenPreview,
  paywallNotice,
  variant = "standard",
  priority = false,
}: Props) {
  const flag = FLAG_MAP[article.country_code] ?? "🗞";
  const ago = timeAgo(article.published_at, locale);
  const isLead = variant === "lead";

  // Lead gets a fuller dek; standard gets a short truncated one
  const description = article.description
    ? truncate(article.description, isLead ? 280 : 180)
    : null;

  const handlePreview = onOpenPreview
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenPreview(article);
      }
    : undefined;

  // ── Lead variant — hero treatment ─────────────────────────────────────────
  if (isLead) {
    return (
      <article className="fade-in-up border-b border-[var(--color-border)] pb-8 mb-2 group">
        {/* Eyebrow row: section · "última hora" badge · source */}
        <div className="flex items-center gap-2 mb-3">
          <span className="eyebrow text-[var(--color-accent)]">
            {sectionLabel}
          </span>
          <span className="opacity-30 text-xs">·</span>
          <span className="text-[11px] text-[var(--color-text-3)] uppercase tracking-wider font-semibold">
            {article.source_name}
          </span>
        </div>

        {/* Big hero image */}
        {handlePreview ? (
          <button
            onClick={handlePreview}
            className="block w-full text-left mb-4"
            aria-label={`Preview: ${article.title}`}
            tabIndex={-1}
          >
            <ThumbnailContent article={article} flag={flag} large priority={priority} />
          </button>
        ) : (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            className="block mb-4"
          >
            <ThumbnailContent article={article} flag={flag} large priority={priority} />
          </a>
        )}

        {/* Serif headline — the dominant visual element */}
        {handlePreview ? (
          <button
            onClick={handlePreview}
            className="block w-full text-left headline-serif text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors"
            style={{ fontSize: "clamp(1.65rem, 3.5vw, 2.4rem)" }}
          >
            {article.title}
          </button>
        ) : (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block headline-serif text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors"
            style={{ fontSize: "clamp(1.65rem, 3.5vw, 2.4rem)" }}
          >
            {article.title}
          </a>
        )}

        {/* Dek (subtitle paragraph) */}
        {description && (
          <p className="mt-3 text-[15px] text-[var(--color-text-2)] leading-relaxed">
            {description}
          </p>
        )}

        {/* Footer row: country flag · time · CTA */}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-[var(--color-text-3)]">
          <span className="text-base leading-none">{flag}</span>
          <span>{ago}</span>
          {paywallNotice && (
            <span className="text-[var(--color-yellow)] opacity-80">
              · {paywallNotice}
            </span>
          )}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-[var(--color-ink)] font-semibold hover:underline uppercase tracking-wider"
          >
            {readLabel} →
          </a>
        </div>
      </article>
    );
  }

  // ── Standard variant — newspaper-row treatment ────────────────────────────
  return (
    <article className="fade-in-up border-b border-[var(--color-border)] pb-5 group">
      <div className="flex gap-4">
        {/* Thumbnail on the right (newspaper convention: photo right of headline) */}
        <div className="flex-1 min-w-0">
          {/* Meta row — small caps eyebrow */}
          <div className="flex items-center gap-2 mb-1.5 text-[11px] text-[var(--color-text-3)]">
            <span className="eyebrow text-[var(--color-text-2)]">
              {article.source_name}
            </span>
            <span className="opacity-30">·</span>
            <SectionChip section={article.section_key} label={sectionLabel} />
            {hasRichContent(article.content_html) && (
              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-sm bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium leading-none uppercase tracking-wider">
                ✦ full
              </span>
            )}
            <span className="ml-auto shrink-0">{ago}</span>
          </div>

          {/* Title — serif */}
          {handlePreview ? (
            <button
              onClick={handlePreview}
              className="block w-full text-left headline-serif text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors"
              style={{ fontSize: "clamp(1.05rem, 2vw, 1.25rem)" }}
            >
              {article.title}
            </button>
          ) : (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block headline-serif text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors"
              style={{ fontSize: "clamp(1.05rem, 2vw, 1.25rem)" }}
            >
              {article.title}
            </a>
          )}

          {/* Description */}
          {description && (
            <p className="mt-1.5 text-[13.5px] text-[var(--color-text-2)] leading-snug line-clamp-2">
              {description}
            </p>
          )}

          {/* Paywall notice */}
          {paywallNotice && (
            <p className="mt-1 text-[11px] text-[var(--color-yellow)] opacity-80">
              {paywallNotice}
            </p>
          )}

          {/* CTA row */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-[var(--color-text-3)]">
            <span className="text-sm leading-none">{flag}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[var(--color-ink)] hover:underline"
            >
              {readLabel} →
            </a>
          </div>
        </div>

        {/* Thumbnail — fixed width on right (~140px) */}
        <div className="shrink-0 w-[120px] sm:w-[140px]">
          {handlePreview ? (
            <button
              onClick={handlePreview}
              className="block w-full text-left"
              aria-label={`Preview: ${article.title}`}
              tabIndex={-1}
            >
              <ThumbnailContent article={article} flag={flag} />
            </button>
          ) : (
            <a href={article.url} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
              <ThumbnailContent article={article} flag={flag} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ThumbnailContent({
  article,
  flag,
  large = false,
  priority = false,
}: {
  article: ArticleCardData;
  flag: string;
  /** Lead-card hero image */
  large?: boolean;
  /** Pass priority to Next.js Image for LCP optimization */
  priority?: boolean;
}) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      className={`relative ${
        large ? "aspect-[16/9]" : "aspect-[4/3]"
      } bg-[var(--color-bg-3)] overflow-hidden`}
    >
      {article.thumbnail_url ? (
        <Image
          src={article.thumbnail_url}
          alt=""
          fill
          sizes={large ? "(max-width: 768px) 100vw, 720px" : "140px"}
          className="object-cover"
          unoptimized={false}
          priority={priority}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {article.source_logo && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.source_logo}
              alt={article.source_name}
              width={large ? 96 : 36}
              height={large ? 96 : 36}
              className="opacity-40 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            // Flag emojis render as letter pairs on Windows — use source initials instead
            <span
              className={`font-bold opacity-20 tracking-widest select-none uppercase ${
                large ? "text-2xl" : "text-[10px]"
              }`}
            >
              {article.source_name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 3)}
            </span>
          )}
        </div>
      )}
      {/* Preview badge — only when content:encoded has substantial text */}
      {hasRichContent(article.content_html) && large && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-sm bg-black/65 backdrop-blur-sm text-white text-[10px] font-medium leading-none pointer-events-none uppercase tracking-wider">
          <span>📖</span>
          <span>preview</span>
        </div>
      )}
    </div>
  );
}

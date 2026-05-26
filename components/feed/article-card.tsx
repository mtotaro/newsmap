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

type Props = {
  article: ArticleCardData;
  sectionLabel: string;
  readLabel: string;
  locale: string;
  /** Called when user clicks thumbnail or title — opens preview modal */
  onOpenPreview?: (article: ArticleCardData) => void;
  /** Show paywall disclaimer (NYT) */
  paywallNotice?: string;
};

export function ArticleCard({
  article,
  sectionLabel,
  readLabel,
  locale,
  onOpenPreview,
  paywallNotice,
}: Props) {
  const flag = FLAG_MAP[article.country_code] ?? "🗞";
  const ago = timeAgo(article.published_at, locale);
  const description = article.description
    ? truncate(article.description, 200)
    : null;

  const handlePreview = onOpenPreview
    ? (e: React.MouseEvent) => {
        e.preventDefault();
        onOpenPreview(article);
      }
    : undefined;

  return (
    <article className="rounded-[var(--radius-card)] overflow-hidden bg-[var(--color-bg-2)] border border-[var(--color-border)] hover:border-[var(--color-text-3)] transition-colors">
      {/* Thumbnail — opens modal when onOpenPreview is provided */}
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

      {/* Body */}
      <div className="p-4 space-y-2">
        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-2)]">
          <span>{flag}</span>
          <span className="font-medium truncate min-w-0">{article.source_name}</span>
          <SectionChip section={article.section_key} label={sectionLabel} />
          {hasRichContent(article.content_html) && (
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-green)]/15 text-[var(--color-green)] border border-[var(--color-green)]/25 font-medium leading-none">
              ✦ full
            </span>
          )}
          <span className="ml-auto shrink-0">{ago}</span>
        </div>

        {/* Title — opens modal when onOpenPreview is provided */}
        {handlePreview ? (
          <button
            onClick={handlePreview}
            className="block w-full text-left text-[var(--color-text)] font-semibold leading-snug hover:text-[var(--color-blue)] transition-colors"
          >
            {article.title}
          </button>
        ) : (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[var(--color-text)] font-semibold leading-snug hover:text-[var(--color-blue)] transition-colors"
          >
            {article.title}
          </a>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
            {description}
          </p>
        )}

        {/* Paywall notice */}
        {paywallNotice && (
          <p className="text-xs text-[var(--color-yellow)] opacity-80">
            {paywallNotice}
          </p>
        )}

        {/* CTA — always a direct link (quick access without modal) */}
        <div className="pt-1 flex justify-end">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--color-blue)] hover:underline"
          >
            {readLabel} {article.source_name} →
          </a>
        </div>
      </div>
    </article>
  );
}

function ThumbnailContent({
  article,
  flag,
}: {
  article: ArticleCardData;
  flag: string;
}) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="relative aspect-video bg-[var(--color-bg-3)] overflow-hidden">
      {article.thumbnail_url ? (
        <Image
          src={article.thumbnail_url}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
          unoptimized={false}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {article.source_logo && !logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.source_logo}
              alt={article.source_name}
              width={48}
              height={48}
              className="opacity-40 object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            // Flag emojis render as letter pairs on Windows — use source initials instead
            <span className="text-xs font-bold opacity-20 tracking-widest select-none uppercase">
              {article.source_name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 3)}
            </span>
          )}
        </div>
      )}
      {/* Full-article preview badge — shown only when content:encoded has substantial text */}
      {hasRichContent(article.content_html) && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-medium leading-none pointer-events-none">
          <span>📖</span>
          <span>preview</span>
        </div>
      )}
    </div>
  );
}

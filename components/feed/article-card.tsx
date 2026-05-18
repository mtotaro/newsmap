import Image from "next/image";
import { SectionChip } from "@/components/ui/section-chip";
import { timeAgo, truncate } from "@/lib/utils/time";
import type { SectionKey } from "@/lib/db/schema";

export type ArticleCardData = {
  id: string;
  title: string;
  url: string;
  description: string | null;
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
  /** Show paywall disclaimer (NYT) */
  paywallNotice?: string;
};

const FLAG_MAP: Record<string, string> = {
  AR: "🇦🇷", BR: "🇧🇷", CL: "🇨🇱", CO: "🇨🇴", PE: "🇵🇪",
  MX: "🇲🇽", US: "🇺🇸", GB: "🇬🇧", ES: "🇪🇸", FR: "🇫🇷",
  DE: "🇩🇪", IT: "🇮🇹", QA: "🇶🇦", INTL: "🌐",
};

export function ArticleCard({
  article,
  sectionLabel,
  readLabel,
  locale,
  paywallNotice,
}: Props) {
  const flag = FLAG_MAP[article.country_code] ?? "🗞";
  const ago = timeAgo(article.published_at, locale);
  const description = article.description
    ? truncate(article.description, 280)
    : null;

  return (
    <article className="rounded-[var(--radius-card)] overflow-hidden bg-[var(--color-bg-2)] border border-[var(--color-border)] hover:border-[var(--color-text-3)] transition-colors">
      {/* Thumbnail */}
      <a href={article.url} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
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
              {article.source_logo ? (
                <Image
                  src={article.source_logo}
                  alt={article.source_name}
                  width={48}
                  height={48}
                  className="opacity-40"
                />
              ) : (
                <span className="text-3xl opacity-30">{flag}</span>
              )}
            </div>
          )}
        </div>
      </a>

      {/* Body */}
      <div className="p-4 space-y-2">
        {/* Meta row */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-2)]">
          <span>{flag}</span>
          <span className="font-medium truncate">{article.source_name}</span>
          <SectionChip section={article.section_key} label={sectionLabel} />
          <span className="ml-auto shrink-0">{ago}</span>
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[var(--color-text)] font-semibold leading-snug hover:text-white"
        >
          {article.title}
        </a>

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

        {/* CTA */}
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

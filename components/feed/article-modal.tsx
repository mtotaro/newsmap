"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { SectionChip } from "@/components/ui/section-chip";
import { timeAgo } from "@/lib/utils/time";
import { FLAG_MAP } from "@/lib/utils/flags";
import type { ArticleCardData } from "./article-card";
import type { SectionKey } from "@/lib/db/schema";

type Props = {
  article: ArticleCardData | null;
  onClose: () => void;
  locale: string;
};

export function ArticleModal({ article, onClose, locale }: Props) {
  const tSec = useTranslations("Sections");
  const tArt = useTranslations("Article");

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!article) return;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [article, handleKey]);

  // Load social embed SDKs when article contains embeds
  useEffect(() => {
    if (!article?.content_html) return;

    if (article.content_html.includes("instagram-media")) {
      const w = window as Window & { instgrm?: { Embeds: { process: () => void } } };
      if (w.instgrm?.Embeds) {
        w.instgrm.Embeds.process();
      } else if (!document.getElementById("instagram-embed-sdk")) {
        const s = document.createElement("script");
        s.id = "instagram-embed-sdk";
        s.src = "https://www.instagram.com/embed.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }

    if (article.content_html.includes("twitter-tweet")) {
      const w = window as Window & { twttr?: { widgets: { load: () => void } } };
      if (w.twttr?.widgets) {
        w.twttr.widgets.load();
      } else if (!document.getElementById("twitter-widget-sdk")) {
        const s = document.createElement("script");
        s.id = "twitter-widget-sdk";
        s.src = "https://platform.twitter.com/widgets.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, [article?.id, article?.content_html]);

  if (!article) return null;

  const flag = FLAG_MAP[article.country_code] ?? "🗞";
  const ago = timeAgo(article.published_at, locale);
  const sectionLabel = tSec(article.section_key as SectionKey);

  // Estimate reading time from content_html word count (~200 wpm)
  const readingTimeMin = article.content_html
    ? Math.max(1, Math.round(article.content_html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length / 200))
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, centered card on desktop */}
      <div className="relative w-full sm:max-w-lg mx-4 sm:mx-0 bg-[var(--color-bg-2)] rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col shadow-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white text-sm hover:bg-black/70 transition-colors"
        >
          ✕
        </button>

        {/* Thumbnail */}
        {article.thumbnail_url ? (
          <div className="relative w-full aspect-video bg-[var(--color-bg-3)] shrink-0">
            <Image
              src={article.thumbnail_url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-[var(--color-bg-3)] flex items-center justify-center shrink-0">
            {article.source_logo ? (
              <Image
                src={article.source_logo}
                alt={article.source_name}
                width={56}
                height={56}
                className="opacity-30"
              />
            ) : (
              <span className="text-5xl opacity-20">{flag}</span>
            )}
          </div>
        )}

        {/* Scrollable body */}
        <div className="p-5 space-y-3 overflow-y-auto overscroll-contain">

          {/* Source meta row */}
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-2)]">
            <span>{flag}</span>
            {article.source_logo && (
              <Image
                src={article.source_logo}
                alt={article.source_name}
                width={14}
                height={14}
                className="rounded-sm opacity-80"
              />
            )}
            <span className="font-medium truncate min-w-0">{article.source_name}</span>
            <SectionChip section={article.section_key} label={sectionLabel} />
            {readingTimeMin && (
              <span className="shrink-0 opacity-70">· {readingTimeMin} min</span>
            )}
            <span className="ml-auto shrink-0">{ago}</span>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-[var(--color-text)] leading-snug">
            {article.title}
          </h2>

          {/* Full article HTML — shown when feed provides content:encoded */}
          {article.content_html ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
          ) : article.description ? (
            /* Fallback to plain description when no HTML content */
            <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
              {article.description}
            </p>
          ) : null}

          {/* CTA */}
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full mt-2 py-3 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            {tArt("read_full")} {article.source_name} →
          </a>

          {/* Safe area spacer for mobile home indicator */}
          <div className="h-safe-bottom pb-2" />
        </div>
      </div>
    </div>
  );
}

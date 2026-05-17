"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArticleCard, type ArticleCardData } from "./article-card";
import { ArticleCardSkeleton } from "./article-card-skeleton";
import type { SectionKey } from "@/lib/db/schema";

const PAYWALL_SOURCES = ["new-york-times"];

type Props = {
  locale: string;
};

export function FeedList({ locale }: Props) {
  const t = useTranslations("Feed");
  const tSec = useTranslations("Sections");
  const tArt = useTranslations("Article");

  const [items, setItems] = useState<ArticleCardData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const url = new URL("/api/feed", window.location.origin);
        if (cursor) url.searchParams.set("cursor", cursor);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("Failed to load feed");
        const data = await res.json();
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setNextCursor(data.nextCursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(null, false);
  }, [fetchPage]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          fetchPage(nextCursor, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchPage]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-[640px] mx-auto px-4 py-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-text-2)]">{error}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-2xl">📭</p>
        <p className="text-[var(--color-text)]">{t("empty_title")}</p>
        <p className="text-sm text-[var(--color-text-2)]">{t("empty_desc")}</p>
        <a
          href={`/${locale}/map`}
          className="inline-block mt-2 px-6 py-2 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90"
        >
          {t("empty_cta")}
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto px-4 py-6 space-y-4">
      {items.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          sectionLabel={tSec(article.section_key as SectionKey)}
          readLabel={tArt("read_full")}
          locale={locale}
          paywallNotice={
            PAYWALL_SOURCES.includes(article.source_slug)
              ? tArt("paywall_notice")
              : undefined
          }
        />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {loadingMore && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <ArticleCardSkeleton key={`more-${i}`} />
          ))}
        </div>
      )}

      {!nextCursor && items.length > 0 && (
        <p className="text-center text-xs text-[var(--color-text-3)] py-4">
          ·
        </p>
      )}
    </div>
  );
}

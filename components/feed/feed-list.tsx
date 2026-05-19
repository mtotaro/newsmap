"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArticleCard, type ArticleCardData } from "./article-card";
import { ArticleCardSkeleton } from "./article-card-skeleton";
import type { SectionKey } from "@/lib/db/schema";

const PAYWALL_SOURCES: string[] = [];

const SECTION_KEYS: SectionKey[] = [
  "politics", "economy", "world", "tech",
  "culture", "sports", "health", "science", "entertainment",
];

type Props = {
  locale: string;
};

export function FeedList({ locale }: Props) {
  const t = useTranslations("Feed");
  const tSec = useTranslations("Sections");
  const tArt = useTranslations("Article");

  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [items, setItems] = useState<ArticleCardData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const isDev = process.env.NODE_ENV !== "production";

  async function handleDevSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`✓ Inserted ${data.inserted} articles from ${data.sources} sources`);
        // Reload feed after sync
        void fetchPage(null, false, activeSection);
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch {
      setSyncResult("Sync failed — check console");
    } finally {
      setSyncing(false);
    }
  }
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean, section: SectionKey | null) => {
      await Promise.resolve();
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const url = new URL("/api/feed", window.location.origin);
        if (cursor) url.searchParams.set("cursor", cursor);
        if (section) url.searchParams.set("section", section);
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

  // Re-fetch from top whenever activeSection changes
  useEffect(() => {
    void fetchPage(null, false, activeSection);
  }, [fetchPage, activeSection]);

  // Listen for banner "new articles" refresh trigger
  useEffect(() => {
    function handleRefresh() {
      setItems([]);
      setNextCursor(null);
      void fetchPage(null, false, activeSection);
    }
    window.addEventListener("feed:refresh", handleRefresh);
    return () => window.removeEventListener("feed:refresh", handleRefresh);
  }, [fetchPage, activeSection]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          fetchPage(nextCursor, true, activeSection);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchPage, activeSection]);

  const handleSection = (key: SectionKey | null) => {
    if (key === activeSection) return;
    setActiveSection(key);
    setItems([]);
    setNextCursor(null);
  };

  if (error) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <p className="text-[var(--color-text-2)]">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-[640px] mx-auto py-6 space-y-4">
      {/* ── Section filter chips ─────────────────────────────────────── */}
      <div className="px-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          <button
            onClick={() => handleSection(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeSection === null
                ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
            }`}
          >
            {t("filter_all")}
          </button>
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleSection(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeSection === key
                  ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                  : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)]"
              }`}
            >
              {tSec(key)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed items ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : !items.length ? (
        <div className="px-4 py-16 text-center space-y-4">
          <p className="text-2xl">📭</p>
          <p className="text-[var(--color-text)]">{t("empty_title")}</p>
          <p className="text-sm text-[var(--color-text-2)]">
            {activeSection ? t("filter_by_section") : t("empty_desc")}
          </p>
          {!activeSection && (
            <a
              href={`/${locale}/map`}
              className="inline-block mt-2 px-6 py-2 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90"
            >
              {t("empty_cta")}
            </a>
          )}
          {/* Dev-only: manually trigger RSS fetch without needing Inngest running */}
          {isDev && !activeSection && (
            <div className="mt-4 space-y-2">
              <button
                onClick={handleDevSync}
                disabled={syncing}
                className="inline-block px-4 py-2 rounded-[var(--radius-button)] border border-[var(--color-border)] text-xs text-[var(--color-text-2)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)] disabled:opacity-50 transition-colors"
              >
                {syncing ? "Fetching articles…" : "⚡ Dev: Sync articles now"}
              </button>
              {syncResult && (
                <p className="text-xs text-[var(--color-text-2)]">{syncResult}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 px-4">
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
      )}
    </div>
  );
}

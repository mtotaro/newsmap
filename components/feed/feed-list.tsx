"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ArticleCard, type ArticleCardData } from "./article-card";
import { ArticleCardSkeleton } from "./article-card-skeleton";
import { ArticleModal } from "./article-modal";
import { ContinueReadingStrip } from "./continue-reading-strip";
import { EndOfFeed } from "./end-of-feed";
import { AdSlot } from "@/components/ads/ad-slot";
import type { SectionKey } from "@/lib/db/schema";

/** AdSense in-feed slot ID — set NEXT_PUBLIC_ADSENSE_SLOT_FEED in env. */
const FEED_AD_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED ?? "";
/** Inject one ad after every Nth article. */
const AD_FREQUENCY = 5;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [items, setItems] = useState<ArticleCardData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [previewArticle, setPreviewArticle] = useState<ArticleCardData | null>(null);

  const isDev = process.env.NODE_ENV !== "production";

  // ── Debounce search input ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleDevSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/admin/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`✓ Inserted ${data.inserted} articles from ${data.sources} sources`);
        void fetchPage(null, false, activeSection, debouncedQuery);
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
    async (
      cursor: string | null,
      append: boolean,
      section: SectionKey | null,
      query: string
    ) => {
      await Promise.resolve();
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const url = new URL("/api/feed", window.location.origin);
        if (cursor) url.searchParams.set("cursor", cursor);
        if (section) url.searchParams.set("section", section);
        if (query.trim()) url.searchParams.set("q", query.trim());
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

  // Re-fetch from top whenever activeSection or debouncedQuery changes
  useEffect(() => {
    void fetchPage(null, false, activeSection, debouncedQuery);
  }, [fetchPage, activeSection, debouncedQuery]);

  // Listen for banner "new articles" refresh trigger
  useEffect(() => {
    function handleRefresh() {
      setItems([]);
      setNextCursor(null);
      void fetchPage(null, false, activeSection, debouncedQuery);
    }
    window.addEventListener("feed:refresh", handleRefresh);
    return () => window.removeEventListener("feed:refresh", handleRefresh);
  }, [fetchPage, activeSection, debouncedQuery]);

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current || !nextCursor) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          fetchPage(nextCursor, true, activeSection, debouncedQuery);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchPage, activeSection, debouncedQuery]);

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
    <>
    {/* Article preview modal — rendered outside the feed list so it sits above everything */}
    <ArticleModal
      article={previewArticle}
      onClose={() => setPreviewArticle(null)}
      locale={locale}
    />
    <div className="max-w-[720px] mx-auto py-3 sm:py-4 space-y-3 sm:space-y-4">
      {/* Continue reading rail — only renders when there's history */}
      {!activeSection && !debouncedQuery && <ContinueReadingStrip />}

      {/* ── Search input ─────────────────────────────────────────────── */}
      <div className="px-3 sm:px-4">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            // 16 px font on mobile prevents iOS Safari from auto-zooming on focus
            className="w-full pl-9 pr-8 py-2.5 sm:py-2 rounded-[var(--radius-button)] bg-[var(--color-bg-3)] border border-[var(--color-border)] text-[16px] sm:text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-3)] focus:outline-none focus:border-[var(--color-blue)] transition-colors"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] text-sm select-none">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors text-xs leading-none"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Section filter chips — horizontal scroll, ≥36 px tap target ── */}
      <div className="px-3 sm:px-4 overflow-x-auto scrollbar-hidden">
        <div className="flex gap-1.5 sm:gap-2 min-w-max pb-1">
          <button
            onClick={() => handleSection(null)}
            className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium border transition-colors shrink-0 ${
              activeSection === null
                ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)] active:bg-[var(--color-bg-2)]"
            }`}
          >
            {t("filter_all")}
          </button>
          {SECTION_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleSection(key)}
              className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-medium border transition-colors shrink-0 ${
                activeSection === key
                  ? "bg-[var(--color-blue)] text-white border-[var(--color-blue)]"
                  : "text-[var(--color-text-2)] border-[var(--color-border)] hover:border-[var(--color-blue)] hover:text-[var(--color-blue)] active:bg-[var(--color-bg-2)]"
              }`}
            >
              {tSec(key)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feed items ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4 px-3 sm:px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : !items.length ? (
        <div className="px-4 py-16 text-center space-y-4">
          <p className="text-2xl">
            {debouncedQuery ? "🔎" : "📭"}
          </p>
          <p className="text-[var(--color-text)]">{t("empty_title")}</p>
          <p className="text-sm text-[var(--color-text-2)]">
            {debouncedQuery
              ? t("search_no_results", { query: debouncedQuery })
              : activeSection
              ? t("filter_by_section")
              : t("empty_desc")}
          </p>
          {!activeSection && !debouncedQuery && (
            <a
              href={`/${locale}/map`}
              className="inline-block mt-2 px-6 py-2 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90"
            >
              {t("empty_cta")}
            </a>
          )}
          {/* Dev-only: manually trigger RSS fetch without needing Inngest running */}
          {isDev && !activeSection && !debouncedQuery && (
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
        <div className="space-y-5 px-4">
          {items.flatMap((article, index) => {
            // First article in the unfiltered "all" feed becomes the lead/hero story.
            // When a section filter or search is active we keep everything uniform so
            // the user sees consistent results without one outsized card on top.
            const isLead = index === 0 && !activeSection && !debouncedQuery;
            const card = (
              <ArticleCard
                key={article.id}
                article={article}
                sectionLabel={tSec(article.section_key as SectionKey)}
                readLabel={tArt("read_full")}
                locale={locale}
                variant={isLead ? "lead" : "standard"}
                priority={isLead}
                onOpenPreview={
                  article.content_html &&
                  article.content_html.replace(/<[^>]+>/g, "").trim().length > 350
                    ? setPreviewArticle
                    : undefined
                }
                paywallNotice={
                  PAYWALL_SOURCES.includes(article.source_slug)
                    ? tArt("paywall_notice")
                    : undefined
                }
              />
            );
            // Inject an ad unit after every AD_FREQUENCY-th article
            if ((index + 1) % AD_FREQUENCY === 0) {
              return [
                card,
                <AdSlot
                  key={`ad-after-${index}`}
                  slot={FEED_AD_SLOT}
                />,
              ];
            }
            return [card];
          })}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <ArticleCardSkeleton key={`more-${i}`} />
              ))}
            </div>
          )}

          {!nextCursor && items.length > 0 && <EndOfFeed locale={locale} />}
        </div>
      )}
    </div>
    </>
  );
}

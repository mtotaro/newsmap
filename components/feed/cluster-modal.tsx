"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { timeAgo } from "@/lib/utils/time";
import type { ClusterMember } from "./article-card";

type Props = {
  open: boolean;
  onClose: () => void;
  /** The headline of the primary article — shown as modal title */
  primaryTitle: string;
  members: ClusterMember[];
  locale: string;
};

/**
 * "Cobertura · N fuentes" — modal listing every publisher covering a clustered
 * story. Each row links out to that publisher's specific version of the article
 * so the reader can compare framing across sources in one click.
 *
 * Mobile UX redesign (Phase 7):
 * - Bottom sheet that grows to 92dvh — the previous max-h-[85vh] cut off
 *   the 2nd source on shorter phones (404 px tall after Chrome's address bar).
 * - Each member is a full-bleed card with clear visual hierarchy (eyebrow
 *   row · headline · time + arrow) instead of a tightly packed list row.
 * - Larger tap targets (min-h-[68px] per card) so reading the second source
 *   on a clustered story doesn't require a tiny precise tap.
 * - Slide-up animation on open, matching the article preview modal.
 *
 * Esc-to-close and click-outside-to-close, matching ArticleModal patterns.
 */
export function ClusterModal({
  open,
  onClose,
  primaryTitle,
  members,
  locale,
}: Props) {
  const t = useTranslations("Cluster");

  // Esc to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-[60] m-0 flex max-h-none max-w-none items-end justify-center overflow-visible border-none bg-transparent p-0 sm:items-center"
      aria-modal="true"
      aria-label={t("aria_label")}
    >
      <style>{`
        @keyframes cluster-fade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cluster-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes cluster-pop     { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .cluster-modal-backdrop { animation: cluster-fade 0.18s ease-out; }
        .cluster-modal-panel    { animation: cluster-slide-up 0.28s cubic-bezier(0.2, 0.85, 0.3, 1); }
        @media (min-width: 640px) {
          .cluster-modal-panel  { animation: cluster-pop 0.2s ease-out; }
        }
      `}</style>

      {/* Backdrop — separate sibling element so the panel layers above it
          cleanly and click-outside fires reliably on every browser. The
          previous implementation put the backdrop class on the flex parent,
          which broke clickability on some Chromium builds when combined
          with backdrop-filter. */}
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm cluster-modal-backdrop"
        aria-label={t("close")}
        onClick={onClose}
      />

      <div
        className="cluster-modal-panel relative z-10 w-full sm:max-w-[560px] max-h-[92dvh] sm:max-h-[85vh] overflow-y-auto bg-[var(--color-bg)] border-t-2 sm:border border-[var(--color-accent)] rounded-t-2xl sm:rounded-lg shadow-2xl flex flex-col mx-0 sm:mx-4"
      >
        {/* Drag handle (mobile only) — visual cue that this is a sheet */}
        <div
          className="sm:hidden flex justify-center pt-2 pb-1"
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full bg-[var(--color-text-3)]/40" />
        </div>

        {/* Header — sticky so it stays visible while scrolling member list */}
        <header className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-accent)] px-4 sm:px-5 pt-2 sm:pt-4 pb-3 sm:pb-4 flex items-start gap-3 z-10">
          <div className="flex-1 min-w-0">
            <p className="eyebrow text-[var(--color-accent)] mb-1.5">
              {t("eyebrow", { count: members.length })}
            </p>
            <h2 className="font-display text-base sm:text-lg text-[var(--color-text)] leading-snug line-clamp-3">
              {primaryTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-full text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors -mt-1 -mr-2"
          >
            ✕
          </button>
        </header>

        {/* One-line description — collapsed on mobile so the member list
            gets above-the-fold priority */}
        <p className="hidden sm:block px-5 pt-3 pb-3 text-xs text-[var(--color-text-2)] leading-relaxed border-b border-[var(--color-border)]">
          {t("description")}
        </p>

        {/* Source cards — each is a generous tap target */}
        <ul className="p-2 sm:p-3 space-y-2 sm:space-y-2.5">
          {members.map((m) => {
            return (
              <li key={m.id}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block min-h-[68px] p-3 sm:p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-2)] active:bg-[var(--color-bg-3)] transition-colors group"
                >
                  {/* Eyebrow row — country · source · time · → arrow */}
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] text-[var(--color-text-3)]">
                    <span
                      className="inline-flex min-w-[22px] items-center justify-center rounded-[4px] border border-[var(--color-border)] px-1.5 py-0.5 text-[9px] font-bold leading-none text-[var(--color-text-2)]"
                      aria-hidden="true"
                    >
                      {m.country_code}
                    </span>
                    <span className="eyebrow text-[var(--color-text-2)] truncate">
                      {m.source_name}
                    </span>
                    <span className="ml-auto shrink-0">
                      {timeAgo(m.published_at, locale)}
                    </span>
                    <span
                      className="shrink-0 text-[var(--color-accent)] opacity-60 group-hover:opacity-100 transition-opacity text-sm leading-none"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </div>
                  {/* Publisher's headline — serif, prominent enough to compare at a glance */}
                  <p className="font-serif text-[15px] sm:text-base text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                    {m.title}
                  </p>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Safe-area spacer for iOS home indicator on the bottom sheet */}
        <div className="h-safe-bottom" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </dialog>
  );
}

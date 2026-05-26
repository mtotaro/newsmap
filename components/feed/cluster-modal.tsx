"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { FLAG_MAP } from "@/lib/utils/flags";
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
 * Modal listing every publisher covering a clustered story. Each row links
 * out to that publisher's specific version of the article — letting the
 * reader compare framing across sources in one click.
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
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/55"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("aria_label")}
    >
      <div
        className="w-full max-w-[640px] max-h-[85vh] overflow-y-auto bg-[var(--color-bg)] border border-[var(--color-border)] rounded-t-lg sm:rounded shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-accent)] px-5 py-4 flex items-start gap-3 z-10">
          <div className="flex-1 min-w-0">
            <p className="eyebrow text-[var(--color-accent)] mb-1">
              {t("eyebrow", { count: members.length })}
            </p>
            <h2 className="font-display text-xl text-[var(--color-text)] leading-tight line-clamp-2">
              {primaryTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="shrink-0 w-8 h-8 inline-flex items-center justify-center text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors"
          >
            ✕
          </button>
        </header>

        {/* Description */}
        <p className="px-5 pt-3 pb-2 text-xs text-[var(--color-text-2)] leading-relaxed border-b border-[var(--color-border)]">
          {t("description")}
        </p>

        {/* Source list — each row shows that publisher's headline + link */}
        <ul>
          {members.map((m) => {
            const flag = FLAG_MAP[m.country_code] ?? "🗞";
            return (
              <li
                key={m.id}
                className="border-b border-[var(--color-border)] last:border-b-0"
              >
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3 hover:bg-[var(--color-bg-2)] transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-[var(--color-text-3)]">
                    <span className="text-sm leading-none">{flag}</span>
                    <span className="eyebrow text-[var(--color-text-2)]">
                      {m.source_name}
                    </span>
                    <span className="ml-auto">
                      {timeAgo(m.published_at, locale)}
                    </span>
                  </div>
                  <p className="text-sm font-serif text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                    {m.title}
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

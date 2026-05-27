"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClusterModal } from "./cluster-modal";
import type { ArticleCardData, ClusterInfo } from "./article-card";

type Props = {
  /** The primary article — its title is used as the modal heading */
  article: ArticleCardData;
  cluster: ClusterInfo;
  locale: string;
  /** Visual variant — pill is bigger on lead cards */
  size?: "sm" | "md";
};

/**
 * Pill button that surfaces a story cluster's source count and country flags.
 * Click opens ClusterModal listing every publisher covering the story.
 *
 * Distinct countries (up to 4) are shown inline so the user gets a glance
 * preview of "this story is being reported in Argentina, Spain, the US, and
 * Brazil" without opening the modal.
 */
export function ClusterPill({ article, cluster, locale, size = "sm" }: Props) {
  const t = useTranslations("Cluster");
  const [open, setOpen] = useState(false);

  // Distinct countries — drives both the inline flag preview and the
  // "cross-border / international story" highlight
  const distinctCountries = Array.from(
    new Set(cluster.members.map((m) => m.country_code))
  );

  /**
   * Cross-border indicator: a cluster spanning 3+ countries is treated as an
   * "international story" and gets a stronger oxblood treatment. This is the
   * LATAM-multi-country differentiation we leaned into in Phase 5 — no other
   * aggregator visually surfaces this.
   */
  const isCrossBorder = distinctCountries.length >= 3;
  const visibleCountries =
    size === "md" && !isCrossBorder ? distinctCountries.slice(0, 3) : [];

  const padding = size === "md" ? "px-3 py-1.5" : "px-2 py-1";
  const fontSize = size === "md" ? "text-[11px]" : "text-[10px]";

  const baseClass = isCrossBorder
    ? `border-[var(--color-accent)] bg-[var(--color-accent)] text-white hover:opacity-90`
    : `border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/15 hover:border-[var(--color-accent)]`;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex max-w-full items-center gap-1.5 ${padding} ${fontSize} uppercase tracking-wider font-semibold border transition-colors rounded-sm ${baseClass}`}
        aria-label={t("aria_open", { count: cluster.source_count })}
        title={
          isCrossBorder
            ? t("intl_title", { countries: distinctCountries.length })
            : undefined
        }
      >
        <span aria-hidden="true">{isCrossBorder ? "🌎" : "✦"}</span>
        <span>
          {isCrossBorder
            ? t("badge_intl", {
                sources: cluster.source_count,
                countries: distinctCountries.length,
              })
            : t("badge", { count: cluster.source_count })}
        </span>
        {visibleCountries.length > 0 && (
          <span
            className="hidden sm:flex items-center gap-1 ml-1"
            aria-hidden="true"
          >
            {visibleCountries.map((cc) => (
              <span
                key={cc}
                className="inline-flex min-w-[18px] items-center justify-center rounded-[4px] border border-current/20 px-1 py-0.5 text-[8px] font-bold leading-none"
              >
                {cc}
              </span>
            ))}
          </span>
        )}
      </button>

      <ClusterModal
        open={open}
        onClose={() => setOpen(false)}
        primaryTitle={article.title}
        members={cluster.members}
        locale={locale}
      />
    </>
  );
}

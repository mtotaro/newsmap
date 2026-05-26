"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FLAG_MAP } from "@/lib/utils/flags";
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

  // Distinct country flags, up to 4
  const countries = Array.from(
    new Set(cluster.members.map((m) => m.country_code))
  ).slice(0, 4);

  const padding = size === "md" ? "px-3 py-1.5" : "px-2 py-1";
  const fontSize = size === "md" ? "text-[11px]" : "text-[10px]";

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 ${padding} ${fontSize} uppercase tracking-wider font-semibold border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 text-[var(--color-accent)] hover:bg-[var(--color-accent)]/15 hover:border-[var(--color-accent)] transition-colors rounded-sm`}
        aria-label={t("aria_open", { count: cluster.source_count })}
      >
        <span aria-hidden="true">✦</span>
        <span>
          {t("badge", { count: cluster.source_count })}
        </span>
        {countries.length > 0 && (
          <span className="flex items-center gap-0.5 ml-1 opacity-80" aria-hidden="true">
            {countries.map((cc) => (
              <span key={cc} className="text-[9px] leading-none">
                {FLAG_MAP[cc] ?? "🗞"}
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

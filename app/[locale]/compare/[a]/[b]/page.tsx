import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { articles, sources } from "@/lib/db/schema";
import { eq, desc, getTableColumns, and, inArray, gte, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
import {
  COUNTRY_SLUG_TO_ALPHA2,
  ALPHA2_TO_SLUG,
  COUNTRY_FLAGS,
} from "@/lib/countries";
import { CompareColumn } from "@/components/compare/compare-column";
import { CompareSwitcher } from "@/components/compare/compare-switcher";

export const revalidate = 900;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";
const ITEMS_PER_COUNTRY = 15;
const SHARED_WINDOW_HOURS = 12;

/**
 * Pre-render the most-requested LATAM ↔ LATAM and LATAM ↔ Anglosphere pairs.
 * Other combinations are still routable; they just render on first request
 * and stay cached via ISR.
 */
export function generateStaticParams() {
  const popular: Array<[string, string]> = [
    ["argentina", "mexico"],
    ["argentina", "spain"],
    ["argentina", "brazil"],
    ["mexico", "spain"],
    ["mexico", "united-states"],
    ["argentina", "united-states"],
    ["spain", "united-states"],
    ["chile", "argentina"],
    ["colombia", "mexico"],
    ["brazil", "mexico"],
  ];
  return popular.flatMap(([a, b]) =>
    ["es", "en"].map((locale) => ({ locale, a, b }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ a: string; b: string; locale: string }>;
}): Promise<Metadata> {
  const { a, b, locale } = await params;
  const alphaA = COUNTRY_SLUG_TO_ALPHA2[a.toLowerCase()];
  const alphaB = COUNTRY_SLUG_TO_ALPHA2[b.toLowerCase()];
  if (!alphaA || !alphaB) return {};

  const t = await getTranslations({ locale, namespace: "Compare" });
  const names = new Intl.DisplayNames([locale], { type: "region" });
  const nameA = names.of(alphaA) ?? a;
  const nameB = names.of(alphaB) ?? b;

  const canonical = `${APP_URL}/${locale}/compare/${a}/${b}`;
  return {
    title: t("meta_title", { a: nameA, b: nameB }),
    description: t("meta_description", { a: nameA, b: nameB }),
    alternates: {
      canonical,
      languages: {
        es: `${APP_URL}/es/compare/${a}/${b}`,
        en: `${APP_URL}/en/compare/${a}/${b}`,
        "x-default": `${APP_URL}/es/compare/${a}/${b}`,
      },
    },
    openGraph: {
      title: t("meta_title", { a: nameA, b: nameB }),
      description: t("meta_description", { a: nameA, b: nameB }),
      url: canonical,
      siteName: "NewsMap",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("meta_title", { a: nameA, b: nameB }),
      description: t("meta_description", { a: nameA, b: nameB }),
    },
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ a: string; b: string; locale: string }>;
}) {
  const { a, b, locale } = await params;
  const alphaA = COUNTRY_SLUG_TO_ALPHA2[a.toLowerCase()];
  const alphaB = COUNTRY_SLUG_TO_ALPHA2[b.toLowerCase()];

  if (!alphaA || !alphaB) notFound();
  // Self-comparison makes no sense — bounce to the country page
  if (alphaA === alphaB) {
    redirect(`/${locale}/news/${ALPHA2_TO_SLUG[alphaA]}`);
  }

  const t = await getTranslations({ locale, namespace: "Compare" });
  const tArt = await getTranslations({ locale, namespace: "Article" });
  const tSec = await getTranslations({ locale, namespace: "Sections" });

  const names = new Intl.DisplayNames([locale], { type: "region" });
  const nameA = names.of(alphaA) ?? a;
  const nameB = names.of(alphaB) ?? b;
  const flagA = COUNTRY_FLAGS[alphaA] ?? "🌐";
  const flagB = COUNTRY_FLAGS[alphaB] ?? "🌐";

  // ── Articles per country ────────────────────────────────────────────────
  // .catch([]) guards against ECONNREFUSED in CI builds that have no DB env;
  // ISR revalidates with real data on the first live request after deploy.
  const emptyRows = [] as [];
  const [rowsA, rowsB] = await Promise.all([
    db
      .select({
        ...getTableColumns(articles),
        source_name: sources.name,
        source_logo: sources.logo_url,
        source_slug: sources.slug,
        country_code: sources.country_code,
      })
      .from(articles)
      .innerJoin(sources, eq(articles.source_id, sources.id))
      .where(and(eq(sources.country_code, alphaA), eq(sources.is_active, true)))
      .orderBy(desc(articles.published_at))
      .limit(ITEMS_PER_COUNTRY)
      .catch((err: unknown) => {
        console.error(`[compare/${a}/${b}] DB unavailable at build time:`, err instanceof Error ? err.message : err);
        return emptyRows;
      }),
    db
      .select({
        ...getTableColumns(articles),
        source_name: sources.name,
        source_logo: sources.logo_url,
        source_slug: sources.slug,
        country_code: sources.country_code,
      })
      .from(articles)
      .innerJoin(sources, eq(articles.source_id, sources.id))
      .where(and(eq(sources.country_code, alphaB), eq(sources.is_active, true)))
      .orderBy(desc(articles.published_at))
      .limit(ITEMS_PER_COUNTRY)
      .catch(() => emptyRows),
  ]);

  // ── Detect shared stories (cluster_keys present in both countries) ──────
  const clusterKeysInView = [
    ...new Set(
      [...rowsA, ...rowsB]
        .map((r) => r.cluster_key)
        .filter((k): k is string => Boolean(k))
    ),
  ];

  let sharedKeys = new Set<string>();
  if (clusterKeysInView.length > 0) {
    // eslint-disable-next-line react-hooks/purity -- Server Component; Date.now() is intentional per-request
    const cutoff = new Date(Date.now() - SHARED_WINDOW_HOURS * 3_600_000);
    const memberRows = await db
      .select({
        cluster_key: articles.cluster_key,
        country_code: sources.country_code,
      })
      .from(articles)
      .innerJoin(sources, eq(articles.source_id, sources.id))
      .where(
        and(
          inArray(articles.cluster_key, clusterKeysInView),
          isNotNull(articles.cluster_key),
          gte(articles.published_at, cutoff),
          inArray(sources.country_code, [alphaA, alphaB])
        )
      )
      .catch(() => [] as []);

    // Cluster is "shared" only when it has at least one member in EACH country
    const byKey = new Map<string, Set<string>>();
    for (const r of memberRows) {
      if (!r.cluster_key) continue;
      const set = byKey.get(r.cluster_key) ?? new Set();
      set.add(r.country_code);
      byKey.set(r.cluster_key, set);
    }
    sharedKeys = new Set(
      [...byKey.entries()]
        .filter(
          ([, codes]) => codes.has(alphaA) && codes.has(alphaB)
        )
        .map(([key]) => key)
    );
  }

  const sectionLabels = Object.fromEntries(
    ["politics", "economy", "world", "sports", "tech", "culture", "health", "science", "entertainment"].map((k) => [
      k,
      tSec(k),
    ])
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta_title", { a: nameA, b: nameB }),
    description: t("meta_description", { a: nameA, b: nameB }),
    url: `${APP_URL}/${locale}/compare/${a}/${b}`,
    inLanguage: locale,
    publisher: { "@type": "Organization", name: "NewsMap", url: APP_URL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pb-12">
        {/* Masthead-style header */}
        <header className="max-w-[1100px] mx-auto px-4 pt-8 pb-5 border-b border-[var(--color-accent)] mb-6">
          <p className="eyebrow text-[var(--color-accent)] mb-2 text-center">
            {t("eyebrow")}
          </p>
          <h1
            className="font-display text-center font-black text-[var(--color-text)] leading-none flex items-center justify-center gap-3 sm:gap-6 flex-wrap"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="text-3xl sm:text-4xl">{flagA}</span>
              {nameA}
            </span>
            <span className="text-[var(--color-text-3)] font-normal text-base sm:text-lg uppercase tracking-widest">
              {t("vs")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-3xl sm:text-4xl">{flagB}</span>
              {nameB}
            </span>
          </h1>
          <p className="text-center mt-3 text-sm text-[var(--color-text-2)] max-w-xl mx-auto">
            {t("subtitle", { a: nameA, b: nameB })}
            {sharedKeys.size > 0 && (
              <>
                <br />
                <span className="text-[var(--color-accent)] font-semibold">
                  {t("shared_count", { count: sharedKeys.size })}
                </span>
              </>
            )}
          </p>

          {/* Country switcher */}
          <div className="mt-5">
            <CompareSwitcher
              locale={locale}
              currentA={a}
              currentB={b}
            />
          </div>
        </header>

        {/* Two-column comparison */}
        <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <CompareColumn
            countryName={nameA}
            countrySlug={ALPHA2_TO_SLUG[alphaA]!}
            flag={flagA}
            items={rowsA.map((r) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              description: r.description,
              section_key: r.section_key,
              thumbnail_url: r.thumbnail_url,
              published_at: r.published_at.toISOString(),
              source_name: r.source_name,
              source_slug: r.source_slug,
              cluster_key: r.cluster_key,
              isShared: r.cluster_key ? sharedKeys.has(r.cluster_key) : false,
            }))}
            locale={locale}
            sectionLabels={sectionLabels}
            sharedLabel={t("badge_shared", { other: nameB })}
            readLabel={tArt("read_full")}
            emptyLabel={t("empty", { country: nameA })}
          />
          <CompareColumn
            countryName={nameB}
            countrySlug={ALPHA2_TO_SLUG[alphaB]!}
            flag={flagB}
            items={rowsB.map((r) => ({
              id: r.id,
              title: r.title,
              url: r.url,
              description: r.description,
              section_key: r.section_key,
              thumbnail_url: r.thumbnail_url,
              published_at: r.published_at.toISOString(),
              source_name: r.source_name,
              source_slug: r.source_slug,
              cluster_key: r.cluster_key,
              isShared: r.cluster_key ? sharedKeys.has(r.cluster_key) : false,
            }))}
            locale={locale}
            sectionLabels={sectionLabels}
            sharedLabel={t("badge_shared", { other: nameA })}
            readLabel={tArt("read_full")}
            emptyLabel={t("empty", { country: nameB })}
          />
        </div>
      </div>
    </>
  );
}

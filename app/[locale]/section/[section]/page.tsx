import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { articles, sources, sectionKeyEnum } from "@/lib/db/schema";
import { eq, desc, getTableColumns, and } from "drizzle-orm";
import type { Metadata } from "next";
import type { SectionKey } from "@/lib/db/schema";
import type { ArticleCardData } from "@/components/feed/article-card";
import { LandingFeed } from "@/components/landing/landing-feed";

// ISR — regenerate every 15 minutes; same window as the country pages
export const revalidate = 900;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";

const ALL_SECTIONS: SectionKey[] = [
  "politics", "economy", "world", "sports", "tech",
  "culture", "health", "science", "entertainment",
];

function isValidSection(value: string): value is SectionKey {
  return (sectionKeyEnum.enumValues as readonly string[]).includes(value);
}

export async function generateStaticParams() {
  // Skip pre-rendering when DATABASE_URL is missing (e.g. CI builds without
  // pulled env vars). The pages still work — ISR renders them on demand
  // after deploy. Without this guard, 18 pages × ~10 s connect_timeout
  // serialise through the max:1 postgres connection and blow past Next.js's
  // 60-second static-gen ceiling.
  if (!process.env.DATABASE_URL) return [];
  // Pre-render all 9 sections for both locales (18 pages total)
  return ALL_SECTIONS.flatMap((section) =>
    ["es", "en"].map((locale) => ({ locale, section }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; locale: string }>;
}): Promise<Metadata> {
  const { section, locale } = await params;
  if (!isValidSection(section)) return {};

  const tSec = await getTranslations({ locale, namespace: "Sections" });
  const t = await getTranslations({ locale, namespace: "SectionPage" });
  const sectionName = tSec(section);

  return {
    title: t("meta_title", { section: sectionName }),
    description: t("meta_description", { section: sectionName }),
    alternates: {
      canonical: `${APP_URL}/${locale}/section/${section}`,
      languages: {
        es: `${APP_URL}/es/section/${section}`,
        en: `${APP_URL}/en/section/${section}`,
        "x-default": `${APP_URL}/es/section/${section}`,
      },
    },
    openGraph: {
      title: t("meta_title", { section: sectionName }),
      description: t("meta_description", { section: sectionName }),
      url: `${APP_URL}/${locale}/section/${section}`,
      siteName: "NewsMap",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("meta_title", { section: sectionName }),
      description: t("meta_description", { section: sectionName }),
    },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string; locale: string }>;
}) {
  const { section, locale } = await params;
  if (!isValidSection(section)) notFound();

  const tSec = await getTranslations({ locale, namespace: "Sections" });
  const t = await getTranslations({ locale, namespace: "SectionPage" });
  const sectionName = tSec(section);

  // Latest 40 articles in this section across all active sources.
  // .catch returns [] so CI builds without a DB env still produce a valid
  // (empty) static page; ISR revalidates with real data on the first live request.
  const rows = await db
    .select({
      ...getTableColumns(articles),
      source_name: sources.name,
      source_logo: sources.logo_url,
      source_slug: sources.slug,
      country_code: sources.country_code,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.source_id, sources.id))
    .where(
      and(eq(articles.section_key, section), eq(sources.is_active, true))
    )
    .orderBy(desc(articles.published_at))
    .limit(40)
    .catch((err: unknown) => {
      console.error(`[section/${section}] DB unavailable at build time:`, err instanceof Error ? err.message : err);
      return [] as [];
    });

  const items: ArticleCardData[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    description: r.description,
    content_html: r.content_html,
    section_key: r.section_key as SectionKey,
    thumbnail_url: r.thumbnail_url,
    published_at: r.published_at.toISOString(),
    source_name: r.source_name,
    source_logo: r.source_logo,
    source_slug: r.source_slug,
    country_code: r.country_code,
  }));

  // Distinct sources covering this section, capped — used in the "fuentes" rail
  const sourceList = Array.from(
    new Map(items.map((i) => [i.source_slug, i])).values()
  ).slice(0, 12);

  // JSON-LD CollectionPage + ItemList for richer Google indexing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta_title", { section: sectionName }),
    description: t("meta_description", { section: sectionName }),
    url: `${APP_URL}/${locale}/section/${section}`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "NewsMap",
      url: APP_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: item.url,
        name: item.title,
      })),
    },
  };

  const sectionLabels = Object.fromEntries(
    ALL_SECTIONS.map((k) => [k, tSec(k)])
  );
  const otherSections = ALL_SECTIONS.filter((k) => k !== section);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pb-8">
        {/* Landing header — newspaper-style masthead for this section */}
        <header className="max-w-[720px] mx-auto px-4 pt-10 pb-6 border-b border-[var(--color-accent)] mb-6">
          <p className="eyebrow text-[var(--color-accent)] mb-2 text-center">
            {t("eyebrow")}
          </p>
          <h1
            className="font-display text-center font-black text-[var(--color-text)] leading-none capitalize"
            style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)" }}
          >
            {sectionName}
          </h1>
          <p className="text-center mt-3 text-sm text-[var(--color-text-2)] leading-relaxed max-w-md mx-auto">
            {items.length > 0
              ? t("subtitle", {
                  section: sectionName.toLowerCase(),
                  count: items.length,
                })
              : t("subtitle_empty", { section: sectionName.toLowerCase() })}
          </p>
        </header>

        {/* Articles list */}
        <LandingFeed
          items={items}
          locale={locale}
          sectionLabels={sectionLabels}
          emptyLabel={t("no_articles")}
        />

        {/* Internal links: other sections + top sources covering this section */}
        <footer className="max-w-[720px] mx-auto px-4 pt-8 mt-4 border-t border-[var(--color-border)] space-y-6">
          <nav aria-labelledby="other-sections">
            <h2
              id="other-sections"
              className="eyebrow text-[var(--color-text-2)] mb-3"
            >
              {t("other_sections")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherSections.map((s) => (
                <a
                  key={s}
                  href={`/${locale}/section/${s}`}
                  className="px-3 py-1 text-xs uppercase tracking-wider font-semibold text-[var(--color-text-2)] border border-[var(--color-border)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
                >
                  {tSec(s)}
                </a>
              ))}
            </div>
          </nav>

          {sourceList.length > 0 && (
            <nav aria-labelledby="source-list">
              <h2
                id="source-list"
                className="eyebrow text-[var(--color-text-2)] mb-3"
              >
                {t("top_sources")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {sourceList.map((s) => (
                  <a
                    key={s.source_slug}
                    href={`/${locale}/source/${s.source_slug}`}
                    className="px-3 py-1 text-xs uppercase tracking-wider font-semibold text-[var(--color-text-2)] border border-[var(--color-border)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    {s.source_name}
                  </a>
                ))}
              </div>
            </nav>
          )}
        </footer>
      </div>
    </>
  );
}

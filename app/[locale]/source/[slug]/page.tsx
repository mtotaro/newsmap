import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { articles, sources } from "@/lib/db/schema";
import { eq, desc, getTableColumns, and } from "drizzle-orm";
import type { Metadata } from "next";
import type { SectionKey } from "@/lib/db/schema";
import type { ArticleCardData } from "@/components/feed/article-card";
import { LandingFeed } from "@/components/landing/landing-feed";
import { ALPHA2_TO_SLUG, COUNTRY_FLAGS } from "@/lib/countries";
import { normalizeSourceLogoUrl } from "@/lib/utils/source-logos";

// ISR — articles change frequently; 15-minute window matches the cron
export const revalidate = 900;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";

const ALL_SECTIONS: SectionKey[] = [
  "politics", "economy", "world", "sports", "tech",
  "culture", "health", "science", "entertainment",
];

/**
 * Fetch a source by slug, plus its latest 40 articles. Returns null if the
 * source doesn't exist or is inactive — used by both metadata + page render
 * so we hit the DB twice but each call has its own ISR cache window.
 */
async function loadSource(slug: string) {
  const [source] = await db
    .select()
    .from(sources)
    .where(and(eq(sources.slug, slug), eq(sources.is_active, true)))
    .limit(1);
  if (!source) return null;
  const normalizedSource = {
    ...source,
    logo_url: normalizeSourceLogoUrl(source.slug, source.logo_url),
  };

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
    .where(eq(articles.source_id, source.id))
    .orderBy(desc(articles.published_at))
    .limit(40);

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
    source_logo: normalizeSourceLogoUrl(r.source_slug, r.source_logo),
    source_slug: r.source_slug,
    country_code: r.country_code,
  }));

  return { source: normalizedSource, items };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await loadSource(slug);
  if (!data) return {};

  const t = await getTranslations({ locale, namespace: "SourcePage" });
  const countryName =
    new Intl.DisplayNames([locale], { type: "region" }).of(
      data.source.country_code
    ) ?? data.source.country_code;

  return {
    title: t("meta_title", { source: data.source.name }),
    description: t("meta_description", {
      source: data.source.name,
      country: countryName,
    }),
    alternates: {
      canonical: `${APP_URL}/${locale}/source/${slug}`,
      languages: {
        es: `${APP_URL}/es/source/${slug}`,
        en: `${APP_URL}/en/source/${slug}`,
        "x-default": `${APP_URL}/es/source/${slug}`,
      },
    },
    openGraph: {
      title: t("meta_title", { source: data.source.name }),
      description: t("meta_description", {
        source: data.source.name,
        country: countryName,
      }),
      url: `${APP_URL}/${locale}/source/${slug}`,
      siteName: "NewsMap",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("meta_title", { source: data.source.name }),
      description: t("meta_description", {
        source: data.source.name,
        country: countryName,
      }),
    },
  };
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const data = await loadSource(slug);
  if (!data) notFound();

  const t = await getTranslations({ locale, namespace: "SourcePage" });
  const tSec = await getTranslations({ locale, namespace: "Sections" });

  const countryName =
    new Intl.DisplayNames([locale], { type: "region" }).of(
      data.source.country_code
    ) ?? data.source.country_code;
  const countrySlug = ALPHA2_TO_SLUG[data.source.country_code];
  const flag = COUNTRY_FLAGS[data.source.country_code] ?? "🗞";

  // Other sources from the same country — internal linking + cross-source SEO
  const siblings = await db
    .select({
      slug: sources.slug,
      name: sources.name,
    })
    .from(sources)
    .where(
      and(
        eq(sources.country_code, data.source.country_code),
        eq(sources.is_active, true)
      )
    )
    .limit(20);
  const otherSources = siblings.filter((s) => s.slug !== slug);

  // JSON-LD: CollectionPage scoped to the publisher
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta_title", { source: data.source.name }),
    description: t("meta_description", {
      source: data.source.name,
      country: countryName,
    }),
    url: `${APP_URL}/${locale}/source/${slug}`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "NewsMap",
      url: APP_URL,
    },
    about: {
      "@type": "NewsMediaOrganization",
      name: data.source.name,
      url: data.source.url,
      ...(data.source.logo_url ? { logo: data.source.logo_url } : {}),
      address: {
        "@type": "PostalAddress",
        addressCountry: data.source.country_code,
      },
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.items.slice(0, 20).map((item, index) => ({
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pb-8">
        {/* Source masthead */}
        <header className="max-w-[720px] mx-auto px-4 pt-10 pb-6 border-b border-[var(--color-accent)] mb-6">
          <p className="eyebrow text-[var(--color-accent)] mb-2 text-center">
            {t("eyebrow")} · {flag} {countryName}
          </p>
          <h1
            className="font-display text-center font-black text-[var(--color-text)] leading-none"
            style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)" }}
          >
            {data.source.name}
          </h1>
          <p className="text-center mt-3 text-sm text-[var(--color-text-2)] leading-relaxed max-w-md mx-auto">
            {data.items.length > 0
              ? t("subtitle", {
                  source: data.source.name,
                  count: data.items.length,
                })
              : t("subtitle_empty", { source: data.source.name })}
          </p>
          {/* Direct link out to the publisher */}
          <p className="text-center mt-3">
            <a
              href={data.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] uppercase tracking-wider text-[var(--color-ink)] font-semibold hover:underline"
            >
              {t("visit_publisher")} →
            </a>
          </p>
        </header>

        {/* Articles list with section filter */}
        <LandingFeed
          items={data.items}
          locale={locale}
          sectionLabels={sectionLabels}
          showSectionFilter
          emptyLabel={t("no_articles")}
        />

        {/* Footer: related sources from same country + country front page */}
        <footer className="max-w-[720px] mx-auto px-4 pt-8 mt-4 border-t border-[var(--color-border)] space-y-6">
          {otherSources.length > 0 && (
            <nav aria-labelledby="other-sources">
              <h2
                id="other-sources"
                className="eyebrow text-[var(--color-text-2)] mb-3"
              >
                {t("more_sources_country", { country: countryName })}
              </h2>
              <div className="flex flex-wrap gap-2">
                {otherSources.map((s) => (
                  <a
                    key={s.slug}
                    href={`/${locale}/source/${s.slug}`}
                    className="px-3 py-1 text-xs uppercase tracking-wider font-semibold text-[var(--color-text-2)] border border-[var(--color-border)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {countrySlug && (
            <p>
              <a
                href={`/${locale}/news/${countrySlug}`}
                className="text-[11px] uppercase tracking-wider text-[var(--color-accent)] font-semibold hover:underline"
              >
                {flag} {t("country_front_page", { country: countryName })} →
              </a>
            </p>
          )}
        </footer>
      </div>
    </>
  );
}

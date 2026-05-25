import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { articles, sources } from "@/lib/db/schema";
import { eq, desc, and, getTableColumns } from "drizzle-orm";
import type { Metadata } from "next";
import type { SectionKey } from "@/lib/db/schema";
import type { ArticleCardData } from "@/components/feed/article-card";
import { CountryNews } from "@/components/news/country-news";
import {
  COUNTRY_SLUG_TO_ALPHA2,
  ALPHA2_TO_SLUG,
  COUNTRY_FLAGS,
} from "@/lib/countries";

// ISR: regenerate every 15 minutes on-demand (no pre-generation at build time
// to avoid DB connection pool exhaustion across parallel build workers).
export const revalidate = 900;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";
const SECTION_KEYS: SectionKey[] = [
  "sports", "politics", "economy", "world", "tech",
  "culture", "health", "science", "entertainment",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}): Promise<Metadata> {
  const { country, locale } = await params;
  const alpha2 = COUNTRY_SLUG_TO_ALPHA2[country.toLowerCase()];
  if (!alpha2) return {};

  const t = await getTranslations({ locale, namespace: "News" });
  const countryName =
    new Intl.DisplayNames([locale], { type: "region" }).of(alpha2) ?? country;
  const canonical = ALPHA2_TO_SLUG[alpha2] ?? country;

  return {
    title: t("meta_title", { country: countryName }),
    description: t("meta_description", { country: countryName }),
    alternates: {
      canonical: `${APP_URL}/en/news/${canonical}`,
      languages: {
        es: `${APP_URL}/es/news/${canonical}`,
        en: `${APP_URL}/en/news/${canonical}`,
        "x-default": `${APP_URL}/en/news/${canonical}`,
      },
    },
    openGraph: {
      title: t("meta_title", { country: countryName }),
      description: t("meta_description", { country: countryName }),
      url: `${APP_URL}/${locale}/news/${canonical}`,
      siteName: "NewsMap",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("meta_title", { country: countryName }),
      description: t("meta_description", { country: countryName }),
    },
  };
}

export default async function CountryNewsPage({
  params,
}: {
  params: Promise<{ country: string; locale: string }>;
}) {
  const { country, locale } = await params;
  const alpha2 = COUNTRY_SLUG_TO_ALPHA2[country.toLowerCase()];
  if (!alpha2) notFound();

  const t = await getTranslations({ locale, namespace: "News" });
  const tFeed = await getTranslations({ locale, namespace: "Feed" });
  const tSec = await getTranslations({ locale, namespace: "Sections" });
  const tArt = await getTranslations({ locale, namespace: "Article" });

  const countryName =
    new Intl.DisplayNames([locale], { type: "region" }).of(alpha2) ?? country;
  const flag = COUNTRY_FLAGS[alpha2] ?? "🌐";
  const canonical = ALPHA2_TO_SLUG[alpha2] ?? country;

  // Fetch recent articles from all active sources in this country
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
    .where(and(eq(sources.country_code, alpha2), eq(sources.is_active, true)))
    .orderBy(desc(articles.published_at))
    .limit(40);

  const items: ArticleCardData[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    description: r.description,
    section_key: r.section_key as SectionKey,
    thumbnail_url: r.thumbnail_url,
    published_at: r.published_at.toISOString(),
    source_name: r.source_name,
    source_logo: r.source_logo,
    source_slug: r.source_slug,
    country_code: r.country_code,
  }));

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta_title", { country: countryName }),
    description: t("meta_description", { country: countryName }),
    url: `${APP_URL}/${locale}/news/${canonical}`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: "NewsMap",
      url: APP_URL,
    },
  };

  const sectionLabels = Object.fromEntries(
    SECTION_KEYS.map((k) => [k, tSec(k)])
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen pb-8">
        {/* Country header */}
        <div className="max-w-[640px] mx-auto px-4 pt-8 pb-5">
          <div className="flex items-start gap-4">
            <span className="text-4xl leading-none mt-1">{flag}</span>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] leading-tight">
                {t("page_title", { country: countryName })}
              </h1>
              <p className="text-sm text-[var(--color-text-2)] mt-1">
                {t("subtitle")}
                {items.length > 0 && (
                  <span className="ml-2 opacity-60">
                    · {t("articles_count", { count: items.length })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Hreflang alternate links + nav back to map */}
        <div className="max-w-[640px] mx-auto px-4 mb-4 flex items-center justify-between">
          <a
            href={`/${locale}/map`}
            className="text-xs text-[var(--color-text-2)] hover:text-[var(--color-text)] transition-colors"
          >
            ← {t("back_to_map")}
          </a>
          {/* Language switcher for this page */}
          <div className="flex items-center gap-3 text-xs">
            <a
              href={`/es/news/${canonical}`}
              className={`${locale === "es" ? "text-[var(--color-blue)] font-medium" : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"} transition-colors`}
            >
              ES
            </a>
            <span className="text-[var(--color-border)]">|</span>
            <a
              href={`/en/news/${canonical}`}
              className={`${locale === "en" ? "text-[var(--color-blue)] font-medium" : "text-[var(--color-text-2)] hover:text-[var(--color-text)]"} transition-colors`}
            >
              EN
            </a>
          </div>
        </div>

        {/* Articles with client-side section filter */}
        <CountryNews
          items={items}
          locale={locale}
          filterAllLabel={tFeed("filter_all")}
          readLabel={tArt("read_full")}
          noArticlesLabel={t("no_articles")}
          sectionLabels={sectionLabels}
          signupCta={t("signup_cta", { country: countryName })}
          signupDesc={t("signup_desc")}
          signupBtn={t("signup_btn")}
        />
      </div>
    </>
  );
}

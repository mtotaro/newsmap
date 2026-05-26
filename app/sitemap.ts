import type { MetadataRoute } from "next";
import { CANONICAL_SLUGS } from "@/lib/countries";
import { db } from "@/lib/db";
import { sources, sectionKeyEnum } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";
const LOCALES = ["es", "en"] as const;

/** ISR — regenerate the sitemap every 24 hours */
export const revalidate = 86_400;

/**
 * Build a sitemap entry with hreflang alternates pointing to every locale
 * variant of the same path. Google uses these to pair locale-specific URLs
 * and avoid treating them as duplicate content.
 */
function withAlternates(
  path: string,
  base: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${APP_URL}/${locale}${path}`,
    ...base,
    alternates: {
      languages: {
        ...Object.fromEntries(
          LOCALES.map((l) => [l, `${APP_URL}/${l}${path}`])
        ),
        "x-default": `${APP_URL}/es${path}`,
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Root + locale roots ────────────────────────────────────────────────
  const rootPages: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: {
        languages: {
          es: `${APP_URL}/es`,
          en: `${APP_URL}/en`,
          "x-default": `${APP_URL}/es`,
        },
      },
    },
    ...withAlternates("", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    }),
  ];

  // ── Main product pages — feed + map ────────────────────────────────────
  const productPages: MetadataRoute.Sitemap = [
    ...withAlternates("/feed", {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.95,
    }),
    ...withAlternates("/map", {
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }),
  ];

  // ── Country news pages — one entry per locale per country ──────────────
  const countryPages: MetadataRoute.Sitemap = CANONICAL_SLUGS.flatMap((slug) =>
    withAlternates(`/news/${slug}`, {
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    })
  );

  // ── Section landing pages — 9 sections × 2 locales = 18 URLs ────────────
  const sectionPages: MetadataRoute.Sitemap = sectionKeyEnum.enumValues.flatMap(
    (key) =>
      withAlternates(`/section/${key}`, {
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.75,
      })
  );

  // ── Source landing pages — one per active source × 2 locales ───────────
  let sourcePages: MetadataRoute.Sitemap = [];
  try {
    const activeSources = await db
      .select({ slug: sources.slug })
      .from(sources)
      .where(eq(sources.is_active, true));

    sourcePages = activeSources.flatMap((s) =>
      withAlternates(`/source/${s.slug}`, {
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.65,
      })
    );
  } catch (err) {
    // If the DB is unreachable during a build the sitemap should still render
    // the static portion. Surface the issue in logs but don't fail the route.
    console.error("[sitemap] failed to load sources:", err);
  }

  return [
    ...rootPages,
    ...productPages,
    ...countryPages,
    ...sectionPages,
    ...sourcePages,
  ];
}

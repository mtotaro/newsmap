import type { MetadataRoute } from "next";
import { CANONICAL_SLUGS } from "@/lib/countries";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";
const LOCALES = ["es", "en"] as const;

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

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [...rootPages, ...productPages, ...countryPages];
}

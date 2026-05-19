import type { MetadataRoute } from "next";
import { CANONICAL_SLUGS } from "@/lib/countries";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";
const LOCALES = ["es", "en"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/es`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${APP_URL}/en`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Country news pages — one per locale per country
  const countryPages: MetadataRoute.Sitemap = CANONICAL_SLUGS.flatMap((slug) =>
    LOCALES.map((locale) => ({
      url: `${APP_URL}/${locale}/news/${slug}`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    }))
  );

  return [...staticPages, ...countryPages];
}

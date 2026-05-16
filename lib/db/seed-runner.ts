import "dotenv/config";
import { db } from "./index";
import { sources } from "./schema";
import { SOURCES, NEEDS_VERIFICATION, type SourceSeed } from "./seed";
import { sql } from "drizzle-orm";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDbRow(s: SourceSeed) {
  return {
    name: s.name,
    slug: slugify(s.name),
    country_code: s.countryCode,
    region: s.region as
      | "latam"
      | "north_america"
      | "europe"
      | "asia"
      | "africa",
    url: s.websiteUrl,
    feeds: s.feedSections.map((fs) => ({
      section_key: fs.key,
      url: fs.url,
      is_active: true,
    })),
    is_active: !NEEDS_VERIFICATION.has(s.name),
    needs_user_agent: false,
    image_strategy: "og_image" as const,
    logo_url: s.logoUrl,
  };
}

async function main() {
  console.log(`Seeding ${SOURCES.length} sources...`);

  for (const s of SOURCES) {
    const row = toDbRow(s);
    await db
      .insert(sources)
      .values(row)
      .onConflictDoUpdate({
        target: sources.slug,
        set: {
          name: sql`excluded.name`,
          feeds: sql`excluded.feeds`,
          is_active: sql`excluded.is_active`,
        },
      });
    console.log(`  ${row.is_active ? "✓" : "⏸"} ${s.name} (${s.countryCode})`);
  }

  console.log(`Done. ${SOURCES.filter((s) => NEEDS_VERIFICATION.has(s.name)).length} sources pending manual verification.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

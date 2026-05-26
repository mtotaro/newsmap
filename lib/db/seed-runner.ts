import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Imports that depend on env vars must come AFTER dotenv.config (CommonJS require order)
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sources } from "./schema";
import { SOURCES, NEEDS_VERIFICATION, type SourceSeed } from "./seed";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

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
    slug: s.slug ?? slugify(s.name),
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
    needs_user_agent: s.needsUserAgent ?? false,
    image_strategy: "og_image" as const,
    logo_url: s.logoUrl,
  };
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  // Create connection inline so env vars are definitely available
  const client = postgres(url, { prepare: false, max: 5 });
  const db = drizzle(client, { schema });

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
          needs_user_agent: sql`excluded.needs_user_agent`,
        },
      });
    console.log(`  ${row.is_active ? "✓" : "⏸"} ${s.name} (${s.countryCode})`);
  }

  console.log(
    `Done. ${SOURCES.filter((s) => NEEDS_VERIFICATION.has(s.name)).length} sources pending manual verification.`
  );
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * One-off cleanup: replace XML entity sequences (`&amp;`, `&lt;`, …) inside
 * `articles.thumbnail_url` and `articles.url` with their real characters.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The Google News sitemap (Página 12 + any other publisher using one)
 * encodes ampersands in image URLs as `&amp;` per XML spec. Our hand-rolled
 * sitemap parser didn't decode entities, so signed image URLs were saved
 * as literal `?auth=X&amp;width=380` — browsers see that as parameter
 * `auth=X` then `amp;width=380` (broken) and the auth signature fails,
 * yielding a 404 / broken image in the UI.
 *
 * Run once after deploying the parser fix:
 *
 *   npm run db:fix-xml-entities          # actually update
 *   npm run db:fix-xml-entities -- --dry # count only, no writes
 *
 * Safe to re-run — only rows that still match `LIKE '%&...;%'` are touched.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Add it to .env.local first.");
    process.exit(1);
  }
  const dryRun = process.argv.includes("--dry") || process.argv.includes("--dry-run");

  const client = postgres(dbUrl, {
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });
  const db = drizzle(client, { schema });

  console.log(`Mode: ${dryRun ? "DRY-RUN (no writes)" : "WRITE"}\n`);

  // ── Count broken rows ───────────────────────────────────────────────────
  const thumbCount = (await db.execute(sql`
    SELECT count(*)::int AS n FROM articles
    WHERE thumbnail_url LIKE '%&amp;%'
       OR thumbnail_url LIKE '%&lt;%'
       OR thumbnail_url LIKE '%&gt;%'
       OR thumbnail_url LIKE '%&quot;%'
  `)) as unknown as Array<{ n: number }>;
  const urlCount = (await db.execute(sql`
    SELECT count(*)::int AS n FROM articles
    WHERE url LIKE '%&amp;%'
       OR url LIKE '%&lt;%'
       OR url LIKE '%&gt;%'
  `)) as unknown as Array<{ n: number }>;

  console.log(`Rows with entity-encoded thumbnail_url: ${thumbCount[0]?.n ?? 0}`);
  console.log(`Rows with entity-encoded url:           ${urlCount[0]?.n ?? 0}`);

  if (dryRun) {
    await client.end();
    return;
  }

  // ── Update thumbnail_url ────────────────────────────────────────────────
  // Five nested REPLACE() calls — Postgres has no built-in HTML entity decode
  // but REPLACE is fast on a column index lookup.
  const thumbRes = await db.execute(sql`
    UPDATE articles
    SET thumbnail_url = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(thumbnail_url,
      '&amp;', '&'),
      '&lt;', '<'),
      '&gt;', '>'),
      '&quot;', '"'),
      '&apos;', '''')
    WHERE thumbnail_url LIKE '%&amp;%'
       OR thumbnail_url LIKE '%&lt;%'
       OR thumbnail_url LIKE '%&gt;%'
       OR thumbnail_url LIKE '%&quot;%'
       OR thumbnail_url LIKE '%&apos;%'
  `);
  console.log(`Updated thumbnail_url on ${thumbRes.count ?? 0} rows`);

  // ── Update url (defensive — rarely affected) ────────────────────────────
  const urlRes = await db.execute(sql`
    UPDATE articles
    SET url = REPLACE(REPLACE(REPLACE(url,
      '&amp;', '&'),
      '&lt;', '<'),
      '&gt;', '>')
    WHERE url LIKE '%&amp;%'
       OR url LIKE '%&lt;%'
       OR url LIKE '%&gt;%'
  `);
  console.log(`Updated url on ${urlRes.count ?? 0} rows`);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

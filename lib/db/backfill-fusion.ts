/**
 * Backfill: re-process existing Arc Publishing articles through the Fusion
 * extractor.
 *
 * WHY THIS EXISTS
 * ───────────────
 * The enricher (inngest/functions/enrich-content.ts) only enriches articles
 * whose `content_html IS NULL`. Articles ingested before the Fusion extractor
 * landed (Phase 9) already have content_html filled by Mozilla Readability,
 * which on Arc Publishing sites (Página 12, Infobae, La Nación) leaks site
 * chrome and lists of related articles into the body. Their `section_key` was
 * also URL-inferred, which is often wrong (e.g. ~85% of Infobae articles ended
 * up as "world" because their URLs start with `/america/`).
 *
 * This one-off backfill walks every article from known Arc-Publishing
 * sources, re-fetches the article page, extracts Fusion.globalContent, and
 * overwrites:
 *
 *   - content_html   → clean structured body from Fusion content_elements
 *   - section_key    → publisher's own taxonomy.sections[0] (mapped to enum)
 *   - thumbnail_url  → only when null (preserves any RSS-supplied image)
 *   - description    → only when null
 *
 * USAGE
 * ─────
 *   npm run db:backfill-fusion                        # all Arc sources
 *   npm run db:backfill-fusion -- --slug=pagina-12    # one source only
 *   npm run db:backfill-fusion -- --limit=50          # cap to 50 articles
 *   npm run db:backfill-fusion -- --dry-run           # show counts, no writes
 *
 * The script is idempotent and abortable. Ctrl-C is safe at any point — any
 * articles already updated stay updated, and re-running picks up where it
 * left off (Fusion-clean content stays Fusion-clean because we always
 * re-extract; URL-clean content is detected and skipped).
 *
 * Concurrency is capped at 3 parallel HTTP fetches to stay polite. At that
 * rate, ~3000 Infobae articles takes 30-60 minutes depending on latency.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Imports that depend on env vars must come AFTER dotenv.config
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, inArray, sql } from "drizzle-orm";
import { articles, sources } from "./schema";
import * as schema from "./schema";
import { extractFusionContent } from "../rss/fusion-extractor";
import { mapSectionName } from "../rss/section-inference";
import { sanitizeArticleHtml } from "../sanitize/article-html";

/**
 * Sources we know use Arc Publishing — these are guaranteed to have
 * Fusion.globalContent on their article pages. The script skips sources
 * not in this list because re-fetching them would be a waste of HTTP
 * requests (no Fusion → no update).
 */
const ARC_SOURCE_SLUGS = [
  "pagina-12",
  "infobae",
  "la-nacion",
  "el-economista-ar",
  "la-tercera",
];

/**
 * Domains that actively block automated HTTP access. Mirror of the list in
 * inngest/functions/enrich-content.ts — duplicated here so the script doesn't
 * pull in the Inngest runtime.
 */
const SKIP_DOMAINS = new Set([
  "espndeportes.espn.com",
  "espn.go.com",
  "www.espn.com",
  "espn.com",
  "www.elmundo.es",
  "elmundo.es",
  "www.marca.com",
  "marca.com",
  "elpais.com",
  "www.elpais.com",
  "as.com",
  "www.as.com",
]);

const CONCURRENCY = 3;
const FETCH_TIMEOUT_MS = 12_000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ────────────────────────────────────────────────────────────────────────────
// HTTP

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Per-article processing

type CandidateRow = {
  id: string;
  url: string;
  source_slug: string;
  section_key: string;
};

type ProcessResult =
  | "updated"
  | "no-fusion"
  | "skipped"
  | "failed";

async function processArticle(
  db: ReturnType<typeof drizzle>,
  row: CandidateRow,
  dryRun: boolean
): Promise<ProcessResult> {
  let host: string;
  try {
    host = new URL(row.url).hostname;
  } catch {
    return "failed";
  }
  if (SKIP_DOMAINS.has(host)) return "skipped";

  const html = await fetchHtml(row.url);
  if (!html) return "failed";

  const fusion = extractFusionContent(html);
  if (!fusion) return "no-fusion";

  const textLen = fusion.body_html.replace(/<[^>]+>/g, " ").trim().length;
  if (textLen < 200) return "no-fusion";

  const mapped =
    mapSectionName(fusion.section_id) ?? mapSectionName(fusion.section_name);

  if (dryRun) return "updated";

  await db
    .update(articles)
    .set({
      content_html: sanitizeArticleHtml(fusion.body_html),
      ...(mapped ? { section_key: mapped } : {}),
      ...(fusion.thumbnail_url
        ? {
            thumbnail_url: sql`COALESCE(${articles.thumbnail_url}, ${fusion.thumbnail_url})`,
          }
        : {}),
      ...(fusion.description
        ? {
            description: sql`COALESCE(${articles.description}, ${fusion.description})`,
          }
        : {}),
    })
    .where(eq(articles.id, row.id));

  return "updated";
}

// ────────────────────────────────────────────────────────────────────────────
// Concurrency control

type Stats = Record<ProcessResult, number>;

async function processWithConcurrency(
  db: ReturnType<typeof drizzle>,
  rows: CandidateRow[],
  dryRun: boolean,
  onResult: (result: ProcessResult, row: CandidateRow, idx: number) => void
): Promise<void> {
  // Simple semaphore — pull from queue, kick off up to CONCURRENCY in flight
  const queue = rows.slice();
  let idx = 0;
  let inFlight = 0;

  return new Promise<void>((resolve) => {
    const drain = () => {
      if (queue.length === 0 && inFlight === 0) return resolve();
      while (inFlight < CONCURRENCY && queue.length > 0) {
        const row = queue.shift()!;
        const myIdx = idx++;
        inFlight++;
        processArticle(db, row, dryRun)
          .then((result) => onResult(result, row, myIdx))
          .catch(() => onResult("failed", row, myIdx))
          .finally(() => {
            inFlight--;
            drain();
          });
      }
    };
    drain();
  });
}

// ────────────────────────────────────────────────────────────────────────────
// CLI args

function parseArg(flag: string): string | null {
  for (let i = 0; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === `--${flag}`) return process.argv[i + 1] ?? "";
    if (a.startsWith(`--${flag}=`)) return a.slice(flag.length + 3);
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────────
// Main

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Add it to .env.local first.");
    process.exit(1);
  }

  const slugFilter = parseArg("slug");
  const limitArg = parseArg("limit");
  const limit = limitArg ? parseInt(limitArg, 10) : undefined;
  const dryRun = process.argv.includes("--dry-run");

  console.log("Backfill: Fusion extraction for Arc Publishing articles\n");
  console.log(`  Slug filter: ${slugFilter ?? "(all Arc sources)"}`);
  console.log(`  Limit:       ${limit ?? "no limit"}`);
  console.log(`  Dry run:     ${dryRun}`);
  console.log(`  Concurrency: ${CONCURRENCY}\n`);

  const client = postgres(dbUrl, { prepare: false, max: 5, connect_timeout: 10 });
  const db = drizzle(client, { schema });

  const slugs = slugFilter ? [slugFilter] : ARC_SOURCE_SLUGS;
  console.log(`Loading candidates from: ${slugs.join(", ")}...`);

  let candidates = await db
    .select({
      id: articles.id,
      url: articles.url,
      source_slug: sources.slug,
      section_key: articles.section_key,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.source_id, sources.id))
    .where(inArray(sources.slug, slugs))
    .orderBy(sources.slug, articles.published_at);

  if (limit !== undefined && Number.isFinite(limit)) {
    candidates = candidates.slice(0, limit);
  }

  console.log(`Found ${candidates.length} candidate articles.\n`);
  if (candidates.length === 0) {
    await client.end();
    return;
  }

  // Group counts by source for visibility
  const bySource: Record<string, number> = {};
  for (const c of candidates) bySource[c.source_slug] = (bySource[c.source_slug] ?? 0) + 1;
  for (const [s, n] of Object.entries(bySource)) {
    console.log(`  ${s.padEnd(22)} ${n} articles`);
  }
  console.log("");

  const stats: Stats = { updated: 0, "no-fusion": 0, skipped: 0, failed: 0 };
  let done = 0;
  const startedAt = Date.now();

  await processWithConcurrency(db, candidates, dryRun, (result, row) => {
    stats[result]++;
    done++;
    if (done % 25 === 0 || done === candidates.length) {
      const pct = ((done / candidates.length) * 100).toFixed(1);
      const elapsed = (Date.now() - startedAt) / 1000;
      const rate = done / elapsed;
      const etaSec = (candidates.length - done) / Math.max(rate, 0.001);
      const eta =
        etaSec > 60
          ? `${Math.round(etaSec / 60)}m`
          : `${Math.round(etaSec)}s`;
      console.log(
        `  ${String(done).padStart(5)}/${candidates.length} ` +
          `(${pct.padStart(5)}%) ` +
          `${rate.toFixed(2).padStart(5)}/s eta ${eta.padStart(4)}  ` +
          `· updated=${stats.updated} no-fusion=${stats["no-fusion"]} ` +
          `skipped=${stats.skipped} failed=${stats.failed}`
      );
    }
    // Log failures with the URL so they can be inspected after the run
    if (result === "failed") {
      console.log(`    └─ FAILED: ${row.url}`);
    }
  });

  const totalSec = (Date.now() - startedAt) / 1000;
  console.log("\nDone!");
  console.log(`  Updated:    ${stats.updated}`);
  console.log(`  No Fusion:  ${stats["no-fusion"]} (likely paywalled or not Arc)`);
  console.log(`  Skipped:    ${stats.skipped} (blocked domain)`);
  console.log(`  Failed:     ${stats.failed} (HTTP error or timeout)`);
  console.log(`  Total time: ${Math.round(totalSec)}s (${(totalSec / 60).toFixed(1)}m)`);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

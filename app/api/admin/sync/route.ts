/**
 * DEV-ONLY: Manually trigger an RSS fetch for all active sources.
 *
 * This bypasses Inngest and runs the parser inline so you can populate
 * the articles table immediately without waiting for the 15-min cron.
 *
 * Usage:  curl -X POST http://localhost:3000/api/admin/sync
 * Or open the empty feed page — it shows a "Sync now" button in dev mode.
 *
 * NEVER expose this in production (guarded by NODE_ENV check).
 */
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sources, articles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { parseFeed } from "@/lib/rss/parser";

export async function POST(request: Request) {
  // Guard 1: block in production unless a secret header is provided
  const isProduction = process.env.NODE_ENV === "production";
  const adminSecret = process.env.ADMIN_SYNC_SECRET;
  const providedSecret = request.headers.get("x-admin-secret");

  if (isProduction && (!adminSecret || providedSecret !== adminSecret)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const activeSources = await db
    .select()
    .from(sources)
    .where(eq(sources.is_active, true));

  if (!activeSources.length) {
    return NextResponse.json({ error: "No active sources found. Run the seed script first." }, { status: 400 });
  }

  let totalFetched = 0;
  let totalInserted = 0;
  const errors: string[] = [];

  // Fetch sources sequentially to avoid hammering servers
  for (const source of activeSources) {
    try {
      const parsed = await parseFeed(source);
      if (!parsed.length) continue;

      totalFetched += parsed.length;

      const result = await db
        .insert(articles)
        .values(parsed.map((a) => ({ ...a, published_at: new Date(a.published_at) })))
        // Update section_key on re-sync so fixes to seed/inference are applied retroactively
        .onConflictDoUpdate({
          target: [articles.source_id, articles.guid],
          set: { section_key: sql`excluded.section_key` },
        })
        .returning({ id: articles.id });

      totalInserted += result.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${source.slug}: ${msg}`);
      console.error(`[admin/sync] Error fetching ${source.slug}:`, msg);
    }
  }

  return NextResponse.json({
    sources: activeSources.length,
    fetched: totalFetched,
    inserted: totalInserted,
    errors,
  });
}

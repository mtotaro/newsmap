import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { articles, sources, userSubscriptions } from "@/lib/db/schema";
import { eq, and, lt, desc, getTableColumns, sql, ilike, or } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor"); // ISO timestamp
    const section = searchParams.get("section"); // optional section filter
    const q = searchParams.get("q");             // optional full-text search

    // ── Common filters (apply to both anonymous + authenticated feeds) ──────
    const conditions = [];

    if (cursor) {
      conditions.push(lt(articles.published_at, new Date(cursor)));
    }

    // Full-text search — case-insensitive substring match on title + description
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(ilike(articles.title, term), ilike(articles.description, term))!
      );
    }

    // UI section filter
    if (section) {
      const { sectionKeyEnum } = await import("@/lib/db/schema");
      const validSection = sectionKeyEnum.enumValues.find((v) => v === section);
      if (validSection) {
        conditions.push(eq(articles.section_key, validSection));
      }
    }

    // ── Anonymous: public discovery feed (all sources, no personalization) ──
    if (!user) {
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
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(articles.published_at))
        .limit(PAGE_SIZE + 1);

      return paginate(rows);
    }

    // ── Authenticated: personalized feed (only subscribed sources) ──────────
    conditions.push(eq(userSubscriptions.user_id, user.id));

    // Per-subscription section filter (only when no explicit UI section override):
    // Include the article if the subscription has no section restriction (NULL)
    // OR if the article's section_key is in the subscription's section_keys array.
    if (!section) {
      conditions.push(
        sql`(
          ${userSubscriptions.section_keys} IS NULL
          OR ${articles.section_key}::text = ANY(${userSubscriptions.section_keys})
        )`
      );
    }

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
      .innerJoin(
        userSubscriptions,
        and(
          eq(userSubscriptions.source_id, articles.source_id),
          eq(userSubscriptions.user_id, user.id)
        )
      )
      .where(and(...conditions))
      .orderBy(desc(articles.published_at))
      .limit(PAGE_SIZE + 1);

    return paginate(rows);
  } catch (err) {
    console.error("[GET /api/feed]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function paginate<T extends { published_at: Date }>(rows: T[]) {
  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? items[items.length - 1].published_at.toISOString()
    : null;
  return NextResponse.json({ items, nextCursor });
}

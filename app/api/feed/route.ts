import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { articles, sources, userSubscriptions } from "@/lib/db/schema";
import { eq, and, lt, desc, getTableColumns, sql, ilike, or } from "drizzle-orm";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor"); // ISO timestamp
  const section = searchParams.get("section"); // optional section filter
  const q = searchParams.get("q");             // optional full-text search

  const conditions = [eq(userSubscriptions.user_id, user.id)];

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

  // UI section filter (overrides per-subscription section_keys for browsing)
  if (section) {
    const { sectionKeyEnum } = await import("@/lib/db/schema");
    const validSection = sectionKeyEnum.enumValues.find((v) => v === section);
    if (validSection) {
      conditions.push(eq(articles.section_key, validSection));
    }
  } else {
    // Per-subscription section filter:
    // Include the article if the subscription has no section restriction (NULL)
    // OR if the article's section_key is in the subscription's section_keys array.
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
      eq(userSubscriptions.source_id, articles.source_id)
    )
    .where(and(...conditions))
    .orderBy(desc(articles.published_at))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? items[items.length - 1].published_at.toISOString()
    : null;

  return NextResponse.json({ items, nextCursor });
}

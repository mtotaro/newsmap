import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { articles, sources, userSubscriptions } from "@/lib/db/schema";
import { eq, and, lt, desc, getTableColumns } from "drizzle-orm";

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
  const section = searchParams.get("section"); // optional filter

  const conditions = [eq(userSubscriptions.user_id, user.id)];
  if (cursor) {
    conditions.push(lt(articles.published_at, new Date(cursor)));
  }
  if (section) {
    // Dynamic import to avoid circular deps with schema enum
    const { sectionKeyEnum } = await import("@/lib/db/schema");
    const validSection = sectionKeyEnum.enumValues.find((v) => v === section);
    if (validSection) {
      conditions.push(eq(articles.section_key, validSection));
    }
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
    .limit(PAGE_SIZE + 1); // +1 to check hasMore

  const hasMore = rows.length > PAGE_SIZE;
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? items[items.length - 1].published_at.toISOString()
    : null;

  return NextResponse.json({ items, nextCursor });
}

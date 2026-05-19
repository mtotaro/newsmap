import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sources, userSubscriptions, articles } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import type { FeedEntry, SectionKey } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");

  let query = db
    .select({
      id: sources.id,
      name: sources.name,
      slug: sources.slug,
      country_code: sources.country_code,
      region: sources.region,
      url: sources.url,
      logo_url: sources.logo_url,
      feeds: sources.feeds,
    })
    .from(sources)
    .where(eq(sources.is_active, true))
    .$dynamic();

  if (country) {
    query = query.where(
      and(eq(sources.is_active, true), eq(sources.country_code, country))
    );
  }

  const allSources = await query;

  // Determine which sources rely on article-level section inference
  // (feeds that only have section_key = "all" have no per-section feeds)
  const inferredSourceIds: string[] = [];

  const withStaticSections = allSources.map((s) => {
    const feeds = (s.feeds ?? []) as FeedEntry[];
    const activeSectionKeys = feeds
      .filter((f) => f.is_active !== false && f.section_key !== "all")
      .map((f) => f.section_key as SectionKey);

    if (activeSectionKeys.length === 0) {
      // All feeds use inference — resolve sections from articles table
      inferredSourceIds.push(s.id);
      return { ...s, feeds: undefined, available_sections: [] as SectionKey[] };
    }

    return {
      ...s,
      feeds: undefined,
      available_sections: [...new Set(activeSectionKeys)],
    };
  });

  // For sources without explicit section feeds, derive sections from stored articles
  if (inferredSourceIds.length > 0) {
    const rows = await db
      .select({
        source_id: articles.source_id,
        section_key: articles.section_key,
      })
      .from(articles)
      .where(inArray(articles.source_id, inferredSourceIds))
      .groupBy(articles.source_id, articles.section_key)
      .orderBy(sql`count(*) desc`);

    // Build a map: source_id → sorted list of distinct section_keys
    const sectionsBySource = new Map<string, SectionKey[]>();
    for (const row of rows) {
      if (!row.section_key) continue;
      const existing = sectionsBySource.get(row.source_id) ?? [];
      existing.push(row.section_key as SectionKey);
      sectionsBySource.set(row.source_id, existing);
    }

    // Inject into the results
    for (const s of withStaticSections) {
      if (inferredSourceIds.includes(s.id)) {
        s.available_sections = sectionsBySource.get(s.id) ?? [];
      }
    }
  }

  // Attach subscription status + section_keys if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const subs = await db
      .select({
        source_id: userSubscriptions.source_id,
        section_keys: userSubscriptions.section_keys,
      })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.user_id, user.id));

    const subsMap = new Map(subs.map((s) => [s.source_id, s.section_keys]));

    return NextResponse.json(
      withStaticSections.map((s) => ({
        ...s,
        subscribed: subsMap.has(s.id),
        subscription_sections: subsMap.has(s.id)
          ? (subsMap.get(s.id) ?? null)
          : null,
      }))
    );
  }

  return NextResponse.json(
    withStaticSections.map((s) => ({
      ...s,
      subscribed: false,
      subscription_sections: null,
    }))
  );
}

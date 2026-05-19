import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sources, userSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import type { FeedEntry } from "@/lib/db/schema";

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

  // Extract distinct available sections per source (from feed entries)
  const withSections = allSources.map((s) => {
    const feeds = (s.feeds ?? []) as FeedEntry[];
    const available_sections = [
      ...new Set(
        feeds
          .filter((f) => f.is_active !== false)
          .map((f) => f.section_key)
      ),
    ];
    return { ...s, feeds: undefined, available_sections };
  });

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
      withSections.map((s) => ({
        ...s,
        subscribed: subsMap.has(s.id),
        subscription_sections: subsMap.has(s.id)
          ? (subsMap.get(s.id) ?? null)
          : null,
      }))
    );
  }

  return NextResponse.json(
    withSections.map((s) => ({
      ...s,
      subscribed: false,
      subscription_sections: null,
    }))
  );
}

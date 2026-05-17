import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sources, userSubscriptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

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

  // Attach subscription status if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const subs = await db
      .select({ source_id: userSubscriptions.source_id })
      .from(userSubscriptions)
      .where(eq(userSubscriptions.user_id, user.id));

    const subscribedSet = new Set(subs.map((s) => s.source_id));
    return NextResponse.json(
      allSources.map((s) => ({ ...s, subscribed: subscribedSet.has(s.id) }))
    );
  }

  return NextResponse.json(allSources.map((s) => ({ ...s, subscribed: false })));
}

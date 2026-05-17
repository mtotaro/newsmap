import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userSubscriptions, sources } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { inngest } from "@/inngest/client";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await db
    .select({ source_id: userSubscriptions.source_id })
    .from(userSubscriptions)
    .where(eq(userSubscriptions.user_id, user.id));

  return NextResponse.json(subs.map((s) => s.source_id));
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { source_id } = await request.json();
  if (!source_id) return NextResponse.json({ error: "source_id required" }, { status: 400 });

  // Check if this source has ever been fetched (has articles)
  const [source] = await db
    .select({ id: sources.id, slug: sources.slug })
    .from(sources)
    .where(eq(sources.id, source_id));

  if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

  await db
    .insert(userSubscriptions)
    .values({ user_id: user.id, source_id })
    .onConflictDoNothing();

  // Immediate fetch for a newly subscribed source so the feed isn't empty
  await inngest.send({
    name: "newsmap/source.fetch",
    data: { source_id: source.id, source_slug: source.slug },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { source_id } = await request.json();
  if (!source_id) return NextResponse.json({ error: "source_id required" }, { status: 400 });

  await db
    .delete(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.user_id, user.id),
        eq(userSubscriptions.source_id, source_id)
      )
    );

  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  // Bulk subscribe — used by onboarding
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slugs }: { slugs: string[] } = await request.json();
  if (!slugs?.length) return NextResponse.json({ error: "slugs required" }, { status: 400 });

  const sourcesToSubscribe = await db
    .select({ id: sources.id, slug: sources.slug })
    .from(sources)
    .where(and(eq(sources.is_active, true), inArray(sources.slug, slugs)));

  if (!sourcesToSubscribe.length) return NextResponse.json({ ok: true, count: 0 });

  await db
    .insert(userSubscriptions)
    .values(sourcesToSubscribe.map((s) => ({ user_id: user.id, source_id: s.id })))
    .onConflictDoNothing();

  // Fan-out immediate fetch for all new sources
  await inngest.send(
    sourcesToSubscribe.map((s) => ({
      name: "newsmap/source.fetch" as const,
      data: { source_id: s.id, source_slug: s.slug },
    }))
  );

  return NextResponse.json({ ok: true, count: sourcesToSubscribe.length });
}

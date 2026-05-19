import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userSubscriptions, sources } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { inngest } from "@/inngest/client";

function normalizeKeys(keys: string[] | null | undefined): string[] | null {
  if (!keys || keys.length === 0) return null; // null = all sections
  return keys;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await db
    .select({
      source_id: userSubscriptions.source_id,
      section_keys: userSubscriptions.section_keys,
    })
    .from(userSubscriptions)
    .where(eq(userSubscriptions.user_id, user.id));

  return NextResponse.json(subs);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { source_id: string; section_keys?: string[] | null };
  const { source_id } = body;
  if (!source_id) return NextResponse.json({ error: "source_id required" }, { status: 400 });

  const [source] = await db
    .select({ id: sources.id, slug: sources.slug })
    .from(sources)
    .where(eq(sources.id, source_id));

  if (!source) return NextResponse.json({ error: "Source not found" }, { status: 404 });

  await db
    .insert(userSubscriptions)
    .values({
      user_id: user.id,
      source_id,
      section_keys: normalizeKeys(body.section_keys),
    })
    .onConflictDoNothing();

  // Immediate fetch so the feed isn't empty after subscribing
  await inngest.send({
    name: "newsmap/source.fetch",
    data: { source_id: source.id, source_slug: source.slug },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  // Update section_keys for an existing subscription
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as { source_id: string; section_keys: string[] | null };
  const { source_id } = body;
  if (!source_id) return NextResponse.json({ error: "source_id required" }, { status: 400 });

  await db
    .update(userSubscriptions)
    .set({ section_keys: normalizeKeys(body.section_keys) })
    .where(
      and(
        eq(userSubscriptions.user_id, user.id),
        eq(userSubscriptions.source_id, source_id)
      )
    );

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
  // Bulk subscribe (onboarding) — subscribes to all sections by default
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
    .values(
      sourcesToSubscribe.map((s) => ({
        user_id: user.id,
        source_id: s.id,
        section_keys: null, // null = all sections
      }))
    )
    .onConflictDoNothing();

  await inngest.send(
    sourcesToSubscribe.map((s) => ({
      name: "newsmap/source.fetch" as const,
      data: { source_id: s.id, source_slug: s.slug },
    }))
  );

  return NextResponse.json({ ok: true, count: sourcesToSubscribe.length });
}

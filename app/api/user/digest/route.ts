/**
 * GET  /api/user/digest → returns current digest preferences for the logged-in user
 * POST /api/user/digest → upserts digest preferences (digest_enabled, digest_hour)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db
    .select({
      digest_enabled: userProfiles.digest_enabled,
      digest_hour: userProfiles.digest_hour,
    })
    .from(userProfiles)
    .where(eq(userProfiles.user_id, user.id));

  return NextResponse.json(
    profile ?? { digest_enabled: false, digest_hour: 7 }
  );
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { digest_enabled?: boolean; digest_hour?: number };
  const { digest_enabled, digest_hour } = body;

  if (
    typeof digest_enabled !== "boolean" ||
    (digest_hour !== undefined &&
      (typeof digest_hour !== "number" ||
        digest_hour < 0 ||
        digest_hour > 23 ||
        !Number.isInteger(digest_hour)))
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updates = {
    digest_enabled,
    ...(digest_hour !== undefined ? { digest_hour } : {}),
    updated_at: new Date(),
    // Generate unsubscribe token on first opt-in
    digest_unsubscribe_token: randomUUID(),
  };

  await db
    .insert(userProfiles)
    .values({
      user_id: user.id,
      ...updates,
    })
    .onConflictDoUpdate({
      target: userProfiles.user_id,
      set: updates,
    });

  return NextResponse.json({ ok: true });
}

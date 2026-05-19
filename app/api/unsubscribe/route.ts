/**
 * GET /api/unsubscribe?token=<digest_unsubscribe_token>
 *
 * One-click unsubscribe from the daily digest.
 * No login required — token is user-specific and rotation-safe.
 *
 * On success: sets digest_enabled=false and rotates the token (invalidates link).
 * Redirects to the home page with a confirmation query param.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(`${APP_URL}?unsubscribe=invalid`);
    }

    const [profile] = await db
      .select({ user_id: userProfiles.user_id })
      .from(userProfiles)
      .where(eq(userProfiles.digest_unsubscribe_token, token));

    if (!profile) {
      return NextResponse.redirect(`${APP_URL}?unsubscribe=invalid`);
    }

    // Disable digest and rotate token so the old link becomes invalid
    await db
      .update(userProfiles)
      .set({
        digest_enabled: false,
        digest_unsubscribe_token: randomUUID(),
        updated_at: new Date(),
      })
      .where(eq(userProfiles.user_id, profile.user_id));

    return NextResponse.redirect(`${APP_URL}?unsubscribe=success`);
  } catch (err) {
    console.error("[GET /api/unsubscribe]", err);
    return NextResponse.redirect(`${APP_URL}?unsubscribe=error`);
  }
}

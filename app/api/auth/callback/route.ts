import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase OAuth / magic-link callback.
 *
 * Supabase redirects here after Google OAuth or email magic-link with a
 * short-lived `code`. We exchange it server-side for a session cookie and
 * then redirect the user to their destination (default: /en/feed).
 *
 * Add this URL to Supabase → Auth → URL Configuration → Redirect URLs:
 *   http://localhost:3000/api/auth/callback
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets the auth page pass the final destination locale-aware.
  // Validate it is a relative path to prevent open-redirect attacks:
  //   ?next=//evil.com or ?next=/@evil.com would otherwise redirect off-site.
  const rawNext = searchParams.get("next") ?? "/en/feed";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/@")
      ? rawNext
      : "/en/feed";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  // Redirect back to auth with an error flag
  return NextResponse.redirect(`${origin}/en/auth?error=callback_failed`);
}

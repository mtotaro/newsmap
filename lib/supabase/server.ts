import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase renamed anon key → publishable key in 2025; support both
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const MISSING_SUPABASE = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
  },
} as ReturnType<typeof createServerClient>;

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_KEY) {
    return MISSING_SUPABASE;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies can't be set, middleware handles it
          }
        },
      },
    }
  );
}

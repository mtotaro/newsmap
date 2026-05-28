import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function isSafeNextPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/@");
}

export function buildAuthRedirectPath(locale: string, nextPath: string) {
  const safeNextPath = isSafeNextPath(nextPath) ? nextPath : `/${locale}/feed`;
  return `/${locale}/auth?next=${encodeURIComponent(safeNextPath)}`;
}

export async function requirePageUser(locale: string, nextPath: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(buildAuthRedirectPath(locale, nextPath));
  }

  return user;
}
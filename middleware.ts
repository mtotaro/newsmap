import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Refresh Supabase session on every request
  const supabaseResponse = await updateSession(request);

  // If updateSession redirected (e.g. to login), respect that
  if (supabaseResponse.status !== 200) return supabaseResponse;

  // Apply next-intl locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (Next.js static assets)
     *  - _next/image   (Next.js image optimisation)
     *  - favicon.ico
     *  - api/*         (ALL API routes — must not be locale-prefixed)
     *  - sw.js         (service worker — must be served from root)
     *  - manifest.json (PWA manifest — must be served from root)
     *  - offline.html  (SW offline fallback)
     *  - common image/font extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/|sw\\.js|manifest\\.json|offline\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|ttf|woff2?)$).*)",
  ],
};

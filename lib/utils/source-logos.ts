const SOURCE_LOGO_OVERRIDES: Record<string, string> = {
  // Pagina 12's favicon endpoint returns the site's 404 page instead of an icon.
  "pagina-12": "https://www.pagina12.com.ar/pf/resources/p12logo.svg?d=104&mxId=00000000",
};

export function normalizeSourceLogoUrl(
  sourceSlug: string | null | undefined,
  sourceLogo: string | null | undefined
) {
  if (!sourceSlug) return sourceLogo ?? null;
  return SOURCE_LOGO_OVERRIDES[sourceSlug] ?? sourceLogo ?? null;
}
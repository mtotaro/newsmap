/**
 * Country metadata for public news pages.
 * slug → ISO 3166-1 alpha-2 code
 *
 * Canonical slugs use English names; Spanish variants included for SEO.
 */

export const COUNTRY_SLUG_TO_ALPHA2: Record<string, string> = {
  // Latin America
  argentina: "AR",
  brazil: "BR",
  brasil: "BR", // ES variant
  chile: "CL",
  colombia: "CO",
  peru: "PE",
  mexico: "MX",
  // English-speaking
  "united-states": "US",
  usa: "US",
  "united-kingdom": "GB",
  uk: "GB",
  // Europe
  spain: "ES",
  espana: "ES", // ES variant
  germany: "DE",
  alemania: "DE", // ES variant
  italy: "IT",
  italia: "IT", // ES variant
  france: "FR",
  francia: "FR", // ES variant
  // Middle East
  qatar: "QA",
};

/** Canonical URL slug for each alpha-2 code (used for hreflang + linking) */
export const ALPHA2_TO_SLUG: Record<string, string> = {
  AR: "argentina",
  BR: "brazil",
  CL: "chile",
  CO: "colombia",
  PE: "peru",
  MX: "mexico",
  US: "united-states",
  GB: "united-kingdom",
  ES: "spain",
  DE: "germany",
  IT: "italy",
  FR: "france",
  QA: "qatar",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  AR: "🇦🇷",
  BR: "🇧🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
  PE: "🇵🇪",
  MX: "🇲🇽",
  US: "🇺🇸",
  GB: "🇬🇧",
  ES: "🇪🇸",
  FR: "🇫🇷",
  DE: "🇩🇪",
  IT: "🇮🇹",
  QA: "🇶🇦",
};

/** All canonical slugs for generateStaticParams */
export const CANONICAL_SLUGS = Object.values(ALPHA2_TO_SLUG);

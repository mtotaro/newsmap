/**
 * Country metadata for public news pages.
 * slug → ISO 3166-1 alpha-2 code
 *
 * Canonical slugs use English names; Spanish variants included for SEO.
 */

export const COUNTRY_SLUG_TO_ALPHA2: Record<string, string> = {
  // Latin America — original
  argentina: "AR",
  brazil: "BR",
  brasil: "BR",
  chile: "CL",
  colombia: "CO",
  peru: "PE",
  mexico: "MX",
  // Latin America — new
  venezuela: "VE",
  ecuador: "EC",
  paraguay: "PY",
  bolivia: "BO",
  guatemala: "GT",
  "costa-rica": "CR",
  "costa rica": "CR",
  panama: "PA",
  "panamá": "PA",
  "dominican-republic": "DO",
  "republica-dominicana": "DO",
  "el-salvador": "SV",
  "el salvador": "SV",
  // English-speaking
  "united-states": "US",
  usa: "US",
  "united-kingdom": "GB",
  uk: "GB",
  // Europe
  spain: "ES",
  espana: "ES",
  germany: "DE",
  alemania: "DE",
  italy: "IT",
  italia: "IT",
  france: "FR",
  francia: "FR",
  portugal: "PT",
  netherlands: "NL",
  "países-bajos": "NL",
  sweden: "SE",
  suecia: "SE",
  // Middle East
  qatar: "QA",
};

/** Canonical URL slug for each alpha-2 code (used for hreflang + linking) */
export const ALPHA2_TO_SLUG: Record<string, string> = {
  // Latin America
  AR: "argentina",
  BR: "brazil",
  CL: "chile",
  CO: "colombia",
  PE: "peru",
  MX: "mexico",
  VE: "venezuela",
  EC: "ecuador",
  PY: "paraguay",
  BO: "bolivia",
  GT: "guatemala",
  CR: "costa-rica",
  PA: "panama",
  DO: "dominican-republic",
  SV: "el-salvador",
  // North America / Anglosphere
  US: "united-states",
  GB: "united-kingdom",
  // Europe
  ES: "spain",
  DE: "germany",
  IT: "italy",
  FR: "france",
  PT: "portugal",
  NL: "netherlands",
  SE: "sweden",
  // Middle East
  QA: "qatar",
};

export const COUNTRY_FLAGS: Record<string, string> = {
  AR: "🇦🇷",
  BR: "🇧🇷",
  CL: "🇨🇱",
  CO: "🇨🇴",
  PE: "🇵🇪",
  MX: "🇲🇽",
  VE: "🇻🇪",
  EC: "🇪🇨",
  PY: "🇵🇾",
  BO: "🇧🇴",
  GT: "🇬🇹",
  CR: "🇨🇷",
  PA: "🇵🇦",
  DO: "🇩🇴",
  SV: "🇸🇻",
  US: "🇺🇸",
  GB: "🇬🇧",
  ES: "🇪🇸",
  FR: "🇫🇷",
  DE: "🇩🇪",
  IT: "🇮🇹",
  PT: "🇵🇹",
  NL: "🇳🇱",
  SE: "🇸🇪",
  QA: "🇶🇦",
};

/** All canonical slugs for generateStaticParams */
export const CANONICAL_SLUGS = Object.values(ALPHA2_TO_SLUG);

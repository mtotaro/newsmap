import type { SectionKey } from "@/lib/db/schema";

/**
 * Maps publisher-specific category/URL fragments to one of our 9 canonical
 * sections (politics, economy, world, sports, tech, culture, health, science,
 * entertainment). Matching is case-insensitive; the lookup key must be
 * already-normalized (lowercase, diacritics stripped).
 *
 * The map is intentionally permissive — when in doubt we lean toward "world"
 * as the catch-all rather than skip the article. The user explicitly opted to
 * fold society/opinion/LGBTQ+ content into world/culture rather than introduce
 * new enum values; see SECTION_MAP entries for "sociedad", "opinion",
 * "soy", "las12" below.
 */
const SECTION_MAP: Record<string, SectionKey> = {
  // ── Sports ────────────────────────────────────────────────────────────────
  deportes: "sports",
  deporte: "sports",
  sport: "sports",
  sports: "sports",
  futbol: "sports",
  desporto: "sports",       // Portuguese
  desportos: "sports",
  libero: "sports",         // P12 supplement (football)
  "mundial-2026": "sports", // P12 World Cup section
  basquetbol: "sports",
  baloncesto: "sports",
  tenis: "sports",
  // ── Politics ──────────────────────────────────────────────────────────────
  politica: "politics",
  political: "politics",
  politics: "politics",
  nacion: "politics",
  nacional: "politics",
  nacionales: "politics",   // ABC Color
  gobierno: "politics",
  congreso: "politics",
  elecciones: "politics",
  inland: "politics",       // tagesschau /inland/
  region: "politics",
  pais: "politics",         // RTP /pais/
  "el-pais": "politics",    // P12 national politics section
  "50-anos-del-golpe": "politics", // P12 political history
  "buenos-aires12": "politics",    // P12 regional
  "rosario12": "politics",
  "salta12": "politics",
  "argentina12": "politics",
  "verano12": "politics",
  // ── Economy ───────────────────────────────────────────────────────────────
  economia: "economy",
  economy: "economy",
  cartera: "economy",
  negocios: "economy",
  business: "economy",
  finance: "economy",
  finanzas: "economy",
  mercados: "economy",
  dinero: "economy",
  cash: "economy",          // P12 economy supplement
  wirtschaft: "economy",    // tagesschau
  // ── Tech ──────────────────────────────────────────────────────────────────
  tecnologia: "tech",
  tecno: "tech",            // Infobae /tecno/
  techbit: "tech",
  technology: "tech",
  tech: "tech",
  innovacion: "tech",
  digital: "tech",
  // ── Culture ───────────────────────────────────────────────────────────────
  cultura: "culture",
  culture: "culture",
  "cultura-y-espectaculos": "culture", // P12
  arts: "culture",
  arte: "culture",
  libros: "culture",
  kultur: "culture",        // tagesschau
  plastica: "culture",      // P12 visual arts
  radar: "culture",         // P12 culture supplement
  "radar-libros": "culture",
  contratapa: "culture",    // P12 cultural opinion column
  entrevistas: "culture",   // P12 long-form interviews ("Diálogos")
  turismo: "culture",       // closest match for travel
  // LGBTQ+ / gender supplements — user opted to fold into culture
  soy: "culture",           // P12 LGBTQ+
  las12: "culture",         // P12 women
  negrx: "culture",         // P12 racial identity
  malena: "culture",
  // Long-form / conversation programming
  "comunicacion-y-periodismo": "culture", // P12 "La Ventana"
  publico: "culture",
  // ── Entertainment ─────────────────────────────────────────────────────────
  entretenimiento: "entertainment",
  entertainment: "entertainment",
  teleshow: "entertainment",
  espectaculos: "entertainment",
  television: "entertainment",
  cine: "entertainment",
  no: "entertainment",      // P12 youth/music supplement
  satira12: "entertainment", // P12 satire
  // ── World / International (also catch-all for opinion/society) ────────────
  mundo: "world",
  "el-mundo": "world",
  internacional: "world",
  america: "world",
  world: "world",
  international: "world",
  exterior: "world",
  globo: "world",
  ausland: "world",         // tagesschau
  // Society, opinion, general — folded into "world" per user decision
  sociedad: "world",
  opinion: "world",
  columnistas: "world",
  sucesos: "world",
  noticias: "world",        // El Universo
  actualidad: "world",
  actualite: "world",
  hoy: "world",             // P12 daily roundup
  "latinoamerica-piensa": "world", // P12 LATAM opinion
  // ── Health ────────────────────────────────────────────────────────────────
  salud: "health",
  health: "health",
  wellness: "health",
  bienestar: "health",
  gesundheit: "health",     // tagesschau
  psicologia: "health",     // P12 — mental health
  // ── Science ───────────────────────────────────────────────────────────────
  ciencia: "science",
  ciencias: "science",
  science: "science",
  wissenschaft: "science",  // tagesschau
  universidad: "science",   // P12 — closest match for academic content
};

/**
 * URL path fragments that mark content we DON'T want in the feed at all.
 * Articles whose URL contains any of these will be silently dropped by the
 * parser, never reaching the DB.
 *
 * Reasoning per entry:
 *   - recordatorios:        obituaries; not news, would create noise
 *   - cartas-de-lectores:   letters to the editor; not articles
 *   - edicion-impresa:      print edition INDEX page, not a single article
 *   - am750:                live radio stream, not a written piece
 *   - rss:                  the RSS docs page itself
 *   - contacto, terminos-y-condiciones, politica-de-privacidad:  static legal
 *
 * Match is on the lowercased URL pathname containing the fragment as a
 * standalone segment (between slashes). Substring matches on the pathname
 * suffice — false positives are very unlikely.
 */
const SKIP_URL_FRAGMENTS = [
  "/recordatorios/",
  "/cartas-de-lectores/",
  "/edicion-impresa",
  "/am750",
  "/contacto",
  "/terminos-y-condiciones",
  "/politica-de-privacidad",
  "/rss",
];

export function shouldSkipUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return SKIP_URL_FRAGMENTS.some((frag) => path.includes(frag));
  } catch {
    return false;
  }
}

export function inferSectionFromUrl(url: string): SectionKey {
  try {
    const segments = new URL(url).pathname
      .split("/")
      .map((s) => s.toLowerCase())
      .filter(Boolean);
    for (const seg of segments) {
      const mapped = SECTION_MAP[seg];
      if (mapped) return mapped;
    }
  } catch {
    // invalid URL — fall through
  }
  return "world";
}

/** Strips diacritics: "Política" → "politica", "Fútbol" → "futbol" */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function inferSectionFromCategory(
  categories: string[]
): SectionKey | null {
  for (const cat of categories) {
    const mapped = SECTION_MAP[normalize(cat)];
    if (mapped) return mapped;
  }
  return null;
}

/**
 * Map a raw section name/id (e.g. "El País", "/el-pais", "El Mundo") to our
 * canonical SectionKey. Used by the Fusion extractor to convert Arc
 * Publishing's `taxonomy.sections[0].name` (or `_id`) directly without going
 * through URL inference. Returns null if no match — caller decides fallback.
 */
export function mapSectionName(raw: string | null | undefined): SectionKey | null {
  if (!raw) return null;
  // Try the raw value normalized (handles "El País" → null because the map
  // key is "el-pais", and also handles paths like "/el-pais" by stripping
  // the leading slash).
  const candidates = [
    normalize(raw),
    normalize(raw).replace(/^\//, ""),
    normalize(raw).replace(/\s+/g, "-"),
    normalize(raw).replace(/\s+/g, ""),
  ];
  for (const c of candidates) {
    if (SECTION_MAP[c]) return SECTION_MAP[c];
  }
  return null;
}

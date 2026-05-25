import type { SectionKey } from "@/lib/db/schema";

const SECTION_MAP: Record<string, SectionKey> = {
  // Sports
  deportes: "sports",
  deporte: "sports",
  sport: "sports",
  sports: "sports",
  futbol: "sports",
  // Politics
  politica: "politics",
  nacion: "politics",
  nacional: "politics",
  politics: "politics",
  political: "politics",
  gobierno: "politics",
  congreso: "politics",
  elecciones: "politics",
  inland: "politics",      // tagesschau /inland/ = Germany/domestic
  // Economy
  economia: "economy",
  cartera: "economy",
  negocios: "economy",
  economy: "economy",
  business: "economy",
  finance: "economy",
  finanzas: "economy",
  mercados: "economy",
  dinero: "economy",
  wirtschaft: "economy",   // tagesschau /wirtschaft/
  // Tech
  tecnologia: "tech",
  tecno: "tech",            // Infobae /tecno/
  techbit: "tech",
  technology: "tech",
  tech: "tech",
  innovacion: "tech",
  digital: "tech",
  // Culture
  cultura: "culture",
  culture: "culture",
  arts: "culture",
  arte: "culture",
  libros: "culture",
  kultur: "culture",        // tagesschau /kultur/
  // Entertainment
  entretenimiento: "entertainment",
  entertainment: "entertainment",
  teleshow: "entertainment",
  espectaculos: "entertainment",
  television: "entertainment",
  cine: "entertainment",
  // World / International
  mundo: "world",
  "el-mundo": "world",     // La Nación /el-mundo/
  internacional: "world",
  america: "world",
  world: "world",
  international: "world",
  exterior: "world",
  globo: "world",
  ausland: "world",         // tagesschau /ausland/ = international/foreign
  // Health
  salud: "health",
  health: "health",
  wellness: "health",
  bienestar: "health",
  gesundheit: "health",     // tagesschau /gesundheit/
  // Science
  ciencia: "science",
  ciencias: "science",
  science: "science",
  wissenschaft: "science",  // tagesschau /wissenschaft/
  // Portuguese variants (RTP, Público, Observador)
  pais: "politics",         // RTP /pais/ = national/politics
  desporto: "sports",       // Portuguese for "sport"
  desportos: "sports",
  // Society/General → world
  sociedad: "world",
  opinion: "world",
  columnistas: "world",
  sucesos: "world",
  noticias: "world",        // El Universo /noticias/ = general news
  actualidad: "world",
  actualite: "world",
  region: "politics",       // regional/national news
  nacionales: "politics",   // ABC Color /nacionales/
};

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

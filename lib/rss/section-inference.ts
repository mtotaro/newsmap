import type { SectionKey } from "@/lib/db/schema";

const SECTION_MAP: Record<string, SectionKey> = {
  deportes: "sports",
  deporte: "sports",
  sport: "sports",
  sports: "sports",
  politica: "politics",
  nacion: "politics",
  nacional: "politics",
  politics: "politics",
  political: "politics",
  economia: "economy",
  cartera: "economy",
  negocios: "economy",
  economy: "economy",
  business: "economy",
  finance: "economy",
  tecnologia: "tech",
  techbit: "tech",
  technology: "tech",
  tech: "tech",
  cultura: "culture",
  culture: "culture",
  arts: "culture",
  entretenimiento: "entertainment",
  entertainment: "entertainment",
  teleshow: "entertainment",
  espectaculos: "entertainment",
  mundo: "world",
  internacional: "world",
  america: "world",
  world: "world",
  international: "world",
  salud: "health",
  health: "health",
  wellness: "health",
  ciencia: "science",
  science: "science",
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

export function inferSectionFromCategory(
  categories: string[]
): SectionKey | null {
  for (const cat of categories) {
    const key = cat.toLowerCase().trim();
    const mapped = SECTION_MAP[key];
    if (mapped) return mapped;
  }
  return null;
}

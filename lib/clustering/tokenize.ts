import { STOPWORDS, MIN_TOKEN_LENGTH } from "./stopwords";

/**
 * Normalise a title for similarity comparison.
 *
 * Pipeline:
 *   1. Lowercase
 *   2. Strip diacritics so "Argentina" matches "argentina" and "ñ" matches "n"
 *   3. Replace punctuation with spaces
 *   4. Split on whitespace, drop tokens shorter than MIN_TOKEN_LENGTH
 *   5. Drop stopwords
 *
 * Returns a Set so callers can compute set operations directly.
 */
export function tokenize(title: string): Set<string> {
  const normalized = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")          // strip combining diacritics
    .replace(/[^a-z0-9áéíóúñü\s]+/gi, " ")    // punctuation → space
    .replace(/\s+/g, " ")
    .trim();

  const out = new Set<string>();
  for (const word of normalized.split(" ")) {
    if (word.length < MIN_TOKEN_LENGTH) continue;
    if (STOPWORDS.has(word)) continue;
    out.add(word);
  }
  return out;
}

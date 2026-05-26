/**
 * Stopword lists for clustering. These tokens carry no semantic signal for
 * detecting "the same story" — removing them before computing Jaccard
 * similarity dramatically reduces false positives.
 *
 * Mixed-language (es + en) because headlines often contain both, and we
 * cluster across language boundaries deliberately (same global event
 * reported in different languages should still cluster).
 */
export const STOPWORDS = new Set<string>([
  // Spanish
  "el", "la", "los", "las", "un", "una", "unos", "unas", "lo",
  "de", "del", "al", "a", "en", "y", "o", "u", "e", "ni",
  "que", "qué", "se", "su", "sus", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas",
  "es", "fue", "ser", "está", "estaba", "son", "fueron", "ha", "han", "había",
  "por", "para", "con", "sin", "sobre", "bajo", "entre", "hasta", "desde", "ante",
  "más", "menos", "muy", "ya", "no", "sí", "también", "tan",
  "como", "cuando", "donde", "dónde", "porque", "porqué", "aunque", "pero", "sino",
  "le", "les", "me", "te", "nos", "os", "lo", "la", "los", "las",
  "yo", "tú", "él", "ella", "nosotros", "vosotros", "ellos", "ellas",
  "mi", "tu", "nuestra", "nuestro", "vuestra", "vuestro",
  "ante", "tras", "hacia", "según",
  "uno", "dos", "tres", "cuatro", "cinco",  // numbers often appear in dates
  "año", "años", "día", "días", "vez", "veces", "tras",
  // News-specific cruft
  "última", "ultima", "hora", "noticia", "noticias", "ayer", "hoy", "mañana", "anoche",
  "diario", "video", "fotos", "foto", "live", "vivo", "directo",
  // English
  "the", "a", "an", "and", "or", "but", "if", "of", "in", "on", "at", "by", "to", "for",
  "from", "with", "about", "as", "is", "are", "was", "were", "be", "been", "being",
  "has", "have", "had", "do", "does", "did",
  "this", "that", "these", "those",
  "i", "you", "he", "she", "it", "we", "they",
  "my", "your", "his", "her", "its", "our", "their",
  "what", "when", "where", "why", "how", "who",
  "no", "not", "yes", "so", "very", "too", "more", "less",
  "live", "video", "photo", "photos", "watch", "today", "yesterday", "tomorrow",
]);

/** Single-character tokens are always rejected — too noisy */
export const MIN_TOKEN_LENGTH = 3;

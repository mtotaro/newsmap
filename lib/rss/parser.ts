import { parseFeed as feedsmithParse } from "feedsmith";
import type { InferSelectModel } from "drizzle-orm";
import type { sources } from "@/lib/db/schema";
import type { FeedEntry, SectionKey } from "@/lib/db/schema";
import {
  inferSectionFromUrl,
  inferSectionFromCategory,
  shouldSkipUrl,
} from "./section-inference";
import { extractThumbnail, type MediaLike } from "./thumbnail";
import { sanitizeArticleHtml } from "@/lib/sanitize/article-html";

type Source = Pick<
  InferSelectModel<typeof sources>,
  "id" | "feeds" | "needs_user_agent"
>;

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (compatible; NewsMap/1.0; +contact@newsmap.app)",
  Accept:
    "application/rss+xml, application/xml, application/json, text/xml, */*",
  "Accept-Language": "es,en;q=0.9",
};

export type ParsedArticle = {
  source_id: string;
  guid: string;
  title: string;
  url: string;
  description: string | null;
  /** Sanitized HTML from <content:encoded> — null when the feed omits it */
  content_html: string | null;
  section_key: SectionKey;
  thumbnail_url: string | null;
  /** ISO 8601 string — stays as string for Inngest step serialization */
  published_at: string;
};

export async function parseFeed(source: Source): Promise<ParsedArticle[]> {
  const feeds = source.feeds as FeedEntry[];
  const activeFeeds = feeds.filter((f) => f.is_active !== false);
  if (!activeFeeds.length) return [];

  const results: ParsedArticle[] = [];

  for (const feed of activeFeeds) {
    const items = await fetchAndNormalize(feed.url, source.needs_user_agent);
    for (const item of items) {
      if (!item.title || !item.url) continue;
      // Filter out URLs the publisher uses for non-article content
      // (obituaries, letters to editor, print-edition index pages, etc.).
      // See SKIP_URL_FRAGMENTS in section-inference.ts.
      if (shouldSkipUrl(item.url)) continue;
      const sectionKey = resolveSectionKey(item.categories, item.url, feed);
      results.push({
        source_id: source.id,
        guid: item.guid ?? item.url,
        title: stripHtml(item.title),
        url: item.url,
        description: item.description ? stripHtml(item.description) : null,
        content_html: item.contentEncoded ? sanitizeArticleHtml(item.contentEncoded) : null,
        section_key: sectionKey,
        thumbnail_url: extractThumbnail(item.media, item.enclosures),
        published_at: item.pubDate ?? new Date().toISOString(),
      });
    }
  }

  // Dedupe by guid — Arc Publishing single feed can have cross-section duplicates
  const seen = new Set<string>();
  return results.filter((a) => {
    if (seen.has(a.guid)) return false;
    seen.add(a.guid);
    return true;
  });
}

type NormalizedItem = {
  guid: string | null;
  title: string | null;
  url: string | null;
  description: string | null;
  /** Raw HTML string from <content:encoded> */
  contentEncoded: string | null;
  pubDate: string | null;
  categories: string[];
  media: MediaLike;
  enclosures?: Array<{ url: string; type?: string }>;
};

async function fetchAndNormalize(
  url: string,
  needsUserAgent: boolean
): Promise<NormalizedItem[]> {
  const headers = needsUserAgent
    ? FETCH_HEADERS
    : ({ Accept: FETCH_HEADERS.Accept } as HeadersInit);

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Feed fetch failed: ${res.status} ${url}`);

  const buffer = await res.arrayBuffer();
  const body = decodeXmlBuffer(buffer, res.headers.get("content-type") ?? "");

  // ── Google News sitemap detection ────────────────────────────────────────
  // Some publishers (Página 12) deprecated their per-section RSS feeds and
  // only expose a Google News sitemap at /arc/outboundfeeds/breakingnews-*
  // We treat those as a feed source by mapping each <url> to a NormalizedItem
  // up front, before feedsmith ever sees the body.
  if (
    body.includes("<urlset") &&
    body.includes("xmlns:news=")
  ) {
    return parseNewsSitemap(body);
  }

  // feedsmith throws on RSS 1.0 / RDF — catch and fall through to our own parser
  let parsed: ReturnType<typeof feedsmithParse> | null = null;
  try {
    parsed = feedsmithParse(body);
  } catch {
    parsed = null;
  }

  if (parsed?.format === "rss") {
    return (parsed.feed.items ?? []).map((item) => ({
      guid: item.guid?.value ?? null,
      title: item.title ?? null,
      url: item.link ?? null,
      description: item.description ?? null,
      // feedsmith exposes <content:encoded> as item.content.encoded
      contentEncoded: (item.content as { encoded?: string } | null)?.encoded ?? null,
      // Prefer <pubDate>, fall back to <dc:date> (used by ESPN and some other sources
      // that omit the standard pubDate element)
      pubDate:
        item.pubDate ??
        (item.dc as { date?: string; dates?: string[] } | null)?.date ??
        (item.dc as { date?: string; dates?: string[] } | null)?.dates?.[0] ??
        null,
      categories: item.categories?.map((c) => c.name).filter((n): n is string => Boolean(n)) ?? [],
      media: item.media as MediaLike,
      enclosures: item.enclosures
        ?.filter((e) => e.url != null)
        .map((e) => ({ url: e.url as string, type: e.type })),
    }));
  }

  if (parsed?.format === "atom") {
    return (parsed.feed.entries ?? []).map((entry) => ({
      guid: entry.id ?? null,
      title: entry.title ?? null,
      url:
        entry.links?.find((l) => l.rel === "alternate")?.href ??
        entry.links?.[0]?.href ??
        null,
      description: entry.summary ?? null,
      // Atom uses <content> (not content:encoded) — map it here
      contentEncoded: (entry.content as { value?: string } | null)?.value ?? null,
      pubDate: entry.published ?? entry.updated ?? null,
      categories: entry.categories
        ?.map((c) => c.term)
        .filter((t): t is string => Boolean(t)) ?? [],
      media: entry.media as MediaLike,
      enclosures: undefined,
    }));
  }

  if (parsed?.format === "json") {
    return (parsed.feed.items ?? []).map((item) => ({
      guid: item.id ?? null,
      title: item.title ?? null,
      url: item.url ?? null,
      description: item.summary ?? null,
      contentEncoded: (item as Record<string, unknown>).content_html as string ?? null,
      pubDate: item.date_published ?? null,
      categories: item.tags ?? [],
      media: undefined,
      enclosures: undefined,
    }));
  }

  // RSS 1.0 / RDF fallback — feedsmith returns no format for RDF feeds
  // Used by: Deutsche Welle (rss.dw.com/rdf/*), La Jornada
  if (body.includes("rdf:RDF") || body.includes("http://purl.org/rss/1.0/")) {
    return parseRdf(body);
  }

  return [];
}

/** Minimal RSS 1.0 / RDF parser — handles the subset used by DW and La Jornada */
function parseRdf(xml: string): NormalizedItem[] {
  const items: NormalizedItem[] = [];
  // Match each <item> block (RDF items are siblings of <channel>, not nested)
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = rdfText(block, "title");
    const link = rdfText(block, "link");
    const description = rdfText(block, "description");
    const contentEncoded = rdfText(block, "content:encoded");
    const pubDate =
      rdfText(block, "dc:date") ??
      rdfText(block, "pubDate") ??
      rdfText(block, "date") ??
      null;
    // media:content thumbnail
    const mediaUrl = block.match(/media:content[^>]+url="([^"]+)"/i)?.[1] ?? null;
    if (!title && !link) continue;
    items.push({
      guid: link,
      title,
      url: link,
      description,
      contentEncoded,
      pubDate,
      categories: [],
      media: mediaUrl ? { contents: [{ url: mediaUrl }] } : undefined,
      enclosures: undefined,
    });
  }
  return items;
}

function rdfText(block: string, tag: string): string | null {
  // Handles: <tag>value</tag> and <tag><![CDATA[value]]></tag>
  const m = block.match(
    new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, "i")
  );
  if (!m) return null;
  return m[1].trim() || null;
}

/**
 * Parse a Google News sitemap (https://www.google.com/schemas/sitemap-news/0.9).
 *
 * The format is one `<url>` block per article with `<news:news>` metadata.
 * Unlike RSS, sitemaps DON'T carry article body or description — that gets
 * filled in later by the enricher (which extracts Fusion.globalContent
 * from the article page).
 *
 * Used by Página 12 (`/arc/outboundfeeds/breakingnews-short.xml`) — they
 * deprecated their per-section RSS feeds and this is the only way to get
 * the 100 latest articles in a single fetch.
 *
 * Example entry:
 * ```xml
 * <url>
 *   <loc>https://www.pagina12.com.ar/2026/05/26/slug/</loc>
 *   <lastmod>2026-05-26T19:58:24.579Z</lastmod>
 *   <news:news>
 *     <news:publication><news:name>Pagina12</news:name><news:language>es</news:language></news:publication>
 *     <news:publication_date>2026-05-26T19:58:24.579Z</news:publication_date>
 *     <news:title><![CDATA[Article title]]></news:title>
 *     <news:keywords><![CDATA[Tag1,Tag2]]></news:keywords>
 *   </news:news>
 *   <image:image>
 *     <image:loc>https://.../image.jpg</image:loc>
 *     <image:caption><![CDATA[caption]]></image:caption>
 *   </image:image>
 * </url>
 * ```
 */
function parseNewsSitemap(xml: string): NormalizedItem[] {
  const items: NormalizedItem[] = [];
  const urlRe = /<url[^>]*>([\s\S]*?)<\/url>/g;
  let m: RegExpExecArray | null;
  while ((m = urlRe.exec(xml)) !== null) {
    const block = m[1];

    const loc = block.match(/<loc[^>]*>(.*?)<\/loc>/)?.[1]?.trim() ?? null;
    if (!loc) continue;

    const title =
      block
        .match(/<news:title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/news:title>/)?.[1]
        ?.trim() ?? null;

    const pubDate =
      block.match(/<news:publication_date[^>]*>(.*?)<\/news:publication_date>/)?.[1]
        ?.trim() ??
      block.match(/<lastmod[^>]*>(.*?)<\/lastmod>/)?.[1]?.trim() ??
      null;

    const imageUrl =
      block.match(/<image:loc[^>]*>(.*?)<\/image:loc>/)?.[1]?.trim() ?? null;

    // Keywords are comma-separated topics, NOT a section. They occasionally
    // hint at a section ("Básquetbol" → sports) so we surface them as
    // categories for the existing inferSectionFromCategory pass to try.
    const kwBlock =
      block
        .match(
          /<news:keywords[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/news:keywords>/
        )?.[1] ?? "";
    const categories = kwBlock
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    items.push({
      guid: loc,
      title,
      url: loc,
      // Sitemaps don't include a description or article body. The enricher
      // will fill those in by fetching the page and reading Fusion.globalContent.
      description: null,
      contentEncoded: null,
      pubDate,
      categories,
      media: imageUrl ? { contents: [{ url: imageUrl }] } : undefined,
      enclosures: undefined,
    });
  }
  return items;
}

function resolveSectionKey(
  categories: string[],
  url: string | null,
  feed: FeedEntry
): SectionKey {
  if (feed.section_key !== "all") return feed.section_key as SectionKey;

  if (categories.length) {
    const fromCat = inferSectionFromCategory(categories);
    if (fromCat) return fromCat;
  }

  if (url) return inferSectionFromUrl(url);
  return "world";
}

/**
 * Detect the charset from the XML declaration or Content-Type header, then decode
 * the buffer accordingly. Handles feeds that declare ISO-8859-1 / Windows-1252 in
 * their <?xml?> preamble even when the HTTP header says text/xml without charset.
 */
function decodeXmlBuffer(buffer: ArrayBuffer, contentType: string): string {
  // The XML declaration is always ASCII-compatible, so reading the first ~300 bytes
  // as UTF-8 (with replacement chars for any invalid sequences) is safe here.
  const head = new TextDecoder("utf-8", { fatal: false }).decode(
    new Uint8Array(buffer).slice(0, 300)
  );

  // Priority: XML declaration > Content-Type charset > UTF-8 default
  const xmlCharset = head
    .match(/<\?xml[^>]+encoding=["']([^"']+)/i)?.[1]
    ?.toLowerCase();
  const headerCharset = contentType
    .match(/charset=([^\s;]+)/i)?.[1]
    ?.toLowerCase();

  const charset = xmlCharset ?? headerCharset ?? "utf-8";

  try {
    return new TextDecoder(charset, { fatal: false }).decode(buffer);
  } catch {
    // Unknown charset label — fall back to UTF-8 with replacement
    return new TextDecoder("utf-8", { fatal: false }).decode(buffer);
  }
}

function stripHtml(str: string): string {
  return str
    .replace(/<[^>]+>/g, "")   // remove HTML tags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, " ")  // catch-all for remaining named entities
    .replace(/\s{2,}/g, " ")
    .trim();
}

// HTML sanitization moved to lib/sanitize/article-html.ts — same helper now
// used here, by enrich-content.ts, and at render time in article-modal.tsx.

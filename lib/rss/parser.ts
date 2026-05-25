import { parseFeed as feedsmithParse } from "feedsmith";
import type { InferSelectModel } from "drizzle-orm";
import type { sources } from "@/lib/db/schema";
import type { FeedEntry, SectionKey } from "@/lib/db/schema";
import {
  inferSectionFromUrl,
  inferSectionFromCategory,
} from "./section-inference";
import { extractThumbnail, type MediaLike } from "./thumbnail";

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
      const sectionKey = resolveSectionKey(item.categories, item.url, feed);
      results.push({
        source_id: source.id,
        guid: item.guid ?? item.url,
        title: stripHtml(item.title),
        url: item.url,
        description: item.description ? stripHtml(item.description) : null,
        content_html: item.contentEncoded ? sanitizeHtml(item.contentEncoded) : null,
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

  const body = await res.text();

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
      pubDate: item.pubDate ?? null,
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

function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, "").trim();
}

/** Server-side HTML sanitizer — strips dangerous elements/attributes before storing in DB */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

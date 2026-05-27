import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import {
  sanitizeArticleHtml,
  sanitizeArticleHtmlDom,
  type DomDocLike,
} from "@/lib/sanitize/article-html";
import { extractFusionContent } from "@/lib/rss/fusion-extractor";
import { mapSectionName } from "@/lib/rss/section-inference";
import type { SectionKey } from "@/lib/db/schema";

/**
 * Domains that actively block automated HTTP access (Cloudflare Bot Management,
 * anti-scraping middleware, etc.). Articles from these sources will remain
 * summary-only — the user clicks through to read the full piece.
 */
const SKIP_DOMAINS = new Set([
  // ESPN — Cloudflare Bot Fight Mode on all properties
  "espndeportes.espn.com",
  "espn.go.com",
  "www.espn.com",
  "espn.com",
  "espn.co.uk",
  // Unidad Editorial (El Mundo, Marca) — Cloudflare anti-bot protection
  "www.elmundo.es",
  "elmundo.es",
  "www.marca.com",
  "marca.com",
  // Grupo PRISA (El País, AS) — subscriber-only content:encoded, scraping returns paywall
  "elpais.com",
  "www.elpais.com",
  "as.com",
  "www.as.com",
]);

/**
 * Result of the fetch+extract step. Sent across the Inngest step boundary,
 * so it must be JSON-serialisable (no Date objects, no functions).
 */
type ExtractedContent = {
  content_html: string;
  /**
   * Section key the publisher's CMS assigned to the article, if we could
   * extract it via Fusion. When set, the save step overwrites the
   * URL-inferred section_key the parser stamped on insert.
   */
  section_key: SectionKey | null;
  /** Lede/dek/summary from Fusion, used as a fallback when the RSS feed
   * didn't carry a description. */
  description: string | null;
  /** Lead image URL from Fusion. Only stored when the article doesn't
   * already have a thumbnail. */
  thumbnail_url: string | null;
  /** Where the content came from — useful for debugging in run logs */
  source: "fusion" | "article-tag" | "main-tag" | "readability";
};

export const enrichContent = inngest.createFunction(
  {
    id: "enrich-content",
    name: "Enrich article content",
    triggers: [{ event: "newsmap/article.enrich" }],
    /** Keep concurrent fetches low to be polite to news servers */
    concurrency: { limit: 3 },
    retries: 1,
  },
  async ({ event, step }) => {
    const { article_id, article_url } = event.data as {
      article_id: string;
      article_url: string;
    };

    // ── Skip blocked domains ────────────────────────────────────────────────
    try {
      const domain = new URL(article_url).hostname;
      if (SKIP_DOMAINS.has(domain)) {
        return { skipped: true, reason: "blocked domain" };
      }
    } catch {
      return { skipped: true, reason: "invalid URL" };
    }

    // ── Fetch article page and extract main content ─────────────────────────
    //
    // Extraction priority:
    //   1. Fusion.globalContent JSON (Arc Publishing sites) — gives us a
    //      clean structured body PLUS the publisher's own section name. This
    //      is the gold standard.
    //   2. <article> / <main> semantic tags — modern sites use them.
    //   3. Mozilla Readability fallback — works on most sites but mixes in
    //      site chrome / related cards on Arc sites.
    const extracted = await step.run("fetch-and-extract", async () => {
      let res: Response;
      try {
        res = await fetch(article_url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
          },
          signal: AbortSignal.timeout(12_000),
        });
      } catch {
        return null; // timeout or network error
      }

      if (!res.ok) return null;

      const contentType = res.headers.get("content-type") ?? "";
      if (!contentType.includes("html")) return null;

      let html: string;
      try {
        html = await res.text();
      } catch {
        return null;
      }

      // ── 1) Fusion.globalContent (Arc Publishing) ─────────────────────────
      const fusion = extractFusionContent(html);
      if (fusion && fusion.body_html.replace(/<[^>]+>/g, "").trim().length >= 200) {
        // Map the publisher's section name/id through our SECTION_MAP.
        // Try the path first (`/el-pais`) then the display name ("El País").
        const mapped =
          mapSectionName(fusion.section_id) ??
          mapSectionName(fusion.section_name);
        return {
          content_html: fusion.body_html,
          section_key: mapped,
          description: fusion.description,
          thumbnail_url: fusion.thumbnail_url,
          source: "fusion" as const,
        } satisfies ExtractedContent;
      }

      // ── 2) Semantic tags + 3) Readability fallback ───────────────────────
      const { document } = parseHTML(html);

      const tryExtract = (
        selector: string
      ): { html: string; source: ExtractedContent["source"] } | null => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const innerHtml = (el as { innerHTML?: string }).innerHTML ?? "";
        const textLen = innerHtml.replace(/<[^>]+>/g, " ").trim().length;
        if (textLen < 600) return null;
        return {
          html: innerHtml,
          source: selector === "article" ? "article-tag" : "main-tag",
        };
      };

      let rawContent = tryExtract("article") ?? tryExtract("main");

      if (!rawContent) {
        const reader = new Readability(document as unknown as Document);
        const parsed = reader.parse();
        if (parsed?.content) {
          rawContent = { html: parsed.content, source: "readability" };
        }
      }
      if (!rawContent) return null;

      // Wrap so linkedom gives us a Document with a body innerHTML we can
      // hand to the shared DOM sanitizer.
      const wrapped = parseHTML(`<html><body>${rawContent.html}</body></html>`);
      const cleaned = sanitizeArticleHtmlDom(
        wrapped.document as unknown as DomDocLike
      );

      return {
        content_html: cleaned,
        section_key: null,
        description: null,
        thumbnail_url: null,
        source: rawContent.source,
      } satisfies ExtractedContent;
    });

    if (!extracted) return { enriched: false };

    // sanitizeArticleHtml is a final regex safety net for any unsafe attrs
    // that survived the DOM pass.
    const safeContent = sanitizeArticleHtml(extracted.content_html);

    // ── Persist ─────────────────────────────────────────────────────────────
    //
    // We only update content_html when it's still NULL (prevents accidental
    // re-enrichment overwrites). section_key/description/thumbnail are
    // updated conditionally: only when the new value is better than what's
    // currently stored (e.g. don't blank out a thumbnail we already have).
    await step.run("save-content", async () => {
      await db
        .update(articles)
        .set({
          content_html: safeContent,
          // Override section_key only when Fusion gave us a confidently-mapped
          // one. URL-inferred section_keys default to "world" for unknown
          // URLs; Fusion's mapping is the publisher's own taxonomy and we
          // trust it.
          ...(extracted.section_key
            ? { section_key: extracted.section_key }
            : {}),
          // Fill in description / thumbnail only when the row doesn't already
          // have one — preserves whatever the RSS feed gave us.
          ...(extracted.description
            ? {
                description: sql`coalesce(${articles.description}, ${extracted.description})`,
              }
            : {}),
          ...(extracted.thumbnail_url
            ? {
                thumbnail_url: sql`coalesce(${articles.thumbnail_url}, ${extracted.thumbnail_url})`,
              }
            : {}),
        })
        .where(
          and(
            eq(articles.id, article_id),
            isNull(articles.content_html)
          )
        );
    });

    return {
      enriched: true,
      source: extracted.source,
      section_overridden: extracted.section_key !== null,
    };
  }
);

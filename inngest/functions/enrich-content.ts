import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

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
    const content = await step.run("fetch-and-extract", async () => {
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

      // Parse with linkedom and run Readability
      const { document } = parseHTML(html);
      const reader = new Readability(document as unknown as Document);
      const parsed = reader.parse();
      return parsed?.content ?? null;
    });

    if (!content) return { enriched: false };

    // ── Persist (only if content_html is still null — don't overwrite) ──────
    await step.run("save-content", async () => {
      await db
        .update(articles)
        .set({ content_html: sanitizeHtml(content) })
        .where(
          and(
            eq(articles.id, article_id),
            isNull(articles.content_html)
          )
        );
    });

    return { enriched: true };
  }
);

/** Strip dangerous elements/attributes before storing */
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

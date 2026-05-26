/**
 * Aggressive HTML sanitization for article body content.
 *
 * Mozilla Readability + similar extractors do a reasonable job picking the
 * main content of a page, but they routinely leave behind site chrome —
 * navigation bars, footer link lists, "more articles" sidebars, social-share
 * widgets. For our preview modal we want the article body and ONLY the
 * article body.
 *
 * This sanitizer is used in three places:
 *   - inngest/functions/enrich-content.ts  — Readability output, on ingest
 *   - lib/rss/parser.ts                    — content:encoded from RSS, on ingest
 *   - components/feed/article-modal.tsx    — render time, to retroactively
 *                                            clean the ~17K articles already in
 *                                            the DB without re-enrichment
 *
 * Regex-based so it runs identically on Node (Inngest worker) and the
 * browser (modal render).
 */

/** Block-level tags that, when present in extracted content, are virtually
 * always site chrome rather than article body. */
const STRIP_BLOCK_TAGS = [
  "header",
  "nav",
  "footer",
  "aside",
  "menu",
  "form",
  "noscript",
  "template",
  "dialog",
];

/** Tags that are unsafe at render time and must always be removed. */
const STRIP_UNSAFE_TAGS = ["script", "iframe", "style", "object", "embed"];

/**
 * Strip every `<tag>...</tag>` block (non-greedy, case-insensitive). The
 * non-greedy match means nested tags of the same name won't double-strip;
 * since these are block-level we don't expect that anyway.
 */
function stripBlock(html: string, tag: string): string {
  // Match opening tag (with optional attributes) through nearest closing tag
  return html.replace(
    new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi"),
    ""
  );
}

/** Drop self-closing or void tags that we know we never want to render. */
function stripVoid(html: string, tag: string): string {
  return html.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
}

/**
 * Detect and remove `<ul>` and `<ol>` lists where the majority of items are
 * link-only. These are almost always navigation rather than article content
 * (e.g. "Edición Impresa | El País | Economía | …" at the top of the body).
 *
 * Threshold: ≥70% of items must be link-only AND there must be ≥3 items —
 * keeps legitimate 2-bullet lists in body copy intact.
 */
function stripLinkNavLists(html: string): string {
  return html.replace(
    /<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi,
    (match, _tag, inner) => {
      const items =
        (inner as string).match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [];
      if (items.length < 3) return match;
      const linkOnly = items.filter((li: string) => {
        // Strip every <a>...</a> contents AND every other tag; see what text
        // remains. If nothing meaningful, the <li> was a wrapper around a link.
        const remaining = li
          .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, "")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;|\s+/g, " ")
          .trim();
        return remaining.length === 0;
      }).length;
      return linkOnly / items.length >= 0.7 ? "" : match;
    }
  );
}

/** Strip inline event handlers (onclick, onload, …) and javascript: URLs. */
function stripUnsafeAttrs(html: string): string {
  return html
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Public API — run the full sanitization pipeline.
 *
 * Order matters: strip unsafe tags first (avoids regex backtracking inside
 * script contents), then site chrome (large blocks), then nav lists (depend
 * on inner-html shape), then unsafe attributes (last so attribute scrubbing
 * doesn't fight the earlier block-tag patterns).
 */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  let s = html;
  for (const tag of STRIP_UNSAFE_TAGS) s = stripBlock(s, tag);
  for (const tag of STRIP_UNSAFE_TAGS) s = stripVoid(s, tag);
  for (const tag of STRIP_BLOCK_TAGS) s = stripBlock(s, tag);
  s = stripLinkNavLists(s);
  s = stripUnsafeAttrs(s);
  return s.trim();
}

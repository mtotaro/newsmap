/**
 * Arc Publishing "Fusion" article extractor.
 *
 * Arc Publishing (used by Página 12, La Nación, Infobae, Clarín partial,
 * El Economista AR, La Tercera, and many others) embeds the entire article
 * payload as a JSON object on the article page:
 *
 *     <script>Fusion.globalContent = {...giant JSON...}; Fusion.contextPath = ...
 *
 * That JSON contains:
 *   - headlines.basic                — clean article title
 *   - subheadlines.basic             — subtitle / dek
 *   - description.basic              — RSS-style summary
 *   - taxonomy.sections[0].name      — canonical section name from CMS
 *   - taxonomy.sections[0]._id       — section path (e.g. "/el-pais")
 *   - content_elements[]             — structured body: text, header, list,
 *                                      image, oembed, etc.
 *   - promo_items.basic.url          — lead image URL
 *   - credits.by[].name              — author names
 *   - first_publish_date             — ISO publish timestamp
 *
 * Using this instead of Mozilla Readability gives us:
 *   - 100% clean body (no nav, no related cards, no share buttons)
 *   - The exact section the publisher assigned (no inference needed)
 *   - Properly attributed author + image
 *
 * Returns null when the page doesn't have a Fusion payload (non-Arc sites,
 * old Arc versions, or pages that aren't articles).
 */

export type FusionArticle = {
  title: string;
  subtitle: string | null;
  description: string | null;
  /** Canonical section name from publisher's CMS (e.g. "El País", "Deportes") */
  section_name: string | null;
  /** Section path (e.g. "/el-pais") — useful for direct SECTION_MAP lookup */
  section_id: string | null;
  /** Reconstructed body HTML from content_elements */
  body_html: string;
  thumbnail_url: string | null;
  author: string | null;
  publish_date: string | null;
};

/**
 * Extract Fusion.globalContent payload from a Página 12-style HTML page.
 *
 * Returns null when:
 *   - the page has no Fusion payload at all
 *   - the JSON parse fails
 *   - the payload has no usable body content (e.g. type !== 'story')
 */
export function extractFusionContent(html: string): FusionArticle | null {
  if (!html) return null;

  // The Fusion bootstrap script always emits a single assignment expression
  // followed by another `Fusion.` statement, so we anchor the regex on the
  // trailing `Fusion.` to bound the JSON match correctly. Without that anchor
  // the JSON object can grow unboundedly on pages with multiple Fusion blobs.
  const match = html.match(
    /Fusion\.globalContent\s*=\s*({[\s\S]*?});\s*Fusion\./
  );
  if (!match) return null;

  let data: FusionGlobalContent;
  try {
    data = JSON.parse(match[1]) as FusionGlobalContent;
  } catch {
    return null;
  }

  // Only "story" type entries are actual articles. Section landing pages
  // also expose Fusion.globalContent but with type === 'section', listing
  // articles instead of being one.
  if (data.type && data.type !== "story") return null;

  const title = data.headlines?.basic?.trim() ?? "";
  if (!title) return null;

  const section = data.taxonomy?.sections?.[0] ?? null;
  const sectionName = section?.name?.trim() ?? null;
  const sectionId = section?._id?.trim() ?? null;

  // Body — concatenate content_elements into a clean HTML string. We keep
  // the same minimal markup the existing article-content CSS already styles:
  // <p>, <h2>/<h3>, <ul>/<ol>/<li>, <figure>/<img>/<figcaption>, <blockquote>.
  const body_html = renderContentElements(data.content_elements ?? []);

  // Thumbnail — Arc stores the lead image under promo_items.basic.url
  // (sometimes also at lead_art.url for older configs).
  const promo = data.promo_items?.basic;
  const thumbnail_url =
    promo?.url ?? promo?.additional_properties?.resizeUrl ?? null;

  // Authors — credits.by is an array of { name, type }
  const authors = (data.credits?.by ?? [])
    .map((c) => c.name?.trim())
    .filter((n): n is string => Boolean(n));
  const author = authors.length > 0 ? authors.join(", ") : null;

  const description =
    typeof data.description === "string"
      ? data.description
      : data.description?.basic ?? null;

  const subtitle =
    typeof data.subheadlines === "string"
      ? data.subheadlines
      : data.subheadlines?.basic ?? null;

  return {
    title,
    subtitle: subtitle?.trim() || null,
    description: description?.trim() || null,
    section_name: sectionName,
    section_id: sectionId,
    body_html,
    thumbnail_url,
    author,
    publish_date:
      data.first_publish_date ?? data.publish_date ?? data.display_date ?? null,
  };
}

/**
 * Convert Arc's content_elements array into a clean HTML body. We only
 * translate the element types we want to render — anything unknown (videos
 * we don't have a player for, custom blocks, raw HTML embeds we don't trust)
 * is skipped silently.
 */
function renderContentElements(elements: ContentElement[]): string {
  const parts: string[] = [];
  for (const el of elements) {
    switch (el.type) {
      case "text":
      case "paragraph": {
        const content = sanitizeInlineHtml(el.content ?? "");
        if (content.trim()) parts.push(`<p>${content}</p>`);
        break;
      }
      case "header": {
        // Arc headers carry their level on `level` (1–6). Default to h3 since
        // h1 is the article title (rendered separately above the body).
        const level = Math.min(Math.max(el.level ?? 3, 2), 4);
        const content = sanitizeInlineHtml(el.content ?? "");
        if (content.trim()) parts.push(`<h${level}>${content}</h${level}>`);
        break;
      }
      case "list": {
        const tag = el.list_type === "ordered" ? "ol" : "ul";
        const items = (el.items ?? [])
          .map((it) => {
            const c = sanitizeInlineHtml(it.content ?? "");
            return c.trim() ? `<li>${c}</li>` : "";
          })
          .filter(Boolean)
          .join("");
        if (items) parts.push(`<${tag}>${items}</${tag}>`);
        break;
      }
      case "image": {
        const url = el.url;
        const caption = el.caption ? sanitizeInlineHtml(el.caption) : "";
        const credit = el.credits_caption ?? el.credits?.affiliation?.[0]?.name;
        if (url) {
          const captionHtml = [caption, credit && `<span>${escapeHtml(credit)}</span>`]
            .filter(Boolean)
            .join(" ");
          parts.push(
            `<figure><img src="${escapeAttr(url)}" alt="" />${
              captionHtml ? `<figcaption>${captionHtml}</figcaption>` : ""
            }</figure>`
          );
        }
        break;
      }
      case "quote":
      case "blockquote": {
        const content = sanitizeInlineHtml(el.content ?? "");
        if (content.trim()) parts.push(`<blockquote>${content}</blockquote>`);
        break;
      }
      case "raw_html": {
        // We don't trust arbitrary embedded HTML — could contain trackers
        // or layout-breaking widgets. Skip.
        break;
      }
      case "oembed_response": {
        // Twitter/Instagram/YouTube embeds. We render Twitter as a styled
        // blockquote (sanitizeArticleHtml later passes it through unchanged)
        // and skip the rest to avoid loading third-party SDKs we don't need.
        if (el.subtype === "twitter" && el.raw_oembed?.html) {
          parts.push(el.raw_oembed.html);
        }
        break;
      }
      default:
        // Unknown element type — skip
        break;
    }
  }
  return parts.join("\n");
}

/**
 * Light inline-HTML scrub for Fusion-provided text. Fusion content already
 * comes pretty clean (only `<b>`, `<em>`, `<a href>`, occasional `<br>`),
 * but we still strip any unsafe tags and event handlers as belt-and-braces.
 * The full sanitizeArticleHtml pass runs again before storage.
 */
function sanitizeInlineHtml(html: string): string {
  return html
    .replace(/<(script|iframe|style|object|embed)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ────────────────────────────────────────────────────────────────────────────
// Type definitions for the Fusion payload shape. These are deliberately
// conservative — Arc has many optional fields we don't use, so we type only
// what we read and leave the rest as `unknown`.
// ────────────────────────────────────────────────────────────────────────────

interface FusionGlobalContent {
  type?: string;
  headlines?: { basic?: string };
  subheadlines?: string | { basic?: string };
  description?: string | { basic?: string };
  taxonomy?: {
    sections?: Array<{ _id?: string; name?: string }>;
    primary_section?: { _id?: string; name?: string };
  };
  content_elements?: ContentElement[];
  promo_items?: {
    basic?: {
      url?: string;
      additional_properties?: { resizeUrl?: string };
    };
  };
  credits?: { by?: Array<{ name?: string; type?: string }> };
  first_publish_date?: string;
  publish_date?: string;
  display_date?: string;
}

interface ContentElement {
  type: string;
  subtype?: string;
  content?: string;
  level?: number;
  list_type?: "ordered" | "unordered";
  items?: Array<{ content?: string }>;
  url?: string;
  caption?: string;
  credits_caption?: string;
  credits?: { affiliation?: Array<{ name?: string }> };
  raw_oembed?: { html?: string };
}

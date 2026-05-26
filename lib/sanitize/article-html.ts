/**
 * Article HTML sanitization with TWO modes.
 *
 * 1. `sanitizeArticleHtml(html)` — regex-only fast path. Cross-environment.
 *    Used as a fallback when no DOM API is available.
 *
 * 2. `sanitizeArticleHtmlDom(html, parser)` — DOM-based deep cleaning.
 *    The parser argument must return a Document-like object (browser's
 *    DOMParser or linkedom's `parseHTML().document` on Node both work).
 *
 *    This is where the heavy lifting happens — it can find balanced
 *    nested elements by class name, which regex fundamentally cannot.
 *    Many newspapers don't wrap their site chrome in <header>/<nav> tags
 *    semantically; they use <div class="p12-main-menu">, etc. The DOM
 *    pass strips those properly.
 *
 * Call sites:
 *   - inngest/functions/enrich-content.ts  → DOM mode (uses linkedom)
 *   - lib/rss/parser.ts                    → regex-only mode (RSS content)
 *   - components/feed/article-modal.tsx    → DOM mode (uses DOMParser),
 *                                            retroactively cleans already-stored articles
 */

/** Block-level tags that are virtually always site chrome rather than body. */
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

/** Unsafe tags that must always be removed (XSS + side-effect risks). */
const STRIP_UNSAFE_TAGS = ["script", "iframe", "style", "object", "embed"];

/**
 * Class-name fragments that signal "this is site chrome, not article body."
 *
 * Includes both generic CSS conventions (share, related, sidebar, etc.) and
 * Página 12's specific p12-* prefix patterns since that publisher is one of
 * our largest sources of junky content extraction. Add more publisher-
 * specific entries here as they're discovered.
 *
 * Matching is case-insensitive and substring-based; e.g. `p12-main-menu`
 * matches via the `p12-main-menu` entry, `p12-article-card-full` matches
 * via `p12-article-card`.
 */
/**
 * IMPORTANT — never include patterns that could match the MAIN article body's
 * container. Página 12 wraps its main article AND its "related articles" in
 * the same `p12-article-card-full` class. So even though the related cards
 * are cruft, we cannot strip by that class — we strip by their GROUPING
 * container instead (`p12-grid-template`, `p12-header-article-list`, etc.)
 * which is unique to lists of cards.
 */
const CRUFT_CLASS_PATTERNS = [
  // Generic chrome
  "share",
  "social",
  "compartir",
  "related",
  "relacion",
  "comment",
  "comentari",
  "sidebar",
  "widget",
  "popular",
  "trending",
  "destacad",
  "ultima",
  "latest",
  "recient",
  "mas-leid",
  "newsletter",
  "suscrib",
  "subscribe",
  "menu-item",
  "menu-link",
  "breadcrumb",
  "tags-list",
  "tema-list",
  "topic-list",
  "advertisement",
  "advert-",
  "publicidad",
  "banner-",
  // Página 12 — grouping containers only (NOT the card class itself, which
  // is shared by the main article body).
  "p12-header",
  "p12-main-menu",
  "p12-header-article-list",
  "p12-section-base-layout",
  "p12-section-builder",
  "p12-live-news",
  "p12-footer",
  "p12-grid-template",
  "p12-divider",
  // Clarín / La Nación / Infobae (other Arc sites — preventive)
  "site-header",
  "site-footer",
  "site-nav",
  "main-nav",
  "global-nav",
  "live-news",
];

const CRUFT_REGEX = new RegExp(
  CRUFT_CLASS_PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

/**
 * Heading-text patterns that mark "end of article" on Spanish-language news
 * sites. Anything appearing AFTER a heading whose text matches one of these
 * is almost certainly not article body — typically share rails, related
 * articles, tag clouds, or "more from this section" carousels.
 */
const STOP_HEADING_PATTERNS = [
  /^\s*últimas?\s+noticias\s*$/i,
  /^\s*últimas?\s+notas?\s*$/i,
  /^\s*más\s+leídas?\s*$/i,
  /^\s*más\s+leid[oa]s?\s*$/i,
  /^\s*lo\s+más\s+leído\s*$/i,
  /^\s*más\s+visto[s]?\s*$/i,
  /^\s*relacionad[oa]s?\s*$/i,
  /^\s*notas?\s+relacionad[ao]s?\s*$/i,
  /^\s*también\s+(?:te\s+)?puede\s+interesar/i,
  /^\s*te\s+puede\s+interesar/i,
  /^\s*temas?\s+(?:en\s+esta\s+nota|relacionados?)\s*:?\s*$/i,
  /^\s*compartir\s*$/i,
  /^\s*comparte\s*$/i,
  /^\s*comentari?os?\s*$/i,
  /^\s*seguir\s+leyendo\s*$/i,
  /^\s*sobre\s+el\s+autor\s*$/i,
  /^\s*newsletter/i,
  /^\s*suscríb(?:ete|ase|ite)/i,
];

/** Minimal Document interface so we can swap browser DOMParser ↔ linkedom. */
export interface DomDocLike {
  body: { innerHTML: string } | null;
  querySelectorAll(selectors: string): Iterable<DomElLike>;
}
interface DomElLike {
  getAttribute(name: string): string | null;
  remove(): void;
  // Optional fields used in heuristics
  textContent?: string | null;
  children?: { length: number };
  /** Reference to the element directly above it in document order */
  parentElement?: DomElLike | null;
  /** Used by the stop-heading pass to wipe everything after a sentinel */
  nextElementSibling?: DomElLike | null;
}

/**
 * Run the DOM-based sanitizer against a parsed Document. The Document can
 * come from `new DOMParser().parseFromString(...)` (browser) or from
 * linkedom's `parseHTML(...).document` (Node).
 *
 * Returns the cleaned `<body>` innerHTML, ready to be passed to
 * `dangerouslySetInnerHTML` (after the existing safe-tag stripping).
 */
export function sanitizeArticleHtmlDom(doc: DomDocLike): string {
  // 1. Drop unsafe + chrome tags
  const tagSelector = [...STRIP_UNSAFE_TAGS, ...STRIP_BLOCK_TAGS].join(",");
  for (const el of Array.from(doc.querySelectorAll(tagSelector))) {
    try {
      el.remove();
    } catch {
      /* DOM API quirk — ignore */
    }
  }

  // 2. Drop elements whose class or id matches a known-cruft pattern
  for (const el of Array.from(doc.querySelectorAll("[class],[id]"))) {
    const cls = el.getAttribute("class") ?? "";
    const id = el.getAttribute("id") ?? "";
    if (CRUFT_REGEX.test(cls) || CRUFT_REGEX.test(id)) {
      try {
        el.remove();
      } catch {
        /* ignore */
      }
    }
  }

  // 3. Drop empty lists left behind after class-stripping their children
  for (const el of Array.from(doc.querySelectorAll("ul,ol"))) {
    if (!el.children || el.children.length === 0) {
      try {
        el.remove();
      } catch {
        /* ignore */
      }
    }
  }

  // 3.5. Strip the leading breadcrumb. Many Spanish-language sites start
  // their article body with `<p><a href="/">Portada</a> ›</p>` followed by
  // a small heading naming the section (`<h5><a href="/soy">Soy</a></h5>`).
  // These add nothing to a preview — we already show the section chip in
  // the modal header.
  stripLeadingBreadcrumb(doc);

  // 4. Stop-heading truncation — walk forward from the first heading whose
  // text matches an "end of article" sentinel (e.g. "Últimas Noticias",
  // "Temas en esta nota", "Compartir") and delete that heading + every
  // subsequent sibling on the way up to <body>.
  //
  // This catches the cruft block that Página 12 (and other Arc sites) drop
  // at the bottom of every article without any distinguishable class.
  truncateAtStopHeadings(doc);

  // 5. Strip social-share <ul> blocks — lists whose <li>s contain only short
  // social-network labels (X, Twitter, Facebook, etc.) or images with those
  // alt-texts. These never carry article meaning.
  stripSocialShareLists(doc);

  return doc.body?.innerHTML ?? "";
}

/**
 * Strip a leading breadcrumb-style fragment: a short `<p>` whose only link
 * points to "/" (home) plus an optional separator image, optionally followed
 * by a short `<h5>` containing a single section link.
 *
 * Both are very common at the top of Página 12 / Arc Publishing article
 * exports and waste vertical space in the preview modal.
 */
function stripLeadingBreadcrumb(doc: DomDocLike) {
  type WithSelectors = DomElLike & {
    querySelectorAll?(s: string): Iterable<DomElLike>;
    getAttribute(name: string): string | null;
  };
  const firstP = doc.querySelectorAll("p")[Symbol.iterator]().next().value as
    | WithSelectors
    | undefined;
  if (!firstP) return;
  const text = (firstP.textContent ?? "").trim();
  if (text.length > 40) return;
  const links = Array.from(firstP.querySelectorAll?.("a") ?? []);
  const homeLink = links.find(
    (a) => (a as WithSelectors).getAttribute("href") === "/"
  );
  if (!homeLink) return;
  try {
    firstP.remove();
  } catch {
    /* ignore */
  }
  // Also kill the section-label heading that often follows (h5 with one link)
  const firstH5 = doc.querySelectorAll("h5")[Symbol.iterator]().next().value as
    | WithSelectors
    | undefined;
  if (firstH5) {
    const h5Text = (firstH5.textContent ?? "").trim();
    const h5Links = Array.from(firstH5.querySelectorAll?.("a") ?? []);
    if (h5Text.length < 30 && h5Links.length === 1) {
      try {
        firstH5.remove();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Find the first heading whose text matches a STOP pattern and remove it +
 * every following sibling at every ancestor level up to <body>.
 *
 * Key safety constraint: we NEVER delete an ancestor element itself, only
 * its following siblings. Deleting ancestors was the bug in v1 — if a
 * sidebar containing "Últimas Noticias" lived early inside <main> (which
 * also contained the article body further down), walking up and removing
 * <main> would erase the article we wanted to keep.
 *
 * The remaining empty wrapper divs are harmless; the next sanitizer pass
 * collapses empty lists, and `dangerouslySetInnerHTML` renders empty divs
 * as nothing visible.
 */
function truncateAtStopHeadings(doc: DomDocLike) {
  // Only true headings — inline <strong> hits too many false positives
  // (e.g. body text emphasizing "compartir" or "comentarios" as a verb).
  const headings = Array.from(
    doc.querySelectorAll("h1,h2,h3,h4,h5,h6")
  );
  for (const h of headings) {
    const text = (h.textContent ?? "").trim();
    if (!text || text.length > 60) continue; // headings are short
    if (!STOP_HEADING_PATTERNS.some((rx) => rx.test(text))) continue;

    // Step 1: delete the heading itself
    let cursor: DomElLike | null = h;
    let parent: DomElLike | null = cursor.parentElement ?? null;

    // Capture next sibling BEFORE removing the heading, so we can keep walking
    let nextSib: DomElLike | null = cursor.nextElementSibling ?? null;
    try {
      cursor.remove();
    } catch {
      /* ignore */
    }

    // Step 2: at each level, delete following siblings only, then climb.
    while (true) {
      // Remove everything that came after `cursor` at this level
      let sib = nextSib;
      while (sib) {
        const after: DomElLike | null = sib.nextElementSibling ?? null;
        try {
          sib.remove();
        } catch {
          /* ignore */
        }
        sib = after;
      }
      if (!parent) break;
      const parentTag = (parent as { tagName?: string }).tagName?.toLowerCase();
      if (parentTag === "body" || !parentTag) break;
      // Climb: cursor becomes the parent, nextSib is parent's next sibling
      cursor = parent;
      nextSib = cursor.nextElementSibling ?? null;
      parent = cursor.parentElement ?? null;
    }
    return; // Only the first stop-heading matters
  }
}

/**
 * Strip lists whose items look like social-share buttons — typical pattern is
 * <li><img alt="X"|"Facebook"|...> </li> with no real text content. Some
 * publishers wrap these in <div class="share"> (caught earlier) but Página 12
 * uses a bare <ul>.
 */
function stripSocialShareLists(doc: DomDocLike) {
  const SOCIAL_LABELS = new Set([
    "x",
    "twitter",
    "facebook",
    "linkedin",
    "whatsapp",
    "telegram",
    "mail",
    "email",
    "bluesky",
    "threads",
    "pinterest",
    "reddit",
  ]);
  for (const ul of Array.from(doc.querySelectorAll("ul,ol"))) {
    const items = Array.from(
      (ul as unknown as { querySelectorAll(s: string): Iterable<DomElLike> })
        .querySelectorAll?.("li") ?? []
    );
    if (items.length < 3 || items.length > 12) continue;
    const socialCount = items.filter((li) => {
      const text = (li.textContent ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s ]+/g, " ");
      return SOCIAL_LABELS.has(text);
    }).length;
    if (socialCount / items.length >= 0.6) {
      try {
        ul.remove();
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Detect and remove `<ul>` and `<ol>` lists where ≥70% of items are link-only.
 * These are almost always navigation rather than article content.
 */
function stripLinkNavLists(html: string): string {
  return html.replace(
    /<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi,
    (match, _tag, inner) => {
      const items = (inner as string).match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) ?? [];
      if (items.length < 3) return match;
      const linkOnly = items.filter((li: string) => {
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

function stripBlockRegex(html: string, tag: string): string {
  return html.replace(
    new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, "gi"),
    ""
  );
}

function stripVoid(html: string, tag: string): string {
  return html.replace(new RegExp(`<${tag}\\b[^>]*/?>`, "gi"), "");
}

function stripUnsafeAttrs(html: string): string {
  return html
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Regex-only sanitizer — safe to call from anywhere, but doesn't handle
 * balanced nested elements (so it can't reliably strip `<div class="cruft">`
 * containing nested `<div>`s). Use `sanitizeArticleHtmlDom` whenever a DOM
 * API is available.
 */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";
  let s = html;
  for (const tag of STRIP_UNSAFE_TAGS) s = stripBlockRegex(s, tag);
  for (const tag of STRIP_UNSAFE_TAGS) s = stripVoid(s, tag);
  for (const tag of STRIP_BLOCK_TAGS) s = stripBlockRegex(s, tag);
  s = stripLinkNavLists(s);
  s = stripUnsafeAttrs(s);
  return s.trim();
}

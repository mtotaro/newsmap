/**
 * Daily digest email template.
 * Returns a plain HTML string — no JSX/react-email dependency needed.
 *
 * Designed to render well on Gmail, Outlook, and Apple Mail.
 * Uses inline styles throughout (email clients strip external CSS).
 */

export type DigestArticle = {
  title: string;
  description: string | null;
  url: string;
  thumbnail_url: string | null;
  source_name: string;
  published_at: Date;
  section_key: string;
};

type TemplateOptions = {
  articles: DigestArticle[];
  unsubscribeUrl: string;
  locale: "es" | "en";
  /** Date displayed in the email subject/header */
  date: Date;
  /** Base URL of the app, e.g. https://newsmap.app */
  appUrl: string;
};

const SECTION_LABELS: Record<string, { es: string; en: string }> = {
  world:         { es: "Internacional", en: "World" },
  politics:      { es: "Política",      en: "Politics" },
  economy:       { es: "Economía",      en: "Economy" },
  tech:          { es: "Tecnología",    en: "Tech" },
  culture:       { es: "Cultura",       en: "Culture" },
  sports:        { es: "Deportes",      en: "Sports" },
  health:        { es: "Salud",         en: "Health" },
  science:       { es: "Ciencia",       en: "Science" },
  entertainment: { es: "Entretenimiento", en: "Entertainment" },
};

function sectionLabel(key: string, locale: "es" | "en"): string {
  return SECTION_LABELS[key]?.[locale] ?? key;
}

function formatDate(date: Date, locale: "es" | "en"): string {
  return date.toLocaleDateString(locale === "es" ? "es-AR" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function timeAgo(date: Date, locale: "es" | "en"): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (hours < 1) return locale === "es" ? "hace menos de 1 hora" : "less than 1 hour ago";
  if (hours === 1) return locale === "es" ? "hace 1 hora" : "1 hour ago";
  return locale === "es" ? `hace ${hours} horas` : `${hours} hours ago`;
}

/** Escape HTML entities for safe injection into template strings. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function articleCard(article: DigestArticle, locale: "es" | "en"): string {
  const label = sectionLabel(article.section_key, locale);
  const ago = timeAgo(article.published_at, locale);
  const readMore = locale === "es" ? "Leer artículo →" : "Read article →";

  const thumbnail = article.thumbnail_url
    ? `<img src="${esc(article.thumbnail_url)}" alt="" width="120" height="80"
         style="display:block;width:120px;height:80px;object-fit:cover;border-radius:6px;flex-shrink:0;" />`
    : "";

  const desc = article.description
    ? `<p style="margin:4px 0 0;font-size:13px;line-height:1.5;color:#888;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${esc(article.description)}</p>`
    : "";

  return `
<tr>
  <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${thumbnail ? `<td width="120" valign="top" style="padding-right:12px;">${thumbnail}</td>` : ""}
        <td valign="top">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:#5b9cf6;">${esc(label)}</p>
          <a href="${esc(article.url)}" style="text-decoration:none;color:#f0f0f0;font-size:15px;font-weight:600;line-height:1.4;">
            ${esc(article.title)}
          </a>
          ${desc}
          <p style="margin:6px 0 0;font-size:11px;color:#666;">
            ${esc(article.source_name)} · ${ago}
          </p>
          <a href="${esc(article.url)}" style="display:inline-block;margin-top:6px;font-size:12px;color:#5b9cf6;text-decoration:none;">${readMore}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

export function buildDigestEmail(opts: TemplateOptions): {
  subject: string;
  html: string;
} {
  const { articles, unsubscribeUrl, locale, date, appUrl } = opts;
  const dateStr = formatDate(date, locale);

  const subject =
    locale === "es"
      ? `Tu resumen de NewsMap — ${dateStr}`
      : `Your NewsMap digest — ${dateStr}`;

  const heading =
    locale === "es"
      ? `Tu resumen de hoy`
      : `Your daily digest`;

  const subheading =
    locale === "es"
      ? `${articles.length} artículos seleccionados de tus fuentes`
      : `${articles.length} articles from your sources`;

  const unsubLabel =
    locale === "es"
      ? "Cancelar suscripción"
      : "Unsubscribe";

  const footerNote =
    locale === "es"
      ? "Recibís este email porque activaste el resumen diario en NewsMap."
      : "You're receiving this because you opted in to the daily digest on NewsMap.";

  const articleRows = articles.map((a) => articleCard(a, locale)).join("\n");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0f0f0f;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;">
              <a href="${esc(appUrl)}" style="text-decoration:none;">
                <span style="font-size:22px;font-weight:700;color:#f0f0f0;letter-spacing:-.5px;">NewsMap</span>
              </a>
            </td>
          </tr>

          <!-- Date / title -->
          <tr>
            <td style="padding-bottom:4px;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#f0f0f0;">${esc(heading)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:14px;color:#888;">${esc(subheading)} · ${esc(dateStr)}</p>
            </td>
          </tr>

          <!-- Articles -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${articleRows}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:24px 0;">
              <a href="${esc(appUrl)}/${locale}/feed"
                 style="display:inline-block;padding:10px 20px;background:#5b9cf6;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">
                ${locale === "es" ? "Ver mi feed completo →" : "See my full feed →"}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #2a2a2a;padding-top:20px;">
              <p style="margin:0 0 8px;font-size:12px;color:#555;">${esc(footerNote)}</p>
              <a href="${esc(unsubscribeUrl)}" style="font-size:12px;color:#555;text-decoration:underline;">${esc(unsubLabel)}</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

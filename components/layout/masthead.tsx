import { getTranslations } from "next-intl/server";

type Props = {
  locale: string;
  /** Optional eyebrow above the masthead, e.g. country name on country pages */
  eyebrow?: string;
};

/**
 * Masthead — the newspaper-style header that anchors the user in time.
 *
 * Layout (top → bottom):
 *   ┌─────────────────────────────────────┐
 *   │ {eyebrow}                           │ (optional small-caps label)
 *   │ N E W S M A P                       │ (huge serif logotype)
 *   │ ─────────────────────────────────── │ (oxblood hairline)
 *   │ Domingo 25 de Mayo · Edición tarde  │ (date + edition tag)
 *   └─────────────────────────────────────┘
 *
 * Renders server-side so the date is always fresh on each request.
 * Time-of-day determines morning / afternoon / evening edition labels.
 */
export async function Masthead({ locale, eyebrow }: Props) {
  const t = await getTranslations({ locale, namespace: "Masthead" });
  const now = new Date();

  // Edition window — keeps the page feeling "live" without showing exact times
  const hour = now.getHours();
  const edition =
    hour >= 4 && hour < 12
      ? t("edition_morning")
      : hour >= 12 && hour < 18
      ? t("edition_afternoon")
      : t("edition_evening");

  // Locale-aware date: "domingo 25 de mayo de 2026" / "Sunday, May 25, 2026"
  const dateFormatter = new Intl.DateTimeFormat(
    locale === "es" ? "es-AR" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );
  const dateLabel = dateFormatter.format(now);

  return (
    <header className="border-b border-[var(--color-accent)] pb-2 sm:pb-3 mb-3 mt-1 sm:mt-2 mx-3 sm:mx-4 max-w-[920px] md:mx-auto">
      {eyebrow && (
        <p className="eyebrow text-center text-[var(--color-accent)] mb-1">
          {eyebrow}
        </p>
      )}

      <h1
        className="font-display text-center font-black text-[var(--color-text)] tracking-tight leading-none select-none"
        // Mobile cap is much lower so "NewsMap" doesn't dominate the viewport;
        // 5vw of 360px = 18px which clamps up to the 1.75rem (28px) min.
        // On desktop (>=1280px) hits the 4rem ceiling.
        style={{ fontSize: "clamp(1.75rem, 5vw, 4rem)" }}
      >
        NewsMap
      </h1>

      <p className="eyebrow text-center mt-1.5 sm:mt-2 text-[var(--color-text-2)]">
        {t("tagline")}
      </p>

      {/* Bottom row: date · edition — wrap-safe on narrow widths */}
      <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 mt-2 sm:mt-3 text-[10px] sm:text-[11px] tracking-wide text-[var(--color-text-3)]">
        <time
          dateTime={now.toISOString()}
          className="font-medium capitalize"
        >
          {dateLabel}
        </time>
        <span className="opacity-40">·</span>
        <span className="uppercase tracking-[0.15em] font-semibold">
          {edition}
        </span>
      </div>
    </header>
  );
}

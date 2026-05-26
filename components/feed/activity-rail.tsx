import { db } from "@/lib/db";
import { articles, sources } from "@/lib/db/schema";
import { eq, gte, sql, desc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { ALPHA2_TO_SLUG, COUNTRY_FLAGS } from "@/lib/countries";

type Props = {
  locale: string;
};

const WINDOW_HOURS = 6;
const MAX_COUNTRIES = 12;

/**
 * Country activity rail — Server Component shown above the masthead.
 *
 * Queries the article count per country over the last WINDOW_HOURS and
 * renders a horizontal scroll of flags + counts, ordered by activity.
 * Acts as a live "pulse of world news" — also feeds curiosity by surfacing
 * countries the reader might not have explored.
 *
 * Each flag links to the existing /news/{country} landing page (which we
 * already render with full JSON-LD + ISR), so this also doubles as an
 * internal-linking surface for SEO.
 */
export async function ActivityRail({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "Activity" });
  // eslint-disable-next-line react-hooks/purity -- Server Component; Date.now() is intentional per-request
  const cutoff = new Date(Date.now() - WINDOW_HOURS * 3_600_000);

  // Count articles per country in the recent window. Only counts countries
  // with an existing /news/{slug} landing page so every flag is clickable.
  const rows = await db
    .select({
      country_code: sources.country_code,
      count: sql<number>`count(*)::int`,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.source_id, sources.id))
    .where(gte(articles.published_at, cutoff))
    .groupBy(sources.country_code)
    .orderBy(desc(sql`count(*)`));

  // Filter to known countries + cap to keep the rail visually balanced
  const countries = rows
    .filter((r) => ALPHA2_TO_SLUG[r.country_code])
    .slice(0, MAX_COUNTRIES);

  if (countries.length === 0) return null;

  const total = countries.reduce((sum, c) => sum + c.count, 0);
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });

  return (
    <section
      className="border-b border-[var(--color-border)] bg-[var(--color-bg)]"
      aria-label={t("aria_label")}
    >
      <div className="max-w-[920px] mx-auto px-4 py-2.5 overflow-x-auto scrollbar-hidden">
        <div className="flex items-center gap-1.5 min-w-max">
          {/* Eyebrow label */}
          <span className="eyebrow text-[var(--color-accent)] mr-2 shrink-0">
            {t("pulse")} · {t("articles_count", { count: total })}
          </span>

          {countries.map((c) => {
            const slug = ALPHA2_TO_SLUG[c.country_code]!;
            const flag = COUNTRY_FLAGS[c.country_code] ?? "🌐";
            const name =
              displayNames.of(c.country_code) ?? c.country_code;
            return (
              <a
                key={c.country_code}
                href={`/${locale}/news/${slug}`}
                title={`${name} · ${c.count}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors rounded-sm shrink-0"
              >
                <span className="text-sm leading-none">{flag}</span>
                <span className="font-semibold tabular-nums">{c.count}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

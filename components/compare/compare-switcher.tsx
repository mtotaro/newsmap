"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ALPHA2_TO_SLUG, COUNTRY_FLAGS } from "@/lib/countries";

type Props = {
  locale: string;
  currentA: string;
  currentB: string;
};

/**
 * Two compact dropdowns to swap the comparison's left/right countries.
 * Built as a Client Component so changes navigate without a full page reload
 * round-trip (next/navigation router.push handles the prefetch + transition).
 *
 * Order of options reflects audience priority: LATAM countries first, then
 * Spain (largest Spanish-speaking publisher base), then Anglosphere.
 */
const ORDERED_ALPHAS: string[] = [
  "AR", "MX", "ES", "CL", "CO", "BR", "PE", "VE", "EC", "PY", "BO",
  "GT", "CR", "PA", "DO", "SV",
  "US", "GB", "DE", "FR", "IT", "PT", "NL", "SE", "QA",
];

export function CompareSwitcher({ locale, currentA, currentB }: Props) {
  const router = useRouter();
  const t = useTranslations("Compare");

  // Pretty names per locale
  const displayNames = new Intl.DisplayNames([locale], { type: "region" });
  const options = ORDERED_ALPHAS.filter((a) => ALPHA2_TO_SLUG[a]).map((a) => ({
    alpha: a,
    slug: ALPHA2_TO_SLUG[a]!,
    name: displayNames.of(a) ?? a,
    flag: COUNTRY_FLAGS[a] ?? "🌐",
  }));

  function onChange(side: "a" | "b", newSlug: string) {
    const a = side === "a" ? newSlug : currentA;
    const b = side === "b" ? newSlug : currentB;
    if (a === b) return; // ignore self-comparison
    router.push(`/${locale}/compare/${a}/${b}`);
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs">
      <label className="sr-only" htmlFor="compare-a">
        {t("switcher_a")}
      </label>
      <select
        id="compare-a"
        value={currentA}
        onChange={(e) => onChange("a", e.target.value)}
        className="px-2 py-1 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:border-[var(--color-ink)] transition-colors"
      >
        {options
          .filter((o) => o.slug !== currentB)
          .map((o) => (
            <option key={o.alpha} value={o.slug}>
              {o.flag} {o.name}
            </option>
          ))}
      </select>

      <span className="text-[var(--color-text-3)] uppercase tracking-widest font-semibold">
        {t("vs")}
      </span>

      <label className="sr-only" htmlFor="compare-b">
        {t("switcher_b")}
      </label>
      <select
        id="compare-b"
        value={currentB}
        onChange={(e) => onChange("b", e.target.value)}
        className="px-2 py-1 border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] font-semibold uppercase tracking-wider text-[11px] cursor-pointer hover:border-[var(--color-ink)] transition-colors"
      >
        {options
          .filter((o) => o.slug !== currentA)
          .map((o) => (
            <option key={o.alpha} value={o.slug}>
              {o.flag} {o.name}
            </option>
          ))}
      </select>
    </div>
  );
}

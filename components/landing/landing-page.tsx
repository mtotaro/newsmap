"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ALPHA2_TO_SLUG } from "@/lib/countries";

const AnimatedLanding = dynamic(
  () => import("@/components/landing/animated-landing"),
  { ssr: false, loading: () => null }
);

type Props = {
  locale: string;
};

export function LandingPage({ locale }: Props) {
  const [animDone, setAnimDone] = useState(false);
  const t = useTranslations("Landing");
  const features = [
    { icon: "🗺️", titleKey: "feature_map_title", descKey: "feature_map_desc" },
    { icon: "📖", titleKey: "feature_rss_title", descKey: "feature_rss_desc" },
    { icon: "🌍", titleKey: "feature_i18n_title", descKey: "feature_i18n_desc" },
  ] as const;

  return (
    <main className="flex flex-col items-center justify-start sm:justify-center flex-1 min-h-[calc(100dvh-3rem)] sm:min-h-[calc(100vh-3.5rem)] px-4 py-6 sm:py-8 text-center">
      {/* Fullscreen animation overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          animDone ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ background: "#0f0f0f" }}
      >
        <AnimatedLanding
          locale={locale}
          onDone={() => setAnimDone(true)}
        />
      </div>

      <div className="w-full max-w-[420px] sm:max-w-[1040px] flex flex-col items-center gap-4 sm:gap-6">
        {/* Headline + subheadline */}
        <div
          className={`space-y-3 max-w-md transition-opacity duration-300 delay-300 ${
            animDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
            {t("headline")}
          </h1>
          <p className="text-base sm:text-lg text-[var(--color-text-2)] leading-relaxed">
            {t("subheadline")}
          </p>
        </div>

        {/* CTA buttons */}
        <div
          className={`flex gap-3 transition-opacity duration-300 delay-500 ${
            animDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Link
            href="/auth"
            className="px-6 py-3 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            {t("cta")}
          </Link>
        </div>

        {/* Feature cards */}
        <div
          className={`grid w-full grid-cols-1 sm:max-w-xl sm:grid-cols-3 gap-3 sm:gap-4 mt-1 sm:mt-2 transition-opacity duration-300 delay-700 ${
            animDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {features.map(({ icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] p-4 text-left flex items-start gap-3 sm:block"
            >
              <div className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 text-2xl sm:mb-3 sm:h-auto sm:w-auto sm:bg-transparent sm:p-0">
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-sm font-semibold text-[var(--color-text)]">
                  {t(titleKey)}
                </p>
                <p className="text-sm sm:text-xs text-[var(--color-text-2)] mt-1 leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Country news links — helps SEO crawlers discover public pages */}
        <nav
          className={`flex flex-wrap justify-center gap-x-3 gap-y-2 max-w-[420px] sm:max-w-xl mt-2 transition-opacity duration-300 delay-700 ${
            animDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Country news"
        >
          {Object.entries(ALPHA2_TO_SLUG).map(([alpha2, slug]) => (
            <a
              key={alpha2}
              href={`/${locale}/news/${slug}`}
              className="text-xs text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
            >
              {new Intl.DisplayNames([locale], { type: "region" }).of(alpha2)}
            </a>
          ))}
        </nav>

        {/* Footer legal link */}
        <p
          className={`text-xs text-[var(--color-text-3)] mt-1 transition-opacity duration-300 delay-700 ${
            animDone ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <a
            href={`/${locale}/privacy`}
            className="hover:text-[var(--color-text-2)] transition-colors underline"
          >
            {locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
          </a>
        </p>
      </div>
    </main>
  );
}

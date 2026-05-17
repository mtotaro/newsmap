"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const AnimatedLanding = dynamic(
  () => import("@/components/landing/animated-landing"),
  { ssr: false, loading: () => null }
);

export default function HomePage() {
  const [animDone, setAnimDone] = useState(false);
  const params = useParams();
  const locale = (params?.locale as string) ?? "es";
  const t = useTranslations("Landing");

  return (
    <main className="flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-3.5rem)] gap-6 px-4 text-center">
      {/* Fullscreen animation overlay — covers nav too while playing */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-1000 ${
          animDone ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ background: "#0f0f0f" }}
      >
        <AnimatedLanding locale={locale} onDone={() => setAnimDone(true)} />
      </div>

      {/* Headline + subheadline */}
      <div
        className={`space-y-3 max-w-md transition-opacity duration-1000 delay-300 ${
          animDone ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)]">
          {t("headline")}
        </h1>
        <p className="text-lg text-[var(--color-text-2)] leading-relaxed">
          {t("subheadline")}
        </p>
      </div>

      {/* CTA buttons */}
      <div
        className={`flex flex-col sm:flex-row gap-3 transition-opacity duration-1000 delay-500 ${
          animDone ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Link
          href="/auth"
          className="px-6 py-3 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          {t("cta")}
        </Link>
        <Link
          href="/map"
          className="px-6 py-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-[var(--color-text-2)] font-medium hover:bg-[var(--color-bg-2)] transition-colors"
        >
          {t("demo_label")} →
        </Link>
      </div>

      {/* Feature cards */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mt-2 transition-opacity duration-1000 delay-700 ${
          animDone ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {(
          [
            { icon: "🗺", titleKey: "feature_map_title", descKey: "feature_map_desc" },
            { icon: "📰", titleKey: "feature_rss_title", descKey: "feature_rss_desc" },
            { icon: "🌐", titleKey: "feature_i18n_title", descKey: "feature_i18n_desc" },
          ] as const
        ).map(({ icon, titleKey, descKey }) => (
          <div
            key={titleKey}
            className="p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] text-left"
          >
            <p className="text-2xl mb-2">{icon}</p>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {t(titleKey)}
            </p>
            <p className="text-xs text-[var(--color-text-2)] mt-1 leading-relaxed">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

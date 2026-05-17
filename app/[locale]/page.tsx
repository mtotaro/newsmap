import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("Landing");

  return (
    <main className="flex flex-col items-center justify-center flex-1 min-h-[calc(100vh-3.5rem)] gap-6 px-4 text-center">
      <div className="space-y-3 max-w-md">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text)]">
          {t("headline")}
        </h1>
        <p className="text-lg text-[var(--color-text-2)] leading-relaxed">
          {t("subheadline")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Feature row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mt-6">
        {[
          { icon: "🗺", titleKey: "feature_map_title", descKey: "feature_map_desc" },
          { icon: "📰", titleKey: "feature_rss_title", descKey: "feature_rss_desc" },
          { icon: "🌐", titleKey: "feature_i18n_title", descKey: "feature_i18n_desc" },
        ].map(({ icon, titleKey, descKey }) => (
          <div
            key={titleKey}
            className="p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] text-left"
          >
            <p className="text-2xl mb-2">{icon}</p>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {t(titleKey as Parameters<typeof t>[0])}
            </p>
            <p className="text-xs text-[var(--color-text-2)] mt-1 leading-relaxed">
              {t(descKey as Parameters<typeof t>[0])}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}

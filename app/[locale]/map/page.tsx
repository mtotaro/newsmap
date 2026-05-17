import { getTranslations } from "next-intl/server";
import { WorldMap } from "@/components/map/world-map";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Map" });
  return { title: t("title") };
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Map" });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-1">
          {t("title")}
        </h1>
        <p className="text-sm text-[var(--color-text-2)] mb-6">
          {t("subtitle")}
        </p>
        <div style={{ height: "calc(100vh - 200px)" }}>
          <WorldMap locale={locale} />
        </div>
      </div>
    </div>
  );
}

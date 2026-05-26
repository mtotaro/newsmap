import { getTranslations } from "next-intl/server";
import { SavedList } from "@/components/feed/saved-list";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Saved" });
  return {
    title: t("title"),
    // Personal/private bookmark list — keep it out of search results
    robots: { index: false, follow: false },
  };
}

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div className="min-h-screen pb-20">
      <SavedList locale={locale} />
    </div>
  );
}

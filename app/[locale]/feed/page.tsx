import { getTranslations } from "next-intl/server";
import { FeedList } from "@/components/feed/feed-list";
import { NewArticlesBanner } from "@/components/feed/new-articles-banner";
import { Masthead } from "@/components/layout/masthead";
import { ActivityRail } from "@/components/feed/activity-rail";
import type { Metadata } from "next";
import { requirePageUser } from "@/lib/supabase/auth-guards";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Feed" });
  return { title: t("title") };
}

export default async function FeedPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const user = await requirePageUser(locale, `/${locale}/feed`);

  return (
    <div className="min-h-screen pb-20">
      <NewArticlesBanner userId={user.id} />
      <ActivityRail locale={locale} />
      <Masthead locale={locale} />
      <FeedList locale={locale} />
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed/feed-list";
import { NewArticlesBanner } from "@/components/feed/new-articles-banner";
import { Masthead } from "@/components/layout/masthead";
import { ActivityRail } from "@/components/feed/activity-rail";
import type { Metadata } from "next";

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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Anonymous users see latest articles across all sources (public discovery feed).
  // Signed-in users see articles filtered by their subscriptions (personalized).
  // This is crucial for SEO (Googlebot can index) and funnel (no auth wall on landing).
  return (
    <div className="min-h-screen pb-20">
      <NewArticlesBanner userId={user?.id} />
      <ActivityRail locale={locale} />
      <Masthead locale={locale} />
      <FeedList locale={locale} />
    </div>
  );
}

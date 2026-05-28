import { getTranslations } from "next-intl/server";
import { FeedList } from "@/components/feed/feed-list";
import { NewArticlesBanner } from "@/components/feed/new-articles-banner";
import { Masthead } from "@/components/layout/masthead";
import { ActivityRail } from "@/components/feed/activity-rail";
import { AdSlot } from "@/components/ads/ad-slot";
import type { Metadata } from "next";
import { requirePageUser } from "@/lib/supabase/auth-guards";

const SIDEBAR_LEFT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_LEFT ?? "";
const SIDEBAR_RIGHT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RIGHT ?? "";

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

      {/* 3-column layout on xl+ (≥1280px): left sidebar | feed | right sidebar */}
      <div className="xl:grid xl:grid-cols-[200px_1fr_200px] 2xl:grid-cols-[260px_1fr_260px] xl:gap-4 xl:max-w-[1320px] 2xl:max-w-[1500px] xl:mx-auto xl:px-4 xl:pt-2">

        {/* Left sidebar */}
        <aside className="hidden xl:block" aria-label="Publicidad">
          <div className="sticky top-[64px] pt-4">
            <AdSlot slot={SIDEBAR_LEFT_SLOT} variant="display" />
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0">
          <Masthead locale={locale} />
          <FeedList locale={locale} />
        </div>

        {/* Right sidebar */}
        <aside className="hidden xl:block" aria-label="Publicidad">
          <div className="sticky top-[64px] pt-4">
            <AdSlot slot={SIDEBAR_RIGHT_SLOT} variant="display" />
          </div>
        </aside>

      </div>
    </div>
  );
}

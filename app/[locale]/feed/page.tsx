import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed/feed-list";
import { NewArticlesBanner } from "@/components/feed/new-articles-banner";
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

  if (!user) {
    redirect(`/${locale}/auth`);
  }

  return (
    <div className="min-h-screen pb-20">
      <NewArticlesBanner
        userId={user.id}
        onRefresh={() => {
          // Client component handles this via prop
        }}
      />
      <FeedList locale={locale} />
    </div>
  );
}

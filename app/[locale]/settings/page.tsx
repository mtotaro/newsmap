import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Settings" });
  return { title: t("title") };
}

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${locale}/auth`);

  const t = await getTranslations({ locale, namespace: "Settings" });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-6">
          {t("title")}
        </h1>

        <section className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)] mb-2">
              {t("section_account")}
            </p>
            <p className="text-sm text-[var(--color-text-2)]">{user.email}</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)] mb-2">
              {t("section_display")}
            </p>
            <p className="text-sm text-[var(--color-text-2)]">
              {t("language_label")}:{" "}
              {locale === "es" ? t("language_es") : t("language_en")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { userSubscriptions, sources, userProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/settings/language-switcher";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { SubscriptionItem } from "@/components/settings/subscription-item";
import { DeleteAccount } from "@/components/settings/delete-account";
import { DigestToggle } from "@/components/settings/digest-toggle";
import { normalizeSourceLogoUrl } from "@/lib/utils/source-logos";

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

  const [subscriptions, digestProfile] = await Promise.all([
    db
      .select({
        source_id: userSubscriptions.source_id,
        source_name: sources.name,
        source_slug: sources.slug,
        country_code: sources.country_code,
        logo_url: sources.logo_url,
        section_keys: userSubscriptions.section_keys,
      })
      .from(userSubscriptions)
      .innerJoin(sources, eq(sources.id, userSubscriptions.source_id))
      .where(eq(userSubscriptions.user_id, user.id))
      .orderBy(sources.name),
    db
      .select({
        digest_enabled: userProfiles.digest_enabled,
        digest_hour: userProfiles.digest_hour,
      })
      .from(userProfiles)
      .where(eq(userProfiles.user_id, user.id))
      .then((rows) => rows[0] ?? { digest_enabled: false, digest_hour: 7 }),
  ]);

  const normalizedSubscriptions = subscriptions.map((sub) => ({
    ...sub,
    logo_url: normalizeSourceLogoUrl(sub.source_slug, sub.logo_url),
  }));

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          {t("title")}
        </h1>

        {/* ── Account ───────────────────────────────────────────────────── */}
        <section className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)] mb-3">
              {t("section_account")}
            </p>
            <p className="text-sm text-[var(--color-text)] mb-3">
              {user.email}
            </p>
            <SignOutButton label={t("signout_btn")} locale={locale} />
          </div>
        </section>

        {/* ── My Sources ────────────────────────────────────────────────── */}
        <section className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)]">
          <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)]">
              {t("section_sources")}
            </p>
            <Link
              href="/map"
              className="text-xs text-[var(--color-blue)] hover:underline"
            >
              + {t("add_sources")}
            </Link>
          </div>

          {normalizedSubscriptions.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-sm text-[var(--color-text-2)]">
                {t("sources_empty")}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {normalizedSubscriptions.map((sub) => (
                <li key={sub.source_id} className="px-4">
                  <SubscriptionItem
                    sub={sub}
                    removeLabel={t("remove_source")}
                    allSectionsLabel={t("all_sections")}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Display ───────────────────────────────────────────────────── */}
        <section className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)]">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)] mb-1">
              {t("section_display")}
            </p>
            <p className="text-sm text-[var(--color-text-2)] mb-2">
              {t("language_label")}
            </p>
            <LanguageSwitcher
              locale={locale}
              labelEs={t("language_es")}
              labelEn={t("language_en")}
            />
          </div>
        </section>

        {/* ── Notifications ─────────────────────────────────────────────── */}
        <section className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)]">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)] mb-3">
              {t("section_notifications")}
            </p>
            <DigestToggle
              initialEnabled={digestProfile.digest_enabled}
              initialHour={digestProfile.digest_hour}
              labels={{
                title: t("digest_title"),
                description: t("digest_description"),
                hour_label: t("digest_hour_label"),
                saved: t("digest_saved"),
              }}
            />
          </div>
        </section>

        {/* ── Danger zone ───────────────────────────────────────────────── */}
        <section className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-red)]/30">
          <div className="px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-red)] mb-3">
              {t("section_danger")}
            </p>
            <DeleteAccount
              deleteLabel={t("delete_account")}
              confirmText={t("delete_confirm")}
              confirmBtn={t("delete_btn")}
              cancelLabel={t("cancel")}
              locale={locale}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

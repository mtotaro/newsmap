import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/settings/sign-out-button";
import { StatsBadge } from "./stats-badge";

type Props = {
  locale: string;
};

export async function Nav({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "Nav" });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-40 h-14 flex items-center px-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-sm">
      <Link
        href="/"
        className="font-bold text-[var(--color-text)] mr-6"
      >
        NewsMap
      </Link>

      <div className="flex items-center gap-1 flex-1">
        <Link
          href="/feed"
          className="px-3 py-1.5 rounded text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
        >
          {t("feed")}
        </Link>
        <Link
          href="/map"
          className="px-3 py-1.5 rounded text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
        >
          {t("map")}
        </Link>
        <Link
          href="/compare/argentina/mexico"
          className="px-3 py-1.5 rounded text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
        >
          {t("compare")}
        </Link>
        <Link
          href="/saved"
          className="px-3 py-1.5 rounded text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
        >
          {t("saved")}
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <StatsBadge />
        {user ? (
          <>
            <Link
              href="/settings"
              className="px-3 py-1.5 rounded text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-2)] transition-colors"
            >
              {t("settings")}
            </Link>
            <SignOutButton label={t("signout")} locale={locale} />
          </>
        ) : (
          <Link
            href="/auth"
            className="px-4 py-1.5 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90"
          >
            {t("signin")}
          </Link>
        )}
      </div>
    </nav>
  );
}

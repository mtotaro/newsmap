import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("Landing");

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">{t("headline")}</h1>
      <p className="text-lg text-center max-w-md text-muted">
        {t("subheadline")}
      </p>
      <Link
        href="/feed"
        className="px-6 py-3 rounded-full bg-foreground text-background font-medium hover:opacity-80 transition-opacity"
      >
        {t("cta")}
      </Link>
    </main>
  );
}

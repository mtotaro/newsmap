"use client";

import Link from "next/link";

type Props = {
  locale: string;
  labelEs: string;
  labelEn: string;
};

const btnClass = (active: boolean) =>
  [
    "px-4 py-1.5 rounded-[var(--radius-button)] text-sm font-medium border transition-colors",
    active
      ? "bg-[var(--color-blue)] text-white border-transparent"
      : "border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-text-3)] hover:text-[var(--color-text)]",
  ].join(" ");

export function LanguageSwitcher({ locale, labelEs, labelEn }: Props) {
  return (
    <div className="flex gap-2 mt-2">
      <Link href="/es/settings" className={btnClass(locale === "es")}>
        {labelEs}
      </Link>
      <Link href="/en/settings" className={btnClass(locale === "en")}>
        {labelEn}
      </Link>
    </div>
  );
}

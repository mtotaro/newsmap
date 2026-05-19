"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { PROFILES, type ProfileId } from "@/lib/profiles";

type Step = "pick" | "confirm";

export function OnboardingClient() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();

  const [step, setStep] = useState<Step>("pick");
  const [selected, setSelected] = useState<ProfileId | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProfile = PROFILES.find((p) => p.id === selected);

  async function handleFinish() {
    if (!selectedProfile) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: selectedProfile.slugs }),
      });
      if (!res.ok) throw new Error("Failed to save subscriptions");
      router.push(`/${locale}/feed`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (step === "confirm" && selectedProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <p className="text-4xl mb-3">{selectedProfile.icon}</p>
            <h1 className="text-xl font-bold text-[var(--color-text)]">
              {t("step2_title")}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-2)]">
              {t("step2_subtitle")}
            </p>
          </div>

          <div className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
            {selectedProfile.slugs.map((slug) => (
              <div
                key={slug}
                className="flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm text-[var(--color-text)] capitalize">
                  {slug.replace(/-/g, " ")}
                </span>
                <span className="text-xs text-[var(--color-green)]">✓</span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("pick")}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] border border-[var(--color-border)] text-[var(--color-text-2)] text-sm hover:bg-[var(--color-bg-3)] transition-colors"
            >
              {t("btn_back")}
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "…" : t("btn_finish")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t("step1_title")}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-2)]">
            {t("step1_subtitle")}
          </p>
        </div>

        <div className="grid gap-3">
          {PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => setSelected(profile.id)}
              className={`w-full text-left p-4 rounded-[var(--radius-card)] border transition-colors ${
                selected === profile.id
                  ? "border-[var(--color-blue)] bg-[var(--color-blue)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-bg-2)] hover:border-[var(--color-text-3)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{profile.icon}</span>
                <div>
                  <p className="font-medium text-[var(--color-text)]">
                    {t(`profile_${profile.id}` as Parameters<typeof t>[0])}
                  </p>
                  <p className="text-xs text-[var(--color-text-2)] mt-0.5">
                    {t(`profile_${profile.id}_desc` as Parameters<typeof t>[0])}
                  </p>
                </div>
                {selected === profile.id && (
                  <span className="ml-auto text-[var(--color-blue)]">✓</span>
                )}
              </div>
            </button>
          ))}

          {/* Custom / Map option */}
          <button
            onClick={() => router.push(`/${locale}/map`)}
            className="w-full text-left p-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-2)] hover:border-[var(--color-text-3)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺</span>
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {t("profile_custom")}
                </p>
                <p className="text-xs text-[var(--color-text-2)] mt-0.5">
                  {t("profile_custom_desc")}
                </p>
              </div>
            </div>
          </button>
        </div>

        <button
          disabled={!selected}
          onClick={() => setStep("confirm")}
          className="w-full px-4 py-3 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white font-medium hover:opacity-90 disabled:opacity-30 transition-opacity"
        >
          {t("btn_continue")}
        </button>
      </div>
    </div>
  );
}

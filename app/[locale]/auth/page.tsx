"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function AuthPage() {
  const t = useTranslations("Auth");
  const { locale } = useParams<{ locale: string }>();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/feed`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/${locale}/feed`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            NewsMap
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-2)]">
            {t("signin_subtitle")}
          </p>
        </div>

        {sent ? (
          <div className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] p-6 text-center">
            <p className="text-2xl mb-3">📬</p>
            <p className="text-[var(--color-text)]">{t("magic_link_sent")}</p>
          </div>
        ) : (
          <div className="rounded-[var(--radius-card)] bg-[var(--color-bg-2)] border border-[var(--color-border)] p-6 space-y-4">
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-[var(--radius-button)] border border-[var(--color-border)] text-[var(--color-text)] text-sm font-medium hover:bg-[var(--color-bg-3)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.8 0 6.9 5.4 3 13.3l7.8 6C12.7 13.1 17.9 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.9c-.6 3-2.3 5.5-4.9 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.1z"/>
                <path fill="#FBBC05" d="M10.8 28.7A14.4 14.4 0 0 1 9.5 24c0-1.6.3-3.2.7-4.7L2.4 13.3A24 24 0 0 0 0 24c0 3.9.9 7.5 2.5 10.7l8.3-6z"/>
                <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.6-5.9c-2.1 1.4-4.8 2.2-7.6 2.2-6.1 0-11.3-3.6-13.2-8.8l-8.3 6C6.9 42.6 14.8 48 24 48z"/>
              </svg>
              {t("google_btn")}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-3)]">{t("or")}</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            {/* Magic link */}
            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email_placeholder")}
                required
                className="w-full px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-bg-3)] border border-[var(--color-border)] text-[var(--color-text)] text-sm placeholder:text-[var(--color-text-3)] focus:outline-none focus:border-[var(--color-blue)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-blue)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "…" : t("magic_link_btn")}
              </button>
            </form>

            {error && (
              <p className="text-xs text-[var(--color-red)]">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

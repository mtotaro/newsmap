"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  /** User's email — used to derive the avatar initial */
  email: string;
  /** Active locale, needed for the post-signout redirect */
  locale: string;
};

/**
 * Compact account menu for logged-in users on small screens.
 *
 * Phone screens can't comfortably fit the "Ajustes" + "Cerrar sesión" text
 * links next to the four primary nav items (Feed/Map/Compare/Saved) and the
 * stats badge — so on mobile we collapse those two into a single avatar
 * circle with a dropdown.
 *
 * Visibility: this component renders only at `<sm` (controlled by the parent
 * Nav, which keeps showing the inline desktop links above that breakpoint).
 * Closing: click-outside, Escape key, or selecting any menu item.
 */
export function UserMenu({ email, locale }: Props) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // First letter of the email, uppercased — falls back to "·" for safety
  const initial = (email?.[0] ?? "·").toUpperCase();

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    // Hard navigation so the server-rendered Nav re-evaluates `user` state
    window.location.href = `/${locale}`;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("account_menu_label")}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-9 h-9 min-h-[44px] min-w-[44px] rounded-full bg-[var(--color-blue)] text-white text-sm font-semibold hover:opacity-90 active:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] min-w-[180px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-xl py-1 z-50 origin-top-right"
          style={{ animation: "userMenuFade 0.16s ease-out" }}
        >
          <style>{`
            @keyframes userMenuFade {
              from { opacity: 0; transform: scale(0.96) translateY(-4px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          {/* Email label — context for which account this menu belongs to */}
          <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-3)] font-semibold">
              {t("account_signed_in_as")}
            </p>
            <p className="text-xs text-[var(--color-text-2)] truncate" title={email}>
              {email}
            </p>
          </div>

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-text)] transition-colors"
          >
            <span aria-hidden="true" className="text-base leading-none">⚙</span>
            {t("settings")}
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] text-sm text-[var(--color-text-2)] hover:bg-[var(--color-bg-2)] hover:text-[var(--color-accent)] transition-colors text-left"
          >
            <span aria-hidden="true" className="text-base leading-none">↩</span>
            {t("signout")}
          </button>
        </div>
      )}
    </div>
  );
}

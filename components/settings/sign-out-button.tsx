"use client";

import { createClient } from "@/lib/supabase/client";

type Props = {
  label: string;
  locale: string;
};

export function SignOutButton({ label, locale }: Props) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] underline-offset-2 hover:underline transition-colors"
    >
      {label}
    </button>
  );
}

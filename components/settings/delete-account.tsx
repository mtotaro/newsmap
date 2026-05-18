"use client";

import { useState } from "react";

type Props = {
  deleteLabel: string;
  confirmText: string;
  confirmBtn: string;
  cancelLabel: string;
  locale: string;
};

export function DeleteAccount({
  deleteLabel,
  confirmText,
  confirmBtn,
  cancelLabel,
  locale,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch("/api/user", { method: "DELETE" });
      window.location.href = `/${locale}`;
    } catch {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-text-2)]">{confirmText}</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-1.5 rounded-[var(--radius-button)] bg-[var(--color-red)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "…" : confirmBtn}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-1.5 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm text-[var(--color-text-2)] hover:text-[var(--color-text)] transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-[var(--color-red)] hover:opacity-70 transition-opacity"
    >
      {deleteLabel}
    </button>
  );
}

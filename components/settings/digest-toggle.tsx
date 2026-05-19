"use client";

import { useState, useEffect } from "react";

type Props = {
  /** Initial state loaded server-side */
  initialEnabled: boolean;
  initialHour: number;
  /** i18n labels */
  labels: {
    title: string;
    description: string;
    hour_label: string;
    saved: string;
  };
};

export function DigestToggle({ initialEnabled, initialHour, labels }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hour, setHour] = useState(initialHour);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Reset "saved" badge after 2 seconds
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  async function persist(nextEnabled: boolean, nextHour: number) {
    setSaving(true);
    try {
      await fetch("/api/user/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          digest_enabled: nextEnabled,
          digest_hour: nextHour,
        }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    void persist(next, hour);
  }

  function handleHourChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = Number(e.target.value);
    setHour(next);
    if (enabled) void persist(true, next);
  }

  // Build 24-hour options  e.g. "07:00 UTC", "14:00 UTC"
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${String(i).padStart(2, "0")}:00 UTC`,
  }));

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">
          {labels.title}
          {saving && (
            <span className="ml-2 text-xs text-[var(--color-text-3)]">…</span>
          )}
          {saved && !saving && (
            <span className="ml-2 text-xs text-[var(--color-green)]">
              ✓ {labels.saved}
            </span>
          )}
        </p>
        <p className="text-xs text-[var(--color-text-2)] mt-0.5">
          {labels.description}
        </p>
        {enabled && (
          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-2)]">
              {labels.hour_label}
            </label>
            <select
              value={hour}
              onChange={handleHourChange}
              disabled={saving}
              className="text-xs rounded-[var(--radius-button)] bg-[var(--color-bg-3)] border border-[var(--color-border)] text-[var(--color-text)] px-2 py-1 focus:outline-none focus:border-[var(--color-blue)] disabled:opacity-50"
            >
              {hourOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Toggle switch */}
      <button
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={saving}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
          enabled ? "bg-[var(--color-blue)]" : "bg-[var(--color-bg-3)]"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

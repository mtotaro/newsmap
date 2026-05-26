import { useCallback } from "react";
import { useLocalState } from "./use-local-state";
import { STORAGE_KEYS, type WeeklyCount } from "./types";

/**
 * ISO week identifier for the current local date — "2026-W21".
 * ISO weeks start on Monday and week 1 is the one containing Jan 4th.
 */
function isoWeekId(): string {
  const d = new Date();
  // Move to the Thursday in the current ISO week (defines the week number)
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * Counter of articles read this ISO week. Auto-resets when the week rolls
 * over. Increments whenever `bump()` is called (typically tied to the same
 * click that marks-read in history).
 */
export function useWeeklyCount() {
  const [state, setState] = useLocalState<WeeklyCount>(
    STORAGE_KEYS.weekly_count,
    { count: 0, week_id: isoWeekId() }
  );

  const bump = useCallback(() => {
    const week = isoWeekId();
    setState((prev) =>
      prev.week_id === week
        ? { ...prev, count: prev.count + 1 }
        : { count: 1, week_id: week }
    );
  }, [setState]);

  // If the user visits on a new week, snap the counter to 0 lazily
  const currentWeek = isoWeekId();
  const count = state.week_id === currentWeek ? state.count : 0;

  return { count, bump };
}

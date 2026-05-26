import { useEffect } from "react";
import { useLocalState } from "./use-local-state";
import { STORAGE_KEYS, type StreakState } from "./types";

/** Local-calendar YYYY-MM-DD (not UTC — streaks are about the user's day) */
function todayKey(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Days between two YYYY-MM-DD strings (positive when `b` is after `a`) */
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/**
 * Visit streak counter. Logic on mount:
 *   - no previous visit       → streak = 1
 *   - last visit == today     → no change (already counted today)
 *   - last visit == yesterday → streak += 1 (kept the streak alive)
 *   - last visit older        → streak resets to 1
 *
 * Returns the current streak count (always ≥ 1 after initialization).
 */
export function useStreak(): number {
  const [state, setState] = useLocalState<StreakState | null>(
    STORAGE_KEYS.streak,
    null
  );

  useEffect(() => {
    const today = todayKey();
    setState((prev) => {
      if (!prev) {
        return { count: 1, last_visit: today };
      }
      const gap = daysBetween(prev.last_visit, today);
      if (gap === 0) return prev;                       // same day, no change
      if (gap === 1) return { count: prev.count + 1, last_visit: today };
      return { count: 1, last_visit: today };           // missed at least one day
    });
    // run only on mount — we explicitly avoid setState in deps to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state?.count ?? 0;
}

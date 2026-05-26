import { useEffect, useState, useCallback } from "react";

/**
 * SSR-safe localStorage hook.
 *
 * - Initial render returns `initial` (matches server output → no hydration error)
 * - After mount, reads the actual stored value and triggers a re-render
 * - Cross-tab sync via the `storage` event
 * - JSON serialised; corrupt data falls back to `initial`
 */
export function useLocalState<T>(
  key: string,
  initial: T
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  // After mount: load from localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional localStorage hydration
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // Corrupt JSON or quota exceeded — keep initial
    }
    setHydrated(true);
  }, [key]);

  // Cross-tab sync — when another tab writes the same key
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setValue(initial);
      } else {
        try {
          setValue(JSON.parse(e.newValue) as T);
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // intentionally not depending on `initial` (would be unstable for objects)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
          // Manually dispatch so OTHER hooks in the same tab pick it up.
          // The `storage` event only fires for OTHER tabs by default.
          window.dispatchEvent(
            new StorageEvent("storage", {
              key,
              newValue: JSON.stringify(resolved),
            })
          );
        } catch {
          /* quota exceeded or storage disabled — keep in-memory value */
        }
        return resolved;
      });
    },
    [key]
  );

  return [hydrated ? value : initial, update];
}

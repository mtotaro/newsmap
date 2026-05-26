import { useCallback } from "react";
import { useLocalState } from "./use-local-state";
import { STORAGE_KEYS, HISTORY_MAX, type ReadEntry } from "./types";
import type { ArticleCardData } from "@/components/feed/article-card";

/**
 * Tracks recently-read articles (capped FIFO at HISTORY_MAX). Powers:
 *   - "Continúa leyendo" strip above the feed
 *   - Weekly read counter (separate hook)
 *
 * Mark-read fires on any click that takes the user to the article: opening
 * the modal, clicking the publisher link, or clicking the title.
 */
export function useHistory() {
  const [items, setItems] = useLocalState<ReadEntry[]>(STORAGE_KEYS.history, []);

  const markRead = useCallback(
    (article: ArticleCardData) => {
      setItems((prev) => {
        // De-duplicate by id, then prepend the new entry, then cap.
        const filtered = prev.filter((e) => e.id !== article.id);
        const next: ReadEntry = {
          id: article.id,
          title: article.title,
          url: article.url,
          thumbnail_url: article.thumbnail_url,
          source_name: article.source_name,
          country_code: article.country_code,
          read_at: new Date().toISOString(),
        };
        return [next, ...filtered].slice(0, HISTORY_MAX);
      });
    },
    [setItems]
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  return { items, markRead, clear };
}

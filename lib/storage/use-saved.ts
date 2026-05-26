import { useCallback } from "react";
import { useLocalState } from "./use-local-state";
import { STORAGE_KEYS, type SavedArticle } from "./types";
import type { ArticleCardData } from "@/components/feed/article-card";

/**
 * Hook for managing the user's saved articles in localStorage.
 *
 * Returns:
 *  - items: current list of saved articles (most-recent first)
 *  - isSaved(id): O(1) check whether a given article is bookmarked
 *  - toggle(article): add if not saved, remove if already saved
 *  - remove(id): explicit removal
 */
export function useSaved() {
  const [items, setItems] = useLocalState<SavedArticle[]>(
    STORAGE_KEYS.saved,
    []
  );

  const isSaved = useCallback(
    (id: string) => items.some((a) => a.id === id),
    [items]
  );

  const toggle = useCallback(
    (article: ArticleCardData) => {
      setItems((prev) => {
        if (prev.some((a) => a.id === article.id)) {
          return prev.filter((a) => a.id !== article.id);
        }
        const entry: SavedArticle = {
          id: article.id,
          title: article.title,
          url: article.url,
          description: article.description,
          section_key: article.section_key,
          thumbnail_url: article.thumbnail_url,
          source_name: article.source_name,
          source_slug: article.source_slug,
          country_code: article.country_code,
          saved_at: new Date().toISOString(),
        };
        return [entry, ...prev];
      });
    },
    [setItems]
  );

  const remove = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((a) => a.id !== id));
    },
    [setItems]
  );

  return { items, isSaved, toggle, remove };
}

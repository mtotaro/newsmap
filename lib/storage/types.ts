/**
 * Shared types for client-side persisted state.
 *
 * All habit-loop features (saved articles, reading history, streak, weekly
 * counter) live in localStorage so they work for anonymous users with no
 * backend. Same schema is also used by `/saved` route — single source of truth.
 */

import type { SectionKey } from "@/lib/db/schema";

/** A bookmarked article — denormalised so /saved works without re-querying the DB */
export type SavedArticle = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  section_key: SectionKey;
  thumbnail_url: string | null;
  source_name: string;
  source_slug: string;
  country_code: string;
  /** ISO timestamp of when the user saved it */
  saved_at: string;
};

/** A recently-read article — capped at 20 entries, FIFO */
export type ReadEntry = {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  source_name: string;
  country_code: string;
  /** ISO timestamp of last interaction */
  read_at: string;
};

/** Streak counter — increments by 1 each calendar day, resets on a gap */
export type StreakState = {
  count: number;
  /** YYYY-MM-DD of the most recent visit that touched the counter */
  last_visit: string;
};

/** Articles read this ISO week (Mon→Sun); resets when week changes */
export type WeeklyCount = {
  count: number;
  /** YYYY-Www identifier of the current tracking window */
  week_id: string;
};

// ── localStorage keys (centralised so we never mistype them) ───────────────
export const STORAGE_KEYS = {
  saved:        "newsmap:saved",
  history:      "newsmap:history",
  streak:       "newsmap:streak",
  weekly_count: "newsmap:weekly_count",
} as const;

/** Max items kept in reading history (FIFO) */
export const HISTORY_MAX = 20;

/** Max items shown in the "Continúa leyendo" strip */
export const CONTINUE_READING_LIMIT = 5;

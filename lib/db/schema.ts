import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  uuid,
  integer,
  jsonb,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const regionEnum = pgEnum("region", [
  "latam",
  "north_america",
  "europe",
  "asia",
  "africa",
]);

export const sectionKeyEnum = pgEnum("section_key", [
  "sports",
  "politics",
  "economy",
  "tech",
  "culture",
  "world",
  "health",
  "science",
  "entertainment",
]);

export const imageStrategyEnum = pgEnum("image_strategy", [
  "media_thumbnail",
  "media_content",
  "enclosure",
  "og_image",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "pending",
  "processing",
  "done",
  "failed",
]);

// ─── sources ─────────────────────────────────────────────────────────────────

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  country_code: text("country_code").notNull(),
  region: regionEnum("region").notNull(),
  url: text("url").notNull(),
  /** Array of { section_key: string, url: string, is_active?: boolean } */
  feeds: jsonb("feeds").notNull().$type<FeedEntry[]>().default([]),
  is_active: boolean("is_active").notNull().default(true),
  needs_user_agent: boolean("needs_user_agent").notNull().default(false),
  image_strategy: imageStrategyEnum("image_strategy")
    .notNull()
    .default("og_image"),
  logo_url: text("logo_url"),
  created_at: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── articles ─────────────────────────────────────────────────────────────────

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    source_id: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    guid: text("guid").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    content_html: text("content_html"),
    section_key: sectionKeyEnum("section_key").notNull().default("world"),
    thumbnail_url: text("thumbnail_url"),
    /**
     * Story-clustering key. Articles sharing the same value cover the same
     * underlying news story across multiple publishers ("Cobertura completa").
     * NULL = singleton (not part of any multi-source cluster).
     *
     * Assigned by inngest/functions/cluster-articles.ts every 5 minutes over
     * the last 12-hour window. Uses Jaccard similarity on tokenized titles.
     */
    cluster_key: text("cluster_key"),
    published_at: timestamp("published_at", { withTimezone: true }).notNull(),
    fetched_at: timestamp("fetched_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("articles_source_guid_unique").on(t.source_id, t.guid),
    index("articles_source_published_idx").on(t.source_id, t.published_at),
    index("articles_published_idx").on(t.published_at),
    index("articles_section_idx").on(t.section_key, t.published_at),
    index("articles_cluster_idx").on(t.cluster_key, t.published_at),
  ]
);

// ─── user_subscriptions ───────────────────────────────────────────────────────

export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull(),
    source_id: uuid("source_id")
      .notNull()
      .references(() => sources.id, { onDelete: "cascade" }),
    /**
     * NULL  = subscribed to ALL sections from this source.
     * Array = only these section_key values (e.g. ['politics', 'economy']).
     * An empty array is semantically invalid; treat as NULL on write.
     */
    section_keys: text("section_keys").array(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("subscriptions_user_source_unique").on(t.user_id, t.source_id),
    index("subscriptions_user_idx").on(t.user_id),
  ]
);

// ─── og_image_jobs ────────────────────────────────────────────────────────────

export const ogImageJobs = pgTable(
  "og_image_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    article_id: uuid("article_id")
      .notNull()
      .unique()
      .references(() => articles.id, { onDelete: "cascade" }),
    status: jobStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    processed_at: timestamp("processed_at", { withTimezone: true }),
  },
  (t) => [index("og_jobs_status_idx").on(t.status)]
);

// ─── user_profiles ────────────────────────────────────────────────────────────
//
// Extends Supabase auth.users with app-specific preferences.
// One row per user, created on first settings access or digest opt-in.

export const userProfiles = pgTable(
  "user_profiles",
  {
    /** Matches auth.users.id */
    user_id: uuid("user_id").primaryKey(),
    /** Whether the user has opted in to the daily digest email. */
    digest_enabled: boolean("digest_enabled").notNull().default(false),
    /** Preferred UTC hour (0–23) for the digest email. Default: 7 AM UTC. */
    digest_hour: integer("digest_hour").notNull().default(7),
    /** Opaque token for one-click unsubscribe (no login required). */
    digest_unsubscribe_token: text("digest_unsubscribe_token").unique(),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [check("digest_hour_range", sql`${t.digest_hour} >= 0 AND ${t.digest_hour} <= 23`)]
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedEntry = {
  section_key: string;
  url: string;
  is_active?: boolean;
};

// Derived from sectionKeyEnum — single source of truth, no manual duplication
export type SectionKey = (typeof sectionKeyEnum.enumValues)[number];

// Convenience type aliases for Drizzle row shapes
export type Source = typeof sources.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type OgImageJob = typeof ogImageJobs.$inferSelect;

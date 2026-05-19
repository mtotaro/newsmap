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
} from "drizzle-orm/pg-core";

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
    section_key: sectionKeyEnum("section_key").notNull().default("world"),
    thumbnail_url: text("thumbnail_url"),
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

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedEntry = {
  section_key: string;
  url: string;
  is_active?: boolean;
};

export type SectionKey =
  | "sports"
  | "politics"
  | "economy"
  | "tech"
  | "culture"
  | "world"
  | "health"
  | "science"
  | "entertainment";

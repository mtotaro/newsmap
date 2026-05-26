-- Migration: story clustering
--
-- Adds a single text column `cluster_key` to the articles table plus a
-- composite index for the common query "fetch articles in this cluster
-- ordered by recency". Cluster assignment is done by the inngest job
-- `cluster-articles` running every 5 minutes.

--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "cluster_key" text;
--> statement-breakpoint
CREATE INDEX "articles_cluster_idx" ON "articles" ("cluster_key", "published_at");

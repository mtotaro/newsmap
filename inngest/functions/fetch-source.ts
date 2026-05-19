import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { sources, articles, ogImageJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseFeed } from "@/lib/rss/parser";

export const fetchSource = inngest.createFunction(
  {
    id: "fetch-source",
    name: "Fetch and parse RSS source",
    triggers: [{ event: "newsmap/source.fetch" }],
    throttle: {
      limit: 1,
      period: "14m",
      key: "event.data.source_id",
    },
    retries: 2,
  },
  async ({ event, step }) => {
    const { source_id } = event.data as { source_id: string };

    const source = await step.run("load-source", async () => {
      const [s] = await db
        .select()
        .from(sources)
        .where(eq(sources.id, source_id));
      return s ?? null;
    });

    if (!source || !source.is_active) return { skipped: true };

    const parsed = await step.run("fetch-and-parse", async () => {
      // source.created_at is serialized as string by Inngest; parseFeed only uses id/feeds/needs_user_agent
      return parseFeed(source as Parameters<typeof parseFeed>[0]);
    });

    if (!parsed.length) return { fetched: 0, inserted: 0 };

    const insertResult = await step.run("upsert-articles", async () => {
      return db
        .insert(articles)
        .values(
          // Re-hydrate Date from Inngest's JSON serialization (string → Date)
          parsed.map((a) => ({ ...a, published_at: new Date(a.published_at) }))
        )
        .onConflictDoNothing({ target: [articles.source_id, articles.guid] })
        .returning({ id: articles.id, thumbnail_url: articles.thumbnail_url, guid: articles.guid });
    });

    // Queue og:image jobs for articles inserted without a thumbnail
    const noThumb = insertResult.filter((r) => !r.thumbnail_url);
    if (noThumb.length) {
      await step.run("queue-og-image-jobs", async () => {
        await db
          .insert(ogImageJobs)
          .values(noThumb.map((r) => ({ article_id: r.id })))
          .onConflictDoNothing({ target: [ogImageJobs.article_id] });
      });

      // Correlate inserted rows back to parsed entries by guid so each article
      // gets its own URL (not the first article that happened to lack a thumbnail)
      const parsedByGuid = new Map(parsed.map((a) => [a.guid, a]));
      const parsedById = new Map(
        insertResult.map((r) => [r.id, parsedByGuid.get(r.guid) ?? null])
      );

      await step.sendEvent(
        "og-image-jobs",
        noThumb
          .map((r) => {
            const article = parsedById.get(r.id);
            const url = article?.url ?? "";
            return {
              name: "newsmap/article.og-image" as const,
              data: { article_id: r.id, article_url: url },
            };
          })
          .filter((e) => e.data.article_url)
      );
    }

    return { fetched: parsed.length, inserted: insertResult.length };
  }
);

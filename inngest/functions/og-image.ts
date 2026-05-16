import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { articles, ogImageJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const resolveOgImage = inngest.createFunction(
  {
    id: "resolve-og-image",
    name: "Resolve og:image for articles without thumbnail",
    triggers: [{ event: "newsmap/article.og-image" }],
    throttle: {
      limit: 10,
      period: "1s",
    },
    retries: 1,
  },
  async ({ event, step }) => {
    const { article_id, article_url } = event.data as {
      article_id: string;
      article_url: string;
    };

    await step.run("mark-processing", async () => {
      await db
        .update(ogImageJobs)
        .set({ status: "processing" })
        .where(eq(ogImageJobs.article_id, article_id));
    });

    const ogImageUrl = await step.run("fetch-og-image", async () => {
      return fetchOgImageUrl(article_url);
    });

    await step.run("save-result", async () => {
      if (ogImageUrl) {
        await db
          .update(articles)
          .set({ thumbnail_url: ogImageUrl })
          .where(eq(articles.id, article_id));
      }

      await db
        .update(ogImageJobs)
        .set({
          status: ogImageUrl ? "done" : "failed",
          attempts: 1,
          processed_at: new Date(),
        })
        .where(eq(ogImageJobs.article_id, article_id));
    });

    return { article_id, resolved: !!ogImageUrl };
  }
);

async function fetchOgImageUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NewsMap/1.0; +contact@newsmap.app)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );

    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

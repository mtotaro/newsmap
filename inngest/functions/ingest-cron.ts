import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import { sources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const ingestCron = inngest.createFunction(
  {
    id: "ingest-cron",
    name: "Ingest Cron — fan-out all active sources",
    triggers: [{ cron: "TZ=UTC */15 * * * *" }],
  },
  async ({ step }) => {
    const activeSources = await step.run("get-active-sources", async () => {
      return db
        .select({ id: sources.id, slug: sources.slug })
        .from(sources)
        .where(eq(sources.is_active, true));
    });

    if (!activeSources.length) return { fanned_out: 0 };

    await step.sendEvent(
      "fan-out-sources",
      activeSources.map((s) => ({
        name: "newsmap/source.fetch" as const,
        data: { source_id: s.id, source_slug: s.slug },
      }))
    );

    return { fanned_out: activeSources.length };
  }
);

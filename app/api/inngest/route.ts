import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { ingestCron } from "@/inngest/functions/ingest-cron";
import { fetchSource } from "@/inngest/functions/fetch-source";
import { resolveOgImage } from "@/inngest/functions/og-image";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [ingestCron, fetchSource, resolveOgImage],
});

/**
 * Daily digest cron — runs every hour, sends digest emails to opted-in users
 * whose preferred digest_hour matches the current UTC hour.
 *
 * Flow:
 *  1. Get the current UTC hour.
 *  2. Query user_profiles WHERE digest_enabled = true AND digest_hour = currentHour.
 *  3. For each user, fetch their top 10 articles from subscriptions in the last 24h.
 *  4. If ≥1 article found, send via Resend.
 *  5. Skip users with no subscriptions or no articles.
 */

import { Resend } from "resend";
import { inngest } from "@/inngest/client";
import { db } from "@/lib/db";
import {
  userProfiles,
  userSubscriptions,
  articles,
  sources,
} from "@/lib/db/schema";
import {
  eq,
  and,
  gte,
  inArray,
  desc,
  getTableColumns,
  isNotNull,
} from "drizzle-orm";
import { buildDigestEmail } from "@/lib/email/digest-template";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://newsmap.app";
const FROM_EMAIL = "NewsMap <digest@newsmap.app>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[digest-cron] RESEND_API_KEY not set — skipping email send");
    return null;
  }
  return new Resend(key);
}

export const digestCron = inngest.createFunction(
  {
    id: "digest-cron",
    name: "Daily Digest — send personalized email digests",
    triggers: [{ cron: "TZ=UTC 0 * * * *" }], // every hour at :00
    concurrency: { limit: 5 },
  },
  async ({ step, logger }) => {
    const currentHour = new Date().getUTCHours();

    // ── Step 1: find opted-in users for this hour ──────────────────────────
    const profiles = await step.run("get-opted-in-users", async () => {
      return db
        .select({
          user_id: userProfiles.user_id,
          digest_unsubscribe_token: userProfiles.digest_unsubscribe_token,
        })
        .from(userProfiles)
        .where(
          and(
            eq(userProfiles.digest_enabled, true),
            eq(userProfiles.digest_hour, currentHour),
            isNotNull(userProfiles.digest_unsubscribe_token)
          )
        );
    });

    if (!profiles.length) {
      logger.info(`[digest-cron] hour=${currentHour}: no opted-in users`);
      return { hour: currentHour, sent: 0, skipped: 0 };
    }

    logger.info(
      `[digest-cron] hour=${currentHour}: processing ${profiles.length} users`
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const resend = getResend();
    let sent = 0;
    let skipped = 0;

    // ── Step 2: for each user, build and send digest ───────────────────────
    for (const profile of profiles) {
      const result = await step.run(
        `send-digest-${profile.user_id}`,
        async () => {
          // Get this user's subscribed source IDs
          const subs = await db
            .select({ source_id: userSubscriptions.source_id })
            .from(userSubscriptions)
            .where(eq(userSubscriptions.user_id, profile.user_id));

          if (!subs.length) return { status: "no_subs" };

          const sourceIds = subs.map((s) => s.source_id);

          // Get top 10 articles from those sources in last 24h
          const cols = getTableColumns(articles);
          const digestArticles = await db
            .select({
              ...cols,
              source_name: sources.name,
            })
            .from(articles)
            .innerJoin(sources, eq(sources.id, articles.source_id))
            .where(
              and(
                inArray(articles.source_id, sourceIds),
                gte(articles.published_at, since)
              )
            )
            .orderBy(desc(articles.published_at))
            .limit(10);

          if (!digestArticles.length) return { status: "no_articles" };

          // Get user email from Supabase (stored in auth.users, not accessible
          // via Drizzle — use the Supabase Admin client)
          const { createClient } = await import("@supabase/supabase-js");
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
            profile.user_id
          );
          const email = userData?.user?.email;
          if (!email) return { status: "no_email" };

          const unsubToken = profile.digest_unsubscribe_token!;
          const unsubscribeUrl = `${APP_URL}/api/unsubscribe?token=${unsubToken}`;

          // Determine locale from user metadata (default es)
          const locale =
            (userData.user?.user_metadata?.locale as "es" | "en") ?? "es";

          const { subject, html } = buildDigestEmail({
            articles: digestArticles.map((a) => ({
              title: a.title,
              description: a.description,
              url: a.url,
              thumbnail_url: a.thumbnail_url,
              source_name: a.source_name,
              published_at: a.published_at,
              section_key: a.section_key,
            })),
            unsubscribeUrl,
            locale,
            date: new Date(),
            appUrl: APP_URL,
          });

          if (!resend) {
            // Dev/staging: log instead of send
            logger.info(
              `[digest-cron] would send to ${email}: "${subject}" (${digestArticles.length} articles)`
            );
            return { status: "dry_run" };
          }

          const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject,
            html,
            headers: {
              "List-Unsubscribe": `<${unsubscribeUrl}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });

          if (error) {
            logger.error(`[digest-cron] Resend error for ${email}:`, error);
            return { status: "error", error: error.message };
          }

          return { status: "sent" };
        }
      );

      if (result.status === "sent" || result.status === "dry_run") sent++;
      else skipped++;
    }

    return { hour: currentHour, sent, skipped };
  }
);

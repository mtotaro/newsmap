/**
 * Feed encoding + reachability test.
 * Tests all NEEDS_VERIFICATION sources plus a few confirmed ones as baseline.
 *
 * Usage:  npm run test:feeds
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { parseFeed } from "./parser";
import { SOURCES, NEEDS_VERIFICATION } from "../db/seed";
import type { FeedEntry } from "../db/schema";

// Run NEEDS_VERIFICATION first, then a baseline sample of confirmed sources
const BASELINE = new Set(["BBC News", "El País", "BBC Mundo"]);

const toTest = [
  ...SOURCES.filter((s) => NEEDS_VERIFICATION.has(s.name)),
  ...SOURCES.filter((s) => BASELINE.has(s.name)),
];

type Result = {
  name: string;
  country: string;
  status: "ok" | "fail";
  articles?: number;
  sample?: string;
  unicodeTitles?: string[];
  error?: string;
  feedsTested?: number;
  feedsFailed?: number;
};

async function testSource(name: string, countryCode: string, feedSections: Array<{ key: string; url: string }>) {
  const source = {
    id: name,
    feeds: feedSections.map(
      (f): FeedEntry => ({ section_key: f.key, url: f.url, is_active: true })
    ),
    needs_user_agent: false,
  };

  const articles = await parseFeed(source);

  // Check for non-ASCII chars (encoding working correctly)
  const unicodeTitles = articles
    .filter((a) => /[^\x20-\x7E]/.test(a.title))
    .slice(0, 3)
    .map((a) => a.title);

  return {
    articles: articles.length,
    sample: articles[0]?.title ?? "(no articles)",
    unicodeTitles,
  };
}

async function main() {
  console.log(`\nNewsMap Feed Test — ${new Date().toISOString()}\n`);
  console.log(`Testing ${toTest.length} sources...\n`);

  const results: Result[] = [];

  for (const source of toTest) {
    const tag = NEEDS_VERIFICATION.has(source.name) ? "⏸ VERIFY" : "✓ BASELINE";
    process.stdout.write(`[${tag}] ${source.name} (${source.countryCode})... `);

    try {
      const info = await testSource(source.name, source.countryCode, source.feedSections);
      const r: Result = {
        name: source.name,
        country: source.countryCode,
        status: "ok",
        ...info,
        feedsTested: source.feedSections.length,
        feedsFailed: 0,
      };
      results.push(r);
      console.log(`✓ ${info.articles} articles`);
      if (info.unicodeTitles.length > 0) {
        console.log(`   Unicode OK: "${info.unicodeTitles[0]}"`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({
        name: source.name,
        country: source.countryCode,
        status: "fail",
        error: message,
      });
      console.log(`✗ ${message}`);
    }
  }

  // Summary
  const ok = results.filter((r) => r.status === "ok").length;
  const fail = results.filter((r) => r.status === "fail").length;
  console.log(`\n──────────────────────────────────────────`);
  console.log(`Passed: ${ok}  Failed: ${fail}  Total: ${results.length}`);

  if (fail > 0) {
    console.log("\nFailed sources:");
    results
      .filter((r) => r.status === "fail")
      .forEach((r) => console.log(`  ✗ ${r.name} (${r.country}): ${r.error}`));
  }

  const verifyResults = results.filter(
    (r) => NEEDS_VERIFICATION.has(r.name) && r.status === "ok"
  );
  if (verifyResults.length > 0) {
    console.log(
      "\nSources ready to activate (set is_active=true via db:studio or SQL):"
    );
    verifyResults.forEach((r) =>
      console.log(`  ✓ ${r.name}: ${r.articles} articles`)
    );
  }

  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

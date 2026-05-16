# /db-status

Show a quick health snapshot of the database: row counts, recent ingestion activity, and any anomalies.

## What this skill does

Runs a set of diagnostic queries via Drizzle and prints a formatted summary.

## Usage

```
/db-status
/db-status --verbose    ← include per-source article counts
```

## Instructions for Claude

When the user runs `/db-status`:

1. Connect to the database using the Drizzle client from `lib/db/index.ts`.

2. Run these queries in parallel (spawn a sub-agent or use Promise.all):

   ```sql
   -- Total counts
   SELECT COUNT(*) FROM sources WHERE is_active = true;
   SELECT COUNT(*) FROM articles;
   SELECT COUNT(*) FROM user_subscriptions;
   SELECT COUNT(DISTINCT user_id) FROM user_subscriptions;

   -- Recent ingestion (last hour)
   SELECT COUNT(*) FROM articles WHERE created_at > NOW() - INTERVAL '1 hour';

   -- Sources not fetched in 30+ minutes (stale)
   SELECT name, last_fetched_at FROM sources
   WHERE is_active = true
     AND (last_fetched_at IS NULL OR last_fetched_at < NOW() - INTERVAL '30 minutes')
   ORDER BY last_fetched_at ASC NULLS FIRST;

   -- Articles missing thumbnails (og_fetch_status pending)
   SELECT COUNT(*) FROM articles WHERE og_fetch_status = 'pending';

   -- Articles by section
   SELECT section_key, COUNT(*) as count FROM articles
   GROUP BY section_key ORDER BY count DESC;
   ```

3. Print a formatted report:
   ```
   NewsMap DB Status — 2026-05-16 14:30 UTC
   ─────────────────────────────────────────
   Sources (active):     35
   Articles (total):     12,847
   Articles (last 1h):   234
   Subscriptions:        891 (across 103 users)

   ⚠️  Stale sources (not fetched in 30m):
      - Reforma (MX) — last fetch: 2h ago
      - El Comercio (PE) — never fetched

   Articles pending og:image:  47

   Top sections:
     sports:    3,201
     politics:  2,890
     world:     2,100
     economy:   1,450
     ...
   ```

4. If `--verbose`, also print per-source article counts for the last 24h.

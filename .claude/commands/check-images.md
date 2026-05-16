# /check-images

Test that Next.js Image Optimization can proxy thumbnails from all active source domains.
Detects domains that block the Next.js image optimizer and need the Edge Function proxy instead.

## What this skill does

1. Reads `next.config.ts` to get the current `remotePatterns` list
2. Picks one recent thumbnail URL per source from the `articles` DB table
3. Spawns parallel sub-agents (one per region) to test each image URL
4. Reports which domains work natively and which need the proxy route
5. Suggests `remotePatterns` additions for any domains not yet whitelisted

## Usage

```
/check-images
/check-images --source "Infobae"
/check-images --fix      ← auto-add missing domains to remotePatterns
```

## Instructions for Claude

When the user runs `/check-images`:

1. Read `next.config.ts` to get the current whitelisted `remotePatterns`.

2. Query the DB for one recent thumbnail URL per active source:
   ```sql
   SELECT DISTINCT ON (source_id) source_id, thumbnail_url
   FROM articles
   WHERE thumbnail_url IS NOT NULL
   ORDER BY source_id, published_at DESC;
   ```

3. Group URLs by hostname and spawn parallel sub-agents (one per region):
   Each agent:
   - Makes a HEAD request to the image URL with `User-Agent: NewsMap/1.0`
   - Makes a second HEAD request simulating Next.js Image Optimizer referer
   - Reports: hostname | direct_ok | next_proxy_ok | status_code | notes

4. Collect results and print:
   ```
   Image proxy check
   ──────────────────────────────────────────────
   Domain                    | Direct | Next/image | Action
   ichef.bbci.co.uk          | ✅ 200 | ✅ 200     | OK
   img.infobae.com           | ✅ 200 | ✅ 200     | OK
   somecdn.example.com       | ✅ 200 | ❌ 403     | → needs Edge proxy
   notinpatterns.com         | ✅ 200 | ✅ 200     | ⚠️  not in remotePatterns
   ```

5. If `--fix` was given:
   - Add missing domains to `next.config.ts` `remotePatterns`
   - For domains that need the Edge proxy: note them in a comment in `next.config.ts`
   - Show diff before writing

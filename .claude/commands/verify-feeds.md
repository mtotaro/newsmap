# /verify-feeds

Verify that all RSS feed URLs in the sources seed are reachable and have expected content.
Uses parallel sub-agents — one per region — to check all feeds concurrently.

## What this skill does

1. Reads all source entries from `lib/db/seed.ts`
2. Splits sources into regional batches
3. Spawns one sub-agent per region (parallel)
4. Each sub-agent fetches every feed URL in its batch and reports:
   - HTTP status code
   - Whether `<media:thumbnail>` is present in the first item
   - Whether `<description>` is plain text or HTML
   - Detected encoding
   - Any errors (timeout, 403, 404, redirect loop)
5. Collects and merges all results
6. Prints a summary table: ✅ OK | ⚠️ No thumbnail | ❌ Failed

## Usage

```
/verify-feeds
/verify-feeds --region latam
/verify-feeds --source "Infobae"
```

## Instructions for Claude

When the user runs `/verify-feeds`:

1. Read `lib/db/seed.ts` to get the full list of sources and their feed URLs.

2. Group sources by region: `latam`, `north_america`, `europe`.

3. Spawn one sub-agent per region with this prompt template:
   ```
   You are verifying RSS feeds for the NewsMap project.
   For each feed URL below, make an HTTP GET request with:
     User-Agent: NewsMap/1.0 (contact@newsmap.app; feed-verifier)
     Accept: application/rss+xml, application/xml, text/xml
   
   Report for each:
   - name: source name
   - url: feed URL tested
   - status: HTTP status code (or "timeout" / "error")
   - has_thumbnail: true if first item has media:thumbnail or media:content medium="image"
   - description_type: "text" | "html" | "empty"
   - encoding: XML encoding declaration or "none"
   - error: error message if failed, null otherwise
   
   Sources to verify:
   [list of { name, url } objects from this region]
   
   Return a JSON array of results.
   ```

4. Wait for all sub-agents to complete, then merge results.

5. Print a formatted table:
   ```
   Source          | Region  | Status | Thumbnail | Notes
   ----------------|---------|--------|-----------|------
   Infobae         | latam   | ✅ 200 | ✅ yes    |
   Reforma         | latam   | ❌ 403 | —         | Blocked
   BBC News        | europe  | ✅ 200 | ✅ yes    |
   ...
   ```

6. Print summary counts: X feeds OK, Y missing thumbnails, Z failed.

7. If any feeds failed, suggest fixes (alternative URL patterns to try).

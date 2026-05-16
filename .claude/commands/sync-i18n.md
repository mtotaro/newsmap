# /sync-i18n

Check that `messages/es.json` and `messages/en.json` have the same keys.
Reports missing, extra, or mismatched keys between the two files.

## What this skill does

1. Reads both `messages/es.json` and `messages/en.json`
2. Flattens nested keys (e.g. `feed.new_articles`)
3. Reports:
   - Keys in ES but missing in EN
   - Keys in EN but missing in ES
   - Keys present in both (count only)
4. Optionally auto-fills missing EN keys using Claude translation

## Usage

```
/sync-i18n              ← report only
/sync-i18n --fix        ← auto-translate missing EN keys (confirm before writing)
```

## Instructions for Claude

When the user runs `/sync-i18n`:

1. Read `messages/es.json` and `messages/en.json`.

2. Recursively flatten both objects to dot-notation keys:
   ```
   { "feed": { "loading": "..." } } → { "feed.loading": "..." }
   ```

3. Compare key sets:
   - `onlyInEs` = keys in ES not in EN
   - `onlyInEn` = keys in EN not in ES
   - `inBoth` = intersection

4. Print report:
   ```
   i18n sync report
   ✅ 47 keys in sync
   ❌ 3 keys in es.json missing from en.json:
      - onboarding.profile_latam
      - feed.empty_desc
      - errors.source_unavailable
   ⚠️  1 key in en.json missing from es.json:
      - nav.upgrade
   ```

5. If `--fix` flag was given:
   - For each key only in ES: translate the Spanish value to English
   - Show a preview of all proposed translations
   - Ask for confirmation before writing to `en.json`
   - For each key only in EN: ask if it should be added to ES or removed from EN

6. Never remove existing keys without explicit confirmation.

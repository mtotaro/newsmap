# /add-source

Interactively add a new news source to the NewsMap seed. Validates the feed before inserting.

## What this skill does

1. Prompts for source details (or accepts them as arguments)
2. Fetches the RSS URL to validate it's working
3. Detects available sections and suggests section_key mappings
4. Updates `lib/db/seed.ts` with the new source entry
5. Updates `next.config.ts` remotePatterns with the thumbnail domain
6. Runs `/verify-feeds --source <name>` to confirm everything works

## Usage

```
/add-source
/add-source --name "El País" --country ES --url "https://feeds.elpais.com/mrss-s/..."
```

## Instructions for Claude

When the user runs `/add-source`:

1. If arguments were not provided, ask the user for:
   - Source name
   - Country (2-letter ISO code)
   - Region (latam | north_america | europe | asia | africa)
   - Language (es | en | pt | fr | de | it | other)
   - Website URL
   - Logo URL (or say "I'll find it")
   - RSS feed URL(s) — can be multiple for different sections

2. Fetch the RSS URL to validate:
   - Must return HTTP 200
   - Must parse as valid RSS/Atom/JSON Feed
   - Extract thumbnail domain(s) from first 5 items

3. Suggest section_key mapping based on feed content/section names.
   Valid keys: sports | politics | economy | tech | culture | world | health | science | entertainment

4. Show the user a preview of what will be added:
   ```typescript
   {
     name: 'El País',
     countryCode: 'ES',
     region: 'europe',
     language: 'es',
     logoUrl: 'https://...',
     websiteUrl: 'https://elpais.com',
     feedSections: [
       { key: 'world', url: 'https://...', labelEs: 'Internacional', labelEn: 'World' },
       { key: 'politics', url: 'https://...', labelEs: 'Política', labelEn: 'Politics' },
     ],
   }
   ```

5. Ask for confirmation before modifying any files.

6. On confirmation:
   - Add the entry to `lib/db/seed.ts` in the correct region group
   - Extract thumbnail hostname and add to `remotePatterns` in `next.config.ts`
   - Run a quick fetch verification and report the result

7. Remind the user to run `npm run db:seed` to apply to the database.

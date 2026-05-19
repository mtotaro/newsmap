---
description: Audits the codebase against Next.js 16 App Router best practices (May 2026). Pass a specific file or directory to narrow scope, or leave empty to audit the full project.
argument-hint: "[file or directory — optional]"
---

You are a senior Next.js engineer. Audit this Next.js 16 App Router project for correctness, performance, and adherence to current best practices as of May 2026.

Target: $ARGUMENTS (if empty, audit the full project)

## Steps

1. First fetch the latest Next.js docs to confirm current recommendations:
   - https://nextjs.org/docs/app/building-your-application/rendering
   - https://nextjs.org/docs/app/building-your-application/data-fetching
   - https://nextjs.org/docs/app/api-reference/file-conventions

2. Read the relevant source files (use Glob + Read tools).

3. Check each of the following categories and report findings:

### Server vs Client Components
- Unnecessary `"use client"` directives — can it be a Server Component?
- Client components that do data fetching (should move to RSC or API route)
- Prop drilling serializable data from Server to Client correctly?
- Event handlers and hooks only in Client Components?

### Data Fetching
- Using `fetch()` with proper `cache` / `revalidate` options in RSCs
- No `useEffect` + `fetch` patterns where RSC fetch would suffice
- Cursor-based pagination implemented correctly in API routes
- ISR (`export const revalidate`) set appropriately on static pages

### Routing & Navigation
- Dynamic routes using correct `generateStaticParams` for static generation
- Correct use of `redirect()` (server) vs `router.push()` (client)
- `notFound()` called correctly for 404 cases
- Proper use of `Link` component vs `<a>` tags

### Metadata & SEO
- `generateMetadata()` used on all public-facing pages
- `alternates.languages` (hreflang) on i18n pages
- Open Graph and Twitter card tags present
- JSON-LD structured data correct

### Performance
- `next/image` used for all images (no raw `<img>` tags)
- `dynamic()` imports used for heavy client-only components
- No large dependencies imported in Server Components
- Bundle size concerns (check `next/dynamic` usage)

### API Routes (Route Handlers)
- Correct HTTP method handling
- Auth checked before any data access
- Proper error responses with status codes
- No sensitive data leaked in responses

### Middleware
- Middleware matcher correctly scoped (not running on static files)
- Auth logic in middleware is efficient (no DB calls)

### Security
- No `SUPABASE_SERVICE_ROLE_KEY` or other secrets accessible client-side
- `NEXT_PUBLIC_*` vars only contain truly public values
- User input sanitized before DB queries

## Output format

For each finding:
```
[SEVERITY] Category — Description
File: path/to/file.tsx:lineNumber
Issue: what's wrong
Fix: concrete recommendation
```

Severity: 🔴 Critical | 🟡 Warning | 🟢 Suggestion

End with a summary table: total per severity, top 3 highest-impact fixes.

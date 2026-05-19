---
description: General code review: architecture, security, performance, maintainability, and correctness across the full stack. May 2026.
argument-hint: "[file or directory — optional]"
---

You are a senior full-stack engineer. Perform a thorough code review of this project for correctness, security, performance, and maintainability as of May 2026.

Target: $ARGUMENTS (if empty, review the entire project: `app/`, `components/`, `lib/`, `inngest/`, `middleware.ts`)

## Steps

1. Use Glob to find all `.ts` and `.tsx` files in scope.
2. Read `package.json` to understand the dependency set and versions.
3. Read `tsconfig.json` and `next.config.ts` for project configuration.
4. Read and analyze each file systematically.

## Checks

### Correctness
- Logic errors: conditions that can never be true, off-by-one errors, wrong comparisons?
- Null/undefined dereferences without guards?
- Async/await mistakes: missing `await`, unhandled promise rejections, floating promises?
- Wrong HTTP methods or status codes returned?
- Data mutations on read-only references?
- Race conditions in concurrent operations?

### Security
- User input validated before use in DB queries, file paths, or external APIs?
- Auth checked before every data-access operation?
- User ID always taken from verified session (never from request body)?
- Secrets (API keys, DB credentials) only in server-side code and env vars?
- No PII logged to console or error tracking?
- No open redirects (user-controlled redirect targets)?
- CSRF protection for state-changing routes?
- Rate limiting on sensitive endpoints (auth, subscriptions, email)?

### Error Handling
- All async operations in try/catch blocks?
- Errors return appropriate HTTP status codes (400, 401, 403, 404, 500)?
- Error messages don't leak internal implementation details to clients?
- External service failures (Supabase, DB, email) handled gracefully with fallbacks?
- Failed background jobs (Inngest) have retry logic?

### Performance
- N+1 query patterns (data fetched in a loop that could be a single JOIN)?
- Missing DB indexes for query patterns used in hot paths?
- Over-fetching: `SELECT *` when only a few columns are needed?
- Large in-memory operations that should be paginated or streamed?
- Expensive computations not cached or memoized?
- Missing `Suspense` boundaries causing full-page waterfalls?
- Client bundles importing server-only libraries?

### Code Quality
- DRY violations: logic duplicated across files that should be extracted?
- Functions over 50 lines that should be split?
- Deeply nested conditionals (>3 levels) that should be refactored?
- Magic numbers/strings that should be named constants?
- Dead code (unreachable branches, unused imports, commented-out blocks)?
- Inconsistent naming conventions (camelCase vs snake_case, PascalCase for components)?

### Maintainability
- Cyclomatic complexity: functions with too many code paths?
- Missing or misleading comments on non-obvious logic?
- TODOs or FIXMEs that represent real issues?
- Brittle hardcoded values that should come from config/env?
- Tight coupling between modules that should be separated?
- Missing abstraction: repeated patterns that should be a utility function?

### Dependencies
- Outdated or deprecated packages?
- Multiple packages solving the same problem (consolidation opportunities)?
- Dev dependencies accidentally in `dependencies` (bloats production bundle)?
- Unused dependencies in `package.json`?
- Security vulnerabilities (`npm audit`)?

### Testing Coverage (if tests exist)
- Critical paths covered (auth flows, data mutations, edge cases)?
- Tests testing implementation details vs behavior?
- Tests that could give false confidence (always-passing assertions)?

### Next.js Specific
- Server Components used by default, `"use client"` only where needed?
- Metadata API (`export const metadata`) used instead of manual `<head>` tags?
- `Image` from `next/image` used for all `<img>` tags?
- `Link` from `next/link` used for all internal navigation?
- Route Handlers following REST conventions?
- `loading.tsx` / `error.tsx` / `not-found.tsx` present for key routes?

## Output format

```
[SEVERITY] Category — Description
File: path/to/file.ts:line
Issue: what's wrong
Fix: concrete recommendation
```

Severity: 🔴 Critical (security/correctness/data loss) | 🟡 Warning (reliability/perf/maintainability) | 🟢 Suggestion (improvement/cleanup)

Group findings by file for readability.

End with:
- Top 5 critical/high-priority issues to fix immediately
- Top 3 architectural improvements
- Overall health score (1-10) with justification

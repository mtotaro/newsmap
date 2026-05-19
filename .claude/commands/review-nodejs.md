---
description: Audits Node.js / serverless API route patterns for security, error handling, performance, and best practices (May 2026). Pass a file/directory to narrow scope.
argument-hint: "[file or directory — optional]"
---

You are a Node.js and serverless backend expert. Audit this project's API routes and server-side code for security, reliability, and performance as of Node.js 22 / May 2026.

Target: $ARGUMENTS (if empty, audit `app/api/`, `inngest/`, `lib/`, and `middleware.ts`)

## Steps

1. Use Glob to find all route handlers (`app/api/**/route.ts`) and server-side files.
2. Read and analyze each file.

## Checks

### Security
- Auth verified before any data access in every route handler?
- User ID taken from verified session (not from request body/params)?
- Input validation before DB queries (type checks, range checks)?
- SQL injection risk — parameterized queries used (Drizzle should handle this, verify)?
- No secrets (`SERVICE_ROLE_KEY`, `DATABASE_URL`) exposed in client-accessible code?
- CORS headers set correctly if needed?
- Rate limiting applied to sensitive endpoints (auth, subscriptions)?

### Error Handling
- All async operations wrapped in try/catch?
- Errors return appropriate HTTP status codes (400 vs 401 vs 403 vs 500)?
- Error messages don't leak internal details (stack traces, DB errors) to client?
- Inngest functions have proper error handling and retry logic?

### Input Validation
- Request body parsed and validated before use?
- Type coercion done safely (e.g., `Number()` on user input)?
- Array inputs bounded (no unbounded `inArray` with user-controlled arrays)?

### Performance
- N+1 query patterns (loading related data in a loop instead of a JOIN)?
- Missing database indexes for common query patterns?
- Response sizes appropriate (not over-fetching columns)?
- Inngest fan-out events sent in a single `step.sendEvent()` batch?
- Redis used correctly for caching/deduplication?

### Serverless-Specific (Vercel Edge/Serverless)
- Cold start considerations — heavy imports at module level?
- Database connections pooled correctly (Supabase Transaction Pooler, port 6543)?
- Function timeouts — long-running operations moved to Inngest?
- Environment variables accessed at runtime (not bundled)?

### Inngest Jobs
- Steps (`step.run()`) used for each logical unit of work (enables retries)?
- Idempotency — re-running a job has no harmful side effects?
- `step.sendEvent()` used for fan-out instead of `Promise.all(fetch(...))`?
- Concurrency limits set appropriately?
- Sensitive data not logged?

### API Route Design
- RESTful conventions followed (GET = read, POST = create, PATCH = partial update, DELETE = remove)?
- Cursor-based pagination used (not offset) for large collections?
- Response shape consistent across routes?

### Middleware
- Supabase session refresh happening in middleware correctly?
- Protected routes properly gated?
- Middleware not running on static assets (`_next/static`, favicons, etc.)?

## Output format

```
[SEVERITY] Category — Description
File: path/to/route.ts:line
Issue: what's wrong
Fix: concrete recommendation
```

Severity: 🔴 Critical (security/data loss) | 🟡 Warning (reliability/perf) | 🟢 Suggestion (improvement)

End with: security findings summary + top 3 reliability improvements.

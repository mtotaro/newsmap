---
description: Audits PostgreSQL schema design, indexes, query patterns, and performance. Checks Drizzle schema against DB best practices (May 2026).
argument-hint: "[file or directory — optional, defaults to lib/db/]"
---

You are a PostgreSQL expert. Audit this project's database schema, queries, and usage patterns for correctness, performance, and reliability as of PostgreSQL 17 / May 2026.

Target: $ARGUMENTS (if empty, audit `lib/db/schema.ts`, `lib/db/migrations/`, and all API routes)

## Steps

1. Read `lib/db/schema.ts` to understand the full schema.
2. Read all migration files in `lib/db/migrations/`.
3. Read all API routes (`app/api/**/route.ts`) and Inngest functions to find all queries.
4. Analyze patterns.

## Checks

### Schema Design
- Tables normalized appropriately (no repeated data that should be a foreign key)?
- Primary keys: UUIDs used consistently — `defaultRandom()` for all PKs?
- Foreign key constraints with correct `onDelete` behavior (`CASCADE`, `SET NULL`, `RESTRICT`)?
- `NOT NULL` constraints where values should always be present?
- Default values set for columns that have sensible defaults?
- `timestamp with time zone` used for all timestamps (not `timestamp` without zone)?
- Text fields that should have length limits?
- JSONB used appropriately (not overused as a schema escape hatch)?

### Indexes
- Every foreign key column has an index (critical for JOIN performance)?
- Columns used in `WHERE` clauses of frequent queries have indexes?
- Composite indexes for queries filtering on multiple columns?
- Existing indexes in schema: `articles_source_published_idx`, `articles_published_idx`, `articles_section_idx`, `subscriptions_user_idx` — are they sufficient for actual query patterns?
- Missing index for: `user_profiles.digest_hour` + `digest_enabled` (used in digest cron)?
- Unique constraints used where data should be unique (vs application-level checks)?

### Query Analysis
For each Drizzle query found in the codebase, verify:
- `SELECT *` avoided — only needed columns fetched?
- `WHERE` clauses use indexed columns?
- `ORDER BY` columns are indexed?
- `LIMIT` applied to all paginated queries?
- N+1 patterns: data loaded in loops that could be a single JOIN?
- Large `IN` clauses with user-controlled array sizes (unbounded)?

### Feed Query (Critical Path)
The main feed query in `app/api/feed/route.ts` fetches articles with:
- Multiple JOINs (articles → sources → user_subscriptions)?
- Cursor-based pagination via `published_at`?
- Section filter?
- Full-text search via `ilike`?

Check:
- Is `ilike` on `title` + `description` efficient, or should `pg_trgm` / `tsvector` be considered?
- Is the cursor index optimal for the sort order used?
- Can the subscription lookup be cached (Redis)?

### Migrations
- Migrations are additive (no destructive changes that lose data)?
- Migration files match the current schema state?
- `drizzle.__drizzle_migrations` table tracking applied migrations correctly?

### Connection & Pooling
- `DATABASE_URL` uses Transaction Pooler (port 6543) not Session Pooler (port 5432)?
- Connection created once (module-level singleton in `lib/db/index.ts`)?
- No connection leaks in serverless functions?

### Data Integrity
- Application-level uniqueness checks that should be DB constraints?
- `user_subscriptions` unique on `(user_id, source_id)` — enforced at DB level?
- `articles` unique on `(source_id, guid)` — enforced at DB level?

## Output format

```
[SEVERITY] Category — Description
Location: table/column or file:line
Issue: what's wrong
Fix: concrete SQL or Drizzle recommendation
```

Severity: 🔴 Critical (data loss/corruption risk) | 🟡 Warning (performance/integrity) | 🟢 Suggestion

End with: schema diagram summary + top 3 missing indexes + top 3 query optimizations.

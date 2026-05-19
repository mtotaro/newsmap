---
description: Audits Drizzle ORM schema definitions, query patterns, migrations, and type safety. May 2026.
argument-hint: "[file or directory — optional, defaults to lib/db/]"
---

You are a Drizzle ORM expert. Audit this project's Drizzle ORM usage for type safety, correct query patterns, migration hygiene, and performance as of Drizzle ORM v0.40+ / May 2026.

Target: $ARGUMENTS (if empty, audit `lib/db/schema.ts`, `lib/db/index.ts`, `lib/db/migrations/`, and all files that import from `lib/db/`)

## Steps

1. Fetch the latest Drizzle ORM docs:
   - https://orm.drizzle.team/docs/overview
   - https://orm.drizzle.team/docs/rls (Row-Level Security)
2. Read `lib/db/schema.ts` for full schema definition.
3. Read `lib/db/index.ts` for connection setup.
4. Read all files in `lib/db/migrations/`.
5. Grep for all `db.select`, `db.insert`, `db.update`, `db.delete` usages across the project.
6. Read all API routes and Inngest functions that perform DB queries.

## Checks

### Schema Definition
- `pgTable` used (not `mysqlTable` or `sqliteTable`) for PostgreSQL?
- Primary keys: `uuid().defaultRandom()` for all PKs?
- Foreign keys reference the correct column with proper `references(() => table.col)`?
- `onDelete` behavior set explicitly (`cascade`, `set null`, `restrict`) — no silent orphans?
- `timestamp({ withTimezone: true })` used for ALL timestamp columns (not bare `timestamp()`)?
- `notNull()` applied where the column should never be null?
- `default()` set for columns with sensible defaults (e.g., `defaultNow()` for `created_at`)?
- Enum types defined with `pgEnum` rather than string columns with application-level checks?
- JSONB columns typed with `.$type<MyInterface>()` for type safety?

### Inferred Types
- `typeof table.$inferSelect` used instead of manually duplicating type definitions?
- `typeof table.$inferInsert` used for insert payloads?
- No manual interface duplications that can drift from schema?
- Return types of query builder chains properly inferred (not cast with `as`)?

### Query Patterns
- `db.select().from(table).where(...)` — only needed columns selected (avoid `select()` with no fields = SELECT *)?
- `eq()`, `and()`, `or()`, `gte()`, `lte()`, `like()`, `ilike()`, `inArray()` imported from `drizzle-orm` (not raw SQL)?
- `sql` template tag used safely — no raw user input interpolated directly?
- `db.insert(table).values(...).returning()` used when the inserted row is needed immediately?
- `db.update(table).set({...}).where(...).returning()` used where appropriate?
- `db.delete(table).where(...)` — always has a `WHERE` clause (no accidental full-table deletes)?
- JOIN queries use `leftJoin` / `innerJoin` correctly (not loading relation data in N+1 loops)?

### Transactions
- Multi-step writes use `db.transaction(async (tx) => { ... })`?
- No partial writes possible if second insert/update fails?
- `tx` (transaction client) used inside transaction body — not the outer `db`?

### Relations & Joins
- `drizzle-orm/relations` (`relations()`, `one()`, `many()`) defined where relational queries are used?
- `db.query.table.findMany({ with: { relation: true } })` used for relational queries instead of manual JOINs where simpler?
- Relational query API not used for performance-critical paths (manual JOINs may be faster)?

### Pagination
- Cursor-based pagination with `gt(table.col, cursor)` + `orderBy(asc(table.col))` + `limit(n)`?
- Offset-based pagination (`offset()`) only used for small datasets or admin views?
- `limit()` always applied — no unbounded queries that could return millions of rows?

### Migrations
- `drizzle-kit generate` used to generate migrations (not hand-written SQL)?
- Migration files are additive — no `DROP TABLE`, `DROP COLUMN`, or data-destructive statements?
- `drizzle-kit migrate` (not `push`) used in production to apply migrations?
- `drizzle_migrations` journal file committed and in sync with actual migration files?
- Squashed migrations up to date and not causing conflicts?
- `drizzle.config.ts` pointing to correct schema and migrations directory?

### Connection
- Single `drizzle(pool, { schema })` instance exported from `lib/db/index.ts` (singleton)?
- `postgres` (postgres.js) or `pg` pool used — not a new connection per request?
- `DATABASE_URL` uses Transaction Pooler (port 6543, not 5432) for serverless?
- `max: 1` set on connection pool for serverless edge functions to avoid connection exhaustion?

### drizzle.config.ts
- `schema` points to `lib/db/schema.ts`?
- `out` points to `lib/db/migrations/`?
- `dialect: "postgresql"` set?
- `dbCredentials.url` reads from environment variable (not hardcoded)?
- `verbose` and `strict` enabled for safety during migrations?

## Output format

```
[SEVERITY] Category — Description
Location: table/column or file:line
Issue: what's wrong
Fix: concrete Drizzle ORM recommendation with code snippet if helpful
```

Severity: 🔴 Critical (data loss/type unsafety) | 🟡 Warning (reliability/perf) | 🟢 Suggestion

End with: schema type coverage summary + top 3 query pattern improvements + migration health check.

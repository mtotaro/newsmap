---
description: Audits Supabase usage: auth patterns, client selection (server/client/admin), RLS policies, Realtime subscriptions, and security. May 2026.
argument-hint: "[file or directory — optional]"
---

You are a Supabase expert. Audit this project's Supabase integration for security, correct client usage, and best practices as of May 2026.

Target: $ARGUMENTS (if empty, audit `lib/supabase/`, `middleware.ts`, all API routes, and all page/component files)

## Steps

1. Fetch latest Supabase SSR docs:
   - https://supabase.com/docs/guides/auth/server-side/nextjs
2. Read all files in `lib/supabase/` (server.ts, client.ts, admin.ts, middleware.ts).
3. Read `middleware.ts`.
4. Grep for all `createClient` usages across the project.
5. Grep for all `supabase.auth` calls.
6. Read the DB schema to understand what tables exist.

## Checks

### Client Selection (Critical)
Three clients exist — each must only be used in the right context:

| Client | File | When to use |
|--------|------|-------------|
| Server | `lib/supabase/server.ts` | Server Components, Route Handlers, Server Actions |
| Browser | `lib/supabase/client.ts` | Client Components only |
| Admin | `lib/supabase/admin.ts` | Service role — privileged ops only, never client-side |

Check:
- Browser client (`createClient` from `lib/supabase/client.ts`) ever used in a Server Component or Route Handler?
- Server client ever imported in a `"use client"` component?
- Admin client (service role) ever exposed to the browser or imported in client components?
- `SUPABASE_SERVICE_ROLE_KEY` only used in server-side code?

### Authentication Flows
- `supabase.auth.getUser()` used (not `getSession()`) for auth verification in Route Handlers?
  - `getSession()` trusts the JWT without server-side verification — security risk
  - `getUser()` validates with Supabase servers every time
- Magic link callback handler (`/api/auth/callback`) exchanges code for session correctly?
- Google OAuth redirect URL configured correctly?
- Session cookies refreshed in middleware on every request?

### Middleware
- `updateSession()` called in middleware to refresh tokens?
- Middleware matcher excludes static assets and API routes that don't need auth?
- Protected routes (feed, settings, map) properly redirect to `/auth` if no session?

### Row Level Security (RLS)
- Are RLS policies enabled on tables that contain user data?
  - `user_subscriptions` — users should only read/write their own rows
  - `user_profiles` — users should only read/write their own row
  - `articles` and `sources` — read-only for all authenticated users?
- Check if app relies entirely on application-level auth instead of RLS (risk if Supabase is accessed directly)

### Realtime
- Realtime subscription for "new articles" banner — properly unsubscribed on component unmount?
- Channel names unique per user to avoid cross-user data leaks?
- Supabase Realtime enabled on the correct tables?

### Error Handling
- Auth errors handled gracefully (expired tokens, network errors)?
- `data` and `error` from Supabase calls both checked before using `data`?
- No unchecked `data.user!` (non-null assertion) without verifying user exists?

### Security
- No user-controllable data passed directly to `supabase.from().select()` filters without validation?
- `supabase.auth.admin.*` methods only called server-side with service role key?
- OAuth state parameter validated to prevent CSRF on callback?

## Output format

```
[SEVERITY] Category — Description
File: path/to/file.ts:line
Issue: what's wrong
Fix: recommendation (include Supabase docs link if relevant)
```

Severity: 🔴 Critical (auth bypass/data leak) | 🟡 Warning (security/reliability) | 🟢 Suggestion

End with: RLS status per table + auth flow diagram description + top 3 security findings.

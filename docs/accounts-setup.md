# NewsMap — Accounts Setup Checklist

Complete this before writing any code. All services have free tiers — cost at launch: **$0/month**.

---

## 1. Domain

- [ ] Choose a domain name (e.g. `newsmap.app`, `newsmap.io`, `getNewsmap.com`)
- [ ] Register at Namecheap, Porkbun, or Cloudflare Registrar (~$10-15/year)
- [ ] Point nameservers to Vercel (you'll do this after creating the Vercel project)

---

## 2. GitHub Repository ✅ Done

Repository: **https://github.com/mtotaro/newsmap**

- [ ] Clone locally: `gh repo clone mtotaro/newsmap`
- [ ] Set up branch protection on `main` (require PR + status checks)
- [ ] Add `.env.local` to `.gitignore` (already in default Next.js `.gitignore`)

---

## 3. Supabase

URL: https://supabase.com

- [ ] Create account (GitHub login recommended)
- [ ] Create new project: name `newsmap`, region closest to target users (choose US East for LatAm+US)
- [ ] Save these values to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...  ← Dashboard > Settings > API
  ```
- [ ] Enable Auth providers:
  - Dashboard > Authentication > Providers > **Google** → Enable
    - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
    - Authorized redirect URI: `https://<project-id>.supabase.co/auth/v1/callback`
    - Add Client ID + Secret to Supabase
  - Dashboard > Authentication > Providers > **Email** → Enable magic links (disable password login for MVP)
- [ ] Enable Realtime:
  - Dashboard > Database > Replication > Enable Realtime for `articles` table (after schema is created)
- [ ] Storage: no setup needed yet (thumbnails served via next/image from source CDNs)

**Free tier limits:** 500MB DB · 200 concurrent Realtime connections · 50k MAU auth

---

## 4. Vercel

URL: https://vercel.com

- [ ] Create account (GitHub login recommended — same account as repo)
- [ ] New Project → Import from GitHub → select `mtotaro/newsmap`
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Leave root directory as `/`
- [ ] Add environment variables (Settings > Environment Variables):
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  INNGEST_EVENT_KEY
  INNGEST_SIGNING_KEY
  UPSTASH_REDIS_REST_URL
  UPSTASH_REDIS_REST_TOKEN
  ```
- [ ] Deploy — first deploy will fail (no code yet), that's fine
- [ ] Note the deployment URL (e.g. `newsmap.vercel.app`) — needed for OAuth callback

**Domain:** After registering domain → Vercel > Project Settings > Domains → Add domain

**Free tier:** 100GB bandwidth/month · Unlimited deployments · Edge Network

---

## 5. Inngest

URL: https://www.inngest.com

- [ ] Create account
- [ ] Create new app: name `newsmap`
- [ ] Note the two keys from Dashboard > App Keys:
  ```
  INNGEST_EVENT_KEY=...
  INNGEST_SIGNING_KEY=...
  ```
- [ ] After deploying the app to Vercel: Register the Inngest endpoint
  - Dashboard > Apps > Sync → enter `https://your-domain.com/api/inngest`
  - This activates the production cron and jobs

**Dev workflow:** Run `npx inngest-cli@latest dev` locally — no keys needed in dev, it uses the Dev Server.

**Free tier:** 50k function runs/month · Unlimited steps per run · 3-day log retention

---

## 6. Upstash Redis

URL: https://upstash.com

- [ ] Create account (GitHub login)
- [ ] Create new Redis database: name `newsmap-cache`, region US East 1
- [ ] Copy REST credentials:
  ```
  UPSTASH_REDIS_REST_URL=https://...upstash.io
  UPSTASH_REDIS_REST_TOKEN=Ax...
  ```
- [ ] No other configuration needed — the app uses `@upstash/redis` HTTP client

**Free tier:** 10,000 commands/day · 256MB storage

---

## 7. Google Cloud Console (for OAuth)

URL: https://console.cloud.google.com

- [ ] Create new project: `newsmap`
- [ ] Enable Google+ API (or "Google Identity" API)
- [ ] OAuth consent screen:
  - Type: External
  - App name: NewsMap
  - User support email: your email
  - Authorized domains: add `supabase.co` and your domain
- [ ] Create OAuth 2.0 credentials:
  - Type: Web application
  - Authorized redirect URIs: `https://<project-id>.supabase.co/auth/v1/callback`
  - Copy Client ID and Client Secret → paste into Supabase Auth > Google provider

---

## Summary of env vars to collect

Copy this to `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# --- Phase 3 only (don't need these for MVP) ---
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# VAPID_PUBLIC_KEY=
# VAPID_PRIVATE_KEY=
# VAPID_SUBJECT=mailto:contact@newsmap.app
```

---

## Estimated time

| Task | Time |
|------|------|
| Domain registration | 15 min |
| Supabase setup + Google OAuth | 30 min |
| Vercel project setup | 10 min |
| Inngest account | 10 min |
| Upstash account | 5 min |
| **Total** | **~1 hour** |

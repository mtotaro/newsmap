# NewsMap

World news portal with geographic curation. Pick your sources on a map. Get a personalized feed. No algorithm — just the publications you choose.

**Stack:** Next.js 16.2 · TypeScript · Tailwind v4 · Drizzle ORM · Supabase · Inngest · Vercel  
**Languages:** Español + English from day one  
**Coverage:** Americas + Europe (~35 sources at launch)  
**Cost at launch:** $0/month (all free tiers)

---

## Quick start

```bash
# Clone
gh repo clone mtotaro/newsmap
cd newsmap

# Install
npm install

# Environment (copy and fill in values)
cp .env.example .env.local

# Run dev server + Inngest dev server
npm run dev          # Next.js on :3000
npm run inngest      # Inngest Dev Server on :8288

# Seed the database
npm run db:seed
```

## Agent guide

See [AGENTS.md](./AGENTS.md) for:
- Folder structure and naming conventions
- How to add new sources
- How to run DB migrations
- Custom Claude Code skills (`/verify-feeds`, `/add-source`, etc.)
- Sub-agent patterns for parallel tasks

## Docs

- [Wireframe spec](./docs/wireframe-spec.md) — screen-by-screen layout specs
- [RSS audit](./docs/rss-audit.md) — feed verification results for all 35 seed sources
- [Accounts setup](./docs/accounts-setup.md) — checklist for Supabase, Vercel, Inngest, Upstash

## Roadmap

| Phase | Timeline | Status |
|-------|----------|--------|
| Pre-code | Days 1-3 | 🔄 In progress |
| Phase 0 — Setup | Week 1 | ⏳ Pending |
| Phase 1 — Core | Weeks 2-4 | ⏳ Pending |
| Phase 2 — Launch | Weeks 5-7 | ⏳ Pending |
| Phase 3 — Growth | Month 3+ | ⏳ Pending |

Full task list: [github.com/mtotaro/newsmap/issues](https://github.com/mtotaro/newsmap/issues)

## License

MIT

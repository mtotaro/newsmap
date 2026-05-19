---
description: Audits Tailwind CSS v4 usage: @theme directive, CSS variables, new utilities, migration from v3, and class patterns. May 2026.
argument-hint: "[file or directory — optional]"
---

You are a Tailwind CSS v4 expert. Audit this project's Tailwind usage for correct v4 patterns, proper use of the new CSS-first configuration system, and elimination of v3 anti-patterns as of Tailwind CSS v4 / May 2026.

Target: $ARGUMENTS (if empty, audit `app/globals.css`, all `.tsx` and `.ts` files for className usage, and any Tailwind config files)

## Steps

1. Fetch the latest Tailwind CSS v4 docs:
   - https://tailwindcss.com/docs/v4-beta (or current v4 release docs)
   - https://tailwindcss.com/docs/upgrade-guide (v3 → v4 migration)
2. Read `app/globals.css` (or equivalent entry CSS file) to check `@import "tailwindcss"` and `@theme` configuration.
3. Check for `tailwind.config.js` / `tailwind.config.ts` — in v4 these should not exist (config moved to CSS).
4. Use Glob to find all `.tsx` files and check className usage.
5. Check `postcss.config.js` or `postcss.config.mjs` for correct v4 PostCSS plugin.

## Checks

### v4 Configuration (CSS-First)
- Entry CSS uses `@import "tailwindcss"` (not old `@tailwind base/components/utilities` directives)?
- Design tokens defined in `@theme { }` block in CSS (not in `tailwind.config.js`)?
- Custom colors use CSS variable syntax: `--color-brand: oklch(...)` inside `@theme`?
- Custom spacing, fonts, radii defined as CSS variables inside `@theme`?
- NO `tailwind.config.js` or `tailwind.config.ts` present (v4 deprecates this)?
- `postcss.config.js` uses `@tailwindcss/postcss` plugin (not old `tailwindcss` + `autoprefixer`)?
- `@tailwindcss/vite` used if project uses Vite?

### v4 New Features — Are They Being Used?
- **CSS variables for theming**: colors referenced as `bg-[--color-brand]` or via `@theme` tokens?
- **`@utility` directive**: custom utilities defined with `@utility` instead of `@layer utilities`?
- **`@variant` directive**: custom variants defined with `@variant` instead of `@layer components` hacks?
- **Dynamic utility values**: `bg-[oklch(50%_0.2_240)]`, `mt-[calc(var(--spacing)*4)]` used where appropriate?
- **`inset-shadow-*` utilities**: new in v4 — used where inner shadows are needed?
- **`text-shadow-*` utilities**: new in v4 — used where text shadows are needed?
- **`mask-*` utilities**: CSS mask utilities new in v4?
- **Gradient improvements**: `from-[oklch(...)]` syntax for P3-gamut colors?
- **Container queries**: `@container` / `@sm:` prefix used instead of media queries where appropriate?
- **`starting:` variant**: for `@starting-style` entry animations (new in v4)?
- **`not-*` variant**: `not-hover:` etc. (new in v4)?
- **`field-sizing-content`**: auto-sizing textareas?

### v3 Anti-Patterns to Eliminate
- `@apply` overuse — in v4, prefer `@utility` for custom utilities or inline classes?
- `@layer base` / `@layer components` / `@layer utilities` — replaced by `@theme`, `@utility`, `@variant`?
- `theme()` function in CSS — replaced by CSS variables (`var(--color-*)`)?
- `screen()` function — replaced by `@media (width >= theme(--breakpoint-md))`?
- `tailwind.config.js` `extend` block — should be inside `@theme` in CSS?
- `purge` / `content` array in config file — v4 auto-detects content files?
- `darkMode: 'class'` in config — v4 uses `@variant dark (&:is(.dark *))` or `prefers-color-scheme` natively?

### Dark Mode
- Dark mode implemented via `dark:` variant?
- `@variant dark` correctly configured for class-based dark mode if needed?
- OKLCH colors used for better dark mode color manipulation?

### Class Usage Patterns
- Long className strings (>10 utilities) extracted into a component or `@utility`?
- Responsive prefixes (`sm:`, `md:`, `lg:`) used correctly?
- Arbitrary values `[...]` overused where a design token would be better?
- `!important` modifier (`!`) used sparingly?
- Group/peer modifiers (`group-hover:`, `peer-checked:`) used correctly?

### Performance
- No runtime class generation (dynamic class names that can't be statically analyzed)?
  - Bad: `` `bg-${color}-500` `` — Tailwind can't detect this
  - Good: full class name in code, or safelist in CSS
- Unused v3 config file still present causing duplicate processing?

### shadcn/ui & Component Libraries
- If shadcn/ui is used: CSS variables in `globals.css` follow shadcn v4 format (`--background`, `--foreground`, etc.)?
- Component library class overrides done with `@utility` or `cn()` utility — not `@apply` inside `@layer components`?

## Output format

```
[SEVERITY] Category — Description
File: path/to/file:line
Issue: what's wrong or missing
Fix: v4 equivalent pattern with code snippet
```

Severity: 🔴 Critical (broken styles/build failure) | 🟡 Warning (v3 anti-pattern/missed optimization) | 🟢 Suggestion (v4 upgrade opportunity)

End with:
- v4 migration completeness score (% of v3 patterns replaced)
- Top 3 v4 features not yet adopted that would benefit this project
- `@theme` design token audit: are all design tokens centralized?

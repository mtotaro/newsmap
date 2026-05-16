# NewsMap — Wireframe Specification

**Status:** Pre-code  
**Author:** Pre-code phase  
**Screens:** Landing · Onboarding · Feed · Article Card

---

## Design system constraints

- **Framework:** Tailwind CSS v4 — configure tokens via `@theme` in `globals.css`
- **Mobile-first:** All screens designed for 375px minimum width
- **Font:** System stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- **Color mode:** Dark by default (primary bg `#0f0f0f`), light mode optional for MVP
- **PWA:** Standalone display — no browser chrome. Design with safe areas in mind.

### Design tokens to define before coding
```css
@theme {
  --color-bg:        #0f0f0f;
  --color-bg-2:      #1a1a1a;
  --color-bg-3:      #222222;
  --color-border:    #2a2a2a;
  --color-text:      #e8e8e8;
  --color-text-2:    #999999;
  --color-text-3:    #555555;
  --color-blue:      #4a9eff;
  --color-green:     #3ecf8e;
  --color-yellow:    #f0a500;
  --color-red:       #ff5c5c;
  --color-purple:    #a78bfa;
  --radius-card:     10px;
  --radius-button:   8px;
}
```

---

## Screen 1 — Landing Page

### Purpose
Convert anonymous visitors to signups. Show the product working — not a list of features.

### Layout (desktop 1200px)
```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR: [Logo] NewsMap          [Log in] [Create account]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│  HERO                                                   │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │                      │  │  DEMO FEED PREVIEW      │ │
│  │  Your world news,    │  │  ┌─────────────────────┐│ │
│  │  by the sources      │  │  │ 🇬🇧 BBC News · World ││ │
│  │  you choose.         │  │  │ [thumbnail]         ││ │
│  │                      │  │  │ Title of article... ││ │
│  │  Subtitle: Pick      │  │  │ Summary 2 lines...  ││ │
│  │  sources on a map.   │  │  │ Read at BBC →       ││ │
│  │  No algorithm.       │  │  └─────────────────────┘│ │
│  │  Just the news you   │  │  ┌─────────────────────┐│ │
│  │  care about.         │  │  │ 🇦🇷 Infobae · Sports ││ │
│  │                      │  │  │ [thumbnail]         ││ │
│  │  [Create free        │  │  │ Title of article... ││ │
│  │   account →]         │  │  └─────────────────────┘│ │
│  │                      │  │  ┌─────────────────────┐│ │
│  │  Already have an     │  │  │ 🇺🇸 Reuters · Economy││ │
│  │  account? Log in     │  │  │ [thumbnail]         ││ │
│  └──────────────────────┘  │  │ ...                 ││ │
│                             │  └─────────────────────┘│ │
│                             └─────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  3-FEATURE ROW                                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ 🗺 Map    │  │ 📰 RSS    │  │ 🌐 ES+EN  │          │
│  │ discovery │  │ first     │  │ bilingual │          │
│  │           │  │           │  │           │          │
│  │ Browse by │  │ Always    │  │ Interface │          │
│  │ country   │  │ free,     │  │ in ES or  │          │
│  │ on the    │  │ direct    │  │ EN. News  │          │
│  │ world map │  │ from each │  │ in any    │          │
│  │           │  │ source    │  │ language  │          │
│  └───────────┘  └───────────┘  └───────────┘          │
├─────────────────────────────────────────────────────────┤
│  FOOTER: Privacy Policy · About · GitHub                │
└─────────────────────────────────────────────────────────┘
```

### Layout (mobile 375px)
```
┌──────────────────┐
│ [Logo] NewsMap   │
│              [≡] │
├──────────────────┤
│                  │
│  Your world      │
│  news, by the    │
│  sources you     │
│  choose.         │
│                  │
│  Pick sources    │
│  on a map. No    │
│  algorithm.      │
│                  │
│ [Create free     │
│  account →     ] │
│                  │
│  [Log in]        │
├──────────────────┤
│ DEMO FEED        │
│ ┌──────────────┐ │
│ │ BBC · World  │ │
│ │ [thumbnail]  │ │
│ │ Title...     │ │
│ │ Read at BBC→ │ │
│ └──────────────┘ │
│ (2 more cards)   │
└──────────────────┘
```

### Component notes
- Demo feed cards are **static** (hardcoded data, no DB query) — reliability matters here
- "Create free account" CTA must be visible above the fold on mobile
- No email capture before showing the product
- Cards in demo have disabled links (or links go to signup)

---

## Screen 2 — Onboarding

### Purpose
The most critical screen. User selects their first sources. Fast path to a populated feed.

### Step 1 — Profile selection (mobile)
```
┌──────────────────────┐
│  ← Back              │
│                      │
│  Choose your         │
│  news sources        │
│                      │
│  Start with a        │
│  profile or explore  │
│  the map:            │
│                      │
│ ┌────────────────────┐│
│ │ 🌎 Latin America  ││
│ │ Sports & politics  ││
│ │                    ││
│ │ Infobae · La Nación││
│ │ BBC Mundo          ││
│ │                    ││
│ │    [Select →]      ││
│ └────────────────────┘│
│                      │
│ ┌────────────────────┐│
│ │ 🌍 World News      ││
│ │ International      ││
│ │                    ││
│ │ BBC · Reuters · AP ││
│ │ The Guardian       ││
│ │                    ││
│ │    [Select →]      ││
│ └────────────────────┘│
│                      │
│ ┌────────────────────┐│
│ │ 💻 Tech & Economy  ││
│ │ Global             ││
│ │                    ││
│ │ Reuters · NPR      ││
│ │ The Atlantic       ││
│ │                    ││
│ │    [Select →]      ││
│ └────────────────────┘│
│                      │
│ ─── or ───           │
│                      │
│ [🗺 Explore the map] │
│                      │
│ [Skip for now]       │
└──────────────────────┘
```

### Step 2 — Adjust profile (after selecting one)
```
┌──────────────────────┐
│  ← Back                        │
│                      │
│  🌎 Latin America    │
│  4 sources selected  │
│                      │
│  Sources:            │
│  ┌──────────────────┐│
│  │ [logo] Infobae   ││
│  │ ✅ Politics       ││
│  │ ✅ Sports         ││
│  │ ☐  Economy       ││
│  │ ✅ World          ││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ [logo] La Nación ││
│  │ ✅ Politics       ││
│  │ ✅ Economy        ││
│  │ ☐  Sports        ││
│  └──────────────────┘│
│  (more sources...)   │
│                      │
│ [+ Add more sources] │
│                      │
│ [Start reading →   ] │
└──────────────────────┘
```

### Component notes
- Profile cards show source logos as small chips/avatars
- Section toggles use checkboxes with the normalized section label (i18n)
- "Explore the map" opens the WorldMap in a sheet/modal
- "Skip for now" sets `onboarding_done = true` and lands on empty feed with "Add sources" prompt
- After confirming: show loading state while inserting subscriptions, then redirect to feed

---

## Screen 3 — Feed

### Layout (mobile)
```
┌──────────────────────┐
│ [Logo] NewsMap  [👤] │
├──────────────────────┤
│ My feed  | Explore   │ ← tab bar
├──────────────────────┤
│ ┌────────────────────┐│ ← "N new articles" banner (hidden by default)
│ │ ↑ 5 new articles   ││   appears via Supabase Realtime
│ └────────────────────┘│
│                      │
│ ┌────────────────────┐│
│ │ [thumbnail 16:9]   ││
│ │                    ││
│ │ 🇦🇷 Infobae · Sports││ ← source logo + name + section chip + time ago
│ │ 2h ago             ││
│ │                    ││
│ │ Full article title ││
│ │ here (not          ││
│ │ truncated)         ││
│ │                    ││
│ │ Summary text 2-3   ││
│ │ lines max, no HTML.││
│ │                    ││
│ │ [Read at Infobae →]││
│ └────────────────────┘│
│                      │
│  [Ad unit — 1 every  │ ← free tier only
│   5 articles]        │
│                      │
│ ┌────────────────────┐│
│ │ ... next card ...  ││
│ └────────────────────┘│
│                      │
│  (infinite scroll)   │
└──────────────────────┘
```

### Layout (desktop sidebar)
```
┌─────────────────────────────────┐
│ [Logo] NewsMap       [Settings] │
├──────┬──────────────────────────┤
│ NAV  │  FEED                   │
│ [📰] │  ┌──────────────┐ ┌──┐  │
│ Feed │  │              │ │AD│  │
│      │  │ Article Card │ │  │  │
│ [🗺] │  │              │ └──┘  │
│ Map  │  └──────────────┘       │
│      │  ┌──────────────┐       │
│ [⚙️] │  │ Article Card │       │
│ Sett │  └──────────────┘       │
└──────┴──────────────────────────┘
```

---

## Screen 4 — Article Card Component

### Anatomy
```
┌─────────────────────────────────────┐
│                                     │
│   [    thumbnail image 16:9    ]    │
│   (fallback: source logo on gray)   │
│                                     │
├─────────────────────────────────────┤
│ [src-logo] SourceName  [Section]  2h│
│                                     │
│ Full title of the article here      │
│ without any truncation              │
│                                     │
│ Summary of the article in 2-3       │
│ lines. Plain text, no HTML tags.    │
│ Max 280 characters.                 │
│                                     │
│              [Read at Source Name →]│
└─────────────────────────────────────┘
```

### States
| State | Thumbnail | Notes |
|-------|-----------|-------|
| Normal | Real thumbnail | from RSS or og:image |
| No thumbnail | Source logo centered | gray background |
| og:image pending | Skeleton shimmer | while async job runs |
| Loading | Full card skeleton | on initial feed load |

### Section chip colors (suggestion)
- sports → blue
- politics → red
- economy → yellow
- tech → purple
- world → teal
- culture → orange
- health → green

---

## Screen 5 — World Map (Explore)

```
┌──────────────────────────────────────────────┐
│  Explore sources                             │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │         [INTERACTIVE WORLD MAP]        │  │
│  │         (react-simple-maps SVG)        │  │
│  │                                        │  │
│  │   Hover: country highlights            │  │
│  │   Click: opens source panel           │  │
│  │   Selected: country stays highlighted  │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [Click a country to see available sources]  │
└──────────────────────────────────────────────┘

After clicking Argentina:
┌──────────────────────────────────────────────┐
│  🇦🇷 Argentina — 3 sources                   │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ [logo] Infobae                   [+] │    │
│  │ Politics · Sports · Economy · World  │    │
│  │ Language: Spanish                    │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │ [logo] La Nación              [+/✅] │    │
│  │ Politics · Economy · Culture · World │    │
│  │ ✅ Already subscribed                │    │
│  └──────────────────────────────────────┘    │
│  ┌──────────────────────────────────────┐    │
│  │ [logo] Clarín                    [+] │    │
│  │ Politics · Sports · World            │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

### Map interaction notes
- Map centered on Americas at load; Europe fully visible
- Asia/Africa countries are visible but show "Coming soon" tooltip if clicked
- SVG hover uses CSS transitions — no JS re-renders on hover
- Country panel is a bottom sheet on mobile, a side panel on desktop
- Selecting sections from the panel updates `user_subscriptions` in real-time

---

## Accessibility checklist
- [ ] All interactive elements have focus rings
- [ ] Color is not the only signal (icons + labels alongside color chips)
- [ ] Article cards keyboard navigable (Tab to card, Enter to open)
- [ ] Map has text alternative ("Browse by country dropdown" for keyboard users)
- [ ] Time ago has `<time datetime="...">` with machine-readable ISO date
- [ ] "Read at X" links open in new tab with `aria-label="Read full article at Source Name (opens in new tab)"`

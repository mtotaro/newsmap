# RSS Feed Audit — Pre-code

**Status:** Complete  
**Verified:** May 2026 — automated fetch via parallel sub-agents + manual notes  
**Sources audited:** 37 (35 original + 2 replacements)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Verified working (HTTP 200) |
| ⚠️ | Works but with caveats |
| ❌ | Broken / discontinued — replaced |
| 🔒 | Paywalled — excluded from MVP |
| 🚫 | Blocked automated fetch — needs manual curl |

---

## Image support key

| Format | Parser field | Notes |
|--------|-------------|-------|
| `media:thumbnail` | `item.media.thumbnail` | Best — direct URL, always an image |
| `media:content medium="image"` | `item.media.content` | Common, filter by medium attr |
| `media:content` (no medium attr) | `item.media.content` | Check type or URL extension |
| `<enclosure type="image/*">` | `item.enclosures` | Legacy, less common |
| None | — | Rely on og:image async job |

---

## Latin America

| Source | Country | Status | Image support | Section feeds | Verified URL |
|--------|---------|--------|---------------|---------------|-------------|
| Infobae | AR | ✅ 200 | media:content | ❌ Arc only | `/arc/outboundfeeds/rss/` |
| La Nación | AR | ✅ 200 | media:content | ❌ Arc only | `/arc/outboundfeeds/rss/` |
| Clarín | AR | 🚫 blocked | unknown | unknown | `/rss/` — verify with curl |
| Folha de SP | BR | 🚫 blocked | unknown | ⚠️ pattern known | `/folha/{section}/rss091.xml` |
| O Globo | BR | 🚫 blocked | unknown | unknown | `/rss.xml` |
| La Tercera | CL | ✅ 200 | media:content | ❌ Arc only | `/arc/outboundfeeds/rss/` |
| El Tiempo | CO | ✅ 200 | enclosure only | ✅ 50+ feeds | `/rss/{section}.xml` |
| ~~El Comercio~~ → **Perú21** | PE | 🚫 verify | unknown | unknown | RSS discontinued on El Comercio |
| El Universal | MX | ✅ 200 | media:content | ❌ Arc only | `/arc/outboundfeeds/rss/` |
| ~~Milenio~~ → **Excélsior** | MX | 🚫 verify | unknown | unknown | Milenio RSS broken (AWS redirect) |
| ~~Reforma~~ | MX | 🔒 paywall | — | — | Excluded from MVP |
| BBC Mundo | INTL | ✅ 200 | media:thumbnail ✨ | ✅ confirmed | `/mundo/{section}/rss.xml` |
| ~~CNN en Español~~ | INTL | ❌ 404 | — | — | RSS discontinued |
| France 24 ES | INTL | ✅ 200 | media:thumbnail ✨ | ⚠️ partial | `/es/{section}/rss` |
| Deutsche Welle ES | INTL | 🚫 blocked | unknown | unknown | `rss.dw.com/rdf/rss-es-all` |

### Arc Publishing note (AR/CL/MX)
Infobae, La Nación, La Tercera, El Universal all run Arc Publishing CMS, which exposes only **one general RSS endpoint** (`/arc/outboundfeeds/rss/`). No section splits. After parsing, infer `section_key` from:
1. Article URL path (e.g. `infobae.com/deportes/` → `sports`)
2. RSS `<category>` tag value

---

## USA

| Source | Status | Image support | Section feeds | Notes |
|--------|--------|---------------|---------------|-------|
| ~~AP News~~ → **Al Jazeera EN** | ❌ DNS dead | — | — | `feeds.apnews.com` subdomain retired |
| ~~Reuters~~ → **Axios** | ❌ 401/timeout | — | — | Public RSS discontinued ~2020 |
| NPR | ✅ 200 | ❌ none | ✅ numeric IDs | Images only inside content:encoded — needs og:image job |
| The Guardian US | ✅ 200 | ⚠️ media:content (no medium attr) | ✅ `/SECTION/rss` | 140px thumbs from i.guim.co.uk |
| Washington Post | ⚠️ 403→200 w/ browser UA | ❌ none | ⚠️ only /rss/world confirmed | Must set User-Agent header. Monitor for rate limits. |
| New York Times | ✅ 200 | ✅ media:content medium="image" | ✅ `/nyt/SECTION.xml` | Truncated RSS (paywall). Show disclaimer in card. |
| The Atlantic | ✅ 200 | ⚠️ media:content (no medium attr) | ✅ `/feed/channel/SECTION/` | Atom feed. **Descriptions are HTML** — must strip. |
| **Al Jazeera EN** *(new)* | 🚫 verify | unknown | ⚠️ pattern known | Replacement for AP News |
| **Axios** *(new)* | 🚫 verify | unknown | ⚠️ pattern known | Replacement for Reuters |

---

## Spain

| Source | Status | Image support | Section feeds | Notes |
|--------|--------|---------------|---------------|-------|
| El País | ✅ 200 | ✅ media:thumbnail + media:content ✨✨ | ✅ `/section/{name}/portada` | Best Spanish feed. /politica 404 — use /espana |
| El Mundo | ✅ 200 | ✅ media:thumbnail + media:content ✨✨ | ✅ `e00-elmundo.uecdn.es/rss/{section}.xml` | Deportes/tecnologia return 404 — excluded |
| El Confidencial | ✅ 200 | ⚠️ media:content (no medium attr) | ✅ `rss.elconfidencial.com/{section}/` | **URL is on rss. subdomain, not www.** Atom feed. Empty descriptions. |
| La Vanguardia | ✅ 200 | ⚠️ media:content (no medium attr) | ✅ `/rss/{section}.xml` | No XML prolog — encoding inferred UTF-8 |

---

## United Kingdom

| Source | Status | Image support | Section feeds | Notes |
|--------|--------|---------------|---------------|-------|
| BBC News | ✅ 200 | ✅ media:thumbnail (240x135) ✨ | ✅ confirmed all | Best-implemented feed in the entire seed |
| The Guardian | ✅ 200 | ⚠️ media:content (no medium attr) | ✅ `/SECTION/rss` | Same infra as Guardian US |
| The Independent | ✅ 200 | ⚠️ media:content (some type issues) | ✅ `/news/SECTION/rss` | **Descriptions contain HTML** — must strip. Some `media:content` items have `type="application/octet-stream"` (CMS bug) — treat as image. |

---

## Europe Continental

| Source | Status | Image support | Section feeds | Notes |
|--------|--------|---------------|---------------|-------|
| Le Monde | ✅ 200 | ⚠️ media:content (no medium attr, 644x322) | ✅ `/{section}/rss_full.xml` | French. Verify é/è/ê encoding. CDATA titles. |
| Der Spiegel | ✅ 200 | ❌ none (enclosure, not images) | ✅ `/{section}/index.rss` | German. Entirely reliant on og:image job. Verify ä/ö/ü/ß. |
| La Repubblica | ✅ 200 | ❌ none at all | ✅ `/rss/{section}/rss2.0.xml` | Italian. No XML prolog. No images whatsoever. Entirely og:image. Sport feed 404. |

---

## Parser implementation notes

### Sources requiring HTML stripping in description

These sources have HTML in `<description>` or Atom `<summary type="html">` — feedsmith will include it raw. Always strip before saving to DB:
- The Atlantic
- The Independent

### Sources with no medium attribute on media:content

feedsmith's `item.media.content` will include these but without `medium="image"`. Filter by checking `type` starts with `image/` or URL ends with `.jpg/.png/.webp`:
- The Guardian (US + UK)
- El Confidencial
- La Vanguardia
- Le Monde
- NYT (has `medium="image"` — fine)

### Sources using enclosure for images

El Tiempo (CO) uses `<enclosure type="image/jpeg">` — feedsmith maps these to `item.enclosures[]`. The parser's `extractThumbnail()` already handles this at step 3.

### Sources entirely dependent on og:image async job

NPR, Washington Post, Der Spiegel, La Repubblica have no native image support in their feeds. Expect ~100% og:image job volume for these sources. Ensure the job has enough capacity.

### Arc Publishing sources — section inference

After parsing articles from Arc feeds (Infobae, La Nación, La Tercera, El Universal), infer `section_key` with:

```typescript
function inferSectionFromUrl(url: string): string {
  const segments = new URL(url).pathname.split('/').filter(Boolean)
  const sectionMap: Record<string, string> = {
    'deportes': 'sports', 'deporte': 'sports',
    'politica': 'politics', 'nacion': 'politics', 'nacional': 'politics',
    'economia': 'economy', 'cartera': 'economy', 'negocios': 'economy',
    'tecnologia': 'tech', 'techbit': 'tech',
    'cultura': 'culture', 'entretenimiento': 'entertainment', 'teleshow': 'entertainment',
    'mundo': 'world', 'internacional': 'world', 'america': 'world',
    'salud': 'health', 'ciencia': 'science',
  }
  for (const seg of segments) {
    if (sectionMap[seg]) return sectionMap[seg]
  }
  return 'world' // fallback
}
```

---

## Sources to verify manually before launch

Run these commands before activating the `🚫 blocked` sources:

```bash
# Clarín
curl -A "Mozilla/5.0 (compatible; NewsMap/1.0; +contact@newsmap.app)" https://www.clarin.com/rss/ | head -100

# Folha de São Paulo
curl https://feeds.folha.uol.com.br/folha/poder/rss091.xml | head -100

# O Globo
curl https://oglobo.globo.com/rss.xml | head -100

# Deutsche Welle ES
curl https://rss.dw.com/rdf/rss-es-all | head -100

# Al Jazeera EN (replacement for AP News)
curl https://www.aljazeera.com/xml/rss/all.xml | head -100

# Axios (replacement for Reuters)
curl https://api.axios.com/feed/ | head -100

# Perú21 (replacement for El Comercio)
curl https://peru21.pe/feed/ | head -100

# Excélsior (replacement for Milenio)
curl https://www.excelsior.com.mx/rss/global.xml | head -100
```

Update `NEEDS_VERIFICATION` set in `lib/db/seed.ts` and set `is_active=true` once confirmed.

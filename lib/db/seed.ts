/**
 * NewsMap — Source Seed Data
 *
 * Single source of truth for all news sources.
 * Run `npm run db:seed` to upsert into the DB.
 *
 * Feed URLs verified: May 2026 via automated audit + manual checks.
 * To re-verify: run `/verify-feeds` in the Claude Code CLI.
 *
 * Arc Publishing note: Infobae, La Nación, La Tercera, El Universal all use
 * Arc's generic feed endpoint — only one general RSS exists, no section splits.
 * Section inference happens post-parse via article URL path + <category> tag.
 */

export interface FeedSection {
  key: string
  url: string
  labelEs: string
  labelEn: string
}

export interface SourceSeed {
  name: string
  countryCode: string  // ISO 3166-1 alpha-2
  region: 'latam' | 'north_america' | 'europe' | 'asia' | 'africa'
  language: string     // ISO 639-1
  logoUrl: string
  websiteUrl: string
  feedSections: FeedSection[]
  notes?: string       // human-readable caveats for this source
}

// ─── ARGENTINA ───────────────────────────────────────────────────────────────

const ARGENTINA: SourceSeed[] = [
  {
    name: 'Infobae',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.infobae.com/favicon.ico',
    websiteUrl: 'https://www.infobae.com',
    notes: 'Arc Publishing — single general feed, no section splits. Images via media:content. Section inferred from URL path.',
    feedSections: [
      { key: 'world', url: 'https://www.infobae.com/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    name: 'La Nación',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.lanacion.com.ar/favicon.ico',
    websiteUrl: 'https://www.lanacion.com.ar',
    notes: 'Arc Publishing — single general feed. Images via media:content (large originals). Section inferred from URL.',
    feedSections: [
      { key: 'world', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    name: 'Clarín',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.clarin.com/favicon.ico',
    websiteUrl: 'https://www.clarin.com',
    notes: 'NEEDS MANUAL VERIFICATION — blocked automated fetch. Try: curl -A "Mozilla/5.0" https://www.clarin.com/rss/',
    feedSections: [
      { key: 'world', url: 'https://www.clarin.com/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── BRAZIL ──────────────────────────────────────────────────────────────────

const BRAZIL: SourceSeed[] = [
  {
    name: 'Folha de São Paulo',
    countryCode: 'BR',
    region: 'latam',
    language: 'pt',
    logoUrl: 'https://www.folha.uol.com.br/favicon.ico',
    websiteUrl: 'https://www.folha.uol.com.br',
    notes: 'NEEDS MANUAL VERIFICATION — feeds.folha.uol.com.br blocked automated fetch. Verify encoding (may send ISO-8859-1). Pattern: /folha/{section}/rss091.xml',
    feedSections: [
      { key: 'politics', url: 'https://feeds.folha.uol.com.br/folha/poder/rss091.xml', labelEs: 'Política', labelEn: 'Politics' },
      { key: 'world',    url: 'https://feeds.folha.uol.com.br/folha/mundo/rss091.xml', labelEs: 'Internacional', labelEn: 'World' },
      { key: 'sports',   url: 'https://feeds.folha.uol.com.br/folha/esporte/rss091.xml', labelEs: 'Deportes', labelEn: 'Sports' },
      { key: 'economy',  url: 'https://feeds.folha.uol.com.br/folha/mercado/rss091.xml', labelEs: 'Economía', labelEn: 'Economy' },
    ],
  },
  {
    name: 'O Globo',
    countryCode: 'BR',
    region: 'latam',
    language: 'pt',
    logoUrl: 'https://oglobo.globo.com/favicon.ico',
    websiteUrl: 'https://oglobo.globo.com',
    notes: 'NEEDS MANUAL VERIFICATION — oglobo.globo.com blocked automated fetch. Entire Globo network blocks automated agents.',
    feedSections: [
      { key: 'world', url: 'https://oglobo.globo.com/rss.xml', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── CHILE / COLOMBIA / PERU ──────────────────────────────────────────────────

const CHILE_COLOMBIA_PERU: SourceSeed[] = [
  {
    name: 'La Tercera',
    countryCode: 'CL',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.latercera.com/favicon.ico',
    websiteUrl: 'https://www.latercera.com',
    notes: 'Arc Publishing — single general feed. Images via media:content. Section URLs return HTML, not RSS.',
    feedSections: [
      { key: 'world', url: 'https://www.latercera.com/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    name: 'El Tiempo',
    countryCode: 'CO',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.eltiempo.com/favicon.ico',
    websiteUrl: 'https://www.eltiempo.com',
    notes: 'Best section coverage in LatAm (50+ feeds). Images via <enclosure> (not media:thumbnail). All section feeds verified 200.',
    feedSections: [
      { key: 'politics', url: 'https://www.eltiempo.com/rss/politica.xml',    labelEs: 'Política',    labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.eltiempo.com/rss/economia.xml',    labelEs: 'Economía',    labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.eltiempo.com/rss/deportes.xml',    labelEs: 'Deportes',    labelEn: 'Sports' },
      { key: 'tech',     url: 'https://www.eltiempo.com/rss/tecnosfera.xml',  labelEs: 'Tecnología',  labelEn: 'Tech' },
      { key: 'world',    url: 'https://www.eltiempo.com/rss/mundo.xml',       labelEs: 'Internacional', labelEn: 'World' },
      { key: 'culture',  url: 'https://www.eltiempo.com/rss/cultura.xml',     labelEs: 'Cultura',     labelEn: 'Culture' },
    ],
  },
  {
    // El Comercio (PE) has discontinued RSS. Replaced with Perú21.
    name: 'Perú21',
    countryCode: 'PE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://peru21.pe/favicon.ico',
    websiteUrl: 'https://peru21.pe',
    notes: 'Replacement for El Comercio PE (no RSS). NEEDS MANUAL VERIFICATION — verify feed URL and thumbnail availability.',
    feedSections: [
      { key: 'politics', url: 'https://peru21.pe/feed/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── MEXICO ───────────────────────────────────────────────────────────────────

const MEXICO: SourceSeed[] = [
  {
    name: 'El Universal',
    countryCode: 'MX',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.eluniversal.com.mx/favicon.ico',
    websiteUrl: 'https://www.eluniversal.com.mx',
    notes: 'Arc Publishing — single general feed. Images via media:content. Section inferred from article URL path.',
    feedSections: [
      { key: 'world', url: 'https://www.eluniversal.com.mx/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    // Milenio RSS is broken (redirects to broken internal AWS endpoint). Replaced with Excélsior.
    name: 'Excélsior',
    countryCode: 'MX',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.excelsior.com.mx/favicon.ico',
    websiteUrl: 'https://www.excelsior.com.mx',
    notes: 'Replacement for Milenio MX (broken RSS). NEEDS MANUAL VERIFICATION — verify feed URL and thumbnail availability.',
    feedSections: [
      { key: 'world',    url: 'https://www.excelsior.com.mx/rss/global.xml',   labelEs: 'Global',    labelEn: 'World' },
      { key: 'politics', url: 'https://www.excelsior.com.mx/rss/nacional.xml', labelEs: 'Nacional',  labelEn: 'Politics' },
    ],
  },
  // Reforma excluded: full paywall, RSS requires subscription.
]

// ─── REGIONAL SPANISH ─────────────────────────────────────────────────────────

const REGIONAL_ES: SourceSeed[] = [
  {
    name: 'BBC Mundo',
    countryCode: 'GB',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://news.bbcimg.co.uk/nol/shared/img/bbc_news_120x60.gif',
    websiteUrl: 'https://www.bbc.com/mundo',
    notes: 'Excellent: media:thumbnail on every item (240x135px). All section feeds confirmed 200. TTL 15 min.',
    feedSections: [
      { key: 'world',    url: 'https://feeds.bbci.co.uk/mundo/rss.xml',                     labelEs: 'Portada',          labelEn: 'Home' },
      { key: 'world',    url: 'https://feeds.bbci.co.uk/mundo/internacional/rss.xml',        labelEs: 'Internacional',    labelEn: 'World' },
      { key: 'world',    url: 'https://feeds.bbci.co.uk/mundo/america_latina/rss.xml',       labelEs: 'América Latina',   labelEn: 'Latin America' },
      { key: 'economy',  url: 'https://feeds.bbci.co.uk/mundo/economia/rss.xml',             labelEs: 'Economía',         labelEn: 'Economy' },
      { key: 'science',  url: 'https://feeds.bbci.co.uk/mundo/ciencia_y_tecnologia/rss.xml', labelEs: 'Ciencia y Tecno',  labelEn: 'Science & Tech' },
      { key: 'health',   url: 'https://feeds.bbci.co.uk/mundo/salud/rss.xml',                labelEs: 'Salud',            labelEn: 'Health' },
    ],
  },
  {
    // CNN en Español RSS discontinued (404 on all patterns). Replaced with France 24 ES as primary + DW ES.
    // CNN en Español excluded from MVP.
    name: 'France 24 Español',
    countryCode: 'FR',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.france24.com/favicon.ico',
    websiteUrl: 'https://www.france24.com/es',
    notes: 'media:thumbnail on all items. Some section feeds 404 — only verified ones included.',
    feedSections: [
      { key: 'world',   url: 'https://www.france24.com/es/rss',           labelEs: 'Portada',   labelEn: 'Home' },
      { key: 'sports',  url: 'https://www.france24.com/es/deportes/rss',  labelEs: 'Deportes',  labelEn: 'Sports' },
      { key: 'economy', url: 'https://www.france24.com/es/economia/rss',  labelEs: 'Economía',  labelEn: 'Economy' },
    ],
  },
  {
    name: 'Deutsche Welle Español',
    countryCode: 'DE',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.dw.com/favicon.ico',
    websiteUrl: 'https://www.dw.com/es',
    notes: 'NEEDS MANUAL VERIFICATION — rss.dw.com and www.dw.com blocked automated fetch. Verify with: curl https://rss.dw.com/rdf/rss-es-all',
    feedSections: [
      { key: 'world',    url: 'https://rss.dw.com/rdf/rss-es-all', labelEs: 'Portada', labelEn: 'Home' },
      { key: 'politics', url: 'https://rss.dw.com/rdf/rss-es-pol', labelEs: 'Política', labelEn: 'Politics' },
      { key: 'economy',  url: 'https://rss.dw.com/rdf/rss-es-eco', labelEs: 'Economía', labelEn: 'Economy' },
    ],
  },
]

// ─── UNITED STATES ────────────────────────────────────────────────────────────

const USA: SourceSeed[] = [
  {
    // AP News public RSS (feeds.apnews.com) has been retired — DNS returns no data.
    // Replaced with Al Jazeera English, which has excellent free RSS + thumbnails.
    name: 'Al Jazeera English',
    countryCode: 'QA',
    region: 'north_america', // global reach, categorized for map display
    language: 'en',
    logoUrl: 'https://www.aljazeera.com/favicon.ico',
    websiteUrl: 'https://www.aljazeera.com',
    notes: 'Replacement for AP News (RSS retired). Excellent global coverage with thumbnails. NEEDS MANUAL VERIFICATION.',
    feedSections: [
      { key: 'world',    url: 'https://www.aljazeera.com/xml/rss/all.xml',                labelEs: 'Portada',       labelEn: 'All News' },
      { key: 'world',    url: 'https://www.aljazeera.com/xml/rss/allnews-en.xml',         labelEs: 'Internacional', labelEn: 'World' },
    ],
  },
  {
    // Reuters free public RSS discontinued ~2020 (feeds.reuters.com returns 401/timeout).
    // Replaced with Axios which has good free RSS.
    name: 'Axios',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://www.axios.com/favicon.ico',
    websiteUrl: 'https://www.axios.com',
    notes: 'Replacement for Reuters (public RSS discontinued). NEEDS MANUAL VERIFICATION — verify feed URL.',
    feedSections: [
      { key: 'world',    url: 'https://api.axios.com/feed/', labelEs: 'Portada', labelEn: 'Home' },
      { key: 'politics', url: 'https://api.axios.com/feed/politics/', labelEs: 'Política', labelEn: 'Politics' },
      { key: 'tech',     url: 'https://api.axios.com/feed/technology/', labelEs: 'Tecnología', labelEn: 'Technology' },
    ],
  },
  {
    name: 'NPR',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://media.npr.org/favicon.ico',
    websiteUrl: 'https://www.npr.org',
    notes: 'No media:thumbnail or media:content — images only inside content:encoded. Will need og:image job for thumbnails. Section feeds confirmed via numeric IDs.',
    feedSections: [
      { key: 'world',    url: 'https://feeds.npr.org/1004/rss.xml', labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://feeds.npr.org/1014/rss.xml', labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://feeds.npr.org/1017/rss.xml', labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'science',  url: 'https://feeds.npr.org/1007/rss.xml', labelEs: 'Ciencia',       labelEn: 'Science' },
      { key: 'health',   url: 'https://feeds.npr.org/1128/rss.xml', labelEs: 'Salud',         labelEn: 'Health' },
      { key: 'tech',     url: 'https://feeds.npr.org/1019/rss.xml', labelEs: 'Tecnología',    labelEn: 'Tech' },
      { key: 'culture',  url: 'https://feeds.npr.org/1008/rss.xml', labelEs: 'Cultura',       labelEn: 'Culture' },
    ],
  },
  {
    name: 'The Guardian US',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://assets.guim.co.uk/images/favicons/favicon.ico',
    websiteUrl: 'https://www.theguardian.com/us',
    notes: 'media:content present (no medium attr, 140px wide from i.guim.co.uk). Section feeds confirmed. Plain text descriptions.',
    feedSections: [
      { key: 'world',    url: 'https://www.theguardian.com/world/rss',      labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.theguardian.com/politics/rss',   labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.theguardian.com/business/rss',   labelEs: 'Economía',      labelEn: 'Business' },
      { key: 'tech',     url: 'https://www.theguardian.com/technology/rss', labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'culture',  url: 'https://www.theguardian.com/culture/rss',    labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'science',  url: 'https://www.theguardian.com/science/rss',    labelEs: 'Ciencia',       labelEn: 'Science' },
      { key: 'sports',   url: 'https://www.theguardian.com/sport/rss',      labelEs: 'Deportes',      labelEn: 'Sport' },
    ],
  },
  {
    name: 'Washington Post',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://www.washingtonpost.com/favicon.ico',
    websiteUrl: 'https://www.washingtonpost.com',
    notes: 'Returns 403 without browser User-Agent — set UA header explicitly. Only /rss/world confirmed working; other sections timeout. No media images in feed (og:image job needed). Monitor for rate limiting.',
    feedSections: [
      { key: 'world', url: 'https://feeds.washingtonpost.com/rss/world', labelEs: 'Internacional', labelEn: 'World' },
    ],
  },
  {
    name: 'New York Times',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://www.nytimes.com/favicon.ico',
    websiteUrl: 'https://www.nytimes.com',
    notes: 'RSS truncated — title + 1-line summary only (paywall). media:content medium="image" present with full-resolution images. Show disclaimer in card: "Full article requires NYT subscription." Section feeds at /nyt/SECTION.xml confirmed.',
    feedSections: [
      { key: 'world',    url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',      labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',   labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',   labelEs: 'Economía',      labelEn: 'Business' },
      { key: 'tech',     url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'science',  url: 'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',    labelEs: 'Ciencia',       labelEn: 'Science' },
      { key: 'health',   url: 'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',     labelEs: 'Salud',         labelEn: 'Health' },
      { key: 'sports',   url: 'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',     labelEs: 'Deportes',      labelEn: 'Sports' },
      { key: 'culture',  url: 'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',       labelEs: 'Cultura',       labelEn: 'Arts' },
    ],
  },
  {
    name: 'The Atlantic',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://www.theatlantic.com/favicon.ico',
    websiteUrl: 'https://www.theatlantic.com',
    notes: 'Atom feed. media:content present (no medium attr). IMPORTANT: <summary type="html"> — description is HTML, must strip before display. No sports/economy channels available.',
    feedSections: [
      { key: 'politics', url: 'https://www.theatlantic.com/feed/channel/politics/',     labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'tech',     url: 'https://www.theatlantic.com/feed/channel/technology/',   labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'science',  url: 'https://www.theatlantic.com/feed/channel/science/',      labelEs: 'Ciencia',       labelEn: 'Science' },
      { key: 'health',   url: 'https://www.theatlantic.com/feed/channel/health/',       labelEs: 'Salud',         labelEn: 'Health' },
      { key: 'world',    url: 'https://www.theatlantic.com/feed/channel/international/', labelEs: 'Internacional', labelEn: 'Global' },
      { key: 'culture',  url: 'https://www.theatlantic.com/feed/channel/culture/',      labelEs: 'Cultura',       labelEn: 'Culture' },
    ],
  },
]

// ─── SPAIN ────────────────────────────────────────────────────────────────────

const SPAIN: SourceSeed[] = [
  {
    name: 'El País',
    countryCode: 'ES',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://country.elpais.com/resources/images/favicon.ico',
    websiteUrl: 'https://elpais.com',
    notes: 'Best-in-class: both media:thumbnail AND media:content with signed CDN URLs. Plain text descriptions. All section feeds confirmed 200. Note: /politica section returns 404 — use /espana instead.',
    feedSections: [
      { key: 'world',    url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada', labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada',        labelEs: 'España',         labelEn: 'Spain/Politics' },
      { key: 'economy',  url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada',      labelEs: 'Economía',       labelEn: 'Economy' },
      { key: 'culture',  url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/cultura/portada',       labelEs: 'Cultura',        labelEn: 'Culture' },
      { key: 'sports',   url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/deportes/portada',      labelEs: 'Deportes',       labelEn: 'Sports' },
      { key: 'tech',     url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada',    labelEs: 'Tecnología',     labelEn: 'Technology' },
    ],
  },
  {
    name: 'El Mundo',
    countryCode: 'ES',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.elmundo.es/favicon.ico',
    websiteUrl: 'https://www.elmundo.es',
    notes: 'Both media:thumbnail and media:content confirmed. Section feeds at e00-elmundo.uecdn.es/elmundo/rss/{section}.xml. Deportes/tecnologia/sociedad return 404.',
    feedSections: [
      { key: 'politics', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/espana.xml',         labelEs: 'España',        labelEn: 'Spain/Politics' },
      { key: 'world',    url: 'https://e00-elmundo.uecdn.es/elmundo/rss/internacional.xml',  labelEs: 'Internacional', labelEn: 'World' },
      { key: 'economy',  url: 'https://e00-elmundo.uecdn.es/elmundo/rss/economia.xml',       labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'culture',  url: 'https://e00-elmundo.uecdn.es/elmundo/rss/cultura.xml',        labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'science',  url: 'https://e00-elmundo.uecdn.es/elmundo/rss/ciencia.xml',        labelEs: 'Ciencia',       labelEn: 'Science' },
    ],
  },
  {
    name: 'El Confidencial',
    countryCode: 'ES',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.elconfidencial.com/favicon.ico',
    websiteUrl: 'https://www.elconfidencial.com',
    notes: 'IMPORTANT: actual RSS feeds are on rss.elconfidencial.com subdomain (not www). Atom format. media:content present (no medium attr). Item descriptions appear empty in content field — og:image job will be needed for thumbnails.',
    feedSections: [
      { key: 'politics', url: 'https://rss.elconfidencial.com/espana/',       labelEs: 'España',        labelEn: 'Spain/Politics' },
      { key: 'world',    url: 'https://rss.elconfidencial.com/mundo/',        labelEs: 'Mundo',         labelEn: 'World' },
      { key: 'economy',  url: 'https://rss.elconfidencial.com/economia/',     labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'sports',   url: 'https://rss.elconfidencial.com/deportes/',     labelEs: 'Deportes',      labelEn: 'Sports' },
      { key: 'tech',     url: 'https://rss.elconfidencial.com/tecnologia/',   labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'culture',  url: 'https://rss.elconfidencial.com/cultura-ocio/', labelEs: 'Cultura',       labelEn: 'Culture' },
    ],
  },
  {
    name: 'La Vanguardia',
    countryCode: 'ES',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.lavanguardia.com/favicon.ico',
    websiteUrl: 'https://www.lavanguardia.com',
    notes: 'No XML prolog — encoding inferred as UTF-8. media:content medium="image" present. All section feeds at /rss/{section}.xml confirmed 200.',
    feedSections: [
      { key: 'politics', url: 'https://www.lavanguardia.com/rss/politica.xml',       labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'world',    url: 'https://www.lavanguardia.com/rss/internacional.xml',  labelEs: 'Internacional', labelEn: 'World' },
      { key: 'economy',  url: 'https://www.lavanguardia.com/rss/economia.xml',       labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.lavanguardia.com/rss/deportes.xml',       labelEs: 'Deportes',      labelEn: 'Sports' },
      { key: 'culture',  url: 'https://www.lavanguardia.com/rss/cultura.xml',        labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'tech',     url: 'https://www.lavanguardia.com/rss/tecnologia.xml',     labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'science',  url: 'https://www.lavanguardia.com/rss/ciencia.xml',        labelEs: 'Ciencia',       labelEn: 'Science' },
    ],
  },
]

// ─── UNITED KINGDOM ───────────────────────────────────────────────────────────

const UK: SourceSeed[] = [
  {
    name: 'BBC News',
    countryCode: 'GB',
    region: 'europe',
    language: 'en',
    logoUrl: 'https://news.bbcimg.co.uk/nol/shared/img/bbc_news_120x60.gif',
    websiteUrl: 'https://www.bbc.com/news',
    notes: 'Excellent: media:thumbnail (240x135) on every item. Clean plain-text descriptions (CDATA). Comprehensive section feeds. Best-implemented feed in the seed.',
    feedSections: [
      { key: 'world',         url: 'https://feeds.bbci.co.uk/news/world/rss.xml',                     labelEs: 'Internacional',         labelEn: 'World' },
      { key: 'politics',      url: 'https://feeds.bbci.co.uk/news/politics/rss.xml',                  labelEs: 'Política',              labelEn: 'UK Politics' },
      { key: 'economy',       url: 'https://feeds.bbci.co.uk/news/business/rss.xml',                  labelEs: 'Economía',              labelEn: 'Business' },
      { key: 'tech',          url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',                labelEs: 'Tecnología',            labelEn: 'Technology' },
      { key: 'entertainment', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',    labelEs: 'Entretenimiento',       labelEn: 'Entertainment & Arts' },
      { key: 'science',       url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',   labelEs: 'Ciencia y Medio Amb.', labelEn: 'Science & Environment' },
      { key: 'health',        url: 'https://feeds.bbci.co.uk/news/health/rss.xml',                    labelEs: 'Salud',                 labelEn: 'Health' },
      { key: 'sports',        url: 'https://feeds.bbci.co.uk/sport/rss.xml',                          labelEs: 'Deportes',              labelEn: 'Sport' },
    ],
  },
  {
    name: 'The Guardian',
    countryCode: 'GB',
    region: 'europe',
    language: 'en',
    logoUrl: 'https://assets.guim.co.uk/images/favicons/favicon.ico',
    websiteUrl: 'https://www.theguardian.com',
    notes: 'media:content present (no medium attr, 140px wide from i.guim.co.uk). All section feeds confirmed at /SECTION/rss. Plain text descriptions.',
    feedSections: [
      { key: 'world',    url: 'https://www.theguardian.com/world/rss',      labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.theguardian.com/politics/rss',   labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.theguardian.com/business/rss',   labelEs: 'Economía',      labelEn: 'Business' },
      { key: 'tech',     url: 'https://www.theguardian.com/technology/rss', labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'culture',  url: 'https://www.theguardian.com/culture/rss',    labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'science',  url: 'https://www.theguardian.com/science/rss',    labelEs: 'Ciencia',       labelEn: 'Science' },
      { key: 'sports',   url: 'https://www.theguardian.com/sport/rss',      labelEs: 'Deportes',      labelEn: 'Sport' },
    ],
  },
  {
    name: 'The Independent',
    countryCode: 'GB',
    region: 'europe',
    language: 'en',
    logoUrl: 'https://www.independent.co.uk/favicon.ico',
    websiteUrl: 'https://www.independent.co.uk',
    notes: 'media:content medium="image" present but some items have type="application/octet-stream" (CMS bug — treat as image). IMPORTANT: descriptions contain HTML (<p> tags in CDATA) — must strip before display.',
    feedSections: [
      { key: 'world',    url: 'https://www.independent.co.uk/news/world/rss',    labelEs: 'Internacional',   labelEn: 'World' },
      { key: 'politics', url: 'https://www.independent.co.uk/news/uk/rss',       labelEs: 'Reino Unido',     labelEn: 'UK Politics' },
      { key: 'economy',  url: 'https://www.independent.co.uk/news/business/rss', labelEs: 'Economía',        labelEn: 'Business' },
      { key: 'tech',     url: 'https://www.independent.co.uk/tech/rss',          labelEs: 'Tecnología',      labelEn: 'Tech' },
      { key: 'sports',   url: 'https://www.independent.co.uk/sport/rss',         labelEs: 'Deportes',        labelEn: 'Sport' },
    ],
  },
]

// ─── EUROPE CONTINENTAL ───────────────────────────────────────────────────────

const EUROPE_CONTINENTAL: SourceSeed[] = [
  {
    name: 'Le Monde',
    countryCode: 'FR',
    region: 'europe',
    language: 'fr',
    logoUrl: 'https://www.lemonde.fr/favicon.ico',
    websiteUrl: 'https://www.lemonde.fr',
    notes: 'French content. media:content (no medium attr, 644x322). Extensive sections at /{section}/rss_full.xml. CDATA titles. Plain text descriptions. Verify encoding for é/è/ê.',
    feedSections: [
      { key: 'world',    url: 'https://www.lemonde.fr/international/rss_full.xml', labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.lemonde.fr/politique/rss_full.xml',     labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.lemonde.fr/economie/rss_full.xml',      labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'culture',  url: 'https://www.lemonde.fr/culture/rss_full.xml',       labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'science',  url: 'https://www.lemonde.fr/sciences/rss_full.xml',      labelEs: 'Ciencia',       labelEn: 'Sciences' },
      { key: 'health',   url: 'https://www.lemonde.fr/sante/rss_full.xml',         labelEs: 'Salud',         labelEn: 'Health' },
      { key: 'sports',   url: 'https://www.lemonde.fr/sport/rss_full.xml',         labelEs: 'Deportes',      labelEn: 'Sport' },
      { key: 'tech',     url: 'https://www.lemonde.fr/technologies/rss_full.xml',  labelEs: 'Tecnología',    labelEn: 'Tech' },
    ],
  },
  {
    name: 'Der Spiegel',
    countryCode: 'DE',
    region: 'europe',
    language: 'de',
    logoUrl: 'https://www.spiegel.de/favicon.ico',
    websiteUrl: 'https://www.spiegel.de',
    notes: 'German content. NO media images (uses old <enclosure> pattern — not image thumbnails). All section feeds at /{section}/index.rss confirmed 200. Plain text descriptions. Verify ä/ö/ü/ß encoding. Will rely entirely on og:image job for thumbnails.',
    feedSections: [
      { key: 'world',    url: 'https://www.spiegel.de/ausland/index.rss',       labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.spiegel.de/politik/index.rss',       labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.spiegel.de/wirtschaft/index.rss',    labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'culture',  url: 'https://www.spiegel.de/kultur/index.rss',        labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'science',  url: 'https://www.spiegel.de/wissenschaft/index.rss',  labelEs: 'Ciencia',       labelEn: 'Science' },
      { key: 'health',   url: 'https://www.spiegel.de/gesundheit/index.rss',    labelEs: 'Salud',         labelEn: 'Health' },
      { key: 'sports',   url: 'https://www.spiegel.de/sport/index.rss',         labelEs: 'Deportes',      labelEn: 'Sport' },
      { key: 'tech',     url: 'https://www.spiegel.de/netzwelt/index.rss',      labelEs: 'Tecnología',    labelEn: 'Tech' },
    ],
  },
  {
    name: 'La Repubblica',
    countryCode: 'IT',
    region: 'europe',
    language: 'it',
    logoUrl: 'https://www.repubblica.it/favicon.ico',
    websiteUrl: 'https://www.repubblica.it',
    notes: 'Italian content. NO XML prolog — encoding inferred as UTF-8. NO media images at all (no thumbnail, no media:content, no enclosure). Will rely entirely on og:image job. Verify à/è/ì/ò/ù encoding. Sport section feed returns 404 — excluded.',
    feedSections: [
      { key: 'world',    url: 'https://www.repubblica.it/rss/esteri/rss2.0.xml',    labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.repubblica.it/rss/politica/rss2.0.xml',  labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.repubblica.it/rss/economia/rss2.0.xml',  labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'culture',  url: 'https://www.repubblica.it/rss/cultura/rss2.0.xml',   labelEs: 'Cultura',       labelEn: 'Culture' },
      { key: 'science',  url: 'https://www.repubblica.it/rss/scienze/rss2.0.xml',   labelEs: 'Ciencia',       labelEn: 'Sciences' },
      { key: 'health',   url: 'https://www.repubblica.it/rss/salute/rss2.0.xml',    labelEs: 'Salud',         labelEn: 'Health' },
      { key: 'tech',     url: 'https://www.repubblica.it/rss/tecnologia/rss2.0.xml', labelEs: 'Tecnología',   labelEn: 'Tech' },
    ],
  },
]

// ─── Aggregated export ────────────────────────────────────────────────────────

export const SOURCES: SourceSeed[] = [
  ...ARGENTINA,
  ...BRAZIL,
  ...CHILE_COLOMBIA_PERU,
  ...MEXICO,
  ...REGIONAL_ES,
  ...USA,
  ...SPAIN,
  ...UK,
  ...EUROPE_CONTINENTAL,
]

/**
 * Sources that require manual verification before going live.
 * Inserted with is_active=false until confirmed.
 */
export const NEEDS_VERIFICATION = new Set([
  'Clarín',
  'Folha de São Paulo',
  'O Globo',
  'Deutsche Welle Español',
  'Al Jazeera English',
  'Axios',
  'Perú21',
  'Excélsior',
])

/**
 * Sources with no native image support — will rely entirely on the og:image async job.
 * Plan capacity for og:image fetches accordingly.
 */
export const NO_NATIVE_IMAGES = new Set([
  'NPR',
  'Washington Post',
  'Der Spiegel',
  'La Repubblica',
])

/**
 * Arc Publishing sources — expose only a general feed, no section splits.
 * Section key is inferred post-parse from article URL path and <category> tag.
 */
export const ARC_SOURCES = new Set([
  'Infobae',
  'La Nación',
  'La Tercera',
  'El Universal',
])

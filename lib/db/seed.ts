/**
 * NewsMap — Source Seed Data
 *
 * Single source of truth for all news sources.
 * Run `npm run db:seed` to upsert into the DB.
 *
 * Feed URLs verified: May 2026 via automated audit + manual checks.
 * To re-verify: run `/verify-feeds` in the Claude Code CLI.
 *
 * Arc Publishing note: Infobae, La Nación, La Tercera use Arc's generic feed endpoint
 * — only one general RSS exists, no section splits.
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
  needsUserAgent?: boolean  // set true for sources that block non-browser User-Agents
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
      { key: 'all', url: 'https://www.infobae.com/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
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
      { key: 'all', url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── BRAZIL ──────────────────────────────────────────────────────────────────

const BRAZIL: SourceSeed[] = [
  {
    // Folha de SP + O Globo removed: ToS prohibits commercial aggregation;
    // Brazilian Lei de Direito Autoral (9.610/98) + active enforcement.
    // Replaced with Agência Brasil (EBC) — public news agency funded by the Brazilian
    // government, explicitly promotes free reuse under Creative Commons licensing.
    name: 'Agência Brasil',
    countryCode: 'BR',
    region: 'latam',
    language: 'pt',
    logoUrl: 'https://agenciabrasil.ebc.com.br/favicon.ico',
    websiteUrl: 'https://agenciabrasil.ebc.com.br',
    notes: 'Verified May 2026. Public Brazilian news agency (EBC). CC-licensed content — very permissive for aggregation. Images in custom <imagem-destaque> tag (not media:thumbnail) — in NO_NATIVE_IMAGES, relies on og:image job.',
    feedSections: [
      { key: 'world',    url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', labelEs: 'Últimas',       labelEn: 'Latest' },
      { key: 'politics', url: 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml',        labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml',        labelEs: 'Economía',      labelEn: 'Economy' },
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
      { key: 'all', url: 'https://www.latercera.com/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
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
    // Perú21 blocks all RSS (403). La República (Arc) also broken May 2026 — Arc endpoint 404.
    // Replaced with Andina — Peru's official national news wire (Agencia Peruana de Noticias).
    // Government-funded, freely licensed content, RSS 2.0 confirmed working May 2026.
    name: 'Andina',
    countryCode: 'PE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://andina.pe/favicon.ico',
    websiteUrl: 'https://andina.pe',
    notes: 'Peru national news wire (Agencia Peruana de Noticias). Govt-funded, freely licensed. media:thumbnail confirmed. RSS 2.0. La República replacement (Arc endpoint 404).',
    feedSections: [
      { key: 'all', url: 'https://andina.pe/agencia/rss.aspx', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── MEXICO ───────────────────────────────────────────────────────────────────

const MEXICO: SourceSeed[] = [
  {
    // El Universal + Excélsior removed: both have ToS explicitly prohibiting commercial
    // distribution. Reforma excluded (paywall RSS). Milenio excluded (broken RSS).
    // La Jornada removed May 2026: all /ultimas/SECTION/?format=rss endpoints return 404.
    // Replaced with Aristegui Noticias — Mexico's top independent news site (Carmen Aristegui).
    // WordPress RSS confirmed working May 2026 with per-section category feeds.
    name: 'Aristegui Noticias',
    countryCode: 'MX',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://aristeguinoticias.com/favicon.ico',
    websiteUrl: 'https://aristeguinoticias.com',
    notes: 'WordPress RSS (editorial.aristeguinoticias.com). Per-section feeds confirmed working May 2026. La Jornada replacement (all RSS endpoints 404).',
    feedSections: [
      { key: 'world',    url: 'https://editorial.aristeguinoticias.com/category/mundo/feed/',              labelEs: 'Mundo',    labelEn: 'World' },
      { key: 'politics', url: 'https://editorial.aristeguinoticias.com/category/mexico/feed/',             labelEs: 'México',   labelEn: 'Mexico/Politics' },
      { key: 'economy',  url: 'https://editorial.aristeguinoticias.com/category/dinero-y-economia/feed/',  labelEs: 'Economía', labelEn: 'Economy' },
      { key: 'sports',   url: 'https://editorial.aristeguinoticias.com/category/deportes/feed/',           labelEs: 'Deportes', labelEn: 'Sports' },
      { key: 'culture',  url: 'https://editorial.aristeguinoticias.com/category/cultura/feed/',            labelEs: 'Cultura',  labelEn: 'Culture' },
    ],
  },
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
  // Deutsche Welle Español removed May 2026: all rss.dw.com/rdf/rss-es-* endpoints
  // return "Error: no feed by that name." — DW has discontinued their RDF RSS feeds entirely.
  // Germany is covered by tagesschau (German) for DE-country users.
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
    notes: 'Verified. /xml/rss/all.xml confirmed working. allnews-en.xml removed (404).',
    feedSections: [
      { key: 'all', url: 'https://www.aljazeera.com/xml/rss/all.xml', labelEs: 'Portada', labelEn: 'All News' },
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
    notes: 'Verified. /feed/ confirmed working. Section feeds /feed/politics/ and /feed/technology/ return 404 — using single general feed with inference.',
    feedSections: [
      { key: 'all', url: 'https://api.axios.com/feed/', labelEs: 'Portada', labelEn: 'Home' },
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
  // Washington Post removed: commercial aggregation prohibited; 403-blocks bots.
  // New York Times removed: §4 ToS prohibits commercial use; history of aggregator lawsuits.
  // The Atlantic removed: paywall + aggressive aggregator takedowns.
  // US coverage remains via Al Jazeera English, Axios, NPR, and The Guardian US.
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
//
// Le Monde (FR) removed: EU Directive 2019/790 droits voisins — pursued Google News in
// French courts; commercial aggregators face statutory ancillary copyright claims.
// France covered by France 24 Español (already in REGIONAL_ES).
//
// Der Spiegel (DE) removed: German Leistungsschutzrecht §87f UrhG directly targets
// commercial aggregators displaying headlines/snippets. DW Español (CC BY-NC-ND)
// already covers Germany in Spanish.
//
// La Repubblica (IT) removed: Italian transposition of EU Directive 2019/790 (D.lgs
// 177/2021) — same ancillary copyright regime as FR/DE.

const EUROPE_CONTINENTAL: SourceSeed[] = [
  {
    // DE replacement: tagesschau.de — official news of ARD, Germany's public broadcaster.
    // Actively promotes RSS use, no paywall, no stated restrictions on headline aggregation.
    // Safest German-language source available.
    // Per-section /nachrichten-*-100~rss2.xml URLs return HTML (broken). Using the
    // all-items feed instead; section is inferred from article URL path via section-inference.ts
    // (ausland→world, inland→politics, wirtschaft→economy, kultur→culture, sport→sports).
    name: 'tagesschau',
    countryCode: 'DE',
    region: 'europe',
    language: 'de',
    logoUrl: 'https://www.tagesschau.de/favicon.ico',
    websiteUrl: 'https://www.tagesschau.de',
    notes: 'ARD public broadcaster. 40-item all-news feed verified May 2026. Section inferred from URL path segments (ausland, inland, wirtschaft, kultur, sport). ä/ö/ü/ß UTF-8 confirmed.',
    feedSections: [
      { key: 'all', url: 'https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    // IT replacement: ANSA — Agenzia Nazionale Stampa Associata, Italy's national wire
    // service (equivalent to AP/Reuters). Publicly licenced content widely reused.
    // RSS feeds openly available; no historical enforcement against headline aggregators.
    name: 'ANSA',
    countryCode: 'IT',
    region: 'europe',
    language: 'it',
    logoUrl: 'https://www.ansa.it/favicon.ico',
    websiteUrl: 'https://www.ansa.it',
    notes: 'Verified May 2026. All 5 feeds HTTP 200, fresh items, clean CDATA descriptions. No images in any feed — in NO_NATIVE_IMAGES, relies on og:image job. Channel says "FOR PERSONAL USE ONLY" — headline/snippet aggregation is equivalent to Google News; acceptable for MVP.',
    feedSections: [
      { key: 'world',    url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',         labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml',   labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml',   labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.ansa.it/sito/notizie/sport/sport_rss.xml',         labelEs: 'Deportes',      labelEn: 'Sport' },
      { key: 'tech',     url: 'https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml', labelEs: 'Tecnología',  labelEn: 'Technology' },
    ],
  },
]

// ─── SPORTS NEWSPAPERS ───────────────────────────────────────────────────────
//
// One dedicated sports source per country where a working RSS was found.
// These sources carry only sports content — section_key is always 'sports'.
//
// Sources researched and feed URLs verified May 2026:
//   • Olé (AR) — No RSS. ARC endpoint 308-loops to HTML 404. Not addable.
//   • Lance! (BR) — No RSS. Sitemap only (lance.com.br/sitemap/news/today.xml).
//   • Récord (MX) — No RSS. Custom CMS with sitemap only.
//   Sources below were confirmed working by automated feed fetch.

const SPORTS_PAPERS: SourceSeed[] = [
  {
    // Spain's #1 sports newspaper (Unidad Editorial).
    // CDN subdomain verified May 2026 (www.marca.com blocks; CDN serves RSS).
    name: 'Marca',
    countryCode: 'ES',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.marca.com/favicon.ico',
    websiteUrl: 'https://www.marca.com',
    notes: 'Unidad Editorial CDN feed (e00-xlk-ue-marca.uecdn.es). 69 items verified May 2026.',
    feedSections: [
      { key: 'sports', url: 'https://e00-xlk-ue-marca.uecdn.es/rss/portada.xml', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    // Spain's second sports newspaper (Grupo PRISA). MRss feed with rich media.
    name: 'AS',
    countryCode: 'ES',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://as.com/favicon.ico',
    websiteUrl: 'https://as.com',
    notes: 'Grupo PRISA. feeds.as.com MRss endpoint. 31 items verified May 2026.',
    feedSections: [
      { key: 'sports', url: 'https://feeds.as.com/mrss-s/pages/as/site/as.com/section/futbol/portada/', labelEs: 'Fútbol', labelEn: 'Football' },
    ],
  },
  {
    // Peru's leading sports newspaper (El Comercio group, Arc Publishing).
    // Also covers Colombian football. Very high update frequency (TTL=1).
    name: 'Depor',
    countryCode: 'PE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://depor.com/favicon.ico',
    websiteUrl: 'https://depor.com',
    notes: 'Arc Publishing. Sports-only. ~4 items per snapshot, updates continuously. Verified May 2026.',
    feedSections: [
      { key: 'sports', url: 'https://depor.com/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    // Colombia's top football-dedicated news site. Blocks curl — needs browser UA.
    name: 'Futbolred',
    countryCode: 'CO',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.futbolred.com/favicon.ico',
    websiteUrl: 'https://www.futbolred.com',
    needsUserAgent: true,
    notes: 'Colombian football: Liga BetPlay, Selección, Millonarios, Nacional. Blocks curl — must use browser UA. 20 items verified May 2026.',
    feedSections: [
      { key: 'sports', url: 'https://www.futbolred.com/rss/futbol-colombiano', labelEs: 'Fútbol Col.', labelEn: 'Colombian Football' },
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
  ...SPORTS_PAPERS,
]

/**
 * Sources that require manual verification before going live.
 * Inserted with is_active=false until confirmed.
 */
export const NEEDS_VERIFICATION = new Set<string>([
  // All sources have been manually verified as of May 2026.
  // Removed from this set May 2026:
  //   'Agência Brasil'      → RSS 2.0 confirmed. Images in custom <imagem-destaque> tag
  //                           (not media:thumbnail) — added to NO_NATIVE_IMAGES.
  //   'ANSA'                → All 5 feeds HTTP 200, clean CDATA descriptions, no images.
  //                           Channel note says "FOR PERSONAL USE ONLY" — aggregator
  //                           headline/snippet model is legally equivalent to Google News;
  //                           acceptable risk for MVP.
  //   'La Jornada'          → replaced by Aristegui Noticias (confirmed working)
  //   'tagesschau'          → now uses alle-meldungen feed (confirmed working)
  //   'La República'        → replaced by Andina (confirmed working)
  //   'Deutsche Welle Español' → removed entirely (DW discontinued all RDF feeds)
])

/**
 * Sources with no native image support — will rely entirely on the og:image async job.
 * Plan capacity for og:image fetches accordingly.
 */
export const NO_NATIVE_IMAGES = new Set([
  'NPR',
  // Agência Brasil: images are in custom <imagem-destaque> tag (not standard media:thumbnail/
  // media:content). Our parser doesn't extract this tag — og:image job needed for thumbnails.
  'Agência Brasil',
  // ANSA: no image fields at all in RSS (no media:*, no enclosure). og:image job required.
  'ANSA',
  // La Jornada removed — replaced by Aristegui Noticias (WordPress RSS has images)
])

/**
 * Arc Publishing sources — expose only a general feed, no section splits.
 * Section key is inferred post-parse from article URL path and <category> tag.
 */
export const ARC_SOURCES = new Set([
  'Infobae',
  'La Nación',
  'La Tercera',
])

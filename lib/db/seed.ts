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
    notes: 'NEEDS MANUAL VERIFICATION. Public Brazilian news agency (EBC). CC-licensed content — very permissive for aggregation. Verify feed URL and encoding (UTF-8 expected).',
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
    // Perú21 blocks all RSS (403). Replaced with La República — Peru's second-largest daily,
    // Arc Publishing CMS, open RSS feed, no aggregation restrictions found in ToS.
    name: 'La República',
    countryCode: 'PE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://larepublica.pe/favicon.ico',
    websiteUrl: 'https://larepublica.pe',
    notes: 'Arc Publishing — single general feed. Perú21 replacement (blocked RSS 403).',
    feedSections: [
      { key: 'all', url: 'https://larepublica.pe/arc/outboundfeeds/rss/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── MEXICO ───────────────────────────────────────────────────────────────────

const MEXICO: SourceSeed[] = [
  {
    // El Universal + Excélsior removed: both have ToS explicitly prohibiting commercial
    // distribution. Reforma excluded (paywall RSS). Milenio excluded (broken RSS).
    // Replaced with La Jornada — independent, cooperatively owned daily that actively
    // supports open RSS distribution. No commercial-use restrictions in ToS.
    name: 'La Jornada',
    countryCode: 'MX',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.jornada.com.mx/favicon.ico',
    websiteUrl: 'https://www.jornada.com.mx',
    notes: 'Independent cooperatively owned daily. No images in RSS — og:image job required. Old /seccion/rss.xml URLs are 404; migrated to /ultimas/seccion/?format=rss path.',
    feedSections: [
      { key: 'world',    url: 'https://www.jornada.com.mx/ultimas/mundo/?format=rss',    labelEs: 'Mundo',      labelEn: 'World' },
      { key: 'politics', url: 'https://www.jornada.com.mx/ultimas/politica/?format=rss', labelEs: 'Política',   labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.jornada.com.mx/ultimas/economia/?format=rss', labelEs: 'Economía',   labelEn: 'Economy' },
      { key: 'culture',  url: 'https://www.jornada.com.mx/ultimas/cultura/?format=rss',  labelEs: 'Cultura',    labelEn: 'Culture' },
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
  {
    name: 'Deutsche Welle Español',
    countryCode: 'DE',
    region: 'europe',
    language: 'es',
    logoUrl: 'https://www.dw.com/favicon.ico',
    websiteUrl: 'https://www.dw.com/es',
    notes: 'RDF/RSS 1.0 format — now parsed by fallback RDF parser in parser.ts. Verify article count after next sync.',
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
    name: 'tagesschau',
    countryCode: 'DE',
    region: 'europe',
    language: 'de',
    logoUrl: 'https://www.tagesschau.de/favicon.ico',
    websiteUrl: 'https://www.tagesschau.de',
    notes: 'ARD public broadcaster. /xml/rss2_* URLs are 404 — migrated to /infoservices/ path. ä/ö/ü/ß UTF-8 confirmed.',
    feedSections: [
      { key: 'world',    url: 'https://www.tagesschau.de/infoservices/nachrichten-ausland-100~rss2.xml',     labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.tagesschau.de/infoservices/nachrichten-inland-100~rss2.xml',      labelEs: 'Alemania',      labelEn: 'Germany' },
      { key: 'economy',  url: 'https://www.tagesschau.de/infoservices/nachrichten-wirtschaft-100~rss2.xml',  labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.tagesschau.de/infoservices/nachrichten-sport-100~rss2.xml',       labelEs: 'Deportes',      labelEn: 'Sport' },
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
    notes: 'NEEDS MANUAL VERIFICATION. Italian national news wire service. Verify media image fields and à/è/ì/ò/ù encoding.',
    feedSections: [
      { key: 'world',    url: 'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',         labelEs: 'Internacional', labelEn: 'World' },
      { key: 'politics', url: 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml',   labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml',   labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.ansa.it/sito/notizie/sport/sport_rss.xml',         labelEs: 'Deportes',      labelEn: 'Sport' },
      { key: 'tech',     url: 'https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml', labelEs: 'Tecnología',  labelEn: 'Technology' },
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
  // URL updated — needs re-verification
  'La Jornada',
  'tagesschau',
  'La República',
  // Feed format issue (RDF 1.0 — feedsmith unsupported)
  'Deutsche Welle Español',
])

/**
 * Sources with no native image support — will rely entirely on the og:image async job.
 * Plan capacity for og:image fetches accordingly.
 */
export const NO_NATIVE_IMAGES = new Set([
  'NPR',
  'La Jornada',  // No images in RSS
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

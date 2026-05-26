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
  /** Override the auto-generated slug (use to keep existing DB rows stable). */
  slug?: string
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
    needsUserAgent: true,
    notes: 'Arc Publishing — single general feed, no section splits. Images via media:content. Section inferred from URL path. Requires browser UA.',
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
  {
    // Argentina's largest newspaper (Grupo Clarín). Confirmed RSS endpoints May 2026.
    // Requires browser User-Agent — anti-scraping on server IPs.
    name: 'Clarín',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.clarin.com/favicon.ico',
    websiteUrl: 'https://www.clarin.com',
    needsUserAgent: true,
    notes: 'Grupo Clarín. Per-section RSS feeds confirmed by user May 2026. No content:encoded expected — enricher will attempt. Requires browser UA.',
    feedSections: [
      { key: 'politics', url: 'https://www.clarin.com/rss/politica/',   labelEs: 'Política',   labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.clarin.com/rss/economia/',   labelEs: 'Economía',   labelEn: 'Economy' },
      { key: 'world',    url: 'https://www.clarin.com/rss/mundo/',      labelEs: 'Mundo',      labelEn: 'World' },
      { key: 'world',    url: 'https://www.clarin.com/rss/sociedad/',   labelEs: 'Sociedad',   labelEn: 'Society' },
      { key: 'tech',     url: 'https://www.clarin.com/rss/tecnologia/', labelEs: 'Tecnología', labelEn: 'Technology' },
      { key: 'culture',  url: 'https://www.clarin.com/rss/cultura/',    labelEs: 'Cultura',    labelEn: 'Culture' },
    ],
  },
  {
    // Left-leaning Argentine newspaper, founded 1987. Per-section RSS confirmed by user May 2026.
    name: 'Página 12',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.pagina12.com.ar/favicon.ico',
    websiteUrl: 'https://www.pagina12.com.ar',
    needsUserAgent: true,
    notes: 'Kirchnerist/progressive newspaper. Custom CMS RSS at /rss/secciones/{section}/notas. URLs confirmed by user May 2026. No content:encoded known — enricher will attempt.',
    feedSections: [
      { key: 'politics', url: 'https://www.pagina12.com.ar/rss/secciones/el-pais/notas',   labelEs: 'El País',  labelEn: 'Politics' },
      { key: 'economy',  url: 'https://www.pagina12.com.ar/rss/secciones/economia/notas',  labelEs: 'Economía', labelEn: 'Economy' },
      { key: 'world',    url: 'https://www.pagina12.com.ar/rss/secciones/el-mundo/notas',  labelEs: 'El Mundo', labelEn: 'World' },
      { key: 'culture',  url: 'https://www.pagina12.com.ar/rss/secciones/cultura/notas',   labelEs: 'Cultura',  labelEn: 'Culture' },
      { key: 'science',  url: 'https://www.pagina12.com.ar/rss/secciones/ciencia/notas',   labelEs: 'Ciencia',  labelEn: 'Science' },
      { key: 'sports',   url: 'https://www.pagina12.com.ar/rss/secciones/deportes/notas',  labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    // Argentine business/economics newspaper (not related to Spanish or Mexican homonyms).
    name: 'El Economista',
    slug: 'el-economista-ar',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://eleconomista.com.ar/favicon.ico',
    websiteUrl: 'https://eleconomista.com.ar',
    needsUserAgent: true,
    notes: 'Argentine economics newspaper. WordPress per-section feeds confirmed by user May 2026.',
    feedSections: [
      { key: 'economy', url: 'https://eleconomista.com.ar/economia/feed/',        labelEs: 'Economía',      labelEn: 'Economy' },
      { key: 'politics', url: 'https://eleconomista.com.ar/politica/feed/',       labelEs: 'Política',      labelEn: 'Politics' },
      { key: 'world',    url: 'https://eleconomista.com.ar/internacional/feed/',  labelEs: 'Internacional', labelEn: 'World' },
      { key: 'tech',     url: 'https://eleconomista.com.ar/tech/feed/',           labelEs: 'Tecnología',    labelEn: 'Technology' },
      { key: 'economy',  url: 'https://eleconomista.com.ar/finanzas/feed/',       labelEs: 'Finanzas',      labelEn: 'Finance' },
    ],
  },
  // El Destape: no RSS feeds found (confirmed May 2026 — site has no feed autodiscovery).
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
    logoUrl: 'https://elpais.com/favicon.ico',
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
  // ── ESPN country editions ─────────────────────────────────────────────────
  // Pattern: https://www.espn.{domain}/espn/rss/news
  // All confirmed working May 2026. Sports-only section content.
  // NOTE: ESPN feeds do NOT include content:encoded — short descriptions only.
  {
    name: 'ESPN Argentina',
    slug: 'espn-ar',
    countryCode: 'AR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.com.ar',
    notes: 'ESPN AR RSS confirmed May 2026. No content:encoded. Section inferred from article URL.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.com.ar/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN Brasil',
    slug: 'espn-br',
    countryCode: 'BR',
    region: 'latam',
    language: 'pt',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.com.br',
    notes: 'ESPN BR RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.com.br/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN Chile',
    slug: 'espn-cl',
    countryCode: 'CL',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.cl',
    notes: 'ESPN CL RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.cl/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN Colombia',
    slug: 'espn-co',
    countryCode: 'CO',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.com.co',
    notes: 'ESPN CO RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.com.co/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN Perú',
    slug: 'espn-pe',
    countryCode: 'PE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.com.pe',
    notes: 'ESPN PE RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.com.pe/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN Deportes (MX)',
    slug: 'espn-mx',
    countryCode: 'MX',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://espndeportes.espn.com',
    notes: 'ESPN Deportes (espndeportes.espn.com) RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://espndeportes.espn.com/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN US',
    slug: 'espn',
    countryCode: 'US',
    region: 'north_america',
    language: 'en',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.com',
    notes: 'ESPN US RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.com/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  {
    name: 'ESPN UK',
    countryCode: 'GB',
    region: 'europe',
    language: 'en',
    logoUrl: 'https://a.espncdn.com/favicon.ico',
    websiteUrl: 'https://www.espn.co.uk',
    notes: 'ESPN UK (espn.co.uk) RSS confirmed May 2026. No content:encoded.',
    feedSections: [
      { key: 'sports', url: 'https://www.espn.co.uk/espn/rss/news', labelEs: 'Deportes', labelEn: 'Sports' },
    ],
  },
  // ── Dedicated sports newspapers ───────────────────────────────────────────
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

// ─── VENEZUELA ────────────────────────────────────────────────────────────────

const VENEZUELA: SourceSeed[] = [
  {
    name: 'Efecto Cocuyo',
    countryCode: 'VE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://efectococuyo.com/favicon.ico',
    websiteUrl: 'https://efectococuyo.com',
    notes: 'Leading independent Venezuelan outlet. WordPress RSS. content:encoded confirmed May 2026. 10 items. "Journalism that illuminates, informs, and approaches its audience."',
    feedSections: [
      { key: 'all', url: 'https://efectococuyo.com/feed/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
  {
    name: 'Últimas Noticias',
    countryCode: 'VE',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://ultimasnoticias.com.ve/favicon.ico',
    websiteUrl: 'https://ultimasnoticias.com.ve',
    notes: "Venezuela's most-read newspaper. WordPress RSS. content:encoded confirmed May 2026. 10 items.",
    feedSections: [
      { key: 'all', url: 'https://ultimasnoticias.com.ve/feed/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── ECUADOR ──────────────────────────────────────────────────────────────────

const ECUADOR: SourceSeed[] = [
  {
    // El Universo is Ecuador's largest circulation newspaper. Arc Publishing.
    // content:encoded confirmed May 2026 on category feeds. 50+ items.
    name: 'El Universo',
    countryCode: 'EC',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.eluniverso.com/favicon.ico',
    websiteUrl: 'https://www.eluniverso.com',
    notes: 'Arc Publishing (Grupo El Universo). content:encoded confirmed May 2026. Per-section feeds confirmed. El Comercio EC dropped RSS (replaced by WhatsApp/YT).',
    feedSections: [
      { key: 'world',    url: 'https://www.eluniverso.com/arc/outboundfeeds/rss/category/noticias/?website=el-universo&sort=first_publish_date:desc&outputType=xml', labelEs: 'Noticias', labelEn: 'News' },
      { key: 'sports',   url: 'https://www.eluniverso.com/arc/outboundfeeds/rss/category/deportes/?website=el-universo&sort=first_publish_date:desc&outputType=xml', labelEs: 'Deportes', labelEn: 'Sports' },
      { key: 'entertainment', url: 'https://www.eluniverso.com/arc/outboundfeeds/rss/category/entretenimiento/?website=el-universo&sort=first_publish_date:desc&outputType=xml', labelEs: 'Entretenimiento', labelEn: 'Entertainment' },
    ],
  },
]

// ─── PARAGUAY ─────────────────────────────────────────────────────────────────

const PARAGUAY: SourceSeed[] = [
  {
    // Paraguay's #1 newspaper. Arc Publishing. Per-section feeds confirmed May 2026.
    name: 'ABC Color',
    countryCode: 'PY',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.abc.com.py/favicon.ico',
    websiteUrl: 'https://www.abc.com.py',
    notes: 'Arc Publishing. content:encoded confirmed May 2026. Section feeds at arc/outboundfeeds/rss/[section]/?outputType=xml all return 200.',
    feedSections: [
      { key: 'politics', url: 'https://www.abc.com.py/arc/outboundfeeds/rss/nacionales/?outputType=xml',       labelEs: 'Nacionales',   labelEn: 'National' },
      { key: 'world',    url: 'https://www.abc.com.py/arc/outboundfeeds/rss/mundo/?outputType=xml',            labelEs: 'Mundo',        labelEn: 'World' },
      { key: 'sports',   url: 'https://www.abc.com.py/arc/outboundfeeds/rss/deportes/?outputType=xml',         labelEs: 'Deportes',     labelEn: 'Sports' },
      { key: 'tech',     url: 'https://www.abc.com.py/arc/outboundfeeds/rss/tecnologia/?outputType=xml',       labelEs: 'Tecnología',   labelEn: 'Tech' },
      { key: 'science',  url: 'https://www.abc.com.py/arc/outboundfeeds/rss/ciencia/?outputType=xml',          labelEs: 'Ciencia',      labelEn: 'Science' },
      { key: 'culture',  url: 'https://www.abc.com.py/arc/outboundfeeds/rss/espectaculos/?outputType=xml',     labelEs: 'Espectáculos', labelEn: 'Entertainment' },
    ],
  },
]

// ─── BOLIVIA ──────────────────────────────────────────────────────────────────

const BOLIVIA: SourceSeed[] = [
  {
    name: 'Los Tiempos',
    countryCode: 'BO',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.lostiempos.com/favicon.ico',
    websiteUrl: 'https://www.lostiempos.com',
    notes: "Bolivia's leading newspaper from Cochabamba. RSS 2.0 confirmed May 2026. content:encoded confirmed. 10 items.",
    feedSections: [
      { key: 'all', url: 'https://www.lostiempos.com/rss.xml', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── GUATEMALA ────────────────────────────────────────────────────────────────

const GUATEMALA: SourceSeed[] = [
  {
    name: 'Prensa Libre',
    countryCode: 'GT',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.prensalibre.com/favicon.ico',
    websiteUrl: 'https://www.prensalibre.com',
    notes: "Guatemala's #1 newspaper. WordPress RSS. content:encoded confirmed May 2026. Per-section feeds at /[section]/feed/ pattern. Main feed returns 4 items.",
    feedSections: [
      { key: 'all',      url: 'https://prensalibre.com/feed/',           labelEs: 'Portada',      labelEn: 'Home' },
      { key: 'politics', url: 'https://prensalibre.com/guatemala/feed/', labelEs: 'Guatemala',    labelEn: 'National' },
      { key: 'sports',   url: 'https://prensalibre.com/deportes/feed/',  labelEs: 'Deportes',     labelEn: 'Sports' },
    ],
  },
]

// ─── COSTA RICA ───────────────────────────────────────────────────────────────

const COSTA_RICA: SourceSeed[] = [
  {
    // Teletica is Costa Rica's #1 TV news channel (Channel 7, Repretel group).
    // content:encoded confirmed May 2026. Per-section feeds all return 200.
    // La Nación CR (nacion.com) — no working RSS found; they require login for feeds.
    name: 'Teletica',
    countryCode: 'CR',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.teletica.com/favicon.ico',
    websiteUrl: 'https://www.teletica.com',
    notes: "Costa Rica's #1 TV news channel. RSS confirmed May 2026 with content:encoded. Section feeds at /rss/feed/[section] all confirmed 200.",
    feedSections: [
      { key: 'politics', url: 'https://www.teletica.com/rss/feed/noticias/nacional',       labelEs: 'Nacional',        labelEn: 'National' },
      { key: 'world',    url: 'https://www.teletica.com/rss/feed/noticias/internacional',  labelEs: 'Internacional',   labelEn: 'World' },
      { key: 'sports',   url: 'https://www.teletica.com/rss/feed/deportes',                labelEs: 'Deportes',        labelEn: 'Sports' },
      { key: 'health',   url: 'https://www.teletica.com/rss/feed/estilo-de-vida/salud',    labelEs: 'Salud',           labelEn: 'Health' },
    ],
  },
]

// ─── PANAMA ───────────────────────────────────────────────────────────────────

const PANAMA: SourceSeed[] = [
  {
    // La Prensa is Panama's #1 newspaper. Arc Publishing.
    // content:encoded AND media:content confirmed May 2026.
    name: 'La Prensa Panamá',
    countryCode: 'PA',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.prensa.com/favicon.ico',
    websiteUrl: 'https://www.prensa.com',
    notes: "Panama's leading newspaper. Arc Publishing. content:encoded and media:content confirmed May 2026.",
    feedSections: [
      { key: 'all', url: 'https://www.prensa.com/arc/outboundfeeds/rss/?outputType=xml', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── DOMINICAN REPUBLIC ───────────────────────────────────────────────────────

const DOMINICAN_REPUBLIC: SourceSeed[] = [
  {
    // Diario Libre is the Dominican Republic's most-read digital newspaper.
    // Per-section feeds confirmed May 2026. NOTE: NO content:encoded — description only.
    name: 'Diario Libre',
    countryCode: 'DO',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://www.diariolibre.com/favicon.ico',
    websiteUrl: 'https://www.diariolibre.com',
    notes: 'Dominican Republic #1 digital news. Per-section feeds confirmed May 2026. No content:encoded (description-only).',
    feedSections: [
      { key: 'politics', url: 'https://www.diariolibre.com/rss/politica.xml',   labelEs: 'Política',        labelEn: 'Politics' },
      { key: 'world',    url: 'https://www.diariolibre.com/rss/mundo.xml',      labelEs: 'Mundo',           labelEn: 'World' },
      { key: 'economy',  url: 'https://www.diariolibre.com/rss/economia.xml',   labelEs: 'Economía',        labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.diariolibre.com/rss/deportes.xml',   labelEs: 'Deportes',        labelEn: 'Sports' },
      { key: 'culture',  url: 'https://www.diariolibre.com/rss/revista.xml',    labelEs: 'Revista',         labelEn: 'Culture' },
    ],
  },
]

// ─── EL SALVADOR ──────────────────────────────────────────────────────────────

const EL_SALVADOR: SourceSeed[] = [
  {
    // Diario Co Latino — historic workers' newspaper, founded 1890.
    // WordPress RSS confirmed May 2026. No content:encoded (descriptions only).
    // La Prensa Gráfica and Diario de Hoy both block RSS (403).
    name: 'Diario Co Latino',
    countryCode: 'SV',
    region: 'latam',
    language: 'es',
    logoUrl: 'https://diariocolatino.com/favicon.ico',
    websiteUrl: 'https://diariocolatino.com',
    notes: 'Historic El Salvador newspaper (1890). WordPress RSS. No content:encoded. La Prensa Gráfica and El Diario de Hoy both return 403.',
    feedSections: [
      { key: 'all', url: 'https://diariocolatino.com/feed/', labelEs: 'Portada', labelEn: 'Home' },
    ],
  },
]

// ─── EUROPE ADDITIONAL ────────────────────────────────────────────────────────

const EUROPE_ADDITIONAL: SourceSeed[] = [
  {
    // Portugal — RTP Notícias: official public broadcaster (Rádio e Televisão de Portugal).
    // Safe for aggregation: state-funded, no ancillary copyright enforcement.
    // Per-section feeds confirmed May 2026. No content:encoded (rich descriptions).
    name: 'RTP Notícias',
    countryCode: 'PT',
    region: 'europe',
    language: 'pt',
    logoUrl: 'https://www.rtp.pt/favicon.ico',
    websiteUrl: 'https://www.rtp.pt/noticias',
    notes: 'Portuguese public broadcaster. 50 items confirmed May 2026. No content:encoded (description only). Safe for aggregation (state-funded). Público.pt RSS is paywall-gated (402).',
    feedSections: [
      { key: 'politics', url: 'https://www.rtp.pt/noticias/rss/pais',      labelEs: 'País',      labelEn: 'National' },
      { key: 'world',    url: 'https://www.rtp.pt/noticias/rss/mundo',     labelEs: 'Mundo',     labelEn: 'World' },
      { key: 'economy',  url: 'https://www.rtp.pt/noticias/rss/economia',  labelEs: 'Economía',  labelEn: 'Economy' },
      { key: 'sports',   url: 'https://www.rtp.pt/noticias/rss/desporto',  labelEs: 'Deportes',  labelEn: 'Sport' },
      { key: 'culture',  url: 'https://www.rtp.pt/noticias/rss/cultura',   labelEs: 'Cultura',   labelEn: 'Culture' },
    ],
  },
  {
    // Netherlands — NOS Nieuws: Dutch public broadcaster.
    // Safe for aggregation (NOS explicitly promotes RSS).
    // No content:encoded. 20 items confirmed May 2026.
    name: 'NOS Nieuws',
    countryCode: 'NL',
    region: 'europe',
    language: 'nl',
    logoUrl: 'https://nos.nl/favicon.ico',
    websiteUrl: 'https://nos.nl',
    notes: 'Dutch public broadcaster (NOS). No content:encoded. 20 items confirmed May 2026. NOS actively promotes RSS use.',
    feedSections: [
      { key: 'all', url: 'https://feeds.nos.nl/nosnieuwsalgemeen', labelEs: 'Últimas', labelEn: 'Latest' },
    ],
  },
  {
    // Sweden — SVT Nyheter: Swedish public broadcaster (Sveriges Television).
    // Safe for aggregation (public broadcaster, promotes RSS).
    // No content:encoded. 100 items confirmed May 2026.
    name: 'SVT Nyheter',
    countryCode: 'SE',
    region: 'europe',
    language: 'sv',
    logoUrl: 'https://www.svt.se/favicon.ico',
    websiteUrl: 'https://www.svt.se/nyheter',
    notes: 'Swedish public broadcaster (SVT). No content:encoded. 100 items confirmed May 2026.',
    feedSections: [
      { key: 'all', url: 'https://www.svt.se/nyheter/rss.xml', labelEs: 'Últimas', labelEn: 'Latest' },
    ],
  },
  {
    // France (native French) — France 24 French edition.
    // Already have France 24 Español (countryCode: FR). Adding French edition for FR page.
    // 25 items confirmed May 2026. No content:encoded.
    name: 'France 24 (FR)',
    countryCode: 'FR',
    region: 'europe',
    language: 'fr',
    logoUrl: 'https://www.france24.com/favicon.ico',
    websiteUrl: 'https://www.france24.com/fr',
    notes: 'France 24 native French edition. Complements France 24 Español (already in DB). No content:encoded. 25 items confirmed May 2026.',
    feedSections: [
      { key: 'world',  url: 'https://www.france24.com/fr/rss',          labelEs: 'Portada',  labelEn: 'Home' },
      { key: 'sports', url: 'https://www.france24.com/fr/sport/rss',    labelEs: 'Deporte',  labelEn: 'Sport' },
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
  ...VENEZUELA,
  ...ECUADOR,
  ...PARAGUAY,
  ...BOLIVIA,
  ...GUATEMALA,
  ...COSTA_RICA,
  ...PANAMA,
  ...DOMINICAN_REPUBLIC,
  ...EL_SALVADOR,
  ...EUROPE_ADDITIONAL,
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

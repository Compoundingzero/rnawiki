import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const DEFAULT_ORIGIN = 'http://127.0.0.1:3000'
const DEFAULT_MAX_URLS = 1_000
const DEFAULT_TIMEOUT_MS = 10_000
const MAX_RESPONSE_CHARACTERS = 10_000_000

const UNSAFE_METADATA_KEY =
  /(?:^|[._:-])(?:dose|dosage|dosing|protocol|synthesis|reagent|recipe|acquisition|pricing|supplier|purchase)(?:$|[._:-])/i
const UNSAFE_METADATA_VALUE =
  /\b(?:dose|dose instructions?|dosage|dosing|protocol|synthesis|synthetic route|reagents?|laboratory recipe|acquisition|pricing|where to buy|buy online|purchase|supplier)\b/i

export type AuditSeverity = 'error' | 'warning'

export interface AuditIssue {
  code: string
  severity: AuditSeverity
  url: string
  message: string
  detail?: string
}

export interface AuditOptions {
  origin: URL
  sitemapPath: string
  maxUrls: number
  timeoutMs: number
}

export interface AuditResult {
  origin: string
  pagesAudited: number
  urlsChecked: number
  sitemapUrls: number
  issues: AuditIssue[]
  errors: number
  warnings: number
}

export interface ParsedHtml {
  title: string
  description: string
  h1Count: number
  canonicals: string[]
  noindex: boolean
  internalLinkCandidates: string[]
  invalidJsonLd: string[]
  unsafeMetadata: Array<{ field: string; value: string }>
  hasVisibleSources: boolean
  hasVisibleReviewStatus: boolean
}

interface FetchedResource {
  url: URL
  status: number
  contentType: string
  location: string | null
  xRobotsTag: string
  body: string
  error?: string
}

interface AuditedPage {
  url: URL
  key: string
  parsed: ParsedHtml
  noindex: boolean
}

interface SitemapDocument {
  kind: 'index' | 'urlset'
  locations: string[]
}

export interface ParsedRobotsTxt {
  sitemapLocations: string[]
  crawlBlockingAgents: string[]
}

type FetchImplementation = (input: string | URL, init?: RequestInit) => Promise<Response>

function decodeHtml(value: string): string {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi,
    (entity, decimal: string | undefined, hexadecimal: string | undefined, named: string) => {
      const numeric = decimal
        ? Number.parseInt(decimal, 10)
        : hexadecimal
          ? Number.parseInt(hexadecimal, 16)
          : null
      if (numeric !== null) {
        return Number.isSafeInteger(numeric) && numeric >= 0 && numeric <= 0x10ffff
          ? String.fromCodePoint(numeric)
          : entity
      }
      const entities: Record<string, string> = {
        amp: '&',
        apos: "'",
        gt: '>',
        lt: '<',
        nbsp: ' ',
        quot: '"',
      }
      return entities[named.toLowerCase()] ?? entity
    },
  )
}

function plainText(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function parseAttributes(openingTag: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  const body = openingTag.replace(/^<\s*[^\s>]+/u, '').replace(/\/?\s*>$/u, '')
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  for (const match of body.matchAll(pattern)) {
    const name = match[1]?.toLowerCase()
    if (!name) continue
    attributes[name] = decodeHtml(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return attributes
}

function openingTags(html: string, tagName: string): string[] {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map((match) => match[0])
}

function metaValues(html: string): Array<{ field: string; value: string }> {
  return openingTags(html, 'meta').flatMap((tag) => {
    const attributes = parseAttributes(tag)
    const field = attributes.name ?? attributes.property ?? attributes['http-equiv']
    if (!field || attributes.content === undefined) return []
    return [{ field: field.toLowerCase(), value: attributes.content.trim() }]
  })
}

function unsafeJsonLdFields(value: unknown, path = '$'): Array<{ field: string; value: string }> {
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => unsafeJsonLdFields(entry, `${path}[${index}]`))
  }
  if (!value || typeof value !== 'object') return []

  return Object.entries(value).flatMap(([key, entry]) => {
    const field = `${path}.${key}`
    const ownIssue =
      UNSAFE_METADATA_KEY.test(key) ||
      (typeof entry === 'string' && UNSAFE_METADATA_VALUE.test(entry))
        ? [{ field, value: typeof entry === 'string' ? entry : JSON.stringify(entry) }]
        : []
    return [...ownIssue, ...unsafeJsonLdFields(entry, field)]
  })
}

function withoutEmbeddedContent(html: string): string {
  return html.replace(
    /<(?:script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/(?:script|style|noscript|template|svg)>/gi,
    ' ',
  )
}

function visibleBodyText(html: string): string {
  return plainText(withoutEmbeddedContent(html))
}

function sourceRegion(html: string): string {
  const match = html.match(
    /<(?:section|div|article)\b[^>]*\bid=["']sources["'][^>]*>[\s\S]*?<\/(?:section|div|article)>/i,
  )
  return match?.[0] ?? ''
}

/** Parse only the server-rendered HTML needed by the audit. No browser or database is required. */
export function parsePublicHtml(html: string): ParsedHtml {
  const contentMarkup = withoutEmbeddedContent(html)
  const title = plainText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const metas = metaValues(html)
  const description =
    metas
      .find(({ field }) => field === 'description')
      ?.value.replace(/\s+/g, ' ')
      .trim() ?? ''
  const robots = metas
    .filter(({ field }) => field === 'robots' || field.endsWith('bot'))
    .map(({ value }) => value)
    .join(',')
  const canonicals = openingTags(html, 'link').flatMap((tag) => {
    const attributes = parseAttributes(tag)
    const relations = (attributes.rel ?? '').toLowerCase().split(/\s+/).filter(Boolean)
    return relations.includes('canonical') && attributes.href ? [attributes.href.trim()] : []
  })
  const internalLinkCandidates = openingTags(contentMarkup, 'a').flatMap((tag) => {
    const href = parseAttributes(tag).href?.trim()
    return href ? [href] : []
  })

  const invalidJsonLd: string[] = []
  const unsafeMetadata: Array<{ field: string; value: string }> = []
  const metadataValues = [{ field: 'title', value: title }, ...metas]
  for (const metadata of metadataValues) {
    if (UNSAFE_METADATA_KEY.test(metadata.field) || UNSAFE_METADATA_VALUE.test(metadata.value)) {
      unsafeMetadata.push(metadata)
    }
  }

  const jsonLdPattern =
    /<script\b[^>]*\btype\s*=\s*(?:"application\/ld\+json"|'application\/ld\+json'|application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi
  let jsonLdIndex = 0
  for (const match of html.matchAll(jsonLdPattern)) {
    jsonLdIndex += 1
    const serialized = match[1]?.trim() ?? ''
    try {
      const parsed = JSON.parse(serialized) as unknown
      unsafeMetadata.push(...unsafeJsonLdFields(parsed, `$jsonld[${jsonLdIndex}]`))
    } catch (error) {
      invalidJsonLd.push(
        `JSON-LD block ${jsonLdIndex}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  const visibleText = visibleBodyText(html)
  const sources = sourceRegion(contentMarkup)
  const hasVisibleSources =
    /\bdata-source-id\s*=/i.test(contentMarkup) ||
    (/\bid=["']sources["']/i.test(contentMarkup) &&
      (/<a\b[^>]*\bhref\s*=/i.test(sources) || /\bsource-[^\s"']+/i.test(sources)))
  const hasVisibleReviewStatus =
    /\b(?:last reviewed|review status|how this version was reviewed|reviewed evidence answer|not reviewed|unreviewed|waiting for review|no reviewed (?:answer|conclusion|finding|information)|reviewed (?:on|by|\d{1,2}\s+[A-Z][a-z]+\s+\d{4}))\b/i.test(
      visibleText,
    )

  return {
    title,
    description,
    h1Count: openingTags(contentMarkup, 'h1').length,
    canonicals,
    noindex: /(?:^|[,\s])noindex(?:$|[,\s])/i.test(robots),
    internalLinkCandidates,
    invalidJsonLd,
    unsafeMetadata,
    hasVisibleSources,
    hasVisibleReviewStatus,
  }
}

export function parseSitemapXml(xml: string): SitemapDocument {
  const kind = /<sitemapindex\b/i.test(xml) ? 'index' : 'urlset'
  const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].flatMap((match) => {
    const location = plainText(match[1] ?? '')
    return location ? [location] : []
  })
  return { kind, locations }
}

type RobotsRule = {
  directive: 'allow' | 'disallow'
  value: string
}

type RobotsGroup = {
  agents: string[]
  rules: RobotsRule[]
}

const AUDITED_CRAWLER_AGENTS = ['*', 'bingbot', 'googlebot', 'oai-searchbot'] as const

function robotsPatternMatchesRoot(pattern: string): boolean {
  if (!pattern) return false
  const anchored = pattern.endsWith('$')
  const source = anchored ? pattern.slice(0, -1) : pattern
  const escaped = source
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&'))
    .join('.*')
  return new RegExp(`^${escaped}${anchored ? '$' : ''}`, 'u').test('/')
}

function groupBlocksRoot(rules: RobotsRule[]): boolean {
  const matches = rules.filter(({ value }) => robotsPatternMatchesRoot(value))
  if (matches.length === 0) return false

  const highestSpecificity = Math.max(
    ...matches.map(({ value }) => value.replace(/\*/gu, '').replace(/\$$/u, '').length),
  )
  const winningRules = matches.filter(
    ({ value }) => value.replace(/\*/gu, '').replace(/\$$/u, '').length === highestSpecificity,
  )

  // RFC 9309 gives Allow precedence when equally specific rules conflict.
  return !winningRules.some(({ directive }) => directive === 'allow')
}

/** Extract the global sitemap directives and effective root-crawl blocks for major public search agents. */
export function parseRobotsTxt(robots: string): ParsedRobotsTxt {
  const sitemapLocations: string[] = []
  const groups: RobotsGroup[] = []
  let activeGroup: RobotsGroup = { agents: [], rules: [] }

  const finishGroup = () => {
    if (activeGroup.agents.length > 0 && activeGroup.rules.length > 0) groups.push(activeGroup)
    activeGroup = { agents: [], rules: [] }
  }

  for (const originalLine of robots.split(/\r?\n/u)) {
    const line = originalLine.replace(/\s*#.*$/u, '').trim()
    if (!line) continue
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const directive = line.slice(0, separator).trim().toLowerCase()
    const value = line.slice(separator + 1).trim()

    if (directive === 'sitemap') {
      if (value) sitemapLocations.push(value)
      continue
    }
    if (directive === 'user-agent') {
      if (activeGroup.rules.length > 0) finishGroup()
      if (value) activeGroup.agents.push(value.toLowerCase())
      continue
    }
    if (directive !== 'allow' && directive !== 'disallow') continue
    if (activeGroup.agents.length === 0) continue
    activeGroup.rules.push({ directive, value })
  }
  finishGroup()

  const crawlBlockingAgents = AUDITED_CRAWLER_AGENTS.filter((agent) => {
    const matchingGroups = groups.filter(({ agents }) => agents.includes(agent))
    return (
      matchingGroups.length > 0 && groupBlocksRoot(matchingGroups.flatMap(({ rules }) => rules))
    )
  })

  return { sitemapLocations, crawlBlockingAgents: [...crawlBlockingAgents].sort() }
}

function canonicalUrlKey(url: URL): string {
  const normalized = new URL(url)
  normalized.hash = ''
  normalized.searchParams.sort()
  return `${normalized.pathname}${normalized.search}`
}

function toAuditOrigin(url: URL, origin: URL): URL {
  const mapped = new URL(origin)
  mapped.pathname = url.pathname
  mapped.search = url.search
  mapped.hash = ''
  return mapped
}

function sameAuditOrigin(candidate: URL, origin: URL): boolean {
  return candidate.origin === origin.origin
}

export function isLoopbackAuditOrigin(origin: URL): boolean {
  const hostname = origin.hostname.toLowerCase()
  return (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname === '[::1]' ||
    hostname === '::1' ||
    /^127(?:\.\d{1,3}){3}$/u.test(hostname)
  )
}

function safeUrl(value: string, base: URL, preserveHash = false): URL | null {
  try {
    const parsed = new URL(value, base)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    if (!preserveHash) parsed.hash = ''
    return parsed
  } catch {
    return null
  }
}

function shouldCheckInternalUrl(url: URL): boolean {
  return !url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/api/')
}

/** Evidence/entity pages must show both provenance and their reviewed or unreviewed state. */
export function isEvidencePagePath(pathname: string): boolean {
  if (/^\/d\/[^/]+(?:\/programme\/[^/]+)?\/?$/u.test(pathname)) return true
  return /^\/(?:t|trial|trials|mechanism|mechanisms|target|targets)\/[^/]+\/?$/u.test(pathname)
}

function addIssue(issues: AuditIssue[], issue: AuditIssue): void {
  const duplicate = issues.some(
    (current) =>
      current.code === issue.code &&
      current.severity === issue.severity &&
      current.url === issue.url &&
      current.detail === issue.detail,
  )
  if (!duplicate) issues.push(issue)
}

async function fetchResource(
  url: URL,
  options: AuditOptions,
  fetchImplementation: FetchImplementation,
): Promise<FetchedResource> {
  try {
    const response = await fetchImplementation(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(options.timeoutMs),
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5',
        'user-agent': 'RNAWiki-Search-Audit/1.0',
      },
    })
    const body = await response.text()
    if (body.length > MAX_RESPONSE_CHARACTERS) {
      return {
        url,
        status: response.status,
        contentType: response.headers.get('content-type') ?? '',
        location: response.headers.get('location'),
        xRobotsTag: response.headers.get('x-robots-tag') ?? '',
        body: '',
        error: `response exceeded ${MAX_RESPONSE_CHARACTERS.toLocaleString()} characters`,
      }
    }
    return {
      url,
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
      location: response.headers.get('location'),
      xRobotsTag: response.headers.get('x-robots-tag') ?? '',
      body,
    }
  } catch (error) {
    return {
      url,
      status: 0,
      contentType: '',
      location: null,
      xRobotsTag: '',
      body: '',
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function loadSitemapUrls(
  options: AuditOptions,
  fetchImplementation: FetchImplementation,
  cache: Map<string, Promise<FetchedResource>>,
  issues: AuditIssue[],
): Promise<Map<string, URL>> {
  const sitemapUrls = new Map<string, URL>()
  const start = safeUrl(options.sitemapPath, options.origin)
  if (!start) {
    addIssue(issues, {
      code: 'invalid-sitemap-url',
      severity: 'error',
      url: options.origin.href,
      message: 'The configured sitemap URL is invalid.',
      detail: options.sitemapPath,
    })
    return sitemapUrls
  }

  const queue = [toAuditOrigin(start, options.origin)]
  const visited = new Set<string>()
  while (queue.length > 0) {
    const sitemap = queue.shift()
    if (!sitemap || visited.has(sitemap.href)) continue
    visited.add(sitemap.href)
    if (visited.size > 50) {
      addIssue(issues, {
        code: 'sitemap-limit-reached',
        severity: 'error',
        url: sitemap.href,
        message:
          'More than 50 sitemap documents were discovered; the audit stopped expanding them.',
      })
      break
    }

    const request = cache.get(sitemap.href) ?? fetchResource(sitemap, options, fetchImplementation)
    cache.set(sitemap.href, Promise.resolve(request))
    const response = await request
    if (response.error || response.status !== 200) {
      addIssue(issues, {
        code: 'sitemap-unavailable',
        severity: 'error',
        url: sitemap.href,
        message: 'The sitemap could not be read with HTTP 200.',
        detail: response.error ?? `HTTP ${response.status}`,
      })
      continue
    }

    const document = parseSitemapXml(response.body)
    if (document.locations.length === 0) {
      addIssue(issues, {
        code: 'empty-sitemap',
        severity: 'error',
        url: sitemap.href,
        message: 'The sitemap contains no <loc> entries.',
      })
      continue
    }
    for (const location of document.locations) {
      const parsed = safeUrl(location, sitemap)
      if (!parsed) {
        addIssue(issues, {
          code: 'invalid-sitemap-entry',
          severity: 'error',
          url: sitemap.href,
          message: 'The sitemap contains an invalid URL.',
          detail: location,
        })
        continue
      }
      if (document.kind === 'index') {
        queue.push(toAuditOrigin(parsed, options.origin))
      } else {
        sitemapUrls.set(canonicalUrlKey(parsed), toAuditOrigin(parsed, options.origin))
      }
    }
  }
  return sitemapUrls
}

async function auditRobotsTxt(
  options: AuditOptions,
  getResource: (url: URL) => Promise<FetchedResource>,
  issues: AuditIssue[],
): Promise<void> {
  const robotsUrl = new URL('/robots.txt', options.origin)
  const response = await getResource(robotsUrl)
  const deploymentSeverity: AuditSeverity = isLoopbackAuditOrigin(options.origin)
    ? 'warning'
    : 'error'
  if (response.error || response.status !== 200) {
    addIssue(issues, {
      code: 'robots-unavailable',
      severity: deploymentSeverity,
      url: robotsUrl.href,
      message: 'robots.txt could not be audited with HTTP 200.',
      detail: response.error ?? `HTTP ${response.status}`,
    })
    return
  }

  const parsed = parseRobotsTxt(response.body)
  if (parsed.crawlBlockingAgents.length > 0) {
    addIssue(issues, {
      code: 'robots-blocks-public-crawl',
      severity: deploymentSeverity,
      url: robotsUrl.href,
      message: 'robots.txt contains Disallow: / for a public-search crawler group.',
      detail: `Blocking user-agent group(s): ${parsed.crawlBlockingAgents.join(', ')}`,
    })
  }

  const configuredSitemap = safeUrl(options.sitemapPath, options.origin)
  const expectedSitemap = configuredSitemap
    ? toAuditOrigin(configuredSitemap, options.origin)
    : new URL('/sitemap.xml', options.origin)
  const advertisedSitemaps = parsed.sitemapLocations.flatMap((location) => {
    const parsedLocation = safeUrl(location, robotsUrl)
    return parsedLocation ? [parsedLocation] : []
  })
  const advertisesCanonicalSitemap = advertisedSitemaps.some(
    (sitemap) =>
      sitemap.origin === options.origin.origin &&
      canonicalUrlKey(sitemap) === canonicalUrlKey(expectedSitemap),
  )
  if (!advertisesCanonicalSitemap) {
    addIssue(issues, {
      code: 'robots-missing-canonical-sitemap',
      severity: deploymentSeverity,
      url: robotsUrl.href,
      message: 'robots.txt does not advertise the canonical sitemap for the audited origin.',
      detail:
        advertisedSitemaps.length > 0
          ? `Expected ${expectedSitemap.href}; advertised ${advertisedSitemaps.map((url) => url.href).join(', ')}`
          : `Expected Sitemap: ${expectedSitemap.href}`,
    })
  }
}

function normalizedDuplicateValue(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en')
}

function addDuplicateIssues(
  pages: AuditedPage[],
  field: 'title' | 'description',
  issues: AuditIssue[],
): void {
  const grouped = new Map<string, AuditedPage[]>()
  for (const page of pages) {
    const value = normalizedDuplicateValue(page.parsed[field])
    if (!value) continue
    const existing = grouped.get(value) ?? []
    existing.push(page)
    grouped.set(value, existing)
  }

  for (const duplicates of grouped.values()) {
    if (duplicates.length < 2) continue
    const urls = duplicates.map(({ url }) => url.href).sort()
    for (const page of duplicates) {
      addIssue(issues, {
        code: `duplicate-${field}`,
        severity: 'error',
        url: page.url.href,
        message: `This indexable page has the same ${field} as another indexable page.`,
        detail: urls.filter((url) => url !== page.url.href).join(', '),
      })
    }
  }
}

/**
 * Crawl a supplied running origin and compare its server-rendered pages with its sitemap.
 * The function performs HTTP reads only. It never imports the application or opens a database.
 */
export async function auditPublicSearch(
  options: AuditOptions,
  fetchImplementation: FetchImplementation = fetch,
): Promise<AuditResult> {
  const issues: AuditIssue[] = []
  const cache = new Map<string, Promise<FetchedResource>>()
  const getResource = (url: URL): Promise<FetchedResource> => {
    const key = url.href
    const existing = cache.get(key)
    if (existing) return existing
    const request = fetchResource(url, options, fetchImplementation)
    cache.set(key, request)
    return request
  }
  const sitemapUrls = await loadSitemapUrls(options, fetchImplementation, cache, issues)
  await auditRobotsTxt(options, getResource, issues)

  const root = new URL(options.origin)
  const queue: URL[] = [root, ...sitemapUrls.values()]
  const queued = new Set(queue.map((url) => url.href))
  const referrers = new Map<string, Set<string>>()
  const visited = new Set<string>()
  const pages = new Map<string, AuditedPage>()

  const enqueue = (url: URL, referrer?: URL): void => {
    if (!sameAuditOrigin(url, options.origin) || !shouldCheckInternalUrl(url)) return
    const normalized = new URL(url)
    normalized.hash = ''
    if (referrer) {
      const existing = referrers.get(normalized.href) ?? new Set<string>()
      existing.add(referrer.href)
      referrers.set(normalized.href, existing)
    }
    if (queued.has(normalized.href) || visited.has(normalized.href)) return
    queued.add(normalized.href)
    queue.push(normalized)
  }

  while (queue.length > 0 && visited.size < options.maxUrls) {
    const url = queue.shift()
    if (!url || visited.has(url.href)) continue
    visited.add(url.href)
    const response = await getResource(url)
    const linkedFrom = [...(referrers.get(url.href) ?? [])].sort()

    if (response.error || response.status === 0 || response.status >= 400) {
      if (linkedFrom.length > 0) {
        addIssue(issues, {
          code: 'broken-internal-link',
          severity: 'error',
          url: url.href,
          message: 'A same-origin link does not return a successful or redirect response.',
          detail: `${response.error ?? `HTTP ${response.status}`}; linked from ${linkedFrom.join(', ')}`,
        })
      } else {
        addIssue(issues, {
          code: 'public-page-unavailable',
          severity: 'error',
          url: url.href,
          message: 'A root or sitemap URL could not be audited.',
          detail: response.error ?? `HTTP ${response.status}`,
        })
      }
      continue
    }

    if (response.status >= 300 && response.status < 400) {
      if (sitemapUrls.has(canonicalUrlKey(url))) {
        addIssue(issues, {
          code: 'redirect-url-in-sitemap',
          severity: 'error',
          url: url.href,
          message: 'A sitemap URL redirects instead of returning its canonical page directly.',
          detail: response.location
            ? `HTTP ${response.status} to ${response.location}`
            : `HTTP ${response.status} without a Location header`,
        })
      }
      const target = response.location ? safeUrl(response.location, url) : null
      if (target && sameAuditOrigin(target, options.origin)) enqueue(target, url)
      continue
    }

    if (!/\b(?:text\/html|application\/xhtml\+xml)\b/i.test(response.contentType)) continue
    const parsed = parsePublicHtml(response.body)
    const noindex = parsed.noindex || /(?:^|[,\s])noindex(?:$|[,\s])/i.test(response.xRobotsTag)
    const page: AuditedPage = { url, key: canonicalUrlKey(url), parsed, noindex }
    pages.set(page.key, page)

    for (const href of parsed.internalLinkCandidates) {
      const candidate = safeUrl(href, url)
      if (candidate) enqueue(candidate, url)
    }
  }

  if (queue.length > 0) {
    addIssue(issues, {
      code: 'crawl-limit-reached',
      severity: 'error',
      url: options.origin.href,
      message: `The audit reached its ${options.maxUrls}-URL limit before the crawl completed.`,
      detail: 'Raise --max-urls so omitted pages and broken links are not missed.',
    })
  }

  const canonicalIndexPages: AuditedPage[] = []
  for (const page of pages.values()) {
    const { parsed } = page
    if (!parsed.title) {
      addIssue(issues, {
        code: 'missing-title',
        severity: 'error',
        url: page.url.href,
        message: 'The HTML page has no server-rendered title.',
      })
    }
    if (!parsed.description) {
      addIssue(issues, {
        code: 'missing-description',
        severity: 'error',
        url: page.url.href,
        message: 'The HTML page has no meta description.',
      })
    }
    if (parsed.h1Count === 0) {
      addIssue(issues, {
        code: 'missing-h1',
        severity: 'error',
        url: page.url.href,
        message: 'The HTML page has no server-rendered H1.',
      })
    } else if (parsed.h1Count > 1) {
      addIssue(issues, {
        code: 'multiple-h1',
        severity: 'error',
        url: page.url.href,
        message: `The HTML page has ${parsed.h1Count} H1 elements; exactly one is expected.`,
      })
    }
    if (parsed.canonicals.length === 0) {
      addIssue(issues, {
        code: 'missing-canonical',
        severity: 'error',
        url: page.url.href,
        message: 'The HTML page has no canonical link.',
      })
    } else if (parsed.canonicals.length > 1) {
      addIssue(issues, {
        code: 'multiple-canonical',
        severity: 'error',
        url: page.url.href,
        message: `The HTML page has ${parsed.canonicals.length} canonical links; exactly one is expected.`,
      })
    }

    for (const detail of parsed.invalidJsonLd) {
      addIssue(issues, {
        code: 'invalid-json-ld',
        severity: 'error',
        url: page.url.href,
        message: 'A JSON-LD block is not valid JSON.',
        detail,
      })
    }
    for (const metadata of parsed.unsafeMetadata) {
      addIssue(issues, {
        code: 'unsafe-metadata-field',
        severity: 'error',
        url: page.url.href,
        message: `Search or structured metadata contains the unsafe field or wording “${metadata.field}”.`,
        detail: metadata.value.slice(0, 240),
      })
    }

    if (isEvidencePagePath(page.url.pathname) && !parsed.hasVisibleSources) {
      addIssue(issues, {
        code: 'page-without-sources',
        severity: page.noindex ? 'warning' : 'error',
        url: page.url.href,
        message: page.noindex
          ? 'This noindex evidence page shows no visible source record.'
          : 'This indexable evidence page shows no visible source record.',
      })
    }
    if (isEvidencePagePath(page.url.pathname) && !parsed.hasVisibleReviewStatus) {
      addIssue(issues, {
        code: 'page-without-review-status',
        severity: page.noindex ? 'warning' : 'error',
        url: page.url.href,
        message: page.noindex
          ? 'This noindex evidence page has no visible reviewed or unreviewed status.'
          : 'This indexable evidence page has no visible reviewed or unreviewed status.',
      })
    }

    const canonicalValue = parsed.canonicals[0]
    const canonical = canonicalValue ? safeUrl(canonicalValue, page.url, true) : null
    const canonicalKey = canonical ? canonicalUrlKey(canonical) : page.key
    const canonicalOriginMatches = canonical?.origin === options.origin.origin
    const canonicalHasFragment = Boolean(canonical?.hash)
    const canonicalIsSelf = Boolean(
      canonicalOriginMatches && !canonicalHasFragment && canonicalKey === page.key,
    )
    if (canonicalValue && !canonical) {
      addIssue(issues, {
        code: 'invalid-canonical',
        severity: 'error',
        url: page.url.href,
        message: 'The canonical link is not a valid HTTP(S) URL.',
        detail: canonicalValue,
      })
    } else if (canonical && !canonicalOriginMatches) {
      addIssue(issues, {
        code: 'canonical-origin-mismatch',
        severity: 'error',
        url: page.url.href,
        message: 'The canonical URL uses a different origin from the audited page.',
        detail: `Expected origin ${options.origin.origin}; found ${canonical.origin}`,
      })
    } else if (canonicalHasFragment) {
      addIssue(issues, {
        code: 'canonical-fragment',
        severity: 'error',
        url: page.url.href,
        message: 'The canonical URL contains a fragment; canonicals must identify the whole page.',
        detail: canonical?.href,
      })
    } else if (canonical) {
      const canonicalResponse =
        canonicalKey === page.key ? await getResource(page.url) : await getResource(canonical)
      if (canonicalResponse.status >= 300 && canonicalResponse.status < 400) {
        addIssue(issues, {
          code: 'canonical-to-redirect',
          severity: 'error',
          url: page.url.href,
          message: 'The canonical URL redirects instead of returning the canonical page directly.',
          detail: `${canonical} returned HTTP ${canonicalResponse.status}`,
        })
      } else if (canonicalResponse.error || canonicalResponse.status >= 400) {
        addIssue(issues, {
          code: 'broken-canonical',
          severity: 'error',
          url: page.url.href,
          message: 'The canonical URL does not resolve to an HTTP 200 page on the audited origin.',
          detail:
            canonicalResponse.error ?? `${canonical} returned HTTP ${canonicalResponse.status}`,
        })
      }
    }

    const inSitemap = sitemapUrls.has(page.key)
    if (inSitemap && canonicalValue && !canonicalIsSelf) {
      addIssue(issues, {
        code: 'noncanonical-url-in-sitemap',
        severity: 'error',
        url: page.url.href,
        message: 'A sitemap URL points its canonical link at a different URL.',
        detail: canonical?.href ?? canonicalKey,
      })
    }
    if (page.noindex && inSitemap) {
      addIssue(issues, {
        code: 'noindex-url-in-sitemap',
        severity: 'error',
        url: page.url.href,
        message: 'A noindex page is included in the sitemap.',
      })
    }
    const isCanonicalIndexPage = !page.noindex && (!canonicalValue || canonicalIsSelf)
    if (isCanonicalIndexPage) {
      canonicalIndexPages.push(page)
      if (!inSitemap) {
        addIssue(issues, {
          code: 'indexable-url-omitted-from-sitemap',
          severity: 'error',
          url: page.url.href,
          message:
            'An indexable canonical page discovered by the crawl is omitted from the sitemap.',
        })
      }
    }
  }

  addDuplicateIssues(canonicalIndexPages, 'title', issues)
  addDuplicateIssues(canonicalIndexPages, 'description', issues)

  issues.sort(
    (left, right) =>
      left.severity.localeCompare(right.severity) ||
      left.code.localeCompare(right.code) ||
      left.url.localeCompare(right.url) ||
      (left.detail ?? '').localeCompare(right.detail ?? ''),
  )
  const errors = issues.filter(({ severity }) => severity === 'error').length
  const warnings = issues.length - errors
  return {
    origin: options.origin.origin,
    pagesAudited: pages.size,
    urlsChecked: visited.size,
    sitemapUrls: sitemapUrls.size,
    issues,
    errors,
    warnings,
  }
}

export function formatAuditResult(result: AuditResult): string {
  const lines = [
    `Search audit: ${result.origin}`,
    `Audited ${result.pagesAudited} HTML pages, checked ${result.urlsChecked} URLs, read ${result.sitemapUrls} sitemap URLs.`,
    `${result.errors} error(s), ${result.warnings} warning(s).`,
  ]
  for (const issue of result.issues) {
    lines.push(
      '',
      `[${issue.severity.toUpperCase()}] ${issue.code}`,
      `  ${issue.url}`,
      `  ${issue.message}`,
    )
    if (issue.detail) lines.push(`  ${issue.detail}`)
  }
  if (result.issues.length === 0) lines.push('', 'No search audit issues found.')
  return lines.join('\n')
}

function usage(): string {
  return [
    'Usage: npm run audit:search -- [options]',
    '',
    'Options:',
    `  --origin <url>       Running public origin (default: AUDIT_ORIGIN or ${DEFAULT_ORIGIN})`,
    '  --sitemap <path>     Sitemap URL or path (default: /sitemap.xml)',
    `  --max-urls <count>   Maximum same-origin URLs to check (default: ${DEFAULT_MAX_URLS})`,
    `  --timeout-ms <ms>    Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})`,
    '  --json               Print machine-readable JSON',
    '  --help               Show this help',
    '',
    'The default is deliberately loopback-only. Pass --origin explicitly to audit a deployment.',
  ].join('\n')
}

interface CliArguments extends AuditOptions {
  json: boolean
  help: boolean
}

function optionValue(args: string[], index: number, name: string): [string, number] {
  const current = args[index] ?? ''
  const inline = current.startsWith(`${name}=`) ? current.slice(name.length + 1) : null
  if (inline !== null) return [inline, index]
  const next = args[index + 1]
  if (!next || next.startsWith('--')) throw new Error(`${name} requires a value.`)
  return [next, index + 1]
}

function parsePositiveInteger(
  value: string,
  name: string,
  minimum: number,
  maximum: number,
): number {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}.`)
  }
  return parsed
}

export function parseAuditArguments(
  args: string[],
  environment: NodeJS.ProcessEnv = process.env,
): CliArguments {
  let originValue = environment.AUDIT_ORIGIN ?? DEFAULT_ORIGIN
  let sitemapPath = '/sitemap.xml'
  let maxUrls = DEFAULT_MAX_URLS
  let timeoutMs = DEFAULT_TIMEOUT_MS
  let json = false
  let help = false

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? ''
    if (argument === '--json') json = true
    else if (argument === '--help' || argument === '-h') help = true
    else if (argument === '--origin' || argument.startsWith('--origin=')) {
      const [value, consumed] = optionValue(args, index, '--origin')
      originValue = value
      index = consumed
    } else if (argument === '--sitemap' || argument.startsWith('--sitemap=')) {
      const [value, consumed] = optionValue(args, index, '--sitemap')
      sitemapPath = value
      index = consumed
    } else if (argument === '--max-urls' || argument.startsWith('--max-urls=')) {
      const [value, consumed] = optionValue(args, index, '--max-urls')
      maxUrls = parsePositiveInteger(value, '--max-urls', 10, 10_000)
      index = consumed
    } else if (argument === '--timeout-ms' || argument.startsWith('--timeout-ms=')) {
      const [value, consumed] = optionValue(args, index, '--timeout-ms')
      timeoutMs = parsePositiveInteger(value, '--timeout-ms', 500, 60_000)
      index = consumed
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
  }

  let origin: URL
  try {
    origin = new URL(originValue)
  } catch {
    throw new Error('--origin must be an absolute HTTP(S) URL.')
  }
  if (origin.protocol !== 'http:' && origin.protocol !== 'https:') {
    throw new Error('--origin must be an absolute HTTP(S) URL.')
  }
  if (origin.username || origin.password) throw new Error('--origin must not contain credentials.')
  if (origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('--origin must contain only a scheme and host, without a path, query or hash.')
  }
  origin.pathname = '/'
  return { origin, sitemapPath, maxUrls, timeoutMs, json, help }
}

async function runCli(): Promise<void> {
  try {
    const options = parseAuditArguments(process.argv.slice(2))
    if (options.help) {
      console.log(usage())
      return
    }
    const result = await auditPublicSearch(options)
    console.log(options.json ? JSON.stringify(result, null, 2) : formatAuditResult(result))
    if (result.errors > 0) process.exitCode = 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error('')
    console.error(usage())
    process.exitCode = 2
  }
}

const mainPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (mainPath && fileURLToPath(import.meta.url) === mainPath) void runCli()

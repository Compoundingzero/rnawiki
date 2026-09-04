/**
 * Phase 5 — verify what a deployment actually serves (docs/specs/deployment-plan.md, step 6).
 *
 * The plan names the checks that block a deploy, and this command performs exactly those against
 * one base URL, over ordinary read-only HTTP:
 *
 *   1. the sitemap index resolves and every child it names resolves and holds ≤ 50,000 URLs;
 *   2. sample dossier URLs answer 200 without a redirect;
 *   3. previously indexed slugs answer 301 or 308 (Next's `permanentRedirect` emits 308, which the
 *      plan accepts as equivalent for crawlers);
 *   4. a Tier 3 record carries `noindex` and appears in no sitemap child;
 *   5. robots.txt does not disallow `/d/`;
 *   6. no vendor, retailer or affiliate host appears in any link on a page it fetched (R14);
 *   7. no suppressed page renders a seed 1, 2 or 6 block (R2).
 *
 * It decides nothing medical and writes nothing: it reads the deployment and reports. A check it
 * cannot run — because nothing supplied the URLs it needs — is reported as NOT RUN with the reason,
 * never as a pass. `--require-all` turns a NOT RUN into a failure for a release gate.
 *
 *   npx tsx scripts/corpus-20k/deploy/verify-live.ts --base-url http://localhost:3000
 *   npx tsx scripts/corpus-20k/deploy/verify-live.ts --base-url https://rnawiki.com --json
 *
 * Flags:
 *   --base-url <url>       required; scheme and host of the deployment to read
 *   --sample <path>        a dossier path to check; repeatable. Default: drawn from the sitemap
 *   --samples <n>          how many to draw from the sitemap when none is named (default 7)
 *   --tier3 <path>         a Tier 3 dossier path; repeatable. Default: read from /browse/type
 *   --redirect <path>      an old slug path expected to redirect; repeatable
 *   --dispositions <file>  reconciliation dispositions NDJSON to draw old slugs from
 *   --redirects <n>        how many old slugs to check (default 20)
 *   --suppressed <path>    a suppressed dossier path; repeatable (else the samples are used)
 *   --timeout-ms <ms>      per-request timeout (default 15000)
 *   --delay-ms <ms>        pause between requests (default 150)
 *   --require-all          a check that could not run counts as a failure
 *   --json                 print the report as JSON
 */
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CANONICAL_PRODUCTION_ORIGIN } from '@/lib/seo/canonical-production-origin.mjs'

const DEFAULT_SAMPLES = 7
const DEFAULT_REDIRECTS = 20
const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_DELAY_MS = 150
const DEFAULT_DISPOSITIONS = 'data/corpus-20k/reconciliation/dispositions.ndjson'
const SITEMAP_URL_CEILING = 50_000
const MAX_BODY_CHARACTERS = 2_000_000
/** A sitemap child may legitimately carry 50,000 URLs, which no HTML budget would hold. */
const MAX_XML_CHARACTERS = 40_000_000
const MAX_LISTED_FAILURES = 25

/** The three blocks seed 1, 2 and 6 render as. A suppressed page must carry none of them (R2). */
const SUPPRESSED_BLOCKS = ['bioavailability', 'n-of-1', 'time-to-signal']

/**
 * Hosts and URL shapes that sell something. The list is a denylist, so the report also names every
 * external host it saw: a host nobody listed here is not thereby approved, it is merely unlisted,
 * and a person reads the inventory.
 */
const VENDOR_HOST_PATTERNS = [
  /(^|\.)amazon\./i,
  /(^|\.)ebay\./i,
  /(^|\.)alibaba\./i,
  /(^|\.)aliexpress\./i,
  /(^|\.)iherb\./i,
  /(^|\.)swansonvitamins\./i,
  /(^|\.)bulksupplements\./i,
  /(^|\.)lifeextension\./i,
  /(^|\.)peptidesciences\./i,
  /(^|\.)renuebyscience\./i,
  /(^|\.)donotage\./i,
  /(^|\.)walmart\./i,
  /(^|\.)walgreens\./i,
  /(^|\.)cvs\./i,
  /(^|\.)goodrx\./i,
  /(^|\.)shopify\./i,
  /(^|\.)etsy\./i,
  /(^|\.)chemist\w*\./i,
  /(^|\.)pharmacy[a-z0-9-]*\./i,
  /(^|\.)(buy|shop|store)[a-z0-9-]*\./i,
]

/** Affiliate and cart shapes, which sell even from a host nobody would list. */
const VENDOR_URL_PATTERNS = [
  /[?&]tag=[^&]*-2\d\b/i,
  /[?&](affiliate|aff_id|ref_?id|clickid|irclickid)=/i,
  /[?&]utm_medium=affiliate/i,
  /\/(cart|checkout|add-to-cart|basket)(\/|$|\?)/i,
]

export type CheckStatus = 'PASS' | 'FAIL' | 'NOT RUN'

export interface CheckResult {
  id: string
  title: string
  status: CheckStatus
  /** One sentence a person can act on. */
  detail: string
  /** The failing items, capped; the count is always exact. */
  failures?: string[]
  failureCount?: number
  facts?: Record<string, unknown>
}

export interface VerifyReport {
  baseUrl: string
  startedAt: string
  finishedAt: string
  checks: CheckResult[]
  passed: number
  failed: number
  notRun: number
  /** Every external host seen in a link on a page this run fetched. */
  externalHosts: string[]
  ok: boolean
}

interface Options {
  baseUrl: URL
  samples: string[]
  sampleCount: number
  tier3: string[]
  redirects: string[]
  redirectCount: number
  dispositions: string
  suppressed: string[]
  timeoutMs: number
  delayMs: number
  requireAll: boolean
  json: boolean
  help: boolean
}

/* ------------------------------------------------------------------ arguments */

function optionValue(args: string[], index: number, name: string): [string, number] {
  const current = args[index] ?? ''
  const inline = current.startsWith(`${name}=`) ? current.slice(name.length + 1) : null
  if (inline !== null) return [inline, index]
  const next = args[index + 1]
  if (next === undefined || next.startsWith('--')) throw new Error(`${name} requires a value.`)
  return [next, index + 1]
}

function positiveInteger(value: string, name: string, maximum: number): number {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new Error(`${name} must be an integer from 1 to ${maximum}.`)
  }
  return parsed
}

export function parseArguments(args: string[]): Options {
  let baseUrlValue: string | null = null
  const samples: string[] = []
  const tier3: string[] = []
  const redirects: string[] = []
  const suppressed: string[] = []
  let sampleCount = DEFAULT_SAMPLES
  let redirectCount = DEFAULT_REDIRECTS
  let dispositions = DEFAULT_DISPOSITIONS
  let timeoutMs = DEFAULT_TIMEOUT_MS
  let delayMs = DEFAULT_DELAY_MS
  let requireAll = false
  let json = false
  let help = false

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? ''
    if (argument === '--json') json = true
    else if (argument === '--require-all') requireAll = true
    else if (argument === '--help' || argument === '-h') help = true
    else if (argument === '--base-url' || argument.startsWith('--base-url=')) {
      const [value, consumed] = optionValue(args, index, '--base-url')
      baseUrlValue = value
      index = consumed
    } else if (argument === '--sample' || argument.startsWith('--sample=')) {
      const [value, consumed] = optionValue(args, index, '--sample')
      samples.push(value)
      index = consumed
    } else if (argument === '--tier3' || argument.startsWith('--tier3=')) {
      const [value, consumed] = optionValue(args, index, '--tier3')
      tier3.push(value)
      index = consumed
    } else if (argument === '--redirect' || argument.startsWith('--redirect=')) {
      const [value, consumed] = optionValue(args, index, '--redirect')
      redirects.push(value)
      index = consumed
    } else if (argument === '--suppressed' || argument.startsWith('--suppressed=')) {
      const [value, consumed] = optionValue(args, index, '--suppressed')
      suppressed.push(value)
      index = consumed
    } else if (argument === '--samples' || argument.startsWith('--samples=')) {
      const [value, consumed] = optionValue(args, index, '--samples')
      sampleCount = positiveInteger(value, '--samples', 500)
      index = consumed
    } else if (argument === '--redirects' || argument.startsWith('--redirects=')) {
      const [value, consumed] = optionValue(args, index, '--redirects')
      redirectCount = positiveInteger(value, '--redirects', 500)
      index = consumed
    } else if (argument === '--dispositions' || argument.startsWith('--dispositions=')) {
      const [value, consumed] = optionValue(args, index, '--dispositions')
      dispositions = value
      index = consumed
    } else if (argument === '--timeout-ms' || argument.startsWith('--timeout-ms=')) {
      const [value, consumed] = optionValue(args, index, '--timeout-ms')
      timeoutMs = positiveInteger(value, '--timeout-ms', 120_000)
      index = consumed
    } else if (argument === '--delay-ms' || argument.startsWith('--delay-ms=')) {
      const [value, consumed] = optionValue(args, index, '--delay-ms')
      delayMs = Number(value)
      if (!Number.isSafeInteger(delayMs) || delayMs < 0 || delayMs > 60_000) {
        throw new Error('--delay-ms must be an integer from 0 to 60000.')
      }
      index = consumed
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
  }

  if (help) {
    return {
      baseUrl: new URL('https://rnawiki.com'),
      samples,
      sampleCount,
      tier3,
      redirects,
      redirectCount,
      dispositions,
      suppressed,
      timeoutMs,
      delayMs,
      requireAll,
      json,
      help,
    }
  }

  if (baseUrlValue === null) throw new Error('--base-url is required.')
  let baseUrl: URL
  try {
    baseUrl = new URL(baseUrlValue)
  } catch {
    throw new Error('--base-url must be an absolute HTTP(S) URL.')
  }
  if (baseUrl.protocol !== 'http:' && baseUrl.protocol !== 'https:') {
    throw new Error('--base-url must be an absolute HTTP(S) URL.')
  }
  if (baseUrl.username || baseUrl.password) {
    throw new Error('--base-url must not contain credentials.')
  }

  return {
    baseUrl,
    samples,
    sampleCount,
    tier3,
    redirects,
    redirectCount,
    dispositions,
    suppressed,
    timeoutMs,
    delayMs,
    requireAll,
    json,
    help,
  }
}

/* ------------------------------------------------------------------ fetching */

export type FetchImplementation = (input: string | URL, init?: RequestInit) => Promise<Response>

interface Fetched {
  url: string
  status: number
  location: string | null
  robotsHeader: string | null
  body: string
  error?: string
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise((done) => setTimeout(done, ms))
}

async function get(
  url: string,
  options: Options,
  fetchImpl: FetchImplementation,
  init: RequestInit = {},
  maxCharacters = MAX_BODY_CHARACTERS,
): Promise<Fetched> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  try {
    const response = await fetchImpl(url, {
      redirect: 'manual',
      signal: controller.signal,
      ...init,
    })
    const body = (await response.text()).slice(0, maxCharacters)
    return {
      url,
      status: response.status,
      location: response.headers.get('location'),
      robotsHeader: response.headers.get('x-robots-tag'),
      body,
    }
  } catch (error) {
    return {
      url,
      status: 0,
      location: null,
      robotsHeader: null,
      body: '',
      error: error instanceof Error ? `${error.name}: ${error.message}` : 'UnknownError',
    }
  } finally {
    clearTimeout(timeout)
    await sleep(options.delayMs)
  }
}

/* ------------------------------------------------------------------ parsing */

export function sitemapLocations(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].flatMap((match) =>
    match[1] === undefined ? [] : [match[1].replace(/&amp;/g, '&')],
  )
}

export function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml)
}

function attribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\`]+))`, 'i')
  const match = pattern.exec(tag)
  const value = match?.[1] ?? match?.[2] ?? match?.[3]
  return value === undefined ? null : value.trim()
}

export function metaRobots(html: string): string | null {
  let content: string | null = null
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    if (attribute(tag[0], 'name')?.toLowerCase() === 'robots')
      content = attribute(tag[0], 'content')
  }
  return content
}

export function hasNoindex(value: string | null): boolean {
  return value !== null && /\bnoindex\b/i.test(value)
}

/** Every `href` and `src` on the page, absolute. */
export function pageUrls(html: string, pageUrl: string): string[] {
  const found = new Set<string>()
  for (const tag of html.matchAll(/<(?:a|link|img|script|iframe)\b[^>]*>/gi)) {
    for (const name of ['href', 'src']) {
      const value = attribute(tag[0], name)
      if (value === null || value.length === 0 || value.startsWith('#')) continue
      try {
        found.add(new URL(value, pageUrl).toString())
      } catch {
        /* a value that is not a URL is not a link to a vendor either */
      }
    }
  }
  return [...found]
}

/** Vendor links on one page: a selling host, or a selling shape on any host. */
export function vendorLinks(urls: readonly string[], baseHost: string): string[] {
  const hits: string[] = []
  for (const raw of urls) {
    let url: URL
    try {
      url = new URL(raw)
    } catch {
      continue
    }
    if (url.hostname === baseHost) continue
    if (VENDOR_HOST_PATTERNS.some((pattern) => pattern.test(url.hostname))) {
      hits.push(raw)
      continue
    }
    if (VENDOR_URL_PATTERNS.some((pattern) => pattern.test(raw))) hits.push(raw)
  }
  return hits
}

/**
 * Whether robots.txt disallows a path for the `*` group.
 *
 * Only the wildcard group is read, and only its `Disallow` lines: this asks the one question the
 * deployment plan asks — can a crawler still reach the dossiers — and does not reimplement the
 * robots grammar.
 */
export function robotsDisallows(
  robotsTxt: string,
  path: string,
): { blocked: boolean; rule: string | null } {
  let inWildcardGroup = false
  let winner: { blocked: boolean; rule: string; length: number } | null = null
  for (const line of robotsTxt.split(/\r?\n/)) {
    const clean = line.replace(/#.*/, '').trim()
    if (clean.length === 0) continue
    const [rawField, ...rest] = clean.split(':')
    const field = (rawField ?? '').trim().toLowerCase()
    const value = rest.join(':').trim()
    if (field === 'user-agent') {
      inWildcardGroup = value === '*'
      continue
    }
    if (!inWildcardGroup) continue
    if (field !== 'allow' && field !== 'disallow') continue
    if (value === '' || !path.startsWith(value)) continue
    // Longest match wins, and Allow wins a tie — the rule every major crawler applies.
    const candidate = {
      blocked: field === 'disallow',
      rule: `${field === 'allow' ? 'Allow' : 'Disallow'}: ${value}`,
      length: value.length,
    }
    if (
      winner === null ||
      candidate.length > winner.length ||
      (candidate.length === winner.length && !candidate.blocked)
    ) {
      winner = candidate
    }
  }
  return { blocked: winner?.blocked ?? false, rule: winner?.rule ?? null }
}

/** Deterministic, evenly spaced sample; the same input always yields the same URLs. */
export function evenSample<T>(items: readonly T[], count: number): T[] {
  if (items.length <= count) return [...items]
  const step = items.length / count
  const picked: T[] = []
  for (let index = 0; index < count; index += 1) {
    const item = items[Math.floor(index * step)]
    if (item !== undefined) picked.push(item)
  }
  return picked
}

function cap(items: readonly string[]): string[] {
  return items.slice(0, MAX_LISTED_FAILURES)
}

/* ------------------------------------------------------------------ the checks */

interface SitemapReading {
  children: string[]
  urlsByChild: Map<string, string[]>
  dossierUrls: string[]
}

async function readSitemaps(
  options: Options,
  fetchImpl: FetchImplementation,
): Promise<{ check: CheckResult; reading: SitemapReading }> {
  const origin = options.baseUrl.origin
  const reading: SitemapReading = { children: [], urlsByChild: new Map(), dossierUrls: [] }
  const index = await get(`${origin}/sitemap.xml`, options, fetchImpl, {}, MAX_XML_CHARACTERS)
  if (index.status !== 200) {
    return {
      check: {
        id: 'sitemap-index',
        title: 'The sitemap index resolves and every child is within the URL ceiling',
        status: 'FAIL',
        detail: `GET /sitemap.xml answered ${index.status || index.error}.`,
      },
      reading,
    }
  }

  const failures: string[] = []
  const facts: Record<string, unknown> = {}
  const locations = sitemapLocations(index.body)
  if (!isSitemapIndex(index.body)) {
    // A single urlset is still readable; it is just not the index the spec asks for.
    failures.push('/sitemap.xml is a urlset, not a sitemap index')
    reading.urlsByChild.set('/sitemap.xml', locations)
    reading.dossierUrls = locations.filter((url) => url.startsWith(`${origin}/d/`))
    if (locations.length > SITEMAP_URL_CEILING) {
      failures.push(
        `/sitemap.xml lists ${locations.length} URLs, over the ${SITEMAP_URL_CEILING} ceiling`,
      )
    }
  } else {
    reading.children = locations.filter((url) => url.startsWith(origin))
    facts.children = reading.children
    for (const child of reading.children) {
      const response = await get(child, options, fetchImpl, {}, MAX_XML_CHARACTERS)
      if (response.status !== 200) {
        failures.push(`${child} answered ${response.status || response.error}`)
        continue
      }
      const urls = sitemapLocations(response.body)
      reading.urlsByChild.set(child, urls)
      if (urls.length > SITEMAP_URL_CEILING) {
        failures.push(`${child} lists ${urls.length} URLs, over the ${SITEMAP_URL_CEILING} ceiling`)
      }
    }
    const foreign = locations.filter((url) => !url.startsWith(origin))
    if (foreign.length > 0) failures.push(`children on another origin: ${foreign.join(', ')}`)
    reading.dossierUrls = [
      ...new Set(
        [...reading.urlsByChild.values()].flat().filter((url) => url.startsWith(`${origin}/d/`)),
      ),
    ]
  }

  facts.dossierUrls = reading.dossierUrls.length
  facts.urlCounts = Object.fromEntries(
    [...reading.urlsByChild.entries()].map(([child, urls]) => [child, urls.length]),
  )

  return {
    check: {
      id: 'sitemap-index',
      title: 'The sitemap index resolves and every child is within the URL ceiling',
      status: failures.length === 0 ? 'PASS' : 'FAIL',
      detail:
        failures.length === 0
          ? `${reading.children.length} children, ${reading.dossierUrls.length} dossier URLs, each child within ${SITEMAP_URL_CEILING}.`
          : `${failures.length} problem(s) with the sitemap index.`,
      ...(failures.length > 0 ? { failures: cap(failures), failureCount: failures.length } : {}),
      facts,
    },
    reading,
  }
}

async function readOldSlugs(options: Options): Promise<string[]> {
  if (options.redirects.length > 0) return options.redirects
  const path = resolve(options.dispositions)
  if (!existsSync(path)) return []
  const raw = await readFile(path, 'utf8')
  const slugs: string[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    try {
      const row = JSON.parse(trimmed) as { disposition?: string; slug?: string }
      if (row.disposition === 'REDIRECT' && typeof row.slug === 'string')
        slugs.push(`/d/${row.slug}`)
    } catch {
      /* a line that is not JSON supplies no slug */
    }
  }
  return evenSample(slugs, options.redirectCount)
}

/** Tier 3 paths named on the command line, else the Development facet page's own record links. */
async function findTier3Paths(options: Options, fetchImpl: FetchImplementation): Promise<string[]> {
  if (options.tier3.length > 0) return options.tier3
  const origin = options.baseUrl.origin
  const page = await get(`${origin}/browse/type/development`, options, fetchImpl)
  if (page.status !== 200) return []
  const paths = pageUrls(page.body, `${origin}/browse/type/development`)
    .filter((url) => url.startsWith(`${origin}/d/`))
    .map((url) => new URL(url).pathname)
  return evenSample([...new Set(paths)], 3)
}

export async function verifyLive(
  options: Options,
  fetchImpl: FetchImplementation = fetch,
): Promise<VerifyReport> {
  const startedAt = new Date().toISOString()
  const origin = options.baseUrl.origin
  const baseHost = options.baseUrl.hostname
  const checks: CheckResult[] = []
  const externalHosts = new Set<string>()
  const vendorHits: string[] = []
  const suppressedFailures: string[] = []
  let suppressedSeen = 0

  let pagesRead = 0
  const noteLinks = (html: string, pageUrl: string): void => {
    pagesRead += 1
    const urls = pageUrls(html, pageUrl)
    for (const raw of urls) {
      try {
        const host = new URL(raw).hostname
        if (host !== baseHost) externalHosts.add(host)
      } catch {
        /* not a URL */
      }
    }
    vendorHits.push(...vendorLinks(urls, baseHost))
  }

  const noteSuppression = (html: string, pageUrl: string): void => {
    if (!/data-block="supervision"/.test(html)) return
    suppressedSeen += 1
    for (const block of SUPPRESSED_BLOCKS) {
      if (new RegExp(`data-block="${block}"`).test(html)) {
        suppressedFailures.push(`${pageUrl} renders the ${block} block`)
      }
    }
  }

  /* 1. the sitemap index */
  const { check: sitemapCheck, reading } = await readSitemaps(options, fetchImpl)
  checks.push(sitemapCheck)

  /* 2. sample dossier URLs answer 200 */
  const samplePaths =
    options.samples.length > 0
      ? options.samples
      : evenSample(reading.dossierUrls, options.sampleCount).map((url) => new URL(url).pathname)
  if (samplePaths.length === 0) {
    checks.push({
      id: 'samples-200',
      title: 'Sample dossier URLs answer 200',
      status: 'NOT RUN',
      detail: 'No sample was named and the sitemap listed no dossier URL to draw one from.',
    })
  } else {
    const failures: string[] = []
    for (const path of samplePaths) {
      const url = `${origin}${path}`
      const response = await get(url, options, fetchImpl)
      if (response.status !== 200) {
        failures.push(`${path} answered ${response.status || response.error}`)
        continue
      }
      noteLinks(response.body, url)
      noteSuppression(response.body, path)
    }
    checks.push({
      id: 'samples-200',
      title: 'Sample dossier URLs answer 200',
      status: failures.length === 0 ? 'PASS' : 'FAIL',
      detail:
        failures.length === 0
          ? `${samplePaths.length} sampled dossier URLs answered 200.`
          : `${failures.length} of ${samplePaths.length} sampled URLs did not answer 200.`,
      ...(failures.length > 0 ? { failures: cap(failures), failureCount: failures.length } : {}),
      facts: { sampled: samplePaths },
    })
  }

  /* 3. redirects answer 301 or 308 */
  const oldSlugs = await readOldSlugs(options)
  if (oldSlugs.length === 0) {
    checks.push({
      id: 'redirects',
      title: 'Previously indexed slugs answer 301 or 308',
      status: 'NOT RUN',
      detail: `No --redirect was named and ${options.dispositions} supplied no REDIRECT row.`,
    })
  } else {
    const failures: string[] = []
    for (const path of oldSlugs) {
      const response = await get(`${origin}${path}`, options, fetchImpl)
      if (response.status !== 301 && response.status !== 308) {
        failures.push(`${path} answered ${response.status || response.error}`)
        continue
      }
      if (response.location === null)
        failures.push(`${path} answered ${response.status} with no Location`)
    }
    checks.push({
      id: 'redirects',
      title: 'Previously indexed slugs answer 301 or 308',
      status: failures.length === 0 ? 'PASS' : 'FAIL',
      detail:
        failures.length === 0
          ? `${oldSlugs.length} old slugs answered 301 or 308 with a target.`
          : `${failures.length} of ${oldSlugs.length} old slugs did not.`,
      ...(failures.length > 0 ? { failures: cap(failures), failureCount: failures.length } : {}),
    })
  }

  /* 4. Tier 3: noindex, and in no sitemap */
  const tier3Paths = await findTier3Paths(options, fetchImpl)
  if (tier3Paths.length === 0) {
    checks.push({
      id: 'tier-3-noindex',
      title: 'A Tier 3 record carries noindex and is in no sitemap',
      status: 'NOT RUN',
      detail:
        'No --tier3 path was named and /browse/type/development listed no record, which is what a deployment before the Tier 3 load looks like.',
    })
  } else {
    const failures: string[] = []
    const inSitemap = new Set(reading.dossierUrls)
    for (const path of tier3Paths) {
      const url = `${origin}${path}`
      const response = await get(url, options, fetchImpl)
      if (response.status !== 200) {
        failures.push(`${path} answered ${response.status || response.error}`)
        continue
      }
      if (!hasNoindex(metaRobots(response.body)) && !hasNoindex(response.robotsHeader)) {
        failures.push(`${path} carries no noindex directive`)
      }
      if (inSitemap.has(url)) failures.push(`${path} appears in a sitemap child`)
      noteLinks(response.body, url)
      noteSuppression(response.body, path)
    }
    checks.push({
      id: 'tier-3-noindex',
      title: 'A Tier 3 record carries noindex and is in no sitemap',
      status: failures.length === 0 ? 'PASS' : 'FAIL',
      detail:
        failures.length === 0
          ? `${tier3Paths.length} Tier 3 records carry noindex and appear in no sitemap child.`
          : `${failures.length} Tier 3 problem(s).`,
      ...(failures.length > 0 ? { failures: cap(failures), failureCount: failures.length } : {}),
      facts: { checked: tier3Paths },
    })
  }

  /* 5. robots.txt still allows the dossiers */
  const robots = await get(`${origin}/robots.txt`, options, fetchImpl)
  if (robots.status !== 200) {
    checks.push({
      id: 'robots-allows-dossiers',
      title: 'robots.txt allows /d/',
      status: 'FAIL',
      detail: `GET /robots.txt answered ${robots.status || robots.error}.`,
    })
  } else {
    const dossiers = robotsDisallows(robots.body, '/d/')
    const wholeSite = robotsDisallows(robots.body, '/')
    // The canonical host is a fact about the site, not about the machine running this command,
    // so it is compared with the canonical origin rather than read from the environment.
    const canonical = options.baseUrl.host === new URL(CANONICAL_PRODUCTION_ORIGIN).host
    if (!dossiers.blocked) {
      checks.push({
        id: 'robots-allows-dossiers',
        title: 'robots.txt allows /d/',
        status: 'PASS',
        detail: 'robots.txt carries no wildcard Disallow that covers /d/.',
      })
    } else if (wholeSite.blocked && !canonical) {
      checks.push({
        id: 'robots-allows-dossiers',
        title: 'robots.txt allows /d/',
        status: 'PASS',
        detail:
          'This host blocks every crawler, which is what a non-canonical deployment must do; no rule singles out /d/. Re-run against the canonical host to check the public rules.',
        facts: { rule: dossiers.rule, canonicalHost: false },
      })
    } else {
      checks.push({
        id: 'robots-allows-dossiers',
        title: 'robots.txt allows /d/',
        status: 'FAIL',
        detail: `robots.txt disallows the dossiers (${dossiers.rule ?? 'unknown rule'}).`,
        facts: { rule: dossiers.rule, canonicalHost: canonical },
      })
    }
  }

  /* 6. no vendor host in any link on a page this run fetched */
  // Counted from pages whose body was actually read: a run where every request failed has read no
  // link, and must not report that as an absence of vendor links.
  const fetchedPages = pagesRead
  if (fetchedPages === 0) {
    checks.push({
      id: 'no-vendor-hosts',
      title: 'No vendor, retailer or affiliate link on a fetched page',
      status: 'NOT RUN',
      detail: 'No page was fetched, so no link was read.',
    })
  } else {
    const unique = [...new Set(vendorHits)]
    checks.push({
      id: 'no-vendor-hosts',
      title: 'No vendor, retailer or affiliate link on a fetched page',
      status: unique.length === 0 ? 'PASS' : 'FAIL',
      detail:
        unique.length === 0
          ? `No selling host or affiliate shape in the links on ${fetchedPages} fetched pages; ${externalHosts.size} external hosts seen and listed for review.`
          : `${unique.length} link(s) point at a vendor, retailer or affiliate.`,
      ...(unique.length > 0 ? { failures: cap(unique), failureCount: unique.length } : {}),
      facts: { pagesRead: fetchedPages, externalHosts: [...externalHosts].sort() },
    })
  }

  /* 7. no suppressed page renders a seed 1, 2 or 6 block */
  const suppressedPaths = options.suppressed
  for (const path of suppressedPaths) {
    const url = `${origin}${path}`
    const response = await get(url, options, fetchImpl)
    if (response.status !== 200) {
      suppressedFailures.push(`${path} answered ${response.status || response.error}`)
      continue
    }
    noteLinks(response.body, url)
    noteSuppression(response.body, path)
  }
  if (suppressedSeen === 0) {
    checks.push({
      id: 'suppression',
      title: 'No suppressed page renders a seed 1, 2 or 6 block',
      status: 'NOT RUN',
      detail:
        'None of the pages read carries the supervision block, so nothing exercised the rule. Name one with --suppressed.',
    })
  } else {
    checks.push({
      id: 'suppression',
      title: 'No suppressed page renders a seed 1, 2 or 6 block',
      status: suppressedFailures.length === 0 ? 'PASS' : 'FAIL',
      detail:
        suppressedFailures.length === 0
          ? `${suppressedSeen} suppressed page(s) read; none renders a bioavailability, n-of-1 or time-to-signal block.`
          : `${suppressedFailures.length} suppressed page problem(s).`,
      ...(suppressedFailures.length > 0
        ? { failures: cap(suppressedFailures), failureCount: suppressedFailures.length }
        : {}),
      facts: { suppressedPagesRead: suppressedSeen },
    })
  }

  const passed = checks.filter((check) => check.status === 'PASS').length
  const failed = checks.filter((check) => check.status === 'FAIL').length
  const notRun = checks.filter((check) => check.status === 'NOT RUN').length

  return {
    baseUrl: origin,
    startedAt,
    finishedAt: new Date().toISOString(),
    checks,
    passed,
    failed,
    notRun,
    externalHosts: [...externalHosts].sort(),
    ok: failed === 0 && (!options.requireAll || notRun === 0),
  }
}

/* ------------------------------------------------------------------ CLI */

function usage(): string {
  return [
    'Usage: npx tsx scripts/corpus-20k/deploy/verify-live.ts --base-url <url> [options]',
    '',
    'Options:',
    '  --base-url <url>       Deployment to read (required)',
    `  --sample <path>        Dossier path to check; repeatable (default: ${DEFAULT_SAMPLES} from the sitemap)`,
    '  --samples <n>          How many sitemap URLs to sample',
    '  --tier3 <path>         Tier 3 dossier path; repeatable (default: from /browse/type/development)',
    '  --redirect <path>      Old slug path expected to redirect; repeatable',
    `  --dispositions <file>  Reconciliation NDJSON for old slugs (default: ${DEFAULT_DISPOSITIONS})`,
    `  --redirects <n>        How many old slugs to check (default: ${DEFAULT_REDIRECTS})`,
    '  --suppressed <path>    Suppressed dossier path; repeatable',
    `  --timeout-ms <ms>      Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})`,
    `  --delay-ms <ms>        Pause between requests (default: ${DEFAULT_DELAY_MS})`,
    '  --require-all          A check that could not run counts as a failure',
    '  --json                 Print the report as JSON',
    '  --help                 Show this help',
    '',
    'Exit code 0 when every check passed, 1 when one failed, 2 on a usage error.',
  ].join('\n')
}

function render(report: VerifyReport): string {
  const lines = [`Verifying ${report.baseUrl}`, '']
  for (const check of report.checks) {
    lines.push(`[${check.status}] ${check.title}`)
    lines.push(`         ${check.detail}`)
    for (const failure of check.failures ?? []) lines.push(`         - ${failure}`)
    if (check.failureCount !== undefined && (check.failures?.length ?? 0) < check.failureCount) {
      lines.push(`         … ${check.failureCount - (check.failures?.length ?? 0)} more`)
    }
  }
  lines.push('')
  lines.push(`Passed ${report.passed}, failed ${report.failed}, not run ${report.notRun}.`)
  if (report.externalHosts.length > 0) {
    lines.push(`External hosts seen: ${report.externalHosts.join(', ')}`)
  }
  return lines.join('\n')
}

async function runCli(): Promise<void> {
  let options: Options
  try {
    options = parseArguments(process.argv.slice(2))
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error('')
    console.error(usage())
    process.exitCode = 2
    return
  }
  if (options.help) {
    console.log(usage())
    return
  }
  const report = await verifyLive(options)
  console.log(options.json ? JSON.stringify(report, null, 2) : render(report))
  if (!report.ok) process.exitCode = 1
}

const mainPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (mainPath && fileURLToPath(import.meta.url) === mainPath) void runCli()

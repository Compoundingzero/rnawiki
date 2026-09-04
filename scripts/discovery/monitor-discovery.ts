/**
 * Read every canonical dossier URL from a sitemap and record what the origin actually serves.
 *
 * The command performs read-only GET requests and writes two files under docs/audits/discovery:
 * a resumable NDJSON checkpoint with one line per medicine, and a summary JSON. It decides one
 * state, `DISCOVERY_READY`, from the response it received. It never records that a page was
 * crawled, indexed or cited: those need a report from outside this repository.
 *
 * Memory. A sitemap index over a corpus of tens of thousands of records is read one child at a
 * time: each child's XML is fetched, turned into URLs, checked and dropped before the next child
 * is fetched, and the checkpoint is folded into counters line by line rather than parsed into an
 * array of records. What the run holds is the URL set it has seen, not the documents behind it.
 * `--tier n` narrows the run to one sitemap child, which is how the full-corpus run was completed
 * before this streaming existed.
 *
 * Usage:
 *   npx tsx scripts/discovery/monitor-discovery.ts --origin https://rnawiki.com
 *   npx tsx scripts/discovery/monitor-discovery.ts --tier 1 --limit 50
 *   npx tsx scripts/discovery/monitor-discovery.ts --input ./sitemap.xml --limit 50
 */

import { createReadStream } from 'node:fs'
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

import {
  apiUrlForDossierUrl,
  classifyDiscoveryObservation,
  parseSitemapLocations,
  sitemapDossierUrls,
  type DiscoveryBlockerCode,
  type DiscoveryObservation,
} from './discovery-states'

const DEFAULT_ORIGIN = 'https://rnawiki.com'
const DEFAULT_CONCURRENCY = 4
const MAX_CONCURRENCY = 8
const DEFAULT_DELAY_MS = 250
const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_OUT_DIR = 'docs/audits/discovery'
const MAX_BODY_CHARACTERS = 2_000_000

/**
 * The browse spec puts every indexed record within three clicks of home
 * (home \u2192 facet index \u2192 facet page \u2192 record), and allows one four-click path when a
 * facet value splits by letter and then paginates. The walk therefore expands navigation pages to
 * depth three, which is far enough to see a record at four clicks and call it too deep.
 */
const MAX_CLICK_DEPTH = 4
const DEFAULT_CLICK_DEPTH_BUDGET = 600
const MAX_DEEP_RECORDS_LISTED = 200

export interface MonitorOptions {
  origin: URL
  /** Sitemap URL or local file path. Defaults to `${origin}/sitemap.xml`. */
  input: string | null
  concurrency: number
  delayMs: number
  timeoutMs: number
  outDir: string
  /** 0 means every URL in the sitemap. */
  limit: number
  resume: boolean
  json: boolean
  help: boolean
  /** Walk the site from home and report how many clicks each indexed record is away. */
  clickDepth: boolean
  /** Most navigation pages the walk may fetch. A walk that runs out says so. */
  clickDepthBudget: number
  /** Read only `/sitemaps/tier-<n>.xml` of the index, or null for every child it names. */
  tier: number | null
}

export interface MonitorRecord {
  slug: string
  url: string
  checkedAt: string
  page: DiscoveryObservation
  api: { url: string | null; status: number; contentType: string; error?: string }
  state: 'DISCOVERY_READY' | null
  blockers: DiscoveryBlockerCode[]
}

type FetchImplementation = (input: string | URL, init?: RequestInit) => Promise<Response>

function optionValue(args: string[], index: number, name: string): [string, number] {
  const current = args[index] ?? ''
  const inline = current.startsWith(`${name}=`) ? current.slice(name.length + 1) : null
  if (inline !== null) return [inline, index]
  const next = args[index + 1]
  if (!next || next.startsWith('--')) throw new Error(`${name} requires a value.`)
  return [next, index + 1]
}

function boundedInteger(value: string, name: string, minimum: number, maximum: number): number {
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}.`)
  }
  return parsed
}

export function parseMonitorArguments(args: string[]): MonitorOptions {
  let originValue = DEFAULT_ORIGIN
  let input: string | null = null
  let concurrency = DEFAULT_CONCURRENCY
  let delayMs = DEFAULT_DELAY_MS
  let timeoutMs = DEFAULT_TIMEOUT_MS
  let outDir = DEFAULT_OUT_DIR
  let limit = 0
  let resume = false
  let json = false
  let help = false
  let clickDepth = true
  let clickDepthBudget = DEFAULT_CLICK_DEPTH_BUDGET
  let tier: number | null = null

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? ''
    if (argument === '--json') json = true
    else if (argument === '--resume') resume = true
    else if (argument === '--no-click-depth') clickDepth = false
    else if (argument === '--click-depth-budget' || argument.startsWith('--click-depth-budget=')) {
      const [value, consumed] = optionValue(args, index, '--click-depth-budget')
      clickDepthBudget = boundedInteger(value, '--click-depth-budget', 1, 20_000)
      index = consumed
    } else if (argument === '--help' || argument === '-h') help = true
    else if (argument === '--origin' || argument.startsWith('--origin=')) {
      const [value, consumed] = optionValue(args, index, '--origin')
      originValue = value
      index = consumed
    } else if (argument === '--input' || argument.startsWith('--input=')) {
      const [value, consumed] = optionValue(args, index, '--input')
      input = value
      index = consumed
    } else if (argument === '--concurrency' || argument.startsWith('--concurrency=')) {
      const [value, consumed] = optionValue(args, index, '--concurrency')
      concurrency = boundedInteger(value, '--concurrency', 1, MAX_CONCURRENCY)
      index = consumed
    } else if (argument === '--delay-ms' || argument.startsWith('--delay-ms=')) {
      const [value, consumed] = optionValue(args, index, '--delay-ms')
      delayMs = boundedInteger(value, '--delay-ms', 0, 60_000)
      index = consumed
    } else if (argument === '--timeout-ms' || argument.startsWith('--timeout-ms=')) {
      const [value, consumed] = optionValue(args, index, '--timeout-ms')
      timeoutMs = boundedInteger(value, '--timeout-ms', 500, 60_000)
      index = consumed
    } else if (argument === '--limit' || argument.startsWith('--limit=')) {
      const [value, consumed] = optionValue(args, index, '--limit')
      limit = boundedInteger(value, '--limit', 0, 100_000)
      index = consumed
    } else if (argument === '--out-dir' || argument.startsWith('--out-dir=')) {
      const [value, consumed] = optionValue(args, index, '--out-dir')
      outDir = value
      index = consumed
    } else if (argument === '--tier' || argument.startsWith('--tier=')) {
      const [value, consumed] = optionValue(args, index, '--tier')
      tier = boundedInteger(value, '--tier', 1, 2)
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

  return {
    origin,
    input,
    concurrency,
    delayMs,
    timeoutMs,
    outDir,
    limit,
    resume,
    json,
    help,
    clickDepth,
    clickDepthBudget,
    tier,
  }
}

/** The sitemap child one corpus tier is served from (docs/specs/browse.md). */
export function tierSitemapChild(origin: string, tier: number): string {
  return `${origin}/sitemaps/tier-${tier}.xml`
}

function attribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>\`]+))`, 'i')
  const match = pattern.exec(tag)
  const value = match?.[1] ?? match?.[2] ?? match?.[3]
  return value === undefined ? null : value.trim()
}

/** Pull only the four discovery signals out of served HTML. Nothing else is read or stored. */
export function readDiscoverySignals(html: string): {
  robotsMeta: string | null
  canonical: string | null
  hasJsonLd: boolean
} {
  let robotsMeta: string | null = null
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const name = attribute(tag[0], 'name')?.toLowerCase()
    if (name === 'robots') robotsMeta = attribute(tag[0], 'content')
  }
  let canonical: string | null = null
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = attribute(tag[0], 'rel')?.toLowerCase()
    if (rel === 'canonical') canonical = attribute(tag[0], 'href')
  }
  const hasJsonLd = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json/i.test(html)
  return { robotsMeta, canonical, hasJsonLd }
}

function errorName(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : 'UnknownError'
}

async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return
  await new Promise((done) => setTimeout(done, ms))
}

async function observePage(
  url: string,
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
): Promise<DiscoveryObservation> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  try {
    const response = await fetchImpl(url, {
      redirect: 'follow',
      headers: { accept: 'text/html' },
      signal: controller.signal,
    })
    const body = (await response.text()).slice(0, MAX_BODY_CHARACTERS)
    const signals = readDiscoverySignals(body)
    return {
      url,
      status: response.status,
      finalUrl: response.url || url,
      robotsMeta: signals.robotsMeta,
      canonical: signals.canonical,
      hasJsonLd: signals.hasJsonLd,
      xRobotsTag: response.headers.get('x-robots-tag'),
    }
  } catch (error) {
    return {
      url,
      status: 0,
      finalUrl: url,
      robotsMeta: null,
      canonical: null,
      hasJsonLd: false,
      xRobotsTag: null,
      error: errorName(error),
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function observeApi(
  url: string | null,
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
): Promise<MonitorRecord['api']> {
  if (!url) return { url: null, status: 0, contentType: '', error: 'no_api_url' }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs)
  try {
    const response = await fetchImpl(url, {
      redirect: 'follow',
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
    // The body is not stored: this check asks whether the machine surface answers, not what it says.
    await response.arrayBuffer()
    return {
      url,
      status: response.status,
      contentType: response.headers.get('content-type') ?? '',
    }
  } catch (error) {
    return { url, status: 0, contentType: '', error: errorName(error) }
  } finally {
    clearTimeout(timeout)
  }
}

export async function monitorOneUrl(
  url: string,
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
): Promise<MonitorRecord> {
  const page = await observePage(url, options, fetchImpl)
  await sleep(options.delayMs)
  const api = await observeApi(apiUrlForDossierUrl(url), options, fetchImpl)
  const classification = classifyDiscoveryObservation(page)
  return {
    slug: new URL(url).pathname.replace('/d/', ''),
    url,
    checkedAt: new Date().toISOString(),
    page,
    api,
    state: classification.state,
    blockers: classification.blockers,
  }
}

/** Run `worker` over `items` with a fixed number of slots, preserving input order in the result. */
export async function runWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const slots = Array.from(
    { length: Math.max(1, Math.min(concurrency, items.length)) },
    async () => {
      for (;;) {
        const index = next
        next += 1
        if (index >= items.length) return
        results[index] = await worker(items[index]!, index)
      }
    },
  )
  await Promise.all(slots)
  return results
}

export interface MonitorSummary {
  origin: string
  startedAt: string
  finishedAt: string
  sitemapDossierUrls: number
  checked: number
  resumedFromCheckpoint: number
  discoveryReady: number
  notDiscoveryReady: number
  apiAvailable: number
  blockerCounts: Record<string, number>
  /** Sitemap documents read, and the children an index named. */
  sitemapDocumentsRead: number
  sitemapChildren: string[]
  /** The tier this run was narrowed to, or null when it read every child. */
  tier: number | null
  unreadableSitemapChildren: Array<{ url: string; reason: string }>
  /** Absent when the walk was turned off with --no-click-depth. */
  clickDepth?: ClickDepthReport
  /** Named so nobody reads readiness as proof of indexing. */
  note: string
}

/**
 * What a run counts, folded one record at a time.
 *
 * The totals are the whole of what the summary needs, so a run of any size holds these four
 * numbers rather than every record it has checked.
 */
export interface MonitorTotals {
  checked: number
  discoveryReady: number
  apiAvailable: number
  blockerCounts: Record<string, number>
}

export function emptyMonitorTotals(): MonitorTotals {
  return { checked: 0, discoveryReady: 0, apiAvailable: 0, blockerCounts: {} }
}

export function foldMonitorRecord(totals: MonitorTotals, record: MonitorRecord): MonitorTotals {
  totals.checked += 1
  if (record.state === 'DISCOVERY_READY') totals.discoveryReady += 1
  if (record.api.status === 200) totals.apiAvailable += 1
  for (const blocker of record.blockers) {
    totals.blockerCounts[blocker] = (totals.blockerCounts[blocker] ?? 0) + 1
  }
  return totals
}

interface MonitorSummaryContext {
  startedAt: string
  finishedAt: string
  sitemapDossierUrls: number
  resumedFromCheckpoint: number
  /** Optional so a caller that read one plain sitemap need not restate the obvious. */
  sitemapDocumentsRead?: number
  sitemapChildren?: string[]
  unreadableSitemapChildren?: Array<{ url: string; reason: string }>
  clickDepth?: ClickDepthReport
  tier?: number | null
}

export function summarizeMonitorTotals(
  origin: string,
  totals: MonitorTotals,
  context: MonitorSummaryContext,
): MonitorSummary {
  return {
    origin,
    startedAt: context.startedAt,
    finishedAt: context.finishedAt,
    sitemapDossierUrls: context.sitemapDossierUrls,
    checked: totals.checked,
    resumedFromCheckpoint: context.resumedFromCheckpoint,
    discoveryReady: totals.discoveryReady,
    notDiscoveryReady: totals.checked - totals.discoveryReady,
    apiAvailable: totals.apiAvailable,
    blockerCounts: totals.blockerCounts,
    sitemapDocumentsRead: context.sitemapDocumentsRead ?? 1,
    sitemapChildren: context.sitemapChildren ?? [],
    tier: context.tier ?? null,
    unreadableSitemapChildren: context.unreadableSitemapChildren ?? [],
    ...(context.clickDepth ? { clickDepth: context.clickDepth } : {}),
    note: 'DISCOVERY_READY describes what this origin served. It is not a record of crawling, indexing or citation.',
  }
}

export function summarizeMonitorRecords(
  origin: string,
  records: readonly MonitorRecord[],
  context: MonitorSummaryContext,
): MonitorSummary {
  const totals = emptyMonitorTotals()
  for (const record of records) foldMonitorRecord(totals, record)
  return summarizeMonitorTotals(origin, totals, context)
}

async function loadSitemapXml(
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
): Promise<string> {
  const source = options.input ?? `${options.origin.origin}/sitemap.xml`
  if (/^https?:\/\//i.test(source)) {
    const response = await fetchImpl(source, { headers: { accept: 'application/xml' } })
    if (!response.ok) throw new Error(`Sitemap request returned HTTP ${response.status}.`)
    return response.text()
  }
  return readFile(resolve(source), 'utf8')
}

/** A `<sitemapindex>` lists other sitemaps; a `<urlset>` lists pages. */
export function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml)
}

/** Same-origin child sitemaps named by an index document, deduplicated, in document order. */
export function sitemapIndexChildren(xml: string, origin: string): string[] {
  if (!isSitemapIndex(xml)) return []
  const seen = new Set<string>()
  for (const location of parseSitemapLocations(xml)) {
    let url: URL
    try {
      url = new URL(location)
    } catch {
      continue
    }
    if (url.origin !== origin) continue
    seen.add(url.toString())
  }
  return [...seen]
}

export interface SitemapReadResult {
  /** Every canonical dossier URL the sitemap, or its children, listed. */
  urls: string[]
  /** The child sitemaps an index named, in the order it named them. */
  children: string[]
  /** How many sitemap documents were read, the index itself included. */
  documentsRead: number
  /** A child an index named that could not be read, with the reason. */
  unreadableChildren: Array<{ url: string; reason: string }>
}

/** Children the run will read: every same-origin child, or the one `--tier` names. */
export function selectedSitemapChildren(
  xml: string,
  options: MonitorOptions,
): { children: string[]; missing: Array<{ url: string; reason: string }> } {
  const origin = options.origin.origin
  const named = sitemapIndexChildren(xml, origin)
  if (options.tier === null) return { children: named, missing: [] }
  const wanted = tierSitemapChild(origin, options.tier)
  return named.includes(wanted)
    ? { children: [wanted], missing: [] }
    : { children: [], missing: [{ url: wanted, reason: 'not named by the sitemap index' }] }
}

/**
 * Read the dossier URLs out of a sitemap one child at a time, following a sitemap index first.
 *
 * The site serves `/sitemap.xml` as an index over `/sitemaps/tier-1.xml` and its siblings
 * (docs/specs/browse.md), so reading the index alone would find no `/d/` URL at all and report an
 * empty corpus. Only same-origin children are followed, and a child that does not answer is
 * recorded rather than passed over silently.
 *
 * `onUrls` receives one child's dossier URLs at a time. The child's XML — up to 50,000 URLs, tens
 * of megabytes of text — is released before the next child is requested, so the run's memory is
 * the URLs it has seen and never the documents they came from.
 */
export async function streamSitemapDossierUrls(
  xml: string,
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
  onUrls: (urls: string[], child: string | null) => Promise<void> | void,
): Promise<Omit<SitemapReadResult, 'urls'>> {
  const origin = options.origin.origin
  if (!isSitemapIndex(xml)) {
    await onUrls(sitemapDossierUrls(xml, origin), null)
    return { children: [], documentsRead: 1, unreadableChildren: [] }
  }

  const { children, missing } = selectedSitemapChildren(xml, options)
  const unreadableChildren: Array<{ url: string; reason: string }> = [...missing]
  let documentsRead = 1

  for (const child of children) {
    let urls: string[] | null = null
    try {
      const response = await fetchImpl(child, { headers: { accept: 'application/xml' } })
      if (!response.ok) {
        unreadableChildren.push({ url: child, reason: `HTTP ${response.status}` })
        continue
      }
      // The body is scoped to this iteration so the child's XML can be collected before the next
      // request; only the extracted URLs outlive it.
      urls = sitemapDossierUrls(await response.text(), origin)
      documentsRead += 1
    } catch (error) {
      unreadableChildren.push({ url: child, reason: errorName(error) })
    } finally {
      await sleep(options.delayMs)
    }
    if (urls) await onUrls(urls, child)
  }

  return { children, documentsRead, unreadableChildren }
}

/** The whole set at once, for a caller small enough to hold it. */
export async function readSitemapDossierUrls(
  xml: string,
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
): Promise<SitemapReadResult> {
  const seen = new Set<string>()
  const result = await streamSitemapDossierUrls(xml, options, fetchImpl, (urls) => {
    for (const url of urls) seen.add(url)
  })
  return { urls: [...seen], ...result }
}

/* ------------------------------------------------------------------------------------------- */
/* Click depth (docs/specs/browse.md, R12)                                                       */
/* ------------------------------------------------------------------------------------------- */

export interface ClickDepthReport {
  /** Navigation pages fetched, and the ceiling that stopped the walk if it was reached. */
  pagesWalked: number
  budget: number
  budgetExhausted: boolean
  /** Indexed records found, by the number of clicks from the home page. */
  distribution: Record<string, number>
  /** Indexed records the walk never reached within four clicks. */
  unreachable: number
  /** Indexed records reached in more than three clicks, which the browse spec does not allow. */
  deeperThanThree: string[]
  deeperThanThreeTotal: number
  note: string
}

/** Same-origin hrefs in served HTML, absolute, without a fragment. */
export function pageLinks(html: string, pageUrl: string, origin: string): string[] {
  const found = new Set<string>()
  for (const tag of html.matchAll(/<a\b[^>]*>/gi)) {
    const href = attribute(tag[0], 'href')
    if (href === null || href.length === 0 || href.startsWith('#')) continue
    let url: URL
    try {
      url = new URL(href, pageUrl)
    } catch {
      continue
    }
    if (url.origin !== origin) continue
    url.hash = ''
    found.add(url.toString())
  }
  return [...found]
}

function isDossierUrl(url: string): boolean {
  try {
    return new URL(url).pathname.startsWith('/d/')
  } catch {
    return false
  }
}

/** Pages the walk will not expand: machine surfaces and anything that is not a page to click. */
function isWalkable(url: string): boolean {
  const path = new URL(url).pathname
  if (path.startsWith('/api/') || path.startsWith('/sitemaps/')) return false
  if (path === '/healthz' || path === '/sitemap.xml' || path === '/robots.txt') return false
  return !/\.(?:xml|json|txt|png|jpg|jpeg|svg|webp|ico|css|js)$/i.test(path)
}

/**
 * Walk the site from the home page and record how many clicks each dossier URL is away.
 *
 * This is the orphan half of the audit: the sitemap says which records are meant to be indexed,
 * and this walk says which of them a reader (or a crawler with no sitemap) can actually reach by
 * following links. A record the walk never reaches is reported as unreachable rather than as
 * "deep", because the two are different failures and the budget may explain the first.
 */
export async function measureClickDepth(
  indexedUrls: readonly string[],
  options: MonitorOptions,
  fetchImpl: FetchImplementation,
): Promise<ClickDepthReport> {
  const origin = options.origin.origin
  const home = `${origin}/`
  const depthByRecord = new Map<string, number>()
  const visited = new Set<string>([home])
  let frontier: string[] = [home]
  let pagesWalked = 0
  let budgetExhausted = false

  for (let depth = 0; depth < MAX_CLICK_DEPTH && frontier.length > 0; depth += 1) {
    const next = new Set<string>()
    for (const pageUrl of frontier) {
      if (pagesWalked >= options.clickDepthBudget) {
        budgetExhausted = true
        break
      }
      pagesWalked += 1
      let html: string
      try {
        const response = await fetchImpl(pageUrl, {
          redirect: 'follow',
          headers: { accept: 'text/html' },
        })
        if (!response.ok) continue
        html = (await response.text()).slice(0, MAX_BODY_CHARACTERS)
      } catch {
        continue
      } finally {
        await sleep(options.delayMs)
      }

      for (const link of pageLinks(html, pageUrl, origin)) {
        if (isDossierUrl(link)) {
          if (!depthByRecord.has(link)) depthByRecord.set(link, depth + 1)
          continue
        }
        if (visited.has(link) || !isWalkable(link)) continue
        visited.add(link)
        if (depth + 1 < MAX_CLICK_DEPTH) next.add(link)
      }
    }
    if (budgetExhausted) break
    frontier = [...next]
  }

  const distribution: Record<string, number> = {}
  const deep: string[] = []
  let unreachable = 0
  for (const url of indexedUrls) {
    const depth = depthByRecord.get(url)
    if (depth === undefined) {
      unreachable += 1
      continue
    }
    const bucket = String(depth)
    distribution[bucket] = (distribution[bucket] ?? 0) + 1
    if (depth > 3) deep.push(url)
  }
  deep.sort()

  return {
    pagesWalked,
    budget: options.clickDepthBudget,
    budgetExhausted,
    distribution,
    unreachable,
    deeperThanThree: deep.slice(0, MAX_DEEP_RECORDS_LISTED),
    deeperThanThreeTotal: deep.length,
    note: budgetExhausted
      ? 'The walk stopped at its page budget, so an unreachable record here may simply not have been walked to. Re-run with a larger --click-depth-budget before treating one as an orphan.'
      : 'Click depth counts links followed from the home page. A record counted as unreachable was not linked from any page the walk reached within four clicks.',
  }
}

function checkpointPath(options: MonitorOptions): string {
  return resolve(options.outDir, `discovery-monitor-${options.origin.hostname}.ndjson`)
}

function summaryPath(options: MonitorOptions): string {
  return resolve(options.outDir, `discovery-monitor-${options.origin.hostname}-summary.json`)
}

/**
 * Fold an existing checkpoint line by line.
 *
 * A resumed run over the whole corpus reads a file with one JSON object per record. Parsing it
 * into an array was what exhausted the heap on the full index; the file is streamed instead and
 * only the URL set and the counters are kept.
 */
async function forEachCheckpointRecord(
  path: string,
  visit: (record: MonitorRecord) => void,
): Promise<void> {
  let stream: ReturnType<typeof createReadStream>
  try {
    stream = createReadStream(path, { encoding: 'utf8' })
  } catch {
    return
  }
  const lines = createInterface({ input: stream, crlfDelay: Infinity })
  try {
    for await (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      let record: MonitorRecord
      try {
        record = JSON.parse(trimmed) as MonitorRecord
      } catch {
        continue
      }
      if (typeof record?.url === 'string') visit(record)
    }
  } catch {
    // A checkpoint that cannot be read is a checkpoint with nothing recorded in it.
  } finally {
    lines.close()
    stream.destroy()
  }
}

export async function runMonitor(
  options: MonitorOptions,
  fetchImpl: FetchImplementation = fetch,
): Promise<MonitorSummary> {
  const startedAt = new Date().toISOString()
  const checkpoint = checkpointPath(options)
  await mkdir(dirname(checkpoint), { recursive: true })

  const totals = emptyMonitorTotals()
  const done = new Set<string>()
  let resumedFromCheckpoint = 0
  if (options.resume) {
    await forEachCheckpointRecord(checkpoint, (record) => {
      if (done.has(record.url)) return
      done.add(record.url)
      resumedFromCheckpoint += 1
      foldMonitorRecord(totals, record)
    })
  }

  const xml = await loadSitemapXml(options, fetchImpl)
  // The URL set is what the click-depth walk is scored against, so it is kept; the XML each child
  // arrived in is not.
  const sitemapUrls = new Set<string>()
  let remaining = options.limit > 0 ? options.limit : Number.POSITIVE_INFINITY

  const sitemap = await streamSitemapDossierUrls(xml, options, fetchImpl, async (urls) => {
    const pending: string[] = []
    for (const url of urls) {
      sitemapUrls.add(url)
      if (!done.has(url) && pending.length < remaining) pending.push(url)
    }
    remaining -= pending.length
    await runWithConcurrency(pending, options.concurrency, async (url) => {
      const record = await monitorOneUrl(url, options, fetchImpl)
      await appendFile(checkpoint, `${JSON.stringify(record)}\n`, 'utf8')
      done.add(url)
      foldMonitorRecord(totals, record)
    })
  })

  const clickDepth = options.clickDepth
    ? await measureClickDepth([...sitemapUrls], options, fetchImpl)
    : undefined

  const summary = summarizeMonitorTotals(options.origin.origin, totals, {
    startedAt,
    finishedAt: new Date().toISOString(),
    sitemapDossierUrls: sitemapUrls.size,
    resumedFromCheckpoint,
    sitemapDocumentsRead: sitemap.documentsRead,
    sitemapChildren: sitemap.children,
    unreadableSitemapChildren: sitemap.unreadableChildren,
    tier: options.tier,
    ...(clickDepth ? { clickDepth } : {}),
  })
  await writeFile(summaryPath(options), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  return summary
}

function usage(): string {
  return [
    'Usage: npx tsx scripts/discovery/monitor-discovery.ts [options]',
    '',
    'Options:',
    `  --origin <url>        Public origin to read (default: ${DEFAULT_ORIGIN})`,
    '  --input <path|url>    Sitemap XML file or URL (default: <origin>/sitemap.xml)',
    `  --concurrency <n>     Parallel requests, 1-${MAX_CONCURRENCY} (default: ${DEFAULT_CONCURRENCY})`,
    `  --delay-ms <ms>       Pause between the two requests for one record (default: ${DEFAULT_DELAY_MS})`,
    `  --timeout-ms <ms>     Per-request timeout (default: ${DEFAULT_TIMEOUT_MS})`,
    '  --limit <n>           Check at most n URLs this run (default: every URL)',
    '  --tier <1|2>          Read only that sitemap child instead of every child of the index',
    '  --resume              Skip URLs already present in the checkpoint file',
    `  --out-dir <path>      Where the checkpoint and summary are written (default: ${DEFAULT_OUT_DIR})`,
    '  --no-click-depth      Skip the home-to-record click-depth walk',
    `  --click-depth-budget <n>  Navigation pages the walk may fetch (default: ${DEFAULT_CLICK_DEPTH_BUDGET})`,
    '  --json                Print the summary as JSON',
    '  --help                Show this help',
    '',
    'The command records DISCOVERY_READY only. Crawling, indexing and citation need an external report.',
  ].join('\n')
}

async function runCli(): Promise<void> {
  try {
    const options = parseMonitorArguments(process.argv.slice(2))
    if (options.help) {
      console.log(usage())
      return
    }
    const summary = await runMonitor(options)
    if (options.json) {
      console.log(JSON.stringify(summary, null, 2))
      return
    }
    console.log(
      [
        `Discovery readiness: ${summary.origin}`,
        `Sitemap dossier URLs: ${summary.sitemapDossierUrls}${summary.tier === null ? '' : ` (tier ${summary.tier} only)`}`,
        `Checked this run and earlier: ${summary.checked} (resumed ${summary.resumedFromCheckpoint})`,
        `DISCOVERY_READY: ${summary.discoveryReady}; not ready: ${summary.notDiscoveryReady}`,
        `Machine record answered: ${summary.apiAvailable}`,
        `Sitemap documents read: ${summary.sitemapDocumentsRead}` +
          (summary.sitemapChildren.length > 0
            ? ` (index with ${summary.sitemapChildren.length} children)`
            : ''),
        ...(summary.unreadableSitemapChildren.length > 0
          ? [
              `Child sitemaps that did not answer: ${summary.unreadableSitemapChildren
                .map((child) => `${child.url} (${child.reason})`)
                .join(', ')}`,
            ]
          : []),
        ...(summary.clickDepth
          ? [
              `Click depth (walked ${summary.clickDepth.pagesWalked} pages): ` +
                Object.entries(summary.clickDepth.distribution)
                  .sort(([left], [right]) => Number(left) - Number(right))
                  .map(([depth, count]) => `${depth} click${depth === '1' ? '' : 's'}: ${count}`)
                  .join(', '),
              `Deeper than three clicks: ${summary.clickDepth.deeperThanThreeTotal}; not reached: ${summary.clickDepth.unreachable}`,
              ...summary.clickDepth.deeperThanThree.map((url) => `  too deep: ${url}`),
              summary.clickDepth.note,
            ]
          : []),
        summary.note,
      ].join('\n'),
    )
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error('')
    console.error(usage())
    process.exitCode = 2
  }
}

const mainPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (mainPath && fileURLToPath(import.meta.url) === mainPath) void runCli()

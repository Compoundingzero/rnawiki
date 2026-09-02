/**
 * Read every canonical dossier URL from a sitemap and record what the origin actually serves.
 *
 * The command performs read-only GET requests and writes two files under docs/audits/discovery:
 * a resumable NDJSON checkpoint with one line per medicine, and a summary JSON. It decides one
 * state, `DISCOVERY_READY`, from the response it received. It never records that a page was
 * crawled, indexed or cited: those need a report from outside this repository.
 *
 * Usage:
 *   npx tsx scripts/discovery/monitor-discovery.ts --origin https://rnawiki.com
 *   npx tsx scripts/discovery/monitor-discovery.ts --input ./sitemap.xml --limit 50
 */

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  apiUrlForDossierUrl,
  classifyDiscoveryObservation,
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

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? ''
    if (argument === '--json') json = true
    else if (argument === '--resume') resume = true
    else if (argument === '--help' || argument === '-h') help = true
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

  return { origin, input, concurrency, delayMs, timeoutMs, outDir, limit, resume, json, help }
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
  /** Named so nobody reads readiness as proof of indexing. */
  note: string
}

export function summarizeMonitorRecords(
  origin: string,
  records: readonly MonitorRecord[],
  context: {
    startedAt: string
    finishedAt: string
    sitemapDossierUrls: number
    resumedFromCheckpoint: number
  },
): MonitorSummary {
  const blockerCounts: Record<string, number> = {}
  for (const record of records) {
    for (const blocker of record.blockers) {
      blockerCounts[blocker] = (blockerCounts[blocker] ?? 0) + 1
    }
  }
  const discoveryReady = records.filter((record) => record.state === 'DISCOVERY_READY').length
  return {
    origin,
    startedAt: context.startedAt,
    finishedAt: context.finishedAt,
    sitemapDossierUrls: context.sitemapDossierUrls,
    checked: records.length,
    resumedFromCheckpoint: context.resumedFromCheckpoint,
    discoveryReady,
    notDiscoveryReady: records.length - discoveryReady,
    apiAvailable: records.filter((record) => record.api.status === 200).length,
    blockerCounts,
    note: 'DISCOVERY_READY describes what this origin served. It is not a record of crawling, indexing or citation.',
  }
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

function checkpointPath(options: MonitorOptions): string {
  return resolve(options.outDir, `discovery-monitor-${options.origin.hostname}.ndjson`)
}

function summaryPath(options: MonitorOptions): string {
  return resolve(options.outDir, `discovery-monitor-${options.origin.hostname}-summary.json`)
}

async function readCheckpoint(path: string): Promise<MonitorRecord[]> {
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch {
    return []
  }
  return raw
    .split('\n')
    .flatMap((line) => {
      const trimmed = line.trim()
      if (!trimmed) return []
      try {
        return [JSON.parse(trimmed) as MonitorRecord]
      } catch {
        return []
      }
    })
    .filter((record) => typeof record?.url === 'string')
}

export async function runMonitor(
  options: MonitorOptions,
  fetchImpl: FetchImplementation = fetch,
): Promise<MonitorSummary> {
  const startedAt = new Date().toISOString()
  const xml = await loadSitemapXml(options, fetchImpl)
  const allUrls = sitemapDossierUrls(xml, options.origin.origin)

  const checkpoint = checkpointPath(options)
  const previous = options.resume ? await readCheckpoint(checkpoint) : []
  const done = new Set(previous.map((record) => record.url))
  const pending = allUrls.filter((url) => !done.has(url))
  const selected = options.limit > 0 ? pending.slice(0, options.limit) : pending

  await mkdir(dirname(checkpoint), { recursive: true })
  const fresh = await runWithConcurrency(selected, options.concurrency, async (url) => {
    const record = await monitorOneUrl(url, options, fetchImpl)
    await appendFile(checkpoint, `${JSON.stringify(record)}\n`, 'utf8')
    return record
  })

  const summary = summarizeMonitorRecords(options.origin.origin, [...previous, ...fresh], {
    startedAt,
    finishedAt: new Date().toISOString(),
    sitemapDossierUrls: allUrls.length,
    resumedFromCheckpoint: previous.length,
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
    '  --resume              Skip URLs already present in the checkpoint file',
    `  --out-dir <path>      Where the checkpoint and summary are written (default: ${DEFAULT_OUT_DIR})`,
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
        `Sitemap dossier URLs: ${summary.sitemapDossierUrls}`,
        `Checked this run and earlier: ${summary.checked} (resumed ${summary.resumedFromCheckpoint})`,
        `DISCOVERY_READY: ${summary.discoveryReady}; not ready: ${summary.notDiscoveryReady}`,
        `Machine record answered: ${summary.apiAvailable}`,
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

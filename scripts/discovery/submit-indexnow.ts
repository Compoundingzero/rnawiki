/**
 * Submit indexable canonical dossier URLs to IndexNow.
 *
 * The command never builds its own idea of what is indexable: it reads the same set the XML
 * sitemap serves, so it can never announce a URL the sitemap withholds. Without `--tier` that is
 * the shared legacy publication projection; with `--tier n` it is the corpus tier — the served
 * `/sitemaps/tier-n.xml` document itself, or, with `--source db`, the same `indexable` rows that
 * child is built from. A corpus tier never consults the legacy projection, which would announce
 * URLs the tier child withholds and miss URLs it lists.
 *
 * It is a dry run unless `--submit` is passed, and even then it refuses unless the
 * canonical-production deployment guard in lib/seo/indexnow.ts passes and the requested origin is
 * the configured one. Every run appends one line to the submission ledger.
 *
 * Usage:
 *   npx tsx scripts/discovery/submit-indexnow.ts                    # dry run, prints counts
 *   npx tsx scripts/discovery/submit-indexnow.ts --tier 1 --submit --json
 */

import 'dotenv/config'
import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  buildIndexNowBatches,
  indexNowKeyFile,
  INDEXNOW_MAX_URLS_PER_BATCH,
} from '@/lib/seo/indexnow'
import { loadMedicineSitemapIndexabilityReports } from '@/lib/seo/publication-indexability'

import {
  indexableCanonicalUrls,
  indexNowLedgerEntry,
  parseSubmitIndexNowArguments,
  sitemapSubmissionUrls,
  tierSitemapUrl,
  type IndexNowBatchOutcome,
  type IndexNowLedgerEntry,
  type SubmitIndexNowOptions,
} from './indexnow-submission'

const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow'
const REQUEST_TIMEOUT_MS = 10_000

function configuredEndpoint(value: string | undefined): string {
  if (!value) return DEFAULT_ENDPOINT
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.search || url.hash) return DEFAULT_ENDPOINT
    return url.toString()
  } catch {
    return DEFAULT_ENDPOINT
  }
}

async function postBatch(
  batch: readonly string[],
  config: { endpoint: string; key: string; keyLocation: string; host: string },
): Promise<IndexNowBatchOutcome> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        host: config.host,
        key: config.key,
        keyLocation: config.keyLocation,
        urlList: [...batch],
      }),
      signal: controller.signal,
    })
    return { batchSize: batch.length, status: response.status }
  } catch (error) {
    return {
      batchSize: batch.length,
      status: 0,
      error: error instanceof Error ? error.name : 'UnknownError',
    }
  } finally {
    clearTimeout(timeout)
  }
}

export type FetchImplementation = (input: string | URL, init?: RequestInit) => Promise<Response>

/**
 * The URL set for this run, and the name the ledger records it under.
 *
 * Every branch returns a set some sitemap serves. The `db` branch calls `tierSitemapEntries`, the
 * very function `/sitemaps/tier-n.xml` is rendered from, rather than a second query that could
 * drift away from it.
 */
async function submissionUrls(
  options: SubmitIndexNowOptions,
  fetchImpl: FetchImplementation,
): Promise<{ urls: string[]; urlSet: string }> {
  const origin = options.origin.origin
  if (options.tier === null) {
    const reports = await loadMedicineSitemapIndexabilityReports()
    return { urls: indexableCanonicalUrls(reports, origin), urlSet: 'legacy-publication' }
  }

  if (options.source === 'db') {
    const { tierSitemapEntries } = await import('@/lib/corpus/sitemap')
    const entries = await tierSitemapEntries(options.tier)
    return {
      urls: [...new Set(entries.map((entry) => `${origin}${entry.path}`))].sort(),
      urlSet: `tier-${options.tier}-db`,
    }
  }

  const sitemapUrl = tierSitemapUrl(origin, options.tier)
  const response = await fetchImpl(sitemapUrl, { headers: { accept: 'application/xml' } })
  if (!response.ok) {
    throw new Error(`GET ${sitemapUrl} answered HTTP ${response.status}.`)
  }
  return {
    urls: sitemapSubmissionUrls(await response.text(), origin),
    urlSet: `tier-${options.tier}-sitemap`,
  }
}

export async function runSubmitIndexNow(
  options: SubmitIndexNowOptions,
  fetchImpl: FetchImplementation = fetch,
): Promise<IndexNowLedgerEntry> {
  const { urls, urlSet } = await submissionUrls(options, fetchImpl)
  const { batches, rejectedUrlCount } = buildIndexNowBatches(urls, options.origin.origin)

  const keyFile = options.dryRun ? null : indexNowKeyFile(process.env)
  let refusedReason: string | undefined
  if (!options.dryRun) {
    if (!keyFile) refusedReason = 'deployment_guard_or_key_not_configured'
    else if (new URL(keyFile.keyLocation).origin !== options.origin.origin) {
      refusedReason = 'origin_is_not_the_configured_site'
    }
  }

  const outcomes: IndexNowBatchOutcome[] = []
  if (!options.dryRun && keyFile && !refusedReason) {
    const keyLocation = new URL(keyFile.keyLocation)
    const config = {
      endpoint: configuredEndpoint(process.env.INDEXNOW_ENDPOINT),
      key: keyFile.key,
      keyLocation: keyFile.keyLocation,
      host: keyLocation.hostname,
    }
    for (const batch of batches) outcomes.push(await postBatch(batch, config))
  }

  const entry = indexNowLedgerEntry({
    submittedAt: new Date().toISOString(),
    mode: options.dryRun || refusedReason ? 'dry_run' : 'submitted',
    origin: options.origin.origin,
    urlSet,
    eligibleUrlCount: urls.length,
    batches,
    rejectedUrlCount,
    outcomes,
    ...(refusedReason === undefined ? {} : { refusedReason }),
  })

  const ledgerPath = resolve(options.outFile)
  await mkdir(dirname(ledgerPath), { recursive: true })
  await appendFile(ledgerPath, `${JSON.stringify(entry)}\n`, 'utf8')
  return entry
}

function usage(): string {
  return [
    'Usage: npx tsx scripts/discovery/submit-indexnow.ts [options]',
    '',
    'Options:',
    '  --origin <url>   HTTPS origin to submit (default: SITE_URL or https://rnawiki.com)',
    '  --tier <1|2>     Submit one corpus tier instead of the legacy publication projection',
    '  --source <s>     sitemap (default) reads the served child; db reads the rows it is built from',
    '  --dry-run        Build and count batches without submitting (default)',
    '  --submit         Submit, if the canonical-production guard and key are configured',
    '  --out <path>     Ledger file (default: docs/audits/discovery/indexnow-submissions.ndjson)',
    '  --json           Print the ledger entry as JSON',
    '  --help           Show this help',
    '',
    `IndexNow accepts at most ${INDEXNOW_MAX_URLS_PER_BATCH} URLs per request; batching is shared with lib/seo/indexnow.ts.`,
    'The ledger records counts and HTTP statuses. It never records the key.',
  ].join('\n')
}

async function runCli(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage())
    return
  }
  try {
    const options = parseSubmitIndexNowArguments(args, process.env)
    const entry = await runSubmitIndexNow(options)
    if (options.json) {
      console.log(JSON.stringify(entry, null, 2))
      return
    }
    console.log(
      [
        `IndexNow ${entry.mode === 'submitted' ? 'submission' : 'dry run'}: ${entry.origin}`,
        `URL set: ${entry.urlSet}`,
        `Indexable canonical URLs: ${entry.eligibleUrlCount}`,
        `Accepted after validation: ${entry.acceptedUrlCount} (rejected ${entry.rejectedUrlCount})`,
        `Batches: ${entry.batchCount} [${entry.batchSizes.join(', ')}]`,
        entry.refusedReason
          ? `Refused to submit: ${entry.refusedReason}`
          : `Failed batches: ${entry.failedBatchCount}`,
      ].join('\n'),
    )
    if (entry.failedBatchCount > 0) process.exitCode = 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    console.error('')
    console.error(usage())
    process.exitCode = 2
  }
}

const mainPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (mainPath && fileURLToPath(import.meta.url) === mainPath) void runCli()

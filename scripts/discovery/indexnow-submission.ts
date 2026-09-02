/**
 * Pure helpers for the IndexNow submission command: argument parsing, the URL projection, and the
 * ledger line. Nothing here opens a database, reads the environment or performs a request, so the
 * decisions the command makes can be tested without a deployment.
 *
 * The ledger records what was sent and what came back. It never records the key: an IndexNow key is
 * public by design, but a submission log is not the place to republish it.
 */

export interface SubmitIndexNowOptions {
  /** Absolute HTTPS origin whose canonical dossier URLs will be submitted. */
  origin: URL
  /** Default. A dry run builds and counts batches and performs no request. */
  dryRun: boolean
  outFile: string
  json: boolean
  help: boolean
}

export const DEFAULT_INDEXNOW_LEDGER = 'docs/audits/discovery/indexnow-submissions.ndjson'

function optionValue(args: string[], index: number, name: string): [string, number] {
  const current = args[index] ?? ''
  const inline = current.startsWith(`${name}=`) ? current.slice(name.length + 1) : null
  if (inline !== null) return [inline, index]
  const next = args[index + 1]
  if (!next || next.startsWith('--')) throw new Error(`${name} requires a value.`)
  return [next, index + 1]
}

/**
 * Parse the command line. Submission is opt-in: `--dry-run` is the default and `--submit` is the
 * only way to turn it off, so a mistyped flag can never cause a live submission.
 */
export function parseSubmitIndexNowArguments(
  args: string[],
  environment: { readonly [key: string]: string | undefined } = {},
): SubmitIndexNowOptions {
  // A non-HTTPS SITE_URL is a development value. IndexNow requires HTTPS, so fall back to the
  // canonical origin rather than failing a help request or a dry run on a local checkout.
  let originValue = environment.SITE_URL?.trim().startsWith('https://')
    ? environment.SITE_URL.trim()
    : 'https://rnawiki.com'
  let dryRun = true
  let outFile = DEFAULT_INDEXNOW_LEDGER
  let json = false
  let help = false

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? ''
    if (argument === '--dry-run') dryRun = true
    else if (argument === '--submit') dryRun = false
    else if (argument === '--json') json = true
    else if (argument === '--help' || argument === '-h') help = true
    else if (argument === '--origin' || argument.startsWith('--origin=')) {
      const [value, consumed] = optionValue(args, index, '--origin')
      originValue = value
      index = consumed
    } else if (argument === '--out' || argument.startsWith('--out=')) {
      const [value, consumed] = optionValue(args, index, '--out')
      outFile = value
      index = consumed
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
  }

  let origin: URL
  try {
    origin = new URL(originValue)
  } catch {
    throw new Error('--origin must be an absolute HTTPS URL.')
  }
  if (origin.protocol !== 'https:') throw new Error('--origin must be an absolute HTTPS URL.')
  if (origin.username || origin.password) throw new Error('--origin must not contain credentials.')
  if (origin.pathname !== '/' || origin.search || origin.hash) {
    throw new Error('--origin must contain only a scheme and host, without a path, query or hash.')
  }

  return { origin, dryRun, outFile, json, help }
}

/** The only shape of a report this command reads. */
export interface IndexableDecisionReport {
  decision: { index: boolean; canonicalSlug: string | null; lastPublicContentUpdate: Date | null }
}

/**
 * Project the shared eligibility reports into canonical URLs. A report without an index decision,
 * without a canonical slug or without a real public content date is dropped: the submission set is
 * exactly the sitemap set, never a broader list of rows that happen to exist.
 */
export function indexableCanonicalUrls(
  reports: readonly IndexableDecisionReport[],
  origin: string,
): string[] {
  const urls = new Set<string>()
  for (const { decision } of reports) {
    if (!decision.index || !decision.canonicalSlug || !decision.lastPublicContentUpdate) continue
    urls.add(`${origin}/d/${encodeURIComponent(decision.canonicalSlug)}`)
  }
  return [...urls].sort()
}

export interface IndexNowBatchOutcome {
  batchSize: number
  /** HTTP status, or 0 when the request itself failed. */
  status: number
  error?: string
}

export interface IndexNowLedgerEntry {
  submittedAt: string
  mode: 'dry_run' | 'submitted'
  origin: string
  eligibleUrlCount: number
  acceptedUrlCount: number
  rejectedUrlCount: number
  batchCount: number
  batchSizes: number[]
  outcomes: IndexNowBatchOutcome[]
  failedBatchCount: number
  /** Present only when the command refused to submit, naming the guard that refused. */
  refusedReason?: string
}

/** Build the ledger line. The key and the key location are deliberately not parameters. */
export function indexNowLedgerEntry(input: {
  submittedAt: string
  mode: 'dry_run' | 'submitted'
  origin: string
  eligibleUrlCount: number
  batches: readonly (readonly string[])[]
  rejectedUrlCount: number
  outcomes?: readonly IndexNowBatchOutcome[]
  refusedReason?: string
}): IndexNowLedgerEntry {
  const outcomes = [...(input.outcomes ?? [])]
  return {
    submittedAt: input.submittedAt,
    mode: input.mode,
    origin: input.origin,
    eligibleUrlCount: input.eligibleUrlCount,
    acceptedUrlCount: input.batches.reduce((total, batch) => total + batch.length, 0),
    rejectedUrlCount: input.rejectedUrlCount,
    batchCount: input.batches.length,
    batchSizes: input.batches.map((batch) => batch.length),
    outcomes,
    failedBatchCount: outcomes.filter((outcome) => outcome.status < 200 || outcome.status >= 300)
      .length,
    ...(input.refusedReason === undefined ? {} : { refusedReason: input.refusedReason }),
  }
}

import {
  isCanonicalProductionDeployment,
  type SeoDeploymentEnvironment,
} from '@/lib/seo/deployment'
import {
  loadMedicinePublicationIndexabilityReports,
  type MedicinePublicationIndexabilityReport,
} from '@/lib/seo/publication-indexability'

export const INDEXNOW_MAX_URLS_PER_BATCH = 10_000
const DEFAULT_INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const DEFAULT_TIMEOUT_MS = 5_000
const MIN_TIMEOUT_MS = 100
const MAX_TIMEOUT_MS = 30_000

export interface IndexNowEnvironment extends SeoDeploymentEnvironment {
  INDEXNOW_ENABLED?: string
  INDEXNOW_KEY?: string
  INDEXNOW_KEY_LOCATION?: string
  INDEXNOW_ENDPOINT?: string
  INDEXNOW_TIMEOUT_MS?: string
}

interface IndexNowLogger {
  info(message: string, detail?: string): void
  warn(message: string, detail?: string): void
}

export interface IndexNowRuntime {
  environment?: IndexNowEnvironment
  fetchImpl?: typeof fetch
  logger?: IndexNowLogger
  loadEligibility?: (evaluatedAt?: Date) => Promise<MedicinePublicationIndexabilityReport[]>
}

export type IndexNowSkipReason =
  | 'disabled'
  | 'missing_key'
  | 'invalid_configuration'
  | 'no_valid_urls'
  | 'publication_not_indexable'

export interface IndexNowNotificationResult {
  outcome: 'skipped' | 'submitted' | 'partial_failure' | 'failed'
  reason?: IndexNowSkipReason | 'eligibility_requery_failed'
  acceptedUrlCount: number
  rejectedUrlCount: number
  batchCount: number
  failedBatchCount: number
}

interface IndexNowConfig {
  endpoint: string
  key: string
  keyLocation: string
  origin: string
  host: string
  timeoutMs: number
}

type ResolvedConfig =
  { enabled: true; config: IndexNowConfig } | { enabled: false; reason: IndexNowSkipReason }

function skipped(reason: IndexNowSkipReason, rejectedUrlCount = 0): IndexNowNotificationResult {
  return {
    outcome: 'skipped',
    reason,
    acceptedUrlCount: 0,
    rejectedUrlCount,
    batchCount: 0,
    failedBatchCount: 0,
  }
}

function configuredTimeout(value: string | undefined): number {
  if (!value) return DEFAULT_TIMEOUT_MS
  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return DEFAULT_TIMEOUT_MS
  const parsed = Number.parseInt(normalized, 10)
  if (!Number.isSafeInteger(parsed)) return DEFAULT_TIMEOUT_MS
  return Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, parsed))
}

function safeHttpsUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return url
  } catch {
    return null
  }
}

function resolveConfig(environment: IndexNowEnvironment): ResolvedConfig {
  if (environment.INDEXNOW_ENABLED?.trim().toLowerCase() !== 'true') {
    return { enabled: false, reason: 'disabled' }
  }

  const key = environment.INDEXNOW_KEY?.trim() ?? ''
  if (!key) return { enabled: false, reason: 'missing_key' }
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    return { enabled: false, reason: 'invalid_configuration' }
  }
  if (!isCanonicalProductionDeployment(environment)) {
    return { enabled: false, reason: 'invalid_configuration' }
  }

  const site = safeHttpsUrl(environment.SITE_URL ?? 'https://rnawiki.com')
  if (!site || site.pathname !== '/' || site.search || site.hash) {
    return { enabled: false, reason: 'invalid_configuration' }
  }
  const origin = site.origin

  const endpoint = safeHttpsUrl(environment.INDEXNOW_ENDPOINT ?? DEFAULT_INDEXNOW_ENDPOINT)
  if (!endpoint || endpoint.search || endpoint.hash) {
    return { enabled: false, reason: 'invalid_configuration' }
  }

  const keyLocation = safeHttpsUrl(
    environment.INDEXNOW_KEY_LOCATION ?? `${origin}/indexnow-key.txt`,
  )
  if (
    !keyLocation ||
    keyLocation.origin !== origin ||
    keyLocation.search ||
    keyLocation.hash ||
    !keyLocation.pathname.endsWith('.txt')
  ) {
    return { enabled: false, reason: 'invalid_configuration' }
  }

  return {
    enabled: true,
    config: {
      endpoint: endpoint.toString(),
      key,
      keyLocation: keyLocation.toString(),
      origin,
      host: site.hostname,
      timeoutMs: configuredTimeout(environment.INDEXNOW_TIMEOUT_MS),
    },
  }
}

/** Public ownership-key material for the stable runtime key-file route. IndexNow keys are public. */
export function indexNowKeyFile(
  environment: IndexNowEnvironment = process.env,
): { key: string; keyLocation: string } | null {
  const resolved = resolveConfig(environment)
  if (!resolved.enabled) return null
  return { key: resolved.config.key, keyLocation: resolved.config.keyLocation }
}

/** Return one normalized URL only when it is a canonical same-origin HTTPS URL. */
export function canonicalIndexNowUrl(value: string, expectedOrigin: string): string | null {
  const origin = safeHttpsUrl(expectedOrigin)
  const candidate = safeHttpsUrl(value)
  if (
    !origin ||
    origin.origin !== expectedOrigin ||
    !candidate ||
    candidate.origin !== origin.origin ||
    candidate.search ||
    candidate.hash
  ) {
    return null
  }
  return candidate.toString()
}

/** Validate, deduplicate and split URL notifications without ever exceeding IndexNow's limit. */
export function buildIndexNowBatches(
  values: readonly string[],
  expectedOrigin: string,
): { batches: string[][]; rejectedUrlCount: number } {
  const accepted = new Set<string>()
  let rejectedUrlCount = 0
  for (const value of values) {
    const canonical = canonicalIndexNowUrl(value, expectedOrigin)
    if (!canonical) {
      rejectedUrlCount += 1
      continue
    }
    accepted.add(canonical)
  }

  const urls = [...accepted]
  const batches: string[][] = []
  for (let offset = 0; offset < urls.length; offset += INDEXNOW_MAX_URLS_PER_BATCH) {
    batches.push(urls.slice(offset, offset + INDEXNOW_MAX_URLS_PER_BATCH))
  }
  return { batches, rejectedUrlCount }
}

function errorName(error: unknown): string {
  return error instanceof Error ? error.name : 'UnknownError'
}

async function postBatch(
  batch: readonly string[],
  config: IndexNowConfig,
  fetchImpl: typeof fetch,
): Promise<{ ok: true } | { ok: false; status?: number; error?: string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs)
  try {
    const response = await fetchImpl(config.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        host: config.host,
        key: config.key,
        keyLocation: config.keyLocation,
        urlList: batch,
      }),
      signal: controller.signal,
    })
    return response.ok ? { ok: true } : { ok: false, status: response.status }
  } catch (error) {
    return { ok: false, error: errorName(error) }
  } finally {
    clearTimeout(timeout)
  }
}

async function submitWithConfig(
  values: readonly string[],
  config: IndexNowConfig,
  runtime: IndexNowRuntime,
  event: string,
): Promise<IndexNowNotificationResult> {
  const logger = runtime.logger ?? console
  const { batches, rejectedUrlCount } = buildIndexNowBatches(values, config.origin)
  if (batches.length === 0) return skipped('no_valid_urls', rejectedUrlCount)

  let failedBatchCount = 0
  for (const batch of batches) {
    const result = await postBatch(batch, config, runtime.fetchImpl ?? fetch)
    if (!result.ok) {
      failedBatchCount += 1
      logger.warn(
        '[seo.indexnow_failed]',
        JSON.stringify({
          event,
          batchSize: batch.length,
          ...(result.status === undefined ? {} : { status: result.status }),
          ...(result.error === undefined ? {} : { error: result.error }),
        }),
      )
    }
  }

  const acceptedUrlCount = batches.reduce((total, batch) => total + batch.length, 0)
  if (failedBatchCount === 0) {
    logger.info(
      '[seo.indexnow_submitted]',
      JSON.stringify({ event, acceptedUrlCount, batchCount: batches.length, rejectedUrlCount }),
    )
  }
  return {
    outcome:
      failedBatchCount === 0
        ? 'submitted'
        : failedBatchCount === batches.length
          ? 'failed'
          : 'partial_failure',
    acceptedUrlCount,
    rejectedUrlCount,
    batchCount: batches.length,
    failedBatchCount,
  }
}

/** Generic explicit notifier for a future verified redirect/removal/deletion workflow. */
export async function notifyExplicitIndexNowChange(
  input: {
    change: 'redirect' | 'removal' | 'deletion'
    urls: readonly string[]
  },
  runtime: IndexNowRuntime = {},
): Promise<IndexNowNotificationResult> {
  const resolved = resolveConfig(runtime.environment ?? process.env)
  if (!resolved.enabled) return skipped(resolved.reason)
  return submitWithConfig(input.urls, resolved.config, runtime, input.change)
}

/**
 * Re-read the complete shared policy after publication has committed, then notify only when this
 * programme is the indexable default for its medicine's canonical base dossier.
 */
export async function notifyEligibleProgrammePublication(
  programmeId: string,
  runtime: IndexNowRuntime = {},
): Promise<IndexNowNotificationResult> {
  const resolved = resolveConfig(runtime.environment ?? process.env)
  if (!resolved.enabled) return skipped(resolved.reason)

  const logger = runtime.logger ?? console
  let reports: MedicinePublicationIndexabilityReport[]
  try {
    reports = await (runtime.loadEligibility ?? loadMedicinePublicationIndexabilityReports)()
  } catch (error) {
    logger.warn(
      '[seo.indexnow_eligibility_failed]',
      JSON.stringify({
        event: 'publication',
        programmeId,
        error: errorName(error),
      }),
    )
    return {
      outcome: 'failed',
      reason: 'eligibility_requery_failed',
      acceptedUrlCount: 0,
      rejectedUrlCount: 0,
      batchCount: 0,
      failedBatchCount: 0,
    }
  }

  const report = reports.find((candidate) => candidate.selectedProgrammeId === programmeId)
  const decision = report?.decision
  if (!decision?.index || !decision.canonicalSlug || !decision.lastPublicContentUpdate) {
    return skipped('publication_not_indexable')
  }

  const url = `${resolved.config.origin}/d/${encodeURIComponent(decision.canonicalSlug)}`
  return submitWithConfig([url], resolved.config, runtime, 'publication')
}

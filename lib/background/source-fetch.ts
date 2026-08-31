import { createHash } from 'node:crypto'

import type { BackgroundSourceKind } from '@/lib/background/types'
import type { EvidenceSourceType } from '@/lib/evidence/types'

import {
  canonicalBackgroundSourceIdentifier,
  canonicalBackgroundSourceKey,
  extractTextFromJsonStrings,
  type BackgroundSourceIdentity,
} from './source-assertions'

export const BACKGROUND_SOURCE_FETCHER_VERSION = 'background-fetch/1.0.0' as const

export type BackgroundSourceFetchStatus = 'SUCCEEDED' | 'UNREACHABLE' | 'UNSUPPORTED' | 'FAILED'

export interface BackgroundSourceFetchRequest {
  sourceIdentity: BackgroundSourceIdentity
  sourceKey: string
}

interface BackgroundSourceFetchBase {
  sourceKey: string
  canonicalLocator: string
  fetchedAt: Date
  durationMs: number
  fetcherVersion: typeof BACKGROUND_SOURCE_FETCHER_VERSION
}

export interface SuccessfulBackgroundSourceFetch extends BackgroundSourceFetchBase {
  status: 'SUCCEEDED'
  /** Exact response bytes represented as UTF-8 text; retained only for this in-process check. */
  rawText: string
  /** Decoded source prose used by the assertion evaluator. */
  comparisonText: string
  contentHash: string
  mediaType: string | null
}

export interface UnsuccessfulBackgroundSourceFetch extends BackgroundSourceFetchBase {
  status: Exclude<BackgroundSourceFetchStatus, 'SUCCEEDED'>
  errorCode: string
  /** Sanitized operational detail. Never contains response bodies or configured credentials. */
  errorMessage: string
}

export type BackgroundSourceFetchOutcome =
  SuccessfulBackgroundSourceFetch | UnsuccessfulBackgroundSourceFetch

export interface BackgroundFetchImplementation {
  (input: string | URL | Request, init?: RequestInit): Promise<Response>
}

const JSON_SOURCE_KINDS: ReadonlySet<BackgroundSourceKind> = new Set([
  'FDA_LABEL',
  'DAILYMED',
  'CLINICALTRIALS',
  'PUBCHEM',
])

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

/** Stable evidence-source identity. The kind namespace prevents coarse-type identifier collisions. */
export function backgroundEvidenceSourceId(sourceKey: string): string {
  return sha256(['background-source/v1', sourceKey].join('\u001f'))
}

/** Stable immutable snapshot identity for one source and one exact fetched artifact. */
export function backgroundSourceSnapshotId(sourceId: string, contentHash: string): string {
  return sha256(['background-snapshot/v1', sourceId, contentHash].join('\u001f'))
}

/** Stable history-row identity for one scheduled attempt. */
export function backgroundSourceFetchAttemptId(input: {
  jobKey: string
  sourceKey: string
  attemptNumber: number
}): string {
  return sha256(
    [
      'background-fetch-attempt/v1',
      input.jobKey,
      input.sourceKey,
      String(input.attemptNumber),
    ].join('\u001f'),
  )
}

export function backgroundFreshnessJobKey(startedAt: Date, nonce: string): string {
  return sha256(['background-freshness-job/v1', startedAt.toISOString(), nonce].join('\u001f'))
}

/** Coarse classification only; source identity always remains the kind-namespaced source key. */
export function evidenceSourceTypeForBackgroundKind(
  kind: BackgroundSourceKind,
): EvidenceSourceType {
  switch (kind) {
    case 'CLINICALTRIALS':
      return 'CLINICAL_TRIAL_REGISTRY'
    case 'PUBMED':
    case 'PUBLISHED_ANALYSIS':
      return 'PEER_REVIEWED_PUBLICATION'
    case 'PUBCHEM':
    case 'RXNORM':
    case 'NCBI_TAXONOMY':
      return 'MOLECULAR_DATABASE'
    case 'FDA_LABEL':
    case 'DAILYMED':
    case 'EMA_SMPC':
    case 'NADAC':
    case 'NICE_BNF':
    case 'DSLD':
    case 'FDA_NDC':
    case 'FDA_DRUGSFDA':
    case 'FDA_UNII':
      return 'REGULATORY_RECORD'
  }
}

/** Machine-readable current artifact when one has a stable public endpoint. */
export function canonicalLocatorForBackgroundSource(
  identity: BackgroundSourceIdentity,
): string | null {
  const identifier = canonicalBackgroundSourceIdentifier(identity.kind, identity.identifier)
  const encoded = encodeURIComponent(identifier)
  switch (identity.kind) {
    case 'FDA_LABEL':
    case 'DAILYMED':
      return `https://api.fda.gov/drug/label.json?search=set_id:%22${encoded}%22&limit=1`
    case 'PUBMED':
      return `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${encoded}&rettype=abstract&retmode=text`
    case 'CLINICALTRIALS':
      return `https://clinicaltrials.gov/api/v2/studies/${encoded}`
    case 'PUBCHEM':
      return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${encoded}/property/MolecularFormula,MolecularWeight/JSON`
    default:
      return null
  }
}

function sanitizeFetchError(error: unknown): { errorCode: string; errorMessage: string } {
  if (error instanceof Error) {
    const name = error.name
      .toUpperCase()
      .replace(/[^A-Z0-9_]/gu, '_')
      .slice(0, 80)
    if (name.includes('TIMEOUT') || name === 'ABORTERROR') {
      return { errorCode: 'TIMEOUT', errorMessage: 'The source request exceeded its time limit.' }
    }
    return {
      errorCode: name || 'NETWORK_ERROR',
      errorMessage: 'The source request did not complete.',
    }
  }
  return { errorCode: 'NETWORK_ERROR', errorMessage: 'The source request did not complete.' }
}

/**
 * Fetch one current source artifact. HTTP, network and decoder failures stay operational states;
 * none of them is returned in the success shape consumed by the assertion evaluator.
 */
export async function fetchBackgroundSource(
  request: BackgroundSourceFetchRequest,
  options: {
    fetchImplementation?: BackgroundFetchImplementation
    timeoutMs?: number
    now?: () => Date
  } = {},
): Promise<BackgroundSourceFetchOutcome> {
  const expectedKey = canonicalBackgroundSourceKey(request.sourceIdentity)
  if (request.sourceKey !== expectedKey) {
    throw new TypeError('Background source key does not match its source identity.')
  }

  const now = options.now ?? (() => new Date())
  const startedAt = now()
  const locator = canonicalLocatorForBackgroundSource(request.sourceIdentity)
  const base = (canonicalLocator: string): BackgroundSourceFetchBase => ({
    sourceKey: request.sourceKey,
    canonicalLocator,
    fetchedAt: startedAt,
    durationMs: Math.max(0, now().getTime() - startedAt.getTime()),
    fetcherVersion: BACKGROUND_SOURCE_FETCHER_VERSION,
  })

  if (!locator) {
    return {
      ...base(`urn:rnawiki:background-source:${encodeURIComponent(request.sourceKey)}`),
      status: 'UNSUPPORTED',
      errorCode: 'UNSUPPORTED_SOURCE_KIND',
      errorMessage: `No stable machine-readable adapter exists for ${request.sourceIdentity.kind}.`,
    }
  }

  const fetchImplementation = options.fetchImplementation ?? fetch
  let response: Response
  try {
    response = await fetchImplementation(locator, {
      headers: { accept: 'application/json, text/plain;q=0.9, */*;q=0.1' },
      signal: AbortSignal.timeout(options.timeoutMs ?? 20_000),
    })
  } catch (error) {
    return { ...base(locator), status: 'UNREACHABLE', ...sanitizeFetchError(error) }
  }

  if (!response.ok) {
    return {
      ...base(locator),
      status: 'UNREACHABLE',
      errorCode: `HTTP_${response.status}`,
      errorMessage: `The source endpoint returned HTTP ${response.status}.`,
    }
  }

  let rawText: string
  try {
    rawText = await response.text()
  } catch (error) {
    return { ...base(locator), status: 'FAILED', ...sanitizeFetchError(error) }
  }
  if (!rawText.trim()) {
    return {
      ...base(locator),
      status: 'FAILED',
      errorCode: 'EMPTY_RESPONSE',
      errorMessage: 'The source endpoint returned an empty successful response.',
    }
  }

  let comparisonText = rawText
  if (JSON_SOURCE_KINDS.has(request.sourceIdentity.kind)) {
    try {
      comparisonText = extractTextFromJsonStrings(rawText)
    } catch {
      return {
        ...base(locator),
        status: 'FAILED',
        errorCode: 'INVALID_JSON',
        errorMessage: 'The source endpoint returned malformed JSON.',
      }
    }
  }
  if (!comparisonText.trim()) {
    return {
      ...base(locator),
      status: 'FAILED',
      errorCode: 'NO_COMPARABLE_TEXT',
      errorMessage: 'The source response contained no comparable text.',
    }
  }

  return {
    ...base(locator),
    status: 'SUCCEEDED',
    rawText,
    comparisonText,
    contentHash: sha256(rawText),
    mediaType: response.headers.get('content-type'),
  }
}

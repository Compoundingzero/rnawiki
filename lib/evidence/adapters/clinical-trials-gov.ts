import { createHash } from 'node:crypto'

import {
  diffNormalizedFacts,
  EvidenceSourceFetchError,
  type EvidenceSourceAdapter,
  type NormalizedFact,
  type SourceDiff,
  type SourceIdentifier,
  type SourceSnapshot,
} from '@/lib/evidence/source-adapter'
import { stableJsonStringify } from '@/lib/stable-json'

const API_ROOT = 'https://clinicaltrials.gov/api/v2/studies'
const NCT_PATTERN = /^NCT\d{8}$/i

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

interface ClinicalTrialsStudy {
  hasResults?: boolean
  protocolSection?: {
    identificationModule?: { nctId?: string }
    statusModule?: {
      overallStatus?: string
      startDateStruct?: { date?: string; type?: string }
      primaryCompletionDateStruct?: { date?: string; type?: string }
      completionDateStruct?: { date?: string; type?: string }
    }
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string; class?: string } }
    designModule?: {
      phases?: string[]
      enrollmentInfo?: { count?: number; type?: string }
    }
  }
}

function contentForHash(value: unknown): unknown {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return value
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([key]) => key !== 'derivedSection'),
  )
}

function hashPayload(value: unknown): string {
  // ClinicalTrials.gov's derivedSection contains service-generated browse data and a daily
  // version-holder date. It is useful to retain in the immutable snapshot, but it is not a change
  // to the submitted study record. Hash every other top-level section so protocol, results,
  // annotations and documents remain covered without creating a false review task each day.
  return createHash('sha256')
    .update(stableJsonStringify(contentForHash(value)))
    .digest('hex')
}

function valueFact(
  identifier: SourceIdentifier,
  path: string,
  value: NormalizedFact['value'] | undefined,
): NormalizedFact[] {
  if (value === undefined || value === '') return []
  return [{ path, value, risk: 'LOW_RISK_EXACT', sourceIdentifier: identifier }]
}

export class ClinicalTrialsGovAdapter implements EvidenceSourceAdapter {
  readonly key = 'clinicaltrials.gov/v2'

  constructor(
    private readonly fetcher: FetchLike = fetch,
    private readonly now: () => Date = () => new Date(),
  ) {}

  supports(identifier: SourceIdentifier): boolean {
    return identifier.kind === 'NCT' && NCT_PATTERN.test(identifier.value.trim())
  }

  async fetch(identifier: SourceIdentifier): Promise<SourceSnapshot> {
    if (!this.supports(identifier)) {
      throw new TypeError(
        `ClinicalTrials.gov adapter cannot resolve ${identifier.kind}:${identifier.value}`,
      )
    }
    const nctId = identifier.value.trim().toUpperCase()
    const canonicalLocator = `https://clinicaltrials.gov/study/${nctId}`
    let response: Response
    try {
      response = await this.fetcher(`${API_ROOT}/${encodeURIComponent(nctId)}`, {
        headers: { accept: 'application/json' },
        signal: AbortSignal.timeout(30_000),
      })
    } catch (error) {
      throw new EvidenceSourceFetchError(`ClinicalTrials.gov could not be reached for ${nctId}`, {
        code: 'CLINICAL_TRIALS_FETCH_FAILED',
        retryable: true,
        sourceUnavailable: true,
        cause: error,
      })
    }
    if (!response.ok) {
      const unavailable = response.status === 404 || response.status === 410
      throw new EvidenceSourceFetchError(
        `ClinicalTrials.gov returned ${response.status} for ${nctId}`,
        {
          code: `CLINICAL_TRIALS_HTTP_${response.status}`,
          retryable: unavailable || response.status === 429 || response.status >= 500,
          sourceUnavailable: unavailable,
        },
      )
    }
    const payload = (await response.json()) as ClinicalTrialsStudy
    const returnedId = payload.protocolSection?.identificationModule?.nctId?.toUpperCase()
    if (returnedId && returnedId !== nctId) {
      throw new Error(`ClinicalTrials.gov returned ${returnedId} for requested ${nctId}`)
    }

    return {
      adapterKey: this.key,
      identifier: { kind: 'NCT', value: nctId },
      canonicalLocator,
      retrievedAt: this.now().toISOString(),
      contentHash: hashPayload(payload),
      payload,
    }
  }

  async normalize(snapshot: SourceSnapshot): Promise<NormalizedFact[]> {
    if (!this.supports(snapshot.identifier)) {
      throw new TypeError('Snapshot identifier is not a ClinicalTrials.gov NCT identifier')
    }
    const study = snapshot.payload as ClinicalTrialsStudy
    const protocol = study.protocolSection
    const status = protocol?.statusModule
    const design = protocol?.designModule
    const sponsor = protocol?.sponsorCollaboratorsModule?.leadSponsor
    const identifier = snapshot.identifier

    return [
      ...valueFact(identifier, 'trial.identifier', protocol?.identificationModule?.nctId),
      ...valueFact(identifier, 'trial.overallStatus', status?.overallStatus),
      ...valueFact(identifier, 'trial.hasResults', study.hasResults),
      ...valueFact(identifier, 'trial.enrollment.count', design?.enrollmentInfo?.count),
      ...valueFact(identifier, 'trial.enrollment.type', design?.enrollmentInfo?.type),
      ...valueFact(identifier, 'trial.phases', design?.phases?.join('|')),
      ...valueFact(identifier, 'trial.startDate', status?.startDateStruct?.date),
      ...valueFact(
        identifier,
        'trial.primaryCompletionDate',
        status?.primaryCompletionDateStruct?.date,
      ),
      ...valueFact(identifier, 'trial.completionDate', status?.completionDateStruct?.date),
      ...valueFact(identifier, 'trial.sponsor.name', sponsor?.name),
      ...valueFact(identifier, 'trial.sponsor.class', sponsor?.class),
    ].sort((a, b) => a.path.localeCompare(b.path))
  }

  async diff(previous: SourceSnapshot | null, current: SourceSnapshot): Promise<SourceDiff> {
    const before = previous ? await this.normalize(previous) : []
    const after = await this.normalize(current)
    const normalized = diffNormalizedFacts(
      before,
      after,
      previous?.contentHash,
      current.contentHash,
    )

    // The registry payload contains much more than the small set of fields we can safely copy as
    // exact facts (for example outcomes, interventions, eligibility and posted results). A changed
    // content hash with no normalized-field difference must therefore never be treated as "no
    // change". Keep the exact hashes as the before/after values and route the unclassified record
    // change to a person. This deliberately favours a visible review task over silently missing a
    // medically meaningful update.
    if (
      previous !== null &&
      previous.contentHash !== current.contentHash &&
      normalized.changes.length === 0
    ) {
      return {
        changed: true,
        previousHash: previous.contentHash,
        currentHash: current.contentHash,
        changes: [
          {
            path: 'trial.registryRecord',
            before: previous.contentHash,
            after: current.contentHash,
            risk: 'INTERPRETIVE_REVIEW_REQUIRED',
          },
        ],
      }
    }

    return normalized
  }
}

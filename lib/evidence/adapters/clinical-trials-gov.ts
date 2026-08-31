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

function objectRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function deleteNestedField(value: Record<string, unknown>, path: readonly string[]): void {
  let cursor: Record<string, unknown> | null = value
  const parents: Array<{ parent: Record<string, unknown>; key: string }> = []
  for (const part of path.slice(0, -1)) {
    if (!cursor) return
    parents.push({ parent: cursor, key: part })
    cursor = objectRecord(cursor[part])
  }
  if (!cursor) return
  delete cursor[path.at(-1)!]
  for (const { parent, key } of parents.reverse()) {
    const nested = objectRecord(parent[key])
    if (nested && Object.keys(nested).length === 0) delete parent[key]
    else break
  }
}

/** Everything in the submitted registry record that is not one of the normalized exact fields. */
function unclassifiedContent(value: unknown): unknown {
  const projected = structuredClone(contentForHash(value))
  const record = objectRecord(projected)
  if (!record) return projected
  const exactPaths = [
    ['hasResults'],
    ['protocolSection', 'identificationModule', 'nctId'],
    ['protocolSection', 'statusModule', 'overallStatus'],
    ['protocolSection', 'statusModule', 'startDateStruct', 'date'],
    ['protocolSection', 'statusModule', 'primaryCompletionDateStruct', 'date'],
    ['protocolSection', 'statusModule', 'completionDateStruct', 'date'],
    ['protocolSection', 'sponsorCollaboratorsModule', 'leadSponsor', 'name'],
    ['protocolSection', 'sponsorCollaboratorsModule', 'leadSponsor', 'class'],
    ['protocolSection', 'designModule', 'phases'],
    ['protocolSection', 'designModule', 'enrollmentInfo', 'count'],
    ['protocolSection', 'designModule', 'enrollmentInfo', 'type'],
  ] as const
  for (const path of exactPaths) deleteNestedField(record, path)
  return record
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

    // The registry payload contains much more than the exact fields above (for example outcomes,
    // interventions, eligibility and posted results). Compare that remainder independently so an
    // exact status change cannot hide a simultaneous unclassified medical change.
    if (
      previous !== null &&
      stableJsonStringify(unclassifiedContent(previous.payload)) !==
        stableJsonStringify(unclassifiedContent(current.payload))
    ) {
      return {
        changed: true,
        previousHash: previous.contentHash,
        currentHash: current.contentHash,
        changes: [
          ...normalized.changes,
          {
            path: 'trial.registryRecord',
            before: previous.contentHash,
            after: current.contentHash,
            risk: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
          },
        ].sort((left, right) => left.path.localeCompare(right.path)),
      }
    }

    return normalized
  }
}

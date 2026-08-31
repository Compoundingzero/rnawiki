import {
  BACKGROUND_SOURCE_KINDS,
  type BackgroundSource,
  type MedicineRecordedBackground,
} from '@/lib/background/types'
import {
  REVIEW_CANDIDATE_EVIDENCE_SCHEMA,
  type ReviewCandidateEvidence,
  type ReviewEvidenceSource,
} from './types'

const SOURCE_KINDS = new Set<string>(BACKGROUND_SOURCE_KINDS)

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

function isBackgroundSource(value: unknown): value is BackgroundSource {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.kind === 'string' &&
    SOURCE_KINDS.has(candidate.kind) &&
    typeof candidate.identifier === 'string' &&
    candidate.identifier.length > 0 &&
    typeof candidate.label === 'string' &&
    candidate.label.length > 0 &&
    typeof candidate.retrievedAt === 'string' &&
    candidate.retrievedAt.length > 0
  )
}

export function reviewEvidenceSource(source: BackgroundSource): ReviewEvidenceSource {
  return {
    sourceKey: `${source.kind}:${source.identifier}`,
    kind: source.kind,
    identifier: source.identifier,
    label: source.label,
    ...(source.locator ? { locator: source.locator } : {}),
    ...(source.version ? { version: source.version } : {}),
    ...(source.effectiveDate ? { effectiveDate: source.effectiveDate } : {}),
    retrievedAt: source.retrievedAt,
    ...(source.excerpt ? { excerpt: source.excerpt } : {}),
  }
}

/** Collect every source object in an envelope without assuming which modules happen to exist. */
export function recordedBackgroundSources(
  background: MedicineRecordedBackground,
): ReviewEvidenceSource[] {
  const found: ReviewEvidenceSource[] = []

  function visit(value: unknown): void {
    if (isBackgroundSource(value)) {
      found.push(reviewEvidenceSource(value))
      return
    }
    if (Array.isArray(value)) {
      for (const child of value) visit(child)
      return
    }
    if (value && typeof value === 'object') {
      for (const child of Object.values(value as Record<string, unknown>)) visit(child)
    }
  }

  visit(background)
  const bySnapshot = new Map<string, ReviewEvidenceSource>()
  for (const source of found) {
    const key = JSON.stringify(source)
    if (!bySnapshot.has(key)) bySnapshot.set(key, source)
  }
  return [...bySnapshot.values()].sort(
    (left, right) =>
      compareText(left.sourceKey, right.sourceKey) ||
      compareText(left.retrievedAt, right.retrievedAt) ||
      compareText(left.excerpt ?? '', right.excerpt ?? ''),
  )
}

export function reviewEvidence(
  observation: Record<string, unknown>,
  sourceReadings: readonly ReviewEvidenceSource[],
  identityObservation: Record<string, unknown>,
): ReviewCandidateEvidence {
  return {
    schema: REVIEW_CANDIDATE_EVIDENCE_SCHEMA,
    observation,
    identityObservation,
    sourceReadings: [...sourceReadings],
  }
}

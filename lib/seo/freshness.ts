import type { SourceFreshnessStatus } from '@/lib/evidence/types'

/** The four reader-facing states already used by the canonical dossier. */
export type PublicContentFreshness = 'current' | 'stale' | 'review_required' | 'unknown'

export interface ProgrammeSourceFreshnessInput {
  freshnessStatus: SourceFreshnessStatus
  nextCheckDueAt: Date | string | null
}

function dueAtMillis(value: Date | string | null): number | null {
  if (value instanceof Date) {
    const millis = value.getTime()
    return Number.isFinite(millis) ? millis : null
  }
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const millis = Date.parse(value)
  return Number.isFinite(millis) ? millis : null
}

/**
 * Convert one stored monitoring row into the same reader state as the dossier.
 *
 * A stored CURRENT row becomes stale at its policy deadline. A missing deadline does not invent a
 * stale date; it preserves the stored CURRENT state. Invalid dates cannot occur in PostgreSQL's
 * timestamp column, but fail to a neutral mapping if this helper is used with external data.
 */
export function effectivePublicContentFreshness(
  state: ProgrammeSourceFreshnessInput,
  evaluatedAt: Date,
): PublicContentFreshness {
  const dueAt = dueAtMillis(state.nextCheckDueAt)
  if (state.freshnessStatus === 'CURRENT' && dueAt !== null && dueAt <= evaluatedAt.getTime()) {
    return 'stale'
  }
  if (state.freshnessStatus === 'NEW_EVIDENCE' || state.freshnessStatus === 'REVIEW_IN_PROGRESS') {
    return 'review_required'
  }
  if (
    state.freshnessStatus === 'DUE' ||
    state.freshnessStatus === 'STALE' ||
    state.freshnessStatus === 'SOURCE_UNAVAILABLE' ||
    state.freshnessStatus === 'CHECK_FAILED'
  ) {
    return 'stale'
  }
  if (state.freshnessStatus === 'CURRENT') return 'current'
  return 'unknown'
}

/**
 * Aggregate every monitored source attached to the selected programme.
 *
 * This deliberately mirrors the dossier precedence: pending review is most important, then stale;
 * only an all-CURRENT non-empty set is current. Zero rows are unknown and therefore fail closed in
 * the search-indexing policy.
 */
export function aggregatePublicContentFreshness(
  states: readonly ProgrammeSourceFreshnessInput[],
  evaluatedAt: Date,
): PublicContentFreshness {
  const mapped = states.map((state) => effectivePublicContentFreshness(state, evaluatedAt))
  if (mapped.includes('review_required')) return 'review_required'
  if (mapped.includes('stale')) return 'stale'
  if (mapped.length > 0 && mapped.every((state) => state === 'current')) return 'current'
  return 'unknown'
}

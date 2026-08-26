/**
 * Pure, conservative search-indexing policy for public medicine dossiers.
 *
 * A row existing in `drugs` is an identity record, not evidence that the page is ready to compete
 * in search. A dossier enters discovery surfaces only after its current programme publication has
 * passed the signed workflow and its monitored public evidence is still current, or through the
 * finite provenance-bound flagship compatibility path below.
 */

import type { PublicContentFreshness } from '@/lib/seo/freshness'
import type { LegacyTenSecondAnswerEvidenceBinding } from '@/lib/ten-second-answer-contract'

export const MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS = 2

export type MedicineIndexabilityReason =
  | 'indexable_reviewed_publication'
  | 'indexable_provenance_bound_legacy_flagship'
  | 'invalid_canonical_slug'
  | 'canonical_identity_redirected'
  | 'identity_discrepancy'
  | 'no_current_publication'
  | 'publication_not_published'
  | 'missing_publication_timestamp'
  | 'missing_review_timestamp'
  | 'missing_public_explanation'
  | 'missing_source_provenance'
  | 'insufficient_independent_review'
  | 'public_content_not_current'
  | 'legacy_record_not_active'
  | 'legacy_dossier_not_flagship'
  | 'missing_legacy_evidence_binding'
  | 'missing_legacy_public_explanation'
  | 'missing_legacy_public_content_date'

export interface CurrentProgrammePublicationIndexingInput {
  reviewStatus: string | null
  publishedAt: Date | null
  reviewedAt: Date | null
  publicLabel: string | null
  plainMechanism: string | null
  bestSupportedFinding: string | null
  mainLimitation: string | null
  sourceCount: number
  independentReviewCount: number
  /** Aggregate of every monitoring row for the selected public programme. */
  freshness: PublicContentFreshness
}

/**
 * Compatibility input for the finite, hand-curated legacy corpus. This is deliberately narrower
 * than `DrugDossier`: a legacy page may enter search only when the exact first-read answer remains
 * bound to the complete stored v2 evidence fingerprint.
 */
export interface ProvenanceBoundLegacyIndexingInput {
  /** The canonical route must actually render the legacy record, not an unpublished programme. */
  bindingState: 'legacy_record' | 'programme_unpublished'
  dossierDepth: 'stub' | 'curated' | 'flagship' | null
  authoredEvidenceBinding: LegacyTenSecondAnswerEvidenceBinding | null
  usedFor: string | null
  bestSupportedFinding: string | null
  mainLimitation: string | null
  /** Count of exact stored audit sources and identity/source-provenance labels. */
  sourceCount: number
  /** A public edit or recorded audit date, never a seed/import bookkeeping timestamp. */
  publicContentDate: Date | null
}

export interface MedicineIndexingInput {
  canonicalSlug: string | null
  /** True when this retained row's slug is an owner-curated old/merged URL identity. */
  isRedirectSource: boolean
  /** Reserved for an explicit identity dispute. Never derive this from DrugDossier.hasDiscrepancy. */
  hasIdentityDispute?: boolean
  publication: CurrentProgrammePublicationIndexingInput | null
  /** Used only when there is no current published programme on the canonical route. */
  legacy?: ProvenanceBoundLegacyIndexingInput | null
}

export interface MedicineIndexabilityDecision {
  index: boolean
  /** Keep excluded pages crawlable so links can still be discovered and `noindex` can be seen. */
  follow: true
  reason: MedicineIndexabilityReason
  canonicalSlug: string | null
  /** The real publication event, never a seed/ingest bookkeeping timestamp. */
  lastPublicContentUpdate: Date | null
}

export interface MedicineIndexabilityIssue {
  code: Exclude<
    MedicineIndexabilityReason,
    'indexable_reviewed_publication' | 'indexable_provenance_bound_legacy_flagship'
  >
  explanation: string
}

export interface MedicineIndexabilityReport {
  decision: MedicineIndexabilityDecision
  /** Every applicable failure, in the same deterministic order used by `decision.reason`. */
  issues: MedicineIndexabilityIssue[]
}

/** Count reviewer accounts without exposing those identifiers through a public read model. */
export function countDistinctIndependentReviewers(
  reviews: readonly { reviewerUserId: string; isIndependent: boolean }[],
): number {
  return new Set(
    reviews.filter((review) => review.isIndependent).map((review) => review.reviewerUserId),
  ).size
}

function validDate(value: Date | null): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

function substantive(value: string | null): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

const MONTHS = new Map(
  [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ].map((month, index) => [month, index] as const),
)

function strictPublicDate(value: Date | string | null | undefined): Date | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? new Date(value.getTime()) : null
  }
  const candidate = value?.trim()
  if (!candidate) return null

  const monthYear = /^([A-Za-z]+)\s+(\d{4})$/.exec(candidate)
  if (monthYear) {
    const month = MONTHS.get(monthYear[1]!.toLowerCase())
    const year = Number(monthYear[2])
    if (month === undefined || !Number.isSafeInteger(year) || year < 1000 || year > 9999) {
      return null
    }
    // The legacy corpus records audit dates to month precision. The first day is a deterministic
    // ISO representation of that stored month; it does not claim that review happened on that day.
    return new Date(Date.UTC(year, month, 1))
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/.exec(candidate)
  if (!isoDate) return null
  const year = Number(isoDate[1])
  const month = Number(isoDate[2])
  const day = Number(isoDate[3])
  const calendarDate = new Date(Date.UTC(year, month - 1, day))
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null
  }
  const parsed = new Date(candidate)
  if (!Number.isFinite(parsed.getTime())) return null
  return parsed
}

/** Resolve the latest real public-content date without falling back to `createdAt`/`updatedAt`. */
export function resolveLegacyPublicContentDate(
  lastEditedAt: Date | string | null | undefined,
  recentAuditDate: Date | string | null | undefined,
  evaluatedAt: Date = new Date(),
): Date | null {
  if (!Number.isFinite(evaluatedAt.getTime())) return null
  const latestPermitted = evaluatedAt.getTime() + 24 * 60 * 60 * 1000
  const dates = [strictPublicDate(lastEditedAt), strictPublicDate(recentAuditDate)].filter(
    (value): value is Date => value !== null && value.getTime() <= latestPermitted,
  )
  return dates.sort((left, right) => right.getTime() - left.getTime())[0] ?? null
}

function hasExactLegacyBinding(
  binding: LegacyTenSecondAnswerEvidenceBinding | null,
): binding is LegacyTenSecondAnswerEvidenceBinding {
  return Boolean(
    binding &&
    binding.kind === 'legacy_answer_and_evidence_fingerprint' &&
    binding.version === 'legacy-ten-second-answer/v2' &&
    /^sha256:[a-f0-9]{64}$/.test(binding.fingerprint),
  )
}

function excluded(
  reason: Exclude<
    MedicineIndexabilityReason,
    'indexable_reviewed_publication' | 'indexable_provenance_bound_legacy_flagship'
  >,
  canonicalSlug: string | null,
): MedicineIndexabilityDecision {
  return {
    index: false,
    follow: true,
    reason,
    canonicalSlug,
    lastPublicContentUpdate: null,
  }
}

const ISSUE_EXPLANATIONS: Record<MedicineIndexabilityIssue['code'], string> = {
  invalid_canonical_slug: 'The medicine does not have one normalized canonical public slug.',
  canonical_identity_redirected:
    'This retained medicine slug redirects to a different canonical identity.',
  identity_discrepancy: 'The medicine identity has an unresolved discrepancy.',
  no_current_publication: 'No authoritative current programme publication is attached.',
  publication_not_published: 'The selected programme revision is not in the PUBLISHED state.',
  missing_publication_timestamp: 'The publication event has no valid public timestamp.',
  missing_review_timestamp: 'The publication has no valid completed-review timestamp.',
  missing_public_explanation:
    'The reviewed public label, mechanism, finding, or limitation is missing.',
  missing_source_provenance:
    'The answer has no exact stored source or signed source-metadata snapshot.',
  insufficient_independent_review:
    'The publication has fewer than two distinct independent reviewer decisions.',
  public_content_not_current:
    'The selected programme source state is stale, awaiting review, or not yet assessed.',
  legacy_record_not_active:
    'The canonical route currently answers with a normalized programme rather than the legacy medicine record.',
  legacy_dossier_not_flagship:
    'The legacy medicine record is not part of the hand-curated flagship corpus.',
  missing_legacy_evidence_binding:
    'The visible legacy answer is not bound to an approved version 2 evidence fingerprint.',
  missing_legacy_public_explanation:
    'The provenance-bound legacy use, strongest finding, or main limitation is missing.',
  missing_legacy_public_content_date:
    'The legacy record has no valid public edit or recorded audit date.',
}

function issue(code: MedicineIndexabilityIssue['code']): MedicineIndexabilityIssue {
  return { code, explanation: ISSUE_EXPLANATIONS[code] }
}

/**
 * Produce the operational explanation used by editor tooling as well as the public decision.
 * Multiple incomplete fields remain visible instead of being hidden behind the first failing
 * check. The report never guesses at scientific quality or tells an editor what to write.
 */
export function explainMedicineIndexability(
  input: MedicineIndexingInput,
): MedicineIndexabilityReport {
  const canonicalSlug = input.canonicalSlug?.trim() || null
  const issues: MedicineIndexabilityIssue[] = []
  const addIssue = (code: MedicineIndexabilityIssue['code']) => issues.push(issue(code))

  if (!canonicalSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalSlug)) {
    addIssue('invalid_canonical_slug')
  }
  if (input.isRedirectSource) addIssue('canonical_identity_redirected')
  if (input.hasIdentityDispute) addIssue('identity_discrepancy')

  const publication = input.publication
  const legacy = input.legacy ?? null
  if (publication) {
    if (publication.reviewStatus !== 'PUBLISHED') addIssue('publication_not_published')
    if (!validDate(publication.publishedAt)) addIssue('missing_publication_timestamp')
    if (!validDate(publication.reviewedAt)) addIssue('missing_review_timestamp')
    if (
      !substantive(publication.publicLabel) ||
      !substantive(publication.plainMechanism) ||
      !substantive(publication.bestSupportedFinding) ||
      !substantive(publication.mainLimitation)
    ) {
      addIssue('missing_public_explanation')
    }
    if (!Number.isSafeInteger(publication.sourceCount) || publication.sourceCount < 1) {
      addIssue('missing_source_provenance')
    }
    if (
      !Number.isSafeInteger(publication.independentReviewCount) ||
      publication.independentReviewCount < MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS
    ) {
      addIssue('insufficient_independent_review')
    }
    if (publication.freshness !== 'current') addIssue('public_content_not_current')
  } else if (legacy) {
    if (legacy.bindingState !== 'legacy_record') addIssue('legacy_record_not_active')
    if (legacy.dossierDepth !== 'flagship') addIssue('legacy_dossier_not_flagship')
    if (!hasExactLegacyBinding(legacy.authoredEvidenceBinding)) {
      addIssue('missing_legacy_evidence_binding')
    }
    if (
      !substantive(legacy.usedFor) ||
      !substantive(legacy.bestSupportedFinding) ||
      !substantive(legacy.mainLimitation)
    ) {
      addIssue('missing_legacy_public_explanation')
    }
    if (!Number.isSafeInteger(legacy.sourceCount) || legacy.sourceCount < 1) {
      addIssue('missing_source_provenance')
    }
    if (!validDate(legacy.publicContentDate)) addIssue('missing_legacy_public_content_date')
  } else {
    addIssue('no_current_publication')
  }

  if (issues.length > 0) {
    return {
      decision: excluded(issues[0]!.code, canonicalSlug),
      issues,
    }
  }

  if (publication) {
    // The empty-issue branch proves the publication and date above. Keep the guard so the function
    // remains fail closed if checks are rearranged during a later policy change.
    if (!validDate(publication.publishedAt)) {
      const fallback = issue('missing_publication_timestamp')
      return { decision: excluded(fallback.code, canonicalSlug), issues: [fallback] }
    }

    return {
      decision: {
        index: true,
        follow: true,
        reason: 'indexable_reviewed_publication',
        canonicalSlug,
        lastPublicContentUpdate: publication.publishedAt,
      },
      issues: [],
    }
  }

  if (!legacy || !validDate(legacy.publicContentDate)) {
    const fallback = issue('missing_legacy_public_content_date')
    return { decision: excluded(fallback.code, canonicalSlug), issues: [fallback] }
  }

  return {
    decision: {
      index: true,
      follow: true,
      reason: 'indexable_provenance_bound_legacy_flagship',
      canonicalSlug,
      lastPublicContentUpdate: legacy.publicContentDate,
    },
    issues: [],
  }
}

/**
 * Decide whether one medicine answer may enter discovery surfaces.
 *
 * The database publication transaction is the primary trust boundary. These checks deliberately
 * repeat its public invariants so corrupt or partial rows fail closed. The legacy compatibility
 * path is separate and cannot weaken a current publication decision.
 */
export function decideMedicineIndexability(
  input: MedicineIndexingInput,
): MedicineIndexabilityDecision {
  return explainMedicineIndexability(input).decision
}

/**
 * Pure, conservative search-indexing policy for public medicine dossiers.
 *
 * A row existing in `drugs` is an identity record, not evidence that the page is ready to compete
 * in search. There are exactly three ways in, checked in this order:
 *
 * 1. the current programme publication passed the signed workflow and its monitored public
 *    evidence is still current;
 * 2. the finite provenance-bound flagship compatibility path below; or
 * 3. the canonical-record path: the row resolved to one canonical entity and a stored dossier
 *    completeness assessment gives every applicable section an explicit visible state.
 *
 * The third path indexes a record, not a conclusion. It says only that this URL is the one
 * canonical address for that identity and that its sections carry stated, dated states. A state
 * such as "searched; no qualifying record found" reports the sources read, never the medicine, so
 * the page carries no claim that a reader could mistake for a finding.
 */

import type { InventoryResolutionState } from '@/lib/inventory/types'
import { PUBLIC_PLACEHOLDER_MEDICINE_SLUGS } from '@/lib/public-data-integrity'
import type { PublicContentFreshness } from '@/lib/seo/freshness'
import type { LegacyTenSecondAnswerEvidenceBinding } from '@/lib/ten-second-answer-contract'

export const MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS = 2

export type MedicineIndexabilityReason =
  | 'indexable_reviewed_publication'
  | 'indexable_provenance_bound_legacy_flagship'
  | 'indexable_canonical_record'
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
  | 'identity_not_canonical'
  | 'placeholder_identity_slug'
  | 'no_completion_assessment'
  | 'missing_completion_content_date'

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

/**
 * Identity and completeness projection for the canonical-record path. Every field is a scalar
 * column: the policy never reads section prose, source excerpts or any other JSONB, so it cannot
 * be tempted into grading what a section says.
 */
export interface CanonicalRecordIndexingInput {
  resolutionStatus: InventoryResolutionState
  /** `null` means no completeness assessment is stored for this record yet. */
  assessmentStatus: 'COMPLETE' | 'INCOMPLETE' | null
  /** Moves only when the assessed inputs move, so it is a real public content date. */
  contentChangedAt: Date | null
  applicableSectionCount: number
  terminalSectionCount: number
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
  /**
   * Supplied when the caller has read the inventory resolution for this row. Absent means the
   * third path was not offered at all, which is different from offering it and failing it.
   */
  canonicalRecord?: CanonicalRecordIndexingInput | null
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

export type MedicineIndexabilityIssueCode = Exclude<
  MedicineIndexabilityReason,
  | 'indexable_reviewed_publication'
  | 'indexable_provenance_bound_legacy_flagship'
  | 'indexable_canonical_record'
>

export interface MedicineIndexabilityIssue {
  code: MedicineIndexabilityIssueCode
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
  reason: MedicineIndexabilityIssueCode,
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
  identity_not_canonical:
    'The inventory resolution for this row is not one canonical entity, so it has no canonical page of its own.',
  placeholder_identity_slug: 'The slug names a spreadsheet artifact rather than a medicine.',
  no_completion_assessment:
    'No dossier completeness assessment with at least one assessed section is stored for this record.',
  missing_completion_content_date:
    'The stored completeness assessment has no valid content-change date.',
}

function issue(code: MedicineIndexabilityIssueCode): MedicineIndexabilityIssue {
  return { code, explanation: ISSUE_EXPLANATIONS[code] }
}

const PLACEHOLDER_SLUGS: ReadonlySet<string> = new Set(PUBLIC_PLACEHOLDER_MEDICINE_SLUGS)

/**
 * Checks for the canonical-record path. Nothing here reads what a section says: the path asks
 * whether this row is one canonical identity and whether its sections have been given stated,
 * dated states at all.
 */
function canonicalRecordIssueCodes(
  record: CanonicalRecordIndexingInput,
  canonicalSlug: string | null,
): MedicineIndexabilityIssueCode[] {
  const codes: MedicineIndexabilityIssueCode[] = []
  if (record.resolutionStatus !== 'CANONICAL_ENTITY') codes.push('identity_not_canonical')
  if (canonicalSlug && PLACEHOLDER_SLUGS.has(canonicalSlug)) codes.push('placeholder_identity_slug')
  if (
    record.assessmentStatus === null ||
    !Number.isSafeInteger(record.applicableSectionCount) ||
    record.applicableSectionCount < 1 ||
    !Number.isSafeInteger(record.terminalSectionCount) ||
    record.terminalSectionCount < 0 ||
    record.terminalSectionCount > record.applicableSectionCount
  ) {
    codes.push('no_completion_assessment')
  }
  if (!validDate(record.contentChangedAt)) codes.push('missing_completion_content_date')
  return codes
}

/**
 * Produce the operational explanation used by editor tooling as well as the public decision.
 * Multiple incomplete fields remain visible instead of being hidden behind the first failing
 * check. The report never guesses at scientific quality or tells an editor what to write.
 *
 * A record that fails the reviewed-publication and legacy paths but satisfies the canonical-record
 * path is indexable, and its report carries no issues: the unmet publication checks are not
 * exclusions once another path has admitted the page. `decision.reason` names the path that let it
 * in, so an editor can still see that no reviewed conclusion stands behind the URL.
 */
export function explainMedicineIndexability(
  input: MedicineIndexingInput,
): MedicineIndexabilityReport {
  const canonicalSlug = input.canonicalSlug?.trim() || null
  const identityCodes: MedicineIndexabilityIssueCode[] = []
  const pathCodes: MedicineIndexabilityIssueCode[] = []

  if (!canonicalSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(canonicalSlug)) {
    identityCodes.push('invalid_canonical_slug')
  }
  if (input.isRedirectSource) identityCodes.push('canonical_identity_redirected')
  if (input.hasIdentityDispute) identityCodes.push('identity_discrepancy')

  const publication = input.publication
  const legacy = input.legacy ?? null
  const canonicalRecord = input.canonicalRecord ?? null
  if (publication) {
    if (publication.reviewStatus !== 'PUBLISHED') pathCodes.push('publication_not_published')
    if (!validDate(publication.publishedAt)) pathCodes.push('missing_publication_timestamp')
    if (!validDate(publication.reviewedAt)) pathCodes.push('missing_review_timestamp')
    if (
      !substantive(publication.publicLabel) ||
      !substantive(publication.plainMechanism) ||
      !substantive(publication.bestSupportedFinding) ||
      !substantive(publication.mainLimitation)
    ) {
      pathCodes.push('missing_public_explanation')
    }
    if (!Number.isSafeInteger(publication.sourceCount) || publication.sourceCount < 1) {
      pathCodes.push('missing_source_provenance')
    }
    if (
      !Number.isSafeInteger(publication.independentReviewCount) ||
      publication.independentReviewCount < MINIMUM_INDEPENDENT_PROGRAMME_REVIEWS
    ) {
      pathCodes.push('insufficient_independent_review')
    }
    if (publication.freshness !== 'current') pathCodes.push('public_content_not_current')
  } else if (legacy) {
    if (legacy.bindingState !== 'legacy_record') pathCodes.push('legacy_record_not_active')
    if (legacy.dossierDepth !== 'flagship') pathCodes.push('legacy_dossier_not_flagship')
    if (!hasExactLegacyBinding(legacy.authoredEvidenceBinding)) {
      pathCodes.push('missing_legacy_evidence_binding')
    }
    if (
      !substantive(legacy.usedFor) ||
      !substantive(legacy.bestSupportedFinding) ||
      !substantive(legacy.mainLimitation)
    ) {
      pathCodes.push('missing_legacy_public_explanation')
    }
    if (!Number.isSafeInteger(legacy.sourceCount) || legacy.sourceCount < 1) {
      pathCodes.push('missing_source_provenance')
    }
    if (!validDate(legacy.publicContentDate)) pathCodes.push('missing_legacy_public_content_date')
  } else {
    pathCodes.push('no_current_publication')
  }

  if (identityCodes.length === 0 && pathCodes.length === 0) {
    if (publication) {
      // The empty-issue branch proves the publication and date above. Keep the guard so the
      // function remains fail closed if checks are rearranged during a later policy change.
      if (validDate(publication.publishedAt)) {
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
      const fallback = issue('missing_publication_timestamp')
      return { decision: excluded(fallback.code, canonicalSlug), issues: [fallback] }
    }

    if (legacy && validDate(legacy.publicContentDate)) {
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
    const fallback = issue('missing_legacy_public_content_date')
    return { decision: excluded(fallback.code, canonicalSlug), issues: [fallback] }
  }

  const canonicalCodes = canonicalRecord
    ? canonicalRecordIssueCodes(canonicalRecord, canonicalSlug)
    : []
  if (
    canonicalRecord &&
    identityCodes.length === 0 &&
    canonicalCodes.length === 0 &&
    validDate(canonicalRecord.contentChangedAt)
  ) {
    return {
      decision: {
        index: true,
        follow: true,
        reason: 'indexable_canonical_record',
        canonicalSlug,
        lastPublicContentUpdate: canonicalRecord.contentChangedAt,
      },
      issues: [],
    }
  }

  const seen = new Set<MedicineIndexabilityIssueCode>()
  const issues = [...identityCodes, ...pathCodes, ...canonicalCodes].flatMap((code) => {
    if (seen.has(code)) return []
    seen.add(code)
    return [issue(code)]
  })
  return { decision: excluded(issues[0]!.code, canonicalSlug), issues }
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

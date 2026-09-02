/**
 * Who may work the completion-and-identity queue, and what a recorded decision is.
 *
 * Everything in this file is pure: role predicates, zod shapes and reader-facing labels. It reads
 * no database and writes nothing, so the rules can be tested without a server.
 *
 * A recorded decision is a note about review work and nothing else. It never edits a completion
 * assessment, never edits an inventory resolution, never edits a `drugs` row, never changes what a
 * public page shows, and never becomes medical content. The resolvers keep sole authorship of the
 * assessment; a person keeps sole authorship of any correction, and that correction travels the
 * ordinary contribution path. An `IDENTITY_DISPUTED` note reaches the owner-curated redirect ledger
 * only when a person carries it there.
 *
 * A decision is bound to the exact assessment it answered through `assessmentInputDigest`. When the
 * resolver re-runs and the digest moves, the old note stays readable but no longer describes the
 * current assessment, and a new decision has to be recorded against the new digest.
 */

import { z } from 'zod'

import { DOSSIER_SECTION_IDS, type DossierSectionId } from '@/lib/dossier-completion/types'
import { SECTION_LABELS } from '@/lib/dossier-completion/view'
import { canManageInternalReview, type InternalReviewActor } from '@/lib/internal-review-policy'
import { ENTITY_CLASSES, type EntityClass } from '@/lib/inventory/entity-class-types'
import {
  ATTRIBUTION_WARNING_CODES,
  INVENTORY_RESOLUTION_STATES,
  type AttributionWarningCode,
  type InventoryResolutionState,
} from '@/lib/inventory/types'

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export const COMPLETION_REVIEW_ROLE_EXPLANATION =
  'Only a steward or administrator may open the completion and identity queue or record a decision in it.'

/** Same boundary as the other private operational screens, including the indexing report. */
export function canViewCompletionReview(actor: InternalReviewActor): boolean {
  return canManageInternalReview(actor)
}

/** Recording a note carries no extra privilege: the person who may read the queue may answer it. */
export function canRecordCompletionReviewDecision(actor: InternalReviewActor): boolean {
  return canManageInternalReview(actor)
}

// ---------------------------------------------------------------------------
// The decision vocabulary
// ---------------------------------------------------------------------------

export const COMPLETION_REVIEW_DECISIONS = [
  'ACKNOWLEDGED',
  'SOURCE_READ_NO_CHANGE',
  'CORRECTION_PROPOSED',
  'IDENTITY_DISPUTED',
] as const
export type CompletionReviewDecision = (typeof COMPLETION_REVIEW_DECISIONS)[number]

export const COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH = 4000

export const COMPLETION_REVIEW_DECISION_LABELS: Record<CompletionReviewDecision, string> = {
  ACKNOWLEDGED: 'Seen, left as it stands',
  SOURCE_READ_NO_CHANGE: 'Read the source, nothing to change',
  CORRECTION_PROPOSED: 'Correction opened elsewhere',
  IDENTITY_DISPUTED: 'Identity resolution disputed',
}

/** What each note claims, said once, so two reviewers cannot read the same word differently. */
export const COMPLETION_REVIEW_DECISION_MEANINGS: Record<CompletionReviewDecision, string> = {
  ACKNOWLEDGED: 'A reviewer has read this section and is leaving the recorded state as it is.',
  SOURCE_READ_NO_CHANGE:
    'A reviewer opened the source named in the section basis and found nothing the record should say differently.',
  CORRECTION_PROPOSED:
    'A reviewer has opened a correction through the ordinary contribution path. This note records that a correction exists; it is not the correction.',
  IDENTITY_DISPUTED:
    'A reviewer disagrees with the recorded identity resolution. A person decides whether the owner-curated redirect ledger changes; this note changes nothing on its own.',
}

// ---------------------------------------------------------------------------
// Queue kinds
// ---------------------------------------------------------------------------

export const COMPLETION_REVIEW_QUEUE_KINDS = ['incomplete', 'human-read', 'identity'] as const
export type CompletionReviewQueueKind = (typeof COMPLETION_REVIEW_QUEUE_KINDS)[number]

export const COMPLETION_REVIEW_QUEUE_LABELS: Record<CompletionReviewQueueKind, string> = {
  incomplete: 'Records with an open section',
  'human-read': 'Records where reading a named source could add something',
  identity: 'Records with an identity warning',
}

export const COMPLETION_REVIEW_QUEUE_DESCRIPTIONS: Record<CompletionReviewQueueKind, string> = {
  incomplete:
    'At least one section that applies to this record has not reached an explicit state. Each open section is listed with what still has to happen.',
  'human-read':
    'Every applicable section has a state, and the resolver also recorded that a person reading the named source could add something it could not read.',
  identity:
    'The identity resolver recorded an attribution warning for this record. A warning is a reason to look, never merge evidence on its own.',
}

// ---------------------------------------------------------------------------
// Reader-facing labels for stored codes
// ---------------------------------------------------------------------------

export const ENTITY_CLASS_LABELS: Record<EntityClass, string> = {
  APPROVED_MEDICINE: 'Approved medicine',
  APPROVED_BIOLOGIC: 'Approved biologic medicine',
  INVESTIGATIONAL_MEDICINE: 'Investigational medicine',
  OFF_LABEL_OR_COMPOUNDED: 'Used outside an approved label, or compounded',
  WITHDRAWN_MEDICINE: 'Withdrawn medicine',
  CONTROLLED_NO_APPROVED_USE: 'Controlled substance with no approved medical use',
  COMBINATION_PRODUCT: 'Combination product',
  BOTANICAL_OR_ORGANISM_PREPARATION: 'Botanical or organism preparation',
  SUPPLEMENT_INGREDIENT: 'Supplement ingredient',
  MARKETED_PRODUCT_INGREDIENT: 'Ingredient of a marketed product',
  REGISTRY_ONLY_IDENTITY: 'Registry entry only',
  PLACEHOLDER: 'Placeholder record',
}

export const INVENTORY_RESOLUTION_LABELS: Record<InventoryResolutionState, string> = {
  CANONICAL_ENTITY: 'Its own record',
  ALIAS_OF_CANONICAL_ENTITY: 'Another spelling of one record',
  DUPLICATE_OF_CANONICAL_ENTITY: 'A second copy of one record',
  HISTORICAL_REDIRECT: 'An older address that now points elsewhere',
  INVALID_IDENTITY_GONE: 'Never a medicine identity',
  MANUAL_IDENTITY_REVIEW_REQUIRED: 'Waiting for a person to settle the identity',
}

export const ATTRIBUTION_WARNING_LABELS: Record<AttributionWarningCode, string> = {
  SHARED_REGISTRY_IDENTIFIER: 'Another record carries the same registry identifier',
  ALIAS_SHADOWED_BY_CANONICAL_SLUG: 'An alias here spells another record’s address',
  SALT_OR_HYDRATE_FORM_OF_ANOTHER_RECORD:
    'The recorded name is a salt or hydrate form of another recorded name',
  NO_RECORDED_BACKGROUND: 'No recorded background is stored for this record',
  NAME_ONLY_IDENTITY: 'Identity rests on the recorded name alone',
  DUPLICATE_HOLDS_UNMERGED_MODULES:
    'This second copy holds stored modules the first copy does not hold',
}

export function entityClassLabel(value: string | null | undefined): string {
  if (!value) return 'Not yet classified'
  return (ENTITY_CLASS_LABELS as Record<string, string>)[value] ?? 'Not yet classified'
}

export function inventoryResolutionLabel(value: string | null | undefined): string {
  if (!value) return 'Not yet resolved'
  return (INVENTORY_RESOLUTION_LABELS as Record<string, string>)[value] ?? 'Not yet resolved'
}

export function attributionWarningLabel(value: string): string {
  return (ATTRIBUTION_WARNING_LABELS as Record<string, string>)[value] ?? 'Recorded warning'
}

export function dossierSectionLabel(value: string): string {
  return (SECTION_LABELS as Record<string, string>)[value] ?? value
}

// ---------------------------------------------------------------------------
// Payload shapes
// ---------------------------------------------------------------------------

const digest = z
  .string()
  .regex(/^[0-9a-f]{64}$/u, 'An assessment digest is 64 hexadecimal characters.')

export const completionReviewDecisionSchema = z
  .object({
    drugId: z.string().trim().min(1).max(96),
    sectionId: z.enum(DOSSIER_SECTION_IDS),
    decision: z.enum(COMPLETION_REVIEW_DECISIONS),
    explanation: z
      .string()
      .trim()
      .min(1, 'Say what you checked and what you concluded.')
      .max(
        COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH,
        `Keep the explanation to ${COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH} characters or fewer.`,
      ),
    assessmentInputDigest: digest,
  })
  .strict()

export type CompletionReviewDecisionInput = z.infer<typeof completionReviewDecisionSchema>

export const COMPLETION_REVIEW_QUEUE_MAX_LIMIT = 100
export const COMPLETION_REVIEW_QUEUE_DEFAULT_LIMIT = 25
const MAX_OFFSET = 100_000

export const completionReviewQueueQuerySchema = z
  .object({
    kind: z.enum(COMPLETION_REVIEW_QUEUE_KINDS).default('incomplete'),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(COMPLETION_REVIEW_QUEUE_MAX_LIMIT)
      .default(COMPLETION_REVIEW_QUEUE_DEFAULT_LIMIT),
    offset: z.coerce.number().int().min(0).max(MAX_OFFSET).default(0),
  })
  .strict()

export type CompletionReviewQueueQuery = z.infer<typeof completionReviewQueueQuerySchema>

/**
 * A decision may only be recorded against the assessment digest the reviewer was shown. When the
 * resolver has re-run since the page was rendered, the answer belongs to an assessment that no
 * longer exists and is refused rather than reinterpreted.
 */
export function assessmentDigestIsCurrent(
  submittedDigest: string,
  storedDigest: string | null | undefined,
): boolean {
  if (!storedDigest) return false
  return submittedDigest === storedDigest
}

export const STALE_ASSESSMENT_MESSAGE =
  'This record was assessed again after the page was loaded. Reload the queue and read the current sections before deciding.'

export function isDossierSectionId(value: string): value is DossierSectionId {
  return (DOSSIER_SECTION_IDS as readonly string[]).includes(value)
}

export function isCompletionReviewDecision(value: string): value is CompletionReviewDecision {
  return (COMPLETION_REVIEW_DECISIONS as readonly string[]).includes(value)
}

export function isCompletionReviewQueueKind(value: string): value is CompletionReviewQueueKind {
  return (COMPLETION_REVIEW_QUEUE_KINDS as readonly string[]).includes(value)
}

/** Re-exported so a caller that only imports this policy still sees the closed code lists. */
export { ATTRIBUTION_WARNING_CODES, ENTITY_CLASSES, INVENTORY_RESOLUTION_STATES }

/**
 * Reads and writes for the private completion-and-identity review queue.
 *
 * Three questions are asked of stored rows only:
 *   1. Which records have a completion assessment that is still INCOMPLETE, and which sections?
 *   2. Which records carry a section the resolver marked as worth a person reading the source?
 *   3. Which records carry an attribution warning from the identity resolver?
 *
 * Nothing here authors content. `recordCompletionReviewDecision` inserts one append-only note; it
 * never updates `dossier_completion_assessments`, `inventory_resolutions` or `drugs`, and it never
 * changes what a public page shows. The database enforces the same rule from below: the
 * `dossier_completion_review_decisions_immutable` trigger raises on UPDATE and DELETE.
 *
 * This module is for the steward screen and its protected API. It may return the related slugs
 * stored inside an attribution warning, because a person checking a shared registry identifier has
 * to know which other record shares it. Those slugs must not be copied to a public surface, an
 * export or a dossier page; `lib/queries/dossier-completion.ts` is the public projection and it
 * deliberately reduces the same warnings to a single boolean.
 */

import { createHash } from 'node:crypto'

import { asc, count, desc, eq, inArray, sql, type SQL } from 'drizzle-orm'

import { db } from '@/db'
import {
  dossierCompletionAssessments,
  dossierCompletionReviewDecisions,
  drugs,
  inventoryResolutions,
  users,
} from '@/db/schema'
import {
  attributionWarningLabel,
  canRecordCompletionReviewDecision,
  COMPLETION_REVIEW_DECISION_LABELS,
  COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH,
  COMPLETION_REVIEW_QUEUE_DEFAULT_LIMIT,
  COMPLETION_REVIEW_QUEUE_MAX_LIMIT,
  dossierSectionLabel,
  entityClassLabel,
  inventoryResolutionLabel,
  isCompletionReviewDecision,
  isDossierSectionId,
  STALE_ASSESSMENT_MESSAGE,
  type CompletionReviewDecision,
  type CompletionReviewQueueKind,
} from '@/lib/completion-review-policy'
import { SECTION_STATE_LABELS } from '@/lib/dossier-completion/view'
import {
  isTerminalSectionState,
  type DossierCompletionStatus,
  type SectionAssessment,
  type SectionState,
} from '@/lib/dossier-completion/types'
import type { AttributionWarning } from '@/lib/inventory/types'

const MAX_DECISIONS_PER_RECORD = 20
const DIGEST_PATTERN = /^[0-9a-f]{64}$/u

export type CompletionReviewErrorCode =
  'not_authorized' | 'not_found' | 'stale_assessment' | 'invalid_decision' | 'section_not_assessed'

export class CompletionReviewError extends Error {
  constructor(
    readonly code: CompletionReviewErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'CompletionReviewError'
  }
}

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export interface CompletionReviewSectionView {
  id: string
  label: string
  state: SectionState
  stateLabel: string
  terminal: boolean
  basis: string
  blockedReason: string | null
  humanReadSuggested: boolean
}

export interface CompletionReviewWarningView {
  code: string
  label: string
  detail: string
  /** Private surface only. Never copy these into an export, a dossier page or a public dataset. */
  relatedSlugs: string[]
}

export interface CompletionReviewDecisionView {
  id: string
  drugId: string
  sectionId: string
  sectionLabel: string
  decision: CompletionReviewDecision
  decisionLabel: string
  explanation: string
  assessmentInputDigest: string
  /** False once the resolver has re-run: the note answered an assessment that no longer stands. */
  appliesToCurrentAssessment: boolean
  reviewerUserId: string
  reviewerHandle: string | null
  createdAt: string
}

export interface CompletionReviewQueueItem {
  drugId: string
  slug: string
  name: string
  entityClass: string | null
  entityClassLabel: string
  resolutionStatus: string | null
  resolutionStatusLabel: string
  canonicalSlug: string | null
  identityConfidence: string | null
  /** Null when no completion assessment is stored yet; no decision can be recorded until it is. */
  assessmentInputDigest: string | null
  assessmentStatus: DossierCompletionStatus | null
  applicableSectionCount: number
  terminalSectionCount: number
  /** Every section the assessment covers, in stored order, for the decision form. */
  sections: CompletionReviewSectionView[]
  openSections: CompletionReviewSectionView[]
  humanReadSections: CompletionReviewSectionView[]
  decidableSectionIds: string[]
  attributionWarnings: CompletionReviewWarningView[]
  recentDecisions: CompletionReviewDecisionView[]
}

export interface CompletionReviewQueueCounts {
  incomplete: number
  humanRead: number
  identity: number
}

export interface CompletionReviewQueuePage {
  kind: CompletionReviewQueueKind
  limit: number
  offset: number
  total: number
  counts: CompletionReviewQueueCounts
  items: CompletionReviewQueueItem[]
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

const INCOMPLETE_FILTER: SQL = eq(dossierCompletionAssessments.status, 'INCOMPLETE')
const HUMAN_READ_FILTER: SQL = sql`jsonb_array_length(${dossierCompletionAssessments.humanReadSuggestedSectionIds}) > 0`
const IDENTITY_FILTER: SQL = sql`jsonb_array_length(${inventoryResolutions.attributionWarnings}) > 0`

function queueFilter(kind: CompletionReviewQueueKind): SQL {
  if (kind === 'incomplete') return INCOMPLETE_FILTER
  if (kind === 'human-read') return HUMAN_READ_FILTER
  return IDENTITY_FILTER
}

function boundedLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) return COMPLETION_REVIEW_QUEUE_DEFAULT_LIMIT
  const limit = Math.trunc(value as number)
  if (limit < 1) return 1
  return Math.min(limit, COMPLETION_REVIEW_QUEUE_MAX_LIMIT)
}

function boundedOffset(value: number | undefined): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.trunc(value as number))
}

// ---------------------------------------------------------------------------
// Projections
// ---------------------------------------------------------------------------

function sectionView(section: SectionAssessment): CompletionReviewSectionView {
  return {
    id: section.sectionId,
    label: dossierSectionLabel(section.sectionId),
    state: section.state,
    stateLabel: SECTION_STATE_LABELS[section.state] ?? section.state,
    terminal: isTerminalSectionState(section.state),
    basis: section.basis,
    blockedReason: section.blockedReason ?? null,
    humanReadSuggested: section.humanReadSuggested === true,
  }
}

function warningView(warning: AttributionWarning): CompletionReviewWarningView {
  return {
    code: warning.code,
    label: attributionWarningLabel(warning.code),
    detail: warning.detail,
    relatedSlugs: [...(warning.relatedSlugs ?? [])],
  }
}

function decisionView(
  row: {
    id: string
    drugId: string
    sectionId: string
    decision: CompletionReviewDecision
    explanation: string
    assessmentInputDigest: string
    reviewerUserId: string
    createdAt: Date
  },
  reviewerHandle: string | null,
  currentDigest: string | null,
): CompletionReviewDecisionView {
  return {
    id: row.id,
    drugId: row.drugId,
    sectionId: row.sectionId,
    sectionLabel: dossierSectionLabel(row.sectionId),
    decision: row.decision,
    decisionLabel: COMPLETION_REVIEW_DECISION_LABELS[row.decision] ?? row.decision,
    explanation: row.explanation,
    assessmentInputDigest: row.assessmentInputDigest,
    appliesToCurrentAssessment:
      currentDigest !== null && currentDigest === row.assessmentInputDigest,
    reviewerUserId: row.reviewerUserId,
    reviewerHandle,
    createdAt: row.createdAt.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function countCompletionReviewQueues(): Promise<CompletionReviewQueueCounts> {
  const [incompleteRows, humanReadRows, identityRows] = await Promise.all([
    db.select({ value: count() }).from(dossierCompletionAssessments).where(INCOMPLETE_FILTER),
    db.select({ value: count() }).from(dossierCompletionAssessments).where(HUMAN_READ_FILTER),
    db.select({ value: count() }).from(inventoryResolutions).where(IDENTITY_FILTER),
  ])
  return {
    incomplete: incompleteRows[0]?.value ?? 0,
    humanRead: humanReadRows[0]?.value ?? 0,
    identity: identityRows[0]?.value ?? 0,
  }
}

export async function listCompletionReviewQueue(input: {
  kind: CompletionReviewQueueKind
  limit?: number
  offset?: number
}): Promise<CompletionReviewQueuePage> {
  const limit = boundedLimit(input.limit)
  const offset = boundedOffset(input.offset)
  const filter = queueFilter(input.kind)

  const rows = await db
    .select({
      drugId: drugs.id,
      slug: drugs.slug,
      name: drugs.name,
      entityClass: inventoryResolutions.entityClass,
      resolutionStatus: inventoryResolutions.resolutionStatus,
      canonicalSlug: inventoryResolutions.canonicalSlug,
      identityConfidence: inventoryResolutions.identityConfidence,
      attributionWarnings: inventoryResolutions.attributionWarnings,
      assessmentStatus: dossierCompletionAssessments.status,
      inputDigest: dossierCompletionAssessments.inputDigest,
      sections: dossierCompletionAssessments.sections,
      applicableSectionCount: dossierCompletionAssessments.applicableSectionCount,
      terminalSectionCount: dossierCompletionAssessments.terminalSectionCount,
    })
    .from(drugs)
    .leftJoin(inventoryResolutions, eq(inventoryResolutions.drugId, drugs.id))
    .leftJoin(dossierCompletionAssessments, eq(dossierCompletionAssessments.drugId, drugs.id))
    .where(filter)
    .orderBy(asc(drugs.slug))
    .limit(limit)
    .offset(offset)

  const totalRows = await db
    .select({ value: count() })
    .from(drugs)
    .leftJoin(inventoryResolutions, eq(inventoryResolutions.drugId, drugs.id))
    .leftJoin(dossierCompletionAssessments, eq(dossierCompletionAssessments.drugId, drugs.id))
    .where(filter)

  const counts = await countCompletionReviewQueues()
  const decisionsByDrug = await listDecisionsForDrugIds(rows.map((row) => row.drugId))

  const items = rows.map((row): CompletionReviewQueueItem => {
    const sections = (row.sections ?? []).map(sectionView)
    const openSections = sections.filter((section) => !section.terminal)
    const humanReadSections = sections.filter((section) => section.humanReadSuggested)
    const decidable = new Set<string>([
      ...openSections.map((section) => section.id),
      ...humanReadSections.map((section) => section.id),
    ])
    // An identity warning is answered against the identity section of the same assessment.
    const warnings = (row.attributionWarnings ?? []).map(warningView)
    if (warnings.length > 0 && sections.some((section) => section.id === 'identity')) {
      decidable.add('identity')
    }
    const currentDigest = row.inputDigest ?? null
    return {
      drugId: row.drugId,
      slug: row.slug,
      name: row.name,
      entityClass: row.entityClass ?? null,
      entityClassLabel: entityClassLabel(row.entityClass),
      resolutionStatus: row.resolutionStatus ?? null,
      resolutionStatusLabel: inventoryResolutionLabel(row.resolutionStatus),
      canonicalSlug: row.canonicalSlug ?? null,
      identityConfidence: row.identityConfidence ?? null,
      assessmentInputDigest: currentDigest,
      assessmentStatus: row.assessmentStatus ?? null,
      applicableSectionCount: row.applicableSectionCount ?? 0,
      terminalSectionCount: row.terminalSectionCount ?? 0,
      sections,
      openSections,
      humanReadSections,
      decidableSectionIds: [...decidable].sort(),
      attributionWarnings: warnings,
      recentDecisions: (decisionsByDrug.get(row.drugId) ?? []).map((decision) =>
        decisionView(decision, decision.reviewerHandle, currentDigest),
      ),
    }
  })

  return {
    kind: input.kind,
    limit,
    offset,
    total: totalRows[0]?.value ?? 0,
    counts,
    items,
  }
}

/** Every recorded note for one record, newest first. Bounded by `limit`. */
export async function listCompletionReviewDecisions(
  drugId: string,
  options: { limit?: number } = {},
): Promise<CompletionReviewDecisionView[]> {
  const limit = Math.min(
    Math.max(1, Math.trunc(options.limit ?? MAX_DECISIONS_PER_RECORD)),
    COMPLETION_REVIEW_QUEUE_MAX_LIMIT,
  )
  const assessmentRows = await db
    .select({ inputDigest: dossierCompletionAssessments.inputDigest })
    .from(dossierCompletionAssessments)
    .where(eq(dossierCompletionAssessments.drugId, drugId))
    .limit(1)
  const currentDigest = assessmentRows[0]?.inputDigest ?? null

  const rows = await db
    .select({
      id: dossierCompletionReviewDecisions.id,
      drugId: dossierCompletionReviewDecisions.drugId,
      sectionId: dossierCompletionReviewDecisions.sectionId,
      decision: dossierCompletionReviewDecisions.decision,
      explanation: dossierCompletionReviewDecisions.explanation,
      assessmentInputDigest: dossierCompletionReviewDecisions.assessmentInputDigest,
      reviewerUserId: dossierCompletionReviewDecisions.reviewerUserId,
      createdAt: dossierCompletionReviewDecisions.createdAt,
      reviewerHandle: users.handle,
    })
    .from(dossierCompletionReviewDecisions)
    .leftJoin(users, eq(users.id, dossierCompletionReviewDecisions.reviewerUserId))
    .where(eq(dossierCompletionReviewDecisions.drugId, drugId))
    .orderBy(desc(dossierCompletionReviewDecisions.createdAt))
    .limit(limit)

  return rows.map((row) => decisionView(row, row.reviewerHandle, currentDigest))
}

async function listDecisionsForDrugIds(
  drugIds: string[],
): Promise<
  Map<string, Array<Parameters<typeof decisionView>[0] & { reviewerHandle: string | null }>>
> {
  const unique = [...new Set(drugIds)]
  const byDrug = new Map<
    string,
    Array<Parameters<typeof decisionView>[0] & { reviewerHandle: string | null }>
  >()
  if (unique.length === 0) return byDrug

  const rows = await db
    .select({
      id: dossierCompletionReviewDecisions.id,
      drugId: dossierCompletionReviewDecisions.drugId,
      sectionId: dossierCompletionReviewDecisions.sectionId,
      decision: dossierCompletionReviewDecisions.decision,
      explanation: dossierCompletionReviewDecisions.explanation,
      assessmentInputDigest: dossierCompletionReviewDecisions.assessmentInputDigest,
      reviewerUserId: dossierCompletionReviewDecisions.reviewerUserId,
      createdAt: dossierCompletionReviewDecisions.createdAt,
      reviewerHandle: users.handle,
    })
    .from(dossierCompletionReviewDecisions)
    .leftJoin(users, eq(users.id, dossierCompletionReviewDecisions.reviewerUserId))
    .where(inArray(dossierCompletionReviewDecisions.drugId, unique))
    .orderBy(desc(dossierCompletionReviewDecisions.createdAt))
    .limit(unique.length * MAX_DECISIONS_PER_RECORD)

  for (const row of rows) {
    const list = byDrug.get(row.drugId) ?? []
    if (list.length < MAX_DECISIONS_PER_RECORD) list.push(row)
    byDrug.set(row.drugId, list)
  }
  return byDrug
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export interface RecordCompletionReviewDecisionInput {
  drugId: string
  sectionId: string
  decision: CompletionReviewDecision
  explanation: string
  assessmentInputDigest: string
  reviewerUserId: string
}

/**
 * The decision id is a SHA-256 over the exact note, so the same reviewer answering the same section
 * of the same assessment with the same words at the same instant produces one row rather than two.
 */
export function completionReviewDecisionId(input: {
  drugId: string
  sectionId: string
  reviewerUserId: string
  assessmentInputDigest: string
  explanation: string
  createdAt: Date
}): string {
  return createHash('sha256')
    .update(
      [
        'dossier-completion-review-decision/v1',
        input.drugId,
        input.sectionId,
        input.reviewerUserId,
        input.assessmentInputDigest,
        input.explanation,
        input.createdAt.toISOString(),
      ].join(' '),
    )
    .digest('hex')
}

export async function recordCompletionReviewDecision(
  input: RecordCompletionReviewDecisionInput,
): Promise<CompletionReviewDecisionView> {
  const explanation = input.explanation.trim()
  if (!isCompletionReviewDecision(input.decision)) {
    throw new CompletionReviewError(
      'invalid_decision',
      'That review outcome is not one of the four recorded outcomes.',
    )
  }
  if (!isDossierSectionId(input.sectionId)) {
    throw new CompletionReviewError(
      'invalid_decision',
      'That section is not part of the completion contract.',
    )
  }
  if (!DIGEST_PATTERN.test(input.assessmentInputDigest)) {
    throw new CompletionReviewError('invalid_decision', 'The assessment digest is not valid.')
  }
  if (explanation.length === 0 || explanation.length > COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH) {
    throw new CompletionReviewError(
      'invalid_decision',
      `An explanation of 1 to ${COMPLETION_REVIEW_EXPLANATION_MAX_LENGTH} characters is required.`,
    )
  }

  return db.transaction(async (tx) => {
    const actorRows = await tx
      .select({
        id: users.id,
        handle: users.handle,
        isAdmin: users.isAdmin,
        trustTier: users.trustTier,
      })
      .from(users)
      .where(eq(users.id, input.reviewerUserId))
      .limit(1)
    const actor = actorRows[0]
    if (!actor || !canRecordCompletionReviewDecision(actor)) {
      throw new CompletionReviewError(
        'not_authorized',
        'Only a steward or administrator may record a completion or identity review decision.',
      )
    }

    // `for('share')` locks the assessment row for the length of the transaction so the digest the
    // reviewer answered cannot be replaced between the check and the insert. The lock is shared:
    // this transaction reads the assessment, it never writes it.
    const assessmentRows = await tx
      .select({
        inputDigest: dossierCompletionAssessments.inputDigest,
        sections: dossierCompletionAssessments.sections,
      })
      .from(dossierCompletionAssessments)
      .where(eq(dossierCompletionAssessments.drugId, input.drugId))
      .limit(1)
      .for('share')
    const assessment = assessmentRows[0]
    if (!assessment) {
      throw new CompletionReviewError(
        'not_found',
        'This record has no completion assessment yet, so there is nothing to decide about.',
      )
    }
    if (assessment.inputDigest !== input.assessmentInputDigest) {
      throw new CompletionReviewError('stale_assessment', STALE_ASSESSMENT_MESSAGE)
    }
    if (!assessment.sections.some((section) => section.sectionId === input.sectionId)) {
      throw new CompletionReviewError(
        'section_not_assessed',
        'That section does not apply to this record, so no decision can be recorded against it.',
      )
    }

    const createdAt = new Date()
    const id = completionReviewDecisionId({
      drugId: input.drugId,
      sectionId: input.sectionId,
      reviewerUserId: actor.id,
      assessmentInputDigest: input.assessmentInputDigest,
      explanation,
      createdAt,
    })

    const inserted = await tx
      .insert(dossierCompletionReviewDecisions)
      .values({
        id,
        drugId: input.drugId,
        sectionId: input.sectionId,
        decision: input.decision,
        reviewerUserId: actor.id,
        explanation,
        assessmentInputDigest: input.assessmentInputDigest,
        createdAt,
      })
      .onConflictDoNothing({ target: dossierCompletionReviewDecisions.id })
      .returning({
        id: dossierCompletionReviewDecisions.id,
        drugId: dossierCompletionReviewDecisions.drugId,
        sectionId: dossierCompletionReviewDecisions.sectionId,
        decision: dossierCompletionReviewDecisions.decision,
        explanation: dossierCompletionReviewDecisions.explanation,
        assessmentInputDigest: dossierCompletionReviewDecisions.assessmentInputDigest,
        reviewerUserId: dossierCompletionReviewDecisions.reviewerUserId,
        createdAt: dossierCompletionReviewDecisions.createdAt,
      })

    const row = inserted[0]
    if (row) return decisionView(row, actor.handle, assessment.inputDigest)

    // The identical note already exists. Return it rather than raising: the table is append-only,
    // so re-recording the same words must not become an update.
    const existing = await tx
      .select({
        id: dossierCompletionReviewDecisions.id,
        drugId: dossierCompletionReviewDecisions.drugId,
        sectionId: dossierCompletionReviewDecisions.sectionId,
        decision: dossierCompletionReviewDecisions.decision,
        explanation: dossierCompletionReviewDecisions.explanation,
        assessmentInputDigest: dossierCompletionReviewDecisions.assessmentInputDigest,
        reviewerUserId: dossierCompletionReviewDecisions.reviewerUserId,
        createdAt: dossierCompletionReviewDecisions.createdAt,
      })
      .from(dossierCompletionReviewDecisions)
      .where(eq(dossierCompletionReviewDecisions.id, id))
      .limit(1)
    const stored = existing[0]
    if (!stored) {
      throw new CompletionReviewError('not_found', 'The decision could not be recorded.')
    }
    return decisionView(stored, actor.handle, assessment.inputDigest)
  })
}

export const COMPLETION_REVIEW_DECISIONS_PER_RECORD = MAX_DECISIONS_PER_RECORD

/**
 * Reading and writing community review of a Substance Compass sentence.
 *
 * The read half is what a medicine page calls on every request: the published wording overlay for
 * that medicine and a small review summary for the control in the header. Both are deliberately
 * viewer-independent, because `/d/<slug>` is one document served identically to everybody and a
 * count that varied by session would make it a per-reader response.
 *
 * The write half holds the rule the whole feature exists for: when a third valid approval lands,
 * the approved wording becomes the public answer inside the same transaction, with the gates re-run
 * from locked rows and a publication event written beside the pointer. No deployment, no queue, no
 * separate publishing step for somebody to forget.
 */
import { and, desc, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  drugs,
  pageStatementModerationEvents,
  pageStatementPublicationEvents,
  pageStatementPublications,
  pageStatementReviews,
  pageStatementReviewStates,
  pageStatementRevisions,
  users,
} from '@/db/schema'
import { ApiError } from '@/lib/api-response'
import type { VerdictReviewerExpertiseTag } from '@/lib/evidence/types'
import { newId } from '@/lib/ids'
import { pageStatementContentDigest, pageStatementSourceDigest } from '@/lib/page-statements/digest'
import { gatesPassed, runPageStatementGates, type GateResult } from '@/lib/page-statements/gates'
import {
  emptyPageStatementOverlay as buildEmptyOverlay,
  type ActivePageStatement as ActiveStatement,
  type PageReviewSummary as ReviewSummary,
  type PageStatementOverlay as Overlay,
} from '@/lib/page-statements/overlay'
import {
  derivePageStatementRiskClass,
  mayAdministerPageStatements,
  mayProposePageStatements,
  pageStatementReviewEligibility,
  qualificationIsRelevant,
  requiredQualifiedApprovals,
  reviewerIdentityKey,
  type ReviewActor,
} from '@/lib/page-statements/policy'
import {
  OPEN_PROPOSAL_STATUSES,
  PAGE_STATEMENT_APPROVALS_REQUIRED,
  isPageStatementKey,
  type PageStatementChangeCategory,
  type PageStatementKey,
  type PageStatementProposalStatus,
  type PageStatementReviewEligibilityReason,
  type PageStatementReviewStatus,
  type PageStatementRiskClass,
} from '@/lib/page-statements/types'
import { activeProgrammeVerdictQualifications } from '@/lib/queries/programme-verdict-workflow'
import type { DrugDossier } from '@/lib/types'

export class PageStatementError extends ApiError {
  constructor(status: number, message: string, code: string) {
    super(status, message, code)
    this.name = 'PageStatementError'
  }
}

type RevisionRow = typeof pageStatementRevisions.$inferSelect

/* ================================================================== reading */

/**
 * The internal key for a medicine, from its public slug.
 *
 * `DrugDossier.id` is deliberately the public slug (lib/dossier.ts:101 — "Public dossier identity is
 * the slug; internal primary keys stay private"), and on most records the two happen to be equal.
 * They are not always, so every write here resolves the row key rather than assuming it, or a
 * proposal against such a record is refused by the foreign key with nothing useful to say.
 */
export async function medicineIdForSlug(slug: string): Promise<string | null> {
  const rows = await db.select({ id: drugs.id }).from(drugs).where(eq(drugs.slug, slug)).limit(1)
  return rows[0]?.id ?? null
}

/*
 * The overlay shapes live in lib/page-statements/overlay.ts so the view model, which is a pure
 * function, can import them without importing a database connection. Re-exported here so a caller
 * needs one import either way.
 */
export {
  emptyPageStatementOverlay,
  EMPTY_PAGE_REVIEW_SUMMARY,
  type ActivePageStatement,
  type PageReviewSummary,
  type PageStatementOverlay,
} from '@/lib/page-statements/overlay'

/**
 * The published wording and the review summary for one medicine, in one round trip each.
 *
 * A published revision whose source digest no longer matches the record is dropped rather than
 * shown: it was approved against a record that has since moved, and carrying it forward would be
 * exactly the silent staleness the digests exist to prevent. The page falls back to its built-in
 * wording, which is always honest, and the revision is left for a reviewer to re-confirm.
 */
export async function loadPageStatementOverlay(
  slug: string,
  record: DrugDossier | null,
): Promise<Overlay> {
  if (!record) return buildEmptyOverlay(slug)
  const medicineId = await medicineIdForSlug(slug)
  if (!medicineId) return buildEmptyOverlay(slug)

  const [published, openStates] = await Promise.all([
    db
      .select({
        revisionId: pageStatementRevisions.id,
        statementKey: pageStatementRevisions.statementKey,
        proposedText: pageStatementRevisions.proposedText,
        evidenceState: pageStatementRevisions.evidenceState,
        sourceDigest: pageStatementRevisions.sourceDigest,
        publishedAt: pageStatementRevisions.publishedAt,
        approvals: pageStatementReviewStates.reviewCount,
        qualifiedApprovals: pageStatementReviewStates.qualifiedApprovals,
      })
      .from(pageStatementPublications)
      .innerJoin(
        pageStatementRevisions,
        eq(pageStatementRevisions.id, pageStatementPublications.revisionId),
      )
      .leftJoin(
        pageStatementReviewStates,
        eq(pageStatementReviewStates.revisionId, pageStatementRevisions.id),
      )
      .where(eq(pageStatementPublications.medicineId, medicineId)),
    db
      .select({
        status: pageStatementRevisions.status,
        reviewCount: pageStatementReviewStates.reviewCount,
        required: pageStatementReviewStates.requiredApprovals,
      })
      .from(pageStatementRevisions)
      .leftJoin(
        pageStatementReviewStates,
        eq(pageStatementReviewStates.revisionId, pageStatementRevisions.id),
      )
      .where(
        and(
          eq(pageStatementRevisions.medicineId, medicineId),
          inArray(pageStatementRevisions.status, ['submitted', 'open', 'changes_requested']),
        ),
      ),
  ])

  const active = new Map<PageStatementKey, ActiveStatement>()
  for (const row of published) {
    const key = row.statementKey
    if (!isPageStatementKey(key)) continue
    if (pageStatementSourceDigest(record, key) !== row.sourceDigest) continue
    active.set(key, {
      revisionId: row.revisionId,
      statementKey: key,
      text: row.proposedText,
      evidenceState: row.evidenceState,
      approvals: row.approvals ?? PAGE_STATEMENT_APPROVALS_REQUIRED,
      qualifiedApprovals: row.qualifiedApprovals ?? 0,
      publishedAt: (row.publishedAt ?? new Date()).toISOString().slice(0, 10),
      sourceDigest: row.sourceDigest,
    })
  }

  const open = openStates.filter((row) => row.status === 'submitted' || row.status === 'open')
  const summary: ReviewSummary = {
    slug,
    approvals: open.reduce((best, row) => Math.max(best, row.reviewCount ?? 0), 0),
    required: open[0]?.required ?? PAGE_STATEMENT_APPROVALS_REQUIRED,
    openProposals: open.length,
    changesRequested: openStates.some((row) => row.status === 'changes_requested'),
    publishedRevisions: active.size,
  }
  return { active, summary }
}

/* ============================================================ queue reading */

export interface PageStatementSourceRef {
  url?: string
  title?: string
  excerpt?: string
}

export interface PageStatementReviewView {
  id: string
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT'
  reviewerName: string
  reviewerOrcid: string | null
  /** A public label only. The qualification records themselves stay private. */
  qualificationVerified: boolean
  conflictDeclared: boolean
  reason: string | null
  reviewedAt: string
  withdrawnAt: string | null
}

export interface PageStatementProposalView {
  id: string
  slug: string
  medicineId: string
  medicineName: string
  statementKey: PageStatementKey
  claimId: string | null
  currentText: string
  proposedText: string
  reason: string
  changeCategory: PageStatementChangeCategory
  riskClass: PageStatementRiskClass
  evidenceState: string
  evidencePacket: Record<string, unknown>
  sources: PageStatementSourceRef[]
  gateResults: GateResult[]
  authorName: string
  authorUserId: string
  status: PageStatementProposalStatus
  statusReason: string | null
  createdAt: string
  publishedAt: string | null
  contentDigest: string
  sourceDigest: string
  reviewStatus: PageStatementReviewStatus
  approvals: number
  qualifiedApprovals: number
  required: number
  requiredQualified: number
  reviews: PageStatementReviewView[]
}

function toProposalView(
  revision: RevisionRow,
  medicineName: string,
  authorName: string,
  state: typeof pageStatementReviewStates.$inferSelect | null,
  reviews: Array<typeof pageStatementReviews.$inferSelect>,
): PageStatementProposalView {
  return {
    id: revision.id,
    slug: revision.slug,
    medicineId: revision.medicineId,
    medicineName,
    statementKey: revision.statementKey,
    claimId: revision.claimId,
    currentText: revision.currentText,
    proposedText: revision.proposedText,
    reason: revision.reason,
    changeCategory: revision.changeCategory,
    riskClass: revision.riskClass,
    evidenceState: revision.evidenceState,
    evidencePacket: revision.evidencePacket,
    sources: revision.sources as PageStatementSourceRef[],
    gateResults: revision.gateResults as unknown as GateResult[],
    authorName,
    authorUserId: revision.authorUserId,
    status: revision.status,
    statusReason: revision.statusReason,
    createdAt: revision.createdAt.toISOString(),
    publishedAt: revision.publishedAt?.toISOString() ?? null,
    contentDigest: revision.contentDigest,
    sourceDigest: revision.sourceDigest,
    reviewStatus: state?.status ?? 'awaiting_reviews',
    approvals: state?.reviewCount ?? 0,
    qualifiedApprovals: state?.qualifiedApprovals ?? 0,
    required: state?.requiredApprovals ?? PAGE_STATEMENT_APPROVALS_REQUIRED,
    requiredQualified: state?.requiredQualifiedApprovals ?? 0,
    reviews: reviews.map((review) => ({
      id: review.id,
      decision: review.decision,
      reviewerName: review.reviewerNameSnapshot,
      reviewerOrcid: review.reviewerOrcidSnapshot,
      qualificationVerified: review.qualificationRelevant,
      conflictDeclared: review.conflictDeclared,
      reason: review.reason,
      reviewedAt: review.reviewedAt.toISOString(),
      withdrawnAt: review.withdrawnAt?.toISOString() ?? null,
    })),
  }
}

async function hydrateProposals(revisions: RevisionRow[]): Promise<PageStatementProposalView[]> {
  if (revisions.length === 0) return []
  const revisionIds = revisions.map((revision) => revision.id)
  const [states, reviews, medicineRows, authorRows] = await Promise.all([
    db
      .select()
      .from(pageStatementReviewStates)
      .where(inArray(pageStatementReviewStates.revisionId, revisionIds)),
    db
      .select()
      .from(pageStatementReviews)
      .where(inArray(pageStatementReviews.revisionId, revisionIds)),
    db
      .select({ id: drugs.id, name: drugs.name })
      .from(drugs)
      .where(inArray(drugs.id, [...new Set(revisions.map((revision) => revision.medicineId))])),
    db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(inArray(users.id, [...new Set(revisions.map((revision) => revision.authorUserId))])),
  ])

  const stateById = new Map(states.map((state) => [state.revisionId, state]))
  const nameById = new Map(medicineRows.map((row) => [row.id, row.name]))
  const authorById = new Map(authorRows.map((row) => [row.id, row.name]))
  return revisions.map((revision) =>
    toProposalView(
      revision,
      nameById.get(revision.medicineId) ?? revision.slug,
      authorById.get(revision.authorUserId) ?? 'A member',
      stateById.get(revision.id) ?? null,
      reviews.filter((review) => review.revisionId === revision.id),
    ),
  )
}

export interface QueueFilters {
  slug?: string
  statementKey?: PageStatementKey
  status?: PageStatementProposalStatus
  changeCategory?: PageStatementChangeCategory
  riskClass?: PageStatementRiskClass
  /** `closest` | `oldest` | `newest` | `risk` */
  sort?: string
  limit?: number
}

export async function listPageStatementProposals(
  filters: QueueFilters = {},
): Promise<PageStatementProposalView[]> {
  const where = [
    filters.slug ? eq(pageStatementRevisions.slug, filters.slug) : undefined,
    filters.statementKey
      ? eq(pageStatementRevisions.statementKey, filters.statementKey)
      : undefined,
    filters.changeCategory
      ? eq(pageStatementRevisions.changeCategory, filters.changeCategory)
      : undefined,
    filters.riskClass ? eq(pageStatementRevisions.riskClass, filters.riskClass) : undefined,
    filters.status
      ? eq(pageStatementRevisions.status, filters.status)
      : inArray(pageStatementRevisions.status, [
          'submitted',
          'open',
          'changes_requested',
          'safety_hold',
        ]),
  ].filter((clause) => clause !== undefined)

  const revisions = await db
    .select()
    .from(pageStatementRevisions)
    .where(and(...where))
    .orderBy(desc(pageStatementRevisions.createdAt))
    .limit(Math.min(200, Math.max(1, filters.limit ?? 50)))

  const views = await hydrateProposals(revisions)
  if (filters.sort === 'closest') {
    return [...views].sort((left, right) => right.approvals - left.approvals)
  }
  if (filters.sort === 'oldest') {
    return [...views].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
  }
  if (filters.sort === 'risk') {
    const rank: Record<PageStatementRiskClass, number> = {
      high_risk: 0,
      scientific_meaning: 1,
      copy_only: 2,
    }
    return [...views].sort((left, right) => rank[left.riskClass] - rank[right.riskClass])
  }
  return views
}

/** The published history of one sentence, newest first, for the public "What changed" section. */
export async function listPageStatementHistory(
  medicineId: string,
  limit = 20,
): Promise<PageStatementProposalView[]> {
  const revisions = await db
    .select()
    .from(pageStatementRevisions)
    .where(
      and(
        eq(pageStatementRevisions.medicineId, medicineId),
        inArray(pageStatementRevisions.status, ['published', 'superseded']),
      ),
    )
    .orderBy(desc(pageStatementRevisions.publishedAt))
    .limit(limit)
  return hydrateProposals(revisions)
}

export async function getPageStatementProposal(
  id: string,
): Promise<PageStatementProposalView | null> {
  const rows = await db
    .select()
    .from(pageStatementRevisions)
    .where(eq(pageStatementRevisions.id, id))
    .limit(1)
  const revision = rows[0]
  if (!revision) return null
  const [view] = await hydrateProposals([revision])
  return view ?? null
}

export interface ViewerReviewEligibility {
  canReview: boolean
  reason: PageStatementReviewEligibilityReason
  /** The recorded qualifications relevant to this proposal that the viewer holds. */
  relevantQualifications: VerdictReviewerExpertiseTag[]
}

export async function pageStatementViewerEligibility(
  proposal: PageStatementProposalView,
  viewer: ReviewActor | null,
): Promise<ViewerReviewEligibility> {
  const reviews = await db
    .select({
      userId: pageStatementReviews.reviewerUserId,
      identityKey: pageStatementReviews.reviewerIdentityKey,
    })
    .from(pageStatementReviews)
    .where(
      and(
        eq(pageStatementReviews.revisionId, proposal.id),
        sql`${pageStatementReviews.withdrawnAt} is null`,
      ),
    )
  const decision = pageStatementReviewEligibility({
    viewer,
    authorUserId: proposal.authorUserId,
    reviewStatus: proposal.reviewStatus,
    proposalStatus: proposal.status,
    recordedReviewers: reviews,
  })
  if (!viewer) return { ...decision, relevantQualifications: [] }
  const held = await activeProgrammeVerdictQualifications(db, viewer.id)
  return { ...decision, relevantQualifications: held }
}

/* ================================================================== writing */

export interface CreateProposalInput {
  slug: string
  statementKey: PageStatementKey
  currentText: string
  proposedText: string
  reason: string
  changeCategory: PageStatementChangeCategory
  evidenceState: string
  evidencePacket: Record<string, unknown>
  sources: PageStatementSourceRef[]
  claimId?: string | null
  parentRevisionId?: string | null
}

export interface ProposalContext {
  record: DrugDossier
  /** The `drugs.id` row key, resolved from the slug. Never `DrugDossier.id`, which is the slug. */
  medicineId: string
  identityWarning: boolean
  medicineAliases: string[]
}

/**
 * Write a proposal, with the risk class, the digests and the gate results all computed here rather
 * than accepted from the caller. A client that names its own risk class, digest or gate outcome is
 * describing what it would like to be true.
 */
export async function createPageStatementProposal(
  author: ReviewActor,
  input: CreateProposalInput,
  context: ProposalContext,
): Promise<PageStatementProposalView> {
  if (!mayProposePageStatements(author)) {
    throw new PageStatementError(403, 'This account cannot propose a change.', 'author_ineligible')
  }
  const proposed = input.proposedText.trim()
  const current = input.currentText.trim()
  if (proposed.length === 0) {
    throw new PageStatementError(422, 'A proposal needs some wording.', 'empty_proposal')
  }
  if (proposed === current) {
    throw new PageStatementError(
      422,
      'The proposed wording is the same as the wording on the page.',
      'identical_proposal',
    )
  }

  const riskClass = derivePageStatementRiskClass({
    statementKey: input.statementKey,
    changeCategory: input.changeCategory,
    currentText: current,
    proposedText: proposed,
  })
  const sourceDigest = pageStatementSourceDigest(context.record, input.statementKey)
  const gateResults = runPageStatementGates({
    statementKey: input.statementKey,
    currentText: current,
    proposedText: proposed,
    changeCategory: input.changeCategory,
    riskClass,
    evidenceState: input.evidenceState,
    sources: input.sources,
    evidencePacket: input.evidencePacket,
    identityWarning: context.identityWarning,
    sourceDigestCurrent: true,
    medicineName: context.record.name,
    medicineAliases: context.medicineAliases,
  })
  const contentDigest = pageStatementContentDigest({
    medicineId: context.medicineId,
    statementKey: input.statementKey,
    proposedText: proposed,
    currentText: current,
    reason: input.reason.trim(),
    changeCategory: input.changeCategory,
    riskClass,
    evidenceState: input.evidenceState,
    sources: input.sources as unknown as ReadonlyArray<Record<string, unknown>>,
    evidencePacket: input.evidencePacket,
  })

  const revisionId = newId('psr')
  try {
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select rnawiki_lock_page_statement_subject(${context.medicineId}, ${input.statementKey}::page_statement_key)`,
      )
      const publishedRows = await tx
        .select({ revisionId: pageStatementPublications.revisionId })
        .from(pageStatementPublications)
        .where(
          and(
            eq(pageStatementPublications.medicineId, context.medicineId),
            eq(pageStatementPublications.statementKey, input.statementKey),
          ),
        )
        .limit(1)

      await tx.insert(pageStatementRevisions).values({
        id: revisionId,
        medicineId: context.medicineId,
        slug: input.slug,
        statementKey: input.statementKey,
        claimId: input.claimId ?? null,
        parentRevisionId: input.parentRevisionId ?? null,
        baselineRevisionId: publishedRows[0]?.revisionId ?? null,
        currentText: current,
        proposedText: proposed,
        reason: input.reason.trim(),
        changeCategory: input.changeCategory,
        riskClass,
        evidenceState: input.evidenceState,
        evidencePacket: input.evidencePacket,
        sources: input.sources as Array<Record<string, unknown>>,
        gateResults: gateResults as unknown as Array<Record<string, unknown>>,
        contentDigest,
        sourceDigest,
        authorUserId: author.id,
        status: 'open',
        submittedAt: new Date(),
      })
      await tx.insert(pageStatementReviewStates).values({
        revisionId,
        status: 'awaiting_reviews',
        reviewCount: 0,
        qualifiedApprovals: 0,
        requiredApprovals: PAGE_STATEMENT_APPROVALS_REQUIRED,
        requiredQualifiedApprovals: requiredQualifiedApprovals(riskClass),
      })
    })
  } catch (error) {
    if (uniqueViolation(error, 'page_statement_revisions_one_open')) {
      throw new PageStatementError(
        409,
        'Someone has already proposed a change to this sentence. Review that one, or wait for it to close.',
        'proposal_already_open',
      )
    }
    throw error
  }

  const view = await getPageStatementProposal(revisionId)
  if (!view) throw new PageStatementError(500, 'The proposal could not be read back.', 'not_found')
  return view
}

function uniqueViolation(error: unknown, constraint: string): boolean {
  const candidate = error as { code?: string; constraint?: string; cause?: unknown }
  if (candidate?.code === '23505' && candidate.constraint === constraint) return true
  const cause = candidate?.cause as { code?: string; constraint?: string } | undefined
  return cause?.code === '23505' && cause.constraint === constraint
}

export interface RecordReviewInput {
  revisionId: string
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT'
  checkedWording: boolean
  checkedSource: boolean
  checkedLimitation: boolean
  conflictsOfInterest: string
  conflictsOfInterestAttested: boolean
  conflictDeclared: boolean
  reason?: string
  /** The digest the reviewer's browser was looking at. A stale one is refused, not reconciled. */
  expectedContentDigest: string
}

export interface ReviewOutcome {
  proposal: PageStatementProposalView
  published: boolean
  publicationEventId: string | null
  failedGates: GateResult[]
}

/**
 * Record one decision and, if it was the third valid approval, publish in the same transaction.
 *
 * Everything the threshold depends on is recomputed here from locked rows: the reviewer's standing,
 * their qualifications, the digests, the gates. Nothing the browser sent about counts, roles or
 * publication state is trusted, because a client is free to say anything.
 */
export async function recordPageStatementReview(
  reviewer: ReviewActor,
  input: RecordReviewInput,
  context: { record: DrugDossier | null; identityWarning: boolean; medicineAliases: string[] },
): Promise<ReviewOutcome> {
  const reviewId = newId('psrv')
  let publicationEventId: string | null = null
  let published = false
  let blockedBy: GateResult[] = []

  await db.transaction(async (tx) => {
    const revisionRows = await tx
      .select()
      .from(pageStatementRevisions)
      .where(eq(pageStatementRevisions.id, input.revisionId))
      .limit(1)
      .for('update')
    const revision = revisionRows[0]
    if (!revision) {
      throw new PageStatementError(404, 'That proposal no longer exists.', 'not_found')
    }
    await tx.execute(
      sql`select rnawiki_lock_page_statement_subject(${revision.medicineId}, ${revision.statementKey}::page_statement_key)`,
    )
    if (revision.contentDigest !== input.expectedContentDigest) {
      throw new PageStatementError(
        409,
        'This wording changed while you were reading it. Reload and look again before deciding.',
        'stale_digest',
      )
    }
    if (revision.status !== 'submitted' && revision.status !== 'open') {
      throw new PageStatementError(409, 'This proposal is no longer open for review.', 'not_open')
    }

    const userRows = await tx
      .select()
      .from(users)
      .where(eq(users.id, reviewer.id))
      .limit(1)
      .for('share')
    const account = userRows[0]
    if (!account)
      throw new PageStatementError(401, 'Sign in to record a decision.', 'unauthenticated')

    const held = await activeProgrammeVerdictQualifications(tx, account.id)
    const relevant = qualificationIsRelevant(held, revision.riskClass, revision.changeCategory)

    try {
      await tx.insert(pageStatementReviews).values({
        id: reviewId,
        revisionId: revision.id,
        reviewerUserId: account.id,
        reviewerNameSnapshot: account.name,
        reviewerOrcidSnapshot: account.orcid,
        reviewerIdentityKey: reviewerIdentityKey({ id: account.id, orcid: account.orcid }),
        reviewerTrustTierSnapshot: account.trustTier,
        qualificationSnapshot: held,
        qualificationRelevant: relevant && !input.conflictDeclared,
        decision: input.decision,
        checkedWording: input.checkedWording,
        checkedSource: input.checkedSource,
        checkedLimitation: input.checkedLimitation,
        conflictsOfInterest: input.conflictsOfInterest,
        conflictsOfInterestAttested: input.conflictsOfInterestAttested,
        conflictDeclared: input.conflictDeclared,
        reason: input.reason?.trim() || null,
        contentDigest: revision.contentDigest,
        sourceDigest: revision.sourceDigest,
      })
    } catch (error) {
      if (uniqueViolation(error, 'page_statement_reviews_reviewer_unique')) {
        throw new PageStatementError(
          409,
          'You have already recorded a decision on this wording.',
          'already_reviewed',
        )
      }
      if (uniqueViolation(error, 'page_statement_reviews_identity_unique')) {
        throw new PageStatementError(
          409,
          'Another account with the same researcher identifier has already decided this wording.',
          'duplicate_identity',
        )
      }
      throw error
    }

    const stateRows = await tx
      .select()
      .from(pageStatementReviewStates)
      .where(eq(pageStatementReviewStates.revisionId, revision.id))
      .limit(1)
      .for('update')
    const state = stateRows[0]
    if (!state) throw new PageStatementError(500, 'The review state is missing.', 'state_missing')

    if (state.status === 'changes_requested' || state.status === 'rejected') {
      await tx
        .update(pageStatementRevisions)
        .set({
          status: state.status === 'rejected' ? 'rejected' : 'changes_requested',
          statusReason: input.reason?.trim() ?? null,
        })
        .where(eq(pageStatementRevisions.id, revision.id))
      return
    }

    if (state.status !== 'approved') return

    /*
     * The third approval. Everything is re-checked against rows this transaction holds, because the
     * record may have moved between the first approval and this one, and three approvals for a
     * wording judged against a record that no longer exists are three approvals for nothing.
     */
    const currentSourceDigest = pageStatementSourceDigest(context.record, revision.statementKey)
    const results = runPageStatementGates({
      statementKey: revision.statementKey,
      currentText: revision.currentText,
      proposedText: revision.proposedText,
      changeCategory: revision.changeCategory,
      riskClass: revision.riskClass,
      evidenceState: revision.evidenceState,
      sources: revision.sources as PageStatementSourceRef[],
      evidencePacket: revision.evidencePacket as Record<string, string>,
      identityWarning: context.identityWarning,
      sourceDigestCurrent: currentSourceDigest === revision.sourceDigest,
      medicineName: context.record?.name ?? '',
      medicineAliases: context.medicineAliases,
    })

    if (!gatesPassed(results)) {
      blockedBy = results.filter((result) => !result.passed && result.severity === 'blocking')
      const staleSource = blockedBy.some((gate) => gate.code === 'stale_source_surface')
      await tx
        .update(pageStatementRevisions)
        .set({
          status: staleSource ? 'stale_source' : 'safety_hold',
          statusReason: blockedBy.map((gate) => gate.title).join('; '),
          gateResults: results as unknown as Array<Record<string, unknown>>,
        })
        .where(eq(pageStatementRevisions.id, revision.id))
      await tx.insert(pageStatementModerationEvents).values({
        id: newId('psm'),
        revisionId: revision.id,
        action: staleSource ? 'SAFETY_HOLD' : 'SAFETY_HOLD',
        actorUserId: null,
        detail: blockedBy.map((gate) => `${gate.code}: ${gate.detail}`).join(' | '),
      })
      return
    }

    const previousRows = await tx
      .select({ revisionId: pageStatementPublications.revisionId })
      .from(pageStatementPublications)
      .where(
        and(
          eq(pageStatementPublications.medicineId, revision.medicineId),
          eq(pageStatementPublications.statementKey, revision.statementKey),
        ),
      )
      .limit(1)
      .for('update')
    const previousRevisionId = previousRows[0]?.revisionId ?? null

    if (previousRevisionId) {
      await tx
        .update(pageStatementRevisions)
        .set({ status: 'superseded', supersededAt: new Date() })
        .where(eq(pageStatementRevisions.id, previousRevisionId))
    }

    await tx
      .update(pageStatementRevisions)
      .set({
        status: 'published',
        publishedAt: new Date(),
        gateResults: results as unknown as Array<Record<string, unknown>>,
      })
      .where(eq(pageStatementRevisions.id, revision.id))

    await tx
      .insert(pageStatementPublications)
      .values({
        medicineId: revision.medicineId,
        statementKey: revision.statementKey,
        revisionId: revision.id,
      })
      .onConflictDoUpdate({
        target: [pageStatementPublications.medicineId, pageStatementPublications.statementKey],
        set: { revisionId: revision.id },
      })

    publicationEventId = newId('pse')
    await tx.insert(pageStatementPublicationEvents).values({
      id: publicationEventId,
      medicineId: revision.medicineId,
      slug: revision.slug,
      statementKey: revision.statementKey,
      event: 'publish',
      revisionId: revision.id,
      previousRevisionId,
      approvalsRecorded: state.reviewCount,
      qualifiedApprovals: state.qualifiedApprovals,
      automatedChecks: results as unknown as Array<Record<string, unknown>>,
      cacheInvalidation: { paths: [`/d/${revision.slug}`, '/review-queue'], state: 'requested' },
      contentDigest: revision.contentDigest,
      actorUserId: null,
      reason: null,
    })
    published = true
  })

  const proposal = await getPageStatementProposal(input.revisionId)
  if (!proposal) throw new PageStatementError(404, 'That proposal no longer exists.', 'not_found')
  return { proposal, published, publicationEventId, failedGates: blockedBy }
}

/** Take a decision back before the wording is published. The decision stays in the audit. */
export async function withdrawPageStatementReview(
  reviewer: ReviewActor,
  revisionId: string,
  reason: string,
): Promise<PageStatementProposalView> {
  const updated = await db
    .update(pageStatementReviews)
    .set({ withdrawnAt: new Date(), withdrawnReason: reason.trim() })
    .where(
      and(
        eq(pageStatementReviews.revisionId, revisionId),
        eq(pageStatementReviews.reviewerUserId, reviewer.id),
        sql`${pageStatementReviews.withdrawnAt} is null`,
      ),
    )
    .returning({ id: pageStatementReviews.id })
  if (updated.length === 0) {
    throw new PageStatementError(404, 'You have no decision to withdraw here.', 'not_found')
  }
  const proposal = await getPageStatementProposal(revisionId)
  if (!proposal) throw new PageStatementError(404, 'That proposal no longer exists.', 'not_found')
  return proposal
}

export async function withdrawPageStatementProposal(
  author: ReviewActor,
  revisionId: string,
): Promise<PageStatementProposalView> {
  const rows = await db
    .update(pageStatementRevisions)
    .set({ status: 'withdrawn', statusReason: 'Withdrawn by the author.' })
    .where(
      and(
        eq(pageStatementRevisions.id, revisionId),
        eq(pageStatementRevisions.authorUserId, author.id),
        inArray(pageStatementRevisions.status, [...OPEN_PROPOSAL_STATUSES, 'changes_requested']),
      ),
    )
    .returning({ id: pageStatementRevisions.id })
  if (rows.length === 0) {
    throw new PageStatementError(
      409,
      'This proposal is not yours to withdraw, or it is already closed.',
      'not_withdrawable',
    )
  }
  const proposal = await getPageStatementProposal(revisionId)
  if (!proposal) throw new PageStatementError(404, 'That proposal no longer exists.', 'not_found')
  return proposal
}

/**
 * Return a sentence to the wording it had before. A rollback is a new event on the same ledger, and
 * the wording it rolls back stays readable in the history rather than disappearing.
 */
export async function rollbackPageStatement(
  actor: ReviewActor,
  medicineId: string,
  statementKey: PageStatementKey,
  reason: string,
): Promise<{ restoredRevisionId: string | null; eventId: string }> {
  if (!mayAdministerPageStatements(actor)) {
    throw new PageStatementError(
      403,
      'Rolling back a published wording needs a steward or an administrator.',
      'not_authorized',
    )
  }
  const eventId = newId('pse')
  let restoredRevisionId: string | null = null

  await db.transaction(async (tx) => {
    await tx.execute(
      sql`select rnawiki_lock_page_statement_subject(${medicineId}, ${statementKey}::page_statement_key)`,
    )
    const pointerRows = await tx
      .select()
      .from(pageStatementPublications)
      .where(
        and(
          eq(pageStatementPublications.medicineId, medicineId),
          eq(pageStatementPublications.statementKey, statementKey),
        ),
      )
      .limit(1)
      .for('update')
    const pointer = pointerRows[0]
    if (!pointer) {
      throw new PageStatementError(404, 'No published wording to roll back here.', 'not_found')
    }

    const currentRows = await tx
      .select()
      .from(pageStatementRevisions)
      .where(eq(pageStatementRevisions.id, pointer.revisionId))
      .limit(1)
      .for('update')
    const current = currentRows[0]
    if (!current) throw new PageStatementError(404, 'That revision is missing.', 'not_found')

    const baselineId = current.baselineRevisionId
    await tx
      .update(pageStatementRevisions)
      .set({ status: 'superseded', supersededAt: new Date(), statusReason: reason.trim() })
      .where(eq(pageStatementRevisions.id, current.id))

    if (baselineId) {
      await tx
        .update(pageStatementRevisions)
        .set({ status: 'published', publishedAt: new Date(), supersededAt: null })
        .where(eq(pageStatementRevisions.id, baselineId))
      await tx
        .update(pageStatementPublications)
        .set({ revisionId: baselineId })
        .where(
          and(
            eq(pageStatementPublications.medicineId, medicineId),
            eq(pageStatementPublications.statementKey, statementKey),
          ),
        )
      restoredRevisionId = baselineId
    } else {
      // No earlier community wording: the sentence returns to what the record itself says.
      await tx
        .delete(pageStatementPublications)
        .where(
          and(
            eq(pageStatementPublications.medicineId, medicineId),
            eq(pageStatementPublications.statementKey, statementKey),
          ),
        )
    }

    await tx.insert(pageStatementPublicationEvents).values({
      id: eventId,
      medicineId,
      slug: current.slug,
      statementKey,
      event: 'rollback',
      revisionId: current.id,
      previousRevisionId: baselineId,
      approvalsRecorded: 0,
      qualifiedApprovals: 0,
      automatedChecks: [],
      cacheInvalidation: { paths: [`/d/${current.slug}`, '/review-queue'], state: 'requested' },
      contentDigest: current.contentDigest,
      actorUserId: actor.id,
      reason: reason.trim(),
    })
  })

  return { restoredRevisionId, eventId }
}

/** Public history of pointer movements for one medicine, with nothing private in it. */
export interface PublicPublicationEvent {
  id: string
  statementKey: PageStatementKey
  event: string
  approvals: number
  qualifiedApprovals: number
  reason: string | null
  createdAt: string
  bySystem: boolean
}

export async function listPageStatementPublicationEvents(
  medicineId: string,
  limit = 20,
): Promise<PublicPublicationEvent[]> {
  const rows = await db
    .select({
      id: pageStatementPublicationEvents.id,
      statementKey: pageStatementPublicationEvents.statementKey,
      event: pageStatementPublicationEvents.event,
      approvals: pageStatementPublicationEvents.approvalsRecorded,
      qualifiedApprovals: pageStatementPublicationEvents.qualifiedApprovals,
      reason: pageStatementPublicationEvents.reason,
      createdAt: pageStatementPublicationEvents.createdAt,
      actorUserId: pageStatementPublicationEvents.actorUserId,
    })
    .from(pageStatementPublicationEvents)
    .where(eq(pageStatementPublicationEvents.medicineId, medicineId))
    .orderBy(desc(pageStatementPublicationEvents.createdAt))
    .limit(limit)
  return rows.map((row) => ({
    id: row.id,
    statementKey: row.statementKey,
    event: row.event,
    approvals: row.approvals,
    qualifiedApprovals: row.qualifiedApprovals,
    reason: row.reason,
    createdAt: row.createdAt.toISOString().slice(0, 10),
    bySystem: row.actorUserId === null,
  }))
}

import { createHash } from 'node:crypto'

import { eq, sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { closeDatabasePool, db } from '@/db'
import {
  dossierCompletionAssessments,
  dossierCompletionReviewDecisions,
  drugs,
  inventoryResolutions,
  users,
} from '@/db/schema'
import {
  DOSSIER_COMPLETION_RESOLVER_VERSION,
  type SectionAssessment,
} from '@/lib/dossier-completion/types'
import { INVENTORY_RESOLVER_VERSION } from '@/lib/inventory/types'
import {
  CompletionReviewError,
  completionReviewDecisionId,
  countCompletionReviewQueues,
  listCompletionReviewDecisions,
  listCompletionReviewQueue,
  recordCompletionReviewDecision,
} from '@/lib/queries/completion-review'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'
const RUN = Math.random().toString(36).slice(2, 10)

function digest(label: string): string {
  return createHash('sha256').update(`${RUN}:${label}`).digest('hex')
}

const drugId = `drg_completion_${RUN}`
const drugSlug = `completion-review-${RUN}`
const otherSlug = `completion-review-${RUN}-second`
const stewardId = `usr_completion_${RUN}_steward`
const trustedId = `usr_completion_${RUN}_trusted`
const assessmentDigest = digest('assessment-input')
const staleDigest = digest('earlier-assessment-input')

const sections: SectionAssessment[] = [
  {
    sectionId: 'identity',
    state: 'EXACT_STRUCTURED_SOURCE_DATA',
    basisKind: 'LEGACY_RECORD_FIELD',
    basis: 'The recorded name and one registry identifier are stored on the record.',
    sourceRefs: [{ kind: 'UNII', identifier: `UNII-${RUN}` }],
    humanReadSuggested: true,
  },
  {
    sectionId: 'trial-registry',
    state: 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
    basisKind: 'CLINICALTRIALS_SNAPSHOT_NO_EXACT_MATCH',
    basis: 'The dated registry snapshot held no exact intervention-name match.',
    sourceRefs: [{ kind: 'CLINICALTRIALS_SNAPSHOT', identifier: `snapshot-${RUN}` }],
    counts: { exactMatches: 0 },
  },
  {
    sectionId: 'literature-search',
    state: 'SEARCH_PENDING',
    basisKind: 'NOT_YET_RUN',
    basis: 'The literature search for this record has not been run yet.',
    sourceRefs: [],
    blockedReason: 'Run the dated literature search for this record.',
  },
]

async function createAccount(input: {
  id: string
  label: string
  trustTier: 'trusted' | 'steward'
}) {
  await db.insert(users).values({
    id: input.id,
    name: `Completion ${input.label}`,
    handle: `completion-${RUN}-${input.label}`,
    email: `${RUN}-${input.label}@completion.test`,
    passwordHash: 'unused-completion-review-integration-hash',
    trustTier: input.trustTier,
    isAdmin: false,
  })
}

/** Drizzle wraps a database failure, so the trigger's own message lives on the cause. */
async function failureMessage(promise: Promise<unknown>): Promise<string> {
  try {
    await promise
  } catch (error) {
    const cause = (error as { cause?: { message?: string } }).cause
    return `${cause?.message ?? ''} ${(error as Error).message}`
  }
  return 'the statement was accepted'
}

describe.skipIf(!runsInDisposableDatabase)('completion and identity review queue', () => {
  beforeAll(async () => {
    await Promise.all([
      createAccount({ id: stewardId, label: 'steward', trustTier: 'steward' }),
      createAccount({ id: trustedId, label: 'trusted', trustTier: 'trusted' }),
    ])
    await db.insert(drugs).values({
      id: drugId,
      slug: drugSlug,
      name: `Completion review medicine ${RUN}`,
      sponsor: 'Unchanged test sponsor',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 'Unchanged test indication',
    })
    await db.insert(inventoryResolutions).values({
      drugId,
      resolverVersion: INVENTORY_RESOLVER_VERSION,
      resolutionStatus: 'CANONICAL_ENTITY',
      entityClass: 'APPROVED_MEDICINE',
      entityClassRule: 'rule-1: approved status with a small-molecule modality',
      canonicalDrugId: drugId,
      canonicalSlug: drugSlug,
      redirectTargetSlug: null,
      identityConfidence: 'REGISTRY_IDENTIFIER_RECORDED',
      identitySources: [{ kind: 'UNII', identifier: `UNII-${RUN}`, path: 'recordedBackground' }],
      attributionWarnings: [
        {
          code: 'SHARED_REGISTRY_IDENTIFIER',
          detail: 'One other record carries the same recorded registry identifier.',
          relatedSlugs: [otherSlug],
        },
      ],
      resolutionEvidence: ['One registry identifier is recorded on the record itself.'],
      contentDigest: digest('resolution'),
    })
    await db.insert(dossierCompletionAssessments).values({
      drugId,
      resolverVersion: DOSSIER_COMPLETION_RESOLVER_VERSION,
      status: 'INCOMPLETE',
      inputDigest: assessmentDigest,
      sections,
      applicableSectionCount: sections.length,
      terminalSectionCount: 2,
      nonTerminalSectionIds: ['literature-search'],
      humanReadSuggestedSectionIds: ['identity'],
    })
  })

  afterAll(async () => {
    // No rows are removed here on purpose. `dossier_completion_review_decisions` is append-only in
    // the database: DELETE raises, and a cascade from `drugs` would raise with it. The disposable
    // database this suite requires is dropped by `scripts/with-disposable-database.ts`.
    await closeDatabasePool()
  })

  it('lists the record in the open-section queue with its blocked reason', async () => {
    const page = await listCompletionReviewQueue({ kind: 'incomplete', limit: 100 })
    const item = page.items.find((candidate) => candidate.drugId === drugId)
    expect(item).toBeDefined()
    expect(item?.slug).toBe(drugSlug)
    expect(item?.entityClassLabel).toBe('Approved medicine')
    expect(item?.resolutionStatusLabel).toBe('Its own record')
    expect(item?.assessmentInputDigest).toBe(assessmentDigest)
    expect(item?.openSections.map((section) => section.id)).toEqual(['literature-search'])
    expect(item?.openSections[0]?.blockedReason).toBe(
      'Run the dated literature search for this record.',
    )
    expect(item?.terminalSectionCount).toBe(2)
    expect(item?.applicableSectionCount).toBe(3)
  })

  it('lists the record in the suggested-source-read queue', async () => {
    const page = await listCompletionReviewQueue({ kind: 'human-read', limit: 100 })
    const item = page.items.find((candidate) => candidate.drugId === drugId)
    expect(item?.humanReadSections.map((section) => section.id)).toEqual(['identity'])
  })

  it('lists the record in the identity queue with the stored warning code', async () => {
    const page = await listCompletionReviewQueue({ kind: 'identity', limit: 100 })
    const item = page.items.find((candidate) => candidate.drugId === drugId)
    expect(item?.attributionWarnings.map((warning) => warning.code)).toEqual([
      'SHARED_REGISTRY_IDENTIFIER',
    ])
    // A private steward surface may name the other record; a public projection never does.
    expect(item?.attributionWarnings[0]?.relatedSlugs).toEqual([otherSlug])
  })

  it('counts each queue', async () => {
    const counts = await countCompletionReviewQueues()
    expect(counts.incomplete).toBeGreaterThan(0)
    expect(counts.humanRead).toBeGreaterThan(0)
    expect(counts.identity).toBeGreaterThan(0)
  })

  it('bounds the page size at one hundred records', async () => {
    const page = await listCompletionReviewQueue({ kind: 'incomplete', limit: 5000 })
    expect(page.limit).toBe(100)
  })

  it('refuses a decision from an account that is not a steward or administrator', async () => {
    await expect(
      recordCompletionReviewDecision({
        drugId,
        sectionId: 'literature-search',
        decision: 'ACKNOWLEDGED',
        explanation: 'Trusted editors do not work this queue.',
        assessmentInputDigest: assessmentDigest,
        reviewerUserId: trustedId,
      }),
    ).rejects.toMatchObject({ code: 'not_authorized' })
  })

  it('refuses a decision that answers an assessment digest that is no longer stored', async () => {
    await expect(
      recordCompletionReviewDecision({
        drugId,
        sectionId: 'literature-search',
        decision: 'ACKNOWLEDGED',
        explanation: 'This answers an earlier assessment.',
        assessmentInputDigest: staleDigest,
        reviewerUserId: stewardId,
      }),
    ).rejects.toMatchObject({ code: 'stale_assessment' })
  })

  it('refuses a decision against a section the record does not carry', async () => {
    await expect(
      recordCompletionReviewDecision({
        drugId,
        sectionId: 'supplement-market',
        decision: 'ACKNOWLEDGED',
        explanation: 'This section does not apply to the record.',
        assessmentInputDigest: assessmentDigest,
        reviewerUserId: stewardId,
      }),
    ).rejects.toMatchObject({ code: 'section_not_assessed' })
  })

  it('records a decision bound to the current assessment and changes nothing else', async () => {
    const before = await db
      .select()
      .from(dossierCompletionAssessments)
      .where(eq(dossierCompletionAssessments.drugId, drugId))

    const recorded = await recordCompletionReviewDecision({
      drugId,
      sectionId: 'literature-search',
      decision: 'CORRECTION_PROPOSED',
      explanation: 'Opened a contribution to run the dated literature search for this record.',
      assessmentInputDigest: assessmentDigest,
      reviewerUserId: stewardId,
    })

    expect(recorded.id).toMatch(/^[0-9a-f]{64}$/u)
    expect(recorded.decision).toBe('CORRECTION_PROPOSED')
    expect(recorded.decisionLabel).toBe('Correction opened elsewhere')
    expect(recorded.sectionLabel).toBe('Published clinical-trial reports')
    expect(recorded.appliesToCurrentAssessment).toBe(true)
    expect(recorded.reviewerUserId).toBe(stewardId)

    const after = await db
      .select()
      .from(dossierCompletionAssessments)
      .where(eq(dossierCompletionAssessments.drugId, drugId))
    expect(after).toEqual(before)

    const listed = await listCompletionReviewDecisions(drugId)
    expect(listed.map((decision) => decision.id)).toContain(recorded.id)

    const page = await listCompletionReviewQueue({ kind: 'incomplete', limit: 100 })
    const item = page.items.find((candidate) => candidate.drugId === drugId)
    expect(item?.recentDecisions.map((decision) => decision.id)).toContain(recorded.id)
  })

  it('derives the decision id from the exact note it records', async () => {
    const rows = await db
      .select()
      .from(dossierCompletionReviewDecisions)
      .where(eq(dossierCompletionReviewDecisions.drugId, drugId))
      .limit(1)
    const row = rows[0]
    expect(row).toBeDefined()
    expect(
      completionReviewDecisionId({
        drugId: row!.drugId,
        sectionId: row!.sectionId,
        reviewerUserId: row!.reviewerUserId,
        assessmentInputDigest: row!.assessmentInputDigest,
        explanation: row!.explanation,
        createdAt: row!.createdAt,
      }),
    ).toBe(row!.id)
  })

  it('keeps the decision table append-only in the database itself', async () => {
    const rows = await db
      .select({ id: dossierCompletionReviewDecisions.id })
      .from(dossierCompletionReviewDecisions)
      .where(eq(dossierCompletionReviewDecisions.drugId, drugId))
      .limit(1)
    const id = rows[0]?.id
    expect(id).toBeTruthy()

    await expect(
      failureMessage(
        db.execute(
          sql`update dossier_completion_review_decisions set explanation = 'rewritten' where id = ${id}`,
        ),
      ),
    ).resolves.toMatch(/append-only/u)

    await expect(
      failureMessage(
        db.execute(sql`delete from dossier_completion_review_decisions where id = ${id}`),
      ),
    ).resolves.toMatch(/append-only/u)

    const still = await db
      .select({ id: dossierCompletionReviewDecisions.id })
      .from(dossierCompletionReviewDecisions)
      .where(eq(dossierCompletionReviewDecisions.id, id!))
    expect(still).toHaveLength(1)
  })

  it('rejects a decision for a record with no stored assessment', async () => {
    await expect(
      recordCompletionReviewDecision({
        drugId: `${drugId}-absent`,
        sectionId: 'identity',
        decision: 'ACKNOWLEDGED',
        explanation: 'There is no assessment for this record.',
        assessmentInputDigest: assessmentDigest,
        reviewerUserId: stewardId,
      }),
    ).rejects.toBeInstanceOf(CompletionReviewError)
  })
})

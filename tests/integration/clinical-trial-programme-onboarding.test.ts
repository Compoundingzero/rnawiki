import { randomUUID } from 'node:crypto'

import { and, eq, inArray } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'

import { db, type Db } from '@/db'
import {
  claims,
  developmentProgrammes,
  drugs,
  evidenceNodes,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionSourceTaskResolutions,
  programmeCurrentPublications,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictRevisions,
  sourceSnapshots,
  users,
} from '@/db/schema'
import { ClinicalTrialsGovAdapter } from '@/lib/evidence/adapters/clinical-trials-gov'
import { onboardClinicalTrialProgramme } from '@/lib/evidence/clinical-trial-programme-onboarding'
import { DrizzleClinicalTrialProgrammeOnboardingStore } from '@/lib/evidence/clinical-trial-programme-onboarding-drizzle'
import { monitorClinicalTrialsSource } from '@/lib/evidence/source-monitor-drizzle'
import {
  createContributionDraft,
  submitContributionProposal,
} from '@/lib/queries/programme-contributions'
import { submitContributionReview } from '@/lib/queries/programme-contribution-reviews'
import { materializeAcceptedContributionCandidate } from '@/lib/queries/programme-contribution-implementation'
import type { ContributionReviewDecisionInput } from '@/lib/contributions/review-validation'

class TestRollback extends Error {}

function registryResponse(
  overrides: {
    status?: string
    enrollment?: number
    briefTitle?: string
    hasResults?: boolean
    nctId?: string
    medicineName?: string
  } = {},
): Response {
  return new Response(
    JSON.stringify({
      hasResults: overrides.hasResults ?? false,
      protocolSection: {
        identificationModule: {
          nctId: overrides.nctId ?? 'NCT87654321',
          briefTitle: overrides.briefTitle ?? 'Database integration study for Registry Medicine',
        },
        statusModule: {
          overallStatus: overrides.status ?? 'RECRUITING',
          startDateStruct: { date: '2026-01-02' },
          primaryCompletionDateStruct: { date: '2027-02' },
          completionDateStruct: { date: '2027-03-04' },
        },
        sponsorCollaboratorsModule: {
          leadSponsor: { name: 'Registered Integration Sponsor', class: 'INDUSTRY' },
        },
        conditionsModule: { conditions: ['Registered condition'] },
        designModule: {
          phases: ['PHASE2'],
          enrollmentInfo: { count: overrides.enrollment ?? 48, type: 'ESTIMATED' },
        },
        armsInterventionsModule: {
          interventions: [{ type: 'DRUG', name: overrides.medicineName ?? 'Registry Medicine' }],
        },
      },
    }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )
}

describe('ClinicalTrials.gov programme onboarding persistence', () => {
  it('dry-runs without writes, commits atomically, and repeats without duplicate rows', async () => {
    const key = randomUUID().replaceAll('-', '').slice(0, 10)
    const drugId = `ct-onboard-drug-${key}`
    const medicineSlug = `ct-onboard-medicine-${key}`
    const observedAt = new Date('2026-08-23T01:00:00.000Z')
    let completed = false

    try {
      await db.transaction(async (outerTransaction) => {
        await outerTransaction.insert(drugs).values({
          id: drugId,
          slug: medicineSlug,
          name: 'Registry Medicine',
          modality: 'Small Molecule',
          approvalStatus: 'Phase 2 Investigational',
        })
        const store = new DrizzleClinicalTrialProgrammeOnboardingStore(
          outerTransaction as unknown as Db,
        )
        const makeAdapter = () =>
          new ClinicalTrialsGovAdapter(
            async () => registryResponse(),
            () => observedAt,
          )

        const dryRun = await onboardClinicalTrialProgramme({
          medicineSlug,
          nctId: 'NCT87654321',
          adapter: makeAdapter(),
          store,
        })
        expect(dryRun).toMatchObject({
          mode: 'DRY_RUN',
          outcome: 'WOULD_CREATE',
          writes: { source: true, snapshot: true, programme: true, trial: true, freshness: true },
        })
        expect(
          await outerTransaction
            .select({ id: developmentProgrammes.id })
            .from(developmentProgrammes)
            .where(eq(developmentProgrammes.drugId, drugId)),
        ).toEqual([])

        const created = await onboardClinicalTrialProgramme({
          medicineSlug,
          nctId: 'NCT87654321',
          commit: true,
          adapter: makeAdapter(),
          store,
        })
        expect(created).toMatchObject({
          mode: 'COMMIT',
          outcome: 'CREATED',
          registry: {
            nctId: 'NCT87654321',
            overallStatus: 'RECRUITING',
            enrollmentCount: 48,
            hasResults: false,
          },
        })

        const repeated = await onboardClinicalTrialProgramme({
          medicineSlug,
          nctId: 'NCT87654321',
          commit: true,
          adapter: makeAdapter(),
          store,
        })
        expect(repeated).toMatchObject({
          outcome: 'ALREADY_ONBOARDED',
          records: created.records,
          writes: {
            source: false,
            snapshot: false,
            programme: false,
            trial: false,
            freshness: false,
          },
        })

        expect(
          await outerTransaction
            .select()
            .from(developmentProgrammes)
            .where(eq(developmentProgrammes.id, created.records.programmeId)),
        ).toEqual([
          expect.objectContaining({
            drugId,
            slug: 'nct87654321',
            indication: 'Registered condition',
            status: 'RECRUITING',
            highestPhaseReached: 'Phase 2',
            updateStatus: 'CURRENT',
          }),
        ])
        expect(
          await outerTransaction
            .select()
            .from(programmeTrials)
            .where(eq(programmeTrials.id, created.records.trialId)),
        ).toEqual([
          expect.objectContaining({
            trialIdentifier: 'NCT87654321',
            status: 'RECRUITING',
            resultsStatus: 'NOT_POSTED',
            enrolment: 48,
            enrolmentType: 'ESTIMATED',
            startDate: '2026-01-02',
            primaryCompletionDate: null,
            completionDate: '2027-03-04',
            registrySourceId: created.records.sourceId,
            registrySnapshotId: created.records.snapshotId,
          }),
        ])
        expect(
          await outerTransaction
            .select()
            .from(programmeFreshnessStates)
            .where(
              and(
                eq(programmeFreshnessStates.programmeId, created.records.programmeId),
                eq(programmeFreshnessStates.sourceId, created.records.sourceId),
              ),
            ),
        ).toEqual([
          expect.objectContaining({
            currentSnapshotId: created.records.snapshotId,
            pendingSnapshotId: null,
            checkStatus: 'SUCCEEDED',
            freshnessStatus: 'CURRENT',
            nextCheckDueAt: new Date('2026-08-24T01:00:00.000Z'),
          }),
        ])
        expect(
          await outerTransaction
            .select({ id: evidenceSources.id })
            .from(evidenceSources)
            .where(eq(evidenceSources.id, created.records.sourceId)),
        ).toHaveLength(1)
        expect(
          await outerTransaction
            .select({ id: sourceSnapshots.id })
            .from(sourceSnapshots)
            .where(eq(sourceSnapshots.id, created.records.snapshotId)),
        ).toHaveLength(1)
        expect(
          await outerTransaction
            .select({ id: claims.id })
            .from(claims)
            .where(eq(claims.programmeId, created.records.programmeId)),
        ).toEqual([])
        expect(
          await outerTransaction
            .select({ id: evidenceNodes.id })
            .from(evidenceNodes)
            .where(eq(evidenceNodes.programmeId, created.records.programmeId)),
        ).toEqual([])
        expect(
          await outerTransaction
            .select({ id: programmeVerdictRevisions.id })
            .from(programmeVerdictRevisions)
            .where(eq(programmeVerdictRevisions.programmeId, created.records.programmeId)),
        ).toEqual([])

        completed = true
        throw new TestRollback()
      })
    } catch (error) {
      if (!(error instanceof TestRollback)) throw error
    }

    expect(completed).toBe(true)
    expect(await db.select({ id: drugs.id }).from(drugs).where(eq(drugs.id, drugId))).toEqual([])
  })

  it('refuses to attach to an existing programme and leaves its published data untouched', async () => {
    const key = randomUUID().replaceAll('-', '').slice(0, 10)
    const drugId = `ct-collision-drug-${key}`
    const medicineSlug = `ct-collision-medicine-${key}`
    const claimId = `ct-collision-claim-${key}`
    const observedAt = new Date('2026-08-23T01:00:00.000Z')
    let completed = false

    try {
      await db.transaction(async (outerTransaction) => {
        await outerTransaction.insert(drugs).values({
          id: drugId,
          slug: medicineSlug,
          name: 'Registry Medicine',
          modality: 'Small Molecule',
          approvalStatus: 'Phase 2 Investigational',
        })
        const store = new DrizzleClinicalTrialProgrammeOnboardingStore(
          outerTransaction as unknown as Db,
        )
        const makeAdapter = () =>
          new ClinicalTrialsGovAdapter(
            async () => registryResponse(),
            () => observedAt,
          )
        const preview = await onboardClinicalTrialProgramme({
          medicineSlug,
          nctId: 'NCT87654321',
          adapter: makeAdapter(),
          store,
        })

        await outerTransaction.insert(developmentProgrammes).values({
          id: preview.records.programmeId,
          drugId,
          slug: preview.records.programmeSlug,
          title: 'Existing reviewed programme title',
          indication: 'Existing reviewed scope',
          status: 'ACTIVE',
        })
        await outerTransaction.insert(claims).values({
          id: claimId,
          programmeId: preview.records.programmeId,
          claimKey: `collision.${key}`,
          revisionNumber: 1,
          nature: 'RNAWIKI_JUDGEMENT',
          reviewStatus: 'PUBLISHED',
          plainLanguageText: 'Existing published statement that onboarding must not change.',
          publishedAt: observedAt,
        })

        await expect(
          onboardClinicalTrialProgramme({
            medicineSlug,
            nctId: 'NCT87654321',
            commit: true,
            adapter: makeAdapter(),
            store,
          }),
        ).rejects.toMatchObject({ code: 'PERSISTENCE_CONFLICT' })

        expect(
          await outerTransaction
            .select({
              title: developmentProgrammes.title,
              indication: developmentProgrammes.indication,
            })
            .from(developmentProgrammes)
            .where(eq(developmentProgrammes.id, preview.records.programmeId)),
        ).toEqual([
          { title: 'Existing reviewed programme title', indication: 'Existing reviewed scope' },
        ])
        expect(await outerTransaction.select().from(claims).where(eq(claims.id, claimId))).toEqual([
          expect.objectContaining({
            reviewStatus: 'PUBLISHED',
            plainLanguageText: 'Existing published statement that onboarding must not change.',
          }),
        ])
        expect(
          await outerTransaction
            .select({ id: evidenceSources.id })
            .from(evidenceSources)
            .where(eq(evidenceSources.externalIdentifier, 'NCT87654321')),
        ).toEqual([])

        completed = true
        throw new TestRollback()
      })
    } catch (error) {
      if (!(error instanceof TestRollback)) throw error
    }

    expect(completed).toBe(true)
  })

  it('atomically advances exact trial cache fields only for an unpublished empty programme', async () => {
    const key = randomUUID().replaceAll('-', '').slice(0, 10)
    const drugId = `ct-advance-drug-${key}`
    const medicineSlug = `ct-advance-medicine-${key}`
    const baselineAt = new Date('2026-08-23T01:00:00.000Z')
    const changedAt = new Date('2026-08-24T01:00:00.000Z')
    let completed = false

    try {
      await db.transaction(async (outerTransaction) => {
        await outerTransaction.insert(drugs).values({
          id: drugId,
          slug: medicineSlug,
          name: 'Registry Medicine',
          modality: 'Small Molecule',
          approvalStatus: 'Phase 2 Investigational',
        })
        const database = outerTransaction as unknown as Db
        const store = new DrizzleClinicalTrialProgrammeOnboardingStore(database)
        const created = await onboardClinicalTrialProgramme({
          medicineSlug,
          nctId: 'NCT87654321',
          commit: true,
          adapter: new ClinicalTrialsGovAdapter(
            async () => registryResponse(),
            () => baselineAt,
          ),
          store,
        })

        const monitored = await monitorClinicalTrialsSource({
          database,
          adapter: new ClinicalTrialsGovAdapter(
            async () => registryResponse({ status: 'ACTIVE_NOT_RECRUITING', enrollment: 52 }),
            () => changedAt,
          ),
          programmeId: created.records.programmeId,
          sourceId: created.records.sourceId,
          idempotencyKey: `cache-advance-${key}`,
          now: () => changedAt,
        })

        expect(monitored).toMatchObject({
          status: 'SUCCEEDED',
          changedFieldCount: 2,
          highestImpact: 'LOW_RISK_EXACT_DATA',
          currentSnapshotId: monitored.snapshotId,
          pendingSnapshotId: null,
          reviewTaskIds: [],
        })
        expect(monitored.snapshotId).not.toBe(created.records.snapshotId)
        expect(
          await outerTransaction
            .select()
            .from(programmeTrials)
            .where(eq(programmeTrials.id, created.records.trialId)),
        ).toEqual([
          expect.objectContaining({
            status: 'ACTIVE_NOT_RECRUITING',
            enrolment: 52,
            registrySnapshotId: monitored.snapshotId,
            lastVerifiedAt: changedAt,
          }),
        ])
        expect(
          await outerTransaction
            .select()
            .from(developmentProgrammes)
            .where(eq(developmentProgrammes.id, created.records.programmeId)),
        ).toEqual([
          expect.objectContaining({
            status: 'ACTIVE',
            updateStatus: 'CURRENT',
          }),
        ])
        const snapshots = await outerTransaction
          .select({
            id: sourceSnapshots.id,
            previousSnapshotId: sourceSnapshots.previousSnapshotId,
          })
          .from(sourceSnapshots)
          .where(eq(sourceSnapshots.sourceId, created.records.sourceId))
        expect(snapshots).toHaveLength(2)
        expect(snapshots).toContainEqual({
          id: monitored.snapshotId,
          previousSnapshotId: created.records.snapshotId,
        })
        expect(
          await outerTransaction
            .select({ id: evidenceReviewTasks.id })
            .from(evidenceReviewTasks)
            .where(eq(evidenceReviewTasks.programmeId, created.records.programmeId)),
        ).toEqual([])

        const mixedChangeAt = new Date('2026-08-25T01:00:00.000Z')
        const mixedChange = await monitorClinicalTrialsSource({
          database,
          adapter: new ClinicalTrialsGovAdapter(
            async () =>
              registryResponse({
                status: 'COMPLETED',
                enrollment: 53,
                briefTitle: 'A changed registry title that needs review',
              }),
            () => mixedChangeAt,
          ),
          programmeId: created.records.programmeId,
          sourceId: created.records.sourceId,
          idempotencyKey: `mixed-change-${key}`,
          now: () => mixedChangeAt,
        })
        expect(mixedChange).toMatchObject({
          highestImpact: 'INTERPRETIVE_REVIEW_REQUIRED',
          currentSnapshotId: monitored.snapshotId,
          pendingSnapshotId: mixedChange.snapshotId,
        })
        expect(mixedChange.reviewTaskIds).toHaveLength(1)
        expect(
          await outerTransaction
            .select()
            .from(programmeTrials)
            .where(eq(programmeTrials.id, created.records.trialId)),
        ).toEqual([
          expect.objectContaining({
            status: 'ACTIVE_NOT_RECRUITING',
            enrolment: 52,
            registrySnapshotId: monitored.snapshotId,
          }),
        ])
        expect(
          await outerTransaction
            .select({ reason: evidenceReviewTasks.reason })
            .from(evidenceReviewTasks)
            .where(eq(evidenceReviewTasks.id, mixedChange.reviewTaskIds[0]!)),
        ).toEqual([
          expect.objectContaining({
            reason: expect.stringContaining('other registry content changed'),
          }),
        ])

        completed = true
        throw new TestRollback()
      })
    } catch (error) {
      if (!(error instanceof TestRollback)) throw error
    }
    expect(completed).toBe(true)
  })

  it('keeps a changed snapshot pending when reviewed programme data would be affected', async () => {
    const key = randomUUID().replaceAll('-', '').slice(0, 10)
    const drugId = `ct-review-block-drug-${key}`
    const medicineSlug = `ct-review-block-medicine-${key}`
    const claimId = `ct-review-block-claim-${key}`
    const baselineAt = new Date('2026-08-23T01:00:00.000Z')
    const changedAt = new Date('2026-08-24T01:00:00.000Z')
    let completed = false

    try {
      await db.transaction(async (outerTransaction) => {
        await outerTransaction.insert(drugs).values({
          id: drugId,
          slug: medicineSlug,
          name: 'Registry Medicine',
          modality: 'Small Molecule',
          approvalStatus: 'Phase 2 Investigational',
        })
        const database = outerTransaction as unknown as Db
        const created = await onboardClinicalTrialProgramme({
          medicineSlug,
          nctId: 'NCT87654321',
          commit: true,
          adapter: new ClinicalTrialsGovAdapter(
            async () => registryResponse(),
            () => baselineAt,
          ),
          store: new DrizzleClinicalTrialProgrammeOnboardingStore(database),
        })
        await outerTransaction.insert(claims).values({
          id: claimId,
          programmeId: created.records.programmeId,
          claimKey: `reviewed.registry.${key}`,
          revisionNumber: 1,
          nature: 'RNAWIKI_JUDGEMENT',
          reviewStatus: 'PUBLISHED',
          plainLanguageText: 'A reviewed statement blocks automatic registry cache replacement.',
          publishedAt: baselineAt,
        })

        const monitored = await monitorClinicalTrialsSource({
          database,
          adapter: new ClinicalTrialsGovAdapter(
            async () => registryResponse({ status: 'ACTIVE_NOT_RECRUITING', enrollment: 52 }),
            () => changedAt,
          ),
          programmeId: created.records.programmeId,
          sourceId: created.records.sourceId,
          idempotencyKey: `cache-review-block-${key}`,
          now: () => changedAt,
        })

        expect(monitored).toMatchObject({
          status: 'SUCCEEDED',
          highestImpact: 'INTERPRETIVE_REVIEW_REQUIRED',
          currentSnapshotId: created.records.snapshotId,
          pendingSnapshotId: monitored.snapshotId,
        })
        expect(monitored.reviewTaskIds).toHaveLength(1)
        expect(monitored.affectedSurfacePaths).toContain('PROGRAMME_SUMMARY:claims')
        expect(
          await outerTransaction
            .select()
            .from(programmeTrials)
            .where(eq(programmeTrials.id, created.records.trialId)),
        ).toEqual([
          expect.objectContaining({
            status: 'RECRUITING',
            enrolment: 48,
            registrySnapshotId: created.records.snapshotId,
          }),
        ])
        expect(
          await outerTransaction
            .select()
            .from(developmentProgrammes)
            .where(eq(developmentProgrammes.id, created.records.programmeId)),
        ).toEqual([
          expect.objectContaining({
            status: 'RECRUITING',
            updateStatus: 'REVIEW_REQUIRED',
          }),
        ])
        const tasks = await outerTransaction
          .select()
          .from(evidenceReviewTasks)
          .where(eq(evidenceReviewTasks.programmeId, created.records.programmeId))
        expect(tasks).toEqual([
          expect.objectContaining({
            triggerSnapshotId: monitored.snapshotId,
            status: 'OPEN',
            reason: expect.stringContaining('saved claims'),
          }),
        ])

        const firstTaskId = monitored.reviewTaskIds[0]!
        const supersedingAt = new Date('2026-08-25T01:00:00.000Z')
        const superseding = await monitorClinicalTrialsSource({
          database,
          adapter: new ClinicalTrialsGovAdapter(
            async () => registryResponse({ status: 'COMPLETED', enrollment: 60, hasResults: true }),
            () => supersedingAt,
          ),
          programmeId: created.records.programmeId,
          sourceId: created.records.sourceId,
          idempotencyKey: `cache-review-superseding-${key}`,
          now: () => supersedingAt,
        })
        expect(superseding).toMatchObject({
          status: 'SUCCEEDED',
          currentSnapshotId: created.records.snapshotId,
          pendingSnapshotId: superseding.snapshotId,
          highestImpact: 'INTERPRETIVE_REVIEW_REQUIRED',
        })
        expect(superseding.reviewTaskIds).toHaveLength(1)
        expect(superseding.reviewTaskIds[0]).not.toBe(firstTaskId)

        const supersedingTaskId = superseding.reviewTaskIds[0]!
        const supersessionTasks = await outerTransaction
          .select()
          .from(evidenceReviewTasks)
          .where(inArray(evidenceReviewTasks.id, [firstTaskId, supersedingTaskId]))
        expect(supersessionTasks.find((task) => task.id === firstTaskId)).toMatchObject({
          status: 'DISMISSED',
          resolvedAt: supersedingAt,
          resolutionNote: expect.stringContaining(supersedingTaskId),
          resolutionVerdictRevisionId: null,
          resolutionContributionProposalId: null,
        })
        expect(supersessionTasks.find((task) => task.id === supersedingTaskId)).toMatchObject({
          status: 'OPEN',
          triggerSnapshotId: superseding.snapshotId,
          resolvedAt: null,
        })
        expect(
          await outerTransaction
            .select()
            .from(programmeFreshnessStates)
            .where(eq(programmeFreshnessStates.programmeId, created.records.programmeId)),
        ).toEqual([
          expect.objectContaining({
            currentSnapshotId: created.records.snapshotId,
            pendingSnapshotId: superseding.snapshotId,
            freshnessStatus: 'NEW_EVIDENCE',
          }),
        ])

        completed = true
        throw new TestRollback()
      })
    } catch (error) {
      if (!(error instanceof TestRollback)) throw error
    }
    expect(completed).toBe(true)
  })

  it('resolves an exact reviewed registry change for an empty unpublished programme without inventing a conclusion', async () => {
    const key = randomUUID().replaceAll('-', '').slice(0, 10)
    const numericNct = parseInt(key.slice(0, 8), 16).toString().padStart(8, '0').slice(-8)
    const nctId = `NCT${numericNct}`
    const drugId = `ct-source-review-drug-${key}`
    const medicineSlug = `ct-source-review-medicine-${key}`
    const medicineName = `Registry Bridge Medicine ${key}`
    const authorId = `ct-source-review-author-${key}`
    const reviewerAId = `ct-source-review-a-${key}`
    const reviewerBId = `ct-source-review-b-${key}`
    const stewardId = `ct-source-review-steward-${key}`
    const baselineAt = new Date('2026-08-23T01:00:00.000Z')
    const changedAt = new Date('2026-08-24T01:00:00.000Z')
    const changedTitle = `Reviewed registry title ${key}`

    await db.insert(users).values([
      {
        id: authorId,
        email: `${authorId}@example.test`,
        passwordHash: 'not-used',
        name: 'Registry correction author',
        handle: `registry-author-${key}`,
      },
      {
        id: reviewerAId,
        email: `${reviewerAId}@example.test`,
        passwordHash: 'not-used',
        name: 'Registry correction reviewer A',
        handle: `registry-reviewer-a-${key}`,
        trustTier: 'trusted',
      },
      {
        id: reviewerBId,
        email: `${reviewerBId}@example.test`,
        passwordHash: 'not-used',
        name: 'Registry correction reviewer B',
        handle: `registry-reviewer-b-${key}`,
        trustTier: 'trusted',
      },
      {
        id: stewardId,
        email: `${stewardId}@example.test`,
        passwordHash: 'not-used',
        name: 'Registry correction steward',
        handle: `registry-steward-${key}`,
        trustTier: 'steward',
      },
    ])
    await db.insert(drugs).values({
      id: drugId,
      slug: medicineSlug,
      name: medicineName,
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })

    const created = await onboardClinicalTrialProgramme({
      medicineSlug,
      nctId,
      commit: true,
      adapter: new ClinicalTrialsGovAdapter(
        async () => registryResponse({ nctId, medicineName }),
        () => baselineAt,
      ),
      store: new DrizzleClinicalTrialProgrammeOnboardingStore(db),
    })
    const monitored = await monitorClinicalTrialsSource({
      database: db,
      adapter: new ClinicalTrialsGovAdapter(
        async () =>
          registryResponse({
            nctId,
            medicineName,
            briefTitle: changedTitle,
            status: 'COMPLETED',
            enrollment: 61,
            hasResults: true,
          }),
        () => changedAt,
      ),
      programmeId: created.records.programmeId,
      sourceId: created.records.sourceId,
      idempotencyKey: `unpublished-source-review-${key}`,
      now: () => changedAt,
    })
    expect(monitored).toMatchObject({
      highestImpact: 'INTERPRETIVE_REVIEW_REQUIRED',
      currentSnapshotId: created.records.snapshotId,
      pendingSnapshotId: monitored.snapshotId,
    })
    expect(monitored.reviewTaskIds).toHaveLength(1)
    const sourceTaskId = monitored.reviewTaskIds[0]!
    const [source] = await db
      .select()
      .from(evidenceSources)
      .where(eq(evidenceSources.id, created.records.sourceId))
    expect(source).toBeDefined()

    const draft = await createContributionDraft({
      medicineSlug,
      programmeRef: created.records.programmeId,
      authorUserId: authorId,
      input: {
        proposalType: 'CORRECTION',
        selectedField: 'programme.title',
        proposedText: changedTitle,
        source: {
          type: 'CLINICAL_TRIAL_REGISTRY',
          locator: source!.canonicalLocator,
          identifier: nctId,
          reviewTaskId: sourceTaskId,
          reviewSnapshotId: monitored.snapshotId,
        },
        claimNature: 'MEASURED',
        reasoning: 'The exact pending ClinicalTrials.gov record contains the corrected title.',
        whatWasWrongOrMissing: 'The stored registry title no longer matched the monitored record.',
        affects: 'OPEN_QUESTIONS',
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })
    const submitted = await submitContributionProposal({
      proposalId: draft.proposal.id,
      authorUserId: authorId,
    })
    const approveReview = {
      decision: 'APPROVE',
      expertiseTags: ['CLINICAL_DEVELOPMENT'],
      independenceAttested: true,
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    } satisfies ContributionReviewDecisionInput
    await submitContributionReview({
      proposalId: submitted.id,
      reviewerUserId: reviewerAId,
      input: approveReview,
    })
    const awaitingThird = await submitContributionReview({
      proposalId: submitted.id,
      reviewerUserId: reviewerBId,
      input: approveReview,
    })
    expect(awaitingThird.reviewState.status).toBe('AWAITING_THIRD_REVIEW')
    const accepted = await submitContributionReview({
      proposalId: submitted.id,
      reviewerUserId: stewardId,
      input: { ...approveReview, expertiseTags: ['REGULATORY_SCIENCE'] },
    })
    expect(accepted.reviewState.status).toBe('ACCEPTED_FOR_IMPLEMENTATION')

    await expect(
      db
        .update(evidenceReviewTasks)
        .set({
          status: 'RESOLVED',
          resolutionNote: 'Attempted direct resolution without the immutable implementation audit.',
          resolvedByUserId: stewardId,
          resolutionContributionProposalId: submitted.id,
          resolvedAt: new Date(),
        })
        .where(eq(evidenceReviewTasks.id, sourceTaskId)),
    ).rejects.toBeDefined()

    const resolution = await materializeAcceptedContributionCandidate({
      proposalId: submitted.id,
      implementedByUserId: stewardId,
    })
    expect(resolution).toMatchObject({
      outcome: 'UNPUBLISHED_SOURCE_TASK_RESOLVED',
      proposalId: submitted.id,
      programmeId: created.records.programmeId,
      sourceReviewTaskId: sourceTaskId,
      sourceSnapshotId: monitored.snapshotId,
      reused: false,
      createsConclusion: false,
    })

    const [programmeRows, trialRows, freshnessRows, taskRows, auditRows, pointerRows] =
      await Promise.all([
        db
          .select()
          .from(developmentProgrammes)
          .where(eq(developmentProgrammes.id, created.records.programmeId)),
        db.select().from(programmeTrials).where(eq(programmeTrials.id, created.records.trialId)),
        db
          .select()
          .from(programmeFreshnessStates)
          .where(eq(programmeFreshnessStates.programmeId, created.records.programmeId)),
        db.select().from(evidenceReviewTasks).where(eq(evidenceReviewTasks.id, sourceTaskId)),
        db
          .select()
          .from(programmeContributionSourceTaskResolutions)
          .where(eq(programmeContributionSourceTaskResolutions.proposalId, submitted.id)),
        db
          .select()
          .from(programmeCurrentPublications)
          .where(eq(programmeCurrentPublications.programmeId, created.records.programmeId)),
      ])
    expect(programmeRows[0]).toMatchObject({
      title: changedTitle,
      status: 'COMPLETED',
      updateStatus: 'CURRENT',
    })
    expect(trialRows[0]).toMatchObject({
      title: changedTitle,
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      enrolment: 61,
      registrySnapshotId: monitored.snapshotId,
    })
    expect(freshnessRows[0]).toMatchObject({
      currentSnapshotId: monitored.snapshotId,
      pendingSnapshotId: null,
      freshnessStatus: 'CURRENT',
    })
    expect(taskRows[0]).toMatchObject({
      status: 'RESOLVED',
      resolutionVerdictRevisionId: null,
      resolutionContributionProposalId: submitted.id,
      resolvedByUserId: stewardId,
    })
    expect(auditRows).toEqual([
      expect.objectContaining({
        sourceReviewTaskId: sourceTaskId,
        sourceSnapshotId: monitored.snapshotId,
        resolvedByUserId: stewardId,
      }),
    ])
    expect(pointerRows).toEqual([])
    expect(
      await db
        .select({ id: programmeVerdictRevisions.id })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.programmeId, created.records.programmeId)),
    ).toEqual([])
    expect(
      await db
        .select({ id: claims.id })
        .from(claims)
        .where(eq(claims.programmeId, created.records.programmeId)),
    ).toEqual([])
    expect(
      await db
        .select({ id: evidenceNodes.id })
        .from(evidenceNodes)
        .where(eq(evidenceNodes.programmeId, created.records.programmeId)),
    ).toEqual([])
  })
})

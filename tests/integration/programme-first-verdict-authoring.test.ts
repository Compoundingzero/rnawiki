import { randomUUID } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { and, eq } from 'drizzle-orm'

import { db } from '@/db'
import {
  claims,
  developmentProgrammes,
  drugs,
  evidenceNodes,
  evidenceSources,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictScopeSnapshots,
  programmeVerdictReviewerQualificationEvents,
  programmeVerdictRevisions,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
  programmeVerdictInterpretabilityAssessments,
  programmeVerdictMechanismSteps,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTimelineEvents,
  programmeVerdictTrialSnapshots,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  users,
} from '@/db/schema'
import {
  EVIDENCE_NODE_TYPES,
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
  STUDY_INTERPRETABILITY_CRITERIA,
} from '@/lib/evidence/types'
import type { ProgrammeFirstVerdictAuthoringBundle } from '@/lib/programme-first-verdict-authoring'
import {
  authorFirstProgrammeVerdictDraft,
  authorSuccessorProgrammeVerdictDraft,
} from '@/lib/queries/programme-first-verdict-authoring'
import { prepareDraftProgrammePresentation } from '@/lib/queries/programme-presentation'
import { publishProgrammeVerdictRevision } from '@/lib/queries/programme-verdict-publication'
import { submitProgrammeVerdictReview } from '@/lib/queries/programme-verdict-workflow'
import { firstVerdictBundleFixture } from '@/tests/setup/programme-first-verdict-bundle'

const key = randomUUID().replaceAll('-', '').slice(0, 10)
const id = (name: string) => `pfv-${name}-${key}`.slice(0, 64)
const actorId = id('actor')
const reviewerAId = id('reviewer-a')
const reviewerBId = id('reviewer-b')
const grantorId = id('grantor')
const drugId = id('drug')
const programmeId = id('programme')
const trialId = id('trial')
const sourceId = id('source')
const snapshotId = id('snapshot')
const pendingSnapshotId = id('pending-snapshot')
const mismatchSourceId = id('mismatch-source')
const mismatchSnapshotId = id('mismatch-snapshot')
const pendingProgrammeId = id('pending-programme')
const pendingTrialId = id('pending-trial')
const nctId = `NCT${parseInt(key.slice(0, 8), 16).toString().padStart(8, '0').slice(-8)}`
const today = new Date().toISOString().slice(0, 10)
const todayStart = new Date(`${today}T00:00:00.000Z`)
const nextMonth = new Date(todayStart.getTime() + 30 * 24 * 60 * 60 * 1_000)

function addOptionalGraphCoverage(
  bundle: ProgrammeFirstVerdictAuthoringBundle,
): ProgrammeFirstVerdictAuthoringBundle {
  const claimKey = bundle.claims[0]!.claimKey
  const presentationContrastClaimKey = 'first.presentation-contrast'
  bundle.claims.push({
    ...bundle.claims[0]!,
    claimKey: presentationContrastClaimKey,
    numericValue: null,
    numericUnit: null,
    numericUnitRequired: false,
    plainLanguageText:
      'The same saved source also records a limitation on how broadly the mechanism can be described.',
  })
  bundle.presentation.mechanismSteps[0]!.claimLinks.push({
    claimKey: presentationContrastClaimKey,
    relationship: 'CONTRADICTS',
  })
  bundle.presentation.mechanismSteps[1]!.claimLinks = [{ claimKey, relationship: 'QUALIFIES' }]
  bundle.interpretabilityAssessments = STUDY_INTERPRETABILITY_CRITERIA.map((criterion) => ({
    programmeTrialId: bundle.programmeTrialIds[0]!,
    criterion,
    state: 'NOT_REPORTED',
    explanation: `Synthetic test-only ${criterion} assessment with an explicit source-backed claim.`,
    lastVerifiedAt: null,
    claimLinks: [{ claimKey, relationship: 'SUPPORTS' }],
  }))
  bundle.presentation.timelineEvents = [
    {
      eventKey: 'synthetic-result-date',
      eventDate: bundle.proposalAsOfDate,
      eventType: 'IMPORTANT_RESULT',
      dateBasis: 'ACTUAL',
      plainTitle: 'Synthetic test-only result date',
      plainDescription:
        'This synthetic event exists only to exercise exact timeline persistence and replay.',
      technicalDescription: null,
      programmeTrialId: bundle.programmeTrialIds[0]!,
      sourceSnapshotId: bundle.claims[0]!.sourceSnapshotIds[0]!,
      claimLinks: [
        { claimKey, relationship: 'SUPPORTS' },
        { claimKey: presentationContrastClaimKey, relationship: 'QUALIFIES' },
      ],
    },
  ]
  return bundle
}

beforeAll(async () => {
  await db.insert(users).values([
    {
      id: actorId,
      email: `${actorId}@example.test`,
      passwordHash: 'not-used',
      name: 'First-draft steward',
      handle: `first-draft-steward-${key}`,
      trustTier: 'steward',
    },
    {
      id: reviewerAId,
      email: `${reviewerAId}@example.test`,
      passwordHash: 'not-used',
      name: 'First-draft reviewer A',
      handle: `first-draft-reviewer-a-${key}`,
      trustTier: 'trusted',
    },
    {
      id: reviewerBId,
      email: `${reviewerBId}@example.test`,
      passwordHash: 'not-used',
      name: 'First-draft reviewer B',
      handle: `first-draft-reviewer-b-${key}`,
      trustTier: 'trusted',
    },
    {
      id: grantorId,
      email: `${grantorId}@example.test`,
      passwordHash: 'not-used',
      name: 'First-draft qualification grantor',
      handle: `first-draft-grantor-${key}`,
      trustTier: 'steward',
      isAdmin: true,
    },
  ])
  await db.insert(programmeVerdictReviewerQualificationEvents).values([
    {
      id: id('qual-a'),
      reviewerUserId: reviewerAId,
      expertiseTag: 'CLINICAL_DEVELOPMENT',
      action: 'GRANT',
      authorizedByUserId: grantorId,
      reason: 'First-publication integration review fixture.',
    },
    {
      id: id('qual-b'),
      reviewerUserId: reviewerBId,
      expertiseTag: 'BIOSTATISTICS',
      action: 'GRANT',
      authorizedByUserId: grantorId,
      reason: 'First-publication integration review fixture.',
    },
  ])
  await db.insert(drugs).values({
    id: drugId,
    slug: id('medicine'),
    name: 'First-publication fixture medicine',
    modality: 'Small Molecule',
    approvalStatus: 'Phase 2 Investigational',
  })
  await db.insert(developmentProgrammes).values({
    id: programmeId,
    drugId,
    slug: id('programme-slug'),
    title: 'First-publication fixture programme',
    indication: 'Condition alpha',
    targetPopulation: 'Adults with condition alpha',
    status: 'COMPLETED',
    highestPhaseReached: 'Phase 2',
    route: 'Oral',
    doseExposureContext: 'The exposure recorded in the normalized trial.',
    updateStatus: 'CURRENT',
  })
  await db.insert(evidenceSources).values({
    id: sourceId,
    sourceType: 'CLINICAL_TRIAL_REGISTRY',
    externalIdentifier: nctId,
    canonicalLocator: `https://clinicaltrials.gov/study/${nctId}`,
    title: 'First-publication exact registry record',
    publisher: 'ClinicalTrials.gov',
    publicationDate: today,
    correctionStatus: 'CURRENT',
    hierarchy: 'PRIMARY',
  })
  await db.insert(sourceSnapshots).values({
    id: snapshotId,
    sourceId,
    retrievedAt: todayStart,
    lastVerifiedAt: todayStart,
    contentHash: 'a'.repeat(64),
    structuredData: { fixture: 'first-programme-verdict-authoring' },
    rawSnapshotLocator: `https://clinicaltrials.gov/study/${nctId}`,
  })
  await db.insert(sourceSnapshots).values({
    id: pendingSnapshotId,
    sourceId,
    previousSnapshotId: snapshotId,
    retrievedAt: new Date(todayStart.getTime() + 1_000),
    lastVerifiedAt: new Date(todayStart.getTime() + 1_000),
    contentHash: 'b'.repeat(64),
    structuredData: { fixture: 'pending-first-programme-verdict-authoring' },
    rawSnapshotLocator: `https://clinicaltrials.gov/study/${nctId}?version=pending`,
  })
  await db.insert(evidenceSources).values({
    id: mismatchSourceId,
    sourceType: 'CLINICAL_TRIAL_REGISTRY',
    externalIdentifier: `${nctId}-mismatch`,
    canonicalLocator: `https://clinicaltrials.gov/study/${nctId}?fixture=mismatch`,
    title: 'First-publication mismatch registry fixture',
    publisher: 'ClinicalTrials.gov',
    publicationDate: today,
    correctionStatus: 'CURRENT',
    hierarchy: 'PRIMARY',
  })
  await db.insert(sourceSnapshots).values({
    id: mismatchSnapshotId,
    sourceId: mismatchSourceId,
    retrievedAt: todayStart,
    lastVerifiedAt: todayStart,
    contentHash: 'c'.repeat(64),
    structuredData: { fixture: 'mismatch-first-programme-verdict-authoring' },
    rawSnapshotLocator: `https://clinicaltrials.gov/study/${nctId}?fixture=mismatch`,
  })
  await db.insert(programmeTrials).values({
    id: trialId,
    programmeId,
    trialIdentifier: nctId,
    title: 'First-publication normalized trial',
    phase: 'Phase 2',
    status: 'COMPLETED',
    resultsStatus: 'AVAILABLE',
    enrolment: 100,
    enrolmentType: 'ACTUAL',
    humanStudyStatus: 'YES',
    registrySourceId: sourceId,
    registrySnapshotId: snapshotId,
    lastVerifiedAt: todayStart,
  })
  await db.insert(programmeFreshnessStates).values({
    programmeId,
    sourceId,
    currentSnapshotId: snapshotId,
    pendingSnapshotId: null,
    checkStatus: 'SUCCEEDED',
    freshnessStatus: 'CURRENT',
    lastCheckAttemptAt: todayStart,
    lastSuccessfulCheckAt: todayStart,
    lastVerifiedAt: todayStart,
    nextCheckDueAt: nextMonth,
  })
  await db.insert(programmeFreshnessStates).values({
    programmeId,
    sourceId: mismatchSourceId,
    currentSnapshotId: mismatchSnapshotId,
    pendingSnapshotId: null,
    checkStatus: 'SUCCEEDED',
    freshnessStatus: 'CURRENT',
    lastCheckAttemptAt: todayStart,
    lastSuccessfulCheckAt: todayStart,
    lastVerifiedAt: todayStart,
    nextCheckDueAt: nextMonth,
  })
})

afterAll(async () => {
  await db.delete(drugs).where(eq(drugs.id, drugId))
})

describe('first canonical programme-verdict authoring', () => {
  it('rolls back dry runs and blockers, reuses only exact drafts, then advances a null-predecessor first-publication lineage to publish', async () => {
    const bundle = addOptionalGraphCoverage(
      firstVerdictBundleFixture({
        programmeId,
        programmeTrialId: trialId,
        sourceSnapshotId: snapshotId,
      }),
    )
    bundle.claims[0]!.numericValue = '99999999999999999999.1234567891'
    bundle.claims[0]!.numericUnitRequired = true
    bundle.claims[0]!.numericUnit = 'synthetic test units'

    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: reviewerAId,
        bundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_not_authorized' })
    await expect(
      authorSuccessorProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'successor_draft_current_publication_required' })

    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: reviewerAId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_not_authorized' })

    const backdated = structuredClone(bundle)
    backdated.proposalAsOfDate = '2020-01-01'
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle: backdated, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_as_of_date_not_current' })
    const future = structuredClone(bundle)
    future.proposalAsOfDate = '2099-01-01'
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle: future, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_as_of_date_not_current' })

    await db
      .update(programmeTrials)
      .set({ registrySourceId: null, registrySnapshotId: null })
      .where(eq(programmeTrials.id, trialId))
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_trial_registry_provenance_missing' })
    await db
      .update(programmeTrials)
      .set({ registrySourceId: sourceId, registrySnapshotId: snapshotId })
      .where(eq(programmeTrials.id, trialId))

    const currentFreshness = (
      await db
        .select()
        .from(programmeFreshnessStates)
        .where(
          and(
            eq(programmeFreshnessStates.programmeId, programmeId),
            eq(programmeFreshnessStates.sourceId, sourceId),
          ),
        )
    )[0]!
    await db
      .delete(programmeFreshnessStates)
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_snapshot_not_found' })
    await db.insert(programmeFreshnessStates).values(currentFreshness)

    await db
      .update(programmeFreshnessStates)
      .set({ checkStatus: 'FAILED', freshnessStatus: 'CHECK_FAILED' })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_snapshot_not_current' })
    await db
      .update(programmeFreshnessStates)
      .set({ checkStatus: 'SUCCEEDED', freshnessStatus: 'CURRENT' })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )

    for (const correctionStatus of ['RETRACTED', 'WITHDRAWN'] as const) {
      await db
        .update(evidenceSources)
        .set({ correctionStatus })
        .where(eq(evidenceSources.id, sourceId))
      await expect(
        authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
      ).rejects.toMatchObject({ code: 'first_draft_source_unusable' })
    }
    await db
      .update(evidenceSources)
      .set({ correctionStatus: 'CURRENT' })
      .where(eq(evidenceSources.id, sourceId))

    const registryMismatch = await db
      .update(programmeTrials)
      .set({ registrySourceId: mismatchSourceId, registrySnapshotId: snapshotId })
      .where(eq(programmeTrials.id, trialId))
      .then(
        () => null,
        (error: unknown) => error,
      )
    expect((registryMismatch as { cause?: { code?: string } } | null)?.cause?.code).toBe('23503')

    await db
      .update(programmeFreshnessStates)
      .set({ nextCheckDueAt: new Date(todayStart.getTime() - 1) })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_snapshot_not_current' })
    await db
      .update(programmeFreshnessStates)
      .set({ nextCheckDueAt: nextMonth })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )

    const blocked = structuredClone(bundle)
    blocked.claims[0]!.nature = 'UNKNOWN'
    blocked.presentation.mechanismSteps[0]!.evidenceBasis = 'MEASURED_IN_PEOPLE'
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle: blocked, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_validation_engine_blocked' })

    const activeNodeId = id('unbound-active-node')
    await db.insert(evidenceNodes).values({
      id: activeNodeId,
      programmeId,
      nodeType: EVIDENCE_NODE_TYPES[0],
      revisionNumber: 1,
      state: 'UNKNOWN',
      reviewStatus: 'DRAFT',
      plainSummary: 'Synthetic unbound active node.',
      professionalSummary: 'Synthetic unbound active node for lineage collision coverage.',
      rationale: 'This row must block a branch.',
      visible: true,
      presentedAsPositive: false,
      presentedAsNegative: false,
      authorUserId: actorId,
    })
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_node_lineage_conflict' })
    await db.delete(evidenceNodes).where(eq(evidenceNodes.id, activeNodeId))

    const activeAssessmentId = id('unbound-active-assessment')
    await db.insert(trialInterpretabilityAssessments).values({
      id: activeAssessmentId,
      programmeId,
      programmeTrialId: trialId,
      criterion: STUDY_INTERPRETABILITY_CRITERIA[0],
      state: 'NOT_REPORTED',
      revisionNumber: 1,
      reviewStatus: 'DRAFT',
      explanation: 'Synthetic unbound active assessment that must block a branch.',
      authorUserId: actorId,
    })
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_assessment_lineage_conflict' })
    await db
      .delete(trialInterpretabilityAssessments)
      .where(eq(trialInterpretabilityAssessments.id, activeAssessmentId))

    const activeClaimId = id('unbound-active-claim')
    await db.insert(claims).values({
      id: activeClaimId,
      programmeId,
      claimKey: bundle.claims[0]!.claimKey,
      revisionNumber: 1,
      nature: 'UNKNOWN',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'An unbound active authoring row must not be branched.',
      direction: 'UNKNOWN',
      authorUserId: actorId,
    })
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_claim_lineage_conflict' })
    await db.delete(claims).where(eq(claims.id, activeClaimId))

    const dryRun = await authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle })
    expect(dryRun).toMatchObject({
      mode: 'DRY_RUN',
      outcome: 'WOULD_CREATE',
      reviewStatus: 'DRAFT',
      proposalPreparedAt: null,
      reused: false,
    })
    expect(
      await db
        .select({ id: programmeVerdictRevisions.id })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.programmeId, programmeId)),
    ).toEqual([])
    expect(
      await db.select({ id: claims.id }).from(claims).where(eq(claims.programmeId, programmeId)),
    ).toEqual([])
    expect(
      await db
        .select({ id: evidenceNodes.id })
        .from(evidenceNodes)
        .where(eq(evidenceNodes.programmeId, programmeId)),
    ).toEqual([])
    expect(
      await db
        .select({ id: trialInterpretabilityAssessments.id })
        .from(trialInterpretabilityAssessments)
        .where(eq(trialInterpretabilityAssessments.programmeId, programmeId)),
    ).toEqual([])
    expect(
      await db
        .select({ eventKey: programmeVerdictTimelineEvents.eventKey })
        .from(programmeVerdictTimelineEvents)
        .where(eq(programmeVerdictTimelineEvents.programmeId, programmeId)),
    ).toEqual([])

    const created = await authorFirstProgrammeVerdictDraft({
      actorUserId: actorId,
      bundle,
      commit: true,
    })
    expect(created).toMatchObject({
      mode: 'COMMIT',
      outcome: 'CREATED',
      revisionNumber: 1,
      previousVerdictRevisionId: null,
      reviewStatus: 'DRAFT',
      proposalPreparedAt: null,
      reused: false,
    })
    expect(
      await db
        .select({ eventKey: programmeVerdictTimelineEvents.eventKey })
        .from(programmeVerdictTimelineEvents)
        .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, created.revisionId)),
    ).toEqual([{ eventKey: 'synthetic-result-date' }])
    const presentationContrastClaim = (
      await db
        .select({ id: claims.id })
        .from(claims)
        .where(
          and(
            eq(claims.programmeId, programmeId),
            eq(claims.claimKey, 'first.presentation-contrast'),
          ),
        )
    )[0]!
    expect(
      (
        await db
          .select({
            claimId: programmeDependencies.claimId,
            surface: programmeDependencies.dependentSurfaceType,
            fieldPath: programmeDependencies.fieldPath,
          })
          .from(programmeDependencies)
          .where(eq(programmeDependencies.verdictRevisionId, created.revisionId))
      ).filter((row) => row.claimId === presentationContrastClaim.id),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          surface: 'MECHANISM_MAP',
          fieldPath: 'mechanism.entry.plainDescription',
        }),
        expect.objectContaining({
          surface: 'TIMELINE',
          fieldPath: 'timeline.synthetic-result-date.plainDescription',
        }),
      ]),
    )
    expect(
      (
        await db
          .select({ nodeType: evidenceNodes.nodeType })
          .from(evidenceNodes)
          .where(eq(evidenceNodes.programmeId, programmeId))
      )
        .map((row) => row.nodeType)
        .sort(),
    ).toEqual([...EVIDENCE_NODE_TYPES].sort())
    expect(
      await db
        .select({ criterion: trialInterpretabilityAssessments.criterion })
        .from(trialInterpretabilityAssessments)
        .where(eq(trialInterpretabilityAssessments.programmeId, programmeId)),
    ).toHaveLength(STUDY_INTERPRETABILITY_CRITERIA.length)

    const reorderedBundle = structuredClone(bundle)
    reorderedBundle.evidenceNodes.reverse()
    reorderedBundle.presentation.mechanismSteps.reverse()
    const retry = await authorFirstProgrammeVerdictDraft({
      actorUserId: actorId,
      bundle: reorderedBundle,
      commit: true,
    })
    expect(retry).toMatchObject({
      outcome: 'ALREADY_EXISTS',
      revisionId: created.revisionId,
      bundleDigest: created.bundleDigest,
      reused: true,
    })

    const authoredClaim = (
      await db
        .select()
        .from(claims)
        .where(
          and(eq(claims.programmeId, programmeId), eq(claims.claimKey, bundle.claims[0]!.claimKey)),
        )
    )[0]!
    expect(authoredClaim.numericValue).toBe('99999999999999999999.1234567891')
    await db
      .update(claims)
      .set({ plainLanguageText: 'A changed draft row must invalidate idempotent replay.' })
      .where(eq(claims.id, authoredClaim.id))
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_idempotency_conflict' })
    await db
      .update(claims)
      .set({ plainLanguageText: authoredClaim.plainLanguageText })
      .where(eq(claims.id, authoredClaim.id))

    await db
      .update(programmeVerdictRevisions)
      .set({ engineVersion: 'tampered-before-prepare' })
      .where(eq(programmeVerdictRevisions.id, created.revisionId))
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_idempotency_conflict' })
    await db
      .update(programmeVerdictRevisions)
      .set({ engineVersion: null })
      .where(eq(programmeVerdictRevisions.id, created.revisionId))

    await db
      .update(programmeVerdictScopeSnapshots)
      .set({ title: 'Tampered frozen programme title' })
      .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, created.revisionId))
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_idempotency_conflict' })
    await db
      .update(programmeVerdictScopeSnapshots)
      .set({ title: 'First-publication fixture programme' })
      .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, created.revisionId))

    const different = structuredClone(bundle)
    different.conclusion.publicLabel = 'A different authored bundle must not branch the draft.'
    await expect(
      authorFirstProgrammeVerdictDraft({ actorUserId: actorId, bundle: different, commit: true }),
    ).rejects.toMatchObject({ code: 'first_draft_candidate_conflict' })

    const frozenMetadataBeforePrepare = await Promise.all([
      db
        .select()
        .from(programmeVerdictScopeSnapshots)
        .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, created.revisionId)),
      db
        .select()
        .from(programmeVerdictTrialSnapshots)
        .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, created.revisionId)),
      db
        .select()
        .from(programmeVerdictSourceMetadataSnapshots)
        .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, created.revisionId)),
    ])
    const firstPrepared = await prepareDraftProgrammePresentation({
      revisionId: created.revisionId,
      actorUserId: actorId,
    })
    expect(
      await Promise.all([
        db
          .select()
          .from(programmeVerdictScopeSnapshots)
          .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, created.revisionId)),
        db
          .select()
          .from(programmeVerdictTrialSnapshots)
          .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, created.revisionId)),
        db
          .select()
          .from(programmeVerdictSourceMetadataSnapshots)
          .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, created.revisionId)),
      ]),
    ).toEqual(frozenMetadataBeforePrepare)
    for (const [reviewerUserId, expertiseTags] of [
      [reviewerAId, ['CLINICAL_DEVELOPMENT'] as const],
      [reviewerBId, ['BIOSTATISTICS'] as const],
    ] as const) {
      await submitProgrammeVerdictReview({
        revisionId: created.revisionId,
        reviewerUserId,
        expectedProposalDigest: firstPrepared.proposalDigest,
        decision: 'CHANGES_REQUESTED',
        expertiseTags: [...expertiseTags],
        isIndependent: true,
        conflictsOfInterest: 'No conflicts declared.',
        conflictsOfInterestAttested: true,
        reviewNote: 'Revise the exact plain-language wording before first publication.',
      })
    }
    expect(
      (
        await db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, created.revisionId))
      )[0],
    ).toMatchObject({ reviewStatus: 'CHANGES_REQUESTED', previousVerdictRevisionId: null })
    expect(
      await db
        .select()
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, programmeId)),
    ).toEqual([])

    const revisedBundle = addOptionalGraphCoverage(
      firstVerdictBundleFixture({
        programmeId,
        programmeTrialId: trialId,
        sourceSnapshotId: snapshotId,
        claimText: 'The exact source reports the revised, measured programme result.',
      }),
    )
    revisedBundle.conclusion.bestSupportedFinding =
      'The exact source reports the revised, measured programme result.'
    const revised = await authorFirstProgrammeVerdictDraft({
      actorUserId: actorId,
      bundle: revisedBundle,
      commit: true,
    })
    expect(revised).toMatchObject({
      outcome: 'CREATED',
      revisionNumber: 2,
      previousVerdictRevisionId: null,
      reviewStatus: 'DRAFT',
    })
    const revisedPrepared = await prepareDraftProgrammePresentation({
      revisionId: revised.revisionId,
      actorUserId: actorId,
    })
    for (const [reviewerUserId, expertiseTags] of [
      [reviewerAId, ['CLINICAL_DEVELOPMENT'] as const],
      [reviewerBId, ['BIOSTATISTICS'] as const],
    ] as const) {
      await submitProgrammeVerdictReview({
        revisionId: revised.revisionId,
        reviewerUserId,
        expectedProposalDigest: revisedPrepared.proposalDigest,
        decision: 'APPROVE',
        expertiseTags: [...expertiseTags],
        isIndependent: true,
        conflictsOfInterest: 'No conflicts declared.',
        conflictsOfInterestAttested: true,
      })
    }
    const published = await publishProgrammeVerdictRevision({
      revisionId: revised.revisionId,
      publisherUserId: actorId,
      expectedProposalDigest: revisedPrepared.proposalDigest,
    })
    expect(published).toMatchObject({
      revisionId: revised.revisionId,
      previousRevisionId: null,
      alreadyPublished: false,
    })
    expect(
      (
        await db
          .select()
          .from(programmeCurrentPublications)
          .where(eq(programmeCurrentPublications.programmeId, programmeId))
      )[0],
    ).toMatchObject({ verdictRevisionId: revised.revisionId })
    await expect(
      authorFirstProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: revisedBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'first_draft_current_publication_exists' })

    const successorTrialId = id('successor-trial')
    const successorSourceId = id('successor-source')
    const successorSnapshotId = id('successor-snapshot')
    const successorNctId = `NCT${(parseInt(key.slice(0, 8), 16) + 1)
      .toString()
      .padStart(8, '0')
      .slice(-8)}`
    await db.insert(evidenceSources).values({
      id: successorSourceId,
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      externalIdentifier: successorNctId,
      canonicalLocator: `https://clinicaltrials.gov/study/${successorNctId}`,
      title: 'Second exact registry source for successor scope',
      publisher: 'ClinicalTrials.gov',
      publicationDate: today,
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    await db.insert(sourceSnapshots).values({
      id: successorSnapshotId,
      sourceId: successorSourceId,
      retrievedAt: todayStart,
      lastVerifiedAt: todayStart,
      contentHash: 'd'.repeat(64),
      structuredData: { fixture: 'successor-programme-verdict-authoring' },
      rawSnapshotLocator: `https://clinicaltrials.gov/study/${successorNctId}`,
    })
    await db.insert(programmeFreshnessStates).values({
      programmeId,
      sourceId: successorSourceId,
      currentSnapshotId: successorSnapshotId,
      pendingSnapshotId: null,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      lastCheckAttemptAt: todayStart,
      lastSuccessfulCheckAt: todayStart,
      lastVerifiedAt: todayStart,
      nextCheckDueAt: nextMonth,
    })
    await db.insert(programmeTrials).values({
      id: successorTrialId,
      programmeId,
      trialIdentifier: successorNctId,
      title: 'Second exact normalized trial for successor scope',
      phase: 'Phase 2',
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      enrolment: 75,
      enrolmentType: 'ACTUAL',
      humanStudyStatus: 'YES',
      registrySourceId: successorSourceId,
      registrySnapshotId: successorSnapshotId,
      lastVerifiedAt: todayStart,
    })

    const successorBundle = structuredClone(revisedBundle)
    successorBundle.conflictsOfInterest = 'No conflicts declared for the complete successor.'
    successorBundle.programmeTrialIds = [trialId, successorTrialId]
    successorBundle.claims[0]!.programmeTrialId = successorTrialId
    successorBundle.claims[0]!.sourceSnapshotIds = [successorSnapshotId]
    successorBundle.claims[0]!.plainLanguageText =
      'The exact source-backed successor now scopes the measured result to the second normalized trial.'
    successorBundle.evidenceNodes[0]!.plainSummary =
      'The successor replaces this evidence-node summary while preserving the prior public revision.'
    successorBundle.evidenceNodes[0]!.professionalSummary =
      'The complete successor contains a newly authored, source-linked evidence-node assessment.'
    successorBundle.evidenceNodes[0]!.rationale =
      'This changed rationale proves that the node revision is part of the complete replacement.'
    successorBundle.interpretabilityAssessments[0]!.state = 'UNCLEAR'
    successorBundle.interpretabilityAssessments[0]!.explanation =
      'The successor records a changed interpretability assessment for independent review.'
    for (const assessment of successorBundle.interpretabilityAssessments) {
      assessment.claimLinks = [
        { claimKey: 'first.presentation-contrast', relationship: 'SUPPORTS' },
      ]
    }
    successorBundle.conclusion.publicLabel =
      'The complete successor conclusion is limited to two exact normalized trials.'
    successorBundle.conclusion.professionalLabel =
      'A complete replacement bundle covers two exact trials and revised evidence interpretations.'
    successorBundle.conclusion.trialScope =
      'The two exact normalized trials named in this replacement bundle.'
    successorBundle.conclusion.bestSupportedFinding =
      'The exact source-backed successor scopes the measured result to the second normalized trial.'
    successorBundle.conclusion.mainLimitation =
      'The revised conclusion remains limited to the two reviewed trials.'
    successorBundle.conclusion.oneSentenceReason =
      'The replacement conclusion follows the changed claim, node and assessment graph.'
    successorBundle.dependencies.summary['summary.mainLimitation'] = ['first.presentation-contrast']
    successorBundle.conclusion.claimLinks.push({
      claimKey: 'first.presentation-contrast',
      relationship: 'CANDIDATE_LIMITATION',
    })
    successorBundle.presentation.mechanismSteps[0]!.plainDescription =
      'The successor mechanism starts with the newly reviewed, source-linked claim.'
    successorBundle.presentation.timelineEvents[0]!.plainTitle = 'Successor evidence review date'
    successorBundle.presentation.timelineEvents[0]!.plainDescription =
      'This sourced event belongs only to the complete successor candidate.'
    successorBundle.presentation.timelineEvents[0]!.programmeTrialId = successorTrialId
    successorBundle.presentation.timelineEvents[0]!.sourceSnapshotId = successorSnapshotId

    const foreignProgrammeId = id('foreign-programme')
    const foreignTrialId = id('foreign-trial')
    await db.insert(developmentProgrammes).values({
      id: foreignProgrammeId,
      drugId,
      slug: id('foreign-programme-slug'),
      title: 'Foreign programme used only for scope rejection',
      indication: 'A different condition',
      targetPopulation: 'A different population',
      status: 'COMPLETED',
      updateStatus: 'CURRENT',
    })
    await db.insert(programmeTrials).values({
      id: foreignTrialId,
      programmeId: foreignProgrammeId,
      trialIdentifier: `${nctId}-FOREIGN`,
      title: 'Cross-programme trial that must be rejected',
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      humanStudyStatus: 'YES',
      registrySourceId: sourceId,
      registrySnapshotId: snapshotId,
      lastVerifiedAt: todayStart,
    })
    const crossProgrammeBundle = structuredClone(successorBundle)
    crossProgrammeBundle.programmeTrialIds = [trialId, successorTrialId, foreignTrialId]
    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: crossProgrammeBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_trial_scope_mismatch' })
    await db.delete(developmentProgrammes).where(eq(developmentProgrammes.id, foreignProgrammeId))

    await db
      .update(programmeFreshnessStates)
      .set({ nextCheckDueAt: new Date(todayStart.getTime() - 1) })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: successorBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_snapshot_not_current' })
    await db
      .update(programmeFreshnessStates)
      .set({ nextCheckDueAt: nextMonth })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )

    await db
      .update(evidenceSources)
      .set({ correctionStatus: 'RETRACTED' })
      .where(eq(evidenceSources.id, sourceId))
    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: successorBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_source_unusable' })
    await db
      .update(evidenceSources)
      .set({ correctionStatus: 'CURRENT' })
      .where(eq(evidenceSources.id, sourceId))

    const currentScopeBeforeSuccessor = await db
      .select()
      .from(programmeVerdictScopeSnapshots)
      .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, revised.revisionId))
    const currentClaimBeforeSuccessor = (
      await db
        .select({ claim: claims })
        .from(programmeVerdictClaims)
        .innerJoin(claims, eq(claims.id, programmeVerdictClaims.claimId))
        .where(eq(programmeVerdictClaims.verdictRevisionId, revised.revisionId))
    )[0]!.claim
    const revisionCountBeforeDryRun = (
      await db
        .select({ id: programmeVerdictRevisions.id })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.programmeId, programmeId))
    ).length
    const successorDryRun = await authorSuccessorProgrammeVerdictDraft({
      actorUserId: actorId,
      bundle: successorBundle,
    })
    expect(successorDryRun).toMatchObject({
      mode: 'DRY_RUN',
      outcome: 'WOULD_CREATE',
      previousVerdictRevisionId: revised.revisionId,
      reviewStatus: 'DRAFT',
      proposalPreparedAt: null,
    })
    expect(
      await db
        .select({ id: programmeVerdictRevisions.id })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.programmeId, programmeId)),
    ).toHaveLength(revisionCountBeforeDryRun)

    const concurrentSuccessorAttempts = await Promise.all([
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: successorBundle,
        commit: true,
      }),
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: successorBundle,
        commit: true,
      }),
    ])
    expect(concurrentSuccessorAttempts.map((result) => result.outcome).sort()).toEqual([
      'ALREADY_EXISTS',
      'CREATED',
    ])
    const successorDraft = concurrentSuccessorAttempts.find(
      (result) => result.outcome === 'CREATED',
    )!
    expect(successorDraft).toMatchObject({
      mode: 'COMMIT',
      outcome: 'CREATED',
      previousVerdictRevisionId: revised.revisionId,
      reviewStatus: 'DRAFT',
      proposalPreparedAt: null,
      reused: false,
    })
    expect(
      (
        await db
          .select()
          .from(programmeCurrentPublications)
          .where(eq(programmeCurrentPublications.programmeId, programmeId))
      )[0],
    ).toMatchObject({ verdictRevisionId: revised.revisionId })
    expect(
      (
        await db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, revised.revisionId))
      )[0],
    ).toMatchObject({ reviewStatus: 'PUBLISHED' })
    expect(
      await db
        .select()
        .from(programmeVerdictScopeSnapshots)
        .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, revised.revisionId)),
    ).toEqual(currentScopeBeforeSuccessor)
    expect(
      (await db.select().from(claims).where(eq(claims.id, currentClaimBeforeSuccessor.id)))[0],
    ).toMatchObject({
      plainLanguageText: currentClaimBeforeSuccessor.plainLanguageText,
      reviewStatus: 'PUBLISHED',
    })
    expect(
      await db
        .select()
        .from(programmeVerdictTrialSnapshots)
        .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, successorDraft.revisionId)),
    ).toHaveLength(2)
    expect(
      (
        await db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, successorDraft.revisionId))
      )[0],
    ).toMatchObject({
      publicLabel: successorBundle.conclusion.publicLabel,
      trialScope: successorBundle.conclusion.trialScope,
    })
    const successorMechanism = await db
      .select()
      .from(programmeVerdictMechanismSteps)
      .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, successorDraft.revisionId))
    expect(successorMechanism).toHaveLength(successorBundle.presentation.mechanismSteps.length)
    expect(successorMechanism[0]).toMatchObject({
      plainDescription: successorBundle.presentation.mechanismSteps[0]!.plainDescription,
    })
    expect(
      (
        await db
          .select({ node: evidenceNodes })
          .from(programmeVerdictEvidenceNodes)
          .innerJoin(
            evidenceNodes,
            eq(evidenceNodes.id, programmeVerdictEvidenceNodes.evidenceNodeId),
          )
          .where(
            and(
              eq(programmeVerdictEvidenceNodes.verdictRevisionId, successorDraft.revisionId),
              eq(evidenceNodes.nodeType, successorBundle.evidenceNodes[0]!.nodeType),
            ),
          )
      )[0]!.node,
    ).toMatchObject({
      plainSummary: successorBundle.evidenceNodes[0]!.plainSummary,
      previousEvidenceNodeId: expect.any(String),
      reviewStatus: 'DRAFT',
    })
    expect(
      (
        await db
          .select({ assessment: trialInterpretabilityAssessments })
          .from(programmeVerdictInterpretabilityAssessments)
          .innerJoin(
            trialInterpretabilityAssessments,
            eq(
              trialInterpretabilityAssessments.id,
              programmeVerdictInterpretabilityAssessments.assessmentId,
            ),
          )
          .where(
            and(
              eq(
                programmeVerdictInterpretabilityAssessments.verdictRevisionId,
                successorDraft.revisionId,
              ),
              eq(
                trialInterpretabilityAssessments.criterion,
                successorBundle.interpretabilityAssessments[0]!.criterion,
              ),
              eq(
                trialInterpretabilityAssessments.programmeTrialId,
                successorBundle.interpretabilityAssessments[0]!.programmeTrialId,
              ),
            ),
          )
      )[0]!.assessment,
    ).toMatchObject({
      state: successorBundle.interpretabilityAssessments[0]!.state,
      explanation: successorBundle.interpretabilityAssessments[0]!.explanation,
      previousAssessmentId: expect.any(String),
      reviewStatus: 'DRAFT',
    })
    expect(
      (
        await db
          .select()
          .from(programmeVerdictTimelineEvents)
          .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, successorDraft.revisionId))
      )[0],
    ).toMatchObject({
      plainTitle: successorBundle.presentation.timelineEvents[0]!.plainTitle,
      sourceSnapshotId: successorSnapshotId,
    })
    const successorDependencies = await db
      .select()
      .from(programmeDependencies)
      .where(eq(programmeDependencies.verdictRevisionId, successorDraft.revisionId))
    expect(
      successorDependencies.some(
        (dependency) =>
          dependency.fieldPath === 'summary.mainLimitation' &&
          dependency.claimId !== currentClaimBeforeSuccessor.id,
      ),
    ).toBe(true)
    expect(
      successorDependencies
        .filter((row) => row.dependentSurfaceType === 'PROGRAMME_SUMMARY')
        .map((row) => row.fieldPath)
        .sort(),
    ).toEqual([...PROGRAMME_SUMMARY_FIELD_PATHS].sort())
    expect(
      successorDependencies
        .filter((row) => row.dependentSurfaceType === 'VERDICT')
        .map((row) => row.fieldPath)
        .sort(),
    ).toEqual([...PROGRAMME_VERDICT_FIELD_PATHS].sort())
    expect(
      successorDependencies.filter((row) => row.dependentSurfaceType === 'MECHANISM_MAP'),
    ).toHaveLength(
      successorBundle.presentation.mechanismSteps.reduce(
        (total, step) => total + step.claimLinks.length,
        0,
      ),
    )
    expect(
      successorDependencies.filter((row) => row.dependentSurfaceType === 'TIMELINE'),
    ).toHaveLength(
      successorBundle.presentation.timelineEvents.reduce(
        (total, event) => total + event.claimLinks.length,
        0,
      ),
    )
    const successorNodeDependencies = await db
      .select({ dependency: programmeDependencies })
      .from(programmeDependencies)
      .innerJoin(
        programmeVerdictEvidenceNodes,
        eq(programmeVerdictEvidenceNodes.evidenceNodeId, programmeDependencies.evidenceNodeId),
      )
      .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, successorDraft.revisionId))
    expect(successorNodeDependencies).toHaveLength(
      successorBundle.evidenceNodes.reduce((total, node) => total + node.claimLinks.length, 0),
    )
    expect(
      successorNodeDependencies.every(
        ({ dependency }) => dependency.dependentSurfaceType === 'EVIDENCE_NODE',
      ),
    ).toBe(true)

    const successorRetry = await authorSuccessorProgrammeVerdictDraft({
      actorUserId: actorId,
      bundle: successorBundle,
      commit: true,
    })
    expect(successorRetry).toMatchObject({
      outcome: 'ALREADY_EXISTS',
      revisionId: successorDraft.revisionId,
      reused: true,
    })
    const competingSuccessorBundle = structuredClone(successorBundle)
    competingSuccessorBundle.conclusion.publicLabel =
      'A different active complete successor must not branch the canonical lineage.'
    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: competingSuccessorBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_candidate_conflict' })

    const successorClaim = (
      await db
        .select({ claim: claims })
        .from(programmeVerdictClaims)
        .innerJoin(claims, eq(claims.id, programmeVerdictClaims.claimId))
        .where(
          and(
            eq(programmeVerdictClaims.verdictRevisionId, successorDraft.revisionId),
            eq(claims.claimKey, successorBundle.claims[0]!.claimKey),
          ),
        )
    )[0]!.claim
    expect(successorClaim).toMatchObject({
      plainLanguageText: successorBundle.claims[0]!.plainLanguageText,
      previousClaimId: currentClaimBeforeSuccessor.id,
      programmeTrialId: successorTrialId,
      reviewStatus: 'DRAFT',
    })
    await db
      .update(claims)
      .set({ plainLanguageText: 'Tampering must invalidate a supposedly idempotent retry.' })
      .where(eq(claims.id, successorClaim.id))
    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: successorBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_idempotency_conflict' })
    await db
      .update(claims)
      .set({ plainLanguageText: successorClaim.plainLanguageText })
      .where(eq(claims.id, successorClaim.id))

    const successorPrepared = await prepareDraftProgrammePresentation({
      revisionId: successorDraft.revisionId,
      actorUserId: actorId,
    })
    for (const [reviewerUserId, expertiseTags] of [
      [reviewerAId, ['CLINICAL_DEVELOPMENT'] as const],
      [reviewerBId, ['BIOSTATISTICS'] as const],
    ] as const) {
      await submitProgrammeVerdictReview({
        revisionId: successorDraft.revisionId,
        reviewerUserId,
        expectedProposalDigest: successorPrepared.proposalDigest,
        decision: 'APPROVE',
        expertiseTags: [...expertiseTags],
        isIndependent: true,
        conflictsOfInterest: 'No conflicts declared.',
        conflictsOfInterestAttested: true,
      })
    }
    const successorPublished = await publishProgrammeVerdictRevision({
      revisionId: successorDraft.revisionId,
      publisherUserId: actorId,
      expectedProposalDigest: successorPrepared.proposalDigest,
    })
    expect(successorPublished).toMatchObject({
      revisionId: successorDraft.revisionId,
      previousRevisionId: revised.revisionId,
      alreadyPublished: false,
    })
    expect(
      (
        await db
          .select()
          .from(programmeCurrentPublications)
          .where(eq(programmeCurrentPublications.programmeId, programmeId))
      )[0],
    ).toMatchObject({ verdictRevisionId: successorDraft.revisionId })
    expect(
      (
        await db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, revised.revisionId))
      )[0],
    ).toMatchObject({
      reviewStatus: 'SUPERSEDED',
      publicLabel: revisedBundle.conclusion.publicLabel,
      trialScope: revisedBundle.conclusion.trialScope,
    })
    expect(
      await db
        .select()
        .from(programmeVerdictScopeSnapshots)
        .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, revised.revisionId)),
    ).toEqual(currentScopeBeforeSuccessor)
    expect(
      (await db.select().from(claims).where(eq(claims.id, currentClaimBeforeSuccessor.id)))[0],
    ).toMatchObject({
      plainLanguageText: currentClaimBeforeSuccessor.plainLanguageText,
      reviewStatus: 'SUPERSEDED',
    })

    await db
      .update(programmeFreshnessStates)
      .set({ pendingSnapshotId, freshnessStatus: 'NEW_EVIDENCE' })
      .where(
        and(
          eq(programmeFreshnessStates.programmeId, programmeId),
          eq(programmeFreshnessStates.sourceId, sourceId),
        ),
      )
    await expect(
      authorSuccessorProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: successorBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'successor_draft_snapshot_not_current' })
  })

  it('refuses first-publication authoring while a cited source has a pending snapshot', async () => {
    await db.insert(developmentProgrammes).values({
      id: pendingProgrammeId,
      drugId,
      slug: id('pending-programme-slug'),
      title: 'Pending-source first-publication fixture programme',
      indication: 'Condition beta',
      targetPopulation: 'Adults with condition beta',
      status: 'COMPLETED',
      highestPhaseReached: 'Phase 2',
      route: 'Oral',
      doseExposureContext: 'The exposure recorded in the pending-source trial.',
      updateStatus: 'REVIEW_REQUIRED',
    })
    await db.insert(programmeTrials).values({
      id: pendingTrialId,
      programmeId: pendingProgrammeId,
      trialIdentifier: `${nctId}-PENDING`,
      title: 'Pending-source normalized trial',
      phase: 'Phase 2',
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      enrolment: 50,
      enrolmentType: 'ACTUAL',
      humanStudyStatus: 'YES',
      registrySourceId: sourceId,
      registrySnapshotId: snapshotId,
      lastVerifiedAt: todayStart,
    })
    await db.insert(programmeFreshnessStates).values({
      programmeId: pendingProgrammeId,
      sourceId,
      currentSnapshotId: snapshotId,
      pendingSnapshotId,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'NEW_EVIDENCE',
      lastCheckAttemptAt: todayStart,
      lastSuccessfulCheckAt: todayStart,
      lastVerifiedAt: todayStart,
      nextCheckDueAt: nextMonth,
    })

    const pendingBundle = addOptionalGraphCoverage(
      firstVerdictBundleFixture({
        programmeId: pendingProgrammeId,
        programmeTrialId: pendingTrialId,
        sourceSnapshotId: snapshotId,
      }),
    )
    await expect(
      authorFirstProgrammeVerdictDraft({
        actorUserId: actorId,
        bundle: pendingBundle,
        commit: true,
      }),
    ).rejects.toMatchObject({ code: 'first_draft_snapshot_not_current' })

    await db.delete(developmentProgrammes).where(eq(developmentProgrammes.id, pendingProgrammeId))
  })
})

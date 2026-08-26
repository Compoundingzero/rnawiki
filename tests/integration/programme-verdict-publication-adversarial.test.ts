import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  drugs,
  evidenceReviewTasks,
  evidenceNodeClaims,
  evidenceNodes,
  evidenceSources,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
  programmeVerdictInterpretabilityAssessments,
  programmeVerdictMechanismStepClaims,
  programmeVerdictMechanismSteps,
  programmeVerdictReviewerQualificationEvents,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTrialSnapshots,
  programmeVerdictTrials,
  programmeVerdictTimelineEventClaims,
  programmeVerdictTimelineEvents,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
  users,
} from '@/db/schema'
import {
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
  STUDY_INTERPRETABILITY_CRITERIA,
  type StoppedProgrammeVerdict,
  type StudyInterpretabilityCriterion,
} from '@/lib/evidence/types'
import * as publicationModule from '@/lib/queries/programme-verdict-publication'
import { buildLockedProgrammeVerdictProposal } from '@/lib/queries/programme-verdict-proposal'
import {
  adjudicateProgrammeVerdict,
  getProgrammeVerdictWorkflowState,
  submitProgrammeVerdictReview,
} from '@/lib/queries/programme-verdict-workflow'
import { createProgrammeVerdictDraftFromCurrentPublication } from '@/lib/queries/programme-verdict-drafts'
import { getProgrammeEvidenceByMedicineSlug } from '@/lib/queries/programme-evidence'
import { countProgrammeEvidence } from '@/lib/queries/drugs'
import { getPublicMedicineProjections } from '@/lib/queries/public-medicine-projection'
import {
  getPublicProgrammePresentationForRevision,
  prepareDraftProgrammePresentation,
  replaceDraftProgrammePresentation,
  type ProgrammePresentationReplaceInput,
} from '@/lib/queries/programme-presentation'
import {
  EVIDENCE_ENGINE_VERSION,
  EVIDENCE_PRESENTATION_ENGINE_VERSION,
} from '@/lib/rna-intelligence'
import { listCanonicalQueueCandidates } from '@/lib/queries/programme-verdict-queue'
import { loadMedicinePublicationIndexabilityReports } from '@/lib/seo/publication-indexability'

interface PreparedProposal {
  revisionId: string
  programmeId: string
  proposalDigestAlgorithm: 'sha256'
  proposalDigest: string
  engineVersion: string
  inputDigestAlgorithm: 'sha256'
  inputDigest: string
}

interface Fixture {
  programmeId: string
  trialId: string
  claimId: string
  revisionId: string
}

interface CandidateOptions {
  verdictCode?: StoppedProgrammeVerdict | null
  programmeStatusAtReview?: 'STOPPED' | 'WITHDRAWN'
  revisionNumber?: number
  previousRevisionId?: string | null
  publicLabel?: string
  trialScope?: string
  indicationScope?: string
  populationScope?: string
  doseExposureScope?: string
}

interface ExtendedBundle {
  nodeId: string
  assessmentId: string
  assessmentIds: string[]
  assessmentIdsByCriterion: Record<StudyInterpretabilityCriterion, string>
}

const runKey = randomUUID().slice(0, 8)
const drugId = `pva-drug-${runKey}`
const authorId = `pva-author-${runKey}`
const reviewerAId = `pva-reviewer-a-${runKey}`
const reviewerBId = `pva-reviewer-b-${runKey}`
const qualificationAuthorizerId = `pva-qualification-authorizer-${runKey}`
const adjudicatorId = `pva-adjudicator-${runKey}`
const secondDrugId = `pva-drug-scope-${runKey}`

// Source snapshots are immutable, so these stable fixture rows are deliberately reusable between
// test runs. Programme-scoped links/tasks are still unique and are removed with the test drug.
const sourceId = 'pva-shared-clinical-trial-source'
const currentSnapshotId = 'pva-shared-source-snapshot-current'
const pendingSnapshotId = 'pva-shared-source-snapshot-pending'

const SUMMARY_TEXT = {
  plainMechanism: 'The programme was designed to change the intended biological pathway',
  bestSupportedFinding: 'People received the medicine in the registered clinical study',
  mainLimitation: 'The stopped study did not give a clear patient outcome answer',
} as const

let nextId = 0
function fixtureId(kind: string): string {
  nextId += 1
  return `pva-${kind}-${runKey}-${nextId}`.slice(0, 64)
}

function prepareProgrammeVerdictProposal(revisionId: string): Promise<PreparedProposal> {
  const prepare = (
    publicationModule as unknown as {
      prepareProgrammeVerdictProposal?: (id: string) => Promise<PreparedProposal>
    }
  ).prepareProgrammeVerdictProposal

  if (!prepare) {
    throw new Error('prepareProgrammeVerdictProposal must be exported by the publication service.')
  }
  return prepare(revisionId)
}

function publishProgrammeVerdictRevision(revisionId: string, expectedProposalDigest: string) {
  return publicationModule.publishProgrammeVerdictRevision({
    revisionId,
    publisherUserId: qualificationAuthorizerId,
    expectedProposalDigest,
  })
}

async function insertCandidate(
  fixture: Pick<Fixture, 'programmeId' | 'trialId' | 'claimId'> & Partial<ExtendedBundle>,
  options: CandidateOptions = {},
): Promise<string> {
  const revisionId = fixtureId('verdict')
  const revisionNumber = options.revisionNumber ?? 1

  await db.insert(programmeVerdictRevisions).values({
    id: revisionId,
    programmeId: fixture.programmeId,
    revisionNumber,
    previousVerdictRevisionId: options.previousRevisionId ?? null,
    reviewStatus: 'DRAFT',
    programmeStatusAtReview: options.programmeStatusAtReview ?? 'STOPPED',
    verdictCode:
      options.verdictCode === undefined ? ('TEST_UNANSWERED' as const) : options.verdictCode,
    proposalAsOfDate: '2026-08-22',
    publicLabel: options.publicLabel ?? 'The study did not give a clear answer',
    professionalLabel: 'Inconclusive or operationally terminated programme',
    indicationScope: options.indicationScope ?? 'Condition alpha',
    populationScope:
      options.populationScope ??
      'Adults with confirmed condition alpha after prior standard therapy',
    doseExposureScope: options.doseExposureScope ?? 'Studied intravenous exposure range',
    periodScope: '2024 to 2026',
    trialScope: options.trialScope ?? fixture.trialId,
    outcomeScope: 'Prespecified patient outcome at the primary timepoint',
    plainMechanism: SUMMARY_TEXT.plainMechanism,
    bestSupportedFinding: SUMMARY_TEXT.bestSupportedFinding,
    mainLimitation: SUMMARY_TEXT.mainLimitation,
    oneSentenceReason: 'The study design did not establish the prespecified patient outcome.',
    whatWasDisproven: ['No patient outcome conclusion was established.'],
    whatWasNotDisproven: ['The biological target was not disproven.'],
    whatRemainsUnknown: ['Whether another candidate could produce a patient benefit.'],
    confidence: 'MODERATE',
    confidenceExplanation: 'The registered study stopped without an interpretable outcome.',
    conditionsThatWouldChangeVerdict: [
      'A complete, interpretable patient outcome result would change this conclusion.',
    ],
    authorUserId: authorId,
    authorName: 'Programme author',
    conflictsOfInterest: 'None declared',
  })

  await db.insert(programmeVerdictClaims).values({
    programmeId: fixture.programmeId,
    verdictRevisionId: revisionId,
    claimId: fixture.claimId,
    relationship: 'SUPPORTING',
  })
  await db.insert(programmeVerdictTrials).values({
    programmeId: fixture.programmeId,
    verdictRevisionId: revisionId,
    programmeTrialId: fixture.trialId,
  })
  if (fixture.nodeId) {
    await db.insert(programmeVerdictEvidenceNodes).values({
      programmeId: fixture.programmeId,
      verdictRevisionId: revisionId,
      evidenceNodeId: fixture.nodeId,
    })
  }
  const assessmentIds =
    fixture.assessmentIds ?? (fixture.assessmentId ? [fixture.assessmentId] : [])
  if (assessmentIds.length > 0) {
    await db.insert(programmeVerdictInterpretabilityAssessments).values(
      assessmentIds.map((assessmentId) => ({
        programmeId: fixture.programmeId,
        verdictRevisionId: revisionId,
        assessmentId,
      })),
    )
  }

  const dependencies = [
    ...PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath) => ({
      dependentSurfaceType: 'PROGRAMME_SUMMARY' as const,
      fieldPath,
    })),
    ...PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath) => ({
      dependentSurfaceType: 'VERDICT' as const,
      fieldPath,
    })),
  ]
  await db.insert(programmeDependencies).values(
    dependencies.map((dependency) => ({
      id: fixtureId('dependency'),
      programmeId: fixture.programmeId,
      claimId: fixture.claimId,
      verdictRevisionId: revisionId,
      dependentSurfaceType: dependency.dependentSurfaceType,
      fieldPath: dependency.fieldPath,
      impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
    })),
  )

  return revisionId
}

async function createFixture(
  label: string,
  options: CandidateOptions = {},
  medicineId = drugId,
): Promise<Fixture> {
  const programmeId = fixtureId(`programme-${label}`)
  const trialId = fixtureId(`trial-${label}`)
  const claimId = fixtureId(`claim-${label}`)

  await db.insert(developmentProgrammes).values({
    id: programmeId,
    drugId: medicineId,
    slug: programmeId,
    title: `${label} programme`,
    indication: 'Condition alpha',
    targetPopulation: 'Adults with confirmed condition alpha after prior standard therapy',
    status: 'STOPPED',
    route: 'Intravenous',
    doseExposureContext: 'Studied intravenous exposure range',
    stoppingReasonCategory: 'OPERATIONAL_EXECUTION',
  })
  await db.insert(programmeTrials).values({
    id: trialId,
    programmeId,
    trialIdentifier: `NCT-PVA-${runKey}-${nextId}`,
    title: 'Stopped registered clinical study',
    status: 'TERMINATED',
    enrolmentType: 'ACTUAL',
    humanStudyStatus: 'YES',
  })
  await db.insert(claims).values({
    id: claimId,
    programmeId,
    claimKey: 'test-unanswered',
    revisionNumber: 1,
    nature: 'RNAWIKI_JUDGEMENT',
    evidenceNodeType: 'PATIENT_OUTCOME',
    direction: 'NOT_APPLICABLE',
    reviewStatus: 'PUBLISHED',
    plainLanguageText: 'The stopped study did not answer the patient outcome question.',
    reviewerInterpretation: 'The programme remains scientifically unanswered.',
    authorUserId: authorId,
    publishedAt: new Date('2026-08-20T00:00:00.000Z'),
  })

  const revisionId = await insertCandidate({ programmeId, trialId, claimId }, options)
  return { programmeId, trialId, claimId, revisionId }
}

async function attachExtendedBundle(
  fixture: Fixture,
  options: {
    reviewStatus?: 'DRAFT' | 'PUBLISHED'
    previousNodeId?: string | null
    previousAssessmentId?: string | null
    previousAssessmentIdsByCriterion?: Partial<Record<StudyInterpretabilityCriterion, string>>
    claimId?: string
  } = {},
): Promise<ExtendedBundle> {
  const reviewStatus = options.reviewStatus ?? 'PUBLISHED'
  const claimId = options.claimId ?? fixture.claimId
  const nodeId = fixtureId('node')
  const assessmentIdsByCriterion = Object.fromEntries(
    STUDY_INTERPRETABILITY_CRITERIA.map((criterion) => [
      criterion,
      fixtureId(`assessment-${criterion.toLocaleLowerCase('en-US')}`),
    ]),
  ) as Record<StudyInterpretabilityCriterion, string>
  const assessmentId = assessmentIdsByCriterion.STATISTICAL_POWER
  const publicationDates =
    reviewStatus === 'PUBLISHED' ? { publishedAt: new Date('2026-08-20T00:00:00.000Z') } : {}

  await db.insert(evidenceNodes).values({
    id: nodeId,
    programmeId: fixture.programmeId,
    nodeType: 'PATIENT_OUTCOME',
    revisionNumber: options.previousNodeId ? 2 : 1,
    previousEvidenceNodeId: options.previousNodeId ?? null,
    state: 'UNKNOWN',
    reviewStatus,
    plainSummary: 'The registered study did not establish the patient outcome.',
    professionalSummary: 'The prespecified patient outcome remained uninterpretable.',
    rationale: 'The outcome dataset was not sufficient for a directional conclusion.',
    authorUserId: authorId,
    ...publicationDates,
  })
  await db.insert(evidenceNodeClaims).values({
    programmeId: fixture.programmeId,
    evidenceNodeId: nodeId,
    claimId,
    relationship: 'SUPPORTS',
  })

  await db.transaction(async (tx) => {
    await tx.insert(trialInterpretabilityAssessments).values(
      STUDY_INTERPRETABILITY_CRITERIA.map((criterion) => {
        const previousAssessmentId =
          options.previousAssessmentIdsByCriterion?.[criterion] ??
          (criterion === 'STATISTICAL_POWER' ? options.previousAssessmentId : undefined)
        return {
          id: assessmentIdsByCriterion[criterion],
          programmeId: fixture.programmeId,
          programmeTrialId: fixture.trialId,
          criterion,
          state:
            criterion === 'STATISTICAL_POWER' ? ('UNCLEAR' as const) : ('NOT_REPORTED' as const),
          revisionNumber: previousAssessmentId ? 2 : 1,
          previousAssessmentId: previousAssessmentId ?? null,
          reviewStatus,
          explanation: `The reviewed record supports the ${criterion.toLocaleLowerCase('en-US')} answer.`,
          authorUserId: authorId,
          ...publicationDates,
        }
      }),
    )
    await tx.insert(trialInterpretabilityClaims).values(
      STUDY_INTERPRETABILITY_CRITERIA.map((criterion) => ({
        programmeId: fixture.programmeId,
        assessmentId: assessmentIdsByCriterion[criterion],
        claimId,
        relationship: 'SUPPORTS' as const,
      })),
    )
  })

  return {
    nodeId,
    assessmentId,
    assessmentIds: STUDY_INTERPRETABILITY_CRITERIA.map(
      (criterion) => assessmentIdsByCriterion[criterion],
    ),
    assessmentIdsByCriterion,
  }
}

async function addApprovals(
  revisionId: string,
  prepared: PreparedProposal,
  proposalDigest = prepared.proposalDigest,
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(programmeVerdictReviews).values(
      [reviewerAId, reviewerBId].map((reviewerUserId, index) => ({
        id: fixtureId('review'),
        verdictRevisionId: revisionId,
        reviewerUserId,
        reviewerName: index === 0 ? 'Reviewer A' : 'Reviewer B',
        decision: 'APPROVE' as const,
        isIndependent: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        expertiseTags: ['BIOSTATISTICS' as const],
        proposalDigestAlgorithm: prepared.proposalDigestAlgorithm,
        proposalDigest,
        engineVersion: prepared.engineVersion,
        inputDigestAlgorithm: prepared.inputDigestAlgorithm,
        inputDigest: prepared.inputDigest,
        reviewedAt: new Date(`2026-08-22T0${index + 1}:00:00.000Z`),
      })),
    )
    await tx
      .update(programmeVerdictRevisions)
      .set({ reviewStatus: 'APPROVED' })
      .where(eq(programmeVerdictRevisions.id, revisionId))
  })
}

async function submitCanonicalDecision(args: {
  revisionId: string
  proposalDigest: string
  reviewerUserId: string
  decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT'
}) {
  return submitProgrammeVerdictReview({
    revisionId: args.revisionId,
    reviewerUserId: args.reviewerUserId,
    expectedProposalDigest: args.proposalDigest,
    decision: args.decision,
    expertiseTags: ['BIOSTATISTICS'],
    isIndependent: true,
    conflictsOfInterest: 'None declared',
    conflictsOfInterestAttested: true,
    ...(args.decision === 'APPROVE'
      ? {}
      : { reviewNote: `This exact candidate requires ${args.decision.toLowerCase()} closure.` }),
  })
}

async function prepareApproveAndPublish(fixture: Fixture): Promise<PreparedProposal> {
  const prepared = await prepareProgrammeVerdictProposal(fixture.revisionId)
  await addApprovals(fixture.revisionId, prepared)
  await publishProgrammeVerdictRevision(fixture.revisionId, prepared.proposalDigest)
  return prepared
}

async function createPreparedReplacement(label: string) {
  const fixture = await createFixture(label)
  await prepareApproveAndPublish(fixture)
  const revisionId = await insertCandidate(
    {
      programmeId: fixture.programmeId,
      trialId: fixture.trialId,
      claimId: fixture.claimId,
    },
    { revisionNumber: 2, previousRevisionId: fixture.revisionId },
  )
  const prepared = await prepareProgrammeVerdictProposal(revisionId)
  return { fixture, revisionId, prepared }
}

async function citeCurrentSource(fixture: Fixture, withPendingSnapshot: boolean): Promise<void> {
  await db.insert(claimSourceLinks).values({
    programmeId: fixture.programmeId,
    claimId: fixture.claimId,
    sourceSnapshotId: currentSnapshotId,
    relationship: 'SUPPORTS',
  })
  await db.insert(programmeFreshnessStates).values({
    programmeId: fixture.programmeId,
    sourceId,
    currentSnapshotId,
    pendingSnapshotId: withPendingSnapshot ? pendingSnapshotId : null,
    checkStatus: 'SUCCEEDED',
    freshnessStatus: withPendingSnapshot ? 'NEW_EVIDENCE' : 'CURRENT',
    lastSuccessfulCheckAt: new Date('2026-08-22T00:00:00.000Z'),
    ...(withPendingSnapshot ? { newEvidenceDetectedAt: new Date('2026-08-22T00:00:00.000Z') } : {}),
  })
}

async function rejected(action: () => Promise<unknown>): Promise<boolean> {
  try {
    await action()
    return false
  } catch {
    return true
  }
}

beforeAll(async () => {
  await db.insert(users).values([
    {
      id: authorId,
      email: `${authorId}@example.test`,
      passwordHash: 'not-used-by-this-test',
      name: 'Programme author',
      handle: authorId,
    },
    {
      id: reviewerAId,
      email: `${reviewerAId}@example.test`,
      passwordHash: 'not-used-by-this-test',
      name: 'Reviewer A',
      handle: reviewerAId,
      trustTier: 'trusted',
    },
    {
      id: reviewerBId,
      email: `${reviewerBId}@example.test`,
      passwordHash: 'not-used-by-this-test',
      name: 'Reviewer B',
      handle: reviewerBId,
      trustTier: 'trusted',
    },
    {
      id: qualificationAuthorizerId,
      email: `${qualificationAuthorizerId}@example.test`,
      passwordHash: 'not-used-by-this-test',
      name: 'Qualification authorizer',
      handle: qualificationAuthorizerId,
      trustTier: 'steward',
      isAdmin: true,
    },
    {
      id: adjudicatorId,
      email: `${adjudicatorId}@example.test`,
      passwordHash: 'not-used-by-this-test',
      name: 'Adverse decision adjudicator',
      handle: adjudicatorId,
      trustTier: 'steward',
    },
  ])
  await db.insert(programmeVerdictReviewerQualificationEvents).values([
    {
      id: fixtureId('qualification-a'),
      reviewerUserId: reviewerAId,
      expertiseTag: 'BIOSTATISTICS',
      action: 'GRANT',
      authorizedByUserId: qualificationAuthorizerId,
      reason: 'Synthetic adversarial publication reviewer qualification.',
    },
    {
      id: fixtureId('qualification-b'),
      reviewerUserId: reviewerBId,
      expertiseTag: 'BIOSTATISTICS',
      action: 'GRANT',
      authorizedByUserId: qualificationAuthorizerId,
      reason: 'Synthetic adversarial publication reviewer qualification.',
    },
    {
      id: fixtureId('qualification-adjudicator'),
      reviewerUserId: adjudicatorId,
      expertiseTag: 'REGULATORY_SCIENCE',
      action: 'GRANT',
      authorizedByUserId: qualificationAuthorizerId,
      reason: 'Synthetic adversarial publication adjudicator qualification.',
    },
  ])
  await db.insert(drugs).values({
    id: drugId,
    slug: drugId,
    name: 'Adversarial programme publication medicine',
    modality: 'Small Molecule',
    approvalStatus: 'Phase 2 Investigational',
  })
  await db.insert(drugs).values({
    id: secondDrugId,
    slug: secondDrugId,
    name: 'Scope mutation target medicine',
    modality: 'Small Molecule',
    approvalStatus: 'Pre-clinical / Open Source',
  })

  await db
    .insert(evidenceSources)
    .values({
      id: sourceId,
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      externalIdentifier: 'NCT-PVA-SHARED-SOURCE',
      canonicalLocator: 'https://clinicaltrials.gov/study/NCT-PVA-SHARED-SOURCE',
      title: 'Reusable adversarial publication source',
      publisher: 'ClinicalTrials.gov',
      publicationDate: '2026-08-01',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    .onConflictDoUpdate({
      target: evidenceSources.id,
      set: {
        sourceType: 'CLINICAL_TRIAL_REGISTRY',
        externalIdentifier: 'NCT-PVA-SHARED-SOURCE',
        canonicalLocator: 'https://clinicaltrials.gov/study/NCT-PVA-SHARED-SOURCE',
        title: 'Reusable adversarial publication source',
        publisher: 'ClinicalTrials.gov',
        sponsor: null,
        publicationDate: '2026-08-01',
        correctionStatus: 'CURRENT',
        jurisdiction: null,
        hierarchy: 'PRIMARY',
        updatedAt: new Date(),
      },
    })
  await db
    .insert(sourceSnapshots)
    .values([
      {
        id: currentSnapshotId,
        sourceId,
        retrievedAt: new Date('2026-08-20T00:00:00.000Z'),
        lastVerifiedAt: new Date('2026-08-20T00:00:00.000Z'),
        contentHash: 'a'.repeat(64),
        structuredData: { status: 'TERMINATED' },
      },
      {
        id: pendingSnapshotId,
        sourceId,
        previousSnapshotId: currentSnapshotId,
        retrievedAt: new Date('2026-08-22T00:00:00.000Z'),
        lastVerifiedAt: new Date('2026-08-22T00:00:00.000Z'),
        contentHash: 'b'.repeat(64),
        structuredData: { status: 'TERMINATED', resultsPosted: true },
      },
    ])
    .onConflictDoNothing()
})

afterAll(async () => {
  await db.delete(drugs).where(inArray(drugs.id, [drugId, secondDrugId]))
  // Qualification decisions are immutable audit records, so their principals intentionally remain
  // in this disposable integration database. The unqualified programme author can be removed.
  await db.delete(users).where(eq(users.id, authorId))
})

describe('adversarial programme verdict publication', () => {
  it('keeps the canonical default aligned to stable programme identity when live titles change', async () => {
    const tieMedicineId = fixtureId('immutable-title-tie-medicine')
    const equalPublishedAt = new Date('2026-08-25T08:00:00.000Z')

    await db.insert(drugs).values({
      id: tieMedicineId,
      slug: tieMedicineId,
      name: 'Immutable title tie-break medicine',
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })

    try {
      const alphabeticallyFirst = await createFixture('aaa-immutable-title', {}, tieMedicineId)
      const alphabeticallySecond = await createFixture('zzz-immutable-title', {}, tieMedicineId)

      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(equalPublishedAt)
      try {
        await prepareApproveAndPublish(alphabeticallyFirst)
        await prepareApproveAndPublish(alphabeticallySecond)
      } finally {
        vi.useRealTimers()
      }

      const tiedPublications = await db
        .select({ publishedAt: programmeCurrentPublications.publishedAt })
        .from(programmeCurrentPublications)
        .where(
          inArray(programmeCurrentPublications.programmeId, [
            alphabeticallyFirst.programmeId,
            alphabeticallySecond.programmeId,
          ]),
        )
      expect(tiedPublications).toHaveLength(2)
      expect(new Set(tiedPublications.map((row) => row.publishedAt.toISOString()))).toEqual(
        new Set([equalPublishedAt.toISOString()]),
      )

      await db.transaction(async (tx) => {
        await tx
          .update(developmentProgrammes)
          .set({ title: 'ZZZ staged live title' })
          .where(eq(developmentProgrammes.id, alphabeticallyFirst.programmeId))
        await tx
          .update(developmentProgrammes)
          .set({ title: 'AAA staged live title' })
          .where(eq(developmentProgrammes.id, alphabeticallySecond.programmeId))
      })

      const [dossier, projection, indexingReports] = await Promise.all([
        getProgrammeEvidenceByMedicineSlug(tieMedicineId),
        getPublicMedicineProjections([tieMedicineId]),
        loadMedicinePublicationIndexabilityReports(equalPublishedAt),
      ])

      expect(dossier?.selectedProgramme).toMatchObject({
        id: alphabeticallyFirst.programmeId,
        title: 'aaa-immutable-title programme',
      })
      expect(projection.get(tieMedicineId)?.programmes[0]).toMatchObject({
        id: alphabeticallyFirst.programmeId,
        title: 'aaa-immutable-title programme',
      })
      expect(
        indexingReports.find((report) => report.medicineId === tieMedicineId)?.selectedProgrammeId,
      ).toBe(alphabeticallyFirst.programmeId)
    } finally {
      vi.useRealTimers()
      await db.delete(drugs).where(eq(drugs.id, tieMedicineId))
    }
  })

  it('publishes and reads an exact presentation/v1 mechanism and sourced timeline bundle', async () => {
    const fixture = await createFixture('presentation-v1-publication')
    await citeCurrentSource(fixture, false)
    const presentationOnlySourceId = fixtureId('presentation-only-source')
    const presentationOnlySnapshotId = fixtureId('presentation-only-snapshot')
    await db.insert(evidenceSources).values({
      id: presentationOnlySourceId,
      sourceType: 'PEER_REVIEWED_PUBLICATION',
      externalIdentifier: `doi:10.0000/${presentationOnlySourceId}`,
      canonicalLocator: `https://doi.org/10.0000/${presentationOnlySourceId}`,
      title: 'Exact source used only by one mechanism relationship',
      publisher: 'Synthetic integration journal',
      publicationDate: '2026-08-20',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    await db.insert(sourceSnapshots).values({
      id: presentationOnlySnapshotId,
      sourceId: presentationOnlySourceId,
      retrievedAt: new Date('2026-08-20T00:00:00.000Z'),
      lastVerifiedAt: new Date('2026-08-20T00:00:00.000Z'),
      contentHash: 'd'.repeat(64),
      structuredData: { presentationOnly: true },
      rawSnapshotLocator: `https://doi.org/10.0000/${presentationOnlySourceId}`,
    })
    await db.insert(programmeFreshnessStates).values({
      programmeId: fixture.programmeId,
      sourceId: presentationOnlySourceId,
      currentSnapshotId: presentationOnlySnapshotId,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      lastCheckAttemptAt: new Date('2026-08-20T00:00:00.000Z'),
      lastSuccessfulCheckAt: new Date('2026-08-20T00:00:00.000Z'),
      lastVerifiedAt: new Date('2026-08-20T00:00:00.000Z'),
      nextCheckDueAt: new Date('2026-09-20T00:00:00.000Z'),
    })
    const contradictingClaimId = fixtureId('presentation-only-contradiction')
    await db.insert(claims).values({
      id: contradictingClaimId,
      programmeId: fixture.programmeId,
      claimKey: 'presentation-only-contradiction',
      revisionNumber: 1,
      nature: 'MEASURED',
      evidenceNodeType: 'HUMAN_EXPOSURE',
      direction: 'NOT_APPLICABLE',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'The saved result did not establish delivery to the intended tissue.',
      reviewerInterpretation: 'This claim contradicts the displayed delivery stage.',
      authorUserId: authorId,
    })
    await db.insert(claimSourceLinks).values({
      programmeId: fixture.programmeId,
      claimId: contradictingClaimId,
      sourceSnapshotId: presentationOnlySnapshotId,
      relationship: 'SUPPORTS',
    })
    await db
      .update(claims)
      .set({
        reviewStatus: 'PUBLISHED',
        publishedAt: new Date('2026-08-20T00:00:00.000Z'),
      })
      .where(eq(claims.id, contradictingClaimId))
    const presentationBundle = {
      mechanismSteps: [
        {
          stepKey: 'delivery_stage',
          stepOrder: 1,
          plainTitle: 'The medicine reached participants',
          plainDescription: 'The clinical study recorded exposure after the medicine was given.',
          technicalDescription: 'Human exposure was recorded in the scoped clinical trial.',
          evidenceBasis: 'UNKNOWN',
          claimLinks: [
            { claimId: fixture.claimId, relationship: 'SUPPORTS' },
            { claimId: contradictingClaimId, relationship: 'CONTRADICTS' },
          ],
        },
        {
          stepKey: 'pathway',
          stepOrder: 2,
          plainTitle: 'The intended pathway was assessed',
          plainDescription: 'The reviewed claim describes the pathway tested in this programme.',
          evidenceBasis: 'UNKNOWN',
          claimLinks: [{ claimId: fixture.claimId, relationship: 'QUALIFIES' }],
        },
        {
          stepKey: 'outcome',
          stepOrder: 3,
          plainTitle: 'The result needs its study context',
          plainDescription: 'The finding applies only to the people, dose, and outcome studied.',
          evidenceBasis: 'UNKNOWN',
          claimLinks: [{ claimId: fixture.claimId, relationship: 'SUPPORTS' }],
        },
      ],
      timelineEvents: [
        {
          eventKey: 'important-result',
          eventDate: '2026-08-20',
          eventType: 'IMPORTANT_RESULT',
          dateBasis: 'ACTUAL',
          plainTitle: 'The reviewed result became available',
          plainDescription: 'The exact saved source version contains the reviewed study result.',
          technicalDescription: 'This event is bound to the current immutable registry snapshot.',
          programmeTrialId: fixture.trialId,
          sourceId,
          sourceSnapshotId: currentSnapshotId,
          claimLinks: [{ claimId: fixture.claimId, relationship: 'SUPPORTS' }],
        },
      ],
    } satisfies ProgrammePresentationReplaceInput
    await replaceDraftProgrammePresentation({
      revisionId: fixture.revisionId,
      actorUserId: qualificationAuthorizerId,
      presentation: presentationBundle,
    })
    const presentationDependencies = await db
      .select()
      .from(programmeDependencies)
      .where(eq(programmeDependencies.verdictRevisionId, fixture.revisionId))
    expect(presentationDependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claimId: contradictingClaimId,
          dependentSurfaceType: 'MECHANISM_MAP',
          fieldPath: 'mechanism.delivery_stage.plainDescription',
        }),
      ]),
    )
    const contradictionDependency = presentationDependencies.find(
      (dependency) =>
        dependency.claimId === contradictingClaimId &&
        dependency.dependentSurfaceType === 'MECHANISM_MAP',
    )
    if (!contradictionDependency) throw new Error('Missing contradiction dependency fixture row.')
    await db
      .delete(programmeDependencies)
      .where(eq(programmeDependencies.id, contradictionDependency.id))
    const wildcardLookalikeDependency = {
      ...contradictionDependency,
      id: fixtureId('presentation-wildcard-lookalike-dependency'),
      fieldPath: 'mechanism.deliveryXstage.plainDescription',
    }
    await db.insert(programmeDependencies).values(wildcardLookalikeDependency)
    const missingDependency = await db
      .execute(sql`SELECT rnawiki_assert_programme_presentation_v1(${fixture.revisionId})`)
      .then(
        () => null,
        (error: unknown) => error,
      )
    expect((missingDependency as { cause?: { message?: string } } | null)?.cause?.message).toMatch(
      /every mechanism relationship requires an exact verdict-scoped claim dependency/,
    )
    await db
      .delete(programmeDependencies)
      .where(eq(programmeDependencies.id, wildcardLookalikeDependency.id))
    await db.insert(programmeDependencies).values(contradictionDependency)
    await expect(
      prepareDraftProgrammePresentation({
        revisionId: fixture.revisionId,
        actorUserId: authorId,
      }),
    ).rejects.toMatchObject({ code: 'presentation_not_authorized' })
    const prepared = await prepareDraftProgrammePresentation({
      revisionId: fixture.revisionId,
      actorUserId: qualificationAuthorizerId,
    })
    expect(prepared.engineVersion).toBe(EVIDENCE_PRESENTATION_ENGINE_VERSION)
    await expect(
      replaceDraftProgrammePresentation({
        revisionId: fixture.revisionId,
        actorUserId: qualificationAuthorizerId,
        presentation: presentationBundle,
      }),
    ).rejects.toMatchObject({ code: 'presentation_frozen' })
    await addApprovals(fixture.revisionId, prepared)
    await publishProgrammeVerdictRevision(fixture.revisionId, prepared.proposalDigest)

    const presentation = await getPublicProgrammePresentationForRevision(fixture.revisionId)
    expect(presentation).toMatchObject({
      schemaVersion: 'programme-presentation/v1',
      verdictRevisionId: fixture.revisionId,
      mechanismSteps: [
        {
          stepKey: 'delivery_stage',
          stepOrder: 1,
          evidenceBasis: 'UNKNOWN',
          sources: expect.arrayContaining([
            expect.objectContaining({
              sourceSnapshotId: currentSnapshotId,
              claimBindings: expect.arrayContaining([
                expect.objectContaining({
                  claimId: fixture.claimId,
                  relationship: 'SUPPORTS',
                }),
              ]),
            }),
            expect.objectContaining({
              sourceSnapshotId: presentationOnlySnapshotId,
              claimBindings: expect.arrayContaining([
                expect.objectContaining({
                  claimId: contradictingClaimId,
                  relationship: 'CONTRADICTS',
                  plainLanguageText:
                    'The saved result did not establish delivery to the intended tissue.',
                }),
              ]),
            }),
          ]),
        },
        { stepKey: 'pathway', stepOrder: 2, evidenceBasis: 'UNKNOWN' },
        { stepKey: 'outcome', stepOrder: 3, evidenceBasis: 'UNKNOWN' },
      ],
      timelineEvents: [
        {
          eventKey: 'important-result',
          source: {
            sourceId,
            sourceSnapshotId: currentSnapshotId,
            contentHash: 'a'.repeat(64),
          },
        },
      ],
    })
    const evidence = await getProgrammeEvidenceByMedicineSlug(drugId, fixture.programmeId)
    expect(evidence?.selectedProgramme?.claims.map((claim) => claim.id)).toContain(
      contradictingClaimId,
    )
    expect(evidence?.selectedProgramme?.verdict?.claimRelationships).toEqual(
      expect.arrayContaining([{ claimId: fixture.claimId, relationship: 'SUPPORTING' }]),
    )
    expect(
      evidence?.selectedProgramme?.summaryFieldDependencies.map((dependency) => ({
        fieldPath: dependency.fieldPath,
        claimId: dependency.claimId,
        verdictRevisionId: dependency.verdictRevisionId,
      })),
    ).toEqual(
      expect.arrayContaining([
        {
          fieldPath: 'summary.plainMechanism',
          claimId: fixture.claimId,
          verdictRevisionId: fixture.revisionId,
        },
        {
          fieldPath: 'summary.bestSupportedFinding',
          claimId: fixture.claimId,
          verdictRevisionId: fixture.revisionId,
        },
        {
          fieldPath: 'summary.mainLimitation',
          claimId: fixture.claimId,
          verdictRevisionId: fixture.revisionId,
        },
      ]),
    )
    expect(
      (await getPublicMedicineProjections([drugId]))
        .get(drugId)
        ?.programmes.find((programme) => programme.id === fixture.programmeId)?.currentPublication
        ?.sourceSnapshotIds,
    ).toEqual(expect.arrayContaining([presentationOnlySnapshotId]))

    await expect(
      createProgrammeVerdictDraftFromCurrentPublication({
        programmeId: fixture.programmeId,
        actorUserId: authorId,
        conflictsOfInterest: 'No conflicts declared.',
      }),
    ).rejects.toMatchObject({ code: 'draft_not_authorized' })

    const draft = await createProgrammeVerdictDraftFromCurrentPublication({
      programmeId: fixture.programmeId,
      actorUserId: qualificationAuthorizerId,
      conflictsOfInterest: 'No conflicts declared.',
    })
    expect(draft).toMatchObject({
      programmeId: fixture.programmeId,
      previousVerdictRevisionId: fixture.revisionId,
      reviewStatus: 'DRAFT',
      proposalPreparedAt: null,
      reused: false,
      presentationSchemaVersion: 'programme-presentation/v1',
    })
    await expect(
      createProgrammeVerdictDraftFromCurrentPublication({
        programmeId: fixture.programmeId,
        actorUserId: qualificationAuthorizerId,
        conflictsOfInterest: 'No conflicts declared.',
      }),
    ).resolves.toMatchObject({ revisionId: draft.revisionId, reused: true })
    await expect(
      createProgrammeVerdictDraftFromCurrentPublication({
        programmeId: fixture.programmeId,
        actorUserId: qualificationAuthorizerId,
        conflictsOfInterest: 'A different disclosure.',
      }),
    ).rejects.toMatchObject({ code: 'draft_request_conflict' })

    const [oldDependencies, newDependencies, oldSteps, newSteps, oldStepLinks, newStepLinks] =
      await Promise.all([
        db
          .select()
          .from(programmeDependencies)
          .where(eq(programmeDependencies.verdictRevisionId, fixture.revisionId)),
        db
          .select()
          .from(programmeDependencies)
          .where(eq(programmeDependencies.verdictRevisionId, draft.revisionId)),
        db
          .select()
          .from(programmeVerdictMechanismSteps)
          .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, fixture.revisionId)),
        db
          .select()
          .from(programmeVerdictMechanismSteps)
          .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, draft.revisionId)),
        db
          .select()
          .from(programmeVerdictMechanismStepClaims)
          .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, fixture.revisionId)),
        db
          .select()
          .from(programmeVerdictMechanismStepClaims)
          .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, draft.revisionId)),
      ])
    const dependencySemantics = (rows: typeof oldDependencies) =>
      rows
        .map(
          ({
            id: _id,
            verdictRevisionId: _revision,
            createdAt: _created,
            updatedAt: _updated,
            ...row
          }) => row,
        )
        .sort((left, right) =>
          `${left.dependentSurfaceType}:${left.fieldPath}:${left.claimId}`.localeCompare(
            `${right.dependentSurfaceType}:${right.fieldPath}:${right.claimId}`,
          ),
        )
    expect(dependencySemantics(newDependencies)).toEqual(dependencySemantics(oldDependencies))
    expect(
      newSteps.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row),
    ).toEqual(oldSteps.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row))
    expect(
      newStepLinks.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row),
    ).toEqual(
      oldStepLinks.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row),
    )

    const [oldEvents, newEvents, oldEventLinks, newEventLinks] = await Promise.all([
      db
        .select()
        .from(programmeVerdictTimelineEvents)
        .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, fixture.revisionId)),
      db
        .select()
        .from(programmeVerdictTimelineEvents)
        .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, draft.revisionId)),
      db
        .select()
        .from(programmeVerdictTimelineEventClaims)
        .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, fixture.revisionId)),
      db
        .select()
        .from(programmeVerdictTimelineEventClaims)
        .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, draft.revisionId)),
    ])
    expect(
      newEvents.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row),
    ).toEqual(oldEvents.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row))
    expect(
      newEventLinks.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row),
    ).toEqual(
      oldEventLinks.map(({ verdictRevisionId: _revision, createdAt: _created, ...row }) => row),
    )

    await replaceDraftProgrammePresentation({
      revisionId: draft.revisionId,
      actorUserId: qualificationAuthorizerId,
      presentation: presentationBundle,
    })
    const successorPrepared = await prepareDraftProgrammePresentation({
      revisionId: draft.revisionId,
      actorUserId: qualificationAuthorizerId,
    })
    const queue = await listCanonicalQueueCandidates({ limit: 100, offset: 0 })
    expect(queue.candidates).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: draft.revisionId, proposalId: null })]),
    )
    const workflow = await getProgrammeVerdictWorkflowState({
      revisionId: draft.revisionId,
      viewerUserId: reviewerAId,
    })
    expect(workflow).toMatchObject({
      revisionId: draft.revisionId,
      contributionProposalId: null,
      reviewEligibility: { canReview: true, reason: null },
      exactBundle: { presentation: { schemaVersion: 'programme-presentation/v1' } },
    })
    const authorWorkflow = await getProgrammeVerdictWorkflowState({
      revisionId: draft.revisionId,
      viewerUserId: qualificationAuthorizerId,
    })
    expect(authorWorkflow.reviewEligibility).toEqual({
      canReview: false,
      reason: 'The author of this version or its submitted correction cannot review it.',
    })
    await expect(
      submitProgrammeVerdictReview({
        revisionId: draft.revisionId,
        reviewerUserId: reviewerAId,
        expectedProposalDigest: successorPrepared.proposalDigest,
        decision: 'APPROVE',
        expertiseTags: ['BIOSTATISTICS'],
        isIndependent: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      }),
    ).resolves.toMatchObject({ verdictRevisionId: draft.revisionId })
    await expect(
      createProgrammeVerdictDraftFromCurrentPublication({
        programmeId: fixture.programmeId,
        actorUserId: qualificationAuthorizerId,
        conflictsOfInterest: 'No conflicts declared.',
      }),
    ).rejects.toMatchObject({ code: 'successor_candidate_exists' })
  })

  it('does not invent a first conclusion when no current publication exists', async () => {
    const fixture = await createFixture('draft-clone-needs-current')
    await expect(
      createProgrammeVerdictDraftFromCurrentPublication({
        programmeId: fixture.programmeId,
        actorUserId: qualificationAuthorizerId,
        conflictsOfInterest: 'No conflicts declared.',
      }),
    ).rejects.toMatchObject({ code: 'current_publication_required' })
  })

  it('rejects a mechanism presentation whose claim has only a non-supporting source link', async () => {
    const fixture = await createFixture('presentation-context-only-source')
    await db.insert(claimSourceLinks).values({
      programmeId: fixture.programmeId,
      claimId: fixture.claimId,
      sourceSnapshotId: currentSnapshotId,
      relationship: 'CONTEXT',
    })

    await expect(
      replaceDraftProgrammePresentation({
        revisionId: fixture.revisionId,
        actorUserId: qualificationAuthorizerId,
        presentation: {
          mechanismSteps: ['delivery', 'pathway', 'outcome'].map((stepKey, index) => ({
            stepKey,
            stepOrder: index + 1,
            plainTitle: `Reviewed mechanism stage ${index + 1}`,
            plainDescription: 'This stage is limited to the exact reviewed programme evidence.',
            evidenceBasis: 'UNKNOWN' as const,
            claimLinks: [{ claimId: fixture.claimId, relationship: 'SUPPORTS' as const }],
          })),
          timelineEvents: [],
        },
      }),
    ).rejects.toMatchObject({ code: 'presentation_claim_missing_source' })
  })

  it('requires steward or administrator authority for whole-presentation authoring', async () => {
    const fixture = await createFixture('presentation-authority')
    await expect(
      replaceDraftProgrammePresentation({
        revisionId: fixture.revisionId,
        actorUserId: authorId,
        presentation: {
          mechanismSteps: ['delivery', 'pathway', 'outcome'].map((stepKey, index) => ({
            stepKey,
            stepOrder: index + 1,
            plainTitle: `Authority test stage ${index + 1}`,
            plainDescription: 'An ordinary contributor cannot attach canonical presentation copy.',
            evidenceBasis: 'UNKNOWN' as const,
            claimLinks: [{ claimId: fixture.claimId, relationship: 'SUPPORTS' as const }],
          })),
          timelineEvents: [],
        },
      }),
    ).rejects.toMatchObject({ code: 'presentation_not_authorized' })
  })

  it('enforces presentation copy bounds at the database boundary', async () => {
    const fixture = await createFixture('presentation-db-copy-bounds')
    const stepBase = {
      verdictRevisionId: fixture.revisionId,
      programmeId: fixture.programmeId,
      stepOrder: 1,
      plainTitle: 'A bounded title',
      plainDescription: 'A bounded ordinary-language description.',
      technicalDescription: 'A bounded technical description.',
      evidenceBasis: 'UNKNOWN' as const,
    }
    for (const [field, value] of [
      ['plainTitle', 'x'.repeat(241)],
      ['plainDescription', 'x'.repeat(2_001)],
      ['technicalDescription', 'x'.repeat(4_001)],
    ] as const) {
      const error = await db
        .insert(programmeVerdictMechanismSteps)
        .values({ ...stepBase, stepKey: `too-long-${field.toLowerCase()}`, [field]: value })
        .then(
          () => null,
          (candidate: unknown) => candidate,
        )
      expect((error as { cause?: { code?: string } } | null)?.cause?.code).toBe('23514')
    }

    const eventBase = {
      verdictRevisionId: fixture.revisionId,
      programmeId: fixture.programmeId,
      eventDate: '2026-08-20',
      eventType: 'IMPORTANT_RESULT' as const,
      dateBasis: 'ACTUAL' as const,
      plainTitle: 'A bounded event title',
      plainDescription: 'A bounded ordinary-language event description.',
      technicalDescription: 'A bounded technical event description.',
      programmeTrialId: fixture.trialId,
      sourceId,
      sourceSnapshotId: currentSnapshotId,
    }
    for (const [field, value] of [
      ['plainTitle', 'x'.repeat(241)],
      ['plainDescription', 'x'.repeat(2_001)],
      ['technicalDescription', 'x'.repeat(4_001)],
    ] as const) {
      const error = await db
        .insert(programmeVerdictTimelineEvents)
        .values({ ...eventBase, eventKey: `too-long-${field.toLowerCase()}`, [field]: value })
        .then(
          () => null,
          (candidate: unknown) => candidate,
        )
      expect((error as { cause?: { code?: string } } | null)?.cause?.code).toBe('23514')
    }
  })

  it('enforces the one-hundred-event limit in direct database validation', async () => {
    const fixture = await createFixture('presentation-db-timeline-count')
    await db.insert(programmeVerdictMechanismSteps).values(
      ['delivery', 'target', 'outcome'].map((stepKey, index) => ({
        verdictRevisionId: fixture.revisionId,
        programmeId: fixture.programmeId,
        stepKey,
        stepOrder: index + 1,
        plainTitle: `Mechanism stage ${index + 1}`,
        plainDescription: 'This row exists so the direct database assertion reaches event count.',
        evidenceBasis: 'UNKNOWN' as const,
      })),
    )
    await db.insert(programmeVerdictTimelineEvents).values(
      Array.from({ length: 101 }, (_, index) => ({
        verdictRevisionId: fixture.revisionId,
        programmeId: fixture.programmeId,
        eventKey: `event-${String(index + 1).padStart(3, '0')}`,
        eventDate: '2026-08-20',
        eventType: 'IMPORTANT_RESULT' as const,
        dateBasis: 'ACTUAL' as const,
        plainTitle: `Reviewed event ${index + 1}`,
        plainDescription: 'This is a real sourced event row in a direct boundary test.',
        programmeTrialId: fixture.trialId,
        sourceId,
        sourceSnapshotId: currentSnapshotId,
      })),
    )

    const error = await db
      .execute(sql`SELECT rnawiki_assert_programme_presentation_v1(${fixture.revisionId})`)
      .then(
        () => null,
        (candidate: unknown) => candidate,
      )
    expect((error as { cause?: { message?: string } } | null)?.cause?.message).toMatch(
      /at most one hundred sourced timeline events/,
    )
  })

  it('rejects two relationships between the same presentation target and claim in PostgreSQL', async () => {
    const fixture = await createFixture('presentation-db-relationship-conflict')
    await db.insert(programmeVerdictMechanismSteps).values({
      verdictRevisionId: fixture.revisionId,
      programmeId: fixture.programmeId,
      stepKey: 'delivery',
      stepOrder: 1,
      plainTitle: 'Delivery',
      plainDescription: 'The exact stored claim is linked once to this stage.',
      evidenceBasis: 'UNKNOWN',
    })
    await db.insert(programmeVerdictMechanismStepClaims).values({
      verdictRevisionId: fixture.revisionId,
      programmeId: fixture.programmeId,
      stepKey: 'delivery',
      claimId: fixture.claimId,
      relationship: 'SUPPORTS',
    })

    const error = await db
      .insert(programmeVerdictMechanismStepClaims)
      .values({
        verdictRevisionId: fixture.revisionId,
        programmeId: fixture.programmeId,
        stepKey: 'delivery',
        claimId: fixture.claimId,
        relationship: 'CONTRADICTS',
      })
      .then(
        () => null,
        (candidate: unknown) => candidate,
      )
    expect((error as { cause?: { code?: string } } | null)?.cause?.code).toBe('23505')
  })

  it('does not publish a sponsor-reported claim as measured in people', async () => {
    const fixture = await createFixture('presentation-sponsor-report')
    await citeCurrentSource(fixture, false)
    const sponsorClaimId = fixtureId('sponsor-reported-claim')
    await db.insert(claims).values({
      id: sponsorClaimId,
      programmeId: fixture.programmeId,
      programmeTrialId: fixture.trialId,
      claimKey: 'sponsor-reported-human-result',
      revisionNumber: 1,
      nature: 'SPONSOR_REPORTED',
      evidenceNodeType: 'HUMAN_EXPOSURE',
      direction: 'NOT_APPLICABLE',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'The sponsor reported that participants received the medicine.',
      reviewerInterpretation: 'This is a sponsor report, not a direct measured-result claim.',
      authorUserId: authorId,
    })
    await db.insert(claimSourceLinks).values({
      programmeId: fixture.programmeId,
      claimId: sponsorClaimId,
      sourceSnapshotId: currentSnapshotId,
      relationship: 'SUPPORTS',
    })
    await db
      .update(claims)
      .set({
        reviewStatus: 'PUBLISHED',
        publishedAt: new Date('2026-08-20T00:00:00.000Z'),
      })
      .where(eq(claims.id, sponsorClaimId))
    await replaceDraftProgrammePresentation({
      revisionId: fixture.revisionId,
      actorUserId: qualificationAuthorizerId,
      presentation: {
        mechanismSteps: [
          {
            stepKey: 'reported-dose',
            stepOrder: 1,
            plainTitle: 'The sponsor reported human dosing',
            plainDescription: 'The available source contains the sponsor report.',
            evidenceBasis: 'MEASURED_IN_PEOPLE',
            claimLinks: [{ claimId: sponsorClaimId, relationship: 'SUPPORTS' }],
          },
          ...['scope', 'outcome'].map((stepKey, index) => ({
            stepKey,
            stepOrder: index + 2,
            plainTitle: `Reviewed context stage ${index + 2}`,
            plainDescription: 'This stage states only what the reviewed claim can support.',
            evidenceBasis: 'UNKNOWN' as const,
            claimLinks: [{ claimId: fixture.claimId, relationship: 'QUALIFIES' as const }],
          })),
        ],
        timelineEvents: [],
      },
    })

    const sqlRejection = await db
      .execute(sql`SELECT rnawiki_assert_programme_presentation_v1(${fixture.revisionId})`)
      .then(
        () => null,
        (error: unknown) => error,
      )
    expect((sqlRejection as { cause?: { message?: string } } | null)?.cause?.message).toMatch(
      /MEASURED_IN_PEOPLE requires a measured claim/,
    )
    await expect(
      prepareDraftProgrammePresentation({
        revisionId: fixture.revisionId,
        actorUserId: qualificationAuthorizerId,
      }),
    ).rejects.toMatchObject({ code: 'presentation_prepare_engine_blocked' })
  })

  it('does not label a human measurement as measured outside people', async () => {
    const fixture = await createFixture('presentation-human-not-outside')
    await citeCurrentSource(fixture, false)
    const humanMeasuredClaimId = fixtureId('human-measured-claim')
    await db.insert(claims).values({
      id: humanMeasuredClaimId,
      programmeId: fixture.programmeId,
      programmeTrialId: fixture.trialId,
      claimKey: 'human-measured-result',
      revisionNumber: 1,
      nature: 'MEASURED',
      evidenceNodeType: 'HUMAN_EXPOSURE',
      direction: 'NOT_APPLICABLE',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'Exposure was measured in participants in the reviewed human study.',
      reviewerInterpretation: 'This is a human measurement, not laboratory or non-human evidence.',
      authorUserId: authorId,
    })
    await db.insert(claimSourceLinks).values({
      programmeId: fixture.programmeId,
      claimId: humanMeasuredClaimId,
      sourceSnapshotId: currentSnapshotId,
      relationship: 'SUPPORTS',
    })
    await db
      .update(claims)
      .set({
        reviewStatus: 'PUBLISHED',
        publishedAt: new Date('2026-08-20T00:00:00.000Z'),
      })
      .where(eq(claims.id, humanMeasuredClaimId))
    await replaceDraftProgrammePresentation({
      revisionId: fixture.revisionId,
      actorUserId: qualificationAuthorizerId,
      presentation: {
        mechanismSteps: [
          {
            stepKey: 'exposure',
            stepOrder: 1,
            plainTitle: 'Exposure was measured in participants',
            plainDescription: 'The exact linked study reports a measurement in people.',
            evidenceBasis: 'MEASURED_OUTSIDE_PEOPLE',
            claimLinks: [{ claimId: humanMeasuredClaimId, relationship: 'SUPPORTS' }],
          },
          ...['scope', 'outcome'].map((stepKey, index) => ({
            stepKey,
            stepOrder: index + 2,
            plainTitle: `Reviewed context stage ${index + 2}`,
            plainDescription: 'This stage states only what the reviewed claim can support.',
            evidenceBasis: 'UNKNOWN' as const,
            claimLinks: [{ claimId: fixture.claimId, relationship: 'QUALIFIES' as const }],
          })),
        ],
        timelineEvents: [],
      },
    })

    const sqlRejection = await db
      .execute(sql`SELECT rnawiki_assert_programme_presentation_v1(${fixture.revisionId})`)
      .then(
        () => null,
        (error: unknown) => error,
      )
    expect((sqlRejection as { cause?: { message?: string } } | null)?.cause?.message).toMatch(
      /MEASURED_OUTSIDE_PEOPLE requires a measured claim/,
    )
    await expect(
      prepareDraftProgrammePresentation({
        revisionId: fixture.revisionId,
        actorUserId: qualificationAuthorizerId,
      }),
    ).rejects.toMatchObject({ code: 'presentation_prepare_engine_blocked' })
  })

  it('keeps a legacy NULL-presentation prepared proposal byte-stable and publishable after 0010', async () => {
    const fixture = await createFixture('legacy-v1-after-0010')
    const prepared = await prepareProgrammeVerdictProposal(fixture.revisionId)
    expect(prepared.engineVersion).toBe(EVIDENCE_ENGINE_VERSION)

    const storedRows = await db
      .select({
        presentationSchemaVersion: programmeVerdictRevisions.presentationSchemaVersion,
        proposalDigest: programmeVerdictRevisions.proposalDigest,
        inputDigest: programmeVerdictRevisions.inputDigest,
      })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.id, fixture.revisionId))
      .limit(1)
    expect(storedRows[0]).toEqual({
      presentationSchemaVersion: null,
      proposalDigest: prepared.proposalDigest,
      inputDigest: prepared.inputDigest,
    })

    const rebuilt = await db.transaction((tx) =>
      buildLockedProgrammeVerdictProposal(tx, fixture.revisionId),
    )
    expect(rebuilt.presentation).toBeNull()
    expect(rebuilt.proposalDigest).toBe(prepared.proposalDigest)
    expect(rebuilt.inputDigest).toBe(prepared.inputDigest)

    await addApprovals(fixture.revisionId, prepared)
    await expect(
      publishProgrammeVerdictRevision(fixture.revisionId, prepared.proposalDigest),
    ).resolves.toMatchObject({ revisionId: fixture.revisionId })
  })

  it('rejects direct publication while a prepared candidate is still awaiting review closure', async () => {
    const fixture = await createFixture('awaiting-review-publication')
    const prepared = await prepareProgrammeVerdictProposal(fixture.revisionId)

    await expect(
      publishProgrammeVerdictRevision(fixture.revisionId, prepared.proposalDigest),
    ).rejects.toMatchObject({ code: 'not_publication_candidate' })
  })

  it('digest-binds only non-versioned impact edges causally attached to the exact reviewed graph', async () => {
    const fixture = await createFixture('causal-impact-digest')
    const before = await db.transaction((tx) =>
      buildLockedProgrammeVerdictProposal(tx, fixture.revisionId),
    )

    const unrelatedClaimId = fixtureId('unrelated-impact-claim')
    const unrelatedDependencyId = fixtureId('unrelated-impact-dependency')
    await db.insert(claims).values({
      id: unrelatedClaimId,
      programmeId: fixture.programmeId,
      claimKey: 'unrelated-impact-claim',
      revisionNumber: 1,
      nature: 'UNKNOWN',
      direction: 'NOT_APPLICABLE',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'This claim is not linked to the candidate graph.',
      authorUserId: authorId,
    })
    await db.insert(programmeDependencies).values({
      id: unrelatedDependencyId,
      programmeId: fixture.programmeId,
      claimId: unrelatedClaimId,
      dependentSurfaceType: 'TIMELINE',
      fieldPath: `trial.${fixture.trialId}.status`,
      impactLevel: 'POSSIBLE_VERDICT_IMPACT',
    })
    const withUnrelatedEdge = await db.transaction((tx) =>
      buildLockedProgrammeVerdictProposal(tx, fixture.revisionId),
    )
    expect(withUnrelatedEdge.proposalDigest).toBe(before.proposalDigest)
    expect(withUnrelatedEdge.dependencies.map((row) => row.id)).not.toContain(unrelatedDependencyId)

    const causalDependencyId = fixtureId('causal-impact-dependency')
    await db.insert(programmeDependencies).values({
      id: causalDependencyId,
      programmeId: fixture.programmeId,
      claimId: fixture.claimId,
      dependentSurfaceType: 'TIMELINE',
      fieldPath: `trial.${fixture.trialId}.status`,
      impactLevel: 'POSSIBLE_VERDICT_IMPACT',
    })
    const withCausalEdge = await db.transaction((tx) =>
      buildLockedProgrammeVerdictProposal(tx, fixture.revisionId),
    )
    expect(withCausalEdge.proposalDigest).not.toBe(before.proposalDigest)
    expect(withCausalEdge.dependencies.map((row) => row.id)).toContain(causalDependencyId)
    expect(withCausalEdge.engineInput.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: { type: 'CLAIM', id: fixture.claimId },
          to: {
            type: 'TIMELINE',
            id: fixture.programmeId,
            field: `trial.${fixture.trialId}.status`,
          },
          impact: 'POSSIBLE_VERDICT_IMPACT',
        }),
      ]),
    )
  })

  it('closes two matching change requests, blocks publication, and permits only a new candidate', async () => {
    const { fixture, revisionId, prepared } = await createPreparedReplacement(
      'matching-change-requests',
    )
    await submitCanonicalDecision({
      revisionId,
      proposalDigest: prepared.proposalDigest,
      reviewerUserId: reviewerAId,
      decision: 'CHANGES_REQUESTED',
    })
    await submitCanonicalDecision({
      revisionId,
      proposalDigest: prepared.proposalDigest,
      reviewerUserId: reviewerBId,
      decision: 'CHANGES_REQUESTED',
    })

    expect(
      await db
        .select({ reviewStatus: programmeVerdictRevisions.reviewStatus })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.id, revisionId))
        .limit(1),
    ).toEqual([{ reviewStatus: 'CHANGES_REQUESTED' }])
    await expect(
      publishProgrammeVerdictRevision(revisionId, prepared.proposalDigest),
    ).rejects.toMatchObject({ code: 'not_publication_candidate' })
    expect(
      await db
        .select({ verdictRevisionId: programmeCurrentPublications.verdictRevisionId })
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId))
        .limit(1),
    ).toEqual([{ verdictRevisionId: fixture.revisionId }])
    await expect(
      submitCanonicalDecision({
        revisionId,
        proposalDigest: prepared.proposalDigest,
        reviewerUserId: adjudicatorId,
        decision: 'APPROVE',
      }),
    ).rejects.toMatchObject({ code: 'not_reviewable' })

    const successorId = await insertCandidate(
      {
        programmeId: fixture.programmeId,
        trialId: fixture.trialId,
        claimId: fixture.claimId,
      },
      { revisionNumber: 3, previousRevisionId: fixture.revisionId },
    )
    await expect(prepareProgrammeVerdictProposal(successorId)).resolves.toMatchObject({
      revisionId: successorId,
    })
  })

  it('closes two matching rejections and leaves the current public pointer unchanged', async () => {
    const { fixture, revisionId, prepared } = await createPreparedReplacement('matching-rejections')
    await submitCanonicalDecision({
      revisionId,
      proposalDigest: prepared.proposalDigest,
      reviewerUserId: reviewerAId,
      decision: 'REJECT',
    })
    await submitCanonicalDecision({
      revisionId,
      proposalDigest: prepared.proposalDigest,
      reviewerUserId: reviewerBId,
      decision: 'REJECT',
    })

    await expect(
      publishProgrammeVerdictRevision(revisionId, prepared.proposalDigest),
    ).rejects.toMatchObject({ code: 'not_publication_candidate' })
    expect(
      await db
        .select({ reviewStatus: programmeVerdictRevisions.reviewStatus })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.id, revisionId))
        .limit(1),
    ).toEqual([{ reviewStatus: 'CHANGES_REQUESTED' }])
    expect(
      await db
        .select({ verdictRevisionId: programmeCurrentPublications.verdictRevisionId })
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId))
        .limit(1),
    ).toEqual([{ verdictRevisionId: fixture.revisionId }])
  })

  it('closes a disagreement through adverse adjudication without moving the public pointer', async () => {
    const { fixture, revisionId, prepared } =
      await createPreparedReplacement('adverse-adjudication')
    await submitCanonicalDecision({
      revisionId,
      proposalDigest: prepared.proposalDigest,
      reviewerUserId: reviewerAId,
      decision: 'APPROVE',
    })
    await submitCanonicalDecision({
      revisionId,
      proposalDigest: prepared.proposalDigest,
      reviewerUserId: reviewerBId,
      decision: 'CHANGES_REQUESTED',
    })
    await adjudicateProgrammeVerdict({
      revisionId,
      adjudicatorUserId: adjudicatorId,
      expectedProposalDigest: prepared.proposalDigest,
      decision: 'REJECT',
      expertiseTags: ['REGULATORY_SCIENCE'],
      rationale: 'The disagreement is resolved against publication of this exact candidate.',
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    })

    await expect(
      publishProgrammeVerdictRevision(revisionId, prepared.proposalDigest),
    ).rejects.toMatchObject({ code: 'not_publication_candidate' })
    expect(
      await db
        .select({ reviewStatus: programmeVerdictRevisions.reviewStatus })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.id, revisionId))
        .limit(1),
    ).toEqual([{ reviewStatus: 'CHANGES_REQUESTED' }])
    expect(
      await db
        .select({ verdictRevisionId: programmeCurrentPublications.verdictRevisionId })
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId))
        .limit(1),
    ).toEqual([{ verdictRevisionId: fixture.revisionId }])
  })

  it('cannot prepare a verdict from caller-invented evidence absent from the persisted graph', async () => {
    const fixture = await createFixture('invented-evidence', { verdictCode: 'IDEA_FAILED' })

    await expect(prepareProgrammeVerdictProposal(fixture.revisionId)).rejects.toMatchObject({
      code: 'engine_blocked',
    })
  })

  it('does not count approvals bound to a different proposal digest', async () => {
    const fixture = await createFixture('stale-approvals')
    const prepared = await prepareProgrammeVerdictProposal(fixture.revisionId)
    const staleDigest = prepared.proposalDigest === '0'.repeat(64) ? '1'.repeat(64) : '0'.repeat(64)

    const insertWasRejected = await rejected(() =>
      addApprovals(fixture.revisionId, prepared, staleDigest),
    )
    if (!insertWasRejected) {
      await expect(
        publishProgrammeVerdictRevision(fixture.revisionId, prepared.proposalDigest),
      ).rejects.toMatchObject({ code: 'stale_review_digest' })
    }
  })

  it('binds visible verdict prose and trial scope to the reviewed proposal', async () => {
    const fixture = await createFixture('visible-content')
    const prepared = await prepareProgrammeVerdictProposal(fixture.revisionId)
    await addApprovals(fixture.revisionId, prepared)

    const mutationWasRejected = await rejected(() =>
      db
        .update(programmeVerdictRevisions)
        .set({
          publicLabel: 'This medicine cures every condition',
          trialScope: 'a different, unreviewed trial',
        })
        .where(eq(programmeVerdictRevisions.id, fixture.revisionId)),
    )
    if (!mutationWasRejected) {
      await expect(
        publishProgrammeVerdictRevision(fixture.revisionId, prepared.proposalDigest),
      ).rejects.toMatchObject({ code: 'proposal_digest_mismatch' })
    }
  })

  it('blocks a pending source snapshot before review begins', async () => {
    const fixture = await createFixture('pending-evidence')
    await citeCurrentSource(fixture, true)

    await expect(prepareProgrammeVerdictProposal(fixture.revisionId)).rejects.toMatchObject({
      code: 'pending_evidence_review',
    })
  })

  it('blocks an open possible-verdict-impact review task even without a pending snapshot', async () => {
    const fixture = await createFixture('open-review-task')
    await citeCurrentSource(fixture, false)
    await db.insert(evidenceReviewTasks).values({
      id: fixtureId('review-task'),
      programmeId: fixture.programmeId,
      sourceId,
      triggerSnapshotId: pendingSnapshotId,
      impactLevel: 'POSSIBLE_VERDICT_IMPACT',
      status: 'OPEN',
      reason: 'A newly posted result may change the stopped-programme verdict.',
      affectedClaimIds: [fixture.claimId],
      affectedSurfacePaths: ['verdict.oneSentenceReason'],
    })

    await expect(prepareProgrammeVerdictProposal(fixture.revisionId)).rejects.toMatchObject({
      code: 'pending_evidence_review',
    })
  })

  it('requires the exact current predecessor before review begins', async () => {
    const fixture = await createFixture('lineage')
    await prepareApproveAndPublish(fixture)

    const secondRevisionId = await insertCandidate(
      {
        programmeId: fixture.programmeId,
        trialId: fixture.trialId,
        claimId: fixture.claimId,
      },
      { revisionNumber: 2, previousRevisionId: null },
    )

    await expect(prepareProgrammeVerdictProposal(secondRevisionId)).rejects.toMatchObject({
      code: 'stale_revision_lineage',
    })
  })

  it('rejects a stopped-programme revision with no stopped verdict classification', async () => {
    const fixture = await createFixture('missing-verdict', { verdictCode: null })

    await expect(prepareProgrammeVerdictProposal(fixture.revisionId)).rejects.toMatchObject({
      code: 'missing_stopped_verdict',
    })
  })

  it('makes the complete published revision bundle append-only', async () => {
    const fixture = await createFixture('append-only')
    await prepareApproveAndPublish(fixture)

    const mutationResults = {
      verdict: await rejected(() =>
        db
          .update(programmeVerdictRevisions)
          .set({ oneSentenceReason: 'A post-publication rewrite.' })
          .where(eq(programmeVerdictRevisions.id, fixture.revisionId)),
      ),
      claim: await rejected(() =>
        db
          .update(claims)
          .set({ plainLanguageText: 'A post-publication claim rewrite.' })
          .where(eq(claims.id, fixture.claimId)),
      ),
      review: await rejected(() =>
        db
          .delete(programmeVerdictReviews)
          .where(eq(programmeVerdictReviews.verdictRevisionId, fixture.revisionId)),
      ),
      claimLink: await rejected(() =>
        db
          .delete(programmeVerdictClaims)
          .where(eq(programmeVerdictClaims.verdictRevisionId, fixture.revisionId)),
      ),
      trialLink: await rejected(() =>
        db
          .delete(programmeVerdictTrials)
          .where(eq(programmeVerdictTrials.verdictRevisionId, fixture.revisionId)),
      ),
      dependency: await rejected(() =>
        db
          .delete(programmeDependencies)
          .where(eq(programmeDependencies.verdictRevisionId, fixture.revisionId)),
      ),
    }

    expect(mutationResults).toEqual({
      verdict: true,
      claim: true,
      review: true,
      claimLink: true,
      trialLink: true,
      dependency: true,
    })
  })

  it('reads only the exact trial, claim, node, and interpretability revisions linked to the current verdict', async () => {
    const fixture = await createFixture('exact-public-bundle')
    await citeCurrentSource(fixture, false)
    const extended = await attachExtendedBundle(fixture)
    const indirectClaimId = fixtureId('indirect-node-claim')
    await db.insert(claims).values({
      id: indirectClaimId,
      programmeId: fixture.programmeId,
      claimKey: 'indirect-node-claim',
      revisionNumber: 1,
      nature: 'RNAWIKI_JUDGEMENT',
      evidenceNodeType: 'PATIENT_OUTCOME',
      reviewStatus: 'PUBLISHED',
      plainLanguageText: 'This claim is reviewed only through the exact evidence node.',
      publishedAt: new Date('2026-08-20T00:00:00.000Z'),
    })
    await db.insert(claimSourceLinks).values({
      programmeId: fixture.programmeId,
      claimId: indirectClaimId,
      sourceSnapshotId: currentSnapshotId,
      relationship: 'SUPPORTS',
    })
    await db.insert(evidenceNodeClaims).values({
      programmeId: fixture.programmeId,
      evidenceNodeId: extended.nodeId,
      claimId: indirectClaimId,
      relationship: 'SUPPORTS',
    })
    await db.insert(programmeVerdictEvidenceNodes).values({
      programmeId: fixture.programmeId,
      verdictRevisionId: fixture.revisionId,
      evidenceNodeId: extended.nodeId,
    })
    await db.insert(programmeVerdictInterpretabilityAssessments).values(
      extended.assessmentIds.map((assessmentId) => ({
        programmeId: fixture.programmeId,
        verdictRevisionId: fixture.revisionId,
        assessmentId,
      })),
    )
    await prepareApproveAndPublish(fixture)

    const unreviewedEscapeClaimId = fixtureId('unreviewed-link-escape')
    await db.insert(claims).values({
      id: unreviewedEscapeClaimId,
      programmeId: fixture.programmeId,
      claimKey: 'unreviewed-link-escape',
      revisionNumber: 1,
      nature: 'RNAWIKI_JUDGEMENT',
      evidenceNodeType: 'PATIENT_OUTCOME',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'Synthetic destination used to test an attempted link escape.',
    })
    expect(
      await rejected(() =>
        db
          .update(claimSourceLinks)
          .set({ claimId: unreviewedEscapeClaimId })
          .where(eq(claimSourceLinks.claimId, indirectClaimId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db.delete(claimSourceLinks).where(eq(claimSourceLinks.claimId, indirectClaimId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db.delete(evidenceNodeClaims).where(eq(evidenceNodeClaims.claimId, indirectClaimId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .delete(trialInterpretabilityClaims)
          .where(
            eq(
              trialInterpretabilityClaims.assessmentId,
              extended.assessmentIdsByCriterion.STATISTICAL_POWER,
            ),
          ),
      ),
    ).toBe(true)

    const unrelatedTrialId = fixtureId('unrelated-trial')
    const unrelatedClaimId = fixtureId('unrelated-claim')
    const unrelatedNodeId = fixtureId('unrelated-node')
    const unrelatedAssessmentId = fixtureId('unrelated-assessment')
    await db.insert(programmeTrials).values({
      id: unrelatedTrialId,
      programmeId: fixture.programmeId,
      trialIdentifier: `NCT-PVA-UNRELATED-${runKey}`,
      title: 'Unlinked trial that must stay out of the public bundle',
    })
    await db.insert(claims).values({
      id: unrelatedClaimId,
      programmeId: fixture.programmeId,
      claimKey: 'unlinked-published-claim',
      revisionNumber: 1,
      nature: 'RNAWIKI_JUDGEMENT',
      evidenceNodeType: 'PATIENT_OUTCOME',
      reviewStatus: 'PUBLISHED',
      plainLanguageText: 'This published row was never reviewed with the current verdict.',
      publishedAt: new Date('2026-08-21T00:00:00.000Z'),
    })
    await db.insert(evidenceNodes).values({
      id: unrelatedNodeId,
      programmeId: fixture.programmeId,
      nodeType: 'HUMAN_EXPOSURE',
      revisionNumber: 1,
      reviewStatus: 'PUBLISHED',
      state: 'UNKNOWN',
      publishedAt: new Date('2026-08-21T00:00:00.000Z'),
    })
    await db.transaction(async (tx) => {
      await tx.insert(trialInterpretabilityAssessments).values({
        id: unrelatedAssessmentId,
        programmeId: fixture.programmeId,
        programmeTrialId: unrelatedTrialId,
        criterion: 'ENDPOINT_VALIDITY',
        state: 'NOT_REPORTED',
        revisionNumber: 1,
        reviewStatus: 'PUBLISHED',
        publishedAt: new Date('2026-08-21T00:00:00.000Z'),
      })
      await tx.insert(trialInterpretabilityClaims).values({
        programmeId: fixture.programmeId,
        assessmentId: unrelatedAssessmentId,
        claimId: unrelatedClaimId,
        relationship: 'SUPPORTS',
      })
    })

    const dossier = await getProgrammeEvidenceByMedicineSlug(drugId, fixture.programmeId)
    expect(dossier?.selectedProgramme?.trials.map((row) => row.id)).toEqual([fixture.trialId])
    expect(dossier?.selectedProgramme?.claims.map((row) => row.id).sort()).toEqual(
      [fixture.claimId, indirectClaimId].sort(),
    )
    expect(dossier?.selectedProgramme?.evidenceNodes.map((row) => row.id)).toEqual([
      extended.nodeId,
    ])
    expect(
      dossier?.selectedProgramme?.trials
        .flatMap((row) => row.interpretability.map((assessment) => assessment.id))
        .sort(),
    ).toEqual([...extended.assessmentIds].sort())
  })

  it('keeps published scope/source metadata immutable while a new reviewed verdict advances updated live metadata', async () => {
    const fixture = await createFixture('scope-source-immutable')
    await citeCurrentSource(fixture, false)
    await db
      .update(programmeTrials)
      .set({
        phase: 'Phase 2',
        resultsStatus: 'NOT_POSTED',
        enrolment: 120,
        startDate: '2024-01-01',
        primaryCompletionDate: '2025-06-01',
        completionDate: '2025-12-01',
        registrySourceId: sourceId,
        registrySnapshotId: currentSnapshotId,
        lastVerifiedAt: new Date('2026-08-20T00:00:00.000Z'),
      })
      .where(eq(programmeTrials.id, fixture.trialId))
    await prepareApproveAndPublish(fixture)
    const corpusCountsBeforeStagingMove = await countProgrammeEvidence()

    await db
      .update(developmentProgrammes)
      .set({
        drugId: secondDrugId,
        slug: `${fixture.programmeId}-updated`.slice(0, 128),
        title: 'Updated staged programme title',
        indication: 'Updated staged indication',
        targetPopulation: 'Updated staged target population',
        jurisdiction: 'Updated staged jurisdiction',
        sponsor: 'Updated staged sponsor',
        partners: ['Updated staged partner'],
        status: 'WITHDRAWN',
        highestPhaseReached: 'Phase 3',
        route: 'Oral',
        doseExposureContext: 'Updated staged dose and exposure',
        startDate: '2023-01-01',
        endDate: '2027-01-01',
        rawStoppingReason: 'Updated staged stopping reason',
        stoppingReasonCategory: 'BUSINESS_STRATEGY',
        updateStatus: 'REVIEW_REQUIRED',
        updatedAt: new Date(),
      })
      .where(eq(developmentProgrammes.id, fixture.programmeId))
    const currentPointer = await db
      .select()
      .from(programmeCurrentPublications)
      .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId))
      .limit(1)
    await expect(
      db
        .update(programmeCurrentPublications)
        .set({ publishedAt: currentPointer[0]!.publishedAt })
        .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId)),
    ).resolves.toBeDefined()
    await db
      .update(programmeTrials)
      .set({
        title: 'Updated staged registered study',
        phase: 'Phase 3',
        status: 'COMPLETED',
        resultsStatus: 'AVAILABLE',
        enrolment: 321,
        startDate: '2024-02-01',
        primaryCompletionDate: '2026-01-01',
        completionDate: '2026-02-01',
        registrySnapshotId: pendingSnapshotId,
        lastVerifiedAt: new Date('2026-08-22T00:00:00.000Z'),
        updatedAt: new Date(),
      })
      .where(eq(programmeTrials.id, fixture.trialId))
    await db
      .update(programmeFreshnessStates)
      .set({
        currentSnapshotId: pendingSnapshotId,
        pendingSnapshotId: null,
        freshnessStatus: 'CURRENT',
        lastSuccessfulCheckAt: new Date('2026-08-22T00:00:00.000Z'),
      })
      .where(eq(programmeFreshnessStates.programmeId, fixture.programmeId))
    await db
      .update(evidenceSources)
      .set({
        sourceType: 'REGULATORY_RECORD',
        externalIdentifier: 'PVA-UPDATED-SOURCE',
        canonicalLocator: 'https://example.test/updated-source',
        title: 'Updated staged source title',
        publisher: 'Updated staged publisher',
        sponsor: 'Updated staged source sponsor',
        publicationDate: '2025-01-01',
        correctionStatus: 'CORRECTED',
        jurisdiction: 'Updated source jurisdiction',
        hierarchy: 'SECONDARY',
        updatedAt: new Date(),
      })
      .where(eq(evidenceSources.id, sourceId))

    // A live programme is staging state. Moving it to a hidden placeholder medicine must not move
    // or suppress the already-published programme in the sitemap/editor projection: both the
    // publication and its freshness belong to the immutable reviewed scope snapshot.
    await db.update(drugs).set({ name: 'Unknown' }).where(eq(drugs.id, secondDrugId))
    const [indexingReportsWhileStagingMoved, corpusCountsWhileStagingMoved] = await Promise.all([
      loadMedicinePublicationIndexabilityReports(new Date('2026-08-23T00:00:00.000Z')),
      countProgrammeEvidence(),
    ])
    await db
      .update(drugs)
      .set({ name: 'Scope mutation target medicine' })
      .where(eq(drugs.id, secondDrugId))

    expect(
      indexingReportsWhileStagingMoved.find((report) => report.medicineId === drugId),
    ).toMatchObject({
      selectedProgrammeId: fixture.programmeId,
      freshness: 'current',
      decision: {
        index: true,
        canonicalSlug: drugId,
      },
    })
    expect(corpusCountsWhileStagingMoved).toEqual(corpusCountsBeforeStagingMove)

    const beforeReplacement = await getProgrammeEvidenceByMedicineSlug(drugId, fixture.programmeId)
    expect(beforeReplacement?.selectedProgramme).toMatchObject({
      title: 'scope-source-immutable programme',
      indication: 'Condition alpha',
      targetPopulation: 'Adults with confirmed condition alpha after prior standard therapy',
      status: 'STOPPED',
      route: 'Intravenous',
      doseExposureContext: 'Studied intravenous exposure range',
    })
    expect(beforeReplacement?.selectedProgramme?.claims[0]?.sources[0]).toMatchObject({
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      externalIdentifier: 'NCT-PVA-SHARED-SOURCE',
      canonicalLocator: 'https://clinicaltrials.gov/study/NCT-PVA-SHARED-SOURCE',
      title: 'Reusable adversarial publication source',
      publisher: 'ClinicalTrials.gov',
      publicationDate: '2026-08-01',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    expect(beforeReplacement?.selectedProgramme?.trials[0]).toMatchObject({
      title: 'Stopped registered clinical study',
      phase: 'Phase 2',
      status: 'TERMINATED',
      enrolment: 120,
      registrySnapshot: {
        snapshotId: currentSnapshotId,
        contentHash: 'a'.repeat(64),
      },
    })
    const beforeProjection = await getPublicMedicineProjections([drugId, secondDrugId])
    expect(beforeProjection.get(drugId)?.programmes[0]).toMatchObject({
      id: fixture.programmeId,
      slug: fixture.programmeId,
      title: 'scope-source-immutable programme',
      indication: 'Condition alpha',
      status: 'STOPPED',
      currentPublication: {
        verdictRevisionId: fixture.revisionId,
        sourceSnapshotIds: [currentSnapshotId],
      },
    })
    expect(beforeProjection.get(secondDrugId)?.programmes).toEqual([])
    expect(
      await rejected(() =>
        db
          .update(programmeVerdictScopeSnapshots)
          .set({ title: 'Attempted historical scope rewrite' })
          .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, fixture.revisionId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .delete(programmeVerdictScopeSnapshots)
          .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, fixture.revisionId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .update(programmeVerdictTrialSnapshots)
          .set({ title: 'Attempted historical trial rewrite' })
          .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, fixture.revisionId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .delete(programmeVerdictTrialSnapshots)
          .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, fixture.revisionId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .update(programmeVerdictSourceMetadataSnapshots)
          .set({ title: 'Attempted historical source rewrite' })
          .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, fixture.revisionId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .delete(programmeVerdictSourceMetadataSnapshots)
          .where(eq(programmeVerdictSourceMetadataSnapshots.verdictRevisionId, fixture.revisionId)),
      ),
    ).toBe(true)

    await expect(
      db.insert(sourceSnapshots).values({
        id: fixtureId('monitor-snapshot'),
        sourceId,
        previousSnapshotId: pendingSnapshotId,
        contentHash: runKey.padEnd(64, 'c'),
        structuredData: { status: 'TERMINATED', monitoredAfterPublication: true },
      }),
    ).resolves.toBeDefined()

    await db
      .update(developmentProgrammes)
      .set({ drugId, updatedAt: new Date() })
      .where(eq(developmentProgrammes.id, fixture.programmeId))

    const staleCitationRevisionId = await insertCandidate(
      {
        programmeId: fixture.programmeId,
        trialId: fixture.trialId,
        claimId: fixture.claimId,
      },
      {
        revisionNumber: 2,
        previousRevisionId: fixture.revisionId,
        programmeStatusAtReview: 'WITHDRAWN',
        indicationScope: 'Updated staged indication',
        populationScope: 'Updated staged target population',
        doseExposureScope: 'Updated staged dose and exposure',
      },
    )
    const prepared = await prepareProgrammeVerdictProposal(staleCitationRevisionId)
    expect(
      await db
        .select({ verdictRevisionId: programmeCurrentPublications.verdictRevisionId })
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId))
        .limit(1),
    ).toEqual([{ verdictRevisionId: fixture.revisionId }])
    const replacementRevisionId = staleCitationRevisionId
    await addApprovals(replacementRevisionId, prepared)
    await publishProgrammeVerdictRevision(replacementRevisionId, prepared.proposalDigest)

    const afterReplacement = await getProgrammeEvidenceByMedicineSlug(drugId, fixture.programmeId)
    expect(afterReplacement?.selectedProgramme).toMatchObject({
      title: 'Updated staged programme title',
      indication: 'Updated staged indication',
      targetPopulation: 'Updated staged target population',
      jurisdiction: 'Updated staged jurisdiction',
      sponsor: 'Updated staged sponsor',
      partners: ['Updated staged partner'],
      status: 'WITHDRAWN',
      highestPhaseReached: 'Phase 3',
      route: 'Oral',
      doseExposureContext: 'Updated staged dose and exposure',
      startDate: '2023-01-01',
      endDate: '2027-01-01',
      rawStoppingReason: 'Updated staged stopping reason',
      stoppingReasonCategory: 'BUSINESS_STRATEGY',
    })
    expect(afterReplacement?.selectedProgramme?.claims[0]?.sources[0]).toMatchObject({
      sourceType: 'REGULATORY_RECORD',
      externalIdentifier: 'PVA-UPDATED-SOURCE',
      canonicalLocator: 'https://example.test/updated-source',
      title: 'Updated staged source title',
      publisher: 'Updated staged publisher',
      publicationDate: '2025-01-01',
      correctionStatus: 'CORRECTED',
      hierarchy: 'SECONDARY',
    })
    expect(afterReplacement?.selectedProgramme?.trials[0]).toMatchObject({
      title: 'Updated staged registered study',
      phase: 'Phase 3',
      status: 'COMPLETED',
      enrolment: 321,
      registrySnapshot: {
        snapshotId: pendingSnapshotId,
        contentHash: 'b'.repeat(64),
      },
    })
    const afterProjection = await getPublicMedicineProjections([drugId])
    expect(afterProjection.get(drugId)?.programmes[0]).toMatchObject({
      id: fixture.programmeId,
      slug: `${fixture.programmeId}-updated`.slice(0, 128),
      title: 'Updated staged programme title',
      indication: 'Updated staged indication',
      status: 'WITHDRAWN',
      currentPublication: {
        verdictRevisionId: replacementRevisionId,
        sourceSnapshotIds: expect.arrayContaining([currentSnapshotId, pendingSnapshotId]),
      },
    })
  })

  it('blocks a direct current-member supersede but atomically publishes a reviewed replacement graph', async () => {
    const fixture = await createFixture('atomic-graph-swap')
    const firstExtended = await attachExtendedBundle(fixture)
    await db.insert(programmeVerdictEvidenceNodes).values({
      programmeId: fixture.programmeId,
      verdictRevisionId: fixture.revisionId,
      evidenceNodeId: firstExtended.nodeId,
    })
    await db.insert(programmeVerdictInterpretabilityAssessments).values(
      firstExtended.assessmentIds.map((assessmentId) => ({
        programmeId: fixture.programmeId,
        verdictRevisionId: fixture.revisionId,
        assessmentId,
      })),
    )
    await prepareApproveAndPublish(fixture)

    expect(
      await rejected(() =>
        db
          .update(claims)
          .set({ reviewStatus: 'SUPERSEDED', supersededAt: new Date() })
          .where(eq(claims.id, fixture.claimId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .update(evidenceNodes)
          .set({ reviewStatus: 'SUPERSEDED', supersededAt: new Date() })
          .where(eq(evidenceNodes.id, firstExtended.nodeId)),
      ),
    ).toBe(true)
    expect(
      await rejected(() =>
        db
          .update(trialInterpretabilityAssessments)
          .set({ reviewStatus: 'SUPERSEDED', supersededAt: new Date() })
          .where(eq(trialInterpretabilityAssessments.id, firstExtended.assessmentId)),
      ),
    ).toBe(true)
    await expect(
      db
        .update(programmeTrials)
        .set({ title: 'Staged title for the next reviewed trial snapshot' })
        .where(eq(programmeTrials.id, fixture.trialId)),
    ).resolves.toBeDefined()
    const beforeGraphReplacement = await getProgrammeEvidenceByMedicineSlug(
      drugId,
      fixture.programmeId,
    )
    expect(beforeGraphReplacement?.selectedProgramme?.trials[0]?.title).toBe(
      'Stopped registered clinical study',
    )

    const replacementClaimId = fixtureId('replacement-claim')
    await db.insert(claims).values({
      id: replacementClaimId,
      programmeId: fixture.programmeId,
      claimKey: 'test-unanswered',
      revisionNumber: 2,
      previousClaimId: fixture.claimId,
      nature: 'RNAWIKI_JUDGEMENT',
      evidenceNodeType: 'PATIENT_OUTCOME',
      direction: 'NOT_APPLICABLE',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'The reviewed replacement still says the study was unanswered.',
      reviewerInterpretation: 'This is an exact replacement revision for the same claim lineage.',
      authorUserId: authorId,
    })
    const replacementExtended = await attachExtendedBundle(fixture, {
      reviewStatus: 'DRAFT',
      previousNodeId: firstExtended.nodeId,
      previousAssessmentId: firstExtended.assessmentId,
      previousAssessmentIdsByCriterion: firstExtended.assessmentIdsByCriterion,
      claimId: replacementClaimId,
    })
    const replacementRevisionId = await insertCandidate(
      {
        programmeId: fixture.programmeId,
        trialId: fixture.trialId,
        claimId: replacementClaimId,
        ...replacementExtended,
      },
      { revisionNumber: 2, previousRevisionId: fixture.revisionId },
    )
    const prepared = await prepareProgrammeVerdictProposal(replacementRevisionId)
    await addApprovals(replacementRevisionId, prepared)
    await publishProgrammeVerdictRevision(replacementRevisionId, prepared.proposalDigest)

    const [oldClaim, newClaim, oldNode, newNode, oldAssessment, newAssessment] = await Promise.all([
      db.select().from(claims).where(eq(claims.id, fixture.claimId)).limit(1),
      db.select().from(claims).where(eq(claims.id, replacementClaimId)).limit(1),
      db.select().from(evidenceNodes).where(eq(evidenceNodes.id, firstExtended.nodeId)).limit(1),
      db
        .select()
        .from(evidenceNodes)
        .where(eq(evidenceNodes.id, replacementExtended.nodeId))
        .limit(1),
      db
        .select()
        .from(trialInterpretabilityAssessments)
        .where(eq(trialInterpretabilityAssessments.id, firstExtended.assessmentId))
        .limit(1),
      db
        .select()
        .from(trialInterpretabilityAssessments)
        .where(eq(trialInterpretabilityAssessments.id, replacementExtended.assessmentId))
        .limit(1),
    ])
    expect([
      oldClaim[0]?.reviewStatus,
      newClaim[0]?.reviewStatus,
      oldNode[0]?.reviewStatus,
      newNode[0]?.reviewStatus,
      oldAssessment[0]?.reviewStatus,
      newAssessment[0]?.reviewStatus,
    ]).toEqual(['SUPERSEDED', 'PUBLISHED', 'SUPERSEDED', 'PUBLISHED', 'SUPERSEDED', 'PUBLISHED'])

    const dossier = await getProgrammeEvidenceByMedicineSlug(drugId, fixture.programmeId)
    expect(dossier?.selectedProgramme?.claims.map((row) => row.id)).toEqual([replacementClaimId])
    expect(dossier?.selectedProgramme?.evidenceNodes.map((row) => row.id)).toEqual([
      replacementExtended.nodeId,
    ])
    expect(
      dossier?.selectedProgramme?.trials
        .flatMap((row) => row.interpretability.map((assessment) => assessment.id))
        .sort(),
    ).toEqual([...replacementExtended.assessmentIds].sort())
  })

  it('rejects an already-published replay carrying a different proposal digest', async () => {
    const fixture = await createFixture('idempotent-replay')
    const prepared = await prepareApproveAndPublish(fixture)
    const wrongDigest = prepared.proposalDigest === 'f'.repeat(64) ? 'e'.repeat(64) : 'f'.repeat(64)

    await expect(
      publishProgrammeVerdictRevision(fixture.revisionId, wrongDigest),
    ).rejects.toMatchObject({ code: 'proposal_digest_mismatch' })
  })
})

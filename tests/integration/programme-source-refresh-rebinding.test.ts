import { randomUUID } from 'node:crypto'

import { beforeAll, describe, expect, it } from 'vitest'
import { asc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db'
import {
  claimSourceLinks,
  claims,
  developmentProgrammes,
  drugs,
  evidenceNodeClaims,
  evidenceNodes,
  evidenceReviewTasks,
  evidenceSources,
  programmeContributionImplementations,
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
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTimelineEventClaims,
  programmeVerdictTimelineEvents,
  programmeVerdictTrialSnapshots,
  programmeVerdictTrials,
  sourceSnapshots,
  trialInterpretabilityAssessments,
  trialInterpretabilityClaims,
  users,
} from '@/db/schema'
import type { ContributionReviewDecisionInput } from '@/lib/contributions/review-validation'
import { ClinicalTrialsGovAdapter } from '@/lib/evidence/adapters/clinical-trials-gov'
import {
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
  STUDY_INTERPRETABILITY_CRITERIA,
  type StudyInterpretabilityCriterion,
} from '@/lib/evidence/types'
import { monitorClinicalTrialsSource } from '@/lib/evidence/source-monitor-drizzle'
import { materializeAcceptedContributionCandidate } from '@/lib/queries/programme-contribution-implementation'
import { submitContributionReview } from '@/lib/queries/programme-contribution-reviews'
import {
  createContributionDraft,
  submitContributionProposal,
} from '@/lib/queries/programme-contributions'
import { prepareDraftProgrammePresentation } from '@/lib/queries/programme-presentation'
import { createProgrammeVerdictDraftFromCurrentPublication } from '@/lib/queries/programme-verdict-drafts'
import { buildLockedProgrammeVerdictProposal } from '@/lib/queries/programme-verdict-proposal'
import {
  prepareProgrammeVerdictProposal,
  publishProgrammeVerdictRevision,
} from '@/lib/queries/programme-verdict-publication'
import { listCanonicalQueueCandidates } from '@/lib/queries/programme-verdict-queue'
import {
  getProgrammeVerdictWorkflowState,
  submitProgrammeVerdictReview,
} from '@/lib/queries/programme-verdict-workflow'

const runKey = randomUUID().replaceAll('-', '').slice(0, 10)
let sequence = 0
let nctSequence = parseInt(runKey.slice(0, 7), 16) % 90_000_000

function fixtureId(kind: string): string {
  sequence += 1
  const suffix = `-${runKey}-${sequence}`
  return `${`psr-${kind}`.slice(0, 64 - suffix.length)}${suffix}`
}

function nextNctId(): string {
  nctSequence += 1
  return `NCT${nctSequence.toString().padStart(8, '0')}`
}

const drugId = fixtureId('drug')
const medicineSlug = fixtureId('medicine')
const authorId = fixtureId('author')
const reviewerAId = fixtureId('reviewer-a')
const reviewerBId = fixtureId('reviewer-b')
const stewardId = fixtureId('steward')
const adminId = fixtureId('admin')

interface SourceRefreshFixture {
  programmeId: string
  programmeSlug: string
  trialId: string
  claimId: string
  nodeId: string
  assessmentIds: string[]
  verdictId: string
  sourceId: string
  currentSnapshotId: string
  pendingSnapshotId: string
  sourceTaskId: string
  nctId: string
  locator: string
}

function registryStudy(args: {
  nctId: string
  overallStatus: string
  enrolment: number
  hasResults: boolean
  startDate?: string
  primaryCompletionDate?: string
  completionDate?: string
}) {
  return {
    hasResults: args.hasResults,
    protocolSection: {
      identificationModule: {
        nctId: args.nctId,
        briefTitle: 'Exact source-refresh fixture trial',
      },
      statusModule: {
        overallStatus: args.overallStatus,
        startDateStruct: { date: args.startDate ?? '2025-01-01' },
        primaryCompletionDateStruct: { date: args.primaryCompletionDate ?? '2026-07-01' },
        completionDateStruct: { date: args.completionDate ?? '2026-08-01' },
      },
      sponsorCollaboratorsModule: {
        leadSponsor: { name: 'Source-refresh fixture sponsor', class: 'INDUSTRY' },
      },
      designModule: {
        phases: ['PHASE2'],
        enrollmentInfo: { count: args.enrolment, type: 'ACTUAL' },
      },
      conditionsModule: { conditions: ['Condition alpha'] },
      armsInterventionsModule: {
        interventions: [{ name: 'Source refresh medicine', type: 'DRUG' }],
      },
    },
  }
}

const contributionApproval = {
  decision: 'APPROVE',
  expertiseTags: ['CLINICAL_DEVELOPMENT'],
  independenceAttested: true,
  conflictsOfInterest: 'None declared',
  conflictsOfInterestAttested: true,
} satisfies ContributionReviewDecisionInput

async function approveAndPublishVerdict(revisionId: string, proposalDigest: string): Promise<void> {
  await submitProgrammeVerdictReview({
    revisionId,
    reviewerUserId: reviewerAId,
    expectedProposalDigest: proposalDigest,
    decision: 'APPROVE',
    expertiseTags: ['CLINICAL_DEVELOPMENT'],
    isIndependent: true,
    conflictsOfInterest: 'None declared',
    conflictsOfInterestAttested: true,
  })
  await submitProgrammeVerdictReview({
    revisionId,
    reviewerUserId: reviewerBId,
    expectedProposalDigest: proposalDigest,
    decision: 'APPROVE',
    expertiseTags: ['BIOSTATISTICS'],
    isIndependent: true,
    conflictsOfInterest: 'None declared',
    conflictsOfInterestAttested: true,
  })
  await publishProgrammeVerdictRevision({
    revisionId,
    publisherUserId: stewardId,
    expectedProposalDigest: proposalDigest,
  })
}

async function createPublishedFixture(
  label: string,
  options: { registrySupportsClaim?: boolean } = {},
): Promise<SourceRefreshFixture> {
  const programmeId = fixtureId(`${label}-programme`)
  const programmeSlug = fixtureId(`${label}-programme-slug`)
  const trialId = fixtureId(`${label}-trial`)
  const claimId = fixtureId(`${label}-claim`)
  const nodeId = fixtureId(`${label}-node`)
  const verdictId = fixtureId(`${label}-verdict`)
  const sourceId = fixtureId(`${label}-source`)
  const currentSnapshotId = fixtureId(`${label}-snapshot-current`)
  const supportingSourceId = fixtureId(`${label}-support-source`)
  const supportingSnapshotId = fixtureId(`${label}-support-snapshot`)
  const nctId = nextNctId()
  const locator = `https://clinicaltrials.gov/study/${nctId}`
  const assessmentIdsByCriterion = Object.fromEntries(
    STUDY_INTERPRETABILITY_CRITERIA.map((criterion) => [
      criterion,
      fixtureId(`${label}-assessment-${criterion.toLowerCase()}`),
    ]),
  ) as Record<StudyInterpretabilityCriterion, string>
  const assessmentIds = STUDY_INTERPRETABILITY_CRITERIA.map(
    (criterion) => assessmentIdsByCriterion[criterion],
  )
  const verifiedAt = new Date('2026-08-20T00:00:00.000Z')

  await db.insert(evidenceSources).values({
    id: sourceId,
    sourceType: 'CLINICAL_TRIAL_REGISTRY',
    externalIdentifier: nctId,
    canonicalLocator: locator,
    title: 'Exact source-refresh fixture trial',
    publisher: 'ClinicalTrials.gov',
    sponsor: 'Source-refresh fixture sponsor',
    correctionStatus: 'CURRENT',
    hierarchy: 'PRIMARY',
  })
  if (options.registrySupportsClaim === false) {
    await db.insert(evidenceSources).values({
      id: supportingSourceId,
      sourceType: 'PEER_REVIEWED_PUBLICATION',
      externalIdentifier: `10.5555/${supportingSourceId}`,
      canonicalLocator: `https://doi.org/10.5555/${supportingSourceId}`,
      title: 'Independent fixture evidence report',
      publisher: 'Fixture journal',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    await db.insert(sourceSnapshots).values({
      id: supportingSnapshotId,
      sourceId: supportingSourceId,
      retrievedAt: verifiedAt,
      lastVerifiedAt: verifiedAt,
      contentHash: 'd'.repeat(64),
      structuredData: { title: 'Independent fixture evidence report' },
      rawSnapshotLocator: `https://doi.org/10.5555/${supportingSourceId}`,
    })
  }
  await db.insert(sourceSnapshots).values({
    id: currentSnapshotId,
    sourceId,
    retrievedAt: verifiedAt,
    lastVerifiedAt: verifiedAt,
    contentHash: 'a'.repeat(64),
    structuredData: registryStudy({
      nctId,
      overallStatus: 'ACTIVE_NOT_RECRUITING',
      enrolment: 120,
      hasResults: false,
    }),
    rawSnapshotLocator: locator,
  })

  await db.transaction(async (tx) => {
    await tx.insert(developmentProgrammes).values({
      id: programmeId,
      drugId,
      slug: programmeSlug,
      title: 'Exact source-refresh fixture trial',
      indication: 'Condition alpha',
      targetPopulation: 'Adults with condition alpha',
      sponsor: 'Source-refresh fixture sponsor',
      status: 'ACTIVE',
      highestPhaseReached: 'Phase 2',
      route: 'Oral',
      doseExposureContext: 'Recorded Phase 2 exposure',
      startDate: '2025-01-01',
      endDate: '2026-08-01',
      updateStatus: 'CURRENT',
    })
    await tx.insert(programmeTrials).values({
      id: trialId,
      programmeId,
      trialIdentifier: nctId,
      title: 'Exact source-refresh fixture trial',
      phase: 'Phase 2',
      status: 'ACTIVE_NOT_RECRUITING',
      resultsStatus: 'NOT_POSTED',
      enrolment: 120,
      enrolmentType: 'ACTUAL',
      startDate: '2025-01-01',
      primaryCompletionDate: '2026-07-01',
      completionDate: '2026-08-01',
      humanStudyStatus: 'YES',
      registrySourceId: sourceId,
      registrySnapshotId: currentSnapshotId,
      lastVerifiedAt: verifiedAt,
    })
    await tx.insert(claims).values({
      id: claimId,
      programmeId,
      claimKey: `${label}.registered-status`,
      revisionNumber: 1,
      programmeTrialId: trialId,
      evidenceNodeType: 'PATIENT_OUTCOME',
      nature: 'MEASURED',
      reviewStatus: 'DRAFT',
      plainLanguageText: 'The registered study had not yet posted results.',
      direction: 'NOT_APPLICABLE',
      lastVerifiedAt: verifiedAt,
      authorUserId: authorId,
    })
    await tx.insert(claimSourceLinks).values({
      programmeId,
      claimId,
      sourceSnapshotId:
        options.registrySupportsClaim === false ? supportingSnapshotId : currentSnapshotId,
      relationship: 'SUPPORTS',
      sourceLocator:
        options.registrySupportsClaim === false
          ? `https://doi.org/10.5555/${supportingSourceId}`
          : locator,
    })
    await tx.insert(evidenceNodes).values({
      id: nodeId,
      programmeId,
      nodeType: 'PATIENT_OUTCOME',
      revisionNumber: 1,
      state: 'UNKNOWN',
      reviewStatus: 'DRAFT',
      plainSummary: 'The registered record did not yet contain a posted outcome result.',
      professionalSummary: 'No posted patient-outcome result was available.',
      rationale: 'The exact registered source was reviewed.',
      lastVerifiedAt: verifiedAt,
      authorUserId: authorId,
    })
    await tx.insert(evidenceNodeClaims).values({
      programmeId,
      evidenceNodeId: nodeId,
      claimId,
      relationship: 'SUPPORTS',
    })
    await tx.insert(trialInterpretabilityAssessments).values(
      STUDY_INTERPRETABILITY_CRITERIA.map((criterion) => ({
        id: assessmentIdsByCriterion[criterion],
        programmeId,
        programmeTrialId: trialId,
        criterion,
        state: 'NOT_REPORTED' as const,
        revisionNumber: 1,
        reviewStatus: 'DRAFT' as const,
        explanation: `The registry did not report enough detail for ${criterion.toLowerCase()}.`,
        lastVerifiedAt: verifiedAt,
        authorUserId: authorId,
      })),
    )
    await tx.insert(trialInterpretabilityClaims).values(
      assessmentIds.map((assessmentId) => ({
        programmeId,
        assessmentId,
        claimId,
        relationship: 'SUPPORTS' as const,
      })),
    )
    await tx.insert(programmeVerdictRevisions).values({
      id: verdictId,
      programmeId,
      revisionNumber: 1,
      reviewStatus: 'DRAFT',
      presentationSchemaVersion: 'programme-presentation/v1',
      programmeStatusAtReview: 'ACTIVE',
      proposalAsOfDate: '2026-08-20',
      publicLabel: 'The active study had not yet posted results',
      professionalLabel: 'Active programme without posted outcome results',
      indicationScope: 'Condition alpha',
      populationScope: 'Adults with condition alpha',
      doseExposureScope: 'Recorded Phase 2 exposure',
      periodScope: '2025 to 2026',
      trialScope: nctId,
      outcomeScope: 'Posted patient-outcome results',
      plainMechanism: 'The medicine was designed to alter the intended pathway.',
      bestSupportedFinding: 'The registered study was active without posted results.',
      mainLimitation: 'No posted patient-outcome result was available.',
      oneSentenceReason: 'The exact registry record did not yet report outcome results.',
      whatWasDisproven: [],
      whatWasNotDisproven: ['The intended pathway was not disproven.'],
      whatRemainsUnknown: ['Whether the study found a patient benefit.'],
      confidence: 'MODERATE',
      confidenceExplanation: 'The registry status was exact, but outcome results were unavailable.',
      conditionsThatWouldChangeVerdict: ['A posted, interpretable patient-outcome result.'],
      authorUserId: authorId,
      authorName: 'Source refresh author',
      conflictsOfInterest: 'None declared',
      sourceDependent: true,
    })
    await tx.insert(programmeVerdictClaims).values({
      programmeId,
      verdictRevisionId: verdictId,
      claimId,
      relationship: 'SUPPORTING',
    })
    await tx.insert(programmeVerdictTrials).values({
      programmeId,
      verdictRevisionId: verdictId,
      programmeTrialId: trialId,
    })
    await tx.insert(programmeVerdictEvidenceNodes).values({
      programmeId,
      verdictRevisionId: verdictId,
      evidenceNodeId: nodeId,
    })
    await tx.insert(programmeVerdictInterpretabilityAssessments).values(
      assessmentIds.map((assessmentId) => ({
        programmeId,
        verdictRevisionId: verdictId,
        assessmentId,
      })),
    )
    await tx.insert(programmeVerdictScopeSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      drugId,
      slug: programmeSlug,
      title: 'Exact source-refresh fixture trial',
      indication: 'Condition alpha',
      targetPopulation: 'Adults with condition alpha',
      sponsor: 'Source-refresh fixture sponsor',
      partners: [],
      status: 'ACTIVE',
      highestPhaseReached: 'Phase 2',
      route: 'Oral',
      doseExposureContext: 'Recorded Phase 2 exposure',
      startDate: '2025-01-01',
      endDate: '2026-08-01',
      stoppingReasonCategory: 'UNKNOWN',
      capturedAt: verifiedAt,
    })
    await tx.insert(programmeVerdictTrialSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      programmeTrialId: trialId,
      trialIdentifier: nctId,
      title: 'Exact source-refresh fixture trial',
      phase: 'Phase 2',
      status: 'ACTIVE_NOT_RECRUITING',
      resultsStatus: 'NOT_POSTED',
      enrolment: 120,
      enrolmentType: 'ACTUAL',
      startDate: '2025-01-01',
      primaryCompletionDate: '2026-07-01',
      completionDate: '2026-08-01',
      humanStudyStatus: 'YES',
      registrySourceId: sourceId,
      registrySnapshotId: currentSnapshotId,
      lastVerifiedAt: verifiedAt,
      capturedAt: verifiedAt,
    })
    await tx.insert(programmeVerdictSourceMetadataSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      sourceId,
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      externalIdentifier: nctId,
      canonicalLocator: locator,
      title: 'Exact source-refresh fixture trial',
      publisher: 'ClinicalTrials.gov',
      sponsor: 'Source-refresh fixture sponsor',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
      capturedAt: verifiedAt,
    })
    if (options.registrySupportsClaim === false) {
      await tx.insert(programmeVerdictSourceMetadataSnapshots).values({
        verdictRevisionId: verdictId,
        programmeId,
        sourceId: supportingSourceId,
        sourceType: 'PEER_REVIEWED_PUBLICATION',
        externalIdentifier: `10.5555/${supportingSourceId}`,
        canonicalLocator: `https://doi.org/10.5555/${supportingSourceId}`,
        title: 'Independent fixture evidence report',
        publisher: 'Fixture journal',
        correctionStatus: 'CURRENT',
        hierarchy: 'PRIMARY',
        capturedAt: verifiedAt,
      })
    }
    await tx.insert(programmeVerdictMechanismSteps).values(
      ['delivery', 'pathway', 'outcome'].map((stepKey, index) => ({
        verdictRevisionId: verdictId,
        programmeId,
        stepKey,
        stepOrder: index + 1,
        plainTitle: `Reviewed mechanism stage ${index + 1}`,
        plainDescription: 'The exact reviewed claim bounds this programme stage.',
        evidenceBasis: 'UNKNOWN' as const,
      })),
    )
    await tx.insert(programmeVerdictMechanismStepClaims).values(
      ['delivery', 'pathway', 'outcome'].map((stepKey) => ({
        verdictRevisionId: verdictId,
        programmeId,
        stepKey,
        claimId,
        relationship: stepKey === 'pathway' ? ('QUALIFIES' as const) : ('SUPPORTS' as const),
      })),
    )
    await tx.insert(programmeVerdictTimelineEvents).values({
      verdictRevisionId: verdictId,
      programmeId,
      eventKey: 'registry-status',
      eventDate: '2026-08-20',
      eventType: 'IMPORTANT_RESULT',
      dateBasis: 'ACTUAL',
      plainTitle: 'The exact registry status was reviewed',
      plainDescription: 'The saved source version recorded the active study status.',
      programmeTrialId: trialId,
      sourceId: options.registrySupportsClaim === false ? supportingSourceId : sourceId,
      sourceSnapshotId:
        options.registrySupportsClaim === false ? supportingSnapshotId : currentSnapshotId,
    })
    await tx.insert(programmeVerdictTimelineEventClaims).values({
      verdictRevisionId: verdictId,
      programmeId,
      eventKey: 'registry-status',
      claimId,
      relationship: 'SUPPORTS',
    })
    await tx.insert(programmeDependencies).values([
      ...PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath) => ({
        id: fixtureId(`${label}-summary-dependency`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'PROGRAMME_SUMMARY' as const,
        fieldPath,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      })),
      ...PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath) => ({
        id: fixtureId(`${label}-verdict-dependency`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'VERDICT' as const,
        fieldPath,
        impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
      })),
      {
        id: fixtureId(`${label}-node-dependency`),
        programmeId,
        claimId,
        evidenceNodeId: nodeId,
        dependentSurfaceType: 'EVIDENCE_NODE' as const,
        fieldPath: 'evidenceNodes.PATIENT_OUTCOME.summary',
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      },
      ...['delivery', 'pathway', 'outcome'].map((stepKey) => ({
        id: fixtureId(`${label}-mechanism-dependency`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'MECHANISM_MAP' as const,
        fieldPath: `mechanism.${stepKey}.plainDescription`,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      })),
      {
        id: fixtureId(`${label}-timeline-dependency`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'TIMELINE' as const,
        fieldPath: 'timeline.registry-status.plainDescription',
        impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
      },
      {
        id: fixtureId(`${label}-status-dependency`),
        programmeId,
        claimId,
        dependentSurfaceType: 'PROGRAMME_STATUS' as const,
        fieldPath: 'programme.status',
        impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
      },
    ])
    await tx.insert(programmeFreshnessStates).values({
      programmeId,
      sourceId,
      currentSnapshotId,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      lastSuccessfulCheckAt: verifiedAt,
      lastVerifiedAt: verifiedAt,
    })
    if (options.registrySupportsClaim === false) {
      await tx.insert(programmeFreshnessStates).values({
        programmeId,
        sourceId: supportingSourceId,
        currentSnapshotId: supportingSnapshotId,
        checkStatus: 'SUCCEEDED',
        freshnessStatus: 'CURRENT',
        lastSuccessfulCheckAt: verifiedAt,
        lastVerifiedAt: verifiedAt,
      })
    }
  })

  const prepared = await prepareProgrammeVerdictProposal(verdictId)
  await approveAndPublishVerdict(verdictId, prepared.proposalDigest)

  return {
    programmeId,
    programmeSlug,
    trialId,
    claimId,
    nodeId,
    assessmentIds,
    verdictId,
    sourceId,
    currentSnapshotId,
    pendingSnapshotId: '',
    sourceTaskId: '',
    nctId,
    locator,
  }
}

async function bindPendingUpdate(
  fixture: SourceRefreshFixture,
  options: { intermediateCurrent?: boolean } = {},
): Promise<SourceRefreshFixture> {
  let currentSnapshotId = fixture.currentSnapshotId
  if (options.intermediateCurrent) {
    const intermediateSnapshotId = fixtureId('snapshot-intermediate')
    await db.insert(sourceSnapshots).values({
      id: intermediateSnapshotId,
      sourceId: fixture.sourceId,
      previousSnapshotId: fixture.currentSnapshotId,
      retrievedAt: new Date('2026-08-21T00:00:00.000Z'),
      lastVerifiedAt: new Date('2026-08-21T00:00:00.000Z'),
      contentHash: 'b'.repeat(64),
      structuredData: registryStudy({
        nctId: fixture.nctId,
        overallStatus: 'ACTIVE_NOT_RECRUITING',
        enrolment: 124,
        hasResults: false,
      }),
      rawSnapshotLocator: fixture.locator,
    })
    currentSnapshotId = intermediateSnapshotId
  }
  const pendingSnapshotId = fixtureId('snapshot-pending')
  const sourceTaskId = fixtureId('source-task')
  await db.insert(sourceSnapshots).values({
    id: pendingSnapshotId,
    sourceId: fixture.sourceId,
    previousSnapshotId: currentSnapshotId,
    retrievedAt: new Date('2026-08-22T00:00:00.000Z'),
    lastVerifiedAt: new Date('2026-08-22T00:00:00.000Z'),
    contentHash: 'c'.repeat(64),
    structuredData: registryStudy({
      nctId: fixture.nctId,
      overallStatus: 'COMPLETED',
      enrolment: 128,
      hasResults: true,
    }),
    rawSnapshotLocator: fixture.locator,
  })
  await db
    .update(programmeFreshnessStates)
    .set({
      currentSnapshotId,
      pendingSnapshotId,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'NEW_EVIDENCE',
      lastSuccessfulCheckAt: new Date('2026-08-22T00:00:00.000Z'),
      newEvidenceDetectedAt: new Date('2026-08-22T00:00:00.000Z'),
      updatedAt: new Date('2026-08-22T00:00:00.000Z'),
    })
    .where(eq(programmeFreshnessStates.programmeId, fixture.programmeId))
  await db.insert(evidenceReviewTasks).values({
    id: sourceTaskId,
    programmeId: fixture.programmeId,
    sourceId: fixture.sourceId,
    triggerSnapshotId: pendingSnapshotId,
    impactLevel: 'POSSIBLE_VERDICT_IMPACT',
    reason: 'The exact registered study status, results availability and enrolment changed.',
    affectedClaimIds: [fixture.claimId],
    affectedSurfacePaths: ['programme.status', `trial.${fixture.trialId}.status`],
  })
  return { ...fixture, pendingSnapshotId, sourceTaskId }
}

async function acceptStatusCorrection(fixture: SourceRefreshFixture): Promise<string> {
  const draft = await createContributionDraft({
    medicineSlug,
    programmeRef: fixture.programmeSlug,
    authorUserId: authorId,
    input: {
      proposalType: 'CORRECTION',
      selectedField: 'programme.status',
      proposedValue: 'COMPLETED',
      source: {
        type: 'CLINICAL_TRIAL_REGISTRY',
        locator: fixture.locator,
        identifier: fixture.nctId,
        reviewTaskId: fixture.sourceTaskId,
        reviewSnapshotId: fixture.pendingSnapshotId,
      },
      claimNature: 'MEASURED',
      reasoning: 'The exact pending registry version now records the study as completed.',
      whatWasWrongOrMissing: 'The public programme still shows the earlier active status.',
      affects: 'OPEN_QUESTIONS',
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    },
  })
  const submitted = await submitContributionProposal({
    proposalId: draft.proposal.id,
    authorUserId: authorId,
  })
  await submitContributionReview({
    proposalId: submitted.id,
    reviewerUserId: reviewerAId,
    input: contributionApproval,
  })
  await submitContributionReview({
    proposalId: submitted.id,
    reviewerUserId: reviewerBId,
    input: { ...contributionApproval, expertiseTags: ['BIOSTATISTICS'] },
  })
  await submitContributionReview({
    proposalId: submitted.id,
    reviewerUserId: stewardId,
    input: { ...contributionApproval, expertiseTags: ['REGULATORY_SCIENCE'] },
  })
  return submitted.id
}

async function monitorExactCanonicalRefresh(
  fixture: SourceRefreshFixture,
): Promise<SourceRefreshFixture> {
  const checkedAt = new Date('2026-08-23T00:00:00.000Z')
  const monitored = await monitorClinicalTrialsSource({
    database: db,
    adapter: new ClinicalTrialsGovAdapter(
      async () =>
        new Response(
          JSON.stringify(
            registryStudy({
              nctId: fixture.nctId,
              overallStatus: 'COMPLETED',
              enrolment: 128,
              hasResults: true,
              startDate: '2025-02-01',
              primaryCompletionDate: '2026-07-15',
              completionDate: '2026-08-15',
            }),
          ),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      () => checkedAt,
    ),
    programmeId: fixture.programmeId,
    sourceId: fixture.sourceId,
    idempotencyKey: fixtureId('canonical-source-refresh-run'),
    now: () => checkedAt,
  })
  expect(monitored.reviewTaskIds).toHaveLength(1)
  expect(monitored).toMatchObject({
    status: 'SUCCEEDED',
    currentSnapshotId: fixture.currentSnapshotId,
    pendingSnapshotId: monitored.snapshotId,
  })
  return {
    ...fixture,
    pendingSnapshotId: monitored.snapshotId!,
    sourceTaskId: monitored.reviewTaskIds[0]!,
  }
}

async function acceptCanonicalSourceRefresh(fixture: SourceRefreshFixture): Promise<string> {
  const draft = await createContributionDraft({
    medicineSlug,
    programmeRef: fixture.programmeSlug,
    authorUserId: authorId,
    input: {
      proposalType: 'SOURCE_REFRESH',
      source: {
        reviewTaskId: fixture.sourceTaskId,
        reviewSnapshotId: fixture.pendingSnapshotId,
      },
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    },
  })
  expect(draft.proposal).toMatchObject({
    proposalType: 'SOURCE_REFRESH',
    selectedField: null,
    proposedText: null,
    proposedValue: null,
    claimNature: null,
    reasoning: null,
    currentValueSnapshot: null,
    source: {
      type: 'CLINICAL_TRIAL_REGISTRY',
      locator: fixture.locator,
      identifier: fixture.nctId,
      reviewTaskId: fixture.sourceTaskId,
      reviewSnapshotId: fixture.pendingSnapshotId,
    },
    sourceRefreshDeltaSnapshot: {
      action: 'CANONICAL_REFRESH',
      baselineSnapshotId: fixture.currentSnapshotId,
      pendingSnapshotId: fixture.pendingSnapshotId,
      scientificRevisionRequirements: [],
    },
  })
  expect(draft.preview.machineChecks).toMatchObject({ passed: true })
  expect(draft.preview.machineChecks.checks.map((check) => check.code)).toEqual([
    'source_refresh_exact_task_binding',
    'source_refresh_structured_delta',
    'source_refresh_no_authored_replacement',
    'current_verdict_available',
    'source_complete',
    'source_refresh_action_ready',
    'coi_attested',
    'dependency_graph_coverage',
  ])
  const submitted = await submitContributionProposal({
    proposalId: draft.proposal.id,
    authorUserId: authorId,
  })
  await submitContributionReview({
    proposalId: submitted.id,
    reviewerUserId: reviewerAId,
    input: contributionApproval,
  })
  await submitContributionReview({
    proposalId: submitted.id,
    reviewerUserId: reviewerBId,
    input: { ...contributionApproval, expertiseTags: ['BIOSTATISTICS'] },
  })
  await submitContributionReview({
    proposalId: submitted.id,
    reviewerUserId: stewardId,
    input: { ...contributionApproval, expertiseTags: ['REGULATORY_SCIENCE'] },
  })
  return submitted.id
}

beforeAll(async () => {
  if (process.env.E2E_DISPOSABLE_DATABASE !== '1') {
    throw new Error(
      'Source-refresh integration tests create immutable audit records and must run through the disposable-database harness.',
    )
  }
  await db.transaction(async (tx) => {
    await tx.insert(users).values([
      {
        id: authorId,
        email: `${authorId}@example.test`,
        passwordHash: 'not-used',
        name: 'Source refresh author',
        handle: `source-refresh-author-${runKey}`,
      },
      {
        id: reviewerAId,
        email: `${reviewerAId}@example.test`,
        passwordHash: 'not-used',
        name: 'Source refresh clinical reviewer',
        handle: `source-refresh-clinical-${runKey}`,
        orcid: '0000-0002-1825-0097',
        trustTier: 'trusted',
      },
      {
        id: reviewerBId,
        email: `${reviewerBId}@example.test`,
        passwordHash: 'not-used',
        name: 'Source refresh statistics reviewer',
        handle: `source-refresh-statistics-${runKey}`,
        trustTier: 'trusted',
      },
      {
        id: stewardId,
        email: `${stewardId}@example.test`,
        passwordHash: 'not-used',
        name: 'Source refresh steward',
        handle: `source-refresh-steward-${runKey}`,
        trustTier: 'steward',
      },
      {
        id: adminId,
        email: `${adminId}@example.test`,
        passwordHash: 'not-used',
        name: 'Source refresh qualification administrator',
        handle: `source-refresh-admin-${runKey}`,
        isAdmin: true,
      },
    ])
    await tx.insert(programmeVerdictReviewerQualificationEvents).values([
      {
        id: fixtureId('qualification-clinical'),
        reviewerUserId: reviewerAId,
        expertiseTag: 'CLINICAL_DEVELOPMENT',
        action: 'GRANT',
        authorizedByUserId: stewardId,
        reason: 'Isolated source-refresh integration fixture.',
      },
      {
        id: fixtureId('qualification-statistics'),
        reviewerUserId: reviewerBId,
        expertiseTag: 'BIOSTATISTICS',
        action: 'GRANT',
        authorizedByUserId: stewardId,
        reason: 'Isolated source-refresh integration fixture.',
      },
      {
        id: fixtureId('qualification-steward'),
        reviewerUserId: stewardId,
        expertiseTag: 'REGULATORY_SCIENCE',
        action: 'GRANT',
        authorizedByUserId: adminId,
        reason: 'Isolated source-refresh integration fixture.',
      },
    ])
    await tx.insert(drugs).values({
      id: drugId,
      slug: medicineSlug,
      name: 'Source refresh medicine',
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })
  })
})

describe('task-bound source refresh rebinding', () => {
  it('moves exact status, enrolment, result and date changes through both review boundaries without authoring medical prose', async () => {
    const fixture = await monitorExactCanonicalRefresh(
      await createPublishedFixture('canonical-refresh', { registrySupportsClaim: false }),
    )
    const claimRowsBefore = await db
      .select()
      .from(claims)
      .where(eq(claims.programmeId, fixture.programmeId))
    const proposalId = await acceptCanonicalSourceRefresh(fixture)

    const implementation = await materializeAcceptedContributionCandidate({
      proposalId,
      implementedByUserId: stewardId,
    })
    expect(implementation).toMatchObject({ outcome: 'CANONICAL_CANDIDATE', reused: false })
    if (implementation.outcome !== 'CANONICAL_CANDIDATE') {
      throw new Error('Expected an exact source refresh to create a canonical candidate.')
    }
    const lockedProposal = await db.transaction((tx) =>
      buildLockedProgrammeVerdictProposal(tx, implementation.revisionId),
    )
    expect(lockedProposal.engineInput.changes).toEqual([
      {
        entity: { type: 'SOURCE', id: fixture.sourceId },
        changedFields: [
          'trial.completionDate',
          'trial.enrollment.count',
          'trial.hasResults',
          'trial.overallStatus',
          'trial.primaryCompletionDate',
          'trial.startDate',
        ],
        snapshotId: fixture.pendingSnapshotId,
      },
    ])

    const [candidateTrials, candidateScopes, candidateClaims, allClaimsBeforePublication] =
      await Promise.all([
        db
          .select()
          .from(programmeVerdictTrialSnapshots)
          .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, implementation.revisionId)),
        db
          .select()
          .from(programmeVerdictScopeSnapshots)
          .where(eq(programmeVerdictScopeSnapshots.verdictRevisionId, implementation.revisionId)),
        db
          .select()
          .from(programmeVerdictClaims)
          .where(eq(programmeVerdictClaims.verdictRevisionId, implementation.revisionId)),
        db.select().from(claims).where(eq(claims.programmeId, fixture.programmeId)),
      ])
    expect(candidateTrials).toEqual([
      expect.objectContaining({
        status: 'COMPLETED',
        resultsStatus: 'AVAILABLE',
        enrolment: 128,
        startDate: '2025-02-01',
        primaryCompletionDate: '2026-07-15',
        completionDate: '2026-08-15',
        registrySnapshotId: fixture.pendingSnapshotId,
      }),
    ])
    expect(candidateScopes).toEqual([
      expect.objectContaining({
        status: 'COMPLETED',
        startDate: '2025-02-01',
        endDate: '2026-08-15',
      }),
    ])
    expect(candidateClaims.map((row) => row.claimId)).toEqual([fixture.claimId])
    expect(allClaimsBeforePublication).toEqual(claimRowsBefore)

    await approveAndPublishVerdict(implementation.revisionId, implementation.proposalDigest)
    const [freshness, task, pointer, allClaimsAfterPublication] = await Promise.all([
      db
        .select()
        .from(programmeFreshnessStates)
        .where(eq(programmeFreshnessStates.programmeId, fixture.programmeId)),
      db.select().from(evidenceReviewTasks).where(eq(evidenceReviewTasks.id, fixture.sourceTaskId)),
      db
        .select()
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId)),
      db.select().from(claims).where(eq(claims.programmeId, fixture.programmeId)),
    ])
    expect(freshness.find((row) => row.sourceId === fixture.sourceId)).toMatchObject({
      currentSnapshotId: fixture.pendingSnapshotId,
      pendingSnapshotId: null,
      freshnessStatus: 'CURRENT',
    })
    expect(task[0]).toMatchObject({
      status: 'RESOLVED',
      resolutionVerdictRevisionId: implementation.revisionId,
    })
    expect(pointer[0]?.verdictRevisionId).toBe(implementation.revisionId)
    expect(allClaimsAfterPublication).toEqual(claimRowsBefore)
  })

  it('stops at NEEDS_SCIENTIFIC_REVISION when the changed registry source supports reviewed claims', async () => {
    const fixture = await monitorExactCanonicalRefresh(
      await createPublishedFixture('scientific-revision-required'),
    )
    const draft = await createContributionDraft({
      medicineSlug,
      programmeRef: fixture.programmeSlug,
      authorUserId: authorId,
      input: {
        proposalType: 'SOURCE_REFRESH',
        source: {
          type: 'CLINICAL_TRIAL_REGISTRY',
          locator: fixture.locator,
          identifier: fixture.nctId,
          reviewTaskId: fixture.sourceTaskId,
          reviewSnapshotId: fixture.pendingSnapshotId,
        },
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })
    expect(draft.proposal.sourceRefreshDeltaSnapshot).toMatchObject({
      action: 'NEEDS_SCIENTIFIC_REVISION',
      affectedClaimIds: [fixture.claimId],
      scientificRevisionRequirements: expect.arrayContaining([
        expect.objectContaining({
          kind: 'CLAIM',
          id: fixture.claimId,
          fieldPath: 'claim.sourceSnapshot',
        }),
      ]),
    })
    expect(draft.preview.machineChecks).toMatchObject({ passed: false })
    expect(
      draft.preview.machineChecks.checks.find(
        (check) => check.code === 'source_refresh_action_ready',
      ),
    ).toMatchObject({ status: 'FAIL' })
    await expect(
      submitContributionProposal({ proposalId: draft.proposal.id, authorUserId: authorId }),
    ).rejects.toMatchObject({ code: 'machine_checks_failed' })
    expect(
      await db
        .select()
        .from(programmeContributionImplementations)
        .where(eq(programmeContributionImplementations.proposalId, draft.proposal.id)),
    ).toEqual([])
  })

  it('reviews and publishes pending source facts while preserving inherited scientific citations and graph history', async () => {
    const fixture = await bindPendingUpdate(await createPublishedFixture('success'))
    const proposalId = await acceptStatusCorrection(fixture)
    const [claimBefore, nodeBefore, assessmentsBefore] = await Promise.all([
      db.select().from(claims).where(eq(claims.id, fixture.claimId)),
      db.select().from(evidenceNodes).where(eq(evidenceNodes.id, fixture.nodeId)),
      db
        .select()
        .from(trialInterpretabilityAssessments)
        .where(inArray(trialInterpretabilityAssessments.id, fixture.assessmentIds))
        .orderBy(asc(trialInterpretabilityAssessments.id)),
    ])

    const implementation = await materializeAcceptedContributionCandidate({
      proposalId,
      implementedByUserId: stewardId,
    })
    expect(implementation).toMatchObject({
      outcome: 'CANONICAL_CANDIDATE',
      proposalId,
      reused: false,
    })
    if (implementation.outcome !== 'CANONICAL_CANDIDATE') {
      throw new Error('Expected a canonical source-refresh candidate.')
    }
    const candidateId = implementation.revisionId
    const reused = await materializeAcceptedContributionCandidate({
      proposalId,
      implementedByUserId: stewardId,
    })
    expect(reused).toMatchObject({
      outcome: 'CANONICAL_CANDIDATE',
      revisionId: candidateId,
      proposalDigest: implementation.proposalDigest,
      reused: true,
    })

    const workflow = await getProgrammeVerdictWorkflowState({
      revisionId: candidateId,
      viewerUserId: reviewerAId,
    })
    const pendingClaimLink = workflow.exactBundle.publicationLinks.claimSources.find(
      (link) => link.sourceSnapshotId === fixture.pendingSnapshotId,
    )
    expect(pendingClaimLink).toBeDefined()
    expect(pendingClaimLink?.claimId).not.toBe(fixture.claimId)
    expect(workflow.exactBundle.sourceSnapshotRecords.map((row) => row.id)).toEqual(
      expect.arrayContaining([fixture.currentSnapshotId, fixture.pendingSnapshotId]),
    )
    expect(workflow.exactBundle.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: { type: 'SOURCE', id: fixture.sourceId },
          to: { type: 'CLAIM', id: pendingClaimLink?.claimId },
          impact: 'POSSIBLE_VERDICT_IMPACT',
        }),
      ]),
    )
    const presentation = workflow.exactBundle.presentation
    expect(presentation).toBeDefined()
    if (!presentation) throw new Error('Expected the inherited presentation bundle.')
    expect(presentation.timelineEvents).toEqual([
      expect.objectContaining({
        eventKey: 'registry-status',
        sourceSnapshotId: fixture.currentSnapshotId,
        claimLinks: [expect.objectContaining({ claimId: fixture.claimId })],
      }),
    ])

    const [
      candidateVerdictClaims,
      candidateNodes,
      candidateAssessments,
      mechanismClaims,
      timelineClaims,
      candidateDependencies,
      reviewedClaimSources,
      nodeClaimLinks,
      assessmentClaimLinks,
    ] = await Promise.all([
      db
        .select()
        .from(programmeVerdictClaims)
        .where(eq(programmeVerdictClaims.verdictRevisionId, candidateId)),
      db
        .select()
        .from(programmeVerdictEvidenceNodes)
        .where(eq(programmeVerdictEvidenceNodes.verdictRevisionId, candidateId)),
      db
        .select()
        .from(programmeVerdictInterpretabilityAssessments)
        .where(eq(programmeVerdictInterpretabilityAssessments.verdictRevisionId, candidateId)),
      db
        .select()
        .from(programmeVerdictMechanismStepClaims)
        .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, candidateId)),
      db
        .select()
        .from(programmeVerdictTimelineEventClaims)
        .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, candidateId)),
      db
        .select()
        .from(programmeDependencies)
        .where(eq(programmeDependencies.verdictRevisionId, candidateId)),
      db
        .select()
        .from(claimSourceLinks)
        .where(inArray(claimSourceLinks.claimId, [fixture.claimId, pendingClaimLink!.claimId])),
      db
        .select()
        .from(evidenceNodeClaims)
        .where(eq(evidenceNodeClaims.evidenceNodeId, fixture.nodeId)),
      db
        .select()
        .from(trialInterpretabilityClaims)
        .where(inArray(trialInterpretabilityClaims.assessmentId, fixture.assessmentIds)),
    ])
    expect(candidateVerdictClaims.map((row) => row.claimId)).toEqual(
      expect.arrayContaining([fixture.claimId, pendingClaimLink!.claimId]),
    )
    expect(candidateNodes.map((row) => row.evidenceNodeId)).toEqual([fixture.nodeId])
    expect(candidateAssessments.map((row) => row.assessmentId).sort()).toEqual(
      [...fixture.assessmentIds].sort(),
    )
    expect(nodeClaimLinks).toEqual([
      expect.objectContaining({ claimId: fixture.claimId, relationship: 'SUPPORTS' }),
    ])
    expect(assessmentClaimLinks).toHaveLength(fixture.assessmentIds.length)
    expect(
      assessmentClaimLinks.every(
        (row) => row.claimId === fixture.claimId && row.relationship === 'SUPPORTS',
      ),
    ).toBe(true)
    expect(mechanismClaims).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          stepKey: 'delivery',
          claimId: fixture.claimId,
          relationship: 'SUPPORTS',
        }),
        expect.objectContaining({
          stepKey: 'pathway',
          claimId: fixture.claimId,
          relationship: 'QUALIFIES',
        }),
        expect.objectContaining({
          stepKey: 'outcome',
          claimId: fixture.claimId,
          relationship: 'SUPPORTS',
        }),
      ]),
    )
    expect(timelineClaims).toEqual([
      expect.objectContaining({ claimId: fixture.claimId, relationship: 'SUPPORTS' }),
    ])
    expect(
      candidateDependencies
        .filter((row) => row.claimId === fixture.claimId)
        .map((row) => row.fieldPath),
    ).toEqual(
      expect.arrayContaining([
        'summary.plainMechanism',
        'verdict.publicLabel',
        'mechanism.pathway.plainDescription',
        'timeline.registry-status.plainDescription',
      ]),
    )
    expect(reviewedClaimSources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          claimId: fixture.claimId,
          sourceSnapshotId: fixture.currentSnapshotId,
          relationship: 'SUPPORTS',
        }),
        expect.objectContaining({
          claimId: pendingClaimLink!.claimId,
          sourceSnapshotId: fixture.pendingSnapshotId,
          relationship: 'SUPPORTS',
        }),
      ]),
    )
    expect(
      await db.select().from(claims).where(eq(claims.previousClaimId, fixture.claimId)),
    ).toEqual([])
    expect(
      await db
        .select()
        .from(evidenceNodes)
        .where(eq(evidenceNodes.previousEvidenceNodeId, fixture.nodeId)),
    ).toEqual([])
    expect(
      await db
        .select()
        .from(trialInterpretabilityAssessments)
        .where(
          inArray(trialInterpretabilityAssessments.previousAssessmentId, fixture.assessmentIds),
        ),
    ).toEqual([])
    expect(await db.select().from(claims).where(eq(claims.id, fixture.claimId))).toEqual(
      claimBefore,
    )
    expect(
      await db.select().from(evidenceNodes).where(eq(evidenceNodes.id, fixture.nodeId)),
    ).toEqual(nodeBefore)
    expect(
      await db
        .select()
        .from(trialInterpretabilityAssessments)
        .where(inArray(trialInterpretabilityAssessments.id, fixture.assessmentIds))
        .orderBy(asc(trialInterpretabilityAssessments.id)),
    ).toEqual(assessmentsBefore)

    const candidateTrial = await db
      .select()
      .from(programmeVerdictTrialSnapshots)
      .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, candidateId))
    expect(candidateTrial).toEqual([
      expect.objectContaining({
        programmeTrialId: fixture.trialId,
        status: 'COMPLETED',
        resultsStatus: 'AVAILABLE',
        enrolment: 128,
        registrySnapshotId: fixture.pendingSnapshotId,
      }),
    ])

    await approveAndPublishVerdict(candidateId, implementation.proposalDigest)
    const [pointer, publishedCandidate, oldVerdict, task, freshness, implementationRows] =
      await Promise.all([
        db
          .select()
          .from(programmeCurrentPublications)
          .where(eq(programmeCurrentPublications.programmeId, fixture.programmeId)),
        db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, candidateId)),
        db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, fixture.verdictId)),
        db
          .select()
          .from(evidenceReviewTasks)
          .where(eq(evidenceReviewTasks.id, fixture.sourceTaskId)),
        db
          .select()
          .from(programmeFreshnessStates)
          .where(eq(programmeFreshnessStates.programmeId, fixture.programmeId)),
        db
          .select()
          .from(programmeContributionImplementations)
          .where(eq(programmeContributionImplementations.proposalId, proposalId)),
      ])
    expect(pointer[0]?.verdictRevisionId).toBe(candidateId)
    expect(publishedCandidate[0]?.reviewStatus).toBe('PUBLISHED')
    expect(oldVerdict[0]?.reviewStatus).toBe('SUPERSEDED')
    expect(task[0]).toMatchObject({
      status: 'RESOLVED',
      resolutionVerdictRevisionId: candidateId,
    })
    expect(freshness[0]).toMatchObject({
      currentSnapshotId: fixture.pendingSnapshotId,
      pendingSnapshotId: null,
      freshnessStatus: 'CURRENT',
    })
    expect(implementationRows).toEqual([
      expect.objectContaining({
        verdictRevisionId: candidateId,
        sourceReviewTaskId: fixture.sourceTaskId,
        sourceSnapshotId: fixture.pendingSnapshotId,
      }),
    ])
    expect(await db.select().from(claims).where(eq(claims.id, fixture.claimId))).toEqual(
      claimBefore,
    )

    const successor = await createProgrammeVerdictDraftFromCurrentPublication({
      programmeId: fixture.programmeId,
      actorUserId: stewardId,
      conflictsOfInterest: 'None declared',
    })
    expect(successor).toMatchObject({
      previousVerdictRevisionId: candidateId,
      presentationSchemaVersion: 'programme-presentation/v1',
      reviewStatus: 'DRAFT',
      reused: false,
    })
    const successorPrepared = await prepareDraftProgrammePresentation({
      revisionId: successor.revisionId,
      actorUserId: stewardId,
    })
    expect(successorPrepared).toMatchObject({
      revisionId: successor.revisionId,
      engineVersion: 'rna-intelligence/evidence-2.1.0',
      proposalDigestAlgorithm: 'sha256',
    })
    const successorWorkflow = await getProgrammeVerdictWorkflowState({
      revisionId: successor.revisionId,
      viewerUserId: reviewerAId,
    })
    expect(successorWorkflow.exactBundle.sourceSnapshotRecords.map((row) => row.id)).toEqual(
      expect.arrayContaining([fixture.currentSnapshotId, fixture.pendingSnapshotId]),
    )
    expect(successorWorkflow.exactBundle.presentation?.timelineEvents).toEqual([
      expect.objectContaining({
        eventKey: 'registry-status',
        sourceSnapshotId: fixture.currentSnapshotId,
        claimLinks: [expect.objectContaining({ claimId: fixture.claimId })],
      }),
    ])
  })

  it('retires a superseded source candidate and lets the exact replacement task continue', async () => {
    const fixtureA = await bindPendingUpdate(await createPublishedFixture('superseded'))
    const proposalAId = await acceptStatusCorrection(fixtureA)
    const implementationA = await materializeAcceptedContributionCandidate({
      proposalId: proposalAId,
      implementedByUserId: stewardId,
    })
    expect(implementationA).toMatchObject({ outcome: 'CANONICAL_CANDIDATE', reused: false })
    if (implementationA.outcome !== 'CANONICAL_CANDIDATE') {
      throw new Error('Expected the first source task to create a canonical candidate.')
    }

    const supersedingAt = new Date('2026-08-22T01:00:00.000Z')
    const superseding = await monitorClinicalTrialsSource({
      database: db,
      adapter: new ClinicalTrialsGovAdapter(
        async () =>
          new Response(
            JSON.stringify(
              registryStudy({
                nctId: fixtureA.nctId,
                overallStatus: 'COMPLETED',
                enrolment: 129,
                hasResults: true,
              }),
            ),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
        () => supersedingAt,
      ),
      programmeId: fixtureA.programmeId,
      sourceId: fixtureA.sourceId,
      idempotencyKey: fixtureId('superseding-monitor-run'),
      now: () => supersedingAt,
    })
    expect(superseding).toMatchObject({
      status: 'SUCCEEDED',
      currentSnapshotId: fixtureA.currentSnapshotId,
      pendingSnapshotId: superseding.snapshotId,
      highestImpact: 'POSSIBLE_VERDICT_IMPACT',
    })
    expect(superseding.reviewTaskIds).toHaveLength(1)
    const replacementTaskId = superseding.reviewTaskIds[0]!
    expect(replacementTaskId).not.toBe(fixtureA.sourceTaskId)

    const taskRows = await db
      .select()
      .from(evidenceReviewTasks)
      .where(inArray(evidenceReviewTasks.id, [fixtureA.sourceTaskId, replacementTaskId]))
    expect(taskRows.find((task) => task.id === fixtureA.sourceTaskId)).toMatchObject({
      status: 'DISMISSED',
      resolvedAt: supersedingAt,
      resolutionNote: expect.stringContaining(replacementTaskId),
      resolutionVerdictRevisionId: null,
      resolutionContributionProposalId: null,
    })
    expect(taskRows.find((task) => task.id === replacementTaskId)).toMatchObject({
      status: 'OPEN',
      triggerSnapshotId: superseding.snapshotId,
      resolvedAt: null,
    })

    await expect(
      submitProgrammeVerdictReview({
        revisionId: implementationA.revisionId,
        reviewerUserId: reviewerAId,
        expectedProposalDigest: implementationA.proposalDigest,
        decision: 'APPROVE',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        isIndependent: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      }),
    ).rejects.toMatchObject({ code: 'source_task_superseded' })

    const fixtureB: SourceRefreshFixture = {
      ...fixtureA,
      pendingSnapshotId: superseding.snapshotId!,
      sourceTaskId: replacementTaskId,
    }
    const proposalBId = await acceptStatusCorrection(fixtureB)
    const implementationB = await materializeAcceptedContributionCandidate({
      proposalId: proposalBId,
      implementedByUserId: stewardId,
    })
    expect(implementationB).toMatchObject({
      outcome: 'CANONICAL_CANDIDATE',
      reused: false,
    })
    if (implementationB.outcome !== 'CANONICAL_CANDIDATE') {
      throw new Error('Expected the replacement source task to create a canonical candidate.')
    }

    const queue = await listCanonicalQueueCandidates({ limit: 1_000, offset: 0 })
    expect(queue.candidates.map((candidate) => candidate.id)).not.toContain(
      implementationA.revisionId,
    )
    expect(queue.candidates.map((candidate) => candidate.id)).toContain(implementationB.revisionId)
    await expect(
      getProgrammeVerdictWorkflowState({
        revisionId: implementationB.revisionId,
        viewerUserId: reviewerAId,
      }),
    ).resolves.toMatchObject({ revisionId: implementationB.revisionId })
  })

  it('rolls the candidate back when an inherited citation is deeper than the exact current predecessor', async () => {
    const fixture = await bindPendingUpdate(await createPublishedFixture('ambiguous'), {
      intermediateCurrent: true,
    })
    const proposalId = await acceptStatusCorrection(fixture)
    const verdictRowsBefore = await db
      .select({ id: programmeVerdictRevisions.id })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.programmeId, fixture.programmeId))
    const claimRowsBefore = await db
      .select({ id: claims.id })
      .from(claims)
      .where(eq(claims.programmeId, fixture.programmeId))

    await expect(
      materializeAcceptedContributionCandidate({
        proposalId,
        implementedByUserId: stewardId,
      }),
    ).rejects.toMatchObject({ code: 'claim_rewrite_required' })

    expect(
      await db
        .select({ id: programmeVerdictRevisions.id })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.programmeId, fixture.programmeId)),
    ).toEqual(verdictRowsBefore)
    expect(
      await db
        .select({ id: claims.id })
        .from(claims)
        .where(eq(claims.programmeId, fixture.programmeId)),
    ).toEqual(claimRowsBefore)
    expect(
      await db
        .select()
        .from(programmeContributionImplementations)
        .where(eq(programmeContributionImplementations.proposalId, proposalId)),
    ).toEqual([])
    expect(
      await db
        .select()
        .from(evidenceReviewTasks)
        .where(eq(evidenceReviewTasks.id, fixture.sourceTaskId)),
    ).toEqual([expect.objectContaining({ status: 'OPEN' })])
  })
})

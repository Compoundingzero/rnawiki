import { randomUUID } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, inArray } from 'drizzle-orm'

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
  programmeContributionAdjudications,
  programmeContributionProposals,
  programmeContributionReviews,
  programmeContributionReviewStates,
  programmeCurrentPublications,
  programmeDependencies,
  programmeFreshnessStates,
  programmeTrials,
  programmeVerdictClaims,
  programmeVerdictEvidenceNodes,
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
  users,
} from '@/db/schema'
import { PROGRAMME_SUMMARY_FIELD_PATHS, PROGRAMME_VERDICT_FIELD_PATHS } from '@/lib/evidence/types'
import {
  createContributionDraft,
  getProgrammeContributionContext,
  listAuthorProgrammeContributions,
  listPublicPendingContributionProposals,
  reviseSubmittedContribution,
  submitContributionProposal,
  updateContributionDraft,
} from '@/lib/queries/programme-contributions'
import {
  adjudicateContributionReview,
  getContributionReviewState,
  submitContributionReview,
} from '@/lib/queries/programme-contribution-reviews'
import { materializeAcceptedContributionCandidate } from '@/lib/queries/programme-contribution-implementation'
import {
  adjudicateProgrammeVerdict,
  getProgrammeVerdictWorkflowState,
  submitProgrammeVerdictReview,
} from '@/lib/queries/programme-verdict-workflow'
import { publishProgrammeVerdictRevision } from '@/lib/queries/programme-verdict-publication'
import { getPublicProgrammeVerdictHistory } from '@/lib/queries/public-programme-verdict-history'
import { getProgrammeEvidenceByMedicineSlug } from '@/lib/queries/programme-evidence'
import type { ContributionReviewDecisionInput } from '@/lib/contributions/review-validation'

const key = randomUUID().replaceAll('-', '').slice(0, 10)
const id = (kind: string) => `pct-${kind}-${key}`.slice(0, 64)
const drugId = id('drug')
const medicineSlug = id('medicine')
const programmeId = id('programme')
const programmeSlug = id('programme-slug')
const otherProgrammeId = id('programme-other')
const trialId = id('trial')
const claimId = id('claim')
const nodeId = id('node')
const otherNodeId = id('node-other')
const verdictId = id('verdict')
const authorId = id('author')
const otherAuthorId = id('author-other')
const reviewerAId = id('reviewer-a')
const reviewerBId = id('reviewer-b')
const reviewerCId = id('reviewer-c')
const stewardId = id('steward')
const SOURCE_ID = 'pct-shared-source-v1'
const SNAPSHOT_ID = 'pct-shared-snapshot-v1'
const ENGINE_VERSION = 'rna-intelligence/evidence-2.1.0'
const INPUT_DIGEST = 'd'.repeat(64)
const PROPOSAL_DIGEST = 'e'.repeat(64)
const NOW = new Date('2026-08-22T00:00:00.000Z')
const NCT_ID = `NCT${parseInt(key.slice(0, 8), 16).toString().padStart(8, '0').slice(-8)}`

let submittedProposalId = ''

beforeAll(async () => {
  await db
    .insert(evidenceSources)
    .values({
      id: SOURCE_ID,
      sourceType: 'PEER_REVIEWED_PUBLICATION',
      externalIdentifier: 'doi:10.1000/rnawiki-contribution-test',
      canonicalLocator: 'https://doi.org/10.1000/rnawiki-contribution-test',
      title: 'Stable programme contribution integration source',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    .onConflictDoNothing()
  await db
    .insert(sourceSnapshots)
    .values({
      id: SNAPSHOT_ID,
      sourceId: SOURCE_ID,
      retrievedAt: NOW,
      lastVerifiedAt: NOW,
      contentHash: 'f'.repeat(64),
      structuredData: { fixture: 'programme-contributions' },
    })
    .onConflictDoNothing()

  await db.transaction(async (tx) => {
    await tx.insert(users).values([
      {
        id: authorId,
        email: `${authorId}@example.test`,
        passwordHash: 'not-used',
        name: 'Contribution author',
        handle: `contributor-${key}`,
      },
      {
        id: otherAuthorId,
        email: `${otherAuthorId}@example.test`,
        passwordHash: 'not-used',
        name: 'Other contribution author',
        handle: `other-contributor-${key}`,
      },
      {
        id: reviewerAId,
        email: `${reviewerAId}@example.test`,
        passwordHash: 'not-used',
        name: 'Contribution reviewer A',
        handle: `clinical-reviewer-${key}`,
        orcid: '0000-0002-1825-0097',
        trustTier: 'trusted',
      },
      {
        id: reviewerBId,
        email: `${reviewerBId}@example.test`,
        passwordHash: 'not-used',
        name: 'Contribution reviewer B',
        handle: `statistics-reviewer-${key}`,
        trustTier: 'trusted',
      },
      {
        id: reviewerCId,
        email: `${reviewerCId}@example.test`,
        passwordHash: 'not-used',
        name: 'Contribution reviewer C',
        handle: `third-reviewer-${key}`,
        trustTier: 'trusted',
        isAdmin: true,
      },
      {
        id: stewardId,
        email: `${stewardId}@example.test`,
        passwordHash: 'not-used',
        name: 'Contribution steward',
        handle: `adjudicator-${key}`,
        orcid: '0000-0001-5109-3700',
        trustTier: 'steward',
      },
    ])
    await tx.insert(programmeVerdictReviewerQualificationEvents).values([
      {
        id: id('qualification-reviewer-a'),
        reviewerUserId: reviewerAId,
        expertiseTag: 'CLINICAL_DEVELOPMENT',
        action: 'GRANT',
        authorizedByUserId: stewardId,
        reason: 'Synthetic canonical baseline reviewer qualification.',
      },
      {
        id: id('qualification-reviewer-b'),
        reviewerUserId: reviewerBId,
        expertiseTag: 'BIOSTATISTICS',
        action: 'GRANT',
        authorizedByUserId: stewardId,
        reason: 'Synthetic canonical baseline reviewer qualification.',
      },
      {
        id: id('qualification-steward'),
        reviewerUserId: stewardId,
        expertiseTag: 'REGULATORY_SCIENCE',
        action: 'GRANT',
        authorizedByUserId: reviewerCId,
        reason: 'Synthetic canonical adjudicator qualification.',
      },
    ])
    await tx.insert(drugs).values({
      id: drugId,
      slug: medicineSlug,
      name: 'Contribution integration medicine',
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })
    await tx.insert(developmentProgrammes).values([
      {
        id: programmeId,
        drugId,
        slug: programmeSlug,
        title: 'Current public programme',
        indication: 'Condition alpha',
        targetPopulation: 'Adults with condition alpha',
        status: 'ACTIVE',
        highestPhaseReached: 'Phase 2',
        route: 'Oral',
        doseExposureContext: 'Recorded exposure',
        updateStatus: 'CURRENT',
      },
      {
        id: otherProgrammeId,
        drugId,
        slug: id('other-programme-slug'),
        title: 'Other programme',
        status: 'ACTIVE',
      },
    ])
    await tx.insert(programmeTrials).values({
      id: trialId,
      programmeId,
      trialIdentifier: NCT_ID,
      title: 'Programme contribution fixture trial',
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      humanStudyStatus: 'YES',
    })
    await tx.insert(claims).values({
      id: claimId,
      programmeId,
      claimKey: 'contribution-test-claim',
      revisionNumber: 1,
      programmeTrialId: trialId,
      evidenceNodeType: 'PATIENT_OUTCOME',
      nature: 'MEASURED',
      reviewStatus: 'PUBLISHED',
      plainLanguageText: 'A measured fixture outcome was recorded.',
      direction: 'NOT_APPLICABLE',
      authorUserId: authorId,
      publishedAt: NOW,
    })
    await tx.insert(evidenceNodes).values([
      {
        id: nodeId,
        programmeId,
        nodeType: 'PATIENT_OUTCOME',
        revisionNumber: 1,
        state: 'CONFIRMED',
        reviewStatus: 'PUBLISHED',
        plainSummary: 'The current patient-outcome evidence has recorded support.',
        professionalSummary: 'Supported fixture endpoint evidence.',
        rationale: 'Integration fixture only.',
        authorUserId: authorId,
        publishedAt: NOW,
      },
      {
        id: otherNodeId,
        programmeId: otherProgrammeId,
        nodeType: 'PATIENT_OUTCOME',
        revisionNumber: 1,
        state: 'UNKNOWN',
        reviewStatus: 'PUBLISHED',
        plainSummary: 'Other programme node.',
        authorUserId: authorId,
        publishedAt: NOW,
      },
    ])
    await tx.insert(claimSourceLinks).values({
      programmeId,
      claimId,
      sourceSnapshotId: SNAPSHOT_ID,
      relationship: 'SUPPORTS',
      sourceLocator: 'https://doi.org/10.1000/rnawiki-contribution-test',
    })
    await tx.insert(evidenceNodeClaims).values({
      programmeId,
      evidenceNodeId: nodeId,
      claimId,
      relationship: 'SUPPORTS',
    })
    await tx.insert(programmeFreshnessStates).values({
      programmeId,
      sourceId: SOURCE_ID,
      currentSnapshotId: SNAPSHOT_ID,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      lastSuccessfulCheckAt: NOW,
      lastVerifiedAt: NOW,
    })
    await tx.insert(programmeVerdictRevisions).values({
      id: verdictId,
      programmeId,
      revisionNumber: 1,
      reviewStatus: 'DRAFT',
      presentationSchemaVersion: 'programme-presentation/v1',
      programmeStatusAtReview: 'ACTIVE',
      proposalAsOfDate: '2026-08-22',
      publicLabel: 'Current fixture conclusion',
      professionalLabel: 'Current professional fixture conclusion',
      indicationScope: 'Condition alpha',
      populationScope: 'Adults with condition alpha',
      doseExposureScope: 'Recorded exposure',
      periodScope: '2025 to 2026',
      trialScope: NCT_ID,
      outcomeScope: 'Patient outcome endpoint',
      plainMechanism: 'The fixture was intended to alter a recorded pathway.',
      bestSupportedFinding: 'A measured fixture outcome was recorded.',
      mainLimitation: 'The fixture evidence is deliberately sparse.',
      oneSentenceReason: 'The current fixture conclusion reflects mixed outcome evidence.',
      whatWasDisproven: ['A broad benefit conclusion was not established.'],
      whatWasNotDisproven: ['The target concept was not disproven.'],
      whatRemainsUnknown: ['Whether a narrower population benefits remains unknown.'],
      confidence: 'MODERATE',
      confidenceExplanation: 'The fixture endpoint evidence is mixed.',
      conditionsThatWouldChangeVerdict: ['A complete interpretable outcome result.'],
      authorUserId: authorId,
      authorName: 'Contribution fixture author',
      sourceDependent: true,
      engineVersion: ENGINE_VERSION,
      inputDigest: INPUT_DIGEST,
      proposalDigest: PROPOSAL_DIGEST,
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
    await tx.insert(programmeVerdictScopeSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      drugId,
      slug: programmeSlug,
      title: 'Current public programme',
      indication: 'Condition alpha',
      targetPopulation: 'Adults with condition alpha',
      partners: [],
      status: 'ACTIVE',
      highestPhaseReached: 'Phase 2',
      route: 'Oral',
      doseExposureContext: 'Recorded exposure',
      stoppingReasonCategory: 'UNKNOWN',
    })
    await tx.insert(programmeVerdictTrialSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      programmeTrialId: trialId,
      trialIdentifier: NCT_ID,
      title: 'Programme contribution fixture trial',
      status: 'COMPLETED',
      resultsStatus: 'AVAILABLE',
      enrolmentType: 'UNKNOWN',
      humanStudyStatus: 'YES',
    })
    await tx.insert(programmeVerdictSourceMetadataSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      sourceId: SOURCE_ID,
      sourceType: 'PEER_REVIEWED_PUBLICATION',
      externalIdentifier: 'doi:10.1000/rnawiki-contribution-test',
      canonicalLocator: 'https://doi.org/10.1000/rnawiki-contribution-test',
      title: 'Stable programme contribution integration source',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    await tx.insert(programmeVerdictMechanismSteps).values(
      ['delivery', 'pathway', 'outcome'].map((stepKey, index) => ({
        verdictRevisionId: verdictId,
        programmeId,
        stepKey,
        stepOrder: index + 1,
        plainTitle: `Current reviewed mechanism stage ${index + 1}`,
        plainDescription: 'The exact reviewed claim supports this bounded programme stage.',
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
      eventKey: 'reviewed-result',
      eventDate: '2026-08-20',
      eventType: 'IMPORTANT_RESULT',
      dateBasis: 'ACTUAL',
      plainTitle: 'The reviewed result became available',
      plainDescription: 'The saved source version contains the reviewed programme result.',
      programmeTrialId: trialId,
      sourceId: SOURCE_ID,
      sourceSnapshotId: SNAPSHOT_ID,
    })
    await tx.insert(programmeVerdictTimelineEventClaims).values({
      verdictRevisionId: verdictId,
      programmeId,
      eventKey: 'reviewed-result',
      claimId,
      relationship: 'SUPPORTS',
    })
    await tx.insert(programmeDependencies).values([
      ...PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath, index) => ({
        id: id(`summary-dep-${index}`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'PROGRAMME_SUMMARY' as const,
        fieldPath,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      })),
      ...PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath, index) => ({
        id: id(`verdict-dep-${index}`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'VERDICT' as const,
        fieldPath,
        impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
      })),
      {
        id: id('node-dep'),
        programmeId,
        claimId,
        evidenceNodeId: nodeId,
        dependentSurfaceType: 'EVIDENCE_NODE' as const,
        fieldPath: 'evidenceNodes.PATIENT_OUTCOME.summary',
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      },
      ...['delivery', 'pathway', 'outcome'].map((stepKey, index) => ({
        id: id(`mechanism-dep-${index}`),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'MECHANISM_MAP' as const,
        fieldPath: `mechanism.${stepKey}.plainDescription`,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      })),
      {
        id: id('timeline-dep'),
        programmeId,
        claimId,
        verdictRevisionId: verdictId,
        dependentSurfaceType: 'TIMELINE' as const,
        fieldPath: 'timeline.reviewed-result.plainDescription',
        impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
      },
    ])
  })

  await db.transaction(async (tx) => {
    await tx
      .update(programmeVerdictRevisions)
      .set({
        reviewStatus: 'APPROVED',
        proposalPreparedAt: new Date('2026-08-22T00:01:00.000Z'),
        reviewedAt: new Date('2026-08-22T00:02:00.000Z'),
      })
      .where(eq(programmeVerdictRevisions.id, verdictId))
    await tx.insert(programmeVerdictReviews).values([
      {
        id: id('review-a'),
        verdictRevisionId: verdictId,
        reviewerUserId: reviewerAId,
        reviewerName: 'Contribution reviewer A',
        reviewerOrcidSnapshot: '0000-0002-1825-0097',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        isIndependent: true,
        conflictsOfInterest: 'None',
        conflictsOfInterestAttested: true,
        proposalDigest: PROPOSAL_DIGEST,
        engineVersion: ENGINE_VERSION,
        inputDigest: INPUT_DIGEST,
      },
      {
        id: id('review-b'),
        verdictRevisionId: verdictId,
        reviewerUserId: reviewerBId,
        reviewerName: 'Contribution reviewer B',
        expertiseTags: ['BIOSTATISTICS'],
        decision: 'APPROVE',
        isIndependent: true,
        conflictsOfInterest: 'None',
        conflictsOfInterestAttested: true,
        proposalDigest: PROPOSAL_DIGEST,
        engineVersion: ENGINE_VERSION,
        inputDigest: INPUT_DIGEST,
      },
    ])
  })
  await db.transaction(async (tx) => {
    await tx
      .update(programmeVerdictRevisions)
      .set({ reviewStatus: 'PUBLISHED', publishedAt: new Date('2026-08-22T00:03:00.000Z') })
      .where(eq(programmeVerdictRevisions.id, verdictId))
    await tx.insert(programmeCurrentPublications).values({
      programmeId,
      verdictRevisionId: verdictId,
      publishedAt: new Date('2026-08-22T00:03:00.000Z'),
    })
  })
})

afterAll(async () => {
  await db.transaction(async (tx) => {
    await tx.delete(drugs).where(eq(drugs.id, drugId))
    // Canonical qualification events are immutable audit records. Their reviewer and authorizer
    // principals intentionally remain in this disposable integration database.
    await tx.delete(users).where(inArray(users.id, [authorId, otherAuthorId]))
  })
})

async function createSubmittedCorrection(args: {
  suffix: string
  selectedField?: 'programme.title' | 'programme.indication' | 'programme.route'
}) {
  const selectedField = args.selectedField ?? 'programme.title'
  const draft = await createContributionDraft({
    medicineSlug,
    programmeRef: programmeSlug,
    authorUserId: authorId,
    input: {
      proposalType: 'CORRECTION',
      selectedField,
      proposedText: `Corrected ${args.suffix} value`,
      source: {
        type: 'PEER_REVIEWED_PUBLICATION',
        locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
        identifier: 'doi:10.1000/rnawiki-contribution-test',
      },
      claimNature: 'MEASURED',
      reasoning: `The frozen source supports correction ${args.suffix}.`,
      whatWasWrongOrMissing: `The current ${args.suffix} value is incomplete.`,
      affects: 'OPEN_QUESTIONS',
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    },
  })
  return submitContributionProposal({ proposalId: draft.proposal.id, authorUserId: authorId })
}

const APPROVE_REVIEW = {
  decision: 'APPROVE',
  expertiseTags: ['CLINICAL_DEVELOPMENT'],
  independenceAttested: true,
  conflictsOfInterest: 'None declared',
  conflictsOfInterestAttested: true,
} satisfies ContributionReviewDecisionInput

function registryStudy(overallStatus: string, enrollment: number, hasResults: boolean) {
  return {
    hasResults,
    protocolSection: {
      identificationModule: {
        nctId: NCT_ID,
        briefTitle: 'Programme contribution fixture trial',
      },
      statusModule: {
        overallStatus,
        startDateStruct: { date: '2025-01-01' },
        primaryCompletionDateStruct: { date: '2026-07-01' },
        completionDateStruct: { date: '2026-08-01' },
      },
      sponsorCollaboratorsModule: {
        leadSponsor: { name: 'Registry bridge sponsor', class: 'INDUSTRY' },
      },
      designModule: {
        phases: ['PHASE2'],
        enrollmentInfo: { count: enrollment, type: 'ACTUAL' },
      },
      conditionsModule: { conditions: ['Condition alpha'] },
      armsInterventionsModule: {
        interventions: [{ name: 'Contribution integration medicine', type: 'DRUG' }],
      },
    },
  }
}

describe('programme contribution proposals', () => {
  it('submits a same-programme evidence-chain challenge with a frozen, graph-derived bundle', async () => {
    const created = await createContributionDraft({
      medicineSlug,
      programmeRef: programmeSlug,
      authorUserId: authorId,
      input: {
        proposalType: 'VERDICT_CHALLENGE',
        selectedField: 'verdict.publicLabel',
        proposedText: 'A narrower conclusion limited to the measured population.',
        source: {
          type: 'PEER_REVIEWED_PUBLICATION',
          locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
          identifier: 'doi:10.1000/rnawiki-contribution-test',
        },
        claimNature: 'MEASURED',
        evidenceNodeId: nodeId,
        reasoning: 'The current label is broader than the measured fixture population.',
        whatWasWrongOrMissing: 'The population qualifier is missing.',
        affects: 'BOTH',
        conflictsOfInterest: 'None',
        conflictsOfInterestAttested: true,
      },
    })
    submittedProposalId = created.proposal.id
    expect(created.preview.machineChecks.passed).toBe(true)
    expect(created.preview.impactPreview.matchedDependencyCount).toBeGreaterThanOrEqual(2)

    const submitted = await submitContributionProposal({
      proposalId: submittedProposalId,
      authorUserId: authorId,
    })
    expect(submitted).toMatchObject({
      status: 'SUBMITTED',
      contentDigestAlgorithm: 'sha256',
      currentValueSnapshot: { value: 'Current fixture conclusion' },
      currentVerdictSnapshot: { id: verdictId },
    })
    expect(submitted.contentDigest).toMatch(/^[0-9a-f]{64}$/)
    expect(submitted.impactPreview?.affectedClaimIds).toContain(claimId)

    const context = await getProgrammeContributionContext(medicineSlug, programmeSlug)
    expect(context?.currentValues['verdict.publicLabel']).toBe('Current fixture conclusion')
    expect(context?.evidenceNodes[0]).toMatchObject({
      id: nodeId,
      label: 'Patient Outcome',
      currentValues: { 'evidenceNode.state': 'CONFIRMED' },
    })

    const collidingProgrammeId = id('programme-ref-collision')
    await db.insert(developmentProgrammes).values({
      id: collidingProgrammeId,
      drugId,
      slug: programmeId,
      title: 'Slug collision that must not override an explicit programme id',
      status: 'ACTIVE',
    })
    const contextByExplicitId = await getProgrammeContributionContext(medicineSlug, programmeId)
    expect(contextByExplicitId?.programme.id).toBe(programmeId)
    await db.delete(developmentProgrammes).where(eq(developmentProgrammes.id, collidingProgrammeId))

    const authorRows = await listAuthorProgrammeContributions({
      medicineSlug,
      programmeRef: programmeSlug,
      authorUserId: authorId,
    })
    expect(authorRows?.[0]).toMatchObject({
      id: submittedProposalId,
      proposedText: 'A narrower conclusion limited to the measured population.',
      conflictsOfInterest: 'None',
    })

    const queue = await listPublicPendingContributionProposals({ limit: 20, offset: 0 })
    const publicRow = queue.proposals.find((proposal) => proposal.id === submittedProposalId)
    expect(publicRow).toMatchObject({
      author: {
        name: 'Contribution author',
        handle: `contributor-${key}`,
      },
      conflictsOfInterest: 'None',
      conflictsOfInterestAttested: true,
      evidenceNode: {
        id: nodeId,
        nodeType: 'PATIENT_OUTCOME',
        label: 'Patient Outcome',
      },
      reviewState: { status: 'AWAITING_REVIEWS', reviewCount: 0 },
      reviews: [],
      structuredDiff: { currentValue: 'Current fixture conclusion' },
    })
    expect(publicRow).not.toHaveProperty('authorUserId')
    expect(publicRow).not.toHaveProperty('authorName')
    expect(JSON.stringify(publicRow)).not.toContain('"email"')
    expect(JSON.stringify(publicRow)).not.toContain('"passwordHash"')
  })

  it('rejects missing and cross-programme evidence-node targets', async () => {
    const base = {
      proposalType: 'VERDICT_CHALLENGE' as const,
      selectedField: 'verdict.publicLabel' as const,
      proposedText: 'Narrower conclusion.',
      source: {
        type: 'PEER_REVIEWED_PUBLICATION' as const,
        locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
        identifier: 'doi:10.1000/rnawiki-contribution-test',
      },
      claimNature: 'MEASURED' as const,
      reasoning: 'Reasoning.',
      whatWasWrongOrMissing: 'Missing scope.',
      affects: 'BOTH' as const,
      conflictsOfInterest: 'None',
      conflictsOfInterestAttested: true,
    }

    await expect(
      createContributionDraft({
        medicineSlug,
        programmeRef: programmeSlug,
        authorUserId: authorId,
        input: { ...base, evidenceNodeId: otherNodeId },
      }),
    ).rejects.toMatchObject({ code: 'invalid_evidence_node_scope' })
    await expect(
      createContributionDraft({
        medicineSlug,
        programmeRef: programmeSlug,
        authorUserId: authorId,
        input: { ...base, evidenceNodeId: 'missing-node' },
      }),
    ).rejects.toMatchObject({ code: 'invalid_evidence_node_scope' })
    await expect(
      createContributionDraft({
        medicineSlug,
        programmeRef: programmeSlug,
        authorUserId: authorId,
        input: {
          ...base,
          proposalType: 'CORRECTION',
          selectedField: 'programme.title',
          evidenceNodeId: nodeId,
        },
      }),
    ).rejects.toMatchObject({ code: 'invalid_evidence_node_target' })
  })

  it('freezes submitted content and enforces an exact, non-branching revision lineage', async () => {
    await expect(
      updateContributionDraft({
        proposalId: submittedProposalId,
        authorUserId: otherAuthorId,
        patch: { proposedText: 'Attempted cross-owner mutation.' },
      }),
    ).rejects.toMatchObject({ code: 'not_found' })
    await expect(
      submitContributionProposal({
        proposalId: submittedProposalId,
        authorUserId: otherAuthorId,
      }),
    ).rejects.toMatchObject({ code: 'not_found' })
    await expect(
      reviseSubmittedContribution({
        proposalId: submittedProposalId,
        authorUserId: otherAuthorId,
      }),
    ).rejects.toMatchObject({ code: 'not_found' })
    expect(
      await listAuthorProgrammeContributions({
        medicineSlug,
        programmeRef: programmeSlug,
        authorUserId: otherAuthorId,
      }),
    ).toEqual([])

    await expect(
      updateContributionDraft({
        proposalId: submittedProposalId,
        authorUserId: authorId,
        patch: { proposedText: 'Mutated after submission.' },
      }),
    ).rejects.toMatchObject({ code: 'proposal_frozen' })
    await expect(
      db
        .delete(programmeContributionProposals)
        .where(eq(programmeContributionProposals.id, submittedProposalId)),
    ).rejects.toBeDefined()

    await expect(
      db.insert(programmeContributionProposals).values({
        id: id('bad-lineage'),
        proposalKey: submittedProposalId,
        revisionNumber: 2,
        previousProposalId: submittedProposalId,
        programmeId,
        authorUserId: otherAuthorId,
        proposalType: 'VERDICT_CHALLENGE',
      }),
    ).rejects.toBeDefined()

    await submitContributionReview({
      proposalId: submittedProposalId,
      reviewerUserId: reviewerAId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'CHANGES_REQUESTED',
        reviewNote: 'Narrow the proposed public label to the population supported by the source.',
      },
    })
    await submitContributionReview({
      proposalId: submittedProposalId,
      reviewerUserId: reviewerBId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'CHANGES_REQUESTED',
        expertiseTags: ['BIOSTATISTICS'],
        reviewNote: 'State the measured population explicitly before this can be accepted.',
      },
    })
    await submitContributionReview({
      proposalId: submittedProposalId,
      reviewerUserId: reviewerCId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'CHANGES_REQUESTED',
        expertiseTags: ['TOXICOLOGY'],
        reviewNote: 'The revised wording must stay within the population the source measured.',
      },
    })

    const ownerRows = await listAuthorProgrammeContributions({
      medicineSlug,
      programmeRef: programmeSlug,
      authorUserId: authorId,
    })
    expect(ownerRows?.find((row) => row.id === submittedProposalId)?.review).toMatchObject({
      reviewState: { status: 'CHANGES_REQUESTED', reviewCount: 3 },
      reviews: [
        {
          reviewer: { name: 'Contribution reviewer A', handle: `clinical-reviewer-${key}` },
          decision: 'CHANGES_REQUESTED',
        },
        {
          reviewer: { name: 'Contribution reviewer B', handle: `statistics-reviewer-${key}` },
          decision: 'CHANGES_REQUESTED',
        },
        {
          reviewer: { name: 'Contribution reviewer C', handle: `third-reviewer-${key}` },
          decision: 'CHANGES_REQUESTED',
        },
      ],
      adjudication: null,
    })

    const revised = await reviseSubmittedContribution({
      proposalId: submittedProposalId,
      authorUserId: authorId,
    })
    expect(revised.proposal).toMatchObject({
      status: 'DRAFT',
      revisionNumber: 2,
      previousProposalId: submittedProposalId,
      contentDigest: null,
    })
    const idempotent = await reviseSubmittedContribution({
      proposalId: submittedProposalId,
      authorUserId: authorId,
    })
    expect(idempotent.proposal.id).toBe(revised.proposal.id)

    const queueWhileDraft = await listPublicPendingContributionProposals({ limit: 20, offset: 0 })
    expect(queueWhileDraft.proposals.some((proposal) => proposal.id === revised.proposal.id)).toBe(
      false,
    )
    expect(queueWhileDraft.proposals.some((proposal) => proposal.id === submittedProposalId)).toBe(
      false,
    )
    const terminalAuditWhileDraft = await listPublicPendingContributionProposals({
      limit: 20,
      offset: 0,
      reviewStatus: 'CHANGES_REQUESTED',
    })
    expect(
      terminalAuditWhileDraft.proposals.some((proposal) => proposal.id === submittedProposalId),
    ).toBe(true)

    await submitContributionProposal({
      proposalId: revised.proposal.id,
      authorUserId: authorId,
    })
    const queueAfterResubmit = await listPublicPendingContributionProposals({
      limit: 20,
      offset: 0,
    })
    expect(
      queueAfterResubmit.proposals.filter(
        (proposal) => proposal.proposalKey === submittedProposalId,
      ),
    ).toHaveLength(1)
    expect(
      queueAfterResubmit.proposals.some((proposal) => proposal.id === revised.proposal.id),
    ).toBe(true)
    expect(
      queueAfterResubmit.proposals.some((proposal) => proposal.id === submittedProposalId),
    ).toBe(false)
    const terminalAuditAfterResubmit = await listPublicPendingContributionProposals({
      limit: 20,
      offset: 0,
      reviewStatus: 'CHANGES_REQUESTED',
    })
    expect(
      terminalAuditAfterResubmit.proposals.some((proposal) => proposal.id === submittedProposalId),
    ).toBe(true)
  })

  it('serializes a terminal third review with revision creation on one lineage lock', async () => {
    const proposal = await createSubmittedCorrection({
      suffix: 'lineage-lock',
      selectedField: 'programme.route',
    })
    await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerAId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'CHANGES_REQUESTED',
        reviewNote: 'The route needs a more precise formulation.',
      },
    })
    await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerBId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'CHANGES_REQUESTED',
        expertiseTags: ['BIOSTATISTICS'],
        reviewNote: 'The proposed route should match the cited record exactly.',
      },
    })

    const [terminalReview, concurrentRevision] = await Promise.allSettled([
      submitContributionReview({
        proposalId: proposal.id,
        reviewerUserId: reviewerCId,
        input: {
          ...APPROVE_REVIEW,
          decision: 'CHANGES_REQUESTED',
          expertiseTags: ['TOXICOLOGY'],
          reviewNote: 'The route wording still needs to match the frozen source.',
        },
      }),
      reviseSubmittedContribution({ proposalId: proposal.id, authorUserId: authorId }),
    ])

    expect(terminalReview.status).toBe('fulfilled')
    let revision: Awaited<ReturnType<typeof reviseSubmittedContribution>>
    if (concurrentRevision.status === 'fulfilled') {
      revision = concurrentRevision.value
    } else {
      expect(concurrentRevision.reason).toMatchObject({ code: 'review_in_progress' })
      revision = await reviseSubmittedContribution({
        proposalId: proposal.id,
        authorUserId: authorId,
      })
    }

    expect(revision.proposal).toMatchObject({
      status: 'DRAFT',
      proposalKey: proposal.proposalKey,
      previousProposalId: proposal.id,
      revisionNumber: proposal.revisionNumber + 1,
      programmeId,
      proposalType: proposal.proposalType,
    })
    const children = await db
      .select({ id: programmeContributionProposals.id })
      .from(programmeContributionProposals)
      .where(eq(programmeContributionProposals.previousProposalId, proposal.id))
    expect(children).toEqual([{ id: revision.proposal.id }])

    await submitContributionProposal({
      proposalId: revision.proposal.id,
      authorUserId: authorId,
    })
    const terminalHistory = await listPublicPendingContributionProposals({
      limit: 100,
      offset: 0,
      reviewStatus: 'CHANGES_REQUESTED',
    })
    expect(terminalHistory.proposals.some((row) => row.id === proposal.id)).toBe(true)
  })

  it('derives the submission digest in PostgreSQL and rejects forged frozen bundles', async () => {
    const template = await createSubmittedCorrection({
      suffix: 'database-digest-template',
      selectedField: 'programme.route',
    })
    const makeRouteDraft = (suffix: string) =>
      createContributionDraft({
        medicineSlug,
        programmeRef: programmeSlug,
        authorUserId: authorId,
        input: {
          proposalType: 'CORRECTION',
          selectedField: 'programme.route',
          proposedText: `Corrected raw bundle ${suffix}`,
          source: {
            type: 'PEER_REVIEWED_PUBLICATION',
            locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
            identifier: 'doi:10.1000/rnawiki-contribution-test',
          },
          claimNature: 'MEASURED',
          reasoning: `The source supports raw bundle ${suffix}.`,
          whatWasWrongOrMissing: `The route is incomplete in raw bundle ${suffix}.`,
          affects: 'OPEN_QUESTIONS',
          conflictsOfInterest: 'None declared',
          conflictsOfInterestAttested: true,
        },
      })

    const validRawDraft = await makeRouteDraft('valid')
    const forgedCallerDigest = 'f'.repeat(64)
    const rawSubmitted = await db
      .update(programmeContributionProposals)
      .set({
        status: 'SUBMITTED',
        currentValueSnapshot: template.currentValueSnapshot,
        currentVerdictRevisionId: template.currentVerdictSnapshot?.id ?? null,
        currentVerdictSnapshot: template.currentVerdictSnapshot,
        machineChecks: template.machineChecks,
        impactPreview: template.impactPreview,
        contentDigestAlgorithm: 'sha256',
        contentDigest: forgedCallerDigest,
        submittedAt: new Date(),
      })
      .where(eq(programmeContributionProposals.id, validRawDraft.proposal.id))
      .returning({ contentDigest: programmeContributionProposals.contentDigest })
    expect(rawSubmitted[0]?.contentDigest).toMatch(/^[0-9a-f]{64}$/)
    expect(rawSubmitted[0]?.contentDigest).not.toBe(forgedCallerDigest)

    const forgedSnapshotDraft = await makeRouteDraft('forged-snapshot')
    await expect(
      db
        .update(programmeContributionProposals)
        .set({
          status: 'SUBMITTED',
          currentValueSnapshot: {
            ...template.currentValueSnapshot!,
            value: 'Fabricated route that is not persisted',
          },
          currentVerdictRevisionId: template.currentVerdictSnapshot?.id ?? null,
          currentVerdictSnapshot: template.currentVerdictSnapshot,
          machineChecks: template.machineChecks,
          impactPreview: template.impactPreview,
          contentDigestAlgorithm: 'sha256',
          contentDigest: forgedCallerDigest,
          submittedAt: new Date(),
        })
        .where(eq(programmeContributionProposals.id, forgedSnapshotDraft.proposal.id)),
    ).rejects.toBeDefined()

    const challengeTemplateRows = await db
      .select()
      .from(programmeContributionProposals)
      .where(eq(programmeContributionProposals.id, submittedProposalId))
    const challengeTemplate = challengeTemplateRows[0]!
    expect(challengeTemplate.impactPreview?.affectedSurfaces.length).toBeGreaterThan(1)
    const duplicatedSurface = challengeTemplate.impactPreview!.affectedSurfaces[0]!
    const forgedImpactDraft = await createContributionDraft({
      medicineSlug,
      programmeRef: programmeSlug,
      authorUserId: authorId,
      input: {
        proposalType: 'VERDICT_CHALLENGE',
        selectedField: 'verdict.publicLabel',
        proposedText: 'Another narrower conclusion limited to the measured population.',
        source: {
          type: 'PEER_REVIEWED_PUBLICATION',
          locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
          identifier: 'doi:10.1000/rnawiki-contribution-test',
        },
        claimNature: 'MEASURED',
        evidenceNodeId: nodeId,
        reasoning: 'The current label remains broader than the measured population.',
        whatWasWrongOrMissing: 'The measured population qualifier is missing.',
        affects: 'BOTH',
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })
    await expect(
      db
        .update(programmeContributionProposals)
        .set({
          status: 'SUBMITTED',
          currentValueSnapshot: challengeTemplate.currentValueSnapshot,
          currentVerdictRevisionId: challengeTemplate.currentVerdictRevisionId,
          currentVerdictSnapshot: challengeTemplate.currentVerdictSnapshot,
          machineChecks: challengeTemplate.machineChecks,
          impactPreview: {
            ...challengeTemplate.impactPreview!,
            affectedSurfaces: challengeTemplate.impactPreview!.affectedSurfaces.map(
              () => duplicatedSurface,
            ),
          },
          contentDigestAlgorithm: 'sha256',
          contentDigest: forgedCallerDigest,
          submittedAt: new Date(),
        })
        .where(eq(programmeContributionProposals.id, forgedImpactDraft.proposal.id)),
    ).rejects.toBeDefined()

    const unpublishedProgrammeId = id('programme-no-publication')
    const unpublishedProgrammeSlug = id('programme-no-publication-slug')
    const unpublishedNodeId = id('node-no-publication')
    await db.insert(developmentProgrammes).values({
      id: unpublishedProgrammeId,
      drugId,
      slug: unpublishedProgrammeSlug,
      title: 'Programme without a current publication',
      status: 'ACTIVE',
    })
    await db.insert(evidenceNodes).values({
      id: unpublishedNodeId,
      programmeId: unpublishedProgrammeId,
      nodeType: 'PATIENT_OUTCOME',
      revisionNumber: 1,
      state: 'UNKNOWN',
      reviewStatus: 'PUBLISHED',
      plainSummary: 'No current programme verdict exists for this node.',
      authorUserId: authorId,
      publishedAt: NOW,
    })
    const noPublicationDraft = await createContributionDraft({
      medicineSlug,
      programmeRef: unpublishedProgrammeSlug,
      authorUserId: authorId,
      input: {
        proposalType: 'VERDICT_CHALLENGE',
        selectedField: 'verdict.publicLabel',
        proposedText: 'A fabricated challenge to a verdict that does not exist.',
        source: {
          type: 'PEER_REVIEWED_PUBLICATION',
          locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
          identifier: 'doi:10.1000/rnawiki-contribution-test',
        },
        claimNature: 'MEASURED',
        evidenceNodeId: unpublishedNodeId,
        reasoning: 'A direct writer must not fabricate a current verdict baseline.',
        whatWasWrongOrMissing: 'There is no current published verdict to challenge.',
        affects: 'BOTH',
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })
    expect(noPublicationDraft.preview.machineChecks.passed).toBe(false)
    await expect(
      db
        .update(programmeContributionProposals)
        .set({
          status: 'SUBMITTED',
          currentValueSnapshot: {
            ...challengeTemplate.currentValueSnapshot!,
            programmeId: unpublishedProgrammeId,
          },
          currentVerdictRevisionId: verdictId,
          currentVerdictSnapshot: challengeTemplate.currentVerdictSnapshot,
          machineChecks: challengeTemplate.machineChecks,
          impactPreview: challengeTemplate.impactPreview,
          contentDigestAlgorithm: 'sha256',
          contentDigest: forgedCallerDigest,
          submittedAt: new Date(),
        })
        .where(eq(programmeContributionProposals.id, noPublicationDraft.proposal.id)),
    ).rejects.toBeDefined()

    const unchangedDrafts = await db
      .select({
        id: programmeContributionProposals.id,
        status: programmeContributionProposals.status,
      })
      .from(programmeContributionProposals)
      .where(
        inArray(programmeContributionProposals.id, [
          forgedSnapshotDraft.proposal.id,
          forgedImpactDraft.proposal.id,
          noPublicationDraft.proposal.id,
        ]),
      )
    expect(unchangedDrafts).toHaveLength(3)
    expect(unchangedDrafts.every((row) => row.status === 'DRAFT')).toBe(true)
    await db
      .delete(developmentProgrammes)
      .where(eq(developmentProgrammes.id, unpublishedProgrammeId))
  })

  it('keeps the second reviewer blind, requires independent eligibility, and resolves agreement without publishing', async () => {
    const proposal = await createSubmittedCorrection({
      suffix: 'agreement',
      selectedField: 'programme.indication',
    })
    const queueBefore = await listPublicPendingContributionProposals({ limit: 100, offset: 0 })
    expect(queueBefore.proposals.some((row) => row.id === proposal.id)).toBe(true)

    const publicationBefore = await db
      .select()
      .from(programmeCurrentPublications)
      .where(eq(programmeCurrentPublications.programmeId, programmeId))
    const programmeBefore = await db
      .select({ indication: developmentProgrammes.indication })
      .from(developmentProgrammes)
      .where(eq(developmentProgrammes.id, programmeId))

    expect(
      await getContributionReviewState({ proposalId: proposal.id, viewerUserId: reviewerBId }),
    ).toMatchObject({
      reviewState: { status: 'AWAITING_REVIEWS', reviewCount: 0 },
      eligibility: { canReview: true, reason: 'ELIGIBLE' },
      myReview: null,
      reviews: [],
    })
    await expect(
      submitContributionReview({
        proposalId: proposal.id,
        reviewerUserId: authorId,
        input: APPROVE_REVIEW,
      }),
    ).rejects.toMatchObject({ code: 'self_review' })
    await expect(
      submitContributionReview({
        proposalId: proposal.id,
        reviewerUserId: otherAuthorId,
        input: APPROVE_REVIEW,
      }),
    ).rejects.toMatchObject({ code: 'reviewer_ineligible' })

    const first = await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerAId,
      input: APPROVE_REVIEW,
    })
    expect(first).toMatchObject({
      reviewState: { status: 'AWAITING_SECOND_REVIEW', reviewCount: 1 },
      myReview: {
        reviewer: {
          name: 'Contribution reviewer A',
          handle: `clinical-reviewer-${key}`,
          orcid: '0000-0002-1825-0097',
        },
        decision: 'APPROVE',
      },
    })
    expect(first.reviews).toHaveLength(1)

    const blindSecond = await getContributionReviewState({
      proposalId: proposal.id,
      viewerUserId: reviewerBId,
    })
    expect(blindSecond).toMatchObject({
      reviewState: { status: 'AWAITING_SECOND_REVIEW', reviewCount: 1 },
      eligibility: { canReview: true },
      myReview: null,
      reviews: [],
    })

    const agreeing = await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerBId,
      input: { ...APPROVE_REVIEW, expertiseTags: ['BIOSTATISTICS'] },
    })
    expect(agreeing.reviewState).toMatchObject({
      status: 'AWAITING_THIRD_REVIEW',
      reviewCount: 2,
      consensus: null,
    })
    // A reviewer sees the earlier decisions only after committing their own.
    expect(agreeing.reviews).toHaveLength(2)

    const blindThird = await getContributionReviewState({
      proposalId: proposal.id,
      viewerUserId: reviewerCId,
    })
    expect(blindThird).toMatchObject({
      reviewState: { status: 'AWAITING_THIRD_REVIEW', reviewCount: 2 },
      eligibility: { canReview: true },
      myReview: null,
      reviews: [],
    })

    const resolved = await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerCId,
      input: { ...APPROVE_REVIEW, expertiseTags: ['TOXICOLOGY'] },
    })
    expect(resolved.reviewState).toMatchObject({
      status: 'ACCEPTED_FOR_IMPLEMENTATION',
      reviewCount: 3,
      consensus: 'APPROVE',
    })
    expect(resolved.reviews).toHaveLength(3)

    const queueAfter = await listPublicPendingContributionProposals({ limit: 100, offset: 0 })
    expect(queueAfter.proposals.some((row) => row.id === proposal.id)).toBe(false)
    expect(queueAfter.total).toBe(queueBefore.total - 1)

    const acceptedAudit = await listPublicPendingContributionProposals({
      limit: 100,
      offset: 0,
      reviewStatus: 'ACCEPTED_FOR_IMPLEMENTATION',
    })
    const publicAudit = acceptedAudit.proposals.find((row) => row.id === proposal.id)
    expect(publicAudit).toMatchObject({
      author: { name: 'Contribution author', handle: `contributor-${key}` },
      reviewState: { status: 'ACCEPTED_FOR_IMPLEMENTATION', reviewCount: 3 },
    })
    expect(publicAudit?.reviews).toHaveLength(3)
    expect(JSON.stringify(publicAudit)).not.toContain('"reviewerUserId"')
    expect(JSON.stringify(publicAudit)).not.toContain('"authorUserId"')
    expect(JSON.stringify(publicAudit)).not.toContain('"email"')
    expect(JSON.stringify(publicAudit)).not.toContain('"passwordHash"')

    const reviewId = resolved.reviews[0]!.id
    await expect(
      db
        .update(programmeContributionReviews)
        .set({ reviewNote: 'Attempted mutation.' })
        .where(eq(programmeContributionReviews.id, reviewId)),
    ).rejects.toBeDefined()
    await expect(
      db.delete(programmeContributionReviews).where(eq(programmeContributionReviews.id, reviewId)),
    ).rejects.toBeDefined()
    await expect(
      db.insert(programmeContributionReviews).values({
        id: id('fourth-review'),
        proposalId: proposal.id,
        reviewerUserId: stewardId,
        reviewerNameSnapshot: 'Contribution steward',
        reviewerOrcidSnapshot: null,
        expertiseTags: ['TOXICOLOGY'],
        decision: 'APPROVE',
        independenceAttested: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
      }),
    ).rejects.toBeDefined()

    expect(
      await db
        .select()
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, programmeId)),
    ).toEqual(publicationBefore)
    expect(
      await db
        .select({ indication: developmentProgrammes.indication })
        .from(developmentProgrammes)
        .where(eq(developmentProgrammes.id, programmeId)),
    ).toEqual(programmeBefore)
  })

  it('rejects forged review state, proposal digests, self-review, and direct state deletion', async () => {
    const proposal = await createSubmittedCorrection({
      suffix: 'database-guard',
      selectedField: 'programme.route',
    })

    await expect(
      db
        .update(programmeContributionReviewStates)
        .set({
          status: 'ACCEPTED_FOR_IMPLEMENTATION',
          reviewCount: 2,
          resolvedAt: new Date(),
        })
        .where(eq(programmeContributionReviewStates.proposalId, proposal.id)),
    ).rejects.toBeDefined()
    await expect(
      db
        .delete(programmeContributionReviewStates)
        .where(eq(programmeContributionReviewStates.proposalId, proposal.id)),
    ).rejects.toBeDefined()
    await expect(
      db.insert(programmeContributionReviews).values({
        id: id('forged-digest-review'),
        proposalId: proposal.id,
        reviewerUserId: reviewerAId,
        reviewerNameSnapshot: 'Contribution reviewer A',
        reviewerOrcidSnapshot: '0000-0002-1825-0097',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        independenceAttested: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        contentDigestAlgorithm: 'sha256',
        contentDigest: '0'.repeat(64),
      }),
    ).rejects.toBeDefined()
    await expect(
      db.insert(programmeContributionReviews).values({
        id: id('self-review'),
        proposalId: proposal.id,
        reviewerUserId: authorId,
        reviewerNameSnapshot: 'Contribution author',
        reviewerOrcidSnapshot: null,
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        independenceAttested: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
      }),
    ).rejects.toBeDefined()
    await expect(
      db.insert(programmeContributionReviews).values({
        id: id('adverse-without-note'),
        proposalId: proposal.id,
        reviewerUserId: reviewerAId,
        reviewerNameSnapshot: 'Contribution reviewer A',
        reviewerOrcidSnapshot: '0000-0002-1825-0097',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'REJECT',
        independenceAttested: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        reviewNote: null,
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
      }),
    ).rejects.toBeDefined()
  })

  it('owns review, adjudication, and derived state audit clocks in PostgreSQL', async () => {
    const proposal = await createSubmittedCorrection({ suffix: 'database-audit-clocks' })
    const forgedAuditTime = new Date('2000-01-01T00:00:00.000Z')

    const firstReview = await db
      .insert(programmeContributionReviews)
      .values({
        id: id('clock-review-a'),
        proposalId: proposal.id,
        reviewerUserId: reviewerAId,
        reviewerNameSnapshot: 'Contribution reviewer A',
        reviewerOrcidSnapshot: '0000-0002-1825-0097',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        independenceAttested: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
        reviewedAt: forgedAuditTime,
      })
      .returning({ reviewedAt: programmeContributionReviews.reviewedAt })
    expect(firstReview[0]?.reviewedAt).not.toEqual(forgedAuditTime)

    const rewrittenState = await db
      .update(programmeContributionReviewStates)
      .set({ updatedAt: forgedAuditTime })
      .where(eq(programmeContributionReviewStates.proposalId, proposal.id))
      .returning({ updatedAt: programmeContributionReviewStates.updatedAt })
    expect(rewrittenState[0]?.updatedAt).not.toEqual(forgedAuditTime)

    const secondReview = await db
      .insert(programmeContributionReviews)
      .values({
        id: id('clock-review-b'),
        proposalId: proposal.id,
        reviewerUserId: reviewerBId,
        reviewerNameSnapshot: 'Contribution reviewer B',
        reviewerOrcidSnapshot: null,
        expertiseTags: ['BIOSTATISTICS'],
        decision: 'REJECT',
        independenceAttested: true,
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        reviewNote: 'The replacement is broader than the cited record.',
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
        reviewedAt: forgedAuditTime,
      })
      .returning({ reviewedAt: programmeContributionReviews.reviewedAt })
    expect(secondReview[0]?.reviewedAt).not.toEqual(forgedAuditTime)

    const adjudication = await db
      .insert(programmeContributionAdjudications)
      .values({
        id: id('clock-adjudication'),
        proposalId: proposal.id,
        adjudicatorUserId: stewardId,
        adjudicatorNameSnapshot: 'Contribution steward',
        adjudicatorOrcidSnapshot: '0000-0001-5109-3700',
        expertiseTags: ['REGULATORY_SCIENCE'],
        decision: 'REJECT',
        rationale: 'The proposed replacement exceeds the evidence in the cited record.',
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
        adjudicatedAt: forgedAuditTime,
      })
      .returning({ adjudicatedAt: programmeContributionAdjudications.adjudicatedAt })
    expect(adjudication[0]?.adjudicatedAt).not.toEqual(forgedAuditTime)

    const stateRows = await db
      .select()
      .from(programmeContributionReviewStates)
      .where(eq(programmeContributionReviewStates.proposalId, proposal.id))
    expect(stateRows[0]).toMatchObject({ status: 'REJECTED', reviewCount: 2 })
    expect(stateRows[0]?.resolvedAt).not.toEqual(forgedAuditTime)
  })

  it('makes disagreement public and allows only an independent steward to adjudicate it', async () => {
    const proposal = await createSubmittedCorrection({ suffix: 'disagreement' })
    const publicationBefore = await db
      .select()
      .from(programmeCurrentPublications)
      .where(eq(programmeCurrentPublications.programmeId, programmeId))

    await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerAId,
      input: APPROVE_REVIEW,
    })
    const disagreed = await submitContributionReview({
      proposalId: proposal.id,
      reviewerUserId: reviewerBId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'REJECT',
        expertiseTags: ['BIOSTATISTICS'],
        reviewNote: 'The source supports a narrower correction, not this replacement.',
      },
    })
    expect(disagreed.reviewState).toMatchObject({
      status: 'DISAGREEMENT',
      reviewCount: 2,
      consensus: null,
    })

    await expect(
      reviseSubmittedContribution({
        proposalId: proposal.id,
        authorUserId: authorId,
      }),
    ).rejects.toMatchObject({ code: 'adjudication_required' })
    await expect(
      db.insert(programmeContributionProposals).values({
        id: id('unadjudicated-child'),
        proposalKey: proposal.proposalKey,
        revisionNumber: proposal.revisionNumber + 1,
        previousProposalId: proposal.id,
        programmeId,
        authorUserId: authorId,
        proposalType: proposal.proposalType,
      }),
    ).rejects.toBeDefined()
    const defaultDisagreement = await listPublicPendingContributionProposals({
      limit: 100,
      offset: 0,
    })
    expect(defaultDisagreement.proposals.some((row) => row.id === proposal.id)).toBe(true)

    const publicDisagreement = await listPublicPendingContributionProposals({
      limit: 100,
      offset: 0,
      reviewStatus: 'DISAGREEMENT',
    })
    const disagreementRow = publicDisagreement.proposals.find((row) => row.id === proposal.id)
    expect(disagreementRow?.reviews).toHaveLength(2)
    expect(disagreementRow?.reviews[1]).toMatchObject({
      reviewer: { name: 'Contribution reviewer B' },
      decision: 'REJECT',
      reviewNote: 'The source supports a narrower correction, not this replacement.',
    })

    await expect(
      adjudicateContributionReview({
        proposalId: proposal.id,
        adjudicatorUserId: authorId,
        input: {
          decision: 'CHANGES_REQUESTED',
          rationale: 'Author cannot resolve their own proposal.',
          expertiseTags: ['CLINICAL_DEVELOPMENT'],
          conflictsOfInterest: 'None declared',
          conflictsOfInterestAttested: true,
        },
      }),
    ).rejects.toMatchObject({ code: 'author_cannot_adjudicate' })
    await expect(
      adjudicateContributionReview({
        proposalId: proposal.id,
        adjudicatorUserId: reviewerAId,
        input: {
          decision: 'CHANGES_REQUESTED',
          rationale: 'An ordinary reviewer cannot also adjudicate.',
          expertiseTags: ['CLINICAL_DEVELOPMENT'],
          conflictsOfInterest: 'None declared',
          conflictsOfInterestAttested: true,
        },
      }),
    ).rejects.toMatchObject({ code: 'reviewer_cannot_adjudicate' })
    await expect(
      db.insert(programmeContributionAdjudications).values({
        id: id('overlap-adjudication'),
        proposalId: proposal.id,
        adjudicatorUserId: reviewerAId,
        adjudicatorNameSnapshot: 'Contribution reviewer A',
        adjudicatorOrcidSnapshot: '0000-0002-1825-0097',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        rationale: 'Attempted reviewer overlap.',
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        contentDigestAlgorithm: 'sha256',
        contentDigest: proposal.contentDigest!,
      }),
    ).rejects.toBeDefined()

    const adjudicated = await adjudicateContributionReview({
      proposalId: proposal.id,
      adjudicatorUserId: stewardId,
      input: {
        decision: 'CHANGES_REQUESTED',
        rationale:
          'The rejection identifies a repairable scope mismatch, so a revised proposal is required.',
        expertiseTags: ['REGULATORY_SCIENCE'],
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })
    expect(adjudicated).toMatchObject({
      reviewState: {
        status: 'CHANGES_REQUESTED',
        reviewCount: 2,
        consensus: 'CHANGES_REQUESTED',
      },
      adjudication: {
        adjudicator: {
          name: 'Contribution steward',
          handle: `adjudicator-${key}`,
          orcid: '0000-0001-5109-3700',
        },
        decision: 'CHANGES_REQUESTED',
      },
    })

    const terminalAudit = await listPublicPendingContributionProposals({
      limit: 100,
      offset: 0,
      reviewStatus: 'CHANGES_REQUESTED',
    })
    const terminalRow = terminalAudit.proposals.find((row) => row.id === proposal.id)
    expect(terminalRow?.adjudication).toMatchObject({
      rationale:
        'The rejection identifies a repairable scope mismatch, so a revised proposal is required.',
      adjudicator: { handle: `adjudicator-${key}` },
    })
    expect(JSON.stringify(terminalRow)).not.toContain('"adjudicatorUserId"')
    expect(
      (await listPublicPendingContributionProposals({ limit: 100, offset: 0 })).proposals.some(
        (row) => row.id === proposal.id,
      ),
    ).toBe(false)

    const adjudicationId = adjudicated.adjudication!.id
    await expect(
      db
        .update(programmeContributionAdjudications)
        .set({ rationale: 'Attempted mutation.' })
        .where(eq(programmeContributionAdjudications.id, adjudicationId)),
    ).rejects.toBeDefined()
    await expect(
      db
        .delete(programmeContributionAdjudications)
        .where(eq(programmeContributionAdjudications.id, adjudicationId)),
    ).rejects.toBeDefined()
    expect(
      await db
        .select()
        .from(programmeCurrentPublications)
        .where(eq(programmeCurrentPublications.programmeId, programmeId)),
    ).toEqual(publicationBefore)
  })

  it('allows only the sanctioned parent-programme cascade to remove a submitted audit row', async () => {
    const disposableProgrammeId = id('programme-disposable')
    const disposableProgrammeSlug = id('programme-disposable-slug')
    await db.insert(developmentProgrammes).values({
      id: disposableProgrammeId,
      drugId,
      slug: disposableProgrammeSlug,
      title: 'Disposable aggregate fixture',
      status: 'ACTIVE',
    })
    const draft = await createContributionDraft({
      medicineSlug,
      programmeRef: disposableProgrammeSlug,
      authorUserId: authorId,
      input: {
        proposalType: 'CORRECTION',
        selectedField: 'programme.title',
        proposedText: 'Corrected disposable title',
        source: {
          type: 'PEER_REVIEWED_PUBLICATION',
          locator: 'https://doi.org/10.1000/rnawiki-contribution-test',
          identifier: 'doi:10.1000/rnawiki-contribution-test',
        },
        claimNature: 'MEASURED',
        reasoning: 'The cited record uses the corrected title.',
        whatWasWrongOrMissing: 'The original title was transcribed incorrectly.',
        affects: 'OPEN_QUESTIONS',
        conflictsOfInterest: 'None',
        conflictsOfInterestAttested: true,
      },
    })
    await submitContributionProposal({ proposalId: draft.proposal.id, authorUserId: authorId })
    await submitContributionReview({
      proposalId: draft.proposal.id,
      reviewerUserId: reviewerAId,
      input: APPROVE_REVIEW,
    })
    await submitContributionReview({
      proposalId: draft.proposal.id,
      reviewerUserId: reviewerBId,
      input: {
        ...APPROVE_REVIEW,
        decision: 'REJECT',
        expertiseTags: ['BIOSTATISTICS'],
        reviewNote: 'Disposable aggregate disagreement.',
      },
    })
    await adjudicateContributionReview({
      proposalId: draft.proposal.id,
      adjudicatorUserId: stewardId,
      input: {
        decision: 'CHANGES_REQUESTED',
        rationale: 'Disposable aggregate adjudication.',
        expertiseTags: ['REGULATORY_SCIENCE'],
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })

    await db
      .delete(developmentProgrammes)
      .where(eq(developmentProgrammes.id, disposableProgrammeId))
    const remaining = await db
      .select({ id: programmeContributionProposals.id })
      .from(programmeContributionProposals)
      .where(eq(programmeContributionProposals.id, draft.proposal.id))
    expect(remaining).toEqual([])
    expect(
      await db
        .select()
        .from(programmeContributionReviewStates)
        .where(eq(programmeContributionReviewStates.proposalId, draft.proposal.id)),
    ).toEqual([])
    expect(
      await db
        .select()
        .from(programmeContributionReviews)
        .where(eq(programmeContributionReviews.proposalId, draft.proposal.id)),
    ).toEqual([])
    expect(
      await db
        .select()
        .from(programmeContributionAdjudications)
        .where(eq(programmeContributionAdjudications.proposalId, draft.proposal.id)),
    ).toEqual([])
  })

  it('publishes an accepted task-bound correction only after the exact RNA Intelligence bundle, qualified disagreement review, and adjudication', async () => {
    const ctSourceId = id('ct-source')
    const currentCtSnapshotId = id('ct-snapshot-current')
    const pendingCtSnapshotId = id('ct-snapshot-pending')
    const sourceTaskId = id('ct-source-task')
    const unrelatedTaskId = id('unrelated-source-task')
    const locator = `https://clinicaltrials.gov/study/${NCT_ID}`

    await db.insert(evidenceSources).values({
      id: ctSourceId,
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      externalIdentifier: NCT_ID,
      canonicalLocator: locator,
      title: 'Programme contribution fixture trial',
      publisher: 'ClinicalTrials.gov',
      sponsor: 'Registry bridge sponsor',
      correctionStatus: 'CURRENT',
      hierarchy: 'PRIMARY',
    })
    await db.insert(sourceSnapshots).values([
      {
        id: currentCtSnapshotId,
        sourceId: ctSourceId,
        retrievedAt: new Date('2026-08-20T00:00:00.000Z'),
        lastVerifiedAt: new Date('2026-08-20T00:00:00.000Z'),
        contentHash: '1'.repeat(64),
        structuredData: registryStudy('ACTIVE_NOT_RECRUITING', 120, false),
        rawSnapshotLocator: locator,
      },
      {
        id: pendingCtSnapshotId,
        sourceId: ctSourceId,
        previousSnapshotId: currentCtSnapshotId,
        retrievedAt: new Date('2026-08-22T00:00:00.000Z'),
        lastVerifiedAt: new Date('2026-08-22T00:00:00.000Z'),
        contentHash: '2'.repeat(64),
        structuredData: registryStudy('COMPLETED', 128, true),
        rawSnapshotLocator: locator,
      },
    ])
    await db.insert(programmeFreshnessStates).values({
      programmeId,
      sourceId: ctSourceId,
      currentSnapshotId: currentCtSnapshotId,
      pendingSnapshotId: pendingCtSnapshotId,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'NEW_EVIDENCE',
      lastSuccessfulCheckAt: new Date('2026-08-22T00:00:00.000Z'),
      newEvidenceDetectedAt: new Date('2026-08-22T00:00:00.000Z'),
    })
    await db.insert(evidenceReviewTasks).values({
      id: sourceTaskId,
      programmeId,
      sourceId: ctSourceId,
      triggerSnapshotId: pendingCtSnapshotId,
      impactLevel: 'POSSIBLE_VERDICT_IMPACT',
      reason: 'The registered study status and enrolment changed.',
      affectedSurfacePaths: ['programme.status', `trial.${trialId}.status`],
    })

    const draft = await createContributionDraft({
      medicineSlug,
      programmeRef: programmeSlug,
      authorUserId: authorId,
      input: {
        proposalType: 'CORRECTION',
        selectedField: 'programme.status',
        proposedValue: 'COMPLETED',
        source: {
          type: 'CLINICAL_TRIAL_REGISTRY',
          locator,
          identifier: NCT_ID,
          reviewTaskId: sourceTaskId,
          reviewSnapshotId: pendingCtSnapshotId,
        },
        claimNature: 'MEASURED',
        reasoning:
          'The exact pending ClinicalTrials.gov record now reports the study as completed.',
        whatWasWrongOrMissing: 'The public programme still reflected the previous active status.',
        affects: 'OPEN_QUESTIONS',
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
      },
    })
    const submitted = await submitContributionProposal({
      proposalId: draft.proposal.id,
      authorUserId: authorId,
    })
    expect(submitted.source).toMatchObject({
      reviewTaskId: sourceTaskId,
      reviewSnapshotId: pendingCtSnapshotId,
    })
    await submitContributionReview({
      proposalId: submitted.id,
      reviewerUserId: reviewerAId,
      input: APPROVE_REVIEW,
    })
    const awaitingThird = await submitContributionReview({
      proposalId: submitted.id,
      reviewerUserId: reviewerBId,
      input: { ...APPROVE_REVIEW, expertiseTags: ['BIOSTATISTICS'] },
    })
    expect(awaitingThird.reviewState.status).toBe('AWAITING_THIRD_REVIEW')
    const accepted = await submitContributionReview({
      proposalId: submitted.id,
      reviewerUserId: reviewerCId,
      input: { ...APPROVE_REVIEW, expertiseTags: ['TOXICOLOGY'] },
    })
    expect(accepted.reviewState.status).toBe('ACCEPTED_FOR_IMPLEMENTATION')

    const publicBefore = await db
      .select()
      .from(programmeCurrentPublications)
      .where(eq(programmeCurrentPublications.programmeId, programmeId))
    expect(publicBefore[0]?.verdictRevisionId).toBe(verdictId)

    const implementation = await materializeAcceptedContributionCandidate({
      proposalId: submitted.id,
      implementedByUserId: stewardId,
    })
    expect(implementation).toMatchObject({
      outcome: 'CANONICAL_CANDIDATE',
      proposalId: submitted.id,
      reused: false,
    })
    if (implementation.outcome !== 'CANONICAL_CANDIDATE') {
      throw new Error('Expected a canonical candidate for the published-programme correction.')
    }
    const candidateId = implementation.revisionId
    const candidateAuthorship = await db
      .select({
        authorUserId: programmeVerdictRevisions.authorUserId,
        authorName: programmeVerdictRevisions.authorName,
      })
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.id, candidateId))
    expect(candidateAuthorship[0]).toEqual({
      // The contributor remains the author; the steward who materialized it is not substituted.
      authorUserId: authorId,
      authorName: 'Contribution author',
    })
    const reusedImplementation = await materializeAcceptedContributionCandidate({
      proposalId: submitted.id,
      implementedByUserId: stewardId,
    })
    expect(reusedImplementation).toMatchObject({
      outcome: 'CANONICAL_CANDIDATE',
      revisionId: candidateId,
      proposalDigest: implementation.proposalDigest,
      engineVersion: 'rna-intelligence/evidence-2.1.0',
      reused: true,
    })
    const preparedState = await getProgrammeVerdictWorkflowState({
      revisionId: candidateId,
      viewerUserId: reviewerAId,
    })
    expect(preparedState.exactBundle).toMatchObject({
      digest: implementation.proposalDigest,
      publicConclusion: { publicLabel: 'Current fixture conclusion' },
      presentation: {
        schemaVersion: 'programme-presentation/v1',
        mechanismSteps: [
          { stepKey: 'delivery', stepOrder: 1 },
          { stepKey: 'pathway', stepOrder: 2 },
          { stepKey: 'outcome', stepOrder: 3 },
        ],
        timelineEvents: [
          {
            eventKey: 'reviewed-result',
            sourceSnapshotId: SNAPSHOT_ID,
          },
        ],
      },
    })
    expect(preparedState.exactBundle.sourceSnapshotRecords.map((snapshot) => snapshot.id)).toEqual(
      expect.arrayContaining([currentCtSnapshotId, pendingCtSnapshotId]),
    )
    const pendingClaimLink = preparedState.exactBundle.publicationLinks.claimSources.find(
      (link) => link.sourceSnapshotId === pendingCtSnapshotId,
    )
    expect(pendingClaimLink).toBeDefined()
    expect(preparedState.exactBundle.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: { type: 'SOURCE', id: ctSourceId },
          to: { type: 'CLAIM', id: pendingClaimLink?.claimId },
          impact: 'POSSIBLE_VERDICT_IMPACT',
        }),
      ]),
    )
    expect(preparedState.exactBundle.publicationLinks.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldPath: 'programme.status',
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
        }),
        expect.objectContaining({
          fieldPath: `trial.${trialId}.status`,
          impactLevel: 'POSSIBLE_VERDICT_IMPACT',
        }),
      ]),
    )
    expect(preparedState.changedVsCurrent).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'programme.status', before: 'ACTIVE', after: 'COMPLETED' }),
        expect.objectContaining({
          path: `trial.${trialId}.registrySnapshotId`,
          after: pendingCtSnapshotId,
        }),
      ]),
    )

    await expect(
      db
        .update(evidenceReviewTasks)
        .set({
          status: 'RESOLVED',
          resolutionNote: 'Attempted direct resolution.',
          resolvedByUserId: stewardId,
          resolutionVerdictRevisionId: candidateId,
          resolvedAt: new Date(),
        })
        .where(eq(evidenceReviewTasks.id, sourceTaskId)),
    ).rejects.toBeDefined()

    await submitProgrammeVerdictReview({
      revisionId: candidateId,
      reviewerUserId: reviewerAId,
      expectedProposalDigest: implementation.proposalDigest,
      decision: 'APPROVE',
      expertiseTags: ['CLINICAL_DEVELOPMENT'],
      isIndependent: true,
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    })
    const blinded = await getProgrammeVerdictWorkflowState({
      revisionId: candidateId,
      viewerUserId: reviewerBId,
    })
    expect(blinded.viewerHasReviewed).toBe(false)
    expect(blinded.reviewQuorumFinal).toBe(false)
    expect(blinded.reviews[0]).toMatchObject({
      reviewerName: null,
      reviewerOrcid: null,
      expertiseTags: null,
      decision: null,
      conflictsOfInterest: null,
      reviewNote: null,
      reviewedAt: null,
    })
    await submitProgrammeVerdictReview({
      revisionId: candidateId,
      reviewerUserId: reviewerBId,
      expectedProposalDigest: implementation.proposalDigest,
      decision: 'CHANGES_REQUESTED',
      expertiseTags: ['BIOSTATISTICS'],
      isIndependent: true,
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
      reviewNote: 'A steward should confirm that the exact registry status supports publication.',
    })
    await adjudicateProgrammeVerdict({
      revisionId: candidateId,
      adjudicatorUserId: stewardId,
      expectedProposalDigest: implementation.proposalDigest,
      decision: 'APPROVE',
      expertiseTags: ['REGULATORY_SCIENCE'],
      rationale: 'The parser-derived completed status and trial snapshot are exact registry facts.',
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
    })

    await db.insert(evidenceReviewTasks).values({
      id: unrelatedTaskId,
      programmeId,
      sourceId: SOURCE_ID,
      triggerSnapshotId: SNAPSHOT_ID,
      impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      reason: 'An unrelated interpretive task must remain independently blocking.',
      affectedSurfacePaths: ['summary.mainLimitation'],
    })
    await expect(
      publishProgrammeVerdictRevision({
        revisionId: candidateId,
        publisherUserId: stewardId,
        expectedProposalDigest: implementation.proposalDigest,
      }),
    ).rejects.toMatchObject({ code: 'pending_evidence_review' })
    await db
      .update(evidenceReviewTasks)
      .set({
        status: 'DISMISSED',
        resolutionNote: 'Synthetic unrelated task closed independently for this fixture.',
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(evidenceReviewTasks.id, unrelatedTaskId))

    const published = await publishProgrammeVerdictRevision({
      revisionId: candidateId,
      publisherUserId: stewardId,
      expectedProposalDigest: implementation.proposalDigest,
    })
    expect(published).toMatchObject({
      revisionId: candidateId,
      previousRevisionId: verdictId,
      alreadyPublished: false,
    })

    const [pointerAfter, oldVerdict, taskAfter, freshnessAfter, liveProgramme, liveTrial] =
      await Promise.all([
        db
          .select()
          .from(programmeCurrentPublications)
          .where(eq(programmeCurrentPublications.programmeId, programmeId)),
        db
          .select()
          .from(programmeVerdictRevisions)
          .where(eq(programmeVerdictRevisions.id, verdictId)),
        db.select().from(evidenceReviewTasks).where(eq(evidenceReviewTasks.id, sourceTaskId)),
        db
          .select()
          .from(programmeFreshnessStates)
          .where(eq(programmeFreshnessStates.sourceId, ctSourceId)),
        db.select().from(developmentProgrammes).where(eq(developmentProgrammes.id, programmeId)),
        db.select().from(programmeTrials).where(eq(programmeTrials.id, trialId)),
      ])
    expect(pointerAfter[0]?.verdictRevisionId).toBe(candidateId)
    expect(oldVerdict[0]?.reviewStatus).toBe('SUPERSEDED')
    expect(taskAfter[0]).toMatchObject({
      status: 'RESOLVED',
      resolutionVerdictRevisionId: candidateId,
      resolutionContributionProposalId: null,
    })
    expect(freshnessAfter[0]).toMatchObject({
      currentSnapshotId: pendingCtSnapshotId,
      pendingSnapshotId: null,
      freshnessStatus: 'CURRENT',
    })
    expect(liveProgramme[0]?.status).toBe('COMPLETED')
    expect(liveTrial[0]).toMatchObject({
      status: 'COMPLETED',
      enrolment: 128,
      registrySourceId: ctSourceId,
      registrySnapshotId: pendingCtSnapshotId,
    })
    const candidateTrialSnapshots = await db
      .select()
      .from(programmeVerdictTrialSnapshots)
      .where(eq(programmeVerdictTrialSnapshots.verdictRevisionId, candidateId))
    expect(candidateTrialSnapshots).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          programmeTrialId: trialId,
          status: 'COMPLETED',
          enrolment: 128,
          registrySnapshotId: pendingCtSnapshotId,
        }),
      ]),
    )
    expect(
      await db
        .select()
        .from(programmeContributionImplementations)
        .where(eq(programmeContributionImplementations.proposalId, submitted.id)),
    ).toEqual([
      expect.objectContaining({
        verdictRevisionId: candidateId,
        sourceReviewTaskId: sourceTaskId,
        sourceSnapshotId: pendingCtSnapshotId,
      }),
    ])
    await expect(
      db
        .delete(programmeContributionImplementations)
        .where(eq(programmeContributionImplementations.proposalId, submitted.id)),
    ).rejects.toMatchObject({ cause: expect.objectContaining({ code: '55000' }) })
    const renamedHandle = `renamed-contributor-${key}`
    await db
      .update(users)
      .set({ name: 'Later contributor display name', handle: renamedHandle })
      .where(eq(users.id, authorId))
    const publicHistory = await getPublicProgrammeVerdictHistory(medicineSlug, programmeSlug)
    expect(publicHistory?.revisions[0]).toMatchObject({
      id: candidateId,
      isCurrent: true,
      authorName: 'Contribution author',
      authorHandle: renamedHandle,
      adjudication: {
        adjudicatorName: 'Contribution steward',
        decision: 'APPROVE',
      },
    })
    const canonicalDossier = await getProgrammeEvidenceByMedicineSlug(medicineSlug, programmeSlug)
    expect(canonicalDossier?.selectedProgramme?.verdict).toMatchObject({
      id: candidateId,
      authorName: 'Contribution author',
      authorHandle: renamedHandle,
    })
  })
})

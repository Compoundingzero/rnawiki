import { randomUUID } from 'node:crypto'

import { config } from 'dotenv'
import { eq, inArray } from 'drizzle-orm'

import {
  PROGRAMME_SUMMARY_FIELD_PATHS,
  PROGRAMME_VERDICT_FIELD_PATHS,
} from '../../../lib/evidence/types'
import { hashPassword } from '../../../lib/auth'

config()

const MEDICINE_SLUG = 'inclisiran'

// Saved source versions cannot be changed after review. These two test-only rows therefore use
// stable ids and are reused between runs; no public dossier points at them after the
// programme-scoped fixture is removed. Reviewer qualifications are append-only, so this serial
// journey is allowed only in a disposable database that the outer harness drops.
const SOURCE_ID = 'e2e-inclisiran-orion10-source'
const SNAPSHOT_ID = 'e2e-inclisiran-orion10-snapshot'
const SOURCE_HREF = 'https://clinicaltrials.gov/study/NCT03399370'
const SOURCE_LABEL = 'ClinicalTrials.gov record for ORION-10'

const ENGINE_VERSION = 'rna-intelligence/2.0.0-e2e'
const INPUT_DIGEST = 'a'.repeat(64)
const PROPOSAL_DIGEST = 'b'.repeat(64)
const PREPARED_AT = new Date('2026-08-21T07:00:00.000Z')
const PUBLISHED_AT = new Date('2026-08-21T08:00:00.000Z')
const REVIEWED_AT = new Date('2026-08-21T07:30:00.000Z')
const VERIFIED_AT = new Date('2026-08-20T12:00:00.000Z')

export interface NormalizedInclisiranFixture {
  createdMedicineId: string | null
  medicineSlug: string
  programmeId: string
  programmeSlug: string
  claimId: string
  evidenceNodeId: string
  sourceId: string
  sourceSnapshotId: string
  sourceHref: string
  sourceLabel: string
  contributor: {
    id: string
    email: string
    password: string
  }
  reviewers: Array<{
    id: string
    email: string
    password: string
    name: string
  }>
  adjudicator: {
    id: string
    email: string
    password: string
    name: string
  }
  userIds: string[]
}

export interface NormalizedInclisiranFixtureOptions {
  registrySupportsClaim?: boolean
  medicineSlug?: string
  medicineName?: string
}

export function normalizedInclisiranRegistryStudy(
  overrides: {
    overallStatus?: string
    enrolment?: number
    hasResults?: boolean
  } = {},
) {
  return {
    hasResults: overrides.hasResults ?? true,
    protocolSection: {
      identificationModule: {
        nctId: 'NCT03399370',
        briefTitle: 'ORION-10',
      },
      statusModule: {
        overallStatus: overrides.overallStatus ?? 'COMPLETED',
        startDateStruct: { date: '2017-12-21' },
        primaryCompletionDateStruct: { date: '2020-06-30' },
        completionDateStruct: { date: '2021-09-22' },
      },
      sponsorCollaboratorsModule: {
        leadSponsor: { name: 'Test-only Playwright fixture', class: 'INDUSTRY' },
      },
      designModule: {
        phases: ['PHASE3'],
        enrollmentInfo: { count: overrides.enrolment ?? 1561, type: 'ACTUAL' },
      },
      conditionsModule: { conditions: ['Atherosclerotic cardiovascular disease'] },
      armsInterventionsModule: {
        interventions: [{ name: 'Inclisiran', type: 'DRUG' }],
      },
    },
  }
}

/**
 * Adds a clearly test-only normalized programme graph. A disposable database is normally empty,
 * so the fixture creates only the minimum Inclisiran identity row when needed. It never imports
 * that row or the synthetic evidence into production.
 */
export async function installNormalizedInclisiranFixture(
  options: NormalizedInclisiranFixtureOptions = {},
): Promise<NormalizedInclisiranFixture | null> {
  if (process.env.E2E_DISPOSABLE_DATABASE !== '1') {
    throw new Error(
      'The reviewed-publication journey requires E2E_DISPOSABLE_DATABASE=1 because reviewer qualification events are append-only. Point DATABASE_URL at a uniquely named disposable database that the test harness will drop.',
    )
  }
  const [{ db }, schema] = await Promise.all([import('../../../db'), import('../../../db/schema')])
  const medicineSlug = options.medicineSlug ?? MEDICINE_SLUG
  const medicineName = options.medicineName ?? 'Inclisiran'
  let medicineRows = await db
    .select({ id: schema.drugs.id })
    .from(schema.drugs)
    .where(eq(schema.drugs.slug, medicineSlug))
    .limit(1)
  let createdMedicineId: string | null = null
  if (!medicineRows[0]) {
    createdMedicineId = `e2e-${medicineSlug}-test-identity`.slice(0, 64)
    await db.insert(schema.drugs).values({
      id: createdMedicineId,
      slug: medicineSlug,
      name: medicineName,
      modality: 'siRNA (Small Interfering RNA)',
      approvalStatus: 'FDA Approved',
      dossierDepth: 'stub',
    })
    medicineRows = [{ id: createdMedicineId }]
  }
  const medicine = medicineRows[0]!

  const runKey = randomUUID().replaceAll('-', '').slice(0, 12)
  const id = (name: string) => `e2e-inc-${name}-${runKey}`
  const programmeId = id('programme')
  const programmeSlug = `playwright-normalized-${runKey}`
  const trialId = id('trial')
  const claimId = id('claim')
  const nodeId = id('node')
  const verdictId = id('verdict')
  const authorId = id('author')
  const reviewerAId = id('reviewer-a')
  const reviewerBId = id('reviewer-b')
  const contributorId = id('contributor')
  const adjudicatorId = id('adjudicator')
  const supportingSourceId = id('supporting-source')
  const supportingSnapshotId = id('supporting-snapshot')
  const supportingSourceHref = `https://doi.org/10.5555/${supportingSourceId}`
  const contributorEmail = `${contributorId}@example.test`
  const fixturePassword = `Playwright-${runKey}-safe-passphrase!42`
  const fixturePasswordHash = await hashPassword(fixturePassword)
  const userIds = [authorId, contributorId]

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(schema.evidenceSources)
        .values({
          id: SOURCE_ID,
          sourceType: 'CLINICAL_TRIAL_REGISTRY',
          externalIdentifier: 'NCT03399370',
          canonicalLocator: SOURCE_HREF,
          title: SOURCE_LABEL,
          publisher: 'ClinicalTrials.gov',
          correctionStatus: 'CURRENT',
          hierarchy: 'PRIMARY',
        })
        .onConflictDoNothing()

      await tx
        .insert(schema.sourceSnapshots)
        .values({
          id: SNAPSHOT_ID,
          sourceId: SOURCE_ID,
          retrievedAt: VERIFIED_AT,
          lastVerifiedAt: VERIFIED_AT,
          contentHash: 'c'.repeat(64),
          structuredData: normalizedInclisiranRegistryStudy(),
        })
        .onConflictDoNothing()

      if (options.registrySupportsClaim === false) {
        await tx.insert(schema.evidenceSources).values({
          id: supportingSourceId,
          sourceType: 'PEER_REVIEWED_PUBLICATION',
          externalIdentifier: `10.5555/${supportingSourceId}`,
          canonicalLocator: supportingSourceHref,
          title: 'Independent test-only evidence report',
          publisher: 'Playwright fixture journal',
          correctionStatus: 'CURRENT',
          hierarchy: 'PRIMARY',
        })
        await tx.insert(schema.sourceSnapshots).values({
          id: supportingSnapshotId,
          sourceId: supportingSourceId,
          retrievedAt: VERIFIED_AT,
          lastVerifiedAt: VERIFIED_AT,
          contentHash: 'd'.repeat(64),
          structuredData: { title: 'Independent test-only evidence report' },
          rawSnapshotLocator: supportingSourceHref,
        })
      }

      await tx.insert(schema.users).values([
        {
          id: authorId,
          email: `${authorId}@example.test`,
          passwordHash: 'not-used-by-playwright',
          name: 'Playwright fixture author',
          handle: `playwright-fixture-author-${runKey}`,
        },
        {
          id: reviewerAId,
          email: `${reviewerAId}@example.test`,
          passwordHash: fixturePasswordHash,
          name: 'Playwright clinical reviewer',
          handle: `playwright-clinical-${runKey}`,
          trustTier: 'trusted',
        },
        {
          id: reviewerBId,
          email: `${reviewerBId}@example.test`,
          passwordHash: fixturePasswordHash,
          name: 'Playwright statistics reviewer',
          handle: `playwright-statistics-${runKey}`,
          trustTier: 'trusted',
        },
        {
          id: contributorId,
          email: contributorEmail,
          passwordHash: fixturePasswordHash,
          name: 'Playwright synthetic contributor',
          handle: `playwright-contributor-${runKey}`,
        },
        {
          id: adjudicatorId,
          email: `${adjudicatorId}@example.test`,
          passwordHash: fixturePasswordHash,
          name: 'Playwright synthetic adjudicator',
          handle: `playwright-adjudicator-${runKey}`,
          trustTier: 'steward',
        },
      ])

      await tx.insert(schema.programmeVerdictReviewerQualificationEvents).values([
        {
          id: id('clinical-qualification'),
          reviewerUserId: reviewerAId,
          expertiseTag: 'CLINICAL_PHARMACOLOGY',
          action: 'GRANT',
          authorizedByUserId: adjudicatorId,
          reason: 'Test-only qualification inside the disposable Playwright database.',
        },
        {
          id: id('statistics-qualification'),
          reviewerUserId: reviewerBId,
          expertiseTag: 'BIOSTATISTICS',
          action: 'GRANT',
          authorizedByUserId: adjudicatorId,
          reason: 'Test-only qualification inside the disposable Playwright database.',
        },
      ])

      await tx.insert(schema.developmentProgrammes).values({
        id: programmeId,
        drugId: medicine.id,
        slug: programmeSlug,
        title: 'Inclisiran study in adults with artery disease and high LDL cholesterol',
        indication: 'Lowering LDL cholesterol in adults with artery disease',
        targetPopulation:
          'Adults with high LDL (“bad”) cholesterol despite already taking cholesterol-lowering medicine',
        jurisdiction: 'United States',
        sponsor: 'Test-only Playwright fixture',
        status: 'ACTIVE',
        highestPhaseReached: 'Phase 3',
        route: 'Injection under the skin',
        doseExposureContext: 'Injections on day 1, at month 3, and then every 6 months',
        startDate: '2017-12-21',
        endDate: '2021-09-22',
        updateStatus: 'CURRENT',
      })

      await tx.insert(schema.programmeTrials).values({
        id: trialId,
        programmeId,
        trialIdentifier: 'NCT03399370',
        title: 'ORION-10',
        phase: 'Phase 3',
        status: 'COMPLETED',
        resultsStatus: 'AVAILABLE',
        enrolment: 1561,
        enrolmentType: 'ACTUAL',
        startDate: '2017-12-21',
        primaryCompletionDate: '2020-06-30',
        completionDate: '2021-09-22',
        humanStudyStatus: 'YES',
        registrySourceId: SOURCE_ID,
        registrySnapshotId: SNAPSHOT_ID,
        lastVerifiedAt: VERIFIED_AT,
      })

      await tx.insert(schema.claims).values({
        id: claimId,
        programmeId,
        claimKey: 'playwright-orion10-ldlc-endpoint',
        revisionNumber: 1,
        programmeTrialId: trialId,
        evidenceNodeType: 'BIOLOGICAL_RESPONSE',
        nature: 'MEASURED',
        reviewStatus: 'PUBLISHED',
        plainLanguageText:
          'In this test study, LDL cholesterol was lower with inclisiran than with a dummy treatment after 510 days.',
        technicalText:
          'Synthetic Playwright fixture row used to exercise claim and source lineage; it is not a production medical assertion.',
        population:
          'Adults with high LDL (“bad”) cholesterol despite already taking cholesterol-lowering medicine',
        intervention: 'Inclisiran',
        comparator: 'Dummy treatment (placebo)',
        dose: 'Injection on day 1, at month 3, and then every 6 months',
        route: 'Injection under the skin',
        duration: '510 days',
        endpoint: 'Change in LDL cholesterol after 510 days',
        endpointHierarchy: 'Primary endpoint',
        outcomeType: 'Biomarker',
        numericValue: '-52.3',
        numericUnitRequired: true,
        numericUnit:
          'percentage points: the difference between the two groups’ average LDL changes',
        uncertaintyInterval:
          'The difference between groups could be 48.8 to 55.7 percentage points lower (95% confidence interval)',
        direction: 'DECREASE',
        timepoint: 'Day 510',
        reviewerInterpretation:
          'The study measured a cholesterol result, not heart attacks or strokes.',
        lastVerifiedAt: VERIFIED_AT,
        authorUserId: authorId,
        publishedAt: PUBLISHED_AT,
      })

      await tx.insert(schema.evidenceNodes).values({
        id: nodeId,
        programmeId,
        nodeType: 'BIOLOGICAL_RESPONSE',
        revisionNumber: 1,
        state: 'CONFIRMED',
        reviewStatus: 'PUBLISHED',
        plainSummary:
          'In the reviewed study, LDL cholesterol was lower with inclisiran than with a dummy treatment after 510 days. The result is linked to the saved source used during review.',
        professionalSummary: 'Test-only normalized biological-response node.',
        rationale: 'Present only while the Playwright journey is running.',
        lastVerifiedAt: VERIFIED_AT,
        authorUserId: authorId,
        publishedAt: PUBLISHED_AT,
      })

      await tx.insert(schema.claimSourceLinks).values({
        programmeId,
        claimId,
        sourceSnapshotId:
          options.registrySupportsClaim === false ? supportingSnapshotId : SNAPSHOT_ID,
        relationship: 'SUPPORTS',
        sourceLocator: options.registrySupportsClaim === false ? supportingSourceHref : SOURCE_HREF,
      })

      await tx.insert(schema.evidenceNodeClaims).values({
        programmeId,
        evidenceNodeId: nodeId,
        claimId,
        relationship: 'SUPPORTS',
      })

      await tx.insert(schema.programmeFreshnessStates).values({
        programmeId,
        sourceId: SOURCE_ID,
        currentSnapshotId: SNAPSHOT_ID,
        checkStatus: 'SUCCEEDED',
        freshnessStatus: 'CURRENT',
        lastCheckAttemptAt: VERIFIED_AT,
        lastSuccessfulCheckAt: VERIFIED_AT,
        lastVerifiedAt: VERIFIED_AT,
        nextCheckDueAt: new Date('2026-09-20T12:00:00.000Z'),
      })
      if (options.registrySupportsClaim === false) {
        await tx.insert(schema.programmeFreshnessStates).values({
          programmeId,
          sourceId: supportingSourceId,
          currentSnapshotId: supportingSnapshotId,
          checkStatus: 'SUCCEEDED',
          freshnessStatus: 'CURRENT',
          lastCheckAttemptAt: VERIFIED_AT,
          lastSuccessfulCheckAt: VERIFIED_AT,
          lastVerifiedAt: VERIFIED_AT,
          nextCheckDueAt: new Date('2026-09-20T12:00:00.000Z'),
        })
      }

      // Bundle links are inserted while the prepared verdict is still DRAFT. Once the revision is
      // approved, the database keeps these exact claims, trials, nodes and links together.
      await tx.insert(schema.programmeVerdictRevisions).values({
        id: verdictId,
        programmeId,
        revisionNumber: 1,
        reviewStatus: 'DRAFT',
        programmeStatusAtReview: 'ACTIVE',
        proposalAsOfDate: '2026-08-20',
        presentationSchemaVersion: 'programme-presentation/v1',
        publicLabel: 'Inclisiran lowered LDL cholesterol in this reviewed study',
        professionalLabel: 'Reviewed ORION-10 LDL-cholesterol result (Playwright fixture)',
        indicationScope: 'Adults with artery disease and high LDL cholesterol',
        populationScope:
          'Adults with high LDL (“bad”) cholesterol despite already taking cholesterol-lowering medicine',
        doseExposureScope: 'Injections on day 1, at month 3, and then every 6 months',
        periodScope: 'ORION-10, 2017 to 2021',
        trialScope: 'ORION-10 (NCT03399370)',
        outcomeScope: 'Main study measure: change in LDL cholesterol',
        plainMechanism:
          'This study measured what happened to LDL cholesterol in people. It did not test the molecular steps inside liver cells.',
        bestSupportedFinding:
          'After about 17 months, inclisiran lowered LDL (“bad”) cholesterol by about half compared with a dummy treatment.',
        mainLimitation:
          'The study measured LDL cholesterol, not whether people had fewer heart attacks or strokes.',
        oneSentenceReason:
          'This test record shows how one reviewed study result connects to a public conclusion and its source.',
        whatWasDisproven: [],
        whatWasNotDisproven: [
          'The study did not test whether inclisiran prevents heart attacks or strokes, so it did not settle that question.',
        ],
        whatRemainsUnknown: [
          'Whether inclisiran prevents heart attacks or strokes remains unknown from this study.',
        ],
        confidence: 'MODERATE',
        confidenceExplanation:
          'Moderate confidence because this test record contains one linked study result.',
        conditionsThatWouldChangeVerdict: [
          'A corrected study result or removal of the linked saved source version.',
        ],
        authorUserId: authorId,
        authorName: 'Playwright fixture author',
        sourceDependent: true,
      })

      await tx.insert(schema.programmeVerdictClaims).values({
        programmeId,
        verdictRevisionId: verdictId,
        claimId,
        relationship: 'SUPPORTING',
      })
      await tx.insert(schema.programmeVerdictTrials).values({
        programmeId,
        verdictRevisionId: verdictId,
        programmeTrialId: trialId,
      })
      await tx.insert(schema.programmeVerdictEvidenceNodes).values({
        programmeId,
        verdictRevisionId: verdictId,
        evidenceNodeId: nodeId,
      })

      await tx.insert(schema.programmeVerdictMechanismSteps).values([
        {
          verdictRevisionId: verdictId,
          programmeId,
          stepKey: 'treatment-given',
          stepOrder: 1,
          plainTitle: 'People received inclisiran or a dummy treatment',
          plainDescription:
            'People in the study were assigned to receive inclisiran or a dummy treatment by injection under the skin.',
          technicalDescription:
            'Test-only stage supported by the reviewed claim route and its linked human study.',
          evidenceBasis: 'MEASURED_IN_PEOPLE',
        },
        {
          verdictRevisionId: verdictId,
          programmeId,
          stepKey: 'ldl-measured',
          stepOrder: 2,
          plainTitle: 'Researchers tracked LDL cholesterol',
          plainDescription:
            'The main study measure was the change in LDL (“bad”) cholesterol after 510 days.',
          technicalDescription:
            'Test-only stage supported by the reviewed primary biomarker endpoint.',
          evidenceBasis: 'MEASURED_IN_PEOPLE',
        },
        {
          verdictRevisionId: verdictId,
          programmeId,
          stepKey: 'result-recorded',
          stepOrder: 3,
          plainTitle: 'LDL cholesterol was lower with inclisiran',
          plainDescription:
            'After 510 days, the average percentage change in LDL cholesterol was 52.3 percentage points lower with inclisiran than with a dummy treatment.',
          technicalDescription:
            'Test-only stage supported by the exact result, direction and timepoint on the reviewed claim.',
          evidenceBasis: 'MEASURED_IN_PEOPLE',
        },
      ])
      await tx.insert(schema.programmeVerdictMechanismStepClaims).values(
        ['treatment-given', 'ldl-measured', 'result-recorded'].map((stepKey) => ({
          verdictRevisionId: verdictId,
          programmeId,
          stepKey,
          claimId,
          relationship: 'SUPPORTS' as const,
        })),
      )
      await tx.insert(schema.programmeVerdictTimelineEvents).values({
        verdictRevisionId: verdictId,
        programmeId,
        eventKey: 'orion10-result',
        eventDate: '2020-06-30',
        eventType: 'IMPORTANT_RESULT',
        dateBasis: 'ACTUAL',
        plainTitle: 'ORION-10 reported lower LDL cholesterol with inclisiran',
        plainDescription:
          'After 510 days, the average percentage change in LDL cholesterol was 52.3 percentage points lower with inclisiran than with a dummy treatment.',
        technicalDescription:
          'Test-only decision-changing event linked to the reviewed primary endpoint claim.',
        programmeTrialId: trialId,
        sourceId: options.registrySupportsClaim === false ? supportingSourceId : SOURCE_ID,
        sourceSnapshotId:
          options.registrySupportsClaim === false ? supportingSnapshotId : SNAPSHOT_ID,
      })
      await tx.insert(schema.programmeVerdictTimelineEventClaims).values({
        verdictRevisionId: verdictId,
        programmeId,
        eventKey: 'orion10-result',
        claimId,
        relationship: 'SUPPORTS',
      })

      await tx.insert(schema.programmeVerdictScopeSnapshots).values({
        verdictRevisionId: verdictId,
        programmeId,
        drugId: medicine.id,
        slug: programmeSlug,
        title: 'Inclisiran study in adults with artery disease and high LDL cholesterol',
        indication: 'Lowering LDL cholesterol in adults with artery disease',
        targetPopulation:
          'Adults with high LDL (“bad”) cholesterol despite already taking cholesterol-lowering medicine',
        jurisdiction: 'United States',
        sponsor: 'Test-only Playwright fixture',
        partners: [],
        status: 'ACTIVE',
        highestPhaseReached: 'Phase 3',
        route: 'Injection under the skin',
        doseExposureContext: 'Injections on day 1, at month 3, and then every 6 months',
        startDate: '2017-12-21',
        endDate: '2021-09-22',
        stoppingReasonCategory: 'UNKNOWN',
        capturedAt: PREPARED_AT,
      })
      await tx.insert(schema.programmeVerdictTrialSnapshots).values({
        verdictRevisionId: verdictId,
        programmeId,
        programmeTrialId: trialId,
        trialIdentifier: 'NCT03399370',
        title: 'ORION-10',
        phase: 'Phase 3',
        status: 'COMPLETED',
        resultsStatus: 'AVAILABLE',
        enrolment: 1561,
        enrolmentType: 'ACTUAL',
        startDate: '2017-12-21',
        primaryCompletionDate: '2020-06-30',
        completionDate: '2021-09-22',
        humanStudyStatus: 'YES',
        registrySourceId: SOURCE_ID,
        registrySnapshotId: SNAPSHOT_ID,
        lastVerifiedAt: VERIFIED_AT,
        capturedAt: PREPARED_AT,
      })
      await tx.insert(schema.programmeVerdictSourceMetadataSnapshots).values({
        verdictRevisionId: verdictId,
        programmeId,
        sourceId: SOURCE_ID,
        sourceType: 'CLINICAL_TRIAL_REGISTRY',
        canonicalLocator: SOURCE_HREF,
        title: SOURCE_LABEL,
        publisher: 'ClinicalTrials.gov',
        correctionStatus: 'CURRENT',
        hierarchy: 'PRIMARY',
        capturedAt: PREPARED_AT,
      })
      if (options.registrySupportsClaim === false) {
        await tx.insert(schema.programmeVerdictSourceMetadataSnapshots).values({
          verdictRevisionId: verdictId,
          programmeId,
          sourceId: supportingSourceId,
          sourceType: 'PEER_REVIEWED_PUBLICATION',
          externalIdentifier: `10.5555/${supportingSourceId}`,
          canonicalLocator: supportingSourceHref,
          title: 'Independent test-only evidence report',
          publisher: 'Playwright fixture journal',
          correctionStatus: 'CURRENT',
          hierarchy: 'PRIMARY',
          capturedAt: PREPARED_AT,
        })
      }

      await tx.insert(schema.programmeDependencies).values([
        ...PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath, index) => ({
          id: id(`summary-dep-${index}`),
          programmeId,
          claimId,
          dependentSurfaceType: 'PROGRAMME_SUMMARY' as const,
          verdictRevisionId: verdictId,
          fieldPath,
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
        })),
        ...PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath, index) => ({
          id: id(`verdict-dep-${index}`),
          programmeId,
          claimId,
          dependentSurfaceType: 'VERDICT' as const,
          verdictRevisionId: verdictId,
          fieldPath,
          impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
        })),
        {
          id: id('node-dep'),
          programmeId,
          claimId,
          dependentSurfaceType: 'EVIDENCE_NODE' as const,
          evidenceNodeId: nodeId,
          fieldPath: 'evidenceNodes.BIOLOGICAL_RESPONSE.summary',
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
        },
        ...['treatment-given', 'ldl-measured', 'result-recorded'].map((stepKey) => ({
          id: id(`mechanism-dep-${stepKey}`),
          programmeId,
          claimId,
          dependentSurfaceType: 'MECHANISM_MAP' as const,
          verdictRevisionId: verdictId,
          fieldPath: `mechanism.${stepKey}.plainDescription`,
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
        })),
        {
          id: id('timeline-dep-orion10-result'),
          programmeId,
          claimId,
          dependentSurfaceType: 'TIMELINE' as const,
          verdictRevisionId: verdictId,
          fieldPath: 'timeline.orion10-result.plainDescription',
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
        },
      ])

      await tx
        .update(schema.programmeVerdictRevisions)
        .set({
          reviewStatus: 'AWAITING_REVIEW',
          engineVersion: ENGINE_VERSION,
          inputDigest: INPUT_DIGEST,
          proposalDigest: PROPOSAL_DIGEST,
          proposalPreparedAt: PREPARED_AT,
        })
        .where(eq(schema.programmeVerdictRevisions.id, verdictId))
    })

    // Each lifecycle boundary commits separately so the schema's deferred publication-pointer
    // guard evaluates the revision state that belongs to that boundary.
    await db.transaction(async (tx) => {
      await tx.insert(schema.programmeVerdictReviews).values([
        {
          id: id('review-a'),
          verdictRevisionId: verdictId,
          reviewerUserId: reviewerAId,
          reviewerName: 'Playwright clinical reviewer',
          expertiseTags: ['CLINICAL_PHARMACOLOGY'],
          decision: 'APPROVE',
          isIndependent: true,
          conflictsOfInterest: 'No conflicts of interest declared for this test-only review.',
          conflictsOfInterestAttested: true,
          proposalDigest: PROPOSAL_DIGEST,
          engineVersion: ENGINE_VERSION,
          inputDigest: INPUT_DIGEST,
          reviewNote: 'Approved for the test-only public journey.',
          reviewedAt: new Date('2026-08-21T07:31:00.000Z'),
        },
        {
          id: id('review-b'),
          verdictRevisionId: verdictId,
          reviewerUserId: reviewerBId,
          reviewerName: 'Playwright statistics reviewer',
          expertiseTags: ['BIOSTATISTICS'],
          decision: 'APPROVE',
          isIndependent: true,
          conflictsOfInterest: 'No conflicts of interest declared for this test-only review.',
          conflictsOfInterestAttested: true,
          proposalDigest: PROPOSAL_DIGEST,
          engineVersion: ENGINE_VERSION,
          inputDigest: INPUT_DIGEST,
          reviewNote: 'Approved for the test-only public journey.',
          reviewedAt: new Date('2026-08-21T07:32:00.000Z'),
        },
      ])

      await tx
        .update(schema.programmeVerdictRevisions)
        .set({ reviewStatus: 'APPROVED', reviewedAt: REVIEWED_AT })
        .where(eq(schema.programmeVerdictRevisions.id, verdictId))
    })

    await db.transaction(async (tx) => {
      await tx
        .update(schema.programmeVerdictRevisions)
        .set({ reviewStatus: 'PUBLISHED', publishedAt: PUBLISHED_AT })
        .where(eq(schema.programmeVerdictRevisions.id, verdictId))

      await tx.insert(schema.programmeCurrentPublications).values({
        programmeId,
        verdictRevisionId: verdictId,
        publishedAt: PUBLISHED_AT,
      })
    })
  } catch (error) {
    await db
      .transaction(async (tx) => {
        await tx
          .delete(schema.developmentProgrammes)
          .where(eq(schema.developmentProgrammes.id, programmeId))
        await tx.delete(schema.users).where(inArray(schema.users.id, userIds))
        if (createdMedicineId) {
          await tx.delete(schema.drugs).where(eq(schema.drugs.id, createdMedicineId))
        }
      })
      .catch(() => undefined)
    throw error
  }

  return {
    createdMedicineId,
    medicineSlug,
    programmeId,
    programmeSlug,
    claimId,
    evidenceNodeId: nodeId,
    sourceId: SOURCE_ID,
    sourceSnapshotId: SNAPSHOT_ID,
    sourceHref: SOURCE_HREF,
    sourceLabel: SOURCE_LABEL,
    contributor: {
      id: contributorId,
      email: contributorEmail,
      password: fixturePassword,
    },
    reviewers: [
      {
        id: reviewerAId,
        email: `${reviewerAId}@example.test`,
        password: fixturePassword,
        name: 'Playwright clinical reviewer',
      },
      {
        id: reviewerBId,
        email: `${reviewerBId}@example.test`,
        password: fixturePassword,
        name: 'Playwright statistics reviewer',
      },
    ],
    adjudicator: {
      id: adjudicatorId,
      email: `${adjudicatorId}@example.test`,
      password: fixturePassword,
      name: 'Playwright synthetic adjudicator',
    },
    userIds,
  }
}

export async function removeNormalizedInclisiranFixture(
  fixture: NormalizedInclisiranFixture | null,
): Promise<void> {
  if (!fixture) return

  const [{ db }, schema] = await Promise.all([import('../../../db'), import('../../../db/schema')])
  await db.transaction(async (tx) => {
    // Deleting the test-only programme is the supported cleanup path: the database permits a
    // deliberate parent deletion to remove the complete test-only evidence record.
    await tx
      .delete(schema.developmentProgrammes)
      .where(eq(schema.developmentProgrammes.id, fixture.programmeId))
    // Reviewers and the authorizing steward remain referenced by append-only qualification audit
    // events. The disposable database—not row deletion—is their sanctioned teardown boundary.
    await tx.delete(schema.users).where(inArray(schema.users.id, fixture.userIds))
    if (fixture.createdMedicineId) {
      await tx.delete(schema.drugs).where(eq(schema.drugs.id, fixture.createdMedicineId))
    }
  })
}

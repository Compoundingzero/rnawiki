import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'

import { db } from '@/db'
import {
  claims,
  developmentProgrammes,
  drugs,
  programmeCurrentPublications,
  programmeDependencies,
  programmeTrials,
  programmeVerdictAdjudications,
  programmeVerdictClaims,
  programmeVerdictReviewerQualificationEvents,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictTrialSnapshots,
  programmeVerdictTrials,
  users,
} from '@/db/schema'
import { PROGRAMME_SUMMARY_FIELD_PATHS, PROGRAMME_VERDICT_FIELD_PATHS } from '@/lib/evidence/types'
import { getPublicProgrammeVerdictHistory } from '@/lib/queries/public-programme-verdict-history'

const runKey = randomUUID().slice(0, 8)
const drugId = `pvh-drug-${runKey}`
const medicineSlug = `pvh-medicine-${runKey}`
const programmeId = `pvh-programme-${runKey}`
const programmeSlug = `pvh-programme-${runKey}`
const emptyProgrammeId = `pvh-empty-${runKey}`
const emptyProgrammeSlug = `pvh-empty-${runKey}`
const previousId = `pvh-verdict-1-${runKey}`
const currentId = `pvh-verdict-2-${runKey}`
const draftId = `pvh-verdict-3-${runKey}`
const approvedId = `pvh-verdict-4-${runKey}`
const claimId = `pvh-claim-${runKey}`
const trialId = `pvh-trial-${runKey}`
const reviewerAId = `pvh-reviewer-a-${runKey}`
const reviewerBId = `pvh-reviewer-b-${runKey}`
const reviewerPrivateId = `pvh-reviewer-private-${runKey}`
const adjudicatorId = `pvh-adjudicator-${runKey}`
const qualificationAuthorizerId = `pvh-qualification-authorizer-${runKey}`
let adjudicatedAtIso = ''

function proposalDigest(revisionNumber: number): string {
  return (revisionNumber + 4).toString(16).repeat(64)
}

function verdictValues(args: {
  id: string
  revisionNumber: number
  reviewStatus: 'DRAFT' | 'AWAITING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'SUPERSEDED'
  previousVerdictRevisionId?: string
  reviewedAt?: Date
  publishedAt?: Date
  supersededAt?: Date
}) {
  return {
    id: args.id,
    programmeId,
    revisionNumber: args.revisionNumber,
    previousVerdictRevisionId: args.previousVerdictRevisionId,
    reviewStatus: args.reviewStatus,
    programmeStatusAtReview: 'ACTIVE' as const,
    proposalAsOfDate: '2026-08-17',
    publicLabel: `Public verdict ${args.revisionNumber}`,
    professionalLabel: `Professional verdict ${args.revisionNumber}`,
    indicationScope: 'Condition alpha',
    populationScope: 'Adults with condition alpha',
    doseExposureScope: 'Studied exposure',
    periodScope: '2025 to 2026',
    trialScope: 'NCT00000000',
    outcomeScope: 'Prespecified patient outcome',
    plainMechanism: 'The programme was designed to change a recorded pathway.',
    bestSupportedFinding: 'A reviewed measurement was recorded.',
    mainLimitation: 'The programme record remains limited.',
    oneSentenceReason: `Recorded reason ${args.revisionNumber}`,
    authorName: 'History test author',
    engineVersion: 'rna-intelligence/2.0.0',
    inputDigest: String(args.revisionNumber).repeat(64),
    proposalDigest: proposalDigest(args.revisionNumber),
    proposalPreparedAt: args.reviewStatus === 'DRAFT' ? null : new Date('2026-08-17T00:00:00.000Z'),
    reviewedAt: args.reviewedAt,
    publishedAt: args.publishedAt,
    supersededAt: args.supersededAt,
  }
}

beforeAll(async () => {
  await db.transaction(async (tx) => {
    await tx.insert(users).values([
      {
        id: reviewerAId,
        email: `${reviewerAId}@example.test`,
        passwordHash: 'not-used-by-this-test',
        name: 'Public Reviewer A',
        handle: reviewerAId,
        orcid: '0000-0002-1825-0097',
        trustTier: 'steward',
      },
      {
        id: reviewerBId,
        email: `${reviewerBId}@example.test`,
        passwordHash: 'not-used-by-this-test',
        name: 'Public Reviewer B',
        handle: reviewerBId,
        orcid: '0000-0003-1419-2405',
        trustTier: 'steward',
      },
      {
        id: reviewerPrivateId,
        email: `${reviewerPrivateId}@example.test`,
        passwordHash: 'not-used-by-this-test',
        name: 'Private Draft Reviewer',
        handle: reviewerPrivateId,
        trustTier: 'steward',
      },
      {
        id: adjudicatorId,
        email: `${adjudicatorId}@example.test`,
        passwordHash: 'not-used-by-this-test',
        name: 'Public Independent Steward',
        handle: adjudicatorId,
        orcid: '0000-0001-5109-3700',
        trustTier: 'steward',
      },
      {
        id: qualificationAuthorizerId,
        email: `${qualificationAuthorizerId}@example.test`,
        passwordHash: 'not-used-by-this-test',
        name: 'Public History Qualification Authorizer',
        handle: qualificationAuthorizerId,
        trustTier: 'steward',
        isAdmin: true,
      },
    ])
    await tx.insert(programmeVerdictReviewerQualificationEvents).values([
      {
        id: `pvh-qualification-a-${runKey}`,
        reviewerUserId: reviewerAId,
        expertiseTag: 'BIOSTATISTICS',
        action: 'GRANT',
        authorizedByUserId: qualificationAuthorizerId,
        reason: 'Synthetic public-history reviewer qualification.',
      },
      {
        id: `pvh-qualification-b-${runKey}`,
        reviewerUserId: reviewerBId,
        expertiseTag: 'CLINICAL_DEVELOPMENT',
        action: 'GRANT',
        authorizedByUserId: qualificationAuthorizerId,
        reason: 'Synthetic public-history reviewer qualification.',
      },
      {
        id: `pvh-qualification-private-${runKey}`,
        reviewerUserId: reviewerPrivateId,
        expertiseTag: 'CLINICAL_PHARMACOLOGY',
        action: 'GRANT',
        authorizedByUserId: qualificationAuthorizerId,
        reason: 'Synthetic private-review boundary fixture.',
      },
      {
        id: `pvh-qualification-adjudicator-${runKey}`,
        reviewerUserId: adjudicatorId,
        expertiseTag: 'REGULATORY_SCIENCE',
        action: 'GRANT',
        authorizedByUserId: qualificationAuthorizerId,
        reason: 'Synthetic public-history adjudicator qualification.',
      },
    ])
    await tx.insert(drugs).values({
      id: drugId,
      slug: medicineSlug,
      name: 'Programme history test medicine',
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })
    await tx.insert(developmentProgrammes).values([
      {
        id: programmeId,
        drugId,
        slug: programmeSlug,
        title: 'Condition alpha programme',
        indication: 'Condition alpha',
        status: 'ACTIVE',
      },
      {
        id: emptyProgrammeId,
        drugId,
        slug: emptyProgrammeSlug,
        title: 'Programme without a public verdict',
        status: 'PLANNED',
      },
    ])
    await tx.insert(claims).values({
      id: claimId,
      programmeId,
      claimKey: 'history-test-support',
      revisionNumber: 1,
      nature: 'RNAWIKI_JUDGEMENT',
      reviewStatus: 'PUBLISHED',
      plainLanguageText: 'A reviewed claim supports the public history fixture.',
      publishedAt: new Date('2026-08-18T00:00:00.000Z'),
    })
    await tx.insert(programmeTrials).values({
      id: trialId,
      programmeId,
      trialIdentifier: 'NCT00000000',
      title: 'History fixture trial',
    })
    await tx.insert(programmeVerdictRevisions).values([
      verdictValues({
        id: previousId,
        revisionNumber: 1,
        reviewStatus: 'SUPERSEDED',
        reviewedAt: new Date('2026-08-18T00:00:00.000Z'),
        publishedAt: new Date('2026-08-19T00:00:00.000Z'),
        supersededAt: new Date('2026-08-21T00:00:00.000Z'),
      }),
      verdictValues({
        id: currentId,
        revisionNumber: 2,
        reviewStatus: 'DRAFT',
        previousVerdictRevisionId: previousId,
        reviewedAt: new Date('2026-08-20T00:00:00.000Z'),
        publishedAt: new Date('2026-08-21T00:00:00.000Z'),
      }),
      verdictValues({
        id: draftId,
        revisionNumber: 3,
        reviewStatus: 'AWAITING_REVIEW',
        previousVerdictRevisionId: currentId,
      }),
      verdictValues({
        id: approvedId,
        revisionNumber: 4,
        reviewStatus: 'APPROVED',
        previousVerdictRevisionId: currentId,
      }),
    ])

    await tx.insert(programmeDependencies).values([
      ...PROGRAMME_SUMMARY_FIELD_PATHS.map((fieldPath, index) => ({
        id: `pvh-summary-dependency-${runKey}-${index}`,
        programmeId,
        claimId,
        verdictRevisionId: currentId,
        dependentSurfaceType: 'PROGRAMME_SUMMARY' as const,
        fieldPath,
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
      })),
      ...PROGRAMME_VERDICT_FIELD_PATHS.map((fieldPath, index) => ({
        id: `pvh-verdict-dependency-${runKey}-${index}`,
        programmeId,
        claimId,
        verdictRevisionId: currentId,
        dependentSurfaceType: 'VERDICT' as const,
        fieldPath,
        impactLevel: 'POSSIBLE_VERDICT_IMPACT' as const,
      })),
    ])

    await tx.insert(programmeVerdictClaims).values({
      programmeId,
      verdictRevisionId: currentId,
      claimId,
      relationship: 'SUPPORTING',
    })
    await tx.insert(programmeVerdictTrials).values({
      programmeId,
      verdictRevisionId: currentId,
      programmeTrialId: trialId,
    })
    await tx.insert(programmeVerdictScopeSnapshots).values({
      verdictRevisionId: currentId,
      programmeId,
      drugId,
      slug: programmeSlug,
      title: 'Condition alpha programme',
      indication: 'Condition alpha',
      partners: [],
      status: 'ACTIVE',
      stoppingReasonCategory: 'UNKNOWN',
    })
    await tx.insert(programmeVerdictTrialSnapshots).values({
      verdictRevisionId: currentId,
      programmeId,
      programmeTrialId: trialId,
      trialIdentifier: 'NCT00000000',
      title: 'History fixture trial',
      status: 'UNKNOWN',
      resultsStatus: 'UNKNOWN',
      enrolmentType: 'UNKNOWN',
      humanStudyStatus: 'UNKNOWN',
    })
  })

  await db
    .update(programmeVerdictRevisions)
    .set({
      reviewStatus: 'APPROVED',
      proposalPreparedAt: new Date('2026-08-17T00:00:00.000Z'),
    })
    .where(eq(programmeVerdictRevisions.id, currentId))

  await db.insert(programmeVerdictReviews).values([
    {
      id: `pvh-review-public-a-${runKey}`,
      verdictRevisionId: currentId,
      reviewerUserId: reviewerAId,
      reviewerName: 'Public Reviewer A',
      reviewerOrcidSnapshot: '0000-0002-1825-0097',
      expertiseTags: ['BIOSTATISTICS' as const],
      decision: 'APPROVE' as const,
      isIndependent: true,
      conflictsOfInterest: 'No relevant interests',
      conflictsOfInterestAttested: true,
      proposalDigest: proposalDigest(2),
      engineVersion: 'rna-intelligence/2.0.0',
      inputDigest: '2'.repeat(64),
      reviewedAt: new Date('2026-08-20T00:00:00.000Z'),
    },
    {
      id: `pvh-review-public-b-${runKey}`,
      verdictRevisionId: currentId,
      reviewerUserId: reviewerBId,
      reviewerName: 'Public Reviewer B',
      reviewerOrcidSnapshot: '0000-0003-1419-2405',
      expertiseTags: ['CLINICAL_DEVELOPMENT' as const],
      decision: 'CHANGES_REQUESTED' as const,
      isIndependent: true,
      conflictsOfInterest: 'No relevant interests',
      conflictsOfInterestAttested: true,
      proposalDigest: proposalDigest(2),
      engineVersion: 'rna-intelligence/2.0.0',
      inputDigest: '2'.repeat(64),
      reviewNote: 'The population scope needed an independent final decision.',
      reviewedAt: new Date('2026-08-20T01:00:00.000Z'),
    },
    {
      id: `pvh-review-private-${runKey}`,
      verdictRevisionId: draftId,
      reviewerUserId: reviewerPrivateId,
      reviewerName: 'Private Draft Reviewer',
      expertiseTags: ['CLINICAL_PHARMACOLOGY' as const],
      decision: 'CHANGES_REQUESTED' as const,
      isIndependent: true,
      conflictsOfInterest: 'No relevant interests',
      conflictsOfInterestAttested: true,
      proposalDigest: proposalDigest(3),
      engineVersion: 'rna-intelligence/2.0.0',
      inputDigest: '3'.repeat(64),
      reviewNote: 'This note must remain private with the draft.',
      reviewedAt: new Date('2026-08-22T00:00:00.000Z'),
    },
  ])

  const adjudicationRows = await db
    .insert(programmeVerdictAdjudications)
    .values({
      id: `pvh-adjudication-${runKey}`,
      verdictRevisionId: currentId,
      adjudicatorUserId: adjudicatorId,
      adjudicatorNameSnapshot: 'Public Independent Steward',
      adjudicatorOrcidSnapshot: '0000-0001-5109-3700',
      expertiseTags: ['REGULATORY_SCIENCE'],
      decision: 'APPROVE',
      rationale: 'The published population scope addresses the second reviewer’s concern.',
      conflictsOfInterest: 'No relevant interests',
      conflictsOfInterestAttested: true,
      proposalDigestAlgorithm: 'sha256',
      proposalDigest: proposalDigest(2),
      engineVersion: 'rna-intelligence/2.0.0',
      inputDigestAlgorithm: 'sha256',
      inputDigest: '2'.repeat(64),
    })
    .returning({ adjudicatedAt: programmeVerdictAdjudications.adjudicatedAt })
  adjudicatedAtIso = adjudicationRows[0]!.adjudicatedAt.toISOString()

  await db.transaction(async (tx) => {
    await tx
      .update(programmeVerdictRevisions)
      .set({ reviewStatus: 'PUBLISHED' })
      .where(eq(programmeVerdictRevisions.id, currentId))
    await tx.insert(programmeCurrentPublications).values({
      programmeId,
      verdictRevisionId: currentId,
      publishedAt: new Date('2026-08-21T00:00:00.000Z'),
    })
  })
})

afterAll(async () => {
  await db.delete(drugs).where(eq(drugs.id, drugId))
  // Qualification grants are immutable audit records; their principals remain in the disposable
  // integration database rather than weakening the production deletion guard for test cleanup.
})

describe('getPublicProgrammeVerdictHistory', () => {
  it('returns the current pointer and superseded lineage without draft review material', async () => {
    const history = await getPublicProgrammeVerdictHistory(medicineSlug, programmeSlug)

    expect(history?.revisions.map((revision) => revision.id)).toEqual([currentId, previousId])
    expect(history?.revisions[0]).toMatchObject({
      id: currentId,
      status: 'PUBLISHED',
      isCurrent: true,
      previousVerdictRevisionId: previousId,
    })
    expect(history?.revisions[0]?.reviews.map((review) => review.reviewerName)).toEqual([
      'Public Reviewer A',
      'Public Reviewer B',
    ])
    expect(history?.revisions[0]?.reviews).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reviewerName: 'Public Reviewer A',
          reviewerOrcid: '0000-0002-1825-0097',
          expertiseTags: ['BIOSTATISTICS'],
        }),
        expect.objectContaining({
          reviewerName: 'Public Reviewer B',
          reviewerOrcid: '0000-0003-1419-2405',
          expertiseTags: ['CLINICAL_DEVELOPMENT'],
        }),
      ]),
    )
    expect(history?.revisions[0]?.adjudication).toEqual({
      adjudicatorName: 'Public Independent Steward',
      adjudicatorOrcid: '0000-0001-5109-3700',
      expertiseTags: ['REGULATORY_SCIENCE'],
      decision: 'APPROVE',
      rationale: 'The published population scope addresses the second reviewer’s concern.',
      conflictsOfInterest: 'No relevant interests',
      adjudicatedAt: adjudicatedAtIso,
    })
    expect(history?.revisions[1]).toMatchObject({
      id: previousId,
      status: 'SUPERSEDED',
      isCurrent: false,
      supersededAt: '2026-08-21T00:00:00.000Z',
    })
    const serialized = JSON.stringify(history)
    expect(serialized).not.toContain(draftId)
    expect(serialized).not.toContain(approvedId)
    expect(serialized).not.toContain('Private Draft Reviewer')
    expect(serialized).not.toContain(adjudicatorId)
    expect(serialized).not.toContain(qualificationAuthorizerId)
    expect(serialized).not.toContain('adjudicatorUserId')
  })

  it('returns an honest empty history for an existing programme with no public revision', async () => {
    const history = await getPublicProgrammeVerdictHistory(medicineSlug, emptyProgrammeSlug)

    expect(history).not.toBeNull()
    expect(history?.programme.slug).toBe(emptyProgrammeSlug)
    expect(history?.revisions).toEqual([])
  })
})

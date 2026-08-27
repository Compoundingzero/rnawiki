import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  feedback,
  physicianVerificationRequests,
  programmeContributionProposals,
  programmeContributionReviews,
  programmeContributionReviewStates,
  users,
} from '@/db/schema'
import { createFeedback, listFeedback, resolveFeedback } from '@/lib/queries/feedback'
import {
  decidePhysicianVerification,
  getContributorProfile,
  getPhysicianVerificationRequest,
  listIndexableContributorProfilesForSitemap,
  listPhysicianVerificationRequests,
  submitDoctorVerification,
} from '@/lib/queries/users'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'
const RUN = Math.random().toString(36).slice(2, 10)

interface TestAccount {
  id: string
  name: string
  handle: string
}

async function makeAccount(label: string, trustTier: 'new' | 'trusted' | 'steward' = 'new') {
  const account: TestAccount = {
    id: `usr_ops_${RUN}_${label}`,
    name: `Operations ${label}`,
    handle: `ops-${RUN}-${label}`,
  }
  await db.insert(users).values({
    ...account,
    email: `${RUN}-${label}@operations.test`,
    passwordHash: 'unused-in-operational-workflow-test',
    trustTier,
  })
  return account
}

async function counterValues(userId: string) {
  const rows = await db
    .select({
      accepted: users.acceptedEditCount,
      rejected: users.rejectedEditCount,
      trustTier: users.trustTier,
    })
    .from(users)
    .where(eq(users.id, userId))
  return rows[0]
}

describe.skipIf(!runsInDisposableDatabase)('private operational review workflows', () => {
  let physician: TestAccount
  let selfReviewingSteward: TestAccount
  let steward: TestAccount
  let trusted: TestAccount
  let reviewerOne: TestAccount
  let reviewerTwo: TestAccount
  let contributionAuthor: TestAccount
  const drugId = `drg_ops_${RUN}`
  const programmeId = `programme_ops_${RUN}`

  beforeAll(async () => {
    ;[
      physician,
      selfReviewingSteward,
      steward,
      trusted,
      reviewerOne,
      reviewerTwo,
      contributionAuthor,
    ] = await Promise.all([
      makeAccount('physician'),
      makeAccount('self-steward', 'steward'),
      makeAccount('steward', 'steward'),
      makeAccount('trusted', 'trusted'),
      makeAccount('reviewer-one', 'trusted'),
      makeAccount('reviewer-two', 'trusted'),
      makeAccount('contribution-author'),
    ])
    await db.insert(drugs).values({
      id: drugId,
      slug: `operations-${RUN}`,
      name: `Operations medicine ${RUN}`,
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })
    await db.insert(developmentProgrammes).values({
      id: programmeId,
      drugId,
      slug: `operations-programme-${RUN}`,
      title: `Operations programme ${RUN}`,
    })
  })

  afterAll(async () => {
    await closeDatabasePool()
  })

  it('rejects direct SQL attempts to forge physician account state', async () => {
    await expect(
      db
        .update(users)
        .set({
          isDoctor: true,
          medicalLicenseOrNpi: 'FORGED-12345',
          medicalSpecialty: 'Cardiology',
          institution: 'Unreviewed institution',
          verificationState: 'verified',
          verifiedAt: new Date('2001-01-01T00:00:00.000Z'),
          verificationNote: 'This row has no credential decision.',
        })
        .where(eq(users.id, trusted.id)),
    ).rejects.toMatchObject({
      cause: {
        message: expect.stringMatching(/must match the latest immutable credential request/),
      },
    })

    await expect(
      db.insert(users).values({
        id: `usr_ops_${RUN}_forged_doctor`,
        name: 'Forged doctor',
        handle: `ops-${RUN}-forged-doctor`,
        email: `${RUN}-forged-doctor@operations.test`,
        passwordHash: 'unused-in-operational-workflow-test',
        isDoctor: true,
        medicalLicenseOrNpi: 'FORGED-67890',
        medicalSpecialty: 'Neurology',
        institution: 'Unreviewed institution',
        verificationState: 'verified',
        verifiedAt: new Date('2001-01-01T00:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      cause: {
        message: expect.stringMatching(/cannot create its own physician credential state/),
      },
    })
  })

  it('persists the exact physician submission privately and enforces an independent decision', async () => {
    const before = new Date()
    const submission = await submitDoctorVerification(physician.id, {
      professionalFullName: 'Dr Rowan Example',
      workEmail: 'rowan@hospital.example',
      medicalLicenseOrNpi: 'NPI-12345678',
      medicalSpecialty: 'Internal medicine',
      institution: 'Example Teaching Hospital',
    })
    expect(submission.submittedAt).not.toBe('2001-01-01T00:00:00.000Z')
    expect(new Date(submission.submittedAt).getTime()).toBeGreaterThanOrEqual(
      before.getTime() - 1000,
    )

    const queue = await listPhysicianVerificationRequests({ status: 'pending', limit: 50 })
    expect(queue.find((item) => item.id === submission.requestId)).toMatchObject({
      professionalFullName: 'Dr Rowan Example',
      medicalSpecialty: 'Internal medicine',
      institution: 'Example Teaching Hospital',
      status: 'pending',
    })
    expect(JSON.stringify(queue)).not.toContain('NPI-12345678')
    expect(JSON.stringify(queue)).not.toContain('rowan@hospital.example')

    const detail = await getPhysicianVerificationRequest(submission.requestId)
    expect(detail).toMatchObject({
      workEmail: 'rowan@hospital.example',
      medicalLicenseOrNpi: 'NPI-12345678',
    })

    await expect(
      decidePhysicianVerification({
        requestId: submission.requestId,
        actorUserId: trusted.id,
        decision: 'APPROVE',
        reason: 'Licence confirmed in the issuing registry.',
      }),
    ).rejects.toMatchObject({ code: 'not_authorized' })

    const decided = await decidePhysicianVerification({
      requestId: submission.requestId,
      actorUserId: steward.id,
      decision: 'APPROVE',
      reason: 'Licence confirmed in the issuing registry.',
    })
    expect(decided.status).toBe('verified')
    expect(decided.decidedBy).toMatchObject({ handle: steward.handle })

    const accountRows = await db
      .select({ state: users.verificationState, verifiedAt: users.verifiedAt })
      .from(users)
      .where(eq(users.id, physician.id))
    expect(accountRows[0]?.state).toBe('verified')
    expect(accountRows[0]?.verifiedAt?.toISOString()).toBe(decided.decidedAt)

    await expect(
      decidePhysicianVerification({
        requestId: submission.requestId,
        actorUserId: steward.id,
        decision: 'REJECT',
        reason: 'A second decision must not replace the first.',
      }),
    ).rejects.toMatchObject({ code: 'not_pending' })
    await expect(
      db
        .update(physicianVerificationRequests)
        .set({ professionalFullName: 'Changed after review' })
        .where(eq(physicianVerificationRequests.id, submission.requestId)),
    ).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/immutable|decided only once/) },
    })
    await expect(
      db
        .delete(physicianVerificationRequests)
        .where(eq(physicianVerificationRequests.id, submission.requestId)),
    ).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/immutable audit records/) },
    })

    const profile = await getContributorProfile(physician.handle)
    const publicJson = JSON.stringify(profile)
    expect(publicJson).not.toContain('rowan@hospital.example')
    expect(publicJson).not.toContain('NPI-12345678')
    expect(publicJson).not.toContain('Licence confirmed')
  })

  it('rejects physician self-review and overwrites caller-supplied decision clocks', async () => {
    const submission = await submitDoctorVerification(selfReviewingSteward.id, {
      professionalFullName: 'Dr Self Reviewer',
      workEmail: 'self@hospital.example',
      medicalLicenseOrNpi: 'SELF-12345',
      medicalSpecialty: 'Neurology',
      institution: 'Example Neurology Centre',
    })
    await expect(
      decidePhysicianVerification({
        requestId: submission.requestId,
        actorUserId: selfReviewingSteward.id,
        decision: 'APPROVE',
        reason: 'I cannot verify my own professional credentials.',
      }),
    ).rejects.toMatchObject({ code: 'self_review' })

    await db.execute(sql`
      UPDATE physician_verification_requests
      SET status = 'rejected',
          decided_by_user_id = ${steward.id},
          decision_reason = 'The supplied registry details could not be confirmed.',
          decided_at = TIMESTAMPTZ '2001-01-01 00:00:00+00'
      WHERE id = ${submission.requestId}
    `)
    const rows = await db
      .select({ decidedAt: physicianVerificationRequests.decidedAt })
      .from(physicianVerificationRequests)
      .where(eq(physicianVerificationRequests.id, submission.requestId))
    expect(rows[0]?.decidedAt?.toISOString()).not.toBe('2001-01-01T00:00:00.000Z')
  })

  it('keeps feedback abuse metadata out of the queue and records one audited resolution', async () => {
    const created = await createFeedback({
      type: 'correction',
      message: `Please recheck the registry date ${RUN}`,
      email: 'reader@example.test',
      drugSlug: `operations-${RUN}`,
      sessionHash: 'a'.repeat(64),
    })
    const open = await listFeedback({ resolved: false, limit: 100 })
    const queued = open.find((item) => item.id === created.id)
    expect(queued).toMatchObject({ resolved: false, email: 'reader@example.test' })
    expect(JSON.stringify(queued)).not.toContain('a'.repeat(64))
    expect(queued).not.toHaveProperty('sessionHash')

    await expect(
      resolveFeedback({
        id: created.id,
        actorUserId: trusted.id,
        note: 'This account is trusted but is not a steward.',
      }),
    ).rejects.toMatchObject({ code: 'not_authorized' })

    const resolved = await resolveFeedback({
      id: created.id,
      actorUserId: steward.id,
      note: 'Checked the registry date and updated the linked work item.',
    })
    expect(resolved).toMatchObject({
      resolved: true,
      resolutionNote: 'Checked the registry date and updated the linked work item.',
      resolvedBy: { handle: steward.handle },
    })
    expect(resolved.resolvedAt).toBeTruthy()

    await expect(
      resolveFeedback({
        id: created.id,
        actorUserId: steward.id,
        note: 'A second transition must not overwrite the first one.',
      }),
    ).rejects.toMatchObject({ code: 'already_resolved' })
    await expect(db.delete(feedback).where(eq(feedback.id, created.id))).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/append-only/) },
    })
  })

  async function createReviewedProposal(
    label: string,
    decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT',
  ): Promise<void> {
    const proposalId = `proposal_ops_${RUN}_${label}`
    const digest = label
      .padEnd(64, '0')
      .slice(0, 64)
      .replace(/[^0-9a-f]/g, 'a')
    await db.insert(programmeContributionProposals).values({
      id: proposalId,
      proposalKey: proposalId,
      programmeId,
      authorUserId: contributionAuthor.id,
      proposalType: 'CORRECTION',
      selectedField: 'programme.title',
      proposedText: `Corrected programme title ${label}`,
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      sourceLocator: 'https://clinicaltrials.gov/study/NCT00000000',
      sourceIdentifier: 'NCT00000000',
      claimNature: 'MEASURED',
      reasoning: 'The registry title differs from the current programme title.',
      whatWasWrongOrMissing: 'The current title does not match the cited registry record.',
      affects: 'OPEN_QUESTIONS',
      conflictsOfInterest: 'None',
      conflictsOfInterestAttested: true,
    })
    await db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL session_replication_role = 'replica'`)
      await tx.execute(sql`
        UPDATE programme_contribution_proposals
        SET status = 'SUBMITTED',
            current_value_snapshot = ${JSON.stringify({
              version: 'rna-intelligence/contribution-current-value-v1',
              programmeId,
              programmeStatus: 'UNKNOWN',
              selectedField: 'programme.title',
              value: `Operations programme ${RUN}`,
              evidenceNode: null,
            })}::jsonb,
            machine_checks = ${JSON.stringify({
              version: 'rna-intelligence/contribution-checks-v1',
              passed: true,
              checks: [],
            })}::jsonb,
            impact_preview = ${JSON.stringify({
              version: 'rna-intelligence/contribution-impact-v1',
              currentVerdictRevisionId: null,
              matchedDependencyCount: 0,
              highestImpactLevel: null,
              affectedClaimIds: [],
              affectedSurfaces: [],
              noDependencyMatch: true,
            })}::jsonb,
            content_digest = ${digest},
            submitted_at = clock_timestamp()
        WHERE id = ${proposalId}
      `)
    })
    // A frozen pre-0015 review policy: two agreeing decisions still resolve these rows, which
    // keeps this counter test focused while covering the legacy-policy derivation at the database.
    await db.insert(programmeContributionReviewStates).values({ proposalId, requiredApprovals: 2 })

    for (const [index, reviewer] of [reviewerOne, reviewerTwo].entries()) {
      await db.insert(programmeContributionReviews).values({
        id: `review_ops_${RUN}_${label}_${index}`,
        proposalId,
        reviewerUserId: reviewer.id,
        reviewerNameSnapshot: reviewer.name,
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision,
        independenceAttested: true,
        conflictsOfInterest: 'None',
        conflictsOfInterestAttested: true,
        reviewNote:
          decision === 'APPROVE' ? null : `Independent ${decision.toLowerCase()} rationale.`,
        contentDigest: digest,
      })
    }
  }

  it('derives counters only from normalized terminal contribution states and never promotes trust', async () => {
    expect(await counterValues(contributionAuthor.id)).toEqual({
      accepted: 0,
      rejected: 0,
      trustTier: 'new',
    })
    await createReviewedProposal('accepted', 'APPROVE')
    // The frozen two-review policy resolved this row, so a third decision must be refused.
    await expect(
      db.insert(programmeContributionReviews).values({
        id: `review_ops_${RUN}_accepted_extra`,
        proposalId: `proposal_ops_${RUN}_accepted`,
        reviewerUserId: selfReviewingSteward.id,
        reviewerNameSnapshot: selfReviewingSteward.name,
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        independenceAttested: true,
        conflictsOfInterest: 'None',
        conflictsOfInterestAttested: true,
        reviewNote: null,
        contentDigest: '0'.repeat(64),
      }),
    ).rejects.toBeDefined()
    expect(await counterValues(contributionAuthor.id)).toEqual({
      accepted: 1,
      rejected: 0,
      trustTier: 'new',
    })
    const sitemapProfile = (await listIndexableContributorProfilesForSitemap()).find(
      (profile) => profile.handle === contributionAuthor.handle,
    )
    expect(sitemapProfile).toMatchObject({ handle: contributionAuthor.handle })
    expect(sitemapProfile?.lastModified).toBeInstanceOf(Date)
    await createReviewedProposal('changes', 'CHANGES_REQUESTED')
    expect(await counterValues(contributionAuthor.id)).toEqual({
      accepted: 1,
      rejected: 0,
      trustTier: 'new',
    })
    await createReviewedProposal('rejected', 'REJECT')
    expect(await counterValues(contributionAuthor.id)).toEqual({
      accepted: 1,
      rejected: 1,
      trustTier: 'new',
    })

    await expect(
      db.update(users).set({ acceptedEditCount: 99 }).where(eq(users.id, contributionAuthor.id)),
    ).rejects.toMatchObject({
      cause: {
        message: expect.stringMatching(/must equal normalized terminal review states/),
      },
    })
  })
})

import { randomUUID } from 'node:crypto'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  programmeContributionImplementations,
  programmeContributionProposals,
  programmeContributionReviewStates,
  programmeCurrentPublications,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  users,
} from '@/db/schema'
import { listHomepageContributorSpotlight } from '@/lib/queries/homepage-contributor-spotlight'

const key = randomUUID().replaceAll('-', '').slice(0, 10)
const fixtureId = (kind: string) => `weekly-${kind}-${key}`.slice(0, 64)
const userId = fixtureId('user')
const drugId = fixtureId('drug')
const medicineSlug = fixtureId('medicine')
const programmeId = fixtureId('programme')
const verdictId = fixtureId('verdict')
const proposalId = fixtureId('proposal')
const publishedAt = new Date('2026-08-26T09:00:00.000Z')

beforeAll(async () => {
  await db.transaction(async (tx) => {
    // These rows model an already completed immutable workflow. The test is about the public read,
    // so bypass transition triggers while retaining every foreign key and CHECK constraint.
    await tx.execute(sql`SET LOCAL session_replication_role = 'replica'`)

    await tx.insert(users).values({
      id: userId,
      email: `${userId}@example.test`,
      passwordHash: 'not-used',
      name: 'Mutable account display name',
      handle: `weekly-handle-${key}`,
    })
    await tx.insert(drugs).values({
      id: drugId,
      slug: medicineSlug,
      name: 'Weekly spotlight medicine',
      modality: 'Small Molecule',
      approvalStatus: 'Phase 2 Investigational',
    })
    await tx.insert(developmentProgrammes).values({
      id: programmeId,
      drugId,
      slug: 'mutable-use-before',
      title: 'Mutable use before publication read',
      status: 'ACTIVE',
    })
    await tx.insert(programmeVerdictRevisions).values({
      id: verdictId,
      programmeId,
      revisionNumber: 1,
      reviewStatus: 'PUBLISHED',
      programmeStatusAtReview: 'ACTIVE',
      proposalAsOfDate: '2026-08-26',
      presentationSchemaVersion: 'programme-presentation/v1',
      publicLabel: 'Published fixture conclusion',
      professionalLabel: 'Published professional fixture conclusion',
      indicationScope: 'Fixture condition',
      populationScope: 'Fixture population',
      doseExposureScope: 'Fixture exposure',
      periodScope: 'Fixture period',
      trialScope: 'Fixture trial',
      outcomeScope: 'Fixture outcome',
      plainMechanism: 'Fixture mechanism.',
      bestSupportedFinding: 'Fixture finding.',
      mainLimitation: 'Fixture limitation.',
      oneSentenceReason: 'Fixture reason.',
      authorUserId: userId,
      authorName: 'Immutable author snapshot',
      engineVersion: 'rna-intelligence/test',
      inputDigest: 'a'.repeat(64),
      proposalDigest: 'b'.repeat(64),
      proposalPreparedAt: publishedAt,
      reviewedAt: publishedAt,
      publishedAt,
    })
    await tx.insert(programmeVerdictScopeSnapshots).values({
      verdictRevisionId: verdictId,
      programmeId,
      drugId,
      slug: 'signed-use-at-publication',
      title: 'Signed use at publication',
      partners: [],
      status: 'ACTIVE',
      stoppingReasonCategory: 'UNKNOWN',
    })
    await tx.insert(programmeCurrentPublications).values({
      programmeId,
      verdictRevisionId: verdictId,
      publishedAt,
    })
    await tx.insert(programmeContributionProposals).values({
      id: proposalId,
      proposalKey: proposalId,
      programmeId,
      authorUserId: userId,
      proposalType: 'CORRECTION',
      status: 'SUBMITTED',
      selectedField: 'programme.title',
      proposedText: 'Signed use at publication',
      sourceType: 'PEER_REVIEWED_PUBLICATION',
      sourceLocator: 'https://example.test/publication',
      sourceIdentifier: 'fixture-publication',
      claimNature: 'MEASURED',
      reasoning: 'The stored title needed a source-bound correction.',
      whatWasWrongOrMissing: 'The earlier title did not match the cited source.',
      affects: 'BOTH',
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true,
      currentValueSnapshot: {
        version: 'rna-intelligence/contribution-current-value-v1',
        programmeId,
        programmeStatus: 'ACTIVE',
        selectedField: 'programme.title',
        value: 'Mutable use before publication read',
        evidenceNode: null,
      },
      machineChecks: {
        version: 'rna-intelligence/contribution-checks-v1',
        passed: true,
        checks: [],
      },
      impactPreview: {
        version: 'rna-intelligence/contribution-impact-v1',
        currentVerdictRevisionId: null,
        matchedDependencyCount: 0,
        highestImpactLevel: null,
        affectedClaimIds: [],
        affectedSurfaces: [],
        noDependencyMatch: true,
      },
      contentDigest: 'c'.repeat(64),
      submittedAt: publishedAt,
    })
    await tx.insert(programmeContributionReviewStates).values({
      proposalId,
      status: 'ACCEPTED_FOR_IMPLEMENTATION',
      reviewCount: 2,
      resolvedAt: publishedAt,
    })
    await tx.insert(programmeContributionImplementations).values({
      proposalId,
      programmeId,
      proposalKey: proposalId,
      verdictRevisionId: verdictId,
      implementedByUserId: userId,
      contributionDigest: 'd'.repeat(64),
    })
  })

  // Mutate the live programme after publication. The public recognition read must remain bound to
  // the immutable scope snapshot above, not these later values.
  await db
    .update(developmentProgrammes)
    .set({ slug: 'mutated-use-later', title: 'Mutated use later', updatedAt: new Date() })
    .where(eq(developmentProgrammes.id, programmeId))
})

afterAll(async () => {
  await db.delete(drugs).where(eq(drugs.id, drugId))
  await db.delete(users).where(eq(users.id, userId))
})

describe('weekly homepage contributor query', () => {
  it('keeps the label and programme link bound to the publication scope snapshot', async () => {
    const spotlight = await listHomepageContributorSpotlight(new Date('2026-08-26T12:00:00.000Z'))
    const entry = spotlight.entries.find((candidate) => candidate.handle === `weekly-handle-${key}`)

    expect(entry).toMatchObject({ publishedChangeCount: 1 })
    expect(entry?.publishedAnswers[0]).toMatchObject({
      programmeTitle: 'Signed use at publication',
      href: `/d/${medicineSlug}?programme=signed-use-at-publication`,
    })
    expect(JSON.stringify(entry)).not.toContain('Mutated use later')
    expect(JSON.stringify(entry)).not.toContain('mutated-use-later')
  })
})

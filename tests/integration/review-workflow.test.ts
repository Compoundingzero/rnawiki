import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, users, reviews } from '@/db/schema'
import { getPublishedClaimsForEntity } from '@/lib/queries/entities'

let entityId: number | null = null
let userId: number | null = null
let reviewId: number | null = null

afterEach(async () => {
  // reviews.reviewerId -> users.id has no onDelete cascade, so the review row must go first or
  // deleting the user would violate the foreign key.
  if (reviewId !== null) {
    await db.delete(reviews).where(eq(reviews.id, reviewId))
    reviewId = null
  }
  if (entityId !== null) {
    await db.delete(entities).where(eq(entities.id, entityId)) // cascades to claims
    entityId = null
  }
  if (userId !== null) {
    await db.delete(users).where(eq(users.id, userId))
    userId = null
  }
})

describe('review workflow surfaces through getPublishedClaimsForEntity', () => {
  it("reflects an approved scientific_reviewer review's decision and reviewer name on the claim", async () => {
    const [entity] = await db
      .insert(entities)
      .values({
        canonicalName: 'Review Workflow Fixture Entity',
        slug: `review-test-${randomUUID().slice(0, 8)}`,
        entityType: 'peptide',
        shortDescription: 'Fixture entity for review-workflow.test.ts.',
        bottomLine: 'Fixture bottom line.',
        regulatoryCategory: 'unapproved_therapeutic_substance',
        publicationStatus: 'published',
      })
      .returning()
    entityId = entity!.id

    const [claim] = await db
      .insert(claims)
      .values({
        entityId: entity!.id,
        slug: 'review-test-claim',
        claimType: 'safety',
        consumerQuestion: 'Is the fixture compound safe?',
        directAnswer: 'Fixture answer with no real claim behind it.',
        measuredFinding: 'Fixture measured finding.',
        inference: 'Fixture inference.',
        proofBoundaryStage: 'controlled_human_evidence',
        proofBoundaryExplanation: 'Fixture explanation.',
        remainingUnknown: 'Fixture unknown.',
        evidenceNeededNext: 'Fixture evidence needed.',
        publicationStatus: 'published',
        version: 1,
      })
      .returning()

    const [reviewer] = await db
      .insert(users)
      .values({
        email: `reviewer-${randomUUID().slice(0, 8)}@rnawiki.test`,
        name: 'Dr. Fixture Reviewer',
        passwordHash: 'not-a-real-hash-this-is-a-fixture',
        role: 'scientific_reviewer',
        credentials: 'MD, PhD — clinical pharmacology',
      })
      .returning()
    userId = reviewer!.id

    const [review] = await db
      .insert(reviews)
      .values({
        reviewableType: 'claim',
        reviewableId: claim!.id,
        reviewerId: reviewer!.id,
        decision: 'approved',
        reviewedVersion: claim!.version,
      })
      .returning()
    reviewId = review!.id

    const publishedClaims = await getPublishedClaimsForEntity(entity!.id)
    expect(publishedClaims).toHaveLength(1)
    expect(publishedClaims[0]?.review).not.toBeNull()
    expect(publishedClaims[0]?.review?.decision).toBe('approved')
    expect(publishedClaims[0]?.review?.reviewerName).toBe('Dr. Fixture Reviewer')
    expect(publishedClaims[0]?.review?.reviewerCredentials).toBe('MD, PhD — clinical pharmacology')
  })

  it('leaves review null on a claim that has never been reviewed', async () => {
    const [entity] = await db
      .insert(entities)
      .values({
        canonicalName: 'Unreviewed Fixture Entity',
        slug: `review-test-none-${randomUUID().slice(0, 8)}`,
        entityType: 'peptide',
        shortDescription: 'Fixture entity for review-workflow.test.ts.',
        bottomLine: 'Fixture bottom line.',
        regulatoryCategory: 'unapproved_therapeutic_substance',
        publicationStatus: 'published',
      })
      .returning()
    entityId = entity!.id

    await db.insert(claims).values({
      entityId: entity!.id,
      slug: 'unreviewed-claim',
      claimType: 'safety',
      consumerQuestion: 'Is the fixture compound safe?',
      directAnswer: 'Fixture answer.',
      measuredFinding: 'Fixture measured finding.',
      inference: 'Fixture inference.',
      proofBoundaryStage: 'animal_evidence',
      proofBoundaryExplanation: 'Fixture explanation.',
      remainingUnknown: 'Fixture unknown.',
      evidenceNeededNext: 'Fixture evidence needed.',
      publicationStatus: 'published',
    })

    const publishedClaims = await getPublishedClaimsForEntity(entity!.id)
    expect(publishedClaims).toHaveLength(1)
    expect(publishedClaims[0]?.review).toBeNull()
  })
})

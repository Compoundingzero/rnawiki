import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, correctionSubmissions } from '@/db/schema'

let entityId: number | null = null
let correctionId: number | null = null

afterEach(async () => {
  // correctionSubmissions.entityId/claimId are onDelete: 'set null', not cascade — deleting the
  // entity would only null out this row's foreign keys, not remove it, so it must be deleted
  // explicitly rather than relying on the entity cascade.
  if (correctionId !== null) {
    await db.delete(correctionSubmissions).where(eq(correctionSubmissions.id, correctionId))
    correctionId = null
  }
  if (entityId !== null) {
    await db.delete(entities).where(eq(entities.id, entityId)) // cascades to claims
    entityId = null
  }
})

describe('a pending correction submission never mutates the claim it targets', () => {
  it('leaves publicationStatus and content untouched, and lands in the moderation queue as pending', async () => {
    const [entity] = await db
      .insert(entities)
      .values({
        canonicalName: 'Correction Workflow Fixture Entity',
        slug: `correction-test-${randomUUID().slice(0, 8)}`,
        entityType: 'peptide',
        shortDescription: 'Fixture entity for correction-workflow.test.ts.',
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
        slug: 'correction-test-claim',
        claimType: 'effectiveness',
        consumerQuestion: 'Does the fixture compound do the fixture thing?',
        directAnswer: 'This is the original, unmodified fixture answer.',
        measuredFinding: 'Original fixture measured finding.',
        inference: 'Original fixture inference.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation: 'Original fixture explanation.',
        remainingUnknown: 'Original fixture unknown.',
        evidenceNeededNext: 'Original fixture evidence needed.',
        publicationStatus: 'published',
      })
      .returning()

    const before = await db.select().from(claims).where(eq(claims.id, claim!.id))
    expect(before).toHaveLength(1)

    const [correction] = await db
      .insert(correctionSubmissions)
      .values({
        entityId: entity!.id,
        claimId: claim!.id,
        category: 'confusing_sentence',
        message: 'This sentence is unclear to a lay reader — could it be reworded?',
        proposedSource: null,
      })
      .returning()
    correctionId = correction!.id

    // Defaults to pending, and is never auto-applied.
    expect(correction!.moderationStatus).toBe('pending')
    expect(correction!.resolution).toBeNull()
    expect(correction!.publicCorrectionEntry).toBeNull()

    const after = await db.select().from(claims).where(eq(claims.id, claim!.id))
    expect(after).toHaveLength(1)
    expect(after[0]?.publicationStatus).toBe(before[0]?.publicationStatus)
    expect(after[0]?.directAnswer).toBe(before[0]?.directAnswer)
    expect(after[0]?.measuredFinding).toBe(before[0]?.measuredFinding)
    expect(after[0]?.inference).toBe(before[0]?.inference)
    expect(after[0]?.proofBoundaryStage).toBe(before[0]?.proofBoundaryStage)
    expect(after[0]?.version).toBe(before[0]?.version)
  })
})

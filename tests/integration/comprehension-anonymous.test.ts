import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, comprehensionQuestions, comprehensionResponses } from '@/db/schema'
import { recordResponse, getAggregateForClaim } from '@/lib/comprehension'

// Exercises lib/comprehension.ts's recordResponse() directly against the real database (rather
// than going through the HTTP layer in app/api/comprehension/route.ts, which is owned by a
// concurrent task) — this is where the dedupe behaviour documented on
// comprehension_responses_dedupe_idx in db/schema.ts actually lives.

let entityId: number | null = null

afterEach(async () => {
  if (entityId !== null) {
    // Cascades entities -> claims -> comprehensionQuestions -> comprehensionResponses.
    await db.delete(entities).where(eq(entities.id, entityId))
    entityId = null
  }
})

describe('anonymous comprehension responses dedupe by (questionId, sessionHash)', () => {
  it('counts two distinct session hashes, but a duplicate hash on the same question does not double-count', async () => {
    const [entity] = await db
      .insert(entities)
      .values({
        canonicalName: 'Comprehension Fixture Entity',
        slug: `comprehension-test-${randomUUID().slice(0, 8)}`,
        entityType: 'peptide',
        shortDescription: 'Fixture entity for comprehension-anonymous.test.ts.',
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
        slug: 'comprehension-test-claim',
        claimType: 'effectiveness',
        consumerQuestion: 'Does the fixture compound do the fixture thing?',
        directAnswer: 'Fixture answer.',
        measuredFinding: 'Fixture measured finding.',
        inference: 'Fixture inference.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation: 'Fixture explanation.',
        remainingUnknown: 'Fixture unknown.',
        evidenceNeededNext: 'Fixture evidence needed.',
        publicationStatus: 'published',
        version: 1,
      })
      .returning()

    const [question] = await db
      .insert(comprehensionQuestions)
      .values({
        claimId: claim!.id,
        question: 'Where does the evidence for this fixture claim currently end?',
        options: ['Animal studies only', 'Confirmed in controlled human trials', 'FDA-approved for this use'],
        correctOptionIndex: 0,
        explanation: 'This fixture claim is deliberately set at animal_evidence.',
        displayOrder: 0,
      })
      .returning()

    const hashA = `hash-a-${randomUUID()}`
    const hashB = `hash-b-${randomUUID()}`

    const first = await recordResponse({
      questionId: question!.id,
      claimVersion: 1,
      selectedOptionIndex: 0, // correct
      sessionHash: hashA,
    })
    expect(first.isCorrect).toBe(true)

    const second = await recordResponse({
      questionId: question!.id,
      claimVersion: 1,
      selectedOptionIndex: 1, // incorrect
      sessionHash: hashB,
    })
    expect(second.isCorrect).toBe(false)

    // Duplicate submission reusing hashA, with a *different* selected option this time — it must
    // not insert a second row, and must return the ORIGINAL stored outcome for that session hash
    // rather than re-scoring the new selection.
    const duplicate = await recordResponse({
      questionId: question!.id,
      claimVersion: 1,
      selectedOptionIndex: 1,
      sessionHash: hashA,
    })
    expect(duplicate.isCorrect).toBe(true)

    const rows = await db
      .select()
      .from(comprehensionResponses)
      .where(eq(comprehensionResponses.questionId, question!.id))
    expect(rows).toHaveLength(2)

    const aggregate = await getAggregateForClaim(claim!.id)
    expect(aggregate.totalResponses).toBe(2)
    expect(aggregate.correctResponses).toBe(1)
  })
})

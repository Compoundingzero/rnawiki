import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, comprehensionQuestions, comprehensionResponses } from '@/db/schema'
import { recordResponse, getAggregateForClaim, getQuestionsForClaim } from '@/lib/comprehension'

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


/**
 * WHICH QUESTION THE PUBLISHED PERCENTAGE DESCRIBES HAS TO BE DECIDABLE.
 *
 * `getAggregateForClaim` picks the claim's central Proof Boundary question by ordering on
 * `displayOrder` and taking the first, and that one question's responses are the sole input to
 * `formatComprehensionAggregate` — the single number CLAUDE.md rule 3 lets this product print.
 * The seeder never set `displayOrder`, so every seeded question took the column default of 0. With
 * two questions tied at 0 the "first" one was whichever row Postgres happened to return, which
 * changes on any row rewrite, VACUUM or dump-restore: the published percentage would silently
 * start describing a different question's response pool, with nothing in the output to show it.
 *
 * Two fixes, both pinned here: the seeder writes displayOrder from the array index, and both
 * queries carry `asc(id)` as a tiebreak so even a tie is deterministic.
 */
describe('the central Proof Boundary question is chosen deterministically', () => {
  it('breaks a displayOrder tie by id rather than by heap order', async () => {
    const [entity] = await db
      .insert(entities)
      .values({
        canonicalName: 'Comprehension Ordering Fixture',
        slug: `comprehension-order-${randomUUID().slice(0, 8)}`,
        entityType: 'peptide',
        shortDescription: 'Fixture entity for the ordering test.',
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
        slug: 'comprehension-order-claim',
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

    // Two questions deliberately tied at displayOrder 0 — exactly the state the seeder used to
    // produce for every claim.
    const [first] = await db
      .insert(comprehensionQuestions)
      .values({
        claimId: claim!.id,
        question: 'The central Proof Boundary question.',
        options: ['Animal studies only', 'Controlled human trials'],
        correctOptionIndex: 0,
        explanation: 'Central.',
        displayOrder: 0,
      })
      .returning()
    await db.insert(comprehensionQuestions).values({
      claimId: claim!.id,
      question: 'A supporting-detail question.',
      options: ['Yes', 'No'],
      correctOptionIndex: 1,
      explanation: 'Supporting.',
      displayOrder: 0,
    })

    // One response, on the lower-id question only. The aggregate must be computed from that one.
    await recordResponse({
      questionId: first!.id,
      claimVersion: 1,
      selectedOptionIndex: 0,
      sessionHash: `hash-${randomUUID()}`,
    })

    const questions = await getQuestionsForClaim(claim!.id)
    expect(questions[0]!.id).toBe(first!.id)

    // Rewriting the row moves the tuple, which is what used to flip the unordered pick.
    await db
      .update(comprehensionQuestions)
      .set({ question: 'The central Proof Boundary question.' })
      .where(eq(comprehensionQuestions.id, first!.id))

    expect((await getQuestionsForClaim(claim!.id))[0]!.id).toBe(first!.id)

    const aggregate = await getAggregateForClaim(claim!.id)
    expect(aggregate.totalResponses).toBe(1)
    expect(aggregate.correctResponses).toBe(1)
    // Below CLARITY_MIN_RESPONSES, so no percentage may be published from it either way.
    expect(aggregate.isClarityTested).toBe(false)
  })
})

/**
 * The seeder must WRITE displayOrder rather than leaning on the column default, or the tiebreak
 * above is the only thing standing between the corpus and an unordered set. Every question in the
 * live corpus therefore has a distinct order within its claim.
 */
describe('the seeded corpus has a well-ordered question set per claim', () => {
  it('never leaves two questions on one claim sharing a displayOrder', async () => {
    const rows = await db
      .select({ claimId: comprehensionQuestions.claimId, displayOrder: comprehensionQuestions.displayOrder })
      .from(comprehensionQuestions)

    const seen = new Set<string>()
    for (const row of rows) {
      const key = `${row.claimId}:${row.displayOrder}`
      expect(seen.has(key), `two questions share displayOrder ${row.displayOrder} on claim ${row.claimId}`).toBe(false)
      seen.add(key)
    }
  })
})

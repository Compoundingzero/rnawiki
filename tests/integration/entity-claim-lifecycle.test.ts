import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, evidenceSources, claimEvidence } from '@/db/schema'
import { getPublishedEntityBySlug, getPublishedClaimsForEntity } from '@/lib/queries/entities'

// Real local Postgres (DATABASE_URL, already migrated — see tests/setup/load-env.ts). Each test
// inserts its own rows under a randomized slug and deletes them in afterEach, so this file never
// assumes any other test's or the real seed data's rows exist.
//
// NOTE: rows are created via direct Drizzle inserts, standing in for the real admin "create
// entity" / "create claim" actions in app/admin, which are being built concurrently with this
// task. Once that admin action exists, this fixture setup should be exercised through it instead
// of inserting rows by hand — this test only verifies the read-side publication-status gating in
// lib/queries/entities.ts, which is stable regardless of how the rows got there.

function uniqueSlug(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 8)}`
}

let entityId: number | null = null
let sourceId: number | null = null

afterEach(async () => {
  if (entityId !== null) {
    // Cascades to claims (entities.id -> claims.entityId onDelete: cascade) and, transitively, to
    // claimEvidence (claims.id -> claimEvidence.claimId onDelete: cascade).
    await db.delete(entities).where(eq(entities.id, entityId))
    entityId = null
  }
  if (sourceId !== null) {
    await db.delete(evidenceSources).where(eq(evidenceSources.id, sourceId))
    sourceId = null
  }
})

describe('entity + claim publication lifecycle', () => {
  it('excludes a draft entity/claim from published-only queries, then includes it once both are published', async () => {
    const entitySlug = uniqueSlug('test-entity')

    const [entity] = await db
      .insert(entities)
      .values({
        canonicalName: 'Integration Test Fixture Entity',
        slug: entitySlug,
        entityType: 'peptide',
        shortDescription: 'A fixture entity created by entity-claim-lifecycle.test.ts.',
        bottomLine: 'A placeholder bottom line used only for integration testing.',
        regulatoryCategory: 'unapproved_therapeutic_substance',
        publicationStatus: 'draft',
      })
      .returning()
    entityId = entity!.id

    const [claim] = await db
      .insert(claims)
      .values({
        entityId: entity!.id,
        slug: 'test-claim',
        claimType: 'effectiveness',
        consumerQuestion: 'Does the fixture compound do the fixture thing?',
        directAnswer: 'This is fixture content with no real claim behind it.',
        measuredFinding: 'Nothing was measured — fixture data.',
        inference: 'No inference is drawn — fixture data.',
        proofBoundaryStage: 'animal_evidence',
        proofBoundaryExplanation: 'Fixture explanation for testing only.',
        remainingUnknown: 'Everything remains unknown — fixture data.',
        evidenceNeededNext: 'A real study would be needed; this is a fixture.',
        publicationStatus: 'draft',
      })
      .returning()

    const [source] = await db
      .insert(evidenceSources)
      .values({
        title: 'A fixture animal study for entity-claim-lifecycle.test.ts',
        sourceType: 'animal study (rat)',
      })
      .returning()
    sourceId = source!.id

    await db.insert(claimEvidence).values({
      claimId: claim!.id,
      evidenceSourceId: source!.id,
      relationship: 'supports',
      claimPartAddressed: 'the fixture thing',
      directlyMeasuredResult: 'Fixture measured result.',
    })

    // 1. Both the entity and its claim are drafts: the canonical public lookup must not find the
    //    entity at all.
    expect(await getPublishedEntityBySlug(entitySlug)).toBeNull()

    // 2. Publish the entity but leave the claim in draft: the entity is now findable, but its
    //    still-draft claim must not appear in the published claims list — claim-level publication
    //    gating is independent of entity-level publication gating.
    await db.update(entities).set({ publicationStatus: 'published' }).where(eq(entities.id, entity!.id))
    const publishedEntity = await getPublishedEntityBySlug(entitySlug)
    expect(publishedEntity).not.toBeNull()
    expect(publishedEntity?.slug).toBe(entitySlug)
    expect(await getPublishedClaimsForEntity(entity!.id)).toHaveLength(0)

    // 3. Publish the claim too: it now appears, with its linked evidence attached.
    await db.update(claims).set({ publicationStatus: 'published' }).where(eq(claims.id, claim!.id))
    const publishedClaims = await getPublishedClaimsForEntity(entity!.id)
    expect(publishedClaims).toHaveLength(1)
    expect(publishedClaims[0]?.slug).toBe('test-claim')
    expect(publishedClaims[0]?.evidence).toHaveLength(1)
    expect(publishedClaims[0]?.evidence[0]?.relationship).toBe('supports')
    expect(publishedClaims[0]?.evidence[0]?.source.title).toBe(
      'A fixture animal study for entity-claim-lifecycle.test.ts'
    )
  })
})

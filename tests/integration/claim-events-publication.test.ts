import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, claims, evidenceSources, claimEvents } from '@/db/schema'
import { getPublishedClaimsForEntity } from '@/lib/queries/entities'
import { GET as getEntityApi } from '@/app/api/v1/entities/[slug]/route'
import { GET as getClaimApi } from '@/app/api/v1/claims/[claimId]/route'

/**
 * A draft claim event is unfinished editorial work that says a treatment failed at something.
 * Serving one would publish an unreviewed failure statement about a real medicine — on the public
 * page, in the JSON API, and from there onto whatever site consumed the API.
 *
 * Three independent code paths read `claim_events` and each one filters on
 * `publicationStatus = 'published'` separately: lib/queries/entities.ts (the record page),
 * app/api/v1/entities/[slug]/route.ts (which reuses that query), and
 * app/api/v1/claims/[claimId]/route.ts (which builds its rows by hand and therefore cannot
 * inherit the filter). A filter dropped from any one of them is invisible to TypeScript, so all
 * three are exercised here against the same fixture rows.
 *
 * Real local Postgres via DATABASE_URL, same as the other integration tests. Rows are created by
 * direct Drizzle insert under a randomised slug and removed in afterEach.
 */

let entityId: number | null = null
let sourceId: number | null = null

afterEach(async () => {
  // Order matters. entities -> claims -> claim_events cascades, but
  // claim_events.evidence_source_id is onDelete: 'restrict' by design (deleting a source must
  // never silently strip the citation off a published event), so the source can only go once its
  // events have gone with the entity.
  if (entityId !== null) {
    await db.delete(entities).where(eq(entities.id, entityId))
    entityId = null
  }
  if (sourceId !== null) {
    await db.delete(evidenceSources).where(eq(evidenceSources.id, sourceId))
    sourceId = null
  }
})

async function apiRequest(url: string): Promise<Request> {
  return new Request(url, { headers: { 'x-forwarded-for': `198.51.100.${Math.floor(Math.random() * 200) + 1}` } })
}

interface Fixture {
  slug: string
  claimId: number
  draftEventId: number
  publishedEventId: number
}

async function seedFixture(): Promise<Fixture> {
  const slug = `claim-events-test-${randomUUID().slice(0, 8)}`

  const [entity] = await db
    .insert(entities)
    .values({
      canonicalName: 'Claim Event Fixture Entity',
      slug,
      entityType: 'peptide',
      shortDescription: 'Fixture entity for claim-events-publication.test.ts.',
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
      slug: 'claim-event-fixture-claim',
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
    })
    .returning()

  const [source] = await db
    .insert(evidenceSources)
    .values({
      title: 'A fixture trial for claim-events-publication.test.ts',
      sourceType: 'randomized controlled trial',
    })
    .returning()
  sourceId = source!.id

  const [draftEvent] = await db
    .insert(claimEvents)
    .values({
      claimId: claim!.id,
      evidenceSourceId: source!.id,
      eventType: 'contradictory_result',
      developmentGate: 'clinical_outcome',
      plainSummary: 'DRAFT FIXTURE EVENT — this string must never reach a reader.',
      whatItSuggests: 'Draft fixture suggestion.',
      whatItDoesNotEstablish: 'Draft fixture boundary.',
      publicationStatus: 'draft',
      displayPriority: 0,
    })
    .returning()

  const [publishedEvent] = await db
    .insert(claimEvents)
    .values({
      claimId: claim!.id,
      evidenceSourceId: source!.id,
      eventType: 'null_result',
      developmentGate: 'clinical_outcome',
      plainSummary: 'PUBLISHED FIXTURE EVENT — the trial found no difference from placebo.',
      whatItSuggests: 'Published fixture suggestion.',
      whatItDoesNotEstablish: 'Published fixture boundary.',
      publicationStatus: 'published',
      displayPriority: 1,
    })
    .returning()

  return {
    slug,
    claimId: claim!.id,
    draftEventId: draftEvent!.id,
    publishedEventId: publishedEvent!.id,
  }
}

describe('claim events are returned only when published', () => {
  it('getPublishedClaimsForEntity returns the published event and never the draft one', async () => {
    const fixture = await seedFixture()

    const publishedClaims = await getPublishedClaimsForEntity(entityId!)
    expect(publishedClaims).toHaveLength(1)

    const events = publishedClaims[0]!.events
    expect(events).toHaveLength(1)
    expect(events[0]?.id).toBe(fixture.publishedEventId)
    expect(events[0]?.eventType).toBe('null_result')
    // The event carries its source, because claim_events.evidence_source_id is NOT NULL by design
    // — an event with no citation is opinion, and this section is not allowed to hold opinion.
    expect(events[0]?.source.title).toBe('A fixture trial for claim-events-publication.test.ts')

    const summaries = events.map((event) => event.plainSummary)
    expect(summaries.some((s) => s.includes('DRAFT FIXTURE EVENT'))).toBe(false)
  })

  it('an event that is in review, not draft, is also withheld — only "published" passes', async () => {
    const fixture = await seedFixture()
    // `editorially_complete` is a real workflow status between draft and published. A filter
    // written as "not draft" rather than "is published" would leak it.
    await db
      .update(claimEvents)
      .set({ publicationStatus: 'editorially_complete' })
      .where(eq(claimEvents.id, fixture.draftEventId))

    const publishedClaims = await getPublishedClaimsForEntity(entityId!)
    expect(publishedClaims[0]!.events).toHaveLength(1)
    expect(publishedClaims[0]!.events[0]?.id).toBe(fixture.publishedEventId)
  })

  it('publishing the draft event makes it appear, so the filter is the only thing hiding it', async () => {
    const fixture = await seedFixture()
    await db
      .update(claimEvents)
      .set({ publicationStatus: 'published' })
      .where(eq(claimEvents.id, fixture.draftEventId))

    const publishedClaims = await getPublishedClaimsForEntity(entityId!)
    expect(publishedClaims[0]!.events).toHaveLength(2)
    // displayPriority is the editorial order and comes first, ahead of event date.
    expect(publishedClaims[0]!.events.map((e) => e.id)).toEqual([
      fixture.draftEventId,
      fixture.publishedEventId,
    ])
  })
})

describe('the public API never serves an unpublished claim event', () => {
  it('GET /api/v1/entities/[slug] carries the published event and not the draft', async () => {
    const fixture = await seedFixture()

    const response = await getEntityApi(
      await apiRequest(`http://localhost/api/v1/entities/${fixture.slug}`),
      { params: Promise.resolve({ slug: fixture.slug }) }
    )
    expect(response.status).toBe(200)

    const body = await response.json()
    const raw = JSON.stringify(body)
    expect(raw).not.toContain('DRAFT FIXTURE EVENT')
    expect(raw).toContain('PUBLISHED FIXTURE EVENT')

    const claim = body.claims[0]
    expect(claim.claimEvents).toHaveLength(1)
    // The raw enum ships as a machine key, but a public sentence ships beside it so no consumer
    // has to invent wording for `null_result`.
    expect(claim.claimEvents[0].eventType).toBe('null_result')
    expect(claim.claimEvents[0].eventTypePublic).toBeTruthy()
    expect(claim.claimEvents[0].eventTypePublic).not.toBe('null_result')
    expect(claim.claimEvents[0].developmentGatePublic).toBeTruthy()
    expect(claim.claimEvents[0].developmentGatePublic).not.toBe('clinical_outcome')
    // Internal ids are not part of the contract; the source travels as its public links only.
    expect(claim.claimEvents[0].source.id).toBeUndefined()
  })

  it('GET /api/v1/claims/[claimId] applies the same filter, though it builds its rows by hand', async () => {
    const fixture = await seedFixture()

    const response = await getClaimApi(
      await apiRequest(`http://localhost/api/v1/claims/${fixture.claimId}`),
      { params: Promise.resolve({ claimId: String(fixture.claimId) }) }
    )
    expect(response.status).toBe(200)

    const body = await response.json()
    expect(JSON.stringify(body)).not.toContain('DRAFT FIXTURE EVENT')
    expect(body.claimEvents).toHaveLength(1)
    expect(body.claimEvents[0].plainSummary).toContain('PUBLISHED FIXTURE EVENT')
  })

  it('an unpublished claim is a plain 404, so the API never reveals that draft content exists', async () => {
    const fixture = await seedFixture()
    await db.update(claims).set({ publicationStatus: 'draft' }).where(eq(claims.id, fixture.claimId))

    const response = await getClaimApi(
      await apiRequest(`http://localhost/api/v1/claims/${fixture.claimId}`),
      { params: Promise.resolve({ claimId: String(fixture.claimId) }) }
    )
    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: 'Not found' })
  })
})

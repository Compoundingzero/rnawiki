import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import {
  entities,
  claims,
  evidenceSources,
  claimEvidence,
  claimEvents,
  evidenceChanges,
  users,
  reviews,
  regulatoryStatuses,
} from '@/db/schema'
import { GET as getEntityApi } from '@/app/api/v1/entities/[slug]/route'
import { GET as getClaimApi } from '@/app/api/v1/claims/[claimId]/route'
import { GET as getSearchApi } from '@/app/api/v1/search/route'
import { stagePositionApplies } from '@/lib/evidence-view'
import { getRegulatoryStatusesForEntity } from '@/lib/queries/entities'

/**
 * The v1 API is a published contract, and docs/api.md is the document it is published in. Two
 * separate properties are guarded here.
 *
 * BACKWARD COMPATIBILITY. Schema 1.1.0 is additive: every field docs/api.md documented before the
 * Evidence Record work must still be present, under the same name, with the same type. The field
 * lists below were read out of docs/api.md as it stood before that change, so a rename or a
 * removal fails here rather than in somebody else's integration a month later. Adding a field is
 * always allowed — nothing in this file asserts that a response has ONLY these keys.
 *
 * REVIEWER PRIVACY. A reviewer's name, credentials and comments are internal editorial
 * correspondence, never public data, and `publicationStatus` is editorial workflow that must
 * never be readable as scientific sign-off (CLAUDE.md rule 2). The two endpoints derive
 * `reviewState` from an approved `reviews` row alone, and /api/v1/claims/[claimId] deliberately
 * selects the decision column without joining `users` for exactly this reason. The fixture below
 * plants a distinctive reviewer name and a distinctive comment string and then scans the whole
 * serialised response for them, which catches a leak through any field, nested or not.
 */

/** Claim fields documented in docs/api.md at schema 1.0.0. None may disappear. */
const V1_CLAIM_FIELDS = [
  'directAnswer',
  'measuredFinding',
  'inference',
  'proofBoundaryStage',
  'proofBoundaryStageLabel',
  'evidenceContext',
  'sourceLinks',
  'lastReviewedAt',
  'canonicalUrl',
] as const

/** Entity-envelope fields documented at 1.0.0. */
const V1_ENTITY_FIELDS = [
  'canonicalName',
  'slug',
  'aliases',
  'entityType',
  'shortDescription',
  'bottomLine',
  'regulatoryCategory',
  'canonicalUrl',
  'updatedAt',
  'regulatoryStatuses',
  'claims',
] as const

const V1_EVIDENCE_CONTEXT_FIELDS = [
  'relationship',
  'relationshipLabel',
  'claimPartAddressed',
  'directlyMeasuredResult',
  'independentGroupStatus',
] as const

const V1_SOURCE_LINK_FIELDS = ['doi', 'pmid', 'regulatoryUrl'] as const

const V1_REGULATORY_STATUS_FIELDS = [
  'jurisdiction',
  'legalCategory',
  'approvedIndications',
  'statusStatement',
  'source',
  'checkedDate',
] as const

const REVIEWER_NAME = 'Dr. Private Fixture Reviewer'
const REVIEWER_CREDENTIALS = 'MD, PhD — fixture pharmacology'
const REVIEWER_COMMENT = 'INTERNAL REVIEW NOTE: this sentence must never appear in an API response.'

let entityId: number | null = null
let sourceId: number | null = null
let userId: number | null = null
let reviewId: number | null = null

/**
 * Deletes whatever the last seedFixture() call created, in dependency order.
 *
 * Extracted from the afterEach hook because one test seeds a fixture per claim type inside a
 * single `it`: only the last set of ids survives in the module-level variables, so every earlier
 * fixture has to be removed before the next one is created or the rows leak into a shared
 * database.
 */
async function cleanUpFixture(): Promise<void> {
  // reviews.reviewerId -> users.id has no cascade, so the review row goes before the user.
  // entities cascades to claims -> claimEvidence / claimEvents / evidenceChanges; the evidence
  // source can only go once the events referencing it (onDelete: 'restrict') are gone with it.
  if (reviewId !== null) {
    await db.delete(reviews).where(eq(reviews.id, reviewId))
    reviewId = null
  }
  if (entityId !== null) {
    await db.delete(entities).where(eq(entities.id, entityId))
    entityId = null
  }
  if (sourceId !== null) {
    await db.delete(evidenceSources).where(eq(evidenceSources.id, sourceId))
    sourceId = null
  }
  if (userId !== null) {
    await db.delete(users).where(eq(users.id, userId))
    userId = null
  }
}

afterEach(cleanUpFixture)

function apiRequest(url: string): Request {
  return new Request(url, {
    headers: { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200) + 1}` },
  })
}

interface Fixture {
  slug: string
  claimId: number
}

async function seedFixture(
  // The claim's stored type. Defaults to the outcome claim every backward-compatibility test
  // wants; the evidence-position tests below pass 'access' and 'regulatory', which are the kinds
  // of question that have no evidence ladder at all.
  claimType: 'mechanism' | 'effectiveness' | 'safety' | 'regulatory' | 'access' | 'claimed_use' = 'effectiveness'
): Promise<Fixture> {
  const slug = `api-contract-test-${randomUUID().slice(0, 8)}`

  const [entity] = await db
    .insert(entities)
    .values({
      canonicalName: 'API Contract Fixture Entity',
      slug,
      aliases: ['Fixture Alias'],
      entityType: 'peptide',
      shortDescription: 'Fixture entity for api-v1-contract.test.ts.',
      bottomLine: 'Fixture bottom line.',
      regulatoryCategory: 'unapproved_therapeutic_substance',
      publicationStatus: 'published',
    })
    .returning()
  entityId = entity!.id

  await db.insert(regulatoryStatuses).values({
    entityId: entity!.id,
    jurisdiction: 'Fixture Jurisdiction',
    legalCategory: 'unapproved_therapeutic_substance',
    statusStatement: 'Fixture regulatory status statement.',
    source: 'https://example.invalid/fixture',
    checkedDate: new Date('2026-01-15T00:00:00Z'),
    reviewStatus: 'published',
  })

  const [claim] = await db
    .insert(claims)
    .values({
      entityId: entity!.id,
      slug: 'api-contract-fixture-claim',
      claimType,
      consumerQuestion: 'Does the fixture compound do the fixture thing?',
      directAnswer: 'Fixture answer.',
      measuredFinding: 'Fixture measured finding.',
      inference: 'Fixture inference.',
      proofBoundaryStage: 'animal_evidence',
      proofBoundaryExplanation: 'Fixture explanation.',
      remainingUnknown: 'Fixture unknown.',
      evidenceNeededNext: 'Fixture evidence needed.',
      publicationStatus: 'published',
      version: 3,
    })
    .returning()

  const [source] = await db
    .insert(evidenceSources)
    .values({
      title: 'A fixture study for api-v1-contract.test.ts',
      sourceType: 'animal study (rat)',
      doi: '10.0000/fixture.api.contract',
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

  await db.insert(claimEvents).values({
    claimId: claim!.id,
    evidenceSourceId: source!.id,
    eventType: 'null_result',
    developmentGate: 'clinical_outcome',
    plainSummary: 'Fixture published event summary.',
    whatItSuggests: 'Fixture suggestion.',
    whatItDoesNotEstablish: 'Fixture boundary.',
    publicationStatus: 'published',
  })

  await db.insert(evidenceChanges).values({
    entityId: entity!.id,
    claimId: claim!.id,
    changeType: 'boundary_moved',
    previousBoundary: 'isolated_cell_evidence',
    newBoundary: 'animal_evidence',
    explanation: 'Fixture change explanation.',
    source: 'https://example.invalid/fixture-change',
  })

  const [reviewer] = await db
    .insert(users)
    .values({
      email: `api-contract-${randomUUID().slice(0, 8)}@rnawiki.test`,
      name: REVIEWER_NAME,
      passwordHash: 'not-a-real-hash-this-is-a-fixture',
      role: 'scientific_reviewer',
      credentials: REVIEWER_CREDENTIALS,
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
      comments: REVIEWER_COMMENT,
      reviewedVersion: claim!.version,
    })
    .returning()
  reviewId = review!.id

  return { slug, claimId: claim!.id }
}

async function entityBody(slug: string) {
  const response = await getEntityApi(apiRequest(`http://localhost/api/v1/entities/${slug}`), {
    params: Promise.resolve({ slug }),
  })
  expect(response.status).toBe(200)
  return response.json()
}

async function searchBody(query: string) {
  const response = await getSearchApi(apiRequest(`http://localhost/api/v1/search?q=${encodeURIComponent(query)}`))
  expect(response.status).toBe(200)
  return response.json()
}

async function claimBody(claimId: number) {
  const response = await getClaimApi(apiRequest(`http://localhost/api/v1/claims/${claimId}`), {
    params: Promise.resolve({ claimId: String(claimId) }),
  })
  expect(response.status).toBe(200)
  return response.json()
}

describe('v1 backward compatibility — every field documented before schema 1.3.0 is still there', () => {
  it('GET /api/v1/entities/[slug] keeps every 1.0.0 envelope, claim and nested field', async () => {
    const fixture = await seedFixture()
    const body = await entityBody(fixture.slug)

    for (const field of V1_ENTITY_FIELDS) {
      expect(body, `entity field "${field}" disappeared from the v1 response`).toHaveProperty(field)
    }
    // Additive, and the marker that says so.
    expect(body.schemaVersion).toBe('1.3.0')

    const claim = body.claims[0]
    for (const field of V1_CLAIM_FIELDS) {
      expect(claim, `claim field "${field}" disappeared from the v1 response`).toHaveProperty(field)
    }
    for (const field of V1_EVIDENCE_CONTEXT_FIELDS) {
      expect(claim.evidenceContext[0], `evidenceContext field "${field}" disappeared`).toHaveProperty(field)
    }
    for (const field of V1_SOURCE_LINK_FIELDS) {
      expect(claim.sourceLinks[0], `sourceLinks field "${field}" disappeared`).toHaveProperty(field)
    }
    for (const field of V1_REGULATORY_STATUS_FIELDS) {
      expect(body.regulatoryStatuses[0], `regulatoryStatuses field "${field}" disappeared`).toHaveProperty(field)
    }
  })

  it('keeps the documented types, not just the documented names', async () => {
    const fixture = await seedFixture()
    const body = await entityBody(fixture.slug)
    const claim = body.claims[0]

    expect(typeof body.canonicalName).toBe('string')
    expect(Array.isArray(body.aliases)).toBe(true)
    expect(Array.isArray(body.claims)).toBe(true)
    expect(typeof body.updatedAt).toBe('string')

    expect(typeof claim.directAnswer).toBe('string')
    expect(typeof claim.proofBoundaryStage).toBe('string')
    expect(typeof claim.proofBoundaryStageLabel).toBe('string')
    expect(Array.isArray(claim.evidenceContext)).toBe(true)
    expect(Array.isArray(claim.sourceLinks)).toBe(true)
    expect(typeof claim.evidenceContext[0].independentGroupStatus).toBe('boolean')
    // Documented as "ISO 8601 timestamp, null if unreviewed" — a null is valid, a number is not.
    expect(claim.lastReviewedAt === null || typeof claim.lastReviewedAt === 'string').toBe(true)
    expect(claim.canonicalUrl).toContain(`#claim-`)
  })

  it('GET /api/v1/claims/[claimId] returns the same claim shape, bare', async () => {
    const fixture = await seedFixture()
    const body = await claimBody(fixture.claimId)

    for (const field of V1_CLAIM_FIELDS) {
      expect(body, `claim field "${field}" disappeared from the bare claim response`).toHaveProperty(field)
    }
    expect(body.schemaVersion).toBe('1.3.0')
  })

  it('the two endpoints agree on the shared claim fields — they are edited by hand, separately', async () => {
    const fixture = await seedFixture()
    const [nested, bare] = await Promise.all([entityBody(fixture.slug), claimBody(fixture.claimId)])
    const nestedClaim = nested.claims[0]

    for (const field of [
      ...V1_CLAIM_FIELDS,
      'claimVersion',
      'lastCheckedAt',
      'checkedAt',
      'remainingUnknown',
      'evidenceNeededNext',
      'reviewState',
      'claimEvents',
      'evidenceChanges',
      'claimType',
      'evidencePositionApplies',
    ]) {
      expect(bare, `"${field}" is present nested but missing from the bare claim endpoint`).toHaveProperty(field)
      expect(JSON.stringify(bare[field]), `"${field}" differs between the two endpoints`).toBe(
        JSON.stringify(nestedClaim[field])
      )
    }
  })
})

describe('reviewer identity and reviewer comments never reach the API', () => {
  it('an approved review raises reviewState without naming anyone, on the entity endpoint', async () => {
    const fixture = await seedFixture()
    const body = await entityBody(fixture.slug)
    const raw = JSON.stringify(body)

    expect(body.claims[0].reviewState).toBe('independently_reviewed')
    expect(raw, 'reviewer name leaked into the API response').not.toContain(REVIEWER_NAME)
    expect(raw, 'reviewer credentials leaked into the API response').not.toContain(REVIEWER_CREDENTIALS)
    expect(raw, 'reviewer comments leaked into the API response').not.toContain(REVIEWER_COMMENT)
    expect(raw).not.toContain('not-a-real-hash-this-is-a-fixture')
    expect(raw).not.toContain('@rnawiki.test')
  })

  it('the same holds on the claim endpoint, which reads the reviews table directly', async () => {
    const fixture = await seedFixture()
    const body = await claimBody(fixture.claimId)
    const raw = JSON.stringify(body)

    expect(body.reviewState).toBe('independently_reviewed')
    expect(raw).not.toContain(REVIEWER_NAME)
    expect(raw).not.toContain(REVIEWER_CREDENTIALS)
    expect(raw).not.toContain(REVIEWER_COMMENT)
  })

  it('a rejected review is editorial_only — reviewState is not "a review row exists"', async () => {
    const fixture = await seedFixture()
    await db.update(reviews).set({ decision: 'rejected' }).where(eq(reviews.id, reviewId!))

    expect((await claimBody(fixture.claimId)).reviewState).toBe('editorial_only')
    expect((await entityBody(fixture.slug)).claims[0].reviewState).toBe('editorial_only')
  })

  it('an approval of an earlier version degrades to editorial_only, on both endpoints', async () => {
    // BLOCKING. `reviews.reviewedVersion` records which version of the answer the reviewer read.
    // The column was written on every review and read by nothing, so bumping claims.version and
    // rewriting direct_answer — exactly what the admin edit path does — left both endpoints, and
    // the record page, still reporting a live approval of sentences the reviewer never saw.
    const fixture = await seedFixture()
    expect((await claimBody(fixture.claimId)).reviewState).toBe('independently_reviewed')

    const [current] = await db.select({ version: claims.version }).from(claims).where(eq(claims.id, fixture.claimId))
    await db
      .update(claims)
      .set({ version: current!.version + 1, directAnswer: 'An edited answer the reviewer never read.' })
      .where(eq(claims.id, fixture.claimId))

    expect((await claimBody(fixture.claimId)).reviewState).toBe('editorial_only')
    expect((await entityBody(fixture.slug)).claims[0].reviewState).toBe('editorial_only')
  })

  it('a published claim with no review at all is editorial_only, never "reviewed"', async () => {
    const fixture = await seedFixture()
    await db.delete(reviews).where(eq(reviews.id, reviewId!))
    reviewId = null

    // publicationStatus === 'published' is editorial workflow, never scientific sign-off. If this
    // ever reads 'independently_reviewed', the workflow status has been read as an approval.
    expect((await claimBody(fixture.claimId)).reviewState).toBe('editorial_only')
  })

  it('no workflow status, moderation state or internal user id appears in either response', async () => {
    const fixture = await seedFixture()
    const [nested, bare] = await Promise.all([entityBody(fixture.slug), claimBody(fixture.claimId)])

    for (const body of [nested, bare]) {
      const raw = JSON.stringify(body)
      expect(raw).not.toContain('publicationStatus')
      expect(raw).not.toContain('passwordHash')
      expect(raw).not.toContain('reviewerId')
      expect(raw).not.toContain('reviewerName')
      expect(raw).not.toContain('reviewerCredentials')
      expect(raw).not.toContain('moderationStatus')
      expect(raw).not.toContain('sessionHash')
    }
  })
})

/**
 * An evidence position is meaningless for a claim that is not about an outcome, and the API used
 * to publish one anyway.
 *
 * GET /api/v1/claims/881 — Casgevy's "What does actually getting treated with Casgevy involve?" —
 * returned "proofBoundaryStage": "regulatory_evidence" with nothing beside it to say the position
 * does not apply. The record page renders no ladder and no position sentence for that claim,
 * because filling the ladder to its top rung for a description of apheresis, chemotherapy and a
 * hospital stay credits a logistics answer to a regulator's review of effectiveness. The page
 * suppressed it; the JSON published it; a consumer could not tell the two apart.
 *
 * The fix had to be additive. `proofBoundaryStage` and `proofBoundaryStageLabel` are documented v1
 * fields and removing one breaks every consumer written against it, so both are still served,
 * unchanged, and the qualifier was added beside them. These tests pin both halves: the old fields
 * survive, and the new boolean tracks stagePositionApplies() rather than a copy of its rule.
 */
describe('the API says when its evidence position does not apply', () => {
  it('an access claim is served with the position present and evidencePositionApplies false', async () => {
    const fixture = await seedFixture('access')
    const body = await claimBody(fixture.claimId)

    expect(body.claimType).toBe('access')
    expect(body.evidencePositionApplies).toBe(false)
    // Additive, not subtractive: the v1 fields are still exactly what the database holds.
    expect(body.proofBoundaryStage).toBe('animal_evidence')
    expect(typeof body.proofBoundaryStageLabel).toBe('string')
  })

  it('an effectiveness claim is true, so nothing changes for the claims that always had a position', async () => {
    const fixture = await seedFixture('effectiveness')
    const body = await claimBody(fixture.claimId)

    expect(body.claimType).toBe('effectiveness')
    expect(body.evidencePositionApplies).toBe(true)
  })

  it('mirrors stagePositionApplies for every claim type, on both endpoints', async () => {
    for (const claimType of ['mechanism', 'effectiveness', 'safety', 'regulatory', 'access', 'claimed_use'] as const) {
      const fixture = await seedFixture(claimType)
      const [nested, bare] = await Promise.all([entityBody(fixture.slug), claimBody(fixture.claimId)])
      const expected = stagePositionApplies(claimType)

      expect(bare.evidencePositionApplies, `bare claim endpoint disagrees for "${claimType}"`).toBe(expected)
      expect(
        nested.claims[0].evidencePositionApplies,
        `entity endpoint disagrees for "${claimType}"`
      ).toBe(expected)
      expect(nested.claims[0].claimType).toBe(claimType)

      await cleanUpFixture()
    }
  })
})

/**
 * SEARCH SHIPS THE SAME QUALIFIER. /api/v1/search is a public, no-auth, CORS-* endpoint whose most
 * natural consumer use is exactly the thing the site's own search page refuses to do: render a list
 * of question, answer and position line. It emitted `proofBoundaryStage` and its display label for
 * every result and carried neither `claimType` nor `evidencePositionApplies`, so a consumer had no
 * served field with which to tell that RNAwiki suppresses the position for that claim. It is the
 * same defect schema 1.3.0 was written to close on the other two endpoints; there was simply no
 * contract test here, so it was missed rather than exempted.
 */
describe('/api/v1/search carries the evidence-position qualifier too', () => {
  it('returns claimType and evidencePositionApplies on every claim result', async () => {
    const fixture = await seedFixture('access')
    const body = await searchBody('fixture compound do the fixture thing')

    const claimResults = body.results.filter((r: { type: string }) => r.type === 'claim')
    expect(claimResults.length).toBeGreaterThan(0)
    const row = claimResults.find((r: { id: number }) => r.id === fixture.claimId)
    expect(row).toBeDefined()

    expect(row.claimType).toBe('access')
    expect(row.evidencePositionApplies).toBe(false)
    // Additive: the two documented v1 fields are untouched.
    expect(row.proofBoundaryStage).toBe('animal_evidence')
    expect(typeof row.proofBoundaryStageLabel).toBe('string')
  })

  it('mirrors stagePositionApplies rather than re-implementing the rule', async () => {
    for (const claimType of ['mechanism', 'effectiveness', 'safety', 'regulatory', 'access', 'claimed_use'] as const) {
      const fixture = await seedFixture(claimType)
      const body = await searchBody('fixture compound do the fixture thing')
      const row = body.results.find((r: { type: string; id?: number }) => r.type === 'claim' && r.id === fixture.claimId)

      expect(row, `no search result for "${claimType}"`).toBeDefined()
      expect(row.evidencePositionApplies, `search disagrees for "${claimType}"`).toBe(
        stagePositionApplies(claimType)
      )
      await cleanUpFixture()
    }
  })
})

/**
 * A DRAFT REGULATORY STATEMENT IS NOT PUBLIC. `regulatory_statuses.review_status` defaults to
 * 'draft' and the admin "Add jurisdiction" form defaults to 'draft', so the unguarded state was
 * also the default one: an editor who saved a jurisdiction block without touching the dropdown put
 * unreviewed regulatory copy about a medicine straight onto /r/[slug] — while the JSON, which
 * filtered separately, withheld it. Both surfaces now read the same gated query, and the DESC
 * ordering can no longer let a draft row supply the footer's "Regulatory status last checked" date.
 */
describe('unpublished regulatory statuses reach neither the API nor the page query', () => {
  it('a draft jurisdiction appears in no public surface, and does not become the checked date', async () => {
    const fixture = await seedFixture()
    const [entity] = await db.select().from(entities).where(eq(entities.slug, fixture.slug)).limit(1)

    await db.insert(regulatoryStatuses).values({
      entityId: entity!.id,
      jurisdiction: 'ZZ-DRAFT-PROBE Draftlandia',
      legalCategory: 'unapproved_therapeutic_substance',
      statusStatement: 'ZZ-DRAFT-PROBE unreviewed draft statement.',
      approvedIndications: 'ZZ-DRAFT-PROBE unapproved draft indications.',
      source: 'https://example.invalid/zz-draft-probe',
      // Later than the published fixture row, so an ungated query would sort it first and it would
      // become regStatuses[0] — the value the record page prints as the last-checked date.
      checkedDate: new Date('2099-01-01T00:00:00Z'),
      reviewStatus: 'draft',
    })

    const body = await entityBody(fixture.slug)
    expect(JSON.stringify(body)).not.toContain('ZZ-DRAFT-PROBE')

    // The shared query the record page uses, not just the API's own filter.
    const pageStatuses = await getRegulatoryStatusesForEntity(entity!.id)
    expect(pageStatuses.map((s) => s.jurisdiction)).not.toContain('ZZ-DRAFT-PROBE Draftlandia')
    expect(pageStatuses.every((s) => s.reviewStatus === 'published')).toBe(true)
    expect(pageStatuses[0]?.checkedDate.getUTCFullYear()).not.toBe(2099)
  })
})

/**
 * A MALFORMED ID IS A 404, WHICH IS WHAT THE ROUTE'S OWN COMMENT PROMISES. Two classes escaped:
 * an id above the int4 range reached the driver and came back as a 500, and non-canonical
 * spellings of a real id (`0x3F8`, `1.016e3`, `1016.0`, `+1016`) each served a byte-identical copy
 * of one record at another cacheable URL.
 */
describe('claim id parsing on the public endpoint', () => {
  it('404s, never 500s, for an id outside the Postgres integer range', async () => {
    for (const raw of ['2147483648', '99999999999', '99999999999999999999']) {
      const response = await getClaimApi(apiRequest(`http://localhost/api/v1/claims/${raw}`), {
        params: Promise.resolve({ claimId: raw }),
      })
      expect(response.status, `id ${raw}`).toBe(404)
    }
  })

  it('404s for every non-canonical spelling, so one record keeps one URL', async () => {
    const fixture = await seedFixture()
    // The real id still works.
    const ok = await getClaimApi(apiRequest(`http://localhost/api/v1/claims/${fixture.claimId}`), {
      params: Promise.resolve({ claimId: String(fixture.claimId) }),
    })
    expect(ok.status).toBe(200)

    const hex = `0x${fixture.claimId.toString(16)}`
    for (const raw of [hex, `${fixture.claimId}.0`, `+${fixture.claimId}`, ` ${fixture.claimId} `, 'abc', '0', '-1']) {
      const response = await getClaimApi(apiRequest(`http://localhost/api/v1/claims/${raw}`), {
        params: Promise.resolve({ claimId: raw }),
      })
      expect(response.status, `spelling "${raw}"`).toBe(404)
    }
  })
})

/**
 * A CONTROL CHARACTER IS A NO-MATCH, NOT A SERVER ERROR. Postgres refuses to bind a NUL in a text
 * parameter, so one %00 in a slug or a query string produced a 500 from the entity endpoint and
 * from search. The slug is REJECTED rather than stripped, so `bpcNUL-157` cannot resolve to
 * `bpc-157` and give one record a second URL.
 */
describe('control characters in a public slug or query', () => {
  it('the entity endpoint 404s instead of raising, and does not resolve to the clean slug', async () => {
    const fixture = await seedFixture()
    for (const slug of ['\u0000', `${fixture.slug}\u0000`, `\u0000${fixture.slug}`]) {
      const response = await getEntityApi(apiRequest('http://localhost/api/v1/entities/x'), {
        params: Promise.resolve({ slug }),
      })
      expect(response.status, JSON.stringify(slug)).toBe(404)
    }
  })

  it('search treats it as an empty query rather than raising', async () => {
    const response = await getSearchApi(apiRequest('http://localhost/api/v1/search?q=%00'))
    // 400 is the documented answer for an empty q. The point is that it is not a 500.
    expect(response.status).toBe(400)

    const withText = await getSearchApi(apiRequest('http://localhost/api/v1/search?q=a%00b'))
    expect(withText.status).toBe(200)
  })
})

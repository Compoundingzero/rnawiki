import { afterEach, describe, expect, it } from 'vitest'
import { randomUUID } from 'node:crypto'
import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities } from '@/db/schema'
import { POST as postCorrection } from '@/app/api/corrections/route'

/**
 * The two public, unauthenticated WRITE endpoints, and the guards that stop them being levers.
 *
 * This file exists because /api/corrections was three separate defects at once, all reachable by
 * anyone with curl:
 *
 *  - An unknown or out-of-range entityId/claimId went straight into the insert, hit the foreign
 *    key or the int4 range, and came back as a 500 — while every other invalid input on the
 *    endpoint correctly returned 400.
 *  - That 500 was an existence oracle. 200 meant "this id exists", 500 meant "it does not", and
 *    because a foreign key checks existence rather than publication, an UNPUBLISHED draft answered
 *    200 too. app/api/v1/entities/[slug]/route.ts states the opposite guarantee in as many words:
 *    "'Doesn't exist' and 'exists but isn't published' are deliberately indistinguishable to
 *    callers (both are a plain 404) so this endpoint can never be used to detect unpublished
 *    content."
 *  - The daily cap was keyed on a session hash that mixed in the caller's own User-Agent, so
 *    rotating one request header bought a fresh budget. That half is covered by
 *    tests/unit/public-input-guards.test.ts, which pins the hash's inputs.
 *
 * The fix had to keep the two cases indistinguishable, which rules out returning 400 for an
 * unknown id: an id that does not resolve to a published row is stored as null and the submission
 * is accepted exactly as it would have been otherwise.
 */

const createdEntityIds: number[] = []
const createdCorrectionIds: number[] = []

afterEach(async () => {
  // correctionSubmissions.entityId/claimId are onDelete: 'set null', not cascade, so the rows have
  // to go explicitly rather than through the entity.
  if (createdCorrectionIds.length > 0) {
    await db.delete(correctionSubmissions).where(inArray(correctionSubmissions.id, createdCorrectionIds))
    createdCorrectionIds.length = 0
  }
  if (createdEntityIds.length > 0) {
    await db.delete(entities).where(inArray(entities.id, createdEntityIds))
    createdEntityIds.length = 0
  }
})

/** A fresh IP per test, so the endpoint's per-minute limiter never leaks between cases. */
function correctionRequest(body: unknown): Request {
  return new Request('http://localhost/api/corrections', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Last hop is the client address (lib/rate-limit.ts).
      'x-forwarded-for': `10.0.0.1, 203.0.113.${Math.floor(Math.random() * 250) + 1}`,
      'user-agent': `vitest-${randomUUID().slice(0, 8)}`,
    },
    body: JSON.stringify(body),
  })
}

const MESSAGE = 'A correction report long enough to pass the ten-character minimum validation.'

async function seedEntity(publicationStatus: 'published' | 'draft') {
  const [entity] = await db
    .insert(entities)
    .values({
      canonicalName: 'Public Write Endpoint Fixture',
      slug: `public-write-test-${randomUUID().slice(0, 8)}`,
      entityType: 'peptide',
      shortDescription: 'Fixture entity for public-write-endpoints.test.ts.',
      bottomLine: 'Fixture bottom line.',
      regulatoryCategory: 'unapproved_therapeutic_substance',
      publicationStatus,
    })
    .returning()
  createdEntityIds.push(entity!.id)

  const [claim] = await db
    .insert(claims)
    .values({
      entityId: entity!.id,
      slug: 'public-write-test-claim',
      claimType: 'effectiveness',
      consumerQuestion: 'Does the fixture compound do the fixture thing?',
      directAnswer: 'Fixture answer.',
      measuredFinding: 'Fixture measured finding.',
      inference: 'Fixture inference.',
      proofBoundaryStage: 'animal_evidence',
      proofBoundaryExplanation: 'Fixture explanation.',
      remainingUnknown: 'Fixture unknown.',
      evidenceNeededNext: 'Fixture evidence needed.',
      publicationStatus,
    })
    .returning()

  return { entityId: entity!.id, claimId: claim!.id }
}

/** The row this submission created, so the stored context can be inspected. */
async function latestSubmission(message: string) {
  const [row] = await db
    .select()
    .from(correctionSubmissions)
    .where(eq(correctionSubmissions.message, message))
    .orderBy(desc(correctionSubmissions.id))
    .limit(1)
  if (row) createdCorrectionIds.push(row.id)
  return row
}

describe('POST /api/corrections context ids', () => {
  it('records a published entity and claim as the report context', async () => {
    const fixture = await seedEntity('published')
    const message = `${MESSAGE} published ${randomUUID().slice(0, 8)}`

    const response = await postCorrection(
      correctionRequest({ category: 'other', message, entityId: fixture.entityId, claimId: fixture.claimId })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })

    const row = await latestSubmission(message)
    expect(row?.entityId).toBe(fixture.entityId)
    expect(row?.claimId).toBe(fixture.claimId)
  })

  it('accepts a non-existent id with the identical response, storing null rather than raising', async () => {
    const message = `${MESSAGE} missing ${randomUUID().slice(0, 8)}`

    const response = await postCorrection(
      correctionRequest({ category: 'other', message, entityId: 2147483000, claimId: 2147483001 })
    )

    // The same status and the same body as the published case above. Anything else is an oracle.
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })

    const row = await latestSubmission(message)
    expect(row).toBeDefined()
    expect(row?.entityId).toBeNull()
    expect(row?.claimId).toBeNull()
  })

  it('answers identically for an unpublished row, so the endpoint cannot detect drafts', async () => {
    const fixture = await seedEntity('draft')
    const message = `${MESSAGE} draft ${randomUUID().slice(0, 8)}`

    const response = await postCorrection(
      correctionRequest({ category: 'other', message, entityId: fixture.entityId, claimId: fixture.claimId })
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })

    const row = await latestSubmission(message)
    // A foreign key would have accepted these ids: they exist. Publication is what decides.
    expect(row?.entityId).toBeNull()
    expect(row?.claimId).toBeNull()
  })

  it('rejects an id beyond the int4 range at validation, never at the driver', async () => {
    const message = `${MESSAGE} overflow ${randomUUID().slice(0, 8)}`

    const response = await postCorrection(correctionRequest({ category: 'other', message, entityId: 99999999999 }))

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.ok).toBe(false)
    // Not the generic "Something went wrong on our end" that a 500 would have produced.
    expect(body.error).not.toContain('our end')
    expect(await latestSubmission(message)).toBeUndefined()
  })
})

describe('POST /api/corrections rate limiting', () => {
  /**
   * REGRESSION. The endpoint's only control was an 8-per-day cap keyed on a hash of IP + the
   * caller's own User-Agent + a daily salt, so twelve submissions with the header rotated were
   * twelve accepted rows where twelve with a fixed header were nine plus three 429s. The hash no
   * longer takes the header, and this per-minute IP limit now sits in front of it.
   */
  it('429s a burst from one IP even when every request sends a different User-Agent', async () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`
    const statuses: number[] = []

    for (let i = 0; i < 8; i++) {
      const message = `${MESSAGE} burst ${i} ${randomUUID().slice(0, 8)}`
      const response = await postCorrection(
        new Request('http://localhost/api/corrections', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-forwarded-for': `10.0.0.1, ${ip}`,
            // A different identity per request under the old scheme.
            'user-agent': `spambot-${i}-${randomUUID()}`,
          },
          body: JSON.stringify({ category: 'other', message }),
        })
      )
      statuses.push(response.status)
      await latestSubmission(message)
    }

    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0)
  })

  /**
   * REGRESSION. getRequestIp took the FIRST hop of X-Forwarded-For, a value the client writes, so
   * rotating that header bought a fresh bucket. It now counts in from the right, past the one
   * trusted proxy, so a prepended hop changes nothing.
   */
  it('cannot be reset by prepending a different hop to X-Forwarded-For', async () => {
    const realIp = `198.51.100.${Math.floor(Math.random() * 250) + 1}`
    const statuses: number[] = []

    for (let i = 0; i < 8; i++) {
      const message = `${MESSAGE} spoof ${i} ${randomUUID().slice(0, 8)}`
      const response = await postCorrection(
        new Request('http://localhost/api/corrections', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            // A new "client" hop each time, with the proxy's own view of the connection last.
            'x-forwarded-for': `203.0.113.${i}, ${realIp}`,
            'user-agent': 'vitest',
          },
          body: JSON.stringify({ category: 'other', message }),
        })
      )
      statuses.push(response.status)
      await latestSubmission(message)
    }

    expect(statuses.filter((s) => s === 429).length).toBeGreaterThan(0)
  })
})

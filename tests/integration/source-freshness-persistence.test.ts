import { createHash } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/db'
import {
  agentReviewCandidates,
  backgroundAssertionChecks,
  backgroundSourceBindings,
  backgroundSourceFetches,
  drugs,
  evidenceSources,
} from '@/db/schema'
import {
  collectBackgroundSourceAssertionBindings,
  type BackgroundSourceAssertionBinding,
} from '@/lib/background/source-assertions'
import {
  BACKGROUND_SOURCE_FETCHER_VERSION,
  backgroundEvidenceSourceId,
  backgroundFreshnessJobKey,
  fetchBackgroundSource,
  type BackgroundSourceFetchOutcome,
} from '@/lib/background/source-fetch'
import {
  BACKGROUND_ASSERTION_CHECKER_VERSION,
  currentBackgroundDriftSummaries,
  persistBackgroundDriftCandidateRun,
  persistBackgroundSourceAttempt,
  persistedBackgroundBindingId,
  recordedBackgroundDigest,
  type BackgroundSourceBindingGroup,
  type PersistedBackgroundAssertionCheck,
} from '@/lib/background/source-freshness'
import type { MedicineRecordedBackground } from '@/lib/background/types'

const drugId = 'freshness-persistence-medicine'
const background: MedicineRecordedBackground = {
  version: 'medicine-background/v1',
  authoredAt: '2026-08-31',
  mechanism: {
    statements: [
      {
        textAsRecorded: 'The recorded amount is 10 mg.',
        source: {
          kind: 'FDA_LABEL',
          identifier: 'FRESHNESS-TEST-SET',
          label: 'Freshness persistence test label',
          locator: 'section 12.3',
          retrievedAt: '2026-08-30',
          excerpt: 'The recorded amount is 10 mg.',
        },
      },
    ],
  },
}

let binding: BackgroundSourceAssertionBinding
let group: BackgroundSourceBindingGroup
let currentCheck: PersistedBackgroundAssertionCheck
let driftCheck: PersistedBackgroundAssertionCheck
let unreachableFetchId: string
let exactBindingId: string

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

async function outcomeAt(
  fetchedAt: Date,
  comparisonSentence: string,
): Promise<BackgroundSourceFetchOutcome> {
  return fetchBackgroundSource(
    { sourceIdentity: binding.sourceIdentity, sourceKey: binding.sourceKey },
    {
      now: () => fetchedAt,
      fetchImplementation: async () =>
        new Response(JSON.stringify({ section: comparisonSentence }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    },
  )
}

async function persistAt(
  fetchedAt: Date,
  comparisonSentence: string,
  nonce: string,
): Promise<PersistedBackgroundAssertionCheck> {
  const outcome = await outcomeAt(fetchedAt, comparisonSentence)
  expect(outcome.status).toBe('SUCCEEDED')
  const checks = await persistBackgroundSourceAttempt({
    jobKey: backgroundFreshnessJobKey(fetchedAt, nonce),
    group,
    outcome,
  })
  expect(checks).toHaveLength(1)
  return checks[0]!
}

beforeAll(async () => {
  await db.insert(drugs).values({
    id: drugId,
    slug: drugId,
    name: 'Freshness persistence medicine',
    sponsor: 'Test sponsor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    indication: 'Test indication',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 50,
    recordedBackground: background,
  })

  const bindings = collectBackgroundSourceAssertionBindings(drugId, background)
  expect(bindings).toHaveLength(1)
  binding = bindings[0]!
  group = {
    sourceKey: binding.sourceKey,
    sourceIdentity: binding.sourceIdentity,
    bindings: [
      {
        drugId,
        recordedBackgroundDigest: recordedBackgroundDigest(background),
        binding,
      },
    ],
  }
  exactBindingId = persistedBackgroundBindingId(group.bindings[0]!)
})

describe('durable exact source freshness', () => {
  it('persists a successful current assertion without marking a question stale', async () => {
    currentCheck = await persistAt(
      new Date('2026-08-31T01:00:00Z'),
      'The recorded amount is 10 mg.',
      'current',
    )
    expect(currentCheck.result).toBe('CURRENT')
    expect(await currentBackgroundDriftSummaries({ drugId, slug: drugId, background })).toEqual([])
  })

  it('uses a new append-only binding identity when the surrounding envelope changes', () => {
    const nextEnvelope = { ...background, authoredAt: '2026-09-01' }
    const [sameAssertion] = collectBackgroundSourceAssertionBindings(drugId, nextEnvelope)
    expect(sameAssertion?.bindingId).toBe(binding.bindingId)
    expect(
      persistedBackgroundBindingId({
        drugId,
        recordedBackgroundDigest: recordedBackgroundDigest(nextEnvelope),
        binding: sameAssertion!,
      }),
    ).not.toBe(exactBindingId)
  })

  it('accepts an exact deterministic replay without duplicating history', async () => {
    const attemptedAt = new Date('2026-08-31T01:30:00Z')
    const outcome = await outcomeAt(attemptedAt, 'The recorded amount is 10 mg.')
    const jobKey = backgroundFreshnessJobKey(attemptedAt, 'exact-replay')
    const first = await persistBackgroundSourceAttempt({ jobKey, group, outcome })
    const replay = await persistBackgroundSourceAttempt({ jobKey, group, outcome })
    expect(replay).toEqual(first)

    const fetchRows = await db
      .select({ id: backgroundSourceFetches.id })
      .from(backgroundSourceFetches)
      .where(eq(backgroundSourceFetches.id, first[0]!.fetchId))
    const checkRows = await db
      .select({ id: backgroundAssertionChecks.id })
      .from(backgroundAssertionChecks)
      .where(eq(backgroundAssertionChecks.id, first[0]!.id))
    expect(fetchRows).toHaveLength(1)
    expect(checkRows).toHaveLength(1)
  })

  it('rejects a reused deterministic fetch ID whose observation differs', async () => {
    const attemptedAt = new Date('2026-08-31T01:40:00Z')
    const jobKey = backgroundFreshnessJobKey(attemptedAt, 'fetch-collision')
    await persistBackgroundSourceAttempt({
      jobKey,
      group,
      outcome: await outcomeAt(attemptedAt, 'The recorded amount is 10 mg.'),
    })

    await expect(
      persistBackgroundSourceAttempt({
        jobKey,
        group,
        outcome: await outcomeAt(attemptedAt, 'The recorded amount is 11 mg.'),
      }),
    ).rejects.toThrow(/Stable identity collision for background_source_fetches/u)
  })

  it('rejects a binding ID replay carrying different bound source metadata', async () => {
    const attemptedAt = new Date('2026-08-31T01:50:00Z')
    const forgedGroup: BackgroundSourceBindingGroup = {
      ...group,
      bindings: [
        {
          ...group.bindings[0]!,
          binding: {
            ...group.bindings[0]!.binding,
            sourceLabel: 'Different source metadata under the same forced ID',
          },
        },
      ],
    }
    await expect(
      persistBackgroundSourceAttempt({
        jobKey: backgroundFreshnessJobKey(attemptedAt, 'binding-collision'),
        group: forgedGroup,
        outcome: await outcomeAt(attemptedAt, 'The recorded amount is 10 mg.'),
      }),
    ).rejects.toThrow(/Stable identity collision for background_source_bindings/u)
  })

  it('rejects a deterministic evidence-source ID collision with another identity', async () => {
    const collisionBackground: MedicineRecordedBackground = {
      ...background,
      mechanism: {
        statements: [
          {
            textAsRecorded: 'The collision amount is 20 mg.',
            source: {
              kind: 'FDA_LABEL',
              identifier: 'FRESHNESS-COLLISION-SET',
              label: 'Collision test label',
              retrievedAt: '2026-08-30',
              excerpt: 'The collision amount is 20 mg.',
            },
          },
        ],
      },
    }
    const [collisionBinding] = collectBackgroundSourceAssertionBindings(drugId, collisionBackground)
    const collidingSourceId = backgroundEvidenceSourceId(collisionBinding!.sourceKey)
    await db.insert(evidenceSources).values({
      id: collidingSourceId,
      sourceType: 'REGULATORY_RECORD',
      externalIdentifier: 'FDA_LABEL:a-different-source',
      canonicalLocator: 'https://example.invalid/different-source',
    })
    const attemptedAt = new Date('2026-08-31T01:55:00Z')
    const collisionOutcome = await fetchBackgroundSource(
      {
        sourceIdentity: collisionBinding!.sourceIdentity,
        sourceKey: collisionBinding!.sourceKey,
      },
      {
        now: () => attemptedAt,
        fetchImplementation: async () =>
          new Response(JSON.stringify({ section: 'The collision amount is 20 mg.' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      },
    )
    await expect(
      persistBackgroundSourceAttempt({
        jobKey: backgroundFreshnessJobKey(attemptedAt, 'source-id-collision'),
        group: {
          sourceKey: collisionBinding!.sourceKey,
          sourceIdentity: collisionBinding!.sourceIdentity,
          bindings: [
            {
              drugId,
              recordedBackgroundDigest: recordedBackgroundDigest(collisionBackground),
              binding: collisionBinding!,
            },
          ],
        },
        outcome: collisionOutcome,
      }),
    ).rejects.toThrow(/Stable identity collision for evidence_sources/u)
  })

  it('persists confirmed drift and connects it to candidate memory', async () => {
    driftCheck = await persistAt(
      new Date('2026-08-31T02:00:00Z'),
      'The recorded amount is 11 mg.',
      'drift',
    )
    expect(driftCheck.result).toBe('DRIFTED')
    const driftRun = {
      jobKey: backgroundFreshnessJobKey(new Date('2026-08-31T02:00:00Z'), 'drift-agent'),
      startedAt: new Date('2026-08-31T02:00:00Z'),
      checks: [driftCheck],
    }
    expect(await persistBackgroundDriftCandidateRun(driftRun)).toBe(1)
    expect(await persistBackgroundDriftCandidateRun(driftRun)).toBe(1)

    const stale = await currentBackgroundDriftSummaries({ drugId, slug: drugId, background })
    expect(stale).toEqual([
      expect.objectContaining({
        bindingId: exactBindingId,
        assertionCheckId: driftCheck.id,
        intent: 'mechanism',
        freshnessState: 'drifted',
        fieldPath: 'mechanism.statements[0]',
      }),
    ])
    const candidates = await db
      .select()
      .from(agentReviewCandidates)
      .where(eq(agentReviewCandidates.subjectId, drugId))
    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toMatchObject({
      reason: 'SOURCE_DRIFT',
      fieldPath: 'mechanism.statements[0]',
      subjectType: 'medicine',
    })
    expect(candidates[0]?.evidence).toMatchObject({
      bindingId: exactBindingId,
      assertionCheckId: driftCheck.id,
    })
  })

  it('persists a temporary failure without creating or clearing an assertion verdict', async () => {
    const attemptedAt = new Date('2026-08-31T03:00:00Z')
    const outcome = await fetchBackgroundSource(
      { sourceIdentity: binding.sourceIdentity, sourceKey: binding.sourceKey },
      {
        now: () => attemptedAt,
        fetchImplementation: async () => {
          throw new Error('temporary network failure')
        },
      },
    )
    expect(outcome.status).toBe('UNREACHABLE')
    const jobKey = backgroundFreshnessJobKey(attemptedAt, 'unreachable')
    const checks = await persistBackgroundSourceAttempt({ jobKey, group, outcome })
    expect(checks).toEqual([])

    const [fetchRow] = await db
      .select()
      .from(backgroundSourceFetches)
      .where(eq(backgroundSourceFetches.status, 'UNREACHABLE'))
    expect(fetchRow?.sourceSnapshotId).toBeNull()
    unreachableFetchId = fetchRow!.id
    const stale = await currentBackgroundDriftSummaries({ drugId, slug: drugId, background })
    expect(stale[0]?.assertionCheckId).toBe(driftCheck.id)
  })

  it('refuses to turn a failed fetch into an assertion check', async () => {
    await expect(
      db.insert(backgroundAssertionChecks).values({
        id: hash('illegal-failed-fetch-check'),
        bindingId: exactBindingId,
        bindingAssertionDigest: binding.assertionDigest,
        fetchId: unreachableFetchId,
        sourceId: driftCheck.sourceId,
        sourceKey: binding.sourceKey,
        sourceSnapshotId: driftCheck.sourceSnapshotId,
        fetchStatus: 'SUCCEEDED',
        result: 'DRIFTED',
        checkerVersion: BACKGROUND_ASSERTION_CHECKER_VERSION,
        details: { reason: 'must be rejected' },
      }),
    ).rejects.toThrow()
  })

  it('clears stale only after a later successful exact assertion check', async () => {
    const recovered = await persistAt(
      new Date('2026-08-31T04:00:00Z'),
      'The recorded amount is 10 mg.',
      'recovered',
    )
    expect(recovered.result).toBe('CURRENT')
    expect(await currentBackgroundDriftSummaries({ drugId, slug: drugId, background })).toEqual([])
  })

  it('never rewrites medical content and keeps freshness history append-only', async () => {
    const [medicine] = await db
      .select({ recordedBackground: drugs.recordedBackground })
      .from(drugs)
      .where(eq(drugs.id, drugId))
    expect(medicine?.recordedBackground).toEqual(background)

    await expect(
      db
        .update(backgroundSourceBindings)
        .set({ sourceLabel: 'Mutated label' })
        .where(eq(backgroundSourceBindings.id, exactBindingId)),
    ).rejects.toThrow()
    await expect(
      db.delete(backgroundAssertionChecks).where(eq(backgroundAssertionChecks.id, currentCheck.id)),
    ).rejects.toThrow()
  })

  it('records only hashes and metadata, not the fetched source body', async () => {
    const fetchRows = await db
      .select()
      .from(backgroundSourceFetches)
      .where(eq(backgroundSourceFetches.sourceKey, binding.sourceKey))
    expect(fetchRows.length).toBeGreaterThanOrEqual(4)
    expect(JSON.stringify(fetchRows)).not.toContain('The recorded amount')
    expect(BACKGROUND_SOURCE_FETCHER_VERSION).toBe('background-fetch/1.0.0')
  })
})

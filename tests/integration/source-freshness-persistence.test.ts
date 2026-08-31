import { createHash } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/db'
import {
  agentCurrentRuns,
  agentQueueDecisions,
  agentReviewCandidates,
  agentRunCandidates,
  backgroundAssertionChecks,
  backgroundSourceBindings,
  backgroundSourceFetches,
  drugs,
  evidenceSources,
  users,
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
  currentUnresolvedBackgroundDriftState,
  persistBackgroundDriftCandidateRun,
  persistBackgroundSourceAttempt,
  persistedBackgroundBindingId,
  recordedBackgroundDigest,
  type BackgroundSourceBindingGroup,
  type PersistedBackgroundAssertionCheck,
} from '@/lib/background/source-freshness'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import {
  getAgentReviewQueueDetail,
  listAgentReviewQueue,
  recordAgentReviewDecision,
} from '@/lib/queries/agent-review-queue'

const drugId = 'freshness-persistence-medicine'
const secondDrugId = 'freshness-persistence-second-medicine'
const reviewerId = 'freshness-persistence-reviewer'
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
          version: 'label-revision-7',
          effectiveDate: '2026-08-15',
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
let retryDriftCheck: PersistedBackgroundAssertionCheck
let unreachableFetchId: string
let exactBindingId: string
let driftOccurrenceKey: string
let secondBackground: MedicineRecordedBackground
let secondGroup: BackgroundSourceBindingGroup
let secondDriftCheck: PersistedBackgroundAssertionCheck
let secondDriftOccurrenceKey: string

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
  await db.insert(users).values({
    id: reviewerId,
    name: 'Freshness persistence reviewer',
    handle: 'freshness-persistence-reviewer',
    email: 'freshness-persistence-reviewer@example.test',
    passwordHash: 'unused-source-freshness-review-hash',
    trustTier: 'steward',
  })
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

    const persistedBindings = await db
      .select({
        sourceVersion: backgroundSourceBindings.sourceVersion,
        sourceEffectiveDate: backgroundSourceBindings.sourceEffectiveDate,
      })
      .from(backgroundSourceBindings)
      .where(eq(backgroundSourceBindings.id, exactBindingId))
    expect(persistedBindings).toEqual([
      { sourceVersion: 'label-revision-7', sourceEffectiveDate: '2026-08-15' },
    ])
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
    const activeDrift = await currentUnresolvedBackgroundDriftState()
    expect(activeDrift.checks.map((check) => check.id)).toEqual([driftCheck.id])
    const driftRun = {
      jobKey: backgroundFreshnessJobKey(new Date('2026-08-31T02:00:00Z'), 'drift-agent'),
      startedAt: new Date('2026-08-31T02:00:00Z'),
      checks: activeDrift.checks,
      recordsConsidered: activeDrift.currentBindingCount,
      currentEnvelopeDigest: activeDrift.currentEnvelopeDigest,
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
    driftOccurrenceKey = candidates[0]!.occurrenceKey
    expect(candidates[0]?.evidence).toMatchObject({
      schema: 'agent-decision-evidence/v1',
      evidenceIdentityVersion: '2',
      observation: {
        freshnessState: 'DRIFTED',
        recordedAssertion: { persistedBindingId: exactBindingId },
        confirmedSourceSnapshot: {
          sourceSnapshotId: driftCheck.sourceSnapshotId,
          sourceContentHash: driftCheck.sourceContentHash,
        },
      },
      sourceReadings: [
        expect.objectContaining({
          sourceKey: binding.sourceKey,
          excerpt: binding.excerpt,
          version: 'label-revision-7',
          effectiveDate: '2026-08-15',
          retrievedAt: binding.retrievedAt,
        }),
      ],
    })
    const memberships = await db
      .select()
      .from(agentRunCandidates)
      .where(eq(agentRunCandidates.occurrenceKey, driftOccurrenceKey))
    expect(memberships).toHaveLength(1)
    expect(memberships[0]).toMatchObject({
      evidenceDigest: candidates[0]?.evidenceDigest,
      audienceLane: 'ordinary',
      severity: 'high',
      rankingFeatures: expect.objectContaining({
        confirmedSourceDrift: true,
        occurrenceState: 'new',
        sourceChanged: true,
        detectorObservation: expect.objectContaining({ assertionCheckId: driftCheck.id }),
      }),
    })
    const currentPointers = await db
      .select()
      .from(agentCurrentRuns)
      .where(eq(agentCurrentRuns.agentName, 'source-drift-monitor'))
    expect(currentPointers).toHaveLength(1)

    const queue = await listAgentReviewQueue({ freshnessDrift: true })
    expect(queue.items.map((item) => item.occurrenceKey)).toContain(driftOccurrenceKey)
    const detail = await getAgentReviewQueueDetail(driftOccurrenceKey)
    expect(detail?.evidence.sourceReadings[0]).toMatchObject({
      excerpt: binding.excerpt,
      version: 'label-revision-7',
      effectiveDate: '2026-08-15',
    })
    await recordAgentReviewDecision({
      occurrenceKey: driftOccurrenceKey,
      evidenceDigest: candidates[0]!.evidenceDigest!,
      liveContextDigest: detail!.liveDecision.contextDigest,
      decision: 'NEEDS_MORE_EVIDENCE',
      explanation: 'The confirmed drift needs a human source review before any corpus change.',
      actorUserId: reviewerId,
    })
  })

  it('does not reopen an occurrence for a retry of the same exact drift artifact', async () => {
    const retry = await persistAt(
      new Date('2026-08-31T02:15:00Z'),
      'The recorded amount is 11 mg.',
      'same-drift-retry',
    )
    retryDriftCheck = retry
    expect(retry.result).toBe('DRIFTED')
    const activeDrift = await currentUnresolvedBackgroundDriftState()
    expect(activeDrift.checks[0]?.id).toBe(retry.id)
    await persistBackgroundDriftCandidateRun({
      jobKey: backgroundFreshnessJobKey(new Date('2026-08-31T02:15:00Z'), 'same-drift-retry-agent'),
      startedAt: new Date('2026-08-31T02:15:00Z'),
      checks: activeDrift.checks,
      recordsConsidered: activeDrift.currentBindingCount,
      currentEnvelopeDigest: activeDrift.currentEnvelopeDigest,
    })

    const candidates = await db
      .select()
      .from(agentReviewCandidates)
      .where(eq(agentReviewCandidates.subjectId, drugId))
    expect(candidates).toHaveLength(1)
    expect(candidates[0]?.occurrenceKey).toBe(driftOccurrenceKey)
    const [currentPointer] = await db
      .select({ runId: agentCurrentRuns.runId })
      .from(agentCurrentRuns)
      .where(eq(agentCurrentRuns.agentName, 'source-drift-monitor'))
    const currentMemberships = await db
      .select({ rankingFeatures: agentRunCandidates.rankingFeatures })
      .from(agentRunCandidates)
      .where(eq(agentRunCandidates.runId, currentPointer!.runId))
    expect(currentMemberships).toHaveLength(1)
    expect(currentMemberships[0]?.rankingFeatures).toMatchObject({
      occurrenceState: 'unchanged',
      detectorObservation: { assertionCheckId: retry.id },
    })
    expect((await listAgentReviewQueue()).items).toEqual([])
    expect((await listAgentReviewQueue({ state: 'decided' })).items[0]?.occurrenceKey).toBe(
      driftOccurrenceKey,
    )
    expect(await getAgentReviewQueueDetail(driftOccurrenceKey)).not.toBeNull()
  })

  it('activates every unresolved exact binding, not only one bounded fetch batch', async () => {
    secondBackground = {
      version: 'medicine-background/v1',
      authoredAt: '2026-08-31',
      mechanism: {
        statements: [
          {
            textAsRecorded: 'The second recorded amount is 20 mg.',
            source: {
              kind: 'FDA_LABEL',
              identifier: 'FRESHNESS-SECOND-SET',
              label: 'Second freshness persistence label',
              locator: 'section 2',
              retrievedAt: '2026-08-30',
              excerpt: 'The second recorded amount is 20 mg.',
            },
          },
        ],
      },
    }
    await db.insert(drugs).values({
      id: secondDrugId,
      slug: secondDrugId,
      name: 'Second freshness persistence medicine',
      sponsor: 'Test sponsor',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 'Test indication',
      recordedBackground: secondBackground,
    })
    const [secondBinding] = collectBackgroundSourceAssertionBindings(secondDrugId, secondBackground)
    secondGroup = {
      sourceKey: secondBinding!.sourceKey,
      sourceIdentity: secondBinding!.sourceIdentity,
      bindings: [
        {
          drugId: secondDrugId,
          recordedBackgroundDigest: recordedBackgroundDigest(secondBackground),
          binding: secondBinding!,
        },
      ],
    }
    const attemptedAt = new Date('2026-08-31T02:30:00Z')
    const secondOutcome = await fetchBackgroundSource(
      { sourceIdentity: secondBinding!.sourceIdentity, sourceKey: secondBinding!.sourceKey },
      {
        now: () => attemptedAt,
        fetchImplementation: async () =>
          new Response(JSON.stringify({ section: 'The second recorded amount is 21 mg.' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      },
    )
    const secondChecks = await persistBackgroundSourceAttempt({
      jobKey: backgroundFreshnessJobKey(attemptedAt, 'second-drift'),
      group: secondGroup,
      outcome: secondOutcome,
    })
    secondDriftCheck = secondChecks[0]!
    expect(secondDriftCheck.result).toBe('DRIFTED')

    const completeState = await currentUnresolvedBackgroundDriftState()
    expect(completeState.checks.map((check) => check.persistedBindingId).sort()).toEqual(
      [retryDriftCheck.persistedBindingId, secondDriftCheck.persistedBindingId].sort(),
    )
    expect(
      await persistBackgroundDriftCandidateRun({
        jobKey: backgroundFreshnessJobKey(attemptedAt, 'complete-two-drift-state'),
        startedAt: attemptedAt,
        checks: completeState.checks,
        recordsConsidered: completeState.currentBindingCount,
        currentEnvelopeDigest: completeState.currentEnvelopeDigest,
      }),
    ).toBe(2)

    const [pointer] = await db
      .select({ runId: agentCurrentRuns.runId })
      .from(agentCurrentRuns)
      .where(eq(agentCurrentRuns.agentName, 'source-drift-monitor'))
    const activeMembership = await db
      .select({
        occurrenceKey: agentRunCandidates.occurrenceKey,
        rankingFeatures: agentRunCandidates.rankingFeatures,
      })
      .from(agentRunCandidates)
      .where(eq(agentRunCandidates.runId, pointer!.runId))
    expect(activeMembership).toHaveLength(2)
    expect(
      activeMembership.map((membership) => membership.rankingFeatures.occurrenceState).sort(),
    ).toEqual(['new', 'unchanged'])
    const secondCandidates = await db
      .select({ occurrenceKey: agentReviewCandidates.occurrenceKey })
      .from(agentReviewCandidates)
      .where(eq(agentReviewCandidates.subjectId, secondDrugId))
    secondDriftOccurrenceKey = secondCandidates[0]!.occurrenceKey
    expect(await getAgentReviewQueueDetail(driftOccurrenceKey)).not.toBeNull()
    expect(await getAgentReviewQueueDetail(secondDriftOccurrenceKey)).not.toBeNull()
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
    expect(stale[0]?.assertionCheckId).toBe(retryDriftCheck.id)

    const activeDrift = await currentUnresolvedBackgroundDriftState()
    expect(activeDrift.checks[0]?.id).toBe(retryDriftCheck.id)
    await persistBackgroundDriftCandidateRun({
      jobKey: backgroundFreshnessJobKey(attemptedAt, 'unreachable-agent-state'),
      startedAt: attemptedAt,
      checks: activeDrift.checks,
      recordsConsidered: activeDrift.currentBindingCount,
      currentEnvelopeDigest: activeDrift.currentEnvelopeDigest,
    })
    expect(await getAgentReviewQueueDetail(driftOccurrenceKey)).not.toBeNull()
    expect((await listAgentReviewQueue({ state: 'decided' })).items[0]?.occurrenceKey).toBe(
      driftOccurrenceKey,
    )
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

    const oneRemainingDrift = await currentUnresolvedBackgroundDriftState()
    expect(oneRemainingDrift.checks.map((check) => check.persistedBindingId)).toEqual([
      secondDriftCheck.persistedBindingId,
    ])
    expect(
      await persistBackgroundDriftCandidateRun({
        jobKey: backgroundFreshnessJobKey(new Date('2026-08-31T04:00:00Z'), 'first-recovery-state'),
        startedAt: new Date('2026-08-31T04:00:00Z'),
        checks: oneRemainingDrift.checks,
        recordsConsidered: oneRemainingDrift.currentBindingCount,
        currentEnvelopeDigest: oneRemainingDrift.currentEnvelopeDigest,
      }),
    ).toBe(1)
    expect(await getAgentReviewQueueDetail(driftOccurrenceKey)).toBeNull()
    expect(await getAgentReviewQueueDetail(secondDriftOccurrenceKey)).not.toBeNull()
    expect(
      await db
        .select({ id: agentQueueDecisions.id })
        .from(agentQueueDecisions)
        .where(eq(agentQueueDecisions.occurrenceKey, driftOccurrenceKey)),
    ).toHaveLength(1)

    const secondRecoveredAt = new Date('2026-08-31T04:30:00Z')
    const secondBinding = secondGroup.bindings[0]!.binding
    const secondRecoveredOutcome = await fetchBackgroundSource(
      {
        sourceIdentity: secondGroup.sourceIdentity,
        sourceKey: secondGroup.sourceKey,
      },
      {
        now: () => secondRecoveredAt,
        fetchImplementation: async () =>
          new Response(JSON.stringify({ section: 'The second recorded amount is 20 mg.' }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      },
    )
    const secondRecoveredChecks = await persistBackgroundSourceAttempt({
      jobKey: backgroundFreshnessJobKey(secondRecoveredAt, 'second-recovered'),
      group: secondGroup,
      outcome: secondRecoveredOutcome,
    })
    expect(secondRecoveredChecks).toHaveLength(1)
    expect(secondRecoveredChecks[0]).toMatchObject({
      persistedBindingId: persistedBackgroundBindingId(secondGroup.bindings[0]!),
      result: 'CURRENT',
      binding: { binding: { assertionDigest: secondBinding.assertionDigest } },
    })

    const noRemainingDrift = await currentUnresolvedBackgroundDriftState()
    expect(noRemainingDrift.checks).toEqual([])
    expect(
      await persistBackgroundDriftCandidateRun({
        jobKey: backgroundFreshnessJobKey(secondRecoveredAt, 'all-recovered-state'),
        startedAt: secondRecoveredAt,
        checks: noRemainingDrift.checks,
        recordsConsidered: noRemainingDrift.currentBindingCount,
        currentEnvelopeDigest: noRemainingDrift.currentEnvelopeDigest,
      }),
    ).toBe(0)

    const [emptyPointer] = await db
      .select({ runId: agentCurrentRuns.runId })
      .from(agentCurrentRuns)
      .where(eq(agentCurrentRuns.agentName, 'source-drift-monitor'))
    expect(
      await db
        .select({ occurrenceKey: agentRunCandidates.occurrenceKey })
        .from(agentRunCandidates)
        .where(eq(agentRunCandidates.runId, emptyPointer!.runId)),
    ).toEqual([])
    expect(await getAgentReviewQueueDetail(secondDriftOccurrenceKey)).toBeNull()
    expect(
      await db
        .select({ occurrenceKey: agentReviewCandidates.occurrenceKey })
        .from(agentReviewCandidates)
        .where(eq(agentReviewCandidates.occurrenceKey, secondDriftOccurrenceKey)),
    ).toHaveLength(1)
    expect(
      await currentBackgroundDriftSummaries({
        drugId: secondDrugId,
        slug: secondDrugId,
        background: secondBackground,
      }),
    ).toEqual([])
  })

  it('never rewrites medical content and keeps freshness history append-only', async () => {
    const [medicine] = await db
      .select({ recordedBackground: drugs.recordedBackground })
      .from(drugs)
      .where(eq(drugs.id, drugId))
    expect(medicine?.recordedBackground).toEqual(background)
    const [secondMedicine] = await db
      .select({ recordedBackground: drugs.recordedBackground })
      .from(drugs)
      .where(eq(drugs.id, secondDrugId))
    expect(secondMedicine?.recordedBackground).toEqual(secondBackground)

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

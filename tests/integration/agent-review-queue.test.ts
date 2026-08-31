import { createHash } from 'node:crypto'

import { eq } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { closeDatabasePool, db } from '@/db'
import {
  agentCurrentRuns,
  agentQueueDecisions,
  agentReviewCandidates,
  agentRunCandidates,
  agentRuns,
  drugs,
  users,
} from '@/db/schema'
import { valueDigest } from '@/lib/agents/core/identity'
import { buildAgentLiveDecisionContext } from '@/lib/agents/core/live-decision-context'
import {
  getAgentReviewQueueDetail,
  listAgentReviewQueue,
  recordAgentReviewDecision,
} from '@/lib/queries/agent-review-queue'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'
const RUN = Math.random().toString(36).slice(2, 10)

function digest(label: string): string {
  return createHash('sha256').update(`${RUN}:${label}`).digest('hex')
}

const agentName = `review-workbench-${RUN}`
const drugId = `drg_review_${RUN}`
const drugSlug = `review-workbench-${RUN}`
const oldRunId = digest('old-run')
const currentRunId = digest('current-run')
const candidateKey = digest('candidate')
const oldOccurrenceKey = digest('old-occurrence')
const currentOccurrenceKey = digest('current-occurrence')
const oldEvidenceDigest = digest('old-evidence')
const currentEvidenceDigest = digest('current-evidence')
const currentSourceReadings = [
  {
    sourceKey: 'FDA_LABEL:review-current',
    kind: 'FDA_LABEL',
    identifier: 'review-current',
    label: 'Current exact label',
    locator: 'section 12.3',
    retrievedAt: '2026-08-31',
    excerpt: 'The exact recorded estimate is 10 hours.',
  },
  {
    sourceKey: 'PUBMED:12345678',
    kind: 'PUBMED',
    identifier: '12345678',
    label: 'Exact publication reading',
    retrievedAt: '2026-08-30',
    excerpt: 'The comparison estimate was 12 hours.',
  },
] as const
const oldSourceReadings = [{ ...currentSourceReadings[0]!, excerpt: 'Earlier: 9 hours.' }]
const currentEvidence = {
  schema: 'agent-decision-evidence/v1',
  agent: agentName,
  agentVersion: '1.1.0',
  reasonSchemaVersion: '1',
  observation: {
    estimate: 10,
    unit: 'hours',
    dispersion: 2,
    comparison: { estimate: 12, unit: 'hours' },
  },
  sourceReadings: currentSourceReadings,
}
const currentRecordedBackground = {
  version: 'medicine-background/v1' as const,
  authoredAt: '2026-08-31',
  pharmacokinetics: {
    routeAsRecorded: 'oral',
    halfLife: {
      display: '10 hours',
      numeric: 10,
      unit: 'hours',
      populationContext: 'review workbench integration fixture',
      source: {
        kind: 'FDA_LABEL' as const,
        identifier: 'review-current',
        label: 'Current exact label',
        locator: 'section 12.3',
        retrievedAt: '2026-08-31',
        excerpt: 'The exact recorded estimate is 10 hours.',
      },
      concordance: 'discrepant' as const,
      alternateValue: {
        display: '12 hours',
        source: {
          kind: 'PUBMED' as const,
          identifier: '12345678',
          label: 'Exact publication reading',
          retrievedAt: '2026-08-30',
          excerpt: 'The comparison estimate was 12 hours.',
        },
      },
    },
  },
}

const stewardId = `usr_review_${RUN}_steward`
const adminId = `usr_review_${RUN}_admin`
const trustedId = `usr_review_${RUN}_trusted`

async function createAccount(input: {
  id: string
  label: string
  trustTier: 'trusted' | 'steward' | 'new'
  isAdmin?: boolean
}) {
  await db.insert(users).values({
    id: input.id,
    name: `Review ${input.label}`,
    handle: `review-${RUN}-${input.label}`,
    email: `${RUN}-${input.label}@review.test`,
    passwordHash: 'unused-agent-review-integration-hash',
    trustTier: input.trustTier,
    isAdmin: input.isAdmin ?? false,
  })
}

async function liveContextDigest(): Promise<string> {
  const detail = await getAgentReviewQueueDetail(currentOccurrenceKey)
  if (!detail) throw new Error('Expected the current review occurrence fixture')
  return detail.liveDecision.contextDigest
}

describe.skipIf(!runsInDisposableDatabase)('agent evidence review queue', () => {
  beforeAll(async () => {
    await Promise.all([
      createAccount({ id: stewardId, label: 'steward', trustTier: 'steward' }),
      createAccount({ id: adminId, label: 'admin', trustTier: 'new', isAdmin: true }),
      createAccount({ id: trustedId, label: 'trusted', trustTier: 'trusted' }),
    ])
    await db.insert(drugs).values({
      id: drugId,
      slug: drugSlug,
      name: `Review workbench medicine ${RUN}`,
      sponsor: 'Unchanged test sponsor',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 'Unchanged test indication',
      recordedBackground: currentRecordedBackground,
    })
    await db.insert(agentRuns).values([
      {
        id: oldRunId,
        agentName,
        agentVersion: '1.0.0',
        reasonSchemaVersion: '1',
        corpusVersion: digest('old-corpus'),
        inputDigest: digest('old-input'),
        outputDigest: digest('old-output'),
        runDate: '2026-08-30',
        seed: 1,
        recordsConsidered: 1,
        recordsUsed: 1,
        candidatesEmitted: 1,
        status: 'COMPLETED',
      },
      {
        id: currentRunId,
        agentName,
        agentVersion: '1.1.0',
        reasonSchemaVersion: '1',
        corpusVersion: digest('current-corpus'),
        inputDigest: digest('current-input'),
        outputDigest: digest('current-output'),
        runDate: '2026-09-01',
        seed: 1,
        recordsConsidered: 1,
        recordsUsed: 1,
        candidatesEmitted: 1,
        status: 'COMPLETED',
      },
    ])
    await db.insert(agentReviewCandidates).values([
      {
        id: oldOccurrenceKey,
        candidateKey,
        occurrenceKey: oldOccurrenceKey,
        runId: oldRunId,
        agentName,
        subjectType: 'medicine',
        subjectId: drugSlug,
        fieldPath: 'pharmacokinetics.halfLife',
        reason: 'POSSIBLE_DUPLICATE_SUBSTANCE',
        priority: '0.4',
        basis: 'Earlier deterministic basis.',
        question: 'Does the earlier exact evidence support this recorded observation?',
        evidence: {
          schema: 'agent-decision-evidence/v1',
          observation: { estimate: 9, unit: 'hours' },
          sourceReadings: oldSourceReadings,
        },
        evidenceDigest: oldEvidenceDigest,
        sourceSnapshotDigests: oldSourceReadings.map(valueDigest),
        sourceIds: [oldSourceReadings[0]!.sourceKey],
        audienceLane: 'quantitative',
        severity: 'medium',
        provenanceTier: 'transcribed',
        agentVersion: '1.0.0',
        reasonSchemaVersion: '1',
        firstSeenAt: new Date('2026-08-30T00:00:00.000Z'),
        lastSeenAt: new Date('2026-08-30T00:00:00.000Z'),
      },
      {
        id: currentOccurrenceKey,
        candidateKey,
        occurrenceKey: currentOccurrenceKey,
        runId: currentRunId,
        agentName,
        subjectType: 'medicine',
        subjectId: drugSlug,
        fieldPath: 'pharmacokinetics.halfLife',
        reason: 'POSSIBLE_DUPLICATE_SUBSTANCE',
        priority: '0.9',
        basis: 'Current deterministic agent basis.',
        question: 'Does the exact evidence support this current recorded observation?',
        evidence: currentEvidence,
        evidenceDigest: currentEvidenceDigest,
        sourceSnapshotDigests: currentSourceReadings.map(valueDigest).sort(),
        // Deliberately narrower than the canonical evidence, as some agents use an anchor source.
        sourceIds: [currentSourceReadings[0]!.sourceKey],
        audienceLane: 'quantitative',
        severity: 'high',
        provenanceTier: 'transcribed',
        agentVersion: '1.1.0',
        reasonSchemaVersion: '1',
        firstSeenAt: new Date('2026-09-01T00:00:00.000Z'),
        lastSeenAt: new Date('2026-09-01T00:00:00.000Z'),
      },
    ])
    const rankingFeatures = {
      schema: 'agent-ranking-features/v1',
      agentPriority: 0.9,
      publicVisibility: false,
      severityWeight: 3,
      deterministicBlock: false,
      confirmedSourceDrift: true,
      sourceDisagreement: true,
      highValueCoverageGap: true,
      occurrenceState: 'reopened',
      changedOccurrence: true,
      sourceChanged: true,
      neverReviewed: true,
      calibration: 'INSUFFICIENT_REVIEW_HISTORY',
      detectorObservation: { estimate: 10, comparisonEstimate: 12 },
      ...(() => {
        const liveContext = buildAgentLiveDecisionContext({
          candidateKey,
          occurrenceKey: currentOccurrenceKey,
          evidenceDigest: currentEvidenceDigest,
          subjectId: drugSlug,
          fieldPath: 'pharmacokinetics.halfLife',
          evidence: currentEvidence,
          medicines: [{ slug: drugSlug, recordedBackground: currentRecordedBackground }],
        })
        return {
          liveDecisionContextDigest: liveContext.digest,
          liveStoredFieldState: liveContext.storedField.state,
          liveSourceBindingsComplete: liveContext.allSourcesBound,
        }
      })(),
    }
    await db.insert(agentRunCandidates).values([
      {
        runId: oldRunId,
        candidateKey,
        occurrenceKey: oldOccurrenceKey,
        priority: '0.4',
        basis: 'Earlier deterministic basis.',
        question: 'Does the earlier exact evidence support this recorded observation?',
        evidenceDigest: oldEvidenceDigest,
        audienceLane: 'quantitative',
        severity: 'medium',
        provenanceTier: 'transcribed',
        rankingFeatures: {
          ...rankingFeatures,
          agentPriority: 0.4,
          changedOccurrence: false,
          occurrenceState: 'new',
        },
      },
      {
        runId: currentRunId,
        candidateKey,
        occurrenceKey: currentOccurrenceKey,
        priority: '0.9',
        basis: 'Current deterministic agent basis.',
        question: 'Does the exact evidence support this current recorded observation?',
        evidenceDigest: currentEvidenceDigest,
        audienceLane: 'quantitative',
        severity: 'high',
        provenanceTier: 'transcribed',
        rankingFeatures,
      },
    ])
    await db.insert(agentCurrentRuns).values({ agentName, runId: currentRunId })
    await db.insert(agentQueueDecisions).values({
      id: digest('old-decision'),
      candidateKey,
      occurrenceKey: oldOccurrenceKey,
      decidedByUserId: stewardId,
      decision: 'NEEDS_MORE_EVIDENCE',
      explanation: 'The earlier evidence did not settle the exact question.',
      evidenceDigest: oldEvidenceDigest,
      decidedAt: new Date('2026-08-31T00:00:00.000Z'),
    })
  })

  afterAll(async () => {
    await closeDatabasePool()
  })

  it('projects only current membership with exact evidence breadth, history and ranking context', async () => {
    const list = await listAgentReviewQueue({ agent: agentName })
    expect(list.items).toHaveLength(1)
    expect(list.items[0]).toMatchObject({
      occurrenceKey: currentOccurrenceKey,
      sourceCount: 2,
      evidenceChanged: true,
      state: 'EVIDENCE_CHANGED',
      calibrationMessage: 'Not enough review history to calibrate this reason.',
      severity: 'high',
      lane: 'quantitative',
      provenanceTier: 'transcribed',
      occurrenceState: 'reopened',
    })
    expect(list.items[0]?.scoreExplanation).toContain('confirmedSourceDrift=true')
    expect(list.items[0]?.scoreExplanation).toContain('detectorObservation=')

    const fullyFiltered = await listAgentReviewQueue({
      agent: agentName,
      provenanceTier: 'transcribed',
      occurrenceState: 'reopened',
      sourceChanged: true,
      conflict: true,
      freshnessDrift: true,
      coverageGap: true,
      chemistryIdentity: true,
      quantitativeIntegrity: true,
    })
    expect(fullyFiltered.items.map((item) => item.occurrenceKey)).toEqual([currentOccurrenceKey])
    expect(
      (await listAgentReviewQueue({ agent: agentName, occurrenceState: 'new' })).items,
    ).toEqual([])
    expect(
      (await listAgentReviewQueue({ agent: agentName, occurrenceState: 'unchanged' })).items,
    ).toEqual([])

    const detail = await getAgentReviewQueueDetail(currentOccurrenceKey)
    expect(detail).toMatchObject({
      occurrenceKey: currentOccurrenceKey,
      evidence: {
        observation: {
          estimate: 10,
          unit: 'hours',
          dispersion: 2,
          comparison: { estimate: 12, unit: 'hours' },
        },
      },
      priorOccurrences: [{ occurrenceKey: oldOccurrenceKey }],
    })
    expect(detail?.evidence.sourceReadings).toEqual(currentSourceReadings)
    expect(detail?.evidence.sourceMetadata).toEqual([
      { version: null, effectiveDate: null },
      { version: null, effectiveDate: null },
    ])
    expect(detail?.evidence.sourceLinks).toEqual([
      expect.stringContaining('api.fda.gov/drug/label.json'),
      expect.stringContaining('eutils.ncbi.nlm.nih.gov'),
    ])
    expect(detail?.liveDecision).toMatchObject({
      ready: true,
      storedField: {
        state: 'present',
        value: { display: '10 hours', numeric: 10, unit: 'hours' },
      },
      allSourcesBound: true,
    })
    expect(detail?.liveDecision.sourceBindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          matches: expect.arrayContaining([
            expect.objectContaining({
              medicineSlug: drugSlug,
              path: expect.stringContaining('pharmacokinetics.halfLife'),
            }),
          ]),
        }),
      ]),
    )
    expect(detail?.decisions[0]).toMatchObject({ occurrenceKey: oldOccurrenceKey })
  })

  it('independently authorizes writes and appends all four outcomes, including reversals', async () => {
    expect(
      (
        await listAgentReviewQueue({
          agent: agentName,
          state: 'evidence_changed',
          occurrenceState: 'reopened',
        })
      ).items.map((item) => item.occurrenceKey),
    ).toEqual([currentOccurrenceKey])

    const currentLiveContextDigest = await liveContextDigest()
    await expect(
      recordAgentReviewDecision({
        occurrenceKey: currentOccurrenceKey,
        evidenceDigest: currentEvidenceDigest,
        liveContextDigest: currentLiveContextDigest,
        decision: 'NOT_A_PROBLEM',
        explanation: 'A missing account cannot act as an anonymous reviewer.',
        actorUserId: `usr_review_${RUN}_missing`,
      }),
    ).rejects.toMatchObject({ code: 'not_authorized' })

    await expect(
      recordAgentReviewDecision({
        occurrenceKey: currentOccurrenceKey,
        evidenceDigest: currentEvidenceDigest,
        liveContextDigest: currentLiveContextDigest,
        decision: 'NOT_A_PROBLEM',
        explanation: 'A trusted account is not an agent reviewer.',
        actorUserId: trustedId,
      }),
    ).rejects.toMatchObject({ code: 'not_authorized' })

    const [beforeMedicine] = await db.select().from(drugs).where(eq(drugs.id, drugId))
    expect(beforeMedicine).toBeDefined()

    const before = new Date()
    const decisions = await Promise.all(
      (
        [
          ['CORRECTION_NEEDED', stewardId],
          ['NOT_A_PROBLEM', adminId],
          ['CONFIRMED_AS_RECORDED', stewardId],
          ['NEEDS_MORE_EVIDENCE', adminId],
        ] as const
      ).map(async ([decision, actorUserId], index) =>
        recordAgentReviewDecision({
          occurrenceKey: currentOccurrenceKey,
          evidenceDigest: currentEvidenceDigest,
          liveContextDigest: currentLiveContextDigest,
          decision,
          explanation: `Exact review event ${index + 1}; later events may reverse this one.`,
          actorUserId,
        }),
      ),
    )

    expect(new Set(decisions.map((decision) => decision.decision))).toEqual(
      new Set([
        'CORRECTION_NEEDED',
        'NOT_A_PROBLEM',
        'CONFIRMED_AS_RECORDED',
        'NEEDS_MORE_EVIDENCE',
      ]),
    )
    for (const decision of decisions) {
      expect(new Date(decision.decidedAt).getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000)
    }

    const confirmedBeforeReversal = await recordAgentReviewDecision({
      occurrenceKey: currentOccurrenceKey,
      evidenceDigest: currentEvidenceDigest,
      liveContextDigest: currentLiveContextDigest,
      decision: 'CONFIRMED_AS_RECORDED',
      explanation: 'The exact evidence was initially accepted after focused review.',
      actorUserId: stewardId,
    })
    const reversal = await recordAgentReviewDecision({
      occurrenceKey: currentOccurrenceKey,
      evidenceDigest: currentEvidenceDigest,
      liveContextDigest: currentLiveContextDigest,
      decision: 'CORRECTION_NEEDED',
      explanation: 'A later review reverses that outcome while preserving both events.',
      actorUserId: adminId,
    })
    expect(reversal.id).not.toBe(confirmedBeforeReversal.id)

    const retainedDecisionIds = new Set(
      (
        await db
          .select({ id: agentQueueDecisions.id })
          .from(agentQueueDecisions)
          .where(eq(agentQueueDecisions.occurrenceKey, currentOccurrenceKey))
      ).map(({ id }) => id),
    )
    expect(retainedDecisionIds).toEqual(
      new Set([...decisions.map(({ id }) => id), confirmedBeforeReversal.id, reversal.id]),
    )

    const [afterMedicine] = await db.select().from(drugs).where(eq(drugs.id, drugId))
    expect(afterMedicine).toEqual(beforeMedicine)

    // Exact decided occurrences leave the default work list but remain reachable for history and reversal.
    expect((await listAgentReviewQueue({ agent: agentName })).items).toEqual([])
    expect(
      (
        await listAgentReviewQueue({
          agent: agentName,
          state: 'evidence_changed',
          occurrenceState: 'reopened',
        })
      ).items,
    ).toEqual([])
    const decided = await listAgentReviewQueue({ agent: agentName, state: 'decided' })
    expect(decided.items.map((item) => item.occurrenceKey)).toEqual([currentOccurrenceKey])
    expect(decided.items[0]).toMatchObject({
      occurrenceState: 'reopened',
      evidenceChanged: true,
      state: 'DECIDED',
    })
    const detail = await getAgentReviewQueueDetail(currentOccurrenceKey)
    expect(
      detail?.decisions.filter((decision) => decision.occurrenceKey === currentOccurrenceKey),
    ).toHaveLength(6)
  })

  it('paginates decision history without silently dropping older append-only events', async () => {
    const existing = await db
      .select({ id: agentQueueDecisions.id })
      .from(agentQueueDecisions)
      .where(eq(agentQueueDecisions.candidateKey, candidateKey))
    const extraEvents = Array.from({ length: 51 }, (_, index) => ({
      id: digest(`pagination-decision-${index}`),
      candidateKey,
      occurrenceKey: currentOccurrenceKey,
      decidedByUserId: stewardId,
      decision: 'NEEDS_MORE_EVIDENCE' as const,
      explanation: `Pagination fixture event ${index + 1}.`,
      evidenceDigest: currentEvidenceDigest,
      decidedAt: new Date(Date.UTC(2026, 8, 2, 0, 0, 0, index)),
    }))
    await db.insert(agentQueueDecisions).values(extraEvents)

    const firstPage = await getAgentReviewQueueDetail(currentOccurrenceKey)
    expect(firstPage?.decisions).toHaveLength(50)
    expect(firstPage?.historyPagination.decisions).toEqual({
      offset: 0,
      limit: 50,
      hasMore: true,
    })

    const olderPage = await getAgentReviewQueueDetail(currentOccurrenceKey, {
      decisionOffset: 50,
    })
    expect(olderPage?.decisions).toHaveLength(existing.length + extraEvents.length - 50)
    expect(olderPage?.historyPagination.decisions).toEqual({
      offset: 50,
      limit: 50,
      hasMore: false,
    })
  })

  it('rejects stale occurrence and evidence submissions with typed conflicts', async () => {
    const currentLiveContextDigest = await liveContextDigest()
    await expect(
      recordAgentReviewDecision({
        occurrenceKey: oldOccurrenceKey,
        evidenceDigest: oldEvidenceDigest,
        liveContextDigest: currentLiveContextDigest,
        decision: 'NOT_A_PROBLEM',
        explanation: 'This occurrence is no longer in the current run.',
        actorUserId: stewardId,
      }),
    ).rejects.toMatchObject({ code: 'stale_occurrence' })
    await expect(
      recordAgentReviewDecision({
        occurrenceKey: currentOccurrenceKey,
        evidenceDigest: digest('wrong-current-evidence'),
        liveContextDigest: currentLiveContextDigest,
        decision: 'NOT_A_PROBLEM',
        explanation: 'The submitted digest is intentionally stale.',
        actorUserId: stewardId,
      }),
    ).rejects.toMatchObject({ code: 'stale_evidence' })
  })

  it('rejects a decision after the exact live value or source binding changes', async () => {
    const before = await getAgentReviewQueueDetail(currentOccurrenceKey)
    expect(before?.liveDecision.ready).toBe(true)
    const submittedDigest = before!.liveDecision.contextDigest

    try {
      await db
        .update(drugs)
        .set({
          recordedBackground: {
            ...currentRecordedBackground,
            pharmacokinetics: {
              ...currentRecordedBackground.pharmacokinetics,
              halfLife: {
                ...currentRecordedBackground.pharmacokinetics.halfLife,
                display: '11 hours',
                numeric: 11,
              },
            },
          },
        })
        .where(eq(drugs.id, drugId))

      await expect(
        recordAgentReviewDecision({
          occurrenceKey: currentOccurrenceKey,
          evidenceDigest: currentEvidenceDigest,
          liveContextDigest: submittedDigest,
          decision: 'NOT_A_PROBLEM',
          explanation: 'The browser snapshot predates the exact stored value change.',
          actorUserId: stewardId,
        }),
      ).rejects.toMatchObject({ code: 'stale_evidence' })
      const changedValueDetail = await getAgentReviewQueueDetail(currentOccurrenceKey)
      expect(changedValueDetail?.liveDecision).toMatchObject({
        ready: false,
        staleReason: 'stored_value_or_source_changed',
        storedField: { state: 'present', value: { display: '11 hours', numeric: 11 } },
      })
      await expect(
        recordAgentReviewDecision({
          occurrenceKey: currentOccurrenceKey,
          evidenceDigest: currentEvidenceDigest,
          liveContextDigest: changedValueDetail!.liveDecision.contextDigest,
          decision: 'NOT_A_PROBLEM',
          explanation: 'A reload cannot bypass the immutable imported baseline.',
          actorUserId: stewardId,
        }),
      ).rejects.toMatchObject({ code: 'stale_evidence' })

      await db
        .update(drugs)
        .set({
          recordedBackground: {
            ...currentRecordedBackground,
            pharmacokinetics: {
              ...currentRecordedBackground.pharmacokinetics,
              halfLife: {
                ...currentRecordedBackground.pharmacokinetics.halfLife,
                source: {
                  ...currentRecordedBackground.pharmacokinetics.halfLife.source,
                  excerpt: 'The exact recorded estimate is now 11 hours.',
                },
              },
            },
          },
        })
        .where(eq(drugs.id, drugId))
      const changedSourceDetail = await getAgentReviewQueueDetail(currentOccurrenceKey)
      expect(changedSourceDetail?.liveDecision).toMatchObject({
        ready: false,
        staleReason: 'source_binding_missing',
        allSourcesBound: false,
      })
      await expect(
        recordAgentReviewDecision({
          occurrenceKey: currentOccurrenceKey,
          evidenceDigest: currentEvidenceDigest,
          liveContextDigest: changedSourceDetail!.liveDecision.contextDigest,
          decision: 'NEEDS_MORE_EVIDENCE',
          explanation: 'The exact source excerpt no longer binds to the candidate evidence.',
          actorUserId: adminId,
        }),
      ).rejects.toMatchObject({ code: 'stale_evidence' })
    } finally {
      await db
        .update(drugs)
        .set({ recordedBackground: currentRecordedBackground })
        .where(eq(drugs.id, drugId))
    }

    expect((await getAgentReviewQueueDetail(currentOccurrenceKey))?.liveDecision.ready).toBe(true)
  })

  it('keeps decisions append-only and never mutates medical content', async () => {
    const [beforeMedicine] = await db
      .select({
        name: drugs.name,
        indication: drugs.indication,
        background: drugs.recordedBackground,
      })
      .from(drugs)
      .where(eq(drugs.id, drugId))
    const [decision] = await db
      .select({ id: agentQueueDecisions.id })
      .from(agentQueueDecisions)
      .where(eq(agentQueueDecisions.occurrenceKey, currentOccurrenceKey))
    expect(decision).toBeDefined()

    await expect(
      db
        .update(agentQueueDecisions)
        .set({ explanation: 'An update must be rejected.' })
        .where(eq(agentQueueDecisions.id, decision!.id)),
    ).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/immutable append-only agent-memory record/u) },
    })
    await expect(
      db.delete(agentQueueDecisions).where(eq(agentQueueDecisions.id, decision!.id)),
    ).rejects.toMatchObject({
      cause: { message: expect.stringMatching(/immutable append-only agent-memory record/u) },
    })

    const [afterMedicine] = await db
      .select({
        name: drugs.name,
        indication: drugs.indication,
        background: drugs.recordedBackground,
      })
      .from(drugs)
      .where(eq(drugs.id, drugId))
    expect(afterMedicine).toEqual(beforeMedicine)
  })
})

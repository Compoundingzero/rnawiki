import { describe, expect, it } from 'vitest'

import type { ReviewCandidate } from '@/lib/agents/core/types'
import { prepareCurrentRunForImport } from '@/lib/agents/persistence'
import type {
  CurrentAgentManifest,
  CurrentAgentManifestEntry,
  CurrentAgentRunArtifact,
} from '@/scripts/agents/current-run'
import { validateQueueSelectionContract } from '@/scripts/agents/current-run'

const SOURCE = {
  sourceKey: 'FDA_LABEL:label-1',
  kind: 'FDA_LABEL' as const,
  identifier: 'label-1',
  label: 'FDA label',
  retrievedAt: '2026-08-30T00:00:00.000Z',
  excerpt: 'The recorded value is 10 hours.',
}

const RECORDED_VALUE = { display: '10 hours', numeric: 10, unit: 'hours' }

function candidate(overrides: Partial<ReviewCandidate> = {}): ReviewCandidate {
  return {
    slug: 'example-medicine',
    fieldPath: 'pharmacokinetics.halfLife',
    reason: 'UNUSUAL_FOR_PEER_GROUP',
    question: 'Does the fetched excerpt state this recorded value?',
    priority: 0.9,
    basis: 'A deterministic score over recorded values.',
    sources: [SOURCE.sourceKey],
    evidence: {
      schema: 'agent-review-evidence/v2',
      observation: { recordedValue: RECORDED_VALUE },
      identityObservation: { recordedValue: RECORDED_VALUE },
      sourceReadings: [SOURCE],
    },
    ...overrides,
  }
}

function fixture(overrides?: {
  candidate?: Partial<ReviewCandidate>
  agentVersion?: string
  evidenceIdentityVersion?: string
  reasonSchemaVersion?: string
  historical?: boolean
  allowZero?: boolean
  corpusDigest?: string
}): {
  manifest: CurrentAgentManifest
  manifestEntry: CurrentAgentManifestEntry
  artifact: CurrentAgentRunArtifact
} {
  const reviewCandidate = candidate(overrides?.candidate)
  const agentVersion = overrides?.agentVersion ?? '1.0.0'
  const reasonSchemaVersion = overrides?.reasonSchemaVersion ?? '1'
  const evidenceIdentityVersion = overrides?.evidenceIdentityVersion ?? '1'
  const historical = overrides?.historical ?? false
  const queue = overrides?.allowZero ? [] : [reviewCandidate]
  const manifestEntry: CurrentAgentManifestEntry = {
    agentId: 'test-agent',
    agentVersion,
    reasonSchemaVersion,
    evidenceIdentityVersion,
    path: 'data/agents/current/test-agent.json',
    dependencies: ['recorded-background'],
    sourceRequirements: ['source-bound value'],
    inputDigest: '1'.repeat(64),
    outputDigest: '2'.repeat(64),
    candidateCount: queue.length,
    availableCandidateCount: queue.length,
    candidateSelectionMode: 'complete',
    findingCount: 1,
    candidateReasons: queue.map((item) => item.reason),
    consumers: ['review_queue'],
    limitations: ['Test fixture only.'],
    allowZeroCandidates: overrides?.allowZero ?? false,
  }
  const artifact = {
    schema: 'rnawiki-current-agent-run/v1',
    historicalPreRepair: historical,
    eligibleForActiveReview: !historical,
    corpus: { commit: '3'.repeat(40), digest: overrides?.corpusDigest ?? '4'.repeat(64) },
    inputDigest: manifestEntry.inputDigest,
    review: {
      reasonSchemaVersion,
      evidenceIdentityVersion,
      policy: {
        UNUSUAL_FOR_PEER_GROUP: { audienceLane: 'quantitative', severity: 'medium' },
      },
    },
    run: {
      agent: 'test-agent',
      version: agentVersion,
      runDate: '2026-08-31',
      seed: 7,
      parameters: {},
      coverage: { considered: 1, used: 1, reason: 'One fixture.' },
      output: { rows: 1 },
      queue,
      caveats: ['Test fixture only.'],
    },
  } as CurrentAgentRunArtifact
  const manifest = {
    schema: 'rnawiki-current-agent-manifest/v1',
    historicalPreRepair: historical,
    eligibleForActiveReview: !historical,
    corpusCommit: artifact.corpus.commit,
    corpusDigest: artifact.corpus.digest,
    generatedAt: '2026-08-31T00:00:00.000Z',
    runDate: artifact.run.runDate,
    seed: artifact.run.seed,
    records: 1,
    artifacts: [manifestEntry],
    totals: { candidates: queue.length, findings: 1 },
  } as CurrentAgentManifest
  return { manifest, manifestEntry, artifact }
}

function prepared(input = fixture()) {
  return prepareCurrentRunForImport({
    ...input,
    provenanceBySlug: new Map([['example-medicine', 'curated']]),
  })
}

describe('current agent candidate identity', () => {
  it('keeps score and wording changes out of candidate and occurrence identity', () => {
    const before = prepared().candidates[0]!
    const after = prepared(
      fixture({
        candidate: {
          priority: 0.2,
          question: 'New wording for the same source-check question?',
          basis: 'The score moved with the corpus; the identity did not.',
        },
      }),
    ).candidates[0]!

    expect(after.candidateKey).toBe(before.candidateKey)
    expect(after.occurrenceKey).toBe(before.occurrenceKey)
  })

  it('reopens when the exact recorded observation changes', () => {
    const before = prepared().candidates[0]!
    const after = prepared(
      fixture({
        candidate: {
          evidence: {
            schema: 'agent-review-evidence/v2',
            observation: {
              recordedValue: { display: '11 hours', numeric: 11, unit: 'hours' },
            },
            identityObservation: {
              recordedValue: { display: '11 hours', numeric: 11, unit: 'hours' },
            },
            sourceReadings: [SOURCE],
          },
        },
      }),
    ).candidates[0]!

    expect(after.candidateKey).toBe(before.candidateKey)
    expect(after.occurrenceKey).not.toBe(before.occurrenceKey)
  })

  it('reopens when a source snapshot changes', () => {
    const before = prepared().candidates[0]!
    const after = prepared(
      fixture({
        candidate: {
          evidence: {
            schema: 'agent-review-evidence/v2',
            observation: candidate().evidence.observation,
            identityObservation: candidate().evidence.identityObservation,
            sourceReadings: [{ ...SOURCE, excerpt: 'A later snapshot prints 10 hours.' }],
          },
        },
      }),
    ).candidates[0]!

    expect(after.candidateKey).toBe(before.candidateKey)
    expect(after.occurrenceKey).not.toBe(before.occurrenceKey)
  })

  it('changes the conceptual key for a reason-schema change', () => {
    const before = prepared().candidates[0]!
    const after = prepared(fixture({ reasonSchemaVersion: '2' })).candidates[0]!
    expect(after.candidateKey).not.toBe(before.candidateKey)
    expect(after.occurrenceKey).not.toBe(before.occurrenceKey)
  })

  it('does not reopen for a run-version bump whose evidence identity is unchanged', () => {
    const before = prepared().candidates[0]!
    const after = prepared(fixture({ agentVersion: '1.1.0' })).candidates[0]!
    expect(after.candidateKey).toBe(before.candidateKey)
    expect(after.occurrenceKey).toBe(before.occurrenceKey)
    expect(after.evidenceDigest).toBe(before.evidenceDigest)
  })

  it('reopens when the relevant evidence-identity version changes', () => {
    const before = prepared().candidates[0]!
    const after = prepared(fixture({ evidenceIdentityVersion: '2' })).candidates[0]!
    expect(after.candidateKey).toBe(before.candidateKey)
    expect(after.occurrenceKey).not.toBe(before.occurrenceKey)
  })

  it('keeps unrelated corpus and score-context changes out of occurrence identity', () => {
    const before = prepared().candidates[0]!
    const after = prepared(
      fixture({
        corpusDigest: '9'.repeat(64),
        candidate: {
          evidence: {
            schema: 'agent-review-evidence/v2',
            observation: {
              recordedValue: RECORDED_VALUE,
              peerScreen: { corpusCount: 99_999, percentile: 0.991 },
            },
            identityObservation: { recordedValue: RECORDED_VALUE },
            sourceReadings: [SOURCE],
          },
        },
      }),
    ).candidates[0]!

    expect(after.occurrenceKey).toBe(before.occurrenceKey)
    expect(after.evidenceDigest).toBe(before.evidenceDigest)
  })

  it('canonicalizes source order and exact duplicate readings before identity and storage', () => {
    const secondSource = {
      ...SOURCE,
      sourceKey: 'FDA_LABEL:label-2',
      identifier: 'label-2',
      excerpt: 'A second label records the value as 10 hours.',
    }
    const before = prepared(
      fixture({
        candidate: {
          evidence: {
            ...candidate().evidence,
            sourceReadings: [SOURCE, secondSource],
          },
        },
      }),
    ).candidates[0]!
    const after = prepared(
      fixture({
        candidate: {
          evidence: {
            ...candidate().evidence,
            sourceReadings: [secondSource, SOURCE, SOURCE],
          },
        },
      }),
    ).candidates[0]!

    expect(after.occurrenceKey).toBe(before.occurrenceKey)
    expect(after.evidenceDigest).toBe(before.evidenceDigest)
    expect((after.evidence.sourceReadings as unknown[]).length).toBe(2)
  })

  it('refuses to activate historical pre-repair artifacts', () => {
    expect(() => prepared(fixture({ historical: true }))).toThrow(/Historical or ineligible/u)
  })

  it('allows zero candidates only when the manifest explicitly declares that state valid', () => {
    expect(() => prepared(fixture({ allowZero: true }))).not.toThrow()
    const invalid = fixture({ allowZero: true })
    invalid.manifestEntry.allowZeroCandidates = false
    expect(() => prepared(invalid)).toThrow(/unexpectedly has zero candidates/u)
  })
})

describe('sampled current-agent queue audit', () => {
  function sampledRun() {
    const run = fixture().artifact.run
    return {
      ...run,
      queueSelection: {
        mode: 'sampled' as const,
        availableCandidates: 2,
        retainedCandidates: 1,
        selectionRule: 'Retain the first item after a deterministic seed-based ordering.',
        seed: run.seed,
        retrieval: 'Re-run the detector against the exact corpus named by the artifact.',
        completeCandidateIndex: [
          {
            slug: 'example-medicine',
            fieldPath: 'pharmacokinetics.halfLife',
            reason: 'UNUSUAL_FOR_PEER_GROUP' as const,
            priority: 0.9,
          },
          {
            slug: 'second-medicine',
            fieldPath: 'pharmacokinetics.halfLife',
            reason: 'UNUSUAL_FOR_PEER_GROUP' as const,
            priority: 0.8,
          },
        ],
      },
    }
  }

  it('distinguishes retained queue rows from the complete eligible universe', () => {
    expect(
      validateQueueSelectionContract({
        agentName: 'test-agent',
        reasonSchemaVersion: '1',
        run: sampledRun(),
      }),
    ).toEqual({ mode: 'sampled', availableCandidates: 2, retainedCandidates: 1 })
  })

  it('rejects a sampled audit with a false count or a retained row missing from its index', () => {
    const falseCount = sampledRun()
    falseCount.queueSelection.availableCandidates = 3
    expect(() =>
      validateQueueSelectionContract({
        agentName: 'test-agent',
        reasonSchemaVersion: '1',
        run: falseCount,
      }),
    ).toThrow(/inconsistent sampled queue audit/u)

    const missingRetained = sampledRun()
    missingRetained.queueSelection.completeCandidateIndex = [
      missingRetained.queueSelection.completeCandidateIndex[1]!,
      {
        slug: 'third-medicine',
        fieldPath: 'pharmacokinetics.halfLife',
        reason: 'UNUSUAL_FOR_PEER_GROUP',
        priority: 0.7,
      },
    ]
    expect(() =>
      validateQueueSelectionContract({
        agentName: 'test-agent',
        reasonSchemaVersion: '1',
        run: missingRetained,
      }),
    ).toThrow(/absent from its complete sampled index/u)
  })

  it('rejects a nominal sample that silently retains none of its available work', () => {
    const emptySample = sampledRun()
    emptySample.queue = []
    emptySample.queueSelection.retainedCandidates = 0
    expect(() =>
      validateQueueSelectionContract({
        agentName: 'test-agent',
        reasonSchemaVersion: '1',
        run: emptySample,
      }),
    ).toThrow(/inconsistent sampled queue audit/u)
  })
})

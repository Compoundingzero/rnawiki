import { eq, inArray } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/db'
import {
  agentCurrentRuns,
  agentQueueDecisions,
  agentReviewCandidates,
  agentRunCandidates,
  agentRuns,
  drugs,
} from '@/db/schema'
import type { ReviewCandidate } from '@/lib/agents/core/types'
import { valueDigest } from '@/lib/agents/core/identity'
import {
  importCurrentAgentPackage,
  MissingAgentSubjectsError,
  type LoadedCurrentAgentPackage,
} from '@/lib/agents/persistence'
import { isPlaceholderMedicineIdentity } from '@/lib/public-data-integrity'
import type {
  CurrentAgentManifest,
  CurrentAgentManifestEntry,
  CurrentAgentRunArtifact,
} from '@/scripts/agents/current-run'

const slug = 'agent-import-test-medicine'
const source = {
  sourceKey: 'FDA_LABEL:agent-import-label',
  kind: 'FDA_LABEL' as const,
  identifier: 'agent-import-label',
  label: 'Agent importer test label',
  retrievedAt: '2026-08-30T00:00:00.000Z',
  excerpt: 'The recorded half-life is 10 hours.',
}
const recordedBackgroundFixture = {
  version: 'medicine-background/v1' as const,
  authoredAt: '2026-08-31',
  pharmacokinetics: {
    routeAsRecorded: 'oral',
    halfLife: {
      display: '10 hours',
      numeric: 10,
      unit: 'hours',
      populationContext: 'agent importer integration fixture',
      source: {
        kind: source.kind,
        identifier: source.identifier,
        label: source.label,
        retrievedAt: source.retrievedAt,
        excerpt: source.excerpt,
      },
    },
  },
}

async function packageFixture(input: {
  suffix: string
  slug?: string
  priority?: number
  display?: string
  sourceExcerpt?: string
}): Promise<LoadedCurrentAgentPackage> {
  const subject = input.slug ?? slug
  const storedRows = await db
    .select({ slug: drugs.slug, name: drugs.name, recordedBackground: drugs.recordedBackground })
    .from(drugs)
  const corpusRows = storedRows
    .filter(
      (row) =>
        row.recordedBackground !== null &&
        !isPlaceholderMedicineIdentity({ slug: row.slug, name: row.name }),
    )
    .map((row) => ({ slug: row.slug, name: row.name, background: row.recordedBackground! }))
    .sort((left, right) => (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0))
  const display = input.display ?? '10 hours'
  const reading = { ...source, ...(input.sourceExcerpt ? { excerpt: input.sourceExcerpt } : {}) }
  const candidate: ReviewCandidate = {
    slug: subject,
    fieldPath: 'pharmacokinetics.halfLife',
    reason: 'UNUSUAL_FOR_PEER_GROUP',
    question: 'Does the exact source excerpt state this recorded half-life?',
    priority: input.priority ?? 0.9,
    basis: 'A deterministic comparison of recorded values.',
    sources: [reading.sourceKey],
    evidence: {
      schema: 'agent-review-evidence/v2',
      observation: {
        recordedValue: { display, numeric: Number.parseFloat(display), unit: 'hours' },
      },
      identityObservation: {
        recordedValue: { display, numeric: Number.parseFloat(display), unit: 'hours' },
      },
      sourceReadings: [reading],
    },
  }
  const entry: CurrentAgentManifestEntry = {
    agentId: 'agent-import-test',
    agentVersion: '1.0.0',
    reasonSchemaVersion: '1',
    evidenceIdentityVersion: '1',
    path: 'data/agents/current/agent-import-test.json',
    dependencies: ['recorded-background.pharmacokinetics'],
    sourceRequirements: ['exact source-bound recorded value'],
    inputDigest: 'b'.repeat(64),
    outputDigest: valueDigest(`agent-import-output:${input.suffix}`),
    candidateCount: 1,
    availableCandidateCount: 1,
    candidateSelectionMode: 'complete',
    findingCount: 1,
    candidateReasons: ['UNUSUAL_FOR_PEER_GROUP'],
    consumers: ['review_queue'],
    limitations: ['Integration fixture.'],
    allowZeroCandidates: false,
  }
  const artifact = {
    schema: 'rnawiki-current-agent-run/v1',
    historicalPreRepair: false,
    eligibleForActiveReview: true,
    corpus: {
      commit: 'a'.repeat(40),
      digest: valueDigest(corpusRows),
    },
    inputDigest: entry.inputDigest,
    review: {
      reasonSchemaVersion: '1',
      evidenceIdentityVersion: '1',
      policy: {
        UNUSUAL_FOR_PEER_GROUP: { audienceLane: 'quantitative', severity: 'medium' },
      },
    },
    run: {
      agent: entry.agentId,
      version: entry.agentVersion,
      runDate: '2026-08-31',
      seed: 7,
      parameters: {},
      coverage: { considered: 1, used: 1, reason: 'One test record.' },
      output: { rows: 1 },
      queue: [candidate],
      caveats: ['Integration fixture.'],
    },
  } as CurrentAgentRunArtifact
  const manifest = {
    schema: 'rnawiki-current-agent-manifest/v1',
    historicalPreRepair: false,
    eligibleForActiveReview: true,
    corpusCommit: artifact.corpus.commit,
    corpusDigest: artifact.corpus.digest,
    generatedAt: '2026-08-31T00:00:00.000Z',
    runDate: artifact.run.runDate,
    seed: artifact.run.seed,
    records: corpusRows.length,
    artifacts: [entry],
    totals: { candidates: 1, findings: 1 },
  } as CurrentAgentManifest
  return {
    manifest,
    artifacts: new Map([[entry.agentId, artifact]]),
    provenanceBySlug: new Map(corpusRows.map((row) => [row.slug, 'curated'])),
    recordedBackgroundDigestBySlug: new Map(
      corpusRows.map((row) => [row.slug, valueDigest(row.background)]),
    ),
  }
}

beforeAll(async () => {
  await db.insert(drugs).values({
    id: slug,
    slug,
    name: 'Agent import test medicine',
    sponsor: 'Test sponsor',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    indication: 'Test indication',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 50,
    recordedBackground: recordedBackgroundFixture,
  })
})

describe('current post-repair agent import', () => {
  it('is idempotent, separates score movement from evidence changes, and never mutates medicine data', async () => {
    const baseline = await packageFixture({ suffix: '1' })
    const first = await importCurrentAgentPackage(baseline)
    expect(first).toMatchObject({
      runs: 1,
      candidatesInPackage: 1,
      candidatesInserted: 1,
      membershipsInserted: 1,
      currentPointersChanged: 1,
      decisionsInvented: 0,
    })
    expect(first.counts[0]).toMatchObject({
      candidateState: 'new',
      occurrenceState: 'new',
      decisionState: 'never_reviewed',
    })

    const replay = await importCurrentAgentPackage(baseline)
    expect(replay).toMatchObject({
      candidatesInserted: 0,
      membershipsInserted: 0,
      currentPointersChanged: 0,
      decisionsInvented: 0,
    })
    // The run id is internal, so inspect the current membership rather than reconstructing it from
    // test metadata. Its first-observation state must survive an identical replay.
    const [baselinePointer] = await db
      .select({ runId: agentCurrentRuns.runId })
      .from(agentCurrentRuns)
      .where(eq(agentCurrentRuns.agentName, 'agent-import-test'))
    const [baselineMembership] = await db
      .select({ rankingFeatures: agentRunCandidates.rankingFeatures })
      .from(agentRunCandidates)
      .where(eq(agentRunCandidates.runId, baselinePointer!.runId))
    expect(baselineMembership?.rankingFeatures).toMatchObject({
      occurrenceState: 'new',
      liveDecisionContextDigest: expect.stringMatching(/^[0-9a-f]{64}$/u),
      liveStoredFieldState: 'present',
      liveSourceBindingsComplete: true,
    })

    const scoreOnly = await importCurrentAgentPackage(
      await packageFixture({ suffix: '2', priority: 0.1 }),
    )
    expect(scoreOnly).toMatchObject({ candidatesInserted: 0, membershipsInserted: 1 })
    expect(scoreOnly.counts[0]?.occurrenceState).toBe('unchanged')

    const sourceChanged = await importCurrentAgentPackage(
      await packageFixture({
        suffix: '3',
        sourceExcerpt: 'A later snapshot still prints 10 hours.',
      }),
    )
    expect(sourceChanged).toMatchObject({ candidatesInserted: 1, membershipsInserted: 1 })
    expect(sourceChanged.counts[0]?.occurrenceState).toBe('reopened')

    const sourceReturned = await importCurrentAgentPackage(
      await packageFixture({ suffix: 'return', sourceExcerpt: source.excerpt }),
    )
    expect(sourceReturned).toMatchObject({ candidatesInserted: 0, membershipsInserted: 1 })
    expect(sourceReturned.counts[0]?.occurrenceState).toBe('unchanged')
    const [returnedPointer] = await db
      .select({ runId: agentCurrentRuns.runId })
      .from(agentCurrentRuns)
      .where(eq(agentCurrentRuns.agentName, 'agent-import-test'))
    const [returnedMembership] = await db
      .select({ rankingFeatures: agentRunCandidates.rankingFeatures })
      .from(agentRunCandidates)
      .where(eq(agentRunCandidates.runId, returnedPointer!.runId))
    expect(returnedMembership?.rankingFeatures).toMatchObject({
      occurrenceState: 'unchanged',
      changedOccurrence: false,
      sourceChanged: true,
    })

    const valueChanged = await importCurrentAgentPackage(
      await packageFixture({ suffix: '4', display: '11 hours' }),
    )
    expect(valueChanged).toMatchObject({ candidatesInserted: 1, membershipsInserted: 1 })
    expect(valueChanged.counts[0]?.occurrenceState).toBe('reopened')

    const [medicine] = await db
      .select({ name: drugs.name, confidenceScore: drugs.confidenceScore })
      .from(drugs)
      .where(eq(drugs.slug, slug))
    expect(medicine).toEqual({ name: 'Agent import test medicine', confidenceScore: 50 })
    const importedCandidates = await db
      .select({ candidateKey: agentReviewCandidates.candidateKey })
      .from(agentReviewCandidates)
      .where(eq(agentReviewCandidates.agentName, 'agent-import-test'))
    const importedRuns = await db
      .select({ id: agentRuns.id })
      .from(agentRuns)
      .where(eq(agentRuns.agentName, 'agent-import-test'))
    const importedMemberships = await db
      .select()
      .from(agentRunCandidates)
      .where(
        inArray(
          agentRunCandidates.runId,
          importedRuns.map((run) => run.id),
        ),
      )
    const importedDecisions = await db
      .select()
      .from(agentQueueDecisions)
      .where(
        inArray(
          agentQueueDecisions.candidateKey,
          importedCandidates.map((candidate) => candidate.candidateKey),
        ),
      )
    expect(importedDecisions).toHaveLength(0)
    expect(importedCandidates).toHaveLength(3)
    expect(importedMemberships).toHaveLength(5)
    expect(importedRuns).toHaveLength(5)
    expect(
      await db
        .select()
        .from(agentCurrentRuns)
        .where(eq(agentCurrentRuns.agentName, 'agent-import-test')),
    ).toHaveLength(1)
  })

  it('reports a missing subject and leaves the current pointer untouched', async () => {
    const before = await db.select().from(agentCurrentRuns)
    await expect(
      importCurrentAgentPackage(
        await packageFixture({ suffix: '5', slug: 'missing-agent-subject' }),
      ),
    ).rejects.toBeInstanceOf(MissingAgentSubjectsError)
    expect(await db.select().from(agentCurrentRuns)).toEqual(before)
  })

  it('refuses to activate a package computed from a different recorded-background corpus', async () => {
    const before = await db.select().from(agentCurrentRuns)
    const stale = await packageFixture({ suffix: '6' })
    const staleBackgroundDigests = new Map(stale.recordedBackgroundDigestBySlug)
    staleBackgroundDigests.set(slug, 'f'.repeat(64))
    stale.recordedBackgroundDigestBySlug = staleBackgroundDigests

    await expect(importCurrentAgentPackage(stale)).rejects.toThrow(
      /recorded background differs from the checked agent corpus/u,
    )
    expect(await db.select().from(agentCurrentRuns)).toEqual(before)
  })

  it('refuses to activate a package after a medicine identity changes', async () => {
    const before = await db.select().from(agentCurrentRuns)
    const packageBeforeChange = await packageFixture({ suffix: 'identity' })
    await db.update(drugs).set({ name: 'Changed medicine identity' }).where(eq(drugs.slug, slug))
    try {
      await expect(importCurrentAgentPackage(packageBeforeChange)).rejects.toThrow(
        /identity or recorded background differs/u,
      )
      expect(await db.select().from(agentCurrentRuns)).toEqual(before)
    } finally {
      await db.update(drugs).set({ name: 'Agent import test medicine' }).where(eq(drugs.slug, slug))
    }
  })

  it('refuses to activate a package missing an eligible production corpus row', async () => {
    const extraSlug = 'agent-import-extra-background-medicine'
    const before = await db.select().from(agentCurrentRuns)
    const packageBeforeAddition = await packageFixture({ suffix: '7' })
    await db.insert(drugs).values({
      id: extraSlug,
      slug: extraSlug,
      name: 'Agent import extra background medicine',
      sponsor: 'Test sponsor',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      indication: 'Test indication',
      auditConfidence: 'Moderate / Debated',
      confidenceScore: 50,
      recordedBackground: recordedBackgroundFixture,
    })

    try {
      await expect(importCurrentAgentPackage(packageBeforeAddition)).rejects.toThrow(
        /eligible recorded-background medicine subject\(s\) absent/u,
      )
      expect(await db.select().from(agentCurrentRuns)).toEqual(before)
    } finally {
      await db.delete(drugs).where(eq(drugs.slug, extraSlug))
    }
  })
})

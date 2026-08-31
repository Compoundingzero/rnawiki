import { describe, expect, it, vi } from 'vitest'

import {
  backgroundEvidenceSourceId,
  backgroundFreshnessJobKey,
  backgroundSourceFetchAttemptId,
  backgroundSourceSnapshotId,
  canonicalLocatorForBackgroundSource,
  evidenceSourceTypeForBackgroundKind,
  fetchBackgroundSource,
} from '@/lib/background/source-fetch'

describe('background source fetch identities', () => {
  it('names sources by exact kind and names snapshots by exact content', () => {
    const fda = backgroundEvidenceSourceId('FDA_LABEL:shared')
    const dailyMed = backgroundEvidenceSourceId('DAILYMED:shared')
    expect(fda).toMatch(/^[0-9a-f]{64}$/u)
    expect(fda).not.toBe(dailyMed)
    expect(backgroundSourceSnapshotId(fda, 'a'.repeat(64))).toBe(
      backgroundSourceSnapshotId(fda, 'a'.repeat(64)),
    )
    expect(backgroundSourceSnapshotId(fda, 'a'.repeat(64))).not.toBe(
      backgroundSourceSnapshotId(fda, 'b'.repeat(64)),
    )
  })

  it('gives each scheduled attempt a stable distinct identity', () => {
    const jobKey = backgroundFreshnessJobKey(new Date('2026-08-31T00:00:00Z'), 'test-nonce')
    const first = backgroundSourceFetchAttemptId({
      jobKey,
      sourceKey: 'PUBMED:123',
      attemptNumber: 1,
    })
    expect(first).toBe(
      backgroundSourceFetchAttemptId({
        jobKey,
        sourceKey: 'PUBMED:123',
        attemptNumber: 1,
      }),
    )
    expect(first).not.toBe(
      backgroundSourceFetchAttemptId({
        jobKey,
        sourceKey: 'PUBMED:123',
        attemptNumber: 2,
      }),
    )
  })
})

describe('background source adapters', () => {
  it('uses canonical public locators and keeps coarse type separate from identity', () => {
    expect(
      canonicalLocatorForBackgroundSource({ kind: 'CLINICALTRIALS', identifier: ' nct01234567 ' }),
    ).toBe('https://clinicaltrials.gov/api/v2/studies/NCT01234567')
    expect(evidenceSourceTypeForBackgroundKind('FDA_LABEL')).toBe('REGULATORY_RECORD')
    expect(evidenceSourceTypeForBackgroundKind('DAILYMED')).toBe('REGULATORY_RECORD')
    expect(evidenceSourceTypeForBackgroundKind('PUBMED')).toBe('PEER_REVIEWED_PUBLICATION')
  })

  it('persists unsupported as an operational result without making a request', async () => {
    const fetchImplementation = vi.fn()
    const outcome = await fetchBackgroundSource(
      {
        sourceIdentity: { kind: 'NADAC', identifier: '2026-08-26' },
        sourceKey: 'NADAC:2026-08-26',
      },
      { fetchImplementation },
    )
    expect(fetchImplementation).not.toHaveBeenCalled()
    expect(outcome.status).toBe('UNSUPPORTED')
    if (outcome.status !== 'SUCCEEDED') {
      expect(outcome.errorCode).toBe('UNSUPPORTED_SOURCE_KIND')
    }
  })

  it('decodes JSON string values for assertion comparison and hashes the exact response', async () => {
    const rawText = JSON.stringify({ section: ['The value is 10 mg.', 'Second sentence.'] })
    const outcome = await fetchBackgroundSource(
      {
        sourceIdentity: { kind: 'FDA_LABEL', identifier: ' ABC-DEF ' },
        sourceKey: 'FDA_LABEL:abc-def',
      },
      {
        fetchImplementation: async () =>
          new Response(rawText, { status: 200, headers: { 'content-type': 'application/json' } }),
      },
    )
    expect(outcome.status).toBe('SUCCEEDED')
    if (outcome.status === 'SUCCEEDED') {
      expect(outcome.rawText).toBe(rawText)
      expect(outcome.comparisonText).toBe('The value is 10 mg.\nSecond sentence.')
      expect(outcome.contentHash).toMatch(/^[0-9a-f]{64}$/u)
    }
  })

  it.each([
    ['HTTP failure', async () => new Response('', { status: 503 }), 'UNREACHABLE'],
    ['malformed JSON', async () => new Response('{broken', { status: 200 }), 'FAILED'],
    [
      'network failure',
      async () => {
        throw new Error('socket details must not escape')
      },
      'UNREACHABLE',
    ],
  ] as const)(
    'keeps %s outside the successful assertion shape',
    async (_name, implementation, state) => {
      const outcome = await fetchBackgroundSource(
        {
          sourceIdentity: { kind: 'CLINICALTRIALS', identifier: 'NCT01234567' },
          sourceKey: 'CLINICALTRIALS:NCT01234567',
        },
        { fetchImplementation: implementation },
      )
      expect(outcome.status).toBe(state)
      expect('comparisonText' in outcome).toBe(false)
      if (outcome.status !== 'SUCCEEDED') {
        expect(outcome.errorMessage).not.toContain('socket details')
      }
    },
  )

  it('rejects a source key that does not match the bound source', async () => {
    await expect(
      fetchBackgroundSource({
        sourceIdentity: { kind: 'PUBMED', identifier: '123' },
        sourceKey: 'PUBMED:456',
      }),
    ).rejects.toThrow(/does not match/u)
  })
})

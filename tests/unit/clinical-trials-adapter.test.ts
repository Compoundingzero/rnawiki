import { describe, expect, it, vi } from 'vitest'

import { ClinicalTrialsGovAdapter } from '@/lib/evidence/adapters/clinical-trials-gov'

const identifier = { kind: 'NCT' as const, value: 'NCT12345678' }

function response(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

function study(status: string, enrollment: number): unknown {
  return {
    hasResults: false,
    protocolSection: {
      identificationModule: { nctId: 'NCT12345678' },
      statusModule: {
        overallStatus: status,
        startDateStruct: { date: '2025-01' },
        primaryCompletionDateStruct: { date: '2027-04' },
      },
      sponsorCollaboratorsModule: { leadSponsor: { name: 'Example Sponsor', class: 'INDUSTRY' } },
      designModule: {
        phases: ['PHASE3'],
        enrollmentInfo: { count: enrollment, type: 'ACTUAL' },
      },
    },
  }
}

describe('ClinicalTrialsGovAdapter', () => {
  it('accepts only valid NCT identifiers', () => {
    const adapter = new ClinicalTrialsGovAdapter()
    expect(adapter.supports(identifier)).toBe(true)
    expect(adapter.supports({ kind: 'DOI', value: '10.0000/example' })).toBe(false)
    expect(adapter.supports({ kind: 'NCT', value: 'trial-123' })).toBe(false)
  })

  it('normalizes only exact registry facts with a reproducible content hash', async () => {
    const fetcher = vi.fn(async () => response(study('RECRUITING', 120)))
    const adapter = new ClinicalTrialsGovAdapter(fetcher, () => new Date('2026-08-22T00:00:00Z'))

    const first = await adapter.fetch(identifier)
    const second = await adapter.fetch(identifier)
    const facts = await adapter.normalize(first)

    expect(first.contentHash).toBe(second.contentHash)
    expect(first.retrievedAt).toBe('2026-08-22T00:00:00.000Z')
    expect(facts.find((fact) => fact.path === 'trial.overallStatus')?.value).toBe('RECRUITING')
    expect(facts.find((fact) => fact.path === 'trial.enrollment.count')?.value).toBe(120)
    expect(facts.every((fact) => fact.risk === 'LOW_RISK_EXACT')).toBe(true)
  })

  it('does not treat ClinicalTrials.gov service-derived metadata as a study-record change', async () => {
    const base = study('RECRUITING', 120) as Record<string, unknown>
    const payloads = [
      { ...base, derivedSection: { miscInfoModule: { versionHolder: '2026-08-21' } } },
      { ...base, derivedSection: { miscInfoModule: { versionHolder: '2026-08-22' } } },
    ]
    const adapter = new ClinicalTrialsGovAdapter(
      async () => response(payloads.shift()),
      () => new Date('2026-08-22T00:00:00Z'),
    )

    const before = await adapter.fetch(identifier)
    const after = await adapter.fetch(identifier)

    expect(before.contentHash).toBe(after.contentHash)
    await expect(adapter.diff(before, after)).resolves.toMatchObject({
      changed: false,
      changes: [],
    })
  })

  it('produces a deterministic field-level diff for changed registry facts', async () => {
    const payloads = [study('RECRUITING', 120), study('ACTIVE_NOT_RECRUITING', 128)]
    const fetcher = vi.fn(async () => response(payloads.shift()))
    const adapter = new ClinicalTrialsGovAdapter(fetcher, () => new Date('2026-08-22T00:00:00Z'))

    const before = await adapter.fetch(identifier)
    const after = await adapter.fetch(identifier)
    const diff = await adapter.diff(before, after)

    expect(diff.changed).toBe(true)
    expect(diff.changes.map((change) => change.path)).toEqual([
      'trial.enrollment.count',
      'trial.overallStatus',
    ])
    expect(diff.changes.every((change) => change.risk === 'LOW_RISK_EXACT')).toBe(true)
  })

  it('routes any otherwise unclassified registry-record change to human review', async () => {
    const beforePayload = study('RECRUITING', 120) as Record<string, unknown>
    const afterPayload = {
      ...beforePayload,
      protocolSection: {
        ...(beforePayload.protocolSection as Record<string, unknown>),
        outcomesModule: {
          primaryOutcomes: [{ measure: 'A newly posted outcome that is not auto-interpreted' }],
        },
      },
    }
    const payloads = [beforePayload, afterPayload]
    const fetcher = vi.fn(async () => response(payloads.shift()))
    const adapter = new ClinicalTrialsGovAdapter(fetcher, () => new Date('2026-08-22T00:00:00Z'))

    const before = await adapter.fetch(identifier)
    const after = await adapter.fetch(identifier)
    const diff = await adapter.diff(before, after)

    expect(diff).toMatchObject({
      changed: true,
      previousHash: before.contentHash,
      currentHash: after.contentHash,
      changes: [
        {
          path: 'trial.registryRecord',
          before: before.contentHash,
          after: after.contentHash,
          risk: 'INTERPRETIVE_REVIEW_REQUIRED',
        },
      ],
    })
  })

  it('reports a missing registry record as structured source unavailability', async () => {
    const adapter = new ClinicalTrialsGovAdapter(async () => new Response(null, { status: 404 }))

    await expect(adapter.fetch(identifier)).rejects.toMatchObject({
      name: 'EvidenceSourceFetchError',
      code: 'CLINICAL_TRIALS_HTTP_404',
      retryable: true,
      sourceUnavailable: true,
    })
  })
})

import { describe, expect, it } from 'vitest'

import {
  buildQuestionIssueIndex,
  primaryIssueCoverage,
  CONSENSUS_FIELD_TO_INTENT,
} from '@/lib/dossier-question-issues'

/**
 * The property that matters is not that conflicts appear, but that only real ones do. The rule this
 * replaces marked a field disjoint from raw numbers with no regard for units, so it reported
 * melphalan's 0.5 L/kg against 35.5 L as a disagreement when the second is 0.51 L/kg in a 70 kg
 * adult. A question told "sources differ" on that basis would be lying to a reader.
 */

const SOURCE = { label: 'Example label', identifier: 'set-1', retrievedAt: '2026-08-30' }

function field(
  overrides: Partial<
    Parameters<typeof buildQuestionIssueIndex>[0] extends { consensusFields?: readonly (infer F)[] }
      ? F
      : never
  > = {},
) {
  return {
    field: 'halfLife',
    comparisonState: 'differ' as const,
    comparisonReasons: ['COMPATIBLE_VALUES_DISJOINT'],
    readings: [
      { display: '12 hours', sourceCount: 30, sources: [SOURCE] },
      { display: '18 hours', sourceCount: 1, sources: [{ ...SOURCE, identifier: 'set-2' }] },
    ],
    ...overrides,
  }
}

describe('only comparable disagreements reach a question', () => {
  it('marks a question conflicting when readings genuinely differ', () => {
    const index = buildQuestionIssueIndex({ consensusFields: [field()] })
    expect(index.byIntent.get('measurement')).toEqual(['conflicting'])
    expect(index.conflicting).toHaveLength(1)
    expect(index.conflicting[0]?.reasons).toContain('COMPATIBLE_VALUES_DISJOINT')
  })

  it.each(['agree', 'not_comparable', 'insufficient_context'] as const)(
    'does not mark a question conflicting when the field is %s',
    (state) => {
      const index = buildQuestionIssueIndex({
        consensusFields: [field({ comparisonState: state })],
      })
      expect(index.byIntent.size).toBe(0)
      expect(index.conflicting).toHaveLength(0)
    },
  )

  it('never treats a unit mismatch as a disagreement', () => {
    // The melphalan case. Comparing 0.5 L/kg with 35.5 L needs a body weight no source printed.
    const index = buildQuestionIssueIndex({
      consensusFields: [
        field({
          field: 'volumeOfDistribution',
          comparisonState: 'not_comparable',
          comparisonReasons: ['DENOMINATOR_MISMATCH'],
          readings: [
            { display: '0.5 L/kg', sourceCount: 8, sources: [SOURCE] },
            { display: '35.5 to 185.7 L', sourceCount: 1, sources: [SOURCE] },
          ],
        }),
      ],
    })
    expect(index.conflicting).toHaveLength(0)
  })

  it('reports two conflicts in one question as two entries under one intent', () => {
    const index = buildQuestionIssueIndex({
      consensusFields: [field(), field({ field: 'bioavailability' })],
    })
    expect(index.byIntent.get('measurement')).toEqual(['conflicting'])
    expect(index.conflicting.map((entry) => entry.field)).toEqual(['bioavailability', 'halfLife'])
  })

  it('falls back to the legacy note only when no comparison state was recorded', () => {
    const withState = buildQuestionIssueIndex({
      consensusFields: [field({ comparisonState: 'agree', disagreementNote: 'legacy' })],
    })
    expect(withState.conflicting).toHaveLength(0)

    const legacyOnly = buildQuestionIssueIndex({
      consensusFields: [field({ comparisonState: undefined, disagreementNote: 'legacy' })],
    })
    expect(legacyOnly.conflicting).toHaveLength(1)
  })
})

describe('a disagreement with nowhere to go is reported, not invented', () => {
  it('records an unmapped field instead of attaching it to some question', () => {
    const index = buildQuestionIssueIndex({
      consensusFields: [field({ field: 'clearanceNotInTheTable' })],
    })
    expect(index.unmappedFields).toEqual(['clearanceNotInTheTable'])
    expect(index.byIntent.size).toBe(0)
  })

  it('maps every field the consensus builder computes', () => {
    // The builder's CONSENSUS_FIELDS list. A new field must be mapped deliberately, not silently.
    for (const key of [
      'halfLife',
      'bioavailability',
      'tMax',
      'proteinBinding',
      'volumeOfDistribution',
    ]) {
      expect(CONSENSUS_FIELD_TO_INTENT[key], key).toBeDefined()
    }
  })
})

describe('staleness is traced to the source the question depends on', () => {
  const drift = {
    intent: 'measurement' as const,
    sourceIdentifier: 'set-9',
    sourceLabel: 'Example label',
    recordedAt: '2026-08-28',
    freshnessState: 'drifted',
    fieldPath: 'pharmacokinetics.halfLife',
  }

  it('marks only the question its source supports', () => {
    const index = buildQuestionIssueIndex({ driftedSources: [drift] })
    expect(index.byIntent.get('measurement')).toEqual(['stale'])
    expect(index.byIntent.get('harms')).toBeUndefined()
    expect(index.stale[0]?.sourceIdentifier).toBe('set-9')
  })

  it('carries what a reviewer needs to recheck it', () => {
    const [entry] = buildQuestionIssueIndex({ driftedSources: [drift] }).stale
    expect(entry).toMatchObject({
      sourceIdentifier: 'set-9',
      recordedAt: '2026-08-28',
      freshnessState: 'drifted',
      fieldPath: 'pharmacokinetics.halfLife',
    })
  })

  it('marks nothing when no source has drifted', () => {
    expect(buildQuestionIssueIndex({ driftedSources: [] }).byIntent.size).toBe(0)
  })
})

describe('a question can carry both problems at once', () => {
  const both = {
    consensusFields: [field()],
    driftedSources: [
      {
        intent: 'measurement' as const,
        sourceIdentifier: 'set-9',
        sourceLabel: 'Example label',
        recordedAt: '2026-08-28',
        freshnessState: 'drifted',
        fieldPath: 'pharmacokinetics.halfLife',
      },
    ],
  }

  it('keeps both issues rather than losing one to the other', () => {
    expect(buildQuestionIssueIndex(both).byIntent.get('measurement')).toEqual([
      'conflicting',
      'stale',
    ])
  })

  it('shows the disagreement as the primary state', () => {
    // Deliberate: a disagreement is about the evidence itself, staleness is about our copy of a
    // source. Showing the weaker fact and hiding the stronger one would be the wrong way round.
    expect(primaryIssueCoverage(['conflicting', 'stale'])).toBe('conflicting')
    expect(primaryIssueCoverage(['stale'])).toBe('stale')
    expect(primaryIssueCoverage([])).toBeUndefined()
  })
})

describe('determinism and non-mutation', () => {
  it('orders issues, conflicts and stale entries deterministically', () => {
    const input = {
      consensusFields: [field({ field: 'tMax' }), field({ field: 'bioavailability' })],
    }
    const first = buildQuestionIssueIndex(input)
    const second = buildQuestionIssueIndex(input)
    expect(second.conflicting.map((e) => e.field)).toEqual(first.conflicting.map((e) => e.field))
    expect(first.conflicting.map((e) => e.field)).toEqual(['bioavailability', 'tMax'])
  })

  it('does not mutate the consensus input it was handed', () => {
    // The page renders the same object. A projection that reordered or trimmed it would make the
    // navigator and the section disagree about one record.
    const input = { consensusFields: [field()] }
    const before = JSON.stringify(input)
    buildQuestionIssueIndex(input)
    expect(JSON.stringify(input)).toBe(before)
  })

  it('preserves every reading, its support and its sources', () => {
    const [entry] = buildQuestionIssueIndex({ consensusFields: [field()] }).conflicting
    expect(entry?.readings).toHaveLength(2)
    expect(entry?.readings.map((r) => r.display)).toEqual(['12 hours', '18 hours'])
    expect(entry?.readings[0]?.sources[0]?.identifier).toBe('set-1')
  })
})

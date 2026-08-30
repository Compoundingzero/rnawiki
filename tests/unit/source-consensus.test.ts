import { describe, expect, it } from 'vitest'

import { compareFieldReadings } from '@/lib/background/reading-comparison'

import { SOURCE_CONSENSUS } from '@/scripts/seed-data/background/source-consensus.generated'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'

/**
 * Cross-source consensus is the one thing in the corpus that cannot be reproduced by reading a
 * medicine's label: it requires every label. These tests pin the properties that make it
 * trustworthy — that a stated reading is one a cited source actually printed, that counts are
 * internally consistent, and that a difference between sources is never resolved into a winner.
 */

const entries = Object.entries(SOURCE_CONSENSUS)

describe('cross-source consensus', () => {
  it('covers a meaningful share of the corpus from many documents', () => {
    expect(entries.length).toBeGreaterThan(500)
    const wellCorroborated = entries.filter(([, consensus]) =>
      consensus.fields.some((field) => field.sourceCount >= 10),
    )
    expect(wellCorroborated.length).toBeGreaterThan(300)
  })

  it('never records a field from a single source, which would say nothing about agreement', () => {
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        expect(field.sourceCount, `${slug} ${field.field}`).toBeGreaterThanOrEqual(2)
      }
    }
  })

  it('keeps counts consistent and agreement equal to the leading reading share', () => {
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        const summed = field.readings.reduce((total, reading) => total + reading.sourceCount, 0)
        // Readings are capped for size, so the sum may be below the total but never above it.
        expect(summed, `${slug} ${field.field}`).toBeLessThanOrEqual(field.sourceCount)
        expect(field.agreementRate).toBeCloseTo(
          field.readings[0]!.sourceCount / field.sourceCount,
          9,
        )
      }
    }
  })

  it('states every reading in the excerpt of a source cited for it', () => {
    const failures: string[] = []
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        for (const reading of field.readings) {
          const tokens = reading.display.match(/\d+(?:\.\d+)?/gu) ?? []
          if (tokens.length === 0) continue
          const stated = reading.sources.some((source) =>
            tokens.every((token) => (source.excerpt ?? '').includes(token)),
          )
          if (!stated) failures.push(`${slug} ${field.field} "${reading.display}"`)
        }
      }
    }
    expect(failures).toEqual([])
  })

  it('keeps every differing reading rather than resolving to one', () => {
    const disagreeing = entries.flatMap(([slug, consensus]) =>
      consensus.fields
        .filter((field) => field.readings.length > 1)
        .map((field) => ({ slug, field })),
    )
    expect(disagreeing.length).toBeGreaterThan(0)
    for (const { field } of disagreeing) {
      // Every reading keeps its own sources, so a reader can see why two labels differ. A
      // resolved value would have exactly one reading and no way to check it.
      for (const reading of field.readings) {
        expect(reading.sources.length).toBeGreaterThan(0)
      }
    }
  })

  /**
   * Rewritten when the comparability contract landed. The previous assertion compared the raw
   * printed numbers with no regard for units, and was wrong in both directions.
   *
   * It missed real disagreements: carboplatin's half-life is "5 days" on thirteen labels and
   * "2.6 to 5.9 hours" on a fourteenth, and 5 falls inside 2.6 to 5.9, so the raw check called them
   * overlapping. It also invented false ones: melphalan's "0.5 L/kg" and "35.5 to 185.7 L" were
   * reported as a conflict when the second is 0.51 L/kg in a 70 kg adult.
   *
   * The property that matters is that the recorded state agrees with the contract, so the check now
   * asks the contract rather than re-deriving a weaker rule beside it.
   */
  it('records a comparison state that matches the comparability contract', () => {
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        const expected = compareFieldReadings(field.readings.map((reading) => reading.display))
        expect(field.comparisonState, `${slug} ${field.field}`).toBe(expected.state)
        // The deprecated Boolean must keep agreeing with the state it was superseded by.
        expect(field.numericallyDisjoint, `${slug} ${field.field}`).toBe(
          expected.state === 'differ',
        )
      }
    }
  })

  it('never reports a disagreement without a genuinely comparable pair behind it', () => {
    /*
     * The reasons list describes every pair in the field, not only the pair that decided the state,
     * so a field can legitimately differ on one pair and be denominator-mismatched on another. What
     * must never happen is a field marked `differ` where NO pair was comparable and disjoint -- that
     * would be a unit mismatch reported as a conflict, which is the defect this contract exists to
     * end.
     */
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        if (field.comparisonState !== 'differ') continue
        expect(field.comparisonReasons, `${slug} ${field.field}`).toContain(
          'COMPATIBLE_VALUES_DISJOINT',
        )
      }
    }
  })

  it('never reports not_comparable where every pair was in fact comparable', () => {
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        if (field.comparisonState !== 'not_comparable') continue
        const reasons = field.comparisonReasons ?? []
        expect(
          reasons.includes('DENOMINATOR_MISMATCH') || reasons.includes('UNIT_DIMENSION_MISMATCH'),
          `${slug} ${field.field}`,
        ).toBe(true)
      }
    }
  })

  it('passes the background engine once attached to the corpus', () => {
    const withConsensus = Object.entries(ALL_RECORDED_BACKGROUND).filter(
      ([, background]) => background.sourceConsensus,
    )
    expect(withConsensus.length).toBeGreaterThan(500)
    const failures = withConsensus
      .map(([slug, background]) => ({ slug, report: runBackgroundIntelligence(background) }))
      .filter((entry) => !entry.report.passed)
      .map((entry) => `${entry.slug}: ${entry.report.findings.map((f) => f.code).join(', ')}`)
    expect(failures).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'

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

  it('marks readings as non-overlapping only when their numeric spans truly are', () => {
    const span = (display: string) => {
      const numbers = (display.match(/\d+(?:\.\d+)?/gu) ?? []).map(Number)
      return numbers.length ? { low: Math.min(...numbers), high: Math.max(...numbers) } : null
    }
    for (const [slug, consensus] of entries) {
      for (const field of consensus.fields) {
        if (!field.numericallyDisjoint) continue
        const spans = field.readings.map((reading) => span(reading.display)).filter(Boolean)
        const anyDisjoint = spans.some((left, index) =>
          spans
            .slice(index + 1)
            .some((right) => left!.high < right!.low || right!.high < left!.low),
        )
        expect(anyDisjoint, `${slug} ${field.field}`).toBe(true)
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

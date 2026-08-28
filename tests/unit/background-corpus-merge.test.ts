import { describe, expect, it } from 'vitest'

import { ALL_RECORDED_BACKGROUND, RECORDED_BACKGROUND } from '@/scripts/seed-data/background'
import { EXTRACTED_BACKGROUND } from '@/scripts/seed-data/background/extracted-background.generated'
import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'

/**
 * The corpus has two tiers: records a person authored and records a parser read out of label
 * sentences. These tests pin the boundary between them — extraction may fill a gap, but it must
 * never overwrite curated work, never lose its tier marking, and never reach a reader without the
 * engine having passed it first.
 */

describe('recorded-background corpus merge', () => {
  it('never lets an extracted record overwrite a curated one', () => {
    for (const slug of Object.keys(RECORDED_BACKGROUND)) {
      const curated = RECORDED_BACKGROUND[slug]!
      const merged = ALL_RECORDED_BACKGROUND[slug]
      expect(merged, slug).toBeDefined()
      // Every field the curated record carries survives the merge byte for byte. Reference
      // identity is deliberately not asserted: a curated record gains sourceConsensus, which is
      // what every published label states for its fields, and a curated record benefits from
      // knowing fifty-nine labels agree with it.
      for (const [key, value] of Object.entries(curated)) {
        expect(JSON.stringify(merged![key as keyof typeof merged]), `${slug}.${key}`).toBe(
          JSON.stringify(value),
        )
      }
    }
  })

  it('adds only cross-source consensus to a curated record, never anything else', () => {
    for (const slug of Object.keys(RECORDED_BACKGROUND)) {
      const curatedKeys = new Set(Object.keys(RECORDED_BACKGROUND[slug]!))
      const added = Object.keys(ALL_RECORDED_BACKGROUND[slug]!).filter(
        (key) => !curatedKeys.has(key),
      )
      expect(
        added.filter((key) => key !== 'sourceConsensus'),
        slug,
      ).toEqual([])
    }
  })

  it('covers every slug from both tiers exactly once', () => {
    const expected = new Set([
      ...Object.keys(RECORDED_BACKGROUND),
      ...Object.keys(EXTRACTED_BACKGROUND),
    ])
    expect(Object.keys(ALL_RECORDED_BACKGROUND).sort()).toEqual([...expected].sort())
  })

  it('reaches far beyond what hand-authoring covered', () => {
    // The curated corpus is small by nature; extraction is what makes the corpus corpus-sized.
    expect(Object.keys(ALL_RECORDED_BACKGROUND).length).toBeGreaterThan(
      Object.keys(RECORDED_BACKGROUND).length * 10,
    )
  })

  it('marks every extracted record and every value inside it as extracted', () => {
    for (const [slug, background] of Object.entries(EXTRACTED_BACKGROUND)) {
      expect(background.provenanceTier, slug).toBe('extracted')
      for (const value of Object.values(background.pharmacokinetics ?? {})) {
        if (value && typeof value === 'object' && 'display' in value) {
          expect(value.provenanceTier, `${slug} pharmacokinetics`).toBe('extracted')
        }
      }
    }
  })

  it('leaves curated records unmarked, so they keep reading as curated', () => {
    for (const [slug, background] of Object.entries(RECORDED_BACKGROUND)) {
      expect(background.provenanceTier ?? 'curated', slug).toBe('curated')
    }
  })

  it('passes the background engine on every record in the merged corpus', () => {
    const failures: string[] = []
    for (const [slug, background] of Object.entries(ALL_RECORDED_BACKGROUND)) {
      const report = runBackgroundIntelligence(background)
      if (!report.passed) failures.push(`${slug}: ${report.findings.map((f) => f.code).join(', ')}`)
    }
    expect(failures).toEqual([])
  })
})

describe('recorded-background provenance reaches the reader', () => {
  it('tells the reader when a whole record was read automatically', () => {
    const slug = Object.keys(EXTRACTED_BACKGROUND)[0]!
    const view = medicineBackgroundContext(EXTRACTED_BACKGROUND[slug])
    expect(view?.provenanceNote).toContain('read automatically')
    // The note points at a control the page actually renders.
    expect(view?.provenanceNote).toContain('Exact fetched wording')
  })

  it('says nothing extra about a curated record', () => {
    const slug = Object.keys(RECORDED_BACKGROUND)[0]!
    expect(medicineBackgroundContext(RECORDED_BACKGROUND[slug])?.provenanceNote).toBeUndefined()
  })

  it('labels a single extracted value inside an otherwise curated record', () => {
    const view = medicineBackgroundContext({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-28',
      pharmacokinetics: {
        routeAsRecorded: 'oral',
        halfLife: {
          display: '9 hours',
          populationContext: 'as stated in the label sentence recorded below',
          provenanceTier: 'extracted',
          source: {
            kind: 'FDA_LABEL',
            identifier: '00afce9b-48c9-487a-a738-e359c005c707',
            label: 'Synthetic medicine label',
            retrievedAt: '2026-08-28',
            excerpt: 'The elimination half-life is approximately 9 hours.',
          },
        },
      },
    })
    expect(view?.provenanceNote).toBeUndefined()
    expect(view?.pharmacokinetics?.values[0]?.provenanceLabel).toContain('not checked by a person')
  })

  it('does not repeat the per-value label inside an all-extracted record', () => {
    const slug = Object.keys(EXTRACTED_BACKGROUND).find(
      (candidate) => EXTRACTED_BACKGROUND[candidate]?.pharmacokinetics,
    )!
    const view = medicineBackgroundContext(EXTRACTED_BACKGROUND[slug])
    for (const value of view?.pharmacokinetics?.values ?? []) {
      expect(value.provenanceLabel).toBeUndefined()
    }
  })
})

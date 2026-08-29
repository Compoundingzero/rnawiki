import { describe, expect, it } from 'vitest'

import { findForbiddenPhrases, type AgentCorpusEntry } from '@/lib/agents/core/types'
import {
  CORROBORATION_SATURATION,
  DENSITY_WEIGHTS,
  RECORDABLE_MODULES,
  computeDensityScore,
  evidenceDensityAgent,
  type DensityComponents,
} from '@/lib/agents/dataset/evidence-density'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The agent is exercised against the real recorded corpus rather than a fixture. A density index
 * built from a toy corpus would prove the arithmetic and nothing about the claim the dataset makes,
 * which is a claim about this corpus and its actual thinness.
 */

const CORPUS: readonly AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND)
  .map(([slug, background]) => ({ slug, name: slug, background }))
  .sort((left, right) => left.slug.localeCompare(right.slug))

const RUN = evidenceDensityAgent.run({ corpus: CORPUS, seed: 20260828, runDate: '2026-08-28' })

describe('evidence density on the recorded corpus', () => {
  it('reads a corpus large enough for the result to mean anything', () => {
    expect(CORPUS.length).toBeGreaterThan(2500)
  })

  it('reproduces itself exactly for a given seed and run date', () => {
    const again = evidenceDensityAgent.run({
      corpus: CORPUS,
      seed: 20260828,
      runDate: '2026-08-28',
    })
    expect(JSON.stringify(again)).toEqual(JSON.stringify(RUN))
  })

  it('changes only the seeded sample when the seed changes, never a measurement', () => {
    const other = evidenceDensityAgent.run({ corpus: CORPUS, seed: 7, runDate: '2026-08-28' })
    expect(JSON.stringify(other.output.perMedicine)).toEqual(JSON.stringify(RUN.output.perMedicine))
    expect(other.output.singleModuleCount).toBe(RUN.output.singleModuleCount)
  })

  it('gives every medicine in the corpus exactly one entry', () => {
    expect(RUN.output.perMedicine.length).toBe(CORPUS.length)
    const slugs = new Set(RUN.output.perMedicine.map((record) => record.slug))
    expect(slugs.size).toBe(CORPUS.length)
    for (const entry of CORPUS) expect(slugs.has(entry.slug)).toBe(true)
  })

  it('bounds every score in [0,1] and derives it from the published components', () => {
    for (const record of RUN.output.perMedicine) {
      expect(record.score).toBeGreaterThanOrEqual(0)
      expect(record.score).toBeLessThanOrEqual(1)
      // The score a reader sees must be recomputable from the components printed beside it,
      // otherwise the weighting is inspectable in name only.
      expect(record.score).toBeCloseTo(computeDensityScore(record.components), 12)
    }
  })

  it('counts modules and documents consistently with the components it publishes', () => {
    for (const record of RUN.output.perMedicine) {
      expect(record.moduleCount).toBe(record.modulesPresent.length)
      expect(record.moduleCount).toBeLessThanOrEqual(RECORDABLE_MODULES.length)
      expect(record.components.moduleBreadth).toBeCloseTo(
        record.moduleCount / RECORDABLE_MODULES.length,
        12,
      )
      expect(record.components.sourceCorroboration).toBeCloseTo(
        Math.min(record.distinctSourceDocuments, CORROBORATION_SATURATION) /
          CORROBORATION_SATURATION,
        12,
      )
      expect(record.distinctSourceDocuments).toBeLessThanOrEqual(record.sourceAttachments)
      expect(record.sourceAttachmentsWithExcerpt).toBeLessThanOrEqual(record.sourceAttachments)
      // A value either carries a parsed number or is display-only; nothing is counted twice.
      expect(record.numericValues).toBeGreaterThanOrEqual(0)
      expect(record.displayOnlyValues).toBeGreaterThanOrEqual(0)
      if (record.oldestRetrievedAt !== null && record.newestRetrievedAt !== null) {
        expect(record.oldestRetrievedAt <= record.newestRetrievedAt).toBe(true)
      }
    }
  })

  it('accounts for every medicine in the module-count histogram', () => {
    const total = RUN.output.moduleCountHistogram.reduce((sum, bucket) => sum + bucket.medicines, 0)
    expect(total).toBe(CORPUS.length)
    const single = RUN.output.moduleCountHistogram.find((bucket) => bucket.moduleCount === 1)
    expect(RUN.output.singleModuleCount).toBe(single?.medicines ?? 0)
    expect(RUN.output.singleModuleByModule.reduce((sum, bucket) => sum + bucket.medicines, 0)).toBe(
      RUN.output.singleModuleCount,
    )
  })

  it('measures source concentration without ever pairing two medicines', () => {
    const concentration = RUN.output.sourceConcentration
    expect(concentration.distinctDocuments).toBeGreaterThan(0)
    expect(concentration.medicinesOnOneDocument).toBeGreaterThanOrEqual(0)
    expect(concentration.medicinesOnOneDocument).toBeLessThanOrEqual(CORPUS.length)
    expect(concentration.reachSummary?.count).toBe(concentration.distinctDocuments)
    // The widest-reach rows carry a document and a count of records, never a list of records.
    for (const row of concentration.widestReach) {
      expect(row.medicines).toBeGreaterThan(0)
      expect(row.medicines).toBeLessThanOrEqual(CORPUS.length)
      expect(Object.keys(row).sort()).toEqual(['identifier', 'kind', 'medicines'])
    }
    const onOne = RUN.output.perMedicine.filter(
      (record) => record.distinctSourceDocuments === 1,
    ).length
    expect(concentration.medicinesOnOneDocument).toBe(onOne)
  })

  it('reports coverage honestly against the corpus it was handed', () => {
    expect(RUN.coverage.considered).toBe(CORPUS.length)
    expect(RUN.coverage.used).toBeLessThanOrEqual(RUN.coverage.considered)
    expect(RUN.coverage.used).toBe(
      RUN.output.perMedicine.filter((record) => record.moduleCount > 0).length,
    )
  })

  it('queues records that hold a marketed product entry and sit at or below median density', () => {
    const byslug = new Map(RUN.output.perMedicine.map((record) => [record.slug, record]))
    const variants = new Map(
      CORPUS.map((entry) => [entry.slug, entry.background.productVariants?.length ?? 0]),
    )
    // Compared against the threshold the queue actually used, which is the median among records
    // holding a marketed product entry rather than the corpus median. A corpus-wide median compares
    // records of different kinds, and once thousands of rows carried a single transcribed count it
    // fell below every eligible record and the queue silently emptied.
    const median = RUN.parameters.queueCutoffAmongMarketedRecords as number
    expect(median).toBeGreaterThan(0)
    expect((RUN.queue ?? []).length).toBeGreaterThan(0)
    for (const item of RUN.queue ?? []) {
      expect(item.reason).toBe('COVERAGE_GAP')
      expect(byslug.get(item.slug)?.score).toBeLessThanOrEqual(median)
      expect(variants.get(item.slug) ?? 0).toBeGreaterThanOrEqual(1)
      expect(item.question.trim().endsWith('?')).toBe(true)
      expect(item.priority).toBeGreaterThan(0)
      expect(item.sources.length).toBeGreaterThan(0)
    }
    // Ordered most important first, so a reviewer can stop anywhere down the list.
    const priorities = (RUN.queue ?? []).map((item) => item.priority)
    for (let index = 1; index < priorities.length; index += 1) {
      expect(priorities[index]!).toBeLessThanOrEqual(priorities[index - 1]!)
    }
  })

  it('states the variant proxy is unavailable rather than quietly ranking on a flat field', () => {
    // The queue's design called for "many product variants" as a prominence proxy. If the corpus
    // ever cannot supply it, the caveat has to say so, because a queue silently ordered on a field
    // that takes one value is a ranking with no content.
    const widest = Math.max(...CORPUS.map((entry) => entry.background.productVariants?.length ?? 0))
    expect(widest).toBeLessThanOrEqual(2)
    expect(RUN.caveats.join(' ')).toContain(
      `the largest number of product variants on any record is ${widest}`,
    )
    expect(RUN.caveats.join(' ')).toContain('does not rank medicines by prominence')
  })
})

describe('the boundary the score must not cross', () => {
  it('keeps every reader-facing string clear of advice and of claims about medicines', () => {
    const strings: string[] = [
      evidenceDensityAgent.description,
      RUN.coverage.reason,
      ...RUN.caveats,
      ...(RUN.queue ?? []).flatMap((item) => [item.question, item.basis]),
      ...Object.values(RUN.parameters).filter(
        (value): value is string => typeof value === 'string',
      ),
      ...RUN.output.singleModuleByModule.map((bucket) => bucket.module),
    ]
    for (const text of strings) {
      expect(findForbiddenPhrases(text)).toEqual([])
    }
  })

  it('says outright that the score measures the record and not the medicine', () => {
    const caveats = RUN.caveats.join(' ')
    expect(caveats).toContain('does not describe a medicine')
    expect(caveats).toContain('the corpus holds little here')
  })

  it('never implies a medicine is poorly studied', () => {
    const everything = [
      evidenceDensityAgent.description,
      RUN.coverage.reason,
      ...RUN.caveats,
      ...(RUN.queue ?? []).flatMap((item) => [item.question, item.basis]),
    ].join(' ')
    for (const phrase of [
      'poorly studied',
      'little is known',
      'lacks evidence',
      'unproven',
      'insufficient evidence',
      'not well studied',
    ]) {
      expect(everything.toLowerCase()).not.toContain(phrase)
    }
  })
})

describe('the score function itself', () => {
  const base: DensityComponents = {
    moduleBreadth: 0.5,
    sourceCorroboration: 0.5,
    numericComparability: 0.5,
    excerptCoverage: 0.5,
  }

  it('is bounded in [0,1] at every corner of the component space', () => {
    for (const moduleBreadth of [0, 0.5, 1]) {
      for (const sourceCorroboration of [0, 0.5, 1]) {
        for (const numericComparability of [0, 0.5, 1]) {
          for (const excerptCoverage of [0, 0.5, 1]) {
            const score = computeDensityScore({
              moduleBreadth,
              sourceCorroboration,
              numericComparability,
              excerptCoverage,
            })
            expect(score).toBeGreaterThanOrEqual(0)
            expect(score).toBeLessThanOrEqual(1)
          }
        }
      }
    }
    expect(
      computeDensityScore({
        moduleBreadth: 1,
        sourceCorroboration: 1,
        numericComparability: 1,
        excerptCoverage: 1,
      }),
    ).toBeCloseTo(1, 12)
    expect(
      computeDensityScore({
        moduleBreadth: 0,
        sourceCorroboration: 0,
        numericComparability: 0,
        excerptCoverage: 0,
      }),
    ).toBe(0)
  })

  it('is strictly increasing in module count when everything else is held equal', () => {
    let previous = -1
    for (let moduleCount = 0; moduleCount <= RECORDABLE_MODULES.length; moduleCount += 1) {
      const score = computeDensityScore({
        ...base,
        moduleBreadth: moduleCount / RECORDABLE_MODULES.length,
      })
      expect(score).toBeGreaterThan(previous)
      previous = score
    }
  })

  it('holds that monotonicity on the real corpus wherever the other components match', () => {
    // Records that agree on corroboration, comparability and excerpt coverage must be ordered by
    // module count alone. This is the property that makes the index readable as a coverage ranking.
    const byOtherComponents = new Map<string, Map<number, number>>()
    for (const record of RUN.output.perMedicine) {
      const key = [
        record.components.sourceCorroboration.toFixed(9),
        record.components.numericComparability.toFixed(9),
        record.components.excerptCoverage.toFixed(9),
      ].join('|')
      const group = byOtherComponents.get(key) ?? new Map<number, number>()
      const held = group.get(record.moduleCount)
      // Two records agreeing on all four components must agree on the score exactly, so one
      // representative per module count carries the whole group.
      if (held !== undefined) expect(record.score).toBeCloseTo(held, 12)
      else group.set(record.moduleCount, record.score)
      byOtherComponents.set(key, group)
    }

    let comparisons = 0
    for (const group of byOtherComponents.values()) {
      const ordered = [...group].sort((left, right) => left[0] - right[0])
      for (let index = 1; index < ordered.length; index += 1) {
        comparisons += 1
        expect(ordered[index]![1]).toBeGreaterThan(ordered[index - 1]![1])
      }
    }
    // The property is worthless if the corpus never actually produced such a pair.
    expect(comparisons).toBeGreaterThan(0)
  })

  it('publishes weights that sum to one, which is what bounds the composite', () => {
    const total = Object.values(DENSITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
    expect(total).toBeCloseTo(1, 12)
  })
})

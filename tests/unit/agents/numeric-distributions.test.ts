import { describe, expect, it } from 'vitest'

import { BACKGROUND_PROVENANCE_TIERS } from '@/lib/background/types'

import type { MedicineRecordedBackground, RecordedValue } from '@/lib/background/types'
import { findForbiddenPhrases, type AgentCorpusEntry } from '@/lib/agents/core/types'
import {
  MINIMUM_STRATUM_SIZE,
  binValues,
  computeBinEdges,
  normaliseRoute,
  numericDistributionsAgent,
  type DistributionStratum,
  type FieldUnitDistribution,
} from '@/lib/agents/dataset/numeric-distributions'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * Run against the real recorded corpus rather than a fixture. The claims this dataset makes are
 * claims about this corpus — how many recorded half-lives carry no number, whether the two
 * provenance tiers differ, whether litres and litres per kilogram ever meet — and a toy corpus
 * would confirm the arithmetic while proving none of them.
 */

const CORPUS: readonly AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND)
  .map(([slug, background]) => ({ slug, name: slug, background }))
  .sort((left, right) => left.slug.localeCompare(right.slug))

const RUN = numericDistributionsAgent.run({ corpus: CORPUS, seed: 20260828, runDate: '2026-08-28' })

function allStrata(distribution: FieldUnitDistribution): DistributionStratum[] {
  return [
    ...(distribution.overall ? [distribution.overall] : []),
    ...distribution.byRoute.strata,
    ...distribution.byProvenanceTier.strata,
  ]
}

const ALL_DISTRIBUTIONS = RUN.output.fields.flatMap((group) => group.distributions)

/** The recorded value in one field slot, read straight from the corpus for cross-checking. */
function slotValue(
  background: MedicineRecordedBackground,
  field: string,
): RecordedValue | undefined {
  if (field === 'molecularWeight') return background.molecularIdentity?.molecularWeight
  const pk = background.pharmacokinetics
  if (!pk) return undefined
  switch (field) {
    case 'halfLife':
      return pk.halfLife
    case 'tMax':
      return pk.tMax
    case 'bioavailability':
      return pk.bioavailability
    case 'proteinBinding':
      return pk.proteinBinding
    case 'volumeOfDistribution':
      return pk.volumeOfDistribution
    default:
      return undefined
  }
}

describe('recorded numeric distributions on the real corpus', () => {
  it('reads a corpus large enough for the distributions to mean anything', () => {
    expect(CORPUS.length).toBeGreaterThan(2500)
    expect(ALL_DISTRIBUTIONS.length).toBe(7)
  })

  it('reproduces itself exactly for a given seed and run date', () => {
    const again = numericDistributionsAgent.run({
      corpus: CORPUS,
      seed: 20260828,
      runDate: '2026-08-28',
    })
    expect(JSON.stringify(again)).toEqual(JSON.stringify(RUN))
  })

  it('depends on the corpus alone, not on the seed', () => {
    // Nothing here samples or shuffles, so a different seed must change nothing but the echoed
    // seed. If that ever stops being true, an unseeded source of variation has crept in.
    const other = numericDistributionsAgent.run({ corpus: CORPUS, seed: 7, runDate: '2026-08-28' })
    expect(JSON.stringify(other.output)).toEqual(JSON.stringify(RUN.output))
  })

  it('publishes a distribution for every field the corpus records numbers in', () => {
    const fields = RUN.output.fields.map((group) => group.field)
    expect(fields).toEqual([
      'halfLife',
      'tMax',
      'bioavailability',
      'proteinBinding',
      'volumeOfDistribution',
      'molecularWeight',
    ])
    for (const group of RUN.output.fields) {
      expect(group.recordedValues).toBeGreaterThan(0)
      expect(group.distributions.length).toBeGreaterThan(0)
    }
  })

  it('chooses log bins for the order-of-magnitude fields and linear bins for the percentages', () => {
    const scaleOf = new Map(
      ALL_DISTRIBUTIONS.map((distribution) => [
        `${distribution.field}|${distribution.unit}`,
        distribution.scale,
      ]),
    )
    expect(scaleOf.get('halfLife|hours')).toBe('log10')
    expect(scaleOf.get('tMax|hours')).toBe('log10')
    expect(scaleOf.get('volumeOfDistribution|L')).toBe('log10')
    expect(scaleOf.get('volumeOfDistribution|L/kg')).toBe('log10')
    expect(scaleOf.get('molecularWeight|g/mol')).toBe('log10')
    expect(scaleOf.get('bioavailability|%')).toBe('linear')
    expect(scaleOf.get('proteinBinding|%')).toBe('linear')
    // The reason is published beside every distribution, not left to the reader to infer.
    for (const distribution of ALL_DISTRIBUTIONS) {
      expect(distribution.scaleReason.length).toBeGreaterThan(40)
    }
    // Percentage bins come from the definition of a percentage, not from the observed range.
    for (const distribution of ALL_DISTRIBUTIONS.filter((entry) => entry.scale === 'linear')) {
      expect(distribution.binEdges[0]).toBe(0)
      expect(distribution.binEdges[distribution.binEdges.length - 1]).toBe(100)
    }
  })
})

describe('the correctness property: units, bin counts, and display-only values', () => {
  it('never lets a stratum mix litres with litres per kilogram', () => {
    const volume = RUN.output.fields.find((group) => group.field === 'volumeOfDistribution')
    expect(volume).toBeDefined()
    const litres = volume!.distributions.find((entry) => entry.unit === 'L')
    const perKilogram = volume!.distributions.find((entry) => entry.unit === 'L/kg')
    expect(litres).toBeDefined()
    expect(perKilogram).toBeDefined()

    // Counted straight off the corpus, so the agent's own bookkeeping cannot make this pass.
    let inLitres = 0
    let perKilogramCount = 0
    let numericAnyUnit = 0
    for (const entry of CORPUS) {
      const value = slotValue(entry.background, 'volumeOfDistribution')
      if (!value || typeof value.numeric !== 'number' || !Number.isFinite(value.numeric)) continue
      numericAnyUnit += 1
      if (value.unit === 'L') inLitres += 1
      if (value.unit === 'L/kg') perKilogramCount += 1
    }
    expect(inLitres).toBeGreaterThan(0)
    expect(perKilogramCount).toBeGreaterThan(0)
    expect(litres!.overall?.summary.count).toBe(inLitres)
    expect(perKilogram!.overall?.summary.count).toBe(perKilogramCount)
    // No third home and no double home: the two distributions partition the numeric values.
    expect(inLitres + perKilogramCount).toBe(numericAnyUnit)

    // Every stratum of each distribution counts only values of that distribution's unit.
    for (const stratum of allStrata(litres!)) {
      expect(stratum.summary.count).toBeLessThanOrEqual(inLitres)
    }
    for (const stratum of allStrata(perKilogram!)) {
      expect(stratum.summary.count).toBeLessThanOrEqual(perKilogramCount)
    }
    // The two distributions occupy different ranges; a mixed stratum would show up as a maximum
    // in the litre distribution far below one that had absorbed per-kilogram values, or vice versa.
    expect(litres!.overall!.summary.median).toBeGreaterThan(perKilogram!.overall!.summary.median)
  })

  it('gives every distribution exactly one unit, corpus-wide', () => {
    for (const group of RUN.output.fields) {
      const units = group.distributions.map((distribution) => distribution.unit)
      expect(new Set(units).size).toBe(units.length)
      for (const distribution of group.distributions) {
        // Every value the corpus holds in this unit, counted independently of the agent.
        const expected = CORPUS.filter((entry) => {
          const value = slotValue(entry.background, group.field)
          return (
            value !== undefined &&
            typeof value.numeric === 'number' &&
            Number.isFinite(value.numeric) &&
            value.unit === distribution.unit
          )
        }).length
        expect(distribution.overall?.summary.count ?? 0).toBe(expected)
      }
    }
  })

  it('sums every histogram to the count of the stratum it belongs to', () => {
    let checked = 0
    for (const distribution of ALL_DISTRIBUTIONS) {
      for (const stratum of allStrata(distribution)) {
        const total = stratum.histogram.reduce((sum, bin) => sum + bin.count, 0)
        expect(total).toBe(stratum.summary.count)
        expect(stratum.histogram.length).toBe(distribution.binEdges.length - 1)
        checked += 1
      }
    }
    expect(checked).toBeGreaterThan(20)
  })

  it('draws every stratum of a distribution on the same axis, spanning all of its values', () => {
    for (const distribution of ALL_DISTRIBUTIONS) {
      const edges = distribution.binEdges
      expect(edges.length).toBeGreaterThan(1)
      for (let index = 1; index < edges.length; index += 1) {
        expect(edges[index]!).toBeGreaterThan(edges[index - 1]!)
      }
      const overall = distribution.overall
      expect(overall).not.toBeNull()
      expect(overall!.summary.min).toBeGreaterThanOrEqual(edges[0]!)
      expect(overall!.summary.max).toBeLessThanOrEqual(edges[edges.length - 1]!)
      for (const stratum of allStrata(distribution)) {
        expect(stratum.histogram.map((bin) => bin.lowerBound)).toEqual(edges.slice(0, -1))
        expect(stratum.histogram.map((bin) => bin.upperBound)).toEqual(edges.slice(1))
        // Only the final bin closes at the top; anything else would double-count a boundary value.
        const inclusive = stratum.histogram.filter((bin) => bin.upperInclusive)
        expect(inclusive.length).toBe(1)
        expect(inclusive[0]).toBe(stratum.histogram[stratum.histogram.length - 1])
      }
    }
  })

  it('excludes display-only values from every summary while still counting them in the total', () => {
    for (const group of RUN.output.fields) {
      let recorded = 0
      let displayOnly = 0
      for (const entry of CORPUS) {
        const value = slotValue(entry.background, group.field)
        if (!value) continue
        recorded += 1
        if (typeof value.numeric !== 'number' || !Number.isFinite(value.numeric)) displayOnly += 1
      }
      expect(group.recordedValues).toBe(recorded)
      expect(group.displayOnlyValues).toBe(displayOnly)
      expect(group.numericValues).toBe(recorded - displayOnly)

      // The values every summary of this field is computed from, plus the ones no summary can use,
      // account for the recorded total exactly.
      const summarised = group.distributions.reduce(
        (sum, distribution) => sum + (distribution.overall?.summary.count ?? 0),
        0,
      )
      expect(summarised).toBe(group.numericValues - group.offUnitValueCount)
      expect(summarised + group.offUnitValueCount + group.displayOnlyValues).toBe(
        group.recordedValues,
      )
    }
  })

  it('holds the display-only counts the corpus actually has, so the gap is visible', () => {
    const byField = new Map(RUN.output.fields.map((group) => [group.field, group]))
    const halfLife = byField.get('halfLife')
    const bioavailability = byField.get('bioavailability')
    expect(halfLife?.displayOnlyValues).toBeGreaterThan(0)
    expect(bioavailability?.displayOnlyValues).toBeGreaterThan(0)
    // The point of publishing both numbers is that the ratio differs sharply between fields: a
    // reader comparing the two summaries must be able to see that one omits far more than the other.
    const halfLifeShare = halfLife!.displayOnlyValues / halfLife!.recordedValues
    const bioavailabilityShare =
      bioavailability!.displayOnlyValues / bioavailability!.recordedValues
    expect(halfLifeShare).toBeGreaterThan(bioavailabilityShare * 3)
  })

  it('names off-unit numeric values rather than rescaling them into a distribution', () => {
    const tMax = RUN.output.fields.find((group) => group.field === 'tMax')
    expect(tMax).toBeDefined()
    // The corpus records a small number of tMax figures in minutes and in days. They must be
    // reported by unit and absent from the hours distribution, never converted.
    expect(tMax!.offUnitValueCount).toBeGreaterThan(0)
    const units = tMax!.offUnitValues.map((tally) => tally.unit)
    expect(new Set(units).size).toBe(units.length)
    expect(tMax!.offUnitValues.reduce((sum, tally) => sum + tally.count, 0)).toBe(
      tMax!.offUnitValueCount,
    )
    const hours = tMax!.distributions.find((entry) => entry.unit === 'hours')
    expect(hours!.overall!.summary.count).toBe(tMax!.numericValues - tMax!.offUnitValueCount)
  })
})

describe('stratification', () => {
  it('publishes only strata that meet the stated minimum, and counts the rest', () => {
    for (const distribution of ALL_DISTRIBUTIONS) {
      for (const stratified of [distribution.byRoute, distribution.byProvenanceTier]) {
        for (const stratum of stratified.strata) {
          expect(stratum.summary.count).toBeGreaterThanOrEqual(MINIMUM_STRATUM_SIZE)
        }
        const accounted =
          stratified.strata.reduce((sum, stratum) => sum + stratum.summary.count, 0) +
          stratified.valuesBelowMinimum +
          stratified.valuesWithoutKey
        expect(accounted).toBe(distribution.overall?.summary.count ?? 0)
        expect(stratified.note.length).toBeGreaterThan(40)
      }
    }
  })

  it('stratifies pharmacokinetic fields by route and says why molecular weight cannot be', () => {
    const halfLife = RUN.output.fields.find((group) => group.field === 'halfLife')!
    const hours = halfLife.distributions[0]!
    expect(hours.byRoute.strata.length).toBeGreaterThan(2)
    expect(RUN.output.reportedRoutes).toContain('oral')
    for (const key of RUN.output.reportedRoutes) expect(key).toBe(normaliseRoute(key))

    const molecularWeight = RUN.output.fields.find((group) => group.field === 'molecularWeight')!
    const grams = molecularWeight.distributions[0]!
    expect(grams.byRoute.strata).toEqual([])
    expect(grams.byRoute.valuesWithoutKey).toBe(grams.overall?.summary.count ?? 0)
    expect(grams.byRoute.note).toContain('carries no route')
  })

  it('lets a reader see whether the two provenance tiers differ, without ranking them', () => {
    const tiered = ALL_DISTRIBUTIONS.filter(
      (distribution) => distribution.byProvenanceTier.strata.length >= 2,
    )
    expect(tiered.length).toBeGreaterThan(0)
    for (const distribution of tiered) {
      const keys = distribution.byProvenanceTier.strata.map((stratum) => stratum.key).sort()
      // The corpus now has three tiers. Which of them appear depends on what the sources hold, so
      // the assertion is that every tier present is a declared one rather than a fixed list.
      for (const key of keys) expect(BACKGROUND_PROVENANCE_TIERS).toContain(key)
      expect(keys.length).toBeGreaterThan(0)
    }
    // The note has to state that a difference is a fact about how the corpus was built.
    for (const distribution of ALL_DISTRIBUTIONS) {
      expect(distribution.byProvenanceTier.note).toContain('says nothing about whether either is')
    }
  })

  it('reports a multiplicative spread for log-scale strata only', () => {
    for (const distribution of ALL_DISTRIBUTIONS) {
      for (const stratum of allStrata(distribution)) {
        if (distribution.scale === 'linear') {
          expect(stratum.logSpread).toBeUndefined()
          continue
        }
        expect(stratum.logSpread).toBeDefined()
        expect(stratum.logSpread!.spreadFactor).toBeCloseTo(
          10 ** stratum.logSpread!.medianAbsoluteDeviationLog10,
          9,
        )
        expect(stratum.logSpread!.spreadFactor).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('keeps every summary internally ordered', () => {
    for (const distribution of ALL_DISTRIBUTIONS) {
      for (const stratum of allStrata(distribution)) {
        const summary = stratum.summary
        expect(summary.count).toBeGreaterThan(0)
        expect(summary.min).toBeLessThanOrEqual(summary.p25)
        expect(summary.p25).toBeLessThanOrEqual(summary.median)
        expect(summary.median).toBeLessThanOrEqual(summary.p75)
        expect(summary.p75).toBeLessThanOrEqual(summary.max)
      }
    }
  })
})

describe('the boundary this dataset must not cross', () => {
  it('keeps every reader-facing string clear of advice and of claims about medicines', () => {
    const strings: string[] = [
      numericDistributionsAgent.description,
      RUN.coverage.reason,
      ...RUN.caveats,
      ...Object.values(RUN.parameters).filter(
        (value): value is string => typeof value === 'string',
      ),
      ...RUN.output.reportedRoutes,
      ...ALL_DISTRIBUTIONS.flatMap((distribution) => [
        distribution.label,
        distribution.scaleReason,
        distribution.byRoute.note,
        distribution.byProvenanceTier.note,
        ...allStrata(distribution).flatMap((stratum) => [stratum.key, stratum.label]),
      ]),
      ...RUN.output.fields.flatMap((group) => [
        group.label,
        ...group.offUnitValues.map((tally) => tally.unit),
      ]),
    ]
    expect(strings.length).toBeGreaterThan(50)
    for (const text of strings) {
      expect(findForbiddenPhrases(text)).toEqual([])
    }
  })

  it('says plainly that a percentile describes recorded values and not a medicine', () => {
    const caveats = RUN.caveats.join(' ')
    expect(caveats).toContain('describes recorded values')
    expect(caveats).toContain('what source documents state')
    expect(caveats).toContain('typical, normal or expected for any medicine')
    expect(caveats).toContain('body weight no source stated')
  })

  it('never calls any part of a distribution normal, healthy or a reference range', () => {
    const everything = [
      numericDistributionsAgent.description,
      RUN.coverage.reason,
      ...RUN.caveats,
      ...ALL_DISTRIBUTIONS.flatMap((distribution) => [
        distribution.label,
        distribution.scaleReason,
        distribution.byRoute.note,
        distribution.byProvenanceTier.note,
      ]),
    ]
      .join(' ')
      .toLowerCase()
    for (const phrase of [
      'normal range',
      'reference range',
      'expected range',
      'typical half-life',
      'usual half-life',
      'healthy value',
      'abnormal',
      'too high',
      'too low',
      'out of range',
    ]) {
      expect(everything).not.toContain(phrase)
    }
  })

  it('names no medicine anywhere in the output', () => {
    // A distribution is a count of values. A slug in it would turn a statistic back into a claim
    // about a named medicine, and two of them in one row would pair medicines.
    const slugs = new Set(CORPUS.map((entry) => entry.slug))
    const serialised = JSON.stringify(RUN.output).toLowerCase()
    let named = 0
    for (const slug of slugs) {
      // Short slugs collide with ordinary words; the long ones are the decisive test.
      if (slug.length < 8) continue
      if (serialised.includes(`"${slug}"`)) named += 1
    }
    expect(named).toBe(0)
  })

  it('reports coverage against the corpus it was handed', () => {
    expect(RUN.coverage.considered).toBe(CORPUS.length)
    expect(RUN.coverage.used).toBeLessThanOrEqual(RUN.coverage.considered)
    expect(RUN.coverage.used).toBe(RUN.output.recordsWithAnyNumericValue)
    expect(RUN.coverage.used).toBeGreaterThan(0)
  })
})

describe('the binning primitives', () => {
  it('partitions the values it is given, whatever the edges', () => {
    const values = [1, 2, 2, 3, 5, 8, 13, 21, 100]
    const edges = computeBinEdges(values, { unit: 'x', label: 'x', scale: 'log10', bins: 5 })
    const bins = binValues(values, edges)
    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(values.length)
    expect(bins.length).toBe(5)
    // Both extremes land inside the axis rather than off either end.
    expect(bins[0]!.count).toBeGreaterThan(0)
    expect(bins[bins.length - 1]!.count).toBeGreaterThan(0)
  })

  it('handles a degenerate distribution where every recorded value is identical', () => {
    const edges = computeBinEdges([4, 4, 4], { unit: 'x', label: 'x', scale: 'log10', bins: 6 })
    const bins = binValues([4, 4, 4], edges)
    expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(3)
  })

  it('normalises route text by case and whitespace and by nothing else', () => {
    expect(normaliseRoute('  Oral   (tablets) ')).toBe('oral (tablets)')
    expect(normaliseRoute('INTRAVENOUS')).toBe('intravenous')
    // Deliberately not collapsed onto `oral`: that distinction belongs to the source.
    expect(normaliseRoute('Oral (tablets)')).not.toBe('oral')
  })
})

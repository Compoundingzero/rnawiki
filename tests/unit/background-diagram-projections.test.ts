import { describe, expect, it } from 'vitest'

import { steadyStateNoteFromHalfLifeHours } from '@/lib/background/derivations'
import {
  bodyRegionAtlas,
  completenessMatrix,
  durationBandForHours,
  durationOfActionScale,
  exposureTimeline,
  sourceComposition,
  titrationLadder,
  type CorpusEntry,
} from '@/lib/background/diagram-projections'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'

const labelSource: BackgroundSource = {
  kind: 'FDA_LABEL',
  identifier: '00afce9b-48c9-487a-a738-e359c005c707',
  label: 'Synthetic medicine label',
  retrievedAt: '2026-08-27',
  excerpt: 'Synthetic wording: peak at 4 hours, half-life approximately 12 hours.',
}

function entry(slug: string, overrides: Partial<MedicineRecordedBackground> = {}): CorpusEntry {
  return {
    slug,
    name: slug,
    background: {
      version: 'medicine-background/v1',
      authoredAt: '2026-08-27',
      ...overrides,
    },
  }
}

function withHalfLife(slug: string, hours: number | undefined, display: string): CorpusEntry {
  return entry(slug, {
    pharmacokinetics: {
      routeAsRecorded: 'oral tablet',
      halfLife: {
        display,
        ...(hours === undefined ? {} : { numeric: hours, unit: 'hours' }),
        populationContext: 'healthy adults',
        source: labelSource,
      },
    },
  })
}

describe('duration-of-action scale', () => {
  it('places only medicines whose half-life carries a recorded number', () => {
    const projection = durationOfActionScale([
      withHalfLife('fast-medicine', 1.5, 'about 1.5 hours'),
      withHalfLife('slow-medicine', 168, 'about 168 hours'),
      // Recorded only in days with no hour figure: never converted onto the axis.
      withHalfLife('days-only-medicine', undefined, 'approximately 5 days'),
      entry('no-pharmacokinetics'),
    ])

    expect(projection.points.map((point) => point.slug)).toEqual(['fast-medicine', 'slow-medicine'])
    expect(projection.coverage).toEqual({ placed: 2, considered: 4 })
    expect(projection.points[0]!.logHours).toBeCloseTo(Math.log10(1.5))
    expect(projection.points[0]!.source.excerpt).toBe(labelSource.excerpt)
  })

  it('sorts ascending and bands deterministically', () => {
    expect(durationBandForHours(1)).toBe('under_2_hours')
    expect(durationBandForHours(2)).toBe('two_to_6_hours')
    expect(durationBandForHours(11.9)).toBe('six_to_12_hours')
    expect(durationBandForHours(23)).toBe('twelve_to_24_hours')
    expect(durationBandForHours(48)).toBe('one_to_3_days')
    expect(durationBandForHours(168)).toBe('over_3_days')

    const projection = durationOfActionScale([
      withHalfLife('b', 20, 'about 20 hours'),
      withHalfLife('a', 3, 'about 3 hours'),
    ])
    expect(projection.points.map((point) => point.slug)).toEqual(['a', 'b'])
    expect(projection.bands.find((band) => band.band === 'two_to_6_hours')?.count).toBe(1)
  })

  it('reports an empty axis rather than inventing one for an empty corpus', () => {
    const projection = durationOfActionScale([])
    expect(projection.points).toEqual([])
    expect(projection.axis).toEqual({ minLogHours: 0, maxLogHours: 0 })
  })
})

describe('body-region atlas', () => {
  const corpus = [
    entry('medicine-a', {
      anatomyTargets: [
        { regionCode: 'liver', actionAsRecorded: 'acts at the liver', source: labelSource },
        { regionCode: 'kidneys', actionAsRecorded: 'cleared by the kidneys', source: labelSource },
      ],
    }),
    entry('medicine-b', {
      anatomyTargets: [
        { regionCode: 'liver', actionAsRecorded: 'also acts at the liver', source: labelSource },
      ],
    }),
    entry('medicine-c'),
  ]

  it('inverts the corpus into regions with vocabulary coordinates and provenance', () => {
    const atlas = bodyRegionAtlas(corpus)
    const liver = atlas.regions.find((region) => region.regionCode === 'liver')

    expect(liver).toMatchObject({ label: 'Liver', x: 112, y: 118 })
    expect(liver!.medicines.map((medicine) => medicine.slug)).toEqual(['medicine-a', 'medicine-b'])
    expect(liver!.medicines[0]!.source.identifier).toBe(labelSource.identifier)
    // Most-populated region first, so a renderer can weight without re-sorting.
    expect(atlas.regions[0]!.regionCode).toBe('liver')
    expect(atlas.coverage).toEqual({ medicinesWithRegions: 2, considered: 3, regionsUsed: 2 })
  })

  it('drops region codes outside the controlled vocabulary', () => {
    const atlas = bodyRegionAtlas([
      entry('bad-region', {
        anatomyTargets: [
          {
            regionCode: 'not-a-region' as never,
            actionAsRecorded: 'anything',
            source: labelSource,
          },
        ],
      }),
    ])
    expect(atlas.regions).toEqual([])
  })
})

describe('exposure timeline', () => {
  it('anchors on a recorded numeric half-life and marks the derived steady state', () => {
    const timeline = exposureTimeline({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-27',
      pharmacokinetics: {
        routeAsRecorded: 'oral tablet',
        tMax: {
          display: '4 hours',
          numeric: 4,
          unit: 'hours',
          populationContext: 'healthy adults',
          source: labelSource,
        },
        halfLife: {
          display: 'approximately 12 hours',
          numeric: 12,
          unit: 'hours',
          populationContext: 'healthy adults',
          source: labelSource,
        },
        steadyStateNote: steadyStateNoteFromHalfLifeHours(12),
      },
    })

    expect(timeline!.markers.map((marker) => marker.kind)).toEqual([
      'peak',
      'half_life',
      'steady_state',
    ])
    expect(timeline!.markers[2]).toMatchObject({ hours: 60, derived: true })
    expect(timeline!.markers[0]!.derived).toBe(false)
    expect(timeline!.maxHours).toBe(60)
  })

  it('returns null without a numeric half-life to anchor the axis', () => {
    expect(
      exposureTimeline({
        version: 'medicine-background/v1',
        authoredAt: '2026-08-27',
        pharmacokinetics: {
          routeAsRecorded: 'oral tablet',
          halfLife: {
            display: 'approximately 5 days',
            populationContext: 'healthy adults',
            source: labelSource,
          },
        },
      }),
    ).toBeNull()
    expect(
      exposureTimeline({ version: 'medicine-background/v1', authoredAt: '2026-08-27' }),
    ).toBeNull()
  })

  it('omits a peak marker whose recorded unit is not hours', () => {
    const timeline = exposureTimeline({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-27',
      pharmacokinetics: {
        routeAsRecorded: 'oral tablet',
        tMax: {
          display: '40 minutes',
          numeric: 40,
          unit: 'minutes',
          populationContext: 'healthy adults',
          source: labelSource,
        },
        halfLife: {
          display: 'approximately 12 hours',
          numeric: 12,
          unit: 'hours',
          populationContext: 'healthy adults',
          source: labelSource,
        },
      },
    })
    expect(timeline!.markers.some((marker) => marker.kind === 'peak')).toBe(false)
  })
})

describe('titration ladder', () => {
  it('orders recorded steps and keeps amounts as recorded strings', () => {
    const ladder = titrationLadder({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-27',
      titration: {
        basis: 'LABEL_SCHEDULE',
        steps: [
          { order: 2, periodAsRecorded: 'Weeks 5-8', amountAsRecorded: '0.5 mg once weekly' },
          { order: 1, periodAsRecorded: 'Weeks 1-4', amountAsRecorded: '0.25 mg once weekly' },
        ],
        source: labelSource,
      },
    })

    expect(ladder!.steps.map((step) => step.order)).toEqual([1, 2])
    expect(ladder!.steps[0]!.amount).toBe('0.25 mg once weekly')
    expect(ladder!.basisLabel).toContain('as stated on the product label')
  })

  it('returns null when no schedule was recorded', () => {
    expect(
      titrationLadder({ version: 'medicine-background/v1', authoredAt: '2026-08-27' }),
    ).toBeNull()
  })
})

describe('completeness matrix and source composition', () => {
  const corpus = [
    entry('rich', {
      registryIdentifiers: { pubchemCid: '1', source: labelSource },
      pharmacokinetics: {
        routeAsRecorded: 'oral',
        halfLife: {
          display: '12 hours',
          numeric: 12,
          unit: 'hours',
          populationContext: 'adults',
          source: labelSource,
        },
      },
      anatomyTargets: [{ regionCode: 'liver', actionAsRecorded: 'acts here', source: labelSource }],
    }),
    entry('sparse', {
      registryIdentifiers: {
        pubchemCid: '2',
        source: { ...labelSource, kind: 'PUBCHEM', identifier: '2', excerpt: undefined },
      },
    }),
  ]

  it('reports recorded modules per medicine and corpus-wide shares', () => {
    const matrix = completenessMatrix(corpus)
    expect(matrix.corpusSize).toBe(2)
    expect(matrix.rows[0]!.slug).toBe('rich')
    expect(matrix.rows[0]!.recordedCount).toBe(3)
    expect(matrix.rows[1]!.modules.pharmacokinetics).toBe(false)
    const identifiers = matrix.moduleTotals.find((total) => total.module === 'registryIdentifiers')
    expect(identifiers).toMatchObject({ recorded: 2, share: 1 })
    const cost = matrix.moduleTotals.find((total) => total.module === 'costContext')
    expect(cost).toMatchObject({ recorded: 0, share: 0 })
  })

  it('profiles provenance by source kind without double-counting artifacts', () => {
    const composition = sourceComposition(corpus)
    const fdaLabel = composition.byKind.find((kind) => kind.kind === 'FDA_LABEL')
    expect(fdaLabel).toMatchObject({ recordedValues: 3, medicines: 1 })
    expect(composition.totalRecordedValues).toBe(4)
    // Three values cite one label artifact; the PubChem entry is a second distinct source.
    expect(composition.distinctSources).toBe(2)
  })
})

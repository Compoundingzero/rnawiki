import { describe, expect, it } from 'vitest'

import {
  chemicalSpace,
  MOLECULAR_PROPERTIES_VERSION,
  propertyDistribution,
  ruleOfFiveSummary,
  type MolecularPropertyRecord,
} from '@/lib/background/molecular-properties'
import { MOLECULAR_PROPERTIES } from '../../scripts/seed-data/background/molecular-properties.generated'
import { RECORDED_BACKGROUND } from '../../scripts/seed-data/background'

function record(overrides: Partial<MolecularPropertyRecord> = {}): MolecularPropertyRecord {
  return {
    version: MOLECULAR_PROPERTIES_VERSION,
    cid: '12345',
    retrievedAt: '2026-08-27',
    molecularFormula: 'C9H8O4',
    molecularWeight: 180.16,
    xLogP: 1.2,
    hBondDonorCount: 1,
    hBondAcceptorCount: 4,
    rotatableBondCount: 3,
    tpsa: 63.6,
    heavyAtomCount: 13,
    ...overrides,
  }
}

describe('rule-of-five summary', () => {
  it('counts exceeded thresholds and always reports its components', () => {
    const summary = ruleOfFiveSummary(record())
    expect(summary).toMatchObject({ exceededCount: 0, complete: true })
    expect(summary!.components).toHaveLength(4)
    expect(summary!.components.every((component) => component.exceeded === false)).toBe(true)
  })

  it('marks each exceeded property individually', () => {
    const summary = ruleOfFiveSummary(
      record({ molecularWeight: 4113, xLogP: 6.2, hBondDonorCount: 30, hBondAcceptorCount: 40 }),
    )
    expect(summary!.exceededCount).toBe(4)
    expect(summary!.components.map((component) => component.exceeded)).toEqual([
      true,
      true,
      true,
      true,
    ])
  })

  it('returns null rather than a partial summary when a descriptor is missing', () => {
    expect(ruleOfFiveSummary(record({ xLogP: undefined }))).toBeNull()
  })
})

describe('chemical space projection', () => {
  it('places only records carrying both axes and reports coverage', () => {
    const projection = chemicalSpace([
      { slug: 'small', name: 'small', record: record({ molecularWeight: 180, xLogP: 1.2 }) },
      { slug: 'large', name: 'large', record: record({ molecularWeight: 900, xLogP: 4 }) },
      { slug: 'no-logp', name: 'no-logp', record: record({ xLogP: undefined }) },
    ])
    expect(projection.points.map((point) => point.slug)).toEqual(['small', 'large'])
    expect(projection.coverage).toEqual({ placed: 2, considered: 3 })
    expect(projection.axes.molecularWeight).toEqual({ min: 180, max: 900 })
    expect(projection.points[0]!.ruleOfFiveExceeded).toBe(0)
  })

  it('reports empty axes for an empty corpus instead of inventing a range', () => {
    const projection = chemicalSpace([])
    expect(projection.points).toEqual([])
    expect(projection.axes.xLogP).toEqual({ min: 0, max: 0 })
  })
})

describe('property distribution', () => {
  it('bins values with a half-open lower-inclusive rule and lists members', () => {
    const bins = propertyDistribution(
      [
        { slug: 'a', record: record({ molecularWeight: 150 }) },
        { slug: 'b', record: record({ molecularWeight: 200 }) },
        { slug: 'c', record: record({ molecularWeight: 999 }) },
        { slug: 'no-value', record: record({ molecularWeight: undefined }) },
      ],
      'molecularWeight',
      [0, 200, 500],
    )
    expect(bins.map((bin) => bin.count)).toEqual([1, 1, 1])
    expect(bins[0]!.slugs).toEqual(['a'])
    // 200 lands in the second bin, not the first: the lower edge is inclusive.
    expect(bins[1]!.slugs).toEqual(['b'])
    expect(bins[2]!.label).toBe('500 and above')
    expect(bins[2]!.slugs).toEqual(['c'])
  })
})

describe('generated dataset', () => {
  it('carries the versioned envelope and a CID on every record', () => {
    const records = Object.values(MOLECULAR_PROPERTIES)
    expect(records.length).toBeGreaterThan(50)
    for (const entry of records) {
      expect(entry.version).toBe(MOLECULAR_PROPERTIES_VERSION)
      expect(entry.cid).toMatch(/^[1-9]\d*$/u)
      expect(entry.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/u)
    }
  })

  it('keys every record to a recorded medicine and its recorded CID', () => {
    for (const [slug, entry] of Object.entries(MOLECULAR_PROPERTIES)) {
      const background = RECORDED_BACKGROUND[slug]
      expect(background, `${slug} must exist in the recorded-background corpus`).toBeDefined()
      // The generated dataset may never introduce an identifier the verified corpus does not hold.
      expect(background!.registryIdentifiers?.pubchemCid).toBe(entry.cid)
    }
  })
})

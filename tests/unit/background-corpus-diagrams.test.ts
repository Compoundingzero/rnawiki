import { describe, expect, it } from 'vitest'

import {
  evidenceGapMatrix,
  handlingNetwork,
  sharedReactionIndex,
  sizePersistenceScatter,
  type CorpusEntry,
} from '@/lib/background/diagram-projections'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The projections are run over the real corpus, not a fixture, because their whole purpose is to
 * make thousands of records plottable. A projection that works on three synthetic entries and
 * breaks on the corpus would pass a fixture test and fail the only use it has.
 */
const CORPUS: CorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(([slug, background]) => ({
  slug,
  name: slug.replace(/-/gu, ' '),
  background,
}))

describe('handling network', () => {
  const projection = handlingNetwork(CORPUS)

  it('draws a node for counterparties the corpus actually names', () => {
    expect(projection.nodes.length).toBeGreaterThan(0)
    expect(projection.medicinesWithRecordedHandling).toBeGreaterThan(0)
  })

  it('keeps the naming sentence on every edge, so a tooltip can quote it', () => {
    for (const node of projection.nodes.slice(0, 50)) {
      for (const edge of node.edges) {
        expect(edge.source.excerpt, `${node.counterparty} → ${edge.slug}`).toBeDefined()
      }
    }
  })

  it('counts role-less edges rather than hiding them', () => {
    const total = projection.nodes.reduce((sum, node) => sum + node.edges.length, 0)
    const withRole = projection.nodes.reduce(
      (sum, node) => sum + node.edges.filter((edge) => edge.role).length,
      0,
    )
    expect(projection.edgesWithoutRole).toBe(total - withRole)
  })
})

describe('evidence gap matrix', () => {
  const projection = evidenceGapMatrix(CORPUS)

  it('accounts for every medicine in every population row', () => {
    for (const cell of projection.cells) {
      const total = cell.studied + cell.notEstablished + cell.statementOnly + cell.silent
      expect(total, cell.population).toBe(projection.medicinesConsidered)
    }
  })

  it('keeps silence separate from a stated negative', () => {
    const pediatric = projection.cells.find((cell) => cell.population === 'PEDIATRIC')!
    // Both are real states in the corpus and must never be merged into one bar.
    expect(pediatric.silent).toBeGreaterThan(0)
    expect(pediatric.notEstablished).toBeGreaterThan(0)
  })
})

describe('shared reaction index', () => {
  const projection = sharedReactionIndex(CORPUS)

  it('lists only reactions more than one medicine recorded', () => {
    for (const entry of projection.entries) {
      expect(entry.medicines.length).toBeGreaterThan(1)
    }
  })

  it('keeps each medicine on its own threshold rather than pooling rates', () => {
    const entry = projection.entries[0]
    if (!entry) return
    for (const medicine of entry.medicines) {
      expect(medicine.threshold.length).toBeGreaterThan(0)
      expect(medicine.source.excerpt).toContain(entry.event.split(' ')[0]!)
    }
  })
})

describe('size and persistence scatter', () => {
  const projection = sizePersistenceScatter(CORPUS)

  it('plots only medicines carrying both numbers', () => {
    for (const point of projection.points) {
      expect(Number.isFinite(point.molecularWeight)).toBe(true)
      expect(Number.isFinite(point.halfLifeHours)).toBe(true)
    }
  })

  it('reports how many medicines had one number but not the other', () => {
    expect(projection.incomplete).toBeGreaterThan(0)
  })

  it('keeps both quoted sentences on every point', () => {
    for (const point of projection.points) {
      expect(point.weightSource.excerpt).toBeDefined()
      expect(point.halfLifeSource.excerpt).toBeDefined()
    }
  })
})

import { describe, expect, it } from 'vitest'

import {
  buildCoverageReport,
  parseCsv,
  tierMapFromCsv,
  type Background,
  type InventoryPage,
  type SourceCoverage,
} from '../../scripts/research/coverage-core'

const coverage: SourceCoverage = {
  source: 'openfda-label',
  corpus_pages_by_tier: { '1': 3, '2': 4, '3': 5 },
  pages_matched_by_tier: { '1': 1, '2': 2, '3': 0 },
  fields_gained_by_tier: { '1': { boxed_warning: 1 }, '2': {}, '3': {} },
  pages_by_match_rule: { unii: 3 },
  rows_in_mapped_parquet: 12,
}

function page(slug: string, changes: Partial<InventoryPage> = {}): InventoryPage {
  return {
    slug,
    name: slug,
    publicationState: 'limited',
    substanceType: 'prescription_medicine',
    availability: 'prescription_only',
    hasCorpusPage: false,
    reviewedClaims: 0,
    humanResultCards: 0,
    journeySteps: 0,
    ...changes,
  }
}

describe('research coverage queue', () => {
  it('parses quoted commas and line breaks without splitting keys or names', () => {
    expect(parseCsv('key,slug,tier\r\n"COMBO:{a,b}",alpha,1\r\n"x""y","name\npart",2\r\n')).toEqual(
      [
        ['key', 'slug', 'tier'],
        ['COMBO:{a,b}', 'alpha', '1'],
        ['x"y', 'name\npart', '2'],
      ],
    )
    expect(tierMapFromCsv('slug,tier\nalpha,1\nalpha,2\n').tiers.get('alpha')).toBe('ambiguous')
  })

  it('reconciles separate denominators and never treats source aggregates as /d coverage', () => {
    const pages = [
      page('alpha', { hasCorpusPage: true, publicationState: 'correction_hold' }),
      page('beta', { hasCorpusPage: true, humanResultCards: 2 }),
      page('gamma', { humanResultCards: 1 }),
      page('delta'),
    ]
    const backgrounds: Record<string, Background> = {
      beta: {
        safety: { boxedWarning: { textAsRecorded: 'Label warning.' } } as Background['safety'],
        registryIdentifiers: { unii: 'ABC' } as Background['registryIdentifiers'],
      },
      gamma: { recordedUses: { statements: [{}] } as Background['recordedUses'] },
      outside: {},
    }
    const tierCsv = 'key,slug,tier\n"COMBO:{a,b}",alpha,1\nx,beta,2\ny,gamma,3\n'
    const report = buildCoverageReport({ pages, backgrounds, tierCsv, sourceCoverage: coverage })

    expect(report.denominators).toMatchObject({
      inventoryPages: 4,
      backgroundRecords: 3,
      inventoryWithBackground: 2,
      inventoryWithoutBackground: 2,
      backgroundOutsideInventory: 1,
      localCorpusAndBackground: 1,
      localCorpusWithoutBackground: 1,
      noLocalCorpusWithBackground: 1,
      neitherLocalCorpusNorBackground: 1,
      inventoryWithTier: 3,
      inventoryWithoutTier: 1,
    })
    expect(report.tierCoverage.unmatched?.inventory_pages).toBe(1)
    expect(report.sourceMapperCoverage.corpusPagesByTier).toEqual({ '1': 3, '2': 4, '3': 5 })
    expect(report.queue.map((item) => [item.slug, item.lane])).toEqual([
      ['alpha', 'identity_review'],
      ['beta', 'product_label_safety_review'],
      ['gamma', 'human_result_scope_review'],
      ['delta', 'background_acquisition'],
    ])
  })

  it('is deterministic, bounded, and fails on duplicate inventory slugs', () => {
    const pages = [page('zeta'), page('alpha')]
    const input = {
      pages,
      backgrounds: {} as Record<string, Background>,
      tierCsv: 'slug,tier\n',
      sourceCoverage: coverage,
      limit: 1,
    }
    const first = buildCoverageReport(input)
    expect(first.queue).toHaveLength(1)
    expect(first.queue[0]?.slug).toBe('alpha')
    expect(buildCoverageReport(input)).toEqual(first)
    expect(() => buildCoverageReport({ ...input, pages: [...pages, page('alpha')] })).toThrow(
      'Duplicate or empty inventory slug',
    )
  })

  it('assigns a baseline verification lane when context exists but no earlier research flag applies', () => {
    const pages = [page('context-only', { hasCorpusPage: true })]
    const backgrounds: Record<string, Background> = {
      'context-only': {
        recordedUses: { statements: [{}] } as Background['recordedUses'],
        registryIdentifiers: { unii: 'ABC' } as Background['registryIdentifiers'],
      },
    }
    const report = buildCoverageReport({
      pages,
      backgrounds,
      tierCsv: 'slug,tier\ncontext-only,1\n',
      sourceCoverage: coverage,
    })
    expect(report.queue).toMatchObject([
      {
        slug: 'context-only',
        lane: 'baseline_claim_review',
        signals: ['source_bound_first_screen_unverified'],
      },
    ])
    expect(report.queueCounts.baseline_claim_review).toBe(1)
    expect(Object.values(report.queueCounts).reduce((sum, count) => sum + count, 0)).toBe(
      report.denominators.inventoryPages,
    )
  })
})

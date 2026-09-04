import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HomeSearchResults, type DrugSearch } from '@/components/HomeSearch'
import {
  mergeSearchResults,
  searchResultFieldCountLabel,
  searchResultTierLabel,
  type CorpusSearchResultRow,
} from '@/lib/corpus/search-results'
import type { SearchHit } from '@/lib/api-client'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

function hit(overrides: Partial<SearchHit> = {}): SearchHit {
  return {
    slug: 'metformin',
    name: 'Metformin',
    tradeName: 'Glucophage',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    patientFriendlyIndication: 'Type 2 diabetes',
    dossierDepth: 'curated',
    ...overrides,
  } as SearchHit
}

function corpusHit(overrides: Partial<CorpusSearchResultRow> = {}): CorpusSearchResultRow {
  return {
    slug: 'met-compound-4',
    name: 'MET-4',
    tier: 3,
    model: 'DEVELOPMENT',
    presentFieldCount: 2,
    applicableFieldCount: 8,
    indexable: false,
    ...overrides,
  }
}

function search(rows: DrugSearch['rows'], patch: Partial<DrugSearch> = {}): DrugSearch {
  return {
    query: 'met',
    setQuery: () => {},
    results: [],
    corpusResults: [],
    rows,
    isSearching: false,
    isOpen: true,
    open: () => {},
    close: () => {},
    reset: () => {},
    activeIndex: -1,
    setActiveIndex: () => {},
    onKeyDown: () => {},
    containerRef: { current: null },
    listboxId: 'listbox',
    optionId: (index: number) => `listbox-option-${index}`,
    ...patch,
  }
}

describe('merging the corpus results into the search list', () => {
  it('ranks Tier 1 above Tier 2 above Tier 3, written records first inside a tier', () => {
    const merged = mergeSearchResults(
      [
        hit({ slug: 'development-drug', name: 'Development drug', tier: 3 }),
        hit({ slug: 'rapamycin', name: 'Rapamycin', tier: 1 }),
        hit({ slug: 'unloaded', name: 'Unloaded record' }),
      ],
      [
        corpusHit({ slug: 'met-4', name: 'MET-4', tier: 3 }),
        corpusHit({ slug: 'senolytic-a', name: 'Senolytic A', tier: 1, presentFieldCount: 9 }),
        corpusHit({ slug: 'clinical-c', name: 'Clinical C', tier: 2, presentFieldCount: 5 }),
      ],
    )

    expect(merged.map((row) => row.slug)).toEqual([
      'rapamycin',
      'senolytic-a',
      'unloaded',
      'clinical-c',
      'development-drug',
      'met-4',
    ])
    expect(merged.map((row) => row.kind)).toEqual([
      'legacy',
      'corpus',
      'legacy',
      'corpus',
      'legacy',
      'corpus',
    ])
    // A written record the corpus has not loaded keeps the middle tier rather than falling last.
    expect(merged.find((row) => row.slug === 'unloaded')?.tier).toBe(2)
  })

  it('keeps a slug once, as the written record, and works with no corpus results at all', () => {
    const merged = mergeSearchResults(
      [hit({ slug: 'metformin', tier: 2 })],
      [corpusHit({ slug: 'metformin', name: 'Metformin', tier: 2 })],
    )
    expect(merged).toHaveLength(1)
    expect(merged[0]?.kind).toBe('legacy')

    const unchanged = mergeSearchResults([hit({ slug: 'a' }), hit({ slug: 'b' })])
    expect(unchanged.map((row) => row.slug)).toEqual(['a', 'b'])
  })

  it('states the field count on a Development row only', () => {
    const [tier3] = mergeSearchResults([], [corpusHit()])
    const [tier1] = mergeSearchResults([], [corpusHit({ slug: 'x', tier: 1 })])
    expect(searchResultFieldCountLabel(tier3!)).toBe('2 of 8 fields recorded')
    expect(searchResultFieldCountLabel(tier1!)).toBeNull()
    expect(searchResultTierLabel(1)).toBe('Longevity or withdrawn record')
    expect(searchResultTierLabel(3)).toBe('Development record')
  })
})

describe('the home search results list', () => {
  it('prints the name, the tier and the Tier 3 field count, and links every row', () => {
    const rows = mergeSearchResults(
      [hit({ slug: 'rapamycin', name: 'Rapamycin', tier: 1 })],
      [corpusHit({ slug: 'met-4', name: 'MET-4', tier: 3, presentFieldCount: 2 })],
    )
    const markup = renderToStaticMarkup(
      React.createElement(HomeSearchResults, { search: search(rows) }),
    )

    expect(markup).toContain('Rapamycin')
    expect(markup).toContain('Longevity or withdrawn record')
    expect(markup).toContain('MET-4')
    expect(markup).toContain('Development record')
    expect(markup).toContain('2 of 8 fields recorded')
    expect(markup).toContain('href="/d/met-4"')
    expect(markup).toContain('rel="nofollow"')
    expect(markup.match(/role="option"/g)).toHaveLength(2)
    // A corpus record has no written record, so its row invents no indication or medicine kind.
    const corpusRow = markup.slice(markup.indexOf('href="/d/met-4"'))
    expect(corpusRow).toContain('MET-4')
    expect(corpusRow).not.toContain('Type 2 diabetes')
    expect(corpusRow).not.toContain('Small chemical medicine')
  })

  it('says nothing was found, and says when it is still searching', () => {
    expect(
      renderToStaticMarkup(React.createElement(HomeSearchResults, { search: search([]) })),
    ).toContain('No matching medicines found')
    expect(
      renderToStaticMarkup(
        React.createElement(HomeSearchResults, { search: search([], { isSearching: true }) }),
      ),
    ).toContain('Searching')
  })

  it('leaves the frozen input and its props untouched while the list changes', () => {
    const source = readFileSync(join(process.cwd(), 'components/HomeSearch.tsx'), 'utf8')
    expect(source).toContain('export interface HomeSearchProps {\n  popular: SearchHit[]\n}')
    expect(source).toContain('placeholder="Search medicine, condition, gene, or protein..."')
    expect(source).toContain('<HomeSearchResults search={search} />')
    // The header keeps the written-record list it had: corpus rows are opt-in.
    const header = readFileSync(join(process.cwd(), 'components/SiteHeader.tsx'), 'utf8')
    expect(header).not.toContain('includeCorpusResults')
    expect(header).toContain('search.results')
  })
})

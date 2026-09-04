/**
 * The browse spec's three-click guarantee (docs/specs/browse.md, R12).
 *
 * Home → facet index → list page → record must reach every indexed record. The facet index
 * therefore links each value's letter sub-pages and page numbers itself; without them a record on
 * the second page of a value, or on any letter sub-page, sits four clicks from home.
 */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { FacetValueList } from '@/app/browse/facet-view'
import {
  facetValueSubPages,
  FACET_LETTER_SPLIT_THRESHOLD,
  type CorpusFacetRecord,
} from '@/lib/corpus/facets'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

function records(count: number, name: (index: number) => string): CorpusFacetRecord[] {
  return Array.from({ length: count }, (_unused, index) => ({
    key: `K${index}`,
    slug: `record-${index}`,
    name: name(index),
    tier: 1,
    model: 'CLINICAL',
    withdrawn: false,
    indexable: true,
    presentFieldCount: 12,
    applicableFieldCount: 18,
    updatedAt: new Date('2026-09-05T00:00:00.000Z'),
    firstQuestion: null,
    topRung: null,
    humanData: null,
    evidenceTier: null,
    values: { class: [], pathway: [], evidence: [], status: [], type: [] },
  }))
}

describe('facet value sub-pages', () => {
  it('adds nothing where the value is one page: the value link is already the list', () => {
    expect(facetValueSubPages(records(60, (index) => `Medicine ${index}`))).toEqual([])
  })

  it('links pages two onward for a paginated value', () => {
    const subPages = facetValueSubPages(records(130, (index) => `Medicine ${index}`))
    expect(subPages.map((subPage) => subPage.label)).toEqual(['2', '3'])
    expect(subPages.map((subPage) => subPage.count)).toEqual([60, 10])
    expect(subPages.every((subPage) => subPage.letter === undefined)).toBe(true)
  })

  it('links every letter sub-page, and every further page of a letter, for a split value', () => {
    // Above the split threshold, with one letter that runs past a single page.
    const large = [
      ...records(FACET_LETTER_SPLIT_THRESHOLD + 1, (index) => `Alpha ${index}`),
      ...records(5, (index) => `Beta ${index}`),
    ]
    const subPages = facetValueSubPages(large)

    const letters = new Set(subPages.map((subPage) => subPage.letter))
    expect(letters).toEqual(new Set(['a', 'b']))
    expect(subPages.filter((subPage) => subPage.letter === 'b')).toEqual([
      { letter: 'b', page: 1, label: 'B', count: 5 },
    ])
    // Page one of a letter is the letter link itself; every later page is linked beside it.
    const alpha = subPages.filter((subPage) => subPage.letter === 'a')
    expect(alpha[0]).toMatchObject({ page: 1, label: 'A' })
    expect(alpha[alpha.length - 1]!.label).toBe(`A ${alpha.length}`)
    expect(alpha.reduce((total, subPage) => total + subPage.count, 0)).toBe(
      FACET_LETTER_SPLIT_THRESHOLD + 1,
    )
  })
})

describe('facet index markup', () => {
  it('puts every list page one click from the index, as a labelled link', () => {
    const html = renderToStaticMarkup(
      React.createElement(FacetValueList, {
        facet: 'type' as const,
        values: [
          {
            id: 'longevity',
            label: 'Longevity',
            count: 130,
            subPages: [
              { page: 2, label: '2', count: 60 },
              { page: 3, label: '3', count: 10 },
            ],
          },
          {
            id: 'clinical',
            label: 'Clinical',
            count: 400,
            subPages: [{ letter: 'a', page: 1, label: 'A', count: 40 }],
          },
        ],
      }),
    )

    expect(html).toContain('href="/browse/type/longevity"')
    expect(html).toContain('href="/browse/type/longevity?page=2"')
    expect(html).toContain('href="/browse/type/longevity?page=3"')
    expect(html).toContain('href="/browse/type/clinical/a"')
    // A bare "2" is not a link name a screen reader can use, so each carries its value.
    expect(html).toContain('aria-label="Longevity, 2"')
    expect(html).toContain('aria-label="Clinical, A"')
  })

  it('renders no sub-page list for a value that fits on its own page', () => {
    const html = renderToStaticMarkup(
      React.createElement(FacetValueList, {
        facet: 'pathway' as const,
        values: [{ id: 'mtor', label: 'mTOR', count: 12, subPages: [] }],
      }),
    )
    expect(html).toContain('href="/browse/pathway/mtor"')
    expect(html).not.toContain('data-sub-page')
  })
})

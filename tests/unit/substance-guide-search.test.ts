import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { mergeSearchResults } from '@/lib/corpus/search-results'
import { exactSubstanceGuideQuery, searchSubstanceGuides } from '@/lib/guides/substance-guides'
import {
  protectedIdentityForQuery,
  PUBLIC_IDENTITY_PROTECTIONS,
} from '@/lib/inventory/public-identity-protections'

describe('compound and programme names are not silently merged', () => {
  it.each(['biote', 'BioTE BHRT', 'bhrt'])('%s finds the hormone-programme guide', (query) => {
    expect(searchSubstanceGuides(query).map((guide) => guide.slug)).toContain('biote-bhrt')
  })

  it.each(['magnesium lysinate glycinate', 'magnesium lysinate gyclinate'])(
    '%s finds the exact chelate guide',
    (query) => {
      expect(searchSubstanceGuides(query).map((guide) => guide.slug)).toContain(
        'magnesium-lysinate-glycinate',
      )
    },
  )

  it('does not pretend an ordinary magnesium glycinate search is the lysinate form', () => {
    expect(searchSubstanceGuides('magnesium glycinate')).toEqual([])
    expect(searchSubstanceGuides('magnesium')).toEqual([])
    expect(exactSubstanceGuideQuery('biote')).toBe(true)
  })

  it('puts an identity guide before a misleading medicine search hit', () => {
    const guide = searchSubstanceGuides('biote')[0]!
    const rows = mergeSearchResults(
      [],
      [{ slug: 'irinotecan', name: 'Irinotecan', tier: 1, presentFieldCount: 4 }],
      [
        {
          slug: guide.slug,
          name: guide.searchLabel,
          hint: guide.searchHint,
          href: `/guides/${guide.slug}`,
        },
      ],
    )
    expect(rows.map((row) => row.slug)).toEqual(['biote-bhrt', 'irinotecan'])
  })

  it('protects magnesium glycinate from the committed glycine redirect', () => {
    const ledger = readFileSync('data/revamp/identity/legacy-redirects.csv', 'utf8')
    expect(ledger).toContain('magnesium-glycinate,glycine,MERGED')
    expect(protectedIdentityForQuery('Magnesium glycinate')).toBe('magnesium-glycinate')
    expect(PUBLIC_IDENTITY_PROTECTIONS['magnesium-glycinate'].wrongTarget).toBe('glycine')
  })
})

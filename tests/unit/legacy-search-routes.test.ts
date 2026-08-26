import { describe, expect, it } from 'vitest'

import { LEGACY_COMPOUND_SLUG_OVERRIDES, legacyPathIsGone } from '@/lib/seo/legacy-routes'

describe('legacy search migration map', () => {
  it.each([
    '/protocol',
    '/protocol/unsafe-old-plan',
    '/goal/longevity',
    '/target/pcsk9',
    '/pathways',
    '/learn/2',
    '/solve.html',
    '/p/abc123',
    '/p.html',
    '/newsletter',
    '/c',
    '/c/inclisiran/old-detail',
    '/t/compound',
    '/t/compound/inclisiran/old-detail',
  ])('returns gone for retired route %s', (path) => {
    expect(legacyPathIsGone(path)).toBe(true)
  })

  it('does not catch a current route or an exact legacy compound identity', () => {
    expect(legacyPathIsGone('/d/inclisiran')).toBe(false)
    expect(legacyPathIsGone('/c/inclisiran')).toBe(false)
  })

  it('keeps the verified old-to-current rapamycin identity exception', () => {
    expect(LEGACY_COMPOUND_SLUG_OVERRIDES['rapamycin-sirolimus']).toBe('rapamycin')
  })
})

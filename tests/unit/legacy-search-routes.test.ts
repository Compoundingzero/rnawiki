import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { middleware } from '@/middleware'
import { PUBLIC_PLACEHOLDER_MEDICINE_SLUGS } from '@/lib/public-data-integrity'
import {
  LEGACY_COMPOUND_SLUG_OVERRIDES,
  legacyPathIsGone,
  placeholderMedicineRouteIsGone,
} from '@/lib/seo/legacy-routes'

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

  it('marks every placeholder medicine slug permanently gone, on the record and its subpaths', () => {
    for (const slug of PUBLIC_PLACEHOLDER_MEDICINE_SLUGS) {
      expect(placeholderMedicineRouteIsGone(`/d/${slug}`)).toBe(true)
      expect(placeholderMedicineRouteIsGone(`/d/${slug}/`)).toBe(true)
      expect(placeholderMedicineRouteIsGone(`/d/${slug.toUpperCase()}`)).toBe(true)
      expect(placeholderMedicineRouteIsGone(`/d/${slug}/history`)).toBe(true)
    }
    // The two rows the inventory resolver classified INVALID_IDENTITY_GONE in the live corpus.
    expect(placeholderMedicineRouteIsGone('/d/tbd')).toBe(true)
    expect(placeholderMedicineRouteIsGone('/d/header')).toBe(true)
  })

  it('leaves a real medicine record and every other route untouched', () => {
    expect(placeholderMedicineRouteIsGone('/d/inclisiran')).toBe(false)
    expect(placeholderMedicineRouteIsGone('/d/headerase')).toBe(false)
    expect(placeholderMedicineRouteIsGone('/browse')).toBe(false)
    expect(placeholderMedicineRouteIsGone('/d')).toBe(false)
    expect(placeholderMedicineRouteIsGone('/d/%E0%A4%A')).toBe(false)
  })
})

describe('middleware placeholder identity responses', () => {
  function request(pathname: string) {
    return { nextUrl: { pathname }, url: `https://rnawiki.com${pathname}` } as never
  }

  it.each(['/d/tbd', '/d/header', '/d/sheet1/history'])(
    'returns a real 410 with a noindex header for %s',
    async (pathname) => {
      const response = middleware(request(pathname))
      expect(response.status).toBe(410)
      expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
      expect(response.headers.get('x-robots-tag')).toBe('noindex')
      expect(response.headers.get('cache-control')).toBe('public, max-age=86400')
      expect(await response.text()).toBe('Gone')
    },
  )

  it('passes a real canonical dossier through untouched', () => {
    expect(middleware(request('/d/inclisiran')).status).toBe(200)
  })
})

describe('edge safety of the shared placeholder list', () => {
  it('keeps lib/public-data-integrity.ts importable from edge middleware', () => {
    const source = readFileSync(resolve('lib/public-data-integrity.ts'), 'utf8')
    // Edge middleware cannot load a Node built-in or a transitive database import. This module has
    // neither, which is why the slug list is imported rather than copied.
    expect(source).not.toMatch(/^\s*import\s/m)
    expect(source).not.toMatch(/\brequire\(/)
    expect(source).not.toMatch(/\bnode:[a-z]/)
    expect(source).not.toMatch(/\bprocess\.|\bBuffer\b|__dirname/)
  })
})

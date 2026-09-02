import { describe, expect, it } from 'vitest'

import {
  apiUrlForDossierUrl,
  classifyDiscoveryObservation,
  DISCOVERY_STATES,
  DISCOVERY_STATE_MEANINGS,
  EXTERNALLY_OBSERVED_STATES,
  hasNoindexDirective,
  parseSitemapLocations,
  sameDiscoveryUrl,
  sitemapDossierUrls,
  type DiscoveryObservation,
} from '@/scripts/discovery/discovery-states'

const ORIGIN = 'https://rnawiki.com'

function observation(patch: Partial<DiscoveryObservation> = {}): DiscoveryObservation {
  return {
    url: `${ORIGIN}/d/inclisiran`,
    status: 200,
    finalUrl: `${ORIGIN}/d/inclisiran`,
    robotsMeta: 'index, follow',
    canonical: `${ORIGIN}/d/inclisiran`,
    hasJsonLd: true,
    xRobotsTag: null,
    ...patch,
  }
}

describe('discovery state vocabulary', () => {
  it('gives every state a meaning and keeps three of them externally observed only', () => {
    for (const state of DISCOVERY_STATES) {
      expect(DISCOVERY_STATE_MEANINGS[state].length).toBeGreaterThan(20)
    }
    expect(EXTERNALLY_OBSERVED_STATES).toEqual([
      'CRAWLED_OBSERVED',
      'INDEXED_OBSERVED',
      'CITED_OR_RETRIEVED_OBSERVED',
    ])
  })
})

describe('discovery readiness classification', () => {
  it('reports DISCOVERY_READY only for a 200, self-canonical, structured, indexable page', () => {
    expect(classifyDiscoveryObservation(observation())).toEqual({
      url: `${ORIGIN}/d/inclisiran`,
      state: 'DISCOVERY_READY',
      blockers: [],
    })
  })

  it.each([
    ['a failed request', { error: 'TypeError: fetch failed', status: 0 }, 'request_failed'],
    ['a non-200 status', { status: 404 }, 'status_not_200'],
    ['a redirect', { finalUrl: `${ORIGIN}/d/other` }, 'redirected'],
    ['a noindex meta directive', { robotsMeta: 'noindex, follow' }, 'noindex_meta'],
    ['a noindex header', { xRobotsTag: 'noindex' }, 'noindex_header'],
    ['a missing canonical', { canonical: null }, 'canonical_missing'],
    [
      'a canonical naming another URL',
      { canonical: `${ORIGIN}/d/other` },
      'canonical_points_elsewhere',
    ],
    ['no structured data', { hasJsonLd: false }, 'no_structured_data'],
  ])('refuses readiness for %s', (_label, patch, blocker) => {
    const classification = classifyDiscoveryObservation(observation(patch))
    expect(classification.state).toBeNull()
    expect(classification.blockers).toContain(blocker)
  })

  it('never returns a crawled, indexed or cited state from a self-fetch', () => {
    const states = [
      classifyDiscoveryObservation(observation()).state,
      classifyDiscoveryObservation(observation({ status: 500 })).state,
    ]
    expect(states.filter((state) => state !== null && state !== 'DISCOVERY_READY')).toEqual([])
  })

  it('treats a trailing slash as the same URL and a different path as a different one', () => {
    expect(sameDiscoveryUrl(`${ORIGIN}/d/x/`, `${ORIGIN}/d/x`)).toBe(true)
    expect(sameDiscoveryUrl(`${ORIGIN}/d/x`, `${ORIGIN}/d/y`)).toBe(false)
    expect(sameDiscoveryUrl('not a url', `${ORIGIN}/d/x`)).toBe(false)
  })

  it('reads only whole noindex directives', () => {
    expect(hasNoindexDirective('index, follow')).toBe(false)
    expect(hasNoindexDirective('noindex,nofollow')).toBe(true)
    expect(hasNoindexDirective('googlebot: noindex')).toBe(true)
    expect(hasNoindexDirective('max-image-preview:large')).toBe(false)
    expect(hasNoindexDirective(null)).toBe(false)
  })
})

describe('sitemap URL projection', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://rnawiki.com/</loc></url>
  <url><loc>https://rnawiki.com/browse</loc></url>
  <url><loc>https://rnawiki.com/d/inclisiran</loc></url>
  <url><loc>https://rnawiki.com/d/sodium-cromoglicate</loc></url>
  <url><loc>https://rnawiki.com/d/inclisiran</loc></url>
  <url><loc>https://rnawiki.com/d/query?programme=1</loc></url>
  <url><loc>https://example.com/d/elsewhere</loc></url>
  <url><loc>https://rnawiki.com/u/reviewer</loc></url>
</urlset>`

  it('keeps only same-origin canonical dossier URLs, deduplicated', () => {
    expect(sitemapDossierUrls(xml, ORIGIN)).toEqual([
      'https://rnawiki.com/d/inclisiran',
      'https://rnawiki.com/d/sodium-cromoglicate',
    ])
  })

  it('reads every location and decodes XML entities', () => {
    expect(parseSitemapLocations('<loc>https://a.example/x?a=1&amp;b=2</loc>')).toEqual([
      'https://a.example/x?a=1&b=2',
    ])
    expect(parseSitemapLocations('no locations here')).toEqual([])
  })

  it('derives the machine record URL that accompanies a dossier page', () => {
    expect(apiUrlForDossierUrl(`${ORIGIN}/d/inclisiran`)).toBe(`${ORIGIN}/api/drugs/inclisiran`)
    expect(apiUrlForDossierUrl(`${ORIGIN}/browse`)).toBeNull()
    expect(apiUrlForDossierUrl('not a url')).toBeNull()
  })
})

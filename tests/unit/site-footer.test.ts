import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { FOOTER_LINKS, FOOTER_TRUST_LINES } from '@/lib/site-footer-links'

/**
 * The footer, and the two implementations of it.
 *
 * RNAWiki renders one footer for React pages and another for the plain-HTML document routes that
 * serve every medicine page. They used to carry the list by hand and had already drifted — the
 * document one had a seventh item, and a script appended an eighth to it at runtime depending on
 * whether analytics was configured. These cases exist so the two cannot come apart again.
 */
const root = process.cwd()
const read = (path: string): string => readFileSync(join(root, path), 'utf8')

describe('the public footer', () => {
  it('carries five links and no more', () => {
    expect(FOOTER_LINKS.map((link) => link.label)).toEqual([
      'Browse medicines',
      'Compare',
      'How RNAWiki works',
      'Review and improve',
      'Privacy',
    ])
  })

  it('points every link at a route that exists', () => {
    expect(FOOTER_LINKS.map((link) => link.href)).toEqual([
      '/browse',
      '/h',
      '/how-it-works',
      '/review-queue',
      '/privacy',
    ])
  })

  it('drops the editorial policy, the analytics control and the sign-in link', () => {
    const labels = FOOTER_LINKS.map((link) => link.label.toLowerCase()).join(' ')
    const hrefs = FOOTER_LINKS.map((link) => link.href).join(' ')
    expect(labels).not.toContain('editorial policy')
    expect(labels).not.toContain('analytics')
    expect(labels).not.toContain('sign in')
    expect(hrefs).not.toContain('/editorial-policy')
  })

  it('does not keep public datasets in the primary footer', () => {
    // Researchers reach it from How RNAWiki works and from a medicine page's technical layer.
    expect(FOOTER_LINKS.map((link) => link.href)).not.toContain('/datasets')
  })

  it('is rendered from the shared list by both implementations', () => {
    for (const path of ['components/SiteFooter.tsx', 'components/document/DocumentFooter.tsx']) {
      const source = read(path)
      expect(source).toContain("from '@/lib/site-footer-links'")
      expect(source).toContain('FOOTER_LINKS.map')
      // Neither may hard-code a link of its own.
      expect(source).not.toMatch(/href="\/(browse|h|how-it-works|review-queue|privacy|datasets)"/)
    }
  })

  it('gives every footer link a 44 px target in both implementations', () => {
    for (const path of ['components/SiteFooter.tsx', 'components/document/DocumentFooter.tsx']) {
      expect(read(path)).toContain('min-h-11')
    }
  })

  it('keeps the trust lines, and each one is a claim that has to stay true', () => {
    expect(FOOTER_TRUST_LINES.notAdvice).toContain('not medical advice')
    expect(FOOTER_TRUST_LINES.terms).toContain('No advertising')
    expect(FOOTER_TRUST_LINES.terms).toContain('Free to read')
  })

  it('no longer appends an analytics control to the document footer at runtime', () => {
    const island = read('lib/island/analytics.ts')
    expect(island).not.toContain("getElementById('rnawiki-footer-nav')")
    // The panel and the event it listens for stay: consent is still asked for, and still reversible.
    expect(island).toContain('GOOGLE_ANALYTICS_PREFERENCES_EVENT')
  })

  it('keeps a way to change or withdraw the analytics choice', () => {
    const privacy = read('app/privacy/page.tsx')
    expect(privacy).toContain('AnalyticsPreferencesButton')
    expect(privacy).toContain('Global Privacy Control')
    expect(privacy.toLowerCase()).toContain('withdraw')
    expect(FOOTER_LINKS.some((link) => link.href === '/privacy')).toBe(true)
  })
})

describe('the removed editorial policy route', () => {
  it('redirects permanently to the section that answers the same question', () => {
    const config = read('next.config.mjs')
    expect(config).toContain("source: '/editorial-policy'")
    expect(config).toContain("destination: '/how-it-works#review-and-corrections'")
    expect(config).toMatch(/source: '\/editorial-policy',[\s\S]{0,160}permanent: true/)
  })

  it('is gone from the sitemap, and /privacy took its place', () => {
    const sitemap = read('lib/corpus/sitemap.ts')
    expect(sitemap).not.toContain('/editorial-policy')
    expect(sitemap).toContain("{ path: '/privacy'")
  })

  it('is gone from the machine-readable index', () => {
    const llms = read('app/llms.txt/route.ts')
    expect(llms).not.toContain('/editorial-policy')
    expect(llms).toContain('/how-it-works#review-and-corrections')
  })

  it('leaves no dataset manifest pointing at a route that no longer exists', () => {
    const datasets = read('lib/public-datasets.ts')
    expect(datasets).not.toContain("'/editorial-policy'")
    expect(datasets).toContain("'/how-it-works#review-and-corrections'")
  })
})

describe('how RNAWiki works carries the review information', () => {
  const source = read('app/how-it-works/page.tsx')

  it('has the section the redirect and the footer point at', () => {
    expect(source).toContain('id="review-and-corrections"')
  })

  it('explains sources, evidence states, proposals, the three approvals and the history', () => {
    const normalized = source.replace(/\s+/g, ' ')
    expect(normalized).toContain('Every sentence says where it came from')
    expect(normalized).toContain('Not measured, unknown, mixed, contradicted and confirmed')
    expect(normalized).toContain('Anyone signed in may suggest better wording')
    expect(normalized).toContain('Three members have to agree')
    expect(normalized).toContain('Some changes need a qualified reviewer')
    expect(normalized).toContain('Nothing is deleted')
  })

  it('says plainly that approval is about words and not about evidence', () => {
    const normalized = source.replace(/\s+/g, ' ')
    expect(normalized).toContain('Approval is about words, not about evidence')
    expect(normalized).toContain('an animal result stays an animal result')
  })

  it('keeps the datasets route reachable now that the footer does not carry it', () => {
    expect(source).toContain('href="/datasets"')
  })
})

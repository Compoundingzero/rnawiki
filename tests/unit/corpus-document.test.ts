/**
 * The corpus document (docs/specs/revamp-2026-09.md step 6.1).
 *
 * `/d/*` and `/h/*` are served as plain HTML with no React Server Components stream behind them.
 * These are the properties that have to survive every later change to them: the document decides
 * indexing with the same function the App Router pages use, the loopback forward reaches this
 * server and not the public one, and nothing in the document tree pulls in the client router or a
 * second renderer.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { robotsMetaTags } from '@/lib/document/robots'
import { loopbackOrigin } from '@/lib/document/legacy-forward'

const PRODUCTION = {
  NODE_ENV: 'production',
  SEO_DEPLOYMENT_ENV: 'production',
  SITE_URL: 'https://rnawiki.com',
}

describe('robots meta on a document this application writes itself', () => {
  it('paints the indexable decision Next.js would have painted', () => {
    expect(robotsMetaTags({ index: true, follow: true }, PRODUCTION)).toEqual({
      robots: 'index, follow',
      googlebot: 'index, follow, max-image-preview:large',
    })
  })

  it('paints a below-threshold or Tier 3 record as crawlable but not indexed', () => {
    expect(robotsMetaTags({ index: false, follow: true }, PRODUCTION)).toEqual({
      robots: 'noindex, follow',
      googlebot: 'noindex, follow',
    })
  })

  it('fails closed off the canonical production origin, as the page rule does', () => {
    expect(
      robotsMetaTags({ index: true, follow: true }, { SEO_DEPLOYMENT_ENV: 'development' }),
    ).toEqual({
      robots: 'noindex, nofollow, nocache',
      googlebot: 'noindex, nofollow, noimageindex',
    })
  })
})

describe('the loopback forward to the legacy medicine record', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses the port the request arrived on when the host is loopback', () => {
    expect(loopbackOrigin('127.0.0.1:3197')).toBe('http://127.0.0.1:3197')
    expect(loopbackOrigin('localhost:3000')).toBe('http://127.0.0.1:3000')
  })

  it('never leaves the machine when the host header names the public site', () => {
    vi.stubEnv('PORT', '8080')
    expect(loopbackOrigin('rnawiki.com')).toBe('http://127.0.0.1:8080')
    expect(loopbackOrigin(null)).toBe('http://127.0.0.1:8080')
  })
})

describe('what a document route may import', () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), 'utf8')

  it('renders the record with no client router and no client island in the tree', () => {
    for (const path of [
      'components/document/DocumentShell.tsx',
      'components/document/DocumentHeader.tsx',
      'components/document/DocumentFooter.tsx',
      'components/dossier/corpus/CorpusDossierPage.tsx',
      'lib/corpus/document.tsx',
      'lib/hubs/document.tsx',
    ]) {
      const source = read(path)
      expect(source, path).not.toContain("from 'next/link'")
      expect(source, path).not.toContain("'use client'")
    }
  })

  it('serves the medicine route from a route handler, not a page', () => {
    const route = read('app/d/[slug]/route.ts')
    expect(route).toContain('export async function GET')
    expect(route).toContain('loadCorpusDossier')
    expect(route).toContain('forwardToLegacyRecord')
    expect(() => read('app/d/[slug]/page.tsx')).toThrow()
  })

  it('keeps the legacy record unreachable except through that route handler', () => {
    const page = read('app/legacy-record/[slug]/page.tsx')
    expect(page).toContain('forwardedFromDossierRoute')
    expect(page).toContain('notFound()')
  })
})

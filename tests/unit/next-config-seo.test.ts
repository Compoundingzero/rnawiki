import { describe, expect, it } from 'vitest'

import nextConfig, { responseHeadersForEnvironment } from '../../next.config.mjs'

const production = {
  NODE_ENV: 'production',
  SEO_DEPLOYMENT_ENV: 'production',
  SITE_URL: 'https://rnawiki.com',
}

function robotsHeader(environment: typeof production): string | null {
  return (
    responseHeadersForEnvironment(environment).find((header) => header.key === 'X-Robots-Tag')
      ?.value ?? null
  )
}

describe('Next config canonical deployment guard', () => {
  it('omits the staging crawler header only for the exact canonical production origin', () => {
    expect(robotsHeader(production)).toBeNull()
    expect(robotsHeader({ ...production, SITE_URL: 'https://rnawiki.com/' })).toBeNull()
  })

  it.each([
    [{ ...production, SITE_URL: undefined }, 'missing SITE_URL'],
    [{ ...production, SITE_URL: 'http://rnawiki.com' }, 'HTTP'],
    [{ ...production, SITE_URL: 'not a URL' }, 'malformed URL'],
    [{ ...production, SITE_URL: 'https://rnawiki.com:443' }, 'explicit port'],
    [{ ...production, SITE_URL: 'https://rnawiki.com:8443' }, 'non-default port'],
    [{ ...production, SITE_URL: 'https://rnawiki.com/evidence' }, 'path'],
    [{ ...production, SITE_URL: 'https://rnawiki.com?preview=1' }, 'query'],
    [{ ...production, SITE_URL: 'https://rnawiki.com#preview' }, 'hash'],
  ] as const)('adds a global noindex header for %s', (environment, _label) => {
    expect(robotsHeader(environment as typeof production)).toBe('noindex, nofollow, noarchive')
  })

  it('leaves legacy record identities to the database-backed one-hop route', async () => {
    const redirects = (await nextConfig.redirects?.()) ?? []

    expect(redirects.some((redirect) => redirect.source === '/r/:slug')).toBe(false)
    expect(redirects).toContainEqual({
      source: '/compounds',
      destination: '/browse',
      permanent: true,
    })
  })
})

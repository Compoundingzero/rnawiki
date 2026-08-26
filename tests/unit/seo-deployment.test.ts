import { describe, expect, it } from 'vitest'

import {
  configuredPublicUrl,
  isCanonicalProductionOrigin,
  isCanonicalProductionDeployment,
  pageRobotsMetadata,
  rootRobotsMetadata,
} from '@/lib/seo/deployment'

const production = {
  NODE_ENV: 'production',
  SEO_DEPLOYMENT_ENV: 'production',
  SITE_URL: 'https://rnawiki.com',
}

describe('canonical deployment metadata guard', () => {
  it('normalizes absolute dossier and profile URLs when SITE_URL has a trailing slash', () => {
    const environment = { ...production, SITE_URL: 'https://rnawiki.com/' }

    expect(configuredPublicUrl('/d/example-medicine', environment)).toBe(
      'https://rnawiki.com/d/example-medicine',
    )
    expect(configuredPublicUrl('/u/evidence-reviewer', environment)).toBe(
      'https://rnawiki.com/u/evidence-reviewer',
    )
  })

  it('allows large image previews only on the exact canonical production deployment', () => {
    expect(isCanonicalProductionDeployment(production)).toBe(true)
    expect(isCanonicalProductionOrigin(production)).toBe(true)
    expect(
      isCanonicalProductionDeployment({ ...production, SITE_URL: 'https://rnawiki.com/' }),
    ).toBe(true)
    expect(rootRobotsMetadata(production)).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    })
  })

  it.each([
    [{ ...production, SEO_DEPLOYMENT_ENV: 'staging' }, 'staging'],
    [{ ...production, SITE_URL: undefined }, 'missing SITE_URL'],
    [{ ...production, SITE_URL: 'https://preview.rnawiki.com' }, 'preview host'],
    [{ ...production, SITE_URL: 'http://rnawiki.com' }, 'non-HTTPS origin'],
    [{ ...production, SITE_URL: 'not a URL' }, 'invalid origin'],
    [{ ...production, SITE_URL: 'https://user@rnawiki.com' }, 'credentials'],
    [{ ...production, SITE_URL: 'https://rnawiki.com:443' }, 'explicit default port'],
    [{ ...production, SITE_URL: 'https://rnawiki.com:8443' }, 'non-default port'],
    [{ ...production, SITE_URL: 'https://rnawiki.com/evidence' }, 'path'],
    [{ ...production, SITE_URL: 'https://rnawiki.com?preview=1' }, 'query'],
    [{ ...production, SITE_URL: 'https://rnawiki.com#preview' }, 'hash'],
    [{ ...production, SEO_DEPLOYMENT_ENV: '' }, 'missing marker'],
  ] as const)('keeps %s fail-closed', (environment, _label) => {
    expect(isCanonicalProductionDeployment(environment)).toBe(false)
    expect(rootRobotsMetadata(environment)).toEqual({
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    })
    expect(pageRobotsMetadata({ index: true, follow: true }, environment)).toEqual({
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    })
  })

  it('preserves a narrower route-level noindex decision in production', () => {
    expect(pageRobotsMetadata({ index: false, follow: true }, production)).toEqual({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    })
  })
})

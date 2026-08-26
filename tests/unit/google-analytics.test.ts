import { describe, expect, it } from 'vitest'

import {
  analyticsPageTitle,
  googleAnalyticsMeasurementId,
  sanitizeAnalyticsPathname,
  sanitizeAnalyticsReferrer,
  shouldMeasureAnalyticsPath,
} from '@/lib/google-analytics'

describe('Google Analytics privacy boundary', () => {
  it('accepts only a GA4 measurement id', () => {
    expect(googleAnalyticsMeasurementId('G-HKMTLKWQEW')).toBe('G-HKMTLKWQEW')
    expect(googleAnalyticsMeasurementId(' G-HKMTLKWQEW ')).toBe('G-HKMTLKWQEW')
    expect(googleAnalyticsMeasurementId(undefined)).toBeNull()
    expect(googleAnalyticsMeasurementId('G-ABC\" onload=alert(1)')).toBeNull()
    expect(googleAnalyticsMeasurementId('UA-123-1')).toBeNull()
  })

  it('removes queries, fragments and account handles from measured paths', () => {
    expect(sanitizeAnalyticsPathname('/d/inclisiran?programme=private#sources')).toBe(
      '/d/inclisiran',
    )
    expect(sanitizeAnalyticsPathname('/browse?q=private-condition')).toBe('/browse')
    expect(sanitizeAnalyticsPathname('/u/alice-smith')).toBe('/u/[profile]')
    expect(sanitizeAnalyticsPathname('/u/alice-smith/history')).toBe('/u/[profile]')
  })

  it('keeps acquisition origins while removing referrer queries and masking local profiles', () => {
    expect(
      sanitizeAnalyticsReferrer(
        'https://www.google.com/search?q=private-condition',
        'https://rnawiki.com',
      ),
    ).toBe('https://www.google.com/search')
    expect(
      sanitizeAnalyticsReferrer('https://rnawiki.com/u/alice?ref=email', 'https://rnawiki.com'),
    ).toBe('https://rnawiki.com/u/[profile]')
    expect(sanitizeAnalyticsReferrer('javascript:alert(1)', 'https://rnawiki.com')).toBe('')
  })

  it('does not measure private workflow or infrastructure routes', () => {
    expect(shouldMeasureAnalyticsPath('/d/inclisiran')).toBe(true)
    expect(shouldMeasureAnalyticsPath('/review-queue')).toBe(false)
    expect(shouldMeasureAnalyticsPath('/review-queue/search-indexing')).toBe(false)
    expect(shouldMeasureAnalyticsPath('/api/search')).toBe(false)
    expect(shouldMeasureAnalyticsPath('/healthz')).toBe(false)
  })

  it('does not expose a profile name in the page title', () => {
    expect(analyticsPageTitle('/u/[profile]', 'Alice Smith | RNAWiki')).toBe(
      'Contributor profile | RNAWiki',
    )
  })
})

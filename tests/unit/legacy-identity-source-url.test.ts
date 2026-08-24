import { describe, expect, it } from 'vitest'

import { normalizeIdentityCorrectionSourceUrl } from '@/lib/legacy-identity-source-url'

describe('legacy identity-correction public source URL', () => {
  it.each([
    'http://[fec0::1]/regulator-record',
    'http://[feff:ffff::1]/regulator-record',
    'http://[100::1]/regulator-record',
    'http://[100:0:0:0:ffff::1]/regulator-record',
  ])('rejects the non-public IPv6 source host %s', (sourceUrl) => {
    expect(() => normalizeIdentityCorrectionSourceUrl(sourceUrl)).toThrow(
      'Use a source on a public website, not a local or private-network address.',
    )
  })

  it('does not reject an ordinary globally routable IPv6 literal', () => {
    expect(normalizeIdentityCorrectionSourceUrl('https://[2606:4700:4700::1111]/record')).toBe(
      'https://[2606:4700:4700::1111]/record',
    )
  })
})

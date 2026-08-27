import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const resolvePublicMedicineRoute = vi.hoisted(() => vi.fn())

vi.mock('@/lib/queries/drugs', () => ({ resolvePublicMedicineRoute }))

import { resolveLegacyCompoundRequest, resolveLegacyRecordRequest } from '@/lib/seo/legacy-response'

describe('legacy compound HTTP behavior', () => {
  beforeEach(() => {
    vi.stubEnv('SITE_URL', 'https://rnawiki.com')
  })

  afterEach(() => {
    resolvePublicMedicineRoute.mockReset()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('returns 410 and logs only privacy-minimal route identity when no successor resolves', async () => {
    resolvePublicMedicineRoute.mockResolvedValue(null)
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const request = new NextRequest(
      'https://rnawiki.com/t/compound/missing-medicine?utm_source=private-token',
    )

    const response = await resolveLegacyCompoundRequest(request, 'missing-medicine')

    expect(response.status).toBe(410)
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
    expect(log).toHaveBeenCalledOnce()
    expect(log.mock.calls[0]?.[0]).toBe('[seo.legacy_unresolved]')
    expect(JSON.parse(String(log.mock.calls[0]?.[1]))).toEqual({
      event: 'legacy_compound_unresolved',
      family: 't_compound',
      pathname: '/t/compound/missing-medicine',
    })
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-token')
  })

  it('redirects an exact safe successor once without carrying legacy query parameters', async () => {
    resolvePublicMedicineRoute.mockResolvedValue({
      canonicalSlug: 'canonical-medicine',
      matchedBy: 'historical',
    })
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const request = new NextRequest('https://rnawiki.com/c/old-medicine?campaign=legacy')

    const response = await resolveLegacyCompoundRequest(request, 'old-medicine')

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://rnawiki.com/d/canonical-medicine')
    expect(log).not.toHaveBeenCalled()
  })

  it('never leaks a reverse proxy origin into the public successor redirect', async () => {
    resolvePublicMedicineRoute.mockResolvedValue({
      canonicalSlug: 'canonical-medicine',
      matchedBy: 'historical',
    })
    const request = new NextRequest('https://localhost:8080/c/old-medicine')

    const response = await resolveLegacyCompoundRequest(request, 'old-medicine')

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://rnawiki.com/d/canonical-medicine')
  })

  it('redirects a former record URL straight to the resolver terminal without query parameters', async () => {
    resolvePublicMedicineRoute.mockResolvedValue({
      canonicalSlug: 'terminal-medicine',
      matchedBy: 'historical',
    })
    const request = new NextRequest('https://rnawiki.com/r/retained-old-row?campaign=legacy')

    const response = await resolveLegacyRecordRequest(request, 'retained-old-row')

    expect(resolvePublicMedicineRoute).toHaveBeenCalledWith('retained-old-row')
    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe('https://rnawiki.com/d/terminal-medicine')
  })

  it('performs no outbound search-engine notification from a request-time 410 or redirect', async () => {
    // Deliberate policy (docs/seo-indexing-policy.md): a request proves nothing changed, the 410
    // branch's URL is caller-mintable, and the eligibility policy cannot filter legacy-family
    // URLs. Even with IndexNow fully enabled, request handling must stay free of submissions.
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
    vi.stubEnv('INDEXNOW_ENABLED', 'true')
    vi.stubEnv('INDEXNOW_KEY', 'legacy-test-key-0001')
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    vi.spyOn(console, 'info').mockImplementation(() => undefined)

    resolvePublicMedicineRoute.mockResolvedValueOnce(null)
    const gone = await resolveLegacyRecordRequest(
      new NextRequest('https://rnawiki.com/r/url-a-caller-just-minted'),
      'url-a-caller-just-minted',
    )
    resolvePublicMedicineRoute.mockResolvedValueOnce({
      canonicalSlug: 'canonical-medicine',
      matchedBy: 'historical',
    })
    const moved = await resolveLegacyCompoundRequest(
      new NextRequest('https://rnawiki.com/c/old-medicine'),
      'old-medicine',
    )

    expect(gone.status).toBe(410)
    expect(moved.status).toBe(301)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns a privacy-minimal 410 when a former record has no terminal identity', async () => {
    resolvePublicMedicineRoute.mockResolvedValue(null)
    const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const request = new NextRequest('https://rnawiki.com/r/missing?private=token')

    const response = await resolveLegacyRecordRequest(request, 'missing')

    expect(response.status).toBe(410)
    expect(JSON.parse(String(log.mock.calls[0]?.[1]))).toEqual({
      event: 'legacy_record_unresolved',
      family: 'r',
      pathname: '/r/missing',
    })
    expect(JSON.stringify(log.mock.calls)).not.toContain('token')
  })
})

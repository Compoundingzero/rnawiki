import { describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const resolveLegacyRecordRequest = vi.hoisted(() => vi.fn())

vi.mock('@/lib/seo/legacy-response', () => ({ resolveLegacyRecordRequest }))

import { GET, HEAD } from '@/app/r/[slug]/route'

describe('legacy record route', () => {
  it.each([
    ['GET', GET],
    ['HEAD', HEAD],
  ] as const)('passes %s through the database-backed terminal resolver', async (_method, route) => {
    const expected = new NextResponse(null, {
      status: 301,
      headers: { location: 'https://rnawiki.com/d/terminal-medicine' },
    })
    resolveLegacyRecordRequest.mockResolvedValueOnce(expected)
    const request = new NextRequest('https://rnawiki.com/r/old-medicine')

    const response = await route(request, {
      params: Promise.resolve({ slug: 'old-medicine' }),
    })

    expect(response).toBe(expected)
    expect(resolveLegacyRecordRequest).toHaveBeenCalledWith(request, 'old-medicine')
  })
})

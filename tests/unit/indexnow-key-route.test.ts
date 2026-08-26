import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET, HEAD } from '@/app/indexnow-key.txt/route'

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('SEO_DEPLOYMENT_ENV', 'production')
  vi.stubEnv('SITE_URL', 'https://rnawiki.com')
  vi.stubEnv('INDEXNOW_ENABLED', 'true')
  vi.stubEnv('INDEXNOW_KEY', 'rnawiki-indexnow-key')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('IndexNow ownership key route', () => {
  it('serves the public key as plain text only on canonical production', async () => {
    const get = GET()
    const head = HEAD()

    expect(get.status).toBe(200)
    expect(get.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(get.headers.get('x-content-type-options')).toBe('nosniff')
    await expect(get.text()).resolves.toBe('rnawiki-indexnow-key')
    expect(head.status).toBe(200)
    await expect(head.text()).resolves.toBe('')
  })

  it.each([
    ['missing key', { INDEXNOW_KEY: '' }],
    ['disabled integration', { INDEXNOW_ENABLED: 'false' }],
    ['staging deployment', { SEO_DEPLOYMENT_ENV: 'staging' }],
  ])('returns 404 for %s', async (_label, environment) => {
    for (const [name, value] of Object.entries(environment)) vi.stubEnv(name, value)

    const response = GET()
    expect(response.status).toBe(404)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.text()).resolves.toBe('Not found')
  })
})

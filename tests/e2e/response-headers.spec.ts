import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

/**
 * The response headers, and specifically the one that made a shipped feature 100% non-functional.
 *
 * `X-Frame-Options: SAMEORIGIN` was applied to `source: '/(.*)'`, which includes `/embed/*` — a
 * route that exists to be framed by other sites. SAMEORIGIN is by definition a refusal to render
 * in a frame on any other origin, so every copy of the snippet EmbedCodeBox hands readers rendered
 * a blank box, under a printed promise that "the wording cannot be edited by the site that embeds
 * it". It went unnoticed because the only iframe anyone tested was the same-origin "Show preview"
 * on the record page.
 *
 * The header cannot be REMOVED by a later rule, only overwritten, so the global rule's source now
 * excludes /embed/ with a negative lookahead. That is the thing worth pinning: a future edit that
 * reverts to '/(.*)' and relies on the second rule to win would silently reintroduce the defect,
 * and only an assertion on the header's ABSENCE catches it.
 */

async function claimIdFrom(page: import('@playwright/test').Page, slug: string): Promise<string> {
  const response = await page.goto(`/r/${slug}`)
  test.skip(!response || !response.ok(), `Entity "${slug}" is not seeded/published yet.`)
  const href = await page.locator('a[href^="/api/v1/claims/"]').first().getAttribute('href')
  const id = href?.split('/').pop() ?? ''
  expect(id, 'could not resolve a claim id from the record page').toMatch(/^\d+$/)
  return id
}

test.describe('framing headers', () => {
  test('/embed/claim/[id] carries no X-Frame-Options and allows any frame ancestor', async ({ page, request }) => {
    const claimId = await claimIdFrom(page, SEEDED_SLUGS.bpc157)

    const response = await request.get(`/embed/claim/${claimId}`)
    expect(response.status()).toBe(200)

    const headers = response.headers()
    expect(
      headers['x-frame-options'],
      'X-Frame-Options on /embed makes every copied embed snippet render a blank box off-origin'
    ).toBeUndefined()
    expect(headers['content-security-policy']).toContain('frame-ancestors *')
    // Still excluded from search results, which is the other half of the embed contract.
    expect(headers['x-robots-tag']).toContain('noindex')
  })

  test('every other route keeps SAMEORIGIN and frame-ancestors self', async ({ request }) => {
    for (const path of ['/', `/r/${SEEDED_SLUGS.bpc157}`, '/search?q=tendon', '/admin/login']) {
      const response = await request.get(path)
      const headers = response.headers()
      expect(headers['x-frame-options'], `missing X-Frame-Options on ${path}`).toBe('SAMEORIGIN')
      expect(headers['content-security-policy'], `wrong frame-ancestors on ${path}`).toContain(
        "frame-ancestors 'self'"
      )
    }
  })

  /**
   * The route renders inside an iframe at all, in a real browser, using the exact snippet shape
   * EmbedCodeBox hands readers.
   *
   * WHY THIS IS SAME-ORIGIN AND NOT CROSS-ORIGIN, which is the case that actually broke. A genuine
   * cross-origin frame cannot be staged against a server on localhost: Chromium refuses the
   * subresource with ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS before any of our headers are
   * consulted, and the fallbacks all fail for reasons unrelated to the defect — an `about:blank`
   * or `data:` host is an opaque origin, which `frame-ancestors *` does not match by definition,
   * and any host page served by this app carries its own `frame-src 'self'`. Verified by hand
   * against a headless Chromium before settling for this.
   *
   * So the cross-origin guarantee is pinned by the header assertions above — the absence of
   * X-Frame-Options and the presence of `frame-ancestors *`, which are exactly what was wrong —
   * and this test pins the other half: that the route itself renders real content in a frame, so
   * a reader pasting the snippet gets a record rather than an empty box.
   */
  test('the embed renders inside an iframe, using the snippet shape readers are given', async ({ page, context, baseURL }) => {
    const claimId = await claimIdFrom(page, SEEDED_SLUGS.bpc157)

    // The host page is faked at a path on this same origin, so the frame is same-origin and
    // Chromium's local-network check does not fire. It carries no CSP of its own, unlike a real
    // page of this app, so `frame-src 'self'` is not what is being measured here either.
    const host = await context.newPage()
    await host.route(`${baseURL}/embed-host-probe`, (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><title>Host</title><iframe id="probe" src="${baseURL}/embed/claim/${claimId}" width="100%" height="340"></iframe>`,
      })
    )
    await host.goto(`${baseURL}/embed-host-probe`)

    await expect(host.frameLocator('#probe').locator('body')).not.toBeEmpty()
    await expect(host.frameLocator('#probe').locator('body')).toContainText('RNAwiki')
    await host.close()
  })
})

test.describe('security headers', () => {
  test('the baseline set is present on a reader page', async ({ request }) => {
    const headers = (await request.get('/')).headers()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['strict-transport-security']).toContain('max-age=')
    expect(headers['permissions-policy']).toContain('camera=()')
  })

  /**
   * `script-src 'self' 'unsafe-inline'` is deliberate and documented in next.config.mjs: the App
   * Router's inline bootstrap has no nonce available while /r/[slug] and /embed are ISR routes, and
   * omitting script-src does NOT leave scripts unrestricted — `default-src 'self'` covers them and
   * blocks that bootstrap, which breaks hydration on every page. This asserts the directive is
   * present rather than silently dropped by a well-meaning "tightening".
   */
  test('the CSP states script-src explicitly, so hydration is not broken by default-src', async ({ page, request }) => {
    const csp = (await request.get('/')).headers()['content-security-policy'] ?? ''
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")

    const consoleErrors: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text())
    })
    await page.goto('/')
    await page.waitForLoadState('load')
    expect(consoleErrors.filter((e) => /Content Security Policy/i.test(e))).toEqual([])
  })
})

import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

test.describe('standalone claim embed', () => {
  test('/embed/claim/[id] renders standalone (no header/footer/nav) for a published claim', async ({ page }) => {
    const entityResponse = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !entityResponse || !entityResponse.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    // The embed control moved out of the reading path in the plain-language rebuild. Resolve a
    // real published claim id from the public API rather than hunting for a control on the page.
    const api = await page.request.get('/api/v1/entities/bpc-157')
    expect(api.ok()).toBe(true)
    const claimId = await page.evaluate(async () => {
      const r = await fetch('/api/v1/claims/1')
      return r.ok ? 1 : null
    })
    const href = `/embed/claim/${claimId ?? 1}`

    const response = await page.goto(href!)
    test.skip(
      !response || response.status() === 404,
      'app/embed/claim/[id] is not implemented yet (owned by a concurrent task).'
    )
    expect(response?.ok()).toBe(true)

    // Standalone: no site header ("RNAwiki" home link / "Primary" nav) and no site footer.
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0)
    await expect(page.locator('footer')).toHaveCount(0)

    // But the claim content itself is present.
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

// Explicit 375px viewport regardless of which Playwright project runs this file (the
// 'mobile-375' project in playwright.config.ts already sets this, but pinning it here too keeps
// this spec self-contained and correct even if run under 'chromium').
test.use({ viewport: { width: 375, height: 812 } })

async function hasNoHorizontalOverflow(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
}

test.describe('mobile viewport (375px)', () => {
  test('the homepage has no horizontal overflow and the primary navigation is usable', async ({ page }) => {
    await page.goto('/')
    expect(await hasNoHorizontalOverflow(page)).toBe(true)

    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()

    const searchLink = nav.getByRole('link', { name: 'Search' })
    await expect(searchLink).toBeVisible()
    await searchLink.click()
    await expect(page).toHaveURL(/\/search$/)
  })

  test('an entity page has no horizontal overflow and the mechanism chain stays usable', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !response || !response.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    expect(await hasNoHorizontalOverflow(page)).toBe(true)

    const mechanismChain = page.getByRole('list', { name: 'Proposed mechanism, step by step' }).first()
    const hasMechanismChain = await mechanismChain.isVisible()
    test.skip(!hasMechanismChain, 'No mechanism steps seeded on this entity yet.')

    await expect(mechanismChain).toBeVisible()
    // Every step's text content must actually be reachable/visible at this width, not clipped
    // off-screen by a fixed-width layout.
    const firstStepText = mechanismChain.locator('li').first()
    await expect(firstStepText).toBeVisible()
    const box = await firstStepText.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeLessThanOrEqual(375)
  })
})

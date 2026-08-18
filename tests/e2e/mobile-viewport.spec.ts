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

    // The mobile header is deliberately one row: wordmark + search + menu. Navigation lives
    // behind the menu button, so there is no 'Primary' nav landmark visible at this width.
    const menu = page.getByRole('button', { name: /open menu/i })
    await expect(menu).toBeVisible()
    const box = await menu.boundingBox()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)

    // The homepage's search is the hero form and must be reachable without opening the menu.
    const heroSearch = page.locator('main').getByRole('searchbox')
    await expect(heroSearch).toBeVisible()
    await heroSearch.fill('BPC-157')
    await page.locator('main').getByRole('button', { name: /check the evidence/i }).click()
    await expect(page).toHaveURL(/\/search\?q=/)
  })

  test('an entity page has no horizontal overflow and the mechanism chain stays usable', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !response || !response.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    expect(await hasNoHorizontalOverflow(page)).toBe(true)

    // Everything secondary is collapsed by default now. Force every disclosure open, which both
    // reaches the mechanism list and checks the layout holds in its most expanded state — the
    // case most likely to overflow.
    await page.evaluate(() =>
      document.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))
    )
    expect(await hasNoHorizontalOverflow(page), 'overflow with all disclosures open').toBe(true)

    const mechanismChain = page.getByRole('list', { name: /mechanism/i }).first()
    test.skip((await mechanismChain.count()) === 0, 'No mechanism steps seeded on this entity yet.')

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

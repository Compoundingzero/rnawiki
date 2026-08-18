import { test, expect } from '@playwright/test'

/**
 * The homepage budget.
 *
 * History: it reached 313 words of marketing copy, was cut to 100, then grew to 346 when a
 * corpus table, a full compound index and a publishing pipeline were added. The plain-language
 * rebuild removed all three — the front door is now hero, search, trust line, how-to-read, and a
 * few recently checked questions.
 *
 * If this fails, cut copy. Raise the number only when a section is added deliberately, and say so.
 */
const VISIBLE_WORD_BUDGET = 260

test.describe('homepage', () => {
  test('loads and shows the primary search', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBe(true)
    await expect(page.getByRole('searchbox', { name: /search a name or health claim/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /check the evidence/i })).toBeVisible()
  })

  test('has exactly one h1 and stays within its word budget', async ({ page }) => {
    await page.goto('/')
    expect(await page.locator('h1').count()).toBe(1)

    const words = await page
      .locator('main')
      .evaluate((el) => ((el as HTMLElement).innerText || '').split(/\s+/).filter(Boolean).length)
    expect(
      words,
      `homepage has ${words} visible words; the budget is ${VISIBLE_WORD_BUDGET}. Cut copy rather than raising it.`
    ).toBeLessThanOrEqual(VISIBLE_WORD_BUDGET)
  })

  test('does not render the whole corpus index', async ({ page }) => {
    await page.goto('/')
    // The front door lists a handful of recent questions and links to /compounds for the rest.
    const recordLinks = page.locator('a[href^="/r/"]')
    expect(await recordLinks.count()).toBeLessThanOrEqual(6)
    await expect(page.getByRole('link', { name: /browse all/i })).toBeVisible()
  })

  test('every featured question carries its own answer, never a bare evidence label', async ({ page }) => {
    await page.goto('/')
    const links = page.locator('a[href*="#claim-"]')
    const count = await links.count()
    test.skip(count === 0, 'No published claims to feature yet.')

    for (let i = 0; i < count; i++) {
      const text = ((await links.nth(i).textContent()) ?? '').trim()
      // An evidence label beside a yes/no question, with no answer, reads AS the answer and can
      // invert it. Either the claim's own answer travels with it or it does not appear.
      expect(text.split(/\s+/).length, `featured entry ${i + 1} is too short to contain an answer`).toBeGreaterThan(12)
    }
  })

  test('primary navigation is literal and the mobile header stays on one row', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'RNAwiki' }).first()).toBeVisible()

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    const header = page.locator('header .site-header__inner')
    const box = await header.boundingBox()
    // One row: a wrapped header measured ~165px tall before the rebuild.
    expect(box, 'header not found').not.toBeNull()
    expect(box!.height, 'mobile header has wrapped onto multiple rows').toBeLessThanOrEqual(80)
  })
})

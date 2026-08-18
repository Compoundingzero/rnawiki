import { test, expect } from '@playwright/test'

/**
 * The front door's word budget.
 *
 * History, so the number is not mistaken for arbitrary: the homepage reached 313 visible words
 * of marketing-shaped copy, and was cut to 100. The budget was then 170. The field-guide redesign
 * deliberately re-added *structural* content the brief requires — a live corpus/trust strip, a
 * browsable compound index with one-sentence descriptions, a featured-claims row, an evidence
 * change log and the six-step publishing pipeline. That is information, not filler, so the budget
 * was raised to fit it rather than deleting mandated sections.
 *
 * The rule is unchanged: if this fails, cut copy. Raise the number only when a section is added
 * on purpose, and say so here.
 */
const VISIBLE_WORD_BUDGET = 420

test.describe('homepage', () => {
  test('loads and shows the search box', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBe(true)

    await expect(page.getByRole('searchbox', { name: /search a compound, claim or source/i })).toBeVisible()
  })

  test('featured claims show a Proof Boundary stage, never a full claim answer', async ({ page }) => {
    await page.goto('/')

    // Featured claims link to a claim anchor; compound index rows link to the entity itself and
    // legitimately carry a one-sentence description, so they are a different budget.
    const claimLinks = page.locator('a[href*="#claim-"]')
    const count = await claimLinks.count()
    test.skip(count === 0, 'No published claims to feature yet.')

    for (let i = 0; i < count; i++) {
      const text = ((await claimLinks.nth(i).textContent()) ?? '').trim()
      const words = text.split(/\s+/).filter(Boolean).length
      expect(
        words,
        `featured claim ${i + 1} is carrying too much text for a summary row: "${text.slice(0, 80)}…"`
      ).toBeLessThanOrEqual(40)
    }
  })

  test('stays within its visible word budget', async ({ page }) => {
    await page.goto('/')

    const words = await page.locator('main').evaluate((el) => {
      const text = (el as HTMLElement).innerText || ''
      return text.split(/\s+/).filter(Boolean).length
    })

    expect(
      words,
      `homepage has ${words} visible words; the budget is ${VISIBLE_WORD_BUDGET}. Cut copy rather than raising the budget.`
    ).toBeLessThanOrEqual(VISIBLE_WORD_BUDGET)
  })

  test('renders the brand mark and literal navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /rnawiki, home/i })).toBeVisible()
    // Navigation must name real record types. Nothing here may advertise a section that has no data.
    await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Compounds' })).toBeVisible()
  })
})

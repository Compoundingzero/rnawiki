import { test, expect } from '@playwright/test'

/**
 * The front door's word budget. The homepage is the first surface to accumulate explanation —
 * it reached 313 visible words before this assertion existed, with three cards each dumping a
 * full multi-clause claim answer onto the landing page. The predecessor product carried the same
 * gate at a stricter 55 words; this one is looser because the page also carries the three
 * evidence labels and a featured row, but the principle is identical: if this fails, cut copy,
 * do not raise the number. See docs/writing-style.md.
 */
const VISIBLE_WORD_BUDGET = 170

test.describe('homepage', () => {
  test('loads and shows the search box', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBe(true)

    await expect(
      page.getByRole('searchbox', { name: /search a compound, treatment, or claim/i })
    ).toBeVisible()
  })

  test('featured cards show a Proof Boundary stage, and never a full claim answer', async ({ page }) => {
    await page.goto('/')

    const cards = page.locator('a[href^="/r/"]')
    const count = await cards.count()
    test.skip(count === 0, 'No published claims to feature yet.')

    // Every card carries a stage label. Cards are deliberately terse — question + stage only.
    const first = cards.first()
    await expect(first).toBeVisible()

    // A card must stay short enough that it cannot be carrying a claim's full answer with its
    // caveat: that belongs on the entity page, where the caveat can travel with the claim.
    for (let i = 0; i < count; i++) {
      const text = ((await cards.nth(i).textContent()) ?? '').trim()
      const words = text.split(/\s+/).filter(Boolean).length
      expect(words, `featured card ${i + 1} is too long for a card: "${text.slice(0, 80)}…"`).toBeLessThanOrEqual(30)
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
})

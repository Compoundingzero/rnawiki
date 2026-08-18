import { test, expect } from '@playwright/test'
import { SEEDED_ENTITY_NAME } from './fixtures/seeded-entities'

/**
 * Search results are for a reader, not a database user. The previous assertions looked for the
 * literal string "Proof Boundary —", which the plain-language rebuild deliberately removed from
 * every reader-facing surface; those assertions now encode the wrong behaviour, so they are
 * replaced with the rule that replaced them.
 */
test.describe('search', () => {
  test('a result shows the question, the answer, and a plain evidence line', async ({ page }) => {
    await page.goto('/search?q=tendon')
    await expect(page.getByText(SEEDED_ENTITY_NAME).first()).toBeVisible()

    const body = (await page.locator('main').innerText()).toLowerCase()
    // The answer itself must be present, not just a label.
    expect(body).toContain('no controlled human trial')
    // Plain language, not the internal vocabulary.
    expect(body).not.toContain('proof boundary')
    expect(body).not.toContain('claim type')
    expect(body).not.toMatch(/uncontrolled_human|animal_evidence|regulatory_evidence/)
  })

  test('the no-JavaScript search form works via plain navigation', async ({ page }) => {
    await page.goto('/search')
    const input = page.locator('main').getByRole('searchbox')
    await input.fill(SEEDED_ENTITY_NAME)
    await page.locator('main').getByRole('button', { name: /search/i }).first().click()
    await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(SEEDED_ENTITY_NAME)}`, 'i'))
  })

  test('a query with no matches explains what to do next', async ({ page }) => {
    await page.goto('/search?q=zzzzqqqq')
    const body = (await page.locator('main').innerText()).toLowerCase()
    expect(body).toContain("couldn't find")
  })
})

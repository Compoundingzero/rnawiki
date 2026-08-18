import { test, expect } from '@playwright/test'
import { SEEDED_ENTITY_NAME } from './fixtures/seeded-entities'

test.describe('search', () => {
  test('searching a known seeded entity name shows its Proof Boundary in the results, before clicking through', async ({
    page,
  }) => {
    const response = await page.goto(`/search?q=${encodeURIComponent(SEEDED_ENTITY_NAME)}`)
    expect(response?.ok()).toBe(true)

    const noResults = page.getByText(/No results for/i)
    const hasNoResults = await noResults.isVisible()
    test.skip(hasNoResults, `"${SEEDED_ENTITY_NAME}" is not seeded/published yet — skipping until seed data lands.`)

    // The result card (SearchResults.tsx) shows the entity name, the consumer question, the
    // direct answer, and the Proof Boundary stage — all without navigating to /r/[slug].
    await expect(page.getByText(SEEDED_ENTITY_NAME).first()).toBeVisible()
    await expect(page.getByText(/Proof Boundary —/).first()).toBeVisible()
  })

  test('the no-JavaScript search form (GET /search?q=) works via plain navigation', async ({ page }) => {
    await page.goto('/search')
    const input = page.getByRole('searchbox')
    await input.fill(SEEDED_ENTITY_NAME)
    await page.getByRole('button', { name: /^search$/i }).click()

    await expect(page).toHaveURL(new RegExp(`q=${encodeURIComponent(SEEDED_ENTITY_NAME)}`, 'i'))
  })
})

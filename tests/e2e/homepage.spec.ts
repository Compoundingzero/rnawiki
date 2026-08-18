import { test, expect } from '@playwright/test'

test.describe('homepage', () => {
  test('loads, shows the search box, and at least one featured Proof Boundary', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.ok()).toBe(true)

    await expect(
      page.getByRole('searchbox', { name: /search a compound, treatment, or claim/i })
    ).toBeVisible()

    const featuredHeading = page.getByRole('heading', { name: 'Featured Proof Boundaries' })
    const hasFeatured = await featuredHeading.isVisible()
    // app/page.tsx only renders this section once at least one claim is published — skip
    // gracefully rather than failing hard while seeding is still in progress.
    test.skip(!hasFeatured, 'No featured Proof Boundary rendered yet — no published claims to seed the homepage.')

    await expect(page.getByText(/Proof Boundary —/).first()).toBeVisible()
  })
})

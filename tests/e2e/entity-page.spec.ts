import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

test.describe('canonical entity page', () => {
  test('/r/[slug] shows the entity header, bottom line, and at least one Proof Card', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !response || response.status() === 404,
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )
    expect(response?.ok()).toBe(true)

    // Entity header: canonical name as the H1.
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    // Bottom line: app/r/[slug]/page.tsx renders it in <section id="bottom-line">.
    await expect(page.locator('#bottom-line')).toBeVisible()
    await expect(page.locator('#bottom-line')).not.toBeEmpty()

    // At least one Proof Card (components/ProofCard.tsx renders <article id="claim-...">).
    const proofCards = page.locator('article[id^="claim-"]')
    await expect(proofCards.first()).toBeVisible()
    expect(await proofCards.count()).toBeGreaterThan(0)
  })
})

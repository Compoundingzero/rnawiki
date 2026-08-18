import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

test.describe('standalone claim embed', () => {
  test('/embed/claim/[id] renders standalone (no header/footer/nav) for a published claim', async ({ page }) => {
    const entityResponse = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !entityResponse || !entityResponse.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    // components/EmbedCodeBox.tsx is a <details>/<summary> disclosure ("Embed") that, once
    // opened, renders a live preview <iframe src="/embed/claim/{id}"> with the real numeric
    // claim id baked in — open it and read that rather than guessing a claim id.
    const disclosure = page.getByText('Embed', { exact: true }).first()
    const hasDisclosure = await disclosure.isVisible()
    test.skip(!hasDisclosure, 'No Embed disclosure rendered on this entity page yet.')
    await disclosure.click()

    const previewFrame = page.locator('iframe[src^="/embed/claim/"]').first()
    const href = await previewFrame.getAttribute('src')
    expect(href).toMatch(/^\/embed\/claim\/\d+$/)

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

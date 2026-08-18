import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

test.describe('Proof Card evidence detail', () => {
  test('expands to show sourced evidence', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !response || !response.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    const firstCard = page.locator('article[id^="claim-"]').first()
    test.skip((await firstCard.count()) === 0, 'No published Proof Card to expand yet.')

    // components/ProofCard.tsx renders evidence inside a native <details>/<summary> — collapsed
    // by default, so it works with JavaScript disabled too. Playwright's .click() on <summary>
    // toggles it open the same way a real click would. The card also has a second, unrelated
    // <summary> for the "Embed" code box (components/EmbedCodeBox.tsx) — scope to the one whose
    // text actually matches the evidence-count pattern rather than assuming there's only one.
    const summary = firstCard.locator('summary').filter({ hasText: /Evidence \(\d+ sources?\)/ })
    await expect(summary).toContainText(/Evidence \(\d+ sources?\)/)
    await summary.click()

    // EvidenceSourceList.tsx renders "<Relationship>: <source title>" once expanded.
    const relationshipLabel = firstCard.getByText(/^(Supports|Contradicts|Limits|Contextualizes):/)
    await expect(relationshipLabel.first()).toBeVisible()
  })
})

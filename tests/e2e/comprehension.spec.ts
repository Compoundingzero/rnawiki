import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

test.describe('comprehension ("teach-back") test', () => {
  test('completing a comprehension test on a claim shows immediate feedback (correct/incorrect + explanation)', async ({
    page,
  }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(
      !response || !response.ok(),
      `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet — skipping until seed data lands.`
    )

    // components/ComprehensionTest.tsx renders one <section aria-labelledby="comprehension-heading-{claimId}">
    // per claim with this heading, only when that claim has comprehensionQuestions seeded.
    // `section:has(heading)` is ambiguous here — the outer "#most-searched-claims" section that
    // wraps every ProofCard also contains this same heading as a descendant, so filtering by
    // containment alone matches both and .first() grabs the wrong (outer) one. Use the actual
    // aria-labelledby relationship instead, which is unambiguous by construction.
    const heading = page.getByRole('heading', { name: 'Check your understanding' })
    const hasComprehension = await heading.first().isVisible()
    test.skip(!hasComprehension, 'No comprehension questions seeded on this entity yet.')

    const headingId = await heading.first().getAttribute('id')
    expect(headingId).toBeTruthy()
    const section = page.locator(`section[aria-labelledby="${headingId}"]`)
    // Each question renders as its own <fieldset>/<legend> (accessible role="group"), and every
    // question has its own "Check my answer" button — scope to the first question's group
    // specifically rather than the whole section, which can contain up to three.
    const firstQuestion = section.getByRole('group').first()
    await firstQuestion.locator('input[type="radio"]').first().check()
    await firstQuestion.getByRole('button', { name: /check my answer/i }).click()

    // Immediate feedback: a role="status" element reading "That matches the explanation. <explanation>"
    // or "Not quite. <explanation>" — either way it must appear without a page reload.
    const feedback = firstQuestion.getByRole('status').first()
    await expect(feedback).toBeVisible()
    await expect(feedback).toContainText(/That matches the explanation\.|Not quite\./)
    // The explanation text (not just the correct/incorrect verdict) must also be present.
    const feedbackText = (await feedback.textContent())?.trim() ?? ''
    expect(feedbackText.length).toBeGreaterThan('That matches the explanation.'.length)
  })
})

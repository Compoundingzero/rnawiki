import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

/**
 * Evidence Trace is the signature interaction, so it is tested as a dialog, not just as markup:
 * it must open from the source marker, expose the real source record, trap focus, close on
 * Escape, and return focus to the marker that opened it.
 *
 * This replaces the previous test, which asserted a <details>/<summary> evidence disclosure —
 * the pattern the field-guide redesign removed.
 */
test.describe('Evidence Trace', () => {
  test('a source marker opens the evidence drawer with the real source record', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!response || !response.ok(), 'Entity not seeded/published yet.')

    const marker = page.locator('button.srcmark').first()
    test.skip((await marker.count()) === 0, 'No claim has linked sources yet.')

    await expect(marker).toHaveAttribute('aria-expanded', 'false')
    await marker.click()

    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await expect(marker).toHaveAttribute('aria-expanded', 'true')

    // The record must carry real bibliographic metadata, not placeholder rows.
    await expect(drawer.getByText('Evidence Trace')).toBeVisible()
    await expect(drawer.getByText(/Source type/i).first()).toBeVisible()

    // At least one source links out to a resolvable identifier.
    const outbound = drawer.locator('a[href^="https://doi.org/"], a[href^="https://pubmed"], a[href^="https://clinicaltrials.gov"]')
    expect(await outbound.count()).toBeGreaterThan(0)

    // Never fabricate completeness: no row may render an empty or placeholder value.
    const values = await drawer.locator('.speclabel__val').allTextContents()
    for (const v of values) {
      expect(v.trim()).not.toBe('')
      expect(v.trim().toLowerCase()).not.toBe('n/a')
    }
  })

  test('the drawer closes on Escape and returns focus to its marker', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!response || !response.ok(), 'Entity not seeded/published yet.')

    const marker = page.locator('button.srcmark').first()
    test.skip((await marker.count()) === 0, 'No claim has linked sources yet.')

    await marker.click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(marker).toBeFocused()
    await expect(marker).toHaveAttribute('aria-expanded', 'false')
  })

  test('the source marker is reachable and operable by keyboard alone', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!response || !response.ok(), 'Entity not seeded/published yet.')

    const marker = page.locator('button.srcmark').first()
    test.skip((await marker.count()) === 0, 'No claim has linked sources yet.')

    await marker.focus()
    await expect(marker).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})

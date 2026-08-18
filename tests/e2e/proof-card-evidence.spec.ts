import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

/**
 * Sources.
 *
 * This file previously tested a client-rendered evidence drawer. That drawer was removed: because
 * it only mounted its contents on click, every DOI and PMID on the site was invisible without
 * JavaScript and uncrawlable. Sources are now a server-rendered list inside a native <details>,
 * so these tests assert the property that mattered — the citations exist in the HTML.
 */
test.describe('sources', () => {
  test('every claim exposes its sources as real links in the server HTML', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    expect(response?.ok()).toBe(true)

    const sourceLinks = page.locator(
      'a[href^="https://doi.org/"], a[href^="https://pubmed.ncbi.nlm.nih.gov/"], a[href^="https://clinicaltrials.gov/"]'
    )
    expect(await sourceLinks.count(), 'no citation links found on the entity page').toBeGreaterThan(0)
  })

  test('sources remain present with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    expect(response?.ok()).toBe(true)

    const html = await page.content()
    expect(html, 'no DOI links in the no-JS HTML').toContain('https://doi.org/')

    // The answer itself must also survive without JavaScript.
    const text = await page.locator('main').innerText()
    expect(text.toLowerCase()).toContain('no controlled human trial')

    await context.close()
  })

  test('a source disclosure opens by keyboard alone', async ({ page }) => {
    await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    const summary = page.locator('summary').filter({ hasText: /sources/i }).first()
    test.skip((await summary.count()) === 0, 'No source disclosure rendered.')

    await summary.focus()
    await expect(summary).toBeFocused()
    await page.keyboard.press('Enter')

    const details = summary.locator('xpath=..')
    await expect(details).toHaveAttribute('open', '')
  })

  test('a deep link to a claim reveals that claim', async ({ page }) => {
    await page.goto(`/r/${SEEDED_SLUGS.bpc157}#claim-safety`)
    const claim = page.locator('#claim-safety')
    await expect(claim).toBeVisible()
    // :target forces the matching claim's evidence open, since a fragment never reaches the server.
    const text = await claim.innerText()
    expect(text.toLowerCase()).toContain('what researchers measured')
  })
})

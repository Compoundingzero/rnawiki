import { expect, test, type Page } from '@playwright/test'

import {
  installDossierV4Fixture,
  removeDossierV4Fixture,
  type DossierV4Fixture,
} from './fixtures/dossier-v4'

/**
 * The footer in a browser, on both of the two surfaces that render one.
 *
 * A unit test can check the shared list; only this can check that the plain-HTML document and the
 * React shell put the same thing on screen, that no link 404s, and that the removed editorial
 * policy URL still lands somewhere useful for a reader arriving from a search result.
 */

test.describe.configure({ mode: 'serial' })

let fixture: DossierV4Fixture | null = null

test.beforeAll(async () => {
  fixture = await installDossierV4Fixture()
})

test.afterAll(async () => {
  await removeDossierV4Fixture(fixture)
})

const EXPECTED = [
  'Browse medicines',
  'Compare',
  'How RNAWiki works',
  'Review and improve',
  'Privacy',
]

async function footerLabels(page: Page): Promise<string[]> {
  return page
    .locator('footer nav[aria-label="Footer"] a')
    .allTextContents()
    .then((labels) => labels.map((label) => label.trim()))
}

test('the React shell footer carries exactly the five links', async ({ page }) => {
  await page.goto('/how-it-works')
  expect(await footerLabels(page)).toEqual(EXPECTED)
})

test('the plain document footer carries exactly the same five', async ({ page }) => {
  const slug = fixture?.slug ?? ''
  await page.goto(`/d/${slug}`)
  expect(await footerLabels(page)).toEqual(EXPECTED)
})

test('neither footer offers the editorial policy, the analytics control or a sign-in link', async ({
  page,
}) => {
  for (const path of ['/how-it-works', `/d/${fixture?.slug ?? ''}`]) {
    await page.goto(path)
    const footer = page.locator('footer').last()
    const text = (await footer.textContent()) ?? ''
    expect(text).not.toContain('Editorial policy')
    expect(text).not.toContain('Analytics choices')
    expect(text).not.toContain('Sign in on the front page')
    expect(text).not.toContain('Public datasets')
    await expect(footer.locator('button')).toHaveCount(0)
  }
})

test('every footer link answers', async ({ page, request }) => {
  await page.goto('/how-it-works')
  const hrefs = await page
    .locator('footer nav[aria-label="Footer"] a')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href') ?? ''))
  expect(hrefs).toHaveLength(5)
  for (const href of hrefs) {
    const response = await request.get(href)
    expect([200, 301, 308], `${href} answered ${response.status()}`).toContain(response.status())
  }
})

test('the old editorial policy URL redirects to the section that replaced it', async ({
  request,
}) => {
  const response = await request.get('/editorial-policy', { maxRedirects: 0 })
  expect(response.status()).toBe(308)
  expect(response.headers()['location']).toContain('/how-it-works#review-and-corrections')
})

test('the section it redirects to exists and explains review', async ({ page }) => {
  await page.goto('/how-it-works#review-and-corrections')
  const section = page.locator('#review-and-corrections')
  await expect(section).toBeVisible()
  await expect(section).toContainText('Three members have to agree')
  await expect(section).toContainText('Approval is about words, not about evidence')
})

test('the analytics choice can still be changed from the privacy page', async ({ page }) => {
  await page.goto('/privacy')
  await expect(page.locator('main')).toContainText('Google Analytics loads only after a visitor')
  await expect(page.locator('main')).toContainText('Global Privacy Control')
  // The control renders only where a measurement id is configured; the explanation is always there.
  const controls = page.getByRole('button', { name: 'Analytics choices' })
  const count = await controls.count()
  if (count === 0) {
    await expect(page.locator('main')).toContainText('No analytics is configured')
  } else {
    await expect(controls.first()).toBeVisible()
  }
})

test('the trust lines stay on both footers', async ({ page }) => {
  for (const path of ['/how-it-works', `/d/${fixture?.slug ?? ''}`]) {
    await page.goto(path)
    const footer = page.locator('footer').last()
    await expect(footer).toContainText('not medical advice')
    await expect(footer).toContainText('No advertising')
    await expect(footer).toContainText('Free to read')
  }
})

test('the footer does not overflow at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto(`/d/${fixture?.slug ?? ''}`)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)
})

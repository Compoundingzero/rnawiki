import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import {
  installNavigatorCoverageFixture,
  removeNavigatorCoverageFixture,
  type NavigatorCoverageFixture,
} from './fixtures/navigator-coverage'

/** Sparse medicine records must not offer dead destinations or disguise missing human results. */

test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

let fixture: NavigatorCoverageFixture | null = null

test.beforeAll(async () => {
  fixture = await installNavigatorCoverageFixture()
})

test.afterAll(async () => {
  await removeNavigatorCoverageFixture(fixture)
})

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
})

function requireFixture(): NavigatorCoverageFixture {
  if (!fixture) throw new Error('The navigator coverage fixture did not finish installing.')
  return fixture
}

test('the desktop rail lists only sections this sparse record actually renders', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const rail = page.locator('.dv4-nav')
  await expect(rail).toContainText('On this page')

  const hrefs = await rail
    .locator('a[href^="#"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))
  expect(hrefs).toEqual(['#answer', '#safety', '#sources'])
})

test('every rail entry lands on a section that exists', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const targets = await page
    .locator('.dv4-nav a[href^="#"]')
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).hash.slice(1)))

  for (const id of targets) {
    // Not merely present: visible without opening anything, because nothing here is behind a
    // disclosure and nothing has to run for the link to work.
    await expect(page.locator(`#${id}`), `#${id} is linked from the rail`).toBeVisible()
  }
})

test('a missing human result is said plainly, without an empty result section', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  await expect(page.locator('#answer .dv4-simple-noresult')).toContainText(
    /(?:no (?:sufficiently scoped )?human result|a study result is recorded, but this page (?:has not yet linked|cannot yet link) its numbers to the exact condition and form tested)/i,
  )
  await expect(page.locator('#safety')).toContainText('no source-bound safety statement')
  await expect(page.locator('#human-results')).toHaveCount(0)
  await expect(page.locator('#body-path')).toHaveCount(0)
  await expect(page.locator('#forms')).toHaveCount(0)
})

test('the rail has no link to an absent section', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  for (const absent of ['human-results', 'body-path', 'forms']) {
    await expect(page.locator(`.dv4-nav a[href="#${absent}"]`)).toHaveCount(0)
  }
})

test('none of it needs JavaScript', async ({ browser }) => {
  const { slug } = requireFixture()
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`/d/${slug}`)

  await expect(page.locator('.dv4-nav')).toContainText('On this page')
  const first = page.locator('.dv4-nav a[href^="#"]').first()
  const target = (await first.getAttribute('href')) ?? '#answer'
  await first.click()
  await expect(page.locator(target)).toBeVisible()
  await context.close()
})

test('mobile contents works at a 320 pixel viewport without horizontal overflow', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto(`/d/${slug}`)

  const contents = page.locator('.dv4-mobile-contents')
  await expect(contents).toBeVisible()
  await contents.locator('summary').click()
  await contents.getByRole('link', { name: 'Safety', exact: true }).click()
  await expect(page.locator('#safety h2')).toBeFocused()

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)

  const results = await new AxeBuilder({ page })
    .include('.dv4-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

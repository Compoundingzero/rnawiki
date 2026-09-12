import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import {
  installNavigatorCoverageFixture,
  removeNavigatorCoverageFixture,
  type NavigatorCoverageFixture,
} from './fixtures/navigator-coverage'

/**
 * Seeing which parts of a medicine page hold something, before spending a click on them.
 *
 * The reader's problem here has not changed: a long page of headings, most of them empty, teaches
 * a reader that scrolling is not worth it. What has changed is the answer.
 *
 * There used to be a floating "Sections & feedback" button that opened a dialog listing every
 * module with a "Recorded" or "Not documented here" badge beside it — a client component, in a
 * layout where everything worth reading sat two clicks deep behind closed disclosures. That layout
 * is gone and so is the button. The compass answers the same question in the page itself: it does
 * not render a section it has nothing for, it names every section it left out in one block near the
 * foot, and the standing navigator in the left rail lists only what is there, each entry carrying
 * the state of the section it points at.
 *
 * So the journey tested here is still the reader's — arrive, see what is real, jump to it, find it
 * open — and it now runs with no JavaScript at all.
 */

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

test('the rail lists the sections that hold content, and each carries its state', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const rail = page.locator('.dv4-nav')
  await expect(rail).toContainText('On this page')

  const links = rail.locator('a[href^="#"]')
  expect(await links.count()).toBeGreaterThan(3)

  // Every entry says what state the section it points at is in, before the reader goes there.
  for (const state of await links.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-section-state')),
  )) {
    expect(state, 'a rail entry with no section state').toBeTruthy()
  }
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

test('a section the record has nothing for is named as missing rather than left blank', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const missing = page.locator('#what-is-missing')
  await expect(missing).toBeVisible()
  await expect(missing).toContainText('could not answer')

  // Each one names the question and why there is no answer, in ordinary words.
  const rows = missing.locator('li')
  expect(await rows.count()).toBeGreaterThan(0)
  for (const text of await rows.allTextContents()) {
    expect(text).toMatch(
      /found nothing in the sources checked|does not apply to this substance|is not something RNAWiki collects yet/u,
    )
  }

  // And a section named as missing is genuinely not rendered, rather than rendered and hidden.
  const missingIds = await rows.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-section')),
  )
  for (const id of missingIds) {
    await expect(page.locator(`#${id}`)).toHaveCount(0)
  }
})

test('the rail and the missing list agree, and neither is a subset of the other', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const railTargets = new Set(
    await page
      .locator('.dv4-nav a[href^="#"]')
      .evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).hash.slice(1))),
  )
  const missingIds = await page
    .locator('#what-is-missing li')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-section') ?? ''))

  // A section cannot be both offered in the rail and listed as absent.
  for (const id of missingIds) {
    expect(railTargets.has(id), `${id} is both in the rail and listed as missing`).toBe(false)
  }
})

test('none of it needs JavaScript', async ({ browser }) => {
  const { slug } = requireFixture()
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`/d/${slug}`)

  await expect(page.locator('.dv4-nav')).toContainText('On this page')
  const first = page.locator('.dv4-nav a[href^="#"]').first()
  const target = (await first.getAttribute('href')) ?? '#substance-action'
  await first.click()
  await expect(page.locator(target)).toBeVisible()
  await context.close()
})

test('the rail works at a 320 pixel viewport without horizontal overflow', async ({ page }) => {
  const { slug } = requireFixture()
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto(`/d/${slug}`)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflow).toBe(false)

  const results = await new AxeBuilder({ page })
    .include('.dv4-canvas')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

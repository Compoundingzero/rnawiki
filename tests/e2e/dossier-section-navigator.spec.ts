import { expect, test, type Page } from '@playwright/test'

import {
  installNavigatorCoverageFixture,
  removeNavigatorCoverageFixture,
  type NavigatorCoverageFixture,
} from './fixtures/navigator-coverage'

/**
 * The floating navigator is the first control a reader can act on, and the reason it exists is that
 * everything worth reading on a medicine page sits two clicks deep behind closed disclosures. So the
 * journey tested here is the reader's, not the component's: arrive, see which sections are real,
 * jump to one, and find it open rather than collapsed.
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

async function openNavigator(page: Page) {
  const trigger = page.getByRole('button', { name: /Sections & feedback/i })
  await expect(trigger).toBeVisible()
  await trigger.click()
  return page.getByRole('dialog', { name: /Sections of the/i })
}

test('a reader can see which sections hold content before spending a click', async ({ page }) => {
  const { slug, name } = requireFixture()
  await page.goto(`/d/${slug}`)

  const trigger = page.getByRole('button', { name: /Sections & feedback/i })
  await expect(trigger).toBeVisible()

  /* The badge counts sections where recorded sources disagree, which is one on this fixture. */
  await expect(trigger).toContainText('1')

  const panel = await openNavigator(page)
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(name.slice(0, 9))
  await expect(panel).toContainText('sections hold recorded content')

  /* A module the fixture holds is offered as recorded. */
  const uses = panel.getByRole('button', { name: /What the label says it is for/i })
  await expect(uses).toContainText('Recorded')

  /* A module the fixture does not hold says so in words about the corpus, not about the medicine. */
  const organism = panel.getByRole('button', { name: /What organism it is/i })
  await expect(organism).toContainText('Not documented here')
})

test('a disagreement between sources is visible from the navigator', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const panel = await openNavigator(page)

  const consensus = panel.getByRole('button', { name: /What every label says/i })
  await expect(consensus).toContainText('Sources differ')
})

test('jumping to a section opens the disclosure that contains it', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const panel = await openNavigator(page)

  await panel.getByRole('button', { name: /What the label says it is for/i }).click()

  /*
   * The failure this prevents: scrolling to an element inside a closed <details> lands the reader on
   * a heading with nothing under it, which reads as a broken link rather than a working jump.
   */
  const target = page.locator('#recorded-uses')
  await expect(target).toBeVisible()
  await expect(page.locator('details#recorded-uses')).toHaveAttribute('open', '')
  await expect(panel).toBeHidden()
})

test('the navigator is operable by keyboard and closes on Escape', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const trigger = page.getByRole('button', { name: /Sections & feedback/i })
  await trigger.focus()
  await expect(trigger).toBeFocused()
  await page.keyboard.press('Enter')

  const panel = page.getByRole('dialog', { name: /Sections of the/i })
  await expect(panel).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  /* Focus returns to the trigger, which is where a keyboard reader expects to be left. */
  await expect(trigger).toBeFocused()
})

test('feedback is reachable from the navigator on a medicine page', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const panel = await openNavigator(page)

  await panel.getByRole('button', { name: /Report something wrong on this page/i }).click()
  await expect(page.getByRole('dialog', { name: /feedback/i })).toBeVisible()
})

test('the navigator works at a 320 pixel viewport without horizontal overflow', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto(`/d/${slug}`)

  const panel = await openNavigator(page)
  await expect(panel).toBeVisible()

  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(overflows).toBe(false)
})

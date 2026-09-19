import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import {
  installDossierV4Fixture,
  removeDossierV4Fixture,
  type DossierV4Fixture,
} from './fixtures/dossier-v4'

test.describe.configure({ mode: 'serial' })

let fixture: DossierV4Fixture | null = null

test.beforeAll(async () => {
  fixture = await installDossierV4Fixture()
})

test.afterAll(async () => {
  await removeDossierV4Fixture(fixture)
})

function record(): DossierV4Fixture {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  return fixture
}

test('one clear answer leads the page, followed by safety and evidence', async ({ page }) => {
  await page.goto(`/d/${record().slug}`)
  await expect(page.locator('main h1')).toHaveText(record().name)
  await expect(page.locator('#answer')).toBeVisible()
  await expect(page.locator('#answer')).toContainText('Taken in this fixture')
  // A delivery-only sentence is not passed off as a useful mechanism.
  await expect(page.locator('#answer')).not.toContainText('reaches the fixture tissue')
  const headings = await page.locator('.dv4-simple-answer > h2, .dv4-simple-section > h2').allTextContents()
  expect(headings).toEqual([
    'The short answer',
    'What can go wrong?',
    'What happened in people?',
    'Names and forms',
    'Check the record',
  ])
  await expect(page.locator('#answer')).toContainText('No result has passed')
  await expect(page.locator('#answer')).not.toContainText('Fixture strength rose')
})

test('the left contents rail only points to real sections', async ({ page }) => {
  await page.goto(`/d/${record().slug}`)
  const links = page.locator('.dv4-simple-nav a')
  const count = await links.count()
  expect(count).toBeGreaterThanOrEqual(4)
  expect(count).toBeLessThanOrEqual(6)
  for (let index = 0; index < count; index += 1) {
    const href = await links.nth(index).getAttribute('href')
    expect(href).toMatch(/^#/)
    await expect(page.locator(href ?? '#missing')).toHaveCount(1)
  }
})

test('source details stay reachable without repeating empty cards', async ({ page }) => {
  await page.goto(`/d/${record().slug}`)
  await expect(page.locator('#sources details')).not.toHaveCount(0)
  await expect(page.locator('#forms')).toContainText('Fixture compound')
  await expect(page.locator('#unknowns')).toHaveCount(0)
  await expect(page.locator('#no-response')).toHaveCount(0)
  await expect(page.locator('#next-question')).toHaveCount(0)
  await expect(page.locator('#body-journey')).toHaveCount(0)
})

test('a registered study is not rendered as an efficacy result', async ({ page }) => {
  await page.goto(`/d/${record().slug}`)
  await expect(page.locator('#human-results')).toContainText('registration is not a result')
  await expect(page.locator('#human-results')).not.toContainText('Fixture strength rose')
  await expect(page.locator('main')).not.toContainText('Measured performance')
})

test('safety does not become reassurance or a self-experiment protocol', async ({ page }) => {
  await page.goto(`/d/${record().slug}`)
  const text = (await page.locator('main').innerText()).toLowerCase()
  expect(text).not.toMatch(/\btake \d+\s?(mg|g|mcg|ml|iu)\b/)
  expect(text).not.toMatch(/\bstart (?:with|at|taking) \d/)
  expect(text).not.toContain('no known risk')
  expect(text).not.toContain('no side effects')
  expect(text).not.toContain('safe together')
  await expect(page.locator('[data-block="self-experiment-plan"]')).toHaveCount(0)
})

test('heading order and keyboard disclosures are accessible', async ({ page }) => {
  await page.goto(`/d/${record().slug}`)
  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main h1, main h2, main h3')).map((node) =>
      Number(node.tagName.slice(1)),
    ),
  )
  expect(levels[0]).toBe(1)
  for (let index = 1; index < levels.length; index += 1) {
    expect(levels[index]).toBeLessThanOrEqual((levels[index - 1] ?? 1) + 1)
  }
  const summary = page.locator('#sources summary').first()
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(summary.locator('xpath=..')).toHaveAttribute('open', '')
  const axe = await new AxeBuilder({ page })
    .include('.dv4-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(axe.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
})

for (const width of [320, 390, 768, 960, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 850 } })
    try {
      const page = await context.newPage()
      await page.goto(`/d/${record().slug}`)
      const sizes = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)
    } finally {
      await context.close()
    }
  })
}

test('mobile shows the answer before the contents rail', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  try {
    const page = await context.newPage()
    await page.goto(`/d/${record().slug}`)
    const answer = await page.locator('#answer').boundingBox()
    const nav = await page.locator('.dv4-simple-nav').boundingBox()
    expect(answer?.y ?? 0).toBeLessThan(nav?.y ?? 0)
  } finally {
    await context.close()
  }
})

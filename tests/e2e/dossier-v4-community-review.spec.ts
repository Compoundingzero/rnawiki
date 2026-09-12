import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import {
  installDossierV4Fixture,
  removeDossierV4Fixture,
  type DossierV4Fixture,
} from './fixtures/dossier-v4'

/**
 * What a medicine page shows about its own review, read in a browser. The answer is: nothing.
 *
 * This file was written when the preliminary-review banner was replaced by a small control on the
 * page — a pill reading "Review or improve · 0/3" that linked into the queue for that medicine. The
 * control is gone too. A reader arrives to find out about a medicine, and a page that asks them in
 * the same breath to adjudicate its wording has changed what it is; the fraction also invited a
 * reading nobody intended, where 2/3 looks like a score for the medicine rather than a count of
 * signatures on a sentence. Review now lives only at /review-queue, reached from the footer link
 * every page carries.
 *
 * So the first job of this file is to prove the page carries neither the banner nor the control,
 * and that the review machinery leaves no trace on it at all. The second is the part that is easy
 * to lose: the approved V4 design and the approved wording are not this task's to change, so the
 * layout, the left rail, the purpose controls and the section order are asserted here as a
 * regression guard rather than trusted to review.
 */

test.describe.configure({ mode: 'serial' })

let fixture: DossierV4Fixture | null = null

test.beforeAll(async () => {
  fixture = await installDossierV4Fixture()
})

test.afterAll(async () => {
  await removeDossierV4Fixture(fixture)
})

function requireFixture(): DossierV4Fixture {
  if (!fixture) throw new Error('The dossier v4 fixture did not finish installing.')
  return fixture
}

/**
 * What a reader sees without opening anything. A closed `<details>` is excluded on purpose: this
 * change moved the long provenance explanation into one, and a test that counted its text would
 * report the move as a failure to move it.
 */
async function readerText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return ''
    const parts: string[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const element = walker.currentNode.parentElement
      if (!element) continue
      const closed = element.closest('details:not([open])')
      if (closed && !element.closest('summary')) continue
      const value = walker.currentNode.textContent?.trim()
      if (value) parts.push(value)
    }
    return parts.join(' ')
  })
}

/* ------------------------------------------------- the banner is gone */

test('an ordinary page does not open with a preliminary-review banner', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = await readerText(page)

  expect(text).not.toContain('PRELIMINARY, AWAITING REVIEW')
  expect(text).not.toContain('Preliminary, awaiting review')
  expect(text).not.toContain('Read it as a working draft')
  expect(text).not.toContain('nobody has signed it off yet')
  // The container itself, not only its words.
  await expect(page.locator('.dv4-publication')).toHaveCount(0)
})

test('the internal publication state is preserved even though the banner is not shown', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  // The state still travels with the document: the corpus validation and the indexing decision
  // both read it, and only the presentation changed.
  const root = page.locator('.dv4-root')
  await expect(root).toHaveAttribute('data-publication-state', /preliminary|limited/)
})

test('nothing replaced the banner, and the reader content moved up', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const strip = await page.locator('.dv4-strip').boundingBox()
  const purpose = await page.locator('.dv4-purpose').boundingBox()
  const headline = await page.locator('.dv4-hero-action').boundingBox()

  // The identity strip runs straight into the purpose controls. The old banner was over 130 px
  // tall and sat between them; the control that briefly replaced it was about 44.
  expect((purpose?.y ?? 0) - ((strip?.y ?? 0) + (strip?.height ?? 0))).toBeLessThan(60)
  expect(headline?.y ?? 0).toBeLessThan(700)
})

/* --------------------------------------- no review surface on a reader page */

test('a medicine page carries no review control of any kind', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  // The control and the banner that preceded it.
  await expect(page.locator('.dv4-review-pill')).toHaveCount(0)
  await expect(page.locator('[data-review-state]')).toHaveCount(0)
  await expect(page.locator('.dv4-publication')).toHaveCount(0)

  // And no link into review from anywhere inside the medicine document.
  const inPageLinks = await page
    .locator('main a[href*="review-queue"]')
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLAnchorElement).getAttribute('href')))
  expect(inPageLinks).toEqual([])
})

test('a reader page shows no approval fraction or approval status', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = await readerText(page)

  // The fraction invited a reading nobody intended: 2/3 looks like a score for the medicine.
  expect(text).not.toMatch(/\b[0-9]\s*\/\s*3\b/u)
  expect(text).not.toContain('Review or improve')
  expect(text.toLowerCase()).not.toContain('community approved')
  expect(text.toLowerCase()).not.toContain('community-approved')
  expect(text.toLowerCase()).not.toContain('approved by three')
})

test('review is reachable from the footer, on every page, and only from there', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const footerLink = page.locator('footer a[href="/review-queue"]')
  await expect(footerLink).toHaveCount(1)
  await expect(footerLink).toContainText('Review and improve')

  await footerLink.click()
  await page.waitForURL(/\/review-queue$/)
  await expect(page.locator('body')).toContainText('Sentences waiting for review')
})

test('a signed-out reader is not asked to sign in to read, or to review', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  expect(page.url()).toContain(`/d/${slug}`)

  await page.goto('/review-queue')
  const queueText = (await readerText(page)).toLowerCase()
  // The queue explains the rule and offers the way in, without demanding an account to look.
  expect(queueText).toContain('three')
  expect(queueText).toContain('sentences waiting for review')
})

/* ------------------------------------------- the repeated status paragraph */

test('a statement carries a short origin line, not a repeated paragraph', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = await readerText(page)

  // The long explanation is still available, one click away, inside the provenance disclosure.
  expect(text).not.toContain(
    'A person wrote this into the record with the study named beside it. No reviewer has signed it off.',
  )
  const origins = page.locator('.dv4-origin')
  expect(await origins.count()).toBeGreaterThan(0)
  await expect(origins.first()).toContainText(/Source-linked record|Reviewed|Quoted|fixed RNAWiki/)
  // Every origin line is short enough that a reader does not learn to skip it.
  for (const line of await origins.allTextContents()) {
    expect(line.trim().length).toBeLessThan(70)
  }
})

/* --------------------------------------------- the approved design is intact */

test('the approved compass layout survived the change', async ({ page }) => {
  const { slug, name } = requireFixture()
  await page.goto(`/d/${slug}`)

  // Identity strip, promise, purpose controls, left rail, hero, both right-hand components.
  await expect(page.locator('.dv4-strip h1')).toHaveText(name)
  await expect(page.locator('.dv4-strip-facts li').first()).toBeVisible()
  await expect(page.locator('.dv4-purpose')).toContainText('What brought you here?')
  await expect(page.locator('.dv4-nav')).toContainText('On this page')
  await expect(page.locator('.dv4-hero-action')).toBeVisible()
  await expect(page.locator('[data-block="strongest-result"]')).toContainText(
    'What happened in people',
  )
  await expect(page.locator('[data-block="principal-uncertainty"]')).toContainText(
    'The limit that matters most',
  )
  await expect(page.locator('.dv4-hero-aside')).toContainText('The path this takes')
  await expect(page.locator('.dv4-hero-aside')).toContainText('The change it makes')
  await expect(page.locator('#technical-record')).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)

  // Section order is unchanged: the technical record stays below the reader layer.
  const hero = await page.locator('#substance-action').boundingBox()
  const technical = await page.locator('#technical-record').boundingBox()
  expect(hero?.y ?? 0).toBeLessThan(technical?.y ?? 0)
})

test('the order of the compass sections did not change', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const ids = await page.locator('section[id]').evaluateAll((nodes) => nodes.map((node) => node.id))
  const expected = [
    'substance-action',
    'goal-fingerprint',
    'human-results',
    'evidence-staircase',
    'body-journey',
  ]
  const seen = ids.filter((id) => expected.includes(id))
  expect(seen).toEqual(expected)
})

/* -------------------------------------------------- narrow and accessible */

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`the page header works at ${width} px with no horizontal overflow`, async ({ page }) => {
    const { slug } = requireFixture()
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`/d/${slug}`)

    await expect(page.locator('.dv4-strip h1')).toBeVisible()
    await expect(page.locator('.dv4-purpose')).toBeVisible()

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })
}

test('the page header passes the accessibility checks at 320 px', async ({ page }) => {
  const { slug } = requireFixture()
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto(`/d/${slug}`)
  const results = await new AxeBuilder({ page })
    .include('.dv4-strip')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

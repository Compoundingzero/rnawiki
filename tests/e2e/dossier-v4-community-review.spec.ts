import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import {
  installDossierV4Fixture,
  removeDossierV4Fixture,
  type DossierV4Fixture,
} from './fixtures/dossier-v4'

/**
 * What replaced the preliminary-review banner, read in a browser.
 *
 * The banner is the thing this change removes, so the first job of this file is to prove it is
 * gone from an ordinary page and has not been swapped for another large warning. The second is that
 * what took its place is usable: a small control with a real hit area, a name a screen reader can
 * read, and a link that reaches the review queue for this exact medicine.
 *
 * The third is the part that is easy to lose. The approved V4 design and the approved wording are
 * not this task's to change, so the layout, the left rail, the purpose controls and the section
 * order are asserted here as a regression guard rather than trusted to review.
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

test('nothing large replaced the banner, and the reader content moved up', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const control = await page.locator('.dv4-review-pill').boundingBox()
  const purpose = await page.locator('.dv4-purpose').boundingBox()
  const headline = await page.locator('.dv4-hero-action').boundingBox()

  expect(control).not.toBeNull()
  // Small: the control is one line, not a block. The old banner was over 130 px tall.
  expect(control?.height ?? 999).toBeLessThan(60)
  // The purpose controls and the headline follow it without a banner-sized gap between them.
  expect((purpose?.y ?? 0) - ((control?.y ?? 0) + (control?.height ?? 0))).toBeLessThan(80)
  expect(headline?.y ?? 0).toBeLessThan(700)
})

/* ---------------------------------------------------- the review control */

test('the review control reads 0 of 3 and links to this page in the review queue', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const control = page.locator('.dv4-review-pill')
  await expect(control).toHaveCount(1)
  await expect(control).toContainText('Review or improve · 0/3')
  await expect(control).toHaveAttribute('href', `/review-queue?slug=${slug}`)
  await expect(control).toHaveAttribute('data-review-state', 'no_proposal')
})

test('the control has a name that reads as a sentence rather than a fraction', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const name = await page.locator('.dv4-review-pill').getAttribute('aria-label')
  expect(name).toContain('Review or improve the wording on this page')
  expect(name).toContain('approved')
  // Never this claim: three members agreeing on wording is not scientific peer review.
  expect(name?.toLowerCase()).not.toContain('peer review')
})

test('the control is a 44 px target and takes visible focus', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const box = await page.locator('.dv4-review-pill').boundingBox()
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44)

  await page.locator('.dv4-review-pill').focus()
  const outline = await page
    .locator('.dv4-review-pill')
    .evaluate((node) => getComputedStyle(node).outlineWidth)
  expect(outline).not.toBe('0px')
})

test('the control reaches the review queue for this medicine', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await page.locator('.dv4-review-pill').click()
  await page.waitForURL(/\/review-queue\?slug=/)
  await expect(page.locator('main')).toContainText('Review or improve')
})

test('a signed-out reader sees the review status and is not asked to sign in to read', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  // No sign-in wall on the medicine page itself.
  expect(page.url()).toContain(`/d/${slug}`)
  await expect(page.locator('.dv4-review-pill')).toBeVisible()

  await page.goto(`/review-queue?slug=${slug}`)
  const queueText = (await readerText(page)).toLowerCase()
  // The queue explains the rule and offers the way in, without demanding an account to look.
  expect(queueText).toContain('three different eligible members')
  expect(queueText).toContain('sign in on the front page')
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
  test(`the control works at ${width} px with no horizontal overflow`, async ({ page }) => {
    const { slug } = requireFixture()
    await page.setViewportSize({ width, height: 900 })
    await page.goto(`/d/${slug}`)

    const control = page.locator('.dv4-review-pill')
    await expect(control).toBeVisible()
    const box = await control.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)
  })
}

test('the control passes the accessibility checks at 320 px', async ({ page }) => {
  const { slug } = requireFixture()
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto(`/d/${slug}`)
  const results = await new AxeBuilder({ page })
    .include('.dv4-strip')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(results.violations).toEqual([])
})

test('the control does not animate', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const animation = await page
    .locator('.dv4-review-pill')
    .evaluate((node) => getComputedStyle(node).animationName)
  expect(animation).toBe('none')
})

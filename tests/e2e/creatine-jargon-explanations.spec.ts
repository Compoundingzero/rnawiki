/**
 * Plain language on the first read, with the exact professional wording still available.
 *
 * The fixture stores a conclusion written in dense scientific language on purpose. What a reader
 * meets first has to be a sentence they can read; what a clinician or a reviewer needs has to be the
 * stored wording, word for word, not a paraphrase of it. Both, on the same page, is the contract.
 *
 * This used to read the old medicine layout — `ten-second-used-for`, `ten-second-finding`,
 * `ten-second-limit`, and an advanced-evidence disclosure. That layout is deleted. The compass keeps
 * the same two-level contract in a different shape: the hero carries the plain sentences, every
 * statement has a "Where this came from" disclosure under it, and the stored record in full sits in
 * the technical layer at the foot of the page, closed, labelled as the place raw vocabulary is
 * allowed.
 */
import { expect, test, type Browser, type Page } from '@playwright/test'

import {
  installCreatineJargonFixture,
  removeCreatineJargonFixture,
  type CreatineJargonFixture,
} from './fixtures/creatine-jargon'

test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

let fixture: CreatineJargonFixture | null = null

test.beforeAll(async () => {
  fixture = await installCreatineJargonFixture()
})

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
})

test.afterAll(async () => {
  await removeCreatineJargonFixture(fixture)
})

function requireFixture(): CreatineJargonFixture {
  if (!fixture) throw new Error('The Creatine comprehension fixture did not finish installing.')
  return fixture
}

/** The reader layer: everything above the technical record, with closed disclosures excluded. */
async function firstReadText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const flow = document.querySelector('.dv4-flow')
    if (!flow) return ''
    const parts: string[] = []
    const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const element = walker.currentNode.parentElement
      if (!element) continue
      if (element.closest('#technical-record')) continue
      const closed = element.closest('details:not([open])')
      if (closed && !element.closest('summary')) continue
      const value = walker.currentNode.textContent?.trim()
      if (value) parts.push(value)
    }
    return parts.join(' ')
  })
}

async function newTouchPage(browser: Browser) {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
    colorScheme: 'light',
    reducedMotion: 'reduce',
  })
  return {
    close: () => context.close(),
    page: await context.newPage(),
  }
}

test('keeps the first read plain while preserving the exact stored wording', async ({ page }) => {
  const installed = requireFixture()
  await page.goto(`/d/${installed.slug}`)

  // `exact` because the hero carries a visually hidden "What <name> does in the body" heading.
  await expect(page.getByRole('heading', { name: installed.name, exact: true })).toBeVisible()

  const firstRead = await firstReadText(page)

  // What each recorded audit found, in plain words, is a heading a reader meets while scrolling.
  expect(firstRead).toContain('Creatine was measured inside muscle')
  expect(firstRead).toContain('The brain-protection claim is not established here')

  // The dense professional vocabulary is not.
  for (const jargon of ['phosphocreatine', 'neuroprotection', 'Phase 3']) {
    expect(firstRead, `${jargon} reached the first read`).not.toContain(jargon)
  }
  expect(firstRead).not.toContain(installed.exactVerdict)

  /*
   * The plain summary of each audit is one click away rather than on the first read. On the
   * compass it lives in the receipts — "Check any of this yourself" — beside the study it came
   * from, which is where a reader who wants the detail goes. The first read carries the finding;
   * the receipt carries the sentence and the source together.
   */
  const receipt = page.locator('#evidence-receipts')
  await expect(receipt).toContainText(installed.plainMeasuredFinding)

  // The exact stored wording is on the page, word for word, in the technical layer.
  const technical = page.locator('#technical-record')
  await expect(technical).toContainText(installed.exactVerdict)
  await expect(technical).toContainText('Playwright disposable-database fixture')
})

test('keeps the plain first read contained at 375px', async ({ browser }) => {
  const installed = requireFixture()
  const mobile = await newTouchPage(browser)

  try {
    await mobile.page.goto(`/d/${installed.slug}`)

    const firstRead = await firstReadText(mobile.page)
    expect(firstRead).toContain('Creatine was measured inside muscle')
    expect(firstRead).not.toContain('phosphocreatine')

    const overflow = await mobile.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)

    // The exact wording is still reachable on a phone, by tapping into the technical layer.
    const technicalSummary = mobile.page
      .locator('#technical-record summary')
      .filter({ hasText: /Recorded evidence blocks/ })
      .first()
    await technicalSummary.tap()
    await expect(mobile.page.locator('#technical-record')).toContainText(installed.exactVerdict)

    const afterOverflow = await mobile.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(afterOverflow).toBe(false)
  } finally {
    await mobile.close()
  }
})

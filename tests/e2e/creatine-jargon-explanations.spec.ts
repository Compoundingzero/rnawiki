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

/** The visible reader layer, with closed source disclosures excluded. */
async function firstReadText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const flow = document.querySelector('.dv4-root')
    if (!flow) return ''
    const parts: string[] = []
    const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT)
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

test('an unsourced legacy verdict is not presented as a verified result', async ({ page }) => {
  const installed = requireFixture()
  await page.goto(`/d/${installed.slug}`)

  await expect(page.getByRole('heading', { name: installed.name, exact: true })).toBeVisible()

  const firstRead = await firstReadText(page)
  expect(firstRead).toContain('No source-linked answer for this substance')
  expect(firstRead).not.toContain('Creatine was measured inside muscle')
  expect(firstRead).not.toContain('The brain-protection claim is not established here')
  for (const jargon of ['phosphocreatine', 'neuroprotection', 'Phase 3']) {
    expect(firstRead, `${jargon} reached the first read`).not.toContain(jargon)
  }
  expect(firstRead).not.toContain(installed.exactVerdict)
  await expect(page.locator('#sources')).toBeVisible()
  await expect(page.locator('main')).not.toContainText(installed.exactVerdict)
})

test('the honest gap and source inventory remain usable at 375px', async ({ browser }) => {
  const installed = requireFixture()
  const mobile = await newTouchPage(browser)

  try {
    await mobile.page.goto(`/d/${installed.slug}`)

    const firstRead = await firstReadText(mobile.page)
    expect(firstRead).toContain('No source-linked answer for this substance')
    expect(firstRead).not.toContain('phosphocreatine')

    const overflow = await mobile.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow).toBe(false)

    const sourceSummary = mobile.page.locator('#sources summary').first()
    await sourceSummary.tap()
    await expect(sourceSummary.locator('..')).toHaveAttribute('open', '')

    const afterOverflow = await mobile.page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(afterOverflow).toBe(false)
  } finally {
    await mobile.close()
  }
})

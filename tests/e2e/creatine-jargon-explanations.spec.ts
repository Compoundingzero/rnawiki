import { expect, test, type Browser, type Locator, type Page } from '@playwright/test'

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

function exactWording(page: Page): Locator {
  return page.getByTestId('exact-wording-annotated')
}

async function openProfessionalWording(page: Page): Promise<Locator> {
  const summary = page.getByText('Read the full research wording', { exact: true })
  const disclosure = summary.locator('..')
  const exactCopy = exactWording(page)

  await expect(disclosure).not.toHaveAttribute('open')
  await expect(exactCopy).toBeHidden()
  await summary.click()
  await expect(disclosure).toHaveAttribute('open', '')
  await expect(exactCopy).toBeVisible()

  return exactCopy
}

async function openAdvancedEvidence(page: Page): Promise<Locator> {
  await page.waitForLoadState('networkidle')
  const control = page.locator('summary[aria-controls="advanced-evidence-content"]')
  const content = page.locator('#advanced-evidence-content')

  await expect(control).toHaveAttribute('aria-expanded', 'false')
  await expect(content).toBeHidden()
  await control.click()
  await expect(control).toHaveAttribute('aria-expanded', 'true')
  await expect(content).toBeVisible()

  return content
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const sizes = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))
  expect(sizes.documentWidth).toBeLessThanOrEqual(sizes.viewportWidth + 1)
}

async function newTouchPage(browser: Browser): Promise<{ close: () => Promise<void>; page: Page }> {
  const context = await browser.newContext({
    baseURL: 'http://localhost:3000',
    colorScheme: 'light',
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
    viewport: { width: 375, height: 812 },
  })

  return {
    close: () => context.close(),
    page: await context.newPage(),
  }
}

test('keeps purpose, finding, and the biggest limitation plain while preserving exact wording', async ({
  page,
}) => {
  const installed = requireFixture()
  await page.goto(`/d/${installed.slug}`)

  await expect(page.getByRole('heading', { name: installed.name })).toBeVisible()
  await expect(page.getByTestId('ten-second-used-for')).toContainText(installed.purpose)

  const firstRead = page.getByTestId('ten-second-finding')
  await expect(firstRead).toHaveText(installed.plainMeasuredFinding)
  await expect(firstRead).not.toContainText('phosphocreatine')
  await expect(firstRead).not.toContainText('neuroprotection')
  await expect(firstRead).not.toContainText('Phase 3')
  await expect(firstRead.getByRole('button')).toHaveCount(0)
  await expect(firstRead.locator('[role="tooltip"]')).toHaveCount(0)

  const limitation = page.getByTestId('ten-second-limit')
  await expect(limitation).toContainText('Main limit')
  await expect(limitation).toContainText(installed.expectedLimit)
  await expect(limitation.getByRole('button')).toHaveCount(0)

  const evidence = await openAdvancedEvidence(page)
  const exactCopy = await openProfessionalWording(page)
  await expect(exactCopy).toHaveText(installed.exactVerdict)
  await expect(exactCopy.getByRole('button')).toHaveCount(0)
  await expect(exactCopy.locator('[role="tooltip"]')).toHaveCount(0)

  await expect(evidence).toContainText('Creatine was measured inside muscle')
  await expect(evidence).toContainText('The brain-protection claim is not established here')
  await expect(evidence).toContainText('Playwright disposable-database fixture')
})

test('keeps the static summary and professional detail contained at 375px', async ({ browser }) => {
  const installed = requireFixture()
  const mobile = await newTouchPage(browser)

  try {
    await mobile.page.goto(`/d/${installed.slug}`)

    const firstRead = mobile.page.getByTestId('ten-second-finding')
    await expect(firstRead).toHaveText(installed.plainMeasuredFinding)
    await expect(firstRead.getByRole('button')).toHaveCount(0)
    await expect(firstRead.locator('[role="tooltip"]')).toHaveCount(0)
    await expectNoHorizontalOverflow(mobile.page)

    const advancedControl = mobile.page.locator(
      'summary[aria-controls="advanced-evidence-content"]',
    )
    await advancedControl.tap()
    await expect(advancedControl).toHaveAttribute('aria-expanded', 'true')
    const evidence = mobile.page.locator('#advanced-evidence-content')
    await expect(evidence).toBeVisible()

    const professionalSummary = mobile.page.getByText('Read the full research wording', {
      exact: true,
    })
    await professionalSummary.tap()
    const exactCopy = exactWording(mobile.page)
    await expect(exactCopy).toHaveText(installed.exactVerdict)
    await expect(exactCopy.getByRole('button')).toHaveCount(0)
    await expectNoHorizontalOverflow(mobile.page)

    await expect(evidence).toContainText('Playwright disposable-database fixture')
    await expectNoHorizontalOverflow(mobile.page)
  } finally {
    await mobile.close()
  }
})

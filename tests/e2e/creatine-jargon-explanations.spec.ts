import { expect, test, type Browser, type Locator, type Page } from '@playwright/test'

import {
  installCreatineJargonFixture,
  removeCreatineJargonFixture,
  type CreatineJargonFixture,
} from './fixtures/creatine-jargon'

test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

const EXPLANATION_CONTROLS = [
  {
    key: 'evidence-claim-survives-audit',
    phrase: 'central claim survives audit',
    meaning: 'The main claim remained supported after the cited studies were checked',
  },
  {
    key: 'muscle-creatine',
    phrase: 'muscle creatine',
    meaning: 'The amount of creatine stored inside muscle tissue',
  },
  {
    key: 'phosphocreatine-resynthesis',
    phrase: 'phosphocreatine resynthesis',
    meaning: 'How quickly a muscle refills one rapid energy store after hard effort',
  },
  {
    key: 'exercise-short-duration-power',
    phrase: 'short-duration power',
    meaning: 'How much work the body can produce quickly during a brief, hard effort',
  },
  {
    key: 'evidence-replicated-across-time',
    phrase: 'replicated across decades',
    meaning: 'Similar findings appeared again in studies using new groups of people',
  },
  {
    key: 'neuroprotection',
    phrase: 'neuroprotection',
    meaning: 'Preventing or slowing damage to nerve cells',
  },
  {
    key: 'evidence-failed-two-phase-3-trials',
    phrase: 'failed two Phase 3 trials',
    meaning: 'Two later-stage studies did not show the planned patient benefit',
  },
  {
    key: 'study-participant-total-2294',
    phrase: '2,294 patients',
    meaning: 'The combined number of people in the named studies',
  },
] as const

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
  if (!fixture) throw new Error('The Creatine jargon fixture did not finish installing.')
  return fixture
}

function exactWording(page: Page): Locator {
  return page.getByTestId('exact-wording-annotated')
}

function explanationControl(exactCopy: Locator, key: string): Locator {
  return exactCopy.locator(`[data-context-key="${key}"] button`)
}

async function sourceTextWithoutExplanationMarkup(exactCopy: Locator): Promise<string> {
  return exactCopy.evaluate((element) => {
    const clone = element.cloneNode(true) as HTMLElement
    clone
      .querySelectorAll('[data-inline-term-panel], [hidden], .sr-only, noscript')
      .forEach((node) => node.remove())
    return (clone.textContent ?? '').replace(/\s+/g, ' ').trim()
  })
}

async function assertAllDistinctControls(exactCopy: Locator): Promise<void> {
  for (const { key, phrase } of EXPLANATION_CONTROLS) {
    const control = explanationControl(exactCopy, key)
    await expect(control, `${phrase} should have its own local explanation control`).toHaveCount(1)
    await expect(control).toContainText(phrase)
    await expect(control).not.toHaveAttribute('title')
  }

  await expect(exactCopy.locator('[data-context-key] button')).toHaveCount(
    EXPLANATION_CONTROLS.length,
  )
  await expect(exactCopy.locator('[title]')).toHaveCount(0)
}

async function openProfessionalWording(page: Page): Promise<Locator> {
  const summary = page.getByText('Read the professional wording', { exact: true })
  const disclosure = summary.locator('..')
  const exactCopy = exactWording(page)

  await expect(disclosure).not.toHaveAttribute('open')
  await expect(exactCopy).toBeHidden()
  await summary.click()
  await expect(disclosure).toHaveAttribute('open', '')
  await expect(exactCopy).toBeVisible()

  return exactCopy
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

test('keeps the professional Creatine sentence intact and offers one local explanation at a time on desktop', async ({
  page,
}) => {
  const installed = requireFixture()
  await page.goto(`/d/${installed.slug}`)

  await expect(page.getByRole('heading', { name: installed.name })).toBeVisible()
  const firstRead = await sourceTextWithoutExplanationMarkup(
    page.getByTestId('first-read-annotated-summary'),
  )
  expect(firstRead).toBe(installed.plainMeasuredFinding)
  expect(firstRead).not.toContain('phosphocreatine')

  const exactCopy = await openProfessionalWording(page)
  await assertAllDistinctControls(exactCopy)
  expect(await sourceTextWithoutExplanationMarkup(exactCopy)).toBe(installed.exactVerdict)

  const panel = exactCopy.locator('[data-inline-term-panel]')
  const auditControl = explanationControl(exactCopy, EXPLANATION_CONTROLS[0].key)
  const muscleControl = explanationControl(exactCopy, EXPLANATION_CONTROLS[1].key)
  const phosphocreatineControl = explanationControl(exactCopy, EXPLANATION_CONTROLS[2].key)

  await auditControl.hover()
  await expect(panel).toBeVisible()
  await expect(panel).toContainText(EXPLANATION_CONTROLS[0].meaning)
  await expect(auditControl).toHaveAttribute('aria-expanded', 'true')
  await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(1)
  await expect(page.locator('[data-inline-term-panel]:visible')).toHaveCount(1)

  await muscleControl.hover()
  await expect(panel).toContainText(EXPLANATION_CONTROLS[1].meaning)
  await expect(auditControl).toHaveAttribute('aria-expanded', 'false')
  await expect(muscleControl).toHaveAttribute('aria-expanded', 'true')
  await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(1)

  await phosphocreatineControl.click()
  await expect(panel).toContainText(EXPLANATION_CONTROLS[2].meaning)
  await expect(phosphocreatineControl).toHaveAttribute('aria-expanded', 'true')
  await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(1)

  await page.keyboard.press('Escape')
  await expect(panel).toBeHidden()
  await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(0)
})

test('uses tap-to-pin explanations in a compact 375px view without horizontal overflow', async ({
  browser,
}) => {
  const installed = requireFixture()
  const mobile = await newTouchPage(browser)

  try {
    await mobile.page.goto(`/d/${installed.slug}`)
    const summary = mobile.page.getByText('Read the professional wording', { exact: true })
    await expect(exactWording(mobile.page)).toBeHidden()
    await summary.tap()

    const exactCopy = exactWording(mobile.page)
    await expect(exactCopy).toBeVisible()
    await assertAllDistinctControls(exactCopy)
    expect(await sourceTextWithoutExplanationMarkup(exactCopy)).toBe(installed.exactVerdict)

    const panel = exactCopy.locator('[data-inline-term-panel]')
    const auditControl = explanationControl(exactCopy, EXPLANATION_CONTROLS[0].key)
    const participantControl = explanationControl(exactCopy, EXPLANATION_CONTROLS[7].key)

    await auditControl.tap()
    await expect(panel).toBeVisible()
    await expect(panel).toContainText(EXPLANATION_CONTROLS[0].meaning)
    await expect(auditControl).toHaveAttribute('aria-expanded', 'true')
    await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(1)

    const viewport = mobile.page.viewportSize()
    if (!viewport) throw new Error('The mobile viewport was not measurable.')
    await expect
      .poll(async () => {
        const bounds = await panel.boundingBox()
        return bounds ? bounds.y + bounds.height : Number.POSITIVE_INFINITY
      })
      .toBeLessThanOrEqual(viewport.height + 1)
    const panelBox = await panel.boundingBox()
    if (!panelBox) throw new Error('The open explanation panel was not measurable.')

    expect(panelBox.x).toBeGreaterThanOrEqual(0)
    expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(viewport.width + 1)
    expect(panelBox.y).toBeGreaterThanOrEqual(0)
    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height + 1)

    const overflow = await panel.evaluate((element) => ({
      documentWidth: document.documentElement.scrollWidth,
      panelClientWidth: element.clientWidth,
      panelScrollWidth: element.scrollWidth,
      viewportWidth: window.innerWidth,
    }))
    expect(overflow.panelScrollWidth).toBeLessThanOrEqual(overflow.panelClientWidth + 1)
    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1)

    await participantControl.tap()
    await expect(panel).toContainText(EXPLANATION_CONTROLS[7].meaning)
    await expect(auditControl).toHaveAttribute('aria-expanded', 'false')
    await expect(participantControl).toHaveAttribute('aria-expanded', 'true')
    await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(1)

    await participantControl.tap()
    await expect(panel).toBeHidden()
    await expect(exactCopy.locator('button[aria-expanded="true"]')).toHaveCount(0)
  } finally {
    await mobile.close()
  }
})

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('the source-only example answers each research question without the held legacy record', async ({
  page,
}) => {
  await page.goto('/life-test')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Does magnesium bisglycinate help with sleep?',
  )
  await expect(page.locator('.lt-result')).toContainText('1.6 points more')
  await expect(page.locator('.lt-root')).toContainText('2026 review')
  await expect(page.locator('.lt-root')).not.toContainText('Held for an identity check')
  await expect(page.getByRole('heading', { name: 'What happened in people?' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'The path through the body' })).toBeVisible()
  await expect(page.locator('.lt-body-path')).toContainText('Not measured in this trial')
  const contents = page.getByRole('navigation', { name: 'On this evidence page' })
  const pathLink = contents.getByRole('link', { name: 'Path through the body' })
  await pathLink.click()
  await expect(page).toHaveURL(/#lt-path$/)
  await expect(page.locator('#lt-path')).toBeFocused()
  await expect(pathLink).toHaveAttribute('aria-current', 'location')

  for (const label of [
    'What the study words mean in this trial',
    'Why someone might not notice the same change',
    'What the study measured—and what a watch cannot confirm',
    'How the study product compares with a shop bottle',
    'Who the result may not apply to, and what is still open',
  ]) {
    const summary = page.getByText(label, { exact: true })
    await summary.click()
    await expect(summary.locator('xpath=..')).toHaveAttribute('open', '')
  }

  const externalSources = page.locator('.lt-root a[href^="https://"]')
  expect(await externalSources.count()).toBeGreaterThan(10)
  const axe = await new AxeBuilder({ page })
    .include('.lt-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(axe.violations.map((violation) => violation.id)).toEqual([])
})

test('the example reflows at phone, tablet, desktop and enlarged text', async ({ browser }) => {
  for (const width of [320, 375, 768, 1280]) {
    const context = await browser.newContext({ viewport: { width, height: 800 } })
    try {
      const page = await context.newPage()
      await page.goto('/life-test')
      if (width <= 768) {
        const disclosure = page.locator('.lt-contents-mobile')
        const menuBeforeClaim = await page.evaluate(() => {
          const menu = document.querySelector('.lt-contents-mobile')
          const claim = document.querySelector('.lt-header')
          return Boolean(
            menu && claim && menu.compareDocumentPosition(claim) & Node.DOCUMENT_POSITION_FOLLOWING,
          )
        })
        expect(menuBeforeClaim).toBe(true)
        const initialMenu = await disclosure.boundingBox()
        const initialClaim = await page.locator('.lt-header').boundingBox()
        expect(initialMenu?.y ?? Infinity).toBeLessThan(initialClaim?.y ?? -1)
        await disclosure.locator('summary').click()
        await expect(disclosure).toHaveAttribute('open', '')
        await disclosure.getByRole('link', { name: 'Results in people' }).click()
        await expect(disclosure).not.toHaveAttribute('open', '')
        await expect(page.locator('#lt-result')).toBeFocused()
        await expect(disclosure.locator('a[href="#lt-result"]')).toHaveAttribute(
          'aria-current',
          'location',
        )
        if (width === 375) {
          await page.locator('#lt-path').scrollIntoViewIfNeeded()
          const stickyTop = await disclosure.evaluate(
            (element) => element.getBoundingClientRect().top,
          )
          expect(stickyTop).toBeGreaterThanOrEqual(50)
          expect(stickyTop).toBeLessThan(75)
          await disclosure.locator('summary').click()
          await expect(disclosure).toHaveAttribute('open', '')
          const openTop = await disclosure.evaluate(
            (element) => element.getBoundingClientRect().top,
          )
          expect(openTop).toBeGreaterThanOrEqual(50)
          expect(openTop).toBeLessThan(75)
          await disclosure.getByRole('link', { name: 'What remains unknown' }).click()
          await expect(disclosure).not.toHaveAttribute('open', '')
          await expect(page.locator('#lt-unknown')).toBeFocused()
        }
      }
      if (width === 320 || width === 768) {
        await page.addStyleTag({ content: 'html { font-size: 200%; }' })
      }
      if (width === 320) {
        const disclosure = page.locator('.lt-contents-mobile')
        await disclosure.locator('summary').click()
        await disclosure.getByRole('link', { name: 'Path through the body' }).click()
        await expect(disclosure).not.toHaveAttribute('open', '')
        await expect(disclosure.locator('a[href="#lt-path"]')).toHaveAttribute(
          'aria-current',
          'location',
        )
        const geometry = await page.evaluate(() => ({
          heading: document.getElementById('lt-path')?.getBoundingClientRect().top ?? -1,
          contents:
            document.querySelector('.lt-contents-mobile')?.getBoundingClientRect().bottom ?? 0,
        }))
        expect(geometry.heading).toBeGreaterThanOrEqual(geometry.contents)
      }
      const sizes = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }))
      expect(sizes.scroll, `overflow at ${width}px`).toBeLessThanOrEqual(sizes.client)
      await expect(
        page.getByRole('heading', { level: 2, name: 'What remains unknown?' }),
      ).toBeVisible()
    } finally {
      await context.close()
    }
  }
})

test('mobile contents links reveal their destination without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  })
  try {
    const page = await context.newPage()
    await page.goto('/life-test')
    const disclosure = page.locator('.lt-contents-mobile')
    await disclosure.locator('summary').click()
    await disclosure.getByRole('link', { name: 'Path through the body' }).click()
    await expect(page).toHaveURL(/#lt-path$/)
    const geometry = await page.evaluate(() => ({
      heading: document.getElementById('lt-path')?.getBoundingClientRect().top ?? -1,
      contents: document.querySelector('.lt-contents-mobile')?.getBoundingClientRect().bottom ?? 0,
    }))
    expect(geometry.heading).toBeGreaterThanOrEqual(geometry.contents)
  } finally {
    await context.close()
  }
})

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

test('the rendered medicine page has unique anchor IDs', async ({ page }) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  await page.goto(`/d/${fixture.slug}`)
  const duplicates = await page.evaluate(() => {
    const ids = [...document.querySelectorAll<HTMLElement>('[id]')].map((element) => element.id)
    return ids.filter((id, index) => ids.indexOf(id) !== index)
  })
  expect(duplicates).toEqual([])
})

test('contents links navigate and move keyboard focus to the destination heading', async ({
  page,
}) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  await page.goto(`/d/${fixture.slug}`)
  const nav = page.getByRole('navigation', { name: 'On this medicine page' })
  const safety = nav.getByRole('link', { name: 'Safety', exact: true })
  await safety.focus()
  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(/#safety$/)
  await expect(page.locator('#safety h2')).toBeFocused()
  await expect(safety).toHaveAttribute('aria-current', 'location')

  const source = nav.getByRole('link', { name: 'Sources and record' })
  await source.click()
  await expect(page).toHaveURL(/#sources$/)
  await expect(page.locator('#sources > h2')).toBeFocused()
  await expect(source).toHaveAttribute('aria-current', 'location')
})

test('narrow view keeps the links reachable and the destination visible', async ({ browser }) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  const context = await browser.newContext({
    viewport: { width: 320, height: 720 },
    hasTouch: true,
    isMobile: true,
  })
  try {
    const page = await context.newPage()
    await page.goto(`/d/${fixture.slug}`)
    const disclosure = page.locator('.dv4-mobile-contents')
    await disclosure.locator('summary').tap()
    await expect(disclosure).toHaveAttribute('open', '')
    const nav = page.getByRole('navigation', { name: 'On this medicine page' })
    const safety = nav.getByRole('link', { name: 'Safety', exact: true })
    await safety.tap()
    await expect(page.locator('#safety h2')).toBeFocused()
    await expect(disclosure).not.toHaveAttribute('open', '')
    const sizes = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client)
    await expect
      .poll(async () => (await page.locator('#safety h2').boundingBox())?.y ?? 999)
      .toBeLessThan(200)
    const heading = await page.locator('#safety h2').boundingBox()
    expect(heading?.y ?? -1).toBeGreaterThanOrEqual(0)
  } finally {
    await context.close()
  }
})

test('mobile contents dismisses with Escape or a tap outside the menu', async ({ browser }) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  const context = await browser.newContext({
    viewport: { width: 375, height: 720 },
    hasTouch: true,
    isMobile: true,
  })
  try {
    const page = await context.newPage()
    await page.goto(`/d/${fixture.slug}`)
    const disclosure = page.locator('.dv4-mobile-contents')
    const summary = disclosure.locator('summary')

    await summary.tap()
    await expect(disclosure).toHaveAttribute('open', '')
    await page.keyboard.press('Escape')
    await expect(disclosure).not.toHaveAttribute('open', '')
    await expect(summary).toBeFocused()

    await summary.tap()
    await expect(disclosure).toHaveAttribute('open', '')
    await page.mouse.click(10, 700)
    await expect(disclosure).not.toHaveAttribute('open', '')
  } finally {
    await context.close()
  }
})

test('mobile contents starts before the medicine name and stays usable while scrolling', async ({
  browser,
}, testInfo) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  const context = await browser.newContext({
    viewport: { width: 375, height: 720 },
    hasTouch: true,
    isMobile: true,
  })
  try {
    const page = await context.newPage()
    await page.goto(`/d/${fixture.slug}`)
    const disclosure = page.locator('.dv4-mobile-contents')
    const medicineName = page.locator('.dv4-strip h1')
    expect(
      await page.evaluate(() =>
        Boolean(
          document
            .querySelector('.dv4-mobile-contents')!
            .compareDocumentPosition(document.querySelector('.dv4-strip h1')!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
    ).toBe(true)
    expect((await disclosure.boundingBox())!.y).toBeLessThan((await medicineName.boundingBox())!.y)
    await page.screenshot({ path: testInfo.outputPath('mobile-contents-top.png') })

    await page.evaluate(() => window.scrollTo(0, 700))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300)
    await expect
      .poll(async () => (await disclosure.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(54)
    await expect.poll(async () => (await disclosure.boundingBox())?.y ?? 999).toBeLessThan(76)

    await disclosure.locator('summary').tap()
    await expect(disclosure).toHaveAttribute('open', '')
    expect((await disclosure.boundingBox())!.y).toBeGreaterThanOrEqual(54)
    await page.screenshot({ path: testInfo.outputPath('mobile-contents-scrolled-open.png') })
    await disclosure.getByRole('link', { name: 'Sources and record' }).tap()
    await expect(disclosure).not.toHaveAttribute('open', '')
    await expect(page).toHaveURL(/#sources$/)
    await expect(page.locator('#sources > h2')).toBeFocused()
    expect((await page.locator('#sources > h2').boundingBox())!.y).toBeGreaterThanOrEqual(54)
  } finally {
    await context.close()
  }
})

test('mobile contents remains a native in-flow dropdown without JavaScript', async ({
  browser,
}) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  const context = await browser.newContext({
    viewport: { width: 375, height: 720 },
    javaScriptEnabled: false,
  })
  try {
    const page = await context.newPage()
    await page.goto(`/d/${fixture.slug}`)
    const disclosure = page.locator('.dv4-mobile-contents')
    await expect(disclosure).toHaveCSS('position', 'static')
    await disclosure.locator('summary').click()
    await disclosure.getByRole('link', { name: 'Safety', exact: true }).click()
    await expect(page).toHaveURL(/#safety$/)
    const safety = await page.locator('#safety h2').boundingBox()
    expect(safety?.y ?? -1).toBeGreaterThanOrEqual(0)
  } finally {
    await context.close()
  }
})

test('tablet contents remains above the name and reflows at enlarged text', async ({ browser }) => {
  if (!fixture) throw new Error('The dossier fixture did not install.')
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 } })
  try {
    const page = await context.newPage()
    await page.goto(`/d/${fixture.slug}`)
    const disclosure = page.locator('.dv4-mobile-contents')
    await expect(disclosure).toBeVisible()
    expect((await disclosure.boundingBox())!.y).toBeLessThan(
      (await page.locator('.dv4-strip h1').boundingBox())!.y,
    )
    await page.addStyleTag({ content: 'html { font-size: 200%; }' })
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(widths.scroll).toBeLessThanOrEqual(widths.client)
    await disclosure.locator('summary').click()
    await expect(disclosure.getByRole('link', { name: 'Safety', exact: true })).toBeVisible()
  } finally {
    await context.close()
  }
})

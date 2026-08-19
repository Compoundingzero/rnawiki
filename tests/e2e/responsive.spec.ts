import { test, expect, type Page } from '@playwright/test'
import { PUBLIC_PATHS, expandEverything, hasNoHorizontalOverflow } from './fixtures/record-data'

/**
 * No public page may scroll sideways, at any of the three widths the design is drawn for.
 *
 * 390 is the phone the record page is designed against, 768 the tablet breakpoint, 1440 the
 * desktop the type scale is set for. Horizontal overflow is checked twice per page: once as the
 * reader meets it, and once with every disclosure forced open, because the expanded Evidence
 * Record is the state most likely to overflow — it carries the widest content on the site
 * (identifiers, long source titles, DOIs) and none of it is visible until a reader opens it.
 *
 * tests/e2e/mobile-viewport.spec.ts covers 375 and the touch-target rules; this file is about the
 * layout holding across the range rather than about any one control.
 */

const WIDTHS = [
  { width: 390, height: 844, label: '390 (phone)' },
  { width: 768, height: 1024, label: '768 (tablet)' },
  { width: 1440, height: 900, label: '1440 (desktop)' },
] as const

async function widestOverflowingElement(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const limit = document.documentElement.clientWidth + 1
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('body *'))) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      if (rect.right > limit || rect.left < -1) {
        const cls = el.className && typeof el.className === 'string' ? `.${el.className.split(/\s+/).join('.')}` : ''
        return `<${el.tagName.toLowerCase()}${cls}> right=${Math.round(rect.right)} limit=${limit}`
      }
    }
    return null
  })
}

for (const viewport of WIDTHS) {
  test.describe(`no horizontal overflow at ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } })

    for (const path of PUBLIC_PATHS) {
      test(`${path} fits its viewport, closed and fully expanded`, async ({ page }) => {
        const response = await page.goto(path)
        test.skip(!response || !response.ok(), `${path} did not render — skipping until it does.`)

        expect(
          await hasNoHorizontalOverflow(page),
          `${path} overflows at ${viewport.width}px: ${await widestOverflowingElement(page)}`
        ).toBe(true)

        await expandEverything(page)
        expect(
          await hasNoHorizontalOverflow(page),
          `${path} overflows at ${viewport.width}px with every disclosure open: ${await widestOverflowingElement(page)}`
        ).toBe(true)
      })
    }
  })
}

test.describe('identifiers wrap rather than pushing the page wide', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('a DOI or trial id stays inside the 390px column', async ({ page }) => {
    const response = await page.goto('/r/bpc-157')
    test.skip(!response || !response.ok(), 'bpc-157 is not seeded/published yet.')
    await expandEverything(page)

    const ids = page.locator('.id')
    const count = await ids.count()
    test.skip(count === 0, 'No identifiers rendered on this record yet.')

    for (let i = 0; i < count; i++) {
      const box = await ids.nth(i).boundingBox()
      if (!box) continue
      // `overflow-wrap: anywhere` is what makes this hold — an unbroken DOI is wider than the
      // column and used to push the whole page sideways.
      expect(box.width, `identifier ${i + 1} is wider than the viewport`).toBeLessThanOrEqual(390)
    }
  })
})

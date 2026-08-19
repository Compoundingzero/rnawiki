import { test, expect } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'

/**
 * Statements the site makes ABOUT ITSELF, and the ones it makes about a regulator's documents.
 *
 * Each assertion here pins a sentence that was false when it shipped. The pattern in every case is
 * the same and is the failure mode this product exists to prevent: an explainer page describing
 * behaviour the code does not have, or a link label promising a provenance the URL does not carry.
 */

test.describe('/evidence and /methodology describe what the code actually does', () => {
  /**
   * /evidence said scientific review was "Pending, unless a claim names its reviewer and their
   * credentials". No code path can print either: EvidenceRecordMeta has three branches and none
   * emits identity, and the v1 API routes refuse the fields outright. /methodology says so in as
   * many words on the same site, and the identical phrase had already been removed from
   * /methodology as a defect — this page was the copy the cleanup missed.
   */
  test('/evidence does not promise a reviewer name or credential the product refuses to print', async ({ page }) => {
    await page.goto('/evidence')
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')

    expect(body).not.toContain('names its reviewer and their credentials')
    expect(body).not.toMatch(/Scientific\s*—?\s*Pending/i)
    expect(body).toContain('No independent scientific reviewer has approved any answer on this site')
  })

  test('/methodology still states the no-reviewer-name rule the rest of the site follows', async ({ page }) => {
    await page.goto('/methodology')
    const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
    expect(body).toContain('No reviewer name or credential is printed on a public page at all')
  })

  /**
   * Both explainer pages said every claim is placed at one of five points. `stagePositionApplies`
   * deliberately prints no position for a mechanism, regulatory or access claim — 5 of the 13
   * published claims — so a reader who followed "how it works" and opened Casgevy found three of
   * five answers missing the thing they had just been told every claim carries.
   */
  test('neither explainer page claims every claim carries an evidence position', async ({ page }) => {
    for (const path of ['/evidence', '/methodology']) {
      await page.goto(path)
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ')
      expect(body, `${path} still overstates the ladder's coverage`).not.toMatch(
        /Every claim (page marks|is placed at) one of five points/
      )
      expect(body, `${path} does not name the exception`).toMatch(
        /outcome question/
      )
    }
  })
})

test.describe('regulatory links do not promise a provenance they do not have', () => {
  /**
   * "Read the regulator's own record" was printed under every jurisdiction block whatever the URL
   * was, so Casgevy's MHRA and EU rows handed the reader Vertex's own press releases under a
   * sentence promising the regulator — on the record whose positioning claim is that nobody who
   * profits from a treatment defines what "works" means for it.
   */
  test('the regulator wording appears only on a regulator-hosted URL', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.casgevy}`)
    test.skip(!response || !response.ok(), `Entity "${SEEDED_SLUGS.casgevy}" is not seeded/published yet.`)

    const links = page.locator('a', { hasText: /Read the (regulator|source)/ })
    const count = await links.count()
    expect(count).toBeGreaterThan(0)

    const regulatorHosts = /(^|\.)(fda\.gov|nlm\.nih\.gov|nih\.gov|ema\.europa\.eu|europa\.eu|gov\.uk|hsa\.gov\.sg)$/

    for (let i = 0; i < count; i++) {
      const link = links.nth(i)
      const href = (await link.getAttribute('href')) ?? ''
      const text = ((await link.textContent()) ?? '').trim()
      const host = new URL(href).hostname.toLowerCase()
      const isRegulator = regulatorHosts.test(host)

      if (text.includes('regulator')) {
        expect(isRegulator, `"${text}" points at ${host}, which is not a regulator`).toBe(true)
      } else {
        expect(isRegulator, `${host} is a regulator but is not labelled as one`).toBe(false)
      }
    }
  })
})

test.describe('the corrections form cannot silently discard a report', () => {
  /**
   * The <form> has no action and no method because handleSubmit posts with fetch. Without
   * JavaScript the browser fell back to its default — a GET to the current URL — so a reader
   * watched the page reload, the textarea empty itself, no acknowledgement and no error appear,
   * and everything they had written land in the address bar as ?message=..., in their history, and
   * in every access log on the way. The report was never sent.
   */
  test.describe('with JavaScript disabled', () => {
    test.use({ javaScriptEnabled: false })

    test('the submit button is disabled and says why, so nothing is lost', async ({ page }) => {
      await page.goto('/corrections')
      const submit = page.getByRole('button', { name: 'Send report' })
      await expect(submit).toBeDisabled()
      await expect(page.locator('body')).toContainText('needs JavaScript')
    })
  })

  test('with JavaScript, the button is enabled once the form has hydrated', async ({ page }) => {
    await page.goto('/corrections')
    await expect(page.getByRole('button', { name: 'Send report' })).toBeEnabled()
  })
})

test.describe('sitemap', () => {
  /**
   * The sitemap listed /search — the one page that serves `<meta name="robots" content="noindex">`
   * — and omitted /compounds (the browse index, i.e. the crawl path to every record), /evidence and
   * /licensing, all of which are indexable and linked from the chrome of every page.
   */
  test('lists the indexable reader pages and not the noindex one', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text()
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname)

    for (const path of ['/', '/compounds', '/evidence', '/methodology', '/licensing']) {
      expect(locs, `sitemap omits ${path}`).toContain(path)
    }
    expect(locs, 'sitemap advertises the noindex /search page').not.toContain('/search')
  })

  /** `new Date()` per request re-stamped every static entry on every fetch, so lastmod said nothing. */
  test('reports a stable lastmod rather than the moment of the request', async ({ request }) => {
    const first = await (await request.get('/sitemap.xml')).text()
    const second = await (await request.get('/sitemap.xml')).text()
    expect(first).toBe(second)
  })
})

test.describe('the evidence record control reads as one wording without CSS', () => {
  /**
   * Both state labels are always in the DOM and CSS hides the inapplicable one, which is what keeps
   * the control honest with JavaScript off and gives a screen reader exactly one accessible name.
   * With the stylesheet missing, though, the summary read "Open evidence recordClose evidence
   * record" — a control saying both things at once. The closed-state label now carries `hidden`,
   * which the author rule `.er__label { display: inline }` outranks whenever CSS loads.
   */
  test('the closed-state label carries the hidden attribute as its no-CSS fallback', async ({ page }) => {
    const response = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!response || !response.ok(), `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    const closeLabels = page.locator('.er__label--close')
    expect(await closeLabels.count()).toBeGreaterThan(0)
    for (let i = 0; i < (await closeLabels.count()); i++) {
      await expect(closeLabels.nth(i)).toHaveAttribute('hidden', '')
    }

    // With the stylesheet in place the existing [open] rules still control it — the `hidden`
    // attribute must NOT win — so a closed record shows exactly one label and an open one shows
    // the other. This is the assertion that would fail if the attribute were added without the
    // author rule that outranks it.
    const summary = page.locator('.er__summary').first()
    await expect(summary.locator('.er__label--open')).toBeVisible()
    await expect(summary.locator('.er__label--close')).toBeHidden()
    await summary.click()
    await expect(summary.locator('.er__label--open')).toBeHidden()
    await expect(summary.locator('.er__label--close')).toBeVisible()
  })
})

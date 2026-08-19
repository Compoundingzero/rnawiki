import { test, expect, type Page } from '@playwright/test'
import { SEEDED_SLUGS } from './fixtures/seeded-entities'
import {
  ALL_SEEDED_SLUGS,
  expandEverything,
  fetchEntity,
  findClaim,
  hasFailureSection,
} from './fixtures/record-data'

/**
 * The Evidence Record disclosure.
 *
 * Four properties are load-bearing and each one has a defect behind it:
 *
 * 1. NO RECORD IS OPEN ON FIRST LOAD. Opening the first record by default made the page arrive as
 *    four stacked essays and put the internal evidence schema, not the answer, first. The
 *    `defaultOpen` prop that allowed it has been deleted from every caller; this spec is what
 *    stops it coming back through markup.
 * 2. THE CONTENT EXISTS WHILE CLOSED. The predecessor was a client-rendered drawer that mounted
 *    its contents on click, which made every DOI and PMID on the site invisible without
 *    JavaScript and uncrawlable — on a site whose whole argument is "here is the source". A
 *    native <details> hides content from the reading path without removing it from the document.
 * 3. IT WORKS BY KEYBOARD, AND THE CONTROL SAYS WHICH WAY IT GOES. Both labels are in the DOM and
 *    CSS hides the inapplicable one, so a screen reader reads exactly one and the wording stays
 *    honest in both states with no JavaScript at all.
 * 4. THE FAILURE SECTION IS ABSENT, NOT EMPTY, WHEN NOTHING FAILED. "None recorded" under
 *    "what did not work" reads as a positive finding about a question nobody asked.
 */

const OPEN_LABEL = 'Open evidence record'
const CLOSE_LABEL = 'Close evidence record'
const FAILURE_HEADING = 'What did not work or conflicts with this answer'

async function gotoRecord(page: Page, slug: string): Promise<boolean> {
  const response = await page.goto(`/r/${slug}`)
  return Boolean(response && response.ok())
}

test.describe('evidence record — default state', () => {
  for (const slug of ALL_SEEDED_SLUGS) {
    test(`no evidence record on /r/${slug} carries an open attribute on first load`, async ({ page }) => {
      const ok = await gotoRecord(page, slug)
      test.skip(!ok, `Entity "${slug}" is not seeded/published yet — skipping until seed data lands.`)

      const records = page.locator('details.er')
      const count = await records.count()
      expect(count, 'no evidence record rendered on this page').toBeGreaterThan(0)

      // Checked as an attribute, not as visibility: `open` is what a server-rendered default
      // would look like, and it is exactly what must never be emitted.
      expect(await page.locator('details.er[open]').count(), 'an evidence record is open by default').toBe(0)

      // And the body genuinely is not in the reading path.
      await expect(records.first().locator('.er__body')).not.toBeVisible()
    })
  }

  test('the closed control reads "Open evidence record" and nothing else', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    const summary = page.locator('.er__summary').first()
    const visibleText = await summary.innerText()
    // innerText excludes the `display: none` label, which is how the accessible name stays
    // singular. Both labels being visible at once is the failure this catches.
    expect(visibleText).toContain(OPEN_LABEL)
    expect(visibleText).not.toContain(CLOSE_LABEL)
  })

  test('every evidence record summary meets the 44px touch target', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    const summaries = page.locator('.er__summary')
    const count = await summaries.count()
    for (let i = 0; i < count; i++) {
      const box = await summaries.nth(i).boundingBox()
      expect(box, `summary ${i + 1} has no box`).not.toBeNull()
      expect(box!.height, `summary ${i + 1} is under the 44px minimum`).toBeGreaterThanOrEqual(44)
    }
  })
})

test.describe('evidence record — keyboard operation', () => {
  test('opens and closes by keyboard alone, and the visible control text changes with it', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    const summary = page.locator('.er__summary').first()
    const details = page.locator('details.er').first()

    // Reached by tabbing, not by a programmatic focus() — a control that only responds to a
    // synthetic focus is not keyboard-operable.
    await page.locator('body').press('Tab')
    let reached = false
    for (let i = 0; i < 40; i++) {
      if (await summary.evaluate((el) => el === document.activeElement)) {
        reached = true
        break
      }
      await page.keyboard.press('Tab')
    }
    expect(reached, 'the evidence record summary was not reachable by Tab').toBe(true)

    await page.keyboard.press('Enter')
    await expect(details).toHaveAttribute('open', '')
    await expect(details.locator('.er__body')).toBeVisible()
    const openText = await summary.innerText()
    expect(openText).toContain(CLOSE_LABEL)
    expect(openText).not.toContain(OPEN_LABEL)

    await page.keyboard.press('Enter')
    await expect(details).not.toHaveAttribute('open', '')
    const closedText = await summary.innerText()
    expect(closedText).toContain(OPEN_LABEL)
    expect(closedText).not.toContain(CLOSE_LABEL)
  })

  test('the nested study-details disclosure is level 2, and opens by keyboard once the record is open', async ({
    page,
  }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    // Sources moved one level deeper in the Evidence Record refinement: they are now inside the
    // record rather than beside the claim. Maximum disclosure depth is two, and this is level 2.
    const record = page.locator('details.er').first()
    await record.locator('.er__summary').click()

    const sources = record.locator('summary', { hasText: /study details and sources/i }).first()
    test.skip((await sources.count()) === 0, 'No source disclosure rendered on this claim.')

    await sources.focus()
    await expect(sources).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(sources.locator('xpath=..')).toHaveAttribute('open', '')

    // Nothing may open a third level inside it.
    const thirdLevel = record.locator('.disclosure__body details details')
    expect(await thirdLevel.count(), 'a third disclosure level appeared inside the record').toBe(0)
  })
})

test.describe('evidence record — server-rendered with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false })

  for (const slug of ALL_SEEDED_SLUGS) {
    test(`/r/${slug} ships its identifiers in the HTML while every record is closed`, async ({ page }) => {
      const ok = await gotoRecord(page, slug)
      test.skip(!ok, `Entity "${slug}" is not seeded/published yet.`)

      // Still closed: nothing on this page opened anything, and no script ran that could.
      expect(await page.locator('details.er[open]').count()).toBe(0)

      const html = await page.content()
      const identifierLinks = [
        'https://doi.org/',
        'https://pubmed.ncbi.nlm.nih.gov/',
        'https://clinicaltrials.gov/',
      ]
      expect(
        identifierLinks.some((prefix) => html.includes(prefix)),
        'no DOI, PMID or trial link in the no-JS HTML while the records were closed'
      ).toBe(true)

      // The answer, the evidence sentence and the record's own sections are all in the document
      // too — the disclosure hides them from the reading path, it does not withhold them.
      expect(html).toContain('Evidence record')
      expect(html).toContain('What was directly observed')
      expect(html).toContain(OPEN_LABEL)
      expect(html).toContain(CLOSE_LABEL)
    })
  }

  test('a record page still answers its questions with no JavaScript at all', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    const text = (await page.locator('main').innerText()).toLowerCase()
    expect(text).toContain('no controlled human trial')
    expect(text).toContain(OPEN_LABEL.toLowerCase())
  })
})

test.describe('what did not work — present only when something did', () => {
  test('a claim with recorded events renders them, with the plain gate sentence and its source', async ({
    page,
  }) => {
    const found = await findClaim(page, (claim) => claim.claimEvents.length > 0)
    test.skip(found === null, 'No seeded claim carries a published claim event yet.')

    await page.goto(`/r/${found!.slug}`)
    const article = page.locator(`#claim-${found!.claimSlug}`)
    await article.locator('.er__summary').click()

    await expect(article.getByRole('heading', { name: FAILURE_HEADING })).toBeVisible()

    const event = found!.claim.claimEvents[0]!
    const text = await article.innerText()
    // The five labelled rows of the contract, in the record's own words.
    expect(text).toContain('What happened')
    expect(text).toContain('Where the development chain broke')
    expect(text).toContain('What it suggests')
    expect(text).toContain('What it does not establish')
    expect(text).toContain('Source')

    // The editor's summary, and the public sentence for the event type — never the stored enum.
    expect(text).toContain(event.plainSummary)
    expect(text).toContain(event.eventTypePublic)
    expect(text).toContain(event.developmentGatePublic)
    expect(text).not.toContain(event.eventType)
    expect(text).not.toContain(event.developmentGate)
  })

  test('a claim with nothing failed and nothing conflicting shows no such section at all', async ({ page }) => {
    const found = await findClaim(page, (claim) => !hasFailureSection(claim))
    test.skip(found === null, 'Every seeded claim currently has recorded events or conflicting evidence.')

    await page.goto(`/r/${found!.slug}`)
    const article = page.locator(`#claim-${found!.claimSlug}`)
    await article.locator('.er__summary').click()

    // Absent, not empty. No heading, and no "none recorded" stand-in under it.
    await expect(article.getByRole('heading', { name: FAILURE_HEADING })).toHaveCount(0)
    const text = await article.innerText()
    expect(text).not.toContain(FAILURE_HEADING)
    expect(text).not.toMatch(/none recorded|no failures|not applicable|N\/A/i)
    // The sections that are unconditional are still there, so this is a dropped section rather
    // than a page that failed to render.
    expect(text).toContain('What was directly observed')
    expect(text).toContain('What is still unknown')
  })
})

test.describe('how this answer changed', () => {
  test('public change history renders inside the record of the claim it belongs to', async ({ page }) => {
    const found = await findClaim(page, (claim) => claim.evidenceChanges.length > 0)
    test.skip(
      found === null,
      'No seeded claim has a public evidence_changes row yet — nothing may be invented to make this section appear.'
    )

    await page.goto(`/r/${found!.slug}`)
    const article = page.locator(`#claim-${found!.claimSlug}`)
    await article.locator('.er__summary').click()

    await expect(article.getByRole('heading', { name: 'How this answer changed' })).toBeVisible()
    const text = await article.innerText()
    expect(text).toContain(found!.claim.evidenceChanges[0]!.explanation)
    // The stored change type is never printed.
    expect(text).not.toContain(found!.claim.evidenceChanges[0]!.changeType)
  })

  test('the record-level history link appears only where there is history to read', async ({ page }) => {
    for (const slug of ALL_SEEDED_SLUGS) {
      const entity = await fetchEntity(page, slug)
      if (entity === null) continue
      const hasHistory = entity.claims.some((claim) => claim.evidenceChanges.length > 0)

      const ok = await gotoRecord(page, slug)
      if (!ok) continue
      const link = page.getByRole('link', { name: /view record history/i })
      // Offering the link with no history behind it promises an audit trail the page cannot show;
      // withholding it where history exists hides the audit trail the record is built on.
      expect(await link.count(), `"View record history" on /r/${slug}`).toBe(hasHistory ? 1 : 0)
    }
  })
})

test.describe('claim anchors', () => {
  test('a #claim- anchor scrolls to that claim, highlights it, and opens no other record', async ({ page }) => {
    const entityResponse = await page.goto(`/r/${SEEDED_SLUGS.bpc157}`)
    test.skip(!entityResponse || !entityResponse.ok(), `Entity "${SEEDED_SLUGS.bpc157}" is not seeded yet.`)

    const claims = page.locator('article.claim')
    const total = await claims.count()
    test.skip(total < 2, 'Needs at least two claims to prove only one record opened.')

    // Pick the last claim, so "scrolled to it" is a real assertion rather than the top of the page.
    const targetId = await claims.last().getAttribute('id')
    expect(targetId).toBeTruthy()

    const control = await claims.last().evaluate((el) => {
      const style = getComputedStyle(el)
      return `${style.backgroundColor}|${style.borderLeftColor}|${style.borderLeftWidth}|${style.outlineStyle}|${style.boxShadow}`
    })

    await page.goto(`/r/${SEEDED_SLUGS.bpc157}#${targetId}`)
    const target = page.locator(`#${targetId}`)
    await expect(target).toBeVisible()

    // Scrolled into view by the fragment alone — no JavaScript is involved in this.
    const inViewport = await target.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      return rect.top < window.innerHeight && rect.bottom > 0
    })
    expect(inViewport, 'the anchored claim was not scrolled into view').toBe(true)

    // Visibly highlighted: the same element, styled differently only because it is :target.
    const highlighted = await target.evaluate((el) => {
      const style = getComputedStyle(el)
      return `${style.backgroundColor}|${style.borderLeftColor}|${style.borderLeftWidth}|${style.outlineStyle}|${style.boxShadow}`
    })
    expect(highlighted, 'the anchored claim is not visibly distinguished from an unanchored one').not.toBe(
      control
    )

    // Its record is readable — a fragment never reaches the server, so this is CSS, not markup.
    await expect(target.locator('.er__body')).toBeVisible()

    // And exactly one record opened. An anchor that expands the whole page defeats the point of
    // linking to one question.
    const visibleBodies = await page.locator('.er__body:visible').count()
    expect(visibleBodies, 'the anchor opened more than the claim it pointed at').toBe(1)
  })

  test('every claim anchor advertised by the API resolves to a rendered claim', async ({ page }) => {
    // Claim anchors are permanent citable URLs (lib/citation.ts builds them). A renamed claim slug
    // silently breaks every citation ever copied, so the API and the page must agree.
    for (const slug of ALL_SEEDED_SLUGS) {
      const response = await page.request.get(`/api/v1/entities/${slug}`)
      if (!response.ok()) continue
      const body = await response.json()
      await page.goto(`/r/${slug}`)
      for (const claim of body.claims as { canonicalUrl: string }[]) {
        const fragment = claim.canonicalUrl.split('#')[1]
        expect(fragment, `no anchor in ${claim.canonicalUrl}`).toBeTruthy()
        await expect(page.locator(`#${fragment}`)).toHaveCount(1)
      }
    }
  })
})

test.describe('record page shape', () => {
  test('the standalone sources section is gone and its content lives in the records', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    // "Sources and page information" was page furniture competing with the evidence for heading
    // weight, and the source count it carried answered a publisher's question, not a reader's.
    await expect(page.getByRole('heading', { name: /sources and page information/i })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: /^at a glance$/i })).toHaveCount(0)

    // The record still carries the three plain values, without a heading of their own.
    const meta = page.locator('.record-meta')
    await expect(meta).toBeVisible()
    const metaText = await meta.innerText()
    expect(metaText).toContain('Approval status')
    // "Record updated", not "Last checked". Two dates on this page were both labelled "Last
    // checked" — this row (the regulatory check date) and the evidence record's own line 700px
    // below it (claims.updatedAt) — and they differ. Each label now names the thing it is a date
    // of, so this assertion also pins that the strip's date is the record's own edit date.
    expect(metaText).toContain('Record updated')
    // And the ambiguous label is not back anywhere in the strip.
    expect(metaText).not.toContain('Last checked')

    await expect(page.getByRole('heading', { name: 'Questions', exact: true })).toBeVisible()
  })

  test('every record section named by the contract is present once a record is open', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    await expandEverything(page)
    const text = await page.locator('main').innerText()

    for (const heading of [
      'Evidence record',
      'What was directly observed',
      'What this does not prove',
      'What is still unknown',
      'What would change this answer',
      'How far the evidence goes',
      'Study details and sources',
      'More ways to use this record',
    ]) {
      expect(text, `record section "${heading}" is missing`).toContain(heading)
    }
  })

  /**
   * One reader question, one visible answer.
   *
   * The record page carries three genuinely different dates: when the record itself was last
   * edited, when this ANSWER was last checked, and when the REGULATORY STATUS was last checked.
   * Two of them were printed under the identical label "Last checked", 700px apart and a day
   * apart in the corpus, on a product whose whole proposition is that you can trust what it says
   * it checked. Every one of them must now name what it is a date of.
   */
  test('no date is labelled "last checked" without naming what was checked', async ({ page }) => {
    const ok = await gotoRecord(page, SEEDED_SLUGS.bpc157)
    test.skip(!ok, `Entity "${SEEDED_SLUGS.bpc157}" is not seeded/published yet.`)

    await expandEverything(page)
    const text = await page.locator('main').innerText()

    const qualified = [/this answer last checked/i, /regulatory status last checked/i]
    for (const match of text.matchAll(/[^.\n]{0,40}last checked/gi)) {
      const phrase = match[0].trim()
      expect(
        qualified.some((q) => q.test(phrase)),
        `"${phrase}" says a date was checked without saying what was checked`
      ).toBe(true)
    }
  })
})

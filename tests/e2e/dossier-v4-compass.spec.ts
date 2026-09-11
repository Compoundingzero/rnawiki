import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import {
  installDossierV4Fixture,
  removeDossierV4Fixture,
  type DossierV4Fixture,
} from './fixtures/dossier-v4'

/**
 * The Substance Compass, read by three people and checked by a machine.
 *
 * The café worker has no biology and will not open a disclosure, so everything they need has to be
 * in the default visible copy. The beginner biohacker arrives with a goal and has to be able to
 * tell a mechanism from a result and a test number from a life outcome. The expert wants the
 * structured claim, the trial role, the identity resolution and the correction history.
 *
 * The safety block is the one that must never go quiet: no dosing, no start or stop instruction, no
 * wording that turns an absence into reassurance, and no count presented as a rate.
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

/** Text a reader sees without opening anything: closed disclosures are excluded. */
async function visibleReaderText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return ''
    const parts: string[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      const element = node.parentElement
      if (!element) continue
      // Skip anything inside a closed disclosure, and anything visually hidden.
      const closed = element.closest('details:not([open])')
      if (closed && !element.closest('summary')) continue
      if (element.closest('.dv4-visually-hidden')) continue
      const value = node.textContent?.trim()
      if (value) parts.push(value)
    }
    return parts.join(' ')
  })
}

test('the compass document is served for the flagged slug', async ({ request }) => {
  const { slug } = requireFixture()
  const response = await request.get(`/d/${slug}`)
  expect(response.status()).toBe(200)
  expect(response.headers()['x-rnawiki-dossier']).toBe('v4')
})

/* ------------------------------------------------------------- café worker */

test('café-worker test: seven answers without opening anything', async ({ page }) => {
  const { slug, name } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = await visibleReaderText(page)

  // 1. What the substance is.
  expect(text).toContain(name)
  // 2. What it does, in words, before any registry metadata.
  expect(text).toContain('reaches the fixture tissue')
  // 3. Why people use it.
  expect(text).toContain('Taken in this fixture to test the compass')
  // 4. One goal-specific human result, or an honest unknown state.
  expect(text).toContain('Fixture strength rose over 12 weeks')
  // 5. The kind of result it is.
  expect(text).toContain('Measured performance')
  // 6. The limit that matters most.
  expect(text).toContain('showed no difference')
  // 7. Supervision.
  expect(text.toLowerCase()).toContain('prescription')
})

test('café-worker test: what it does comes before registry metadata', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const action = await page.locator('.dv4-hero-action').first().boundingBox()
  const technical = await page.locator('#technical-record').first().boundingBox()
  expect(action).not.toBeNull()
  expect(technical).not.toBeNull()
  expect(action?.y ?? 0).toBeLessThan(technical?.y ?? 0)
})

test('café-worker test: the opening statements stay short', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const action = (await page.locator('.dv4-hero-action').first().textContent()) ?? ''
  // One idea per sentence in the display line.
  expect(action.split(/[.!?]/).filter((part) => part.trim().length > 0)).toHaveLength(1)
})

/* -------------------------------------------------------- beginner biohacker */

test('beginner test: goals are separate rows and a mechanism is not a result', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  // A goal lens that is a set of rows, not one score.
  const goals = page.locator('#goal-fingerprint tbody tr')
  expect(await goals.count()).toBeGreaterThan(0)
  await expect(page.locator('#goal-fingerprint')).toContainText('There is no single score')

  // The body path and the human result are different sections, and the result comes first.
  const results = await page.locator('#human-results').boundingBox()
  const journey = await page.locator('#body-journey').boundingBox()
  expect(results?.y ?? 0).toBeLessThan(journey?.y ?? 0)
  await expect(page.locator('#body-journey')).toContainText('is not a result in a person')
})

test('beginner test: a test number and a life outcome are shown apart', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const measured = page.locator('[data-experience="measured"]')
  const meaningful = page.locator('[data-experience="meaningful"]')
  await expect(measured).toContainText('glycated hemoglobin')
  await expect(meaningful).toContainText('overall survival')
  // The two never appear in the same list.
  await expect(measured).not.toContainText('overall survival')
  await expect(meaningful).not.toContainText('glycated hemoglobin')
})

test('beginner test: who was studied, time to signal, and why it might do nothing', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('#applicability')).toContainText('Fixture adults aged 30 to 50')
  await expect(page.locator('#signal-timeline')).toContainText('365 days')
  await expect(page.locator('#no-response')).toContainText('no change at all')
  // The no-response map is educational and never suggests taking more.
  await expect(page.locator('#no-response')).toContainText('None of these is a reason to take more')
})

test('beginner test: formulation, an alternative, an unknown and a next question', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('#form-check')).toContainText('Stereoisomer of')
  await expect(page.locator('#form-check')).toContainText('Same target as')
  await expect(page.locator('#form-check')).toContainText('does not automatically apply')
  await expect(page.locator('#alternatives')).toContainText('Measure first')
  await expect(page.locator('#unknowns')).toBeVisible()
  const next = page.locator('#next-question a').first()
  await expect(next).toBeVisible()
  const target = await next.getAttribute('href')
  expect(target).toMatch(/^#/)
  await expect(page.locator(target ?? '#next-question')).toBeVisible()
})

/* -------------------------------------------------------------------- expert */

test('expert test: claim, trial role, identity and correction history are reachable', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  const receipt = page.locator('#evidence-receipts details').first()
  await receipt.locator('summary').click()
  await expect(receipt).toContainText('Fixture strength in fixture units')
  await expect(receipt).toContainText('Fixture source 2026')
  await expect(receipt).toContainText('Role in the trial')
  await expect(receipt).toContainText('Review state')

  // The correction ledger is on the page, not only in the database.
  await expect(page.locator('#form-check')).toContainText('a name lookup attached to the wrong')
})

test('expert test: a verified path step is told apart from an unmeasured one', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const verified = page.locator('#body-journey li[data-verified="true"]')
  const unverified = page.locator('#body-journey li[data-verified="false"]')
  expect(await verified.count()).toBeGreaterThan(0)
  expect(await unverified.count()).toBeGreaterThan(0)
  // The difference is stated in words, not only drawn as a dashed line.
  await expect(page.locator('#body-journey')).toContainText('Measured in people')
  await expect(page.locator('#body-journey')).toContainText('No measurement is named')
})

test('expert test: no predicted relationship is presented as a finding', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('#body-journey')).toContainText('nothing is hidden from this path')
  await expect(page.locator('#evidence-staircase')).toContainText('RNAWiki stores no prediction')
})

/* -------------------------------------------------------------------- safety */

test('safety: no dosing, no start or stop instruction, no reassurance from absence', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = (await page.locator('main').innerText()).toLowerCase()

  // No amount is ever named as something to take.
  expect(text).not.toMatch(/\btake \d+\s?(mg|g|mcg|ml|iu)\b/)
  expect(text).not.toMatch(/\brecommended dose\b/)
  expect(text).not.toMatch(/\boptimal dose\b/)
  expect(text).not.toMatch(/\bstart (?:with|at|taking) \d/)
  expect(text).not.toMatch(/\btitrat/)

  // Absence never becomes reassurance.
  expect(text).not.toContain('safe together')
  expect(text).not.toContain('no known risk')
  expect(text).not.toContain('completely safe')
  expect(text).not.toContain('no side effects')

  // Nothing says it suits a child.
  await expect(page.locator('.dv4-foot')).toContainText('appropriate for a child')
})

test('safety: a count from reports is never rendered as a rate', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const safety = page.locator('#safety')
  const text = (await safety.innerText()).toLowerCase()
  if (text.includes('reports sent to a regulator')) {
    await expect(safety).toContainText('A count is not a rate and not a risk.')
  }
  expect(text).not.toMatch(/\b\d+(?:\.\d+)?%\s+of (?:people|patients|users) (?:had|got|developed)/)
})

test('safety: a self-experiment plan is offered on a non-prescription record, with no amount', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const planner = page.locator('[data-block="self-experiment-plan"]')
  await expect(planner).toBeVisible()
  await expect(page.locator('#measurement')).toContainText(
    'RNAWiki does not work out an amount for anyone',
  )
  await expect(page.locator('#measurement')).toContainText('What not to measure')
  await expect(page.locator('#measurement')).toContainText('When to stop')
  const plannerText = await planner.innerText()
  expect(plannerText).not.toMatch(/\b\d+\s?(mg|g|mcg|ml|iu)\b/i)
})

test('safety: a prescription record gets clinician questions and no planner at all', async ({
  page,
}) => {
  // A second record, because whether the planner appears is decided by the register row and one
  // record must not claim to be both prescription and supplement.
  const supervised = await installDossierV4Fixture({ prescription: true })
  try {
    await page.goto(`/d/${supervised.slug}`)
    await expect(page.locator('[data-block="clinician-questions"]')).toBeVisible()
    expect(await page.locator('[data-block="self-experiment-plan"]').count()).toBe(0)
    const text = (await page.locator('#measurement').innerText()).toLowerCase()
    expect(text).not.toMatch(/\b\d+\s?(mg|g|mcg|ml|iu)\b/)
    expect(text).not.toMatch(/\bstop taking\b/)
    expect(text).not.toMatch(/\btitrat/)
    await expect(page.locator('#measurement')).toContainText('decided with a clinician')
  } finally {
    await removeDossierV4Fixture(supervised)
  }
})

test('safety: a mechanism, an animal result and a biomarker are each kept off the benefit line', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('#body-journey')).toContainText('It is not a result in a person')
  // The animal caveat sits on the path step that is an animal result, not on the staircase, which
  // only carries it when an animal record exists on the organism ladder.
  await expect(page.locator('#body-journey')).toContainText('does not say what happens in people')
  await expect(page.locator('#evidence-staircase')).toContainText(
    'Useful for ideas, not proof about people',
  )
  await expect(page.locator('#felt-measured-meaningful')).toContainText(
    'A number moving is not the same as a life going better',
  )
})

test('safety: the clash map never says a pair is fine', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const stack = page.locator('#stack')
  const text = (await stack.innerText()).toLowerCase()
  // "No interaction was found in <registers> as of <date>" is the required absence sentence and is
  // honest. What must never appear is a claim that the pair is fine.
  expect(text).not.toContain('safe together')
  expect(text).not.toMatch(/\b(?:is|are|was|were) safe\b/)
  expect(text).not.toContain('no risk')
  expect(text).not.toContain('no known interaction')
  // Wherever an absence is stated, the qualification has to be stated with it.
  if (text.includes('nothing found') || text.includes('no interaction')) {
    expect(text).toMatch(/not the same as (?:showing|proving)/)
  }
  await expect(stack).toContainText('never been studied together')
})

/* ------------------------------------------------------- absence and states */

test('a section that cannot be filled says so rather than disappearing', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  // Every section on the page carries a state, and every state has a word beside it.
  const sections = page.locator('section[data-state]')
  const count = await sections.count()
  expect(count).toBeGreaterThan(15)
  for (let index = 0; index < count; index += 1) {
    const state = await sections.nth(index).getAttribute('data-state')
    expect(state).toBeTruthy()
  }
  // The community lane renders before any report exists.
  await expect(page.locator('#community')).toContainText('The lane is built, and it is empty')
  await expect(page.locator('#community')).toContainText('does not copy reports from forums')
})

test('no internal key reaches the reader layer', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const reader = await page.evaluate(() => {
    const main = document.querySelector('main')
    if (!main) return ''
    const technical = ['technical-record', 'evidence-receipts']
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null)
    const parts: string[] = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const node = walker.currentNode
      if (technical.some((section) => section.contains(node))) continue
      const value = node.textContent?.trim()
      if (value) parts.push(value)
    }
    return parts.join(' ')
  })
  // The fixture plants `endpointMet` inside a curated note. It must reach the reader in words.
  expect(reader).not.toMatch(/\bendpointMet\b/)
  expect(reader).toContain('endpoint met')
  expect(reader).not.toMatch(/\bK[1-4]:[A-Z0-9]/)
  expect(reader).not.toMatch(/\b[a-z]{2,}_[a-z][a-z_]+\b/)
})

/* ------------------------------------------------------------- accessibility */

test('accessibility: one main, heading order, and no axe violation from compass markup', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  expect(await page.locator('main').count()).toBe(1)

  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4')).map((node) =>
      Number(node.tagName.slice(1)),
    ),
  )
  expect(levels[0]).toBe(1)
  for (let index = 1; index < levels.length; index += 1) {
    const previous = levels[index - 1] ?? 1
    const current = levels[index] ?? 1
    expect(current).toBeLessThanOrEqual(previous + 1)
  }

  const axe = await new AxeBuilder({ page })
    .include('.dv4-root')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
    .analyze()
  expect(axe.violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
})

test('accessibility: the navigator scrolls to a section and does not switch a tab', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const links = page.locator('.dv4-nav a')
  const total = await links.count()
  expect(total).toBeGreaterThan(15)
  for (let index = 0; index < total; index += 1) {
    const href = await links.nth(index).getAttribute('href')
    expect(href).toMatch(/^#/)
    // The anchor exists, so no link goes nowhere.
    expect(await page.locator(href ?? '#none').count()).toBe(1)
  }
  // Following one anchor leaves every other section on the page.
  const before = await page.locator('section[id]').count()
  await links.nth(3).click()
  expect(await page.locator('section[id]').count()).toBe(before)
})

test('accessibility: disclosures open from the keyboard and focus stays visible', async ({
  page,
}) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const summary = page.locator('#evidence-receipts summary').first()
  await summary.focus()
  const outline = await summary.evaluate((node) => {
    node.focus()
    return getComputedStyle(node).outlineStyle
  })
  expect(outline).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(summary.locator('xpath=..')).toHaveAttribute('open', '')
})

test('accessibility: every evidence state carries a word, not only a colour', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const badges = page.locator('.dv4-state')
  const count = await badges.count()
  expect(count).toBeGreaterThan(5)
  for (let index = 0; index < count; index += 1) {
    const text = (await badges.nth(index).innerText()).replace(/[^\p{L}]/gu, '')
    expect(text.length).toBeGreaterThan(2)
  }
})

test('accessibility: reduced motion is respected and nothing animates on load', async ({
  browser,
}) => {
  const { slug } = requireFixture()
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`/d/${slug}`)
  const animated = await page.evaluate(
    () =>
      Array.from(document.querySelectorAll('.dv4-root *')).filter((node) => {
        const style = getComputedStyle(node)
        return style.animationName !== 'none' && Number.parseFloat(style.animationDuration) > 0.01
      }).length,
  )
  expect(animated).toBe(0)
  await context.close()
})

/* -------------------------------------------------------- responsive layout */

for (const viewport of [
  { name: '320', width: 320, height: 800 },
  { name: '390', width: 390, height: 844 },
]) {
  test(`no horizontal overflow at ${viewport.name} px`, async ({ browser }) => {
    const { slug } = requireFixture()
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    })
    const page = await context.newPage()
    await page.goto(`/d/${slug}`)
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }))
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
    await context.close()
  })
}

test('the goal matrix becomes stacked rows rather than a sideways scroll', async ({ browser }) => {
  const { slug } = requireFixture()
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto(`/d/${slug}`)
  const cell = page.locator('#goal-fingerprint tbody td').first()
  // Stacked: the column name is restored by the cell itself rather than by a header row.
  await expect(cell).toHaveAttribute('data-column', /.+/)
  const display = await cell.evaluate((node) => getComputedStyle(node).display)
  expect(display).toBe('grid')
  await context.close()
})

test('200 per cent zoom keeps the page in one column and inside the viewport', async ({
  browser,
}) => {
  const { slug } = requireFixture()
  const context = await browser.newContext({
    viewport: { width: 640, height: 800 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()
  await page.goto(`/d/${slug}`)
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '32px'
  })
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
  await context.close()
})

/* -------------------------------------------------------- visual regression */

test('the page is structurally different from dossier v3', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)

  // The v3 furniture is gone from the primary path.
  expect(await page.locator('.dv3-root').count()).toBe(0)
  expect(await page.locator('#in-ten-seconds').count()).toBe(0)
  expect(await page.locator('#deep-evidence').count()).toBe(0)

  // The v4 furniture is present.
  expect(await page.locator('.dv4-root').count()).toBe(1)
  await expect(page.locator('.dv4-strip')).toBeVisible()
  await expect(page.locator('.dv4-purpose')).toBeVisible()
  await expect(page.locator('.dv4-hero-action')).toBeVisible()
  await expect(page.locator('#body-journey .dv4-path')).toBeVisible()
  await expect(page.locator('#goal-fingerprint table')).toBeVisible()
  await expect(page.locator('#evidence-staircase .dv4-stair')).toBeVisible()

  // The generated question list is below the receipts, not in the first viewport.
  const firstViewportIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll('section[id]'))
      .filter((node) => node.getBoundingClientRect().top < window.innerHeight)
      .map((node) => node.id),
  )
  expect(firstViewportIds).toContain('substance-action')
  expect(firstViewportIds).not.toContain('technical-record')
})

test('the deep record stays reachable from the compass', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const technical = page.locator('#technical-record')
  await expect(technical).toContainText('The full record, for auditing')
  const disclosure = technical.locator('details').first()
  await disclosure.locator('summary').click()
  await expect(disclosure).toHaveAttribute('open', '')
})

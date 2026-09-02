import { randomUUID } from 'node:crypto'

import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Cookie, type Page } from '@playwright/test'

// The two steward reports answer 404 to anyone without steward or administrator authority, so the
// links to them must appear only for an account that can actually open them. This spec proves both
// halves: a steward sees the labelled links and can follow them, and a visitor without that
// authority is shown neither.
//
// It never calls the sign-in endpoint. Sign-in is rate limited to ten attempts per fifteen minutes
// for one anonymous caller; `userAgentBucket` reduces every browser to its family, so the whole
// suite shares a single bucket that no per-spec identity can escape and no retry can clear, and the
// existing specs already use the whole allowance. Adding even one sign-in here failed an unrelated
// spec. This seals a session with the application's own configuration instead, which exercises the
// same session the endpoint would have issued without spending anyone's allowance.
test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

const STEWARD_REPORTS = [
  {
    href: '/review-queue/completion',
    linkName: 'Completion and identity review',
    heading: 'Completion and identity review',
  },
  {
    href: '/review-queue/search-indexing',
    linkName: 'Search indexing report',
    heading: 'Search indexing report',
  },
] as const

let stewardId: string | null = null
let stewardCookies: Cookie[] = []

async function createStewardSession(): Promise<void> {
  const [{ db }, schema, { hashPassword }, { sealData }, session] = await Promise.all([
    import('../../db'),
    import('../../db/schema'),
    import('../../lib/auth'),
    import('iron-session'),
    import('../../lib/session-options'),
  ])
  const runKey = randomUUID().replaceAll('-', '').slice(0, 12)
  stewardId = `playwright-steward-reports-${runKey}`

  await db.insert(schema.users).values({
    id: stewardId,
    email: `playwright-steward-reports-${runKey}@example.test`,
    // Never used: this spec seals its session directly rather than signing in.
    passwordHash: await hashPassword(`Playwright-${runKey}-safe-passphrase!42`),
    name: 'Playwright steward reports reviewer',
    handle: `playwright-steward-${runKey}`,
    trustTier: 'steward',
  })

  const sealed = await sealData(
    { userId: stewardId },
    { password: session.sessionOptions.password as string, ttl: session.sessionOptions.ttl },
  )
  stewardCookies = [
    {
      name: session.SESSION_COOKIE_NAME,
      value: sealed,
      domain: 'localhost',
      path: '/',
      expires: -1,
      httpOnly: true,
      // The application marks this Secure in production; the test server is plain http, and the
      // server only ever reads the sealed value, so the flag is irrelevant to what is under test.
      secure: false,
      sameSite: 'Lax',
    },
  ]
}

async function removeSteward(): Promise<void> {
  if (!stewardId) return
  const [{ db }, schema, { eq }] = await Promise.all([
    import('../../db'),
    import('../../db/schema'),
    import('drizzle-orm'),
  ])
  // This account authors nothing, so no append-only audit row references it.
  await db.delete(schema.users).where(eq(schema.users.id, stewardId))
  stewardId = null
  stewardCookies = []
}

async function openAsSteward(page: Page): Promise<void> {
  await page.context().addCookies(stewardCookies)
  await page.goto('/review-queue')
}

async function expectNoHorizontalOverflow(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, `${label} must not overflow horizontally`).toBeLessThanOrEqual(0)
}

test.beforeAll(createStewardSession)
test.afterAll(removeSteward)

test('a steward reaches both reports from the review queue', async ({ page }) => {
  await openAsSteward(page)

  const reports = page.getByRole('navigation', { name: 'Steward reports' })
  await expect(reports).toBeVisible()
  await expect(reports.getByRole('heading', { name: 'Steward reports' })).toBeVisible()

  // The description must not promise that a search engine has indexed anything.
  await expect(reports).toContainText('It does not say whether a search engine has indexed them.')

  for (const report of STEWARD_REPORTS) {
    const link = reports.getByRole('link', { name: report.linkName })
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', report.href)

    // Every link is operable by keyboard and keeps a visible focus indicator. The steward panels
    // beside this navigation hydrate as client components, so focus and the check must happen in
    // the same step: a hydration remount between them would replace the focused anchor.
    await expect
      .poll(
        async () =>
          link.evaluate((node) => {
            ;(node as HTMLAnchorElement).focus()
            return document.activeElement === node
          }),
        { message: `${report.linkName} must accept keyboard focus` },
      )
      .toBe(true)
    const outline = await link.evaluate((node) => getComputedStyle(node).outlineStyle)
    expect(outline).not.toBe('none')
  }

  const scan = await new AxeBuilder({ page }).include('nav[aria-labelledby]').analyze()
  const violations = scan.violations.filter(
    (violation) =>
      (violation.impact === 'serious' || violation.impact === 'critical') &&
      violation.tags.some((tag) => tag.startsWith('wcag')),
  )
  expect(violations.map((violation) => violation.id)).toEqual([])

  await page.setViewportSize({ width: 320, height: 800 })
  await expectNoHorizontalOverflow(page, 'Review queue steward reports at 320px')
})

test('each steward link opens the report it names', async ({ page }) => {
  for (const report of STEWARD_REPORTS) {
    await openAsSteward(page)
    await page
      .getByRole('navigation', { name: 'Steward reports' })
      .getByRole('link', { name: report.linkName })
      .click()

    await page.waitForURL(`**${report.href}`)
    await expect(page.getByRole('heading', { level: 1, name: report.heading })).toBeVisible()
  }
})

test('a reader without steward authority is shown neither report', async ({ page }) => {
  await page.goto('/review-queue')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Steward reports' })).toHaveCount(0)
  for (const report of STEWARD_REPORTS) {
    await expect(page.locator(`a[href="${report.href}"]`)).toHaveCount(0)
    // Following the URL directly still answers not found, so the hidden link is not the only guard.
    const response = await page.request.get(report.href)
    expect(response.status(), report.href).toBe(404)
  }
})

import { randomUUID } from 'node:crypto'

import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

// The sign-in rate limit buckets anonymous requests by client address and user agent, and the
// whole suite shares one address. Identifying this spec's browser separately gives it its own
// bucket, so its sign-ins neither exhaust nor are exhausted by another spec's.
test.use({
  colorScheme: 'light',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 RNAWikiTest/review-queue-steward-reports',
})
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

interface TestAccount {
  id: string
  email: string
  password: string
}

// This spec needs two signed-in accounts and nothing else. It deliberately does not install the
// shared evidence fixture: two specs installing it in the same parallel run each create their own
// programme, and the homepage search then resolves a medicine to whichever one it finds.
let steward: TestAccount | null = null
let contributor: TestAccount | null = null

async function createAccounts(): Promise<void> {
  const [{ db }, schema, { hashPassword }] = await Promise.all([
    import('../../db'),
    import('../../db/schema'),
    import('../../lib/auth'),
  ])
  const runKey = randomUUID().replaceAll('-', '').slice(0, 12)
  const password = `Playwright-${runKey}-safe-passphrase!42`
  const passwordHash = await hashPassword(password)
  const make = (role: string): TestAccount => ({
    id: `playwright-steward-reports-${role}-${runKey}`,
    email: `playwright-steward-reports-${role}-${runKey}@example.test`,
    password,
  })
  steward = make('steward')
  contributor = make('contributor')

  await db.insert(schema.users).values([
    {
      id: steward.id,
      email: steward.email,
      passwordHash,
      name: 'Playwright steward reports reviewer',
      handle: `playwright-steward-${runKey}`,
      trustTier: 'steward',
    },
    {
      id: contributor.id,
      email: contributor.email,
      passwordHash,
      name: 'Playwright steward reports contributor',
      handle: `playwright-contributor-${runKey}`,
    },
  ])
}

async function removeAccounts(): Promise<void> {
  const ids = [steward?.id, contributor?.id].filter((id): id is string => typeof id === 'string')
  if (ids.length === 0) return
  const [{ db }, schema, { inArray }] = await Promise.all([
    import('../../db'),
    import('../../db/schema'),
    import('drizzle-orm'),
  ])
  // These accounts author nothing, so no append-only audit row references them.
  await db.delete(schema.users).where(inArray(schema.users.id, ids))
  steward = null
  contributor = null
}

async function loginAs(page: Page, account: TestAccount) {
  const response = await page.request.post('/api/auth/login', {
    data: { email: account.email, password: account.password },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  expect(JSON.parse(body)).toMatchObject({ user: { id: account.id } })
}

async function expectNoHorizontalOverflow(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow, `${label} must not overflow horizontally`).toBeLessThanOrEqual(0)
}

test.beforeAll(createAccounts)
test.afterAll(removeAccounts)

test('a steward reaches both reports from the review queue', async ({ page }) => {
  await loginAs(page, steward!)
  await page.goto('/review-queue')

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

for (const report of STEWARD_REPORTS) {
  test(`the steward link to ${report.href} opens the report`, async ({ page }) => {
    await loginAs(page, steward!)
    await page.goto('/review-queue')

    await page
      .getByRole('navigation', { name: 'Steward reports' })
      .getByRole('link', { name: report.linkName })
      .click()

    await page.waitForURL(`**${report.href}`)
    await expect(page.getByRole('heading', { level: 1, name: report.heading })).toBeVisible()
  })
}

test('a contributor is not shown links to reports they cannot open', async ({ page }) => {
  await loginAs(page, contributor!)
  await page.goto('/review-queue')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Steward reports' })).toHaveCount(0)
  for (const report of STEWARD_REPORTS) {
    await expect(page.locator(`a[href="${report.href}"]`)).toHaveCount(0)
  }

  // Following the URL directly still answers not found, so the hidden link is not the only guard.
  const response = await page.request.get(STEWARD_REPORTS[0].href)
  expect(response.status()).toBe(404)
})

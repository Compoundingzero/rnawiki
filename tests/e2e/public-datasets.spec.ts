import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

test.use({ colorScheme: 'light' })

const DATASET_PATHS = [
  '/datasets/enzyme-transporter-negatives',
  '/datasets/source-consensus',
  '/datasets/silence-ledger',
  '/datasets/coverage-ledger',
  '/datasets/inventory-resolution',
  '/datasets/dossier-completion',
] as const

async function expectNoHorizontalOverflow(page: Page, surface: string): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }))
  expect(
    dimensions.content,
    `${surface} overflows horizontally: ${JSON.stringify(dimensions)}`,
  ).toBeLessThanOrEqual(dimensions.viewport + 1)
}

async function expectNoSeriousWcagViolations(page: Page, surface: string): Promise<void> {
  const result = await new AxeBuilder({ page }).analyze()
  const violations = result.violations.filter(
    (violation) =>
      (violation.impact === 'serious' || violation.impact === 'critical') &&
      violation.tags.some((tag) => tag.startsWith('wcag')),
  )
  expect(
    violations,
    `${surface} has serious/critical WCAG violations: ${violations
      .map((violation) => violation.id)
      .join(', ')}`,
  ).toEqual([])
}

test('publishes exactly six keyboard-reachable source-first dataset readers', async ({ page }) => {
  await page.goto('/datasets')
  await expect(
    page.getByRole('heading', { level: 1, name: /inspect what this corpus records/i }),
  ).toBeVisible()
  await expect(page.locator('main')).toHaveCount(1)

  for (const pathname of DATASET_PATHS) {
    const link = page.locator(`a[href="${pathname}"]`)
    await expect(link).toHaveCount(1)
    await link.focus()
    await expect(link).toBeFocused()
  }

  await expectNoSeriousWcagViolations(page, 'Public dataset index')
})

test('keeps a complete dataset reader usable at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/datasets/enzyme-transporter-negatives')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/findings/i)
  await expect(page.getByText('What this does not mean:', { exact: false })).toBeVisible()
  await expect(page.getByRole('searchbox', { name: 'Search public fields' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Role' })).toBeVisible()
  await expect(page.getByText('Version not recorded', { exact: false }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'View this filtered page as JSON' })).toHaveAttribute(
    'href',
    /\/api\/datasets\/enzyme-transporter-negatives\?limit=10/u,
  )
  await expect(
    page.getByRole('link', { name: 'Download up to 200 filtered CSV rows' }),
  ).toHaveAttribute('href', /format=csv/u)
  await expectNoHorizontalOverflow(page, 'Negative-findings dataset at 320px')
  await expectNoSeriousWcagViolations(page, 'Negative-findings dataset')
})

test('persists reader search and filters across GET pagination and API links', async ({ page }) => {
  await page.goto('/datasets/source-consensus?q=hours&state=agree')
  await expect(page.getByRole('searchbox', { name: 'Search public fields' })).toHaveValue('hours')
  await expect(page.getByRole('combobox', { name: 'Comparison state' })).toHaveValue('agree')

  const next = page.getByRole('link', { name: 'Next page' })
  await expect(next).toBeVisible()
  await expect(next).toHaveAttribute('href', /q=hours/u)
  await expect(next).toHaveAttribute('href', /state=agree/u)
  await expect(next).toHaveAttribute('href', /offset=10/u)

  const json = page.getByRole('link', { name: 'View this filtered page as JSON' })
  await expect(json).toHaveAttribute('href', /q=hours/u)
  await expect(json).toHaveAttribute('href', /state=agree/u)
  await expectNoSeriousWcagViolations(page, 'Filtered source-consensus reader')
})

test('keeps the identity and completion readers usable at 320 pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })

  await page.goto('/datasets/inventory-resolution')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/resolves to/i)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.getByRole('combobox', { name: 'Resolution' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Kind of record' })).toBeVisible()
  await expectNoHorizontalOverflow(page, 'Record identity dataset at 320px')
  await expectNoSeriousWcagViolations(page, 'Record identity dataset')

  await page.goto('/datasets/dossier-completion')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/sections have reached/i)
  await expect(page.locator('main')).toHaveCount(1)
  await expect(page.getByText('What this does not mean:', { exact: false })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Completion' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Section state' })).toBeVisible()
  await expectNoHorizontalOverflow(page, 'Dossier completion dataset at 320px')
  await expectNoSeriousWcagViolations(page, 'Dossier completion dataset')
})

test('serves each allowlisted public dataset and rejects a private-looking id', async ({
  page,
}) => {
  for (const pathname of DATASET_PATHS) {
    const response = await page.request.get(pathname)
    expect(response.status(), pathname).toBe(200)
  }
  const denied = await page.request.get('/api/datasets/review-queue?limit=1')
  expect(denied.status()).toBe(404)
})

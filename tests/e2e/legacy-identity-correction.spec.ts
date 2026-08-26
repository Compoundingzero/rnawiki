import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

import {
  installLegacyIdentityCorrectionFixture,
  type LegacyIdentityCorrectionFixture,
} from './fixtures/legacy-identity-correction'

test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

let fixture: LegacyIdentityCorrectionFixture

async function login(
  page: Page,
  account: { id: string; email: string; password: string },
): Promise<void> {
  const response = await page.request.post('/api/auth/login', {
    data: { email: account.email, password: account.password },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  expect(JSON.parse(body)).toMatchObject({ user: { id: account.id } })
}

async function switchAccount(
  page: Page,
  account: { id: string; email: string; password: string },
): Promise<void> {
  const logout = await page.request.post('/api/auth/logout')
  expect(logout.status()).toBe(200)
  await login(page, account)
}

async function expectNoSeriousWcagViolations(page: Page, surface: string): Promise<void> {
  const result = await new AxeBuilder({ page }).analyze()
  const violations = result.violations.filter(
    (violation) =>
      (violation.impact === 'serious' || violation.impact === 'critical') &&
      violation.tags.some((tag) => tag.startsWith('wcag')),
  )
  expect(violations, `${surface} has serious or critical WCAG violations`).toEqual([])
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflows = await page.locator('body *').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const node = element as HTMLElement
        return (
          node.scrollWidth > node.clientWidth + 1 && getComputedStyle(node).overflowX === 'visible'
        )
      })
      .map((element) => element.tagName),
  )
  expect(overflows).toEqual([])
}

test.beforeAll(async () => {
  fixture = await installLegacyIdentityCorrectionFixture()
})

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
})

test('a sourced legacy name correction stays in the bottom utilities, queues, and publishes only after independent review', async ({
  page,
}) => {
  const correctedName = `Reviewed identity ${fixture.slug.slice(-12)}`
  const explanation = 'The regulator page records the corrected medicine name used in this test.'

  await login(page, fixture.author)
  await page.goto(`/d/${fixture.slug}`)
  await expect(page.getByRole('heading', { name: fixture.originalName })).toBeVisible()
  const evidenceControl = page.locator('summary[aria-controls="advanced-evidence-content"]')
  const correctionControl = page.getByRole('button', { name: 'Suggest a correction' })
  await expect(evidenceControl).toBeVisible()
  await expect(correctionControl).toBeVisible()
  expect(
    await correctionControl.evaluate((correction) => {
      const evidence = document.querySelector('summary[aria-controls="advanced-evidence-content"]')
      return Boolean(
        evidence && evidence.compareDocumentPosition(correction) & Node.DOCUMENT_POSITION_FOLLOWING,
      )
    }),
  ).toBe(true)
  await correctionControl.click()

  const dialog = page.getByRole('dialog', { name: 'Suggest a correction' })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByText(/This form cannot change evidence, safety, efficacy, trials, mechanism/),
  ).toBeVisible()
  await dialog.getByRole('radio', { name: 'Medicine name', exact: true }).check()
  await dialog.getByLabel('Corrected medicine name').fill(correctedName)
  await dialog.getByLabel('Source page title').fill(fixture.sourceTitle)
  await dialog.getByLabel('Public source URL').fill(fixture.sourceUrl)
  await dialog.getByLabel('Why should this name change?').fill(explanation)

  const responsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/drugs/${fixture.slug}/revisions` &&
      response.request().method() === 'POST',
  )
  await dialog.getByRole('button', { name: 'Submit for independent review' }).click()
  const submission = await responsePromise
  const submissionBody = await submission.text()
  expect(submission.status(), submissionBody).toBe(202)
  const submitted = JSON.parse(submissionBody) as {
    revisionId: string
    revision: { identityCorrection: { sourceUrl: string; sourceTitle: string } }
  }
  expect(submitted.revision.identityCorrection).toMatchObject({
    sourceUrl: fixture.sourceUrl,
    sourceTitle: fixture.sourceTitle,
  })
  await expect(page.getByRole('dialog', { name: 'Your correction is in the queue' })).toBeVisible()
  await expectNoSeriousWcagViolations(page, 'identity correction confirmation')

  await page.goto('/review-queue')
  const authorCard = page.locator('article').filter({ hasText: correctedName })
  await expect(authorCard).toBeVisible()
  await expect(authorCard.getByText(fixture.sourceTitle)).toBeVisible()
  await expect(authorCard.getByText(explanation)).toBeVisible()
  await expect(authorCard.getByRole('button', { name: /Approve/ })).toHaveCount(0)

  const forbiddenMedicalEdit = await page.request.post(`/api/drugs/${fixture.slug}/revisions`, {
    data: {
      field: 'name',
      proposedValue: correctedName,
      sourceUrl: fixture.sourceUrl,
      sourceTitle: fixture.sourceTitle,
      explanation,
      safety: 'This field must never enter the legacy identity route.',
    },
  })
  expect(forbiddenMedicalEdit.status()).toBe(422)
  expect(await forbiddenMedicalEdit.json()).toMatchObject({ code: 'programme_required' })

  await switchAccount(page, fixture.reviewer)
  await page.goto('/review-queue')
  const reviewerCard = page.locator('article').filter({ hasText: correctedName })
  await expect(reviewerCard.getByRole('button', { name: /Approve/ })).toBeVisible()
  const approvalPromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === `/api/revisions/${submitted.revisionId}/review` &&
      response.request().method() === 'POST',
  )
  await reviewerCard.getByRole('button', { name: /Approve/ }).click()
  const approval = await approvalPromise
  const approvalBody = await approval.text()
  expect(approval.status(), approvalBody).toBe(200)
  await expect(reviewerCard).toBeHidden()

  await page.goto(`/d/${fixture.slug}/history`)
  await expect(page.getByText(fixture.sourceTitle)).toBeVisible()
  await expect(page.getByText(explanation)).toBeVisible()
  await expect(page.getByText('Published', { exact: true })).toBeVisible()
  await expect(page.getByText(new RegExp(`by ${fixture.reviewer.name}`))).toBeVisible()
  await expectNoSeriousWcagViolations(page, 'identity correction history')
  await expectNoHorizontalOverflow(page)

  const readBack = await page.request.get(`/api/drugs/${fixture.slug}`)
  expect(readBack.status()).toBe(200)
  expect(await readBack.json()).toMatchObject({ drug: { id: fixture.slug, name: correctedName } })
})

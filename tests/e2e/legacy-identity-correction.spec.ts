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
  // `exact` because the hero carries a visually hidden "What <name> does in the body" heading.
  await expect(page.getByRole('heading', { name: fixture.originalName, exact: true })).toBeVisible()
  /*
   * There is no correction control on a medicine page any more.
   *
   * This test used to open one: an "Suggest a correction" button below the advanced-evidence
   * disclosure, on the page itself. Both belonged to the medicine layout this release deleted, and
   * the deletion was deliberate rather than incidental — a reader arrives to find out about a
   * medicine, and a page that offers them an editing form in the same view has changed what it is.
   *
   * The workflow behind it is unchanged and is what this test still covers: a signed-in member may
   * propose exactly one medicine-name or trade-name correction with a public source, one different
   * trusted person decides it, and nothing publishes without that. Only the way in moved, to the
   * review queue and the API the queue posts to.
   */
  await expect(page.locator('summary[aria-controls="advanced-evidence-content"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Suggest a correction' })).toHaveCount(0)

  const submission = await page.request.post(`/api/drugs/${fixture.slug}/revisions`, {
    data: {
      field: 'name',
      proposedValue: correctedName,
      sourceUrl: fixture.sourceUrl,
      sourceTitle: fixture.sourceTitle,
      explanation,
    },
  })
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

  await page.goto('/review-queue')
  await expectNoSeriousWcagViolations(page, 'review queue with a pending identity correction')
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

import { randomUUID } from 'node:crypto'

import { expect, test, type Page } from '@playwright/test'
import { eq } from 'drizzle-orm'

import {
  installNormalizedInclisiranFixture,
  normalizedInclisiranRegistryStudy,
  type NormalizedInclisiranFixture,
} from './fixtures/normalized-inclisiran'

test.use({ colorScheme: 'light' })
test.describe.configure({ mode: 'serial' })

const SOURCE_REFRESH_MEDICINE = {
  medicineSlug: 'playwright-source-refresh-medicine',
  medicineName: 'Playwright source-refresh medicine',
} as const

type SourceRefreshAction = 'CANONICAL_REFRESH' | 'NEEDS_SCIENTIFIC_REVISION'

interface InstalledSourceTask {
  id: string
  pendingSnapshotId: string
}

let scientificRevisionFixture: NormalizedInclisiranFixture | null = null
let scientificRevisionTask: InstalledSourceTask | null = null
let canonicalRefreshFixture: NormalizedInclisiranFixture | null = null
let canonicalRefreshTask: InstalledSourceTask | null = null

async function monitorRegistryUpdate(args: {
  fixture: NormalizedInclisiranFixture
  expectedAction: SourceRefreshAction
  overallStatus?: string
  enrolment?: number
}): Promise<InstalledSourceTask> {
  const [{ db }, schema, { ClinicalTrialsGovAdapter }, { monitorClinicalTrialsSource }] =
    await Promise.all([
      import('../../db'),
      import('../../db/schema'),
      import('../../lib/evidence/adapters/clinical-trials-gov'),
      import('../../lib/evidence/source-monitor-drizzle'),
    ])
  const suffix = randomUUID().replaceAll('-', '').slice(0, 12)
  const checkedAt = new Date('2026-08-23T04:00:00.000Z')
  const monitored = await monitorClinicalTrialsSource({
    database: db,
    adapter: new ClinicalTrialsGovAdapter(
      async () =>
        new Response(
          JSON.stringify(
            normalizedInclisiranRegistryStudy({
              ...(args.overallStatus ? { overallStatus: args.overallStatus } : {}),
              ...(args.enrolment === undefined ? {} : { enrolment: args.enrolment }),
            }),
          ),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      () => checkedAt,
    ),
    programmeId: args.fixture.programmeId,
    sourceId: args.fixture.sourceId,
    idempotencyKey: `e2e-source-refresh-${suffix}`,
    now: () => checkedAt,
  })
  expect(monitored.status).toBe('SUCCEEDED')
  expect(monitored.reviewTaskIds).toHaveLength(1)
  expect(monitored.pendingSnapshotId).toBeTruthy()

  const taskId = monitored.reviewTaskIds[0]!
  const deltaRows = await db
    .select({
      action: schema.evidenceReviewTaskSourceDeltas.action,
      pendingSnapshotId: schema.evidenceReviewTaskSourceDeltas.pendingSnapshotId,
    })
    .from(schema.evidenceReviewTaskSourceDeltas)
    .where(eq(schema.evidenceReviewTaskSourceDeltas.reviewTaskId, taskId))
    .limit(1)
  expect(deltaRows[0]).toMatchObject({
    action: args.expectedAction,
    pendingSnapshotId: monitored.pendingSnapshotId,
  })
  return { id: taskId, pendingSnapshotId: monitored.pendingSnapshotId! }
}

async function loginFixtureAccount(
  page: Page,
  account: NormalizedInclisiranFixture['contributor'],
): Promise<void> {
  const response = await page.request.post('/api/auth/login', {
    data: { email: account.email, password: account.password },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  expect(JSON.parse(body)).toMatchObject({ user: { id: account.id } })
}

async function readPublishedProgrammeRecord(
  page: Page,
  fixture: NormalizedInclisiranFixture,
): Promise<unknown> {
  const response = await page.request.get(
    `/api/drugs/${fixture.medicineSlug}?programme=${encodeURIComponent(fixture.programmeSlug)}`,
  )
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  const parsed = JSON.parse(body) as {
    programmeDossier?: { selectedProgrammeId?: string } | null
  }
  expect(parsed.programmeDossier?.selectedProgrammeId).toBe(fixture.programmeSlug)
  return parsed.programmeDossier
}

function programmeQueueCard(page: Page, fixture: NormalizedInclisiranFixture, label: string) {
  const href = `/d/${fixture.medicineSlug}?programme=${encodeURIComponent(fixture.programmeSlug)}`
  return page
    .locator('ol > li > article')
    .filter({ has: page.locator(`a[href="${href}"]`) })
    .filter({ hasText: label })
}

test.beforeAll(async () => {
  scientificRevisionFixture = await installNormalizedInclisiranFixture(SOURCE_REFRESH_MEDICINE)
  if (!scientificRevisionFixture) {
    throw new Error('Scientific-revision browser fixture installation did not complete.')
  }
  scientificRevisionTask = await monitorRegistryUpdate({
    fixture: scientificRevisionFixture,
    expectedAction: 'NEEDS_SCIENTIFIC_REVISION',
    overallStatus: 'TERMINATED',
  })

  canonicalRefreshFixture = await installNormalizedInclisiranFixture({
    ...SOURCE_REFRESH_MEDICINE,
    registrySupportsClaim: false,
  })
  if (!canonicalRefreshFixture) {
    throw new Error('Canonical-refresh browser fixture installation did not complete.')
  }
  canonicalRefreshTask = await monitorRegistryUpdate({
    fixture: canonicalRefreshFixture,
    expectedAction: 'CANONICAL_REFRESH',
    enrolment: 1600,
  })
})

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
})

test('shows exact registry facts and a truthful scientific-revision stop instead of an authoring half-path', async ({
  page,
}) => {
  if (!scientificRevisionFixture || !scientificRevisionTask) {
    throw new Error('Scientific-revision browser fixture is unavailable.')
  }
  await page.goto('/review-queue')

  const card = programmeQueueCard(
    page,
    scientificRevisionFixture,
    'Stop here: this is more than an exact registry-data refresh.',
  )
  await expect(card).toHaveCount(1)
  await expect(card.getByText('Study status', { exact: true })).toBeVisible()
  await expect(card.getByText('Completed', { exact: true })).toBeVisible()
  await expect(card.getByText('Terminated', { exact: true })).toBeVisible()
  await expect(card.getByText('there is not yet a one-click form', { exact: false })).toBeVisible()
  await expect(
    card.getByText('Two independent qualified reviewers must approve that exact proposed record', {
      exact: false,
    }),
  ).toBeVisible()
  await expect(card.getByRole('link', { name: 'NCT03399370' })).toHaveAttribute(
    'href',
    scientificRevisionFixture.sourceHref,
  )
  await expect(card.locator('form')).toHaveCount(0)
  await expect(card.locator('textarea')).toHaveCount(0)
  await expect(card.getByRole('button', { name: 'Build checked review draft' })).toHaveCount(0)
})

test('creates and submits an exact canonical source-refresh draft without changing the public record', async ({
  page,
}) => {
  test.setTimeout(90_000)
  if (!canonicalRefreshFixture || !canonicalRefreshTask) {
    throw new Error('Canonical-refresh browser fixture is unavailable.')
  }
  await loginFixtureAccount(page, canonicalRefreshFixture.contributor)
  const publicRecordBefore = await readPublishedProgrammeRecord(page, canonicalRefreshFixture)
  await page.goto('/review-queue')

  const sourceTaskCard = programmeQueueCard(
    page,
    canonicalRefreshFixture,
    'This task contains only exact fields parsed from ClinicalTrials.gov.',
  )
  const submittedProposalCard = programmeQueueCard(
    page,
    canonicalRefreshFixture,
    'Exact source refresh',
  )
  await expect(sourceTaskCard).toHaveCount(1)
  await expect(sourceTaskCard.getByText('Number of participants', { exact: true })).toBeVisible()
  await expect(sourceTaskCard.getByText('1,561', { exact: true })).toBeVisible()
  await expect(sourceTaskCard.getByText('1,600', { exact: true })).toBeVisible()
  await expect(submittedProposalCard).toHaveCount(0)

  await sourceTaskCard
    .getByLabel('Conflict-of-interest disclosure')
    .fill('No conflicts of interest for this test-only exact registry refresh.')
  await sourceTaskCard
    .getByLabel(
      'I confirm that this disclosure is complete and that I did not edit the registry facts.',
    )
    .check()
  const createResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname.endsWith(
        `/programmes/${canonicalRefreshFixture!.programmeSlug}/contributions`,
      ),
  )
  await sourceTaskCard.getByRole('button', { name: 'Build checked review draft' }).click()
  const created = await createResponse
  expect(created.status(), await created.text()).toBe(201)
  await expect(
    sourceTaskCard.getByText('all required checks passed', { exact: false }),
  ).toBeVisible()
  await expect(
    sourceTaskCard.getByRole('button', { name: 'Submit for three independent reviews' }),
  ).toBeVisible()
  await expect(sourceTaskCard).toHaveCount(1)
  await expect(submittedProposalCard).toHaveCount(0)

  const submitResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      /^\/api\/contributions\/[^/]+\/submit$/.test(new URL(response.url()).pathname),
  )
  await sourceTaskCard.getByRole('button', { name: 'Submit for three independent reviews' }).click()
  const submitted = await submitResponse
  expect(submitted.status(), await submitted.text()).toBe(200)
  await expect(
    sourceTaskCard.getByText(
      'Submitted for three independent reviews. The public conclusion has not changed.',
      { exact: true },
    ),
  ).toBeVisible()
  await expect(
    sourceTaskCard.getByRole('button', { name: 'Submit for three independent reviews' }),
  ).toHaveCount(0)
  const queuedSourceTaskCard = programmeQueueCard(
    page,
    canonicalRefreshFixture,
    'This exact refresh is queued for review.',
  )
  await expect(queuedSourceTaskCard).toHaveCount(1)
  await expect(submittedProposalCard).toHaveCount(1)
  await expect(
    submittedProposalCard.getByText('Awaiting first review', { exact: true }),
  ).toBeVisible()
  await expect(
    submittedProposalCard.getByText('Number of participants', { exact: true }),
  ).toBeVisible()
  await expect(submittedProposalCard.getByText('1,561', { exact: true })).toBeVisible()
  await expect(submittedProposalCard.getByText('1,600', { exact: true })).toBeVisible()

  const publicRecordAfter = await readPublishedProgrammeRecord(page, canonicalRefreshFixture)
  expect(publicRecordAfter).toEqual(publicRecordBefore)
})

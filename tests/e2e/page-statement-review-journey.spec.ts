import { expect, test, type APIRequestContext } from '@playwright/test'

import { installDossierV4Fixture, type DossierV4Fixture } from './fixtures/dossier-v4'
import {
  installPageStatementMembers,
  type PageStatementMember,
  type PageStatementMembers,
} from './fixtures/page-statement-members'

/**
 * The whole journey: a member proposes a wording, three other members approve it, and the approved
 * wording is what the public page says — with no deployment between the third approval and the
 * reader.
 *
 * This runs against the built server and the real endpoints. Nothing here writes a review row, a
 * publication pointer or a status directly; every state change goes through the same API a browser
 * would use, because a test that reaches past the workflow proves nothing about the workflow.
 */

test.describe.configure({ mode: 'serial' })

let fixture: DossierV4Fixture | null = null
let members: PageStatementMembers | null = null
let proposalId = ''

test.beforeAll(async () => {
  fixture = await installDossierV4Fixture()
  members = await installPageStatementMembers()
})

test.afterAll(async () => {
  /*
   * The fixture is deliberately not removed. Once a wording has been proposed against this record,
   * `page_statement_revisions.medicine_id` holds a restricting foreign key to it, and that is the
   * behaviour being tested: a review decision is an audit record and the schema will not let a
   * medicine be deleted out from under one. The disposable database the runner drops is the
   * teardown, exactly as it is for the append-only correction ledger this fixture also writes.
   */
})

function requireFixture(): DossierV4Fixture {
  if (!fixture) throw new Error('The dossier v4 fixture did not finish installing.')
  return fixture
}

function requireMembers(): PageStatementMembers {
  if (!members) throw new Error('The review members did not finish installing.')
  return members
}

async function signIn(request: APIRequestContext, member: PageStatementMember): Promise<void> {
  const response = await request.post('/api/auth/login', {
    data: { email: member.email, password: member.password },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
}

const PROPOSED = 'Taken in this fixture to test how the compass handles a reworded sentence'

/* ------------------------------------------------------------- proposing */

test('a signed-out reader can read the review status but not propose', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText('Three different eligible members')
  await expect(page.locator('main')).toContainText('Sign in on the front page')
  await expect(page.getByRole('button', { name: 'Suggest a different wording' })).toHaveCount(0)
})

test('a member proposes a better wording through the form', async ({ page }) => {
  const { slug } = requireFixture()
  const { author } = requireMembers()
  await signIn(page.request, author)

  await page.goto(`/review-queue?slug=${slug}`)
  const card = page.locator('#hero\\.why_people_take_it')
  await card.getByRole('button', { name: 'Suggest a different wording' }).click()
  await card.getByLabel('Your wording').fill(PROPOSED)
  await card
    .getByLabel('Why is this better?')
    .fill('The recorded sentence reads as an instruction rather than a description.')
  await card.getByRole('button', { name: 'Send to the review queue' }).click()

  await expect(page.locator('main')).toContainText('Open proposals', { timeout: 15_000 })
  await expect(page.locator('main')).toContainText('0 of 3 approvals')
  // The word-level diff marks what the wording adds.
  const proposal = page.locator('[id^="proposal-"]').first()
  await expect(proposal.locator('ins', { hasText: 'reworded' })).toHaveCount(1)
})

test('the medicine page now shows one proposal open and nothing approved', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('.dv4-review-pill')).toContainText('Review or improve · 0/3')
  await expect(page.locator('.dv4-review-pill')).toHaveAttribute('data-review-state', 'open')
})

test('the author cannot approve their own proposal', async ({ page }) => {
  const { slug } = requireFixture()
  const { author } = requireMembers()
  await signIn(page.request, author)
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText(
    'You proposed this wording, so you cannot approve it',
  )

  const card = page.locator('[id^="proposal-"]').first()
  proposalId = ((await card.getAttribute('id')) ?? '').replace('proposal-', '')
  expect(proposalId).not.toBe('')
  const digestResponse = await page.request.get(`/review-queue?slug=${slug}`)
  expect(digestResponse.status()).toBe(200)
})

test('an account without reviewer standing cannot approve', async ({ page }) => {
  const { slug } = requireFixture()
  const { ordinary } = requireMembers()
  await signIn(page.request, ordinary)
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText(
    'needs a trusted editor, steward or administrator',
  )
})

/* -------------------------------------------------------------- approving */

test('the first approval moves the count to one of three', async ({ page }) => {
  const { slug } = requireFixture()
  const { reviewerOne } = requireMembers()
  await signIn(page.request, reviewerOne)
  await page.goto(`/review-queue?slug=${slug}`)

  const card = page.locator('[id^="proposal-"]').first()
  await expect(card).toContainText('Approval 1 of 3')
  await card.getByLabel('I read the proposed wording against the wording it replaces.').check()
  await card.getByLabel('I opened the source and checked it says what the wording claims.').check()
  await card
    .getByLabel('I checked the limit on this evidence is still represented honestly.')
    .check()
  await card.getByLabel('Conflicts of interest').fill('None.')
  await card.getByLabel('What I have written above is complete and accurate.').check()
  await card.getByRole('button', { name: 'Record my approval' }).click()

  await expect(page.locator('main')).toContainText('1 of 3 approvals', { timeout: 15_000 })
  await page.goto(`/d/${slug}`)
  await expect(page.locator('.dv4-review-pill')).toContainText('Review or improve · 1/3')
})

test('a second account with the same researcher identifier cannot add a second approval', async ({
  page,
}) => {
  const { slug } = requireFixture()
  const { reviewerOneDuplicate } = requireMembers()
  await signIn(page.request, reviewerOneDuplicate)
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText(
    'Another account with the same researcher identifier has already decided this wording',
  )
})

test('the second approval moves the count to two of three', async ({ page }) => {
  const { slug } = requireFixture()
  const { reviewerTwo } = requireMembers()
  await signIn(page.request, reviewerTwo)
  await page.goto(`/review-queue?slug=${slug}`)

  const card = page.locator('[id^="proposal-"]').first()
  await expect(card).toContainText('Approval 2 of 3')
  await card.getByLabel('I read the proposed wording against the wording it replaces.').check()
  await card.getByLabel('I opened the source and checked it says what the wording claims.').check()
  await card
    .getByLabel('I checked the limit on this evidence is still represented honestly.')
    .check()
  await card.getByLabel('Conflicts of interest').fill('None.')
  await card.getByLabel('What I have written above is complete and accurate.').check()
  await card.getByRole('button', { name: 'Record my approval' }).click()

  await expect(page.locator('main')).toContainText('2 of 3 approvals', { timeout: 15_000 })
  await page.goto(`/d/${slug}`)
  await expect(page.locator('.dv4-review-pill')).toContainText('Review or improve · 2/3')
})

test('the final approval asks for confirmation before it publishes', async ({ page }) => {
  const { slug } = requireFixture()
  const { reviewerThree } = requireMembers()
  await signIn(page.request, reviewerThree)
  await page.goto(`/review-queue?slug=${slug}`)

  const card = page.locator('[id^="proposal-"]').first()
  await expect(card).toContainText('Final approval — this will publish the revision')
  await card.getByLabel('I read the proposed wording against the wording it replaces.').check()
  await card.getByLabel('I opened the source and checked it says what the wording claims.').check()
  await card
    .getByLabel('I checked the limit on this evidence is still represented honestly.')
    .check()
  await card.getByLabel('Conflicts of interest').fill('None.')
  await card.getByLabel('What I have written above is complete and accurate.').check()
  await card.getByRole('button', { name: 'Final approval — review before publishing' }).click()

  // The confirmation names exactly what becomes public, where, and what stays unchanged.
  const confirm = page.getByRole('group')
  await expect(confirm).toContainText('This approval publishes the revision')
  await expect(confirm).toContainText(PROPOSED)
  await expect(confirm).toContainText(`/d/${slug}`)
  await expect(confirm).toContainText('unchanged')
  await expect(confirm).toContainText('roll it back')

  await confirm.getByRole('button', { name: 'Approve and publish this wording' }).click()
  await expect(page.locator('main')).toContainText('What has changed here', { timeout: 20_000 })
})

/* ------------------------------------------------------------- published */

test('the approved wording is what the public page says, with no deployment', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = (await page.locator('main').textContent()) ?? ''
  expect(text).toContain(PROPOSED)
  await expect(page.locator('.dv4-review-pill')).toContainText('Community approved · 3/3')
  await expect(page.locator('.dv4-review-pill')).toHaveAttribute(
    'data-review-state',
    'community_approved',
  )
})

test('approval changed the wording and not the evidence state', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  // The page as a whole did not become a reviewed page because three members liked a sentence.
  await expect(page.locator('.dv4-root')).toHaveAttribute(
    'data-publication-state',
    /preliminary|limited/,
  )
  // The sentence says, on the first screen, that its wording was approved by members.
  const origin = page.locator('[data-origin="community_reviewed"]')
  await expect(origin).toHaveCount(1)
  await expect(page.locator('main')).toContainText('Community approved 3/3')
  // And the page still describes the evidence exactly as it did before the rewording.
  await expect(page.locator('[data-block="strongest-result"] [data-state]')).not.toHaveAttribute(
    'data-state',
    'reviewed_content',
  )
})

test('the old wording and the three decisions stay in the history', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/review-queue?slug=${slug}`)
  const text = (await page.locator('main').textContent()) ?? ''
  expect(text).toContain('What has changed here')
  expect(text).toContain('3 approvals')
  expect(text).toContain(PROPOSED)
})

/* -------------------------------------------------------------- rollback */

test('a steward can roll the wording back, and the earlier wording returns', async ({ page }) => {
  const { slug } = requireFixture()
  const { steward } = requireMembers()
  await signIn(page.request, steward)

  const response = await page.request.post('/api/page-statements/rollback', {
    data: {
      slug,
      statementKey: 'hero.why_people_take_it',
      reason: 'Rolling back inside the end-to-end test to prove the control works.',
    },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(201)

  await page.goto(`/d/${slug}`)
  const text = (await page.locator('main').textContent()) ?? ''
  expect(text).not.toContain(PROPOSED)
  await expect(page.locator('.dv4-review-pill')).toContainText('Review or improve · 0/3')
})

test('an ordinary member cannot roll a wording back', async ({ page }) => {
  const { slug } = requireFixture()
  const { reviewerOne } = requireMembers()
  await signIn(page.request, reviewerOne)
  const response = await page.request.post('/api/page-statements/rollback', {
    data: { slug, statementKey: 'hero.why_people_take_it', reason: 'Trying without standing.' },
  })
  expect([403, 404]).toContain(response.status())
})

test('the rollback is a new event, and nothing was deleted', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/review-queue?slug=${slug}`)
  const text = (await page.locator('main').textContent()) ?? ''
  // The wording that was rolled back is still readable in the page's own history.
  expect(text).toContain(PROPOSED)
})

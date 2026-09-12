import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

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

test.beforeAll(async ({ browser }) => {
  fixture = await installDossierV4Fixture()
  members = await installPageStatementMembers()
  for (const member of Object.values(members)) await signInOnce(browser, member)
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

/*
 * Each member signs in exactly once, in `beforeAll`, and every case that needs them reuses the
 * session that produced. The sign-in budget is ten requests per fifteen minutes against a bucket
 * the whole Playwright run shares, so a spec that signs in per case spends the whole suite's
 * allowance and makes unrelated specs fail with a 429.
 */
const sessions = new Map<string, string>()

async function signInOnce(browser: Browser, member: PageStatementMember): Promise<void> {
  const context = await browser.newContext()
  const response = await context.request.post('/api/auth/login', {
    data: { email: member.email, password: member.password },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  sessions.set(member.id, JSON.stringify(await context.storageState()))
  await context.close()
}

async function openAs(
  browser: Browser,
  member: PageStatementMember,
): Promise<{ context: BrowserContext; page: Page }> {
  const saved = sessions.get(member.id)
  if (!saved) throw new Error(`no saved session for ${member.id}`)
  const context = await browser.newContext({ storageState: JSON.parse(saved) })
  return { context, page: await context.newPage() }
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

test('a member proposes a better wording through the form', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().author)

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
  await context.close()
})

test('the medicine page shows nothing at all about the open proposal', async ({ page }) => {
  /*
   * This used to assert the opposite: that the page now read "Review or improve · 0/3". The control
   * is gone, and so is the idea behind it. A proposal in flight is a fact about RNAWiki's process,
   * not about the medicine, and printing it beside the medicine's own record put a running tally in
   * front of a reader who came to find out whether a drug works. The page changes when the wording
   * changes — when three people have signed the same sentence off — and not before.
   */
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  await expect(page.locator('.dv4-review-pill')).toHaveCount(0)
  await expect(page.locator('[data-review-state]')).toHaveCount(0)
  await expect(page.locator('main a[href*="review-queue"]')).toHaveCount(0)
  await expect(page.locator('main')).not.toContainText('Open proposals')
})

test('the open proposal is visible in the queue, grouped under its medicine', async ({ page }) => {
  const { slug, name } = requireFixture()
  await page.goto('/review-queue')
  const row = page.locator(`li:has(a[href*="slug=${slug}"])`).first()
  await expect(row).toContainText(name)
  await expect(row).toContainText('1 proposal on 1 sentence')

  // And the medicine filter narrows the grouped queue to it.
  await page.goto(`/review-queue?medicine=${slug}`)
  await expect(page.locator('body')).toContainText('1 sentence across 1 medicine')
})

test('the author cannot approve their own proposal', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().author)
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText(
    'You proposed this wording, so you cannot approve it',
  )

  const card = page.locator('[id^="proposal-"]').first()
  proposalId = ((await card.getAttribute('id')) ?? '').replace('proposal-', '')
  expect(proposalId).not.toBe('')
  await context.close()
})

test('an account without reviewer standing cannot approve', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().ordinary)
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText(
    'needs a trusted editor, steward or administrator',
  )
  await context.close()
})

/* -------------------------------------------------------------- approving */

test('the first approval moves the count to one of three', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().reviewerOne)
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
  // The count lives in the queue. The medicine page still says what the record says, unchanged,
  // because one approval out of three has changed nothing about the medicine.
  await page.goto(`/d/${slug}`)
  await expect(page.locator('.dv4-review-pill')).toHaveCount(0)
  expect((await page.locator('#substance-action').textContent()) ?? '').not.toContain(PROPOSED)
  await context.close()
})

test('a second account with the same researcher identifier cannot add a second approval', async ({
  browser,
}) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().reviewerOneDuplicate)
  await page.goto(`/review-queue?slug=${slug}`)
  await expect(page.locator('main')).toContainText(
    'Another account with the same researcher identifier has already decided this wording',
  )
  await context.close()
})

test('the second approval moves the count to two of three', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().reviewerTwo)
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
  await expect(page.locator('.dv4-review-pill')).toHaveCount(0)
  expect((await page.locator('#substance-action').textContent()) ?? '').not.toContain(PROPOSED)
  await context.close()
})

test('the final approval asks for confirmation before it publishes', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().reviewerThree)
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
  await context.close()
})

/* ------------------------------------------------------------- published */

test('the approved wording is what the public page says, with no deployment', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const text = (await page.locator('main').textContent()) ?? ''
  // The third approval is the only one a reader ever sees, and they see it as the sentence itself
  // having changed — not as a badge saying it has been approved.
  expect(text).toContain(PROPOSED)
  await expect(page.locator('.dv4-review-pill')).toHaveCount(0)
  await expect(page.locator('[data-review-state]')).toHaveCount(0)
  expect(text.toLowerCase()).not.toContain('community approved')
})

test('approval changed the wording and not the evidence state', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  // The page as a whole did not become a reviewed page because three members liked a sentence.
  await expect(page.locator('.dv4-root')).toHaveAttribute(
    'data-publication-state',
    /preliminary|limited/,
  )
  /*
   * The sentence keeps the origin of what it rests on. There used to be a `community_reviewed`
   * origin rendering as "Community approved" beside the sentence; on a drug page that reads as a
   * verdict on the drug, and it was a verdict on a phrasing. The approval is recorded in the
   * provenance disclosure and the change history instead.
   */
  await expect(page.locator('[data-origin="community_reviewed"]')).toHaveCount(0)
  await expect(page.locator('main')).not.toContainText('Community approved')
  // It is still visible to anyone who opens the provenance, word for word.
  await expect(page.locator('#substance-action')).toContainText('3 members approved this wording')
  // And the page still describes the evidence exactly as it did before the rewording.
  await expect(page.locator('[data-block="strongest-result"] [data-state]')).not.toHaveAttribute(
    'data-state',
    'reviewed_content',
  )
})

test('the public page shows what the wording used to say and why it changed', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/d/${slug}`)
  const section = page.locator('#change-history')
  await expect(section).toContainText('Wording members changed')
  await expect(section).toContainText('Why people take it changed from')
  await expect(section).toContainText(PROPOSED)
  await expect(section).toContainText('Approved by 3 members')
  await expect(section).toContainText('This is the wording on the page now.')
  // Nothing private: no reviewer names, no conflict text, no qualification records.
  const text = (await section.textContent()) ?? ''
  expect(text).not.toContain('Playwright reviewer one')
  expect(text).not.toContain('None declared')
  expect(text).toContain('changes the words, not what kind of evidence')
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

test('a steward can roll the wording back, and the earlier wording returns', async ({
  browser,
}) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().steward)

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
  // The reader's answer returns to what the record says.
  const hero = (await page.locator('#substance-action').textContent()) ?? ''
  expect(hero).not.toContain(PROPOSED)
  await expect(page.locator('.dv4-review-pill')).toHaveCount(0)
  // And the wording that was rolled back stays readable, with the fact that it was rolled back.
  const history = page.locator('#change-history')
  await expect(history).toContainText(PROPOSED)
  await expect(history).toContainText('rolled back')
  await context.close()
})

test('only a steward can release a wording approved while publication was frozen', async ({
  browser,
}) => {
  /*
   * The freeze is the one switch that could strand review work: with it on, a proposal reaches
   * three approvals and nothing moves. This checks the way out exists and is not open to everybody.
   * The frozen state itself is covered in tests/unit/page-statement-flags.test.ts, because turning
   * it on needs a server restart that a browser test cannot ask for.
   */
  const { context, page } = await openAs(browser, requireMembers().reviewerOne)
  const response = await page.request.post(
    `/api/page-statements/proposals/${proposalId}/publish`,
    {},
  )
  expect([403, 409]).toContain(response.status())
  const body = await response.text()
  if (response.status() === 403) {
    expect(body).toContain('steward or an administrator')
  }
  await context.close()
})

test('an ordinary member cannot roll a wording back', async ({ browser }) => {
  const { slug } = requireFixture()
  const { context, page } = await openAs(browser, requireMembers().reviewerOne)
  const response = await page.request.post('/api/page-statements/rollback', {
    data: { slug, statementKey: 'hero.why_people_take_it', reason: 'Trying without standing.' },
  })
  expect([403, 404]).toContain(response.status())
  await context.close()
})

test('the rollback is a new event, and nothing was deleted', async ({ page }) => {
  const { slug } = requireFixture()
  await page.goto(`/review-queue?slug=${slug}`)
  const text = (await page.locator('main').textContent()) ?? ''
  // The wording that was rolled back is still readable in the review history too.
  expect(text).toContain(PROPOSED)
  // And the sentence is not locked by its past: no proposal is open against it any more.
  expect(text).not.toContain('Open proposals')
})

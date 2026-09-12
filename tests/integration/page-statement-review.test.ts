/**
 * The three-approval rule, against a real PostgreSQL instance.
 *
 * The rules this file checks are enforced in the database, not in the application, so a unit test
 * against mocked rows would prove nothing about them. Each case here is one thing a determined
 * caller might try: sign their own wording, vote twice, vote from a second account with the same
 * researcher identifier, sign a digest that has moved, or race another reviewer to the third
 * approval.
 *
 * Fixture rows only, on the disposable database the integration runner provides.
 */
import { and, eq, inArray, sql } from 'drizzle-orm'
import { beforeAll, describe, expect, it } from 'vitest'

import { db } from '@/db'
import {
  accountRestrictionEvents,
  drugs,
  pageStatementPublications,
  pageStatementPublicationEvents,
  pageStatementReviews,
  pageStatementReviewStates,
  pageStatementRevisions,
  users,
} from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import { newId } from '@/lib/ids'
import { pageStatementContentDigest } from '@/lib/page-statements/digest'
import { reviewerIdentityKey } from '@/lib/page-statements/policy'

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

const SUFFIX = Math.random().toString(36).slice(2, 10)
const MEDICINE_ID = `ps-med-${SUFFIX}`
const SLUG = `ps-medicine-${SUFFIX}`
const STATEMENT_KEY = 'hero.principal_limit' as const
const CURRENT_TEXT = 'Studies have not shown whether it prevents fractures.'
const PROPOSED_TEXT = 'Completed studies have not shown whether it prevents fractures.'

interface TestUser {
  id: string
  name: string
  orcid: string | null
}

async function makeUser(
  label: string,
  options: { trustTier?: 'new' | 'contributor' | 'trusted' | 'steward'; orcid?: string } = {},
): Promise<TestUser> {
  const id = `ps-user-${label}-${SUFFIX}`
  const name = `Reviewer ${label} ${SUFFIX}`
  await db.insert(users).values({
    id,
    email: `${id}@example.test`,
    passwordHash: await hashPassword('a-long-enough-password'),
    name,
    handle: id,
    orcid: options.orcid ?? null,
    trustTier: options.trustTier ?? 'trusted',
  })
  return { id, name, orcid: options.orcid ?? null }
}

function digestFor(text: string): string {
  return pageStatementContentDigest({
    medicineId: MEDICINE_ID,
    statementKey: STATEMENT_KEY,
    proposedText: text,
    currentText: CURRENT_TEXT,
    reason: 'Say that the studies finished.',
    changeCategory: 'plain_language_clarity',
    riskClass: 'copy_only',
    evidenceState: 'source_checked_draft',
    sources: [],
    evidencePacket: {},
  })
}

/**
 * One open proposal per sentence is a real constraint, so each case closes the previous one rather
 * than working around it. The case that checks the constraint itself skips this by calling
 * `rawInsertRevision`.
 */
async function insertRevision(authorId: string, text = PROPOSED_TEXT): Promise<string> {
  await db
    .update(pageStatementRevisions)
    .set({ status: 'withdrawn' })
    .where(
      and(
        eq(pageStatementRevisions.medicineId, MEDICINE_ID),
        eq(pageStatementRevisions.statementKey, STATEMENT_KEY),
        inArray(pageStatementRevisions.status, ['draft', 'submitted', 'open', 'changes_requested']),
      ),
    )
  return rawInsertRevision(authorId, text)
}

async function rawInsertRevision(authorId: string, text = PROPOSED_TEXT): Promise<string> {
  const id = newId('psr')
  await db.insert(pageStatementRevisions).values({
    id,
    medicineId: MEDICINE_ID,
    slug: SLUG,
    statementKey: STATEMENT_KEY,
    currentText: CURRENT_TEXT,
    proposedText: text,
    reason: 'Say that the studies finished.',
    changeCategory: 'plain_language_clarity',
    riskClass: 'copy_only',
    evidenceState: 'source_checked_draft',
    contentDigest: digestFor(text),
    sourceDigest: 'b'.repeat(64),
    authorUserId: authorId,
    status: 'open',
    submittedAt: new Date(),
  })
  await db.insert(pageStatementReviewStates).values({
    revisionId: id,
    requiredApprovals: 3,
    requiredQualifiedApprovals: 0,
  })
  return id
}

async function approve(
  revisionId: string,
  reviewer: TestUser,
  overrides: Partial<{
    decision: 'APPROVE' | 'CHANGES_REQUESTED' | 'REJECT'
    contentDigest: string
    identityKey: string
    reason: string
    conflictDeclared: boolean
  }> = {},
): Promise<void> {
  const revision = (
    await db.select().from(pageStatementRevisions).where(eq(pageStatementRevisions.id, revisionId))
  )[0]
  await db.insert(pageStatementReviews).values({
    id: newId('psrv'),
    revisionId,
    reviewerUserId: reviewer.id,
    reviewerNameSnapshot: reviewer.name,
    reviewerOrcidSnapshot: reviewer.orcid,
    reviewerIdentityKey: overrides.identityKey ?? reviewerIdentityKey(reviewer),
    reviewerTrustTierSnapshot: 'trusted',
    qualificationSnapshot: [],
    qualificationRelevant: false,
    decision: overrides.decision ?? 'APPROVE',
    checkedWording: true,
    checkedSource: true,
    checkedLimitation: true,
    conflictsOfInterest: 'None declared.',
    conflictsOfInterestAttested: true,
    conflictDeclared: overrides.conflictDeclared ?? false,
    reason: overrides.reason ?? null,
    contentDigest: overrides.contentDigest ?? revision?.contentDigest ?? digestFor(PROPOSED_TEXT),
    sourceDigest: revision?.sourceDigest ?? 'b'.repeat(64),
  })
}

/**
 * Drizzle wraps a PostgreSQL error as "Failed query: ..." and keeps the database's own message on
 * `cause`. Every rule here is raised by a trigger, so the assertion has to read the cause or it is
 * only checking that something went wrong.
 */
async function expectDatabaseRefusal(action: Promise<unknown>, pattern: RegExp): Promise<void> {
  try {
    await action
  } catch (error) {
    const cause = (error as { cause?: { message?: string } }).cause
    const message = cause?.message ?? (error as Error).message
    expect(message).toMatch(pattern)
    return
  }
  throw new Error(`expected the database to refuse this, matching ${pattern}`)
}

async function stateOf(revisionId: string) {
  const rows = await db
    .select()
    .from(pageStatementReviewStates)
    .where(eq(pageStatementReviewStates.revisionId, revisionId))
  return rows[0]
}

describe.skipIf(!runsInDisposableDatabase)('three-member review of a page statement', () => {
  let author: TestUser
  let one: TestUser
  let two: TestUser
  let three: TestUser
  let untrusted: TestUser
  let steward: TestUser

  beforeAll(async () => {
    await db.insert(drugs).values({
      id: MEDICINE_ID,
      slug: SLUG,
      name: `Fixture substance ${SUFFIX}`,
      modality: 'Small Molecule',
      approvalStatus: 'Pre-clinical / Open Source',
    })
    author = await makeUser('author')
    one = await makeUser('one')
    two = await makeUser('two')
    three = await makeUser('three')
    untrusted = await makeUser('untrusted', { trustTier: 'new' })
    steward = await makeUser('steward', { trustTier: 'steward' })
  })

  it('counts approvals up to three and no further', async () => {
    const revisionId = await insertRevision(author.id)
    expect((await stateOf(revisionId))?.status).toBe('awaiting_reviews')

    await approve(revisionId, one)
    expect((await stateOf(revisionId))?.status).toBe('awaiting_second_review')
    expect((await stateOf(revisionId))?.reviewCount).toBe(1)

    await approve(revisionId, two)
    expect((await stateOf(revisionId))?.status).toBe('awaiting_third_review')

    await approve(revisionId, three)
    const final = await stateOf(revisionId)
    expect(final?.status).toBe('approved')
    expect(final?.reviewCount).toBe(3)
    expect(final?.resolvedAt).not.toBeNull()

    const fourth = await makeUser(`fourth-${Math.random().toString(36).slice(2, 6)}`)
    await expectDatabaseRefusal(approve(revisionId, fourth), /not accepting reviews/)
  })

  it('refuses the author signing their own wording', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(approve(revisionId, author), /cannot approve their own wording/)
  })

  it('refuses a second decision from the same account', async () => {
    const revisionId = await insertRevision(author.id)
    await approve(revisionId, one)
    await expectDatabaseRefusal(
      approve(revisionId, one),
      /duplicate key|page_statement_reviews_reviewer_unique/,
    )
  })

  it('counts two accounts sharing a researcher identifier as one reviewer', async () => {
    const orcid = '0000-0002-1825-0097'
    const first = await makeUser(`orcid-a-${SUFFIX}`, { orcid })
    const second = await makeUser(`orcid-b-${SUFFIX}`, { orcid })
    const revisionId = await insertRevision(author.id)
    await approve(revisionId, first)
    await expectDatabaseRefusal(
      approve(revisionId, second),
      /duplicate key|page_statement_reviews_identity_unique/,
    )
    expect((await stateOf(revisionId))?.reviewCount).toBe(1)
  })

  it('refuses an account without reviewer standing', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(approve(revisionId, untrusted), /trusted editor, steward/)
  })

  it('refuses a restricted account', async () => {
    const restricted = await makeUser(`restricted-${SUFFIX}`)
    await db.insert(accountRestrictionEvents).values({
      id: newId('are'),
      targetUserId: restricted.id,
      actorUserId: steward.id,
      action: 'RESTRICT',
      reason: 'Repeated spam proposals.',
    })
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(approve(revisionId, restricted), /restricted account/)

    await db.insert(accountRestrictionEvents).values({
      id: newId('are'),
      targetUserId: restricted.id,
      actorUserId: steward.id,
      action: 'LIFT',
      reason: 'Appeal upheld.',
    })
    const lifted = (await db.select().from(users).where(eq(users.id, restricted.id)))[0]
    expect(lifted?.restrictedAt).toBeNull()
    await approve(revisionId, restricted)
    expect((await stateOf(revisionId))?.reviewCount).toBe(1)
  })

  it('refuses a decision bound to a digest the revision no longer carries', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(
      approve(revisionId, one, { contentDigest: 'c'.repeat(64) }),
      /exact frozen wording digest/,
    )
  })

  it('refuses a reviewer identity key the account does not resolve to', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(
      approve(revisionId, one, { identityKey: 'orcid:0000-0000-0000-0000' }),
      /identity the account resolves to/,
    )
  })

  it('stops at one request for changes rather than waiting for three', async () => {
    const revisionId = await insertRevision(author.id)
    await approve(revisionId, one)
    await approve(revisionId, two, { decision: 'CHANGES_REQUESTED', reason: 'Name the study.' })
    expect((await stateOf(revisionId))?.status).toBe('changes_requested')
    await expectDatabaseRefusal(approve(revisionId, three), /not accepting reviews/)
  })

  it('stops at one rejection, and keeps the rejected wording in the audit', async () => {
    const revisionId = await insertRevision(author.id)
    await approve(revisionId, one)
    await approve(revisionId, two)
    await approve(revisionId, three, {
      decision: 'REJECT',
      reason: 'The source says the opposite.',
    })
    expect((await stateOf(revisionId))?.status).toBe('rejected')
    const rows = await db
      .select()
      .from(pageStatementReviews)
      .where(eq(pageStatementReviews.revisionId, revisionId))
    expect(rows).toHaveLength(3)
  })

  it('does not count a decision from a reviewer who declared a conflict', async () => {
    const revisionId = await insertRevision(author.id)
    await approve(revisionId, one, { conflictDeclared: true })
    expect((await stateOf(revisionId))?.reviewCount).toBe(0)
    expect((await stateOf(revisionId))?.status).toBe('awaiting_reviews')
  })

  it('drops an approval back out of the count when it is withdrawn', async () => {
    const revisionId = await insertRevision(author.id)
    await approve(revisionId, one)
    await approve(revisionId, two)
    expect((await stateOf(revisionId))?.reviewCount).toBe(2)
    await db
      .update(pageStatementReviews)
      .set({ withdrawnAt: new Date(), withdrawnReason: 'I misread the source.' })
      .where(
        and(
          eq(pageStatementReviews.revisionId, revisionId),
          eq(pageStatementReviews.reviewerUserId, two.id),
        ),
      )
    expect((await stateOf(revisionId))?.reviewCount).toBe(1)
    expect((await stateOf(revisionId))?.status).toBe('awaiting_second_review')
  })

  it('freezes the wording once it is submitted', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(
      db
        .update(pageStatementRevisions)
        .set({ proposedText: 'Something else entirely.' })
        .where(eq(pageStatementRevisions.id, revisionId)),
      /frozen/,
    )
  })

  it('refuses a review state written by hand', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(
      db
        .update(pageStatementReviewStates)
        .set({ reviewCount: 3, status: 'approved' })
        .where(eq(pageStatementReviewStates.revisionId, revisionId)),
      /derived from immutable decisions/,
    )
  })

  it('refuses a second open proposal for the same sentence', async () => {
    const revisionId = await insertRevision(author.id)
    await expectDatabaseRefusal(
      rawInsertRevision(one.id, 'A third wording.'),
      /page_statement_revisions_one_open|duplicate key/,
    )
    await db
      .update(pageStatementRevisions)
      .set({ status: 'withdrawn' })
      .where(eq(pageStatementRevisions.id, revisionId))
  })

  it('refuses an approval that would fill the last slot without a qualified reviewer', async () => {
    const revisionId = newId('psr')
    await db.insert(pageStatementRevisions).values({
      id: revisionId,
      medicineId: MEDICINE_ID,
      slug: SLUG,
      statementKey: 'hero.where_it_acts',
      currentText: 'It acts in the liver.',
      proposedText: 'It acts in the liver and the kidney.',
      reason: 'The record names both.',
      changeCategory: 'factual_accuracy',
      riskClass: 'scientific_meaning',
      evidenceState: 'source_checked_draft',
      contentDigest: 'd'.repeat(64),
      sourceDigest: 'e'.repeat(64),
      authorUserId: author.id,
      status: 'open',
      submittedAt: new Date(),
    })
    await db.insert(pageStatementReviewStates).values({
      revisionId,
      requiredApprovals: 3,
      requiredQualifiedApprovals: 1,
    })
    const sign = async (reviewer: TestUser, qualified: boolean) => {
      await db.insert(pageStatementReviews).values({
        id: newId('psrv'),
        revisionId,
        reviewerUserId: reviewer.id,
        reviewerNameSnapshot: reviewer.name,
        reviewerOrcidSnapshot: reviewer.orcid,
        reviewerIdentityKey: reviewerIdentityKey(reviewer),
        reviewerTrustTierSnapshot: reviewer.id === steward.id ? 'steward' : 'trusted',
        qualificationSnapshot: qualified ? ['CLINICAL_PHARMACOLOGY'] : [],
        qualificationRelevant: qualified,
        decision: 'APPROVE',
        checkedWording: true,
        checkedSource: true,
        checkedLimitation: true,
        conflictsOfInterest: 'None declared.',
        conflictsOfInterestAttested: true,
        conflictDeclared: false,
        contentDigest: 'd'.repeat(64),
        sourceDigest: 'e'.repeat(64),
      })
    }
    await sign(one, false)
    await sign(two, false)
    await expectDatabaseRefusal(sign(three, false), /relevant recorded qualification/)
    await sign(three, true)
    const state = await stateOf(revisionId)
    expect(state?.status).toBe('approved')
    expect(state?.qualifiedApprovals).toBe(1)
  })

  it('keeps the publication ledger append-only', async () => {
    const revisionId = await insertRevision(author.id, 'Yet another wording for the ledger check.')
    await db.insert(pageStatementPublicationEvents).values({
      id: newId('pse'),
      medicineId: MEDICINE_ID,
      slug: SLUG,
      statementKey: STATEMENT_KEY,
      event: 'publish',
      revisionId,
      approvalsRecorded: 3,
      qualifiedApprovals: 0,
      contentDigest: 'f'.repeat(64),
    })
    await expectDatabaseRefusal(
      db.update(pageStatementPublicationEvents).set({ reason: 'edited' }),
      /append-only/,
    )
    await db
      .update(pageStatementRevisions)
      .set({ status: 'withdrawn' })
      .where(eq(pageStatementRevisions.id, revisionId))
  })

  it('refuses a publication pointer that names an unpublished revision', async () => {
    const revisionId = await insertRevision(author.id, 'A wording that is not published.')
    await expectDatabaseRefusal(
      db.insert(pageStatementPublications).values({
        medicineId: MEDICINE_ID,
        statementKey: STATEMENT_KEY,
        revisionId,
      }),
      /requires a published revision/,
    )
    await db
      .update(pageStatementRevisions)
      .set({ status: 'withdrawn' })
      .where(eq(pageStatementRevisions.id, revisionId))
  })

  it('refuses a decision on a revision that is not open', async () => {
    const revisionId = await insertRevision(author.id, 'A wording that gets withdrawn first.')
    await db
      .update(pageStatementRevisions)
      .set({ status: 'withdrawn' })
      .where(eq(pageStatementRevisions.id, revisionId))
    await expectDatabaseRefusal(approve(revisionId, one), /open for review/)
  })

  it('refuses a review row edited after the fact', async () => {
    const revisionId = await insertRevision(author.id, 'A wording for the immutability check.')
    await approve(revisionId, one)
    await expectDatabaseRefusal(
      db
        .update(pageStatementReviews)
        .set({ decision: 'REJECT' })
        .where(eq(pageStatementReviews.revisionId, revisionId)),
      /only a withdrawal/,
    )
    await db
      .update(pageStatementRevisions)
      .set({ status: 'withdrawn' })
      .where(eq(pageStatementRevisions.id, revisionId))
  })

  it('refuses an account restricting itself', async () => {
    await expectDatabaseRefusal(
      db.insert(accountRestrictionEvents).values({
        id: newId('are'),
        targetUserId: steward.id,
        actorUserId: steward.id,
        action: 'RESTRICT',
        reason: 'Trying to restrict myself.',
      }),
      /account_restriction_events_not_self/,
    )
  })

  it('refuses a review state whose qualified quota disagrees with the risk class', async () => {
    const revisionId = newId('psr')
    await db.insert(pageStatementRevisions).values({
      id: revisionId,
      medicineId: MEDICINE_ID,
      slug: SLUG,
      statementKey: 'hero.immediate_change',
      currentText: 'It binds the receptor.',
      proposedText: 'It binds the receptor and holds it open.',
      reason: 'The record says both.',
      changeCategory: 'safety_correction',
      riskClass: 'high_risk',
      evidenceState: 'source_checked_draft',
      contentDigest: '1'.repeat(64),
      sourceDigest: '2'.repeat(64),
      authorUserId: author.id,
      status: 'open',
      submittedAt: new Date(),
    })
    await expectDatabaseRefusal(
      db.insert(pageStatementReviewStates).values({
        revisionId,
        requiredApprovals: 3,
        requiredQualifiedApprovals: 0,
      }),
      /must match the revision risk class/,
    )
    await db.insert(pageStatementReviewStates).values({
      revisionId,
      requiredApprovals: 3,
      requiredQualifiedApprovals: 2,
    })
    await db
      .update(pageStatementRevisions)
      .set({ status: 'withdrawn' })
      .where(eq(pageStatementRevisions.id, revisionId))
  })

  it('serialises two approvals racing for the third slot', async () => {
    const revisionId = await insertRevision(author.id, 'A wording two reviewers race to finish.')
    await approve(revisionId, one)
    await approve(revisionId, two)
    const racerA = await makeUser(`race-a-${SUFFIX}`)
    const racerB = await makeUser(`race-b-${SUFFIX}`)
    const results = await Promise.allSettled([
      approve(revisionId, racerA),
      approve(revisionId, racerB),
    ])
    const fulfilled = results.filter((result) => result.status === 'fulfilled')
    expect(fulfilled).toHaveLength(1)
    const state = await stateOf(revisionId)
    expect(state?.reviewCount).toBe(3)
    expect(state?.status).toBe('approved')
  })

  it('locks one sentence at a time rather than the whole page', async () => {
    const held = await db.execute(
      sql`select rnawiki_lock_page_statement_subject(${MEDICINE_ID}, 'hero.opening'::page_statement_key)`,
    )
    expect(held).toBeDefined()
  })
})

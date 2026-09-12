import { randomUUID } from 'node:crypto'

import { db } from '../../../db'
import { programmeVerdictReviewerQualificationEvents, users } from '../../../db/schema'
import { hashPassword } from '../../../lib/auth'

/**
 * Accounts for the three-member review journey.
 *
 * Four members and a steward, because the rule this exercises is that the author is not one of the
 * three. One reviewer holds a recorded qualification so a change to what the evidence says can
 * reach its bar; one extra account shares the first reviewer's ORCID so the duplicate-identity rule
 * has something to refuse.
 *
 * Known-password accounts exist only on the disposable database the runner creates and drops, which
 * is why this throws anywhere else.
 */
export interface PageStatementMember {
  id: string
  email: string
  password: string
  name: string
  handle: string
}

export interface PageStatementMembers {
  author: PageStatementMember
  reviewerOne: PageStatementMember
  reviewerTwo: PageStatementMember
  reviewerThree: PageStatementMember
  /** A second account publishing under reviewerOne's researcher identifier. */
  reviewerOneDuplicate: PageStatementMember
  steward: PageStatementMember
  /** An account in good standing with no reviewer trust tier. */
  ordinary: PageStatementMember
}

const PASSWORD = 'playwright-page-statement-password'
const SHARED_ORCID = '0000-0002-1825-0097'

export async function installPageStatementMembers(): Promise<PageStatementMembers> {
  if (process.env.E2E_DISPOSABLE_DATABASE !== '1') {
    throw new Error(
      'Members with a known password may be created only on the disposable test database.',
    )
  }
  const run = randomUUID().replaceAll('-', '').slice(0, 10)
  const passwordHash = await hashPassword(PASSWORD)

  const make = (label: string, name: string): PageStatementMember => ({
    id: `ps-${label}-${run}`,
    email: `ps-${label}-${run}@example.test`,
    password: PASSWORD,
    name,
    handle: `ps-${label}-${run}`,
  })

  const members: PageStatementMembers = {
    author: make('author', 'Playwright wording author'),
    reviewerOne: make('reviewer-one', 'Playwright reviewer one'),
    reviewerTwo: make('reviewer-two', 'Playwright reviewer two'),
    reviewerThree: make('reviewer-three', 'Playwright reviewer three'),
    reviewerOneDuplicate: make('reviewer-one-duplicate', 'Playwright reviewer one again'),
    steward: make('steward', 'Playwright review steward'),
    ordinary: make('ordinary', 'Playwright ordinary member'),
  }

  await db.insert(users).values([
    { ...row(members.author, passwordHash), trustTier: 'contributor' },
    { ...row(members.reviewerOne, passwordHash), trustTier: 'trusted', orcid: SHARED_ORCID },
    { ...row(members.reviewerTwo, passwordHash), trustTier: 'trusted' },
    { ...row(members.reviewerThree, passwordHash), trustTier: 'trusted' },
    {
      ...row(members.reviewerOneDuplicate, passwordHash),
      trustTier: 'trusted',
      orcid: SHARED_ORCID,
    },
    { ...row(members.steward, passwordHash), trustTier: 'steward' },
    { ...row(members.ordinary, passwordHash), trustTier: 'new' },
  ])

  await db.insert(programmeVerdictReviewerQualificationEvents).values({
    id: `ps-qual-${run}`,
    reviewerUserId: members.reviewerThree.id,
    expertiseTag: 'CLINICAL_PHARMACOLOGY',
    action: 'GRANT',
    authorizedByUserId: members.steward.id,
    reason: 'Test-only qualification inside the disposable Playwright database.',
  })

  return members
}

function row(member: PageStatementMember, passwordHash: string) {
  return {
    id: member.id,
    email: member.email,
    passwordHash,
    name: member.name,
    handle: member.handle,
  }
}

// The contribution pipeline, end to end, against the real local Postgres in DATABASE_URL.
//
// Nothing here is mocked except the two Next.js request-scoped modules a route handler cannot run
// without: `next/headers` (the cookie store iron-session writes the session into) and `next/cache`
// (`revalidatePath`, which needs a render context that does not exist outside a request). The
// database, the deterministic engine, the trust ladder and the transaction are all the real ones —
// a pipeline test that mocked the database would prove only that the mocks agree with each other.
//
// Every row these tests create is namespaced by a per-run tag and deleted in `afterAll`.

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// `vi.hoisted` because `vi.mock`'s factory is lifted above the imports and would otherwise close
// over a binding that does not exist yet.
const { cookieJar } = vi.hoisted(() => ({ cookieJar: new Map<string, string>() }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name)
      return value === undefined ? undefined : { name, value }
    },
    set: (name: string, value: string) => {
      cookieJar.set(name, value)
    },
    delete: (name: string) => {
      cookieJar.delete(name)
    },
  }),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { drugs, revisions, users } from '@/db/schema'
import { cloneDefaultLaboratoryWorkflow } from '@/lib/dossier'
import { resetRateLimits } from '@/lib/rate-limit'
import { signIn, signOut } from '@/lib/session'
import type { DrugDossier, LaboratoryProtocolStep } from '@/lib/types'

import { POST as submitRevision } from '@/app/api/drugs/[slug]/revisions/route'
import { POST as reviewRevision } from '@/app/api/revisions/[id]/review/route'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const RUN = Math.random().toString(36).slice(2, 10)

/** A 21-mer over the legal A/U/C/G alphabet. Passes all three layers with one L3 warning. */
const VALID_SEQUENCE = 'AUGCCGAUUGCAUUCGAGUAA'

/** The same sequence with two characters that are not bases. Layer 1 rejects it. */
const ILLEGAL_SEQUENCE = 'AUGCCGAUXXZZUUCGAGUAA'

const WORKFLOW: LaboratoryProtocolStep[] = cloneDefaultLaboratoryWorkflow()

const drugIds: string[] = []
const userIds: string[] = []

interface TestUser {
  id: string
  name: string
  handle: string
}

async function makeUser(
  label: string,
  overrides: { trustTier?: 'new' | 'contributor' | 'trusted' | 'steward'; acceptedEditCount?: number } = {},
): Promise<TestUser> {
  const id = `usr_test_${RUN}_${label}`
  const handle = `test-${RUN}-${label}`
  await db.insert(users).values({
    id,
    email: `${handle}@example.test`,
    // Never used: these tests sign in through `signIn(userId)` rather than through the login
    // route, so no password is ever compared against this.
    passwordHash: 'not-a-real-hash',
    name: `Test ${label}`,
    handle,
    trustTier: overrides.trustTier ?? 'new',
    acceptedEditCount: overrides.acceptedEditCount ?? 0,
  })
  userIds.push(id)
  return { id, name: `Test ${label}`, handle }
}

async function makeDrug(label: string): Promise<{ id: string; slug: string }> {
  const id = `drg_test_${RUN}_${label}`
  const slug = `test-${RUN}-${label}`
  await db.insert(drugs).values({
    id,
    slug,
    name: `Test Oligo ${label}`,
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'Phase 3 Clinical Trial',
    dossierDepth: 'curated',
    molecularSchema: {
      structureType: 'rna_sequence',
      sequence5to3: VALID_SEQUENCE,
      isMachineVerified: false,
      laboratoryWorkflow: WORKFLOW,
    },
  })
  drugIds.push(id)
  return { id, slug }
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------

function postJson(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // A stable pair so the anonymous rate-limit fingerprint is deterministic across the run.
      'x-forwarded-for': '203.0.113.7',
      'user-agent': 'vitest-integration',
    },
    body: JSON.stringify(body),
  })
}

function slugContext(slug: string): { params: Promise<{ slug: string }> } {
  // Next.js 15 hands route handlers a promise of the params, and the handler awaits it.
  return { params: Promise.resolve({ slug }) }
}

function idContext(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

interface RevisionResponse {
  outcome?: string
  revisionId?: string
  queuePosition?: number
  error?: string
  drug?: DrugDossier
  report?: { overallPassed: boolean; errors: Array<{ code: string; message: string }> }
}

async function submit(
  slug: string,
  payload: Partial<DrugDossier>,
  summary: string,
): Promise<{ status: number; body: RevisionResponse }> {
  const res = await submitRevision(
    postJson(`http://localhost/api/drugs/${slug}/revisions`, { payload, summary }),
    slugContext(slug),
  )
  return { status: res.status, body: (await res.json()) as RevisionResponse }
}

async function acceptedEditCountOf(userId: string): Promise<number> {
  const rows = await db
    .select({ accepted: users.acceptedEditCount })
    .from(users)
    .where(eq(users.id, userId))
  return rows[0]?.accepted ?? -1
}

// ---------------------------------------------------------------------------

let newContributor: TestUser
let trustedContributor: TestUser
let reviewer: TestUser

beforeAll(async () => {
  newContributor = await makeUser('newbie')
  trustedContributor = await makeUser('trusted', { trustTier: 'trusted', acceptedEditCount: 15 })
  reviewer = await makeUser('reviewer', { trustTier: 'trusted', acceptedEditCount: 20 })
})

afterAll(async () => {
  // Drugs first: revisions cascade from the drug, and the author FK is ON DELETE SET NULL, so
  // deleting users first would leave orphaned revisions behind.
  if (drugIds.length > 0) await db.delete(drugs).where(inArray(drugs.id, drugIds))
  if (userIds.length > 0) await db.delete(users).where(inArray(users.id, userIds))
})

beforeEach(async () => {
  resetRateLimits()
  cookieJar.clear()
  await signOut()
})

describe('an edit the deterministic engine rejects', () => {
  it('returns 422, records the attempt, and never reaches the review queue', async () => {
    const drug = await makeDrug('rejected')
    await signIn(newContributor.id)

    const { status, body } = await submit(
      drug.slug,
      {
        molecularSchema: {
          structureType: 'rna_sequence',
          sequence5to3: ILLEGAL_SEQUENCE,
          isMachineVerified: false,
          laboratoryWorkflow: WORKFLOW,
        },
      },
      'Replace the guide strand sequence.',
    )

    expect(status).toBe(422)
    expect(body.outcome).toBe('machine_rejected')
    expect(body.report?.overallPassed).toBe(false)
    // The contract returns the first failing check verbatim, because that is the sentence the
    // contributor has to act on.
    expect(body.error).toContain('not part of the RNA')

    const rows = await db
      .select({ id: revisions.id, status: revisions.status, machineVerified: revisions.machineVerified })
      .from(revisions)
      .where(eq(revisions.drugId, drug.id))

    // The attempt IS recorded — the audit trail keeps rejected attempts too...
    expect(rows).toHaveLength(1)
    expect(rows[0]?.status).toBe('machine_rejected')
    expect(rows[0]?.machineVerified).toBe(false)

    // ...but it is not, and can never be, a thing a human is asked to look at.
    const queued = await db
      .select({ id: revisions.id })
      .from(revisions)
      .where(and(eq(revisions.drugId, drug.id), eq(revisions.status, 'pending_review')))
    expect(queued).toHaveLength(0)
  })

  it('rejects a trusted contributor just as hard — standing never overrides the engine', async () => {
    const drug = await makeDrug('rejected-trusted')
    await signIn(trustedContributor.id)

    const before = await acceptedEditCountOf(trustedContributor.id)
    const { status, body } = await submit(
      drug.slug,
      {
        molecularSchema: {
          structureType: 'rna_sequence',
          sequence5to3: ILLEGAL_SEQUENCE,
          isMachineVerified: false,
          laboratoryWorkflow: WORKFLOW,
        },
      },
      'Trusted editor submits a broken sequence.',
    )

    expect(status).toBe(422)
    expect(body.outcome).toBe('machine_rejected')

    const rows = await db
      .select({ sequence: drugs.molecularSchema })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(rows[0]?.sequence?.sequence5to3).toBe(VALID_SEQUENCE)
    expect(await acceptedEditCountOf(trustedContributor.id)).toBe(before)
  })
})

describe('an edit the engine passes', () => {
  it('lands in the review queue for a new contributor', async () => {
    const drug = await makeDrug('queued')
    await signIn(newContributor.id)

    const { status, body } = await submit(
      drug.slug,
      { oneSentenceVerdict: 'The endpoint was measured; the mortality claim was inferred.' },
      'Add the plain-language verdict.',
    )

    expect(status).toBe(202)
    expect(body.outcome).toBe('pending_review')
    expect(body.report?.overallPassed).toBe(true)
    expect(body.queuePosition).toBeGreaterThanOrEqual(1)

    const rows = await db
      .select({ status: revisions.status, machineVerified: revisions.machineVerified })
      .from(revisions)
      .where(eq(revisions.drugId, drug.id))
    expect(rows).toHaveLength(1)
    expect(rows[0]?.status).toBe('pending_review')
    expect(rows[0]?.machineVerified).toBe(true)

    // The record itself is untouched until a person says so.
    const drugRows = await db
      .select({ verdict: drugs.oneSentenceVerdict })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(drugRows[0]?.verdict).toBe('')
  })

  it('publishes immediately for a trusted contributor and credits the edit', async () => {
    const drug = await makeDrug('published')
    await signIn(trustedContributor.id)

    const before = await acceptedEditCountOf(trustedContributor.id)

    const { status, body } = await submit(
      drug.slug,
      { oneSentenceVerdict: 'Published straight through: the structure check passed.' },
      'Add the plain-language verdict.',
    )

    expect(status).toBe(200)
    expect(body.outcome).toBe('published')
    expect(body.drug?.oneSentenceVerdict).toBe(
      'Published straight through: the structure check passed.',
    )

    // The drug row moved in the same transaction as the revision — a published revision whose
    // drug row did not update is the corruption this test exists to catch.
    const drugRows = await db
      .select({
        verdict: drugs.oneSentenceVerdict,
        machineVerified: drugs.isMachineVerifiedStructure,
        hash: drugs.verificationHash,
        lastVerifiedAt: drugs.lastVerifiedAt,
        revisionCount: drugs.revisionCount,
      })
      .from(drugs)
      .where(eq(drugs.id, drug.id))

    expect(drugRows[0]?.verdict).toBe('Published straight through: the structure check passed.')
    // Set from the server's own sweep, never from the request body.
    expect(drugRows[0]?.machineVerified).toBe(true)
    expect(drugRows[0]?.hash).toBeTruthy()
    expect(drugRows[0]?.lastVerifiedAt).toBeInstanceOf(Date)
    expect(drugRows[0]?.revisionCount).toBe(1)

    expect(await acceptedEditCountOf(trustedContributor.id)).toBe(before + 1)
  })

  it('refuses an edit that changes nothing, so the counter cannot be farmed', async () => {
    const drug = await makeDrug('noop')
    await signIn(trustedContributor.id)

    const before = await acceptedEditCountOf(trustedContributor.id)
    const { status } = await submit(drug.slug, {}, 'Resubmit with no changes.')

    expect(status).toBe(422)
    expect(await acceptedEditCountOf(trustedContributor.id)).toBe(before)
  })
})

describe('reviewing a queued edit', () => {
  it('is idempotent: the second approval returns 409 and credits nothing twice', async () => {
    const author = await makeUser('double-review-author')
    const drug = await makeDrug('double-review')

    await signIn(author.id)
    const submitted = await submit(
      drug.slug,
      { laymanHowItWorks: 'It silences the messenger before the protein is ever made.' },
      'Explain the mechanism in plain language.',
    )
    expect(submitted.status).toBe(202)
    const revisionId = submitted.body.revisionId
    expect(revisionId).toBeTruthy()

    cookieJar.clear()
    await signIn(reviewer.id)

    const first = await reviewRevision(
      postJson(`http://localhost/api/revisions/${revisionId}/review`, { decision: 'approve' }),
      idContext(revisionId as string),
    )
    expect(first.status).toBe(200)
    expect(await acceptedEditCountOf(author.id)).toBe(1)

    const second = await reviewRevision(
      postJson(`http://localhost/api/revisions/${revisionId}/review`, { decision: 'approve' }),
      idContext(revisionId as string),
    )
    expect(second.status).toBe(409)
    expect(((await second.json()) as { error: string }).error).toBe(
      'That revision has already been reviewed',
    )

    // The count did not move a second time, and the record was not applied twice.
    expect(await acceptedEditCountOf(author.id)).toBe(1)

    const drugRows = await db
      .select({ revisionCount: drugs.revisionCount, howItWorks: drugs.laymanHowItWorks })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(drugRows[0]?.revisionCount).toBe(1)
    expect(drugRows[0]?.howItWorks).toBe(
      'It silences the messenger before the protein is ever made.',
    )
  })

  it('refuses a contributor who has not earned the standing to review', async () => {
    const author = await makeUser('unreviewable-author')
    const drug = await makeDrug('unreviewable')

    await signIn(author.id)
    const submitted = await submit(
      drug.slug,
      { laymanHowItWorks: 'A second queued edit.' },
      'Explain the mechanism in plain language.',
    )
    expect(submitted.status).toBe(202)

    cookieJar.clear()
    await signIn(newContributor.id)

    const res = await reviewRevision(
      postJson(`http://localhost/api/revisions/${submitted.body.revisionId}/review`, {
        decision: 'approve',
      }),
      idContext(submitted.body.revisionId as string),
    )
    expect(res.status).toBe(403)
  })
})

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { cookieJar } = vi.hoisted(() => ({ cookieJar: new Map<string, string>() }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name)
      return value === undefined ? undefined : { name, value }
    },
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

import { and, eq, inArray, sql } from 'drizzle-orm'

import { POST as submitRevision } from '@/app/api/drugs/[slug]/revisions/route'
import { POST as reviewRevision } from '@/app/api/revisions/[id]/review/route'
import { closeDatabasePool, db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  legacyIdentityCorrectionDetails,
  legacyRevisionQuarantines,
  revisions,
  users,
} from '@/db/schema'
import { resetRateLimits } from '@/lib/rate-limit'
import { getDrugBySlug, searchDrugs } from '@/lib/queries/drugs'
import { signIn, signOut } from '@/lib/session'
import type { DrugInsert } from '@/scripts/ingest/build-dossier'
import {
  loadDrugs,
  pruneRejectedPlaceholderMedicines,
  pruneStaleStubs,
} from '@/scripts/ingest/load'

const RUN = Math.random().toString(36).slice(2, 10)
const SOURCE_URL = 'https://www.fda.gov/drugs/synthetic-medicine-label'
const SOURCE_TITLE = 'FDA synthetic medicine label'
const EXPLANATION = 'The cited regulator page uses this exact medicine identity.'

interface TestUser {
  id: string
  name: string
  trustTier: 'new' | 'contributor' | 'trusted' | 'steward'
  acceptedEditCount: number
  rejectedEditCount: number
  isAdmin: boolean
}

interface TestDrug {
  id: string
  slug: string
  name: string
  tradeName: string | null
}

interface ApiBody {
  code?: string
  error?: string
  outcome?: string
  itemsWaiting?: number
  revisionId?: string
  revision?: {
    id: string
    status: string
    summary: string
    identityCorrection: {
      field: 'name' | 'tradeName'
      previousValue: string | null
      proposedValue: string | null
      sourceUrl: string
      sourceTitle: string
    }
  }
  drug?: { name: string; tradeName?: string | null }
}

interface CorrectionBody {
  field: 'name' | 'tradeName'
  proposedValue: string | null
  sourceUrl?: string
  sourceTitle?: string
  explanation?: string
  [key: string]: unknown
}

function postJson(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.7',
      'user-agent': 'vitest-identity-correction',
    },
    body: JSON.stringify(body),
  })
}

function slugContext(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) }
}

function idContext(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) }
}

async function makeUser(
  label: string,
  overrides: Partial<Pick<TestUser, 'trustTier' | 'isAdmin'>> = {},
): Promise<TestUser> {
  const user: TestUser = {
    id: `usr_legacy_${RUN}_${label}`,
    name: `Legacy ${label}`,
    trustTier: overrides.trustTier ?? 'new',
    acceptedEditCount: 0,
    rejectedEditCount: 0,
    isAdmin: overrides.isAdmin ?? false,
  }
  await db.insert(users).values({
    id: user.id,
    email: `${RUN}-${label}@identity-correction.test`,
    passwordHash: 'not-used-by-this-test',
    name: user.name,
    handle: `${RUN}-${label}`,
    trustTier: user.trustTier,
    isAdmin: user.isAdmin,
  })
  return user
}

async function makeDrug(
  label: string,
  values: { tradeName?: string | null } = {},
): Promise<TestDrug> {
  const drug: TestDrug = {
    id: `drg_legacy_${RUN}_${label}`,
    slug: `legacy-${RUN}-${label}`,
    name: `Legacy Medicine ${label}`,
    tradeName: values.tradeName ?? null,
  }
  await db.insert(drugs).values({
    id: drug.id,
    slug: drug.slug,
    name: drug.name,
    tradeName: drug.tradeName,
    modality: 'Small Molecule',
    approvalStatus: 'Pre-clinical / Open Source',
    dossierDepth: 'stub',
  })
  return drug
}

function ingestRowFor(
  drug: TestDrug,
  values: Partial<Pick<DrugInsert, 'name' | 'tradeName'>> = {},
): DrugInsert {
  return {
    id: drug.id,
    slug: drug.slug,
    name: values.name ?? drug.name,
    tradeName: values.tradeName === undefined ? drug.tradeName : values.tradeName,
    sponsor: 'Synthetic ingest sponsor',
    targetGene: '',
    targetProtein: '',
    modality: 'Small Molecule',
    approvalStatus: 'Pre-clinical / Open Source',
    approvalYear: null,
    indication: '',
    patientFriendlyIndication: '',
    oneSentenceVerdict: '',
    laymanHowItWorks: '',
    dossierDepth: 'stub',
    molecularSchema: null,
    sourceProvenance: ['Synthetic integration source'],
    productCount: 1,
    moiety: values.name ?? drug.name,
    saltForms: [],
    brandNames: values.tradeName ? [values.tradeName] : [],
    classificationRules: { modality: 'integration fixture', approval: 'integration fixture' },
  }
}

async function submit(
  slug: string,
  body: CorrectionBody,
): Promise<{ status: number; body: ApiBody }> {
  const response = await submitRevision(
    postJson(`http://localhost/api/drugs/${slug}/revisions`, {
      sourceUrl: SOURCE_URL,
      sourceTitle: SOURCE_TITLE,
      explanation: EXPLANATION,
      ...body,
    }),
    slugContext(slug),
  )
  return { status: response.status, body: (await response.json()) as ApiBody }
}

async function review(
  revisionId: string,
  decision: 'approve' | 'reject',
  note?: string,
): Promise<{ status: number; body: ApiBody }> {
  const response = await reviewRevision(
    postJson(`http://localhost/api/revisions/${revisionId}/review`, { decision, note }),
    idContext(revisionId),
  )
  return { status: response.status, body: (await response.json()) as ApiBody }
}

async function counters(userId: string): Promise<{ accepted: number; rejected: number }> {
  const rows = await db
    .select({ accepted: users.acceptedEditCount, rejected: users.rejectedEditCount })
    .from(users)
    .where(eq(users.id, userId))
  const row = rows[0]
  if (!row) throw new Error('Test user is missing')
  return row
}

let author: TestUser
let trustedAuthor: TestUser
let lowTierReviewer: TestUser
let trustedReviewer: TestUser
let stewardReviewer: TestUser
let adminReviewer: TestUser

const runsInDisposableDatabase = process.env.E2E_DISPOSABLE_DATABASE === '1'

describe.skipIf(!runsInDisposableDatabase)('legacy identity correction pipeline', () => {
  beforeAll(async () => {
    author = await makeUser('author')
    trustedAuthor = await makeUser('trusted-author', { trustTier: 'trusted' })
    lowTierReviewer = await makeUser('low-reviewer', { trustTier: 'contributor' })
    trustedReviewer = await makeUser('trusted-reviewer', { trustTier: 'trusted' })
    stewardReviewer = await makeUser('steward-reviewer', { trustTier: 'steward' })
    adminReviewer = await makeUser('admin-reviewer', { isAdmin: true })
  })

  afterAll(async () => {
    await closeDatabasePool()
  })

  beforeEach(async () => {
    resetRateLimits()
    cookieJar.clear()
    await signOut()
  })

  it('requires sign-in and rejects dossier, medical-evidence, credentialed, private and reserved URLs', async () => {
    const drug = await makeDrug('input-boundary')

    const signedOut = await submit(drug.slug, { field: 'name', proposedValue: 'Corrected name' })
    expect(signedOut.status).toBe(401)
    expect(signedOut.body.code).toBe('unauthenticated')

    await signIn(author.id)
    const medical = await submit(drug.slug, {
      field: 'name',
      proposedValue: 'Corrected name',
      efficacy: 'Unsupported whole-dossier edit',
    })
    expect(medical.status).toBe(422)
    expect(medical.body.code).toBe('programme_required')

    for (const sourceUrl of [
      'https://reader:secret@public.example.edu/label',
      'http://127.0.0.1/internal',
      'http://169.254.169.254/latest/meta-data',
      'http://localhost./internal',
      'https://registry.test/label',
      'http://[fec0::1]/regulator-record',
      'http://[100::1]/regulator-record',
    ]) {
      resetRateLimits()
      const result = await submit(drug.slug, {
        field: 'name',
        proposedValue: 'Corrected name',
        sourceUrl,
      })
      expect(result.status).toBe(422)
      expect(result.body.code).toBe('invalid_source_url')
    }

    const rows = await db
      .select({ id: revisions.id })
      .from(revisions)
      .where(eq(revisions.drugId, drug.id))
    expect(rows).toHaveLength(0)
  })

  it('always queues, stores one immutable sourced field and never changes trust counters', async () => {
    const drug = await makeDrug('always-queue')
    await signIn(trustedAuthor.id)
    const before = await counters(trustedAuthor.id)

    const submitted = await submit(drug.slug, {
      field: 'tradeName',
      proposedValue: 'Exact Brand Name',
    })

    expect(submitted.status).toBe(202)
    expect(submitted.body.outcome).toBe('pending_review')
    expect(submitted.body.itemsWaiting).toBeGreaterThan(0)
    expect(submitted.body.revision?.status).toBe('pending_review')
    expect(submitted.body.revision?.summary).toBe(EXPLANATION)
    expect(submitted.body.revision?.identityCorrection).toEqual({
      field: 'tradeName',
      previousValue: null,
      proposedValue: 'Exact Brand Name',
      sourceUrl: SOURCE_URL,
      sourceTitle: SOURCE_TITLE,
    })

    const medicineRows = await db
      .select({ tradeName: drugs.tradeName, revisionCount: drugs.revisionCount })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(medicineRows[0]).toEqual({ tradeName: null, revisionCount: 0 })
    expect(await counters(trustedAuthor.id)).toEqual(before)

    const revisionId = submitted.body.revisionId as string
    await expect(
      db
        .update(legacyIdentityCorrectionDetails)
        .set({ sourceTitle: 'Changed after submission' })
        .where(eq(legacyIdentityCorrectionDetails.revisionId, revisionId)),
    ).rejects.toThrow()
  })

  it('returns one pending row for concurrent identical retries under the medicine lock', async () => {
    const drug = await makeDrug('replay')
    await signIn(author.id)
    const body = { field: 'name' as const, proposedValue: 'Replay-safe medicine name' }

    const [first, second] = await Promise.all([submit(drug.slug, body), submit(drug.slug, body)])
    expect(first.status).toBe(202)
    expect(second.status).toBe(202)
    expect(first.body.revisionId).toBe(second.body.revisionId)

    const rows = await db
      .select({ id: revisions.id })
      .from(revisions)
      .where(and(eq(revisions.drugId, drug.id), eq(revisions.status, 'pending_review')))
    expect(rows).toHaveLength(1)
  })

  it('requires an independent qualified reviewer and publishes atomically exactly once', async () => {
    const drug = await makeDrug('review-boundary')
    await signIn(trustedAuthor.id)
    const authorCountersBefore = await counters(trustedAuthor.id)
    const submitted = await submit(drug.slug, {
      field: 'name',
      proposedValue: 'Reviewed Medicine Name',
    })
    const revisionId = submitted.body.revisionId as string

    const selfReview = await review(revisionId, 'approve')
    expect(selfReview.status).toBe(403)
    expect(selfReview.body.code).toBe('self_review')

    cookieJar.clear()
    await signIn(lowTierReviewer.id)
    const unqualified = await review(revisionId, 'approve')
    expect(unqualified.status).toBe(403)

    cookieJar.clear()
    await signIn(trustedReviewer.id)
    const approvalWithDiscardedNote = await review(
      revisionId,
      'approve',
      'This text must not be silently discarded.',
    )
    expect(approvalWithDiscardedNote.status).toBe(422)
    expect(approvalWithDiscardedNote.body.code).toBe('invalid_input')

    const approved = await review(revisionId, 'approve')
    expect(approved.status).toBe(200)
    expect(approved.body.revision?.status).toBe('published')
    expect(approved.body.drug?.name).toBe('Reviewed Medicine Name')

    const medicineRows = await db
      .select({
        name: drugs.name,
        slug: drugs.slug,
        revisionCount: drugs.revisionCount,
        lastEditedAt: drugs.lastEditedAt,
        updatedAt: drugs.updatedAt,
        lastEditedBy: drugs.lastEditedBy,
      })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(medicineRows[0]).toMatchObject({
      name: 'Reviewed Medicine Name',
      slug: drug.slug,
      revisionCount: 1,
      lastEditedBy: trustedAuthor.name,
    })
    expect(medicineRows[0]?.lastEditedAt).toBeInstanceOf(Date)
    expect(medicineRows[0]?.updatedAt.toISOString()).toBe(
      medicineRows[0]?.lastEditedAt?.toISOString(),
    )
    expect(await counters(trustedAuthor.id)).toEqual(authorCountersBefore)

    const secondDecision = await review(revisionId, 'approve')
    expect(secondDecision.status).toBe(409)

    await expect(
      db
        .update(revisions)
        .set({ summary: 'Mutated terminal history' })
        .where(eq(revisions.id, revisionId)),
    ).rejects.toThrow()
    await expect(db.delete(revisions).where(eq(revisions.id, revisionId))).rejects.toThrow()
  })

  it('applies an explicit trade-name removal but never treats null as omission', async () => {
    const drug = await makeDrug('trade-removal', { tradeName: 'Old Brand' })
    await signIn(author.id)
    const submitted = await submit(drug.slug, {
      field: 'tradeName',
      proposedValue: null,
    })
    expect(submitted.status).toBe(202)
    expect(submitted.body.revision?.identityCorrection.proposedValue).toBeNull()

    cookieJar.clear()
    await signIn(stewardReviewer.id)
    const approved = await review(submitted.body.revisionId as string, 'approve')
    expect(approved.status).toBe(200)

    const rows = await db
      .select({ tradeName: drugs.tradeName })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(rows[0]?.tradeName).toBeNull()
  })

  it('does not let bulk ingest overwrite either field after that field has a published correction', async () => {
    const nameDrug = await makeDrug('ingest-protected-name', { tradeName: 'Source Brand One' })
    const tradeDrug = await makeDrug('ingest-protected-trade', { tradeName: 'Earlier Brand' })

    await signIn(author.id)
    const nameProposal = await submit(nameDrug.slug, {
      field: 'name',
      proposedValue: 'Human-reviewed medicine name',
    })
    const tradeProposal = await submit(tradeDrug.slug, {
      field: 'tradeName',
      proposedValue: 'Human-reviewed Brand',
    })

    cookieJar.clear()
    await signIn(trustedReviewer.id)
    expect((await review(nameProposal.body.revisionId as string, 'approve')).status).toBe(200)
    expect((await review(tradeProposal.body.revisionId as string, 'approve')).status).toBe(200)

    const before = await db
      .select({
        id: drugs.id,
        revisionCount: drugs.revisionCount,
        lastEditedAt: drugs.lastEditedAt,
        lastEditedBy: drugs.lastEditedBy,
      })
      .from(drugs)
      .where(inArray(drugs.id, [nameDrug.id, tradeDrug.id]))

    await loadDrugs(
      [
        ingestRowFor(nameDrug, {
          name: 'Later bulk-source name',
          tradeName: 'Later Source Brand One',
        }),
        ingestRowFor(tradeDrug, {
          name: 'Later bulk-source medicine name',
          tradeName: 'Later Source Brand Two',
        }),
      ],
      { prune: false, note: 'identity-correction precedence integration test' },
    )

    const after = await db
      .select({
        id: drugs.id,
        name: drugs.name,
        tradeName: drugs.tradeName,
        revisionCount: drugs.revisionCount,
        lastEditedAt: drugs.lastEditedAt,
        lastEditedBy: drugs.lastEditedBy,
      })
      .from(drugs)
      .where(inArray(drugs.id, [nameDrug.id, tradeDrug.id]))
    const byId = new Map(after.map((row) => [row.id, row]))
    const beforeById = new Map(before.map((row) => [row.id, row]))

    expect(byId.get(nameDrug.id)).toMatchObject({
      name: 'Human-reviewed medicine name',
      tradeName: 'Later Source Brand One',
      revisionCount: 1,
      lastEditedBy: author.name,
    })
    expect(byId.get(tradeDrug.id)).toMatchObject({
      name: 'Later bulk-source medicine name',
      tradeName: 'Human-reviewed Brand',
      revisionCount: 1,
      lastEditedBy: author.name,
    })
    for (const id of [nameDrug.id, tradeDrug.id]) {
      expect(byId.get(id)?.lastEditedAt?.toISOString()).toBe(
        beforeById.get(id)?.lastEditedAt?.toISOString(),
      )
      expect(byId.get(id)?.revisionCount).toBe(beforeById.get(id)?.revisionCount)
      expect(byId.get(id)?.lastEditedBy).toBe(beforeById.get(id)?.lastEditedBy)
    }
  })

  it('prunes a stale stub without deleting a stub that has revision history', async () => {
    const protectedDrug = await makeDrug('prune-history')
    const staleDrug = await makeDrug('prune-no-history')

    await signIn(author.id)
    expect(
      (
        await submit(protectedDrug.slug, {
          field: 'name',
          proposedValue: 'Proposed protected name',
        })
      ).status,
    ).toBe(202)

    const allStubRows = await db
      .select({ slug: drugs.slug })
      .from(drugs)
      .where(eq(drugs.dossierDepth, 'stub'))
    const keepRows = allStubRows.filter(
      (row) => row.slug !== protectedDrug.slug && row.slug !== staleDrug.slug,
    )

    await pruneStaleStubs(keepRows)

    const remaining = await db
      .select({ id: drugs.id })
      .from(drugs)
      .where(inArray(drugs.id, [protectedDrug.id, staleDrug.id]))
    expect(remaining.map((row) => row.id)).toEqual([protectedDrug.id])
  })

  it('prunes a legacy placeholder even after enrichment changed it from a stub to curated', async () => {
    const placeholderId = `drg_legacy_${RUN}_placeholder`
    await db.insert(drugs).values({
      id: placeholderId,
      slug: 'tbd',
      name: 'Tbd',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
      dossierDepth: 'curated',
    })

    expect(await getDrugBySlug('tbd')).toBeNull()
    expect((await searchDrugs('tbd', 10)).some((hit) => hit.slug === 'tbd')).toBe(false)

    await pruneRejectedPlaceholderMedicines()

    const remaining = await db
      .select({ id: drugs.id })
      .from(drugs)
      .where(eq(drugs.id, placeholderId))
    expect(remaining).toEqual([])
  })

  it('blocks a stale second approval and still allows an explained decline', async () => {
    const secondAuthor = await makeUser('stale-second-author')
    const drug = await makeDrug('stale-baseline')

    await signIn(author.id)
    const first = await submit(drug.slug, {
      field: 'name',
      proposedValue: 'First reviewed identity',
    })
    cookieJar.clear()
    await signIn(secondAuthor.id)
    const second = await submit(drug.slug, {
      field: 'name',
      proposedValue: 'Second stale identity',
      sourceTitle: 'A second regulator identity page',
    })

    cookieJar.clear()
    await signIn(adminReviewer.id)
    expect((await review(first.body.revisionId as string, 'approve')).status).toBe(200)
    const stale = await review(second.body.revisionId as string, 'approve')
    expect(stale.status).toBe(422)
    expect(stale.body.code).toBe('stale_identity')

    const declined = await review(
      second.body.revisionId as string,
      'reject',
      'The medicine name changed after this proposal was submitted.',
    )
    expect(declined.status).toBe(200)
    expect(declined.body.revision?.status).toBe('rejected')

    const rows = await db.select({ name: drugs.name }).from(drugs).where(eq(drugs.id, drug.id))
    expect(rows[0]?.name).toBe('First reviewed identity')
  })

  it('requires programme-scoped contribution paths once a programme exists', async () => {
    const drug = await makeDrug('programme-boundary')
    await db.insert(developmentProgrammes).values({
      id: `prg_legacy_${RUN}`,
      drugId: drug.id,
      slug: 'identified-programme',
      title: 'Identified synthetic programme',
    })

    await signIn(author.id)
    const result = await submit(drug.slug, {
      field: 'name',
      proposedValue: 'Wrong route for this medicine',
    })
    expect(result.status).toBe(422)
    expect(result.body.code).toBe('programme_required')
  })

  it('cannot publish a pending identity correction after programme onboarding but can close it', async () => {
    const drug = await makeDrug('programme-after-submit')
    await signIn(author.id)
    const submitted = await submit(drug.slug, {
      field: 'name',
      proposedValue: 'Identity proposed before programme onboarding',
    })
    expect(submitted.status).toBe(202)

    await db.insert(developmentProgrammes).values({
      id: `prg_legacy_${RUN}_after`,
      drugId: drug.id,
      slug: 'programme-added-after-submission',
      title: 'Programme added after identity submission',
    })
    cookieJar.clear()
    await signIn(trustedReviewer.id)

    const blocked = await review(submitted.body.revisionId as string, 'approve')
    expect(blocked.status).toBe(409)
    expect(blocked.body.code).toBe('programme_required')
    const closed = await review(
      submitted.body.revisionId as string,
      'reject',
      'This medicine now has a programme-scoped contribution path.',
    )
    expect(closed.status).toBe(200)
    expect(closed.body.revision?.status).toBe('rejected')
  })

  it('enforces author, reviewer, clock and atomic-publication rules against direct SQL', async () => {
    const drug = await makeDrug('direct-sql')
    const forgedDate = new Date('1999-01-01T00:00:00.000Z')
    const revisionId = `rev_legacy_${RUN}_direct_sql`
    const detail = {
      field: 'name' as const,
      previousValue: drug.name,
      proposedValue: 'Direct SQL reviewed name',
      sourceUrl: SOURCE_URL,
      sourceTitle: SOURCE_TITLE,
    }
    const changedFields = [
      {
        field: 'name',
        label: 'Medicine name',
        before: drug.name,
        after: detail.proposedValue,
      },
    ]

    await expect(
      db.insert(revisions).values({
        id: `${revisionId}_forged_author`,
        drugId: drug.id,
        authorUserId: author.id,
        authorName: 'Forged author snapshot',
        authorTrustTier: author.trustTier,
        status: 'pending_review',
        summary: EXPLANATION,
        changedFields,
        proposedPayload: { name: detail.proposedValue },
      }),
    ).rejects.toThrow()

    const written = await db.transaction(async (tx) => {
      const revisionRows = await tx
        .insert(revisions)
        .values({
          id: revisionId,
          drugId: drug.id,
          authorUserId: author.id,
          authorName: author.name,
          authorTrustTier: author.trustTier,
          status: 'pending_review',
          summary: EXPLANATION,
          changedFields,
          proposedPayload: { name: detail.proposedValue },
          createdAt: forgedDate,
        })
        .returning({ createdAt: revisions.createdAt })
      const detailRows = await tx
        .insert(legacyIdentityCorrectionDetails)
        .values({ revisionId, ...detail, createdAt: forgedDate })
        .returning({ createdAt: legacyIdentityCorrectionDetails.createdAt })
      return { revision: revisionRows[0], detail: detailRows[0] }
    })
    expect(written.revision?.createdAt.toISOString()).not.toBe(forgedDate.toISOString())
    expect(written.detail?.createdAt.toISOString()).toBe(written.revision?.createdAt.toISOString())

    await expect(
      db
        .update(revisions)
        .set({
          status: 'published',
          reviewedAt: forgedDate,
          reviewedByUserId: author.id,
          reviewedByName: author.name,
        })
        .where(eq(revisions.id, revisionId)),
    ).rejects.toThrow()

    await expect(
      db
        .update(revisions)
        .set({
          status: 'published',
          reviewedAt: forgedDate,
          reviewedByUserId: lowTierReviewer.id,
          reviewedByName: lowTierReviewer.name,
        })
        .where(eq(revisions.id, revisionId)),
    ).rejects.toThrow()

    await expect(
      db
        .update(revisions)
        .set({
          status: 'published',
          reviewedAt: forgedDate,
          reviewedByUserId: trustedReviewer.id,
          reviewedByName: 'Forged reviewer snapshot',
        })
        .where(eq(revisions.id, revisionId)),
    ).rejects.toThrow()

    await expect(
      db
        .update(revisions)
        .set({
          status: 'published',
          reviewedAt: forgedDate,
          reviewedByUserId: trustedReviewer.id,
          reviewedByName: trustedReviewer.name,
          reviewNote: 'A decline-only note must not be smuggled into an approval.',
        })
        .where(eq(revisions.id, revisionId)),
    ).rejects.toThrow()

    const publishedRows = await db
      .update(revisions)
      .set({
        status: 'published',
        reviewedAt: forgedDate,
        reviewedByUserId: trustedReviewer.id,
        reviewedByName: trustedReviewer.name,
      })
      .where(eq(revisions.id, revisionId))
      .returning({ reviewedAt: revisions.reviewedAt })
    expect(publishedRows[0]?.reviewedAt?.toISOString()).not.toBe(forgedDate.toISOString())

    const medicineRows = await db
      .select({
        name: drugs.name,
        revisionCount: drugs.revisionCount,
        updatedAt: drugs.updatedAt,
        lastEditedAt: drugs.lastEditedAt,
      })
      .from(drugs)
      .where(eq(drugs.id, drug.id))
    expect(medicineRows[0]?.name).toBe(detail.proposedValue)
    expect(medicineRows[0]?.revisionCount).toBe(1)
    expect(medicineRows[0]?.updatedAt.toISOString()).toBe(
      publishedRows[0]?.reviewedAt?.toISOString(),
    )
    expect(medicineRows[0]?.lastEditedAt?.toISOString()).toBe(
      publishedRows[0]?.reviewedAt?.toISOString(),
    )

    const quarantineRows = await db
      .select({ revisionId: legacyRevisionQuarantines.revisionId })
      .from(legacyRevisionQuarantines)
      .where(eq(legacyRevisionQuarantines.revisionId, revisionId))
    expect(quarantineRows).toHaveLength(0)

    const publicSearch = await db.execute<{ matches: boolean }>(sql`
      SELECT search_vector @@ plainto_tsquery('english', ${detail.proposedValue}) AS matches
      FROM drugs
      WHERE id = ${drug.id}
    `)
    expect(publicSearch.rows[0]?.matches).toBe(true)
  })
})

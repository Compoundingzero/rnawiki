// docs/api-contract.md, checked against the running routes and the real local Postgres.
//
// The assertions here are mostly about what does NOT come back: a badge nobody granted, an email
// address on a public profile, a difference in wording between "no such account" and "wrong
// password". Those are the failures that never show up as a broken page.
//
// Only `next/headers` and `next/cache` are mocked — see the note at the top of
// tests/integration/revision-pipeline.test.ts.

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

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

import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { drugs, feedback, users } from '@/db/schema'
import { getContributorProfile } from '@/lib/queries/users'
import { resetRateLimits } from '@/lib/rate-limit'
import { signOut } from '@/lib/session'

import { POST as register } from '@/app/api/auth/register/route'
import { POST as login } from '@/app/api/auth/login/route'
import { POST as logout } from '@/app/api/auth/logout/route'
import { GET as me } from '@/app/api/auth/me/route'
import { POST as addNote } from '@/app/api/drugs/[slug]/notes/route'
import { POST as toggleSave } from '@/app/api/drugs/[slug]/save/route'
import { GET as savedDrugs } from '@/app/api/me/saved/route'
import { POST as sendFeedback } from '@/app/api/feedback/route'
import { GET as getDrug } from '@/app/api/drugs/[slug]/route'
import { GET as listDrugRecords } from '@/app/api/drugs/route'

// ---------------------------------------------------------------------------

const RUN = Math.random().toString(36).slice(2, 10)

const ACCOUNT_NAME = `Reader ${RUN}`
const ACCOUNT_HANDLE = `reader-${RUN}`
const ACCOUNT_EMAIL = `reader-${RUN}@example.test`
const ACCOUNT_PASSWORD = 'quiet-harbour-1987'

const drugIds: string[] = []

function postJson(url: string, body?: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.22',
      'user-agent': 'vitest-integration',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

function get(url: string): Request {
  return new Request(url, {
    headers: { 'x-forwarded-for': '198.51.100.22', 'user-agent': 'vitest-integration' },
  })
}

function slugContext(slug: string): { params: Promise<{ slug: string }> } {
  return { params: Promise.resolve({ slug }) }
}

interface PublicUserBody {
  id: string
  name: string
  email: string
  handle?: string
  trustTier?: string
  acceptedEditCount?: number
  isAdmin?: boolean
}

async function signInThroughRoute(): Promise<void> {
  const res = await login(
    postJson('http://localhost/api/auth/login', {
      email: ACCOUNT_EMAIL,
      password: ACCOUNT_PASSWORD,
    }),
  )
  expect(res.status).toBe(200)
}

let accountId = ''
let drugSlug = ''

beforeAll(async () => {
  resetRateLimits()

  // The account every test below signs into, created through the real route so the handle
  // derivation and the defaults are the ones production uses.
  const res = await register(
    postJson('http://localhost/api/auth/register', {
      name: ACCOUNT_NAME,
      email: ACCOUNT_EMAIL,
      password: ACCOUNT_PASSWORD,
      // Fields no signup may set. `signUpSchema` has no place for them, so zod strips them before
      // anything reads the body — asserted below.
      isAdmin: true,
      trustTier: 'steward',
      verificationState: 'verified',
      acceptedEditCount: 99,
    }),
  )
  expect(res.status).toBe(201)
  const body = (await res.json()) as { user: PublicUserBody }
  accountId = body.user.id

  const drugId = `drg_test_${RUN}_contract`
  drugSlug = `test-${RUN}-contract`
  await db.insert(drugs).values({
    id: drugId,
    slug: drugSlug,
    name: `Contract Test Drug ${RUN}`,
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CCO',
      isMachineVerified: true,
      laboratoryWorkflow: [
        {
          id: `protocol-${RUN}`,
          stepNumber: 1,
          phase: 'Assay_Quantification',
          name: 'Restricted assay step',
          description: 'Operational assay detail for the contract boundary.',
          reagentsAndBuffer: 'Restricted buffer recipe',
        },
      ],
    },
  })
  drugIds.push(drugId)
})

afterAll(async () => {
  // Feedback records are append-only audit rows. The integration harness drops the whole
  // disposable database, so this file must not punch a cleanup hole through that contract.
  if (drugIds.length > 0) await db.delete(drugs).where(inArray(drugs.id, drugIds))
})

beforeEach(async () => {
  resetRateLimits()
  cookieJar.clear()
  await signOut()
})

// ---------------------------------------------------------------------------

describe('POST /api/auth/register', () => {
  it('creates an account with no standing it did not earn', async () => {
    const res = await me(get('http://localhost/api/auth/me'))
    expect(res.status).toBe(200)

    const rows = await db
      .select({
        handle: users.handle,
        isAdmin: users.isAdmin,
        isDoctor: users.isDoctor,
        trustTier: users.trustTier,
        verificationState: users.verificationState,
        acceptedEditCount: users.acceptedEditCount,
      })
      .from(users)
      .where(eq(users.id, accountId))

    const row = rows[0]
    expect(row?.handle).toBe(ACCOUNT_HANDLE)
    // Every one of these was claimed in the signup body in `beforeAll` and every one of them was
    // ignored, because the schema has no field for it.
    expect(row?.isAdmin).toBe(false)
    expect(row?.isDoctor).toBe(false)
    expect(row?.trustTier).toBe('new')
    expect(row?.verificationState).toBe('none')
    expect(row?.acceptedEditCount).toBe(0)
  })

  it('refuses a duplicate email with 409 and the contract wording', async () => {
    const res = await register(
      postJson('http://localhost/api/auth/register', {
        name: 'Someone Else',
        email: ACCOUNT_EMAIL.toUpperCase(), // the unique index is on lower(email)
        password: 'another-safe-passphrase-42',
      }),
    )
    expect(res.status).toBe(409)
    expect(((await res.json()) as { error: string }).error).toBe('That email is already registered')
  })
})

describe('POST /api/auth/login', () => {
  it('answers an unknown email and a wrong password with the same 401', async () => {
    const unknown = await login(
      postJson('http://localhost/api/auth/login', {
        email: `nobody-${RUN}@example.test`,
        password: ACCOUNT_PASSWORD,
      }),
    )
    const wrongPassword = await login(
      postJson('http://localhost/api/auth/login', {
        email: ACCOUNT_EMAIL,
        password: 'definitely-not-the-password',
      }),
    )

    expect(unknown.status).toBe(401)
    expect(wrongPassword.status).toBe(401)

    const unknownBody = (await unknown.json()) as { error: string }
    const wrongBody = (await wrongPassword.json()) as { error: string }
    expect(unknownBody.error).toBe('Email or password is incorrect')
    // Identical wording, so the response cannot be read as "that address has an account here".
    expect(wrongBody.error).toBe(unknownBody.error)
  })

  it('signs in, reports the account back, and signs out again', async () => {
    await signInThroughRoute()

    const whoami = await me(get('http://localhost/api/auth/me'))
    const body = (await whoami.json()) as { user: PublicUserBody | null }
    expect(body.user?.handle).toBe(ACCOUNT_HANDLE)
    expect(body.user?.email).toBe(ACCOUNT_EMAIL)
    // The one-account payload contains no retired physician state or credential metadata.
    expect(body.user).not.toHaveProperty('isDoctor')
    expect(body.user).not.toHaveProperty('verificationState')
    expect(body.user).not.toHaveProperty('hasCredentialOnFile')
    expect(body.user).not.toHaveProperty('medicalLicenseOrNpi')

    const out = await logout(postJson('http://localhost/api/auth/logout'))
    expect(out.status).toBe(200)

    const after = await me(get('http://localhost/api/auth/me'))
    expect(((await after.json()) as { user: unknown }).user).toBeNull()
  })
})

describe('the public contributor profile', () => {
  it('never returns an email address', async () => {
    const profile = await getContributorProfile(ACCOUNT_HANDLE)
    expect(profile).not.toBeNull()
    expect(profile).not.toHaveProperty('email')
    // Belt and braces: the address does not appear anywhere in the serialised profile, so it
    // cannot arrive through a nested field either.
    expect(JSON.stringify(profile)).not.toContain(ACCOUNT_EMAIL)
    expect(profile).not.toHaveProperty('medicalLicenseOrNpi')
    expect(profile).not.toHaveProperty('medicalSpecialty')
    expect(profile).not.toHaveProperty('institution')
    expect(profile).not.toHaveProperty('isVerifiedDoctor')
    expect(profile).not.toHaveProperty('verificationNote')
  })
})

describe('writes that require an account', () => {
  it('refuses an anonymous note with the contract wording', async () => {
    const res = await addNote(
      postJson(`http://localhost/api/drugs/${drugSlug}/notes`, { content: 'Anonymous note.' }),
      slugContext(drugSlug),
    )
    expect(res.status).toBe(401)
    expect(((await res.json()) as { error: string }).error).toBe('Sign in to post a note')
  })

  it('toggles a bookmark and lists it back', async () => {
    await signInThroughRoute()

    const on = await toggleSave(
      postJson(`http://localhost/api/drugs/${drugSlug}/save`),
      slugContext(drugSlug),
    )
    expect(on.status).toBe(200)
    expect(((await on.json()) as { saved: boolean }).saved).toBe(true)

    const listed = await savedDrugs(get('http://localhost/api/me/saved'))
    const body = (await listed.json()) as { drugs: Array<{ slug: string }> }
    expect(body.drugs.map((d) => d.slug)).toContain(drugSlug)

    const off = await toggleSave(
      postJson(`http://localhost/api/drugs/${drugSlug}/save`),
      slugContext(drugSlug),
    )
    expect(((await off.json()) as { saved: boolean }).saved).toBe(false)
  })
})

describe('public reads', () => {
  it('rejects an excessive public-list offset before querying the database', async () => {
    const res = await listDrugRecords(get('http://localhost/api/drugs?offset=600001'))
    expect(res.status).toBe(422)
    expect((await res.json()) as { code: string }).toMatchObject({ code: 'invalid_input' })
  })

  it('returns 404 for a slug that names nothing', async () => {
    const res = await getDrug(
      get(`http://localhost/api/drugs/no-such-drug-${RUN}`),
      slugContext(`no-such-drug-${RUN}`),
    )
    expect(res.status).toBe(404)
    expect(((await res.json()) as { error: string }).error).toBe('No dossier with that slug')
  })

  it('does not fall back to a medicine-wide legacy record for an unknown programme selector', async () => {
    const res = await getDrug(
      get(`http://localhost/api/drugs/${drugSlug}?programme=not-a-real-programme`),
      slugContext(drugSlug),
    )
    expect(res.status).toBe(404)
    expect((await res.json()) as { code: string }).toMatchObject({
      code: 'programme_not_found',
    })
  })

  it('omits laboratory workflow for anonymous and signed-in non-steward readers', async () => {
    const anonymous = await getDrug(
      get(`http://localhost/api/drugs/${drugSlug}`),
      slugContext(drugSlug),
    )
    expect(anonymous.status).toBe(200)
    const anonymousBody = (await anonymous.json()) as {
      drug: { molecularSchema?: Record<string, unknown> }
      access: { laboratoryWorkflow: Record<string, unknown> }
      programmeDossier: { bindingState: string; selectedProgrammeId: string }
      evidenceAuthority: { scope: string; authoritativeObject: string }
      legacyMedicineRecord: unknown
    }

    expect(anonymousBody.drug.molecularSchema).not.toHaveProperty('laboratoryWorkflow')
    expect(anonymousBody.access.laboratoryWorkflow).toEqual({
      status: 'restricted',
      included: false,
      reason: 'steward_or_admin_required',
    })
    expect(JSON.stringify(anonymousBody)).not.toContain('Restricted buffer recipe')
    expect(anonymousBody.programmeDossier).toMatchObject({
      bindingState: 'legacy_record',
      selectedProgrammeId: `legacy:${drugSlug}`,
    })
    expect(anonymousBody.evidenceAuthority).toEqual({
      scope: 'legacy_medicine_record',
      authoritativeObject: 'drug',
    })
    expect(anonymousBody.legacyMedicineRecord).toBeNull()

    await signInThroughRoute()
    const signedIn = await getDrug(
      get(`http://localhost/api/drugs/${drugSlug}`),
      slugContext(drugSlug),
    )
    const signedInBody = (await signedIn.json()) as typeof anonymousBody

    expect(signedInBody.drug.molecularSchema).not.toHaveProperty('laboratoryWorkflow')
    expect(signedInBody.access.laboratoryWorkflow).toMatchObject({
      status: 'restricted',
      included: false,
    })
  })

  it('returns the recorded workflow to an authenticated steward for editor reload', async () => {
    await db.update(users).set({ trustTier: 'steward' }).where(eq(users.id, accountId))

    try {
      await signInThroughRoute()
      const res = await getDrug(
        get(`http://localhost/api/drugs/${drugSlug}`),
        slugContext(drugSlug),
      )
      expect(res.status).toBe(200)
      const body = (await res.json()) as {
        drug: { molecularSchema?: { laboratoryWorkflow?: Array<{ reagentsAndBuffer: string }> } }
        access: { laboratoryWorkflow: Record<string, unknown> }
      }

      expect(body.access.laboratoryWorkflow).toEqual({ status: 'full', included: true })
      expect(body.drug.molecularSchema?.laboratoryWorkflow).toEqual([
        expect.objectContaining({ reagentsAndBuffer: 'Restricted buffer recipe' }),
      ])
    } finally {
      await db.update(users).set({ trustTier: 'new' }).where(eq(users.id, accountId))
    }
  })
})

describe('POST /api/feedback', () => {
  it('accepts an anonymous report and stores a hash, never the IP address', async () => {
    const message = `The markup figure looks stale ${RUN}`
    const res = await sendFeedback(
      postJson('http://localhost/api/feedback', {
        type: 'correction',
        message,
        drugSlug,
      }),
    )
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ ok: true })

    const rows = await db
      .select({ sessionHash: feedback.sessionHash, userId: feedback.userId })
      .from(feedback)
      .where(eq(feedback.message, message))

    expect(rows).toHaveLength(1)
    expect(rows[0]?.userId).toBeNull()
    // A 64-character digest, and specifically not the address it was derived from.
    expect(rows[0]?.sessionHash).toMatch(/^[0-9a-f]{64}$/)
    expect(rows[0]?.sessionHash).not.toContain('198.51.100.22')
  })
})

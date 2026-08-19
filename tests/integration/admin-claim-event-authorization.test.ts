import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { getIronSession, type IronSession } from 'iron-session'
import { db } from '@/db'
import { entities, claims, evidenceSources, claimEvents, revisions, users } from '@/db/schema'
import type { SessionData, SessionUser } from '@/lib/auth'

/**
 * Role gating on claim-event mutations.
 *
 * `published` is administrator-only on a claim event for the same reason it is on a claim: the
 * event says a real treatment failed at a real step, and an editor must not be able to put that
 * statement on the public record alone. The rule is enforced in two places in
 * app/admin/(protected)/claims/actions.ts — `createClaimEvent`/`updateClaimEvent` reject the
 * transition INTO `published` for a non-administrator, and `publishClaimEvent` calls
 * `requireUser(['administrator'])` outright — so both paths are exercised here. A rule enforced
 * in one path and dropped from the other is the whole failure mode.
 *
 * tests/integration/admin-authorization.test.ts already covers `requireUser` itself in isolation.
 * This file covers the actions that call it, against the real database, so a mutation that simply
 * forgets to ask is caught: the assertions are about what is IN THE TABLE afterwards, not only
 * about which redirect fired.
 *
 * next/navigation and next/cache are mocked because a server action's `redirect()` and
 * `revalidatePath()` need a real Next request scope that does not exist under Vitest. The session
 * is faked the same way admin-authorization.test.ts fakes it, so `requireUser` runs its real
 * logic against a chosen role.
 */

class RedirectSignal extends Error {
  constructor(public readonly url: string) {
    super(`NEXT_REDIRECT ${url}`)
  }
}

vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url)
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: () => {},
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({})),
}))

vi.mock('iron-session', () => ({
  getIronSession: vi.fn(),
}))

const mockedGetIronSession = vi.mocked(getIronSession)

function actAs(user: SessionUser | null): void {
  const data: SessionData = user ? { user } : {}
  mockedGetIronSession.mockResolvedValue({
    ...data,
    save: async () => {},
    destroy: () => {},
    updateConfig: () => {},
  } as IronSession<SessionData>)
}

/** Captures the redirect a server action ends on, so the message can be asserted. */
async function runAction(action: () => Promise<void>): Promise<string> {
  try {
    await action()
  } catch (err) {
    if (err instanceof RedirectSignal) return err.url
    throw err
  }
  throw new Error('the action returned without redirecting, which no admin action should do')
}

const { createClaimEvent, updateClaimEvent, publishClaimEvent } = await import(
  '@/app/admin/(protected)/claims/actions'
)

function eventForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData()
  const values: Record<string, string> = {
    evidenceSourceId: '0',
    eventType: 'null_result',
    developmentGate: 'clinical_outcome',
    plainSummary: 'The trial measured its primary endpoint and found no difference from placebo.',
    whatItSuggests: 'The effect was not detectable at the exposure and duration studied.',
    whatItDoesNotEstablish: 'It does not establish that the treatment has no effect at all.',
    eventDate: '',
    displayPriority: '0',
    publicationStatus: 'draft',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) form.append(key, value)
  return form
}

let entityId: number | null = null
let sourceId: number | null = null
const userIds: number[] = []

let editor: SessionUser
let administrator: SessionUser
let scientificReviewer: SessionUser
let claimId: number

beforeEach(async () => {
  mockedGetIronSession.mockReset()

  const [entity] = await db
    .insert(entities)
    .values({
      canonicalName: 'Claim Event Authorization Fixture Entity',
      slug: `claim-event-auth-${randomUUID().slice(0, 8)}`,
      entityType: 'peptide',
      shortDescription: 'Fixture entity for admin-claim-event-authorization.test.ts.',
      bottomLine: 'Fixture bottom line.',
      regulatoryCategory: 'unapproved_therapeutic_substance',
      publicationStatus: 'published',
    })
    .returning()
  entityId = entity!.id

  const [claim] = await db
    .insert(claims)
    .values({
      entityId: entity!.id,
      slug: 'claim-event-auth-claim',
      claimType: 'effectiveness',
      consumerQuestion: 'Does the fixture compound do the fixture thing?',
      directAnswer: 'Fixture answer.',
      measuredFinding: 'Fixture measured finding.',
      inference: 'Fixture inference.',
      proofBoundaryStage: 'animal_evidence',
      proofBoundaryExplanation: 'Fixture explanation.',
      remainingUnknown: 'Fixture unknown.',
      evidenceNeededNext: 'Fixture evidence needed.',
      publicationStatus: 'published',
    })
    .returning()
  claimId = claim!.id

  const [source] = await db
    .insert(evidenceSources)
    .values({
      title: 'A fixture trial for admin-claim-event-authorization.test.ts',
      sourceType: 'randomized controlled trial',
    })
    .returning()
  sourceId = source!.id

  const [editorRow] = await db
    .insert(users)
    .values({
      email: `editor-${randomUUID().slice(0, 8)}@rnawiki.test`,
      name: 'Fixture Editor',
      passwordHash: 'not-a-real-hash-this-is-a-fixture',
      role: 'editor',
    })
    .returning()
  const [adminRow] = await db
    .insert(users)
    .values({
      email: `admin-${randomUUID().slice(0, 8)}@rnawiki.test`,
      name: 'Fixture Administrator',
      passwordHash: 'not-a-real-hash-this-is-a-fixture',
      role: 'administrator',
    })
    .returning()
  const [reviewerRow] = await db
    .insert(users)
    .values({
      email: `reviewer-${randomUUID().slice(0, 8)}@rnawiki.test`,
      name: 'Fixture Reviewer',
      passwordHash: 'not-a-real-hash-this-is-a-fixture',
      role: 'scientific_reviewer',
    })
    .returning()
  userIds.push(editorRow!.id, adminRow!.id, reviewerRow!.id)

  // sessionVersion comes from the inserted row: getCurrentUser re-reads it and rejects a session
  // whose value no longer matches, so a hand-written constant here would break the moment the
  // column's default changes. See tests/integration/admin-authorization.test.ts.
  editor = {
    id: editorRow!.id,
    email: editorRow!.email,
    name: editorRow!.name,
    role: 'editor',
    sessionVersion: editorRow!.sessionVersion,
  }
  administrator = {
    id: adminRow!.id,
    email: adminRow!.email,
    name: adminRow!.name,
    role: 'administrator',
    sessionVersion: adminRow!.sessionVersion,
  }
  // A REAL scientific_reviewer row, not the administrator's id with a different role written into
  // the seal. getCurrentUser reads the role from the users table now, so the old fixture asserted
  // nothing about reviewers — it exercised the administrator path and happened to pass.
  scientificReviewer = {
    id: reviewerRow!.id,
    email: reviewerRow!.email,
    name: reviewerRow!.name,
    role: 'scientific_reviewer',
    sessionVersion: reviewerRow!.sessionVersion,
  }
})

afterEach(async () => {
  // revisions.changedByUserId -> users.id has no cascade, so audit rows written by the actions
  // under test must go before their author. entities cascades to claims -> claim_events; the
  // evidence source is ON DELETE RESTRICT and can only go once its events have.
  for (const id of userIds) {
    await db.delete(revisions).where(eq(revisions.changedByUserId, id))
  }
  if (entityId !== null) {
    await db.delete(entities).where(eq(entities.id, entityId))
    entityId = null
  }
  if (sourceId !== null) {
    await db.delete(evidenceSources).where(eq(evidenceSources.id, sourceId))
    sourceId = null
  }
  while (userIds.length > 0) {
    await db.delete(users).where(eq(users.id, userIds.pop()!))
  }
  vi.clearAllMocks()
})

async function eventsForClaim() {
  return db.select().from(claimEvents).where(eq(claimEvents.claimId, claimId))
}

describe('createClaimEvent — a non-administrator cannot publish one', () => {
  it('refuses an editor saving straight to published, and writes no row at all', async () => {
    actAs(editor)

    const url = await runAction(() =>
      createClaimEvent(
        claimId,
        eventForm({ evidenceSourceId: String(sourceId), publicationStatus: 'published' })
      )
    )

    expect(decodeURIComponent(url)).toContain('Only administrators can publish')
    // The refusal must happen BEFORE the insert. A row written as a draft "for safety" would
    // still be an event the editor did not intend to leave behind.
    expect(await eventsForClaim()).toHaveLength(0)
  })

  it('lets the same editor save the same event as a draft', async () => {
    actAs(editor)

    const url = await runAction(() =>
      createClaimEvent(claimId, eventForm({ evidenceSourceId: String(sourceId) }))
    )

    expect(decodeURIComponent(url)).toContain('Claim event added')
    const rows = await eventsForClaim()
    expect(rows).toHaveLength(1)
    expect(rows[0]?.publicationStatus).toBe('draft')
  })

  it('lets an administrator publish on create', async () => {
    actAs(administrator)

    await runAction(() =>
      createClaimEvent(
        claimId,
        eventForm({ evidenceSourceId: String(sourceId), publicationStatus: 'published' })
      )
    )

    const rows = await eventsForClaim()
    expect(rows).toHaveLength(1)
    expect(rows[0]?.publicationStatus).toBe('published')
  })

  it('sends an unauthenticated caller to the login screen and writes nothing', async () => {
    actAs(null)

    const url = await runAction(() =>
      createClaimEvent(claimId, eventForm({ evidenceSourceId: String(sourceId) }))
    )

    expect(url).toBe('/admin/login')
    expect(await eventsForClaim()).toHaveLength(0)
  })

  it('refuses a scientific_reviewer, who is authenticated but not an editing role', async () => {
    actAs(scientificReviewer)

    const url = await runAction(() =>
      createClaimEvent(claimId, eventForm({ evidenceSourceId: String(sourceId) }))
    )

    expect(url).toBe('/admin/login')
    expect(await eventsForClaim()).toHaveLength(0)
  })
})

describe('updateClaimEvent — the transition INTO published is the gated step', () => {
  async function seedDraftEvent(): Promise<number> {
    const [row] = await db
      .insert(claimEvents)
      .values({
        claimId,
        evidenceSourceId: sourceId!,
        eventType: 'null_result',
        developmentGate: 'clinical_outcome',
        plainSummary: 'Draft fixture event.',
        whatItSuggests: 'Draft fixture suggestion.',
        whatItDoesNotEstablish: 'Draft fixture boundary.',
        publicationStatus: 'draft',
      })
      .returning()
    return row!.id
  }

  it('refuses an editor moving a draft event to published, and leaves the stored status alone', async () => {
    const eventId = await seedDraftEvent()
    actAs(editor)

    const url = await runAction(() =>
      updateClaimEvent(
        eventId,
        eventForm({ evidenceSourceId: String(sourceId), publicationStatus: 'published' })
      )
    )

    expect(decodeURIComponent(url)).toContain('Only administrators can publish')
    const [row] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId))
    expect(row?.publicationStatus).toBe('draft')
  })

  it('lets an editor move it to a non-published review status', async () => {
    const eventId = await seedDraftEvent()
    actAs(editor)

    await runAction(() =>
      updateClaimEvent(
        eventId,
        eventForm({ evidenceSourceId: String(sourceId), publicationStatus: 'scientific_review_required' })
      )
    )

    const [row] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId))
    expect(row?.publicationStatus).toBe('scientific_review_required')
  })

  it('lets an administrator make the same transition', async () => {
    const eventId = await seedDraftEvent()
    actAs(administrator)

    await runAction(() =>
      updateClaimEvent(
        eventId,
        eventForm({ evidenceSourceId: String(sourceId), publicationStatus: 'published' })
      )
    )

    const [row] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId))
    expect(row?.publicationStatus).toBe('published')
  })
})

describe('publishClaimEvent — administrator only, and only from approved', () => {
  async function seedApprovedEvent(): Promise<number> {
    const [row] = await db
      .insert(claimEvents)
      .values({
        claimId,
        evidenceSourceId: sourceId!,
        eventType: 'null_result',
        developmentGate: 'clinical_outcome',
        plainSummary: 'Approved fixture event.',
        whatItSuggests: 'Approved fixture suggestion.',
        whatItDoesNotEstablish: 'Approved fixture boundary.',
        publicationStatus: 'approved',
      })
      .returning()
    return row!.id
  }

  it('sends an editor to the login screen and leaves the event unpublished', async () => {
    const eventId = await seedApprovedEvent()
    actAs(editor)

    const url = await runAction(() => publishClaimEvent(eventId, new FormData()))

    expect(url).toBe('/admin/login')
    const [row] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId))
    expect(row?.publicationStatus).toBe('approved')
  })

  it('publishes for an administrator and records the transition in the audit trail', async () => {
    const eventId = await seedApprovedEvent()
    actAs(administrator)

    const url = await runAction(() => publishClaimEvent(eventId, new FormData()))
    expect(decodeURIComponent(url)).toContain('Claim event published')

    const [row] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId))
    expect(row?.publicationStatus).toBe('published')

    // Every create/update/delete/publish writes a revisions row. The audit trail is the only
    // record of who put a failure statement on a public page.
    const audit = await db.select().from(revisions).where(eq(revisions.changedByUserId, administrator.id))
    expect(audit.some((r) => r.fieldChanged === 'claim_event_publication_status')).toBe(true)
    expect(audit.some((r) => r.reviewStatusAffected)).toBe(true)
  })

  it('refuses to publish an event that has not been approved, even for an administrator', async () => {
    const [draft] = await db
      .insert(claimEvents)
      .values({
        claimId,
        evidenceSourceId: sourceId!,
        eventType: 'null_result',
        developmentGate: 'clinical_outcome',
        plainSummary: 'Draft fixture event.',
        whatItSuggests: 'Draft fixture suggestion.',
        whatItDoesNotEstablish: 'Draft fixture boundary.',
        publicationStatus: 'draft',
      })
      .returning()
    actAs(administrator)

    const url = await runAction(() => publishClaimEvent(draft!.id, new FormData()))
    expect(decodeURIComponent(url)).toContain('approved')

    const [row] = await db.select().from(claimEvents).where(eq(claimEvents.id, draft!.id))
    expect(row?.publicationStatus).toBe('draft')
  })
})

// Accounts, credentials and the public contributor profile.
//
// The line this file defends is between what an account holds and what the world may read. A
// `users` row carries an email address, a bcrypt hash and, for physicians, a medical licence or
// NPI number. The public profile page renders none of those, and it renders none of them because
// the query that backs it names its columns one by one — not because a component remembers not to
// print them.

import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { newId } from '@/lib/ids'
import { drugs, revisions, savedDrugs, users } from '@/db/schema'
import { searchHitColumns, type SearchHit } from './drugs'
import type { CommentUser, TrustTier } from '@/lib/types'

export type UserRow = typeof users.$inferSelect

/**
 * A user as the session and account screens see it: everything except the password hash. Still
 * private — it carries the email address and any licence number — so it is for the signed-in
 * person's own view and for stewards, never for a public page.
 */
export type AccountUser = Omit<UserRow, 'passwordHash'>

export type UserErrorCode =
  'email_taken' | 'handle_taken' | 'not_found' | 'not_admin' | 'not_pending'

export class UserError extends Error {
  readonly code: UserErrorCode

  constructor(code: UserErrorCode, message: string) {
    super(message)
    this.name = 'UserError'
    this.code = code
  }
}

const PG_UNIQUE_VIOLATION = '23505'

/**
 * The name of the unique index a write collided with, or null if it collided with nothing.
 *
 * Drizzle 0.44 wraps query failures in a `DrizzleQueryError` that carries no `code` of its own;
 * the pg error with `code` and `constraint` sits in `.cause`. Reading `error.code` off the thrown
 * object — the obvious version — always misses, and a duplicate signup surfaces as a 500 instead
 * of "that email is already registered". Verified against the running database. Bounded depth so
 * a cyclic `cause` cannot spin.
 */
function uniqueViolationConstraint(error: unknown): string | null {
  let current: unknown = error
  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== 'object' || current === null) return null
    const candidate = current as { code?: unknown; constraint?: unknown; cause?: unknown }
    if (candidate.code === PG_UNIQUE_VIOLATION) {
      return typeof candidate.constraint === 'string' ? candidate.constraint : ''
    }
    current = candidate.cause
  }
  return null
}

/** Every column except the hash. Written out so a new secret column cannot join a public read. */
const accountColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  handle: users.handle,
  orcid: users.orcid,
  isDoctor: users.isDoctor,
  medicalLicenseOrNpi: users.medicalLicenseOrNpi,
  medicalSpecialty: users.medicalSpecialty,
  institution: users.institution,
  verificationState: users.verificationState,
  verifiedAt: users.verifiedAt,
  verificationNote: users.verificationNote,
  trustTier: users.trustTier,
  acceptedEditCount: users.acceptedEditCount,
  rejectedEditCount: users.rejectedEditCount,
  noteCount: users.noteCount,
  isAdmin: users.isAdmin,
  createdAt: users.createdAt,
}

// ---------------------------------------------------------------------------
// Create and fetch
// ---------------------------------------------------------------------------

export interface CreateUserInput {
  email: string
  /**
   * Already hashed. Hashing policy — the algorithm and the cost factor — belongs to lib/auth.ts,
   * and a data-access layer that accepted a plaintext password would be a second place where that
   * decision could be made differently.
   */
  passwordHash: string
  name: string
  handle: string
  orcid?: string | null
  /** A self-declared claim. It grants nothing on its own; `verificationState` decides the badge. */
  isDoctor?: boolean
  /** Only the admin bootstrap script passes this. No signup path may. */
  isAdmin?: boolean
  id?: string
}

export async function createUser(input: CreateUserInput): Promise<AccountUser> {
  try {
    const inserted = await db
      .insert(users)
      .values({
        id: input.id ?? newId('usr'),
        email: input.email.trim(),
        passwordHash: input.passwordHash,
        name: input.name.trim(),
        handle: input.handle.trim(),
        orcid: input.orcid ?? null,
        isDoctor: input.isDoctor ?? false,
        isAdmin: input.isAdmin ?? false,
      })
      .returning(accountColumns)

    const row = inserted[0]
    if (!row) throw new UserError('not_found', 'The account could not be written.')
    return row
  } catch (error) {
    const constraint = uniqueViolationConstraint(error)
    if (constraint !== null) {
      // Both indexes are on lower(column), so the clash is case-insensitive and the message has
      // to say so — "that email is taken" for a different capitalisation reads as a lie otherwise.
      if (constraint.includes('handle')) {
        throw new UserError('handle_taken', 'That handle is already in use.')
      }
      throw new UserError('email_taken', 'An account already exists for that email address.')
    }
    throw error
  }
}

/**
 * The login path's lookup, and the ONLY function here that returns the password hash. Anything
 * that is not comparing a submitted password should call `getUserById`.
 *
 * Matches on `lower(email)`, which is the expression the unique index is built on, so the lookup
 * is an index scan and a capitalised address cannot register a second account.
 */
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = lower(${email.trim()})`)
    .limit(1)
  return rows[0] ?? null
}

export async function getUserById(id: string): Promise<AccountUser | null> {
  const rows = await db.select(accountColumns).from(users).where(eq(users.id, id)).limit(1)
  return rows[0] ?? null
}

/** Handle lookup for account tooling. The PUBLIC profile page uses `getContributorProfile`. */
export async function getUserByHandle(handle: string): Promise<AccountUser | null> {
  const rows = await db
    .select(accountColumns)
    .from(users)
    .where(sql`lower(${users.handle}) = lower(${handle.trim()})`)
    .limit(1)
  return rows[0] ?? null
}

/** Maps an account to the shape the signed-in user's own account panel renders. */
export function toCommentUser(user: AccountUser): CommentUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    // `verificationState === 'verified'`, NEVER `user.isDoctor`. The is_doctor column records
    // only that somebody ticked a box and typed a licence number; if it drove the badge, the blue
    // check would be self-service. lib/session.ts makes the same choice for the same reason, and
    // this mapper had it wrong -- an unused export today is an accidental caller tomorrow.
    isDoctor: user.verificationState === 'verified',
    hasCredentialOnFile: Boolean(user.medicalLicenseOrNpi),
    medicalSpecialty: user.medicalSpecialty ?? undefined,
    institution: user.institution ?? undefined,
    verifiedAt: user.verifiedAt?.toISOString(),
    handle: user.handle,
    orcid: user.orcid ?? undefined,
    trustTier: user.trustTier,
    verificationState: user.verificationState,
    acceptedEditCount: user.acceptedEditCount,
    noteCount: user.noteCount,
    isAdmin: user.isAdmin,
    joinedDate: user.createdAt.toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Public contributor profile
// ---------------------------------------------------------------------------

export interface ContributorContribution {
  revisionId: string
  drugName: string
  drugSlug: string
  summary: string
  createdAt: string
}

/**
 * Everything /u/[handle] may show, and nothing else.
 *
 * Absent on purpose, permanently: `email`, `passwordHash`, `medicalLicenseOrNpi`,
 * `verificationNote`, `rejectedEditCount`. The first three are private data belonging to the
 * account holder; the verification note is a steward's internal remark; the rejected count is a
 * public scoreboard of someone's failures that serves no reader. If a future page needs one of
 * these, it needs a different function and a reason.
 */
export interface ContributorProfile {
  handle: string
  name: string
  joinedDate: string
  trustTier: TrustTier
  isVerifiedDoctor: boolean
  medicalSpecialty?: string
  institution?: string
  orcid?: string
  acceptedEditCount: number
  noteCount: number
  recentContributions: ContributorContribution[]
}

const RECENT_CONTRIBUTION_LIMIT = 20

export async function getContributorProfile(handle: string): Promise<ContributorProfile | null> {
  // The counts are recomputed from the rows rather than read from users.accepted_edit_count and
  // users.note_count. Those columns exist so the trust tier can be derived without a join, but a
  // profile page states a fact about a public list, and the honest source of that number is the
  // list itself.
  const rows = await db
    .select({
      id: users.id,
      handle: users.handle,
      name: users.name,
      createdAt: users.createdAt,
      trustTier: users.trustTier,
      isDoctor: users.isDoctor,
      verificationState: users.verificationState,
      medicalSpecialty: users.medicalSpecialty,
      institution: users.institution,
      orcid: users.orcid,
      // Table and column names are written out instead of interpolated as Drizzle column objects.
      // Inside a SELECT list Drizzle renders an interpolated column WITHOUT its table qualifier,
      // so `${revisions.authorUserId} = ${users.id}` comes out as `author_user_id = id`, both
      // names bind to `revisions` inside the subquery, the correlation is never true and the count
      // is silently zero on every profile — a wrong number with no error to notice it by. Spelled
      // out, the correlation to the outer `users` row is explicit. (Elsewhere — WHERE clauses, SET
      // fragments — Drizzle does qualify; this trap is specific to the select list.)
      acceptedEditCount: sql<number>`(
        select count(*) from revisions
        where revisions.author_user_id = users.id and revisions.status = 'published'
      )`.mapWith(Number),
      noteCount: sql<number>`(
        select count(*) from community_notes
        where community_notes.author_user_id = users.id and community_notes.status = 'published'
      )`.mapWith(Number),
    })
    .from(users)
    .where(sql`lower(${users.handle}) = lower(${handle.trim()})`)
    .limit(1)

  const user = rows[0]
  if (!user) return null

  const contributions = await db
    .select({
      revisionId: revisions.id,
      drugName: drugs.name,
      drugSlug: drugs.slug,
      summary: revisions.summary,
      createdAt: revisions.createdAt,
    })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .where(and(eq(revisions.authorUserId, user.id), eq(revisions.status, 'published')))
    .orderBy(desc(revisions.createdAt), desc(revisions.id))
    .limit(RECENT_CONTRIBUTION_LIMIT)

  const isVerifiedDoctor = user.isDoctor && user.verificationState === 'verified'

  return {
    handle: user.handle,
    name: user.name,
    joinedDate: user.createdAt.toISOString(),
    trustTier: user.trustTier,
    isVerifiedDoctor,
    // Credentials are shown only alongside a verified state. An unverified claim of a specialty
    // is not a credential, and printing it next to a name is how a reader mistakes one for one.
    medicalSpecialty: isVerifiedDoctor ? (user.medicalSpecialty ?? undefined) : undefined,
    institution: isVerifiedDoctor ? (user.institution ?? undefined) : undefined,
    orcid: user.orcid ?? undefined,
    acceptedEditCount: user.acceptedEditCount,
    noteCount: user.noteCount,
    recentContributions: contributions.map((c) => ({
      revisionId: c.revisionId,
      drugName: c.drugName,
      drugSlug: c.drugSlug,
      summary: c.summary,
      createdAt: c.createdAt.toISOString(),
    })),
  }
}

// ---------------------------------------------------------------------------
// Physician verification
// ---------------------------------------------------------------------------

export interface DoctorVerificationPayload {
  medicalLicenseOrNpi: string
  medicalSpecialty: string
  institution?: string
}

/**
 * Files a physician verification claim. The state written here is the literal `'pending'`, there
 * is no parameter that could make it anything else, and the function does not read the current
 * state to decide — so no argument, in any combination, reaches `'verified'` through this path.
 * `approveVerification` is the only function in the codebase that writes that value, and it
 * requires an administrator.
 *
 * Re-filing while already verified drops back to pending and clears `verifiedAt`. That is the safe
 * direction: changed credentials are unreviewed credentials, and the badge should not outlive the
 * claim it was granted for.
 */
export async function submitDoctorVerification(
  userId: string,
  payload: DoctorVerificationPayload,
): Promise<AccountUser> {
  const updated = await db
    .update(users)
    .set({
      isDoctor: true,
      medicalLicenseOrNpi: payload.medicalLicenseOrNpi.trim(),
      medicalSpecialty: payload.medicalSpecialty.trim(),
      institution: payload.institution?.trim() ?? null,
      verificationState: 'pending',
      verifiedAt: null,
      verificationNote: null,
    })
    .where(eq(users.id, userId))
    .returning(accountColumns)

  const row = updated[0]
  if (!row) throw new UserError('not_found', 'No account matches this id.')
  return row
}

/**
 * The steward's queue. This is the one read in the codebase that returns a licence number, because
 * checking it against a registry is the entire job. It must never reach a public page.
 *
 * Ordered by account age: the schema records no separate "submitted at" timestamp, so there is no
 * honest submission order to sort by, and inventing one from `verified_at` would be backwards.
 */
export interface PendingVerification {
  userId: string
  name: string
  handle: string
  email: string
  medicalLicenseOrNpi: string | null
  medicalSpecialty: string | null
  institution: string | null
  orcid: string | null
  joinedAt: string
}

export async function listPendingVerifications(): Promise<PendingVerification[]> {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      handle: users.handle,
      email: users.email,
      medicalLicenseOrNpi: users.medicalLicenseOrNpi,
      medicalSpecialty: users.medicalSpecialty,
      institution: users.institution,
      orcid: users.orcid,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.verificationState, 'pending'))
    .orderBy(users.createdAt, users.id)

  return rows.map(({ createdAt, ...row }) => ({ ...row, joinedAt: createdAt.toISOString() }))
}

/** Confirms the actor is an administrator. Routes check this too; a write this consequential
 *  should not depend on every future caller remembering to. */
async function assertAdmin(adminId: string): Promise<{ id: string; handle: string }> {
  const rows = await db
    .select({ id: users.id, handle: users.handle, isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, adminId))
    .limit(1)
  const admin = rows[0]
  if (!admin || !admin.isAdmin) {
    throw new UserError('not_admin', 'Only an administrator can decide a verification.')
  }
  return { id: admin.id, handle: admin.handle }
}

/**
 * Grants the physician badge. The only writer of `verificationState: 'verified'` in the codebase.
 *
 * Requires the account to be in `pending`: a badge follows a claim that was filed and checked, so
 * there is no path from `none` straight to verified even for an administrator.
 */
export async function approveVerification(userId: string, adminId: string): Promise<AccountUser> {
  const admin = await assertAdmin(adminId)

  const updated = await db
    .update(users)
    .set({
      verificationState: 'verified',
      verifiedAt: new Date(),
      // The schema has no approver column, so the note carries the audit trail. Keep the handle:
      // an internal id in a review note is a trail nobody can follow.
      verificationNote: `Approved by @${admin.handle}`,
    })
    .where(and(eq(users.id, userId), eq(users.verificationState, 'pending')))
    .returning(accountColumns)

  const row = updated[0]
  if (!row) {
    throw new UserError('not_pending', 'That account has no verification waiting for a decision.')
  }
  return row
}

export async function rejectVerification(
  userId: string,
  adminId: string,
  note: string,
): Promise<AccountUser> {
  const admin = await assertAdmin(adminId)

  const updated = await db
    .update(users)
    .set({
      verificationState: 'rejected',
      verifiedAt: null,
      verificationNote: `${note.trim()} — @${admin.handle}`,
    })
    .where(and(eq(users.id, userId), eq(users.verificationState, 'pending')))
    .returning(accountColumns)

  const row = updated[0]
  if (!row) {
    throw new UserError('not_pending', 'That account has no verification waiting for a decision.')
  }
  return row
}

// ---------------------------------------------------------------------------
// Saved drugs
// ---------------------------------------------------------------------------

/** Adds or removes a bookmark. Returns the state the row is in afterwards, for the button label. */
export async function toggleSavedDrug(userId: string, drugId: string): Promise<{ saved: boolean }> {
  return db.transaction(async (tx) => {
    const removed = await tx
      .delete(savedDrugs)
      .where(and(eq(savedDrugs.userId, userId), eq(savedDrugs.drugId, drugId)))
      .returning({ drugId: savedDrugs.drugId })

    if (removed.length > 0) return { saved: false }

    // The (user_id, drug_id) primary key makes a double-click a no-op rather than a duplicate.
    await tx.insert(savedDrugs).values({ userId, drugId }).onConflictDoNothing()
    return { saved: true }
  })
}

/** A reader's bookmarks, most recently saved first. Lean rows — this is a list of links. */
export async function listSavedDrugs(userId: string): Promise<SearchHit[]> {
  return db
    .select(searchHitColumns)
    .from(savedDrugs)
    .innerJoin(drugs, eq(savedDrugs.drugId, drugs.id))
    .where(eq(savedDrugs.userId, userId))
    .orderBy(desc(savedDrugs.createdAt), drugs.name)
}

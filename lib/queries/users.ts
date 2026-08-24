// Accounts, credentials and the public contributor profile.
//
// The line this file defends is between what an account holds and what the world may read. A
// `users` row carries an email address, a bcrypt hash and, for physicians, a medical licence or
// NPI number. The public profile page renders none of those, and it renders none of them because
// the query that backs it names its columns one by one — not because a component remembers not to
// print them.

import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '@/db'
import { newId } from '@/lib/ids'
import {
  developmentProgrammes,
  drugs,
  physicianVerificationRequests,
  programmeContributionProposals,
  programmeContributionReviewStates,
  savedDrugs,
  users,
} from '@/db/schema'
import { canManageInternalReview } from '@/lib/internal-review-policy'
import {
  cleanPublicSearchHitRows,
  publicMedicineFilter,
  publicSearchHitReadColumns,
  type SearchHit,
} from './drugs'
import { bindPublicSearchSummaries } from './public-search-hit-projection'
import type { CommentUser, TrustTier } from '@/lib/types'

export type UserRow = typeof users.$inferSelect

/**
 * A user as the session and account screens see it: everything except the password hash. Still
 * private — it carries the email address and any licence number — so it is for the signed-in
 * person's own view and for stewards, never for a public page.
 */
export type AccountUser = Omit<UserRow, 'passwordHash'>

export type UserErrorCode =
  | 'email_taken'
  | 'handle_taken'
  | 'not_found'
  | 'not_authorized'
  | 'not_pending'
  | 'verification_pending'
  | 'self_review'
  | 'invalid_decision'

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
  // The accepted counter is maintained by a database transition trigger from normalized
  // contribution review states. Legacy spelling edits do not enter this metric, and the count has
  // no effect on trust tier or scientific-review qualification.
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
      acceptedEditCount: users.acceptedEditCount,
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
      revisionId: programmeContributionProposals.id,
      proposalType: programmeContributionProposals.proposalType,
      drugName: drugs.name,
      drugSlug: drugs.slug,
      programmeTitle: developmentProgrammes.title,
      createdAt: programmeContributionReviewStates.resolvedAt,
    })
    .from(programmeContributionProposals)
    .innerJoin(
      programmeContributionReviewStates,
      eq(programmeContributionReviewStates.proposalId, programmeContributionProposals.id),
    )
    .innerJoin(
      developmentProgrammes,
      eq(programmeContributionProposals.programmeId, developmentProgrammes.id),
    )
    .innerJoin(drugs, eq(developmentProgrammes.drugId, drugs.id))
    .where(
      and(
        eq(programmeContributionProposals.authorUserId, user.id),
        eq(programmeContributionReviewStates.status, 'ACCEPTED_FOR_IMPLEMENTATION'),
        publicMedicineFilter,
      ),
    )
    .orderBy(
      desc(programmeContributionReviewStates.resolvedAt),
      desc(programmeContributionProposals.id),
    )
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
      summary:
        c.proposalType === 'SOURCE_REFRESH'
          ? `Submitted updated registry facts for ${c.programmeTitle}; reviewers accepted them for implementation.`
          : c.proposalType === 'VERDICT_CHALLENGE'
            ? `Challenged the published conclusion for ${c.programmeTitle}; reviewers accepted the challenge for implementation.`
            : `Proposed a correction to ${c.programmeTitle}; reviewers accepted it for implementation.`,
      createdAt: c.createdAt?.toISOString() ?? user.createdAt.toISOString(),
    })),
  }
}

// ---------------------------------------------------------------------------
// Physician verification
// ---------------------------------------------------------------------------

export interface DoctorVerificationPayload {
  professionalFullName: string
  workEmail: string
  medicalLicenseOrNpi: string
  medicalSpecialty: string
  institution: string
}

export interface DoctorVerificationSubmission {
  requestId: string
  submittedAt: string
  account: AccountUser
}

/**
 * File an immutable credential snapshot and remove any earlier badge while the new claim waits.
 * A second submission cannot overwrite a pending request. A previously decided request remains in
 * the audit trail when updated credentials are submitted later.
 */
export async function submitDoctorVerification(
  userId: string,
  payload: DoctorVerificationPayload,
): Promise<DoctorVerificationSubmission> {
  return db.transaction(async (tx) => {
    const accounts = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .for('update')
    if (!accounts[0]) throw new UserError('not_found', 'No account matches this id.')

    const pending = await tx
      .select({ id: physicianVerificationRequests.id })
      .from(physicianVerificationRequests)
      .where(
        and(
          eq(physicianVerificationRequests.userId, userId),
          eq(physicianVerificationRequests.status, 'pending'),
        ),
      )
      .limit(1)
    if (pending[0]) {
      throw new UserError(
        'verification_pending',
        'Your previous credential submission is still waiting for review.',
      )
    }

    const requestId = newId('verify')
    const inserted = await tx
      .insert(physicianVerificationRequests)
      .values({
        id: requestId,
        userId,
        professionalFullName: payload.professionalFullName.trim(),
        workEmail: payload.workEmail.trim(),
        medicalLicenseOrNpi: payload.medicalLicenseOrNpi.trim(),
        medicalSpecialty: payload.medicalSpecialty.trim(),
        institution: payload.institution.trim(),
        status: 'pending',
      })
      .returning({ submittedAt: physicianVerificationRequests.submittedAt })

    // The database trigger derives the account-facing state from this immutable request. Read the
    // result back instead of maintaining a second application-owned version of the same state.
    const updated = await tx.select(accountColumns).from(users).where(eq(users.id, userId)).limit(1)

    const account = updated[0]
    const request = inserted[0]
    if (!account || !request) throw new UserError('not_found', 'The request could not be written.')
    return { requestId, submittedAt: request.submittedAt.toISOString(), account }
  })
}

export type VerificationQueueStatus = 'pending' | 'decided'

export interface PhysicianVerificationQueueItem {
  id: string
  professionalFullName: string
  medicalSpecialty: string
  institution: string
  status: 'pending' | 'verified' | 'rejected'
  submittedAt: string
  decidedAt: string | null
  account: { name: string; handle: string }
}

/** Private queue projection: intentionally excludes workplace email, licence and decision note. */
export async function listPhysicianVerificationRequests(input: {
  status: VerificationQueueStatus
  limit: number
}): Promise<PhysicianVerificationQueueItem[]> {
  const rows = await db
    .select({
      id: physicianVerificationRequests.id,
      professionalFullName: physicianVerificationRequests.professionalFullName,
      medicalSpecialty: physicianVerificationRequests.medicalSpecialty,
      institution: physicianVerificationRequests.institution,
      status: physicianVerificationRequests.status,
      submittedAt: physicianVerificationRequests.submittedAt,
      decidedAt: physicianVerificationRequests.decidedAt,
      name: users.name,
      handle: users.handle,
    })
    .from(physicianVerificationRequests)
    .innerJoin(users, eq(physicianVerificationRequests.userId, users.id))
    .where(
      input.status === 'pending'
        ? eq(physicianVerificationRequests.status, 'pending')
        : inArray(physicianVerificationRequests.status, ['verified', 'rejected']),
    )
    .orderBy(desc(physicianVerificationRequests.submittedAt), physicianVerificationRequests.id)
    .limit(Math.max(1, Math.min(100, Math.trunc(input.limit))))

  return rows.map((row) => ({
    id: row.id,
    professionalFullName: row.professionalFullName,
    medicalSpecialty: row.medicalSpecialty,
    institution: row.institution,
    status: row.status as PhysicianVerificationQueueItem['status'],
    submittedAt: row.submittedAt.toISOString(),
    decidedAt: row.decidedAt?.toISOString() ?? null,
    account: { name: row.name, handle: row.handle },
  }))
}

export interface PhysicianVerificationDetail extends PhysicianVerificationQueueItem {
  workEmail: string
  medicalLicenseOrNpi: string
  decisionReason: string | null
  account: { name: string; handle: string; orcid: string | null }
  decidedBy: { name: string; handle: string } | null
}

export async function getPhysicianVerificationRequest(
  requestId: string,
): Promise<PhysicianVerificationDetail | null> {
  const rows = await db
    .select({
      id: physicianVerificationRequests.id,
      userId: physicianVerificationRequests.userId,
      professionalFullName: physicianVerificationRequests.professionalFullName,
      workEmail: physicianVerificationRequests.workEmail,
      medicalLicenseOrNpi: physicianVerificationRequests.medicalLicenseOrNpi,
      medicalSpecialty: physicianVerificationRequests.medicalSpecialty,
      institution: physicianVerificationRequests.institution,
      status: physicianVerificationRequests.status,
      submittedAt: physicianVerificationRequests.submittedAt,
      decidedAt: physicianVerificationRequests.decidedAt,
      decidedByUserId: physicianVerificationRequests.decidedByUserId,
      decisionReason: physicianVerificationRequests.decisionReason,
      name: users.name,
      handle: users.handle,
      orcid: users.orcid,
    })
    .from(physicianVerificationRequests)
    .innerJoin(users, eq(physicianVerificationRequests.userId, users.id))
    .where(eq(physicianVerificationRequests.id, requestId))
    .limit(1)
  const row = rows[0]
  if (!row) return null

  const deciders = row.decidedByUserId
    ? await db
        .select({ name: users.name, handle: users.handle })
        .from(users)
        .where(eq(users.id, row.decidedByUserId))
        .limit(1)
    : []

  return {
    id: row.id,
    professionalFullName: row.professionalFullName,
    workEmail: row.workEmail,
    medicalLicenseOrNpi: row.medicalLicenseOrNpi,
    medicalSpecialty: row.medicalSpecialty,
    institution: row.institution,
    status: row.status as PhysicianVerificationDetail['status'],
    submittedAt: row.submittedAt.toISOString(),
    decidedAt: row.decidedAt?.toISOString() ?? null,
    decisionReason: row.decisionReason,
    account: { name: row.name, handle: row.handle, orcid: row.orcid },
    decidedBy: deciders[0] ?? null,
  }
}

/**
 * Decide one immutable credential request. The database transition trigger independently checks
 * the actor's current role, self-review, status transition, reason and server timestamp so direct
 * SQL and route callers cannot apply different policy.
 */
export async function decidePhysicianVerification(input: {
  requestId: string
  actorUserId: string
  decision: 'APPROVE' | 'REJECT'
  reason: string
}): Promise<PhysicianVerificationDetail> {
  const reason = input.reason.trim()
  if (reason.length < 8 || reason.length > 2000) {
    throw new UserError(
      'invalid_decision',
      'A decision reason of 8 to 2,000 characters is required.',
    )
  }

  await db.transaction(async (tx) => {
    const actors = await tx
      .select({ id: users.id, trustTier: users.trustTier, isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, input.actorUserId))
      .limit(1)
    const actor = actors[0]
    if (!actor || !canManageInternalReview(actor)) {
      throw new UserError(
        'not_authorized',
        'Only a steward or administrator can decide physician credentials.',
      )
    }

    const requests = await tx
      .select({ userId: physicianVerificationRequests.userId })
      .from(physicianVerificationRequests)
      .where(eq(physicianVerificationRequests.id, input.requestId))
      .limit(1)
      .for('update')
    const request = requests[0]
    if (!request) throw new UserError('not_found', 'No credential request matches this id.')
    if (request.userId === actor.id) {
      throw new UserError('self_review', 'You cannot decide your own credential request.')
    }

    const decided = await tx
      .update(physicianVerificationRequests)
      .set({
        status: input.decision === 'APPROVE' ? 'verified' : 'rejected',
        decidedByUserId: actor.id,
        decisionReason: reason,
      })
      .where(
        and(
          eq(physicianVerificationRequests.id, input.requestId),
          eq(physicianVerificationRequests.status, 'pending'),
        ),
      )
      .returning({
        userId: physicianVerificationRequests.userId,
        status: physicianVerificationRequests.status,
        decidedAt: physicianVerificationRequests.decidedAt,
        medicalLicenseOrNpi: physicianVerificationRequests.medicalLicenseOrNpi,
        medicalSpecialty: physicianVerificationRequests.medicalSpecialty,
        institution: physicianVerificationRequests.institution,
      })
    const result = decided[0]
    if (!result || !result.decidedAt) {
      throw new UserError('not_pending', 'That credential request already has a decision.')
    }

    // The request transition trigger synchronizes the account row in the same transaction. Keeping
    // that derivation in one place prevents route and direct-SQL paths from drifting.
  })

  const detail = await getPhysicianVerificationRequest(input.requestId)
  if (!detail) throw new UserError('not_found', 'No credential request matches this id.')
  return detail
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
  const hits = await db
    .select(publicSearchHitReadColumns)
    .from(savedDrugs)
    .innerJoin(drugs, eq(savedDrugs.drugId, drugs.id))
    .where(and(eq(savedDrugs.userId, userId), publicMedicineFilter))
    .orderBy(desc(savedDrugs.createdAt), drugs.name)
  return bindPublicSearchSummaries(cleanPublicSearchHitRows(hits))
}

// Community notes: the reader-visible discussion attached to a dossier.
//
// The rule that shapes this file is that a note's credentials are a snapshot, taken from the user
// row at the moment of writing and never again. A physician who later loses verification does not
// retroactively un-sign the note they wrote while verified, and — far more importantly — a client
// that posts `isVerifiedDoctor: true` in its JSON body cannot mint an MD badge. The flag is read
// from `users.verificationState === 'verified'` inside the same transaction as the insert.

import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { newId } from '@/lib/ids'
import { communityNotes, noteUpvotes, users } from '@/db/schema'
import type { CommunityNote } from '@/lib/types'

/** Longest note the form accepts. Beyond this it is an article, and it belongs in a revision. */
export const NOTE_MAX_LENGTH = 4000

export type NoteErrorCode =
  'content_empty' | 'content_too_long' | 'author_not_found' | 'drug_not_found' | 'note_not_found'

/** A typed failure so a route can map a cause to a status code without parsing message strings. */
export class NoteError extends Error {
  readonly code: NoteErrorCode

  constructor(code: NoteErrorCode, message: string) {
    super(message)
    this.name = 'NoteError'
    this.code = code
  }
}

/** Postgres foreign-key violation. Used to tell "no such drug" from a genuine database fault. */
const PG_FOREIGN_KEY_VIOLATION = '23503'

/**
 * Finds the driver's error inside whatever Drizzle threw.
 *
 * Drizzle 0.44 wraps every query failure in a `DrizzleQueryError` whose own `code` is undefined
 * and whose `cause` is the pg error carrying `code` and `constraint`. Testing `error.code`
 * directly — the obvious way to write this — matches nothing, so every constraint violation would
 * escape as a 500 instead of the "no such drug" the contributor needs to read. Verified against
 * the running database, not assumed. The chain is walked with a depth bound so a self-referencing
 * `cause` cannot spin.
 */
function isPgError(error: unknown, code: string): boolean {
  let current: unknown = error
  for (let depth = 0; depth < 5; depth += 1) {
    if (typeof current !== 'object' || current === null) return false
    const candidate = current as { code?: unknown; cause?: unknown }
    if (candidate.code === code) return true
    current = candidate.cause
  }
  return false
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

const noteColumns = {
  id: communityNotes.id,
  authorUserId: communityNotes.authorUserId,
  authorName: communityNotes.authorName,
  role: communityNotes.role,
  isVerifiedDoctor: communityNotes.isVerifiedDoctor,
  medicalSpecialty: communityNotes.medicalSpecialty,
  institution: communityNotes.institution,
  orcid: communityNotes.orcid,
  content: communityNotes.content,
  upvotes: communityNotes.upvotes,
  createdAt: communityNotes.createdAt,
}

/** Exactly the columns `noteColumns` selects, with the table's own nullability. */
type NoteRow = Pick<typeof communityNotes.$inferSelect, keyof typeof noteColumns>

function toCommunityNote(row: NoteRow, hasUpvoted: boolean): CommunityNote {
  return {
    id: row.id,
    author: row.authorName,
    role: row.role,
    isVerifiedDoctor: row.isVerifiedDoctor,
    medicalSpecialty: row.medicalSpecialty ?? undefined,
    institution: row.institution ?? undefined,
    // A badge follows stored physician verification, never sign-in alone.
    verifiedBadge: row.isVerifiedDoctor ? 'Verified physician' : undefined,
    // ISO 8601, not a pre-formatted "3 days ago": the server does not know the reader's locale or
    // timezone, and a cached page would freeze a relative string at render time.
    date: row.createdAt.toISOString(),
    content: row.content,
    upvotes: row.upvotes,
    authorUserId: row.authorUserId ?? undefined,
    hasUpvoted,
    orcid: row.orcid ?? undefined,
  }
}

/**
 * Published notes for a drug, newest first, with the viewer's own upvote resolved in the same
 * statement. The LEFT JOIN is restricted to the viewer's rows, so a matched row means "this
 * viewer upvoted this note" and the join cannot multiply the result set.
 *
 * When there is no viewer the join predicate compares against the empty string, which no user id
 * can be (`createUser` mints one through `newId`), so every row is unmatched and `hasUpvoted` is
 * false. One code path, one query, whether or not anyone is signed in.
 *
 * The upvoter's id is selected as a column and tested in JavaScript rather than as
 * `sql`${noteUpvotes.userId} is not null`` — inside a select list Drizzle renders an interpolated
 * column WITHOUT its table qualifier, so that fragment becomes a bare `user_id` that only resolves
 * to the right table for as long as `community_notes` has no column by that name. Selecting the
 * column object makes Drizzle qualify it.
 */
export async function listNotesForDrug(
  drugId: string,
  viewerUserId?: string,
): Promise<CommunityNote[]> {
  const rows = await db
    .select({
      ...noteColumns,
      viewerUpvoteUserId: noteUpvotes.userId,
      // The author's CURRENT verification state, joined live.
      //
      // The snapshot columns on the note are the right default: a note keeps the credentials it
      // was signed with, so an author who later changes specialty does not silently rewrite what
      // hundreds of old notes claim. But revocation is different. If a steward withdraws
      // verification -- because the licence lapsed, or because it was never real -- every note that
      // account ever posted would otherwise keep displaying "MD ✓" for ever, and those are exactly
      // the notes the revocation was meant to stop vouching for.
      //
      // So the badge needs BOTH: the snapshot says this note was signed as a physician, and the
      // live column says the account still is one. A null author (deleted account) fails the
      // second test, which is the right answer too.
      authorVerificationState: users.verificationState,
    })
    .from(communityNotes)
    .leftJoin(
      noteUpvotes,
      and(eq(noteUpvotes.noteId, communityNotes.id), eq(noteUpvotes.userId, viewerUserId ?? '')),
    )
    .leftJoin(users, eq(users.id, communityNotes.authorUserId))
    .where(and(eq(communityNotes.drugId, drugId), eq(communityNotes.status, 'published')))
    .orderBy(desc(communityNotes.createdAt), desc(communityNotes.id))

  return rows.map(({ viewerUpvoteUserId, authorVerificationState, ...row }) =>
    toCommunityNote(
      { ...row, isVerifiedDoctor: row.isVerifiedDoctor && authorVerificationState === 'verified' },
      viewerUpvoteUserId !== null,
    ),
  )
}

/** Notes written by one contributor, newest first. Backs the public profile page. */
export async function listNotesByUser(userId: string, limit: number): Promise<CommunityNote[]> {
  const rows = await db
    .select(noteColumns)
    .from(communityNotes)
    .where(and(eq(communityNotes.authorUserId, userId), eq(communityNotes.status, 'published')))
    .orderBy(desc(communityNotes.createdAt), desc(communityNotes.id))
    .limit(Math.max(1, Math.trunc(limit)))

  return rows.map((row) => toCommunityNote(row, false))
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export interface CreateNoteInput {
  drugId: string
  /**
   * The signed-in user's id. Named `author` because that is what it is, but note that it is an
   * id and not a display name: every credential on the resulting note is copied from this row,
   * so there is nothing a caller can pass that would forge one.
   */
  author: string
  content: string
  /** Optional role label from the form. Ignored in favour of the specialty for verified doctors. */
  role?: string
  /** Explicit id, for a deterministic seed. Otherwise generated. */
  id?: string
}

export async function createNote(input: CreateNoteInput): Promise<CommunityNote> {
  const content = input.content.trim()
  if (content.length === 0) {
    throw new NoteError('content_empty', 'A note needs some text.')
  }
  if (content.length > NOTE_MAX_LENGTH) {
    throw new NoteError(
      'content_too_long',
      `A note is limited to ${NOTE_MAX_LENGTH} characters; this one is ${content.length}.`,
    )
  }

  return db.transaction(async (tx) => {
    const authorRows = await tx
      .select({
        id: users.id,
        name: users.name,
        isDoctor: users.isDoctor,
        verificationState: users.verificationState,
        medicalSpecialty: users.medicalSpecialty,
        institution: users.institution,
        orcid: users.orcid,
      })
      .from(users)
      .where(eq(users.id, input.author))
      .limit(1)

    const author = authorRows[0]
    if (!author) {
      throw new NoteError('author_not_found', 'No account matches this note author.')
    }

    // The one place the MD badge is decided. `isDoctor` alone is a self-declaration; only a
    // steward-approved verification state counts.
    const isVerifiedDoctor = author.isDoctor && author.verificationState === 'verified'
    const role = isVerifiedDoctor
      ? (author.medicalSpecialty ?? 'Physician')
      : input.role?.trim() || 'Community Contributor'

    let inserted: NoteRow | undefined
    try {
      const insertedRows = await tx
        .insert(communityNotes)
        .values({
          id: input.id ?? newId('note'),
          drugId: input.drugId,
          authorUserId: author.id,
          authorName: author.name,
          role,
          isVerifiedDoctor,
          // The snapshot carries the credentials only when they were verified at write time.
          medicalSpecialty: isVerifiedDoctor ? author.medicalSpecialty : null,
          institution: isVerifiedDoctor ? author.institution : null,
          orcid: author.orcid,
          content,
        })
        .returning(noteColumns)
      inserted = insertedRows[0]
    } catch (error) {
      if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) {
        throw new NoteError('drug_not_found', 'No drug matches this note.')
      }
      throw error
    }

    if (!inserted) {
      throw new NoteError('drug_not_found', 'The note could not be written.')
    }

    await tx
      .update(users)
      .set({ noteCount: sql`${users.noteCount} + 1` })
      .where(eq(users.id, author.id))

    return toCommunityNote(inserted, false)
  })
}

export interface ToggleUpvoteResult {
  upvoted: boolean
  upvotes: number
}

/**
 * Adds or removes one person's upvote and recomputes the stored total from the rows.
 *
 * Recomputes rather than increments, on purpose. `upvotes = upvotes + 1` is correct only if every
 * insert is matched by exactly one increment forever; one failed request between the two
 * statements, one retry, one row deleted by a cascade when an account closes, and the number on
 * the page is permanently wrong with nothing to compare it against. `count(*)` over the rows that
 * define it cannot drift.
 */
export async function toggleUpvote(noteId: string, userId: string): Promise<ToggleUpvoteResult> {
  return db.transaction(async (tx) => {
    const noteRows = await tx
      .select({ id: communityNotes.id })
      .from(communityNotes)
      .where(eq(communityNotes.id, noteId))
      .limit(1)
    if (!noteRows[0]) {
      throw new NoteError('note_not_found', 'No note matches this id.')
    }

    const removed = await tx
      .delete(noteUpvotes)
      .where(and(eq(noteUpvotes.noteId, noteId), eq(noteUpvotes.userId, userId)))
      .returning({ noteId: noteUpvotes.noteId })

    const upvoted = removed.length === 0
    if (upvoted) {
      try {
        await tx
          .insert(noteUpvotes)
          .values({ noteId, userId })
          // The (note_id, user_id) primary key already makes a second upvote a no-op; this keeps
          // a double-submitted form from surfacing as a 500.
          .onConflictDoNothing()
      } catch (error) {
        if (isPgError(error, PG_FOREIGN_KEY_VIOLATION)) {
          throw new NoteError('author_not_found', 'No account matches this upvote.')
        }
        throw error
      }
    }

    // Unlike a select list, an UPDATE ... SET fragment does render interpolated columns fully
    // qualified (`"note_upvotes"."note_id"`), so the correlation here is unambiguous. Checked
    // against the generated SQL rather than assumed.
    const updated = await tx
      .update(communityNotes)
      .set({
        upvotes: sql`(select count(*)::int from ${noteUpvotes} where ${noteUpvotes.noteId} = ${noteId})`,
      })
      .where(eq(communityNotes.id, noteId))
      .returning({ upvotes: communityNotes.upvotes })

    return { upvoted, upvotes: updated[0]?.upvotes ?? 0 }
  })
}

/** Moderation: hides a note without destroying it, so the decision stays auditable. */
export async function setNoteStatus(
  noteId: string,
  status: 'published' | 'hidden' | 'flagged',
): Promise<void> {
  await db.update(communityNotes).set({ status }).where(eq(communityNotes.id, noteId))
}

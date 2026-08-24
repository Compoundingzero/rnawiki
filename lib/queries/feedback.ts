// The floating Feedback button's storage.
//
// A reader who spots a wrong number is the cheapest correction this project will ever get, so the
// write path stays open to people who are not signed in. `sessionHash` is what makes that
// survivable: a coarse fingerprint for rate limiting and de-duplication. It is a hash, computed
// upstream, and the raw IP address it was derived from is never passed to this file and never
// stored anywhere.

import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { newId } from '@/lib/ids'
import { feedback, users } from '@/db/schema'
import { canManageInternalReview } from '@/lib/internal-review-policy'
import type { FeedbackSubmission } from '@/lib/types'

export const FEEDBACK_MAX_LENGTH = 4000

export type FeedbackErrorCode =
  | 'message_empty'
  | 'message_too_long'
  | 'not_found'
  | 'not_authorized'
  | 'already_resolved'
  | 'invalid_resolution'

export class FeedbackError extends Error {
  readonly code: FeedbackErrorCode

  constructor(code: FeedbackErrorCode, message: string) {
    super(message)
    this.name = 'FeedbackError'
    this.code = code
  }
}

export type FeedbackType = FeedbackSubmission['type']

export interface CreateFeedbackInput {
  type: FeedbackType
  message: string
  email?: string | null
  /** The record the reader was looking at, when they were looking at one. */
  drugSlug?: string | null
  userId?: string | null
  /** Anonymous fingerprint from lib/session-hash. Never an IP address. */
  sessionHash?: string | null
  id?: string
}

/** Private moderation view. The abuse-control session hash is deliberately absent. */
export interface FeedbackRecord extends FeedbackSubmission {
  userId: string | null
  account: { name: string; handle: string } | null
  resolved: boolean
  resolvedAt: string | null
  resolutionNote: string | null
  resolvedBy: { name: string; handle: string } | null
}

const feedbackColumns = {
  id: feedback.id,
  type: feedback.type,
  message: feedback.message,
  email: feedback.email,
  drugSlug: feedback.drugSlug,
  userId: feedback.userId,
  resolved: feedback.resolved,
  resolvedAt: feedback.resolvedAt,
  resolvedByUserId: feedback.resolvedByUserId,
  resolutionNote: feedback.resolutionNote,
  createdAt: feedback.createdAt,
}

type FeedbackRow = Pick<typeof feedback.$inferSelect, keyof typeof feedbackColumns>

function toRecord(
  row: FeedbackRow,
  accounts: ReadonlyMap<string, { name: string; handle: string }>,
): FeedbackRecord {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    email: row.email ?? undefined,
    drugSlug: row.drugSlug ?? undefined,
    createdAt: row.createdAt.toISOString(),
    userId: row.userId,
    account: row.userId ? (accounts.get(row.userId) ?? null) : null,
    resolved: row.resolved,
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolutionNote: row.resolutionNote,
    resolvedBy: row.resolvedByUserId ? (accounts.get(row.resolvedByUserId) ?? null) : null,
  }
}

async function attachFeedbackAccounts(rows: FeedbackRow[]): Promise<FeedbackRecord[]> {
  const accountIds = Array.from(
    new Set(
      rows
        .flatMap((row) => [row.userId, row.resolvedByUserId])
        .filter((id): id is string => Boolean(id)),
    ),
  )
  const accountRows =
    accountIds.length > 0
      ? await db
          .select({ id: users.id, name: users.name, handle: users.handle })
          .from(users)
          .where(inArray(users.id, accountIds))
      : []
  const accounts = new Map(accountRows.map(({ id, ...account }) => [id, account]))
  return rows.map((row) => toRecord(row, accounts))
}

export async function createFeedback(input: CreateFeedbackInput): Promise<FeedbackSubmission> {
  const message = input.message.trim()
  if (message.length === 0) {
    throw new FeedbackError('message_empty', 'Feedback needs a message.')
  }
  if (message.length > FEEDBACK_MAX_LENGTH) {
    throw new FeedbackError(
      'message_too_long',
      `Feedback is limited to ${FEEDBACK_MAX_LENGTH} characters; this is ${message.length}.`,
    )
  }

  const email = input.email?.trim()

  const inserted = await db
    .insert(feedback)
    .values({
      id: input.id ?? newId('fb'),
      type: input.type,
      message,
      // Empty string and "not given" are the same thing to a person and should be the same thing
      // in the column, or the admin queue grows rows that look like a contactable reporter.
      email: email && email.length > 0 ? email : null,
      drugSlug: input.drugSlug ?? null,
      userId: input.userId ?? null,
      sessionHash: input.sessionHash ?? null,
    })
    .returning(feedbackColumns)

  const row = inserted[0]
  if (!row) throw new FeedbackError('not_found', 'The feedback could not be written.')

  // The public return is the submission only. The reader gets back what they sent, not the
  // moderation state attached to it.
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    email: row.email ?? undefined,
    drugSlug: row.drugSlug ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * The steward/admin queue. It may carry a reporter's optional contact address, so it is never a
 * public route. The stored abuse-control hash is not part of this projection.
 */
export async function listFeedback(opts: {
  resolved?: boolean
  limit: number
}): Promise<FeedbackRecord[]> {
  const rows = await db
    .select(feedbackColumns)
    .from(feedback)
    .where(opts.resolved === undefined ? undefined : eq(feedback.resolved, opts.resolved))
    .orderBy(desc(feedback.createdAt), desc(feedback.id))
    .limit(Math.max(1, Math.trunc(opts.limit)))

  return attachFeedbackAccounts(rows)
}

/**
 * Resolve one report once. PostgreSQL independently owns the timestamp, verifies the current
 * steward/admin role and rejects mutation or deletion after resolution.
 */
export async function resolveFeedback(input: {
  id: string
  actorUserId: string
  note: string
}): Promise<FeedbackRecord> {
  const note = input.note.trim()
  if (note.length < 8 || note.length > 2000) {
    throw new FeedbackError(
      'invalid_resolution',
      'A resolution note of 8 to 2,000 characters is required.',
    )
  }

  const row = await db.transaction(async (tx) => {
    const actors = await tx
      .select({ id: users.id, isAdmin: users.isAdmin, trustTier: users.trustTier })
      .from(users)
      .where(eq(users.id, input.actorUserId))
      .limit(1)
    const actor = actors[0]
    if (!actor || !canManageInternalReview(actor)) {
      throw new FeedbackError(
        'not_authorized',
        'Only a steward or administrator can resolve feedback.',
      )
    }

    const existing = await tx
      .select({ id: feedback.id, resolved: feedback.resolved })
      .from(feedback)
      .where(eq(feedback.id, input.id))
      .limit(1)
      .for('update')
    if (!existing[0]) throw new FeedbackError('not_found', 'No feedback matches this id.')
    if (existing[0].resolved) {
      throw new FeedbackError('already_resolved', 'That feedback has already been resolved.')
    }

    const updated = await tx
      .update(feedback)
      .set({
        resolved: true,
        resolvedByUserId: actor.id,
        resolutionNote: note,
      })
      .where(eq(feedback.id, input.id))
      .returning(feedbackColumns)
    const result = updated[0]
    if (!result) throw new FeedbackError('not_found', 'No feedback matches this id.')
    return result
  })

  const [record] = await attachFeedbackAccounts([row])
  if (!record) throw new FeedbackError('not_found', 'No feedback matches this id.')
  return record
}

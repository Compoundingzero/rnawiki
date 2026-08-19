// The floating Feedback button's storage.
//
// A reader who spots a wrong number is the cheapest correction this project will ever get, so the
// write path stays open to people who are not signed in. `sessionHash` is what makes that
// survivable: a coarse fingerprint for rate limiting and de-duplication. It is a hash, computed
// upstream, and the raw IP address it was derived from is never passed to this file and never
// stored anywhere.

import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { newId } from '@/lib/ids'
import { feedback } from '@/db/schema'
import type { FeedbackSubmission } from '@/lib/types'

export const FEEDBACK_MAX_LENGTH = 4000

export type FeedbackErrorCode = 'message_empty' | 'message_too_long' | 'not_found'

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

/** The admin queue's view: the submission plus who sent it and whether it has been dealt with. */
export interface FeedbackRecord extends FeedbackSubmission {
  userId: string | null
  sessionHash: string | null
  resolved: boolean
}

const feedbackColumns = {
  id: feedback.id,
  type: feedback.type,
  message: feedback.message,
  email: feedback.email,
  drugSlug: feedback.drugSlug,
  userId: feedback.userId,
  sessionHash: feedback.sessionHash,
  resolved: feedback.resolved,
  createdAt: feedback.createdAt,
}

type FeedbackRow = Pick<typeof feedback.$inferSelect, keyof typeof feedbackColumns>

function toRecord(row: FeedbackRow): FeedbackRecord {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    email: row.email ?? undefined,
    drugSlug: row.drugSlug ?? undefined,
    createdAt: row.createdAt.toISOString(),
    userId: row.userId,
    sessionHash: row.sessionHash,
    resolved: row.resolved,
  }
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
  const record = toRecord(row)
  return {
    id: record.id,
    type: record.type,
    message: record.message,
    email: record.email,
    drugSlug: record.drugSlug,
    createdAt: record.createdAt,
  }
}

/**
 * The admin queue. Carries the reporter's email address and session hash, so it is an
 * authenticated-admin read only — never a public route.
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

  return rows.map(toRecord)
}

/** Marks one item handled. Returns false when no such item exists, rather than pretending. */
export async function markFeedbackResolved(id: string): Promise<boolean> {
  const updated = await db
    .update(feedback)
    .set({ resolved: true })
    .where(eq(feedback.id, id))
    .returning({ id: feedback.id })
  return updated.length > 0
}

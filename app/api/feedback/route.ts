// POST /api/feedback — the floating Feedback button.
//
// Open to readers who are not signed in, on purpose: someone who spots a wrong number is the
// cheapest correction this project will ever get, and a sign-in wall in front of that is a wall in
// front of the corrections. What makes it survivable is `sessionHash` — a coarse, salted,
// daily-rotating fingerprint. The raw IP address is never stored, never logged and never leaves
// `lib/session-hash.ts`.
//
// The rate limit is deliberately tight (5 per hour). Nobody has five useful reports an hour.

import { z } from 'zod'
import {
  createFeedback,
  FeedbackError,
  FEEDBACK_MAX_LENGTH,
  listFeedback,
} from '@/lib/queries/feedback'
import { requestSessionHash } from '@/lib/session-hash'
import { getCurrentUser, requireInternalReviewer } from '@/lib/session'
import { FEEDBACK, PUBLIC_API } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * HTML forms post an untouched optional field as `''` rather than omitting it, and an empty string
 * would fail `.email()` and block a report whose sender simply did not want to be contacted.
 */
function blankToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value
}

const bodySchema = z.object({
  type: z.enum(['suggestion', 'correction', 'request']),
  message: z
    .string()
    .trim()
    .min(1, 'Feedback needs a message.')
    .max(FEEDBACK_MAX_LENGTH, `Feedback is limited to ${FEEDBACK_MAX_LENGTH} characters.`),
  email: z.preprocess(blankToUndefined, z.string().trim().email().max(320).optional()),
  drugSlug: z.preprocess(blankToUndefined, z.string().trim().max(128).optional()),
})

const listQuerySchema = z.object({
  status: z.enum(['open', 'resolved']).default('open'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const GET = withHandler(async (req: Request) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, actor.id))
  if (limited) return limited

  const url = new URL(req.url)
  const input = listQuerySchema.parse({
    status: url.searchParams.get('status') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  })
  const items = await listFeedback({
    resolved: input.status === 'resolved',
    limit: input.limit,
  })
  return ok({ items })
})

export const POST = withHandler(async (req: Request) => {
  const user = await getCurrentUser()

  // Keyed on the account when there is one and on the day-scoped anonymous fingerprint otherwise.
  // Neither branch ever sees a raw IP: `rateLimitKey` hashes it through `requestSessionHash`.
  const limited = rateLimited(FEEDBACK, rateLimitKey(req, user?.id))
  if (limited) return limited

  const input = bodySchema.parse(await readJson(req))

  try {
    await createFeedback({
      type: input.type,
      message: input.message,
      email: input.email ?? null,
      drugSlug: input.drugSlug ?? null,
      userId: user?.id ?? null,
      // Stored so a flood can be traced to one source for a day and then becomes unlinkable.
      sessionHash: requestSessionHash(req.headers),
    })
  } catch (error) {
    if (error instanceof FeedbackError) {
      throw new ApiError(422, error.message, error.code)
    }
    throw error
  }

  // The submission itself is not echoed back. A reader gets confirmation, not a receipt carrying
  // the moderation state attached to what they sent.
  return ok({ ok: true as const }, 201)
})

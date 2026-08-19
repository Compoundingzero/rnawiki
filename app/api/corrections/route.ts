import { NextResponse } from 'next/server'
import { z } from 'zod'
import { and, desc, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { claims, correctionSubmissions, entities } from '@/db/schema'
import { MAX_POSTGRES_INT } from '@/lib/public-ids'
import { currentDaySalt, makeSessionHash } from '@/lib/session-hash'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { CORRECTION_CATEGORIES } from '@/app/(public)/corrections/categories'

// This endpoint has exactly one job: append a row to the correction_submissions moderation
// queue. It must never touch entities, claims, or any other content table — corrections are
// reviewed and applied by an editor by hand, never auto-applied from a public submission.

export const runtime = 'nodejs' // needs node:crypto (via lib/session-hash) and the pg pool

const MAX_SUBMISSIONS_PER_SESSION_PER_DAY = 8
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const correctionSchema = z.object({
  category: z.enum(CORRECTION_CATEGORIES),
  message: z
    .string()
    .trim()
    .min(10, 'Please add a bit more detail — a sentence or two is enough.')
    .max(4000, 'That message is too long — please keep it under 4000 characters.'),
  proposedSource: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  // Bounded to the int4 range the columns actually are. Without the upper bound a value like
  // 99999999999 passed validation, reached the insert, and came back to the caller as a 500 from
  // `value "99999999999" is out of range for type integer`.
  entityId: z.number().int().positive().max(MAX_POSTGRES_INT).optional(),
  claimId: z.number().int().positive().max(MAX_POSTGRES_INT).optional(),
})

/**
 * Resolve the optional context ids to published rows, or to null.
 *
 * TWO DEFECTS IN ONE PLACE, and the fix for the second constrains the fix for the first.
 *
 * These ids went straight into the insert with no existence check. `correction_submissions` has
 * real foreign keys, so an unknown id raised a constraint violation inside the try block and came
 * back as a 500 — while every other invalid input on this endpoint correctly returns 400, and the
 * sibling /api/comprehension route already looks its id up before using it.
 *
 * The bigger problem is what that 500 told the caller. A 200 meant "this id exists" and a 500 meant
 * "it does not", so walking the integer space enumerated the entities and claims tables — and
 * because a foreign key checks existence, not publication, an unpublished draft answered 200 too.
 * app/api/v1/entities/[slug]/route.ts states the opposite guarantee in as many words: "'Doesn't
 * exist' and 'exists but isn't published' are deliberately indistinguishable to callers (both are a
 * plain 404) so this endpoint can never be used to detect unpublished content."
 *
 * So an id that does not resolve to a PUBLISHED row is stored as null and the submission is
 * accepted exactly as it would have been otherwise: same status, same body, same row. A wrong id
 * costs an editor a little context on one report, which is the right price for a response that
 * tells an enumerator nothing. Returning 400 here would have fixed the status code and kept the
 * oracle. The public form only ever sends ids resolved server-side from published rows
 * (app/(public)/corrections/page.tsx), so no real reader path is affected.
 */
async function resolvePublishedContext(entityId?: number, claimId?: number) {
  const [entityRow] = entityId
    ? await db
        .select({ id: entities.id })
        .from(entities)
        .where(and(eq(entities.id, entityId), eq(entities.publicationStatus, 'published')))
        .limit(1)
    : []
  const [claimRow] = claimId
    ? await db
        .select({ id: claims.id })
        .from(claims)
        .where(and(eq(claims.id, claimId), eq(claims.publicationStatus, 'published')))
        .limit(1)
    : []
  return { entityId: entityRow?.id ?? null, claimId: claimRow?.id ?? null }
}

// Per-minute volume limit, keyed on IP, IN ADDITION TO the per-day session cap below.
//
// The day cap alone was not a control: it keyed on a session hash that mixed in the caller's own
// User-Agent, so rotating one header bought a fresh 8-per-day budget. Twelve submissions with a
// fixed User-Agent gave nine 200s and three 429s; the same twelve with the header rotated gave
// twelve 200s and twelve rows, each up to 6KB, straight into the human moderation queue where they
// bury real reader reports. The hash no longer takes the header (lib/session-hash.ts) and the
// limiter no longer trusts the first X-Forwarded-For hop (lib/rate-limit.ts), so neither header is
// a lever any more.
const MAX_SUBMISSIONS_PER_MINUTE = 5

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  if (!checkRateLimit(`POST /api/corrections:${ip}`, { max: MAX_SUBMISSIONS_PER_MINUTE }).allowed) {
    return NextResponse.json(
      { ok: false, error: 'You have submitted several corrections recently. Please try again tomorrow.' },
      { status: 429 }
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = correctionSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'That submission is not valid.' },
      { status: 400 }
    )
  }

  const secret = process.env.SESSION_SECRET
  if (!secret) {
    // Fail closed rather than hashing with a missing secret.
    return NextResponse.json(
      { ok: false, error: 'This form is temporarily unavailable. Please try again later.' },
      { status: 500 }
    )
  }

  const sessionHash = makeSessionHash(ip, currentDaySalt(secret))

  const since = new Date(Date.now() - ONE_DAY_MS)

  try {
    // Rate limit: bound how many submissions one anonymous session can create per day.
    const recent = await db
      .select({ id: correctionSubmissions.id, message: correctionSubmissions.message })
      .from(correctionSubmissions)
      .where(and(eq(correctionSubmissions.sessionHash, sessionHash), gt(correctionSubmissions.createdAt, since)))
      .orderBy(desc(correctionSubmissions.createdAt))
      .limit(MAX_SUBMISSIONS_PER_SESSION_PER_DAY + 1)

    if (recent.length > MAX_SUBMISSIONS_PER_SESSION_PER_DAY) {
      return NextResponse.json(
        { ok: false, error: 'You have submitted several corrections recently. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // Dedupe: an identical message from the same anonymous session within the window is
    // almost always a double-submit (e.g. a repeated button press), not a second report.
    if (recent.some((row) => row.message === parsed.data.message)) {
      return NextResponse.json({ ok: true, deduped: true })
    }

    const context = await resolvePublishedContext(parsed.data.entityId, parsed.data.claimId)

    await db.insert(correctionSubmissions).values({
      entityId: context.entityId,
      claimId: context.claimId,
      category: parsed.data.category,
      message: parsed.data.message,
      proposedSource: parsed.data.proposedSource ?? null,
      moderationStatus: 'pending',
      sessionHash,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('corrections/route: failed to record submission', err)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    )
  }
}

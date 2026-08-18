import { NextResponse } from 'next/server'
import { z } from 'zod'
import { and, desc, eq, gt } from 'drizzle-orm'
import { db } from '@/db'
import { correctionSubmissions } from '@/db/schema'
import { currentDaySalt, makeSessionHash } from '@/lib/session-hash'
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
  entityId: z.number().int().positive().optional(),
  claimId: z.number().int().positive().optional(),
})

function getRequestIp(request: Request): string {
  // Behind Railway's proxy, the client IP arrives as the first hop in X-Forwarded-For.
  const forwardedFor = request.headers.get('x-forwarded-for')
  const first = forwardedFor?.split(',')[0]?.trim()
  if (first) return first
  return request.headers.get('x-real-ip')?.trim() ?? 'unknown'
}

export async function POST(request: Request) {
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

  const ip = getRequestIp(request)
  const userAgent = request.headers.get('user-agent') ?? ''
  const sessionHash = makeSessionHash(ip, userAgent, currentDaySalt(secret))

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

    await db.insert(correctionSubmissions).values({
      entityId: parsed.data.entityId ?? null,
      claimId: parsed.data.claimId ?? null,
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

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { currentDaySalt, makeSessionHash } from '@/lib/session-hash'
import {
  formatComprehensionAggregate,
  getAggregateForClaim,
  getCurrentClaimVersion,
  getQuestionById,
  recordResponse,
} from '@/lib/comprehension'

// This endpoint has exactly one job: record one anonymous answer to a comprehension ("teach-back")
// question and report back whether it was correct. No account, no identifying data — see
// lib/session-hash.ts. It never touches claims, entities, or any editorial content.

export const runtime = 'nodejs' // needs node:crypto (via lib/session-hash) and the pg pool

const responseSchema = z.object({
  questionId: z.number().int().positive(),
  selectedOptionIndex: z.number().int().min(0),
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

  const parsed = responseSchema.safeParse(payload)
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
      { ok: false, error: 'This is temporarily unavailable. Please try again later.' },
      { status: 500 }
    )
  }

  const { questionId, selectedOptionIndex } = parsed.data

  try {
    const question = await getQuestionById(questionId)
    if (!question) {
      return NextResponse.json({ ok: false, error: 'That question could not be found.' }, { status: 404 })
    }
    if (selectedOptionIndex >= question.options.length) {
      return NextResponse.json({ ok: false, error: 'That answer option does not exist.' }, { status: 400 })
    }

    const ip = getRequestIp(request)
    const userAgent = request.headers.get('user-agent') ?? ''
    const sessionHash = makeSessionHash(ip, userAgent, currentDaySalt(secret))

    const claimVersion = (await getCurrentClaimVersion(question.claimId)) ?? 1

    const result = await recordResponse({
      questionId,
      claimVersion,
      selectedOptionIndex,
      sessionHash,
    })

    const aggregate = await getAggregateForClaim(result.claimId)

    return NextResponse.json({
      ok: true,
      isCorrect: result.isCorrect,
      explanation: result.explanation,
      aggregate: {
        isClarityTested: aggregate.isClarityTested,
        // null until the clarity-tested gate is met — never a misleadingly small-sample percentage.
        message: formatComprehensionAggregate(aggregate),
      },
    })
  } catch (err) {
    console.error('comprehension/route: failed to record response', err)
    return NextResponse.json(
      { ok: false, error: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    )
  }
}

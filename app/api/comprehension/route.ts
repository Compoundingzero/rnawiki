import { NextResponse } from 'next/server'
import { z } from 'zod'
import { currentDaySalt, makeSessionHash } from '@/lib/session-hash'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { MAX_POSTGRES_INT } from '@/lib/public-ids'
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
  // Bounded to the int4 range the column actually is: without the upper bound, a questionId like
  // 99999999999 passed validation and came back as a 500 from the driver rather than a 404.
  questionId: z.number().int().positive().max(MAX_POSTGRES_INT),
  selectedOptionIndex: z.number().int().min(0),
})

// ABUSE CONTROL, and it is not decoration on a self-test endpoint.
//
// This route had none. The only thing bounding it was recordResponse's (questionId, sessionHash)
// dedupe, whose comment correctly calls itself a UX guard for a double-click rather than an abuse
// control, and the sessionHash it keyed on mixed in the caller's own User-Agent. So four POSTs with
// four User-Agents read the answer key straight out of the isCorrect field, and sixteen more
// pushed question 82 to 20 responses at an 86% correct rate — which flips `isClarityTested` and
// makes the site print "86% of 21 readers correctly identified where the evidence ends", the one
// numeric claim CLAUDE.md rule 3 permits, entirely from one scripted loop. It works downward too:
// stuffing wrong answers holds the rate under CLARITY_MIN_CORRECT_RATE and suppresses the
// statistic forever.
//
// Keyed on IP alone, deliberately. Keying on the session hash would have been keying the control
// on a value the caller chooses, which is the defect. The limit is per-minute volume; the one
// answer per reader per question is still the dedupe's job.
const MAX_RESPONSES_PER_MINUTE = 20

export async function POST(request: Request) {
  const ip = getRequestIp(request)
  if (!checkRateLimit(`POST /api/comprehension:${ip}`, { max: MAX_RESPONSES_PER_MINUTE }).allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many answers too quickly. Please slow down.' },
      { status: 429 }
    )
  }

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

    const sessionHash = makeSessionHash(ip, currentDaySalt(secret))

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

/**
 * The protected completion-and-identity review endpoint.
 *
 * GET lists one of the three queues. POST records one append-only decision. Both require a current
 * steward or administrator; the reviewer id comes from the session, never from the request body.
 *
 * POST accepts JSON for programmatic callers and form-encoded bodies for the plain HTML form on
 * `/review-queue/completion`, which has to work without client-side JavaScript. A form post is
 * answered with a 303 back to the queue page so the browser reloads the list; a JSON post is
 * answered with the recorded decision. The session cookie is `SameSite=Lax`, so a cross-site form
 * post arrives without it and is refused as unauthenticated.
 *
 * Recording a decision changes no assessment, no medicine record and no public page.
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  completionReviewDecisionSchema,
  completionReviewQueueQuerySchema,
} from '@/lib/completion-review-policy'
import {
  CompletionReviewError,
  listCompletionReviewQueue,
  recordCompletionReviewDecision,
} from '@/lib/queries/completion-review'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { requireInternalReviewer } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QUEUE_PATH = '/review-queue/completion'

function rethrow(error: CompletionReviewError): never {
  if (error.code === 'not_authorized') throw new ApiError(403, error.message, error.code)
  if (error.code === 'not_found') throw new ApiError(404, error.message, error.code)
  if (error.code === 'stale_assessment') throw new ApiError(409, error.message, error.code)
  throw new ApiError(400, error.message, error.code)
}

export const GET = withHandler(async (req: Request) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, actor.id))
  if (limited) return limited

  const url = new URL(req.url)
  const input = completionReviewQueueQuerySchema.parse({
    kind: url.searchParams.get('kind') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  })

  return ok(await listCompletionReviewQueue(input))
})

/** The extra fields a browser form sends so the redirect can return to the same list position. */
const formReturnSchema = z
  .object({
    kind: z.string().trim().max(24).optional(),
    offset: z.string().trim().max(12).optional(),
  })
  .passthrough()

function queueRedirect(
  req: Request,
  params: { kind?: string; offset?: string; drugId: string; outcome: string },
): NextResponse {
  const target = new URL(QUEUE_PATH, req.url)
  if (params.kind) target.searchParams.set('kind', params.kind)
  if (params.offset) target.searchParams.set('offset', params.offset)
  target.searchParams.set('outcome', params.outcome)
  target.searchParams.set('record', params.drugId)
  target.hash = `record-${params.drugId}`
  return NextResponse.redirect(target, { status: 303, headers: { 'Cache-Control': 'no-store' } })
}

function formOutcome(error: unknown): string {
  if (error instanceof CompletionReviewError) return error.code
  if (error instanceof z.ZodError) return 'invalid_decision'
  return 'internal_error'
}

export const POST = withHandler(async (req: Request) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(WRITE, rateLimitKey(req, actor.id))
  if (limited) return limited

  const contentType = req.headers.get('content-type') ?? ''
  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')

  if (!isForm) {
    const input = completionReviewDecisionSchema.parse(await readJson(req))
    try {
      const decision = await recordCompletionReviewDecision({ ...input, reviewerUserId: actor.id })
      return ok({ decision }, 201)
    } catch (error) {
      if (error instanceof CompletionReviewError) rethrow(error)
      throw error
    }
  }

  const form = await req.formData()
  const raw: Record<string, string> = {}
  for (const [key, value] of form.entries()) {
    if (typeof value === 'string') raw[key] = value
  }
  const back = formReturnSchema.parse(raw)
  const returnParams = {
    ...(back.kind ? { kind: back.kind } : {}),
    ...(back.offset ? { offset: back.offset } : {}),
  }
  const drugId = typeof raw.drugId === 'string' ? raw.drugId : ''

  try {
    const input = completionReviewDecisionSchema.parse({
      drugId: raw.drugId,
      sectionId: raw.sectionId,
      decision: raw.decision,
      explanation: raw.explanation,
      assessmentInputDigest: raw.assessmentInputDigest,
    })
    await recordCompletionReviewDecision({ ...input, reviewerUserId: actor.id })
    return queueRedirect(req, { ...returnParams, drugId: input.drugId, outcome: 'recorded' })
  } catch (error) {
    if (!(error instanceof CompletionReviewError) && !(error instanceof z.ZodError)) throw error
    return queueRedirect(req, { ...returnParams, drugId, outcome: formOutcome(error) })
  }
})

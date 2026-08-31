import { z } from 'zod'

import {
  AGENT_REVIEW_DECISIONS,
  AGENT_REVIEW_EXPLANATION_MAX_LENGTH,
  AGENT_REVIEW_LANES,
  AGENT_REVIEW_OCCURRENCE_STATES,
  AGENT_REVIEW_SEVERITIES,
  AGENT_REVIEW_STATES,
} from '@/lib/agent-review-policy'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  AgentReviewQueueError,
  getAgentReviewQueueDetail,
  listAgentReviewQueue,
  recordAgentReviewDecision,
} from '@/lib/queries/agent-review-queue'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { requireAgentReviewer } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const digest = z.string().regex(/^[0-9a-f]{64}$/u)
const optionalBoolean = z.preprocess(
  (value) => (value === null || value === '' ? undefined : value),
  z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
)

const listSchema = z
  .object({
    occurrence: z.preprocess((value) => value || undefined, digest.optional()),
    occurrenceHistoryOffset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
    decisionHistoryOffset: z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(40),
    offset: z.coerce.number().int().min(0).max(10_000).default(0),
    agent: z.preprocess((value) => value || undefined, z.string().trim().max(64).optional()),
    reason: z.preprocess((value) => value || undefined, z.string().trim().max(48).optional()),
    severity: z.preprocess(
      (value) => value || undefined,
      z.enum(AGENT_REVIEW_SEVERITIES).optional(),
    ),
    lane: z.preprocess((value) => value || undefined, z.enum(AGENT_REVIEW_LANES).optional()),
    provenanceTier: z.preprocess(
      (value) => value || undefined,
      z.string().trim().max(24).optional(),
    ),
    state: z.preprocess((value) => value || undefined, z.enum(AGENT_REVIEW_STATES).optional()),
    occurrenceState: z.preprocess(
      (value) => value || undefined,
      z.enum(AGENT_REVIEW_OCCURRENCE_STATES).optional(),
    ),
    sourceChanged: optionalBoolean,
    conflict: optionalBoolean,
    freshnessDrift: optionalBoolean,
    coverageGap: optionalBoolean,
    chemistryIdentity: optionalBoolean,
    quantitativeIntegrity: optionalBoolean,
    query: z.preprocess((value) => value || undefined, z.string().trim().max(100).optional()),
  })
  .strict()

const decisionSchema = z
  .object({
    occurrenceKey: digest,
    evidenceDigest: digest,
    liveContextDigest: digest,
    decision: z.enum(AGENT_REVIEW_DECISIONS),
    explanation: z
      .string()
      .trim()
      .min(1, 'A decision explanation is required.')
      .max(AGENT_REVIEW_EXPLANATION_MAX_LENGTH),
  })
  .strict()

function rethrowQueueError(error: AgentReviewQueueError): never {
  if (error.code === 'not_authorized') throw new ApiError(403, error.message, error.code)
  if (error.code === 'not_found') throw new ApiError(404, error.message, error.code)
  if (error.code === 'stale_occurrence' || error.code === 'stale_evidence') {
    throw new ApiError(409, error.message, error.code)
  }
  throw new ApiError(422, error.message, error.code)
}

export const GET = withHandler(async (req: Request) => {
  const actor = await requireAgentReviewer()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, actor.id))
  if (limited) return limited

  const url = new URL(req.url)
  const input = listSchema.parse({
    occurrence: url.searchParams.get('occurrence'),
    occurrenceHistoryOffset: url.searchParams.get('occurrenceHistoryOffset') ?? undefined,
    decisionHistoryOffset: url.searchParams.get('decisionHistoryOffset') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
    agent: url.searchParams.get('agent'),
    reason: url.searchParams.get('reason'),
    severity: url.searchParams.get('severity'),
    lane: url.searchParams.get('lane'),
    provenanceTier: url.searchParams.get('provenanceTier'),
    state: url.searchParams.get('state'),
    occurrenceState: url.searchParams.get('occurrenceState'),
    sourceChanged: url.searchParams.get('sourceChanged'),
    conflict: url.searchParams.get('conflict'),
    freshnessDrift: url.searchParams.get('freshnessDrift'),
    coverageGap: url.searchParams.get('coverageGap'),
    chemistryIdentity: url.searchParams.get('chemistryIdentity'),
    quantitativeIntegrity: url.searchParams.get('quantitativeIntegrity'),
    query: url.searchParams.get('query'),
  })

  if (input.occurrence) {
    const detail = await getAgentReviewQueueDetail(input.occurrence, {
      occurrenceOffset: input.occurrenceHistoryOffset,
      decisionOffset: input.decisionHistoryOffset,
    })
    if (!detail) throw new ApiError(404, 'No active agent occurrence matches this id.', 'not_found')
    return ok({ detail })
  }

  return ok(
    await listAgentReviewQueue({
      limit: input.limit,
      offset: input.offset,
      ...(input.agent ? { agent: input.agent } : {}),
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.severity ? { severity: input.severity } : {}),
      ...(input.lane ? { lane: input.lane } : {}),
      ...(input.provenanceTier ? { provenanceTier: input.provenanceTier } : {}),
      ...(input.state ? { state: input.state } : {}),
      ...(input.occurrenceState ? { occurrenceState: input.occurrenceState } : {}),
      ...(input.sourceChanged ? { sourceChanged: true } : {}),
      ...(input.conflict ? { conflict: true } : {}),
      ...(input.freshnessDrift ? { freshnessDrift: true } : {}),
      ...(input.coverageGap ? { coverageGap: true } : {}),
      ...(input.chemistryIdentity ? { chemistryIdentity: true } : {}),
      ...(input.quantitativeIntegrity ? { quantitativeIntegrity: true } : {}),
      ...(input.query ? { query: input.query } : {}),
    }),
  )
})

export const POST = withHandler(async (req: Request) => {
  const actor = await requireAgentReviewer()
  const limited = rateLimited(WRITE, rateLimitKey(req, actor.id))
  if (limited) return limited

  const input = decisionSchema.parse(await readJson(req))
  try {
    const decision = await recordAgentReviewDecision({ ...input, actorUserId: actor.id })
    return ok({ decision }, 201)
  } catch (error) {
    if (error instanceof AgentReviewQueueError) rethrowQueueError(error)
    throw error
  }
})

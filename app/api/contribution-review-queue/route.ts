// Public queue with safe profile attribution; raw account ids and private identity stay redacted.

import { z } from 'zod'

import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import {
  CONTRIBUTION_PROPOSAL_TYPES,
  CONTRIBUTION_REVIEW_STATUSES,
} from '@/lib/contributions/types'
import { listPublicPendingContributionProposals } from '@/lib/queries/programme-contributions'
import { PUBLIC_API } from '@/lib/rate-limit'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  type: z.enum(CONTRIBUTION_PROPOSAL_TYPES).optional(),
  status: z.enum(CONTRIBUTION_REVIEW_STATUSES).optional(),
})

export const GET = withHandler(async (req: Request) => {
  const viewer = await getCurrentUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, viewer?.id))
  if (limited) return limited

  const url = new URL(req.url)
  const query = querySchema.parse({
    limit: url.searchParams.get('limit') || undefined,
    offset: url.searchParams.get('offset') || undefined,
    type: url.searchParams.get('type') || undefined,
    status: url.searchParams.get('status') || undefined,
  })
  const result = await listPublicPendingContributionProposals({
    limit: query.limit ?? 25,
    offset: query.offset ?? 0,
    ...(query.type ? { proposalType: query.type } : {}),
    ...(query.status ? { reviewStatus: query.status } : {}),
  })
  return ok(result)
})

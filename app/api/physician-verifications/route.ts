// Private steward/admin physician-credential queue. No licence or workplace email is returned by
// this list endpoint; reviewers open one protected record when they are ready to check it.

import { z } from 'zod'

import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import { listPhysicianVerificationRequests } from '@/lib/queries/users'
import { PUBLIC_API } from '@/lib/rate-limit'
import { requireInternalReviewer } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  status: z.enum(['pending', 'decided']).default('pending'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

export const GET = withHandler(async (req: Request) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, actor.id))
  if (limited) return limited

  const url = new URL(req.url)
  const input = querySchema.parse({
    status: url.searchParams.get('status') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  })
  const requests = await listPhysicianVerificationRequests(input)
  return ok({ requests })
})

// DELETE /api/page-statements/proposals/:id — the author withdraws their own open proposal.

import { revalidatePath } from 'next/cache'

import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import { withdrawPageStatementProposal } from '@/lib/queries/page-statements'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const DELETE = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const { id } = await context.params
  const proposal = await withdrawPageStatementProposal(user, id)
  revalidatePath('/review-queue')
  return ok({ proposal })
})

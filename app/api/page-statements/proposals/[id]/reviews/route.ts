// POST /api/page-statements/proposals/:id/reviews — record one decision, and publish on the third.
// DELETE the same path withdraws a decision this account recorded, before publication.

import { revalidatePath } from 'next/cache'

import { ok, rateLimited, rateLimitKey, readJson, withHandler, ApiError } from '@/lib/api-response'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'
import {
  abuseRefusal,
  reviewDecisionSchema,
  withdrawReviewSchema,
} from '@/lib/page-statements/validation'
import {
  getPageStatementProposal,
  recordPageStatementReview,
  withdrawPageStatementReview,
} from '@/lib/queries/page-statements'
import { reviewDecisionsEnabled } from '@/lib/page-statements/flags'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const POST = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  if (!reviewDecisionsEnabled()) {
    throw new ApiError(
      503,
      'RNAWiki is not accepting review decisions right now.',
      'decisions_disabled',
    )
  }

  const input = reviewDecisionSchema.parse(await readJson(req))
  const refusal = abuseRefusal(input.reason, input.conflictsOfInterest)
  if (refusal) throw new ApiError(422, refusal, 'refused_content')

  const { id } = await context.params
  const proposal = await getPageStatementProposal(id)
  if (!proposal) throw new ApiError(404, 'That proposal no longer exists.', 'not_found')

  /*
   * The record is re-read here, not taken from the proposal, so the third approval is checked
   * against what the page holds right now rather than against what it held when the wording was
   * written. A record that moved in between stales the approvals instead of publishing past them.
   */
  const inputs = await loadDossierV4Inputs(proposal.slug)
  const model = inputs ? buildDossierV4(inputs) : null

  const outcome = await recordPageStatementReview(
    user,
    {
      revisionId: id,
      decision: input.decision,
      checkedWording: input.checkedWording,
      checkedSource: input.checkedSource,
      checkedLimitation: input.checkedLimitation,
      conflictsOfInterest: input.conflictsOfInterest,
      conflictsOfInterestAttested: input.conflictsOfInterestAttested,
      conflictDeclared: input.conflictDeclared,
      ...(input.reason ? { reason: input.reason } : {}),
      expectedContentDigest: input.expectedContentDigest,
    },
    {
      record: inputs?.legacyRecord ?? null,
      identityWarning: model ? !model.identity.identityVerified : true,
      medicineAliases: [inputs?.legacyRecord?.id, inputs?.legacyRecord?.tradeName].filter(
        (value): value is string => Boolean(value),
      ),
    },
  )

  // A published wording has to reach a reader on their next request. /d/<slug> is force-dynamic and
  // nothing caches it, so this only clears the App Router pages that list the queue.
  revalidatePath('/review-queue')
  if (outcome.published) revalidatePath(`/d/${proposal.slug}`)
  return ok(outcome, 201)
})

export const DELETE = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const input = withdrawReviewSchema.parse(await readJson(req))
  const { id } = await context.params
  const proposal = await withdrawPageStatementReview(user, id, input.reason)
  revalidatePath('/review-queue')
  return ok({ proposal })
})

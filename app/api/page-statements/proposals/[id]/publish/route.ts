// POST /api/page-statements/proposals/:id/publish — release a wording that was approved while
// automatic publication was switched off.
//
// A steward or administrator action, and the only way an approved wording reaches a page other than
// the third approval itself. It runs the same gates through the same function, so a record that
// moved since the approvals were recorded stops it here exactly as it would have stopped it then.

import { revalidatePath } from 'next/cache'

import { ApiError, ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'
import {
  getPageStatementProposal,
  publishApprovedPageStatement,
} from '@/lib/queries/page-statements'
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

  const { id } = await context.params
  const proposal = await getPageStatementProposal(id)
  if (!proposal) throw new ApiError(404, 'That proposal no longer exists.', 'not_found')

  const inputs = await loadDossierV4Inputs(proposal.slug)
  const model = inputs ? buildDossierV4(inputs) : null
  const outcome = await publishApprovedPageStatement(user, id, {
    record: inputs?.legacyRecord ?? null,
    identityWarning: model ? !model.identity.identityVerified : true,
    medicineAliases: [inputs?.legacyRecord?.id, inputs?.legacyRecord?.tradeName].filter(
      (value): value is string => Boolean(value),
    ),
  })

  revalidatePath('/review-queue')
  if (outcome.published) revalidatePath(`/d/${proposal.slug}`)
  return ok(outcome, 201)
})

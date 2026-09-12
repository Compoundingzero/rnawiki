// POST /api/page-statements/proposals — propose a better wording for one sentence on a medicine page.

import { revalidatePath } from 'next/cache'

import { ok, rateLimited, rateLimitKey, readJson, withHandler, ApiError } from '@/lib/api-response'
import { currentPageStatement } from '@/lib/page-statements/current'
import { abuseRefusal, createProposalSchema } from '@/lib/page-statements/validation'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'
import { createPageStatementProposal, medicineIdForSlug } from '@/lib/queries/page-statements'
import { proposalsEnabled } from '@/lib/page-statements/flags'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  if (!proposalsEnabled()) {
    throw new ApiError(
      503,
      'RNAWiki is not accepting new wording suggestions right now.',
      'proposals_disabled',
    )
  }

  const input = createProposalSchema.parse(await readJson(req))
  const refusal = abuseRefusal(input.proposedText, input.reason)
  if (refusal) throw new ApiError(422, refusal, 'refused_content')

  const inputs = await loadDossierV4Inputs(input.slug)
  if (!inputs?.legacyRecord) {
    throw new ApiError(404, 'There is no medicine record at that address.', 'not_found')
  }
  const model = buildDossierV4(inputs)
  const medicineId = await medicineIdForSlug(input.slug)
  if (!medicineId) {
    throw new ApiError(404, 'There is no medicine record at that address.', 'not_found')
  }
  const current = currentPageStatement(model, input.statementKey)
  if (!current) throw new ApiError(404, 'That is not a sentence on this page.', 'unknown_statement')

  /*
   * The wording the member was looking at has to be the wording on the page. Without this a
   * proposal written against a sentence the page has since replaced would be reviewed as though it
   * were still current, and its "before" column would be fiction.
   */
  if (current.text.trim() !== input.expectedCurrentText.trim()) {
    throw new ApiError(
      409,
      'This sentence changed while you were writing. Reload the page and look at it again.',
      'stale_current_text',
    )
  }

  const proposal = await createPageStatementProposal(
    user,
    {
      slug: input.slug,
      statementKey: input.statementKey,
      currentText: current.text,
      proposedText: input.proposedText,
      reason: input.reason,
      changeCategory: input.changeCategory,
      evidenceState: current.evidenceState,
      evidencePacket: input.evidencePacket,
      sources: input.sources,
    },
    {
      record: inputs.legacyRecord,
      medicineId,
      identityWarning: !model.identity.identityVerified,
      medicineAliases: [inputs.legacyRecord.id, inputs.legacyRecord.tradeName ?? ''].filter(
        Boolean,
      ),
    },
  )

  revalidatePath('/review-queue')
  return ok({ proposal }, 201)
})

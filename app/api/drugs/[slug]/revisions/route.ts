import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { getDrugIdBySlug } from '@/lib/queries/drugs'
import { normalizeIdentityCorrectionSourceUrl } from '@/lib/legacy-identity-source-url'
import {
  countPendingRevisions,
  createLegacyIdentityCorrection,
  RevisionError,
} from '@/lib/queries/revisions'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  params: Promise<{ slug: string }>
}

const identityCorrectionSchema = z
  .object({
    field: z.enum(['name', 'tradeName']),
    proposedValue: z.string().trim().max(400).nullable(),
    sourceUrl: z.string().trim().min(1).max(2048),
    sourceTitle: z.string().trim().min(3).max(300),
    explanation: z.string().trim().min(10).max(300),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.field === 'name') {
      if (value.proposedValue === null || value.proposedValue.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['proposedValue'],
          message: 'A medicine name cannot be blank or removed.',
        })
      } else if (value.proposedValue.length > 300) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          type: 'string',
          inclusive: true,
          maximum: 300,
          path: ['proposedValue'],
          message: 'Medicine names are limited to 300 characters.',
        })
      }
    }
    if (value.field === 'tradeName' && value.proposedValue === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['proposedValue'],
        message: 'Use null to explicitly remove a trade or brand name.',
      })
    }
  })

const WHOLE_DOSSIER_KEYS = new Set([
  'payload',
  'sponsor',
  'targetGene',
  'targetProtein',
  'modality',
  'approvalStatus',
  'approvalYear',
  'indication',
  'patientFriendlyIndication',
  'oneSentenceVerdict',
  'laymanHowItWorks',
  'auditConfidence',
  'confidenceScore',
  'anatomicalSite',
  'recentAuditDate',
  'hasDiscrepancy',
  'dossierDepth',
  'conditionContext',
  'pricing',
  'substitutes',
  'molecularSchema',
  'keyAudits',
  'mechanismSteps',
  'trials',
  'measuredVsInferredSummary',
  'deliverySystem',
  'commonQuestions',
  'programme',
  'programmes',
  'verdict',
  'mechanism',
  'safety',
  'efficacy',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectsWholeDossierEdit(value: unknown): boolean {
  if (!isRecord(value)) return false
  return Object.keys(value).some((key) => WHOLE_DOSSIER_KEYS.has(key))
}

function revisionErrorStatus(error: RevisionError): number {
  switch (error.code) {
    case 'not_found':
    case 'drug_not_found':
      return 404
    case 'programme_required':
      return 422
    case 'no_change':
    case 'stale_identity':
      return 422
    case 'not_pending':
    case 'not_identity_correction':
    case 'quarantined':
    case 'self_review':
      return 409
  }
}

export const POST = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const rawBody = await readJson(req)
  if (rejectsWholeDossierEdit(rawBody)) {
    throw new ApiError(
      422,
      'This route now accepts only a medicine name or trade/brand name correction. Evidence, conclusions, trials, mechanisms, safety, efficacy, sponsor, pricing and molecular changes require an identified development programme so reviewers can see the exact medical context.',
      'programme_required',
    )
  }

  const body = identityCorrectionSchema.parse(rawBody)
  const sourceUrl = normalizeIdentityCorrectionSourceUrl(body.sourceUrl)
  const drugId = await getDrugIdBySlug(slug)
  if (!drugId) throw new ApiError(404, 'No medicine with that address was found.', 'not_found')

  try {
    const revision = await createLegacyIdentityCorrection({
      drugId,
      author: {
        userId: user.id,
        name: user.name,
        orcid: user.orcid ?? null,
        trustTier: user.trustTier ?? 'new',
      },
      field: body.field,
      proposedValue: body.proposedValue,
      sourceUrl,
      sourceTitle: body.sourceTitle,
      explanation: body.explanation,
    })
    const itemsWaiting = await countPendingRevisions()

    revalidatePath('/review-queue')
    revalidatePath(`/d/${slug}/history`)

    return ok(
      {
        outcome: 'pending_review' as const,
        revisionId: revision.id,
        itemsWaiting,
        revision,
      },
      202,
    )
  } catch (error) {
    if (error instanceof RevisionError) {
      throw new ApiError(revisionErrorStatus(error), error.message, error.code)
    }
    throw error
  }
})

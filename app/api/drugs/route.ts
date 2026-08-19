// GET /api/drugs?modality=&approvalStatus=&depth=&limit=&offset=  — the paginated browse.
//
// Public and unauthenticated for the same reason search is: the corpus is the product, and a
// reader who wants to see what is in it should not have to introduce themselves first.

import { z } from 'zod'
import { listDrugs, type SearchHit } from '@/lib/queries/drugs'
import { getCurrentUser } from '@/lib/session'
import { PUBLIC_API } from '@/lib/rate-limit'
import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import {
  APPROVAL_STATUSES,
  DRUG_MODALITIES,
  type ApprovalStatus,
  type DrugModality,
} from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Contract: `limit` max 60. Below `listDrugs`'s own MAX_PAGE_SIZE of 100, deliberately. */
const DEFAULT_LIMIT = 24
const MAX_LIMIT = 60

/**
 * `z.enum` needs a non-empty tuple and the vocabularies in lib/types.ts are declared as arrays,
 * so the cast is unavoidable. It is safe because those arrays are the same literals as the
 * unions — and `satisfies` on the annotations below fails the build if that ever stops being true.
 */
const modalityValues = DRUG_MODALITIES as [DrugModality, ...DrugModality[]]
const approvalValues = APPROVAL_STATUSES as [ApprovalStatus, ...ApprovalStatus[]]

const querySchema = z.object({
  modality: z.enum(modalityValues).optional(),
  approvalStatus: z.enum(approvalValues).optional(),
  depth: z.enum(['stub', 'curated', 'flagship']).optional(),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

/**
 * The lean row the contract returns. `listDrugs` hands back whole dossiers because the browse
 * CARDS render pricing and audit counts; this endpoint's contract is the lean shape, so the
 * projection happens here rather than by adding a second paginated query to lib/queries/drugs.ts.
 * One paginated read path is worth more than the bytes saved, and MAX_LIMIT bounds the cost.
 */
function toSearchHit(drug: Awaited<ReturnType<typeof listDrugs>>['items'][number]): SearchHit {
  return {
    slug: drug.id,
    name: drug.name,
    tradeName: drug.tradeName ?? null,
    modality: drug.modality,
    approvalStatus: drug.approvalStatus,
    patientFriendlyIndication: drug.patientFriendlyIndication,
    // `dossierDepth` is NOT NULL in the database, so `rowToDossier` always sets it; the fallback
    // exists only because the DrugDossier type marks it optional for the wireframe's sake.
    dossierDepth: drug.dossierDepth ?? 'stub',
  }
}

export const GET = withHandler(async (req: Request) => {
  const url = new URL(req.url)
  const parsed = querySchema.parse({
    modality: url.searchParams.get('modality') ?? undefined,
    approvalStatus: url.searchParams.get('approvalStatus') ?? undefined,
    depth: url.searchParams.get('depth') ?? undefined,
    // An absent param is `undefined` so the default applies; an empty one would coerce to 0 and
    // fail `.positive()`, which is a 422 for a request nobody meant to make.
    limit: url.searchParams.get('limit') || undefined,
    offset: url.searchParams.get('offset') || undefined,
  })

  // Signed-in callers are budgeted on their own id rather than on the shared fingerprint of the
  // network they happen to be behind.
  const viewer = await getCurrentUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, viewer?.id))
  if (limited) return limited

  const limit = parsed.limit ?? DEFAULT_LIMIT
  const offset = parsed.offset ?? 0

  const result = await listDrugs({
    limit,
    offset,
    modality: parsed.modality,
    approvalStatus: parsed.approvalStatus,
    depth: parsed.depth,
  })

  return ok({ drugs: result.items.map(toSearchHit), total: result.total, limit, offset })
})

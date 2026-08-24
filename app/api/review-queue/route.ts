// Public identity-correction queue, oldest first.

import { z } from 'zod'
import { inArray } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import { countPendingRevisions, listPendingRevisions } from '@/lib/queries/revisions'
import { getCurrentUser } from '@/lib/session'
import { PUBLIC_API } from '@/lib/rate-limit'
import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import type { LegacyIdentityCorrectionDetail, RevisionFieldChange, TrustTier } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

interface PendingRevision {
  id: string
  drugSlug: string
  drugName: string
  authorName: string
  authorHandle?: string
  authorTrustTier: TrustTier
  summary: string
  identityCorrection: LegacyIdentityCorrectionDetail
  changedFields: RevisionFieldChange[]
  createdAt: string
}

async function handlesFor(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds)]
  if (unique.length === 0) return new Map()

  const rows = await db
    .select({ id: users.id, handle: users.handle })
    .from(users)
    .where(inArray(users.id, unique))

  return new Map(rows.map((row) => [row.id, row.handle]))
}

export const GET = withHandler(async (req: Request) => {
  const url = new URL(req.url)
  const parsed = querySchema.parse({
    limit: url.searchParams.get('limit') || undefined,
    offset: url.searchParams.get('offset') || undefined,
  })

  const viewer = await getCurrentUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, viewer?.id))
  if (limited) return limited

  const [pending, total] = await Promise.all([
    listPendingRevisions({ limit: parsed.limit ?? DEFAULT_LIMIT, offset: parsed.offset ?? 0 }),
    countPendingRevisions(),
  ])

  const handles = await handlesFor(
    pending.map((revision) => revision.authorUserId).filter((id): id is string => id !== null),
  )

  const rows: PendingRevision[] = pending.map((revision) => {
    if (!revision.identityCorrection) {
      throw new Error('The live legacy queue returned a revision without identity provenance.')
    }
    const handle = revision.authorUserId ? handles.get(revision.authorUserId) : undefined
    return {
      id: revision.id,
      drugSlug: revision.drugSlug,
      drugName: revision.drugName,
      authorName: revision.authorName,
      ...(handle ? { authorHandle: handle } : {}),
      authorTrustTier: revision.authorTrustTier,
      summary: revision.summary,
      identityCorrection: revision.identityCorrection,
      changedFields: revision.changedFields,
      createdAt: revision.createdAt,
    }
  })

  return ok({ revisions: rows, total })
})

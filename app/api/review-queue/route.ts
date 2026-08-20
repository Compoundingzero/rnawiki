// GET /api/review-queue?limit=&offset= — the edits waiting for a person.
//
// Public, and that is the point. A moderation queue nobody outside the moderators can see is a
// private editorial process wearing an open-source label; anyone can read what has been proposed,
// what the deterministic engine said about it, and how long it has been waiting.
//
// Oldest first, because a queue sorted newest-first is one where the unlucky submission at the
// bottom is never reached.

import { z } from 'zod'
import { inArray } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import { countPendingRevisions, listPendingRevisions } from '@/lib/queries/revisions'
import { getCurrentUser } from '@/lib/session'
import { PUBLIC_API } from '@/lib/rate-limit'
import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import type { RevisionFieldChange, TrustTier } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 25
const MAX_LIMIT = 100

const querySchema = z.object({
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).optional(),
})

/** The contract's row. Note what is NOT here: the proposed payload and the full engine report. */
interface PendingRevision {
  id: string
  drugSlug: string
  drugName: string
  authorName: string
  authorHandle?: string
  authorTrustTier: TrustTier
  summary: string
  changedFields: RevisionFieldChange[]
  machineVerified: boolean
  verificationHash: string | null
  createdAt: string
}

/**
 * Handles for the authors on this page, so each row can link to a contributor profile.
 *
 * A second query rather than a join: `revisionListColumns` in lib/queries/revisions.ts is
 * deliberately drug-shaped and does not reach into `users`, and widening it is not this route's
 * file to change. This is one primary-key lookup over at most `limit` ids that are already in
 * hand, and `handle` is a public field — it is the profile URL.
 *
 * Anonymous authors (`authorUserId === null`) simply have no handle, which the optional field in
 * the contract already allows for.
 */
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
    // An absent param is `undefined` so the default applies; an empty one would coerce to 0.
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
    const handle = revision.authorUserId ? handles.get(revision.authorUserId) : undefined
    return {
      id: revision.id,
      drugSlug: revision.drugSlug,
      drugName: revision.drugName,
      authorName: revision.authorName,
      // Omitted rather than sent as null when the author has no account behind them any more.
      ...(handle ? { authorHandle: handle } : {}),
      authorTrustTier: revision.authorTrustTier,
      summary: revision.summary,
      changedFields: revision.changedFields,
      machineVerified: revision.machineVerified,
      verificationHash: revision.verificationHash,
      createdAt: revision.createdAt,
    }
  })

  return ok({ revisions: rows, total })
})

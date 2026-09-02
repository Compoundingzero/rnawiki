import { desc } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { resultDebuggerCorrections } from '@/db/schema'
import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { buildCorrectionRow, resultDebuggerCorrectionSchema } from '@/lib/semantic/result-debugger'
import { requireAgentReviewer } from '@/lib/session'

/**
 * Records what a steward says a query should have returned, and lists what has been recorded.
 *
 * Authorization is the same steward or administrator capability the agent evidence queue uses: a
 * correction is an operational judgement about the corpus, and it names a person.
 *
 * The engine version is stamped server-side rather than accepted from the caller, so a correction
 * can never claim to be about a version of the engine that did not run.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const listSchema = z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) }).strict()

export const GET = withHandler(async (req: Request) => {
  const actor = await requireAgentReviewer()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, actor.id))
  if (limited) return limited

  const url = new URL(req.url)
  const input = listSchema.parse({ limit: url.searchParams.get('limit') ?? undefined })
  const corrections = await db
    .select()
    .from(resultDebuggerCorrections)
    .orderBy(desc(resultDebuggerCorrections.createdAt), desc(resultDebuggerCorrections.id))
    .limit(input.limit)

  return ok({ corrections })
})

export const POST = withHandler(async (req: Request) => {
  const actor = await requireAgentReviewer()
  const limited = rateLimited(WRITE, rateLimitKey(req, actor.id))
  if (limited) return limited

  const input = resultDebuggerCorrectionSchema.parse(await readJson(req))
  const row = buildCorrectionRow(input, actor.id)
  await db.insert(resultDebuggerCorrections).values(row)
  return ok({ correction: row }, 201)
})

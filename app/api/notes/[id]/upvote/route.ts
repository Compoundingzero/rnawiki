// POST /api/notes/:id/upvote — one person, one upvote. Toggles.
//
// The count in the response is recomputed by `toggleUpvote` from the `note_upvotes` rows rather
// than incremented, so it cannot drift away from the rows that define it. The client is told the
// recomputed total, never the total it guessed.

import { NoteError, toggleUpvote } from '@/lib/queries/notes'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface IdContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ id: string }>
}

export const POST = withHandler(async (req: Request, ctx: IdContext) => {
  const { id } = await ctx.params

  // An upvote is an identity claim — "one person thinks this is useful" — so it needs an account.
  // An anonymous toggle keyed on a session hash would be one browser profile away from a vote farm.
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  try {
    const { upvoted, upvotes } = await toggleUpvote(id, user.id)
    return ok({ upvotes, hasUpvoted: upvoted })
  } catch (error) {
    if (error instanceof NoteError) {
      // `note_not_found` is the only code this path can raise for a well-formed request; the
      // author lookup failing means the session outlived its account.
      const status = error.code === 'author_not_found' ? 401 : 404
      throw new ApiError(status, error.message, error.code)
    }
    throw error
  }
})

// POST /api/drugs/:slug/notes — add a community note to a dossier.
//
// Nothing about the author comes from this request. The session supplies one account id, and
// `createNote` resolves its saved public identity in the same transaction as the insert. Extra JSON
// fields that claim a different name, handle, role, or credential are never passed to the query.

import { z } from 'zod'
import { createNote, NoteError, NOTE_MAX_LENGTH } from '@/lib/queries/notes'
import { getDrugIdBySlug } from '@/lib/queries/drugs'
import { getCurrentUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ slug: string }>
}

const bodySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'A note needs some text.')
    .max(NOTE_MAX_LENGTH, `A note is limited to ${NOTE_MAX_LENGTH} characters.`),
})

/** `NoteError` codes carry the cause; this maps each to the status a client can act on. */
function statusForNoteError(error: NoteError): number {
  switch (error.code) {
    case 'content_empty':
    case 'content_too_long':
      return 422
    case 'drug_not_found':
    case 'note_not_found':
      return 404
    case 'author_not_found':
      // The session cookie is valid but the account behind it is gone. That is a signed-out
      // reader, not a server fault.
      return 401
  }
}

export const POST = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params

  const user = await getCurrentUser()
  // The contract names this exact sentence, so it is written here rather than taken from
  // `requireUser`'s generic one — the modal that opens on a 401 says "post a note" too.
  if (!user) throw new ApiError(401, 'Sign in to post a note', 'unauthenticated')

  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const { content } = bodySchema.parse(await readJson(req))

  // The slug is the public id; `createNote` needs the internal key. Resolving it first turns a
  // typo'd URL into a 404 rather than a foreign-key violation three frames down.
  const drugId = await getDrugIdBySlug(slug)
  if (!drugId) throw new ApiError(404, 'No dossier with that slug', 'not_found')

  try {
    const note = await createNote({ drugId, authorUserId: user.id, content })
    return ok({ note }, 201)
  } catch (error) {
    if (error instanceof NoteError) {
      throw new ApiError(statusForNoteError(error), error.message, error.code)
    }
    throw error
  }
})

// POST /api/page-statements/rollback — return one sentence to the wording it had before.
//
// A steward or administrator action. The rollback is a new event on the same ledger: nothing is
// deleted, and the wording it replaced stays readable in the page's own history.

import { revalidatePath } from 'next/cache'

import { ok, rateLimited, rateLimitKey, readJson, withHandler, ApiError } from '@/lib/api-response'
import { rollbackSchema } from '@/lib/page-statements/validation'
import { medicineIdForSlug, rollbackPageStatement } from '@/lib/queries/page-statements'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const input = rollbackSchema.parse(await readJson(req))
  const medicineId = await medicineIdForSlug(input.slug)
  if (!medicineId) {
    throw new ApiError(404, 'There is no medicine record at that address.', 'not_found')
  }

  const result = await rollbackPageStatement(user, medicineId, input.statementKey, input.reason)
  revalidatePath(`/d/${input.slug}`)
  revalidatePath('/review-queue')
  return ok(result, 201)
})

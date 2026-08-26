// POST — publish the exact reviewed bundle and advance its public pointer atomically.

import { after } from 'next/server'
import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { programmeVerdictPublishSchema } from '@/lib/programme-verdict-workflow/validation'
import { publishProgrammeVerdictRevision } from '@/lib/queries/programme-verdict-publication'
import { WRITE } from '@/lib/rate-limit'
import { notifyEligibleProgrammePublication } from '@/lib/seo/indexnow'
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
  const input = programmeVerdictPublishSchema.parse(await readJson(req))
  const { id } = await context.params
  const publication = await publishProgrammeVerdictRevision({
    revisionId: id,
    publisherUserId: user.id,
    expectedProposalDigest: input.expectedProposalDigest,
  })
  const response = ok({ publication })

  // The publication transaction has committed before this point. Re-query search eligibility only
  // after the response and never notify for an idempotent retry of an already-public revision.
  if (!publication.alreadyPublished) {
    try {
      after(async () => {
        try {
          await notifyEligibleProgrammePublication(publication.programmeId)
        } catch (error) {
          // The notifier is designed not to throw, but keep this boundary defensive so a future
          // regression can never turn a successful medical-publication response into a failure.
          console.warn(
            '[seo.indexnow_after_failed]',
            JSON.stringify({
              event: 'publication',
              error: error instanceof Error ? error.name : 'UnknownError',
            }),
          )
        }
      })
    } catch (error) {
      console.warn(
        '[seo.indexnow_schedule_failed]',
        JSON.stringify({
          event: 'publication',
          error: error instanceof Error ? error.name : 'UnknownError',
        }),
      )
    }
  }

  return response
})

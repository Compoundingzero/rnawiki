// This route only submits a credential for review. It cannot grant verified status.

import { doctorVerificationSchema } from '@/lib/auth'
import { submitDoctorVerification, UserError } from '@/lib/queries/users'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import {
  ApiError,
  ok,
  rateLimited,
  rateLimitKey,
  readJson,
  toPublicUser,
  withHandler,
} from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const input = doctorVerificationSchema.parse(await readJson(req))

  try {
    const submission = await submitDoctorVerification(user.id, {
      professionalFullName: input.fullName,
      workEmail: input.workEmail,
      medicalLicenseOrNpi: input.licenseOrNpi,
      medicalSpecialty: input.specialty,
      institution: input.institution,
    })

    // 202, not 200: the work this request asks for has been accepted and has not been done. The
    // interface must say "Submitted for review".
    return ok(
      {
        user: toPublicUser(submission.account),
        requestId: submission.requestId,
        submittedAt: submission.submittedAt,
        state: 'pending' as const,
      },
      202,
    )
  } catch (error) {
    if (error instanceof UserError && error.code === 'not_found') {
      // The cookie is valid but the account behind it is gone.
      throw new ApiError(401, 'Sign in to continue.', 'unauthenticated')
    }
    if (error instanceof UserError && error.code === 'verification_pending') {
      throw new ApiError(409, error.message, error.code)
    }
    throw error
  }
})

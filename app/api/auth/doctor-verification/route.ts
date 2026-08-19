// POST /api/auth/doctor-verification — file a physician credential for review.
//
// THE ASSERTION THIS FILE EXISTS TO MAKE: no path through this route can write
// `verificationState = 'verified'`.
//
// It calls exactly one writer, `submitDoctorVerification` in lib/queries/users.ts, which sets the
// literal string `'pending'`, takes no parameter that could change that, and does not read the
// current state to decide. The only function in the codebase that writes `'verified'` is
// `approveVerification`, it lives in the same file, it requires an administrator, and it is not
// imported here. There is nothing to pass, in any combination, that reaches the badge from this
// endpoint.
//
// This is the one place the master reference wireframe was dishonest. Its
// `DoctorVerificationModal.tsx` set `isDoctor: true` after a 900 ms `setTimeout` — a blue check
// awarded by a loading spinner. The response below returns `state: 'pending'` and a `PublicUser`
// whose `isDoctor` is still false, so a client that renders the badge from the response gets no
// badge to render.

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
    // `fullName` and `workEmail` are validated but not stored: `users` has no column for either,
    // and inventing one is a schema change, not a route change. They are checked here so the form
    // cannot submit a blank institutional address and so the shape of the claim is known to be
    // complete; the steward reviewing the queue reads the account's own name and email alongside
    // the licence number. Said out loud rather than silently dropped.
    const account = await submitDoctorVerification(user.id, {
      medicalLicenseOrNpi: input.licenseOrNpi,
      medicalSpecialty: input.specialty,
      institution: input.institution,
    })

    // 202, not 200: the work this request asks for has been accepted and has not been done. The
    // interface must say "Submitted for review".
    return ok({ user: toPublicUser(account), state: 'pending' as const }, 202)
  } catch (error) {
    if (error instanceof UserError && error.code === 'not_found') {
      // The cookie is valid but the account behind it is gone.
      throw new ApiError(401, 'Sign in to continue.', 'unauthenticated')
    }
    throw error
  }
})

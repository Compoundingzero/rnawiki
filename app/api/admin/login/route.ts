import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCredentials, getSession } from '@/lib/auth'
import { isRateLimited } from '@/lib/admin/rate-limit'

const credentialsSchema = z.object({
  email: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(200),
})

function loginRedirect(origin: string, path: string, error?: string) {
  const url = new URL(path, origin)
  if (error) url.searchParams.set('error', error)
  return NextResponse.redirect(url, 303)
}

export async function POST(req: NextRequest) {
  const origin = new URL(req.url).origin
  const formData = await req.formData()
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return loginRedirect(origin, '/admin/login', 'input')
  }

  // Rate-limit by IP + attempted email. In-memory only — see lib/admin/rate-limit.ts for
  // the tradeoffs (per-process, resets on deploy/restart).
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitKey = `${ip}:${parsed.data.email.toLowerCase()}`
  if (isRateLimited(rateLimitKey)) {
    return loginRedirect(origin, '/admin/login', 'rate_limited')
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password)
  if (!user) {
    return loginRedirect(origin, '/admin/login', 'invalid')
  }

  const session = await getSession()
  session.user = user
  await session.save()

  return loginRedirect(origin, '/admin')
}

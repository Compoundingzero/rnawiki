// How the session cookie is named and sealed.
//
// Kept apart from `lib/session.ts` because that module reads the current request through
// `next/headers`, which only resolves inside the Next.js runtime. The configuration itself is
// plain data, and a test or script that needs to seal or name a session must be able to read it
// without dragging in a request scope.

import type { SessionOptions } from 'iron-session'

export interface SessionData {
  userId?: string
}

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30

const secret = process.env.SESSION_SECRET

// Module scope on purpose: a missing key must stop the process at import, not hand out cookies
// sealed with a placeholder. iron-session derives its encryption key from this string, so a short
// one weakens every session cookie the site has ever issued.
if (!secret || secret.length < 32) {
  throw new Error(
    'SESSION_SECRET is missing or shorter than 32 characters. Set SESSION_SECRET in the ' +
      'environment (generate one with `openssl rand -base64 32`).',
  )
}

export const SESSION_COOKIE_NAME = 'rnawiki_session'

export const sessionOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: secret,
  // The seal outlives the cookie by a minute so a request arriving at the very edge of the cookie
  // lifetime decrypts cleanly instead of throwing. iron-session would otherwise derive
  // `maxAge = ttl - 60` itself; setting both explicitly keeps the 30 days the product promises.
  ttl: THIRTY_DAYS_SECONDS + 60,
  cookieOptions: {
    httpOnly: true,
    // Cookies are only marked Secure in production because local development is plain http and a
    // Secure cookie there is silently dropped, which looks exactly like a broken login.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  },
}

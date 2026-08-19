// Anonymous request fingerprinting for rate limiting and duplicate detection.
//
// PRIVACY RULE, and it is the whole reason this file exists: the raw IP address is never stored,
// never logged, and never returned from `sessionHash`. It goes into a SHA-256 digest with a salt
// that changes every UTC day and comes back out as an opaque 64-character string. Yesterday's
// hashes cannot be matched against today's, so the values in `feedback.session_hash` stop being
// linkable to a person — or to each other — after 24 hours. `clientIpFrom` hands a raw IP to the
// caller for exactly one purpose: passing it straight into `sessionHash`. Anything else that
// touches its return value is a privacy defect.

import { createHash } from 'node:crypto'

/**
 * Browser families, in match order. Order is not cosmetic:
 *   - bots first, because Googlebot and every headless Chrome carry "Chrome" in their UA;
 *   - Edge before Chrome, because Edge's UA contains "Chrome";
 *   - Chrome before Safari, because Chrome's UA contains "Safari".
 * Getting the order wrong collapses everything into one bucket, which is not a bug that shows up
 * in tests — only in a rate limiter that treats every visitor as the same one.
 */
const BROWSER_FAMILIES: ReadonlyArray<readonly [family: string, pattern: RegExp]> = [
  ['bot', /bot|crawler|spider|crawl|slurp|headless|curl|wget|python-requests|node-fetch|axios/i],
  ['edge', /edg[ae]?\//i],
  ['opera', /opr\/|opera/i],
  ['samsung', /samsungbrowser/i],
  ['firefox', /firefox\/|fxios\//i],
  ['chrome', /chrome\/|chromium\/|crios\//i],
  ['safari', /safari\//i],
  ['ie', /msie |trident\//i],
]

/**
 * The browser family only — never the full user-agent string.
 *
 * A complete UA carries browser build, OS build and device model, which together identify a
 * device closely enough to track it. The family alone ("chrome", "safari") adds just enough
 * entropy to separate two people behind one office NAT, and no more.
 */
export function userAgentBucket(userAgent: string | null): string {
  if (!userAgent || userAgent.trim() === '') return 'none'
  for (const [family, pattern] of BROWSER_FAMILIES) {
    if (pattern.test(userAgent)) return family
  }
  return 'other'
}

/** UTC calendar day, `YYYY-MM-DD`. UTC, not local time, so replicas in different regions agree. */
function utcDayStamp(now: Date): string {
  return now.toISOString().slice(0, 10)
}

function requireSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is missing or shorter than 32 characters, so anonymous session hashes ' +
        'cannot be salted. Set SESSION_SECRET in the environment.',
    )
  }
  return secret
}

/**
 * The salt in force for `now`.
 *
 * Derived from SESSION_SECRET so it is not guessable, and from the UTC date so it rotates daily.
 * Without the secret, an attacker could hash a candidate IP and recognise it in stored data; with
 * it, a stored hash is useless to anyone who does not hold the server key. Rotation is what makes
 * the value expire on its own rather than depending on a deletion job that may never run.
 */
function dailySalt(now: Date): string {
  return createHash('sha256')
    .update(`${requireSecret()}\u0000${utcDayStamp(now)}`, 'utf8')
    .digest('hex')
}

/**
 * A stable-for-one-day, non-reversible fingerprint of an anonymous visitor.
 *
 * 64 hex characters, which is exactly the width of `feedback.session_hash`.
 *
 * `now` is injectable so callers can test rotation and so a single request that computes the hash
 * twice cannot straddle midnight. Fields are joined with a NUL byte, which cannot appear in an IP
 * or in a family name, so ("1.2.3", "4") and ("1.2", "3.4") cannot produce the same digest.
 */
export function sessionHash(
  ip: string | null,
  userAgent: string | null,
  now: Date = new Date(),
): string {
  const material = ['v1', dailySalt(now), ip ?? 'noip', userAgentBucket(userAgent)].join('\u0000')
  return createHash('sha256').update(material, 'utf8').digest('hex')
}

/**
 * The client IP for this request, or null.
 *
 * `x-forwarded-for` is a comma-separated chain appended to by each proxy, so the FIRST entry is
 * the original client and the later ones are the proxies. `x-real-ip` is the single-value fallback
 * some proxies send instead.
 *
 * Both headers are client-supplied and therefore forgeable by anyone talking to the origin
 * directly. On Railway the edge overwrites them, which is what makes them usable here; the values
 * are only ever used for rate limiting and never for authorisation, so a forged one costs an
 * attacker their own rate-limit bucket and nothing else.
 */
export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return null
}

/** Convenience for route handlers: the day-scoped fingerprint of the current request. */
export function requestSessionHash(headers: Headers, now: Date = new Date()): string {
  return sessionHash(clientIpFrom(headers), headers.get('user-agent'), now)
}

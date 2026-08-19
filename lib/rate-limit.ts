// In-memory sliding-window rate limiting.
//
// HONEST LIMITATIONS, because a limiter that is trusted for more than it does is worse than none:
//
//  1. PER PROCESS. The window lives in this module's Map. Two replicas keep two independent
//     windows, so the effective site-wide allowance is `limit x replica count`. On one Railway
//     instance the numbers below are the real numbers; scale to three and PUBLIC_API is 180/min
//     site-wide, not 60.
//  2. RESET ON DEPLOY. A new build starts with an empty Map, so every caller gets a fresh budget
//     the moment the process restarts.
//  3. NOT A SECURITY BOUNDARY. It smooths accidental hammering and casual scraping. A determined
//     attacker rotates IPs and this does nothing. Anything that must not happen twice needs a
//     database constraint, not a counter in RAM.
//
// The fix for 1 and 2 is a shared store (Redis, or a Postgres table); until that exists, this file
// is the honest version of what is actually running.

export interface RateLimitResult {
  allowed: boolean
  /** Requests left in the current window after this one. Zero when the request was refused. */
  remaining: number
  /** Epoch ms at which the oldest hit in the window expires and a slot frees up. */
  resetAt: number
}

export interface RateLimitPolicy {
  /** Namespaces the bucket, so the same IP under two policies gets two independent windows. */
  readonly name: string
  readonly limit: number
  readonly windowMs: number
}

const MINUTE = 60_000
const HOUR = 60 * MINUTE

/** Anonymous reads of the public JSON API. */
export const PUBLIC_API: RateLimitPolicy = { name: 'public_api', limit: 60, windowMs: MINUTE }

/** Any request that writes: edits, notes, upvotes, saves. */
export const WRITE: RateLimitPolicy = { name: 'write', limit: 20, windowMs: MINUTE }

/** Sign-in, sign-up and password checks — the endpoints worth guessing against. */
export const AUTH: RateLimitPolicy = { name: 'auth', limit: 10, windowMs: 15 * MINUTE }

/** The floating feedback button. Deliberately tight; nobody has five useful reports an hour. */
export const FEEDBACK: RateLimitPolicy = { name: 'feedback', limit: 5, windowMs: HOUR }

export const RATE_LIMIT_POLICIES = { PUBLIC_API, WRITE, AUTH, FEEDBACK } as const

interface Bucket {
  /** Hit timestamps in epoch ms, oldest first — `Date.now()` is monotonic enough for this. */
  hits: number[]
  /** Kept per bucket so the sweep can expire a key without knowing which policy created it. */
  windowMs: number
}

const buckets = new Map<string, Bucket>()

/** How often the sweep may run, at most. */
const SWEEP_INTERVAL_MS = 60_000

/** Above this many tracked keys the sweep runs regardless of when it last ran. */
const SWEEP_KEY_PRESSURE = 5_000

let lastSweepAt = 0

/**
 * Drop buckets whose newest hit has aged out of their own window.
 *
 * Without this the Map grows by one entry per distinct key forever, and the keys are derived from
 * client IPs — an unbounded set. This is driven by incoming calls rather than by `setInterval` on
 * purpose: a timer keeps the Node event loop alive (breaking test runners and graceful shutdown
 * unless it is unref'd), and a process receiving no requests has nothing to sweep anyway.
 */
function sweep(now: number): void {
  lastSweepAt = now
  for (const [key, bucket] of buckets) {
    const newest = bucket.hits[bucket.hits.length - 1]
    if (newest === undefined || newest <= now - bucket.windowMs) {
      buckets.delete(key)
    }
  }
}

function maybeSweep(now: number): void {
  if (now - lastSweepAt >= SWEEP_INTERVAL_MS || buckets.size > SWEEP_KEY_PRESSURE) {
    sweep(now)
  }
}

/**
 * Sliding window, not fixed window: the check counts hits in the last `windowMs` from this instant,
 * so a caller cannot get `2 x limit` requests through by straddling a bucket boundary the way a
 * per-calendar-minute counter allows.
 *
 * Calling this RECORDS a hit when the request is allowed. A refused request records nothing, so a
 * client that keeps hammering while blocked does not extend its own penalty indefinitely.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  maybeSweep(now)

  // A non-positive limit means "closed", not "unlimited" — silently allowing everything would be
  // the more dangerous reading of a misconfiguration.
  if (limit <= 0) return { allowed: false, remaining: 0, resetAt: now + windowMs }

  const cutoff = now - windowMs
  const existing = buckets.get(key)
  // Timestamps are appended in order, so filtering is equivalent to dropping a prefix; the array
  // never exceeds `limit` entries, which keeps this O(limit) per call.
  const hits = existing ? existing.hits.filter((at) => at > cutoff) : []

  const oldest = hits[0]

  if (hits.length >= limit) {
    // `oldest` is defined here — hits.length >= limit >= 1 — but the compiler cannot know that.
    const resetAt = (oldest ?? now) + windowMs
    buckets.set(key, { hits, windowMs })
    return { allowed: false, remaining: 0, resetAt }
  }

  hits.push(now)
  buckets.set(key, { hits, windowMs })
  return {
    allowed: true,
    remaining: limit - hits.length,
    resetAt: (oldest ?? now) + windowMs,
  }
}

/** `checkRateLimit` under a named policy, with the policy name folded into the key. */
export function checkPolicy(policy: RateLimitPolicy, key: string): RateLimitResult {
  return checkRateLimit(`${policy.name}:${key}`, policy.limit, policy.windowMs)
}

/** Seconds to put in a `Retry-After` header. Always at least 1 — `Retry-After: 0` means "now". */
export function retryAfterSeconds(result: RateLimitResult, now: number = Date.now()): number {
  return Math.max(1, Math.ceil((result.resetAt - now) / 1000))
}

/** Test-only escape hatch: forget every window. Never call this from a request path. */
export function resetRateLimits(): void {
  buckets.clear()
  lastSweepAt = 0
}

/** Tracked key count — for a health endpoint or a test asserting the sweep actually collects. */
export function rateLimitKeyCount(): number {
  return buckets.size
}

// Minimal in-memory sliding-window rate limiter for the public read-only JSON API
// (app/api/v1/**). No external store, no extra dependency — just a per-process Map.
//
// IMPORTANT LIMITATION: this state lives only in the memory of the single Node process that
// holds it. It resets on every deploy/restart, and it is NOT shared across instances — if the
// app ever runs with more than one replica, each replica enforces its own independent 60/min
// ceiling, so the effective site-wide limit becomes (limit * replicaCount), not 60/min overall.
// That is acceptable for a single-instance deployment but is not "correct" rate limiting at
// multi-instance scale. A shared store (e.g. Redis, or Postgres itself) would be needed for that.

interface Bucket {
  /** Request timestamps (ms epoch) within the current window, oldest first. */
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_MAX_REQUESTS = 60

// Opportunistic cleanup so IPs that stop sending requests don't stay in memory forever.
// Runs at most once per interval, piggybacked on real traffic rather than a timer.
const CLEANUP_INTERVAL_MS = 5 * 60_000
let lastCleanupAt = 0

function cleanupStaleBuckets(now: number, windowMs: number): void {
  if (now - lastCleanupAt < CLEANUP_INTERVAL_MS) return
  lastCleanupAt = now
  for (const [key, bucket] of buckets) {
    const newest = bucket.timestamps[bucket.timestamps.length - 1]
    if (newest === undefined || now - newest > windowMs) {
      buckets.delete(key)
    }
  }
}

export interface RateLimitResult {
  allowed: boolean
  /** Requests remaining in the current window if this one is allowed. */
  remaining: number
  limit: number
  /** Epoch ms when the oldest request in the window falls out of it and a slot frees up. */
  resetAt: number
}

export interface RateLimitOptions {
  windowMs?: number
  max?: number
}

/**
 * Checks and records one request against `key`'s sliding window, e.g. `key = "GET /api/v1/search:203.0.113.4"`.
 * Call once per incoming request. Deliberately synchronous and dependency-free.
 */
export function checkRateLimit(key: string, options?: RateLimitOptions): RateLimitResult {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS
  const max = options?.max ?? DEFAULT_MAX_REQUESTS
  const now = Date.now()

  cleanupStaleBuckets(now, windowMs)

  let bucket = buckets.get(key)
  if (!bucket) {
    bucket = { timestamps: [] }
    buckets.set(key, bucket)
  }

  const windowStart = now - windowMs
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart)

  const allowed = bucket.timestamps.length < max
  if (allowed) {
    bucket.timestamps.push(now)
  }

  const remaining = Math.max(0, max - bucket.timestamps.length)
  const oldest = bucket.timestamps[0] ?? now
  const resetAt = oldest + windowMs

  return { allowed, remaining, limit: max, resetAt }
}

/**
 * Best-effort client IP from standard proxy headers (Railway sits behind one). Never used for
 * anything beyond in-memory rate-limit bucketing here — not logged, not persisted.
 */
export function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const first = forwardedFor?.split(',')[0]?.trim()
  if (first) return first
  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

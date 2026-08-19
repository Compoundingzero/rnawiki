// Minimal in-memory sliding-window rate limiter for the public read-only JSON API
// (app/api/v1/**). No external store, no extra dependency — just a per-process Map.
//
// IMPORTANT LIMITATION: this state lives only in the memory of the single Node process that
// holds it. It resets on every deploy/restart, and it is NOT shared across instances — if the
// app ever runs with more than one replica, each replica enforces its own independent 60/min
// ceiling, so the effective site-wide limit becomes (limit * replicaCount), not 60/min overall.
// That is acceptable for a single-instance deployment but is not "correct" rate limiting at
// multi-instance scale. A shared store (e.g. Redis, or Postgres itself) would be needed for that.
//
// Also used by the two public WRITE endpoints, /api/comprehension and /api/corrections, which
// previously had no IP-level limit at all — their only control was a per-session cap keyed on a
// hash that included the caller's own User-Agent, so rotating one header bought a fresh budget.

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
 * Client IP for rate-limit bucketing. Never logged, never persisted, never used for anything else.
 *
 * TRUSTED-PROXY ASSUMPTION, and it is the whole reason this function is not one line.
 *
 * This used to return the FIRST hop of `X-Forwarded-For`. That header is written by the client and
 * only appended to by proxies, so the first hop is whatever the caller typed: sending a different
 * `X-Forwarded-For` per request bought a fresh 60/minute bucket every time, which made a documented
 * "60 requests/minute per IP" limit into "60 requests/minute per header value a caller chooses".
 * Reproducible in one shell loop, and it also let the buckets Map grow without bound on
 * attacker-chosen keys between cleanups.
 *
 * `X-Forwarded-For` is built left to right, so the LAST entry is the one appended by the proxy
 * closest to this server — the only entry the caller cannot write. Railway puts exactly one proxy
 * in front of the app (`TRUSTED_PROXY_HOPS`), so the client address is the last hop. A caller who
 * sends `X-Forwarded-For: 10.9.9.9, 203.0.113.99` no longer gets a second bucket: the edge appends
 * its own view of the connection, and that value is the one counted.
 *
 * If the deployment ever gains a second proxy layer (a CDN in front of Railway, say), raise
 * TRUSTED_PROXY_HOPS to match, or every client will share one bucket keyed on the CDN's address.
 * Getting it wrong in that direction over-limits real users; getting it wrong the other way is the
 * bypass this replaces.
 */
const TRUSTED_PROXY_HOPS = 1

export function getRequestIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const hops = forwardedFor
      .split(',')
      .map((hop) => hop.trim())
      .filter(Boolean)
    // Count in from the right: with one trusted proxy the client address is the last entry.
    const clientHop = hops[hops.length - TRUSTED_PROXY_HOPS]
    if (clientHop) return clientHop
  }
  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

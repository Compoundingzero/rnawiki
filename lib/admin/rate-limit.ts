// Minimal, in-memory login-attempt rate limiting. This resets on every server restart/deploy
// and is per-process only (does not coordinate across multiple server instances) — acceptable
// for the admin login surface's small user base, but not a substitute for a shared store
// (e.g. Redis) if this ever needs to hold under distributed load or a sustained attack.

const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10

// Periodically forget stale entries so this Map cannot grow without bound.
function sweep(now: number) {
  for (const [key, entry] of attempts) {
    if (entry.resetAt < now) attempts.delete(key)
  }
}

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  if (attempts.size > 5000) sweep(now)
  const entry = attempts.get(key)
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_ATTEMPTS
}

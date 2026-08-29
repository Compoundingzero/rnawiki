/**
 * How the NIH supplement label database says no.
 *
 * Shared between the vocabulary fetcher and the per-ingredient fetcher, because both were fooled by
 * it in the same way and a second copy would drift.
 */

/**
 * Whether a response body is this service's rate-limit refusal.
 *
 * The refusal arrives as **HTTP 200 with an error object in the body**, not as 429. That single
 * fact explains the entire history of this integration: code that checked `response.status === 429`
 * saw a successful response containing an empty result, recorded "this ingredient has no marketed
 * labels", and carried on. The circuit breaker never tripped because nothing ever looked like a
 * failure. Runs appeared to progress while recording nothing, and the same names were re-queried on
 * the next run because they had been cached as answered.
 *
 * No rate limit is documented anywhere in the API guide — checked, and the absence is the finding.
 * The refusal message points at a contact address rather than a number.
 */
export function isRateLimitRefusal(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object') return false
  const error = (payload as { error?: { code?: unknown } }).error
  return typeof error?.code === 'string' && error.code === 'OVER_RATE_LIMIT'
}

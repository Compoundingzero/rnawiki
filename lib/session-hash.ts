import { createHash } from 'node:crypto'

/**
 * Privacy-conscious, non-identifying session hash used only to rate-limit and de-duplicate
 * anonymous public submissions (comprehension responses, correction submissions). Never
 * derived from anything that identifies a person — IP + a rotating daily salt + a coarse
 * user-agent bucket, one-way hashed. Not a fingerprinting mechanism: it is deliberately
 * coarse enough that it cannot be reversed to a specific visitor across days.
 */
export function makeSessionHash(ip: string, userAgent: string, daySalt: string): string {
  const uaBucket = userAgent.slice(0, 40) // coarse, avoids over-fingerprinting rare UAs
  return createHash('sha256').update(`${ip}|${uaBucket}|${daySalt}`).digest('hex')
}

export function currentDaySalt(secret: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${secret}|${day}`).digest('hex').slice(0, 16)
}

import { createHash } from 'node:crypto'

/**
 * Privacy-conscious, non-identifying session hash used only to de-duplicate and bound anonymous
 * public submissions (comprehension responses, correction submissions). Never derived from
 * anything that identifies a person — IP plus a rotating daily salt, one-way hashed. Not a
 * fingerprinting mechanism: deliberately too coarse to be reversed to a specific visitor across
 * days.
 *
 * NO USER-AGENT. This used to mix in `userAgent.slice(0, 40)`, on a stated privacy rationale
 * ("coarse, avoids over-fingerprinting rare UAs") that never considered who writes the header.
 * The caller does. Every input to this hash was therefore attacker-chosen except the IP, so a new
 * User-Agent string was a new anonymous identity with a fresh budget: /api/corrections' documented
 * 8-per-day cap fell to a one-line header change (12 of 12 accepted with rotation, versus 9 then
 * three 429s without), and /api/comprehension's one-answer-per-question dedupe fell the same way —
 * which turned the answer key of the teach-back test into an oracle and let one scripted loop
 * manufacture the site's only public percentage in under a second.
 *
 * Dropping the bucket makes the identity coarser, not weaker: everything behind one NAT now shares
 * a day-bucket. That is the correct trade for a control whose only job is to bound anonymous
 * writes, and the endpoints additionally carry a real per-IP rate limit now (lib/rate-limit.ts),
 * which is where volume is meant to be bounded. Do not reintroduce any caller-supplied header
 * here; if a stronger identity is ever needed it has to come from something the caller cannot set.
 */
export function makeSessionHash(ip: string, daySalt: string): string {
  return createHash('sha256').update(`${ip}|${daySalt}`).digest('hex')
}

export function currentDaySalt(secret: string): string {
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${secret}|${day}`).digest('hex').slice(0, 16)
}

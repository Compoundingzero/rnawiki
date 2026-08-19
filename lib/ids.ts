// Identifier and slug generation.
//
// Ids are the one place in this codebase where non-determinism is correct: a new row needs a value
// nothing else has ever held. Everything downstream of an id — the engine sweep, the verification
// hash, the routing decision — stays reproducible, because none of them read the id. Slugs, by
// contrast, ARE deterministic: the same title always produces the same slug, and only a genuine
// collision (checked against the database by `uniqueSlug`) changes that.

import { createHash, randomBytes } from 'node:crypto'

const BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz'

/**
 * Largest multiple of 36 that fits in a byte. Bytes at or above it are discarded rather than
 * folded with `% 36`, because 256 is not a multiple of 36: a plain modulo would make the first
 * four characters of the alphabet about 14% more likely than the rest. Rejection sampling costs a
 * few extra bytes and gives a flat distribution.
 */
const BASE36_REJECTION_CEILING = 252

/** Random characters appended to every id: 36^10 ≈ 3.6e15 values inside a single millisecond. */
const ID_RANDOM_CHARS = 10

/**
 * Width of the base36 millisecond timestamp. Date.now() in base36 is 8 characters today and turns
 * 9 in 2059; an unpadded 9-character stamp would sort BEFORE every 8-character one, silently
 * inverting id order. Padding to 9 fixes the width until 36^9 ms, i.e. the year 5189.
 * Sortable-ish, not sortable: two ids minted in the same millisecond order arbitrarily.
 */
const ID_TIMESTAMP_CHARS = 9

/** Matches `drugs.slug` varchar(128) with headroom for a numeric disambiguation suffix. */
export const SLUG_MAX_LENGTH = 96

/** Cryptographically secure random string over [0-9a-z], uniformly distributed. */
function randomBase36(length: number): string {
  let out = ''
  while (out.length < length) {
    // Over-request so the loop almost always finishes in one pass despite rejections.
    const bytes = randomBytes((length - out.length) * 2)
    for (const byte of bytes) {
      if (out.length === length) break
      if (byte >= BASE36_REJECTION_CEILING) continue
      // charAt, not [], because index access returns `string | undefined` under
      // noUncheckedIndexedAccess and the index here is provably in range.
      out += BASE36.charAt(byte % BASE36.length)
    }
  }
  return out
}

/**
 * `prefix_<base36 ms timestamp>_<10 random base36 chars>`, e.g. `rev_lz9k3p0q_4f8t2md0xr`.
 *
 * The prefix is sanitised rather than rejected so a caller's typo cannot produce an id that fails
 * a varchar length or pattern check much later, in a transaction, with no useful stack.
 */
export function newId(prefix: string): string {
  const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16) || 'id'
  const stamp = Date.now().toString(36).padStart(ID_TIMESTAMP_CHARS, '0')
  return `${cleanPrefix}_${stamp}${randomBase36(ID_RANDOM_CHARS)}`
}

/**
 * Deterministic fallback for input that contains no slug-able characters at all — "中文", "***",
 * "", an emoji-only title. Returning '' would collide with every other such input and produce the
 * URL `/drug/`, so we hash instead: distinct inputs get distinct slugs, and the same input always
 * gets the same one.
 */
function hashedSlug(input: string): string {
  return `s-${createHash('sha256').update(input, 'utf8').digest('hex').slice(0, 12)}`
}

/** Trim to `max` characters without leaving a dangling separator. */
function trimSlug(value: string, max: number): string {
  return value.slice(0, Math.max(0, max)).replace(/-+$/, '')
}

/**
 * URL-safe slug: lowercase ASCII alphanumerics and single hyphens.
 *
 * NFKD splits accented characters into a base letter plus a combining mark ("é" -> "e" + U+0301),
 * so stripping the U+0300–U+036F block afterwards keeps the readable letter instead of dropping
 * the whole character. Never returns an empty string.
 */
export function slugify(input: string): string {
  const slug = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const capped = trimSlug(slug, SLUG_MAX_LENGTH)
  return capped.length > 0 ? capped : hashedSlug(input)
}

/** Numeric suffixes tried before falling back to a random one. */
const MAX_NUMERIC_SLUG_ATTEMPTS = 200

/**
 * `slugify(base)`, then `-2`, `-3`, ... until `exists` says the slug is free.
 *
 * The suffix is fitted inside SLUG_MAX_LENGTH by shortening the stem, not by exceeding the cap —
 * a slug that overflows its column fails at INSERT time, long after this function returned.
 *
 * `exists` is awaited in sequence on purpose: each answer decides whether the next candidate is
 * needed, and the common case is one call.
 */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base)
  if (!(await exists(root))) return root

  for (let n = 2; n <= MAX_NUMERIC_SLUG_ATTEMPTS; n++) {
    const suffix = `-${n}`
    const candidate = `${trimSlug(root, SLUG_MAX_LENGTH - suffix.length)}${suffix}`
    if (!(await exists(candidate))) return candidate
  }

  // 200 taken variants of one name means either an import loop or an attack; a random suffix ends
  // the sequential scan instead of walking to -10000.
  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = `-${randomBase36(6)}`
    const candidate = `${trimSlug(root, SLUG_MAX_LENGTH - suffix.length)}${suffix}`
    if (!(await exists(candidate))) return candidate
  }

  throw new Error(
    `Could not find a free slug for "${base}" after ${MAX_NUMERIC_SLUG_ATTEMPTS} numeric and 10 ` +
      'random attempts',
  )
}

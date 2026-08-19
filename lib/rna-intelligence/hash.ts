// Deterministic digest for the verification badge.
//
// The badge printed on a record ("MVS-4A1C-93E0") answers one question: is the structure on screen
// still the structure the engine swept? So the digest has to be a pure function of the swept input,
// reproducible in any process on any machine, with no dependency to install and no clock reading
// anywhere near it.
//
// FNV-1a is NOT a cryptographic hash. It detects accidental divergence — a sequence edited after
// verification, a stale badge copied onto a different record, a migration that dropped a step —
// and it is trivially forgeable by anyone who wants to. If tamper-evidence is ever needed,
// this is the file to replace with a keyed SHA-256, and every stored badge is invalidated when that
// happens, which is what `ENGINE_VERSION` in index.ts exists to make visible.

const FNV_OFFSET_BASIS_64 = 0xcbf29ce484222325n
const FNV_PRIME_64 = 0x100000001b3n
/** FNV is defined modulo 2^64; BigInt is unbounded, so the product is masked back every round. */
const MASK_64 = 0xffffffffffffffffn

const UTF8 = new TextEncoder()

/**
 * FNV-1a, 64-bit, over the UTF-8 bytes of `input`. Returns 16 uppercase hex characters.
 *
 * Bytes rather than UTF-16 code units on purpose: hashing code units would make the digest depend
 * on JavaScript's internal string encoding, so the same text hashed in another language — a
 * Python verification script, a Postgres function — would disagree with this one for any
 * non-ASCII character. Step names carry Greek letters and degree signs routinely.
 */
export function fnv1a64(input: string): string {
  const bytes = UTF8.encode(input)
  let hash = FNV_OFFSET_BASIS_64
  for (const byte of bytes) {
    hash ^= BigInt(byte)
    hash = (hash * FNV_PRIME_64) & MASK_64
  }
  return hash.toString(16).toUpperCase().padStart(16, '0')
}

/** Separates the length prefix from the field body. See `verificationHashFor`. */
const FIELD_DELIMITER = '\u0000'

/**
 * Hashes an ordered list of fields and formats the result as the badge `MVS-XXXX-XXXX`.
 *
 * WHY THE FRAMING. Concatenating the parts directly is not injective: `['AUG', 'CAUG']` and
 * `['AUGC', 'AUG']` both flatten to `AUGCAUG`, so a sequence and a modality could be shuffled
 * across the boundary between them and produce an identical badge from genuinely different input.
 * That is a collision anyone can construct by hand, which would make the badge worthless.
 *
 * Each field is therefore framed as `length` + NUL + `body`. The length prefix makes the
 * concatenation self-delimiting — the reader always knows where a field ends — so the framed
 * string maps back to exactly one input list. The NUL keeps the prefix unambiguous even when a
 * field begins with a digit, and NUL appears in no field the engine passes here (an engine
 * version, a structure type, a cleaned sequence, a modality, step ids and phases). Length alone
 * would suffice for injectivity; the NUL costs one byte and removes the need to reason about it.
 *
 * The badge shows the first 8 of the 16 hex characters, matching the reference wireframe's format.
 * That is 32 bits, so two unrelated records collide after roughly 65,000 of them — fine for a
 * human-readable identity check, not a uniqueness guarantee. Call `fnv1a64` directly for the full
 * 64-bit digest when storing one.
 */
export function verificationHashFor(parts: string[]): string {
  const framed = parts
    .map((part) => `${part.length}${FIELD_DELIMITER}${part}`)
    .join(FIELD_DELIMITER)
  const digest = fnv1a64(framed)
  // `slice` on a string is total — it returns '' past the end rather than undefined — so no
  // index-access guard is needed, and a 16-character digest always fills both groups.
  return `MVS-${digest.slice(0, 4)}-${digest.slice(4, 8)}`
}

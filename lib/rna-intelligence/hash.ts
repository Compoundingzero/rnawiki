// Deterministic digest for the verification badge. It is a pure function of the swept input.
// FNV-1a detects accidental divergence but is not cryptographic or tamper-evident. A future hash
// change must also change `ENGINE_VERSION` so stored badges are not mistaken for current results.

const FNV_OFFSET_BASIS_64 = 0xcbf29ce484222325n
const FNV_PRIME_64 = 0x100000001b3n
/** FNV is defined modulo 2^64; BigInt is unbounded, so the product is masked back every round. */
const MASK_64 = 0xffffffffffffffffn

const UTF8 = new TextEncoder()

/**
 * FNV-1a, 64-bit, over the UTF-8 bytes of `input`. Returns 16 uppercase hex characters.
 *
 * UTF-8 bytes keep the digest reproducible across languages for non-ASCII input.
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
 * Direct concatenation is ambiguous: `['AUG', 'CAUG']` and `['AUGC', 'AUG']` both become
 * `AUGCAUG`. Length-prefixing each field with a NUL delimiter preserves field boundaries. Engine
 * inputs do not contain NUL.
 *
 * The badge shows the first 32 bits for readability. It is an identity check, not a uniqueness
 * guarantee; stored records use the full digest.
 */
export function verificationHashFor(parts: string[]): string {
  const framed = parts
    .map((part) => `${part.length}${FIELD_DELIMITER}${part}`)
    .join(FIELD_DELIMITER)
  const digest = fnv1a64(framed)
  return `MVS-${digest.slice(0, 4)}-${digest.slice(4, 8)}`
}

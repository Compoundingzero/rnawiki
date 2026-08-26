// Account credentials: password hashing, input validation, and the ORCID check digit.

import { z } from 'zod'
import bcrypt from 'bcryptjs'

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

/**
 * bcrypt work factor. 12 is ~250ms per hash on current server hardware: slow enough that an
 * offline attacker on a stolen dump gets a few thousand guesses per second per core instead of
 * billions, fast enough that a sign-in does not feel broken. Raising it later is safe — the cost
 * is encoded in the stored hash, so old hashes keep verifying and only re-hash on next sign-in.
 */
export const BCRYPT_COST = 12

export const PASSWORD_MIN_LENGTH = 10

/**
 * bcrypt hashes at most the first 72 BYTES of input and silently ignores the rest, so a 5000
 * character "password" is neither stronger nor slower than its first 72 bytes. Capping the input
 * makes that honest and stops a huge body from being pushed through the KDF as a cheap DoS.
 */
export const PASSWORD_MAX_LENGTH = 200

/**
 * Passwords that pass the length rule and are still worthless. Deliberately short: this is a
 * speed bump against the top of every credential-stuffing list, not a substitute for one. Entries
 * below PASSWORD_MIN_LENGTH would be dead weight — the length check rejects them first — so every
 * entry here is at least that long.
 */
const COMMON_PASSWORDS = new Set([
  'password12',
  'password123',
  'password1234',
  'passw0rd12',
  'passw0rd123',
  '1234567890',
  '12345678901',
  '123456789012',
  'qwertyuiop',
  'qwerty12345',
  'qwertyuiop123',
  'letmein123',
  'iloveyou123',
  'admin12345',
  'administrator',
  'welcome123',
  'abc123456789',
  'football123',
  'baseball123',
  'monkey12345',
  'dragon12345',
  'sunshine123',
  'princess123',
  'trustno1234',
  'changeme123',
  'p@ssw0rd123',
  'rnawiki123',
])

/** Fewer than this many distinct characters makes a long password a short one in disguise. */
const MIN_DISTINCT_CHARS = 4

export interface PasswordVerdict {
  ok: boolean
  reason?: string
}

export function validatePassword(password: string): PasswordVerdict {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, reason: `Use at least ${PASSWORD_MIN_LENGTH} characters.` }
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, reason: `Use at most ${PASSWORD_MAX_LENGTH} characters.` }
  }
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, reason: 'That password appears on public breach lists. Choose another.' }
  }
  if (new Set(password).size < MIN_DISTINCT_CHARS) {
    return { ok: false, reason: 'Use a more varied password — this one repeats a few characters.' }
  }
  return { ok: true }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST)
}

/**
 * Returns false rather than throwing on a malformed or empty stored hash. bcryptjs throws when the
 * hash is not a valid bcrypt string, and a thrown error inside a sign-in handler is a 500 that
 * tells an attacker the account exists in a broken state. A wrong password and an unusable hash
 * should be indistinguishable from outside.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false
  try {
    return await bcrypt.compare(plain, hash)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

/**
 * Trim and lowercase. The local part of an address is case-SENSITIVE per RFC 5321, but no mail
 * provider anyone signs up with treats it that way, and `users_email_unique` is a
 * `lower(email)` index — so storing anything but the lowercased form would let "Felix@x.com" and
 * "felix@x.com" collide at the database instead of at the form.
 */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

// ---------------------------------------------------------------------------
// ORCID — ISO 7064 MOD 11-2
// ---------------------------------------------------------------------------

/**
 * Canonical `0000-0000-0000-000X` form, or null when the value is not a valid ORCID iD.
 *
 * Accepts what people actually paste: the bare digits, the hyphenated form, or the full
 * https://orcid.org/… URL. Validation is a real check-digit computation, not a shape match —
 * `0000-0002-1825-0097` is valid and `0000-0002-1825-0098` is not, and only the checksum can
 * tell those apart.
 *
 * ISO 7064 MOD 11-2, exactly as ORCID specifies it: walk the first 15 digits accumulating
 * `total = (total + digit) * 2`, then the check value is `(12 - total % 11) % 11`, rendered as a
 * digit or as 'X' for 10.
 */
export function canonicalOrcid(value: string): string | null {
  const compact = value
    .trim()
    .toUpperCase()
    .replace(/^HTTPS?:\/\/(WWW\.)?ORCID\.ORG\//, '')
    .replace(/[\s-]/g, '')

  // 15 digits then a digit or X. The final character is the only place X is legal.
  if (!/^\d{15}[\dX]$/.test(compact)) return null

  let total = 0
  for (let i = 0; i < 15; i++) {
    // charCodeAt keeps this free of `string | undefined` handling; the regex above already proved
    // every one of these positions is an ASCII digit.
    total = (total + (compact.charCodeAt(i) - 48)) * 2
  }
  const remainder = total % 11
  const checkValue = (12 - remainder) % 11
  const expected = checkValue === 10 ? 'X' : String(checkValue)

  if (compact.charAt(15) !== expected) return null

  const groups = [compact.slice(0, 4), compact.slice(4, 8), compact.slice(8, 12), compact.slice(12)]
  return groups.join('-')
}

/** True when `value` is a well-formed ORCID iD whose check digit matches. */
export function validateOrcid(value: string): boolean {
  return canonicalOrcid(value) !== null
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

/**
 * HTML forms post absent optional fields as '' rather than omitting them. Mapping blank to
 * undefined before validation is what makes `.optional()` mean "the user left it empty" instead
 * of "the user typed an empty ORCID iD", which would fail the checksum and block the sign-up.
 */
function blankToUndefined(value: unknown): unknown {
  return typeof value === 'string' && value.trim() === '' ? undefined : value
}

const emailSchema = z
  .string()
  .transform(normaliseEmail)
  .pipe(z.string().min(3).max(320).email('Enter a valid email address.'))

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your name — at least 2 characters.')
  .max(160, 'Names are limited to 160 characters.')

const passwordSchema = z.string().superRefine((value, ctx) => {
  const verdict = validatePassword(value)
  if (!verdict.ok) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: verdict.reason ?? 'That password cannot be used.',
    })
  }
})

const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Handles are at least 3 characters.')
  .max(64, 'Handles are at most 64 characters.')
  .regex(
    /^[a-z0-9][a-z0-9_-]*$/,
    'Handles use lowercase letters, numbers, hyphens and underscores, and start with a letter ' +
      'or number.',
  )

const orcidSchema = z
  .string()
  .trim()
  .refine(validateOrcid, 'That ORCID iD is not valid — its final check digit does not match.')
  // `?? value` is unreachable: refine already proved canonicalOrcid returns a string. It is here
  // because the type system cannot carry that proof across the refine boundary.
  .transform((value) => canonicalOrcid(value) ?? value)

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  handle: z.preprocess(blankToUndefined, handleSchema.optional()),
  orcid: z.preprocess(blankToUndefined, orcidSchema.optional()),
})

/**
 * Sign-in deliberately does NOT apply the strength rules. They exist to stop weak passwords being
 * created; applying them at sign-in would lock out any account whose password predates a rule
 * change, and would leak which stored passwords are weak.
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.').max(PASSWORD_MAX_LENGTH),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>

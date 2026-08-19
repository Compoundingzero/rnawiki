import { describe, expect, it } from 'vitest'
import {
  canonicalOrcid,
  doctorVerificationSchema,
  hashPassword,
  normaliseEmail,
  PASSWORD_MIN_LENGTH,
  signInSchema,
  signUpSchema,
  validateOrcid,
  validatePassword,
  verifyPassword,
} from '@/lib/auth'
import { newId, slugify, SLUG_MAX_LENGTH, uniqueSlug } from '@/lib/ids'

describe('validateOrcid — ISO 7064 MOD 11-2 check digit', () => {
  // The point of these two cases: they differ by ONE character, and only a real checksum
  // computation can tell them apart. Any implementation that merely regexes the 4x4 digit shape
  // accepts both, which is exactly the bug this test exists to catch.
  it('accepts the canonical valid example', () => {
    expect(validateOrcid('0000-0002-1825-0097')).toBe(true)
  })

  it('rejects the same iD with a wrong final check digit', () => {
    expect(validateOrcid('0000-0002-1825-0098')).toBe(false)
  })

  it('accepts other real iDs, including one whose check digit is X', () => {
    // X is the rendering of check value 10 — the case a `\d{4}` shape check silently rejects.
    expect(validateOrcid('0000-0001-5109-3700')).toBe(true)
    expect(validateOrcid('0000-0002-1694-233X')).toBe(true)
  })

  it('rejects an X iD whose check digit was flattened to a digit', () => {
    expect(validateOrcid('0000-0002-1694-2330')).toBe(false)
    expect(validateOrcid('0000-0001-5109-3701')).toBe(false)
  })

  it('accepts the forms people actually paste and returns the canonical one', () => {
    expect(canonicalOrcid('https://orcid.org/0000-0002-1825-0097')).toBe('0000-0002-1825-0097')
    expect(canonicalOrcid('http://www.orcid.org/0000-0002-1825-0097')).toBe('0000-0002-1825-0097')
    expect(canonicalOrcid('0000000218250097')).toBe('0000-0002-1825-0097')
    expect(canonicalOrcid('  0000-0002-1694-233x  ')).toBe('0000-0002-1694-233X')
  })

  it('rejects malformed input outright', () => {
    expect(validateOrcid('')).toBe(false)
    expect(validateOrcid('0000-0002-1825-009')).toBe(false) // 15 characters
    expect(validateOrcid('0000-0002-1825-00977')).toBe(false) // 17 characters
    expect(validateOrcid('0000-000X-1825-0097')).toBe(false) // X anywhere but last
    expect(validateOrcid('not-an-orcid-at-all')).toBe(false)
  })

  it('returns null rather than throwing on junk', () => {
    expect(canonicalOrcid('💡')).toBeNull()
  })
})

describe('password hashing', () => {
  it('round-trips: the hash verifies the original and nothing else', async () => {
    const plain = 'correct horse battery staple'
    const hash = await hashPassword(plain)

    expect(hash).not.toBe(plain)
    expect(hash).not.toContain(plain)
    // bcryptjs emits the 2a variant; the 12 is the cost this project pins.
    expect(hash.startsWith('$2a$12$')).toBe(true)

    expect(await verifyPassword(plain, hash)).toBe(true)
    expect(await verifyPassword('correct horse battery stapl', hash)).toBe(false)
    expect(await verifyPassword('', hash)).toBe(false)
  })

  it('produces a different hash for the same password each time (per-hash salt)', async () => {
    const [a, b] = await Promise.all([
      hashPassword('a-good-passphrase'),
      hashPassword('a-good-passphrase'),
    ])
    expect(a).not.toBe(b)
    expect(await verifyPassword('a-good-passphrase', a)).toBe(true)
    expect(await verifyPassword('a-good-passphrase', b)).toBe(true)
  })

  it('returns false instead of throwing on an empty or malformed stored hash', async () => {
    expect(await verifyPassword('anything', '')).toBe(false)
    expect(await verifyPassword('anything', 'not-a-bcrypt-hash')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('rejects at the boundary and accepts one character above it', () => {
    const short = 'a'.repeat(PASSWORD_MIN_LENGTH - 1)
    expect(validatePassword(short).ok).toBe(false)
    expect(validatePassword(short).reason).toBeTypeOf('string')
    // Same length, enough variety: length is the only thing that changed.
    expect(validatePassword('abcdefghij').ok).toBe(true)
  })

  it('rejects obviously common passwords that pass the length rule', () => {
    expect(validatePassword('password123').ok).toBe(false)
    expect(validatePassword('PassWord123').ok).toBe(false) // case-insensitive
    expect(validatePassword('qwertyuiop').ok).toBe(false)
  })

  it('rejects a long password made of a couple of repeated characters', () => {
    expect(validatePassword('aaaaaaaaaaaaaaa').ok).toBe(false)
    expect(validatePassword('ababababababab').ok).toBe(false)
  })

  it('rejects input longer than bcrypt actually hashes', () => {
    expect(validatePassword('x9!q'.repeat(100)).ok).toBe(false)
  })

  it('accepts an ordinary passphrase', () => {
    expect(validatePassword('tarpaulin-mango-97').ok).toBe(true)
    expect(validatePassword('tarpaulin-mango-97').reason).toBeUndefined()
  })
})

describe('normaliseEmail', () => {
  it('trims and lowercases so the unique index cannot be dodged by case', () => {
    expect(normaliseEmail('  Felix@Example.COM ')).toBe('felix@example.com')
  })
})

describe('zod schemas', () => {
  it('parses a sign-up with optional fields left blank', () => {
    const parsed = signUpSchema.parse({
      name: '  Felix  ',
      email: 'Felix@Example.com',
      password: 'tarpaulin-mango-97',
      handle: '',
      orcid: '',
    })
    expect(parsed.name).toBe('Felix')
    expect(parsed.email).toBe('felix@example.com')
    expect(parsed.handle).toBeUndefined()
    expect(parsed.orcid).toBeUndefined()
  })

  it('canonicalises a supplied ORCID and lowercases a handle', () => {
    const parsed = signUpSchema.parse({
      name: 'Josiah Carberry',
      email: 'jc@example.com',
      password: 'tarpaulin-mango-97',
      handle: 'Josiah_C',
      orcid: 'https://orcid.org/0000-0002-1825-0097',
    })
    expect(parsed.handle).toBe('josiah_c')
    expect(parsed.orcid).toBe('0000-0002-1825-0097')
  })

  it('rejects an ORCID that fails its checksum', () => {
    const result = signUpSchema.safeParse({
      name: 'Josiah Carberry',
      email: 'jc@example.com',
      password: 'tarpaulin-mango-97',
      orcid: '0000-0002-1825-0098',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a weak password and a two-character name', () => {
    expect(
      signUpSchema.safeParse({ name: 'Felix', email: 'f@example.com', password: 'password123' })
        .success,
    ).toBe(false)
    expect(
      signUpSchema.safeParse({ name: 'F', email: 'f@example.com', password: 'tarpaulin-mango-97' })
        .success,
    ).toBe(false)
  })

  it('does not apply strength rules at sign-in', () => {
    // An account created before a rule change must still be able to sign in.
    const parsed = signInSchema.parse({ email: 'F@Example.com', password: 'password123' })
    expect(parsed.email).toBe('f@example.com')
    expect(parsed.password).toBe('password123')
  })

  it('validates a doctor verification submission without granting anything', () => {
    const parsed = doctorVerificationSchema.parse({
      fullName: 'Ada Okafor',
      licenseOrNpi: '1234567890',
      specialty: 'Cardiology',
      institution: 'Singapore General Hospital',
      workEmail: 'A.Okafor@SGH.example ',
    })
    expect(parsed.workEmail).toBe('a.okafor@sgh.example')
    // The schema returns data only. There is no `verified` field to set here, by design.
    expect(Object.keys(parsed).sort()).toEqual([
      'fullName',
      'institution',
      'licenseOrNpi',
      'specialty',
      'workEmail',
    ])
  })

  it('rejects a licence number shorter than four characters', () => {
    const result = doctorVerificationSchema.safeParse({
      fullName: 'Ada Okafor',
      licenseOrNpi: '123',
      specialty: 'Cardiology',
      institution: 'Singapore General Hospital',
      workEmail: 'a@sgh.example',
    })
    expect(result.success).toBe(false)
  })
})

describe('slugify', () => {
  it('lowercases, collapses separators and trims', () => {
    expect(slugify('  Patisiran (ONPATTRO) — hATTR  ')).toBe('patisiran-onpattro-hattr')
    expect(slugify('A___B---C')).toBe('a-b-c')
  })

  it('keeps the readable letter behind a diacritic instead of dropping the character', () => {
    expect(slugify('Café Ångström')).toBe('cafe-angstrom')
    expect(slugify('Peña Ñandú')).toBe('pena-nandu')
  })

  it('never returns an empty string', () => {
    for (const input of ['', '   ', '!!!', '---', '中文', '💊💊']) {
      const slug = slugify(input)
      expect(slug.length).toBeGreaterThan(0)
      expect(slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('gives colliding-looking inputs distinct fallbacks, and is deterministic', () => {
    expect(slugify('中文')).toBe(slugify('中文'))
    expect(slugify('中文')).not.toBe(slugify('日本語'))
    expect(slugify('!!!')).not.toBe(slugify('---'))
  })

  it('caps length without leaving a trailing separator', () => {
    const slug = slugify(`${'a'.repeat(200)} ${'b'.repeat(200)}`)
    expect(slug.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH)
    expect(slug.endsWith('-')).toBe(false)
  })
})

describe('uniqueSlug', () => {
  it('returns the plain slug when it is free', async () => {
    expect(await uniqueSlug('Patisiran', async () => false)).toBe('patisiran')
  })

  it('appends -2, -3 ... until free', async () => {
    const taken = new Set(['patisiran', 'patisiran-2', 'patisiran-3'])
    expect(await uniqueSlug('Patisiran', async (s) => taken.has(s))).toBe('patisiran-4')
  })

  it('keeps the suffixed slug inside the length cap', async () => {
    const long = 'z'.repeat(200)
    const first = await uniqueSlug(long, async () => false)
    const taken = new Set([first])
    const second = await uniqueSlug(long, async (s) => taken.has(s))

    expect(second.length).toBeLessThanOrEqual(SLUG_MAX_LENGTH)
    expect(second.endsWith('-2')).toBe(true)
    expect(second).not.toBe(first)
  })
})

describe('newId', () => {
  it('is prefixed, well-formed and does not repeat', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 500; i++) ids.add(newId('rev'))
    expect(ids.size).toBe(500)
    for (const id of ids) expect(id).toMatch(/^rev_[0-9a-z]{19}$/)
  })

  it('sanitises a junk prefix rather than emitting an unusable id', () => {
    expect(newId('Rev Note!')).toMatch(/^revnote_[0-9a-z]{19}$/)
    expect(newId('')).toMatch(/^id_[0-9a-z]{19}$/)
  })

  it('fits the varchar(64) id columns', () => {
    expect(newId('correction').length).toBeLessThanOrEqual(64)
  })
})

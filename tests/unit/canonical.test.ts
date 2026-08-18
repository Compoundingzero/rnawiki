import { describe, expect, it } from 'vitest'
import {
  entityUrl,
  entityPath,
  embedUrl,
  isValidSlug,
  slugify,
  resolveLegacyRedirect,
  type LegacyRedirectRule,
} from '@/lib/canonical'

// SITE_URL is read once into a module-level constant in lib/canonical.ts (from .env, loaded by
// tests/setup/load-env.ts before this file's imports run), so these assert the *shape* of the
// output — absolute vs. relative, and that the origin-bearing URLs end in the same path a bare
// entityPath() produces — rather than pinning an exact origin string that would only be an
// accident of the current .env, per the task brief's "entityUrl/entityPath/embedUrl shape".
describe('entityUrl / entityPath / embedUrl shape', () => {
  it('entityPath returns a bare /r/[slug] path with no origin', () => {
    const path = entityPath('bpc-157')
    expect(path).toBe('/r/bpc-157')
    expect(path.startsWith('http')).toBe(false)
  })

  it('entityUrl returns an absolute URL ending in the same path entityPath produces', () => {
    const path = entityPath('rapamycin')
    const url = entityUrl('rapamycin')
    expect(url).toMatch(/^https?:\/\//)
    expect(url.endsWith(path)).toBe(true)
  })

  it('embedUrl returns an absolute /embed/claim/[id] URL for a numeric claim id', () => {
    const url = embedUrl(42)
    expect(url).toMatch(/^https?:\/\/.+\/embed\/claim\/42$/)
  })

  it('embedUrl differs per claim id', () => {
    expect(embedUrl(1)).not.toBe(embedUrl(2))
  })
})

describe('isValidSlug', () => {
  it('accepts lowercase alphanumeric segments joined by single hyphens', () => {
    expect(isValidSlug('bpc-157')).toBe(true)
    expect(isValidSlug('casgevy')).toBe(true)
    expect(isValidSlug('a1-b2-c3')).toBe(true)
  })

  it('rejects uppercase characters', () => {
    expect(isValidSlug('BPC-157')).toBe(false)
    expect(isValidSlug('Bpc-157')).toBe(false)
  })

  it('rejects leading, trailing, and repeated hyphens', () => {
    expect(isValidSlug('-bpc-157')).toBe(false)
    expect(isValidSlug('bpc-157-')).toBe(false)
    expect(isValidSlug('bpc--157')).toBe(false)
  })

  it('rejects spaces, underscores, and other punctuation', () => {
    expect(isValidSlug('bpc 157')).toBe(false)
    expect(isValidSlug('bpc_157')).toBe(false)
    expect(isValidSlug('bpc.157')).toBe(false)
    expect(isValidSlug('bpc/157')).toBe(false)
  })

  it('rejects the empty string', () => {
    expect(isValidSlug('')).toBe(false)
  })

  it('rejects a slug over 200 characters', () => {
    const tooLong = 'a'.repeat(201)
    expect(isValidSlug(tooLong)).toBe(false)
  })

  it('accepts a slug at exactly 200 characters', () => {
    const exactly200 = 'a'.repeat(200)
    expect(isValidSlug(exactly200)).toBe(true)
  })
})

describe('slugify', () => {
  it('lowercases uppercase input', () => {
    expect(slugify('BPC-157')).toBe('bpc-157')
  })

  it('strips accents/diacritics down to base characters', () => {
    expect(slugify('Café Molécule')).toBe('cafe-molecule')
  })

  it('collapses repeated separators into a single hyphen', () => {
    expect(slugify('BPC   157 -- peptide')).toBe('bpc-157-peptide')
  })

  it('trims leading and trailing hyphens produced by punctuation at the edges', () => {
    expect(slugify('  -Rapamycin (Sirolimus)- ')).toBe('rapamycin-sirolimus')
  })

  it('produces output that is itself a valid slug for typical entity names', () => {
    const slug = slugify('Casgevy (exagamglogene autotemcel)')
    expect(isValidSlug(slug)).toBe(true)
    expect(slug).toBe('casgevy-exagamglogene-autotemcel')
  })

  it('collapses non-alphanumeric runs, including at both edges, to empty rather than a bare hyphen', () => {
    expect(slugify('!!!')).toBe('')
  })
})

describe('resolveLegacyRedirect', () => {
  const rules: LegacyRedirectRule[] = [
    { fromPath: '/c/bpc-157', toPath: '/r/bpc-157', statusCode: 301 },
    { fromPath: '/solve', toPath: null, statusCode: 410 },
    { fromPath: '/stack-builder', toPath: null, statusCode: 410 },
  ]

  it('resolves a 301 case to its new canonical path', () => {
    expect(resolveLegacyRedirect('/c/bpc-157', rules)).toEqual({
      statusCode: 301,
      location: '/r/bpc-157',
    })
  })

  it('resolves a 410 case with a null location (Gone, no replacement)', () => {
    expect(resolveLegacyRedirect('/solve', rules)).toEqual({
      statusCode: 410,
      location: null,
    })
  })

  it('returns null for a path with no matching legacy rule', () => {
    expect(resolveLegacyRedirect('/r/bpc-157', rules)).toBeNull()
    expect(resolveLegacyRedirect('/never-existed', rules)).toBeNull()
  })
})

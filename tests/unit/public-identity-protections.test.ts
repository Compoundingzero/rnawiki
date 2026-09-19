import { describe, expect, it } from 'vitest'

import {
  protectedIdentityForQuery,
  PUBLIC_IDENTITY_PROTECTIONS,
} from '@/lib/inventory/public-identity-protections'

describe('known wrong medicine identity merge', () => {
  it('recognizes only the exact magnesium glycinate query', () => {
    expect(protectedIdentityForQuery('Magnesium glycinate')).toBe('magnesium-glycinate')
    expect(protectedIdentityForQuery('magnesium-glycinate')).toBe('magnesium-glycinate')
    expect(protectedIdentityForQuery('magnesium lysinate glycinate')).toBeNull()
    expect(protectedIdentityForQuery('glycine')).toBeNull()
  })

  it('names glycine as the incorrect target, not an equivalent ingredient', () => {
    expect(PUBLIC_IDENTITY_PROTECTIONS['magnesium-glycinate'].wrongTarget).toBe('glycine')
  })
})

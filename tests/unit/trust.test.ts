import { describe, expect, it } from 'vitest'

import { TIER_DESCRIPTION, TIER_LABEL } from '@/lib/trust'

describe('editorial standing labels', () => {
  it('explains standing without promising automatic publication or count-based promotion', () => {
    expect(TIER_LABEL.trusted).toBe('Trusted editor')
    expect(TIER_DESCRIPTION.trusted).toContain('review another person’s')
    expect(TIER_DESCRIPTION.trusted).toContain('never your own')
    expect(TIER_DESCRIPTION.trusted).toContain('separate qualifications')
    expect(Object.values(TIER_DESCRIPTION).join(' ').toLowerCase()).not.toContain(
      'publish automatically',
    )
    expect(Object.values(TIER_DESCRIPTION).join(' ')).not.toMatch(/\d+ earlier edits/)
  })
})

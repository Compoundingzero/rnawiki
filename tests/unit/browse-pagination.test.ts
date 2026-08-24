import { describe, expect, it } from 'vitest'

import { MAX_BROWSE_PAGE, parseBrowsePage } from '@/lib/browse-pagination'

describe('browse pagination', () => {
  it('accepts only whole positive page numbers within the public bound', () => {
    expect(parseBrowsePage(undefined)).toBe(1)
    expect(parseBrowsePage('1')).toBe(1)
    expect(parseBrowsePage(String(MAX_BROWSE_PAGE))).toBe(MAX_BROWSE_PAGE)

    for (const invalid of ['0', '-1', '1.5', '2junk', '+2', ' 2 ', String(MAX_BROWSE_PAGE + 1)]) {
      expect(parseBrowsePage(invalid)).toBeNull()
    }
  })
})

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

describe('browsePageLinks', () => {
  it('links the ends, every tenth page and a window around the current page, sorted and unique', async () => {
    const { browsePageLinks } = await import('@/lib/browse-pagination')
    expect(browsePageLinks(1, 1)).toEqual([1])
    expect(browsePageLinks(1, 3)).toEqual([1, 2, 3])
    expect(browsePageLinks(47, 165)).toEqual([
      1, 10, 20, 30, 40, 45, 46, 47, 48, 49, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160,
      165,
    ])
    expect(browsePageLinks(165, 165).at(-1)).toBe(165)
    expect(browsePageLinks(0, 5)).toEqual([1, 2, 3, 5])
    expect(browsePageLinks(3, 0)).toEqual([])
  })

  it('keeps every page within a few hops of the first page', async () => {
    const { browsePageLinks } = await import('@/lib/browse-pagination')
    const last = 165
    const distance = new Map<number, number>([[1, 0]])
    const queue = [1]
    while (queue.length > 0) {
      const page = queue.shift()!
      for (const next of browsePageLinks(page, last)) {
        if (!distance.has(next)) {
          distance.set(next, distance.get(page)! + 1)
          queue.push(next)
        }
      }
    }
    expect(distance.size).toBe(last)
    expect(Math.max(...distance.values())).toBeLessThanOrEqual(4)
  })
})

export const MAX_BROWSE_PAGE = 10_000

/** Strict, bounded parsing for the public browse offset. Missing means page one; malformed,
 * fractional, unsafe or excessive values are invalid rather than partially parsed. */
export function parseBrowsePage(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return 1
  if (!/^[1-9]\d*$/.test(raw)) return null
  const page = Number(raw)
  if (!Number.isSafeInteger(page) || page > MAX_BROWSE_PAGE) return null
  return page
}

/** Every tenth page is linked directly so the deep end of the list is a few hops away. */
export const BROWSE_PAGE_STRIDE = 10

/**
 * The page numbers a browse pager links to: the first and last page, every tenth page, and a
 * two-page window around the current page. With `next` links alone, the last of 165 pages sat
 * 165 hops from `/browse`; with these jumps no page is more than a handful of hops away, which is
 * what lets a crawler that follows links reach every canonical record rather than only the first
 * screens. Sorted, unique, always within 1..last.
 */
export function browsePageLinks(current: number, last: number): number[] {
  if (!Number.isSafeInteger(last) || last < 1) return []
  const page = Math.min(Math.max(1, Math.trunc(current)), last)
  const pages = new Set<number>([1, last])
  for (let stride = BROWSE_PAGE_STRIDE; stride <= last; stride += BROWSE_PAGE_STRIDE)
    pages.add(stride)
  for (let offset = -2; offset <= 2; offset += 1) {
    const candidate = page + offset
    if (candidate >= 1 && candidate <= last) pages.add(candidate)
  }
  return [...pages].sort((left, right) => left - right)
}

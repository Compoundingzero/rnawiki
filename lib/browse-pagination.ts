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

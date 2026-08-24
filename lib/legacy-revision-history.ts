import type { RevisionStatus } from '@/lib/types'

export const LEGACY_REVISION_HISTORY_PAGE_SIZE = 200
const MAX_HISTORY_PAGE = 1_000_000

export function parseLegacyRevisionHistoryPage(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^\d+$/u.test(value)) return 1
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= 1 ? Math.min(parsed, MAX_HISTORY_PAGE) : 1
}

export function legacyRevisionHistoryPageHref(slug: string, page: number): string {
  const base = `/d/${encodeURIComponent(slug)}/history`
  return page <= 1 ? base : `${base}?page=${page}`
}

export function legacyRevisionChangeCountLabel(
  status: RevisionStatus,
  isQuarantined: boolean,
  count: number,
): string {
  const wasPublished = status === 'published' && !isQuarantined
  if (wasPublished) return count === 1 ? 'field changed' : 'fields changed'
  return count === 1 ? 'field proposed' : 'fields proposed'
}

export function legacyRevisionTransitionLabel(
  status: RevisionStatus,
  isQuarantined: boolean,
): 'changed to' | 'proposed as' {
  return status === 'published' && !isQuarantined ? 'changed to' : 'proposed as'
}

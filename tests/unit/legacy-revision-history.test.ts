import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  legacyRevisionChangeCountLabel,
  legacyRevisionHistoryPageHref,
  legacyRevisionTransitionLabel,
  parseLegacyRevisionHistoryPage,
} from '@/lib/legacy-revision-history'

describe('public legacy revision history', () => {
  it('calls a value changed only after it was published', () => {
    expect(legacyRevisionChangeCountLabel('published', false, 1)).toBe('field changed')
    expect(legacyRevisionChangeCountLabel('published', false, 2)).toBe('fields changed')

    for (const status of ['pending_review', 'rejected', 'machine_rejected'] as const) {
      expect(legacyRevisionChangeCountLabel(status, false, 1)).toBe('field proposed')
      expect(legacyRevisionChangeCountLabel(status, false, 2)).toBe('fields proposed')
    }
    expect(legacyRevisionChangeCountLabel('pending_review', true, 1)).toBe('field proposed')
    expect(legacyRevisionChangeCountLabel('published', true, 1)).toBe('field proposed')
    expect(legacyRevisionTransitionLabel('published', false)).toBe('changed to')
    expect(legacyRevisionTransitionLabel('pending_review', false)).toBe('proposed as')
    expect(legacyRevisionTransitionLabel('rejected', false)).toBe('proposed as')
    expect(legacyRevisionTransitionLabel('machine_rejected', false)).toBe('proposed as')
    expect(legacyRevisionTransitionLabel('published', true)).toBe('proposed as')
  })

  it('parses bounded page numbers and creates stable newer/older links', () => {
    expect(parseLegacyRevisionHistoryPage(undefined)).toBe(1)
    expect(parseLegacyRevisionHistoryPage('not-a-page')).toBe(1)
    expect(parseLegacyRevisionHistoryPage(['2'])).toBe(1)
    expect(parseLegacyRevisionHistoryPage('2')).toBe(2)
    expect(parseLegacyRevisionHistoryPage('999999999999999')).toBe(1_000_000)
    expect(parseLegacyRevisionHistoryPage('99999999999999999')).toBe(1)
    expect(legacyRevisionHistoryPageHref('history medicine', 1)).toBe(
      '/d/history%20medicine/history',
    )
    expect(legacyRevisionHistoryPageHref('history medicine', 3)).toBe(
      '/d/history%20medicine/history?page=3',
    )
  })

  it('keeps the 200-row window navigable with an accessible landmark', () => {
    const source = readFileSync(join(process.cwd(), 'app/d/[slug]/history/page.tsx'), 'utf8')
    expect(source).toContain('LEGACY_REVISION_HISTORY_PAGE_SIZE + 1')
    expect(source).toContain('(page - 1) * LEGACY_REVISION_HISTORY_PAGE_SIZE')
    expect(source).toContain('aria-label="Revision history pages"')
    expect(source).toContain('rel="prev"')
    expect(source).toContain('rel="next"')
    expect(source).toContain('Newer edits')
    expect(source).toContain('Older edits')
  })
})

/**
 * Remove a withdrawn registry match from the stored field values that still name it.
 *
 * `apply-identity-corrections.ts` deleted the rows in `page_registry_studies` and `page_synonyms`
 * and recorded the removal in the ledger, but it never touched `page_fields`. The same study id is
 * embedded in the stored JSON there, so on the creatine record four studies the Tribulus correction
 * withdrew were still counted in `humanCeiling.trials` and one was still counted in
 * `ongoingTrials` — and the page printed both counts.
 *
 * The walk below is deliberately narrow. It removes an array element that *is* one of the named
 * study ids, or an object element that names one, and it leaves every other value alone. It never
 * edits prose and never invents a number.
 *
 * Counts are the part worth reading twice. A sibling number that equalled the array's length before
 * the prune is a count of that array, so it is reduced to the new length: on the creatine record
 * `trialsListed` was 123 beside a 123-element list, and becomes 119. A sibling number that did not
 * equal the old length counts something else — `registeredStudies` is 134 — and is left untouched
 * rather than guessed at. Aggregates that cannot be recomputed from what is stored, such as a
 * breakdown by trial phase, are reported so an operator can re-derive them from the cleaned rows.
 */

const ID_KEYS = ['nct', 'nctId', 'nct_id', 'id'] as const

export interface PruneResult {
  value: unknown
  /** The study ids actually found and removed, in the order they were met. */
  removed: string[]
  /** Counts reduced because they equalled the length of a list this prune shortened. */
  countsAdjusted: Array<{ key: string; from: number; to: number }>
  /**
   * Numbers that sit beside a shortened list but count something else, so they were not touched.
   * A reader-facing aggregate in here may now disagree with the list and needs re-deriving.
   */
  countsLeftAlone: Array<{ key: string; value: number }>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Whether this array element names one of the withdrawn studies. */
function namesStudy(element: unknown, ids: ReadonlySet<string>): string | null {
  if (typeof element === 'string') return ids.has(element) ? element : null
  if (!isRecord(element)) return null
  for (const key of ID_KEYS) {
    const value = element[key]
    if (typeof value === 'string' && ids.has(value)) return value
  }
  return null
}

export function pruneStoredReferences(value: unknown, studyIds: readonly string[]): PruneResult {
  const ids = new Set(studyIds)
  const removed: string[] = []
  const countsAdjusted: PruneResult['countsAdjusted'] = []
  const countsLeftAlone: PruneResult['countsLeftAlone'] = []

  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      const kept: unknown[] = []
      for (const element of node) {
        const hit = namesStudy(element, ids)
        if (hit) {
          removed.push(hit)
          continue
        }
        kept.push(walk(element))
      }
      return kept
    }
    if (!isRecord(node)) return node

    const next: Record<string, unknown> = {}
    const shortened: Array<{ key: string; before: number; after: number }> = []
    for (const [key, child] of Object.entries(node)) {
      if (Array.isArray(child)) {
        const before = child.length
        const walked = walk(child) as unknown[]
        if (walked.length !== before) shortened.push({ key, before, after: walked.length })
        next[key] = walked
        continue
      }
      next[key] = walk(child)
    }

    // Sibling counts, resolved against the lengths this object's own lists had before the prune.
    if (shortened.length > 0) {
      for (const [key, child] of Object.entries(node)) {
        if (typeof child !== 'number') continue
        const match = shortened.find((entry) => entry.before === child)
        if (match) {
          next[key] = match.after
          countsAdjusted.push({ key, from: child, to: match.after })
        } else {
          countsLeftAlone.push({ key, value: child })
        }
      }
    }
    return next
  }

  return { value: walk(value), removed, countsAdjusted, countsLeftAlone }
}

import { describe, expect, it } from 'vitest'

import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import { EXTRACTED_BACKGROUND } from '@/scripts/seed-data/background/extracted-background.generated'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * Every anchor on a medicine page is unique within that page.
 *
 * A duplicate id breaks the in-page link to it and is an accessibility fault besides. This is pinned
 * here because the browser suite cannot catch it: the end-to-end fixtures carry no recorded
 * background at all, so the rows that collided do not render there, and two ids collided with
 * sections that already existed while the full gate passed.
 *
 * The regular and editorial reader layers are mutually exclusive. Check their static section IDs
 * separately; counting both branches in one source-file search reports collisions that cannot
 * appear in the document. The shared record section belongs in both checks.
 */

async function compassIds(): Promise<{ regular: string[]; editorial: string[] }> {
  const { readFileSync } = await import('node:fs')
  const page = readFileSync('components/dossier/v4/CompassPage.tsx', 'utf8')
  const editorialStart = page.indexOf('function EditorialDossier(')
  const exportStart = page.indexOf('export function CompassPage(')
  const sharedStart = page.indexOf('function RecordAndSources(')
  if (editorialStart < 0 || exportStart < 0 || sharedStart < 0) {
    throw new Error('The medicine page branch boundaries changed; update the anchor audit.')
  }
  const orientation = readFileSync('components/dossier/v4/Orientation.tsx', 'utf8')
  const ids = (source: string) =>
    [...source.matchAll(/id="([a-z0-9-]+)"/gu)].map((match) => match[1]!)
  const shared = page.slice(sharedStart, editorialStart) + orientation
  return {
    regular: ids(page.slice(0, sharedStart) + shared),
    editorial: ids(page.slice(editorialStart, exportStart) + shared),
  }
}

describe('medicine page anchors', () => {
  it('finds the ids to check', async () => {
    const ids = await compassIds()
    expect(ids.regular.length).toBeGreaterThan(12)
    expect(ids.editorial.length).toBeGreaterThan(15)
  })

  it('gives every anchor an id that is unique across the page', async () => {
    for (const [branch, ids] of Object.entries(await compassIds())) {
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
      expect(duplicates, `${branch} ids written more than once: ${duplicates.join(', ')}`).toEqual(
        [],
      )
    }
  })
})

describe('recorded-background reaches the view for real records', () => {
  it('projects every module the corpus actually stores', () => {
    const seen = new Set<string>()
    for (const background of Object.values(ALL_RECORDED_BACKGROUND)) {
      const view = medicineBackgroundContext(background)
      if (!view) continue
      for (const [key, value] of Object.entries(view)) {
        if (value !== undefined) seen.add(key)
      }
      if (seen.size >= 12) break
    }
    // The six modules added for the extracted corpus must all survive the projection.
    for (const key of [
      'mechanism',
      'molecularIdentity',
      'interactionSignals',
      'safety',
      'populationStatements',
      'commonAdverseReactions',
    ]) {
      expect(seen, `${key} never reached the view`).toContain(key)
    }
  })

  it('never drops a stored module silently', () => {
    const slug = Object.keys(EXTRACTED_BACKGROUND).find((candidate) => {
      const background = EXTRACTED_BACKGROUND[candidate]!
      return background.mechanism && background.safety && background.commonAdverseReactions
    })!
    const view = medicineBackgroundContext(EXTRACTED_BACKGROUND[slug])
    expect(view?.mechanism?.statements.length).toBeGreaterThan(0)
    expect(view?.safety).toBeDefined()
    expect(view?.commonAdverseReactions?.events.length).toBeGreaterThan(0)
  })
})

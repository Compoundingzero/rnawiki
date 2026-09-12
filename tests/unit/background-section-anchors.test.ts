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
 * The file this used to read — `components/MedicineRecordContextSections.tsx` — belonged to the
 * medicine layout this release deleted. The collision it guards against did not go with it: the
 * compass writes one document, and every section, panel and disclosure in it shares one id space.
 */

async function compassIds(): Promise<string[]> {
  const { readFileSync, readdirSync } = await import('node:fs')
  return readdirSync('components/dossier/v4')
    .filter((file) => file.endsWith('.tsx'))
    .flatMap((file) =>
      [
        ...readFileSync(`components/dossier/v4/${file}`, 'utf8').matchAll(/id="([a-z0-9-]+)"/gu),
      ].map((match) => match[1]!),
    )
}

describe('medicine page anchors', () => {
  it('finds the ids to check', async () => {
    expect((await compassIds()).length).toBeGreaterThan(15)
  })

  it('gives every anchor an id that is unique across the page', async () => {
    const ids = await compassIds()
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
    expect(duplicates, `ids written more than once: ${duplicates.join(', ')}`).toEqual([])
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

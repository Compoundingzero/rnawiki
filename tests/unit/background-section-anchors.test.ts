import { describe, expect, it } from 'vitest'

import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import { EXTRACTED_BACKGROUND } from '@/scripts/seed-data/background/extracted-background.generated'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * Every recorded-background row is addressable by an id, and a duplicate id breaks the in-page
 * anchor to it and is an accessibility fault besides.
 *
 * This is pinned here because the browser suite cannot catch it: the end-to-end fixtures carry no
 * recorded background at all, so none of these rows render there. Two ids collided with sections
 * that already existed on the dossier and the full gate still passed.
 */

const SOURCE = 'components/MedicineRecordContextSections.tsx'

async function sectionIds(): Promise<string[]> {
  const { readFileSync } = await import('node:fs')
  const source = readFileSync(SOURCE, 'utf8')
  return [...source.matchAll(/id="([a-z0-9-]+)"/gu)].map((match) => match[1]!)
}

describe('recorded-background section anchors', () => {
  it('gives every row an id that is unique within the file', async () => {
    const ids = await sectionIds()
    expect(ids.length).toBeGreaterThan(0)
    expect(new Set(ids).size, `duplicate ids: ${ids.join(', ')}`).toBe(ids.length)
  })

  it('does not reuse an id that another dossier section already owns', async () => {
    const { readFileSync } = await import('node:fs')
    const ids = new Set(await sectionIds())
    const dossier = readFileSync('components/MedicineDossierV2.tsx', 'utf8')
    const taken = [...dossier.matchAll(/id="([a-z0-9-]+)"/gu)].map((match) => match[1]!)
    const collisions = taken.filter((id) => ids.has(id))
    expect(collisions).toEqual([])
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

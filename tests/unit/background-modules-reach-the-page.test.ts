import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * A module that is stored, validated and never shown is a module that does not exist for a reader.
 *
 * This was not hypothetical. `supplementMarket` was recorded for hundreds of medicines, passed the
 * background engine on every one of them, and reached no page at all: the view model had no
 * projection for it and nothing anywhere noticed. `sourceConsensus` — the strongest thing this
 * corpus can say about a value, that fifty-nine labels agree on it — was invisible the same way.
 *
 * The gap survived because every existing test asked whether a module was *correct*, and none asked
 * whether it was *reachable*. This one reads the envelope's own field list out of the type
 * declaration, so a module added later is caught by the same check that caught these.
 */

const TYPES_SOURCE = 'lib/background/types.ts'
const VIEW_SOURCE = 'lib/medicine-background-view.ts'
const SECTIONS_SOURCE = 'components/MedicineRecordContextSections.tsx'

/**
 * Fields of the envelope that carry no reader-facing content.
 *
 * `attribution` is the gate deciding whether a substance-specific module may exist at all, and it
 * is expressed to a reader through what is present rather than as a count of its own. The rest are
 * envelope bookkeeping. Every other field must reach a page.
 */
const NOT_READER_FACING = new Set(['version', 'authoredAt', 'provenanceTier', 'attribution'])

/** The optional fields declared on `MedicineRecordedBackground`, read from the declaration itself. */
function envelopeModules(): string[] {
  const source = readFileSync(TYPES_SOURCE, 'utf8')
  const block = source.match(/export interface MedicineRecordedBackground \{([\s\S]*?)\n\}/u)?.[1]
  expect(block, 'MedicineRecordedBackground declaration not found').toBeDefined()
  const fields = [...block!.matchAll(/^\s{2}(\w+)\??:/gmu)].map((match) => match[1]!)
  return fields.filter((field) => !NOT_READER_FACING.has(field))
}

describe('every stored module reaches a reader', () => {
  const modules = envelopeModules()

  it('finds the envelope fields to check', () => {
    expect(modules.length).toBeGreaterThan(10)
    expect(modules).toContain('sourceConsensus')
    expect(modules).toContain('supplementMarket')
    expect(modules).toContain('labelPresence')
    expect(modules).toContain('composition')
  })

  it('projects every stored module into the view model', () => {
    const view = readFileSync(VIEW_SOURCE, 'utf8')
    const missing = modules.filter(
      (module) => !new RegExp(`background\\.${module}\\b`, 'u').test(view),
    )
    expect(missing, `never read by the view model: ${missing.join(', ')}`).toEqual([])
  })

  it('renders every field of the view model in a page section', () => {
    // Checked against the view's own field names rather than the envelope's, because the projection
    // is allowed to rename: `costContext` is stored under that name and shown as `costEntries`.
    // What must never happen is a view field with nowhere to render.
    const view = readFileSync(VIEW_SOURCE, 'utf8')
    const block = view.match(
      /export interface MedicineBackgroundContextView \{([\s\S]*?)\n\}/u,
    )?.[1]
    expect(block, 'MedicineBackgroundContextView declaration not found').toBeDefined()
    const viewFields = [...block!.matchAll(/^\s{2}(\w+)\??:/gmu)]
      .map((match) => match[1]!)
      .filter((field) => !['authoredAt', 'provenanceNote'].includes(field))

    const sections = readFileSync(SECTIONS_SOURCE, 'utf8')
    const missing = viewFields.filter(
      (field) => !new RegExp(`background[?!]?\\.${field}\\b`, 'u').test(sections),
    )
    expect(missing, `projected but never rendered: ${missing.join(', ')}`).toEqual([])
  })

  it('reaches the view for the modules the corpus actually stores', () => {
    // The source checks above prove the wiring exists. This proves it fires: for every module the
    // corpus holds, some real record projects it. A projection guarded by a condition no record
    // meets would pass the string checks and show a reader nothing.
    const stored = new Set<string>()
    const projected = new Set<string>()
    for (const background of Object.values(ALL_RECORDED_BACKGROUND)) {
      for (const field of modules) {
        const value = background[field as keyof typeof background]
        const present = Array.isArray(value) ? value.length > 0 : value !== undefined
        if (present) stored.add(field)
      }
      const view = medicineBackgroundContext(background)
      if (!view) continue
      for (const [key, value] of Object.entries(view)) {
        if (value !== undefined) projected.add(key)
      }
    }
    const unreachable = [...stored].filter((field) => !projected.has(field))
    expect(
      unreachable,
      `stored by the corpus but never projected: ${unreachable.join(', ')}`,
    ).toEqual([])
  })
})

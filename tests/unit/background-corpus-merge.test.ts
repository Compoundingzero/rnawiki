import { describe, expect, it } from 'vitest'

import { ALL_RECORDED_BACKGROUND, RECORDED_BACKGROUND } from '@/scripts/seed-data/background'
import { EXTRACTED_BACKGROUND } from '@/scripts/seed-data/background/extracted-background.generated'
import { CURATED_GAP_EXTRACTION } from '@/scripts/seed-data/background/curated-gap-extraction'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'

/**
 * The corpus has two tiers: records a person authored and records a parser read out of label
 * sentences. These tests pin the boundary between them — extraction may fill a gap, but it must
 * never overwrite curated work, never lose its tier marking, and never reach a reader without the
 * engine having passed it first.
 */

describe('recorded-background corpus merge', () => {
  it('never lets an extracted record overwrite a curated one', () => {
    for (const slug of Object.keys(RECORDED_BACKGROUND)) {
      const curated = RECORDED_BACKGROUND[slug]!
      const merged = ALL_RECORDED_BACKGROUND[slug]
      expect(merged, slug).toBeDefined()
      // Every field the curated record carries survives the merge byte for byte. Reference
      // identity is deliberately not asserted: a curated record gains sourceConsensus, which is
      // what every published label states for its fields, and a curated record benefits from
      // knowing fifty-nine labels agree with it.
      for (const [key, value] of Object.entries(curated)) {
        expect(JSON.stringify(merged![key as keyof typeof merged]), `${slug}.${key}`).toBe(
          JSON.stringify(value),
        )
      }
    }
  })

  it('adds only corroborating modules to a curated record, never anything else', () => {
    // Three modules may attach to a curated record because none of them replaces curated
    // judgement. Cross-source consensus says what every published label states for a field;
    // supplement market data says how many marketed products list the substance; archive presence
    // says how many published labels name it as an active ingredient. Each is a count over sources
    // rather than a statement about the medicine, so none can contradict what a person wrote.
    // Anything else appearing here would mean a generated source had reached inside a record a
    // person authored.
    // `costContext` joins them: a dated acquisition price surveyed by CMS is an observation about
    // the market, not a judgement about the medicine, and a curated record that authored its own
    // price keeps it.
    // `biologicalIdentity` joins them for the same reason: what organism a name denotes is a fact
    // about biological nomenclature, and it cannot contradict anything a person wrote about the
    // medicine.
    //
    // The label-extraction modules join them on a narrower licence, and the narrowness is what
    // makes them safe. `curated-gap-extraction.json` holds only modules the curated envelope
    // leaves absent — a module a person wrote is not in that file at all — so nothing here can
    // replace curated judgement, and every value it carries states its own tier and quotes the
    // label sentence it was read from.
    const allowed = new Set([
      'sourceConsensus',
      'supplementMarket',
      'labelPresence',
      'costContext',
      'biologicalIdentity',
      'productListing',
      'regulatoryApproval',
      'supplementIngredient',
      'sourceMaterial',
      'nameFamily',
      'pharmacokinetics',
      'recordedUses',
      'mechanism',
      'molecularIdentity',
      'interactionSignals',
      'safety',
      'populationStatements',
      'commonAdverseReactions',
    ])
    for (const slug of Object.keys(RECORDED_BACKGROUND)) {
      const curatedKeys = new Set(Object.keys(RECORDED_BACKGROUND[slug]!))
      const added = Object.keys(ALL_RECORDED_BACKGROUND[slug]!).filter(
        (key) => !curatedKeys.has(key),
      )
      expect(
        added.filter((key) => !allowed.has(key)),
        slug,
      ).toEqual([])
    }
  })

  it('covers every curated and extracted slug, and only adds to them', () => {
    // The corpus is no longer two sources. Records also arrive from the substance registry, the
    // supplement label database and the compound database, each reaching rows the label pipeline
    // structurally cannot. What must still hold is that nothing from the original two goes missing.
    const required = new Set([
      ...Object.keys(RECORDED_BACKGROUND),
      ...Object.keys(EXTRACTED_BACKGROUND),
    ])
    const present = new Set(Object.keys(ALL_RECORDED_BACKGROUND))
    for (const slug of required) expect(present.has(slug), slug).toBe(true)
    expect(present.size).toBeGreaterThanOrEqual(required.size)
  })

  it('reaches far beyond what hand-authoring covered', () => {
    // The curated corpus is small by nature; extraction is what makes the corpus corpus-sized.
    expect(Object.keys(ALL_RECORDED_BACKGROUND).length).toBeGreaterThan(
      Object.keys(RECORDED_BACKGROUND).length * 10,
    )
  })

  it('marks every extracted record and every value inside it as extracted', () => {
    for (const [slug, background] of Object.entries(EXTRACTED_BACKGROUND)) {
      expect(background.provenanceTier, slug).toBe('extracted')
      for (const value of Object.values(background.pharmacokinetics ?? {})) {
        if (value && typeof value === 'object' && 'display' in value) {
          expect(value.provenanceTier, `${slug} pharmacokinetics`).toBe('extracted')
        }
      }
    }
  })

  it('leaves curated records unmarked, so they keep reading as curated', () => {
    for (const [slug, background] of Object.entries(RECORDED_BACKGROUND)) {
      expect(background.provenanceTier ?? 'curated', slug).toBe('curated')
    }
  })

  it('passes the background engine on every record in the merged corpus', () => {
    const failures: string[] = []
    for (const [slug, background] of Object.entries(ALL_RECORDED_BACKGROUND)) {
      const report = runBackgroundIntelligence(background)
      if (!report.passed) failures.push(`${slug}: ${report.findings.map((f) => f.code).join(', ')}`)
    }
    expect(failures).toEqual([])
  })
})

/**
 * The third tier, and the one that touches curated records.
 *
 * Extraction skipped every curated slug wholesale, which left the 155 most-read rows in the corpus
 * with no mechanism, no recorded uses, no safety statements, no population statements and no
 * adverse reactions while thousands of thinner rows carried all five from the same label archive.
 * `curated-gap-extraction.json` closes that gap by attaching only what a curator left absent. These
 * tests pin the three properties that make it safe to attach a parser's output to a person's
 * record: a curated module is never replaced, an absent one is filled with exactly what the
 * registry holds, and the envelope keeps saying it is curated while every attached value keeps
 * saying it was extracted.
 */
describe('curated-gap extraction', () => {
  const ENVELOPE_FIELDS = new Set(['version', 'authoredAt', 'provenanceTier', 'attribution'])

  /** Every `provenanceTier` marking anywhere inside a value, however deeply nested. */
  function tiersWithin(value: unknown, found: string[] = []): string[] {
    if (Array.isArray(value)) {
      for (const item of value) tiersWithin(item, found)
    } else if (value && typeof value === 'object') {
      for (const [key, nested] of Object.entries(value)) {
        if (key === 'provenanceTier' && typeof nested === 'string') found.push(nested)
        else tiersWithin(nested, found)
      }
    }
    return found
  }

  it('reaches the rows that needed it', () => {
    expect(Object.keys(CURATED_GAP_EXTRACTION).length).toBeGreaterThan(0)
    // Metformin is the case that made the gap visible: 390 published labels, 316 of them naming it
    // as their only active substance, and a page that stated no mechanism at all.
    expect(ALL_RECORDED_BACKGROUND['metformin']?.mechanism).toBeDefined()
  })

  it('holds only modules the curated record leaves absent', () => {
    for (const [slug, extracted] of Object.entries(CURATED_GAP_EXTRACTION)) {
      const curated = RECORDED_BACKGROUND[slug]
      expect(curated, `${slug} is not a curated record`).toBeDefined()
      for (const moduleName of Object.keys(extracted)) {
        if (ENVELOPE_FIELDS.has(moduleName)) continue
        const held: unknown = curated![moduleName as keyof MedicineRecordedBackground]
        const present = Array.isArray(held) ? held.length > 0 : held !== undefined
        expect(present, `${slug}.${moduleName} is curated and must not be in this registry`).toBe(
          false,
        )
      }
    }
  })

  it('never replaces a module a curator wrote', () => {
    // The general guarantee is asserted above for the whole corpus; this states it against this
    // registry specifically, so a future change that let it overwrite would fail here by name.
    for (const [slug, extracted] of Object.entries(CURATED_GAP_EXTRACTION)) {
      const curated = RECORDED_BACKGROUND[slug]!
      const merged = ALL_RECORDED_BACKGROUND[slug]!
      for (const [key, value] of Object.entries(curated)) {
        expect(JSON.stringify(merged[key as keyof typeof merged]), `${slug}.${key}`).toBe(
          JSON.stringify(value),
        )
        // Envelope fields are excluded: both records carry a version and an authoring date, and
        // the merge keeps the curated one, which the assertion above already states.
        if (!ENVELOPE_FIELDS.has(key)) expect(Object.keys(extracted)).not.toContain(key)
      }
    }
  })

  it('fills an absent module with exactly what the registry holds', () => {
    let filled = 0
    for (const [slug, extracted] of Object.entries(CURATED_GAP_EXTRACTION)) {
      const merged = ALL_RECORDED_BACKGROUND[slug]!
      for (const [moduleName, value] of Object.entries(extracted)) {
        if (ENVELOPE_FIELDS.has(moduleName)) continue
        expect(
          JSON.stringify(merged[moduleName as keyof typeof merged]),
          `${slug}.${moduleName}`,
        ).toBe(JSON.stringify(value))
        filled += 1
      }
    }
    expect(filled).toBeGreaterThan(0)
  })

  it('leaves the envelope curated while every attached value stays extracted', () => {
    for (const [slug, extracted] of Object.entries(CURATED_GAP_EXTRACTION)) {
      const merged = ALL_RECORDED_BACKGROUND[slug]!
      // The record is still mostly a person's work, and says so.
      expect(merged.provenanceTier ?? 'curated', slug).toBe('curated')
      // The registry value itself is marked extracted, so the tier is never lost on the way.
      expect(extracted.provenanceTier, slug).toBe('extracted')
      // Envelope fields belong to the curated record and are never taken from the extraction: an
      // `attribution` counting one extraction source would be a false statement about a record
      // whose other values came from sources a person chose.
      expect(merged.version, slug).toBe(RECORDED_BACKGROUND[slug]!.version)
      expect(merged.authoredAt, slug).toBe(RECORDED_BACKGROUND[slug]!.authoredAt)
      expect(merged.attribution, slug).toEqual(RECORDED_BACKGROUND[slug]!.attribution)

      for (const [moduleName, value] of Object.entries(extracted)) {
        if (ENVELOPE_FIELDS.has(moduleName)) continue
        const tiers = tiersWithin(value)
        // Every attached module carries per-value tiers. A module whose type has no place to put
        // one cannot be attached to a curated record at all, because nothing would tell a reader
        // a parser read it.
        expect(
          tiers.length,
          `${slug}.${moduleName} carries no per-value provenance`,
        ).toBeGreaterThan(0)
        expect(new Set(tiers), `${slug}.${moduleName}`).toEqual(new Set(['extracted']))
      }
    }
  })

  it('quotes a label sentence and names its label for every attached value', () => {
    for (const [slug, extracted] of Object.entries(CURATED_GAP_EXTRACTION)) {
      for (const [moduleName, value] of Object.entries(extracted)) {
        if (ENVELOPE_FIELDS.has(moduleName)) continue
        const sources: Array<Record<string, unknown>> = []
        const collect = (node: unknown) => {
          if (Array.isArray(node)) node.forEach(collect)
          else if (node && typeof node === 'object') {
            for (const [key, nested] of Object.entries(node)) {
              if (key === 'source' && nested && typeof nested === 'object') {
                sources.push(nested as Record<string, unknown>)
              }
              collect(nested)
            }
          }
        }
        collect(value)
        expect(sources.length, `${slug}.${moduleName} carries no source`).toBeGreaterThan(0)
        for (const source of sources) {
          expect(source.identifier, `${slug}.${moduleName} source identifier`).toBeTruthy()
          expect(String(source.excerpt ?? ''), `${slug}.${moduleName} source excerpt`).not.toBe('')
        }
      }
    }
  })
})

describe('recorded-background provenance reaches the reader', () => {
  it('tells the reader when a whole record was read automatically', () => {
    const slug = Object.keys(EXTRACTED_BACKGROUND)[0]!
    const view = medicineBackgroundContext(EXTRACTED_BACKGROUND[slug])
    expect(view?.provenanceNote).toContain('read automatically')
    // The note points at a control the page actually renders.
    expect(view?.provenanceNote).toContain('Exact fetched wording')
  })

  it('says nothing extra about a curated record', () => {
    const slug = Object.keys(RECORDED_BACKGROUND)[0]!
    expect(medicineBackgroundContext(RECORDED_BACKGROUND[slug])?.provenanceNote).toBeUndefined()
  })

  it('labels a single extracted value inside an otherwise curated record', () => {
    const view = medicineBackgroundContext({
      version: 'medicine-background/v1',
      authoredAt: '2026-08-28',
      pharmacokinetics: {
        routeAsRecorded: 'oral',
        halfLife: {
          display: '9 hours',
          populationContext: 'as stated in the label sentence recorded below',
          provenanceTier: 'extracted',
          source: {
            kind: 'FDA_LABEL',
            identifier: '00afce9b-48c9-487a-a738-e359c005c707',
            label: 'Synthetic medicine label',
            retrievedAt: '2026-08-28',
            excerpt: 'The elimination half-life is approximately 9 hours.',
          },
        },
      },
    })
    expect(view?.provenanceNote).toBeUndefined()
    expect(view?.pharmacokinetics?.values[0]?.provenanceLabel).toContain('not checked by a person')
  })

  it('does not repeat the per-value label inside an all-extracted record', () => {
    const slug = Object.keys(EXTRACTED_BACKGROUND).find(
      (candidate) => EXTRACTED_BACKGROUND[candidate]?.pharmacokinetics,
    )!
    const view = medicineBackgroundContext(EXTRACTED_BACKGROUND[slug])
    for (const value of view?.pharmacokinetics?.values ?? []) {
      expect(value.provenanceLabel).toBeUndefined()
    }
  })
})

import { describe, expect, it } from 'vitest'

import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import { authoredStrings, findForbiddenPhrases } from '@/lib/agents/core/types'
import {
  COVERAGE_ROUTES,
  coverageLedgerAgent,
  type CoverageRoute,
} from '@/lib/agents/dataset/coverage-ledger'
import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * Run against the real corpus. The failure this exists to catch is a record shape that falls into
 * no route or is silently dropped from the totals, and a hand-written fixture contains only the
 * shapes its author already thought of.
 */
const CORPUS: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
  ([slug, background]) => ({ slug, name: slug.replace(/-/gu, ' '), background }),
)

const SEED = 20260828
const RUN_DATE = '2026-08-28'

const run = coverageLedgerAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })

describe('coverage ledger', () => {
  it('classifies every record exactly once, so no record disappears from the totals', () => {
    expect(run.output.entries).toHaveLength(CORPUS.length)
    expect(run.coverage.used).toBe(CORPUS.length)
    expect(run.coverage.considered).toBe(CORPUS.length)

    const perRoute = run.output.byRoute.reduce((total, roll) => total + roll.records, 0)
    expect(perRoute).toBe(CORPUS.length)

    const slugs = new Set(run.output.entries.map((entry) => entry.slug))
    expect(slugs.size).toBe(CORPUS.length)
  })

  it('gives every record a declared route and every route a stated limit', () => {
    for (const entry of run.output.entries) {
      expect(COVERAGE_ROUTES).toContain(entry.route)
    }
    for (const roll of run.output.byRoute) {
      expect(roll.cannotSupply.length).toBeGreaterThan(20)
    }
    expect(run.output.byRoute.map((roll) => roll.route)).toEqual([...COVERAGE_ROUTES])
  })

  it('counts a module for a record only when the record holds it', () => {
    for (const roll of run.output.byModule) {
      const counted = run.output.entries.filter((entry) =>
        entry.modulesPresent.includes(roll.module),
      ).length
      expect(roll.records).toBe(counted)
      expect(roll.shareOfCorpus).toBeCloseTo(counted / CORPUS.length, 10)
    }
  })

  it('never reports more documented ingredient slots than slots', () => {
    expect(run.output.ingredientSlotsDocumented).toBeLessThanOrEqual(run.output.ingredientSlots)
    const slots = run.output.entries.reduce((total, entry) => total + entry.ingredientCount, 0)
    expect(run.output.ingredientSlots).toBe(slots)
    for (const entry of run.output.entries) {
      expect(entry.ingredientsDocumented).toBeLessThanOrEqual(entry.ingredientCount)
    }
  })

  it('routes only records the corpus can still grow, and never a curated one', () => {
    const routeOf = new Map<string, CoverageRoute>(
      run.output.entries.map((entry) => [entry.slug, entry.route]),
    )
    for (const candidate of run.queue ?? []) {
      expect(candidate.reason).toBe('COVERAGE_GAP')
      expect(routeOf.get(candidate.slug)).not.toBe('CURATED')
      // The question asks a person to look for a source. It never asserts one exists.
      expect(candidate.question).toMatch(/\?$/u)
    }
  })

  it('is deterministic: the same corpus and seed reproduce the run exactly', () => {
    const again = coverageLedgerAgent.run({ corpus: CORPUS, seed: SEED, runDate: RUN_DATE })
    expect(JSON.stringify(again)).toBe(JSON.stringify(run))
  })

  it('writes nothing that reads as advice or as an invented value', () => {
    const authored = authoredStrings({
      output: run.output,
      queue: run.queue,
      caveats: run.caveats,
    })
    const offending = authored.flatMap((text) =>
      findForbiddenPhrases(text).map((pattern) => `${pattern} :: ${text}`),
    )
    expect(offending).toEqual([])
  })

  it('states that a thin record describes the sources rather than the medicine', () => {
    const caveats = run.caveats.join(' ').toLowerCase()
    expect(caveats).toContain('not the quality of the medicine')
    expect(caveats).toContain('gap in reading')
  })
})

/**
 * The ledger's own blind spot, which is the failure this dataset exists to prevent.
 *
 * `biologicalIdentity` reached 691 records and the ledger classified every one of them as holding
 * nothing, because its module list had not been extended. A coverage report that cannot see a module
 * reports the corpus as thinner than it is, and the one dataset nobody double-checks is the one that
 * says how much there is.
 */
describe('the ledger sees every module the envelope declares', () => {
  it('tracks every reader-facing field of the recorded-background envelope', async () => {
    const { readFileSync } = await import('node:fs')
    const source = readFileSync('lib/background/types.ts', 'utf8')
    const block = source.match(/export interface MedicineRecordedBackground \{([\s\S]*?)\n\}/u)?.[1]
    expect(block).toBeDefined()
    const declared = [...block!.matchAll(/^\s{2}(\w+)\??:/gmu)]
      .map((match) => match[1]!)
      .filter(
        (field) => !['version', 'authoredAt', 'provenanceTier', 'attribution'].includes(field),
      )

    const tracked = new Set(run.output.byModule.map((roll) => roll.module as string))
    const untracked = declared.filter((field) => !tracked.has(field))
    expect(untracked, `declared but not counted by the ledger: ${untracked.join(', ')}`).toEqual([])
  })

  it('never calls a record empty while it holds something', () => {
    for (const entry of run.output.entries) {
      if (entry.route === 'NONE') {
        expect(entry.moduleCount, `${entry.slug} is routed NONE`).toBe(0)
      }
      if (entry.moduleCount > 0) {
        expect(entry.route, `${entry.slug} holds ${entry.moduleCount} module(s)`).not.toBe('NONE')
      }
    }
  })
})

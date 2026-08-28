import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { ALL_RECORDED_BACKGROUND } from '@/scripts/seed-data/background'

/**
 * The corpus reads four registries from disk, and a missing one is silent by design.
 *
 * Each loader returns an empty object when its file is absent, so that a fresh checkout can run its
 * tests before anyone has run the builders. That kindness had a cost: the files were also excluded
 * from version control, so the deployed corpus was assembled without them and served a fraction of
 * the records this repository can produce, while every local check passed against a machine that
 * happened to have the files.
 *
 * These tests make the absence loud. They assert the files are present in the repository and that
 * each contributes records, so the next time one is dropped from a build or an ignore rule, a test
 * says so rather than a reader finding a blank page.
 */

const REGISTRY_DIR = join(process.cwd(), 'data', 'registries')

/** Each registry, and the module its records are recognisable by once merged into the corpus. */
const CORPUS_REGISTRIES = [
  { file: 'substance-backed-background.json', evidence: 'composition' },
  { file: 'compound-identity-background.json', evidence: 'molecularIdentity' },
  { file: 'supplement-background.json', evidence: 'supplementMarket' },
  { file: 'label-presence.json', evidence: 'labelPresence' },
  { file: 'combination-row-composition.json', evidence: 'composition' },
  { file: 'acquisition-cost.json', evidence: 'costContext' },
] as const

describe('registries the published corpus reads', () => {
  for (const registry of CORPUS_REGISTRIES) {
    it(`${registry.file} is present in the repository`, () => {
      const path = join(REGISTRY_DIR, registry.file)
      expect(
        existsSync(path),
        `${registry.file} is missing. It is loaded at runtime, so a deploy without it publishes a corpus missing every record it carries.`,
      ).toBe(true)
      const parsed = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
      expect(Object.keys(parsed).length, `${registry.file} holds no records`).toBeGreaterThan(0)
    })
  }

  it('merges every registry into the corpus rather than loading it and dropping it', () => {
    const counts = new Map<string, number>()
    for (const background of Object.values(ALL_RECORDED_BACKGROUND)) {
      for (const registry of CORPUS_REGISTRIES) {
        const value = background[registry.evidence as keyof typeof background]
        const present = Array.isArray(value) ? value.length > 0 : value !== undefined
        if (present) counts.set(registry.evidence, (counts.get(registry.evidence) ?? 0) + 1)
      }
    }
    for (const registry of CORPUS_REGISTRIES) {
      expect(
        counts.get(registry.evidence) ?? 0,
        `no corpus record carries ${registry.evidence}, so ${registry.file} reached nothing`,
      ).toBeGreaterThan(0)
    }
  })
})

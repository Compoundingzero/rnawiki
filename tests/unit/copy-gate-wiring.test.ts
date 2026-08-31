import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const root = process.cwd()
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
}
const ci = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8')
const publication = readFileSync(join(root, '.github/workflows/publish-dataset.yml'), 'utf8')
const scanner = readFileSync(join(root, 'scripts/quality/slop-scan.mjs'), 'utf8')
const databaseRepair = readFileSync(
  join(root, 'scripts/quality/apply-release-a1-copy-repairs.ts'),
  'utf8',
)
const snapshotRepair = readFileSync(
  join(root, 'scripts/quality/repair-release-a1-public-snapshot.ts'),
  'utf8',
)

function expectInOrder(source: string, fragments: readonly string[]): void {
  let after = -1
  for (const fragment of fragments) {
    const index = source.indexOf(fragment, after + 1)
    expect(index, `Expected ${JSON.stringify(fragment)} after character ${after}.`).toBeGreaterThan(
      after,
    )
    after = index
  }
}

describe('copy-gate wiring', () => {
  it('uses the same copy command in the local release gate, CI and dataset publication', () => {
    expect(packageJson.scripts['check:copy']).toBe('node scripts/quality/slop-scan.mjs')
    expect(packageJson.scripts.gate).toContain('npm run check:copy')
    expect(ci).toMatch(/- name: Check public copy\s+run: npm run check:copy/)
    expect(publication).toMatch(/- name: Check public copy\s+run: npm run check:copy/)
    expectInOrder(publication, [
      '- name: Export the corpus',
      '- name: Check public copy',
      '- name: Verify the export against its own manifest',
      '- name: Commit only if the data moved',
    ])
  })

  it('has no generated-corpus skip or narrower publication substitute', () => {
    for (const source of [scanner, ci, publication]) {
      expect(source).not.toContain('SLOP_SCAN_SKIP_GENERATED_CORPUS')
    }
    expect(publication).not.toContain('public-data-integrity.test.ts')
  })

  it('distinguishes established evidence phrases from generic pivotal puffery', () => {
    expect(() =>
      execFileSync(
        process.execPath,
        [
          'scripts/quality/slop-scan.mjs',
          'tests/fixtures/copy-gate/established-medical-phrases.md',
        ],
        { cwd: root, stdio: 'pipe' },
      ),
    ).not.toThrow()
    expect(() =>
      execFileSync(
        process.execPath,
        ['scripts/quality/slop-scan.mjs', 'tests/fixtures/copy-gate/generic-puffery.md'],
        { cwd: root, stdio: 'pipe' },
      ),
    ).toThrow()
  })

  it('exposes paired dry-run and apply commands for both exact repair utilities', () => {
    expect(packageJson.scripts['check:release-a1-copy']).toBe(
      'node --import tsx scripts/quality/apply-release-a1-copy-repairs.ts',
    )
    expect(packageJson.scripts['apply:release-a1-copy']).toBe(
      'node --import tsx scripts/quality/apply-release-a1-copy-repairs.ts --apply',
    )
    expect(packageJson.scripts['check:release-a1-snapshot']).toBe(
      'node --import tsx scripts/quality/repair-release-a1-public-snapshot.ts',
    )
    expect(packageJson.scripts['repair:release-a1-snapshot']).toBe(
      'node --import tsx scripts/quality/repair-release-a1-public-snapshot.ts --apply',
    )
  })

  it('routes both repair utilities through the same exact guarded repair table', () => {
    for (const source of [databaseRepair, snapshotRepair]) {
      expect(source).toContain('RELEASE_A1_SELF_CERTIFICATION_REPAIRS')
      expect(source).toContain('applyExactReleaseA1Repair')
      expect(source).toContain("process.argv.includes('--apply')")
      expect(source).toContain("argument !== '--apply'")
    }

    expect(databaseRepair).toContain('db.transaction')
    expect(databaseRepair).toContain(".for('update')")
    expect(databaseRepair).toContain('if (!changed || !apply) continue')
    expect(snapshotRepair).toContain('if (!apply) continue')
    expect(snapshotRepair).toContain(
      'if (seen.size !== RELEASE_A1_SELF_CERTIFICATION_REPAIRS.length)',
    )
    expect(snapshotRepair).toContain('if (apply && changedFiles > 0)')
  })

  it('keeps the one-time exact repair ratchet out of permanent editorial gates', () => {
    expect(packageJson.scripts.gate).not.toContain('release-a1')
    expect(ci.toLowerCase()).not.toContain('release-a1')
    expect(publication.toLowerCase()).not.toContain('release-a1')
  })
})

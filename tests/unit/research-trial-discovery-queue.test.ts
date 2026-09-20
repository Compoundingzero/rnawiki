import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const script = resolve('scripts/research/trial-discovery-queue.py')
const python = process.env.TRIAL_DISCOVERY_PYTHON ?? 'python3'
const temporary = mkdtempSync(join(tmpdir(), 'rnawiki-trial-discovery-'))
const slugs = join(temporary, 'page-slugs.csv')
const mappedRow = join(temporary, 'mapped-row.json')

afterAll(() => rmSync(temporary, { recursive: true, force: true }))

writeFileSync(
  slugs,
  'key,slug,tier,display_name,indexable\n"K1:TEST",test-drug,1,Test Drug,t\n"K1:OTHER",other-drug,2,Other Drug,f\n',
)

const fixture = {
  key: 'K1:TEST',
  field: 'registry.hasResults',
  value: JSON.stringify({
    trials: 4,
    withResults: 3,
    withoutResults: 1,
    resultsPosted: [
      { nct: 'NCT00000001', resultsFirstPostDate: '2020-01-01' },
      { nct: 'NCT00000002', resultsFirstPostDate: '2022-01-01' },
      { nct: 'NCT00000003', resultsFirstPostDate: '2021-01-01' },
    ],
  }),
  source_record_id: 'clinicaltrials.gov:api-v2-studies-snapshot:2026-09-01T09:00:05',
  source_url: 'https://clinicaltrials.gov/api/v2/studies',
  source_date: '2026-09-01',
  match_rule: 'name-candidate',
}
writeFileSync(mappedRow, JSON.stringify(fixture))

function run(args: string[]) {
  return spawnSync(python, [script, ...args], { encoding: 'utf8' })
}

describe('ClinicalTrials mapped name-candidate discovery', () => {
  it('joins exact slug to page key and emits a bounded, explicitly unverified queue', () => {
    const process = run([
      '--slug',
      'test-drug',
      '--slugs',
      slugs,
      '--fixture-row-json',
      mappedRow,
      '--limit',
      '2',
      '--offset',
      '1',
    ])
    expect(process.status).toBe(0)
    const report = JSON.parse(process.stdout)
    expect(report).toMatchObject({
      status: 'NAME_CANDIDATE_UNVERIFIED',
      slug: 'test-drug',
      page: { key: 'K1:TEST', tier: '1' },
      source: {
        mappedField: 'registry.hasResults',
        sourceDate: '2026-09-01',
        matchRule: 'name-candidate',
      },
      counts: {
        totalNameMatchedTrials: 4,
        totalResultsPostedCandidates: 3,
        returned: 2,
        offset: 1,
        limit: 2,
        remainingAfterPage: 0,
      },
    })
    expect(report.candidates.map((candidate: { nct: string }) => candidate.nct)).toEqual([
      'NCT00000003',
      'NCT00000001',
    ])
    expect(report.candidates[0]).toMatchObject({
      status: 'NAME_CANDIDATE_UNVERIFIED',
      sourceValuePath: 'registry.hasResults.resultsPosted',
    })
    expect(report.candidates[0]).not.toHaveProperty('result')
    expect(report.caution).toContain('unverified normalized-name match')
  })

  it('distinguishes an unknown slug from a mapped key with no registry row', () => {
    const unknown = run(['--slug', 'missing', '--slugs', slugs])
    expect(unknown.status).toBe(0)
    expect(JSON.parse(unknown.stdout).status).toBe('NO_EXACT_PAGE_SLUG')

    writeFileSync(mappedRow, 'null')
    const noRow = run(['--slug', 'other-drug', '--slugs', slugs, '--fixture-row-json', mappedRow])
    expect(noRow.status).toBe(0)
    expect(JSON.parse(noRow.stdout).status).toBe('NO_MAPPED_REGISTRY_ROW')
    writeFileSync(mappedRow, JSON.stringify(fixture))
  })

  it('rejects inconsistent counts or falsely verified match rules', () => {
    const wrong = { ...fixture, match_rule: 'identifier-confirmed' }
    writeFileSync(mappedRow, JSON.stringify(wrong))
    expect(
      run(['--slug', 'test-drug', '--slugs', slugs, '--fixture-row-json', mappedRow]).status,
    ).toBe(2)

    wrong.match_rule = 'name-candidate'
    wrong.value = JSON.stringify({
      trials: 4,
      withResults: 2,
      resultsPosted: [{ nct: 'NCT00000001' }],
    })
    writeFileSync(mappedRow, JSON.stringify(wrong))
    const countMismatch = run([
      '--slug',
      'test-drug',
      '--slugs',
      slugs,
      '--fixture-row-json',
      mappedRow,
    ])
    expect(countMismatch.status).toBe(2)
    expect(countMismatch.stderr).toContain('counts disagree')
    writeFileSync(mappedRow, JSON.stringify(fixture))
  })

  it('rejects unbounded requests', () => {
    const process = run(['--slug', 'test-drug', '--limit', '101'])
    expect(process.status).toBe(2)
    expect(process.stderr).toContain('--limit must be 1')
  })
})

const hasDuckDb = spawnSync(python, ['-c', 'import duckdb'], { encoding: 'utf8' }).status === 0

describe.skipIf(!hasDuckDb)('real mapped registry snapshot', () => {
  it('returns an inspectable dapagliflozin queue without claiming trial results', () => {
    const process = run(['--slug', 'dapagliflozin', '--limit', '3'])
    expect(process.status).toBe(0)
    const report = JSON.parse(process.stdout)
    expect(report.page.key).toBe('COMBO:{IK:DNIAPMSPPWPWGF-VKHMYHEASA-N,K1:1ULL0QJ8UC}')
    expect(report.source.sourceDate).toBe('2026-09-01')
    expect(report.source.mappedPath).toBe('data/sources/clinicaltrials/mapped.parquet')
    expect(report.counts.totalNameMatchedTrials).toBeGreaterThan(0)
    expect(report.counts.totalResultsPostedCandidates).toBeGreaterThan(0)
    expect(report.candidates).toHaveLength(3)
    for (const candidate of report.candidates) {
      expect(candidate.status).toBe('NAME_CANDIDATE_UNVERIFIED')
      expect(candidate).not.toHaveProperty('result')
    }
  })
})

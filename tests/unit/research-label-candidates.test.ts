import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const script = resolve('scripts/research/label-candidates.py')
const realSource = resolve('data/sources/openfda-label/mapped.parquet')
const METFORMIN = '11111111-1111-4111-8111-111111111111'
const COMBINATION = '22222222-2222-4222-8222-222222222222'
const CISPLATIN = '33333333-3333-4333-8333-333333333333'
const dirs: string[] = []

function tempFile(name: string, text: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'rnawiki-label-test-'))
  dirs.push(dir)
  const path = join(dir, name)
  writeFileSync(path, text)
  return path
}

function run(args: string[], env: NodeJS.ProcessEnv = process.env) {
  return spawnSync('python3', [script, ...args], {
    cwd: resolve('.'),
    encoding: 'utf8',
    env,
  })
}

function row(key: string, setId: string, date: string, section: string, blocks: string[]) {
  return {
    key,
    field: section,
    value: JSON.stringify(blocks),
    source_record_id: setId,
    source_url: `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}`,
    source_date: date,
    match_rule: 'unii',
    form_of_target: null,
    licence: 'CC0 1.0 Universal',
  }
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('read-only SPL candidate extraction', () => {
  it('keeps exact section substrings and stable source locators, with no product-wide inference', () => {
    const excerpt =
      'Metformin hydrochloride tablets can cause lactic acidosis in susceptible patients.'
    const source = tempFile(
      'labels.ndjson',
      `${JSON.stringify(
        row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', [
          `WARNING: LACTIC ACIDOSIS ${excerpt} Monitor patients carefully.`,
        ]),
      )}\n`,
    )
    const args = ['--input', source, '--key', 'K1:9100L32L2N']
    const first = run(args)
    const second = run(args)
    expect(first.status).toBe(0)
    expect(first.stdout).toBe(second.stdout)
    const result = JSON.parse(first.stdout)
    expect(result.draftOnly).toBe(true)
    expect(result.selection.candidateCount).toBeGreaterThan(0)
    const candidate = result.candidates[0]
    const original = JSON.parse(JSON.parse(readFileSync(source, 'utf8')).value)[0]
    const locator = candidate.source.localLocator
    expect(original.slice(locator.startChar, locator.endCharExclusive)).toBe(
      candidate.verbatimExcerpt,
    )
    expect(locator).toMatchObject({
      sourceFile: realpathSync(source),
      ndjsonLine: 1,
      setId: METFORMIN,
      section: 'boxed_warning',
      blockIndex: 0,
    })
    expect(candidate.scope).toMatchObject({
      jurisdiction: 'US',
      route: null,
      dosageForm: null,
      compositionStatus: 'unknown',
      ingredientAttribution: 'label_match_only_not_an_ingredient_wide_claim',
    })
  })

  it('joins only on exact set ID and keeps forms/routes and combination status separate', () => {
    const source = tempFile(
      'labels.ndjson',
      [
        row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', [
          'Postmarketing cases of metformin-associated lactic acidosis have resulted in death.',
        ]),
        row('K1:9100L32L2N', COMBINATION, '2026-08-25', 'boxed_warning', [
          'This combination product may cause a serious adverse reaction in some patients.',
        ]),
        row('K1:Q20Q21Q62J', CISPLATIN, '2026-08-27', 'boxed_warning', [
          'Cisplatin for injection can cause severe renal toxicity, including acute renal failure.',
        ]),
      ]
        .map((item) => JSON.stringify(item))
        .join('\n') + '\n',
    )
    const metadata = tempFile(
      'metadata.ndjson',
      [
        {
          setId: METFORMIN,
          brandNames: ['Product A'],
          routes: ['ORAL'],
          dosageForms: ['TABLET'],
          declaredSubstanceCount: 1,
        },
        {
          setId: COMBINATION,
          brandNames: ['Product B'],
          routes: ['ORAL', 'TOPICAL'],
          dosageForms: ['TABLET', 'CREAM'],
          declaredSubstanceCount: 2,
        },
        {
          setId: CISPLATIN,
          brandNames: ['Product C'],
          routes: ['INTRAVENOUS'],
          dosageForms: ['INJECTION'],
          declaredSubstanceCount: 1,
        },
      ]
        .map((item) => JSON.stringify(item))
        .join('\n') + '\n',
    )
    const result = run(['--input', source, '--key', 'K1:9100L32L2N', '--metadata', metadata])
    expect(result.status).toBe(0)
    const candidates = JSON.parse(result.stdout).candidates
    expect(candidates).toHaveLength(2)
    expect(
      new Set(candidates.map((item: { source: { setId: string } }) => item.source.setId)),
    ).toEqual(new Set([METFORMIN, COMBINATION]))
    const single = candidates.find(
      (item: { source: { setId: string } }) => item.source.setId === METFORMIN,
    )
    expect(single.scope).toMatchObject({
      route: 'ORAL',
      dosageForm: 'TABLET',
      compositionStatus: 'single_declared_substance',
      brandNamesOnLabel: ['Product A'],
    })
    const combo = candidates.find(
      (item: { source: { setId: string } }) => item.source.setId === COMBINATION,
    )
    expect(combo.scope).toMatchObject({
      route: null,
      dosageForm: null,
      routesOnLabel: ['ORAL', 'TOPICAL'],
      dosageFormsOnLabel: ['CREAM', 'TABLET'],
      formRoutePairing: 'not_established',
      compositionStatus: 'multiple_declared_substances',
    })
  })

  it('round-robins the bounded output across selected labels', () => {
    const source = tempFile(
      'labels.ndjson',
      [
        row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', [
          'First product has a detailed source-recorded caution for vulnerable patients. Another caution applies to the first product only.',
        ]),
        row('K1:9100L32L2N', COMBINATION, '2026-08-25', 'boxed_warning', [
          'Second product has a different caution stated in its own label document.',
        ]),
      ]
        .map((item) => JSON.stringify(item))
        .join('\n') + '\n',
    )
    const result = run(['--input', source, '--key', 'K1:9100L32L2N', '--max-total', '2'])
    expect(result.status).toBe(0)
    expect(
      JSON.parse(result.stdout).candidates.map(
        (item: { source: { setId: string } }) => item.source.setId,
      ),
    ).toEqual([METFORMIN, COMBINATION])
  })

  it('does not attach metadata from another effective date of the same set ID', () => {
    const source = tempFile(
      'labels.ndjson',
      `${JSON.stringify(
        row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', [
          'This product has a source-recorded caution for patients with a particular condition.',
        ]),
      )}\n`,
    )
    const metadata = tempFile(
      'metadata.ndjson',
      `${JSON.stringify({ setId: METFORMIN, effectiveTime: '20250701', routes: ['INTRAVENOUS'], dosageForms: ['INJECTION'] })}\n`,
    )
    const result = run(['--input', source, '--key', 'K1:9100L32L2N', '--metadata', metadata])
    expect(result.status).toBe(0)
    expect(JSON.parse(result.stdout).candidates[0].scope).toMatchObject({
      route: null,
      dosageForm: null,
    })
  })

  it('fails closed on malformed section data instead of fabricating a candidate', () => {
    const source = tempFile(
      'labels.ndjson',
      `${JSON.stringify({ ...row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', []), value: '{bad' })}\n`,
    )
    const result = run(['--input', source, '--key', 'K1:9100L32L2N'])
    expect(result.status).toBe(2)
    expect(result.stdout).toBe('')
    expect(result.stderr).toContain('label-candidates:')
  })

  it('refuses conflicting same-date section rows when the SPL version cannot be identified', () => {
    const source = tempFile(
      'labels.ndjson',
      [
        row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', [
          'First version has a source-recorded safety statement for this exact product.',
        ]),
        row('K1:9100L32L2N', METFORMIN, '2026-08-26', 'boxed_warning', [
          'Second version has a different source-recorded safety statement for this product.',
        ]),
      ]
        .map((item) => JSON.stringify(item))
        .join('\n') + '\n',
    )
    const result = run(['--input', source, '--key', 'K1:9100L32L2N'])
    expect(result.status).toBe(2)
    expect(result.stderr).toContain('Conflicting section rows')
    expect(result.stdout).toBe('')
  })
})

const duckdbAvailable =
  spawnSync('python3', ['-c', 'import duckdb'], {
    env: process.env,
  }).status === 0

describe.skipIf(!duckdbAvailable || !existsSync(realSource))(
  'local openFDA SPL mapped corpus',
  () => {
    it.each([
      ['K1:9100L32L2N', 'metformin'],
      ['K1:Q20Q21Q62J', 'cisplatin'],
    ])('returns bounded, traceable real excerpts for %s (%s)', (key) => {
      const result = run([
        '--input',
        realSource,
        '--key',
        key,
        '--max-labels',
        '1',
        '--max-total',
        '5',
      ])
      expect(result.status).toBe(0)
      const payload = JSON.parse(result.stdout)
      expect(payload.selection.candidateCount).toBeGreaterThan(0)
      expect(payload.selection.candidateCount).toBeLessThanOrEqual(5)
      for (const candidate of payload.candidates) {
        expect(candidate.source.localLocator.sourceFile).toBe(realSource)
        expect(candidate.source.setId).toMatch(/^[0-9a-f-]{36}$/)
        expect(candidate.scope.route).toBeNull()
        expect(candidate.scope.dosageForm).toBeNull()
        expect(candidate.verbatimExcerpt.length).toBeGreaterThan(44)
      }
    })
  },
)

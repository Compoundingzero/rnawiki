/**
 * The body builders — `scripts/corpus-20k/render/page-text.ts`, imported through the module the
 * dossier template uses so the test proves both paths are one implementation.
 *
 * Fixtures only. Every page below is a hand-built shape exercising one rule; no value here is ever
 * written to data/, and nothing here is seed data.
 */
import { describe, expect, it } from 'vitest'

import { buildBlockBody, pageProse, renderPage } from '@/lib/corpus/page-text'
import type { BlockBody, PageBundle } from '@/lib/corpus/page-text'
import type { FieldEntry, QuestionBlock, SourceRef } from '@/scripts/corpus-20k/questions/derive'

const SOURCE: SourceRef = {
  kind: 'registry',
  id: 'NCT00000000',
  url: 'https://example.invalid/record',
}

function field(value: unknown, state: FieldEntry['state'] = 'present'): FieldEntry {
  return { state, value, source: [SOURCE], sourceDate: '2026-01-15' }
}

function bundle(overrides: Partial<PageBundle> = {}): PageBundle {
  return {
    key: 'K1:TEST',
    displayName: 'Theophylline',
    model: 'CLINICAL',
    tier: 2,
    withdrawn: false,
    suppressed: false,
    suppressionClasses: [],
    stub: false,
    presentFields: 4,
    fields: {},
    seeds: {},
    identity: { synonyms: [], relations: [] },
    questions: [],
    names: new Map(),
    ...overrides,
  }
}

function question(overrides: Partial<QuestionBlock> = {}): QuestionBlock {
  return {
    id: 'q',
    text: 'A question?',
    badge: 'Q1',
    block: 'human-data',
    template: 'human-data',
    values: {},
    sources: [SOURCE],
    ...overrides,
  } as QuestionBlock
}

function body(page: PageBundle, q: QuestionBlock): BlockBody {
  return buildBlockBody(q, page)
}

/* -------------------------------------------------- seed 15 is a value, not a block */

describe('evidence age renders inside the human-data block', () => {
  const CEILING = field({ largestN: 245, longestDurationDays: 400, byPhase: { PHASE3: 2 } })
  const SEED_15 = {
    fires: true,
    slots: { year: 2019 },
    values: {
      latest: {
        date: '2019-06-30',
        record: 'NCT01234567',
        recordKind: 'NCT',
        kind: 'trial completion',
      },
      yearsSince: 7,
      asOf: '2026-09-04',
    },
  }
  const q = question({ values: { N: '245', duration: '13 months' } })

  it('writes the last completed test into paragraph 2 when seed 15 holds a value', () => {
    const b = body(
      bundle({ fields: { humanEvidenceCeiling: CEILING }, seeds: { seed15: SEED_15 } }),
      q,
    )
    expect(b.paragraphs[1]).toContain('Last human test completed 2019, NCT01234567.')
  })

  it('writes nothing about it when seed 15 does not fire for the page', () => {
    const b = body(bundle({ fields: { humanEvidenceCeiling: CEILING } }), q)
    expect(b.paragraphs.join(' ')).not.toContain('Last human test completed')
  })

  it('reveals the record and the completion date, with no "as of" and no "years since" label', () => {
    const b = body(
      bundle({ fields: { humanEvidenceCeiling: CEILING }, seeds: { seed15: SEED_15 } }),
      q,
    )
    const row = b.rows.find((r) => r.label === 'Last recorded human test')
    expect(row).toEqual({
      label: 'Last recorded human test',
      identifier: 'NCT01234567',
      value: '2019-06-30',
    })
    const rendered = b.rows.map((r) => `${r.label} ${r.value}`).join(' | ')
    expect(rendered).not.toMatch(/as of/i)
    expect(rendered).not.toMatch(/years since/i)
  })
})

/* ------------------------------------------------------------- one full stop */

describe('a value that ends its own sentence does not gain a second full stop', () => {
  it('leaves "18 months." as one sentence end', () => {
    const ceiling = field({
      largestN: 80452,
      primaryOutcomeVerbatim:
        'combined rate of mortality and neurodevelopmental disability in survivors at a corrected age of 18 months.',
    })
    const b = body(
      bundle({ fields: { humanEvidenceCeiling: ceiling } }),
      question({ values: { N: '80452', duration: '25 years' } }),
    )
    expect(b.paragraphs[0]).toContain('at a corrected age of 18 months.')
    expect(b.paragraphs[0]).not.toContain('18 months..')
  })

  it('keeps a closing quotation mark before the value’s own stop', () => {
    const kinetics = field({
      halfLife: { value: 6, unit: 'h', verbatim: 'The mean half-life is 6 hours.' },
    })
    const b = body(
      bundle({ fields: { kinetics } }),
      question({ block: 'kinetics', template: 'kinetics', values: { halfLife: '6 h' } }),
    )
    expect(b.paragraphs[0]).toContain('6 hours."')
    expect(b.paragraphs[0]).not.toContain('."."')
  })
})

/* ------------------------------------------------- the three CLINICAL bodies */

describe('CLINICAL bodies state the page’s own values and its own limits', () => {
  const INDICATION = field({
    statement: 'indicated for chronic asthma',
    labelSection: 'indications_and_usage',
  })
  // The real extractor's shape: a jurisdiction it could consult carries `sources`, and one whose
  // register was never licensed for this corpus carries a note and none. Phase 5a keeps the two
  // apart, so a body can name the first group and must never name the second.
  const REGISTERS = field({
    US: {
      status: 'approved',
      sources: ['Drugs@FDA'],
      evidence: [
        {
          id: 'NDA012345',
          register: 'Drugs@FDA',
          sourceDate: '2026-09-04',
          statement: 'application NDA012345: Prescription',
        },
      ],
    },
    EU: { status: 'unknown', sources: ['EMA Medicine.csv'], evidence: [] },
    CA: { status: 'unknown', sources: ['Health Canada Drug Product Database'], evidence: [] },
    JP: { status: 'unknown', sources: [], evidence: [], note: 'no Japanese register was cleared' },
  })
  const HISTORY = field({
    registeredStudies: 18,
    byPhase: { PHASE3: 1, PHASE2: 2 },
    studiesWithPostedResults: 6,
  })

  it('quotes the label statement and states only the jurisdictions that recorded a status', () => {
    const b = body(
      bundle({ fields: { indication: INDICATION, regulatoryStatus: REGISTERS } }),
      question({ block: 'indication', template: 'indication' }),
    )
    expect(b.paragraphs[0]).toContain('"indicated for chronic asthma"')
    expect(b.paragraphs[0]).toContain('indications and usage')
    expect(b.paragraphs[1]).toBe('US approved (NDA012345, 2026-09-04).')
  })

  it('renders the register statuses as rows and names no never-cleared jurisdiction', () => {
    const b = body(
      bundle({ fields: { regulatoryStatus: REGISTERS } }),
      question({ block: 'regulatory-only', template: 'regulatory-only' }),
    )
    expect(b.paragraphs[0]).toContain('US approved (NDA012345, 2026-09-04)')
    // No paragraph 2: counting the silent registers was the same sentence on a sixth of the corpus.
    expect(b.paragraphs).toHaveLength(1)
    expect(b.rows).toEqual([
      { label: 'EU', value: 'consulted, no status recorded' },
      { label: 'CA', value: 'consulted, no status recorded' },
      {
        label: 'US',
        identifier: 'NDA012345',
        value: 'approved · Drugs@FDA · application NDA012345: Prescription · 2026-09-04',
      },
    ])
    // JP was never cleared for this corpus; that fact lives on /definitions, never in a body.
    expect(JSON.stringify(b)).not.toContain('JP')
  })

  it('states how many registered studies posted no result', () => {
    const b = body(
      bundle({ fields: { trialHistory: HISTORY } }),
      question({ block: 'trial-history', template: 'trial-history' }),
    )
    expect(b.paragraphs[0]).toContain('18 registered studies of Theophylline')
    expect(b.paragraphs[1]).toContain('12 of 18 posted no result')
  })

  it('never writes a caveat that would read the same on another page', () => {
    const other = bundle({
      displayName: 'Salbutamol',
      fields: {
        indication: field({
          statement: 'indicated for acute bronchospasm',
          labelSection: 'indications_and_usage',
        }),
        regulatoryStatus: field({ US: { status: 'approved' }, EU: { status: 'approved' } }),
      },
    })
    const a = body(
      bundle({ fields: { indication: INDICATION, regulatoryStatus: REGISTERS } }),
      question({ block: 'indication', template: 'indication' }),
    )
    const b = body(other, question({ block: 'indication', template: 'indication' }))
    expect(a.paragraphs[1]).not.toBe(b.paragraphs[1])
  })
})

/* ------------------------------------- standing paragraph-2 fallbacks removed */

describe('a paragraph with nothing of the page’s own in it is not written', () => {
  it('drops the kinetics caveat when the label states only a half-life', () => {
    const kinetics = field({ halfLife: { value: 6, unit: 'h' } })
    const b = body(
      bundle({ fields: { kinetics } }),
      question({ block: 'kinetics', template: 'kinetics', values: { halfLife: '6 h' } }),
    )
    expect(b.paragraphs).toHaveLength(1)
    expect(b.paragraphs.join(' ')).not.toContain('The label records no other value')
  })

  it('drops the supervision caveat when no study record accompanies the classification', () => {
    const page = bundle({ suppressed: true, suppressionClasses: ['S6'], fields: {} })
    const b = body(page, question({ block: 'supervision', template: 'supervision' }))
    expect(b.paragraphs.join(' ')).not.toContain('No study record accompanies it')
  })

  it('drops the dose paragraph when one entry states no route and no other amount', () => {
    const studied = field([{ organism: 'human', doseText: '200 mg twice daily' }])
    const b = body(
      bundle({ fields: { doseStudied: studied } }),
      question({
        block: 'dose-studied',
        template: 'dose-studied',
        values: { organism: 'human', dose: '200 mg twice daily' },
      }),
    )
    expect(b.paragraphs).toHaveLength(1)
    expect(b.paragraphs.join(' ')).not.toContain('route not stated')
  })

  it('keeps the dose paragraph when a route or another amount is recorded', () => {
    const studied = field([
      { organism: 'human', doseText: '200 mg twice daily', route: 'oral' },
      { organism: 'human', doseText: '400 mg once daily', route: 'oral' },
    ])
    const b = body(
      bundle({ fields: { doseStudied: studied } }),
      question({
        block: 'dose-studied',
        template: 'dose-studied',
        values: { organism: 'human', dose: '200 mg twice daily' },
      }),
    )
    expect(b.paragraphs[1]).toContain('oral')
    expect(b.paragraphs[1]).toContain('400 mg once daily')
  })
})

/* -------------------------------------------- the standing-sentence audit input */

describe('pageProse separates what the page asserts from what it cites and labels', () => {
  const page = bundle({
    fields: {
      trialHistory: field({
        registeredStudies: 18,
        byPhase: { PHASE3: 1 },
        studiesWithPostedResults: 6,
      }),
    },
    questions: [
      question({ block: 'trial-history', template: 'trial-history', text: 'How many trials?' }),
    ],
  })

  it('keeps the question and the paragraphs, and drops the provenance anchor', () => {
    const prose = pageProse(page)
    expect(prose.sentences).toContain('How many trials?')
    expect(prose.sentences.some((s) => s.includes('·'))).toBe(false)
  })

  it('reports revealed-row labels apart from the prose', () => {
    const prose = pageProse(page)
    expect(prose.rowLabels.length).toBeGreaterThan(0)
    for (const label of prose.rowLabels) expect(prose.sentences).not.toContain(label)
  })
})

/* ------------------------------------------------------------ the whole page */

describe('renderPage', () => {
  it('writes no evidence-age heading and keeps the human-data value', () => {
    const page = bundle({
      tier: 1,
      fields: { humanEvidenceCeiling: field({ largestN: 245, longestDurationDays: 400 }) },
      seeds: {
        seed15: {
          fires: true,
          slots: { year: 2019 },
          values: { latest: { date: '2019-06-30', record: 'NCT01234567' } },
        },
      },
      questions: [question({ values: { N: '245', duration: '13 months' } })],
    })
    const rendered = renderPage(page)
    expect(rendered.text).toContain('Last human test completed 2019, NCT01234567.')
    expect(rendered.text).not.toContain('what has changed since?')
    expect(rendered.text).not.toContain('No later publication is recorded')
  })
})

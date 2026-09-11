/**
 * Phase 0 trust patches on the one text generator both renderers share
 * (docs/rnawiki-biohacker-rebuild-audit.md). Each case below reproduces a defect verified on the
 * live site on 2026-09-10 and asserts the generator no longer produces it.
 *
 * Fixtures only: every shape here is hand-built, and nothing is seed data.
 */
import { describe, expect, it } from 'vitest'

import { buildBlockBody } from '@/lib/corpus/page-text'
import type { PageBundle } from '@/lib/corpus/page-text'
import { findInternalKeys } from '@/lib/dossier-v3/copy-contract'
import { SPONTANEOUS_REPORT_FRAMING } from '@/lib/dossier-v3/stored-keys'
import type { FieldEntry, QuestionBlock, SourceRef } from '@/scripts/corpus-20k/questions/derive'

const SOURCE: SourceRef = { kind: 'registry', id: 'NCT00000000', url: 'https://example.invalid/r' }

function field(value: unknown, state: FieldEntry['state'] = 'present'): FieldEntry {
  return { state, value, source: [SOURCE], sourceDate: '2026-01-15' }
}

function bundle(overrides: Partial<PageBundle> = {}): PageBundle {
  return {
    key: 'K1:TEST',
    displayName: 'Creatine',
    model: 'LONGEVITY',
    tier: 1,
    withdrawn: false,
    suppressed: false,
    suppressionClasses: [],
    stub: false,
    presentFields: 6,
    fields: {},
    seeds: {},
    identity: { synonyms: [], relations: [] },
    questions: [],
    names: new Map(),
    ...overrides,
  }
}

function question(overrides: Partial<QuestionBlock>): QuestionBlock {
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

describe('fixture 11 — internal database keys never appear in rendered copy', () => {
  it('translates the derived-seed test ids the live creatine page painted', () => {
    const page = bundle({
      seeds: {
        seed2: {
          id: 'seed2',
          fires: true,
          values: {
            tests: {
              a_biomarkerMeasuredInHumans: true,
              b_halfLifeRecorded: false,
              c_smallHumanTrialReportedEffect: 'unknown',
            },
            missing: ['b_halfLifeRecorded'],
            notDeterminable: [{ test: 'c_smallHumanTrialReportedEffect' }],
            biomarkers: [
              { term: 'upper extremity motor function after 3 weeks', trials: ['NCT1'] },
            ],
          },
        },
      } as unknown as PageBundle['seeds'],
    })
    const body = buildBlockBody(
      question({
        block: 'n-of-1',
        template: 'n-of-1',
        values: { biomarker: 'upper extremity motor function after 3 weeks' },
      }),
      page,
    )
    const painted = [
      ...body.paragraphs,
      ...body.rows.map((row) => `${row.label} ${row.identifier ?? ''} ${row.value}`),
    ].join('\n')
    expect(painted).not.toContain('b_halfLifeRecorded')
    expect(painted).toContain('a recorded half-life')
    expect(findInternalKeys(painted)).toEqual([])
  })
})

describe('fixture 12 — spontaneous reports are framed before they are counted', () => {
  const page = bundle({
    fields: {
      faersSignal: field({
        terms: [
          { term: 'coma', count: 24 },
          { term: 'somnolence', count: 24 },
          { term: 'jaundice', count: 8 },
        ],
      }),
    },
  })
  const body = buildBlockBody(
    question({ block: 'faers', template: 'faers', values: { n: '139' } }),
    page,
  )

  it('paints the causality and denominator framing as the first paragraph, as furniture', () => {
    expect(body.paragraphs[0]).toBe(SPONTANEOUS_REPORT_FRAMING.join(' '))
    expect(body.furniture[0]).toBe(true)
  })

  it('never turns a count into a rate and keeps the count after the framing', () => {
    expect(body.paragraphs[1]).toContain('139 reaction mentions were counted')
    expect(body.paragraphs[1]).not.toMatch(/\d+ spontaneous reports/)
    expect(body.paragraphs[1]).toContain('coma 24')
    expect(body.paragraphs.join(' ')).not.toMatch(/\b(incidence|per 1,?000|per 100)\b|%/)
  })
})

describe('fixture 7 and 9 — a registered-study count says what it includes', () => {
  const ceiling = field({
    largestN: 887132,
    longestDurationDays: 9289,
    byPhase: { PHASE3: 2 },
    endpointTypeFrom: 'Motor Function',
  })

  it('qualifies the old aggregate when trial roles are not yet classified', () => {
    const body = buildBlockBody(
      question({ values: { N: '887132', duration: '25 years' } }),
      bundle({ displayName: 'Semaglutide', fields: { humanEvidenceCeiling: ceiling } }),
    )
    const text = body.paragraphs.join(' ')
    expect(text).toContain('largest registered study')
    expect(text).toContain('exposure in an observational study')
    expect(text).toContain('planned end date')
    expect(text).not.toContain('largest trial')
  })

  it('reads the role-aware aggregate when it is on the record', () => {
    const body = buildBlockBody(
      question({ values: { N: '887132', duration: '25 years' } }),
      bundle({
        displayName: 'Semaglutide',
        fields: { humanEvidenceCeiling: ceiling },
        registry: {
          studies: 550,
          roleAware: {
            matchedStudies: 550,
            tested: {
              studies: 310,
              largest: { nctId: 'NCT05441267', enrollment: 21296, enrollmentType: 'ACTUAL' },
              longestCompletedWindow: {
                nctId: 'NCT03548935',
                days: 1200,
                startDate: '2018-06',
                completionDate: '2021-09',
              },
              medianEnrollment: 120,
              completedWithPostedResults: 100,
            },
          },
        },
      }),
    )
    const text = body.paragraphs.join(' ')
    expect(text).toContain('Semaglutide was the tested treatment in 310 registered studies')
    expect(text).toContain('240 more list it as a comparison treatment')
    expect(text).toContain('21296 people')
    expect(text).not.toContain('887132')
    expect(text).toContain('not the time anyone took Semaglutide')
    expect(text).not.toContain('planned end date')
  })
})

/**
 * Phase 3 step 3.7 — a suppressed record states its classification in the supervision block, in
 * ordinary words, and never as a stored class id.
 *
 * The 39 records in `data/revamp/suppressed-no-question.csv` hold too few fields to carry a
 * question, so the derivation gives them no question rows at all. Before this test existed their
 * classification fell through to the stub's own line, which printed `S1, S4`. These cases hold the
 * template to the spec: the block exists, it leads the page, and the rendered text carries no class
 * token.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CorpusDossierPage } from '@/components/dossier/corpus/CorpusDossierPage'
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { buildBlockBody, type PageBundle } from '@/lib/corpus/page-text'
import {
  SUPPRESSION_CLASS_LABELS,
  citedSuppressionLabels,
  isUnknownClassOnly,
  supervisionBlock,
  supervisionClauses,
  unknownClassificationLine,
  type SuppressionEvidence,
} from '@/lib/corpus/suppression-classes'

/**
 * The evidence the suppression pass records for a class, in the shape §15(1) reads it: the class it
 * answers, the source that stated it, that source's value and, for an ATC-based class, the
 * register's own name for the code. One row per class here, so a fixture naming a class also
 * carries the evidence that class's clause is built from.
 */
const EVIDENCE: Record<string, SuppressionEvidence> = {
  S1: {
    test: 'S1',
    source: 'WHO ATC via ChEMBL/EMA',
    value: 'C01AA04 (cardiac glycoside)',
    label: 'C01AA, digitalis glycosides',
  },
  S2: {
    test: 'S2',
    source: 'Misuse of Drugs Act 1973 (2020 Rev Ed)',
    value: 'First Schedule Part 1 — Class A controlled drug (statute version 2026-05-01)',
  },
  S3: {
    test: 'S3',
    source: 'pregnancy-prevention REMS roster named in the R2 spec',
    value: 'iPLEDGE',
  },
  S4: {
    test: 'S4',
    source: 'WHO ATC L01 (NIOSH list not fetched)',
    value: 'L01BB05',
    label: 'L01BB, purine analogues',
  },
  S5: {
    test: 'S5',
    source: 'openFDA label text (no cleared bulk FDA REMS list)',
    value: 'openFDA label text mentions REMS',
  },
  S6: {
    test: 'S6',
    source: 'openFDA label boxed_warning',
    value: 'death or fatality; embryo-fetal toxicity',
  },
  S7: { test: 'S7', source: 'openFDA label/NDC route', value: 'INTRAVENOUS' },
  S8: {
    test: 'S8',
    source: 'ChEMBL / Open Targets drug_warning, EMA register',
    value: 'Open Targets drug_warning Withdrawn (nephrotoxicity; European Union; 2022)',
  },
  S9: {
    test: 'S9',
    source: 'WHO ATC A10A (insulin)',
    value: 'A10AB01',
    label: 'A10AB, insulins and analogues for injection, fast-acting',
  },
}

const evidenceFor = (classes: readonly string[]): SuppressionEvidence[] =>
  classes
    .map((code) => EVIDENCE[code])
    .filter((row): row is SuppressionEvidence => row !== undefined)

// Next preserves JSX for its compiler; this direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

/** A record at the shape the 39 pages have: suppressed, below the stub floor, no question rows. */
function suppressedStub(classes: string[]): CorpusDossier {
  const evidence = evidenceFor(classes)
  const block = supervisionBlock('Fixture Compound', classes, evidence)
  return {
    key: 'K1:FIXTURE00',
    slug: 'fixture-compound',
    displayName: 'Fixture Compound',
    model: 'DEVELOPMENT',
    tier: 3,
    pageType: 'stub',
    indexable: false,
    suppressed: true,
    suppressionClasses: classes,
    suppressionEvidence: evidence,
    withdrawn: false,
    presentFieldCount: 2,
    applicableFieldCount: 9,
    synonyms: [],
    register: 'ChEMBL',
    humanData: false,
    ladder: [],
    blocks: block ? [block] : [],
    registerEvents: [],
    identifiers: [{ field: 'unii', label: 'UNII', value: '027828ZV5Q' }],
    relations: [],
    hubs: [],
    sources: [],
    licenceNotes: [],
    registeredStudies: 0,
    // Phase 4 (migration 0026): a stub carries the same block set as any other page, and holds
    // none of it. Empty here is the honest fixture — the 39 pages have no register line to render.
    controlled: false,
    controlledBasis: [],
    registration: [],
    controlledSchedules: [],
    interactions: { lines: [], sourcesChecked: [], totals: {}, predictedOnly: false },
    computedSections: [],
    formOfNotes: [],
    // What the loader writes: the line exists only where there is no classification to state.
    ...(block === undefined && isUnknownClassOnly(classes)
      ? { supervisionLine: unknownClassificationLine() }
      : {}),
  }
}

/** The rendered page with tags removed — what a reader actually reads. */
function visibleText(markup: string): string {
  return markup
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

describe('the suppression class labels', () => {
  it('carries the wording the spec fixes, for every class', () => {
    const spec = readFileSync(join(process.cwd(), 'docs/specs/suppression-classes.md'), 'utf8')
    const section = spec.slice(spec.indexOf('## Ordinary-language labels'))
    expect(section.length).toBeGreaterThan(0)
    for (const [code, label] of Object.entries(SUPPRESSION_CLASS_LABELS)) {
      const row = new RegExp(`^\\|\\s*${code}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, 'm').exec(section)
      expect(row, `${code} has no row in the spec's label table`).not.toBeNull()
      expect(row?.[1]).toBe(label)
    }
  })

  it('names no class id in any label', () => {
    for (const label of Object.values(SUPPRESSION_CLASS_LABELS)) {
      expect(label).not.toMatch(/\bS(?:[1-9]|1[01])\b/)
    }
  })

  it('cites only the classes a register positively recorded, lowest first', () => {
    expect(citedSuppressionLabels(['S4', 'S1'])).toEqual([
      SUPPRESSION_CLASS_LABELS.S1,
      SUPPRESSION_CLASS_LABELS.S4,
    ])
    expect(citedSuppressionLabels(['S10'])).toEqual([])
    expect(citedSuppressionLabels([])).toEqual([])
  })
})

describe('a suppressed page with no question rows', () => {
  it('renders the supervision block', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: suppressedStub(['S1', 'S4']) }),
    )
    expect(markup).toContain('data-block="supervision"')
    expect(markup).toContain('cd-supervision')
    const text = visibleText(markup)
    expect(text).toContain('Why does Fixture Compound carry a supervision requirement?')
    /*
     * §15(1): one clause per recorded class, each built from that class's own evidence and its own
     * source. The generic label — what a class of that kind might be — is never the answer.
     */
    expect(text).toContain('Its World Health Organization ATC class is C01AA, digitalis glycosides')
    expect(text).toContain('A hazardous-medicine class covers it: L01BB, purine analogues')
    expect(text).not.toContain(SUPPRESSION_CLASS_LABELS.S1)
    expect(text).not.toContain(SUPPRESSION_CLASS_LABELS.S4)
  })

  it('renders one sourced clause per recorded class, and none without a source', () => {
    const clauses = supervisionClauses(
      ['S1', 'S2', 'S3', 'S5', 'S6', 'S7', 'S8', 'S9'],
      evidenceFor(['S1', 'S2', 'S3', 'S5', 'S6', 'S7', 'S8', 'S9']),
      { boxedWarningLabel: { id: '77108624-4771-4886-a3e2-b2625c444d1b', date: '2025-01-14' } },
    )
    expect(clauses.map((clause) => clause.code)).toEqual([
      'S1',
      'S2',
      'S3',
      'S5',
      'S6',
      'S7',
      'S8',
      'S9',
    ])
    for (const clause of clauses) expect(clause.text).toMatch(/\([^()]{3,}\)\.$/)
    expect(clauses.find((clause) => clause.code === 'S6')?.text).toContain(
      'DailyMed label 77108624-4771-4886-a3e2-b2625c444d1b, 2025-01-14',
    )
    expect(clauses.find((clause) => clause.code === 'S3')?.text).toContain(
      'It is under a pregnancy-prevention programme',
    )
    // A class the suppression pass recorded with no evidence row of its own states nothing.
    expect(supervisionClauses(['S1'], [])).toEqual([])
    expect(supervisionClauses(['S1'], [{ test: 'S1', value: 'C01AA04' }])).toEqual([])
  })

  it('renders the supervision block first, above the record it holds', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: suppressedStub(['S6']) }),
    )
    const blocks = [...markup.matchAll(/data-block="([a-z0-9-]+)"/g)].map((match) => match[1])
    expect(blocks[0]).toBe('supervision')
    expect(markup.indexOf('data-block="supervision"')).toBeLessThan(markup.indexOf('cd-stub-count'))
  })

  it('puts no class id in the rendered text', () => {
    for (const classes of [['S1'], ['S1', 'S4'], ['S7'], ['S8'], ['S6', 'S9']]) {
      const markup = renderToStaticMarkup(
        React.createElement(CorpusDossierPage, { dossier: suppressedStub(classes) }),
      )
      expect(visibleText(markup)).not.toMatch(/\bS(?:[1-9]|1[01])\b/)
      expect(markup).not.toMatch(/>[^<]*\bS(?:[1-9]|1[01])\b[^<]*</)
    }
  })

  /*
   * §16(1): the supervision block is never truncated.
   *
   * `buildBlockBody` ended with `.slice(0, 2)` — the two-paragraph discipline every question answer
   * is held to — and the supervision block was held to it too, so a record carrying four classes
   * stated two of them. Glofitamab (S1, S3, S4, S6) stated neither its hazardous-medicine class nor
   * its boxed warning. Both paths are checked here, because the render and the page call the same
   * builder and a record below the stub floor assembles the block from the same clauses.
   */
  it('paints four clauses for a record carrying four classes, as list items in S1–S9 order', () => {
    const classes = ['S1', 'S3', 'S4', 'S6']
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: suppressedStub(classes) }),
    )
    const items = [...markup.matchAll(/<li class="cd-clause">([\s\S]*?)<\/li>/g)].map((match) =>
      visibleText(match[1] ?? ''),
    )
    expect(items).toHaveLength(4)
    expect(items[0]).toContain('Its World Health Organization ATC class is C01AA')
    expect(items[1]).toContain('It is under a pregnancy-prevention programme')
    expect(items[2]).toContain('A hazardous-medicine class covers it: L01BB')
    expect(items[3]).toContain('Its United States label carries a boxed warning')
    const text = visibleText(markup)
    for (const item of items) expect(text).toContain(item)
  })

  it('states that no classification is recorded when only the unknown class is held', () => {
    const dossier = suppressedStub(['S10'])
    expect(dossier.blocks).toEqual([])
    const markup = renderToStaticMarkup(React.createElement(CorpusDossierPage, { dossier }))
    expect(markup).not.toContain('data-block="supervision"')
    const text = visibleText(markup)
    expect(text).toContain('No classification is recorded for this compound')
    expect(text).not.toMatch(/\bS(?:[1-9]|1[01])\b/)
  })
})

describe('the supervision block on a page that carries question rows', () => {
  /**
   * The same record as a full page: the derivation puts the supervision question first and
   * `buildBlockBody` builds its body. §16(1) removes the two-paragraph cap from this block and
   * this block only, so the clause count is the recorded class count and not two.
   */
  const bundleFor = (classes: string[]): PageBundle =>
    ({
      key: 'K1:FIXTURE00',
      displayName: 'Fixture Compound',
      model: 'CLINICAL',
      tier: 1,
      withdrawn: false,
      suppressed: true,
      suppressionClasses: classes,
      suppressionEvidence: evidenceFor(classes),
      stub: false,
      presentFields: 6,
      fields: {},
      seeds: {},
      identity: { displayName: 'Fixture Compound', synonyms: [], relations: [] },
      questions: [],
      names: new Map(),
    }) as unknown as PageBundle

  const supervisionQuestionBlock = {
    id: 'supervision',
    text: 'Why does Fixture Compound carry a supervision requirement?',
    badge: 'Q1',
    block: 'supervision',
    template: 'supervision',
    values: {},
    sources: [],
  }

  it('builds one paragraph per recorded class, not two', () => {
    const four = buildBlockBody(supervisionQuestionBlock, bundleFor(['S1', 'S3', 'S4', 'S6']))
    expect(four.paragraphs).toHaveLength(4)
    expect(four.list).toEqual([true, true, true, true])
    expect(four.paragraphs[2]).toContain('A hazardous-medicine class covers it: L01BB')
    expect(four.paragraphs[3]).toContain('boxed warning')

    const five = buildBlockBody(supervisionQuestionBlock, bundleFor(['S1', 'S2', 'S3', 'S4', 'S6']))
    expect(five.paragraphs).toHaveLength(5)
  })

  it('still caps every other question answer at two paragraphs', () => {
    const body = buildBlockBody(
      { ...supervisionQuestionBlock, block: 'human-data', template: 'human-data' },
      bundleFor(['S1', 'S3', 'S4', 'S6']),
    )
    expect(body.paragraphs.length).toBeLessThanOrEqual(2)
  })
})

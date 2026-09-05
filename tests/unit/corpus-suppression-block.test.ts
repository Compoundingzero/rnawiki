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
import {
  SUPPRESSION_CLASS_LABELS,
  citedSuppressionLabels,
  isUnknownClassOnly,
  supervisionBlock,
  unknownClassificationLine,
} from '@/lib/corpus/suppression-classes'

// Next preserves JSX for its compiler; this direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

/** A record at the shape the 39 pages have: suppressed, below the stub floor, no question rows. */
function suppressedStub(classes: string[]): CorpusDossier {
  const block = supervisionBlock('Fixture Compound', classes)
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
    withdrawn: false,
    presentFieldCount: 2,
    applicableFieldCount: 9,
    synonyms: [],
    register: 'ChEMBL',
    humanData: false,
    ladder: [],
    blocks: block ? [block] : [],
    arc: [],
    identifiers: [{ field: 'unii', label: 'UNII', value: '027828ZV5Q' }],
    relations: [],
    sources: [],
    licenceNotes: [],
    registeredStudies: 0,
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
    expect(text).toContain(SUPPRESSION_CLASS_LABELS.S1)
    expect(text).toContain(SUPPRESSION_CLASS_LABELS.S4)
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

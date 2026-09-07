import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { HubMembers } from '@/components/hubs/HubMembers'
import { HubSynthesis } from '@/components/hubs/HubSynthesis'
import { HubTable } from '@/components/hubs/HubTable'
import {
  HUB_JURISDICTION_COLUMNS,
  type HubMemberRecord,
  type HubSynthesisRecord,
} from '@/lib/hubs/types'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

/**
 * The properties under test are the three the hub spec makes non-negotiable
 * (docs/specs/hubs.md §2, §5, and revamp operating rule 9):
 *
 *   1. every synthesis sentence a hub holds is painted, with the provenance its template recorded;
 *   2. a template whose inputs were absent wrote no row, and the page then shows nothing in its
 *      place — no stand-in line, no empty label, no bracket;
 *   3. a hub never says a compound is safe, should be taken, or is recommended.
 *
 * A failure in any of them is a release failure: the third would put a recommendation on a page
 * that is only allowed to report what registers hold.
 */

const BANNED = [/\bsafe\b/i, /should take/i, /\brecommended\b/i, /\brecommend\b/i]

function member(overrides: Partial<HubMemberRecord> = {}): HubMemberRecord {
  return {
    key: 'K1:ABC1234567',
    slug: 'bicalutamide',
    name: 'Bicalutamide',
    ordinal: 0,
    memberRole: 'approved',
    membershipEvidence: 'target field names uniprot:P10275 from chembl, uniprot',
    approvalSg: 'registered',
    approvalUs: 'approved',
    approvalAu: 'scheduled in the Poisons Standard',
    approvalUk: 'not cleared',
    approvalEu: 'approved',
    approvalJp: 'not found',
    approvalCa: 'approved',
    sgForensicClass: 'POM',
    genericAvailable: 'yes',
    potency: '9.00 (binding)',
    indications: 'Prostate cancer',
    indicationCount: 1,
    withdrawnReason: '',
    withdrawnWhere: '',
    trialsCount: 149,
    resultsPostedShare: '52/79',
    tier: 1,
    firstQuestion: 'What does the androgen receptor record show for Bicalutamide?',
    ...overrides,
  }
}

/** One sentence per template, in the order §2 item 3 fixes, each with its provenance map. */
const FULL_SYNTHESIS: HubSynthesisRecord[] = [
  {
    ordinal: 0,
    templateId: 'H1',
    sentence:
      'Approved: 15 of 50 — United States 14, Singapore 5. Singapore: Bicalutamide (prescription-only).',
    provenance: {
      columns: ['approval by jurisdiction', 'Singapore forensic class'],
      fields: ['fields.regulatory.value.<jurisdiction>.status'],
    },
  },
  {
    ordinal: 1,
    templateId: 'H2',
    sentence: 'Stopped: 5 of 50, 47 trials — other 19, accrual/recruitment 18; Bicalutamide 23.',
    provenance: {
      columns: ['withdrawn'],
      fields: ['data/revamp/derived-v2/seed-03-failure-autopsy.ndjson values.clusters'],
    },
  },
  {
    ordinal: 2,
    templateId: 'H3',
    sentence: 'HSA lists 5 of 50 on 11 product licences — prescription-only 5.',
    provenance: {
      columns: ['Singapore forensic class'],
      fields: ['fields.regulatory.value.SG.status'],
    },
  },
  {
    ordinal: 3,
    templateId: 'H4',
    sentence: 'Predicted additive hypotensive: 19 member pairs, 0 label-documented — Ifenprodil 6.',
    provenance: {
      columns: ['name'],
      fields: ['interactions.parquet rule_id=C3-additive-hypotensive'],
    },
  },
  {
    ordinal: 4,
    templateId: 'H5',
    sentence:
      'Completed trials: 281, results posted 124 (44%). Completed without posted results: NCT00000597 Nandrolone 1988-12.',
    provenance: {
      columns: ['trials (count · results-posted share)'],
      fields: ['fields.registry.value.hasResults.completed'],
    },
  },
  {
    ordinal: 5,
    templateId: 'H6',
    sentence: 'pChEMBL 5.75-9.00 across 5: Ligandrol 9.00 (Ki, binding); Azd 3514 5.75.',
    provenance: {
      columns: ['potency'],
      fields: ['fields.potency.value.assayGroups[].medianPChembl'],
    },
  },
  {
    ordinal: 6,
    templateId: 'H7',
    sentence:
      'Organism ladder: 12 of 50 — human 12, mouse 9. Interventions Testing Program: 2 — Acarbose, Rapamycin.',
    provenance: { columns: ['name'], fields: ['fields.organismLadder.value.countsPerRung'] },
  },
]

describe('hub synthesis rendering', () => {
  it('paints every sentence a hub holds, with the provenance its template recorded', () => {
    const html = renderToStaticMarkup(
      React.createElement(HubSynthesis, { syntheses: FULL_SYNTHESIS, hubType: 'target' }),
    )
    for (const sentence of FULL_SYNTHESIS) {
      expect(html).toContain(sentence.templateId)
      // The sentence itself, with the entities the renderer escapes normalised back.
      const painted = html
        .replace(/&#x27;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      expect(painted).toContain(sentence.sentence)
      for (const field of (sentence.provenance.fields as string[]) ?? []) {
        expect(painted).toContain(field)
      }
    }
  })

  it('explains pChEMBL, the forensic classification and results posted exactly once', () => {
    const html = renderToStaticMarkup(
      React.createElement(HubSynthesis, { syntheses: FULL_SYNTHESIS, hubType: 'target' }),
    )
    for (const term of ['pChEMBL.', 'Forensic classification.', 'Results posted.']) {
      expect(html.split(term).length - 1).toBe(1)
    }
  })

  it('skips a template whose inputs were absent, and prints nothing in its place', () => {
    const partial = FULL_SYNTHESIS.filter((row) => ['H1', 'H5'].includes(row.templateId))
    const html = renderToStaticMarkup(
      React.createElement(HubSynthesis, { syntheses: partial, hubType: 'class' }),
    )
    for (const skipped of ['H2', 'H3', 'H4', 'H6', 'H7']) {
      expect(html).not.toContain(`data-template="${skipped}"`)
    }
    // No stand-in for a template that did not run: no empty brackets, no dangling label, no dash
    // pair, and none of the words the operating rules forbid in generated text.
    expect(html).not.toMatch(/\(\)|\[\]|\{\}/)
    expect(html).not.toMatch(/not (available|applicable|yet)/i)
    expect(html).not.toMatch(/\bnone\b/i)
    expect(html).not.toMatch(/TO ?DO/i)
  })

  it('says so plainly when no template had its inputs', () => {
    const html = renderToStaticMarkup(
      React.createElement(HubSynthesis, { syntheses: [], hubType: 'pathway' }),
    )
    expect(html).toContain('comparison table')
    expect(html).not.toMatch(/\(\)|\[\]|\{\}/)
  })
})

describe('hub comparison table', () => {
  it('prints one row per member, values only, with every jurisdiction column', () => {
    const members = [
      member(),
      member({ key: 'K1:ZZZ', slug: 'nandrolone', name: 'Nandrolone', ordinal: 1 }),
    ]
    const html = renderToStaticMarkup(
      React.createElement(HubTable, { members, hubType: 'target', hubName: 'AR' }),
    )
    for (const column of HUB_JURISDICTION_COLUMNS) {
      expect(html).toContain(`>${column.code}<`)
    }
    expect(html).toContain('/d/bicalutamide')
    expect(html).toContain('/d/nandrolone')
    // A cell holds a value, never a sentence: no cell ends in a full stop.
    const cells = html.match(/<td[^>]*>([^<]*)<\/td>/g) ?? []
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      expect(cell.replace(/<[^>]+>/g, '').trim()).not.toMatch(/[a-z]\.$/)
    }
  })

  it('says which register holds no record rather than leaving a cell blank', () => {
    const html = renderToStaticMarkup(
      React.createElement(HubTable, {
        members: [member({ indications: '', indicationCount: 0 })],
        hubType: 'class',
        hubName: 'L02BB',
      }),
    )
    expect(html).toContain('no label indication on record')
    expect(html).toContain('not found')
    expect(html).toContain('not cleared')
  })
})

describe('hub members list', () => {
  it('groups by role and carries each member’s own first question', () => {
    const html = renderToStaticMarkup(
      React.createElement(HubMembers, {
        members: [
          member(),
          member({
            key: 'K1:WITH',
            slug: 'rofecoxib',
            name: 'Rofecoxib',
            memberRole: 'withdrawn',
            ordinal: 1,
            firstQuestion: 'Why was Rofecoxib withdrawn?',
          }),
        ],
      }),
    )
    expect(html).toContain('Approved in at least one register')
    expect(html).toContain('Withdrawn after approval')
    expect(html).toContain('What does the androgen receptor record show for Bicalutamide?')
    expect(html).toContain('Why was Rofecoxib withdrawn?')
  })
})

describe('hub copy safety', () => {
  it('never says a compound is safe, should be taken, or is recommended', () => {
    const html = [
      renderToStaticMarkup(
        React.createElement(HubSynthesis, { syntheses: FULL_SYNTHESIS, hubType: 'target' }),
      ),
      renderToStaticMarkup(
        React.createElement(HubTable, {
          members: [member()],
          hubType: 'target',
          hubName: 'AR',
        }),
      ),
      renderToStaticMarkup(React.createElement(HubMembers, { members: [member()] })),
    ].join('\n')
    for (const pattern of BANNED) {
      expect(html).not.toMatch(pattern)
    }
  })
})

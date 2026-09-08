/**
 * Phase 4 rendering rules, on the components and the shared builders.
 *
 * `tests/test_render_safety.py` proves these rules hold over the 28,832 pages the renderer wrote.
 * This is its twin on the other side of the same functions: it holds the line builders and the
 * React components to the shapes `docs/specs/phase4-generators.md` fixes, so a rule can fail here
 * on a two-line fixture instead of only after a 500 MB render.
 *
 * Everything below reads one implementation. `interactionLine`, `checkedSourcesStatement`,
 * `registrationLineText` and `carriesDoseText` are the same functions the loader calls to write
 * `page_interactions.line` and the same ones `scripts/revamp/page_text_v5.ts` measures, so a shape
 * asserted here is the shape in the database, in the measured text and on the page.
 */
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { CorpusDossierPage } from '@/components/dossier/corpus/CorpusDossierPage'
import { CorpusHeader } from '@/components/dossier/corpus/CorpusHeader'
import { InteractionsBlock } from '@/components/dossier/corpus/InteractionsBlock'
import { PatentBlock } from '@/components/dossier/corpus/PatentBlock'
import { RegistrationBlock } from '@/components/dossier/corpus/RegistrationBlock'
import { Tier3Sections } from '@/components/dossier/corpus/Tier3Sections'
import { FormOfNote } from '@/components/dossier/corpus/FormOfNote'
import { JURISDICTION_LABELS, JURISDICTION_ORDER } from '@/lib/corpus/jurisdictions'
import type {
  CorpusDossier,
  CorpusInteractionLine,
  CorpusInteractions,
  CorpusRegistrationLine,
} from '@/lib/corpus/dossier-page'
import {
  CONTROLLED_WITHHELD_BLOCKS,
  CONTROLLED_WITHHELD_SEEDS,
  INTERACTION_RULE_LABELS,
  INTERACTION_TIER_LABELS,
  TRIAL_ROWS_INLINE,
  carriesDoseText,
  checkedSourceNames,
  checkedSourcesStatement,
  interactionLine,
  registerApplicationIds,
  registrationLineText,
  sentenceNamesCompound,
  type InteractionRow,
  type PageBundle,
  type RegistrationLine,
} from '@/lib/corpus/page-text'
import { renderPage } from '@/lib/corpus/page-text'

// Next preserves JSX for its compiler; this direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

function visibleText(markup: string): string {
  return markup
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const LABEL_ROW: InteractionRow = {
  counterpartName: 'Topiramate',
  counterpartKey: 'K1:0H73WJJ391',
  direction: 'exposure decrease stated',
  source: 'openfda-label',
  setId: 'ac8a0f7b-9f69-4495-abbc-3a47cd75a859',
  effectiveTime: '2026-08-11',
  ruleId: 'A-label-statement',
  confidence: 'documented',
  sentence:
    'Topiramate or other carbonic anhydrase inhibitors frequently cause a decrease in serum bicarbonate.',
}

const CURATED_ROW: InteractionRow = {
  counterpartName: 'Cytochrome P450 3A',
  direction: 'substrate of Cytochrome P450 3A',
  source: 'inxight',
  sourceRecordId: 'frdb:ddi:5',
  ruleId: 'B-inxight-frdb',
  confidence: 'yes',
  derivation: JSON.stringify({ role: 'substrate', targetName: 'CYP3A', magnitudeReported: 'yes' }),
}

const PREDICTED_ROW: InteractionRow = {
  counterpartName: 'Lansoprazole',
  counterpartKey: 'K1:0K5C5T2QPG',
  direction: 'expected increased exposure of Lansoprazole',
  mechanism: 'CYP2C19 inhibition',
  source: 'openfda-label',
  ruleId: 'C1-cyp-inhibitor-substrate',
  confidence: 'possible',
  derivation: 'moderate CYP2C19 inhibitor (label) x CYP2C19 substrate (label)',
}

describe('the interaction line (§4)', () => {
  it('begins with the tier label in words, on every tier', () => {
    expect(interactionLine('A', LABEL_ROW).startsWith('Label-documented')).toBe(true)
    expect(interactionLine('B', CURATED_ROW).startsWith('Curated')).toBe(true)
    expect(interactionLine('C', PREDICTED_ROW).startsWith('Predicted from mechanism:')).toBe(true)
    for (const label of Object.values(INTERACTION_TIER_LABELS)) {
      expect(label).not.toMatch(/^[ABC]$/)
    }
  })

  it('quotes the label sentence with the label record and its effective date', () => {
    const line = interactionLine('A', LABEL_ROW)
    expect(line).toContain('Topiramate:')
    expect(line).toContain(`"${LABEL_ROW.sentence}"`)
    expect(line).toContain('DailyMed label ac8a0f7b-9f69-4495-abbc-3a47cd75a859')
    expect(line).toContain('2026-08-11')
  })

  it('names the curated counterpart, its role and whether a magnitude was reported', () => {
    const line = interactionLine('B', CURATED_ROW)
    expect(line).toContain('Cytochrome P450 3A: substrate, a magnitude is reported')
    // §13(3): the dataset record is named, the record id is not — it is in the closed disclosure.
    expect(line).toContain('Inxight FRDB')
    expect(line).not.toContain('frdb:ddi:5')
  })

  it('shows the derivation, the direction and the rule in words, never the rule id', () => {
    const line = interactionLine('C', PREDICTED_ROW)
    expect(line).toContain('moderate CYP2C19 inhibitor (label) x CYP2C19 substrate (label)')
    expect(line).toContain('→ expected increased exposure of Lansoprazole')
    expect(line).toContain(INTERACTION_RULE_LABELS['C1-cyp-inhibitor-substrate'] as string)
    expect(line).toContain('possible')
    expect(line).not.toContain('C1-cyp-inhibitor-substrate')
  })

  it('names the counterpart on a predicted line, as the other two tiers do', () => {
    const line = interactionLine('C', PREDICTED_ROW)
    expect(line.startsWith('Predicted from mechanism: Lansoprazole · ')).toBe(true)
  })

  it('labels an additive-class derivation that a register recorded as a code', () => {
    const line = interactionLine('C', {
      counterpartName: 'Acebutolol',
      counterpartKey: 'K1:67P356D8GH',
      direction: 'additive hypotensive effect',
      mechanism: 'hypotensive class membership on both pages',
      source: 'atc',
      ruleId: 'C3-additive-hypotensive',
      confidence: 'possible',
      derivation: 'C09DX x C07AB',
    })
    expect(line).toContain('Acebutolol · ATC C09DX × ATC C07AB → additive hypotensive effect')
    expect(line).not.toMatch(/(?<!ATC )C09DX/)
  })

  it('leaves an enzyme-rule derivation exactly as the build recorded it', () => {
    const line = interactionLine('C', PREDICTED_ROW)
    expect(line).toContain(PREDICTED_ROW.derivation as string)
  })

  it('carries no rule label that is itself an identifier', () => {
    for (const label of Object.values(INTERACTION_RULE_LABELS)) {
      expect(label).not.toMatch(/\b[ABC][123]?-[a-z]/)
    }
  })

  it('drops the quoted label sentence beyond the lines the page shows first', () => {
    const disclosed = interactionLine('A', LABEL_ROW, { quote: false })
    expect(disclosed).not.toContain('"')
    expect(disclosed).toContain('Topiramate: exposure decrease stated')
  })

  it('renders mechanism and direction only on a controlled substance', () => {
    const line = interactionLine('A', LABEL_ROW, { controlled: true })
    expect(line).not.toContain(LABEL_ROW.sentence as string)
    expect(line).toContain('exposure decrease stated')
  })
})

describe('the checked-sources statement (§4, Operating Rule 9)', () => {
  const checked = {
    sourcesChecked: [
      'openFDA drug label drug_interactions section (bulk export packaged 2026-08-28)',
      'NCATS Inxight Drugs curated drug-drug interaction dataset (FRDB v2024-12-30)',
    ],
    date: '2026-09-06',
  }

  it('names only the registers actually checked, in short words', () => {
    expect(checkedSourceNames(checked)).toEqual([
      'openFDA drug labels',
      'the NCATS Inxight Drugs curated interaction dataset',
    ])
  })

  it('reads "No interaction found in … as of …" where nothing was found', () => {
    const statement = checkedSourcesStatement(checked, false)
    expect(statement).toBe(
      'No interaction found in openFDA drug labels and the NCATS Inxight Drugs curated ' +
        'interaction dataset as of 2026-09-06.',
    )
    expect(statement).not.toMatch(/\bsafe\b/i)
  })

  it('does not say "no interaction found" on a page that found one', () => {
    const statement = checkedSourcesStatement(checked, true) as string
    expect(statement.startsWith('Checked in ')).toBe(true)
    expect(statement).toContain('as of 2026-09-06')
    expect(statement.toLowerCase()).not.toContain('no interaction')
  })

  it('says nothing at all where no source was recorded', () => {
    expect(checkedSourcesStatement(undefined, false)).toBeUndefined()
    expect(
      checkedSourcesStatement({ sourcesChecked: [], date: '2026-09-06' }, false),
    ).toBeUndefined()
  })
})

describe('the controlled-substance path (§4)', () => {
  it('withholds the four blocks and seeds 1, 2 and 6 by name', () => {
    expect([...CONTROLLED_WITHHELD_BLOCKS].sort()).toEqual([
      'bioavailability',
      'dose-studied',
      'n-of-1',
      'time-to-signal',
    ])
    expect([...CONTROLLED_WITHHELD_SEEDS]).toEqual([1, 2, 6])
  })

  it('recognises a dose, a frequency, a route and a combination protocol', () => {
    expect(carriesDoseText('Megestrol Acetate administered in dose of 320 mg/d')).toBe(true)
    expect(carriesDoseText('10 mg once a day for four weeks')).toBe(true)
    expect(carriesDoseText('Maximum Tolerated Dose of EZN-3042')).toBe(true)
    expect(carriesDoseText('given orally with food')).toBe(true)
    expect(carriesDoseText('administered orally in the fed state')).toBe(true)
    expect(carriesDoseText('an oral tablet is the recorded form')).toBe(false)
    expect(carriesDoseText('a two-week washout period between arms')).toBe(true)
    expect(carriesDoseText('Registered (HSA) · POM · checked 2026-08-07')).toBe(false)
    expect(carriesDoseText('91 registered studies, largest enrolment 2552')).toBe(false)
  })

  it('renders no dose block, no dose line and no seed 1, 2 or 6 for a controlled page', () => {
    const controlled = renderPage(bundleWithControlledSubstance(true), { provenance: true })
    const uncontrolled = renderPage(bundleWithControlledSubstance(false), { provenance: true })

    expect(uncontrolled.text).toContain('What dose has been studied')
    expect(uncontrolled.text).toContain('320 mg')
    expect(uncontrolled.text).toContain('320 mcg')

    // The whole dose block is gone, not softened: neither its question nor any of its values.
    expect(controlled.text).not.toContain('What dose has been studied')
    expect(controlled.text).not.toContain('320 mg')
    // The pharmacology block stays — §4 keeps mechanism and pharmacology — and the one line inside
    // it that stated an amount is the line that does not render.
    expect(controlled.text).toContain('How long does Fixture Compound stay in the body?')
    expect(controlled.text).not.toContain('320 mcg')
    expect(controlled.withheldDoseLines).toBeGreaterThan(0)
    // The structural assertion: the filtered bundle never reaches a builder that could write one.
    for (const entry of controlled.provenance ?? []) {
      expect(carriesDoseText(entry.sentence)).toBe(false)
      expect(entry.fields.some((field) => /seeds\.seed(?:1|2|6)\b/.test(field))).toBe(false)
    }
  })
})

/** A page holding a dose question, a dose-bearing trial row and seeds 1, 2 and 6. */
function bundleWithControlledSubstance(controlled: boolean): PageBundle {
  const registration: RegistrationLine[] = [
    {
      jurisdiction: 'SG',
      label: 'Singapore',
      status: 'Registered (HSA)',
      ordinal: 0,
      line: 'Registered (HSA) · POM · checked 2026-08-07',
    },
  ]
  return {
    key: 'K1:FIXTURE00',
    displayName: 'Fixture Compound',
    model: 'CLINICAL',
    tier: 2,
    withdrawn: false,
    suppressed: false,
    suppressionClasses: [],
    stub: false,
    presentFields: 4,
    fields: {
      doseStudied: {
        state: 'present',
        value: [
          { organism: 'human', doseText: '320 mg once a day for 12 weeks', route: 'oral' },
          { organism: 'human', doseText: '160 mg once a day for 12 weeks', route: 'oral' },
        ],
      },
      // Pharmacology, which §4 keeps on a controlled page — except for the one recorded value that
      // states an amount. The block is not withheld; the line carrying "320 mcg" is.
      kinetics: {
        state: 'present',
        value: {
          halfLife: { value: '4', unit: 'hours' },
          bioavailability: {
            value: '27.5',
            unit: '%',
            verbatim: 'The systemic bioavailability of the 320 mcg nasal aerosol was 27.5%.',
          },
        },
      },
    },
    seeds: {
      seed1: { fires: true, values: { gap: 'recorded' } },
      seed2: { fires: true, values: { design: 'recorded' } },
      seed6: { fires: true, values: { weeks: 4 } },
    },
    identity: { synonyms: [], relations: [] },
    questions: [
      {
        id: 'dose-studied',
        text: 'What dose has been studied in humans, and over how long?',
        badge: 'Q1',
        block: 'dose-studied',
        template: 'dose-studied',
        values: {},
        sources: [],
      },
      {
        id: 'kinetics',
        text: 'How long does Fixture Compound stay in the body?',
        badge: 'Q2',
        block: 'kinetics',
        template: 'kinetics',
        values: { halfLife: '4 hours' },
        sources: [],
      },
    ],
    names: new Map(),
    blocks: {
      controlled,
      controlledBasis: controlled ? ['SG-MDA-POISONS'] : [],
      registration,
      controlledSchedules: [],
      interactions: { tiers: {} },
      sections: {},
      relations: [],
    },
  }
}

describe('the registration block (§2, §3)', () => {
  const rows: CorpusRegistrationLine[] = JURISDICTION_ORDER.map((code, index) => ({
    id: `row-${code}`,
    jurisdiction: code,
    label: JURISDICTION_LABELS[code],
    status: 'Not found',
    ordinal: index,
    line: `Not found in the ${JURISDICTION_LABELS[code]} register as of 2026-09-06`,
    disclosed: false,
    upstreamRegisters: [],
    applications: [],
  }))

  it('renders one line per jurisdiction, in the order §2 fixes', () => {
    const markup = renderToStaticMarkup(
      React.createElement(RegistrationBlock, { events: [], registration: rows, schedules: [] }),
    )
    const text = visibleText(markup)
    let position = -1
    for (const code of JURISDICTION_ORDER) {
      const at = text.indexOf(JURISDICTION_LABELS[code])
      expect(at, `${JURISDICTION_LABELS[code]} is missing`).toBeGreaterThan(position)
      position = at
    }
  })

  it('summarises the applications into one disclosure, never one line each', () => {
    const withApplications: CorpusRegistrationLine[] = [
      {
        id: 'row-US',
        jurisdiction: 'US',
        label: 'United States',
        status: 'Approved',
        ordinal: 1,
        line: 'Approved · 8 applications: 5 prescription, 3 discontinued · checked 2026-08-28',
        disclosed: false,
        upstreamRegisters: [],
        applications: ['NDA004782', 'NDA010402', 'NDA020216'],
      },
    ]
    const markup = renderToStaticMarkup(
      React.createElement(RegistrationBlock, {
        events: [],
        registration: withApplications,
        schedules: [],
      }),
    )
    expect(markup).toContain('<details')
    expect(markup.match(/United States/g)?.length).toBeLessThanOrEqual(3)
    for (const id of withApplications[0]?.applications ?? []) expect(markup).toContain(id)
  })

  it('renders nothing at all when the record holds no line', () => {
    const markup = renderToStaticMarkup(
      React.createElement(RegistrationBlock, { events: [], registration: [], schedules: [] }),
    )
    expect(markup).toBe('')
  })

  it('prefixes the jurisdiction and keeps the register stage’s own line', () => {
    const row = rows[0] as CorpusRegistrationLine
    expect(registrationLineText({ ...row, provenance: [] } as RegistrationLine)).toBe(
      `Singapore: ${row.line}`,
    )
  })

  it('reads the application ids only from the list the summary counted', () => {
    expect(
      registerApplicationIds({
        jurisdiction: 'US',
        label: 'United States',
        status: 'Approved',
        ordinal: 1,
        line: 'Approved',
        disclosure: {
          applications: ['NDA004782'],
          curatedMarketingStatus: { approvalApplicationIds: ['0.25%w/v OPHTHALMIC SOLUTION'] },
        },
      }),
    ).toEqual(['NDA004782'])
  })
})

describe('the interactions block component', () => {
  const lines: CorpusInteractionLine[] = [
    {
      id: 'a1',
      tier: 'A',
      tierLabel: INTERACTION_TIER_LABELS.A as string,
      line: interactionLine('A', LABEL_ROW),
      disclosed: false,
      counterpartName: 'Topiramate',
      setId: LABEL_ROW.setId as string,
    },
    {
      id: 'c1',
      tier: 'C',
      tierLabel: INTERACTION_TIER_LABELS.C as string,
      line: interactionLine('C', PREDICTED_ROW),
      disclosed: true,
      counterpartName: 'Lansoprazole',
      ruleId: 'C1-cyp-inhibitor-substrate',
    },
  ]

  function block(patch: Partial<CorpusInteractions> = {}) {
    const interactions: CorpusInteractions = {
      lines,
      statement: 'Checked in openFDA drug labels as of 2026-09-06.',
      sourcesChecked: ['openFDA drug labels'],
      date: '2026-09-06',
      totals: { A: 1, C: 40 },
      predictedOnly: false,
      ...patch,
    }
    return renderToStaticMarkup(React.createElement(InteractionsBlock, { interactions }))
  }

  it('shows every tier label as words a reader can see', () => {
    const text = visibleText(block())
    expect(text).toContain('Label-documented')
    expect(text).toContain('Predicted from mechanism')
  })

  it('puts the beyond-the-first lines in a native disclosure with a count', () => {
    const markup = block()
    expect(markup).toContain('<details')
    expect(visibleText(markup)).toContain('40 counterparts are recorded')
  })

  it('carries the checked-sources statement, and leads with it on a predicted-only page', () => {
    const ordinary = visibleText(block())
    expect(ordinary).toContain('Checked in openFDA drug labels as of 2026-09-06.')

    const predicted = visibleText(
      block({
        lines: lines.filter((line) => line.tier === 'C'),
        predictedOnly: true,
        statement: 'No interaction found in openFDA drug labels as of 2026-09-06.',
      }),
    )
    expect(predicted.indexOf('No interaction found in')).toBeLessThan(
      predicted.indexOf('Predicted from mechanism'),
    )
  })

  it('renders nothing where the record holds neither a line nor a statement', () => {
    expect(
      renderToStaticMarkup(
        React.createElement(InteractionsBlock, {
          interactions: { lines: [], sourcesChecked: [], totals: {}, predictedOnly: false },
        }),
      ),
    ).toBe('')
  })
})

describe('the patent, form-of and computed-section blocks', () => {
  it('states the no-record finding and its reason, and renders nothing without a row', () => {
    const markup = renderToStaticMarkup(
      React.createElement(PatentBlock, {
        patent: {
          eligible: false,
          absence: true,
          line: 'No US patent or exclusivity data on record · not an approved US small molecule',
          reason: 'not an approved US small molecule',
          applications: [],
        },
      }),
    )
    expect(visibleText(markup)).toContain('No US patent or exclusivity data on record')
    expect(renderToStaticMarkup(React.createElement(PatentBlock, {}))).toBe('')
  })

  it('opens a form page with what it is a form of, and links the other record', () => {
    const markup = renderToStaticMarkup(
      React.createElement(FormOfNote, {
        notes: [
          {
            section: 'formOf' as const,
            ordinal: 0,
            rows: [],
            sentence: 'Heparin calcium is the calcium salt of heparin.',
            counterpartSlug: 'heparin',
            counterpartName: 'Heparin',
          },
        ],
      }),
    )
    expect(visibleText(markup)).toContain('Heparin calcium is the calcium salt of heparin.')
    expect(markup).toContain('/d/heparin')
    expect(renderToStaticMarkup(React.createElement(FormOfNote, { notes: [] }))).toBe('')
  })

  it('renders the computed sentences, and nothing where none was computed', () => {
    const markup = renderToStaticMarkup(
      React.createElement(Tier3Sections, {
        sections: [
          {
            section: 'neighbour' as const,
            ordinal: 0,
            rows: [
              { label: 'Closest approved compound', value: 'Bexagliflozin · similarity 0.76' },
            ],
          },
        ],
      }),
    )
    expect(visibleText(markup)).toContain('similarity 0.76')
    expect(renderToStaticMarkup(React.createElement(Tier3Sections, { sections: [] }))).toBe('')
  })
})

describe('the §7 defect rules', () => {
  it('fires a dose-response quotation only where the sentence names the compound', () => {
    expect(
      sentenceNamesCompound('Rapamycin extended lifespan at the lower dose.', 'Rapamycin'),
    ).toBe(true)
    expect(sentenceNamesCompound('Heparin showed a biphasic response.', 'Heparin calcium')).toBe(
      true,
    )
    expect(
      sentenceNamesCompound('Metformin extended lifespan at the lower dose.', 'Rapamycin', [
        'Sirolimus',
      ]),
    ).toBe(false)
    expect(sentenceNamesCompound('Sirolimus extended lifespan.', 'Rapamycin', ['Sirolimus'])).toBe(
      true,
    )
  })

  it('caps a trial list at six rows before the counted remainder', () => {
    expect(TRIAL_ROWS_INLINE).toBe(6)
  })
})

/** A record holding one of everything, so the order of the blocks can be read off the markup. */
function fullDossier(): CorpusDossier {
  return {
    key: 'K1:FIXTURE00',
    slug: 'fixture-compound',
    displayName: 'Fixture Compound',
    model: 'CLINICAL',
    tier: 2,
    pageType: 'clinical',
    indexable: true,
    suppressed: true,
    suppressionClasses: ['S2'],
    withdrawn: false,
    presentFieldCount: 9,
    applicableFieldCount: 18,
    synonyms: [],
    register: 'Drugs@FDA',
    humanData: true,
    ladder: [],
    blocks: [
      {
        id: 'q1',
        badge: 'Q1',
        ordinal: 0,
        block: 'supervision',
        template: 'supervision',
        question: 'Why does Fixture Compound carry a supervision requirement?',
        paragraphs: [
          {
            text: 'A register records Fixture Compound in one classification given under medical supervision: a controlled-substance schedule in Singapore, the United States, Australia or the United Kingdom.',
            interpretation: false,
          },
        ],
        facts: [],
        groups: [],
      },
      {
        id: 'q2',
        badge: 'Q2',
        ordinal: 1,
        block: 'human-data',
        template: 'human-data',
        question: 'What has been measured in people?',
        paragraphs: [{ text: '91 registered studies.', interpretation: false }],
        facts: [{ label: 'Posted no result', value: '25 of 29 completed trials' }],
        groups: [],
      },
    ],
    registerEvents: [{ sentence: 'Withdrawn in France, 1996, for "drug misuse" (ChEMBL).' }],
    identifiers: [{ field: 'unii', label: 'UNII', value: '027828ZV5Q' }],
    relations: [],
    hubs: [],
    sources: [],
    licenceNotes: [],
    registeredStudies: 91,
    controlled: true,
    controlledBasis: ['SG-MDA-POISONS'],
    registration: [
      {
        id: 'reg-sg',
        jurisdiction: 'SG',
        label: 'Singapore',
        status: 'Registered (HSA)',
        ordinal: 0,
        line: 'Registered (HSA) · POM · Class A controlled drug · see the controlled-substance schedules below · checked 2026-08-07',
        disclosed: false,
        upstreamRegisters: [],
        applications: [],
      },
      {
        id: 'reg-other',
        jurisdiction: 'OTHER',
        label: 'unspecified',
        status: 'Clinical, Marketed (NCATS Inxight Drugs curated record)',
        ordinal: 1,
        line: 'Clinical, Marketed (NCATS Inxight Drugs curated record) · checked 2026-09-05',
        disclosed: true,
        upstreamRegisters: ['ClinicalTrials, February 2021'],
        applications: [],
      },
    ],
    controlledSchedules: [
      {
        id: 'ctl-1',
        jurisdiction: 'SG',
        list: 'Misuse of Drugs Act 1973 (2020 Rev Ed)',
        classOrSchedule: 'First Schedule Part 1 — Class A controlled drug',
        versionDate: '2026-06-01',
      },
    ],
    interactions: {
      lines: [
        {
          id: 'a1',
          tier: 'A',
          tierLabel: INTERACTION_TIER_LABELS.A as string,
          line: interactionLine('A', LABEL_ROW, { controlled: true }),
          disclosed: false,
        },
      ],
      statement: 'Checked in openFDA drug labels as of 2026-09-06.',
      sourcesChecked: ['openFDA drug labels'],
      date: '2026-09-06',
      totals: { A: 1 },
      predictedOnly: false,
    },
    patent: {
      eligible: true,
      absence: false,
      line: 'RLD: yes · generic available: no · checked 2026-08-14',
      applications: ['NDA004782'],
    },
    computedSections: [
      {
        section: 'neighbour',
        ordinal: 0,
        rows: [{ label: 'Closest approved compound', value: 'Bexagliflozin · similarity 0.76' }],
      },
    ],
    formOfNotes: [
      {
        section: 'formOf',
        ordinal: 0,
        rows: [],
        sentence: 'Fixture Compound is the calcium salt of Fixture.',
      },
    ],
  }
}

describe('the whole page (§1 block order)', () => {
  it('renders the blocks in the order §1 fixes', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    // Read off the section landmarks, not the visible text: the contents rail lists every question
    // above the page and would otherwise put each question's words before the block that holds it.
    const order: Array<[string, string]> = [
      ['the form-of note', 'cd-form-of-heading'],
      ['the supervision block', 'data-block="supervision"'],
      ["where it's registered", 'cd-registration-heading'],
      ['interactions', 'cd-interactions-heading'],
      ['generic and patent', 'cd-patent-heading'],
      ['the question blocks', 'data-block="human-data"'],
      ['the computed sections', 'cd-computed-heading'],
      ['the exact record', 'cd-record-heading'],
    ]
    let position = -1
    for (const [what, marker] of order) {
      const at = markup.indexOf(marker)
      expect(at, `${what} is missing or out of order`).toBeGreaterThan(position)
      position = at
    }
  })

  it('adds no second <main>, and keeps the heading levels in order', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    expect(markup).not.toContain('<main')
    const levels = [...markup.matchAll(/<h([1-6])[^>]*>/g)].map((match) => Number(match[1]))
    expect(levels.length).toBeGreaterThan(0)
    expect(Math.min(...levels)).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect((levels[index] as number) - (levels[index - 1] as number)).toBeLessThanOrEqual(1)
    }
  })

  it('never puts the controlled-substance schedules where a dose could follow them', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    const text = visibleText(markup)
    expect(text).toContain('First Schedule Part 1 — Class A controlled drug')
    expect(carriesDoseText(text)).toBe(false)
  })
})

/* ---------------------------------------------------------------------------------------------
 * §13 — the rules the lead's reading of slop draw 3 added.
 *
 * `tests/test_render_safety.py` proves each of these over the whole rendered corpus. These are the
 * same rules on the components and the shared builders, so a regression fails on a fixture instead
 * of only after a 1.2 GB render.
 * ------------------------------------------------------------------------------------------- */

describe('§13(1) — an absence is never an answer', () => {
  function bundle(
    regulatory: unknown,
    questions: PageBundle['questions'],
    // The suppression pass's own classes are an affirmative classification in their own right
    // (§13(1) lists a controlled-substance schedule among them), so a case testing what happens
    // when nothing affirmative is recorded has to hold none of them.
    suppressionClasses: string[] = ['S2'],
  ): PageBundle {
    return {
      key: 'K1:ABSENCE00',
      tier: 2,
      displayName: 'Fixture Compound',
      presentFields: 4,
      suppressed: true,
      suppressionClasses,
      withdrawn: false,
      identity: { synonyms: [], relations: [] },
      names: new Map(),
      fields: {
        regulatoryStatus: {
          state: 'present',
          value: regulatory,
          source: [{ kind: 'inxight', id: 'inxight-stitch:1:jurisdiction:US' }],
        },
      } as unknown as PageBundle['fields'],
      seeds: {},
      questions,
    } as unknown as PageBundle
  }

  const supervision = [
    {
      id: 'supervision',
      block: 'supervision',
      template: 'supervision',
      badge: 'Q1',
      text: 'Why does Fixture Compound carry a supervision requirement?',
      values: {},
      sources: [],
    },
  ] as unknown as PageBundle['questions']

  it('names only an affirmative classification, never a register that recorded nothing', () => {
    const text = renderPage(
      bundle(
        {
          SG: { status: 'not found' },
          AU: { status: 'scheduled in the Poisons Standard' },
          UK: { status: 'not cleared' },
        },
        supervision,
      ),
      { withFurniture: true },
    ).text
    expect(text).toContain('AU scheduled in the Poisons Standard')
    expect(text).not.toContain('SG not found')
    expect(text).not.toContain('UK not cleared')
  })

  it('renders no block at all where every register recorded an absence', () => {
    const rendered = renderPage(
      bundle({ SG: { status: 'not found' }, UK: { status: 'not cleared' } }, supervision, []),
      { withFurniture: true },
    )
    expect(rendered.text).not.toContain(
      'Why does Fixture Compound carry a supervision requirement?',
    )
    expect(rendered.text).not.toContain('not found')
  })

  it('reads no jurisdiction out of a stored note that is not a jurisdiction', () => {
    const text = renderPage(
      bundle(
        {
          US: { status: 'approved' },
          curatedMarketingStatusNote: {
            status: 'NCATS Inxight Drugs records marketing events per jurisdiction.',
          },
        },
        supervision,
      ),
      { withFurniture: true },
    ).text
    expect(text).not.toContain('curatedMarketingStatusNote')
  })
})

describe('§13(2) — the register events sit inside the registration block', () => {
  it('prints one sentence per event, in words, with no register column name', () => {
    const markup = renderToStaticMarkup(
      React.createElement(RegistrationBlock, {
        events: [
          { sentence: 'Withdrawn in France, 1996, for "drug misuse" (ChEMBL; Open Targets).' },
        ],
        registration: [],
        schedules: [],
      }),
    )
    const text = visibleText(markup)
    expect(text).toContain('Withdrawn in France, 1996')
    expect(text).toContain('ChEMBL; Open Targets')
    expect(text).not.toContain('What the registers record')
    expect(text).not.toContain('drug_warning')
    expect(text).not.toContain('warningType')
  })
})

describe('§13(3) — an interaction line carries its tier once', () => {
  const grouped: InteractionRow = {
    direction: 'substrate of CYP1A2, CYP2A6, CYP3A4',
    source: 'inxight',
    ruleId: 'B-inxight-frdb',
    groupedRole: 'substrate',
    groupedTargets: ['CYP1A2', 'CYP2A6', 'CYP3A4'],
    groupedMagnitude: true,
    groupedRecordIds: ['frdb:ddi:12049', 'frdb:ddi:12045'],
  }

  it('groups the curated enzyme rows into one line per role, with the family prefix once', () => {
    const line = interactionLine('B', grouped)
    expect(line).toBe(
      'Curated · Substrate of CYP1A2, 2A6 and 3A4, with a reported magnitude · Inxight FRDB',
    )
  })

  it('keeps the dataset record id off the line', () => {
    expect(interactionLine('B', grouped)).not.toContain('frdb:ddi:')
    expect(interactionLine('B', CURATED_ROW)).not.toContain('frdb:ddi:')
    expect(interactionLine('B', CURATED_ROW)).toContain('Inxight FRDB')
  })

  it('paints the tier label once per line and no second badge', () => {
    const markup = renderToStaticMarkup(
      React.createElement(InteractionsBlock, {
        interactions: {
          lines: [
            {
              id: 'b1',
              tier: 'B',
              tierLabel: INTERACTION_TIER_LABELS.B as string,
              line: interactionLine('B', grouped),
              disclosed: false,
            },
          ],
          sourcesChecked: [],
          totals: {},
          predictedOnly: false,
        },
      }),
    )
    expect(markup).not.toContain('cd-interaction-tier')
    const text = visibleText(markup)
    expect(text.match(/Curated/g)?.length).toBe(1)
  })

  it('never paints the same line twice', () => {
    const one: CorpusInteractionLine = {
      id: 'b1',
      tier: 'B',
      tierLabel: INTERACTION_TIER_LABELS.B as string,
      line: interactionLine('B', grouped),
      disclosed: false,
    }
    const markup = renderToStaticMarkup(
      React.createElement(InteractionsBlock, {
        interactions: {
          lines: [one, { ...one, id: 'b2' }],
          sourcesChecked: [],
          totals: {},
          predictedOnly: false,
        },
      }),
    )
    expect(visibleText(markup).match(/Substrate of CYP1A2/g)?.length).toBe(1)
  })
})

describe('§13(4) — the schedules render once', () => {
  it('points the jurisdiction line at the table instead of repeating the statute rows', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    const text = visibleText(markup)
    expect(text).toContain('see the controlled-substance schedules below')
    // The instrument is named once, in the schedules table, and nowhere on a register line.
    expect(text.match(/Misuse of Drugs Act 1973/g)?.length).toBe(1)
  })
})

describe('§13(5) — a trial list shows six rows', () => {
  it('puts the counted remainder in a closed disclosure of its own', () => {
    const dossier = fullDossier()
    const block = dossier.blocks[1]
    if (!block) throw new Error('the fixture holds no question block')
    block.groups = [
      {
        id: 'q2-g1',
        label: 'Trial',
        rows: Array.from({ length: 6 }, (_, index) => ({
          label: 'Trial',
          identifier: `NCT0000000${index}`,
          value: 'phase 3; completed',
        })),
      },
      {
        id: 'q2-g2',
        label: '14 further recorded trials',
        rows: Array.from({ length: 14 }, (_, index) => ({
          label: '14 further recorded trials',
          identifier: `NCT1000000${index}`,
          value: 'phase 2; completed',
        })),
      },
    ]
    const markup = renderToStaticMarkup(React.createElement(CorpusDossierPage, { dossier }))
    // The remainder is a `<details>` whose summary is the group's own label, so the fifteenth row
    // and everything after it is not painted until a reader opens it.
    expect(markup).toContain('<summary>14 further recorded trials</summary>')
    expect(markup).not.toContain('open=""')
    // The rail also names the group, so the split is on the disclosure's own summary element.
    const at = markup.indexOf('<summary>14 further recorded trials</summary>')
    expect(at).toBeGreaterThan(0)
    expect(markup.slice(at)).toContain('NCT10000000')
    expect(markup.slice(0, at).match(/NCT0000000\d/g)?.length).toBe(6)
  })
})

describe('§13(10) — the header prints one evidence line', () => {
  it('says a record has no human study once, not twice', () => {
    const dossier = fullDossier()
    dossier.humanData = false
    dossier.evidenceTier = 'none'
    const text = visibleText(renderToStaticMarkup(React.createElement(CorpusHeader, { dossier })))
    expect(text.match(/No human study recorded/g)?.length).toBe(1)
    expect(text).not.toContain('Evidence recorded:')
  })

  it('names the evidence kind once where the record holds human data', () => {
    const dossier = fullDossier()
    dossier.humanData = true
    dossier.evidenceTier = 'human trial'
    const text = visibleText(renderToStaticMarkup(React.createElement(CorpusHeader, { dossier })))
    expect(text).not.toContain('Human data recorded')
    expect(text).not.toContain('No human study recorded')
  })
})

describe('§13(6) — a curated record with no jurisdiction is disclosure only', () => {
  it('keeps the row and its upstream registers out of the visible lines', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    // The row is on the page, inside a closed disclosure, and never as a register line.
    expect(markup).toContain('Show the curated records with no jurisdiction')
    expect(markup).toContain('ClinicalTrials, February 2021')
    const lines = markup.slice(0, markup.indexOf('Show the curated records with no jurisdiction'))
    expect(lines).not.toContain('ClinicalTrials, February 2021')
  })
})

describe('§13(7) — a single value is a row, not a sentence', () => {
  it('paints the block’s own values under the question heading', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    const text = visibleText(markup)
    expect(text).toContain('Posted no result')
    expect(text).toContain('25 of 29 completed trials')
    // A row is markup: the label and the value are separate elements, not one sentence.
    expect(text).not.toContain('Posted no result: 25 of 29 completed trials posted no result')
  })

  it('renders the nearest-neighbour comparison as rows', () => {
    const markup = renderToStaticMarkup(
      React.createElement(Tier3Sections, {
        sections: [
          {
            section: 'neighbour' as const,
            ordinal: 0,
            rows: [{ label: 'Closest approved compound', value: 'Flurazepam · similarity 0.48' }],
          },
        ],
      }),
    )
    expect(markup).toContain('<dt>')
    expect(visibleText(markup)).toContain('Flurazepam · similarity 0.48')
  })
})

describe('§13(9) — a form-of note names the related record once', () => {
  it('links the name inside the sentence rather than printing it again after it', () => {
    const markup = renderToStaticMarkup(
      React.createElement(FormOfNote, {
        notes: [
          {
            section: 'formOf' as const,
            ordinal: 0,
            rows: [],
            sentence: 'Heparin calcium is the calcium salt of Heparin.',
            counterpartSlug: 'heparin',
            counterpartName: 'Heparin',
          },
        ],
      }),
    )
    const text = visibleText(markup)
    expect(markup).toContain('/d/heparin')
    expect(text.match(/Heparin(?! calcium)/g)?.length).toBe(1)
  })
})

describe('§13(11) — the decorative glyphs are not text', () => {
  it('paints neither the section separator nor the provenance mark as a text node', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    // `innerText` is what the uniqueness ruler and a crawler read; both marks are CSS content.
    const text = visibleText(markup)
    expect(text).not.toContain('◇')
    expect(text.split(/\s+/)).not.toContain('~')
  })
})

describe('§13(14) — a held duplicate says so and links the other page', () => {
  it('names the page it duplicates', () => {
    const dossier = fullDossier()
    dossier.indexable = false
    dossier.duplicateHoldOf = {
      slug: 'pertuzumab-trastuzumab-and-hyaluronidase-zzxf',
      displayName: 'Pertuzumab, Trastuzumab, and Hyaluronidase-Zzxf',
    }
    const markup = renderToStaticMarkup(React.createElement(CorpusDossierPage, { dossier }))
    expect(markup).toContain('/d/pertuzumab-trastuzumab-and-hyaluronidase-zzxf')
    expect(visibleText(markup)).toContain('read almost identically')
  })
})

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
import { HubTable } from '@/components/hubs/HubTable'
import type { HubMemberRecord } from '@/lib/hubs/types'
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
  VISIBLE_ROWS,
  anchor,
  buildBlockBody,
  carriesDoseText,
  checkedSourceNames,
  checkedSourcesStatement,
  deriveQuestions,
  groupRevealedRows,
  interactionDisclosureLabel,
  interactionLine,
  interactionRecordIds,
  looksLikePageKey,
  registerApplicationIds,
  registerName,
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

  it('names the suppression evidence and no register status at all (§14(1))', () => {
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
    // §13(1) let an affirmative register status stand as the answer, and §14(1) takes that away
    // too: an Australian Schedule 4 entry is a prescription class, not a supervision reason, and
    // the sentence's provenance named registers the sentence itself did not. The answer is the
    // recorded class, in the words the spec fixes.
    expect(text).toContain(
      'A register records Fixture Compound under medical supervision: a controlled-substance ' +
        'schedule in Singapore, the United States, Australia or the United Kingdom.',
    )
    expect(text).not.toContain('scheduled in the Poisons Standard')
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

/* ---------------------------------------------------------------------------------------------
 * §14 — the rules the lead's reading of slop draw 4 added, on the components and the builders.
 *
 * Item 16 requires each mechanical rule to be asserted. `tests/test_render_safety.py` asserts the
 * ones the render itself decides, over all 28,832 pages; these are the ones the served DOM decides
 * — the whitespace between two inline spans, a record id inside a closed disclosure, a visible list
 * of six — plus the builder rules, so a fault fails on a fixture rather than after a 500 MB render.
 * ------------------------------------------------------------------------------------------- */

/** Every `<details>` in the markup is closed: none of them carries the `open` attribute. */
function everyDetailsIsClosed(markup: string): boolean {
  return !/<details[^>]*\sopen(?:[\s>=])/.test(markup)
}

/** The markup with every closed `<details>` element removed, tag and contents. */
function withoutClosedDisclosures(markup: string): string {
  let out = markup
  for (;;) {
    const start = out.search(/<details\b(?![^>]*\sopen[\s>=])/)
    if (start < 0) return out
    const end = out.indexOf('</details>', start)
    if (end < 0) return out.slice(0, start)
    out = out.slice(0, start) + out.slice(end + '</details>'.length)
  }
}

const GROUPED_LABEL_ROW: InteractionRow = {
  direction: 'avoid or monitor',
  source: 'openfda-label',
  setId: '1cd10ca2-f0a5-4b3a-bc5f-e25aba1f903c',
  effectiveTime: '2024-03-11',
  ruleId: 'A-label-statement',
  sourceRecordId: '1cd10ca2-f0a5-4b3a-bc5f-e25aba1f903c',
  groupedDirection: 'avoid or monitor',
  groupedCounterparts: ['antiplatelet drugs', 'Aspirin', 'Diclofenac'],
  groupedCounterpartsBeyond: 4,
  groupedRecordIds: ['1cd10ca2-f0a5-4b3a-bc5f-e25aba1f903c'],
}

describe('§14(5) — label interactions group by label and direction', () => {
  it('names the label once, the direction once and every counterpart it stands for', () => {
    const line = interactionLine('A', GROUPED_LABEL_ROW)
    expect(line).toBe(
      'Label-documented (DailyMed label 1cd10ca2-f0a5-4b3a-bc5f-e25aba1f903c · 2024-03-11): ' +
        'avoid or monitor with antiplatelet drugs, Aspirin and Diclofenac and 4 more',
    )
    // One label id on the line, not one per counterpart.
    expect(line.match(/1cd10ca2/g)).toHaveLength(1)
  })

  it('leaves an ungrouped label row exactly as §4 fixes it', () => {
    expect(interactionLine('A', LABEL_ROW).startsWith('Label-documented · Topiramate:')).toBe(true)
  })
})

describe('§14(6) — a record id is painted only inside a closed disclosure', () => {
  it('paints no row identifier outside a closed <details> anywhere on the page', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    expect(everyDetailsIsClosed(markup)).toBe(true)
    expect(withoutClosedDisclosures(markup)).not.toContain('cd-row-id')
  })

  it('builds the disclosure row from the same two functions the corpus renderer calls', () => {
    const source = {
      tierLabel: INTERACTION_TIER_LABELS.B as string,
      line: interactionLine('B', {
        ...CURATED_ROW,
        counterpartName: undefined,
        groupedRole: 'substrate',
        groupedTargets: ['CYP1A1', 'CYP1A2', 'CYP2E1'],
        groupedRecordIds: ['frdb:ddi:12474', 'frdb:ddi:12473'],
      }),
      groupedRecordIds: ['frdb:ddi:12474', 'frdb:ddi:12473'],
    }
    expect(interactionRecordIds(source)).toEqual(['frdb:ddi:12474', 'frdb:ddi:12473'])
    // The tier word and the dataset name are on the line already; the row's label is what the
    // line says the records are about.
    expect(interactionDisclosureLabel(source)).toBe('Substrate of CYP1A1, 1A2 and 2E1')
  })

  it('reads a grouped line’s records out of the provenance the loader stores', () => {
    expect(
      interactionRecordIds({
        ruleId: 'B-inxight-frdb',
        provenance: { record: 'frdb:ddi:1; frdb:ddi:2; frdb:ddi:3' },
      }),
    ).toEqual(['frdb:ddi:1', 'frdb:ddi:2', 'frdb:ddi:3'])
  })
})

/**
 * Two inline elements that both carry text, meeting with nothing between them.
 *
 * An empty element is not the defect: the anchor mark and the region glyph are empty spans whose
 * content is a CSS pseudo-element (§13(11)), and nothing reads them as words. What produced
 * "EUEMEA/H/C/005413" and "KetoconazoleA-label-statement" is two elements with text in both.
 */
const JOINED_INLINE =
  /<(?:span|a|abbr|time)\b[^>]*>([^<>]+)<\/(?:span|a|abbr|time)><(?:span|a|abbr|time)\b[^>]*>([^<>]+)</g

/** One hub comparison-table row, with every column the spec fixes and every absence in it. */
const hubMember = (over: Partial<HubMemberRecord> = {}): HubMemberRecord =>
  ({
    key: 'K1:FIXTURE',
    slug: 'fixture',
    name: 'Fixture',
    ordinal: 0,
    memberRole: 'approved',
    membershipEvidence: 'a stored target row names AR',
    approvalSg: 'Registered (HSA)',
    approvalUs: 'not found',
    approvalAu: 'not checked',
    approvalUk: 'not cleared',
    approvalEu: 'not found',
    approvalJp: 'not found',
    approvalCa: 'not found',
    sgForensicClass: 'POM',
    genericAvailable: '',
    potency: '',
    indications: '',
    indicationCount: 0,
    withdrawnReason: '',
    withdrawnWhere: '',
    trialsCount: 4,
    resultsPostedShare: '1 of 4',
    tier: 1,
    firstQuestion: 'What does the label indicate Fixture for?',
    ...over,
  }) as HubMemberRecord

describe('§14(7) — adjacent inline spans are separated by a text node', () => {
  it('joins no two inline elements that both carry text', () => {
    const markup = renderToStaticMarkup(
      React.createElement(CorpusDossierPage, { dossier: fullDossier() }),
    )
    const joined = [...markup.matchAll(JOINED_INLINE)].map((match) => `${match[1]}|${match[2]}`)
    expect(joined, `two inline elements meet with no text node: ${joined[0] ?? ''}`).toEqual([])
  })

  it('holds on a hub page too', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HubTable, {
        members: [hubMember()],
        hubType: 'target' as const,
        hubName: 'AR',
      }),
    )
    expect([...markup.matchAll(JOINED_INLINE)].map((match) => match[0])).toEqual([])
  })
})

describe('§14(9) — every visible list caps at six rows', () => {
  it('splits a longer run into six rows and a counted, closed remainder', () => {
    const rows = Array.from({ length: 14 }, (_, index) => ({
      label: 'Trial',
      value: `endpoint ${index}`,
    }))
    const groups = groupRevealedRows(rows)
    expect(groups).toHaveLength(2)
    expect(groups[0]?.rows).toHaveLength(VISIBLE_ROWS)
    expect(groups[0]?.disclosed).toBeUndefined()
    expect(groups[1]?.rows).toHaveLength(14 - VISIBLE_ROWS)
    expect(groups[1]?.disclosed).toBe(true)
    expect(groups[1]?.label).toBe('8 more recorded rows')
  })

  it('leaves a run of six alone', () => {
    const rows = Array.from({ length: 6 }, () => ({ label: 'Trial', value: 'x' }))
    const groups = groupRevealedRows(rows)
    expect(groups).toHaveLength(1)
    expect(groups[0]?.disclosed).toBeUndefined()
  })

  it('paints at most six of anything a reader meets without opening a control', () => {
    const dossier = fullDossier()
    dossier.blocks = dossier.blocks.map((block) => ({
      ...block,
      facts: Array.from({ length: 11 }, (_, index) => ({
        label: `Fact ${index}`,
        value: String(index),
      })),
    }))
    dossier.relations = Array.from({ length: 9 }, (_, index) => ({
      label: 'Ester of',
      name: `Relative ${index}`,
      slug: `relative-${index}`,
    }))
    dossier.hubs = Array.from({ length: 8 }, (_, index) => ({
      label: 'Target',
      name: `T${index}`,
      path: `/h/target/t${index}`,
    }))
    dossier.sources = Array.from({ length: 10 }, (_, index) => ({
      kind: 'chembl',
      register: 'ChEMBL',
      id: `CHEMBL${index}`,
    }))
    const painted = withoutClosedDisclosures(
      renderToStaticMarkup(React.createElement(CorpusDossierPage, { dossier })),
    )
    // Every painted value list, counted list by list: two question blocks, the computed section,
    // the relations, the hubs and the sources are six lists and not one.
    for (const list of painted.match(/<dl class="cd-facts">[\s\S]*?<\/dl>/g) ?? []) {
      expect((list.match(/class="cd-fact"/g) ?? []).length).toBeLessThanOrEqual(VISIBLE_ROWS)
    }
    // The relation and hub lists are two `<ul class="cd-relations">`, each capped.
    for (const list of painted.match(/<ul class="cd-relations">[\s\S]*?<\/ul>/g) ?? []) {
      expect((list.match(/<li>/g) ?? []).length).toBeLessThanOrEqual(VISIBLE_ROWS)
    }
    for (const list of painted.match(/<ul class="cd-source-rows">[\s\S]*?<\/ul>/g) ?? []) {
      expect((list.match(/<li>/g) ?? []).length).toBeLessThanOrEqual(VISIBLE_ROWS)
    }
  })
})

describe('§14(8) — a storage key is never painted', () => {
  it('recognises every shape the corpus writes a key in', () => {
    for (const key of [
      'K1:3J962UJT8H',
      'K2:XUFXOAAUWZOOIT-UHFFFAOYSA-N',
      'COMBO:NAME:conjugated estrogens',
      'PRODUCT:NAME:Pneumovax 23',
      'HOLD:existing:cisapride',
    ]) {
      expect(looksLikePageKey(key), key).toBe(true)
    }
    for (const notAKey of ['NDA021929', 'NCT00117520', 'CHEMBL25', 'frdb:ddi:5', undefined]) {
      expect(looksLikePageKey(notAKey), String(notAKey)).toBe(false)
    }
  })

  it('keeps a key out of a block’s rows and out of an anchor', () => {
    const body = buildBlockBody(
      {
        id: 'provenance',
        text: 'How did Fixture get from first publication in 2001 to first approval in 2009?',
        badge: 'Q1',
        block: 'provenance',
        template: 'provenance',
        values: {},
        sources: [],
      },
      {
        key: 'K1:76LA80IG2G',
        displayName: 'Fixture',
        model: 'LONGEVITY',
        tier: 1,
        withdrawn: false,
        suppressed: false,
        suppressionClasses: [],
        stub: false,
        presentFields: 4,
        fields: {},
        seeds: {
          seed8: {
            fires: true,
            values: {
              events: [
                { event: 'first publication', year: '2001', source: { id: 'K1:76LA80IG2G' } },
                { event: 'first human trial', year: '2005', source: { id: 'NCT00117520' } },
                { event: 'first approval', year: '2009', source: { id: 'K1:76LA80IG2G' } },
              ],
            },
          },
        },
        identity: { displayName: 'Fixture', synonyms: [], relations: [] },
        questions: [],
        names: new Map(),
      } as unknown as PageBundle,
    )
    const painted = [...body.rows, ...body.facts]
      .map((row) => `${row.label} ${row.identifier ?? ''} ${row.value}`)
      .join(' ')
    expect(painted).not.toContain('K1:76LA80IG2G')
    expect(painted).toContain('NCT00117520')
    // The anchor keeps the register and the date and drops the key that stood where a register's
    // record number belongs.
    const register = registerName('chembl') as string
    expect(anchor({ kind: 'chembl', id: 'COMBO:NAME:x', sourceDate: '2026-08-28' })).toBe(
      `${register} · 2026-08-28`,
    )
    expect(anchor({ kind: 'chembl', id: 'CHEMBL25', sourceDate: '2026-08-28' })).toBe(
      `${register} · CHEMBL25 · 2026-08-28`,
    )
  })
})

describe('§14(10) — the provenance timeline', () => {
  const timelinePage = (events: Array<{ event: string; year: string }>) =>
    ({
      key: 'K1:FIXTURE',
      displayName: 'Fixture',
      model: 'LONGEVITY',
      suppressed: false,
      fields: {},
      seeds: { seed8: { fires: true, values: { events, currentState: 'approved' } } },
      tier: 1,
    }) as never

  it('fires only with three or more dated events, and names the first and last kinds', () => {
    const three = deriveQuestions(
      timelinePage([
        { event: 'first approval', year: '1989' },
        { event: 'first publication', year: '1996' },
        { event: 'first human trial', year: '2004' },
      ]),
    )
    const question = three.find((entry) => entry.block === 'provenance')
    expect(question?.text).toBe(
      'How did Fixture get from first approval in 1989 to first human trial in 2004?',
    )
    expect(question?.values.firstEvent).toBe('first approval')
    expect(question?.values.lastEvent).toBe('first human trial')
  })

  it('does not fire on two dated events', () => {
    const two = deriveQuestions(
      timelinePage([
        { event: 'first approval', year: '1989' },
        { event: 'first human trial', year: '2004' },
      ]),
    )
    expect(two.find((entry) => entry.block === 'provenance')).toBeUndefined()
  })

  it('never phrases a later event as leading to an earlier one', () => {
    const unsorted = deriveQuestions(
      timelinePage([
        { event: 'first human trial', year: '2004' },
        { event: 'first approval', year: '1989' },
        { event: 'first publication', year: '1996' },
      ]),
    )
    const question = unsorted.find((entry) => entry.block === 'provenance')
    expect(question?.values.firstYear).toBe('1989')
    expect(question?.values.lastYear).toBe('2004')
  })
})

describe('§14(11) — an absence question does not fire', () => {
  it('asks nothing where the record says no one has been dosed', () => {
    const questions = deriveQuestions({
      key: 'K1:FIXTURE',
      displayName: 'Fixture',
      model: 'DEVELOPMENT',
      suppressed: false,
      tier: 3,
      fields: {
        everDosedInHumans: {
          state: 'present',
          value: { everDosedInHumans: false, basis: 'no registry study matched this page' },
        },
        molecularTarget: { state: 'present', value: { targets: [{ symbol: 'EGFR' }] } },
      },
      seeds: {},
    } as never)
    expect(questions.map((entry) => entry.block)).not.toContain('never-dosed')
    expect(questions.every((entry) => !/ever reached a person/.test(entry.text))).toBe(true)
  })
})

describe('§14(13) — the field-count line is furniture', () => {
  it('marks the stub’s own count so the ruler and the duplicate check skip it', () => {
    const dossier = fullDossier()
    dossier.blocks = []
    dossier.pageType = 'stub'
    const markup = renderToStaticMarkup(React.createElement(CorpusDossierPage, { dossier }))
    const line = /<p class="cd-stub-count"[^>]*>/.exec(markup)?.[0] ?? ''
    expect(line).toContain('data-furniture="true"')
  })
})

describe('§14(14) — a hub table’s absence cells are furniture', () => {
  it('marks every cell whose content is an absence, and no cell that states a value', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HubTable, {
        members: [hubMember()],
        hubType: 'target' as const,
        hubName: 'AR',
      }),
    )
    const cells = markup.match(/<td[^>]*>[\s\S]*?<\/td>/g) ?? []
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) {
      const text = visibleText(cell)
      const absence = [
        '—',
        'not found',
        'not cleared',
        'not checked',
        'no label indication on record',
      ].includes(text)
      const marked = cell.includes('data-furniture="true"')
      expect(marked, `cell ${JSON.stringify(text)}`).toBe(absence || text === '')
    }
    expect(markup).toContain('no label indication on record')
  })

  it('leaves a stated value unmarked', () => {
    const markup = renderToStaticMarkup(
      React.createElement(HubTable, {
        members: [hubMember({ approvalUs: 'Approved', genericAvailable: 'yes' })],
        hubType: 'class' as const,
        hubName: 'L02BB',
      }),
    )
    const approved = (markup.match(/<td[^>]*>Approved<\/td>/g) ?? [])[0] ?? ''
    expect(approved).not.toContain('data-furniture')
  })
})

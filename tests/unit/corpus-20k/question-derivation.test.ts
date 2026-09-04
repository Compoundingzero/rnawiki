/**
 * R7 question derivation — docs/specs/question-derivation.md.
 *
 * Fixtures only. Nothing here is seed data: every page below is a hand-built shape that exercises
 * one trigger, and no value in this file is written to data/.
 */
import { describe, expect, it } from 'vitest'

import {
  BLOCK_ORDER,
  canonicalSeedId,
  TEMPLATE_IDS,
  computeMetrics,
  deriveQuestions,
  deriveQuestionsAndWithheld,
  findForbiddenWords,
  fiveGrams,
  formatDuration,
  isStub,
  joinList,
  presentFieldCount,
  type FieldEntry,
  type PageInput,
} from '@/scripts/corpus-20k/questions/derive'

function field(value: unknown, state: FieldEntry['state'] = 'present'): FieldEntry {
  return {
    state,
    value,
    source: [{ kind: 'registry', id: 'NCT00000000', url: 'https://example.invalid/record' }],
    sourceDate: '2026-01-15',
  }
}

function page(overrides: Partial<PageInput> = {}): PageInput {
  return {
    key: 'rapamycin',
    displayName: 'Rapamycin',
    model: 'LONGEVITY',
    suppressed: false,
    tier: 1,
    fields: {},
    seeds: {},
    ...overrides,
  }
}

function textFor(template: string, input: PageInput): string | undefined {
  return deriveQuestions(input).find((q) => q.template === template)?.text
}

const LADDER_TWO = field([
  { organism: 'yeast', evidenceKind: 'mechanism-only', citation: 'PMID:1' },
  { organism: 'mouse', evidenceKind: 'lifespan', citation: 'PMID:2' },
])

/**
 * The DEVELOPMENT fields as the Phase 2 extractors record them: the target carries Open Targets
 * symbols and ChEMBL preferred names, the phase is the registry object, the sponsor is the lead
 * sponsor list and the mechanism is the ChEMBL mechanism rows.
 */
const TARGET_FIELD = field({
  openTargetsTargets: [
    {
      kind: 'open-targets-moa-target',
      ensemblId: 'ENSG00000089685',
      symbol: 'BIRC5',
      targetName: 'Baculoviral IAP repeat-containing protein 5',
    },
  ],
  chemblTargets: [
    {
      kind: 'chembl-mechanism-target',
      targetChemblId: 'CHEMBL5989',
      prefName: { prefName: 'Baculoviral IAP repeat-containing protein 5' },
    },
  ],
})

const PHASE_FIELD = field({
  registry: {
    highestPhase: 'PHASE2',
    studiesAtThatPhase: 3,
    studiesMatched: 11,
    byPhase: { PHASE1: 8, PHASE2: 3 },
  },
})

const SPONSOR_ONE = field({
  registryLeadSponsors: [
    { name: 'Wistar Institute', leadSponsorClass: 'OTHER', studies: 4, exampleNct: 'NCT00000401' },
  ],
})

const SPONSOR_MANY = field({
  registryLeadSponsors: [
    { name: 'Wistar Institute', leadSponsorClass: 'OTHER', studies: 4, exampleNct: 'NCT00000401' },
    { name: 'Aduro Biotech', leadSponsorClass: 'INDUSTRY', studies: 2, exampleNct: 'NCT00000402' },
  ],
})

const MECHANISM_FIELD = field([
  {
    actionType: 'INHIBITOR',
    mechanismOfAction: 'Baculoviral IAP repeat-containing protein 5 inhibitor',
    targetChemblId: 'CHEMBL5989',
  },
])

/** One case per template in the spec's table, with the trigger that fires it. */
const CASES: Array<{ template: string; input: PageInput; text: string }> = [
  {
    template: 'supervision',
    input: page({
      suppressed: true,
      suppressionClasses: ['S1'],
      fields: { regulatoryStatus: field({ US: 'approved' }) },
    }),
    text: 'Why does Rapamycin carry a supervision requirement?',
  },
  {
    // Phase 5a: a suppressed page whose only class is S10 has no classification to cite, so it is
    // never asked why it carries a supervision requirement (docs/specs/question-derivation.md,
    // "Amendments after Gate 2").
    template: 'classification',
    input: page({
      suppressed: true,
      suppressionClasses: ['S10'],
      fields: { regulatoryStatus: field({ US: 'approved' }) },
    }),
    text: 'What classification does Rapamycin carry?',
  },
  {
    template: 'human-data',
    input: page({
      fields: { humanEvidenceCeiling: field({ largestN: 245, longestDurationDays: 365 }) },
    }),
    text: "What did Rapamycin's largest trial (245 people) and its longest (12 months) measure?",
  },
  {
    template: 'human-data-none',
    input: page({
      fields: { organismLadder: field([{ organism: 'mouse', evidenceKind: 'lifespan' }]) },
    }),
    text: 'Rapamycin has only mouse evidence — what kind?',
  },
  {
    template: 'ladder',
    input: page({ fields: { organismLadder: LADDER_TWO } }),
    text: 'From yeast to mouse: where has Rapamycin shown lifespan?',
  },
  {
    template: 'ladder-single',
    input: page({
      fields: { organismLadder: field([{ organism: 'mouse', evidenceKind: 'lifespan' }]) },
    }),
    text: 'Rapamycin was tested only in mouse — what did it show?',
  },
  {
    template: 'itp',
    input: page({
      fields: {
        itp: field({
          tested: true,
          cohorts: [
            {
              dose: 14,
              ageAtStartMonths: 9,
              sex: 'male',
              outcome: 'median lifespan increased 10%',
            },
            {
              dose: 14,
              ageAtStartMonths: 9,
              sex: 'female',
              outcome: 'median lifespan increased 18%',
            },
          ],
        }),
      },
    }),
    text: 'The NIA ITP gave Rapamycin at 14 ppm from 9 months — did both sexes live longer?',
  },
  {
    template: 'itp-negative',
    input: page({
      displayName: 'Nordihydroguaiaretic acid',
      fields: {
        itp: field({
          tested: true,
          cohorts: [
            {
              dose: 800,
              ageAtStartMonths: 9,
              sex: 'male',
              outcome: 'no significant increase in lifespan',
            },
            {
              dose: 800,
              ageAtStartMonths: 9,
              sex: 'female',
              outcome: 'no significant increase in lifespan',
            },
          ],
        }),
      },
    }),
    text: "Why did the ITP's Nordihydroguaiaretic acid cohorts (800 ppm, from 9 months) show no extension?",
  },
  {
    template: 'withdrawn',
    input: page({
      key: 'troglitazone',
      displayName: 'Troglitazone',
      model: 'CLINICAL',
      fields: {
        withdrawalStatus: field({
          withdrawn: true,
          approvalYear: 1997,
          date: '2000-03-21',
          jurisdictions: ['the US', 'the EU'],
          reason: 'hepatotoxicity',
        }),
      },
    }),
    text: 'Approved in 1997, withdrawn in 2000: what happened to Troglitazone in the US and the EU?',
  },
  {
    template: 'stopped',
    input: page({
      seeds: {
        seed3: { fires: true, values: { stoppedTrials: 4, clusters: ['futility', 'accrual'] } },
      },
    }),
    text: "4 of Rapamycin's trials stopped: futility, accrual?",
  },
  {
    template: 'stopped-one',
    input: page({
      fields: {
        trialFailures: field([
          { nct: 'NCT01649960', status: 'Terminated', whyStopped: 'slow accrual' },
        ]),
      },
    }),
    text: "Why did Rapamycin's trial NCT01649960 stop?",
  },
  {
    template: 'dose-studied',
    input: page({ fields: { doseStudied: field({ dose: '14 ppm in chow', organism: 'mouse' }) } }),
    text: 'Mouse studies of Rapamycin used 14 ppm in chow — over how long?',
  },
  {
    template: 'clocks',
    input: page({
      fields: {
        epigeneticClocks: field([{ clock: 'GrimAge', effect: '−0.4 years', citation: 'PMID:3' }]),
      },
    }),
    text: 'Did Rapamycin move GrimAge, and by how much?',
  },
  {
    template: 'dose-shape',
    input: page({
      fields: {
        doseResponseShape: field({
          shape: 'hormetic',
          organism: 'C. elegans',
          verbatim: 'biphasic',
        }),
      },
    }),
    text: 'More Rapamycin was worse in C. elegans: at what point?',
  },
  {
    template: 'dose-shape-plateau',
    input: page({ fields: { doseResponseShape: field({ shape: 'plateau', organism: 'mouse' }) } }),
    text: "Where did Rapamycin's effect in mouse stop rising?",
  },
  {
    template: 'kinetics',
    input: page({ fields: { kinetics: field({ halfLife: { value: 62, unit: 'hours' } }) } }),
    text: "Rapamycin's half-life is 62 hours — which schedules were studied?",
  },
  {
    template: 'bioavailability',
    input: page({
      seeds: { seed1: { fires: true, values: { route: 'intraperitoneal', organism: 'mouse' } } },
    }),
    text: 'Rapamycin worked by intraperitoneal in mouse — what about oral?',
  },
  {
    template: 'n-of-1',
    input: page({ seeds: { seed2: { fires: true, values: { biomarkers: ['fasting glucose'] } } } }),
    text: "Could one person measure Rapamycin's effect on fasting glucose?",
  },
  {
    template: 'time-to-signal',
    input: page({ seeds: { seed6: { fires: true, values: { endpoint: 'HbA1c' } } } }),
    text: 'How long did trials of Rapamycin run before an effect on HbA1c?',
  },
  {
    template: 'biomarkers',
    input: page({
      fields: {
        biomarkersMeasured: field([
          { term: 'IL-6', count: 5 },
          { term: 'C-reactive protein', count: 9 },
          { term: 'grip strength', count: 2 },
          { term: 'VO₂max', count: 1 },
        ]),
      },
    }),
    text: "Which of C-reactive protein, IL-6 and grip strength did Rapamycin's trials measure?",
  },
  {
    template: 'ongoing',
    input: page({
      fields: { ongoingTrials: field([{ nct: 'NCT1' }, { nct: 'NCT2' }, { nct: 'NCT3' }]) },
    }),
    text: "Which of Rapamycin's 3 ongoing trials reports first?",
  },
  {
    template: 'what-would-settle',
    input: page({ seeds: { seed9: { fires: true, values: { endpoint: 'frailty index' } } } }),
    text: 'Which running trial of Rapamycin could settle frailty index?',
  },
  {
    template: 'unreported',
    input: page({ seeds: { seed12: { fires: true, values: { count: 2 } } } }),
    text: 'Which 2 trials of Rapamycin posted no result?',
  },
  {
    template: 'trial-size',
    input: page({ seeds: { seed16: { fires: true, values: { median: 24, max: 245 } } } }),
    text: "At the median, Rapamycin's trials enrolled 24 people — anything larger?",
  },
  {
    template: 'faers',
    input: page({
      fields: {
        faersSignal: field({ totalReports: 1834, terms: [{ term: 'stomatitis', count: 210 }] }),
      },
    }),
    text: 'What do 1834 spontaneous reports say about Rapamycin — and not say?',
  },
  {
    template: 'faers-unlisted',
    input: page({
      seeds: { seed14: { fires: true, values: { terms: ['stomatitis', 'pyrexia'] } } },
    }),
    text: "Which 2 reactions does Rapamycin's label not list?",
  },
  {
    template: 'interactions',
    input: page({
      fields: { interactions: field({ cyp: [{ enzyme: 'CYP3A4', role: 'substrate' }] }) },
    }),
    text: 'Rapamycin and CYP3A4: shared by which compounds?',
  },
  {
    template: 'fasting-exercise',
    input: page({
      fields: {
        interactions: field({
          fasting: { statement: 'administered without food', citation: 'label' },
          exercise: { statement: 'combined with treadmill training', citation: 'PMID:4' },
        }),
      },
    }),
    text: 'Was Rapamycin studied with fasting and exercise?',
  },
  {
    template: 'pathway',
    input: page({
      fields: {
        pathways: field([{ pathway: 'mTOR', statement: 'inhibits mTORC1', citation: 'PMID:5' }]),
      },
    }),
    text: 'What is recorded about Rapamycin and mTOR?',
  },
  {
    template: 'lineage',
    input: page({ seeds: { seed13: { fires: true, values: { target: 'MTOR', others: 3 } } } }),
    text: 'What became of the other 3 compounds aimed at MTOR?',
  },
  {
    template: 'jurisdiction',
    input: page({
      seeds: {
        seed17: { fires: true, values: { jurisdictions: { US: 'approved', SG: 'controlled' } } },
      },
    }),
    text: 'Drug, supplement or controlled: what is Rapamycin in US and SG?',
  },
  {
    template: 'contradiction',
    input: page({ seeds: { seed10: { fires: true, values: { field: 'half-life' } } } }),
    text: 'Where do the label and the trials disagree about Rapamycin?',
  },
  {
    template: 'provenance',
    input: page({
      seeds: {
        seed8: {
          fires: true,
          values: { firstYear: 1975, currentState: 'an approved transplant medicine' },
        },
      },
    }),
    text: 'How did Rapamycin get from 1975 to an approved transplant medicine?',
  },
  {
    template: 'target-phase',
    input: page({
      key: 'example-target-only',
      displayName: 'XY-3100',
      model: 'DEVELOPMENT',
      fields: { molecularTarget: TARGET_FIELD, highestPhase: PHASE_FIELD },
    }),
    text: 'XY-3100, aimed at BIRC5: reached which phase?',
  },
  {
    template: 'mechanism-action',
    input: page({
      key: 'example-mechanism-only',
      displayName: 'XY-3200',
      model: 'DEVELOPMENT',
      fields: { molecularTarget: TARGET_FIELD, mechanismClass: MECHANISM_FIELD },
    }),
    text: 'XY-3200 on BIRC5: which action is recorded?',
  },
  {
    template: 'sponsor-phase',
    input: page({
      key: 'example-sponsor-only',
      displayName: 'XY-3300',
      model: 'DEVELOPMENT',
      fields: { sponsor: SPONSOR_ONE, highestPhase: PHASE_FIELD },
    }),
    text: 'Who carried XY-3300 to phase 2?',
  },
  {
    template: 'development-stop',
    input: page({
      key: 'example-code-compound',
      displayName: 'XY-1042',
      model: 'DEVELOPMENT',
      fields: {
        whyDevelopmentStopped: field('Sponsor ended the programme'),
        highestPhase: field(2),
      },
    }),
    text: 'Development of XY-1042 stopped at phase 2 — why?',
  },
  {
    template: 'indication',
    input: page({
      key: 'example-clinical-label',
      displayName: 'Theophylline',
      model: 'CLINICAL',
      tier: 2,
      fields: {
        indication: field({
          statement: 'indicated for the treatment of the symptoms of chronic asthma',
          labelSection: 'indications_and_usage',
        }),
      },
    }),
    text: 'On the Theophylline label: indicated for what?',
  },
  {
    template: 'regulatory-only',
    input: page({
      key: 'example-clinical-register',
      displayName: 'Comocladia',
      model: 'CLINICAL',
      tier: 2,
      fields: {
        regulatoryStatus: field({
          US: { status: 'unknown' },
          EU: { status: 'unknown' },
          CA: { status: 'approved' },
        }),
      },
    }),
    text: 'Where is Comocladia approved?',
  },
  {
    template: 'trial-history',
    input: page({
      key: 'example-clinical-trials',
      displayName: 'Sennosides',
      model: 'CLINICAL',
      tier: 2,
      fields: {
        trialHistory: field({
          registeredStudies: 18,
          byPhase: { PHASE3: 1, PHASE2: 2 },
          studiesWithPostedResults: 6,
        }),
      },
    }),
    text: '18 registered trials of Sennosides — at which phases?',
  },
  {
    template: 'never-dosed',
    input: page({
      key: 'example-preclinical',
      displayName: 'XY-2200',
      model: 'DEVELOPMENT',
      fields: { everDosedInHumans: field({ bool: false }), molecularTarget: field('SIRT6') },
    }),
    text: 'Has XY-2200 ever reached a person?',
  },
]

describe('question templates', () => {
  it.each(CASES.map((c) => [c.template, c] as const))(
    'derives the %s template from its trigger',
    (_template, testCase) => {
      expect(textFor(testCase.template, testCase.input)).toBe(testCase.text)
    },
  )

  it('covers every template the spec lists', () => {
    const covered = new Set(CASES.map((c) => c.template))
    expect([...TEMPLATE_IDS].filter((t) => !covered.has(t))).toEqual([])
  })

  it('emits nothing when the trigger field is absent', () => {
    expect(
      deriveQuestions(
        page({
          fields: {
            humanEvidenceCeiling: field(null, 'absent'),
            kinetics: field(null, 'not-applicable'),
            pathways: field(null, 'absent'),
          },
        }),
      ),
    ).toEqual([])
  })

  it('emits nothing when a slot has no value, even with the field present', () => {
    // Field 6 present but the recorded clock has no name: no value, no question.
    expect(
      deriveQuestions(page({ fields: { epigeneticClocks: field([{ effect: '−0.4 years' }]) } })),
    ).toEqual([])
  })
})

/**
 * Amendment of 2026-09-04 (docs/specs/question-derivation.md, "Amendments after the executor
 * build"): the words after a template's last slot are the same on every page that carries the
 * template, so a long tail is a repeated five-gram. At most four.
 */
function tailWords(text: string, values: Record<string, string>): string[] {
  const haystack = text.toLowerCase()
  let end = 0
  for (const value of Object.values(values)) {
    const needle = value.toLowerCase()
    if (needle.length === 0) continue
    const at = haystack.lastIndexOf(needle)
    if (at >= 0) end = Math.max(end, at + needle.length)
  }
  return text.slice(end).match(/[A-Za-z0-9]+/g) ?? []
}

describe('template tails', () => {
  it.each(CASES.map((c) => [c.template, c] as const))(
    'leaves at most four value-free words after the last slot of %s',
    (_template, testCase) => {
      const q = deriveQuestions(testCase.input).find((b) => b.template === testCase.template)
      expect(q).toBeDefined()
      expect(tailWords(q?.text ?? '', q?.values ?? {}).length).toBeLessThanOrEqual(4)
    },
  )

  it('finds the tail after the last slot, not after the first', () => {
    expect(
      tailWords('Rapamycin and CYP3A4: shared by which compounds?', {
        name: 'Rapamycin',
        enzymeList: 'CYP3A4',
      }),
    ).toEqual(['shared', 'by', 'which', 'compounds'])
  })
})

describe('block order and badges', () => {
  const rich = page({
    fields: {
      humanEvidenceCeiling: field({ largestN: 245, longestDurationDays: 365 }),
      organismLadder: LADDER_TWO,
      kinetics: field({ halfLife: { value: 62, unit: 'hours' } }),
      pathways: field([{ pathway: 'mTOR' }]),
      ongoingTrials: field([{ nct: 'NCT1' }, { nct: 'NCT2' }]),
      interactions: field({ cyp: [{ enzyme: 'CYP3A4' }] }),
    },
    seeds: {
      seed15: { fires: true, values: { year: 2011 } },
      seed17: { fires: true, values: { jurisdictions: { US: 'approved', SG: 'controlled' } } },
    },
  })

  it('renders blocks in the §4 precedence', () => {
    const blocks = deriveQuestions(rich).map((q) => q.block)
    const positions = blocks.map((b) => BLOCK_ORDER.indexOf(b as (typeof BLOCK_ORDER)[number]))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('restarts badge numbering at Q1 on every page', () => {
    const badges = deriveQuestions(rich).map((q) => q.badge)
    expect(badges[0]).toBe('Q1')
    expect(badges).toEqual(badges.map((_b, i) => `Q${i + 1}`))
  })

  it('fires each block at most once', () => {
    const blocks = deriveQuestions(rich).map((q) => q.block)
    expect(new Set(blocks).size).toBe(blocks.length)
  })

  it('carries the field sources through to the block', () => {
    const q = deriveQuestions(rich).find((b) => b.block === 'kinetics')
    expect(q?.sources[0]).toMatchObject({ kind: 'registry', sourceDate: '2026-01-15' })
  })
})

describe('suppression (R2)', () => {
  const suppressed = page({
    suppressed: true,
    fields: {
      humanEvidenceCeiling: field({ largestN: 245, longestDurationDays: 365 }),
      organismLadder: LADDER_TWO,
      kinetics: field({ halfLife: { value: 62, unit: 'hours' } }),
    },
    seeds: {
      seed1: { fires: true, values: { route: 'intraperitoneal', organism: 'mouse' } },
      seed2: { fires: true, values: { biomarkers: ['fasting glucose'] } },
      seed6: { fires: true, values: { endpoint: 'HbA1c' } },
    },
  })

  it('never gives a suppressed page the n-of-1, bioavailability or time-to-signal blocks', () => {
    const blocks = deriveQuestions(suppressed).map((q) => q.block)
    expect(blocks).not.toContain('n-of-1')
    expect(blocks).not.toContain('bioavailability')
    expect(blocks).not.toContain('time-to-signal')
  })

  it('always puts the supervision block first on a suppressed page', () => {
    const first = deriveQuestions(suppressed)[0]
    expect(first?.block).toBe('supervision')
    expect(first?.badge).toBe('Q1')
    expect(first?.text).toBe('Why does Rapamycin carry a supervision requirement?')
  })

  it('gives an unsuppressed page with the same seeds all three blocks', () => {
    const blocks = deriveQuestions({ ...suppressed, suppressed: false }).map((q) => q.block)
    expect(blocks).toContain('n-of-1')
    expect(blocks).toContain('bioavailability')
    expect(blocks).toContain('time-to-signal')
    expect(blocks).not.toContain('supervision')
  })
})

describe('stub rule (R15)', () => {
  const twoFields = {
    molecularTarget: field('SIRT6'),
    mechanismClass: field('inhibitor'),
    highestPhase: field(null, 'absent'),
  }

  it('gives a Tier 3 page with fewer than three present fields no questions', () => {
    const p = page({
      key: 'thin',
      displayName: 'XY-9000',
      model: 'DEVELOPMENT',
      tier: 3,
      fields: twoFields,
    })
    expect(presentFieldCount(p)).toBe(2)
    expect(isStub(p)).toBe(true)
    expect(deriveQuestions(p)).toEqual([])
  })

  it('gives a Tier 3 page with three present fields its questions', () => {
    const p = page({
      key: 'thicker',
      displayName: 'XY-9001',
      model: 'DEVELOPMENT',
      tier: 3,
      fields: { ...twoFields, highestPhase: field(1), everDosedInHumans: field({ bool: false }) },
    })
    expect(isStub(p)).toBe(false)
    expect(deriveQuestions(p).map((q) => q.template)).toContain('never-dosed')
  })

  it('never stubs Tier 1 or Tier 2, and falls back to the field count when no tier is recorded', () => {
    expect(isStub(page({ tier: 1, fields: twoFields }))).toBe(false)
    expect(isStub(page({ tier: 2, fields: twoFields }))).toBe(false)
    const noTier = page({ fields: twoFields })
    delete noTier.tier
    expect(isStub(noTier)).toBe(true)
  })
})

describe('forbidden words (docs/specs/derived-content.md hard guard)', () => {
  it.each([
    ['take', 'What should a reader take?'],
    ['start', 'When did the run start?'],
    ['try', 'Should a reader try it?'],
    ['protocol', 'The protocol is recorded here'],
    ['recommended', 'The label recommended it'],
    ['should', 'It should follow'],
    ['safe', 'Is it safe in people?'],
    ['effective', 'Was it effective in people?'],
    ['optimal', 'What is the optimal amount?'],
  ])('flags %s', (word, text) => {
    expect(findForbiddenWords(text)).toContain(word)
  })

  it('flags dose used as a verb but not as a noun', () => {
    expect(findForbiddenWords('The NIA ITP gave it at 14 ppm — a dose recorded in chow')).toEqual(
      [],
    )
    expect(findForbiddenWords('three doses were recorded')).toEqual([])
    expect(findForbiddenWords('how to dose it')).toContain('dose (as a verb)')
    expect(findForbiddenWords('dosing was daily')).toContain('dose (as a verb)')
    expect(findForbiddenWords('participants were dosed weekly')).toContain('dose (as a verb)')
    expect(findForbiddenWords('doses climbed')).toContain('dose (as a verb)')
  })

  it('leaves the registry cluster words safety and efficacy alone', () => {
    expect(findForbiddenWords("4 of X's trials stopped: futility, safety?")).toEqual([])
    expect(findForbiddenWords("4 of X's trials stopped: efficacy, accrual?")).toEqual([])
  })

  it('finds no forbidden word in any derived question', () => {
    for (const testCase of CASES) {
      for (const q of deriveQuestions(testCase.input)) {
        expect({ template: q.template, hits: findForbiddenWords(q.text) }).toEqual({
          template: q.template,
          hits: [],
        })
      }
    }
  })

  it('withholds a block whose recorded value carries a guarded word, and rewrites nothing', () => {
    const p = page({
      fields: {
        kinetics: field({ halfLife: { value: '6 hours (effective half-life)', unit: 'hours' } }),
      },
    })
    const { questions, withheld } = deriveQuestionsAndWithheld(p)
    expect(questions).toEqual([])
    expect(withheld).toEqual([{ template: 'kinetics', word: 'effective' }])
  })

  it('reports a violation through the metrics rather than silently passing it', () => {
    const metrics = computeMetrics([
      {
        key: 'planted',
        questions: [
          {
            id: 'planted',
            text: 'Is this safe?',
            badge: 'Q1',
            block: 'supervision',
            template: 'supervision',
            values: {},
            sources: [],
          },
        ],
      },
    ])
    expect(metrics.forbiddenWords.violations).toEqual([
      { key: 'planted', word: 'safe', text: 'Is this safe?' },
    ])
  })
})

describe('recorded input shapes', () => {
  it('reads the ITP workbook column names and its list of sexes present', () => {
    const p = page({
      fields: {
        itp: field({
          tested: true,
          cohorts: [
            {
              cohortYear: 'C2015',
              armCode: 'DMAG',
              doseAsWritten: '30',
              ageAtStartMonthsAsWritten: '6',
              sexesPresent: ['f', 'm'],
            },
          ],
        }),
      },
    })
    expect(textFor('itp', p)).toBe(
      'The NIA ITP gave Rapamycin at 30 ppm from 6 months — did both sexes live longer?',
    )
  })

  it('never asks why a cohort showed no extension when no cohort states an outcome', () => {
    const p = page({
      fields: {
        itp: field({
          tested: true,
          cohorts: [{ doseAsWritten: '30', ageAtStartMonthsAsWritten: '6', sexesPresent: ['m'] }],
        }),
      },
    })
    expect(deriveQuestions(p).map((q) => q.template)).not.toContain('itp-negative')
  })

  it('reads the approval year from the register that records it', () => {
    const p = page({
      key: 'example-withdrawn',
      displayName: 'Alatrofloxacin',
      model: 'CLINICAL',
      fields: {
        withdrawalStatus: field({
          withdrawn: true,
          jurisdictions: ['the European Union'],
          date: '2022',
        }),
        approvalDate: field({
          chemblFirstApproval: {
            year: 1998,
            source: { kind: 'chembl', id: 'CHEMBL1201649' },
            sourceDate: '2026-09-04',
          },
        }),
      },
    })
    expect(textFor('withdrawn', p)).toBe(
      'Approved in 1998, withdrawn in 2022: what happened to Alatrofloxacin in the European Union?',
    )
  })

  it('reads the enzyme from a counterparty entry and from a label sentence list', () => {
    const fromEntries = page({
      fields: { interactions: field({ cyp: [{ kind: 'ENZYME', counterparty: 'CYP1A2' }] }) },
    })
    expect(textFor('interactions', fromEntries)).toBe(
      'Rapamycin and CYP1A2: shared by which compounds?',
    )
    const fromSentences = page({
      fields: {
        interactions: field([
          {
            statement: 'label sentence',
            labelSection: 'pharmacokinetics',
            terms: ['CYP2D6', 'P-GP'],
          },
        ]),
      },
    })
    expect(textFor('interactions', fromSentences)).toBe(
      'Rapamycin and CYP2D6 and P-GP: shared by which compounds?',
    )
  })

  it('does not print the half-life unit twice when the value already carries it', () => {
    expect(
      textFor(
        'kinetics',
        page({
          fields: { kinetics: field({ halfLife: { value: '20 to 50 hours', unit: 'hours' } }) },
        }),
      ),
    ).toBe("Rapamycin's half-life is 20 to 50 hours — which schedules were studied?")
  })

  it('reads a recorded dose entry list, keeping one organism with its own dose text', () => {
    const p = page({
      fields: {
        doseStudied: field([
          { organism: 'human', doseText: '300IU Gonal-F', route: null },
          { organism: 'mouse', doseText: '14 ppm', route: null },
        ]),
      },
    })
    expect(textFor('dose-studied', p)).toBe(
      'Human studies of Rapamycin used 300IU Gonal-F — over how long?',
    )
  })

  it('reads the registry phase and the extractor name for ever-dosed', () => {
    const p = page({
      key: 'example-development',
      displayName: 'XY-3000',
      model: 'DEVELOPMENT',
      fields: {
        whyDevelopmentStopped: field([{ nct: 'NCT1', whyStopped: 'Sponsor decision' }]),
        highestPhase: field({ registry: { highestPhase: 'PHASE2', studiesMatched: 4 } }),
        everDosedInHumans: field({ everDosedInHumans: false }),
      },
    })
    const templates = deriveQuestions(p).map((q) => q.template)
    expect(textFor('development-stop', p)).toBe('Development of XY-3000 stopped at phase 2 — why?')
    expect(templates).toContain('never-dosed')
  })
})

/**
 * Phase 2c: the three DEVELOPMENT templates that give the sponsor/target/mechanism-only pages a
 * question. Each fires only on its own recorded values, and none of them names a value the field
 * does not hold.
 */
describe('DEVELOPMENT target, sponsor and mechanism templates', () => {
  const dev = (fields: Record<string, FieldEntry>, displayName = 'XY-3100'): PageInput =>
    page({ key: 'example-development', displayName, model: 'DEVELOPMENT', fields })

  it('names the second sponsor without naming it, when the registry records more than one', () => {
    expect(
      textFor('sponsor-phase', dev({ sponsor: SPONSOR_MANY, highestPhase: PHASE_FIELD })),
    ).toBe('Who carried XY-3100 to phase 2, and who else?')
  })

  it('withholds the target-phase question once a stop reason is recorded', () => {
    const stopped = dev({
      molecularTarget: TARGET_FIELD,
      highestPhase: PHASE_FIELD,
      whyDevelopmentStopped: field([{ nct: 'NCT00000403', whyStopped: 'Sponsor decision' }]),
    })
    expect(textFor('target-phase', stopped)).toBeUndefined()
    // the stop reason is the better question, and it is the one that fires
    expect(textFor('development-stop', stopped)).toBe(
      'Development of XY-3100 stopped at phase 2 — why?',
    )
  })

  it('does not ask a target question when the target resolves only to a record id', () => {
    const idOnly = dev({
      molecularTarget: field({
        chemblTargets: [{ targetChemblId: 'CHEMBL5989', prefName: 'CHEMBL5989' }],
      }),
      highestPhase: PHASE_FIELD,
      mechanismClass: MECHANISM_FIELD,
    })
    expect(textFor('target-phase', idOnly)).toBeUndefined()
    expect(textFor('mechanism-action', idOnly)).toBeUndefined()
  })

  it('does not ask the phase questions when the registry states no numbered phase', () => {
    const unstated = dev({
      molecularTarget: TARGET_FIELD,
      sponsor: SPONSOR_ONE,
      highestPhase: field({ registry: { highestPhase: 'NA_OR_UNSTATED', studiesMatched: 2 } }),
    })
    expect(textFor('target-phase', unstated)).toBeUndefined()
    expect(textFor('sponsor-phase', unstated)).toBeUndefined()
  })

  it('leaves the three templates to DEVELOPMENT pages', () => {
    const clinical = page({
      model: 'CLINICAL',
      fields: {
        molecularTarget: TARGET_FIELD,
        highestPhase: PHASE_FIELD,
        sponsor: SPONSOR_ONE,
        mechanismClass: MECHANISM_FIELD,
      },
    })
    const emitted = deriveQuestions(clinical).map((q) => q.template)
    expect(emitted).not.toContain('target-phase')
    expect(emitted).not.toContain('sponsor-phase')
    expect(emitted).not.toContain('mechanism-action')
  })

  it('gives a page holding only sponsor, target and mechanism three questions', () => {
    const p = dev({
      molecularTarget: TARGET_FIELD,
      mechanismClass: MECHANISM_FIELD,
      sponsor: SPONSOR_ONE,
      highestPhase: PHASE_FIELD,
    })
    expect(isStub(p)).toBe(false)
    expect(deriveQuestions(p).map((q) => q.template)).toEqual([
      'target-phase',
      'mechanism-action',
      'sponsor-phase',
    ])
  })

  it('keeps every new question clear of the hard guard', () => {
    for (const template of ['target-phase', 'mechanism-action', 'sponsor-phase']) {
      const testCase = CASES.find((c) => c.template === template)
      expect(findForbiddenWords(testCase?.text ?? '')).toEqual([])
    }
    // the wording this executor was handed used "took", which the guard's take-family pattern holds
    expect(findForbiddenWords('Who took XY-3300 to phase 2?')).toEqual(['take'])
  })
})

describe('slot values that are not names', () => {
  it('does not ask the lineage question when the seed resolved no target symbol', () => {
    const withSymbol = page({
      seeds: { seed13: { fires: true, values: { target: 'BIRC5', n: 2 } } },
    })
    expect(textFor('lineage', withSymbol)).toBe(
      'What became of the other 2 compounds aimed at BIRC5?',
    )
    const withId = page({
      seeds: { seed13: { fires: true, values: { target: 'CHEMBL2311221', n: 2 } } },
    })
    expect(textFor('lineage', withId)).toBeUndefined()
  })
})

describe('seed identifiers', () => {
  it("resolves the seeds executor's file names, its slugs and bare numbers", () => {
    expect(canonicalSeedId('seed-03-failure-autopsy')).toBe('seed3')
    expect(canonicalSeedId('seed-14-spontaneous-report-disproportion')).toBe('seed14')
    expect(canonicalSeedId('seed1')).toBe('seed1')
    expect(canonicalSeedId('n-of-1')).toBe('seed2')
    expect(canonicalSeedId('time-to-signal')).toBe('seed6')
    expect(canonicalSeedId('17')).toBe('seed17')
  })

  it("reads seed 3's reason clusters from the slot name compute.py writes", () => {
    const p = page({
      seeds: { seed3: { fires: true, values: { n: 3, reasonList: ['futility', 'funding'] } } },
    })
    expect(textFor('stopped', p)).toBe("3 of Rapamycin's trials stopped: futility, funding?")
  })
})

describe('duration wording', () => {
  it.each([
    [1, '1 day'],
    [10, '10 days'],
    [21, '3 weeks'],
    [83, '12 weeks'],
    [90, '3 months'],
    [365, '12 months'],
    [730, '2 years'],
    [1096, '3 years'],
    [4018, '11 years'],
  ])('renders %i days as %s', (days, expected) => {
    expect(formatDuration(days)).toBe(expected)
  })

  it('has no wording for a missing or non-positive duration', () => {
    expect(formatDuration(undefined)).toBeUndefined()
    expect(formatDuration(0)).toBeUndefined()
  })

  it('joins lists the way the templates read', () => {
    expect(joinList(['US'])).toBe('US')
    expect(joinList(['US', 'SG'])).toBe('US and SG')
    expect(joinList(['US', 'EU', 'SG'])).toBe('US, EU and SG')
  })
})

describe('metrics', () => {
  const pages = CASES.map((c, i) => ({
    key: `${c.template}-${i}`,
    questions: deriveQuestions(c.input),
  }))

  it('counts pages, questions and distinct strings', () => {
    const metrics = computeMetrics(pages, { pairs: 200 })
    expect(metrics.pages.total).toBe(pages.length)
    expect(metrics.questions.total).toBe(pages.reduce((n, p) => n + p.questions.length, 0))
    expect(metrics.questions.distinctStrings).toBeGreaterThan(0)
    expect(metrics.forbiddenWords.violations).toEqual([])
  })

  it('reports the most repeated string and its page share, and passes R7 below 30%', () => {
    const metrics = computeMetrics(pages, { pairs: 200 })
    expect(metrics.mostRepeatedString?.pages).toBeGreaterThanOrEqual(1)
    expect(metrics.mostRepeatedString?.share).toBeLessThanOrEqual(0.3)
    expect(metrics.r7.pass).toBe(true)
  })

  it('fails R7 when one string covers more than 30% of pages', () => {
    const repeated = Array.from({ length: 10 }, (_v, i) => ({
      key: `page-${i}`,
      questions: [
        {
          id: 'contradiction',
          text: 'Where do the label and the trials disagree?',
          badge: 'Q1',
          block: 'contradiction',
          template: 'contradiction',
          values: {},
          sources: [],
        },
      ],
    }))
    const metrics = computeMetrics(repeated, { pairs: 10 })
    expect(metrics.mostRepeatedString?.share).toBe(1)
    expect(metrics.r7.pass).toBe(false)
    expect(metrics.mostRepeatedTemplate).toEqual({ template: 'contradiction', pages: 10, share: 1 })
  })

  it('samples the requested number of page pairs for five-gram overlap, reproducibly', () => {
    const a = computeMetrics(pages, { pairs: 2000, seed: 7 })
    const b = computeMetrics(pages, { pairs: 2000, seed: 7 })
    expect(a.fiveGramOverlap?.pairsSampled).toBe(2000)
    expect(a.fiveGramOverlap).toEqual(b.fiveGramOverlap)
    expect(a.fiveGramOverlap?.meanJaccard).toBeGreaterThanOrEqual(0)
  })

  it('measures a real five-gram overlap when two pages share a run of words', () => {
    const shared = 'How long did trials of Betaine run before an effect on HbA1c?'
    const twin = 'How long did trials of Carnosine run before an effect on HbA1c?'
    expect(fiveGrams(shared).length).toBeGreaterThan(0)
    const metrics = computeMetrics(
      [
        {
          key: 'a',
          questions: [
            {
              id: 't',
              text: shared,
              badge: 'Q1',
              block: 'time-to-signal',
              template: 'time-to-signal',
              values: {},
              sources: [],
            },
          ],
        },
        {
          key: 'b',
          questions: [
            {
              id: 't',
              text: twin,
              badge: 'Q1',
              block: 'time-to-signal',
              template: 'time-to-signal',
              values: {},
              sources: [],
            },
          ],
        },
      ],
      { pairs: 20 },
    )
    expect(metrics.fiveGramOverlap?.pairsSharingAnyFiveGram).toBe(20)
    expect(metrics.fiveGramOverlap?.meanJaccard).toBeGreaterThan(0)
    expect(metrics.fiveGramOverlap?.meanJaccard).toBeLessThan(1)
  })
})

/**
 * The CLINICAL additions of 2026-09-04 (docs/specs/question-derivation.md, "CLINICAL and
 * DEVELOPMENT additions") and the removal of the evidence-age block in the same amendment.
 */
describe('CLINICAL indication, register and trial-history templates', () => {
  const INDICATION = field({
    statement: 'indicated for chronic asthma',
    labelSection: 'indications_and_usage',
  })
  const REGISTERS = field({
    US: { status: 'approved' },
    EU: { status: 'unknown' },
    CA: { status: 'unknown' },
  })
  const HISTORY = field({
    registeredStudies: 18,
    byPhase: { PHASE3: 1, PHASE2: 2 },
    studiesWithPostedResults: 6,
  })

  const clinical = (fields: PageInput['fields']): PageInput =>
    page({
      key: 'example-clinical',
      displayName: 'Theophylline',
      model: 'CLINICAL',
      tier: 2,
      fields,
    })

  it('leaves the three templates to CLINICAL pages', () => {
    const longevity = page({
      fields: { indication: INDICATION, regulatoryStatus: REGISTERS, trialHistory: HISTORY },
    })
    const templates = deriveQuestions(longevity).map((q) => q.template)
    expect(templates).not.toContain('indication')
    expect(templates).not.toContain('regulatory-only')
    expect(templates).not.toContain('trial-history')
  })

  it('asks the register question only where the page records no label indication', () => {
    expect(
      deriveQuestions(clinical({ regulatoryStatus: REGISTERS })).map((q) => q.template),
    ).toContain('regulatory-only')
    expect(
      deriveQuestions(clinical({ regulatoryStatus: REGISTERS, indication: INDICATION })).map(
        (q) => q.template,
      ),
    ).not.toContain('regulatory-only')
  })

  it('does not ask where a compound is approved when every register records unknown', () => {
    const allUnknown = field({ US: { status: 'unknown' }, EU: { status: 'unknown' } })
    expect(
      deriveQuestions(clinical({ regulatoryStatus: allUnknown })).map((q) => q.template),
    ).not.toContain('regulatory-only')
  })

  it('withholds the trial-history question where the human-data block already fires', () => {
    const withCeiling = clinical({
      trialHistory: HISTORY,
      humanEvidenceCeiling: field({ largestN: 245, longestDurationDays: 365 }),
    })
    const templates = deriveQuestions(withCeiling).map((q) => q.template)
    expect(templates).toContain('human-data')
    expect(templates).not.toContain('trial-history')
  })

  it('asks nothing about phases when the registry recorded no study', () => {
    const none = clinical({ trialHistory: field({ registeredStudies: 0, byPhase: {} }) })
    expect(deriveQuestions(none).map((q) => q.template)).not.toContain('trial-history')
  })

  it('carries the singular where exactly one study is registered', () => {
    const one = clinical({ trialHistory: field({ registeredStudies: 1, byPhase: { PHASE1: 1 } }) })
    expect(textFor('trial-history', one)).toBe(
      '1 registered trial of Theophylline — at which phase?',
    )
  })
})

describe('evidence age is a value, not a block', () => {
  it('derives no question from seed 15', () => {
    expect(
      deriveQuestions(page({ seeds: { seed15: { fires: true, values: { year: 2011 } } } })),
    ).toEqual([])
  })

  it('no longer registers the evidence-age template or block', () => {
    expect([...TEMPLATE_IDS]).not.toContain('evidence-age')
    expect([...BLOCK_ORDER]).not.toContain('evidence-age')
  })
})

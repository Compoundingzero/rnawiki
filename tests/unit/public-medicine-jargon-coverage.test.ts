import { describe, expect, it } from 'vitest'

import { annotateMedicineText, medicineTextContextMatches } from '@/lib/annotated-medicine-text'
import { detectPublicMedicineContextItems } from '@/lib/public-medicine-context'

function explainedParts(text: string) {
  const contexts = detectPublicMedicineContextItems([text])
  return annotateMedicineText(text, medicineTextContextMatches(text, contexts)).filter(
    (part) => typeof part !== 'string',
  )
}

describe('general public medicine jargon coverage', () => {
  const examples: ReadonlyArray<readonly [text: string, key: string, phrase: string]> = [
    ['Phase 1 study', 'study-phase-1', 'Phase 1 study'],
    ['Phase II trial', 'study-phase-2', 'Phase II trial'],
    ['Phase 3 testing', 'study-phase-3', 'Phase 3'],
    ['Phase IV programme', 'study-phase-4', 'Phase IV'],
    ['People were randomised.', 'study-randomisation', 'randomised'],
    ['People were randomized.', 'study-randomisation', 'randomized'],
    ['Randomization used a computer.', 'study-randomisation', 'Randomization'],
    ['People were randomly assigned.', 'study-randomisation', 'randomly assigned'],
    ['The double-blind trial reported a result.', 'study-blinding', 'double-blind'],
    ['A double-masked study reported a result.', 'study-blinding', 'double-masked'],
    ['Outcome assessment was blinded.', 'study-blinding', 'blinded'],
    ['This was an open-label study.', 'study-open-label', 'open-label study'],
    ['This was a single-arm trial.', 'study-single-arm', 'single-arm'],
    ['A crossover study compared both treatments.', 'study-crossover', 'crossover study'],
    ['The non-inferiority trial met its margin.', 'study-non-inferiority', 'non-inferiority'],
    ['A meta-analysis combined the studies.', 'evidence-meta-analysis', 'meta-analysis'],
    ['A systematic review found six trials.', 'evidence-systematic-review', 'systematic review'],
    ['A Cochrane review found six trials.', 'evidence-cochrane-review', 'Cochrane review'],
    ['A pooled analysis combined two studies.', 'evidence-pooled-analysis', 'pooled analysis'],
    ['The finding was replicated.', 'evidence-replication', 'replicated'],
    ['The trial stopped for futility.', 'study-futility', 'stopped for futility'],
    [
      'The pivotal clinical trial supported the filing.',
      'study-major-decision',
      'pivotal clinical trial',
    ],
    ['A confirmatory study was required.', 'study-confirmatory', 'confirmatory study'],
    ['The odds ratio was 0.8.', 'statistics-odds-ratio', 'odds ratio'],
    ['The risk ratio was 0.8.', 'statistics-relative-risk', 'risk ratio'],
    ['The result was p=0.04.', 'p-value', 'p=0.04'],
    ['The number needed to treat was 12.', 'statistics-number-needed', 'number needed to treat'],
    ['The number needed to harm was 80.', 'statistics-number-needed', 'number needed to harm'],
    ['Median follow-up was 19 months.', 'statistics-median', 'Median'],
    ['A pharmacokinetic booster changed exposure.', 'pharmacokinetics', 'pharmacokinetic'],
    ['It is contraindicated in pregnancy.', 'contraindication', 'contraindicated'],
    ['The result was a surrogate endpoint.', 'outcome-surrogate', 'surrogate endpoint'],
    ['Researchers measured biomarkers.', 'outcome-biomarker', 'biomarkers'],
    ['It acts at a receptor.', 'mechanism-receptor', 'receptor'],
    ['It is an agonist.', 'mechanism-agonist', 'agonist'],
    ['It is an antagonist.', 'mechanism-antagonist', 'antagonist'],
    ['The medicine inhibits the target.', 'mechanism-inhibitor', 'inhibits'],
    ['An enzyme runs the reaction.', 'mechanism-enzyme', 'enzyme'],
    ['The treatment is an antibody.', 'mechanism-antibody', 'antibody'],
    ['The treatment is a prodrug.', 'mechanism-prodrug', 'prodrug'],
    ['The body made a metabolite.', 'mechanism-metabolite', 'metabolite'],
    ['It blocks a potassium channel.', 'mechanism-potassium-channel', 'potassium channel'],
    ['It blocks a sodium channel.', 'mechanism-sodium-channel', 'sodium channel'],
    ['The label carries a boxed warning.', 'safety-boxed-warning', 'boxed warning'],
    ['The FDA label records the risk.', 'regulatory-fda-label', 'FDA label'],
    ['Mortality was unchanged.', 'outcome-mortality', 'Mortality'],
    [
      'A myocardial infarction is recorded.',
      'medical-myocardial-infarction',
      'myocardial infarction',
    ],
    ['The cardiovascular result was recorded.', 'medical-cardiovascular', 'cardiovascular'],
    ['HbA1c fell during the study.', 'measurement-hba1c', 'HbA1c'],
    ['A biopsy measured the tissue.', 'measurement-biopsy', 'biopsy'],
    ['The response was 30 per cent.', 'percentage', '30 per cent'],
  ]

  it.each(examples)('detects and binds %s', (text, key, phrase) => {
    const contexts = detectPublicMedicineContextItems([text])
    const matches = medicineTextContextMatches(text, contexts)
    const explained = annotateMedicineText(text, matches).filter((part) => typeof part !== 'string')

    expect(contexts.map((context) => context.key)).toContain(key)
    expect(matches.map(({ context }) => context.key)).toContain(key)
    expect(explained).toContainEqual(
      expect.objectContaining({
        text: phrase,
        context: expect.objectContaining({ key }),
      }),
    )
  })

  it('uses one familiar compound explanation instead of adjacent generic definitions', () => {
    const cases = [
      ['a receptor agonist', 'mechanism-receptor-agonist', 'receptor agonist'],
      ['a receptor antagonist', 'mechanism-receptor-antagonist', 'receptor antagonist'],
      ['an enzyme inhibitor', 'mechanism-enzyme-inhibitor', 'enzyme inhibitor'],
      ['a monoclonal antibody', 'mechanism-monoclonal-antibody', 'monoclonal antibody'],
      ['an active metabolite', 'mechanism-active-metabolite', 'active metabolite'],
      ['all-cause mortality', 'outcome-all-cause-mortality', 'all-cause mortality'],
      ['a muscle biopsy', 'measurement-muscle-biopsy', 'muscle biopsy'],
    ] as const

    for (const [text, key, phrase] of cases) {
      const contexts = detectPublicMedicineContextItems([text])
      const explained = explainedParts(text)

      expect(explained).toEqual([
        expect.objectContaining({
          text: phrase,
          context: expect.objectContaining({ key }),
        }),
      ])
      expect(contexts.map((context) => context.key)).toEqual([key])
      expect(explained[0]?.context.definition).toMatch(
        /not|depend|unwanted|clinical|different|fair|sampled/iu,
      )
    }
  })

  it('does not guess from similar everyday words or partial scientific words', () => {
    const text = [
      'The report lists Phase 3 without naming a study.',
      'The masked face appeared in a photograph.',
      'A road has a median strip.',
      'The meta-analysis software folder was renamed.',
      'The receptorium label is not a receptor.',
      'The inhibitionist and antibodylike strings are not medical terms.',
    ].join(' ')
    const keys = detectPublicMedicineContextItems([text]).map((context) => context.key)

    expect(keys).not.toEqual(
      expect.arrayContaining([
        'study-phase-3',
        'study-blinding',
        'statistics-median',
        'mechanism-receptor',
        'mechanism-inhibitor',
        'mechanism-antibody',
      ]),
    )
  })
})

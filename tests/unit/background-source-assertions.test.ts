import { describe, expect, it } from 'vitest'

import {
  canonicalBackgroundSourceIdentifier,
  canonicalBackgroundSourceKey,
  collectBackgroundSourceAssertionBindings,
  evaluateBackgroundSourceAssertion,
  extractTextFromJsonStrings,
  questionIntentForBackgroundPath,
  type BackgroundSourceAssertionBinding,
} from '@/lib/background/source-assertions'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'

function source(
  identifier: string,
  excerpt = `Source ${identifier} states 10 mg.`,
  overrides: Partial<BackgroundSource> = {},
): BackgroundSource {
  return {
    kind: 'FDA_LABEL',
    identifier,
    label: `Label ${identifier}`,
    retrievedAt: '2026-08-01',
    excerpt,
    ...overrides,
  }
}

function background(modules: Record<string, unknown>): MedicineRecordedBackground {
  return {
    version: 'medicine-background/v1',
    authoredAt: '2026-08-02',
    ...modules,
  } as MedicineRecordedBackground
}

function oneBinding(
  envelope: MedicineRecordedBackground,
  slug = 'example-medicine',
): BackgroundSourceAssertionBinding {
  const bindings = collectBackgroundSourceAssertionBindings(slug, envelope)
  expect(bindings).toHaveLength(1)
  return bindings[0]!
}

describe('recorded-background source assertion bindings', () => {
  it('finds excerpt-bearing sources in modules the old hand-written verifier omitted', () => {
    const envelope = background({
      mechanism: {
        statements: [{ textAsRecorded: 'Mechanism statement.', source: source('mechanism') }],
      },
      safety: {
        boxedWarning: { textAsRecorded: 'Boxed warning.', source: source('boxed') },
        contraindications: [
          { textAsRecorded: 'Contraindication.', source: source('contraindication') },
        ],
      },
      interactionSignals: [
        {
          counterpartyAsRecorded: 'CYP3A4',
          kind: 'ENZYME',
          source: source('interaction'),
        },
      ],
      populationStatements: [
        {
          population: 'PEDIATRIC',
          state: 'STATEMENT_ONLY',
          textAsRecorded: 'Paediatric statement.',
          source: source('population'),
        },
      ],
      commonAdverseReactions: {
        thresholdAsRecorded: 'at least 10%',
        eventsAsRecorded: ['headache'],
        source: source('adverse'),
      },
      recordedUses: {
        statements: [{ textAsRecorded: 'Recorded use.', source: source('use') }],
      },
      sourceConsensus: {
        documentsExamined: 2,
        fields: [
          {
            field: 'halfLife',
            sourceCount: 2,
            agreementRate: 1,
            numericallyDisjoint: false,
            readings: [
              {
                display: '10 hours',
                numeric: 10,
                unit: 'hours',
                sourceCount: 2,
                sources: [source('consensus-a'), source('consensus-b')],
              },
            ],
          },
        ],
      },
      composition: {
        declaredIngredientCount: 1,
        ingredientsWithoutSubstanceData: 0,
        ingredients: [
          {
            nameAsRecorded: 'Example ingredient',
            substanceKey: 'example-ingredient',
            substanceDataState: 'RECORDED',
            supplementMarket: {
              labelCount: 1,
              categoriesAsRecorded: ['Other'],
              claimTypesAsRecorded: [],
              exampleBrands: [],
              sampleLabelIds: [],
              source: source('ingredient-market'),
            },
            labelPresence: {
              labelCount: 1,
              singleSubstanceLabelCount: 1,
              productTypesAsRecorded: ['HUMAN PRESCRIPTION DRUG'],
              routesAsRecorded: ['ORAL'],
              sampleLabelIds: ['one'],
              source: source('ingredient-label-presence'),
            },
            recordedUses: {
              statements: [{ textAsRecorded: 'Ingredient use.', source: source('ingredient-use') }],
            },
            mechanism: {
              statements: [
                {
                  textAsRecorded: 'Ingredient mechanism.',
                  source: source('ingredient-mechanism'),
                },
              ],
            },
            pharmacokinetics: {
              routeAsRecorded: 'oral',
              halfLife: {
                display: '10 hours',
                numeric: 10,
                unit: 'hours',
                populationContext: 'adults',
                source: source('ingredient-pk'),
              },
            },
            molecularIdentity: {
              molecularWeight: {
                display: '10 g/mol',
                numeric: 10,
                unit: 'g/mol',
                populationContext: 'compound',
                source: source('ingredient-identity'),
              },
            },
            interactionSignals: [
              {
                counterpartyAsRecorded: 'CYP2D6',
                kind: 'ENZYME',
                source: source('ingredient-interaction'),
              },
            ],
          },
        ],
      },
    })

    const bindings = collectBackgroundSourceAssertionBindings('example-medicine', envelope)

    expect(bindings.map((binding) => binding.sourcePath)).toEqual([
      'commonAdverseReactions.source',
      'composition.ingredients[0].interactionSignals[0].source',
      'composition.ingredients[0].labelPresence.source',
      'composition.ingredients[0].mechanism.statements[0].source',
      'composition.ingredients[0].molecularIdentity.molecularWeight.source',
      'composition.ingredients[0].pharmacokinetics.halfLife.source',
      'composition.ingredients[0].recordedUses.statements[0].source',
      'composition.ingredients[0].supplementMarket.source',
      'interactionSignals[0].source',
      'mechanism.statements[0].source',
      'populationStatements[0].source',
      'recordedUses.statements[0].source',
      'safety.boxedWarning.source',
      'safety.contraindications[0].source',
      'sourceConsensus.fields[0].readings[0].sources[0]',
      'sourceConsensus.fields[0].readings[0].sources[1]',
    ])
    expect(new Set(bindings.map((binding) => binding.bindingId)).size).toBe(bindings.length)

    const byPath = new Map(bindings.map((binding) => [binding.sourcePath, binding]))
    expect(
      byPath.get('composition.ingredients[0].recordedUses.statements[0].source')?.questionIntent,
    ).toBe('purpose')
    expect(
      byPath.get('composition.ingredients[0].mechanism.statements[0].source')?.questionIntent,
    ).toBe('mechanism')
    expect(
      byPath.get('composition.ingredients[0].pharmacokinetics.halfLife.source')?.questionIntent,
    ).toBe('measurement')
    expect(
      byPath.get('composition.ingredients[0].molecularIdentity.molecularWeight.source')
        ?.questionIntent,
    ).toBe('identity')
    expect(byPath.get('composition.ingredients[0].labelPresence.source')?.questionIntent).toBe(
      'regulatory-status',
    )
    expect(byPath.get('safety.boxedWarning.source')?.questionIntent).toBe('harms')
    expect(byPath.get('populationStatements[0].source')?.questionIntent).toBe('applicability')
    expect(byPath.get('sourceConsensus.fields[0].readings[0].sources[0]')?.fieldPath).toBe(
      'sourceConsensus.fields[0].readings[0]',
    )
  })

  it('is stable across object-key order while retaining meaningful array paths', () => {
    const sourceInFirstOrder: BackgroundSource = {
      kind: 'FDA_LABEL',
      identifier: 'ABC-123',
      label: 'Example label',
      locator: 'section 12',
      version: 'label-revision-7',
      effectiveDate: '2026-07-15',
      retrievedAt: '2026-08-01',
      excerpt: 'The value is 10 mg.',
    }
    const sourceInSecondOrder = {
      excerpt: 'The value is 10 mg.',
      retrievedAt: '2026-08-01',
      effectiveDate: '2026-07-15',
      version: 'label-revision-7',
      locator: 'section 12',
      label: 'Example label',
      identifier: 'ABC-123',
      kind: 'FDA_LABEL',
    } as BackgroundSource

    const first = background({
      mechanism: {
        statements: [
          {
            textAsRecorded: 'The value is 10 mg.',
            provenanceTier: 'curated',
            source: sourceInFirstOrder,
          },
        ],
      },
    })
    const second = {
      mechanism: {
        statements: [
          {
            source: sourceInSecondOrder,
            provenanceTier: 'curated',
            textAsRecorded: 'The value is 10 mg.',
          },
        ],
      },
      authoredAt: '2026-08-02',
      version: 'medicine-background/v1',
    } as MedicineRecordedBackground

    const firstBinding = oneBinding(first)
    const secondBinding = oneBinding(second)
    expect(firstBinding).toEqual(secondBinding)
    expect(firstBinding.sourceLabel).toBe('Example label')
    expect(firstBinding.sourceLocator).toBe('section 12')
    expect(firstBinding.version).toBe('label-revision-7')
    expect(firstBinding.effectiveDate).toBe('2026-07-15')
  })

  it('changes the binding when any exact assertion coordinate or content changes', () => {
    const statement = (
      textAsRecorded = 'The value is 10 mg.',
      assertionSource = source('assertion', 'The value is 10 mg.'),
    ) => ({ textAsRecorded, source: assertionSource })
    const mechanism = (value = statement()) => background({ mechanism: { statements: [value] } })

    const bindings = [
      oneBinding(mechanism()),
      oneBinding(mechanism(statement('The value is 11 mg.'))),
      oneBinding(mechanism(statement('The value is 10 mg.', source('assertion', 'Now 11 mg.')))),
      oneBinding(
        mechanism(statement('The value is 10 mg.', source('different', 'The value is 10 mg.'))),
      ),
      oneBinding(
        mechanism(
          statement(
            'The value is 10 mg.',
            source('assertion', 'The value is 10 mg.', { retrievedAt: '2026-08-03' }),
          ),
        ),
      ),
      oneBinding(
        mechanism(
          statement(
            'The value is 10 mg.',
            source('assertion', 'The value is 10 mg.', { label: 'Replacement label' }),
          ),
        ),
      ),
      oneBinding(
        mechanism(
          statement(
            'The value is 10 mg.',
            source('assertion', 'The value is 10 mg.', { locator: 'section 12.3' }),
          ),
        ),
      ),
      oneBinding(
        mechanism(
          statement(
            'The value is 10 mg.',
            source('assertion', 'The value is 10 mg.', { version: 'label-revision-2' }),
          ),
        ),
      ),
      oneBinding(
        mechanism(
          statement(
            'The value is 10 mg.',
            source('assertion', 'The value is 10 mg.', { effectiveDate: '2026-08-04' }),
          ),
        ),
      ),
      oneBinding(background({ recordedUses: { statements: [statement()] } })),
      oneBinding(mechanism(), 'different-slug'),
    ]

    expect(new Set(bindings.map((binding) => binding.bindingId)).size).toBe(bindings.length)
    expect(bindings[0]?.assertionDigest).not.toBe(bindings[1]?.assertionDigest)
    expect(bindings[0]?.sourcePath).not.toBe(bindings[9]?.sourcePath)
  })

  it('canonicalizes source fetch identities without merging unlike kinds', () => {
    expect(canonicalBackgroundSourceIdentifier('FDA_LABEL', ' ABC-DEF ')).toBe('abc-def')
    expect(canonicalBackgroundSourceIdentifier('CLINICALTRIALS', ' nct01234567 ')).toBe(
      'NCT01234567',
    )
    expect(canonicalBackgroundSourceIdentifier('PUBLISHED_ANALYSIS', ' DOI:AbC ')).toBe('DOI:AbC')
    expect(canonicalBackgroundSourceKey(source(' ABC-DEF '))).toBe('FDA_LABEL:abc-def')
    expect(canonicalBackgroundSourceKey({ kind: 'DAILYMED', identifier: ' ABC-DEF ' })).toBe(
      'DAILYMED:abc-def',
    )
  })

  it('maps only explicit reader-question paths and fails closed for unknown ones', () => {
    expect(questionIntentForBackgroundPath('pharmacokinetics.halfLife')).toBe('measurement')
    expect(questionIntentForBackgroundPath('composition.ingredients[4].recordedUses')).toBe(
      'purpose',
    )
    expect(
      questionIntentForBackgroundPath('composition.ingredients[4].interactionSignals[2]'),
    ).toBe('mechanism')
    expect(questionIntentForBackgroundPath('composition.ingredients[4]')).toBe('identity')
    expect(questionIntentForBackgroundPath('costContext[0]')).toBeUndefined()
    expect(questionIntentForBackgroundPath('futureModule.fact.source')).toBeUndefined()
    expect(questionIntentForBackgroundPath('')).toBeUndefined()
  })

  it('does not mutate the source envelope, including its array order', () => {
    const sharedSource = source('shared')
    const envelope = background({
      recordedUses: {
        statements: [
          { textAsRecorded: 'First.', source: sharedSource },
          { textAsRecorded: 'Second.', source: sharedSource },
        ],
      },
    })
    const before = structuredClone(envelope)

    const bindings = collectBackgroundSourceAssertionBindings('example-medicine', envelope)

    expect(envelope).toEqual(before)
    expect(bindings).toHaveLength(2)
    expect(new Set(bindings.map((binding) => binding.sourceKey))).toEqual(
      new Set(['FDA_LABEL:shared']),
    )
    expect(new Set(bindings.map((binding) => binding.bindingId)).size).toBe(2)
  })
})

describe('source assertion evaluation', () => {
  function bindingWithExcerpt(excerpt: string): BackgroundSourceAssertionBinding {
    return oneBinding(
      background({
        mechanism: {
          statements: [{ textAsRecorded: excerpt, source: source('evaluation', excerpt) }],
        },
      }),
    )
  }

  it('distinguishes exact current text, numbers-current reformats, and confirmed drift', () => {
    const binding = bindingWithExcerpt('Peak was 5,800 mg after 12 hours.')
    const fetched = (text: string) => ({
      status: 'SUCCEEDED' as const,
      sourceKey: binding.sourceKey,
      text,
    })

    expect(
      evaluateBackgroundSourceAssertion(
        binding,
        fetched('Prefix • PEAK  was 5,800 mg after 12 hours. Suffix'),
      ),
    ).toBe('CURRENT')
    expect(
      evaluateBackgroundSourceAssertion(
        binding,
        fetched('After 12 hours, a peak of 5800 mg was reported.'),
      ),
    ).toBe('NUMBERS_CURRENT')
    expect(
      evaluateBackgroundSourceAssertion(
        binding,
        fetched('After 12 hours, a peak of 800 mg was reported.'),
      ),
    ).toBe('DRIFTED')
    expect(
      evaluateBackgroundSourceAssertion(bindingWithExcerpt('No numeric statement is present.'), {
        status: 'SUCCEEDED',
        sourceKey: binding.sourceKey,
        text: 'A different non-numeric statement is present.',
      }),
    ).toBe('DRIFTED')
  })

  it('compares printed numbers by value rather than accepting substrings', () => {
    const binding = bindingWithExcerpt('The recorded amount is 5,800 mg.')

    expect(
      evaluateBackgroundSourceAssertion(binding, {
        status: 'SUCCEEDED',
        sourceKey: binding.sourceKey,
        text: 'The source now states an amount of 800 mg.',
      }),
    ).toBe('DRIFTED')
    expect(
      evaluateBackgroundSourceAssertion(binding, {
        status: 'SUCCEEDED',
        sourceKey: binding.sourceKey,
        text: 'The amount, reported elsewhere in the sentence, is 5800 mg.',
      }),
    ).toBe('NUMBERS_CURRENT')
  })

  it('decodes JSON string values instead of comparing escaped response bytes', () => {
    const excerpt = 'The label says "alpha β" on two lines.'
    const binding = bindingWithExcerpt(excerpt)
    const rawJson = JSON.stringify({
      metadata: { identifier: 'evaluation' },
      results: [{ text: 'The label says "alpha β"\non two lines.' }],
    })
    const decodedText = extractTextFromJsonStrings(rawJson)

    expect(rawJson).toContain('\\"alpha β\\"')
    expect(decodedText).toContain('The label says "alpha β"\non two lines.')
    expect(
      evaluateBackgroundSourceAssertion(binding, {
        status: 'SUCCEEDED',
        sourceKey: binding.sourceKey,
        text: decodedText,
      }),
    ).toBe('CURRENT')
    expect(() => extractTextFromJsonStrings('{not valid JSON')).toThrow(/valid JSON/u)
  })

  it('refuses source failures, empty bodies, and responses for another source', () => {
    const binding = bindingWithExcerpt('The current statement.')

    expect(() =>
      evaluateBackgroundSourceAssertion(binding, {
        status: 'UNREACHABLE',
        sourceKey: binding.sourceKey,
      } as never),
    ).toThrow(/successful fetch/u)
    expect(() =>
      evaluateBackgroundSourceAssertion(binding, {
        status: 'SUCCEEDED',
        sourceKey: 'FDA_LABEL:another-source',
        text: 'The current statement.',
      }),
    ).toThrow(/exact bound source/u)
    expect(() =>
      evaluateBackgroundSourceAssertion(binding, {
        status: 'SUCCEEDED',
        sourceKey: binding.sourceKey,
        text: '   ',
      }),
    ).toThrow(/non-empty successful fetch/u)
  })
})

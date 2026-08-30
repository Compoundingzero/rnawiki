import { describe, expect, it } from 'vitest'

import {
  EXTRACTION_MAX_EXCERPT,
  extractBackgroundFromLabel,
  extractCommonAdverseReactions,
  extractInteractionSignals,
  extractMechanism,
  extractMolecularIdentity,
  extractPharmacokinetics,
  extractPopulationStatements,
  extractRecordedUses,
  extractProductVariant,
  extractSafetyStatements,
  type LabelArtifact,
} from '@/lib/background/label-extraction'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import { MOLECULAR_FORMULA_SHAPE } from '@/lib/background/types'

const OPTIONS = { retrievedAt: '2026-08-28', sourceLabel: 'Synthetic medicine label' }

function artifact(overrides: Partial<LabelArtifact> = {}): LabelArtifact {
  return {
    setId: '00afce9b-48c9-487a-a738-e359c005c707',
    effectiveTime: '20260101',
    brandNames: ['SYNTHETIBRAND'],
    genericNames: ['SYNTHETIC MEDICINE'],
    routes: ['ORAL'],
    sections: {},
    ...overrides,
  }
}

/**
 * A label printing "mean ± SD" defeated a pattern that knew only ranges: the capture failed at the
 * mean, the lazy prefix slid past it, and the group matched the standard deviation instead. The
 * excerpt check passed every one of these, because the standard deviation really is in the
 * sentence — number-in-excerpt proves a digit was read, never that it was the right digit.
 *
 * Every sentence below is quoted from the label that produced the wrong value.
 */
describe('label extraction: a dispersion is not the value', () => {
  function halfLife(sentence: string) {
    return extractPharmacokinetics(artifact({ sections: { pharmacokinetics: sentence } }), OPTIONS)
      ?.halfLife
  }

  it('takes the mean, not the standard deviation, from "12 ± 5 hours"', () => {
    // Recorded as 5 hours. Abiraterone's terminal half-life is 12.
    expect(
      halfLife(
        'Elimination In patients with metastatic CRPC, the mean terminal half-life of abiraterone in plasma (mean ± SD) is 12 ± 5 hours.',
      ),
    ).toMatchObject({ display: '12 ± 5 hours', numeric: 12 })
  })

  it.each([
    ['The half-life was 17 ± 4 hours.', '17 ± 4 hours', 17],
    [
      'The mean ± SD half-life for bempedoic acid in humans was 21 ± 11 hours at steady-state.',
      '21 ± 11 hours',
      21,
    ],
    ['The mean half-life of cevimeline is 5+/-1 hours.', '5+/-1 hours', 5],
    ['The mean ± SD terminal half-life of bromelain is 12 ± 4.4 hours.', '12 ± 4.4 hours', 12],
  ])('takes the mean from %j', (sentence, display, numeric) => {
    expect(halfLife(sentence)).toMatchObject({ display, numeric })
  })

  it('takes the mean volume of distribution, not its dispersion', () => {
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: {
          pharmacokinetics:
            'The apparent steady-state volume of distribution (mean ± SD) is 19,669 ± 13,358 L.',
        },
      }),
      OPTIONS,
    )
    // Recorded as 13,358 L, which is the standard deviation.
    expect(pharmacokinetics!.volumeOfDistribution).toMatchObject({ numeric: 19669 })
  })

  it('leaves an ordinary range reading from its low end, as it always did', () => {
    expect(halfLife('The elimination half-life is approximately 3 to 5 hours.')).toMatchObject({
      display: '3 to 5 hours',
      numeric: 3,
    })
  })

  it('keeps the dispersion visible in the displayed value rather than discarding it', () => {
    // The reader sees the spread the label printed; only the axis-bound number is the mean.
    expect(halfLife('The half-life was 17 ± 4 hours.')!.display).toContain('±')
  })
})

describe('label extraction: the excerpt guarantee', () => {
  it('stores the sentence each number was read out of, so the value is always in its excerpt', () => {
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: {
          pharmacokinetics:
            'Absorption. The absolute bioavailability is approximately 42%. Elimination. The mean plasma elimination half-life is approximately 14 hours in healthy adults.',
        },
      }),
      OPTIONS,
    )

    expect(pharmacokinetics!.bioavailability!.display).toBe('42%')
    expect(pharmacokinetics!.bioavailability!.source.excerpt).toContain('42%')
    expect(pharmacokinetics!.halfLife).toMatchObject({ display: '14 hours', numeric: 14 })
    expect(pharmacokinetics!.halfLife!.source.excerpt).toContain('14 hours')
    // Every extracted value declares its tier so it is never mistaken for curated work.
    expect(pharmacokinetics!.halfLife!.provenanceTier).toBe('extracted')
  })

  it('produces envelopes the background engine accepts', () => {
    const { background } = extractBackgroundFromLabel({
      artifact: artifact({
        sections: {
          pharmacokinetics: 'The elimination half-life is approximately 9 hours.',
          indications_and_usage: 'SYNTHETIBRAND is indicated for a synthetic recorded use.',
          dosage_forms_and_strengths: 'Tablets: 10 mg and 20 mg.',
        },
      }),
      options: OPTIONS,
    })

    const report = runBackgroundIntelligence(background!)
    expect(report.findings).toEqual([])
    expect(background!.provenanceTier).toBe('extracted')
  })

  it('keeps a long sentence within the excerpt budget without losing the number', () => {
    const filler = 'Additional pharmacokinetic narrative text. '.repeat(20)
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: {
          pharmacokinetics: `${filler}The mean elimination half-life is approximately 33 hours in adults${' with further descriptive narrative'.repeat(12)}.`,
        },
      }),
      OPTIONS,
    )
    const excerpt = pharmacokinetics!.halfLife!.source.excerpt!
    expect(excerpt.length).toBeLessThanOrEqual(EXTRACTION_MAX_EXCERPT)
    expect(excerpt).toContain('33 hours')
  })
})

describe('label extraction: refusals that protect the dataset', () => {
  it('never records a free fraction as protein binding', () => {
    // Losartan's real label states the complement; capturing it would invert a 98.7%-bound value.
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: {
          pharmacokinetics:
            'Both the medicine and its active metabolite are highly bound to plasma proteins, primarily albumin, with plasma free fractions of 1.3% and 0.2%, respectively.',
        },
      }),
      OPTIONS,
    )
    expect(pharmacokinetics?.proteinBinding).toBeUndefined()
  })

  it('keeps a per-kilogram volume in its own unit rather than reading it as litres', () => {
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: {
          pharmacokinetics:
            'Distribution. The medicine shows a volume of distribution of about 0.14 L/kg.',
        },
      }),
      OPTIONS,
    )
    expect(pharmacokinetics!.volumeOfDistribution).toMatchObject({
      display: '0.14 L/kg',
      unit: 'L/kg',
    })
  })

  it('skips a sentence carrying two candidate quantities rather than guessing', () => {
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: {
          pharmacokinetics:
            'The half-life is 4 hours in adults and the half-life is 9 hours in older adults.',
        },
      }),
      OPTIONS,
    )
    expect(pharmacokinetics).toBeNull()
  })

  it('records a half-life stated in days without inventing an hour figure', () => {
    const pharmacokinetics = extractPharmacokinetics(
      artifact({
        sections: { pharmacokinetics: 'The terminal half-life is approximately 5 days.' },
      }),
      OPTIONS,
    )
    expect(pharmacokinetics!.halfLife!.display).toBe('5 days')
    expect(pharmacokinetics!.halfLife!.numeric).toBeUndefined()
  })

  it('drops an implausible magnitude rather than publishing a mis-matched quantity', () => {
    const { background } = extractBackgroundFromLabel({
      artifact: artifact({
        sections: {
          // 900% cannot be a bioavailability; the pattern matched the wrong quantity.
          pharmacokinetics: 'The reported bioavailability value is 900% under these conditions.',
        },
      }),
      options: OPTIONS,
    })
    expect(background).toBeNull()
  })

  it('returns nothing when the label carries no usable section', () => {
    expect(extractPharmacokinetics(artifact({ sections: {} }), OPTIONS)).toBeNull()
    expect(
      extractBackgroundFromLabel({ artifact: artifact({ sections: {} }), options: OPTIONS })
        .background,
    ).toBeNull()
  })

  it('needs a route before it will record pharmacokinetics at all', () => {
    expect(
      extractPharmacokinetics(
        artifact({
          routes: [],
          sections: { pharmacokinetics: 'The elimination half-life is approximately 9 hours.' },
        }),
        OPTIONS,
      ),
    ).toBeNull()
  })
})

describe('label extraction: product records', () => {
  it('records brand, form, strengths and use with the label effective date', () => {
    const product = extractProductVariant(
      artifact({
        sections: {
          indications_and_usage: 'SYNTHETIBRAND is indicated for a synthetic recorded use.',
          dosage_forms_and_strengths: 'Tablets: 10 mg, 20 mg and 40 mg.',
        },
      }),
      OPTIONS,
    )
    expect(product).toMatchObject({
      brandName: 'SYNTHETIBRAND',
      formAsRecorded: 'oral',
      jurisdiction: 'US_FDA',
      statusAsRecorded: 'FDA label in effect 2026-01-01',
    })
    expect(product!.strengthsAsRecorded).toContain('10 mg')
  })

  it('omits the product record when the label states no strengths or use', () => {
    expect(extractProductVariant(artifact({ sections: {} }), OPTIONS)).toBeNull()
  })
})

describe('label extraction: how the medicine works', () => {
  it('records mechanism sentences without the heading the label glued to the front', () => {
    const mechanism = extractMechanism(
      artifact({
        sections: {
          mechanism_of_action:
            '12.1 Mechanism of Action The synthetic medicine binds the synthetic beta-2 receptor and reduces synthetic signalling in the model.',
        },
      }),
      OPTIONS,
    )
    expect(mechanism!.statements[0]!.textAsRecorded).toMatch(/^The synthetic medicine binds/u)
    // The statement is its own excerpt, so the record can never drift from the quote.
    expect(mechanism!.statements[0]!.source.excerpt).toBe(mechanism!.statements[0]!.textAsRecorded)
  })

  it('reads the mechanism out of clinical pharmacology when there is no dedicated section', () => {
    const mechanism = extractMechanism(
      artifact({
        sections: {
          clinical_pharmacology:
            'Overview of the synthetic product. Mechanism of Action The synthetic medicine inhibits the synthetic enzyme in laboratory conditions.',
        },
      }),
      OPTIONS,
    )
    expect(mechanism!.statements[0]!.textAsRecorded).toContain('inhibits the synthetic enzyme')
  })

  it('names only targets that appear in the recorded text', () => {
    const mechanism = extractMechanism(
      artifact({
        sections: {
          mechanism_of_action:
            'The synthetic medicine potentiates synthetic activity through inhibition of neuronal reuptake of serotonin (5-HT) in the model.',
        },
      }),
      OPTIONS,
    )
    for (const target of mechanism!.namedTargetsAsRecorded ?? []) {
      expect(mechanism!.statements.some((s) => s.textAsRecorded.includes(target))).toBe(true)
    }
  })

  it('returns nothing when the label states no mechanism', () => {
    expect(extractMechanism(artifact({ sections: {} }), OPTIONS)).toBeNull()
  })
})

describe('molecular formula shape', () => {
  it('accepts the forms real sources print, including ions and hydrates', () => {
    for (const formula of [
      'C16H19N3O5S',
      'C4H11N5∙HCl',
      'Ca+2',
      'CHO3-',
      'C28H42Cl2N4O2+2',
      'C6H6CaMgO24P6-8',
    ]) {
      expect(MOLECULAR_FORMULA_SHAPE.test(formula), formula).toBe(true)
    }
  })

  it('still refuses prose that is not a formula', () => {
    for (const notAFormula of ['not a formula', 'see monograph', '']) {
      expect(MOLECULAR_FORMULA_SHAPE.test(notAFormula), notAFormula).toBe(false)
    }
  })
})

describe('label extraction: chemical identity', () => {
  it('reads a formula the label printed with spaces between symbol and count', () => {
    const identity = extractMolecularIdentity(
      artifact({
        sections: {
          description:
            'The chemical name of the synthetic medicine is synthetic, with a molecular formula of C 4 H 11 N 5 ∙HCl and a molecular weight of 165.63.',
        },
      }),
      OPTIONS,
    )
    expect(identity!.molecularFormula!.display).toBe('C4H11N5∙HCl')
    expect(identity!.molecularWeight).toMatchObject({ numeric: 165.63, unit: 'g/mol' })
  })

  it('refuses a weight that cannot belong to a medicine', () => {
    const identity = extractMolecularIdentity(
      artifact({
        sections: { description: 'The stated molecular weight is 4 in this synthetic example.' },
      }),
      OPTIONS,
    )
    expect(identity?.molecularWeight).toBeUndefined()
  })

  it('refuses prose that followed the word formula but is not one', () => {
    const identity = extractMolecularIdentity(
      artifact({
        sections: { description: 'The chemical formula is described in the synthetic monograph.' },
      }),
      OPTIONS,
    )
    expect(identity?.molecularFormula).toBeUndefined()
  })
})

describe('label extraction: interaction counterparties', () => {
  it('records the enzyme with the sentence that named it, and its single stated role', () => {
    const signals = extractInteractionSignals(
      artifact({
        sections: {
          clinical_pharmacology:
            'The synthetic medicine is a substrate of CYP3A4 under the synthetic conditions described.',
        },
      }),
      OPTIONS,
    )
    expect(signals[0]).toMatchObject({
      counterpartyAsRecorded: 'CYP3A4',
      kind: 'ENZYME',
      roleAsRecorded: 'SUBSTRATE',
    })
    expect(signals[0]!.source.excerpt).toContain('CYP3A4')
  })

  it('records no role when one sentence states more than one', () => {
    // Interaction prose routinely names two roles at once; pairing them would be a guess.
    const signals = extractInteractionSignals(
      artifact({
        sections: {
          clinical_pharmacology:
            'Inhibitors of CYP3A4 increase exposure to the synthetic medicine, which is a substrate of that synthetic pathway.',
        },
      }),
      OPTIONS,
    )
    expect(signals[0]!.counterpartyAsRecorded).toBe('CYP3A4')
    expect(signals[0]!.roleAsRecorded).toBeUndefined()
  })

  it('reads no role from the drug-interactions section, which carries regulated advice', () => {
    // 21 CFR 201.57(c)(8) makes Section 7 the place for clinically significant interactions and the
    // instructions for preventing them. A role taken from there would be inferred from advice, and
    // the medicine's own descriptive section is the only place the property is stated outright.
    const signals = extractInteractionSignals(
      artifact({
        sections: {
          drug_interactions:
            'Coadministration with strong CYP3A4 inhibitors increases exposure to the synthetic medicine and requires synthetic caution.',
        },
      }),
      OPTIONS,
    )
    expect(signals).toEqual([])
  })

  it('records which descriptive section named the counterparty', () => {
    const signals = extractInteractionSignals(
      artifact({
        sections: {
          pharmacokinetics:
            'The synthetic medicine is metabolized primarily by CYP2C9 in the synthetic model.',
        },
      }),
      OPTIONS,
    )
    expect(signals[0]).toMatchObject({
      counterpartyAsRecorded: 'CYP2C9',
      labelSection: 'pharmacokinetics',
    })
  })

  it('records transporters alongside enzymes', () => {
    const signals = extractInteractionSignals(
      artifact({
        sections: {
          clinical_pharmacology:
            'The synthetic medicine is a substrate of P-gp in the synthetic model.',
        },
      }),
      OPTIONS,
    )
    expect(signals[0]).toMatchObject({ counterpartyAsRecorded: 'P-GP', kind: 'TRANSPORTER' })
  })
})

describe('label extraction: harms and populations', () => {
  it('keeps a boxed warning and a contraindication verbatim', () => {
    const safety = extractSafetyStatements(
      artifact({
        sections: {
          boxed_warning:
            'BOXED WARNING WARNING: SYNTHETIC RISK The synthetic medicine has caused the synthetic outcome in the model.',
          contraindications:
            '4 CONTRAINDICATIONS The synthetic medicine is contraindicated in the synthetic hypersensitivity population.',
        },
      }),
      OPTIONS,
    )
    // The section label is dropped; the warning's own title survives.
    expect(safety!.boxedWarning!.textAsRecorded).toMatch(/^WARNING: SYNTHETIC RISK/u)
    expect(safety!.contraindications![0]!.textAsRecorded).toMatch(/^The synthetic medicine/u)
  })

  it('refuses an SPL template that was published without being filled in', () => {
    // A real published label carries this instead of a warning. Recording it would put the label
    // author's own to-do note on a page where a reader is looking for the warning.
    const safety = extractSafetyStatements(
      artifact({
        sections: {
          boxed_warning:
            '[Insert boxed warning highlight title] See full prescribing information for complete boxed warning [Insert boxed warning text here].',
        },
      }),
      OPTIONS,
    )
    expect(safety?.boxedWarning).toBeUndefined()
  })

  it('separates a label that settled the question from one that only discussed the group', () => {
    const statements = extractPopulationStatements(
      artifact({
        sections: {
          pediatric_use:
            '8.4 Pediatric Use Safety and effectiveness in synthetic pediatric patients have not been established.',
          geriatric_use:
            '8.5 Geriatric Use Synthetic clinical experience in older adults is described in the synthetic monograph.',
        },
      }),
      OPTIONS,
    )
    expect(statements).toMatchObject([
      { population: 'PEDIATRIC', state: 'NOT_ESTABLISHED' },
      { population: 'GERIATRIC', state: 'STATEMENT_ONLY' },
    ])
    expect(statements[0]!.textAsRecorded).toMatch(/^Safety and effectiveness/u)
  })

  it('reads groups out of a combined populations section when there is no dedicated one', () => {
    // Kidney and liver groups have no standalone label section, so this is their only route in.
    const statements = extractPopulationStatements(
      artifact({
        sections: {
          use_in_specific_populations:
            '8 USE IN SPECIFIC POPULATIONS 8.4 Pediatric Use Safety and effectiveness in synthetic pediatric patients have not been established. 8.6 Hepatic Impairment Synthetic exposure was evaluated in participants with reduced synthetic liver function. 8.7 Renal Impairment No synthetic dedicated study of reduced kidney function was conducted for this synthetic product.',
        },
      }),
      OPTIONS,
    )
    expect(statements.map((entry) => entry.population)).toEqual([
      'PEDIATRIC',
      'HEPATIC_IMPAIRMENT',
      'RENAL_IMPAIRMENT',
    ])
    // Each group keeps the text under its own heading, never the next group's.
    expect(statements[1]!.textAsRecorded).toContain('liver function')
    expect(statements[2]!.textAsRecorded).toContain('kidney function')
  })

  it('prefers a dedicated section over the combined block for the same group', () => {
    const statements = extractPopulationStatements(
      artifact({
        sections: {
          pediatric_use:
            '8.4 Pediatric Use The dedicated synthetic pediatric section was studied in the model.',
          use_in_specific_populations:
            '8.4 Pediatric Use The combined synthetic block says something different entirely here.',
        },
      }),
      OPTIONS,
    )
    expect(statements[0]!.textAsRecorded).toContain('dedicated synthetic pediatric section')
  })

  it('records the most-common reactions with the threshold the label stated', () => {
    const adverse = extractCommonAdverseReactions(
      artifact({
        sections: {
          adverse_reactions:
            'The most common adverse reactions (incidence ≥ 5%) observed in synthetic clinical trials were synthetic headache, synthetic nausea, and synthetic fatigue.',
        },
      }),
      OPTIONS,
    )
    expect(adverse!.thresholdAsRecorded).toContain('5')
    expect(adverse!.eventsAsRecorded).toEqual([
      'synthetic headache',
      'synthetic nausea',
      'synthetic fatigue',
    ])
    for (const event of adverse!.eventsAsRecorded) {
      expect(adverse!.source.excerpt).toContain(event)
    }
  })

  it('records no reaction list when the label states no threshold', () => {
    expect(
      extractCommonAdverseReactions(
        artifact({
          sections: {
            adverse_reactions: 'Synthetic adverse reactions are listed in the table below.',
          },
        }),
        OPTIONS,
      ),
    ).toBeNull()
  })
})

/**
 * Numbers a label prints with a thousands separator, and the pattern that quietly lost them.
 *
 * Every quantity pattern matched `\d+(?:\.\d+)?`, which cannot cross a comma, so it began matching
 * after one: elacestrant's "the estimated apparent volume of distribution is 5,800 L" was recorded
 * as 800 L. The molecular-weight pattern failed the other way — its `\d{1,3}(?:,\d{3})*` branch
 * matched happily with no comma groups at all, taking the first three digits of an unseparated
 * "1355.38" and recording vitamin B12 as weighing 135 g/mol.
 *
 * Both passed the engine, because "800" is a substring of "5800" and "135" of "1355". 107 records
 * in the corpus carried a number an order of magnitude wrong under a faithful excerpt. These tests
 * pin both halves of the fix: the patterns read the whole number, and the engine compares numbers
 * as numbers.
 */
describe('label extraction: numbers printed with separators', () => {
  it('reads the whole volume of distribution, not the part after the comma', () => {
    const pk = extractPharmacokinetics(
      artifact({
        sections: {
          clinical_pharmacology:
            'Distribution The estimated apparent volume of distribution is 5,800 L.',
        },
      }),
      OPTIONS,
    )
    expect(pk?.volumeOfDistribution?.numeric).toBe(5800)
    expect(pk?.volumeOfDistribution?.display).toContain('5,800')
  })

  it('reads a four-digit molecular weight whether or not a separator is printed', () => {
    for (const printed of ['1,355.38', '1355.38']) {
      const identity = extractMolecularIdentity(
        artifact({
          sections: { description: `The molecular weight is ${printed} g/mol.` },
        }),
        OPTIONS,
      )
      expect(identity?.molecularWeight?.numeric, printed).toBe(1355.38)
    }
  })

  it('reads a half-life printed in the thousands', () => {
    const pk = extractPharmacokinetics(
      artifact({
        sections: {
          clinical_pharmacology: 'The terminal elimination half-life is 1,200 hours.',
        },
      }),
      OPTIONS,
    )
    expect(pk?.halfLife?.numeric).toBe(1200)
  })

  it('keeps the hydrate separator a middle dot, so it never reads as a decimal', () => {
    const identity = extractMolecularIdentity(
      artifact({
        sections: {
          description: 'Its chemical formula is C 26 H 29 Cl 2 N 5 O 3 .2H 2 O and it is a powder.',
        },
      }),
      OPTIONS,
    )
    expect(identity?.molecularFormula?.display).toBe('C26H29Cl2N5O3·2H2O')
    expect(MOLECULAR_FORMULA_SHAPE.test(identity!.molecularFormula!.display)).toBe(true)
    expect(
      runBackgroundIntelligence({
        version: 'medicine-background/v1',
        authoredAt: '2026-08-29',
        provenanceTier: 'extracted',
        attribution: { declaredSubstanceCount: 1 },
        molecularIdentity: identity!,
      }).findings,
    ).toEqual([])
  })
})

describe('the engine compares displayed numbers as numbers', () => {
  const withWeight = (display: string, excerpt: string) => ({
    version: 'medicine-background/v1' as const,
    authoredAt: '2026-08-29',
    provenanceTier: 'extracted' as const,
    attribution: { declaredSubstanceCount: 1 },
    molecularIdentity: {
      molecularWeight: {
        display,
        populationContext: 'as stated in the label sentence recorded below',
        source: {
          kind: 'FDA_LABEL' as const,
          identifier: '00afce9b-48c9-487a-a738-e359c005c707',
          label: 'Synthetic medicine label',
          retrievedAt: '2026-08-29',
          excerpt,
        },
        provenanceTier: 'extracted' as const,
      },
    },
  })

  it('refuses a number that only appears inside a longer one', () => {
    const report = runBackgroundIntelligence(withWeight('800', 'The volume is 5,800 L.'))
    expect(report.findings.map((finding) => finding.code)).toContain('I_VALUE_NOT_IN_EXCERPT')
  })

  it('refuses a truncated weight even though its digits open the printed number', () => {
    const report = runBackgroundIntelligence(withWeight('135', 'The molecular weight is 1355.38.'))
    expect(report.findings.map((finding) => finding.code)).toContain('I_VALUE_NOT_IN_EXCERPT')
  })

  it('accepts the same number written with a separator or without one', () => {
    expect(
      runBackgroundIntelligence(withWeight('5800', 'The weight is 5,800 g/mol.')).findings,
    ).toEqual([])
    expect(
      runBackgroundIntelligence(withWeight('5,800', 'The weight is 5800 g/mol.')).findings,
    ).toEqual([])
  })

  it('accepts the same number written with trailing zeros', () => {
    expect(
      runBackgroundIntelligence(withWeight('0.5', 'The value is 0.50 units.')).findings,
    ).toEqual([])
  })
})

/**
 * Short statements, and the line between a use and a direction.
 *
 * A homeopathic or botanical label states a use in a few words: "INDICATIONS Late growth, fracture
 * consolidation." is a whole published indications section, 35 characters once the heading comes
 * off, and a forty-character floor threw every one of them away. Lowering the floor everywhere was
 * worse — "See Boxed WARNING." and "Pregnancy Category C." arrived as statements, and
 * "First, wet your skin." arrived under what the label says the medicine is for, which would make
 * RNAWiki the thing telling a reader to do it.
 */
describe('label extraction: short statements', () => {
  const uses = (text: string) =>
    extractRecordedUses(artifact({ sections: { indications_and_usage: text } }), OPTIONS)

  it('records a terse indication that is the whole section', () => {
    const recorded = uses('INDICATIONS Late growth, fracture consolidation.')
    expect(recorded?.statements[0]?.textAsRecorded).toBe('Late growth, fracture consolidation.')
  })

  it('refuses a direction, however it is phrased', () => {
    for (const direction of [
      'Uses First, wet your skin.',
      'Uses Shake well before use.',
      'Uses After changing diapers.',
      'Uses Directions: FOR ORAL USE.',
      'Uses Use 2-3 times a week',
      'Uses Apply to affected area.',
    ]) {
      expect(uses(direction)?.statements ?? [], direction).toEqual([])
    }
  })

  it('refuses carton text and split headings', () => {
    expect(uses('Uses HAIR GROWTH 60ml/2 fl oz')?.statements ?? []).toEqual([])
    expect(uses('Uses & USAGE IMMUNE SUPPORT')?.statements ?? []).toEqual([])
  })

  it('refuses a fragment that closes a bracket it never opened', () => {
    expect(uses('Uses Morquio A syndrome).')?.statements ?? []).toEqual([])
  })

  it('keeps the short floor away from prose modules', () => {
    // A short sentence inside a prose section is a cross-reference or a category label, never a
    // statement, and these are the ones that appeared the moment the floor came down everywhere.
    const safety = extractSafetyStatements(
      artifact({ sections: { boxed_warning: 'BOXED WARNING See Boxed WARNING.' } }),
      OPTIONS,
    )
    expect(safety).toBeNull()
    const populations = extractPopulationStatements(
      artifact({ sections: { pregnancy: 'Pregnancy Category C.' } }),
      OPTIONS,
    )
    expect(populations).toEqual([])
  })

  it('still records a full sentence that merely opens with a guarded word', () => {
    const recorded = uses(
      'Uses After a single oral dose the preparation relieves occasional joint discomfort in adults.',
    )
    expect(recorded?.statements.length).toBe(1)
  })
})

/**
 * The cap that used to sit here kept twelve counterparties, chosen by sorting the names and taking
 * the first twelve. The discard rule was the alphabet, so the loss was systematic: P-glycoprotein
 * sorts near the end and was deleted preferentially from the medicines whose labels characterised it
 * most fully, and nothing in the record said a truncation had happened.
 */
describe('interaction signals are canonical evidence and are never capped', () => {
  /** Thirteen enzymes in one sentence, plus P-gp in a second — fourteen, past the old cutoff. */
  const MANY_COUNTERPARTIES = [
    'In vitro, the drug is a substrate of CYP1A2, CYP2A6, CYP2B6, CYP2C8, CYP2C9, CYP2C19, CYP2D6,',
    'CYP2E1, CYP3A4, CYP3A5, CYP4A11, CYP2J2, and CYP1B1.',
    'The drug is a substrate of P-gp.',
  ].join(' ')

  function signalsFrom(text: string) {
    return extractInteractionSignals(artifact({ sections: { pharmacokinetics: text } }), OPTIONS)
  }

  it('keeps every counterparty the label names, past the former limit of twelve', () => {
    const signals = signalsFrom(MANY_COUNTERPARTIES)
    expect(signals.length).toBeGreaterThan(12)
  })

  it('keeps P-glycoprotein, which the alphabetical cut removed first', () => {
    const names = signalsFrom(MANY_COUNTERPARTIES).map((signal) => signal.counterpartyAsRecorded)
    expect(names).toContain('P-GP')
    // It sorts after the enzymes, which is exactly why it used to be the one discarded.
    expect(names.indexOf('P-GP')).toBeGreaterThan(11)
  })

  /**
   * Keying identity on the counterparty alone discarded a second sentence about the same enzyme, so
   * a label denying a role kept only whichever statement came first. That silently lost the denials
   * this corpus exists to record.
   */
  it('keeps an assertion and a denial about the same counterparty as two findings', () => {
    const signals = signalsFrom(
      'The drug is a substrate of CYP3A4. The drug does not inhibit CYP3A4.',
    )
    const cyp3a4 = signals.filter((signal) => signal.counterpartyAsRecorded === 'CYP3A4')
    expect(cyp3a4).toHaveLength(2)
    expect(cyp3a4.map((signal) => signal.polarity).sort()).toEqual(['ASSERTED', 'NEGATED'])
  })

  it('still collapses the identical sentence read twice', () => {
    const once = signalsFrom('The drug is a substrate of CYP3A4.')
    const twice = signalsFrom(
      'The drug is a substrate of CYP3A4. The drug is a substrate of CYP3A4.',
    )
    expect(twice).toHaveLength(once.length)
  })

  it('preserves polarity and the exact sentence on every kept signal', () => {
    for (const signal of signalsFrom(MANY_COUNTERPARTIES)) {
      expect(signal.source.excerpt).toContain(signal.counterpartyAsRecorded.replace('P-GP', 'P-gp'))
      expect(signal.provenanceTier).toBe('extracted')
    }
  })

  it('orders deterministically, so a rerun produces the same file', () => {
    const first = signalsFrom(MANY_COUNTERPARTIES)
    const second = signalsFrom(MANY_COUNTERPARTIES)
    expect(JSON.stringify(second)).toBe(JSON.stringify(first))
  })
})

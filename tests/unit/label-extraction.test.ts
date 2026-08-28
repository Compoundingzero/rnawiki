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
  extractProductVariant,
  extractSafetyStatements,
  type LabelArtifact,
} from '@/lib/background/label-extraction'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'

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
          drug_interactions:
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
          drug_interactions:
            'Inhibitors of CYP3A4 increase exposure to the synthetic medicine, which is a substrate of that synthetic pathway.',
        },
      }),
      OPTIONS,
    )
    expect(signals[0]!.counterpartyAsRecorded).toBe('CYP3A4')
    expect(signals[0]!.roleAsRecorded).toBeUndefined()
  })

  it('records transporters alongside enzymes', () => {
    const signals = extractInteractionSignals(
      artifact({
        sections: {
          drug_interactions:
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

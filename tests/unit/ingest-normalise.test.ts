import { describe, expect, it } from 'vitest'

import {
  cleanPublicLabelFields,
  cleanSourceLabelText,
  isOnlyNegatedLabelPhrase,
  isPlaceholderMedicineIdentity,
  isPlaceholderMedicineName,
  isTruncatedLabelPhrase,
} from '@/lib/public-data-integrity'
import {
  baseMoiety,
  extractPatientFriendlyIndication,
  trimToSentence,
} from '@/scripts/ingest/normalise'
import { rejoinParenSplits } from '@/scripts/ingest/openfda'
import type { AggregatedSubstance } from '@/scripts/ingest/openfda'
import { assignUniqueSlugs, shouldIngest, type DrugInsert } from '@/scripts/ingest/build-dossier'

describe('rejoinParenSplits', () => {
  it('rejoins an ingredient name torn at a comma inside brackets', () => {
    expect(rejoinParenSplits(['LIOTRIX (T4', 'T3)'])).toEqual(['LIOTRIX (T4, T3)'])
    expect(rejoinParenSplits(['MENOTROPINS (FSH', 'LH)'])).toEqual(['MENOTROPINS (FSH, LH)'])
  })

  it('rejoins across more than two fragments', () => {
    expect(rejoinParenSplits(['PANCRELIPASE (AMYLASE', 'LIPASE', 'PROTEASE)'])).toEqual([
      'PANCRELIPASE (AMYLASE, LIPASE, PROTEASE)',
    ])
  })

  it('leaves a genuine multi-ingredient product alone', () => {
    expect(rejoinParenSplits(['ASPIRIN', 'CAFFEINE', 'ORPHENADRINE'])).toEqual([
      'ASPIRIN',
      'CAFFEINE',
      'ORPHENADRINE',
    ])
  })

  it('drops a fragment whose brackets never close rather than emitting it truncated', () => {
    expect(rejoinParenSplits(['DANGLING (OPEN'])).toEqual([])
  })

  it('keeps ingredients that follow a rejoined one', () => {
    expect(rejoinParenSplits(['LIOTRIX (T4', 'T3)', 'ASPIRIN'])).toEqual([
      'LIOTRIX (T4, T3)',
      'ASPIRIN',
    ])
  })
})

describe('baseMoiety', () => {
  it('collapses a salt onto the molecule', () => {
    expect(baseMoiety('METFORMIN HYDROCHLORIDE')).toBe('METFORMIN')
    expect(baseMoiety('ATORVASTATIN CALCIUM')).toBe('ATORVASTATIN')
    expect(baseMoiety('AMLODIPINE BESYLATE MONOHYDRATE')).toBe('AMLODIPINE')
  })

  it('collapses the di-, tri- and mono- forms, which need their own entries', () => {
    expect(baseMoiety('NETARSUDIL DIMESYLATE')).toBe('NETARSUDIL')
    expect(baseMoiety('BEROTRALSTAT DIHYDROCHLORIDE')).toBe('BEROTRALSTAT')
    expect(baseMoiety('GUANETHIDINE MONOSULFATE')).toBe('GUANETHIDINE')
  })

  it('corrects the misspelling in the FDA source', () => {
    expect(baseMoiety('AZELASTINE HYDROCHRLORIDE')).toBe('AZELASTINE')
  })

  it('stops before reducing a metal salt to the metal', () => {
    expect(baseMoiety('ALUMINUM SULFATE TETRADECAHYDRATE')).toBe('ALUMINUM SULFATE')
    expect(baseMoiety('CALCIUM ACETATE')).toBe('CALCIUM ACETATE')
    expect(baseMoiety('MAGNESIUM CITRATE')).toBe('MAGNESIUM CITRATE')
    expect(baseMoiety('FERROUS FUMARATE')).toBe('FERROUS FUMARATE')
    expect(baseMoiety('BERYLLIUM SULFATE TETRAHYDRATE')).toBe('BERYLLIUM SULFATE')
    expect(baseMoiety('COBALTOUS SULFATE HEPTAHYDRATE')).toBe('COBALTOUS SULFATE')
  })

  it('still strips a hydrate from a metal salt, which is the same substance', () => {
    expect(baseMoiety('ZINC SULFATE MONOHYDRATE')).toBe('ZINC SULFATE')
  })

  it('keeps a phosphate that is part of the molecule', () => {
    expect(baseMoiety('ADENOSINE DIPHOSPHATE')).toBe('ADENOSINE DIPHOSPHATE')
    expect(baseMoiety('ADENOSINE TRIPHOSPHATE')).toBe('ADENOSINE TRIPHOSPHATE')
    expect(baseMoiety('RIBOFLAVIN PHOSPHATE')).toBe('RIBOFLAVIN PHOSPHATE')
  })

  it('still strips a phosphate that is a counterion', () => {
    expect(baseMoiety('ORITAVANCIN DIPHOSPHATE')).toBe('ORITAVANCIN')
    expect(baseMoiety('DEXAMETHASONE SODIUM PHOSPHATE')).toBe('DEXAMETHASONE')
  })

  it('leaves no trailing punctuation when a suffix is stripped mid-name', () => {
    expect(baseMoiety('SODIUM PHOSPHATE, DIBASIC, HEPTAHYDRATE')).toBe('SODIUM PHOSPHATE, DIBASIC')
  })

  it('reads CAS Greek notation as the letter it stands for', () => {
    expect(baseMoiety('.ALPHA.-LIPOIC ACID')).toBe(baseMoiety('ALPHA-LIPOIC ACID'))
    expect(baseMoiety('.BETA.-CAROTENE')).toBe('BETA-CAROTENE')
  })

  it('leaves nothing behind when a stereo descriptor is stripped', () => {
    expect(baseMoiety('ACONITIC ACID, (E)-')).toBe('ACONITIC ACID')
    expect(baseMoiety('CAMPHOR, (1R)-')).toBe('CAMPHOR')
    expect(baseMoiety('MENTHOL, (-)-')).toBe('MENTHOL')
  })

  it('spaces a comma between words but never between locants', () => {
    expect(baseMoiety('CARBIDOPA,LEVODOPA')).toBe('CARBIDOPA, LEVODOPA')
    expect(baseMoiety('1,2-HEXANEDIOL')).toBe('1,2-HEXANEDIOL')
  })

  it('takes the first ingredient of a combination and drops a parenthesised synonym', () => {
    expect(baseMoiety('ABACAVIR || DOLUTEGRAVIR || LAMIVUDINE')).toBe('ABACAVIR')
    expect(baseMoiety('VITAMIN D (CHOLECALCIFEROL)')).toBe('VITAMIN D')
  })
})

describe('source-label indication integrity', () => {
  it.each([
    {
      medicine: 'tezepelumab',
      label:
        'TEZSPIRE is a thymic stromal lymphopoietin blocker, indicated: • for the add-on maintenance treatment of adult and pediatric patients aged 12 years and older with severe asthma. Limitations of Use: Not for relief of acute bronchospasm or status asthmaticus.',
      expected: 'Severe asthma',
    },
    {
      medicine: 'reslizumab',
      label:
        'CINQAIR is indicated for the add-on maintenance treatment of patients with severe asthma aged 18 years and older with an eosinophilic phenotype [see Clinical Studies ( 14 )]. Limitation of Use: CINQAIR is not indicated for treatment of other eosinophilic conditions. CINQAIR is not indicated for the relief of acute bronchospasm or status asthmaticus.',
      expected: 'Severe asthma aged 18 years and older with an eosinophilic phenotype',
    },
    {
      medicine: 'mepolizumab',
      label:
        'NUCALA is an interleukin-5 antagonist indicated for: • Add-on maintenance treatment of adult and pediatric patients aged 6 years and older with severe asthma and with an eosinophilic phenotype. Limitations of Use: Not for relief of acute bronchospasm or status asthmaticus.',
      expected: 'Severe asthma with an eosinophilic phenotype',
    },
    {
      medicine: 'depemokimab',
      label:
        'EXDENSUR is indicated for the add-on maintenance treatment of severe asthma characterized by an eosinophilic phenotype in adult and pediatric patients aged 12 years and older. Limitations of Use EXDENSUR is not indicated for the relief of acute bronchospasm or status asthmaticus.',
      expected: 'Severe asthma characterized by an eosinophilic phenotype',
    },
    {
      medicine: 'berotralstat',
      label:
        'ORLADEYO is indicated for prophylaxis to prevent attacks of hereditary angioedema (HAE) in adults and pediatric patients 2 years of age and older. Limitations of Use: ORLADEYO should not be used for treatment of acute HAE attacks. The safety and effectiveness of ORLADEYO for the treatment of acute HAE attacks have not been established.',
      expected: 'Attacks of hereditary angioedema',
    },
    {
      medicine: 'deoxycholic acid',
      label:
        'KYBELLA injection is indicated for improvement in the appearance of moderate to severe convexity or fullness associated with submental fat in adults. Limitations of use: The safe and effective use for the treatment of subcutaneous fat outside the submental region has not been established and is not recommended.',
      expected:
        'Improvement in the appearance of moderate to severe convexity or fullness associated with submental fat',
    },
    {
      medicine: 'metreleptin',
      label:
        'MYALEPT is indicated as an adjunct to diet as replacement therapy to treat the complications of leptin deficiency in patients with congenital or acquired generalized lipodystrophy. The safety and effectiveness for the treatment of complications of partial lipodystrophy have not been established.',
      expected: 'The complications of leptin deficiency',
    },
    {
      medicine: 'setmelanotide',
      label:
        'IMCIVREE is indicated to reduce excess body weight and maintain weight reduction long term in adults and pediatric patients aged 4 years and older with acquired hypothalamic obesity. The following conditions would not be expected to be effective.',
      expected: 'Excess body weight and maintain weight reduction long term',
    },
    {
      medicine: 'zolmitriptan',
      label:
        'ZOLMITRIPTAN NASAL SPRAY is indicated for the acute treatment of migraine with or without aura in adults and pediatric patients 12 years of age and older. It is not indicated for prevention, and cluster headache is not recommended.',
      expected: 'The acute treatment of migraine with or without aura',
    },
  ])('extracts the positive use from the real $medicine label structure', ({ label, expected }) => {
    expect(extractPatientFriendlyIndication(label)).toBe(expected)
  })

  it.each([
    'The medicine is not indicated for the treatment of acute bronchospasm.',
    'The medicine is never approved for the treatment of acute bronchospasm.',
    'The medicine should not be used for the treatment of acute bronchospasm.',
    'Safety has not been established for the treatment of acute bronchospasm.',
    'The medicine would not be used for the treatment of acute bronchospasm.',
    'The medicine is contraindicated for the treatment of acute bronchospasm.',
    'Limitations of Use: Not for the relief of acute bronchospasm.',
    'The medicine is not indicated for the management of acute bronchospasm.',
    'Uses: Not for acute bronchospasm.',
  ])('never turns a negated limitation into a positive use: %s', (label) => {
    expect(extractPatientFriendlyIndication(label)).toBe('')
  })

  it('continues to a later positive clause after rejecting a negated match of the same pattern', () => {
    const label =
      'Not indicated for the treatment of acute bronchospasm. It is indicated for the treatment of severe eosinophilic asthma.'
    expect(extractPatientFriendlyIndication(label)).toBe('Severe eosinophilic asthma')
  })

  it('does not reject a phrase that the source states positively as well as in a limitation', () => {
    const label =
      'It is indicated for the treatment of severe asthma. It is not indicated for the treatment of severe asthma outside the studied population.'
    expect(isOnlyNegatedLabelPhrase(label, 'severe asthma')).toBe(false)
    expect(extractPatientFriendlyIndication(label)).toBe('Severe asthma')
  })

  it('omits an overlong clause instead of truncating it through a word', () => {
    const overlong = `It is indicated for the treatment of ${'verylongcondition '.repeat(10)}without a complete short label.`
    expect(extractPatientFriendlyIndication(overlong)).toBe('')
    expect(extractPatientFriendlyIndication(overlong)).not.toMatch(/…$/)
  })

  it('can use a later complete clause when the first one exceeds the public length limit', () => {
    const label = `It is indicated for the treatment of ${'verylongcondition '.repeat(10)}without a complete short label. It is indicated for the treatment of severe asthma.`
    expect(extractPatientFriendlyIndication(label)).toBe('Severe asthma')
  })

  it('still truncates general label excerpts at a word or sentence boundary', () => {
    expect(trimToSentence('A complete sentence. A second sentence is too long.', 25)).toBe(
      'A complete sentence.',
    )
    expect(trimToSentence('one two threeFour', 10)).toBe('one two…')
  })

  it('removes only the known non-medical editorial aside and preserves the label wording', () => {
    const source =
      'Probentra™ is indicated as a probiotic dietary supplement to support digestive health. (Notice: no disease treatment claims — this keeps you clean in Rx dietary supplement lane.) It is dispensed by prescription.'
    expect(cleanSourceLabelText(source)).toBe(
      'Probentra™ is indicated as a probiotic dietary supplement to support digestive health. It is dispensed by prescription.',
    )
  })

  it('suppresses a stored short indication that occurs only in a negated label clause', () => {
    expect(
      cleanPublicLabelFields({
        indication:
          'The medicine is indicated for maintenance treatment of severe asthma. It is not indicated for the relief of acute bronchospasm.',
        patientFriendlyIndication: 'acute bronchospasm',
      }),
    ).toEqual({
      indication:
        'The medicine is indicated for maintenance treatment of severe asthma. It is not indicated for the relief of acute bronchospasm.',
      patientFriendlyIndication: '',
    })
  })

  it('repairs the known legacy mepolizumab false positive even when its stored label was truncated before the limitation', () => {
    const indication =
      'NUCALA is indicated for: • Add-on maintenance treatment of adult and pediatric patients aged 6 years and older with severe asthma and with an eosinophilic phenotype.'
    const cleaned = cleanPublicLabelFields({
      medicineSlug: 'mepolizumab',
      indication,
      patientFriendlyIndication:
        'Acute bronchospasm or status asthmaticus [see Warnings and Precautions ( 5',
    })
    expect(cleaned.patientFriendlyIndication).toBe('')
    expect(extractPatientFriendlyIndication(cleaned.indication)).toBe(
      'Severe asthma with an eosinophilic phenotype',
    )
  })

  it.each([
    [
      'berotralstat',
      'ORLADEYO should not be used for treatment of acute HAE attacks. The safety and effectiveness for the treatment of acute HAE attacks have not been established.',
      'Acute HAE attacks have not been established',
    ],
    [
      'deoxycholic-acid',
      'The safe and effective use for the treatment of subcutaneous fat outside the submental region has not been established and is not recommended.',
      'Subcutaneous fat outside the submental region has not been established and is not recommended',
    ],
    [
      'metreleptin',
      'The safety and effectiveness for the treatment of complications of partial lipodystrophy have not been established.',
      'Complications of partial lipodystrophy have not been established',
    ],
  ])(
    'suppresses a limitation whose negation is inside the extracted phrase for %s',
    (medicineSlug, indication, patientFriendlyIndication) => {
      expect(
        cleanPublicLabelFields({ medicineSlug, indication, patientFriendlyIndication })
          .patientFriendlyIndication,
      ).toBe('')
    },
  )

  it.each([
    ['setmelanotide', 'The following conditions as IMCIVREE would not be expected to be effective'],
    ['zolmitriptan', 'Cluster headache (1) Not recommended'],
  ])(
    'suppresses the audited legacy %s limitation when the stored source excerpt ended earlier',
    (medicineSlug, patientFriendlyIndication) => {
      expect(
        cleanPublicLabelFields({
          medicineSlug,
          indication: 'A stored source excerpt that ended before the limitation.',
          patientFriendlyIndication,
        }).patientFriendlyIndication,
      ).toBe('')
    },
  )

  it('detects a verbatim mid-word cut but not a complete phrase or a paraphrase', () => {
    const label = 'Treatment of disease in adults who have not responded adequately to therapy.'
    expect(
      isTruncatedLabelPhrase(
        label,
        'Treatment of disease in adults who have not responded adequatel',
      ),
    ).toBe(true)
    expect(isTruncatedLabelPhrase(label, 'Treatment of disease')).toBe(false)
    expect(isTruncatedLabelPhrase(label, 'Adults with disease')).toBe(false)
    expect(
      cleanPublicLabelFields({
        indication: label,
        patientFriendlyIndication:
          'Treatment of disease in adults who have not responded adequatel',
      }).patientFriendlyIndication,
    ).toBe('')
  })
})

describe('placeholder medicine identities', () => {
  const substance = (moiety: string): AggregatedSubstance => ({
    moiety,
    rawNames: new Map([[moiety, 1]]),
    brands: [],
    sponsors: [],
    routes: new Map(),
    dosageForms: new Map(),
    firstApprovalYear: null,
    applicationKinds: {},
    marketingStatuses: {},
    marketingCategories: {},
    unii: new Set(),
    productCount: 2,
    ndcProductCodes: new Set(),
    sources: new Set(['test source']),
  })

  it.each(['TBD', 'tbc', 'TODO', 'Unknown', 'unnamed', 'N/A', 'NA', 'none', 'not available'])(
    'rejects the placeholder name %s before dossier construction',
    (moiety) => {
      expect(isPlaceholderMedicineName(moiety)).toBe(true)
      expect(shouldIngest({ substance: substance(moiety) })).toEqual({
        keep: false,
        reason: 'placeholder name, not a substance identity',
      })
    },
  )

  it('keeps real three-letter identities and rejects placeholder slugs at the public boundary', () => {
    expect(shouldIngest({ substance: substance('RNA') }).keep).toBe(true)
    expect(isPlaceholderMedicineIdentity({ slug: 'tbd', name: 'Some name' })).toBe(true)
    expect(isPlaceholderMedicineIdentity({ slug: 'real-medicine', name: 'Tbd' })).toBe(true)
    expect(isPlaceholderMedicineIdentity({ slug: 'rna', name: 'RNA' })).toBe(false)
  })
})

describe('assignUniqueSlugs', () => {
  const row = (over: Partial<DrugInsert>): DrugInsert =>
    ({
      id: '',
      slug: 'vitamin-c',
      name: 'Vitamin C',
      tradeName: null,
      sponsor: '',
      targetGene: '',
      targetProtein: '',
      modality: 'Nutraceutical / Botanical',
      approvalStatus: 'Non-FDA / Dietary Supplement',
      approvalYear: null,
      indication: '',
      patientFriendlyIndication: '',
      oneSentenceVerdict: '',
      laymanHowItWorks: '',
      dossierDepth: 'stub',
      molecularSchema: null,
      sourceProvenance: [],
      productCount: 0,
      moiety: 'VITAMIN C',
      saltForms: [],
      brandNames: [],
      classificationRules: { modality: '', approval: '' },
      ...over,
    }) as DrugInsert

  it('merges two records that carry the same display name', () => {
    const rich = row({
      indication: 'Vitamin C deficiency',
      sourceProvenance: ['openFDA Drugs@FDA', 'NIH DSLD'],
      approvalStatus: 'FDA Approved',
      productCount: 40,
    })
    const thin = row({ sourceProvenance: ['NIH DSLD'], brandNames: ['Ester-C'] })

    const out = assignUniqueSlugs([rich, thin])

    expect(out).toHaveLength(1)
    expect(out[0]?.slug).toBe('vitamin-c')
    expect(out[0]?.indication).toBe('Vitamin C deficiency')
    // Nothing the loser alone knew is lost.
    expect(out[0]?.brandNames).toContain('Ester-C')
    expect(out[0]?.sourceProvenance).toEqual(['openFDA Drugs@FDA', 'NIH DSLD'])
    expect(out[0]?.productCount).toBe(40)
  })

  it('keeps the richer record whichever order they arrive in', () => {
    const thin = row({ sourceProvenance: ['NIH DSLD'] })
    const rich = row({ indication: 'Vitamin C deficiency', sourceProvenance: ['openFDA', 'DSLD'] })

    const out = assignUniqueSlugs([thin, rich])

    expect(out).toHaveLength(1)
    expect(out[0]?.indication).toBe('Vitamin C deficiency')
    expect(out[0]?.slug).toBe('vitamin-c')
  })

  it('an approval on either record survives the merge', () => {
    const supplement = row({ sourceProvenance: ['a', 'b', 'c'], indication: 'x' })
    const approved = row({ approvalStatus: 'FDA Approved' })

    const out = assignUniqueSlugs([supplement, approved])

    expect(out[0]?.approvalStatus).toBe('FDA Approved')
  })

  it('merges two spellings of one name, keeping the record that knows more', () => {
    // The case the original comment called "two different substances". It is one substance, and
    // suffixing it produced two pages titled Vitamin B12.
    const spaced = row({ name: 'Vitamin B 12', slug: 'vitamin-b-12' })
    const hyphenated = row({
      name: 'Vitamin B-12',
      slug: 'vitamin-b-12',
      indication: 'B12 deficiency',
      sourceProvenance: ['openFDA'],
    })

    const out = assignUniqueSlugs([spaced, hyphenated])

    expect(out).toHaveLength(1)
    expect(out[0]?.slug).toBe('vitamin-b-12')
    expect(out[0]?.name).toBe('Vitamin B-12')
  })

  it('leaves genuinely distinct slugs alone', () => {
    const a = row({ name: 'Creatine Monohydrate', slug: 'creatine-monohydrate' })
    const b = row({ name: 'Creatine Gluconate', slug: 'creatine-gluconate' })

    const out = assignUniqueSlugs([a, b])

    expect(out).toHaveLength(2)
    expect(out.map((r) => r.slug)).toEqual(['creatine-monohydrate', 'creatine-gluconate'])
  })
})

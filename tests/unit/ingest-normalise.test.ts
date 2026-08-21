import { describe, expect, it } from 'vitest'

import { baseMoiety } from '@/scripts/ingest/normalise'
import { rejoinParenSplits } from '@/scripts/ingest/openfda'
import { assignUniqueSlugs, type DrugInsert } from '@/scripts/ingest/build-dossier'

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

  it('takes the first ingredient of a combination and drops a parenthesised synonym', () => {
    expect(baseMoiety('ABACAVIR || DOLUTEGRAVIR || LAMIVUDINE')).toBe('ABACAVIR')
    expect(baseMoiety('VITAMIN D (CHOLECALCIFEROL)')).toBe('VITAMIN D')
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

  it('still suffixes records that slugify alike but are named differently', () => {
    const a = row({ name: 'Vitamin B-12', slug: 'vitamin-b-12' })
    const b = row({ name: 'Vitamin B 12', slug: 'vitamin-b-12' })

    const out = assignUniqueSlugs([a, b])

    expect(out).toHaveLength(2)
    expect(out.map((r) => r.slug)).toEqual(['vitamin-b-12', 'vitamin-b-12-2'])
  })
})

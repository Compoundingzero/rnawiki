import { describe, expect, it } from 'vitest'

import { describeEvidence } from '@/scripts/enrich/botanical-context'
import { looksBinomial, splitPlantName } from '@/scripts/enrich/botanicals'
import { biologicStem, isKnownBiologicStem } from '@/scripts/enrich/suffixed-biologics'
import { describeRecord } from '@/scripts/enrich/substance-context'
import { cleanLabelProse } from '@/scripts/enrich/provenance'

describe('splitPlantName', () => {
  it('separates the part from the binomial and fixes the case both APIs require', () => {
    expect(splitPlantName('Chenopodium Album Whole')).toEqual({
      binomial: 'Chenopodium album',
      part: 'whole',
    })
    expect(splitPlantName('Acacia Longifolia Pollen')).toEqual({
      binomial: 'Acacia longifolia',
      part: 'pollen',
    })
  })

  it('leaves a name with no part alone', () => {
    expect(splitPlantName('Paecilomyces Variotii')).toEqual({
      binomial: 'Paecilomyces variotii',
      part: '',
    })
  })
})

describe('looksBinomial', () => {
  it('accepts a scientific name whatever the record was classified as', () => {
    expect(looksBinomial('Melopsittacus undulatus')).toBe(true)
    expect(looksBinomial('Betula alba')).toBe(true)
  })

  it('rejects the chemical names that share its shape', () => {
    expect(looksBinomial('Netarsudil dimesylate')).toBe(true) // shape alone cannot tell; GBIF does
    expect(looksBinomial('1,2-Hexanediol')).toBe(false)
    expect(looksBinomial('Aspirin')).toBe(false)
  })
})

describe('biologicStem', () => {
  it('reads the stem of a single-word biological name', () => {
    expect(biologicStem('Denosumab-Kyqq')).toBe('denosumab')
  })

  it('reads a two-word stem, which the FDA scheme is mostly applied to', () => {
    expect(biologicStem('Insulin Aspart-Szjj')).toBe('insulin aspart')
    expect(biologicStem('Pegunigalsidase Alfa-Iwxj')).toBe('pegunigalsidase alfa')
    expect(biologicStem('Denileukin Diftitox-Cxdl')).toBe('denileukin diftitox')
  })

  it('ignores names that merely contain a hyphen', () => {
    expect(biologicStem('Alpha.-Hexylcinnamaldehyde')).toBeNull()
    expect(biologicStem('Acetyl Tetrapeptide-5')).toBeNull()
  })

  it('knows the INN stems, and does not need to for a molecule already on the site', () => {
    expect(isKnownBiologicStem('denosumab')).toBe(true)
    expect(isKnownBiologicStem('pegunigalsidase alfa')).toBe(true)
    expect(isKnownBiologicStem('insulin aspart')).toBe(false)
  })
})

describe('describeRecord', () => {
  const base = {
    routes: ['ORAL'],
    dosageForms: ['TABLET'],
    marketingStatuses: ['Discontinued'],
    productCount: 3,
    firstApprovalYear: 1961,
  }

  it('writes route codes as English', () => {
    expect(describeRecord('Acetophenazine', base)).toContain('given by mouth, as tablets')
  })

  it('matches the article to the product count', () => {
    const single = describeRecord('Alatrofloxacin', {
      ...base,
      routes: ['INTRAVENOUS'],
      dosageForms: ['INJECTION, SOLUTION'],
      productCount: 1,
    })
    expect(single).toContain('in 1 product, given into a vein, as an injection')
  })

  it('claims nothing is marketed only when every record says discontinued', () => {
    expect(describeRecord('Acetophenazine', base)).toContain('marked discontinued')
    expect(
      describeRecord('Aluminum Zirconium Tetrachlorohydrex Gly', {
        ...base,
        marketingStatuses: ['OTC monograph not final'],
      }),
    ).not.toContain('marked discontinued')
  })

  it('does not guess why an empty record is empty', () => {
    const empty = describeRecord('Acetyl Tetrapeptide-5', null)
    expect(empty).toContain('which one applies here is not recorded')
    expect(empty).not.toContain('usually')
  })
})

describe('describeEvidence', () => {
  const facts = (total: number, clinicalTrials: number, reviews: number) => ({
    taxonomy: null,
    literature: { total, clinicalTrials, reviews },
    part: '',
  })

  it('says where it looked, because the count depends on it', () => {
    expect(describeEvidence(facts(31, 2, 0), 'Acetophenazine')).toContain(
      'in the title, abstract or keywords',
    )
  })

  it('agrees with itself about number', () => {
    const one = describeEvidence(facts(1, 1, 1), 'Acetyl Tetrapeptide-5')
    expect(one).toContain('1 paper with')
    expect(one).toContain('a review')
    expect(one).toContain('one indexed as a clinical trial')
    expect(one).not.toContain('1 papers')
  })

  it('records an absence as a finding rather than a gap', () => {
    expect(describeEvidence(facts(0, 0, 0), 'Nothing At All')).toContain(
      'not evidence that it does nothing',
    )
  })
})

describe('cleanLabelProse', () => {
  it('drops a section heading the SPL author typed inside the section', () => {
    expect(cleanLabelProse('INDICATIONS For the temporary relief of minor aches.')).toBe(
      'For the temporary relief of minor aches.',
    )
    expect(cleanLabelProse('Uses  temporarily relieves pain')).toBe('Temporarily relieves pain')
  })

  it('moves a homeopathic footnote out of the sentence it was appended to', () => {
    const out = cleanLabelProse(
      'May relieve sneezing.** **Claims based on traditional homeopathic practice, not accepted medical evidence.',
    )
    expect(out).toBe(
      'May relieve sneezing. Label footnote: Claims based on traditional homeopathic practice, not accepted medical evidence.',
    )
  })

  it('stops the label shouting without changing what it says', () => {
    const out = cleanLabelProse(
      'Relieves trembling.* *CLAIMS BASED ON TRADITIONAL HOMEOPATHIC PRACTICE, NOT FDA EVALUATED.',
    )
    expect(out).toContain('Claims based on traditional homeopathic practice, not FDA evaluated.')
    expect(out).not.toContain('not fda evaluated')
  })

  it('reads a marker between two words as the list separator it replaced', () => {
    expect(cleanLabelProse('For relief of minor: congestion* coughing* wheezing*')).toBe(
      'For relief of minor: congestion, coughing, wheezing',
    )
  })

  it('leaves an asterisk that is part of a name', () => {
    expect(cleanLabelProse('patients who are HLA-A*02:01P positive')).toBe(
      'Patients who are HLA-A*02:01P positive',
    )
  })
})

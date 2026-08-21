import { describe, expect, it } from 'vitest'

import { baseMoiety } from '@/scripts/ingest/normalise'
import { rejoinParenSplits } from '@/scripts/ingest/openfda'

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

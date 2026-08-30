import { describe, expect, it } from 'vitest'

import { ERTL_TPSA_CONTRIBUTIONS, computeDescriptors } from '@/lib/rna-intelligence/descriptors'
import { MOLECULAR_PROPERTIES } from '@/scripts/seed-data/background/molecular-properties.generated'

// Sulfur in the topological polar surface area.
//
// The module used to sum nitrogen and oxygen only, while its own comment claimed the result was
// the number PubChem prints. PubChem's sum includes sulfur, so every stored sulfur-bearing record
// was short by the whole of that atom's contribution: 66 of the 144 records in
// `scripts/seed-data/background/molecular-properties.generated.ts` disagreed with their stored
// PubChem value by more than half a square angstrom, and alpha-lipoic acid was short by exactly
// two sulfide contributions.
//
// Every expectation below is measured against that stored PubChem value rather than against a
// number written by hand, because the whole failure this file exists to catch is a descriptor
// engine that agrees with its own fixture and disagrees with chemistry.
//
// Two tolerances appear, and each is stated where it is used rather than hidden in a shared
// constant, because they mean different things:
//
//   - 0.30 square angstroms, for a record this module reproduces. It is not zero because PubChem
//     prints three significant figures: a stored 158 stands for anything in [157.5, 158.5], so an
//     exact calculation still lands up to half a unit away from the printed digits. Amoxicillin's
//     0.26 is that and nothing else.
//   - a per-record figure, quoted with its arithmetic, for a record carrying a known and explained
//     limitation. These are pinned rather than skipped so the limitation stays a measured fact
//     instead of a sentence in a comment nobody re-checks, the way the caffeine Kekule gap already
//     is in `layer2.test.ts`.

/** The stored PubChem value for a slug, so a typo in this file fails rather than passes. */
function storedTpsa(slug: string): number {
  const record = MOLECULAR_PROPERTIES[slug]
  if (record === undefined) throw new Error(`no molecular-properties record for ${slug}`)
  if (typeof record.tpsa !== 'number') throw new Error(`${slug} has no stored PubChem tpsa`)
  return record.tpsa
}

/** The stored PubChem SMILES for a slug. Kekule, as everything PubChem stores is. */
function storedSmiles(slug: string): string {
  const record = MOLECULAR_PROPERTIES[slug]
  if (record === undefined) throw new Error(`no molecular-properties record for ${slug}`)
  if (typeof record.smiles !== 'string' || record.smiles === '') {
    throw new Error(`${slug} has no stored SMILES`)
  }
  return record.smiles
}

function tpsaOf(slug: string): number {
  return computeDescriptors(storedSmiles(slug)).tpsa
}

// ---------------------------------------------------------------------------
// The published values, one environment at a time
// ---------------------------------------------------------------------------

describe('Ertl sulfur contributions in isolation', () => {
  it('prices a thioether as the published sulfide contribution and nothing else', () => {
    // Dimethyl sulfide has one polar atom. Whatever this returns is the sulfide contribution.
    expect(computeDescriptors('CSC').tpsa).toBeCloseTo(25.3, 2)
    expect(ERTL_TPSA_CONTRIBUTIONS.sulfur.sulfide).toBeCloseTo(25.3, 2)
  })

  it('prices a sulfoxide as the sulfur plus its oxygen', () => {
    // 19.21 (S with two single bonds and one double) + 17.07 (the double-bonded oxygen).
    expect(computeDescriptors('CS(=O)C').tpsa).toBeCloseTo(36.28, 2)
  })

  it('prices a sulfone as the sulfur plus both oxygens', () => {
    // 8.38 (S with two single bonds and two doubles) + 2 x 17.07.
    expect(computeDescriptors('CS(=O)(=O)C').tpsa).toBeCloseTo(42.52, 2)
  })

  it('prices an aromatic sulfur from lowercase notation', () => {
    // Thiophene written aromatically. This is the one sulfur environment the stored corpus never
    // exercises, because PubChem stores Kekule strings, so it is pinned directly.
    expect(computeDescriptors('c1ccsc1').tpsa).toBeCloseTo(28.24, 2)
  })

  it('leaves the deliberately unpriced sulfur environments at zero', () => {
    // Methanethiol: the thiol is a published environment this module does not carry, because the
    // only corpus evidence for it contradicts pricing it. Its sole polar atom therefore scores 0.
    expect(computeDescriptors('CS').tpsa).toBeCloseTo(0, 2)
    // Thiourea: two primary amines at 26.02 each. The thiocarbonyl sulfur adds nothing, so this
    // is 52.04 rather than a larger number.
    expect(computeDescriptors('NC(N)=S').tpsa).toBeCloseTo(52.04, 2)
  })

  it('leaves every phosphorus environment at zero', () => {
    // Triphenylphosphine has no nitrogen and no oxygen, so an unpriced phosphorus makes the whole
    // molecule score zero. Trimethyl phosphate is three ethers at 9.23 and one double-bonded
    // oxygen at 17.07, with the phosphorus itself contributing nothing.
    expect(computeDescriptors('C1=CC=C(C=C1)P(C2=CC=CC=C2)C3=CC=CC=C3').tpsa).toBeCloseTo(0, 2)
    expect(computeDescriptors('COP(=O)(OC)OC').tpsa).toBeCloseTo(44.76, 2)
  })
})

// ---------------------------------------------------------------------------
// Against the stored PubChem values
// ---------------------------------------------------------------------------

describe('stored sulfur-bearing records against their stored PubChem value', () => {
  it('reproduces alpha-lipoic acid, the record that exposed the defect', () => {
    // Two ring sulfurs in a disulfide, each S(-*)-*. Before sulfur was priced this returned 37.30
    // against a stored 87.9, short by 50.60, which is 2 x 25.30 to the last digit. That is how the
    // sulfide contribution was identified rather than assumed.
    const tpsa = tpsaOf('alpha-lipoic-acid')

    expect(tpsa).toBeCloseTo(87.9, 2)
    expect(tpsa).toBeCloseTo(37.3 + 2 * 25.3, 2)
    // Tolerance 0.30: PubChem's three-significant-figure printing, described at the top.
    expect(Math.abs(tpsa - storedTpsa('alpha-lipoic-acid'))).toBeLessThan(0.3)
  })

  it('reproduces amoxicillin', () => {
    // One thiazolidine sulfur, two single bonds, no hydrogen: 132.96 + 25.30.
    const tpsa = tpsaOf('amoxicillin')

    expect(tpsa).toBeCloseTo(158.26, 2)
    // Tolerance 0.30. The stored 158 is a rounded print of a value this calculation puts at
    // 158.26, so 0.26 of the gap is the printing and none of it is the chemistry.
    expect(Math.abs(tpsa - storedTpsa('amoxicillin'))).toBeLessThan(0.3)
  })

  it('reproduces cephalexin', () => {
    // One dihydrothiazine sulfur: 112.73 + 25.30.
    const tpsa = tpsaOf('cephalexin')

    expect(tpsa).toBeCloseTo(138.03, 2)
    expect(Math.abs(tpsa - storedTpsa('cephalexin'))).toBeLessThan(0.3)
  })

  it('reproduces a sulfone and a sulfoxide record to the printed digit', () => {
    // Taurine is one sulfonic acid sulfur at 8.38 on top of 80.39, and modafinil one sulfoxide
    // sulfur at 19.21 on top of 60.16. Neither molecule contains an aromatic nitrogen, so neither
    // carries the Kekule limitation and both land on PubChem's printed value.
    expect(tpsaOf('taurine')).toBeCloseTo(88.77, 2)
    expect(Math.abs(tpsaOf('taurine') - storedTpsa('taurine'))).toBeLessThan(0.3)

    expect(tpsaOf('modafinil')).toBeCloseTo(79.37, 2)
    expect(Math.abs(tpsaOf('modafinil') - storedTpsa('modafinil'))).toBeLessThan(0.3)
  })
})

describe('stored records that keep a documented, measured gap', () => {
  it('leaves clopidogrel 2.96 short, which is the Kekule thiophene sulfur', () => {
    // PubChem perceives the thiophene and prices its sulfur at 28.24. The stored string writes
    // that ring in Kekule form, so this module sees two single bonds and prices a sulfide at
    // 25.30. The gap is 2.94, plus 0.02 for PubChem printing 57.8 rather than 57.78.
    //
    // This is the same limitation the file header states for caffeine's nitrogens, measured on
    // sulfur. Pricing it any other way would mean perceiving aromaticity, which this module does
    // not do.
    const tpsa = tpsaOf('clopidogrel')

    expect(tpsa).toBeCloseTo(54.84, 2)
    expect(tpsa).toBeCloseTo(29.54 + 25.3, 2)
    // Tolerance 3.0: one Kekule-written thiophene sulfur, 28.24 - 25.30 = 2.94, plus printing.
    expect(Math.abs(tpsa - storedTpsa('clopidogrel'))).toBeLessThan(3.0)
    // And the gap really is that one atom: writing the same molecule with both rings aromatic
    // returns 57.78, which is what PubChem prints as 57.8. The module is not wrong about the
    // sulfur, it is reading the notation it was given.
    const aromaticSpelling = computeDescriptors('COC(=O)C(c1ccccc1Cl)N2CCc3c(C2)ccs3').tpsa
    expect(aromaticSpelling).toBeCloseTo(57.78, 2)
    expect(aromaticSpelling - tpsa).toBeCloseTo(28.24 - 25.3, 2)
    expect(Math.abs(aromaticSpelling - storedTpsa('clopidogrel'))).toBeLessThan(0.3)
  })

  it('leaves azathioprine 9.85 short, and the sulfur is not the reason', () => {
    // The thioether bridging the two rings is priced correctly at 25.30: 107.85 + 25.30 = 133.15.
    // The residual against the stored 143 comes from two things this module does not do, neither
    // of them about sulfur.
    //
    // Kekule aromatic nitrogen, 7.57 in total: the purine's two pyrimidine =N- at 0.53 each, its
    // imidazole N-H at 3.76 and =N- at 0.53, and the methylimidazole's substituted nitrogen at
    // 1.69 and its =N- at 0.53.
    //
    // Charge-separated nitro, 2.68: the stored string writes [N+](=O)[O-], which this module
    // prices at 3.01 + 17.07 + 23.06 = 43.14, while PubChem normalises to the neutral pentavalent
    // form and prices 11.68 + 17.07 + 17.07 = 45.82.
    //
    // 133.15 + 7.57 + 2.68 = 143.40, which PubChem prints as 143. The residual is fully accounted
    // for, so it is pinned rather than chased.
    const tpsa = tpsaOf('azathioprine')

    expect(tpsa).toBeCloseTo(133.15, 2)
    expect(tpsa).toBeCloseTo(107.85 + 25.3, 2)
    // Tolerance 10.5: the 7.57 aromatic-nitrogen gap plus the 2.68 nitro gap, plus printing.
    expect(Math.abs(tpsa - storedTpsa('azathioprine'))).toBeLessThan(10.5)
    // The sulfur's own share is exact, which is the part this file is responsible for. Splicing
    // the thioether out and bonding the two rings directly leaves every nitrogen and oxygen
    // environment untouched, so the difference must be one sulfide contribution and nothing else.
    const bondedDirectly = computeDescriptors('CN1C=NC(=C1C2=NC=NC3=C2NC=N3)[N+](=O)[O-]').tpsa
    expect(bondedDirectly).toBeCloseTo(107.85, 2)
    expect(tpsa - bondedDirectly).toBeCloseTo(25.3, 2)
  })

  it('reproduces the free-thiol insulin records only because the thiol stays unpriced', () => {
    // Insulin lispro and insulin aspart are the only stored records containing a free thiol, six
    // each. Their stored PubChem totals are 2310 and 2350 against this module's 2290.49 and
    // 2336.58, which leaves no room for a thiol contribution of any size: adding the published
    // 38.80 per sulfur would overshoot by more than 200 square angstroms on both.
    //
    // That is the measurement behind leaving the thiol unpriced. If a future change prices it,
    // this test fails, which is the point.
    expect(tpsaOf('insulin-lispro')).toBeCloseTo(2290.49, 2)
    expect(tpsaOf('insulin-aspart')).toBeCloseTo(2336.58, 2)
    // Tolerance 25: PubChem prints these to three significant figures, so a stored 2310 stands for
    // anything in [2305, 2315] and no absolute comparison can be tighter than 5. The remaining 20
    // is Kekule aromatic nitrogen across the histidine residues of a 51-residue peptide.
    expect(Math.abs(tpsaOf('insulin-lispro') - storedTpsa('insulin-lispro'))).toBeLessThan(25)
    expect(Math.abs(tpsaOf('insulin-aspart') - storedTpsa('insulin-aspart'))).toBeLessThan(25)
  })

  it('closes almost all of the insulin glargine gap, where the sulfurs are disulfides', () => {
    // The same peptide family written with its three disulfide bridges rather than free thiols.
    // Six sulfide sulfurs at 25.30 is 151.80 of what was a 160.60 gap; the 8.80 left is 0.34 per
    // cent of the stored value and is Kekule aromatic nitrogen.
    const tpsa = tpsaOf('insulin-glargine')

    expect(tpsa).toBeCloseTo(2581.2, 2)
    expect(tpsa).toBeCloseTo(2429.4 + 6 * 25.3, 2)
    // Tolerance 15: 5 for three-significant-figure printing, the rest the aromatic residual.
    expect(Math.abs(tpsa - storedTpsa('insulin-glargine'))).toBeLessThan(15)
  })

  it('does not reconcile sitagliptin, which is why phosphorus stays unpriced', () => {
    // The corpus holds exactly one phosphorus record and it does not add up. The stored string is
    // a three-component salt hydrate, and this module's nitrogen-and-oxygen sum splits as 74.29
    // for the base, 77.76 for the phosphoric acid and 20.23 for the water, giving 172.28 against a
    // stored 156. The module is already 16.28 above PubChem before any phosphorus contribution is
    // added, so no phosphorus value can be established from this record, and adding one would
    // widen the gap rather than close it.
    const tpsa = tpsaOf('sitagliptin')

    expect(tpsa).toBeCloseTo(172.28, 2)
    expect(tpsa).toBeGreaterThan(storedTpsa('sitagliptin'))
    expect(computeDescriptors('OP(=O)(O)O').tpsa).toBeCloseTo(77.76, 2)
  })
})

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

describe('nitrogen and oxygen records are untouched by the sulfur change', () => {
  // These four contain no sulfur and no phosphorus at all, so pricing sulfur must move none of
  // them by any amount. Each is asserted against its stored PubChem value, and each was verified
  // to return the identical figure before the sulfur branch existed.
  const controls: Array<[string, number]> = [
    ['acetaminophen', 49.33],
    ['ibuprofen', 37.3],
    ['aspirin', 63.6],
    ['metformin', 91.49],
  ]

  for (const [slug, expected] of controls) {
    it(`leaves ${slug} exactly where it was`, () => {
      const tpsa = tpsaOf(slug)
      expect(tpsa).toBeCloseTo(expected, 2)
      // Tolerance 0.30, the printing allowance again: acetaminophen computes 49.33 and PubChem
      // prints 49.3, metformin computes 91.49 and PubChem prints 91.5.
      expect(Math.abs(tpsa - storedTpsa(slug))).toBeLessThan(0.3)
    })
  }

  it('keeps both caffeine spellings on their documented values', () => {
    // The pair `layer2.test.ts` already pins, repeated here as a guard: the sulfur work must not
    // have disturbed the nitrogen cascade or the aromatic-notation reading it depends on.
    expect(computeDescriptors('Cn1cnc2c1C(=O)N(C)C(=O)N2C').tpsa).toBeCloseTo(58.44, 2)
    expect(computeDescriptors('CN1C=NC2=C1C(=O)N(C(=O)N2C)C').tpsa).toBeCloseTo(56.22, 2)
  })

  it('keeps the oxygen three-membered-ring split, which sulfur has no equivalent of', () => {
    // Ertl parameterises an epoxide oxygen separately from an ether but publishes no separate
    // three-membered-ring sulfur, so a thiirane is priced as the sulfide it is. Both halves of
    // that statement are asserted, because the ring detection is shared code.
    expect(computeDescriptors('C1CO1').tpsa).toBeCloseTo(12.53, 2)
    expect(computeDescriptors('CCOCC').tpsa).toBeCloseTo(9.23, 2)
    expect(computeDescriptors('C1CS1').tpsa).toBeCloseTo(25.3, 2)
  })
})

// ---------------------------------------------------------------------------
// The whole corpus
// ---------------------------------------------------------------------------

describe('the stored corpus as a whole', () => {
  it('agrees with PubChem on more records than it did, and never by regressing one', () => {
    // Before sulfur was priced, 66 of 144 stored records disagreed with their stored PubChem value
    // by more than half a square angstrom and the worst gap was 160.60 square angstroms, on
    // insulin glargine. Afterwards it is 52 records and 19.51.
    //
    // 52 is not zero and this file does not pretend otherwise. What remains is Kekule aromaticity,
    // PubChem's normalisation of charge-separated nitro groups, the unpriced phosphorus record and
    // three-significant-figure printing. None of those is a sulfur defect, and this assertion is
    // written as a ceiling so that fixing any of them makes the test pass more comfortably rather
    // than fail.
    let disagreeing = 0
    let worst = 0
    let counted = 0

    for (const record of Object.values(MOLECULAR_PROPERTIES)) {
      if (typeof record.smiles !== 'string' || record.smiles === '') continue
      if (typeof record.tpsa !== 'number') continue
      counted++
      const gap = Math.abs(computeDescriptors(record.smiles).tpsa - record.tpsa)
      if (gap > 0.5) disagreeing++
      if (gap > worst) worst = gap
    }

    expect(counted).toBe(144)
    expect(disagreeing).toBeLessThanOrEqual(52)
    expect(worst).toBeLessThan(20)
  })
})

// Molecular descriptors — logP, topological polar surface area, hydrogen-bond counts, rotatable
// bonds, Lipinski's rule of five, and the peptide charge model Layer 2 reports for a backbone.
//
// WHY THIS PARSES SMILES A SECOND TIME. `smiles.ts` answers composition questions: how many
// carbons, how many hydrogens, what the formula weighs. Every descriptor below is instead a
// function of atom *environments* — which neighbour, at what bond order, inside a ring or not —
// and that connection table is private to `parseSmiles`. So this module builds its own graph, and
// takes the molecular weight and the heavy-atom count straight from `parseSmiles` rather than
// recomputing them. There is exactly one piece of mass arithmetic in this codebase and it lives
// over there.
//
// WHAT IS REAL HERE, AND WHAT IS AN ESTIMATE. Say it plainly, because this product exists to make
// that distinction:
//
//   - Hydrogen-bond donors and acceptors, rotatable bonds, heavy atoms and the Lipinski verdict
//     are counts. They are exact for the structure as written.
//   - Topological polar surface area is Ertl's method (Ertl, Rohde & Selzer, J. Med. Chem. 2000,
//     43, 3714-3717), summing the published contribution of every nitrogen and oxygen environment.
//     Aspirin returns 63.60 A^2 and caffeine 58.44 A^2 — the numbers PubChem prints, because they
//     are the same table.
//   - logP is an ESTIMATE. It is the Wildman-Crippen atomic-contribution model (Wildman & Crippen,
//     J. Chem. Inf. Comput. Sci. 1999, 39, 868-873) over a documented subset of that paper's 68
//     atom types. The hydrocarbon types are exact — benzene returns 1.6866, toluene 1.9950,
//     decane 4.1470, which are the published model's own values — while the heteroatom types are
//     reduced, so a heavily functionalised molecule lands in the right lipophilicity band rather
//     than on the published digit. Never present it as a measurement.
//   - Isoelectric point and net charge use the Bjellqvist pK set (the one ExPASy Compute pI/Mw
//     uses) and Kyte-Doolittle hydropathy. Both are published scales; the arithmetic is exact.
//
// AROMATICITY IS READ, NOT PERCEIVED. Like `parseSmiles`, this module trusts the spelling it was
// given: lowercase atoms are aromatic, uppercase ones are not, and no ring perception runs. That
// is a real limitation with a measurable size. Caffeine written with an aromatic imidazole and a
// Kekule pyrimidinedione — `Cn1cnc2c1C(=O)N(C)C(=O)N2C`, which is the depiction PubChem's value
// corresponds to — returns 58.44 A^2 exactly. The fully Kekule spelling of the same molecule
// returns 56.22 A^2, because two nitrogens then type as aliphatic (3.24 + 12.36) instead of
// aromatic (4.93 + 12.89). Both numbers are correct for the structure submitted. Neither is
// invented, and the test suite pins both so the limitation stays a measured fact.
//
// Everything in this file is a pure function of its input. No clock, no randomness, no I/O.

import type { BondKind } from './smiles'
import { ORGANIC_SUBSET_VALENCES, parseSmiles } from './smiles'

// ---------------------------------------------------------------------------
// Published parameter tables
// ---------------------------------------------------------------------------

/**
 * Wildman-Crippen logP atomic contributions, by that paper's type name. The subset is chosen so
 * that every atom a drug-like SMILES string can present gets a type: aliphatic and aromatic
 * carbon, nitrogen, oxygen, sulfur, phosphorus, the four halogens, and hydrogen by what it hangs
 * off. Types outside this subset (metals, boron, the finer aromatic-carbon splits) fall through to
 * the catch-all values, which under-states a contribution rather than inventing one.
 */
export const WILDMAN_CRIPPEN_LOGP: Record<string, number> = {
  // Carbon.
  C1: 0.1441, // primary or secondary aliphatic carbon, attached to carbon only
  C2: 0.0, // tertiary or quaternary aliphatic carbon, attached to carbon only
  C3: -0.2035, // primary or secondary aliphatic carbon, attached to a heteroatom
  C4: -0.2051, // tertiary or quaternary aliphatic carbon, attached to a heteroatom
  C5: -0.2783, // carbon double-bonded to a heteroatom (carbonyl, imine, thiocarbonyl)
  C6: 0.1551, // aliphatic C=C
  C7: 0.0017, // acetylenic or nitrile carbon
  C8: 0.08452, // aliphatic carbon attached to an aromatic ring
  C18: 0.1581, // aromatic CH
  C19: 0.2955, // aromatic bridgehead, three aromatic neighbours
  C21: 0.136, // aromatic carbon bearing an aliphatic carbon
  C22: 0.4619, // aromatic carbon bearing a nitrogen
  C23: 0.5437, // aromatic carbon bearing an oxygen
  C24: 0.1893, // aromatic carbon bearing a sulfur
  C25: -0.8186, // aromatic carbon bearing a phosphorus
  C26: 0.264, // C=C with an aromatic substituent
  CS: 0.08129, // carbon, no type matched

  // Hydrogen, typed by what it is attached to.
  H1: 0.123, // on carbon
  H2: -0.2677, // on an alcohol or phenol oxygen
  H3: 0.2142, // on nitrogen
  H4: 0.298, // on an acid oxygen
  HS: 0.1125, // hydrogen, no type matched

  // Nitrogen.
  N1: -1.019, // primary aliphatic amine
  N2: -0.7096, // secondary aliphatic amine
  N3: -1.027, // primary aromatic amine
  N4: -0.5188, // secondary aromatic amine
  N5: 0.08387, // =NH
  N6: 0.1836, // =N-
  N7: -0.3187, // tertiary aliphatic amine
  N8: -0.4458, // tertiary aromatic amine
  N9: 0.01508, // nitrile
  N10: -1.95, // protonated amine
  N11: -0.3239, // aromatic nitrogen, no hydrogen
  N12: -1.119, // aromatic nitrogen carrying a hydrogen
  N13: -0.3396, // quaternary nitrogen
  N14: 0.2887, // nitro or N-oxide nitrogen
  NS: -0.4806, // nitrogen, no type matched

  // Oxygen.
  O1: -0.3567, // alcohol
  O2: -0.0127, // phenol, enol or carboxylic acid hydroxyl
  O3: -0.0233, // aliphatic ether
  O4: -0.1541, // aromatic ether
  O5: 0.011, // oxygen on nitrogen (nitro, N-oxide)
  O6: -0.2173, // oxygen on sulfur (sulfoxide, sulfone)
  O7: 0.1104, // oxygen on phosphorus
  O8: -0.2263, // aromatic oxygen (furan)
  O9: 0.1129, // ketone or aldehyde carbonyl
  O10: 0.2214, // carbonyl on an aromatic carbon
  O11: 0.389, // ester, amide or acid carbonyl
  O12: -1.326, // carboxylate or alkoxide anion
  OS: -0.1188, // oxygen, no type matched

  // Sulfur, phosphorus, halogens.
  S1: 0.6482, // aliphatic sulfur (thiol, sulfide, sulfoxide, sulfone)
  S2: -0.0024, // thiolate anion
  S3: 0.6237, // aromatic sulfur (thiophene)
  P: 0.8612,
  F: 0.4202,
  Cl: 0.6895,
  Br: 0.8456,
  I: 0.8747,
}

/**
 * Ertl topological polar surface area contributions in square angstroms, keyed by the atom
 * environment they describe. Only nitrogen and oxygen appear: the value everybody quotes as "TPSA"
 * — PubChem's, and the one Veber's rule is stated against — is the nitrogen and oxygen sum.
 * Ertl's paper also parameterises sulfur and phosphorus; including them here would silently return
 * a larger number under the same label, so they are deliberately left out.
 */
export const ERTL_TPSA_CONTRIBUTIONS = {
  nitrogen: {
    tertiaryAmine: 3.24, // N(-*)(-*)-*
    tertiaryAmineThreeRing: 3.01, // N in an aziridine
    imine: 12.36, // N(-*)=*
    nitrile: 23.79, // N#*
    nitro: 11.68, // N(-*)(=*)=*
    imineNitrile: 13.6, // N(=*)#*
    secondaryAmine: 12.03, // [NH](-*)-*
    secondaryAmineThreeRing: 21.94,
    secondaryImine: 23.85, // [NH]=*
    primaryAmine: 26.02, // [NH2]-*
    quaternary: 0.0, // [N+](-*)(-*)(-*)-*
    cationicImine: 3.01, // [N+](-*)(-*)=*
    cationicNitrile: 4.36, // [N+](-*)#*
    protonatedSecondary: 4.44, // [NH+](-*)(-*)-*
    protonatedImine: 13.97, // [NH+](-*)=*
    protonatedPrimary: 16.61, // [NH2+](-*)-*
    protonatedPrimaryImine: 25.59, // [NH2+]=*
    ammonium: 27.64, // [NH3+]-*
    aromatic: 12.89, // n(:*):*
    aromaticBridge: 4.41, // n(:*)(:*):*
    aromaticSubstituted: 4.93, // n(-*)(:*):*
    aromaticOxide: 8.39, // n(=*)(:*):*
    aromaticProtonated: 15.79, // [nH](:*):*
    aromaticCationicBridge: 4.1, // [n+](:*)(:*):*
    aromaticCationicSubstituted: 3.88, // [n+](-*)(:*):*
    aromaticCationicProtonated: 14.14, // [nH+](:*):*
  },
  oxygen: {
    ether: 9.23, // O(-*)-*
    etherThreeRing: 12.53, // O in an epoxide
    carbonyl: 17.07, // O=*
    hydroxyl: 20.23, // [OH]-*
    anion: 23.06, // [O-]-*
    aromatic: 13.14, // o(:*):*
  },
} as const

/**
 * Kyte-Doolittle hydropathy index (J. Mol. Biol. 1982, 157, 105-132). Positive is hydrophobic.
 */
export const KYTE_DOOLITTLE_HYDROPATHY: Record<string, number> = {
  A: 1.8,
  R: -4.5,
  N: -3.5,
  D: -3.5,
  C: 2.5,
  Q: -3.5,
  E: -3.5,
  G: -0.4,
  H: -3.2,
  I: 4.5,
  L: 3.8,
  K: -3.9,
  M: 1.9,
  F: 2.8,
  P: -1.6,
  S: -0.8,
  T: -0.7,
  W: -0.9,
  Y: -1.3,
  V: 4.2,
}

/** Bjellqvist pK values, as used by ExPASy Compute pI/Mw. */
export const N_TERMINUS_PKA = 7.5
export const C_TERMINUS_PKA = 3.55
const CATIONIC_SIDE_CHAIN_PKA: Record<string, number> = { K: 10.0, R: 12.0, H: 5.98 }
const ANIONIC_SIDE_CHAIN_PKA: Record<string, number> = { D: 4.05, E: 4.45, C: 9.0, Y: 10.0 }

/** Lipinski's rule-of-five thresholds (Adv. Drug Deliv. Rev. 1997, 23, 3-25). */
export const LIPINSKI_LIMITS = {
  molecularWeight: 500,
  logP: 5,
  hydrogenBondDonors: 5,
  hydrogenBondAcceptors: 10,
} as const

// ---------------------------------------------------------------------------
// Molecular graph
// ---------------------------------------------------------------------------

const BOND_ORDER: Record<BondKind, number> = {
  single: 1,
  double: 2,
  triple: 3,
  quadruple: 4,
  // Matches `smiles.ts`: an aromatic bond contributes 1 to the sigma framework and the
  // delocalised electron is added once per aromatic *atom*, not once per aromatic bond.
  aromatic: 1,
}

/** Elements a carbon counts as "attached to a heteroatom" for Wildman-Crippen typing. */
const HETEROATOMS = new Set(['N', 'O', 'P', 'S', 'F', 'Cl', 'Br', 'I'])

const AROMATIC_ORGANIC_SUBSET = 'bcnops'

interface GraphAtom {
  /** Uppercase element symbol, or '*' for a wildcard. */
  element: string
  aromatic: boolean
  charge: number
  bracket: boolean
  /** Sum of bond orders to every neighbour, hydrogens excluded. */
  bondOrderSum: number
  /** Total hydrogens: bracket suffix, implicit valence filling, and folded-in [H] atoms. */
  hydrogens: number
  /** False for a stand-alone [H] that was folded into the atom it hangs off. */
  heavy: boolean
}

interface GraphBond {
  a: number
  b: number
  kind: BondKind
}

interface MolecularGraph {
  atoms: GraphAtom[]
  bonds: GraphBond[]
  /** Parallel to `bonds`: true when the bond lies on a cycle, so it cannot rotate. */
  bondInRing: boolean[]
  /** Heavy-atom neighbour indices, per atom. */
  neighbours: number[][]
  /** Bond indices, parallel to `neighbours`. */
  neighbourBonds: number[][]
  /** Per atom: true when it sits in a three-membered ring, which Ertl parameterises separately. */
  inThreeMemberedRing: boolean[]
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

function isLowerAlpha(ch: string): boolean {
  return ch >= 'a' && ch <= 'z'
}

function isUpperAlpha(ch: string): boolean {
  return ch >= 'A' && ch <= 'Z'
}

function bondKindForSymbol(symbol: string): BondKind | null {
  switch (symbol) {
    case '-':
    case '/':
    case '\\':
      return 'single'
    case '=':
      return 'double'
    case '#':
      return 'triple'
    case '$':
      return 'quadruple'
    case ':':
      return 'aromatic'
    default:
      return null
  }
}

interface BracketAtom {
  element: string
  aromatic: boolean
  charge: number
  hydrogens: number
  next: number
}

/**
 * Reads one bracket atom starting at `[`. Same grammar order as `smiles.ts`
 * (isotope, symbol, chirality, hydrogen count, charge, atom class), minus the diagnostics: a
 * string that reaches this module has already been through `parseSmiles`, which is where a
 * malformed bracket is reported. Isotope digits are consumed and discarded, because no descriptor
 * below depends on the nuclide.
 */
function readBracketAtom(s: string, start: number): BracketAtom {
  let j = start + 1
  while (isDigit(s.charAt(j))) j++

  let element = ''
  let aromatic = false
  const head = s.charAt(j)
  if (head === '*') {
    element = '*'
    j++
  } else if (isLowerAlpha(head)) {
    const two = s.slice(j, j + 2)
    if (two === 'se' || two === 'as') {
      element = two.charAt(0).toUpperCase() + two.charAt(1)
      aromatic = true
      j += 2
    } else if (AROMATIC_ORGANIC_SUBSET.includes(head)) {
      element = head.toUpperCase()
      aromatic = true
      j++
    } else {
      j++
    }
  } else if (isUpperAlpha(head)) {
    const two = s.slice(j, j + 2)
    // A lowercase second letter is only part of the symbol when the pair is a real element, so
    // [Na+] stays sodium and [NH4+] stays nitrogen plus four hydrogens.
    if (two.length === 2 && isLowerAlpha(two.charAt(1)) && TWO_LETTER_ELEMENTS.has(two)) {
      element = two
      j += 2
    } else {
      element = head
      j++
    }
  }

  if (s.charAt(j) === '@') {
    j++
    if (s.charAt(j) === '@') {
      j++
    } else {
      const cls = s.slice(j, j + 2)
      if (cls === 'TH' || cls === 'AL' || cls === 'SP' || cls === 'TB' || cls === 'OH') {
        j += 2
        while (isDigit(s.charAt(j))) j++
      }
    }
  }

  let hydrogens = 0
  if (s.charAt(j) === 'H') {
    j++
    let digits = ''
    while (isDigit(s.charAt(j))) {
      digits += s.charAt(j)
      j++
    }
    hydrogens = digits === '' ? 1 : Number(digits)
  }

  let charge = 0
  const sign = s.charAt(j)
  if (sign === '+' || sign === '-') {
    const unit = sign === '+' ? 1 : -1
    j++
    let digits = ''
    while (isDigit(s.charAt(j))) {
      digits += s.charAt(j)
      j++
    }
    if (digits !== '') {
      charge = unit * Number(digits)
    } else {
      charge = unit
      while (s.charAt(j) === sign) {
        charge += unit
        j++
      }
    }
  }

  if (s.charAt(j) === ':') {
    j++
    while (isDigit(s.charAt(j))) j++
  }

  const close = s.indexOf(']', j)
  return { element, aromatic, charge, hydrogens, next: close === -1 ? s.length : close + 1 }
}

/**
 * Two-letter element symbols this tokenizer will accept inside brackets. Kept as a set rather than
 * reusing `STANDARD_ATOMIC_WEIGHTS` from `smiles.ts` so the descriptor parser cannot start
 * depending on a mass table it never reads.
 */
const TWO_LETTER_ELEMENTS = new Set([
  'He',
  'Li',
  'Be',
  'Ne',
  'Na',
  'Mg',
  'Al',
  'Si',
  'Cl',
  'Ar',
  'Ca',
  'Sc',
  'Ti',
  'Cr',
  'Mn',
  'Fe',
  'Co',
  'Ni',
  'Cu',
  'Zn',
  'Ga',
  'Ge',
  'As',
  'Se',
  'Br',
  'Kr',
  'Rb',
  'Sr',
  'Zr',
  'Nb',
  'Mo',
  'Tc',
  'Ru',
  'Rh',
  'Pd',
  'Ag',
  'Cd',
  'In',
  'Sn',
  'Sb',
  'Te',
  'Xe',
  'Cs',
  'Ba',
  'La',
  'Gd',
  'Re',
  'Os',
  'Ir',
  'Pt',
  'Au',
  'Hg',
  'Tl',
  'Pb',
  'Bi',
  'Th',
])

/**
 * Builds the connection table. Structure only — no masses, no formula, no validity verdict; those
 * are `parseSmiles`'s answers and this module defers to them.
 */
function buildGraph(smiles: string): MolecularGraph {
  const s = smiles.replace(/\s+/g, '')
  const atoms: GraphAtom[] = []
  const bonds: GraphBond[] = []
  const branchStack: number[] = []
  const openRingBonds = new Map<number, { atom: number; kind: BondKind | null }>()

  let previousAtom: number | null = null
  let pendingBond: BondKind | null = null
  let i = 0

  const addAtom = (atom: GraphAtom): void => {
    const index = atoms.length
    atoms.push(atom)
    if (previousAtom !== null) {
      const previous = atoms[previousAtom]
      const kind: BondKind =
        pendingBond ??
        (previous !== undefined && previous.aromatic && atom.aromatic ? 'aromatic' : 'single')
      bonds.push({ a: previousAtom, b: index, kind })
      const order = BOND_ORDER[kind]
      if (previous !== undefined) previous.bondOrderSum += order
      atom.bondOrderSum += order
    }
    pendingBond = null
    previousAtom = index
  }

  const closeRing = (ringNumber: number): void => {
    if (previousAtom === null) {
      pendingBond = null
      return
    }
    const open = openRingBonds.get(ringNumber)
    if (open === undefined) {
      openRingBonds.set(ringNumber, { atom: previousAtom, kind: pendingBond })
      pendingBond = null
      return
    }
    openRingBonds.delete(ringNumber)
    if (open.atom === previousAtom) {
      pendingBond = null
      return
    }
    const first = atoms[open.atom]
    const second = atoms[previousAtom]
    const kind: BondKind =
      pendingBond ??
      open.kind ??
      (first !== undefined && second !== undefined && first.aromatic && second.aromatic
        ? 'aromatic'
        : 'single')
    bonds.push({ a: open.atom, b: previousAtom, kind })
    const order = BOND_ORDER[kind]
    if (first !== undefined) first.bondOrderSum += order
    if (second !== undefined) second.bondOrderSum += order
    pendingBond = null
  }

  const blankAtom = (element: string, aromatic: boolean, charge: number, bracket: boolean) => ({
    element,
    aromatic,
    charge,
    bracket,
    bondOrderSum: 0,
    hydrogens: 0,
    heavy: true,
  })

  while (i < s.length) {
    const ch = s.charAt(i)

    if (ch === '(') {
      if (previousAtom !== null) branchStack.push(previousAtom)
      i++
      continue
    }
    if (ch === ')') {
      const resumed = branchStack.pop()
      if (resumed !== undefined) previousAtom = resumed
      pendingBond = null
      i++
      continue
    }
    if (ch === '[') {
      const parsed = readBracketAtom(s, i)
      if (parsed.element !== '') {
        const atom = blankAtom(parsed.element, parsed.aromatic, parsed.charge, true)
        atom.hydrogens = parsed.hydrogens
        addAtom(atom)
      }
      i = parsed.next
      continue
    }
    if (ch === ']') {
      i++
      continue
    }
    if (ch === '.') {
      previousAtom = null
      pendingBond = null
      i++
      continue
    }

    const bondKind = bondKindForSymbol(ch)
    if (bondKind !== null) {
      pendingBond = bondKind
      i++
      continue
    }

    if (ch === '%') {
      const first = s.charAt(i + 1)
      const second = s.charAt(i + 2)
      if (isDigit(first) && isDigit(second)) {
        closeRing(Number(`${first}${second}`))
        i += 3
      } else {
        i++
      }
      continue
    }
    if (isDigit(ch)) {
      closeRing(Number(ch))
      i++
      continue
    }
    if (ch === '*') {
      addAtom(blankAtom('*', false, 0, false))
      i++
      continue
    }

    // Two-letter symbols first, or 'Cl' becomes carbon plus a stray 'l'.
    const twoLetter = s.slice(i, i + 2)
    if (twoLetter === 'Cl' || twoLetter === 'Br') {
      addAtom(blankAtom(twoLetter, false, 0, false))
      i += 2
      continue
    }
    if ('BCNOPSFI'.includes(ch) && isUpperAlpha(ch)) {
      addAtom(blankAtom(ch, false, 0, false))
      i++
      continue
    }
    if (AROMATIC_ORGANIC_SUBSET.includes(ch) && isLowerAlpha(ch)) {
      addAtom(blankAtom(ch.toUpperCase(), true, 0, false))
      i++
      continue
    }

    i++
  }

  // Implicit hydrogens. Bracket atoms take none: writing brackets is how an author says "this
  // hydrogen count is exactly what I mean" (OpenSMILES 3.1.5). Same rule as `smiles.ts`.
  for (const atom of atoms) {
    if (atom.bracket) continue
    const valences = ORGANIC_SUBSET_VALENCES[atom.element]
    if (valences === undefined) continue
    const used = atom.bondOrderSum + (atom.aromatic ? 1 : 0)
    for (const valence of valences) {
      if (valence >= used) {
        atom.hydrogens += valence - used
        break
      }
    }
  }

  // Full adjacency first, hydrogens included, because the folding pass below has to be able to
  // find the atom a stand-alone [H] hangs off.
  const neighbours: number[][] = atoms.map(() => [])
  const neighbourBonds: number[][] = atoms.map(() => [])
  for (let index = 0; index < bonds.length; index++) {
    const bond = bonds[index]
    if (bond === undefined) continue
    neighbours[bond.a]?.push(bond.b)
    neighbourBonds[bond.a]?.push(index)
    neighbours[bond.b]?.push(bond.a)
    neighbourBonds[bond.b]?.push(index)
  }

  // A stand-alone [H] is a hydrogen the author chose to write as an atom. Folding it onto its
  // host normalises the two spellings of the same molecule: [OH] and O[H] must not type as a
  // hydroxyl and an ether respectively.
  for (let index = 0; index < atoms.length; index++) {
    const atom = atoms[index]
    if (atom === undefined || atom.element !== 'H') continue
    const attached = neighbours[index] ?? []
    const host = attached[0]
    if (attached.length !== 1 || host === undefined) continue
    const hostAtom = atoms[host]
    if (hostAtom === undefined || hostAtom.element === 'H') continue
    hostAtom.hydrogens += 1
    atom.heavy = false
  }

  // Drop the folded hydrogens from every adjacency list, so "heavy neighbour" means what it says.
  const heavyNeighbours: number[][] = atoms.map(() => [])
  const heavyNeighbourBonds: number[][] = atoms.map(() => [])
  for (let index = 0; index < atoms.length; index++) {
    const list = neighbours[index] ?? []
    const bondList = neighbourBonds[index] ?? []
    const self = atoms[index]
    if (self === undefined || !self.heavy) continue
    for (let slot = 0; slot < list.length; slot++) {
      const other = list[slot]
      const bondIndex = bondList[slot]
      if (other === undefined || bondIndex === undefined) continue
      const otherAtom = atoms[other]
      if (otherAtom === undefined || !otherAtom.heavy) continue
      heavyNeighbours[index]?.push(other)
      heavyNeighbourBonds[index]?.push(bondIndex)
    }
  }

  const bondInRing = findRingBonds(atoms.length, bonds, heavyNeighbours, heavyNeighbourBonds)

  const inThreeMemberedRing = atoms.map((_, index) => {
    const list = heavyNeighbours[index] ?? []
    for (let a = 0; a < list.length; a++) {
      for (let b = a + 1; b < list.length; b++) {
        const first = list[a]
        const second = list[b]
        if (first === undefined || second === undefined) continue
        if ((heavyNeighbours[first] ?? []).includes(second)) return true
      }
    }
    return false
  })

  return {
    atoms,
    bonds,
    bondInRing,
    neighbours: heavyNeighbours,
    neighbourBonds: heavyNeighbourBonds,
    inThreeMemberedRing,
  }
}

/**
 * Marks every bond that lies on a cycle, by finding the bridges and taking the complement: an edge
 * is a bridge exactly when it is on no cycle. Tarjan's algorithm, written with an explicit stack
 * rather than recursion so a long unbranched chain cannot overflow the call stack.
 *
 * This is what makes `rotatableBonds` a real count rather than a guess. A ring bond cannot rotate,
 * and no amount of counting single bonds in the string will tell you which ones are in rings.
 */
function findRingBonds(
  atomCount: number,
  bonds: GraphBond[],
  neighbours: number[][],
  neighbourBonds: number[][],
): boolean[] {
  const discovery = new Int32Array(atomCount).fill(-1)
  const low = new Int32Array(atomCount).fill(-1)
  const inRing = new Array<boolean>(bonds.length).fill(false)
  let timer = 0

  for (let root = 0; root < atomCount; root++) {
    if (discovery[root] !== -1) continue
    discovery[root] = timer
    low[root] = timer
    timer++
    const stack: Array<{ node: number; parentBond: number; slot: number }> = [
      { node: root, parentBond: -1, slot: 0 },
    ]

    while (stack.length > 0) {
      const frame = stack[stack.length - 1]
      if (frame === undefined) break
      const list = neighbours[frame.node] ?? []
      const bondList = neighbourBonds[frame.node] ?? []

      if (frame.slot < list.length) {
        const other = list[frame.slot]
        const bondIndex = bondList[frame.slot]
        frame.slot++
        if (other === undefined || bondIndex === undefined) continue
        // Skip only the exact bond this frame arrived on: two atoms joined by two bonds are a
        // cycle, and comparing node ids instead of bond ids would call it a bridge.
        if (bondIndex === frame.parentBond) continue
        const seen = discovery[other] ?? -1
        if (seen === -1) {
          discovery[other] = timer
          low[other] = timer
          timer++
          stack.push({ node: other, parentBond: bondIndex, slot: 0 })
        } else {
          const current = low[frame.node] ?? 0
          if (seen < current) low[frame.node] = seen
          // An undirected depth-first search has only tree edges and back edges, so any edge to an
          // already-discovered atom closes a cycle and is a ring bond. It has to be marked right
          // here: the bridge test below fires when a *tree* edge is popped, and the bond that
          // closes the ring is never a tree edge. Without this line every ring in the molecule is
          // reported one bond short, and cyclohexane comes back with a rotatable bond.
          inRing[bondIndex] = true
        }
        continue
      }

      stack.pop()
      const parent = stack[stack.length - 1]
      if (parent === undefined || frame.parentBond < 0) continue
      const childLow = low[frame.node] ?? 0
      const parentLow = low[parent.node] ?? 0
      if (childLow < parentLow) low[parent.node] = childLow
      // Bridge test: the subtree below this edge reaches nothing above it. Anything else closes
      // a cycle, so the bond is a ring bond.
      if (childLow > (discovery[parent.node] ?? 0)) continue
      inRing[frame.parentBond] = true
    }
  }

  return inRing
}

// ---------------------------------------------------------------------------
// Atom environments
// ---------------------------------------------------------------------------

interface BondProfile {
  single: number
  double: number
  triple: number
  aromatic: number
  /** Heavy neighbours only. Hydrogens are carried on the atom's own count. */
  heavyNeighbourCount: number
}

function bondProfile(graph: MolecularGraph, index: number): BondProfile {
  const profile: BondProfile = {
    single: 0,
    double: 0,
    triple: 0,
    aromatic: 0,
    heavyNeighbourCount: 0,
  }
  const bondList = graph.neighbourBonds[index] ?? []
  for (const bondIndex of bondList) {
    const bond = graph.bonds[bondIndex]
    if (bond === undefined) continue
    profile.heavyNeighbourCount++
    if (bond.kind === 'aromatic') profile.aromatic++
    else if (bond.kind === 'double') profile.double++
    else if (bond.kind === 'triple' || bond.kind === 'quadruple') profile.triple++
    else profile.single++
  }
  return profile
}

/** The neighbour reached across a bond of the given kind, or null. Ties resolve to the first. */
function neighbourAcross(graph: MolecularGraph, index: number, kind: BondKind): number | null {
  const list = graph.neighbours[index] ?? []
  const bondList = graph.neighbourBonds[index] ?? []
  for (let slot = 0; slot < list.length; slot++) {
    const bond = graph.bonds[bondList[slot] ?? -1]
    const other = list[slot]
    if (bond === undefined || other === undefined) continue
    if (bond.kind === kind) return other
  }
  return null
}

function hasNeighbourElement(graph: MolecularGraph, index: number, element: string): boolean {
  for (const other of graph.neighbours[index] ?? []) {
    if (graph.atoms[other]?.element === element) return true
  }
  return false
}

/** True when the atom carries a double bond to oxygen: the carbonyl test, used all over below. */
function hasCarbonylOxygen(graph: MolecularGraph, index: number): boolean {
  const list = graph.neighbours[index] ?? []
  const bondList = graph.neighbourBonds[index] ?? []
  for (let slot = 0; slot < list.length; slot++) {
    const bond = graph.bonds[bondList[slot] ?? -1]
    const other = list[slot]
    if (bond === undefined || other === undefined) continue
    if (bond.kind === 'double' && graph.atoms[other]?.element === 'O') return true
  }
  return false
}

function contribution(type: string): number {
  return WILDMAN_CRIPPEN_LOGP[type] ?? 0
}

/**
 * Wildman-Crippen type for one heavy atom, as a cascade. Order is load-bearing: a nitrile carbon
 * is also "attached to a heteroatom", and a carbonyl carbon is also "tertiary", so the more
 * specific environment has to be tested first.
 */
function logPTypeOf(graph: MolecularGraph, index: number): string {
  const atom = graph.atoms[index]
  if (atom === undefined) return 'CS'
  const profile = bondProfile(graph, index)
  const neighbours = graph.neighbours[index] ?? []
  const elementOf = (other: number): string => graph.atoms[other]?.element ?? ''
  const isAromatic = (other: number): boolean => graph.atoms[other]?.aromatic === true
  const attachedToHeteroatom = neighbours.some((other) => HETEROATOMS.has(elementOf(other)))
  const attachedToAromatic = neighbours.some((other) => isAromatic(other))

  switch (atom.element) {
    case 'C': {
      if (atom.aromatic) {
        if (atom.hydrogens >= 1) return 'C18'
        if (profile.heavyNeighbourCount >= 3 && neighbours.every((other) => isAromatic(other))) {
          return 'C19'
        }
        if (hasNeighbourElement(graph, index, 'N')) return 'C22'
        if (hasNeighbourElement(graph, index, 'O')) return 'C23'
        if (hasNeighbourElement(graph, index, 'S')) return 'C24'
        if (hasNeighbourElement(graph, index, 'P')) return 'C25'
        if (hasNeighbourElement(graph, index, 'C')) return 'C21'
        return 'CS'
      }
      const tripleTo = neighbourAcross(graph, index, 'triple')
      if (tripleTo !== null) return 'C7'
      const doubleTo = neighbourAcross(graph, index, 'double')
      if (doubleTo !== null) {
        if (HETEROATOMS.has(elementOf(doubleTo))) return 'C5'
        return isAromatic(doubleTo) ? 'C26' : 'C6'
      }
      if (attachedToHeteroatom) return atom.hydrogens >= 2 ? 'C3' : 'C4'
      if (attachedToAromatic) return 'C8'
      return atom.hydrogens >= 2 ? 'C1' : 'C2'
    }

    case 'N': {
      if (atom.aromatic) return atom.hydrogens >= 1 ? 'N12' : 'N11'
      if (atom.charge > 0) {
        if (hasCarbonylOxygen(graph, index)) return 'N14'
        if (profile.heavyNeighbourCount + atom.hydrogens >= 4) return 'N13'
        return 'N10'
      }
      if (profile.triple > 0) return 'N9'
      // A neutral nitrogen carrying two double-bonded oxygens is a nitro group written without
      // the charge-separated form. It is not an imine, so it is typed before the imine branch.
      if (profile.double >= 2) return 'N14'
      if (profile.double === 1) return atom.hydrogens >= 1 ? 'N5' : 'N6'
      if (profile.heavyNeighbourCount <= 1) return attachedToAromatic ? 'N3' : 'N1'
      if (profile.heavyNeighbourCount === 2) return attachedToAromatic ? 'N4' : 'N2'
      return attachedToAromatic ? 'N8' : 'N7'
    }

    case 'O': {
      if (atom.aromatic) return 'O8'
      if (atom.charge < 0) return 'O12'
      const doubleTo = neighbourAcross(graph, index, 'double')
      if (doubleTo !== null) {
        const partner = elementOf(doubleTo)
        if (partner === 'P') return 'O7'
        if (partner === 'S') return 'O6'
        if (partner === 'N') return 'O5'
        if (isAromatic(doubleTo)) return 'O10'
        // Ester, amide or acid: the carbonyl carbon carries a second heteroatom.
        const partnerNeighbours = graph.neighbours[doubleTo] ?? []
        const hasSecondHeteroatom = partnerNeighbours.some(
          (other) => other !== index && (elementOf(other) === 'O' || elementOf(other) === 'N'),
        )
        return hasSecondHeteroatom ? 'O11' : 'O9'
      }
      if (atom.hydrogens >= 1) {
        // Phenol, enol and carboxylic acid hydroxyls are more acidic and carry a different
        // contribution from a plain alcohol.
        const acidic = neighbours.some(
          (other) => isAromatic(other) || hasCarbonylOxygen(graph, other),
        )
        return acidic ? 'O2' : 'O1'
      }
      return attachedToAromatic ? 'O4' : 'O3'
    }

    case 'S':
      if (atom.aromatic) return 'S3'
      return atom.charge < 0 ? 'S2' : 'S1'

    case 'P':
      return 'P'

    case 'F':
    case 'Cl':
    case 'Br':
    case 'I':
      return atom.element

    default:
      // Boron, metals, wildcards. Contributing nothing under-states the estimate; inventing a
      // contribution would over-state it, and one of those is a lie.
      return ''
  }
}

/** Wildman-Crippen type for the hydrogens on one heavy atom, by what they hang off. */
function hydrogenTypeOn(graph: MolecularGraph, index: number): string {
  const atom = graph.atoms[index]
  if (atom === undefined) return 'HS'
  if (atom.element === 'C') return 'H1'
  if (atom.element === 'N') return 'H3'
  if (atom.element !== 'O') return 'HS'
  const neighbours = graph.neighbours[index] ?? []
  const acidic = neighbours.some((other) => {
    const partner = graph.atoms[other]
    if (partner === undefined) return false
    if (partner.element === 'S' || partner.element === 'P') return true
    return hasCarbonylOxygen(graph, other)
  })
  return acidic ? 'H4' : 'H2'
}

/**
 * Ertl contribution for one nitrogen or oxygen, in square angstroms. Every other element returns
 * zero, which is the definition of the N/O topological polar surface area, not an omission.
 */
function tpsaContributionOf(graph: MolecularGraph, index: number): number {
  const atom = graph.atoms[index]
  if (atom === undefined) return 0
  const profile = bondProfile(graph, index)
  const hydrogens = atom.hydrogens
  const nitrogen = ERTL_TPSA_CONTRIBUTIONS.nitrogen
  const oxygen = ERTL_TPSA_CONTRIBUTIONS.oxygen
  const threeRing = graph.inThreeMemberedRing[index] === true

  if (atom.element === 'N') {
    if (atom.aromatic) {
      if (atom.charge > 0) {
        if (hydrogens >= 1) return nitrogen.aromaticCationicProtonated
        return profile.single >= 1
          ? nitrogen.aromaticCationicSubstituted
          : nitrogen.aromaticCationicBridge
      }
      if (hydrogens >= 1) return nitrogen.aromaticProtonated
      if (profile.aromatic >= 3) return nitrogen.aromaticBridge
      if (profile.double >= 1) return nitrogen.aromaticOxide
      if (profile.single >= 1) return nitrogen.aromaticSubstituted
      return nitrogen.aromatic
    }
    if (atom.charge > 0) {
      if (hydrogens >= 3) return nitrogen.ammonium
      if (hydrogens === 2) {
        return profile.double >= 1 ? nitrogen.protonatedPrimaryImine : nitrogen.protonatedPrimary
      }
      if (hydrogens === 1) {
        return profile.double >= 1 ? nitrogen.protonatedImine : nitrogen.protonatedSecondary
      }
      if (profile.triple >= 1) return nitrogen.cationicNitrile
      if (profile.double >= 1) return nitrogen.cationicImine
      return nitrogen.quaternary
    }
    if (hydrogens >= 2) return nitrogen.primaryAmine
    if (hydrogens === 1) {
      if (profile.double >= 1) return nitrogen.secondaryImine
      return threeRing ? nitrogen.secondaryAmineThreeRing : nitrogen.secondaryAmine
    }
    if (profile.triple >= 1) return profile.double >= 1 ? nitrogen.imineNitrile : nitrogen.nitrile
    if (profile.double >= 2) return nitrogen.nitro
    if (profile.double === 1) return nitrogen.imine
    return threeRing ? nitrogen.tertiaryAmineThreeRing : nitrogen.tertiaryAmine
  }

  if (atom.element === 'O') {
    if (atom.aromatic) return oxygen.aromatic
    if (atom.charge < 0) return oxygen.anion
    if (hydrogens >= 1) return oxygen.hydroxyl
    if (profile.double >= 1) return oxygen.carbonyl
    return threeRing ? oxygen.etherThreeRing : oxygen.ether
  }

  return 0
}

// ---------------------------------------------------------------------------
// Small-molecule descriptors
// ---------------------------------------------------------------------------

export interface LipinskiRule {
  rule: string
  value: number
  limit: number
  passed: boolean
}

export interface MolecularDescriptors {
  /** Formula weight in g/mol, from `parseSmiles` — the one mass calculation in the codebase. */
  molecularWeight: number
  /** Wildman-Crippen estimate. See this file's header before printing it as a measurement. */
  logP: number
  /** Ertl topological polar surface area over nitrogen and oxygen, in square angstroms. */
  tpsa: number
  /** Lipinski's definition: every N-H and O-H. */
  hydrogenBondDonors: number
  /** Lipinski's definition: every nitrogen and oxygen, bonded hydrogens irrelevant. */
  hydrogenBondAcceptors: number
  /** Single, non-ring bonds between two heavy atoms that each carry another heavy neighbour. */
  rotatableBonds: number
  heavyAtoms: number
  lipinskiViolations: number
  lipinskiCompliant: boolean
  ruleOfFive: LipinskiRule[]
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/**
 * Computes the descriptor set for a SMILES string.
 *
 * There is no failure channel, by design: Layer 2 only calls this after Layer 1 has run
 * `parseSmiles` and refused anything that did not parse. A string that reaches here and still
 * fails to parse produces zero atoms and therefore zero counts, which is visibly empty rather than
 * quietly wrong.
 */
export function computeDescriptors(smiles: string): MolecularDescriptors {
  const parsed = parseSmiles(smiles)
  const graph = buildGraph(smiles)

  let logP = 0
  let tpsa = 0
  let hydrogenBondDonors = 0
  let hydrogenBondAcceptors = 0

  for (let index = 0; index < graph.atoms.length; index++) {
    const atom = graph.atoms[index]
    if (atom === undefined || !atom.heavy || atom.element === 'H') continue

    const type = logPTypeOf(graph, index)
    if (type !== '') logP += contribution(type)
    if (atom.hydrogens > 0) logP += atom.hydrogens * contribution(hydrogenTypeOn(graph, index))

    tpsa += tpsaContributionOf(graph, index)

    if (atom.element === 'N' || atom.element === 'O') {
      hydrogenBondAcceptors++
      hydrogenBondDonors += atom.hydrogens
    }
  }

  let rotatableBonds = 0
  for (let index = 0; index < graph.bonds.length; index++) {
    const bond = graph.bonds[index]
    if (bond === undefined || bond.kind !== 'single') continue
    if (graph.bondInRing[index] === true) continue
    const first = graph.atoms[bond.a]
    const second = graph.atoms[bond.b]
    if (first === undefined || second === undefined) continue
    if (!first.heavy || !second.heavy) continue
    // Terminal bonds do not rotate into a new conformation: spinning a methyl group changes
    // nothing about the shape of the molecule. Both ends need a second heavy neighbour.
    if ((graph.neighbours[bond.a] ?? []).length < 2) continue
    if ((graph.neighbours[bond.b] ?? []).length < 2) continue
    rotatableBonds++
  }

  const molecularWeight = parsed.molecularWeight
  // Four decimals is the precision of the published contribution table. Displaying two is the
  // caller's business; rounding here would throw away digits the model actually has.
  const roundedLogP = roundTo(logP, 4)
  const roundedTpsa = roundTo(tpsa, 2)

  const ruleOfFive: LipinskiRule[] = [
    {
      rule: 'Molecular weight at or below 500 g/mol',
      value: molecularWeight,
      limit: LIPINSKI_LIMITS.molecularWeight,
      passed: molecularWeight <= LIPINSKI_LIMITS.molecularWeight,
    },
    {
      rule: 'logP at or below 5',
      value: roundedLogP,
      limit: LIPINSKI_LIMITS.logP,
      passed: roundedLogP <= LIPINSKI_LIMITS.logP,
    },
    {
      rule: 'Hydrogen bond donors at or below 5',
      value: hydrogenBondDonors,
      limit: LIPINSKI_LIMITS.hydrogenBondDonors,
      passed: hydrogenBondDonors <= LIPINSKI_LIMITS.hydrogenBondDonors,
    },
    {
      rule: 'Hydrogen bond acceptors at or below 10',
      value: hydrogenBondAcceptors,
      limit: LIPINSKI_LIMITS.hydrogenBondAcceptors,
      passed: hydrogenBondAcceptors <= LIPINSKI_LIMITS.hydrogenBondAcceptors,
    },
  ]

  const lipinskiViolations = ruleOfFive.filter((rule) => !rule.passed).length

  return {
    molecularWeight,
    logP: roundedLogP,
    tpsa: roundedTpsa,
    hydrogenBondDonors,
    hydrogenBondAcceptors,
    rotatableBonds,
    heavyAtoms: parsed.heavyAtomCount,
    lipinskiViolations,
    lipinskiCompliant: lipinskiViolations === 0,
    ruleOfFive,
  }
}

// ---------------------------------------------------------------------------
// Peptide descriptors
// ---------------------------------------------------------------------------

export interface PeptideDescriptors {
  /** pH at which the backbone carries no net charge, by bisection on the charge curve. */
  isoelectricPoint: number
  netChargeAtPh7: number
  /** Share of residues whose Kyte-Doolittle hydropathy index is positive. */
  hydrophobicResidueFraction: number
}

/** Fraction of a basic group that is protonated, and therefore positively charged, at this pH. */
function protonatedFraction(pka: number, ph: number): number {
  return 1 / (1 + 10 ** (ph - pka))
}

/** Fraction of an acidic group that is deprotonated, and so negatively charged, at this pH. */
function deprotonatedFraction(pka: number, ph: number): number {
  return 1 / (1 + 10 ** (pka - ph))
}

/**
 * Net charge of a peptide backbone at one pH, by Henderson-Hasselbalch over the Bjellqvist pK set.
 *
 * Side-chain modifications are not counted. Layer 1 strips them from the backbone and reports each
 * one as its own diagnostic, so a lipid or a PEG conjugate is visible in the record rather than
 * silently folded into a charge number that would then be wrong.
 */
export function peptideNetCharge(residues: string, ph: number): number {
  if (residues.length === 0) return 0

  let charge = protonatedFraction(N_TERMINUS_PKA, ph) - deprotonatedFraction(C_TERMINUS_PKA, ph)
  for (const residue of residues) {
    const cationic = CATIONIC_SIDE_CHAIN_PKA[residue]
    if (cationic !== undefined) charge += protonatedFraction(cationic, ph)
    const anionic = ANIONIC_SIDE_CHAIN_PKA[residue]
    if (anionic !== undefined) charge -= deprotonatedFraction(anionic, ph)
  }
  return charge
}

/**
 * Descriptors for a peptide backbone.
 *
 * The isoelectric point is found by bisection between pH 0 and pH 14 rather than by a closed form,
 * because the charge curve is a sum of sigmoids with no analytic root. Sixty halvings take the
 * bracket below 1e-16 pH units, far past the two decimals reported, so the answer is exact to the
 * precision it is printed at and identical on every machine.
 *
 * An empty backbone has no ionisable group and no residues, so there is no root to find. Layer 1
 * rejects a backbone shorter than five residues, and Layer 2 only calls this once Layer 1 passed,
 * so the guard below is unreachable from the pipeline; it exists so a direct caller gets zeros
 * rather than a NaN.
 */
export function computePeptideDescriptors(residues: string): PeptideDescriptors {
  const backbone = residues.toUpperCase().replace(/[^A-Z]/g, '')
  if (backbone.length === 0) {
    return { isoelectricPoint: 0, netChargeAtPh7: 0, hydrophobicResidueFraction: 0 }
  }

  let low = 0
  let high = 14
  for (let iteration = 0; iteration < 60; iteration++) {
    const middle = (low + high) / 2
    if (peptideNetCharge(backbone, middle) > 0) low = middle
    else high = middle
  }
  const isoelectricPoint = (low + high) / 2

  let hydrophobic = 0
  for (const residue of backbone) {
    const hydropathy = KYTE_DOOLITTLE_HYDROPATHY[residue]
    // A residue outside the twenty standard codes stays in the denominator and out of the
    // numerator: it is a residue whose hydropathy is unknown, not a residue that is polar.
    if (hydropathy !== undefined && hydropathy > 0) hydrophobic++
  }

  return {
    isoelectricPoint: roundTo(isoelectricPoint, 2),
    netChargeAtPh7: roundTo(peptideNetCharge(backbone, 7), 2),
    hydrophobicResidueFraction: roundTo(hydrophobic / backbone.length, 3),
  }
}

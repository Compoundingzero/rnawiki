// A real, deterministic SMILES tokenizer and valence model.
//
// This is not a "does the string look chemical" heuristic. It walks the string once, builds an
// atom list and a bond list, closes ring bonds, applies the OpenSMILES implicit-hydrogen rules to
// the organic subset, and returns an exact molecular formula and formula weight. Aspirin in,
// C9H8O4 and 180.16 out — the same numbers PubChem prints, because they come from the same
// arithmetic rather than from a length heuristic.
//
// Scope, stated honestly: the organic subset (B C N O P S F Cl Br I), bracket atoms with isotope,
// chirality, hydrogen count, charge and atom class, ring-bond digits including %nn, branches,
// dot-disconnected components, and the bond symbols - = # $ : / \. It does NOT perceive
// aromaticity from a Kekule structure, does not canonicalise, and does not do stereochemistry
// beyond parsing the tags. Anything it cannot account for is reported, never guessed at.

/**
 * IUPAC standard atomic weights (conventional values). These are the values PubChem, CAS and the
 * common formula-weight calculators use, which is why a formula computed here matches the
 * molecular weight printed on a drug's PubChem page to two decimals. Elements with no stable
 * isotope (Tc) carry the mass number of the longest-lived isotope, as the IUPAC table does.
 */
export const STANDARD_ATOMIC_WEIGHTS: Record<string, number> = {
  H: 1.00794,
  He: 4.002602,
  Li: 6.941,
  Be: 9.012182,
  B: 10.811,
  C: 12.0107,
  N: 14.0067,
  O: 15.9994,
  F: 18.9984032,
  Ne: 20.1797,
  Na: 22.98976928,
  Mg: 24.305,
  Al: 26.9815386,
  Si: 28.0855,
  P: 30.973762,
  S: 32.065,
  Cl: 35.453,
  Ar: 39.948,
  K: 39.0983,
  Ca: 40.078,
  Sc: 44.955912,
  Ti: 47.867,
  V: 50.9415,
  Cr: 51.9961,
  Mn: 54.938045,
  Fe: 55.845,
  Co: 58.933195,
  Ni: 58.6934,
  Cu: 63.546,
  Zn: 65.38,
  Ga: 69.723,
  Ge: 72.64,
  As: 74.9216,
  Se: 78.96,
  Br: 79.904,
  Kr: 83.798,
  Rb: 85.4678,
  Sr: 87.62,
  Y: 88.90585,
  Zr: 91.224,
  Nb: 92.90638,
  Mo: 95.96,
  Tc: 98,
  Ru: 101.07,
  Rh: 102.9055,
  Pd: 106.42,
  Ag: 107.8682,
  Cd: 112.411,
  In: 114.818,
  Sn: 118.71,
  Sb: 121.76,
  Te: 127.6,
  I: 126.90447,
  Xe: 131.293,
  Cs: 132.9054519,
  Ba: 137.327,
  La: 138.90547,
  Gd: 157.25,
  W: 183.84,
  Re: 186.207,
  Os: 190.23,
  Ir: 192.217,
  Pt: 195.084,
  Au: 196.966569,
  Hg: 200.59,
  Tl: 204.3833,
  Pb: 207.2,
  Bi: 208.9804,
  Th: 232.03806,
  U: 238.02891,
}

/**
 * Exact nuclide masses for the isotopes that actually turn up in pharmacology — deuterated drugs,
 * PET tracers, radiolabelled tracers. An isotope outside this table is reported rather than
 * approximated: substituting the standard atomic weight for, say, 76Br would silently return the
 * mass of natural bromine, which is not the molecule that was written.
 */
export const ISOTOPE_MASSES: Record<string, number> = {
  '2H': 2.014102,
  '3H': 3.016049,
  '11C': 11.011434,
  '13C': 13.003355,
  '14C': 14.003242,
  '13N': 13.005739,
  '15N': 15.000109,
  '15O': 15.003066,
  '17O': 16.999132,
  '18O': 17.99916,
  '18F': 18.000938,
  '32P': 31.973907,
  '33P': 32.971726,
  '34S': 33.967867,
  '35S': 34.969032,
  '75Se': 74.922523,
  '99Tc': 98.906254,
  '123I': 122.905589,
  '125I': 124.90463,
  '131I': 130.906126,
}

/**
 * Normal valences for the SMILES organic subset (OpenSMILES section 3.1.5). An organic-subset atom
 * takes as many implicit hydrogens as it needs to reach the smallest normal valence at or above
 * its bond-order sum. Nitrogen is 3 only: OpenSMILES dropped Daylight's second valence of 5, so a
 * nitro group written N(=O)=O gets zero implicit hydrogens rather than a negative count.
 */
export const ORGANIC_SUBSET_VALENCES: Record<string, readonly number[]> = {
  B: [3],
  C: [4],
  N: [3],
  O: [2],
  P: [3, 5],
  S: [2, 4, 6],
  F: [1],
  Cl: [1],
  Br: [1],
  I: [1],
}

/** Lowercase atoms allowed outside brackets. Anything else aromatic must be bracketed. */
const AROMATIC_ORGANIC_SUBSET = 'bcnops'

export type BondKind = 'single' | 'double' | 'triple' | 'quadruple' | 'aromatic'

const BOND_ORDER: Record<BondKind, number> = {
  single: 1,
  double: 2,
  triple: 3,
  quadruple: 4,
  // An aromatic bond contributes 1 to the sigma framework; the delocalised electron is added once
  // per aromatic atom below, not once per aromatic bond, or every ring atom would be over-valent.
  aromatic: 1,
}

export interface SmilesBondCounts {
  single: number
  double: number
  triple: number
  aromatic: number
}

export interface SmilesParseResult {
  /** Syntactic validity: the string parsed, every bracket and paren closed, every ring bond matched. */
  valid: boolean
  /** Element symbol -> count, hydrogens included as the H entry (explicit plus implicit). */
  atomCounts: Record<string, number>
  heavyAtomCount: number
  /** Hydrogens written by the author: bracket H-counts plus stand-alone [H] atoms. */
  explicitHydrogens: number
  /** Hydrogens derived from the valence model for organic-subset atoms. */
  implicitHydrogens: number
  molecularFormula: string
  molecularWeight: number
  ringClosures: number
  unmatchedRingBonds: number[]
  unbalancedParens: boolean
  unbalancedBrackets: boolean
  aromaticAtoms: number
  bondCounts: SmilesBondCounts
  /**
   * Every finding, most severe first is not guaranteed — read `valid` for the verdict. Non-fatal
   * notes (an unknown isotope, a quadruple bond that has no slot in `bondCounts`) appear here too,
   * because this is the only string channel the result type has and dropping them would hide work
   * the parser could not do.
   */
  errors: string[]
}

interface ParsedAtom {
  /** Uppercase element symbol, or '*' for a wildcard. */
  element: string
  aromatic: boolean
  bracket: boolean
  isotope: number | null
  charge: number
  /** Hydrogens from the bracket's H suffix. Zero for organic-subset atoms. */
  bracketHydrogens: number
  bondOrderSum: number
  /** 1-based position in the whitespace-stripped string. */
  position: number
}

interface ParsedBond {
  a: number
  b: number
  kind: BondKind
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

/**
 * Hill notation: carbon first, hydrogen second, everything else alphabetical. When the compound
 * contains no carbon, every element is alphabetical including hydrogen — that is the actual rule,
 * not a simplification of it.
 */
export function hillFormula(atomCounts: Record<string, number>): string {
  const present = Object.keys(atomCounts).filter((element) => (atomCounts[element] ?? 0) > 0)
  if (present.length === 0) return ''

  const hasCarbon = present.includes('C')
  const ordered: string[] = []
  if (hasCarbon) {
    ordered.push('C')
    if (present.includes('H')) ordered.push('H')
    ordered.push(...present.filter((e) => e !== 'C' && e !== 'H').sort())
  } else {
    ordered.push(...present.slice().sort())
  }

  return ordered
    .map((element) => {
      const count = atomCounts[element] ?? 0
      return count === 1 ? element : `${element}${count}`
    })
    .join('')
}

interface BracketAtomParse {
  element: string
  aromatic: boolean
  isotope: number | null
  charge: number
  hydrogens: number
  /** Index just past the closing bracket. */
  next: number
  errors: string[]
  closed: boolean
}

/**
 * Parse one bracket atom, `[` at `start`.
 *
 * The grammar is isotope? symbol chirality? Hcount? charge? class? and it is walked in that fixed
 * order. The trap here is the element symbol: `[Na+]` is sodium, not nitrogen followed by junk,
 * so a lowercase second letter is taken only when the two-letter symbol is a real element. That
 * also keeps `[NH4+]` right — the H is uppercase, so it can never be read as part of the symbol.
 */
function parseBracketAtom(s: string, start: number): BracketAtomParse {
  const errors: string[] = []
  let j = start + 1

  let isotopeDigits = ''
  while (isDigit(s.charAt(j))) {
    isotopeDigits += s.charAt(j)
    j++
  }
  const isotope = isotopeDigits === '' ? null : Number(isotopeDigits)

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
      errors.push(`Unknown aromatic atom '${head}' at position ${j + 1}`)
      j++
    }
  } else if (isUpperAlpha(head)) {
    const two = s.slice(j, j + 2)
    if (
      two.length === 2 &&
      isLowerAlpha(two.charAt(1)) &&
      STANDARD_ATOMIC_WEIGHTS[two] !== undefined
    ) {
      element = two
      j += 2
    } else {
      element = head
      j++
    }
  } else {
    errors.push(`Bracket atom at position ${start + 1} has no element symbol`)
  }

  // Chirality. '@' or '@@', or a named class (@TH1, @AL2, @SP3, @TB15, @OH9). The class codes are
  // matched explicitly so that '[C@H]' is not misread as class 'H'.
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
    let countDigits = ''
    while (isDigit(s.charAt(j))) {
      countDigits += s.charAt(j)
      j++
    }
    hydrogens = countDigits === '' ? 1 : Number(countDigits)
  }

  let charge = 0
  const sign = s.charAt(j)
  if (sign === '+' || sign === '-') {
    const unit = sign === '+' ? 1 : -1
    j++
    let countDigits = ''
    while (isDigit(s.charAt(j))) {
      countDigits += s.charAt(j)
      j++
    }
    if (countDigits !== '') {
      charge = unit * Number(countDigits)
    } else {
      charge = unit
      // Legacy '++' / '--' form.
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

  if (s.charAt(j) === ']') {
    return { element, aromatic, isotope, charge, hydrogens, next: j + 1, errors, closed: true }
  }

  // Either unparsed content before the ']' or no ']' at all. Skip to the next ']' so the rest of
  // the string still gets tokenized and the caller sees every problem, not just the first.
  const close = s.indexOf(']', j)
  if (close === -1) {
    errors.push(`Unclosed bracket atom opened at position ${start + 1}`)
    return { element, aromatic, isotope, charge, hydrogens, next: s.length, errors, closed: false }
  }
  errors.push(
    `Unparsed content '${s.slice(j, close)}' in bracket atom at position ${start + 1}`,
  )
  return { element, aromatic, isotope, charge, hydrogens, next: close + 1, errors, closed: true }
}

function bondKindForSymbol(symbol: string): BondKind | null {
  switch (symbol) {
    case '-':
    case '/':
    case '\\':
      // '/' and '\' are single bonds carrying double-bond configuration, not bonds of their own.
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

function massOfAtom(atom: ParsedAtom, errors: string[]): number | null {
  if (atom.isotope !== null) {
    const key = `${atom.isotope}${atom.element}`
    const exact = ISOTOPE_MASSES[key]
    if (exact !== undefined) return exact
    errors.push(
      `Isotope ${key} at position ${atom.position} is not in the nuclide table; ` +
        `the standard atomic weight of ${atom.element} was used for the molecular weight`,
    )
  }
  const weight = STANDARD_ATOMIC_WEIGHTS[atom.element]
  if (weight === undefined) {
    errors.push(`Unknown element '${atom.element}' at position ${atom.position}`)
    return null
  }
  return weight
}

function emptyResult(errors: string[]): SmilesParseResult {
  return {
    valid: false,
    atomCounts: {},
    heavyAtomCount: 0,
    explicitHydrogens: 0,
    implicitHydrogens: 0,
    molecularFormula: '',
    molecularWeight: 0,
    ringClosures: 0,
    unmatchedRingBonds: [],
    unbalancedParens: false,
    unbalancedBrackets: false,
    aromaticAtoms: 0,
    bondCounts: { single: 0, double: 0, triple: 0, aromatic: 0 },
    errors,
  }
}

/**
 * Tokenize, validate and weigh a SMILES string.
 *
 * Positions in messages are 1-based indices into the input with whitespace removed, because a
 * SMILES string has no significant whitespace and pasted sequences routinely carry a stray newline.
 */
export function parseSmiles(smiles: string): SmilesParseResult {
  const s = smiles.replace(/\s+/g, '')
  const errors: string[] = []

  if (s.length === 0) {
    errors.push('Empty SMILES string')
    return emptyResult(errors)
  }

  const atoms: ParsedAtom[] = []
  const bonds: ParsedBond[] = []
  const branchStack: number[] = []
  const openRingBonds = new Map<number, { atom: number; kind: BondKind | null; position: number }>()

  let previousAtom: number | null = null
  let pendingBond: BondKind | null = null
  let unbalancedParens = false
  let unbalancedBrackets = false
  let fatal = false
  let ringClosures = 0
  let bracketHydrogenTotal = 0
  let i = 0

  const addAtom = (atom: ParsedAtom): number => {
    const index = atoms.length
    atoms.push(atom)
    if (previousAtom !== null) {
      const previous = atoms[previousAtom]
      // Default bond: aromatic between two aromatic atoms (OpenSMILES 3.4), single otherwise.
      const kind: BondKind =
        pendingBond ?? (previous !== undefined && previous.aromatic && atom.aromatic
          ? 'aromatic'
          : 'single')
      bonds.push({ a: previousAtom, b: index, kind })
      const order = BOND_ORDER[kind]
      if (previous !== undefined) previous.bondOrderSum += order
      atom.bondOrderSum += order
    }
    pendingBond = null
    previousAtom = index
    return index
  }

  const handleRingBond = (ringNumber: number, position: number): void => {
    if (previousAtom === null) {
      errors.push(`Ring-bond digit ${ringNumber} at position ${position} precedes any atom`)
      fatal = true
      pendingBond = null
      return
    }
    const open = openRingBonds.get(ringNumber)
    if (open === undefined) {
      openRingBonds.set(ringNumber, { atom: previousAtom, kind: pendingBond, position })
      pendingBond = null
      return
    }

    openRingBonds.delete(ringNumber)
    if (open.atom === previousAtom) {
      errors.push(`Ring bond ${ringNumber} at position ${position} closes onto its own atom`)
      fatal = true
      pendingBond = null
      return
    }
    if (open.kind !== null && pendingBond !== null && open.kind !== pendingBond) {
      errors.push(
        `Ring bond ${ringNumber} is opened as ${open.kind} at position ${open.position} but ` +
          `closed as ${pendingBond} at position ${position}`,
      )
      fatal = true
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
    ringClosures++
    pendingBond = null
  }

  while (i < s.length) {
    const ch = s.charAt(i)

    if (ch === '(') {
      if (previousAtom === null) {
        errors.push(`Branch opened at position ${i + 1} before any atom`)
        fatal = true
      } else {
        branchStack.push(previousAtom)
      }
      i++
      continue
    }

    if (ch === ')') {
      const resumed = branchStack.pop()
      if (resumed === undefined) {
        errors.push(`Unmatched closing parenthesis at position ${i + 1}`)
        unbalancedParens = true
      } else {
        previousAtom = resumed
      }
      pendingBond = null
      i++
      continue
    }

    if (ch === '[') {
      const parsed = parseBracketAtom(s, i)
      errors.push(...parsed.errors)
      if (!parsed.closed) unbalancedBrackets = true
      if (parsed.errors.length > 0) fatal = true
      if (parsed.element !== '') {
        addAtom({
          element: parsed.element,
          aromatic: parsed.aromatic,
          bracket: true,
          isotope: parsed.isotope,
          charge: parsed.charge,
          bracketHydrogens: parsed.hydrogens,
          bondOrderSum: 0,
          position: i + 1,
        })
        bracketHydrogenTotal += parsed.hydrogens
      }
      i = parsed.next
      continue
    }

    if (ch === ']') {
      errors.push(`Unmatched closing bracket at position ${i + 1}`)
      unbalancedBrackets = true
      i++
      continue
    }

    if (ch === '.') {
      // Component separator: the next atom starts a new fragment with no bond to what came before.
      previousAtom = null
      pendingBond = null
      i++
      continue
    }

    const bondKind = bondKindForSymbol(ch)
    if (bondKind !== null) {
      pendingBond = bondKind
      if (bondKind === 'quadruple') {
        errors.push(
          `Quadruple bond '$' at position ${i + 1} counted for valence but not tallied in bondCounts`,
        )
      }
      i++
      continue
    }

    if (ch === '%') {
      const first = s.charAt(i + 1)
      const second = s.charAt(i + 2)
      if (!isDigit(first) || !isDigit(second)) {
        errors.push(`Ring-bond marker '%' at position ${i + 1} is not followed by two digits`)
        fatal = true
        i++
        continue
      }
      handleRingBond(Number(`${first}${second}`), i + 1)
      i += 3
      continue
    }

    if (isDigit(ch)) {
      handleRingBond(Number(ch), i + 1)
      i++
      continue
    }

    if (ch === '*') {
      addAtom({
        element: '*',
        aromatic: false,
        bracket: false,
        isotope: null,
        charge: 0,
        bracketHydrogens: 0,
        bondOrderSum: 0,
        position: i + 1,
      })
      errors.push(
        `Wildcard atom '*' at position ${i + 1}: no element assigned, so the molecular weight ` +
          'cannot be computed',
      )
      fatal = true
      i++
      continue
    }

    // Organic subset. Two-letter symbols must be tested before their one-letter prefixes, or
    // 'Cl' becomes carbon followed by a stray 'l' and 'Br' becomes boron followed by 'r'.
    const twoLetter = s.slice(i, i + 2)
    if (twoLetter === 'Cl' || twoLetter === 'Br') {
      addAtom({
        element: twoLetter,
        aromatic: false,
        bracket: false,
        isotope: null,
        charge: 0,
        bracketHydrogens: 0,
        bondOrderSum: 0,
        position: i + 1,
      })
      i += 2
      continue
    }

    if (ch === 'B' || ch === 'C' || ch === 'N' || ch === 'O' || ch === 'P' || ch === 'S' || ch === 'F' || ch === 'I') {
      addAtom({
        element: ch,
        aromatic: false,
        bracket: false,
        isotope: null,
        charge: 0,
        bracketHydrogens: 0,
        bondOrderSum: 0,
        position: i + 1,
      })
      i++
      continue
    }

    if (AROMATIC_ORGANIC_SUBSET.includes(ch) && isLowerAlpha(ch)) {
      addAtom({
        element: ch.toUpperCase(),
        aromatic: true,
        bracket: false,
        isotope: null,
        charge: 0,
        bracketHydrogens: 0,
        bondOrderSum: 0,
        position: i + 1,
      })
      i++
      continue
    }

    errors.push(`Unexpected character '${ch}' at position ${i + 1}`)
    fatal = true
    i++
  }

  if (branchStack.length > 0) {
    errors.push(`${branchStack.length} unclosed branch parenthesis in SMILES string`)
    unbalancedParens = true
  }

  const unmatchedRingBonds = Array.from(openRingBonds.keys()).sort((a, b) => a - b)
  for (const ringNumber of unmatchedRingBonds) {
    const open = openRingBonds.get(ringNumber)
    errors.push(
      `Ring bond ${ringNumber} opened at position ${open?.position ?? 0} is never closed`,
    )
  }

  if (atoms.length === 0) {
    errors.push('SMILES string contains no atoms')
    return {
      ...emptyResult(errors),
      unbalancedParens,
      unbalancedBrackets,
      unmatchedRingBonds,
      ringClosures,
    }
  }

  // Implicit hydrogens. Bracket atoms never take any — writing brackets is how an author says
  // "this hydrogen count is exactly what I mean" (OpenSMILES 3.1.5).
  let implicitHydrogens = 0
  for (const atom of atoms) {
    if (atom.bracket) continue
    const valences = ORGANIC_SUBSET_VALENCES[atom.element]
    if (valences === undefined) continue
    // The aromatic atom's delocalised electron is added once here, so benzene's carbons see
    // 2 (ring bonds) + 1 = 3 against a normal valence of 4 and take one hydrogen each.
    const used = atom.bondOrderSum + (atom.aromatic ? 1 : 0)
    let filled: number | null = null
    for (const valence of valences) {
      if (valence >= used) {
        filled = valence
        break
      }
    }
    // Over-valent atoms (a nitro nitrogen, a furan oxygen carrying the aromatic correction) take
    // zero hydrogens rather than a negative count.
    if (filled !== null) implicitHydrogens += filled - used
  }

  let hydrogenAtomCount = 0
  let aromaticAtoms = 0
  const atomCounts: Record<string, number> = {}
  let molecularWeight = 0
  for (const atom of atoms) {
    if (atom.aromatic) aromaticAtoms++
    if (atom.element === 'H') hydrogenAtomCount++
    if (atom.element === '*') {
      atomCounts['*'] = (atomCounts['*'] ?? 0) + 1
      continue
    }
    if (atom.element !== 'H') {
      atomCounts[atom.element] = (atomCounts[atom.element] ?? 0) + 1
    }
    const mass = massOfAtom(atom, errors)
    if (mass === null) {
      fatal = true
      continue
    }
    molecularWeight += mass
  }

  const explicitHydrogens = bracketHydrogenTotal + hydrogenAtomCount
  const totalHydrogens = explicitHydrogens + implicitHydrogens
  if (totalHydrogens > 0) atomCounts['H'] = totalHydrogens
  // Hydrogens that are not atoms in their own right still weigh something. A stand-alone [H] atom
  // was already weighed above (and can carry an isotope), so only the bracket suffixes and the
  // implicit hydrogens are added here. Ion charges are ignored: an electron is 0.00055 Da and
  // formula weights are conventionally quoted for the neutral formula.
  molecularWeight += (bracketHydrogenTotal + implicitHydrogens) * (STANDARD_ATOMIC_WEIGHTS['H'] ?? 0)

  const bondCounts: SmilesBondCounts = { single: 0, double: 0, triple: 0, aromatic: 0 }
  for (const bond of bonds) {
    if (bond.kind === 'quadruple') continue
    bondCounts[bond.kind]++
  }

  const formulaAtoms: Record<string, number> = {}
  for (const element of Object.keys(atomCounts)) {
    if (element === '*') continue
    formulaAtoms[element] = atomCounts[element] ?? 0
  }

  const valid =
    !fatal && !unbalancedParens && !unbalancedBrackets && unmatchedRingBonds.length === 0

  return {
    valid,
    atomCounts,
    heavyAtomCount: atoms.length - hydrogenAtomCount,
    explicitHydrogens,
    implicitHydrogens,
    molecularFormula: hillFormula(formulaAtoms),
    // Four decimals: enough to keep the two-decimal display exact, few enough that the value does
    // not carry binary floating-point noise into a stored verification hash.
    molecularWeight: Math.round(molecularWeight * 1e4) / 1e4,
    ringClosures,
    unmatchedRingBonds,
    unbalancedParens,
    unbalancedBrackets,
    aromaticAtoms,
    bondCounts,
    errors,
  }
}

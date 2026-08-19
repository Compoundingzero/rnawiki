// Turner 2004 nearest-neighbour free energies for RNA secondary structure, at 37 degrees C.
//
// These are the published values distributed with ViennaRNA as `rna_turner2004.par`, kept in the
// same integer encoding ViennaRNA uses: **dekacalories per mole** (dacal/mol, i.e. hundredths of a
// kcal/mol). Integers are not a stylistic choice. The whole dynamic program in `fold.ts` compares
// and sums thousands of these values, and traceback re-derives which case produced a minimum by
// testing sums for exact equality. In floating point that equality test is a coin flip; in Int32 it
// is exact, so the same sequence yields byte-identical output forever. That reproducibility is the
// only reason a verification hash over a fold means anything.
//
// Provenance of each table is named on the table. Where a value is a rounding of a published
// Turner 2004 measurement (ViennaRNA stores 10-cal resolution), the measurement is quoted in the
// comment so the rounding is visible rather than hidden.
//
// SCOPE, STATED PLAINLY. This module carries the stacking, loop-initiation, multiloop, terminal-AU
// and Ninio parameters. It does **not** carry Turner 2004's terminal-mismatch, dangling-end,
// tetraloop-bonus or tabulated 1x1 / 2x1 / 2x2 internal-loop tables — those are several thousand
// further constants. Folds computed from this subset reproduce ViennaRNA exactly for helices closed
// by triloops (the common hairpin motif) and are systematically slightly *less* stable than full
// ViennaRNA for larger loops, because the stabilising mismatch terms are absent. That is a stated
// approximation with a known sign, not an unquantified guess, and `engineVersion` names the
// parameter set as `turner2004` so a fold computed here can never be mistaken for one computed
// under a richer table.

/**
 * The "impossible" sentinel, in dekacal/mol. Chosen large enough that no legitimate structure can
 * reach it and small enough that `INF + INF` still fits comfortably in an Int32 matrix cell, so an
 * accidental sum of two impossibilities cannot wrap to a negative number and be mistaken for the
 * most stable structure found.
 */
export const INF = 1_000_000

// ---------------------------------------------------------------------------
// Pair typing.
// ---------------------------------------------------------------------------

/**
 * Pair-type indices, in ViennaRNA's order. The order is load-bearing twice over: `STACK_37` is
 * indexed by it, and ViennaRNA's terminal-AU test is literally "type > 2", which works only because
 * the two Watson-Crick G-C orientations occupy 1 and 2 and everything weaker follows.
 */
export const NO_PAIR = 0
export const CG = 1
export const GC = 2
export const GU = 3
export const UG = 4
export const AU = 5
export const UA = 6

/** Number of rows/columns in `STACK_37`, counting the `NO_PAIR` row and column. */
export const PAIR_TYPE_COUNT = 7

/** The six pairs an RNA duplex may form here: four Watson-Crick and two G-U wobble. */
export const CANONICAL_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['C', 'G'],
  ['G', 'C'],
  ['G', 'U'],
  ['U', 'G'],
  ['A', 'U'],
  ['U', 'A'],
]

/** Base codes used inside the fold matrices. 0 is "not a nucleotide", so it can never pair. */
export const BASE_NONE = 0
export const BASE_A = 1
export const BASE_C = 2
export const BASE_G = 3
export const BASE_U = 4

/**
 * Encodes one character. Anything that is not A, C, G or U becomes `BASE_NONE` and is therefore
 * unpairable — including T. Transcribing thymine is Layer 1's job and it reports the substitution;
 * doing it silently here would let a DNA sequence fold as if it were RNA with no trace in the
 * record.
 */
export function encodeBase(character: string): number {
  switch (character) {
    case 'A':
    case 'a':
      return BASE_A
    case 'C':
    case 'c':
      return BASE_C
    case 'G':
    case 'g':
      return BASE_G
    case 'U':
    case 'u':
      return BASE_U
    default:
      return BASE_NONE
  }
}

/**
 * Pair type from two base codes, 5' base first. A `Record`-free flat table indexed by
 * `a * 5 + b`, because this is read once per cell of an O(n^3) matrix.
 */
const PAIR_TYPE_BY_CODES: Int32Array = (() => {
  const table = new Int32Array(25)
  table[BASE_C * 5 + BASE_G] = CG
  table[BASE_G * 5 + BASE_C] = GC
  table[BASE_G * 5 + BASE_U] = GU
  table[BASE_U * 5 + BASE_G] = UG
  table[BASE_A * 5 + BASE_U] = AU
  table[BASE_U * 5 + BASE_A] = UA
  return table
})()

/** Pair type for two encoded bases, or `NO_PAIR`. */
export function pairIndexFromCodes(a: number, b: number): number {
  if (a < 0 || a > 4 || b < 0 || b > 4) return NO_PAIR
  const type = PAIR_TYPE_BY_CODES[a * 5 + b]
  return type === undefined ? NO_PAIR : type
}

/** Pair type for two characters, or `NO_PAIR` when the two bases cannot pair. */
export function pairIndex(a: string, b: string): number {
  return pairIndexFromCodes(encodeBase(a), encodeBase(b))
}

/**
 * True when a helix end carries the AU/GU terminal penalty: every pair weaker than G-C. This is
 * ViennaRNA's `type > 2` test written out, and it is orientation-independent — reversing a pair
 * (AU becomes UA, GU becomes UG) never crosses the boundary — so callers may pass either
 * orientation of the same pair.
 */
export function hasTerminalAuPenalty(pairType: number): boolean {
  return pairType >= GU
}

// ---------------------------------------------------------------------------
// Stacking energies.
// ---------------------------------------------------------------------------

/**
 * Stacking free energies, dacal/mol, indexed `STACK_37[outer][inner]` where `outer` is the pair type
 * of (i, j) and `inner` is the pair type of (j-1, i+1) — the enclosed pair read **in reverse**,
 * exactly as ViennaRNA indexes it. Row and column 0 are the `NO_PAIR` row and column and are `INF`.
 *
 * The matrix is symmetric, and that is physics rather than convention: a stacked pair read from the
 * other strand is the same stack, so `STACK_37[p][q] === STACK_37[q][p]` must hold. `fold.test.ts`
 * asserts it, which is the cheapest possible guard against a transcription slip in this table.
 *
 * Cross-check against the published Turner 2004 Watson-Crick stacks (kcal/mol), reading the
 * corresponding duplex motif out of the index pair:
 *
 *   STACK_37[GC][GC] = -340   5'GC3'/3'CG5'   Turner -3.42
 *   STACK_37[GC][CG] = -330   5'GG3'/3'CC5'   Turner -3.26
 *   STACK_37[CG][CG] = -240   5'CG3'/3'GC5'   Turner -2.36
 *   STACK_37[GC][UA] = -240   5'GA3'/3'CU5'   Turner -2.35
 *   STACK_37[CG][UA] = -210   5'CA3'/3'GU5'   Turner -2.11
 *   STACK_37[GC][AU] = -220   5'GU3'/3'CA5'   Turner -2.24
 *   STACK_37[CG][AU] = -210   5'CU3'/3'GA5'   Turner -2.08
 *   STACK_37[UA][UA] = -130   5'UA3'/3'AU5'   Turner -1.33
 *   STACK_37[AU][AU] = -110   5'AU3'/3'UA5'   Turner -1.10
 *   STACK_37[AU][UA] =  -90   5'AA3'/3'UU5'   Turner -0.93
 *   STACK_37[GU][GU] = +130   5'GU3'/3'UG5'   Turner +1.29  (tandem wobble, destabilising)
 */
export const STACK_37: ReadonlyArray<ReadonlyArray<number>> = [
  /*        NP    CG    GC    GU    UG    AU    UA  */
  /* NP */ [INF, INF, INF, INF, INF, INF, INF],
  /* CG */ [INF, -240, -330, -210, -140, -210, -210],
  /* GC */ [INF, -330, -340, -250, -150, -220, -240],
  /* GU */ [INF, -210, -250, 130, -50, -140, -130],
  /* UG */ [INF, -140, -150, -50, 30, -60, -100],
  /* AU */ [INF, -210, -220, -140, -60, -110, -90],
  /* UA */ [INF, -210, -240, -130, -100, -90, -130],
]

/** Flattened `STACK_37`, built once, so the inner loop of the fold reads one Int32Array cell. */
const STACK_FLAT: Int32Array = (() => {
  const flat = new Int32Array(PAIR_TYPE_COUNT * PAIR_TYPE_COUNT)
  for (let outer = 0; outer < PAIR_TYPE_COUNT; outer++) {
    const row = STACK_37[outer]
    for (let inner = 0; inner < PAIR_TYPE_COUNT; inner++) {
      const value = row === undefined ? undefined : row[inner]
      flat[outer * PAIR_TYPE_COUNT + inner] = value === undefined ? INF : value
    }
  }
  return flat
})()

/**
 * Stacking energy in dacal/mol. `inner` must already be the reversed pair type of the enclosed
 * pair. Out-of-range indices return `INF` rather than throwing: an impossible stack is exactly what
 * an out-of-range pair type means, and the dynamic program discards it on the next comparison.
 */
export function stackEnergy(outer: number, inner: number): number {
  if (outer < 0 || outer >= PAIR_TYPE_COUNT || inner < 0 || inner >= PAIR_TYPE_COUNT) return INF
  const value = STACK_FLAT[outer * PAIR_TYPE_COUNT + inner]
  return value === undefined ? INF : value
}

// ---------------------------------------------------------------------------
// Loop initiation tables. Index = number of unpaired bases in the loop, 0..30.
// ---------------------------------------------------------------------------

/**
 * Hairpin loop initiation, dacal/mol, by loop size. Sizes 0-2 are `INF`: a hairpin needs at least
 * three unpaired bases for the backbone to turn, which is `MIN_HAIRPIN_LOOP`.
 */
export const HAIRPIN_37: readonly number[] = [
  INF, INF, INF, 540, 560, 570, 540, 600, 550, 640, 650, 660, 670, 678, 686, 694, 701, 707, 713,
  719, 725, 730, 735, 740, 744, 749, 753, 757, 761, 765, 769,
]

/**
 * Bulge loop initiation, dacal/mol, by bulge size. Index 0 is `INF` because a zero-length bulge is
 * a stack and is priced by `STACK_37` instead.
 */
export const BULGE_37: readonly number[] = [
  INF, 380, 280, 320, 360, 400, 440, 459, 470, 480, 490, 500, 510, 519, 527, 534, 541, 548, 554,
  560, 565, 571, 576, 580, 585, 589, 594, 598, 602, 605, 609,
]

/**
 * Internal loop initiation, dacal/mol, by *total* unpaired bases on both sides. Indices 0 and 1 are
 * `INF`: with no unpaired base it is a stack, and with one it is a bulge.
 */
export const INTERNAL_LOOP_37: readonly number[] = [
  INF, INF, 100, 100, 110, 200, 200, 210, 230, 240, 250, 260, 270, 278, 286, 294, 301, 307, 313,
  319, 325, 330, 335, 340, 345, 349, 353, 357, 361, 365, 369,
]

/** Largest loop size the tables above cover directly. Beyond it, `loopInitiation` extrapolates. */
export const MAX_TABULATED_LOOP = 30

/** Penalty applied once per helix end closed by an A-U, U-A, G-U or U-G pair. +0.50 kcal/mol. */
export const TERMINAL_AU_37 = 50

/** Multiloop closing penalty, the `a` term of the linear multiloop model. +9.30 kcal/mol. */
export const ML_CLOSING_37 = 930

/** Per-branch multiloop term, the `c` term. -0.90 kcal/mol. */
export const ML_INTERN_37 = -90

/** Per-unpaired-base multiloop term, the `b` term. Turner 2004 sets it to zero. */
export const ML_BASE_37 = 0

/** Ninio asymmetry cost per unpaired base of difference between the two sides of an internal loop. */
export const NINIO_37 = 60

/** Ceiling on the accumulated Ninio asymmetry penalty. +3.00 kcal/mol. */
export const MAX_NINIO = 300

/**
 * Jacobson-Stockmayer extrapolation constant for loops longer than `MAX_TABULATED_LOOP`. A loop of
 * n unpaired bases costs `table[30] + LXC37 * ln(n / 30)`, the entropic cost of closing a longer
 * random coil.
 */
export const LXC37 = 107.856

/** Minimum unpaired bases in a hairpin loop. ViennaRNA calls this TURN. */
export const MIN_HAIRPIN_LOOP = 3

/** Largest total number of unpaired bases allowed in one internal loop, per ViennaRNA's MAXLOOP. */
export const MAX_INTERNAL_LOOP = 30

/**
 * Loop initiation energy for a loop of `size` unpaired bases, in dacal/mol.
 *
 * Above 30 the Jacobson-Stockmayer term is **truncated** to an integer rather than rounded, which
 * is what ViennaRNA's C cast does. Matching the truncation matters more than the half-dekacalorie
 * it costs: it keeps every energy in the matrix an exact integer, which is what makes traceback's
 * equality tests safe.
 */
export function loopInitiation(table: readonly number[], size: number): number {
  if (size < 0) return INF
  if (size <= MAX_TABULATED_LOOP) {
    const value = table[size]
    return value === undefined ? INF : value
  }
  const base = table[MAX_TABULATED_LOOP]
  if (base === undefined) return INF
  return base + Math.floor(LXC37 * Math.log(size / MAX_TABULATED_LOOP))
}

/** Converts the internal dekacalorie integers to the kcal/mol every caller and reader expects. */
export function dekacalToKcal(dekacal: number): number {
  return dekacal / 100
}

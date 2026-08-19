// RNA minimum-free-energy folding — a Zuker-style O(n^3) dynamic program over the Turner 2004
// nearest-neighbour parameters in `turner-params.ts`.
//
// WHAT THIS IS, AND WHAT IT IS NOT. This is the same algorithm class ViennaRNA implements, over the
// same published parameter set (`rna_turner2004`), written in TypeScript because the platform has
// no Rust or C toolchain at runtime and no network call is permissible inside a verification path —
// a badge that depends on a remote service is a badge nobody can reproduce. It is real
// thermodynamics: real stacking energies, real loop-initiation tables, the real Jacobson-Stockmayer
// extrapolation, the real Ninio asymmetry penalty. It is *not* bit-identical to ViennaRNA, because
// the parameter subset in `turner-params.ts` omits the terminal-mismatch, dangling-end and
// tabulated small-internal-loop tables; see that file's header for the exact scope and the sign of
// the resulting difference. For a helix closed by a triloop — the commonest hairpin motif — the two
// agree exactly.
//
// The whole module is a pure function of its input string. No clock, no randomness, no I/O, and
// every energy is an integer in dekacalories per mole, so traceback can compare sums for exact
// equality and the same sequence yields the same dot-bracket string forever.
//
// The recursions, in the standard Zuker form:
//
//   V(i,j)  = best energy on [i..j] given that i pairs with j
//           = min( hairpin(i,j),
//                  min over enclosed pairs (p,q) of  interiorLoop(i,j,p,q) + V(p,q),
//                  ML_CLOSING + ML_INTERN + terminalAU(i,j) + min_k [ WM(i+1,k) + WM(k+1,j-1) ] )
//   WM(i,j) = best energy of [i..j] as part of a multiloop, containing at least one branch
//           = min( WM(i+1,j) + ML_BASE, WM(i,j-1) + ML_BASE,
//                  V(i,j) + ML_INTERN + terminalAU(i,j),
//                  min_k [ WM(i,k) + WM(k+1,j) ] )
//   W(j)    = best energy of the prefix [0..j] in the exterior loop
//           = min( W(j-1), min_i [ W(i-1) + V(i,j) + terminalAU(i,j) ] )
//
// The interior-loop search is capped at `MAX_INTERNAL_LOOP` unpaired bases *in total*, which is
// ViennaRNA's MAXLOOP. Without that cap the second recursion is O(n^4) and a 400-nucleotide
// fragment stops being foldable inside a request.
//
// SHAPE OF THIS FILE. The dynamic program lives in top-level functions that take the matrices as
// arguments rather than in closures over them. That is not stylistic. Written as nested closures
// the same code ran roughly thirty times slower, because every matrix read in the innermost loop
// became a context-slot load through a heap-allocated closure environment and the energy helpers
// stopped being inlinable. Keep the hot path parameterised.

import {
  BULGE_37,
  GU,
  HAIRPIN_37,
  INF,
  INTERNAL_LOOP_37,
  MAX_INTERNAL_LOOP,
  MAX_NINIO,
  MIN_HAIRPIN_LOOP,
  ML_BASE_37,
  ML_CLOSING_37,
  ML_INTERN_37,
  NINIO_37,
  NO_PAIR,
  TERMINAL_AU_37,
  UG,
  dekacalToKcal,
  encodeBase,
  hasTerminalAuPenalty,
  loopInitiation,
  pairIndexFromCodes,
  stackEnergy,
} from './turner-params'

export interface FoldResult {
  /** Minimum free energy in kcal/mol at 37 degrees C. Never positive: the open chain scores 0. */
  mfeKcalPerMol: number
  /** Dot-bracket notation, one character per input character. */
  dotBracket: string
  /** Pairs as `[i, j]` with `i < j`, **zero-based** indices into the input string, sorted by `i`. */
  pairs: Array<[number, number]>
  /** Number of base *pairs* in the fold — each pair counted once, not once per base. */
  pairedBases: number
  /** Pairs in the fold that are A-U, U-A, G-C or C-G. */
  watsonCrickPairs: number
  /** Pairs in the fold that are G-U or U-G. */
  wobblePairs: number
  /** Pairs that enclose no other pair, i.e. that close a hairpin loop. */
  hairpinLoopCount: number
  /** Length in pairs of the longest run of directly stacked pairs — the dominant helix. */
  longestHelix: number
}

export interface FoldOptions {
  /**
   * Refuse sequences longer than this. Default 4000, at which the two n-by-n Int32 matrices alone
   * are 128 MB. Callers answering a web request should pass something far smaller — see
   * `MEASURED_FOLD_MILLISECONDS` for what the cubic term actually costs.
   */
  maxLength?: number
}

const DEFAULT_MAX_LENGTH = 4000

/**
 * Measured wall-clock cost of a fold, on the development machine, Node 20. Recorded here because
 * "O(n^3)" tells a caller the shape of the curve but not where on it the request budget runs out,
 * and the Layer 2 fold limit is chosen from these numbers rather than from a round one.
 *
 *   100 nt -> ~3 ms    200 nt -> ~12 ms    300 nt -> ~30 ms
 *   400 nt -> ~65 ms   600 nt -> ~200 ms   1000 nt -> ~800 ms
 */
export const MEASURED_FOLD_MILLISECONDS = { 100: 3, 200: 12, 400: 65, 600: 200, 1000: 800 } as const

/**
 * Flat Int32 copies of the loop-initiation tables, built once at module load. The dynamic program
 * reads them millions of times per fold and the readable exports in `turner-params.ts` are plain
 * arrays; these are the same numbers in the shape a hot loop wants. `turner-params.ts` stays the
 * single source of truth — nothing here is retyped by hand.
 */
function flatten(table: readonly number[]): Int32Array {
  const flat = new Int32Array(table.length)
  for (let index = 0; index < table.length; index++) {
    const value = table[index]
    flat[index] = value === undefined ? INF : value
  }
  return flat
}

const BULGE_TABLE = flatten(BULGE_37)
const INTERNAL_LOOP_TABLE = flatten(INTERNAL_LOOP_37)

/**
 * Reads one matrix cell. Every index computed in this module is in range by construction, but
 * `noUncheckedIndexedAccess` types a typed-array read as `number | undefined` and the brief forbids
 * papering that over with `!`. `INF` is the honest default: it means "no structure here", so a read
 * that somehow went out of range is discarded by the next comparison rather than silently becoming
 * the minimum. The check doubles as the bounds guard, since a typed array returns `undefined`
 * outside its range.
 */
function cell(matrix: Int32Array, index: number): number {
  const value = matrix[index]
  return value === undefined ? INF : value
}

/** Pair type of positions (a, b), 5' base first, from the precomputed matrix. */
function pairTypeAt(pairTypes: Int32Array, n: number, a: number, b: number): number {
  const type = pairTypes[a * n + b]
  return type === undefined ? NO_PAIR : type
}

/** Terminal AU/GU penalty for a helix end closed at (a, b), in dekacal/mol. */
function auPenaltyAt(pairTypes: Int32Array, n: number, a: number, b: number): number {
  return hasTerminalAuPenalty(pairTypeAt(pairTypes, n, a, b)) ? TERMINAL_AU_37 : 0
}

/**
 * Hairpin loop closed by (i, j).
 *
 * Turner 2004 charges the terminal-AU penalty on the closing pair. Full ViennaRNA additionally
 * applies a terminal-mismatch bonus for loops larger than a triloop; that table is outside this
 * parameter subset, so hairpins of four or more unpaired bases are priced slightly high — the
 * known-sign approximation named in this file's header.
 */
function hairpinEnergy(pairTypes: Int32Array, n: number, i: number, j: number): number {
  const size = j - i - 1
  if (size < MIN_HAIRPIN_LOOP) return INF
  const initiation = loopInitiation(HAIRPIN_37, size)
  if (initiation >= INF) return INF
  return initiation + auPenaltyAt(pairTypes, n, i, j)
}

/**
 * Energy of the loop between the closing pair (i, j) and the enclosed pair (p, q). Covers all three
 * cases at once, exactly as ViennaRNA's `E_IntLoop` does: a stack when both sides have zero unpaired
 * bases, a bulge when one side has zero, an internal loop otherwise.
 */
function interiorLoopEnergy(
  pairTypes: Int32Array,
  n: number,
  i: number,
  j: number,
  p: number,
  q: number,
): number {
  const outer = pairTypeAt(pairTypes, n, i, j)
  // The enclosed pair is typed in reverse — (q, p), not (p, q) — because `STACK_37` is indexed the
  // way the duplex is read from the other strand. Getting this backwards costs nothing on the
  // symmetric stacking matrix but would silently mistype every asymmetric table added later.
  const inner = pairTypeAt(pairTypes, n, q, p)
  if (outer === NO_PAIR || inner === NO_PAIR) return INF

  const left = p - i - 1
  const right = j - q - 1
  if (left < 0 || right < 0) return INF
  if (left + right > MAX_INTERNAL_LOOP) return INF

  if (left === 0 && right === 0) return stackEnergy(outer, inner)

  const longer = left > right ? left : right
  const shorter = left > right ? right : left

  if (shorter === 0) {
    // Sizes are capped at MAX_INTERNAL_LOOP by the check above, so the tabulated value always
    // exists and the Jacobson-Stockmayer branch of `loopInitiation` is unreachable here — which is
    // why this reads the flat table directly instead of paying for the call.
    const initiation = cell(BULGE_TABLE, longer)
    if (initiation >= INF) return INF
    // A one-base bulge is short enough that the helix stacks straight through it, so the stacking
    // term survives and no helix end is exposed. Longer bulges break the stack and expose both
    // closing pairs to the terminal-AU penalty. This is ViennaRNA's rule verbatim.
    if (longer === 1) return initiation + stackEnergy(outer, inner)
    return (
      initiation +
      (hasTerminalAuPenalty(outer) ? TERMINAL_AU_37 : 0) +
      (hasTerminalAuPenalty(inner) ? TERMINAL_AU_37 : 0)
    )
  }

  const initiation = cell(INTERNAL_LOOP_TABLE, longer + shorter)
  if (initiation >= INF) return INF
  // Ninio asymmetry: an internal loop with unequal sides is strained, at NINIO_37 per base of
  // difference, capped at MAX_NINIO.
  const asymmetry = Math.min(MAX_NINIO, (longer - shorter) * NINIO_37)
  // Stand-in for Turner 2004's internal-loop terminal-mismatch tables, which are outside this
  // parameter subset. Those tables fold an AU/GU closure penalty into themselves; charging the
  // terminal-AU constant on each closing pair keeps that part of the physics and drops only the
  // sequence-specific mismatch refinement.
  return (
    initiation +
    asymmetry +
    (hasTerminalAuPenalty(outer) ? TERMINAL_AU_37 : 0) +
    (hasTerminalAuPenalty(inner) ? TERMINAL_AU_37 : 0)
  )
}

/**
 * Fills V and WM by increasing span. Within one span V is computed first, because WM at that span
 * reads V at that span, and both read only shorter spans otherwise.
 */
function fillMatrices(pairTypes: Int32Array, n: number, v: Int32Array, wm: Int32Array): void {
  // Spans shorter than a hairpin can hold no pair, so V and WM stay INF there — the correct value,
  // not a missing one, which is why the loop can start at the first foldable span.
  for (let span = MIN_HAIRPIN_LOOP + 1; span < n; span++) {
    for (let i = 0; i + span < n; i++) {
      const j = i + span
      const rowI = i * n
      const closing = pairTypeAt(pairTypes, n, i, j)

      if (closing !== NO_PAIR) {
        let best = hairpinEnergy(pairTypes, n, i, j)

        const pMax = Math.min(i + MAX_INTERNAL_LOOP + 1, j - MIN_HAIRPIN_LOOP - 2)
        for (let p = i + 1; p <= pMax; p++) {
          // q must leave at most MAX_INTERNAL_LOOP unpaired bases across both sides, and at least
          // MIN_HAIRPIN_LOOP bases inside the enclosed pair.
          const qMin = Math.max(p + MIN_HAIRPIN_LOOP + 1, j + p - i - MAX_INTERNAL_LOOP - 2)
          const rowP = p * n
          for (let q = qMin; q < j; q++) {
            const enclosed = cell(v, rowP + q)
            if (enclosed >= INF) continue
            const loop = interiorLoopEnergy(pairTypes, n, i, j, p, q)
            if (loop >= INF) continue
            const candidate = loop + enclosed
            if (candidate < best) best = candidate
          }
        }

        // Multiloop closed by (i, j). Two WM segments means at least two branches inside, which
        // with the closing pair makes the three branches a multiloop requires by definition.
        const multiloopConstant = ML_CLOSING_37 + ML_INTERN_37 + auPenaltyAt(pairTypes, n, i, j)
        const leftRow = rowI + n
        let rightIndex = (i + 2) * n + (j - 1)
        for (let k = i + 1; k < j - 1; k++, rightIndex += n) {
          const left = cell(wm, leftRow + k)
          if (left >= INF) continue
          const right = cell(wm, rightIndex)
          if (right >= INF) continue
          const candidate = left + right + multiloopConstant
          if (candidate < best) best = candidate
        }

        v[rowI + j] = best >= INF ? INF : best
      }

      let bestWm = INF
      const branch = cell(v, rowI + j)
      if (branch < INF) {
        const candidate = branch + ML_INTERN_37 + auPenaltyAt(pairTypes, n, i, j)
        if (candidate < bestWm) bestWm = candidate
      }
      const trimLeft = cell(wm, rowI + n + j)
      if (trimLeft < INF && trimLeft + ML_BASE_37 < bestWm) bestWm = trimLeft + ML_BASE_37
      const trimRight = cell(wm, rowI + j - 1)
      if (trimRight < INF && trimRight + ML_BASE_37 < bestWm) bestWm = trimRight + ML_BASE_37
      let splitIndex = (i + 1) * n + j
      for (let k = i; k < j; k++, splitIndex += n) {
        const left = cell(wm, rowI + k)
        if (left >= INF) continue
        const right = cell(wm, splitIndex)
        if (right >= INF) continue
        if (left + right < bestWm) bestWm = left + right
      }
      wm[rowI + j] = bestWm >= INF ? INF : bestWm
    }
  }
}

/**
 * Exterior loop. `w[k]` is the best energy of the prefix covering positions 0..k-1, so `w[0]` is the
 * empty prefix at zero and `w[n]` is the minimum free energy of the whole sequence.
 */
function fillExterior(pairTypes: Int32Array, n: number, v: Int32Array): Int32Array {
  const w = new Int32Array(n + 1)
  for (let j = 0; j < n; j++) {
    let best = cell(w, j)
    for (let i = 0; i + MIN_HAIRPIN_LOOP + 1 <= j; i++) {
      const paired = cell(v, i * n + j)
      if (paired >= INF) continue
      const candidate = cell(w, i) + paired + auPenaltyAt(pairTypes, n, i, j)
      if (candidate < best) best = candidate
    }
    w[j + 1] = best
  }
  return w
}

interface TracebackTask {
  kind: 'V' | 'WM'
  i: number
  j: number
}

/**
 * Reconstructs the structure that produced `w[n]`, returning a partner array (-1 = unpaired).
 *
 * Every scan below walks its candidates in the same order the forward pass did and takes the first
 * exact match. That is what makes the *structure* reproducible and not merely the energy: when two
 * structures tie, a fixed scan order always resolves the tie the same way.
 */
function traceback(
  pairTypes: Int32Array,
  n: number,
  v: Int32Array,
  wm: Int32Array,
  w: Int32Array,
): Int32Array {
  const partner = new Int32Array(n).fill(-1)
  const tasks: TracebackTask[] = []

  let cursor = n - 1
  while (cursor >= 0) {
    if (cell(w, cursor + 1) === cell(w, cursor)) {
      cursor--
      continue
    }
    let matched = false
    for (let i = 0; i + MIN_HAIRPIN_LOOP + 1 <= cursor; i++) {
      const paired = cell(v, i * n + cursor)
      if (paired >= INF) continue
      if (cell(w, i) + paired + auPenaltyAt(pairTypes, n, i, cursor) === cell(w, cursor + 1)) {
        tasks.push({ kind: 'V', i, j: cursor })
        cursor = i - 1
        matched = true
        break
      }
    }
    // Unreachable while the forward pass and this scan agree. A silent infinite loop would be a far
    // worse failure than a fold one pair short, so the cursor always advances.
    if (!matched) cursor--
  }

  while (tasks.length > 0) {
    const task = tasks.pop()
    if (task === undefined) break

    if (task.kind === 'V') {
      tracebackPair(pairTypes, n, v, wm, partner, tasks, task.i, task.j)
    } else {
      tracebackMultiloopSegment(pairTypes, n, v, wm, tasks, task.i, task.j)
    }
  }

  return partner
}

function tracebackPair(
  pairTypes: Int32Array,
  n: number,
  v: Int32Array,
  wm: Int32Array,
  partner: Int32Array,
  tasks: TracebackTask[],
  i: number,
  j: number,
): void {
  partner[i] = j
  partner[j] = i
  const target = cell(v, i * n + j)

  if (hairpinEnergy(pairTypes, n, i, j) === target) return

  const pMax = Math.min(i + MAX_INTERNAL_LOOP + 1, j - MIN_HAIRPIN_LOOP - 2)
  for (let p = i + 1; p <= pMax; p++) {
    const qMin = Math.max(p + MIN_HAIRPIN_LOOP + 1, j + p - i - MAX_INTERNAL_LOOP - 2)
    for (let q = qMin; q < j; q++) {
      const enclosed = cell(v, p * n + q)
      if (enclosed >= INF) continue
      const loop = interiorLoopEnergy(pairTypes, n, i, j, p, q)
      if (loop >= INF) continue
      if (loop + enclosed === target) {
        tasks.push({ kind: 'V', i: p, j: q })
        return
      }
    }
  }

  const multiloopConstant = ML_CLOSING_37 + ML_INTERN_37 + auPenaltyAt(pairTypes, n, i, j)
  for (let k = i + 1; k < j - 1; k++) {
    const left = cell(wm, (i + 1) * n + k)
    if (left >= INF) continue
    const right = cell(wm, (k + 1) * n + (j - 1))
    if (right >= INF) continue
    if (left + right + multiloopConstant === target) {
      tasks.push({ kind: 'WM', i: i + 1, j: k })
      tasks.push({ kind: 'WM', i: k + 1, j: j - 1 })
      return
    }
  }
}

function tracebackMultiloopSegment(
  pairTypes: Int32Array,
  n: number,
  v: Int32Array,
  wm: Int32Array,
  tasks: TracebackTask[],
  i: number,
  j: number,
): void {
  if (i >= j) return
  const target = cell(wm, i * n + j)

  const branch = cell(v, i * n + j)
  if (branch < INF && branch + ML_INTERN_37 + auPenaltyAt(pairTypes, n, i, j) === target) {
    tasks.push({ kind: 'V', i, j })
    return
  }
  const trimLeft = cell(wm, (i + 1) * n + j)
  if (trimLeft < INF && trimLeft + ML_BASE_37 === target) {
    tasks.push({ kind: 'WM', i: i + 1, j })
    return
  }
  const trimRight = cell(wm, i * n + (j - 1))
  if (trimRight < INF && trimRight + ML_BASE_37 === target) {
    tasks.push({ kind: 'WM', i, j: j - 1 })
    return
  }
  for (let k = i; k < j; k++) {
    const left = cell(wm, i * n + k)
    if (left >= INF) continue
    const right = cell(wm, (k + 1) * n + j)
    if (right >= INF) continue
    if (left + right === target) {
      tasks.push({ kind: 'WM', i, j: k })
      tasks.push({ kind: 'WM', i: k + 1, j })
      return
    }
  }
}

const EMPTY_FOLD: FoldResult = {
  mfeKcalPerMol: 0,
  dotBracket: '',
  pairs: [],
  pairedBases: 0,
  watsonCrickPairs: 0,
  wobblePairs: 0,
  hairpinLoopCount: 0,
  longestHelix: 0,
}

/**
 * Folds an RNA sequence and returns its minimum-free-energy secondary structure.
 *
 * Characters that are not A, C, G or U are kept in place and treated as unpairable, so the returned
 * dot-bracket string always lines up with the input character for character. Thymine is *not*
 * transcribed here — Layer 1 does that, and reports it, because a silent transcription would let a
 * DNA sequence fold as RNA with no trace in the record.
 *
 * @throws Error when the sequence is longer than `options.maxLength`. The caller decides what to do
 * about a sequence too long to fold; truncating it here would return the fold of a molecule that
 * does not exist.
 */
export function foldRna(sequence: string, options?: FoldOptions): FoldResult {
  const maxLength = options?.maxLength ?? DEFAULT_MAX_LENGTH
  const n = sequence.length

  if (n > maxLength) {
    throw new Error(
      `foldRna: sequence of ${n} nucleotides exceeds the ${maxLength}-nucleotide fold limit. ` +
        'Folding costs O(n^3) time and O(n^2) memory, so the limit is a real budget, not a ' +
        'formality.',
    )
  }

  if (n === 0) return { ...EMPTY_FOLD, pairs: [] }

  const codes = new Int32Array(n)
  for (let index = 0; index < n; index++) {
    codes[index] = encodeBase(sequence.charAt(index))
  }

  // Pair type of every ordered position pair, computed once. Both orders are stored because the
  // enclosed pair of an interior loop is typed in reverse.
  const pairTypes = new Int32Array(n * n)
  for (let a = 0; a < n; a++) {
    const codeA = slotAt(codes, a)
    for (let b = 0; b < n; b++) {
      pairTypes[a * n + b] = pairIndexFromCodes(codeA, slotAt(codes, b))
    }
  }

  const v = new Int32Array(n * n).fill(INF)
  const wm = new Int32Array(n * n).fill(INF)
  fillMatrices(pairTypes, n, v, wm)
  const w = fillExterior(pairTypes, n, v)
  const partner = traceback(pairTypes, n, v, wm, w)

  // ---------------------------------------------------------------------
  // Derived description of the structure.
  // ---------------------------------------------------------------------

  const notation: string[] = []
  const pairs: Array<[number, number]> = []
  let watsonCrickPairs = 0
  let wobblePairs = 0

  for (let index = 0; index < n; index++) {
    const other = slotAt(partner, index)
    if (other < 0) {
      notation.push('.')
      continue
    }
    if (other > index) {
      notation.push('(')
      pairs.push([index, other])
      const type = pairTypeAt(pairTypes, n, index, other)
      if (type === NO_PAIR) continue
      if (type === GU || type === UG) wobblePairs++
      else watsonCrickPairs++
    } else {
      notation.push(')')
    }
  }

  let hairpinLoopCount = 0
  for (const [open, close] of pairs) {
    let enclosesAnything = false
    for (let index = open + 1; index < close; index++) {
      if (slotAt(partner, index) >= 0) {
        enclosesAnything = true
        break
      }
    }
    if (!enclosesAnything) hairpinLoopCount++
  }

  let longestHelix = 0
  for (const [open, close] of pairs) {
    // Measure each helix once, from its outermost pair: if (open-1, close+1) is also a pair, this
    // pair is in the middle of a helix that was already counted.
    if (open > 0 && close + 1 < n && slotAt(partner, open - 1) === close + 1) continue
    let length = 0
    let a = open
    let b = close
    while (a < b && slotAt(partner, a) === b) {
      length++
      a++
      b--
    }
    if (length > longestHelix) longestHelix = length
  }

  return {
    mfeKcalPerMol: dekacalToKcal(cell(w, n)),
    dotBracket: notation.join(''),
    pairs,
    pairedBases: pairs.length,
    watsonCrickPairs,
    wobblePairs,
    hairpinLoopCount,
    longestHelix,
  }
}

/**
 * Reads a base code or a partner index. Same reason as `cell`: `noUncheckedIndexedAccess` types the
 * read as possibly undefined and the brief forbids `!`. -1 is the right default for both callers —
 * `pairIndexFromCodes` rejects a negative base code as unpairable, and -1 already means "unpaired"
 * in the partner array.
 */
function slotAt(array: Int32Array, index: number): number {
  const value = array[index]
  return value === undefined ? -1 : value
}

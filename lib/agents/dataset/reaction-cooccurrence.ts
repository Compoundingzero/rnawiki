/**
 * Structure over the adverse-reaction TERMS that labels print.
 *
 * A label's "most common adverse reactions" sentence is recorded whole: one threshold the label
 * chose, and the list of event terms it printed at that threshold. Across the corpus those
 * sentences form a bipartite structure with medicines on one side and reaction terms on the other.
 * This agent describes the TERM side of it — how many labels print a term, which thresholds those
 * labels printed it at, and which pairs of terms appear together more often than each term's own
 * frequency accounts for.
 *
 * WHY THE TERM SIDE IS THE SAFE SIDE. The same bipartite structure can be projected onto either
 * side. Projected onto medicines it becomes "medicines that share reactions", which is a
 * medicine-to-medicine relation carrying an implied clinical meaning; FDA's guidance on mobile
 * medical applications treats that class of lookup as a device function, and no caveat around the
 * row changes what the row is. Projected onto terms it is a statement about vocabulary: how often
 * two words are printed in the same sentence across a body of labels. Only the term projection is
 * computed here. The refusal is structural rather than editorial — no type declared below holds two
 * medicine identifiers, so there is no shape a medicine pair could be written into, and adding one
 * would be a visible change to the type surface rather than a quiet change to a query.
 *
 * WHAT A COUNT HERE MEASURES. That 305 labels print "nausea" is a fact about labelling. It is
 * driven by how many products exist, how they were studied, and what each sponsor chose to tabulate
 * at its chosen threshold. It is not an incidence, a frequency, or a risk, and there is no
 * arithmetic in this file that turns it into one.
 *
 * WHY THRESHOLDS ARE NEVER POOLED. Each label states its own cut-off — at least 1%, at least 20%,
 * more than 5% — and the term list means "these events cleared that cut-off in this programme".
 * Two labels printing "headache" at different cut-offs have not measured the same thing, so their
 * counts are never combined into a rate and the thresholds are reported as the exact strings the
 * labels used. Nothing in this file parses a threshold into a number.
 *
 * WHY THE CO-OCCURRENCE COUNT ALONE IS NOT A FINDING. The leading pairs by raw count are simply the
 * leading terms by frequency paired with each other: nausea appears on nearly half the lists, so it
 * heads almost every count. Each pair is therefore tested against a null that holds both terms'
 * recorded frequencies fixed (hypergeometric upper tail) and the resulting p-values are taken
 * through Benjamini-Hochberg, so the reported set is what survives that popularity. A separate
 * seeded reference randomises the corpus while preserving both each term's frequency and each
 * label's list length, and reruns the whole procedure on it, because the analytic null holds only
 * the first of those two margins fixed.
 *
 * Two admission rules keep the dataset answerable to its sources: a term is admitted only when it
 * appears in the excerpt the sentence was recorded from, tolerating letter case alone, and a
 * listing whose excerpt trips the forbidden-phrase screen is withheld whole, because advice wording
 * is evidence that the wrong part of the label was captured. Withheld listings go to a person.
 *
 * NORMALISATION APPLIED, IN FULL: surrounding whitespace is trimmed, letter case is folded, and a
 * term repeated inside one label's own list is counted once for that label. Nothing else. These are
 * strings as labels print them, not a coded vocabulary — "nausea" and "feeling sick" are two terms
 * here and no synonym table exists to make them one.
 */

import { createRng, type Rng } from '@/lib/agents/core/rng'
import { benjaminiHochberg, hypergeometricUpperTail } from '@/lib/agents/core/statistics'
import {
  findForbiddenPhrases,
  type AgentInput,
  type AgentRun,
  type DatasetAgent,
  type ReviewCandidate,
} from '@/lib/agents/core/types'
import type { BackgroundSource } from '@/lib/background/types'

/* ------------------------------------------------------------------------------------------- */
/* Output types                                                                                 */
/* ------------------------------------------------------------------------------------------- */

/**
 * One threshold string, and how many labels printed the term at it.
 *
 * A tally of strings rather than a summary of numbers. The thresholds are not comparable quantities
 * to be averaged: they are the cut-offs different sponsors chose for different programmes, and the
 * distribution of those choices is the finding.
 */
export interface RecordedThresholdTally {
  thresholdAsRecorded: string
  labelsPrintingTermAtThisThreshold: number
}

/**
 * One label's printing of one term.
 *
 * This row is about exactly one medicine. It carries `slug` and `name`, which are two labels for
 * the same record, and there is deliberately no second medicine field — this is the only type in
 * the dataset that names a medicine at all.
 */
export interface TermListing {
  slug: string
  name: string
  /** The term with the spacing and letter case the label used, before folding. */
  termAsRecorded: string
  /** This label's own cut-off. It belongs to this row and is never merged with another row's. */
  thresholdAsRecorded: string
  /** False when the term matched its excerpt only after letter case was folded. */
  matchesSourceCasing: boolean
  sourceKind: BackgroundSource['kind']
  sourceIdentifier: string
  retrievedAt: string
  /** The fetched wording the list was read from; it contains the term verbatim. */
  excerpt: string
}

export interface ReactionTermProfile {
  /** The case-folded, trimmed term. Distinct strings are never merged beyond that. */
  term: string
  /** Every spelling folded into this term, so the folding is visible rather than assumed. */
  recordedSpellings: readonly string[]
  labelsPrintingTerm: number
  /** Of the records that print a most-common list at all, which is the narrower denominator. */
  shareOfLabelsWithAList: number
  /** Every distinct cut-off this term was printed at, most-used first. Never pooled. */
  thresholds: readonly RecordedThresholdTally[]
  distinctThresholdsPrinted: number
  /**
   * Longer recorded terms that begin with this one followed by a space. A lexical observation only:
   * the corpus does not state whether they name the same event and this agent does not decide that.
   */
  longerRecordedTerms: readonly string[]
  /** Whether the term was frequent enough to enter pair testing. */
  enteredPairTesting: boolean
  listings: readonly TermListing[]
}

/**
 * Two reaction terms printed together more often than their own frequencies predict.
 *
 * Both members are event terms. Neither is a medicine, and the row carries no medicine identifier,
 * so this is a statement about how a body of labels is worded.
 */
export interface ValidatedTermPair {
  firstTerm: string
  secondTerm: string
  labelsPrintingFirstTerm: number
  labelsPrintingSecondTerm: number
  labelsPrintingBothTerms: number
  /** Labels expected to print both if the two terms fell on labels independently of each other. */
  expectedUnderRecordedFrequencies: number
  observedOverExpected: number
  /** Hypergeometric upper tail, holding both terms' recorded frequencies fixed. */
  pValue: number
  /** Plain-language reading of the row, in the vocabulary the dataset page uses. */
  note: string
}

/**
 * A pair leading on raw co-occurrence count, with whether it survived validation.
 *
 * Kept in the output so the difference between the two is visible rather than asserted: the raw
 * ranking is close to a ranking of the commonest terms, and some of its leaders do not survive.
 */
export interface RawCountLeader {
  firstTerm: string
  secondTerm: string
  labelsPrintingBothTerms: number
  expectedUnderRecordedFrequencies: number
  survivedValidation: boolean
}

/**
 * The same procedure rerun on randomised corpora that preserve both margins.
 *
 * The analytic null holds each term's frequency fixed but treats every label list as though it were
 * an independent draw, which ignores that lists differ in length. Swap randomisation preserves each
 * term's frequency AND each label's list length exactly, so rerunning the whole procedure on it
 * shows how much of the validated set the two margins alone could produce.
 */
export interface MarginPreservingReference {
  draws: number
  swapsPerDraw: number
  validatedPairsPerDraw: readonly number[]
  medianValidatedPairs: number
  maximumValidatedPairs: number
}

export interface ReactionTermStructure {
  terms: readonly ReactionTermProfile[]
  validatedPairs: readonly ValidatedTermPair[]
  rawCountLeaders: readonly RawCountLeader[]
  marginPreservingReference: MarginPreservingReference
  recordsConsidered: number
  /** Records whose sources print a most-common list at all. The population for every pair test. */
  labelsWithAMostCommonList: number
  /** Records with no such list. Absence of recorded text, not a negative finding. */
  recordsWithoutAMostCommonList: number
  distinctTermsRecorded: number
  termsEnteringPairTesting: number
  pairsTested: number
  falseDiscoveryRate: number
  /** Benjamini-Hochberg bounds the expected false discoveries at this many of the validated set. */
  expectedFalseValidatedPairs: number
  listingsAdmitted: number
  /** Withheld because the recorded term is not present in the sentence it was read from. */
  listingsWithheldTermNotInExcerpt: number
  /** Withheld because the sentence reads as advice, which a most-common list should not. */
  listingsWithheldExcerptFailedScreen: number
  /** Listings dropped as a repeat of a term already printed in the same label's own list. */
  listingsCollapsedAsRepeatWithinOneList: number
  distinctThresholdsRecorded: number
  /** Admitted listings read by the deterministic label parser rather than judged by a person. */
  listingsFromExtractedRecords: number
}

/* ------------------------------------------------------------------------------------------- */
/* Parameters                                                                                   */
/* ------------------------------------------------------------------------------------------- */

/**
 * A term must appear on this many labels before it is paired with anything.
 *
 * Below it the hypergeometric tail cannot reach the Benjamini-Hochberg threshold at any observed
 * count, so testing those terms would only inflate the family of hypotheses and weaken every other
 * pair. The terms themselves are still profiled; they are simply not paired.
 */
const MINIMUM_LABELS_PER_TERM = 5

const FALSE_DISCOVERY_RATE = 0.01

const REFERENCE_DRAWS = 25

/** Swaps per randomised draw, as a multiple of the number of admitted listings. */
const SWAPS_PER_LISTING = 5

const RAW_COUNT_LEADERS_REPORTED = 10

/** Terms this rare are reported as possible parse artifacts rather than treated as vocabulary. */
const RARE_TERM_LABEL_CEILING = 3

/* ------------------------------------------------------------------------------------------- */
/* Helpers                                                                                      */
/* ------------------------------------------------------------------------------------------- */

/** Six decimal places, so a rerun's dataset diffs cleanly instead of drifting in the last bits. */
function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

/**
 * Significant figures rather than decimal places, because a p-value of 3e-9 rounds to zero at six
 * decimals and the distinction between it and 1e-4 is the whole content of the column.
 */
function roundSignificant(value: number, digits: number): number {
  if (!Number.isFinite(value) || value === 0) return value
  return Number(value.toPrecision(digits))
}

function share(part: number, whole: number): number {
  return whole === 0 ? 0 : round6(part / whole)
}

/**
 * Code-unit ordering rather than `localeCompare`, whose result depends on the host ICU data. An
 * agent whose output changes with the machine it ran on is not rerunnable.
 */
function compareStrings(left: string, right: string): number {
  if (left < right) return -1
  if (left > right) return 1
  return 0
}

/** Case folding and whitespace trimming, which is the entire normalisation this agent applies. */
function foldTerm(term: string): string {
  return term.trim().toLowerCase()
}

interface AdmittedList {
  slug: string
  name: string
  threshold: string
  /** Folded terms, deduplicated within this one label, in the order the label printed them. */
  terms: readonly string[]
  extracted: boolean
}

interface WithheldListing {
  slug: string
  termAsRecorded: string
  reason: 'NOT_IN_EXCERPT' | 'FAILED_SCREEN'
  source: BackgroundSource
}

/**
 * Upper-triangle index for an n-by-n term matrix, so co-occurrence lives in one flat array rather
 * than in a map of composed string keys.
 */
function pairSlot(total: number, first: number, second: number): number {
  return (first * (2 * total - first - 1)) / 2 + (second - first - 1)
}

/** Co-occurrence counts among the paired terms, one pass over the label lists. */
function countCoOccurrence(rows: ReadonlyArray<ReadonlySet<number>>, total: number): Int32Array {
  const counts = new Int32Array((total * (total - 1)) / 2)
  const present: number[] = []
  for (const row of rows) {
    present.length = 0
    for (const term of row) {
      if (term < total) present.push(term)
    }
    present.sort((left, right) => left - right)
    for (let index = 0; index < present.length; index += 1) {
      for (let other = index + 1; other < present.length; other += 1) {
        const slot = pairSlot(total, present[index]!, present[other]!)
        counts[slot] = (counts[slot] ?? 0) + 1
      }
    }
  }
  return counts
}

/** Every pair's p-value under the frequency-preserving null, in upper-triangle order. */
function pairPValues(counts: Int32Array, degrees: readonly number[], population: number): number[] {
  const total = degrees.length
  const values: number[] = []
  for (let first = 0; first < total; first += 1) {
    for (let second = first + 1; second < total; second += 1) {
      values.push(
        hypergeometricUpperTail(
          counts[pairSlot(total, first, second)] ?? 0,
          degrees[first]!,
          degrees[second]!,
          population,
        ),
      )
    }
  }
  return values
}

/**
 * One swap-randomised copy of the incidence structure.
 *
 * A swap takes a term held by one label but not another and exchanges it with a term held by the
 * second but not the first. Both labels keep their list length and both terms keep their frequency,
 * so the randomised corpus differs from the recorded one only in which label holds which term.
 */
function swapRandomise(
  rows: ReadonlyArray<ReadonlySet<number>>,
  rng: Rng,
  swaps: number,
): Set<number>[] {
  const copy = rows.map((row) => new Set(row))
  const attemptLimit = swaps * 20
  let done = 0
  let attempts = 0
  while (done < swaps && attempts < attemptLimit) {
    attempts += 1
    const leftIndex = rng.nextInt(copy.length)
    const rightIndex = rng.nextInt(copy.length)
    if (leftIndex === rightIndex) continue
    const left = copy[leftIndex]!
    const right = copy[rightIndex]!
    const onlyLeft: number[] = []
    for (const term of left) if (!right.has(term)) onlyLeft.push(term)
    if (onlyLeft.length === 0) continue
    const onlyRight: number[] = []
    for (const term of right) if (!left.has(term)) onlyRight.push(term)
    if (onlyRight.length === 0) continue
    const fromLeft = onlyLeft[rng.nextInt(onlyLeft.length)]!
    const fromRight = onlyRight[rng.nextInt(onlyRight.length)]!
    left.delete(fromLeft)
    left.add(fromRight)
    right.delete(fromRight)
    right.add(fromLeft)
    done += 1
  }
  return copy
}

/* ------------------------------------------------------------------------------------------- */
/* Agent                                                                                        */
/* ------------------------------------------------------------------------------------------- */

export const reactionCooccurrenceAgent: DatasetAgent<ReactionTermStructure> = {
  name: 'adverse-reaction-term-structure',
  version: '1.0.0',
  description:
    'Counts, per adverse-reaction term, how many labels print it in their most-common list and at which recorded thresholds, and reports which pairs of terms are printed together more often than each term’s own frequency across the corpus accounts for.',

  run(input: AgentInput): AgentRun<ReactionTermStructure> {
    const admitted: AdmittedList[] = []
    const withheld: WithheldListing[] = []
    const listingOf = new Map<string, TermListing[]>()
    const spellingsOf = new Map<string, Set<string>>()
    const thresholdsOf = new Map<string, Map<string, number>>()
    const allThresholds = new Set<string>()
    let recordsWithAList = 0
    let repeatsCollapsed = 0
    let listingsAdmitted = 0
    let listingsFromExtracted = 0

    for (const entry of input.corpus) {
      const recorded = entry.background.commonAdverseReactions
      if (!recorded) continue
      recordsWithAList += 1

      const excerpt = recorded.source.excerpt ?? ''
      const extracted = (recorded.provenanceTier ?? 'curated') === 'extracted'

      // Admission rule 2 first: advice wording means the wrong part of the label was captured, so
      // nothing in the sentence is trusted rather than only the terms that fail rule 1.
      if (findForbiddenPhrases(excerpt).length > 0) {
        for (const term of recorded.eventsAsRecorded) {
          withheld.push({
            slug: entry.slug,
            termAsRecorded: term,
            reason: 'FAILED_SCREEN',
            source: recorded.source,
          })
        }
        continue
      }

      const seen = new Set<string>()
      const terms: string[] = []
      for (const termAsRecorded of recorded.eventsAsRecorded) {
        const term = foldTerm(termAsRecorded)
        if (term.length === 0) continue

        // Admission rule 1: the sentence must contain the term the record claims it printed.
        const exactCase = excerpt.includes(termAsRecorded.trim())
        if (!exactCase && !excerpt.toLowerCase().includes(term)) {
          withheld.push({
            slug: entry.slug,
            termAsRecorded,
            reason: 'NOT_IN_EXCERPT',
            source: recorded.source,
          })
          continue
        }

        // One label printing the same term twice is one label printing it, not two.
        if (seen.has(term)) {
          repeatsCollapsed += 1
          continue
        }
        seen.add(term)
        terms.push(term)

        const spellings = spellingsOf.get(term)
        if (spellings) spellings.add(termAsRecorded.trim())
        else spellingsOf.set(term, new Set([termAsRecorded.trim()]))

        const thresholds = thresholdsOf.get(term) ?? new Map<string, number>()
        thresholds.set(
          recorded.thresholdAsRecorded,
          (thresholds.get(recorded.thresholdAsRecorded) ?? 0) + 1,
        )
        thresholdsOf.set(term, thresholds)

        const listings = listingOf.get(term) ?? []
        listings.push({
          slug: entry.slug,
          name: entry.name,
          termAsRecorded: termAsRecorded.trim(),
          thresholdAsRecorded: recorded.thresholdAsRecorded,
          matchesSourceCasing: exactCase,
          sourceKind: recorded.source.kind,
          sourceIdentifier: recorded.source.identifier,
          retrievedAt: recorded.source.retrievedAt,
          excerpt,
        })
        listingOf.set(term, listings)

        listingsAdmitted += 1
        if (extracted) listingsFromExtracted += 1
      }

      if (terms.length === 0) continue
      allThresholds.add(recorded.thresholdAsRecorded)
      admitted.push({
        slug: entry.slug,
        name: entry.name,
        threshold: recorded.thresholdAsRecorded,
        terms,
        extracted,
      })
    }

    /* --- term profiles ------------------------------------------------------------------- */

    const distinctTerms = [...listingOf.keys()].sort(compareStrings)
    const degreeOf = new Map<string, number>(
      distinctTerms.map((term) => [term, listingOf.get(term)?.length ?? 0]),
    )
    const pairedTerms = distinctTerms.filter(
      (term) => (degreeOf.get(term) ?? 0) >= MINIMUM_LABELS_PER_TERM,
    )
    const pairedSet = new Set(pairedTerms)

    const profiles: ReactionTermProfile[] = distinctTerms.map((term) => {
      const listings = [...(listingOf.get(term) ?? [])].sort((left, right) =>
        compareStrings(left.slug, right.slug),
      )
      const thresholds = [...(thresholdsOf.get(term) ?? new Map<string, number>()).entries()]
        .map(([thresholdAsRecorded, count]) => ({
          thresholdAsRecorded,
          labelsPrintingTermAtThisThreshold: count,
        }))
        .sort(
          (left, right) =>
            right.labelsPrintingTermAtThisThreshold - left.labelsPrintingTermAtThisThreshold ||
            compareStrings(left.thresholdAsRecorded, right.thresholdAsRecorded),
        )
      return {
        term,
        recordedSpellings: [...(spellingsOf.get(term) ?? new Set<string>())].sort(compareStrings),
        labelsPrintingTerm: listings.length,
        shareOfLabelsWithAList: share(listings.length, admitted.length),
        thresholds,
        distinctThresholdsPrinted: thresholds.length,
        longerRecordedTerms: distinctTerms.filter((other) => other.startsWith(`${term} `)),
        enteredPairTesting: pairedSet.has(term),
        listings,
      }
    })

    profiles.sort(
      (left, right) =>
        right.labelsPrintingTerm - left.labelsPrintingTerm || compareStrings(left.term, right.term),
    )

    /* --- pair validation ----------------------------------------------------------------- */

    // Paired terms occupy the low indices so co-occurrence counting can ignore everything above.
    const termRank = new Map<string, number>()
    pairedTerms.forEach((term, index) => termRank.set(term, index))
    let nextRank = pairedTerms.length
    for (const term of distinctTerms) {
      if (!termRank.has(term)) {
        termRank.set(term, nextRank)
        nextRank += 1
      }
    }

    const rows: Array<Set<number>> = admitted.map(
      (list) => new Set(list.terms.map((term) => termRank.get(term)!)),
    )
    const population = admitted.length
    const degrees = pairedTerms.map((term) => degreeOf.get(term) ?? 0)
    const total = pairedTerms.length
    const observedCounts = countCoOccurrence(rows, total)
    const observedP = pairPValues(observedCounts, degrees, population)
    const rejected = new Set(benjaminiHochberg(observedP, FALSE_DISCOVERY_RATE))

    const validatedPairs: ValidatedTermPair[] = []
    const everyPair: Array<{ first: number; second: number; slot: number; index: number }> = []
    let pairIndex = 0
    for (let first = 0; first < total; first += 1) {
      for (let second = first + 1; second < total; second += 1) {
        const slot = pairSlot(total, first, second)
        everyPair.push({ first, second, slot, index: pairIndex })
        if (rejected.has(pairIndex)) {
          const firstTerm = pairedTerms[first]!
          const secondTerm = pairedTerms[second]!
          const both = observedCounts[slot] ?? 0
          const expected = (degrees[first]! * degrees[second]!) / population
          validatedPairs.push({
            firstTerm,
            secondTerm,
            labelsPrintingFirstTerm: degrees[first]!,
            labelsPrintingSecondTerm: degrees[second]!,
            labelsPrintingBothTerms: both,
            expectedUnderRecordedFrequencies: round6(expected),
            observedOverExpected: round6(both / expected),
            pValue: roundSignificant(observedP[pairIndex]!, 6),
            note: pairNote(firstTerm, secondTerm, both, expected, population),
          })
        }
        pairIndex += 1
      }
    }

    validatedPairs.sort(
      (left, right) =>
        right.observedOverExpected - left.observedOverExpected ||
        left.pValue - right.pValue ||
        compareStrings(left.firstTerm, right.firstTerm) ||
        compareStrings(left.secondTerm, right.secondTerm),
    )

    const rawCountLeaders: RawCountLeader[] = [...everyPair]
      .sort(
        (left, right) =>
          (observedCounts[right.slot] ?? 0) - (observedCounts[left.slot] ?? 0) ||
          compareStrings(pairedTerms[left.first]!, pairedTerms[right.first]!) ||
          compareStrings(pairedTerms[left.second]!, pairedTerms[right.second]!),
      )
      .slice(0, RAW_COUNT_LEADERS_REPORTED)
      .map((pair) => ({
        firstTerm: pairedTerms[pair.first]!,
        secondTerm: pairedTerms[pair.second]!,
        labelsPrintingBothTerms: observedCounts[pair.slot] ?? 0,
        expectedUnderRecordedFrequencies: round6(
          (degrees[pair.first]! * degrees[pair.second]!) / population,
        ),
        survivedValidation: rejected.has(pair.index),
      }))

    /* --- margin-preserving reference ------------------------------------------------------ */

    const swapsPerDraw = listingsAdmitted * SWAPS_PER_LISTING
    const rng = createRng(input.seed)
    const perDraw: number[] = []
    for (let draw = 0; draw < REFERENCE_DRAWS; draw += 1) {
      const randomised = swapRandomise(rows, rng, swapsPerDraw)
      const counts = countCoOccurrence(randomised, total)
      perDraw.push(
        benjaminiHochberg(pairPValues(counts, degrees, population), FALSE_DISCOVERY_RATE).length,
      )
    }
    const sortedDraws = [...perDraw].sort((left, right) => left - right)
    const middle = Math.floor(sortedDraws.length / 2)
    const reference: MarginPreservingReference = {
      draws: REFERENCE_DRAWS,
      swapsPerDraw,
      validatedPairsPerDraw: perDraw,
      medianValidatedPairs:
        sortedDraws.length === 0
          ? 0
          : sortedDraws.length % 2 === 1
            ? sortedDraws[middle]!
            : ((sortedDraws[middle - 1] ?? 0) + (sortedDraws[middle] ?? 0)) / 2,
      maximumValidatedPairs: sortedDraws.length === 0 ? 0 : sortedDraws[sortedDraws.length - 1]!,
    }

    const output: ReactionTermStructure = {
      terms: profiles,
      validatedPairs,
      rawCountLeaders,
      marginPreservingReference: reference,
      recordsConsidered: input.corpus.length,
      labelsWithAMostCommonList: population,
      recordsWithoutAMostCommonList: input.corpus.length - recordsWithAList,
      distinctTermsRecorded: distinctTerms.length,
      termsEnteringPairTesting: total,
      pairsTested: observedP.length,
      falseDiscoveryRate: FALSE_DISCOVERY_RATE,
      expectedFalseValidatedPairs: round6(FALSE_DISCOVERY_RATE * validatedPairs.length),
      listingsAdmitted,
      listingsWithheldTermNotInExcerpt: withheld.filter((item) => item.reason === 'NOT_IN_EXCERPT')
        .length,
      listingsWithheldExcerptFailedScreen: withheld.filter(
        (item) => item.reason === 'FAILED_SCREEN',
      ).length,
      listingsCollapsedAsRepeatWithinOneList: repeatsCollapsed,
      distinctThresholdsRecorded: allThresholds.size,
      listingsFromExtractedRecords: listingsFromExtracted,
    }

    return {
      agent: reactionCooccurrenceAgent.name,
      version: reactionCooccurrenceAgent.version,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        termNormalisation: 'trimmed and case-folded only; no synonym or stemming table',
        repeatsWithinOneLabelList: 'counted once for that label',
        thresholdsPooled: false,
        minimumLabelsPerTerm: MINIMUM_LABELS_PER_TERM,
        pairNull: 'hypergeometric upper tail holding both terms recorded frequencies fixed',
        multipleTesting: `Benjamini-Hochberg at a false discovery rate of ${FALSE_DISCOVERY_RATE}`,
        marginPreservingReferenceDraws: REFERENCE_DRAWS,
      },
      output,
      coverage: {
        considered: input.corpus.length,
        used: population,
        reason: `${input.corpus.length - recordsWithAList} of ${input.corpus.length} records have no most-common adverse reaction sentence in their recorded sources, so no term can be read from them. Of the ${recordsWithAList} that do, ${population} contributed at least one admitted term; ${withheld.length} term listings were withheld (${output.listingsWithheldTermNotInExcerpt} absent from the sentence they were read from, ${output.listingsWithheldExcerptFailedScreen} from a sentence that reads as advice) and are in the review queue rather than deleted.`,
      },
      queue: buildQueue(withheld, profiles, degreeOf),
      caveats: buildCaveats(output),
    }
  },
}

/**
 * The reader-facing sentence for a validated pair.
 *
 * It states what survived the test and then names, in the same breath, the two readings it is not:
 * a rate, and a claim about events happening together in a person. Both misreadings are the obvious
 * ones, so neither is left to a caption elsewhere on the page.
 */
function pairNote(
  firstTerm: string,
  secondTerm: string,
  both: number,
  expected: number,
  population: number,
): string {
  return `${firstTerm} and ${secondTerm} are printed in the same most-common list on ${both} of the ${population} labels that print such a list, against the ${expected.toFixed(1)} that each term’s own frequency across these labels would predict. It means the two terms are recorded together in more labels than their separate frequencies account for. It is not a rate, and it says nothing about how often either event happens or about the two happening in one person.`
}

/**
 * Work for people, phrased as questions about records.
 *
 * Every rule here is lexical. None of them says what the right answer is: a joined term may be
 * exactly what the label printed, and a rare long term may be a real event name. Deciding either is
 * the reviewer's job and the reason the item is queued rather than normalised away.
 */
function buildQueue(
  withheld: readonly WithheldListing[],
  profiles: readonly ReactionTermProfile[],
  degreeOf: ReadonlyMap<string, number>,
): ReviewCandidate[] {
  const candidates: ReviewCandidate[] = []

  for (const item of withheld) {
    candidates.push({
      slug: item.slug,
      reason: 'ATTRIBUTION_SUSPECT',
      question:
        item.reason === 'NOT_IN_EXCERPT'
          ? `Does the recorded sentence for this record print "${item.termAsRecorded}" in its most-common adverse reaction list, or was that term assembled from wording elsewhere in the label?`
          : `The sentence recorded as this record's most-common adverse reaction list reads as advice rather than as a list. Which label section is it actually from?`,
      priority: 1000,
      basis: 'A term that fails its own excerpt is withheld from every count in this dataset.',
      sources: [`${item.source.kind}:${item.source.identifier}`],
    })
  }

  for (const profile of profiles) {
    // A term holding a separator is often two events the parser left joined in one string.
    if (/ and |,|\//u.test(profile.term)) {
      for (const listing of profile.listings) {
        candidates.push({
          slug: listing.slug,
          reason: 'COVERAGE_GAP',
          question: `Is "${listing.termAsRecorded}" one event term as this label prints it, or several the parser left joined in one string?`,
          priority: profile.labelsPrintingTerm,
          basis: `Records carrying this exact joined term: ${profile.labelsPrintingTerm}. The term is counted as one term everywhere in this dataset until a person settles that.`,
          sources: [`${listing.sourceKind}:${listing.sourceIdentifier}`],
        })
      }
      continue
    }

    // A rare term that extends a common one is usually the common one with label furniture stuck
    // to it, but it is recorded as its own term until someone checks.
    if (profile.labelsPrintingTerm > RARE_TERM_LABEL_CEILING) continue
    const shorter = profiles.find(
      (other) => other.term !== profile.term && profile.term.startsWith(`${other.term} `),
    )
    if (!shorter) continue
    for (const listing of profile.listings) {
      candidates.push({
        slug: listing.slug,
        reason: 'COVERAGE_GAP',
        question: `This record's term is recorded as "${listing.termAsRecorded}", which begins with "${shorter.term}" — a term ${degreeOf.get(shorter.term) ?? 0} labels print on its own. Is the longer string the event name this label printed, or the shorter term with surrounding label text attached?`,
        priority: degreeOf.get(shorter.term) ?? 0,
        basis: `Labels printing the shorter term on its own: ${degreeOf.get(shorter.term) ?? 0}. The two are counted as separate terms and are never merged by this agent.`,
        sources: [`${listing.sourceKind}:${listing.sourceIdentifier}`],
      })
    }
  }

  return candidates.sort(
    (left, right) =>
      right.priority - left.priority ||
      compareStrings(left.reason, right.reason) ||
      compareStrings(left.slug, right.slug) ||
      compareStrings(left.question, right.question),
  )
}

function buildCaveats(output: ReactionTermStructure): string[] {
  const leadersValidated = output.rawCountLeaders.filter((pair) => pair.survivedValidation).length
  return [
    'These are event terms exactly as labels print them, not a coded vocabulary. "Nausea" and "feeling sick" are two terms here and stay two terms. The only normalisation applied is trimming surrounding whitespace, folding letter case, and counting a term once when one label prints it twice in its own list; no synonym table, stemming or medical coding is used.',
    'A count of how many labels print a term measures how often the term is REPORTED. That is driven by how many products exist, how they were studied and what each sponsor tabulated, not by how often the event happens. No number in this dataset is an incidence, a frequency or a risk, and none may be presented as one.',
    'Each label keeps the threshold it printed. A term listed at 1% or more on one label and at 20% or more on another has not been measured the same way twice, so those labels are never pooled into a rate; the thresholds are reported as the exact strings the labels used and are never parsed into numbers or averaged.',
    'A validated pair is a statement about how a body of labels is worded: two terms are printed in the same list more often than each term’s own frequency accounts for. It is not a statement about two events occurring together in a person, and it is not a rate.',
    'This dataset holds no relation between one medicine and another. Structure is computed over reaction terms; the labels printing a term are listed individually with their own thresholds and sentences, and are never paired, ranked against each other or compared.',
    `${output.recordsWithoutAMostCommonList} of ${output.recordsConsidered} records have no most-common adverse reaction sentence in their recorded sources at all. That is an absence of recorded text in the sources fetched for those records. It is neither reassurance nor alarm about the medicines concerned.`,
    `Raw co-occurrence is mostly a restatement of how common each term is: of the ${output.rawCountLeaders.length} leading pairs by raw count, ${leadersValidated} survive the frequency-preserving test. The validated set is the one to read; the raw leaders are shown only so the difference is visible.`,
    `${output.pairsTested} pairs were tested and ${output.validatedPairs.length} validated at a false discovery rate of ${output.falseDiscoveryRate}, so roughly ${output.expectedFalseValidatedPairs} of them are expected to be false. A single pair is not evidence on its own.`,
    `The analytic null holds each term’s frequency fixed but treats every label list as the same size. The seeded reference preserves both each term’s frequency and each label’s list length and reruns the whole procedure ${output.marginPreservingReference.draws} times, validating a median of ${output.marginPreservingReference.medianValidatedPairs} pairs and at most ${output.marginPreservingReference.maximumValidatedPairs}, against ${output.validatedPairs.length} in the recorded corpus.`,
    `${output.listingsFromExtractedRecords} of ${output.listingsAdmitted} admitted term listings come from records the deterministic label parser produced, where no person chose the terms or checked how the sentence was split. The sentence is stored with every listing so a reader can check it, and joined or truncated-looking terms are in the review queue rather than repaired here.`,
    `Terms printed on fewer than ${MINIMUM_LABELS_PER_TERM} labels are profiled but never paired: the frequency-preserving test cannot reach the reporting threshold for them at any co-occurrence count, so pairing them would weaken every other pair without being able to report one of their own.`,
  ]
}

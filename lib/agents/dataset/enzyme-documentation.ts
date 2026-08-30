/**
 * Enzyme and transporter documentation profile.
 *
 * Labels name the enzymes and transporters that handle a medicine in their descriptive sections.
 * Across 3,008 records those namings form a bipartite structure: medicines on one side,
 * counterparties on the other. This agent summarises that structure ONE COUNTERPARTY AT A TIME —
 * how many records name CYP3A4, in which roles, from which label section, with which sentence.
 *
 * THE PROJECTION THIS FILE REFUSES TO COMPUTE. A bipartite graph invites projection onto one side:
 * two medicines that share a counterparty become an edge, and the edge becomes a similarity, a
 * ranking, a "medicines documented alongside X" list. That projection is not computed here at any
 * confidence, under any statistical validation, behind any caveat. FDA's guidance on mobile medical
 * applications treats drug-drug interaction lookup as a device function, and a row holding two
 * medicine names with a relation between them is that function whatever the surrounding prose says.
 * The refusal is structural rather than editorial: no type declared below can hold two medicine
 * identifiers, so there is no shape for such a row to be written into, and adding one is a visible
 * change to the type surface rather than a quiet change to a query.
 *
 * What the counts mean, and do not. A counterparty's degree measures how often labels DOCUMENT it.
 * CYP3A4 leads this corpus partly because it is the enzyme US labelling is most often required to
 * characterise, not because a count of paragraphs measures metabolic importance. And a recorded
 * role is a structural statement read from a descriptive section, never a clinical consequence.
 *
 * Two admission rules keep the dataset answerable to its sources:
 *
 * 1. A mention is admitted only when the recorded counterparty appears in the excerpt that created
 *    it. Letter case is the single tolerated difference, because the parser records counterparties
 *    in upper case while labels print P-gp and CYP3A4 in mixed case. Nothing else is normalised —
 *    no spaces removed, no digit groups rejoined, no synonym table. A label sentence reading
 *    "CYP 1A2, 2C9, 2C19" does not contain the string "CYP1A2", so an edge parsed out of a
 *    collapsed list is withheld and sent to a person rather than accepted on a looser match.
 * 2. An excerpt that trips the forbidden-phrase screen is withheld too. Only descriptive label
 *    sections may be read for structure; advice wording in an excerpt is evidence that the section
 *    attribution is wrong, so the mention goes to review instead of into the dataset.
 *
 * Recorded spellings are never merged. P-GP, PGP and P-GLYCOPROTEIN stay three counterparties here.
 * Deciding they are one thing is an interpretation the parser did not make and this agent will not
 * make on its behalf; where one spelling is a strict prefix of another the pair is reported as a
 * lexical observation for a person to settle.
 */

import { median } from '@/lib/agents/core/statistics'
import { createRng } from '@/lib/agents/core/rng'
import {
  findForbiddenPhrases,
  type AgentInput,
  type AgentRun,
  type DatasetAgent,
  type ReviewCandidate,
} from '@/lib/agents/core/types'
import type {
  BackgroundSource,
  DescriptiveLabelSection,
  InteractionPolarity,
  InteractionRole,
  RecordedInteractionSignal,
} from '@/lib/background/types'

/* ------------------------------------------------------------------------------------------- */
/* Output types                                                                                 */
/* ------------------------------------------------------------------------------------------- */

/**
 * One record's naming of one counterparty, with the sentence that names it.
 *
 * This row is about exactly one medicine. It carries `slug` and `name`, which are two labels for
 * the same record, and there is deliberately no second medicine field: this is the only type in
 * the dataset that names a medicine at all, so a medicine-to-medicine row cannot be constructed
 * from the output without adding a type that does not exist.
 */
export interface CounterpartyMention {
  slug: string
  name: string
  /** Absent when the recorded sentence stated more than one role and the parser attached none. */
  role?: InteractionRole
  /** Whether the sentence asserted the role or denied it. Absent on pre-polarity records. */
  polarity?: InteractionPolarity
  labelSection?: DescriptiveLabelSection
  /**
   * Whether the counterparty appears in the excerpt with exactly the recorded letter case. False
   * means the match tolerated case, as with a record of P-GP read from a sentence printing P-gp.
   */
  matchesSourceCasing: boolean
  sourceKind: BackgroundSource['kind']
  sourceIdentifier: string
  retrievedAt: string
  /** The fetched wording the counterparty was read from; it contains the counterparty verbatim. */
  excerpt: string
}

/**
 * One role, counted separately by whether the sentence asserted it or denied it.
 *
 * Roughly three quarters of the role-bearing sentences in this corpus are denials — "abacavir does
 * not inhibit human CYP3A4, CYP2D6, or CYP2C9" is a real result from a real study. Adding a denial
 * to the same counter as an assertion states the opposite of the source, which is the defect
 * `polarity` was recorded to prevent; a tally without a polarity dimension reintroduces it one
 * layer up.
 *
 * `polarityNotRecorded` exists because a record written before polarity was stored cannot be
 * classified either way, and `lib/background/types.ts` is explicit that a role with unknown
 * polarity may not be displayed as an assertion. It is never folded into the other two.
 */
export interface RolePolarityTally {
  asserted: number
  negated: number
  polarityNotRecorded: number
}

/**
 * Roles recorded for one counterparty across the records naming it.
 *
 * `roleNotStated` is a first-class outcome rather than a gap. Interaction prose routinely names two
 * roles in one sentence, and the parser refuses to guess which attaches to which counterparty, so
 * the sentence is kept whole and no role is claimed.
 */
export interface CounterpartyRoleTally {
  substrate: RolePolarityTally
  inhibitor: RolePolarityTally
  inducer: RolePolarityTally
  roleNotStated: number
}

/** Which descriptive label section named the counterparty, counted across the records naming it. */
export interface CounterpartyLabelSectionTally {
  clinicalPharmacology: number
  pharmacokinetics: number
  sectionNotStated: number
}

/**
 * How the corpus classified the counterparty. Counts rather than one chosen value, because a
 * spelling recorded as an enzyme by some sources and a transporter by others is a disagreement to
 * report, not one to settle.
 */
export interface CounterpartyKindTally {
  enzyme: number
  transporter: number
}

export interface CounterpartyDocumentationProfile {
  /** The counterparty exactly as recorded. Variant spellings are not merged. */
  counterparty: string
  kinds: CounterpartyKindTally
  medicinesRecording: number
  /** Of all records considered, including the many that name no counterparty at all. */
  shareOfRecordsConsidered: number
  /** Of the records that name at least one counterparty, which is the narrower denominator. */
  shareOfDocumentedRecords: number
  roles: CounterpartyRoleTally
  /** Share of this counterparty's admitted mentions whose sentence settled no single role. */
  roleNotStatedShare: number
  sections: CounterpartyLabelSectionTally
  /** Mentions whose excerpt prints the counterparty in the recorded letter case as well. */
  mentionsMatchingSourceCasing: number
  /**
   * Other recorded spellings that begin with this one. A lexical observation only: the corpus does
   * not state whether they name the same counterparty and this agent does not decide that.
   */
  longerRecordedSpellings: readonly string[]
  mentions: readonly CounterpartyMention[]
}

/**
 * How unevenly the documentation is spread over counterparties.
 *
 * Reported three ways because each answers a different question a reader actually has: the top
 * share is the headline, the Herfindahl index is sensitive to the largest holders, and the Gini
 * coefficient describes the whole spread. The uniform reference is a seeded null showing what these
 * numbers would look like if the same mentions fell on counterparties by chance; uniform allocation
 * is not a plausible model of how labels are written, so it is a reference point for reading the
 * observed spread and not a hypothesis anyone is testing.
 */
export interface DocumentationConcentration {
  counterpartiesDocumented: number
  mentionsAdmitted: number
  topCounterparty: string
  topCounterpartyShare: number
  topFiveShare: number
  herfindahlIndex: number
  /** Rescaled so 0 is a perfectly even spread and 1 is one counterparty holding everything. */
  normalizedHerfindahlIndex: number
  giniCoefficient: number
  uniformReferenceGiniMedian: number
  /** Uniform draws whose Gini reached the observed one, out of `uniformReferenceDraws`. */
  uniformReferenceDrawsAtOrAboveObserved: number
  uniformReferenceDraws: number
}

export interface EnzymeDocumentationProfile {
  /** Ordered by how many records name the counterparty, then by the recorded spelling. */
  counterparties: readonly CounterpartyDocumentationProfile[]
  concentration: DocumentationConcentration
  recordsConsidered: number
  recordsNamingAnyCounterparty: number
  /** Records whose sources named no enzyme or transporter. Silence, not a negative finding. */
  recordsNamingNone: number
  mentionsAdmitted: number
  /** Withheld because the recorded counterparty is not in the excerpt it was read from. */
  mentionsWithheldCounterpartyNotInExcerpt: number
  /** Withheld because the excerpt reads as advice, which a descriptive section should not. */
  mentionsWithheldExcerptFailedScreen: number
  /** Share of all admitted mentions whose sentence settled no single role. */
  roleNotStatedShare: number
  /** Admitted mentions read by the deterministic parser rather than judged by a person. */
  mentionsFromExtractedRecords: number
}

/* ------------------------------------------------------------------------------------------- */
/* Measures                                                                                     */
/* ------------------------------------------------------------------------------------------- */

/** Six decimal places, so a rerun's dataset diffs cleanly instead of drifting in the last bits. */
function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

function share(part: number, whole: number): number {
  return whole === 0 ? 0 : round6(part / whole)
}

/**
 * Gini coefficient of a set of counts.
 *
 * Applied to counterparty degrees, not to anything about a medicine: it says how unevenly the
 * corpus's naming is spread over the counterparties it names.
 */
export function giniCoefficient(values: readonly number[]): number {
  const sorted = [...values].sort((left, right) => left - right)
  const count = sorted.length
  if (count === 0) return 0
  let total = 0
  let weighted = 0
  for (let index = 0; index < count; index += 1) {
    const value = sorted[index]!
    total += value
    weighted += (index + 1) * value
  }
  if (total === 0) return 0
  return (2 * weighted) / (count * total) - (count + 1) / count
}

/** Herfindahl index of the same degrees: the sum of squared shares. */
export function herfindahlIndex(values: readonly number[]): number {
  const total = values.reduce((sum, value) => sum + value, 0)
  if (total === 0) return 0
  return values.reduce((sum, value) => sum + (value / total) ** 2, 0)
}

/* ------------------------------------------------------------------------------------------- */
/* Agent                                                                                        */
/* ------------------------------------------------------------------------------------------- */

const UNIFORM_REFERENCE_DRAWS = 200

interface AdmittedMention {
  counterparty: string
  signal: RecordedInteractionSignal
  mention: CounterpartyMention
}

interface WithheldMention {
  slug: string
  counterparty: string
  reason: 'NOT_IN_EXCERPT' | 'FAILED_SCREEN'
  source: BackgroundSource
}

/** Compile-time exhaustive: a new descriptive section breaks the build rather than being dropped. */
function addSection(
  tally: CounterpartyLabelSectionTally,
  section: DescriptiveLabelSection | undefined,
): void {
  if (section === undefined) {
    tally.sectionNotStated += 1
    return
  }
  switch (section) {
    case 'clinical_pharmacology':
      tally.clinicalPharmacology += 1
      return
    case 'pharmacokinetics':
      tally.pharmacokinetics += 1
      return
    default: {
      const unhandled: never = section
      throw new Error(`Unhandled descriptive label section: ${String(unhandled)}`)
    }
  }
}

function countPolarity(tally: RolePolarityTally, polarity: InteractionPolarity | undefined): void {
  if (polarity === undefined) {
    tally.polarityNotRecorded += 1
    return
  }
  switch (polarity) {
    case 'ASSERTED':
      tally.asserted += 1
      return
    case 'NEGATED':
      tally.negated += 1
      return
    default: {
      const unhandled: never = polarity
      throw new Error(`Unhandled interaction polarity: ${String(unhandled)}`)
    }
  }
}

function addRole(
  tally: CounterpartyRoleTally,
  role: InteractionRole | undefined,
  polarity: InteractionPolarity | undefined,
): void {
  if (role === undefined) {
    tally.roleNotStated += 1
    return
  }
  switch (role) {
    case 'SUBSTRATE':
      countPolarity(tally.substrate, polarity)
      return
    case 'INHIBITOR':
      countPolarity(tally.inhibitor, polarity)
      return
    case 'INDUCER':
      countPolarity(tally.inducer, polarity)
      return
    default: {
      const unhandled: never = role
      throw new Error(`Unhandled interaction role: ${String(unhandled)}`)
    }
  }
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

export const enzymeDocumentationAgent: DatasetAgent<EnzymeDocumentationProfile> = {
  name: 'enzyme-and-transporter-documentation',
  // 1.1.0 splits every role count by polarity. Before it, a label sentence denying a role was
  // added to the same counter as one asserting it, and about two thirds of the published
  // role-bearing counts were denials reported as assertions.
  version: '1.1.0',
  description:
    'Counts, per enzyme or transporter, how many medicine records name it, in which recorded roles and whether each was asserted or denied, from which descriptive label section, and how concentrated that documentation is across counterparties.',

  run(input: AgentInput): AgentRun<EnzymeDocumentationProfile> {
    const admitted: AdmittedMention[] = []
    const withheld: WithheldMention[] = []
    let recordsNamingAnyCounterparty = 0

    for (const entry of input.corpus) {
      const signals = entry.background.interactionSignals
      if (!signals?.length) continue
      recordsNamingAnyCounterparty += 1

      for (const signal of signals) {
        const counterparty = signal.counterpartyAsRecorded
        const excerpt = signal.source.excerpt ?? ''

        // Admission rule 1: the sentence must contain the counterparty the record claims it names.
        const exactCase = excerpt.includes(counterparty)
        if (!exactCase && !excerpt.toLowerCase().includes(counterparty.toLowerCase())) {
          withheld.push({
            slug: entry.slug,
            counterparty,
            reason: 'NOT_IN_EXCERPT',
            source: signal.source,
          })
          continue
        }

        // Admission rule 2: advice wording in the sentence contradicts its descriptive attribution.
        if (findForbiddenPhrases(excerpt).length > 0) {
          withheld.push({
            slug: entry.slug,
            counterparty,
            reason: 'FAILED_SCREEN',
            source: signal.source,
          })
          continue
        }

        admitted.push({
          counterparty,
          signal,
          mention: {
            slug: entry.slug,
            name: entry.name,
            ...(signal.roleAsRecorded ? { role: signal.roleAsRecorded } : {}),
            // Carried beside the role so a consumer of the JSON can tell an assertion from a
            // denial. Without it the two are indistinguishable once the row leaves this agent.
            ...(signal.polarity ? { polarity: signal.polarity } : {}),
            ...(signal.labelSection ? { labelSection: signal.labelSection } : {}),
            matchesSourceCasing: exactCase,
            sourceKind: signal.source.kind,
            sourceIdentifier: signal.source.identifier,
            retrievedAt: signal.source.retrievedAt,
            excerpt,
          },
        })
      }
    }

    const grouped = new Map<string, AdmittedMention[]>()
    for (const item of admitted) {
      const existing = grouped.get(item.counterparty)
      if (existing) existing.push(item)
      else grouped.set(item.counterparty, [item])
    }

    const spellings = [...grouped.keys()].sort(compareStrings)
    const recordsConsidered = input.corpus.length

    const profiles: CounterpartyDocumentationProfile[] = spellings.map((counterparty) => {
      const items = grouped.get(counterparty) ?? []
      const emptyPolarityTally = (): RolePolarityTally => ({
        asserted: 0,
        negated: 0,
        polarityNotRecorded: 0,
      })
      const roles: CounterpartyRoleTally = {
        substrate: emptyPolarityTally(),
        inhibitor: emptyPolarityTally(),
        inducer: emptyPolarityTally(),
        roleNotStated: 0,
      }
      const sections: CounterpartyLabelSectionTally = {
        clinicalPharmacology: 0,
        pharmacokinetics: 0,
        sectionNotStated: 0,
      }
      const kinds: CounterpartyKindTally = { enzyme: 0, transporter: 0 }
      let matchingCase = 0

      for (const item of items) {
        addRole(roles, item.signal.roleAsRecorded, item.signal.polarity)
        addSection(sections, item.signal.labelSection)
        if (item.signal.kind === 'ENZYME') kinds.enzyme += 1
        else kinds.transporter += 1
        if (item.mention.matchesSourceCasing) matchingCase += 1
      }

      return {
        counterparty,
        kinds,
        medicinesRecording: items.length,
        shareOfRecordsConsidered: share(items.length, recordsConsidered),
        shareOfDocumentedRecords: share(items.length, recordsNamingAnyCounterparty),
        roles,
        roleNotStatedShare: share(roles.roleNotStated, items.length),
        sections,
        mentionsMatchingSourceCasing: matchingCase,
        longerRecordedSpellings: spellings.filter(
          (other) => other !== counterparty && other.startsWith(counterparty),
        ),
        mentions: items
          .map((item) => item.mention)
          .sort((left, right) => compareStrings(left.slug, right.slug)),
      }
    })

    profiles.sort(
      (left, right) =>
        right.medicinesRecording - left.medicinesRecording ||
        compareStrings(left.counterparty, right.counterparty),
    )

    const degrees = profiles.map((profile) => profile.medicinesRecording)
    const observedGini = giniCoefficient(degrees)
    const reference = uniformReferenceGinis(
      degrees.length,
      admitted.length,
      input.seed,
      UNIFORM_REFERENCE_DRAWS,
    )
    const top = profiles[0]
    const hhi = herfindahlIndex(degrees)

    const concentration: DocumentationConcentration = {
      counterpartiesDocumented: profiles.length,
      mentionsAdmitted: admitted.length,
      topCounterparty: top?.counterparty ?? '',
      topCounterpartyShare: share(top?.medicinesRecording ?? 0, admitted.length),
      topFiveShare: share(
        degrees.slice(0, 5).reduce((sum, value) => sum + value, 0),
        admitted.length,
      ),
      herfindahlIndex: round6(hhi),
      normalizedHerfindahlIndex:
        profiles.length > 1 ? round6((hhi - 1 / profiles.length) / (1 - 1 / profiles.length)) : 0,
      giniCoefficient: round6(observedGini),
      uniformReferenceGiniMedian: round6(median(reference)),
      uniformReferenceDrawsAtOrAboveObserved: reference.filter((value) => value >= observedGini)
        .length,
      uniformReferenceDraws: UNIFORM_REFERENCE_DRAWS,
    }

    const roleNotStated = admitted.filter((item) => !item.signal.roleAsRecorded).length
    const fromExtracted = admitted.filter(
      (item) => (item.signal.provenanceTier ?? 'curated') === 'extracted',
    ).length

    const output: EnzymeDocumentationProfile = {
      counterparties: profiles,
      concentration,
      recordsConsidered,
      recordsNamingAnyCounterparty,
      recordsNamingNone: recordsConsidered - recordsNamingAnyCounterparty,
      mentionsAdmitted: admitted.length,
      mentionsWithheldCounterpartyNotInExcerpt: withheld.filter(
        (item) => item.reason === 'NOT_IN_EXCERPT',
      ).length,
      mentionsWithheldExcerptFailedScreen: withheld.filter(
        (item) => item.reason === 'FAILED_SCREEN',
      ).length,
      roleNotStatedShare: share(roleNotStated, admitted.length),
      mentionsFromExtractedRecords: fromExtracted,
    }

    return {
      agent: enzymeDocumentationAgent.name,
      version: enzymeDocumentationAgent.version,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        counterpartyMatch: 'case-insensitive substring of the recorded excerpt',
        spellingsMerged: false,
        uniformReferenceDraws: UNIFORM_REFERENCE_DRAWS,
      },
      output,
      coverage: {
        considered: recordsConsidered,
        used: recordsNamingAnyCounterparty,
        reason: `${recordsConsidered - recordsNamingAnyCounterparty} records name no enzyme or transporter in their recorded sources, so they cannot enter a counterparty profile. Of the mentions in the remaining records, ${withheld.length} were withheld: ${output.mentionsWithheldCounterpartyNotInExcerpt} because the recorded counterparty is not present in the sentence it was read from, ${output.mentionsWithheldExcerptFailedScreen} because the sentence reads as advice rather than description. Withheld mentions are in the review queue, not deleted.`,
      },
      queue: buildQueue(withheld, profiles),
      caveats: buildCaveats(output),
    }
  },
}

/**
 * Gini coefficients from allocating the same number of mentions uniformly over the same number of
 * counterparties, drawn from the seeded generator so the reference is part of the rerunnable run.
 */
function uniformReferenceGinis(
  counterparties: number,
  mentions: number,
  seed: number,
  draws: number,
): number[] {
  if (counterparties === 0 || mentions === 0) return []
  const rng = createRng(seed)
  const results: number[] = []
  for (let draw = 0; draw < draws; draw += 1) {
    const counts = new Array<number>(counterparties).fill(0)
    for (let mention = 0; mention < mentions; mention += 1) {
      const bin = rng.nextInt(counterparties)
      counts[bin] = (counts[bin] ?? 0) + 1
    }
    results.push(giniCoefficient(counts))
  }
  return results
}

/**
 * Work for people, phrased as questions about records.
 *
 * Both rules are lexical. Neither says what the right answer is: a withheld mention may well be a
 * correct reading of a collapsed list, and a short spelling may be exactly what the label printed.
 * Deciding either is the reviewer's job and the reason the item is queued at all.
 */
function buildQueue(
  withheld: readonly WithheldMention[],
  profiles: readonly CounterpartyDocumentationProfile[],
): ReviewCandidate[] {
  const candidates: ReviewCandidate[] = []
  const withheldPerCounterparty = new Map<string, number>()
  for (const item of withheld) {
    withheldPerCounterparty.set(
      item.counterparty,
      (withheldPerCounterparty.get(item.counterparty) ?? 0) + 1,
    )
  }

  for (const item of withheld) {
    const sameProblem = withheldPerCounterparty.get(item.counterparty) ?? 1
    candidates.push({
      slug: item.slug,
      reason: 'ATTRIBUTION_SUSPECT',
      question:
        item.reason === 'NOT_IN_EXCERPT'
          ? `Does the recorded sentence for this record name ${item.counterparty} in that spelling, or was the name assembled from a collapsed list such as "CYP 1A2, 2C9, 2C19"?`
          : `The sentence recorded for ${item.counterparty} on this record reads as advice rather than description. Which label section is it actually from?`,
      priority: sameProblem,
      basis: `Records in the corpus with the same unresolved recorded spelling: ${sameProblem}. A repeated parse gap ranks above a one-off.`,
      sources: [`${item.source.kind}:${item.source.identifier}`],
    })
  }

  for (const profile of profiles) {
    if (profile.longerRecordedSpellings.length === 0) continue
    const longer = profile.longerRecordedSpellings.join(', ')
    for (const mention of profile.mentions) {
      candidates.push({
        slug: mention.slug,
        reason: 'COVERAGE_GAP',
        question: `This record's counterparty is recorded as ${profile.counterparty}. Other records write longer spellings beginning with it (${longer}). Is ${profile.counterparty} the complete name in this record's sentence?`,
        priority: profile.medicinesRecording,
        basis: `Records carrying the shorter recorded spelling: ${profile.medicinesRecording}. The two spellings are not assumed to name the same counterparty.`,
        sources: [`${mention.sourceKind}:${mention.sourceIdentifier}`],
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

function buildCaveats(output: EnzymeDocumentationProfile): string[] {
  const rolePercent = (output.roleNotStatedShare * 100).toFixed(1)
  const top = output.concentration
  return [
    'A recorded role is a mechanistic statement copied from a descriptive label section. It is not a clinical interaction, and nothing in this dataset describes what happens when a person is exposed to two medicines at once.',
    'This dataset holds no relation between one medicine and another. Counts are per counterparty; the medicines naming a counterparty are listed with their sentences and are never paired, ranked against each other or compared.',
    'ICH M12 states that no potency classification system exists for transporters or for non-CYP enzymes, so no strong, moderate or weak vocabulary is applied to any counterparty here. The tallies count records, not strength.',
    'A counterparty with a high count is one that labels document often. Documentation frequency is not importance: US labelling asks for some enzymes to be characterised far more routinely than others, and that requirement is part of what these counts measure.',
    `${rolePercent}% of admitted mentions carry no role. The sentence named more than one role and the parser left the question open rather than attaching a guess, so a role tally is a count of sentences that settled the question, not of medicines for which it is settled.`,
    'Recorded spellings are counted separately and never merged. P-GP, PGP and P-GLYCOPROTEIN are three entries in this dataset because they are three strings in the corpus; whether they name one thing is a question for a person, and prefix relationships are reported as questions rather than resolved.',
    'A mention is admitted only when its excerpt contains the recorded counterparty, tolerating letter case alone. Every other reading of the corpus, including the mentions withheld for that reason, is in the review queue and is not represented in any count above.',
    `${output.recordsNamingNone} of ${output.recordsConsidered} records name no enzyme or transporter at all. That is an absence of recorded text in the sources fetched for those records. It is neither reassurance nor alarm about the medicines concerned.`,
    `${output.mentionsFromExtractedRecords} of ${output.mentionsAdmitted} admitted mentions come from records the deterministic label parser produced, where no person chose the value or wrote its measurement context. The sentence is stored with each one so a reader can check it.`,
    `The uniform reference for concentration allocates the same ${top.mentionsAdmitted} mentions over the same ${top.counterpartiesDocumented} counterparties by chance. Labels are not written that way, so the reference shows only that the observed spread is not a consequence of how many mentions there are.`,
  ]
}

/**
 * The silence ledger: what the recorded documents never say.
 *
 * Every public drug-information resource is a positive-assertion store. It shows what a label
 * states and shows nothing where a label states nothing, so a reader cannot tell an absent fact
 * from a fact nobody recorded, and cannot tell either from a source that explicitly said the
 * question was never settled. Those three situations are different, and the difference is exactly
 * what a person needs in order to know how far the record goes.
 *
 * So this agent classifies every record against a fixed, versioned question set into exactly one of
 * three states:
 *
 *   RECORDED         the corpus holds a sourced value or statement answering the question;
 *   NOT_ESTABLISHED  a source itself says safety or effectiveness was not established;
 *   SILENT           no source in this corpus, in the sections read, addresses it at all.
 *
 * WHAT SILENCE IS AND IS NOT. A silence here is a property of the DOCUMENTS this corpus holds. It
 * is never a property of the medicine, and it is never a safety signal in either direction. A
 * record with no pediatric half-life is not evidence that no pediatric half-life exists; it is
 * evidence that the sources read for this record did not print one. The extractor also reads a
 * fixed set of sections, so a fact printed elsewhere in the same document is silent here. Every
 * count below carries that limit, and the caveats say it in plain words rather than leaving a
 * reader to infer it.
 *
 * The ledger therefore never resolves anything. Where two recorded statements about one population
 * disagree, the entry stays RECORDED and is marked as holding mixed states: recording the
 * disagreement is the product, and deciding which reading wins is not this agent's to do. Source
 * excerpts are deliberately not copied into the output either — an entry carries source
 * identifiers so a reviewer can go back to the fetched artifact, and nothing more.
 */

import type { AgentInput, AgentRun, DatasetAgent, ReviewCandidate } from '@/lib/agents/core/types'
import { createRng, shuffleInPlace } from '@/lib/agents/core/rng'
import type {
  BackgroundSource,
  MedicineRecordedBackground,
  RecordedValue,
  StudiedPopulation,
} from '@/lib/background/types'

/* ------------------------------------------------------------------------------------------- */
/* The question set                                                                             */
/* ------------------------------------------------------------------------------------------- */

/**
 * Version of the question set itself, separate from the agent version.
 *
 * A count of silences only means something against a fixed list of questions. Adding a question
 * moves every silence total, so the list is versioned and the version travels with the dataset;
 * two runs are comparable only when this string matches.
 */
export const SILENCE_QUESTION_SET_VERSION = 'silence-questions/v1' as const

/** The fixed question order. Everything downstream is emitted in this order. */
export const SILENCE_QUESTION_IDS = [
  'half_life',
  'bioavailability',
  't_max',
  'protein_binding',
  'volume_of_distribution',
  'mechanism_of_action',
  'molecular_identity',
  'metabolic_handling',
  'boxed_warning',
  'contraindications',
  'most_common_adverse_reactions',
  'population_pediatric',
  'population_geriatric',
  'population_pregnancy',
  'population_lactation',
  'population_hepatic_impairment',
  'population_renal_impairment',
] as const
export type SilenceQuestionId = (typeof SILENCE_QUESTION_IDS)[number]

export const SILENCE_STATES = ['RECORDED', 'NOT_ESTABLISHED', 'SILENT'] as const
export type SilenceState = (typeof SILENCE_STATES)[number]

export interface SilenceQuestion {
  id: SilenceQuestionId
  /** Reader-facing wording. Always asked about the recorded documents, never about the medicine. */
  prompt: string
  /** The corpus field a RECORDED answer is read from, so a reader can check the classification. */
  module: string
  /**
   * Whether an explicit "not established" is observable for this question at all.
   *
   * Only population statements carry a source-stated evidence state. On every other question a
   * source sentence saying a value was never determined, if one exists, reaches the corpus as a
   * plain absence — so it lands in SILENT and cannot be told apart from a source that simply never
   * raised the question. Saying which questions can make that distinction is the difference
   * between a limitation and a hidden one.
   */
  distinguishesNotEstablished: boolean
}

/** One classified medicine-question pair. */
export interface SilenceLedgerEntry {
  questionId: SilenceQuestionId
  state: SilenceState
  /**
   * `kind:identifier` for each source behind a RECORDED or NOT_ESTABLISHED entry, in recorded
   * order. Always empty for SILENT, which is the whole point of the state.
   */
  sources: readonly string[]
  /**
   * Set when the recorded statements for this question do not agree with each other — one says a
   * group was studied while another says the question was not established. The entry counts as
   * RECORDED because sourced statements do answer it; which statement is right is not decided here.
   */
  mixedRecordedStates?: boolean
  /**
   * Set when every recorded statement behind a RECORDED entry only DISCUSSES the group without
   * settling safety or effectiveness for it.
   *
   * The corpus keeps STUDIED and STATEMENT_ONLY apart deliberately, and the difference is most of
   * the data: 4,620 of 6,282 recorded population statements merely mention the group. Folding them
   * together would let a roll-up report a question as answered for 45% of records when for almost
   * all of that share the source raised the group and settled nothing, which is the exact mistake
   * this ledger exists to prevent, made in the reassuring direction.
   */
  mentionedWithoutFinding?: boolean
}

export interface MedicineSilenceLedger {
  slug: string
  name: string
  /** One entry per question, in `SILENCE_QUESTION_IDS` order. */
  entries: readonly SilenceLedgerEntry[]
  recorded: number
  notEstablished: number
  silent: number
}

/** Counts split by how the record was produced, because the two tiers fail differently. */
export interface TierCounts {
  curated: number
  extracted: number
}

export interface SilenceQuestionRollUp {
  questionId: SilenceQuestionId
  prompt: string
  recorded: number
  notEstablished: number
  silent: number
  /** Records classified, equal to the corpus size for every question. */
  medicines: number
  /** (recorded + notEstablished) / medicines: how often the corpus holds any answer at all. */
  addressedShare: number
  silentShare: number
  /**
   * Ranking key for where the corpus is most silent relative to how often it answers elsewhere:
   * silent count weighted by addressed share. A question nothing answers scores low because there
   * is no evidence the fact is usually recordable; a question everything answers scores low because
   * there is nothing missing. The gap sits in between.
   */
  gapScore: number
  /**
   * Of `recorded`, how many hold only statements that mention the group without settling it. A
   * high recorded share is not a high share of settled answers when this number is close to it.
   */
  recordedMentionOnly: number
  recordedByTier: TierCounts
  silentByTier: TierCounts
}

export interface SilenceLedger {
  questionSetVersion: typeof SILENCE_QUESTION_SET_VERSION
  questions: readonly SilenceQuestion[]
  /** Per-medicine ledgers, in corpus order. */
  medicines: readonly MedicineSilenceLedger[]
  /** One roll-up per question, ordered by `gapScore` descending then question id. */
  rollUp: readonly SilenceQuestionRollUp[]
  totals: {
    medicines: number
    questions: number
    /** medicines × questions, the number of classified pairs. */
    pairs: number
    recorded: number
    notEstablished: number
    silent: number
    /** Records produced by the deterministic label parser rather than assembled by a person. */
    extractedRecords: number
    /** Entries where the recorded statements disagree and the ledger leaves them unresolved. */
    mixedRecordedStates: number
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Classification                                                                               */
/* ------------------------------------------------------------------------------------------- */

interface Classification {
  state: SilenceState
  sources: string[]
  mixedRecordedStates?: boolean
  mentionedWithoutFinding?: boolean
}

type Classifier = (background: MedicineRecordedBackground) => Classification

function sourceKey(source: BackgroundSource): string {
  return `${source.kind}:${source.identifier}`
}

function distinct(keys: readonly string[]): string[] {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const key of keys) {
    if (seen.has(key)) continue
    seen.add(key)
    ordered.push(key)
  }
  return ordered
}

const SILENT: Classification = { state: 'SILENT', sources: [] }

/**
 * A recorded value answers its question whether or not it parsed to a number. A display-only value
 * ("about five days") is still a source stating something, which is what the ledger asks about; it
 * is only barred from becoming a coordinate or a statistic, and nothing here does either.
 */
function fromValue(value: RecordedValue | undefined): Classification {
  if (!value) return SILENT
  const keys = [sourceKey(value.source)]
  if (value.alternateValue) keys.push(sourceKey(value.alternateValue.source))
  return { state: 'RECORDED', sources: distinct(keys) }
}

function fromSources(present: boolean, sources: readonly BackgroundSource[]): Classification {
  if (!present) return SILENT
  return { state: 'RECORDED', sources: distinct(sources.map(sourceKey)) }
}

function classifyPopulation(population: StudiedPopulation): Classifier {
  return (background) => {
    const statements = (background.populationStatements ?? []).filter(
      (statement) => statement.population === population,
    )
    if (statements.length === 0) return SILENT
    const sources = distinct(statements.map((statement) => sourceKey(statement.source)))
    const notEstablished = statements.filter(
      (statement) => statement.state === 'NOT_ESTABLISHED',
    ).length
    // NOT_ESTABLISHED is claimed only when every recorded statement says so. A mixed set is a
    // disagreement between sources, and collapsing it either way would be the agent picking a
    // winner; it stays RECORDED and carries the mark instead.
    if (notEstablished === statements.length) return { state: 'NOT_ESTABLISHED', sources }
    if (notEstablished > 0) return { state: 'RECORDED', sources, mixedRecordedStates: true }
    // A set where every statement only discusses the group is marked, because "the source mentions
    // pregnancy" and "the source reports a finding in pregnancy" are different answers, and the
    // corpus already keeps them apart.
    const allMentionOnly = statements.every((statement) => statement.state === 'STATEMENT_ONLY')
    if (allMentionOnly) return { state: 'RECORDED', sources, mentionedWithoutFinding: true }
    return { state: 'RECORDED', sources }
  }
}

interface QuestionDefinition {
  prompt: string
  module: string
  distinguishesNotEstablished: boolean
  classify: Classifier
}

const QUESTION_DEFINITIONS: Record<SilenceQuestionId, QuestionDefinition> = {
  half_life: {
    prompt: 'Do the recorded documents state an elimination half-life?',
    module: 'pharmacokinetics.halfLife',
    distinguishesNotEstablished: false,
    classify: (background) => fromValue(background.pharmacokinetics?.halfLife),
  },
  bioavailability: {
    prompt: 'Do the recorded documents state a bioavailability?',
    module: 'pharmacokinetics.bioavailability',
    distinguishesNotEstablished: false,
    classify: (background) => fromValue(background.pharmacokinetics?.bioavailability),
  },
  t_max: {
    prompt: 'Do the recorded documents state a time to maximum concentration?',
    module: 'pharmacokinetics.tMax',
    distinguishesNotEstablished: false,
    classify: (background) => fromValue(background.pharmacokinetics?.tMax),
  },
  protein_binding: {
    prompt: 'Do the recorded documents state plasma protein binding?',
    module: 'pharmacokinetics.proteinBinding',
    distinguishesNotEstablished: false,
    classify: (background) => fromValue(background.pharmacokinetics?.proteinBinding),
  },
  volume_of_distribution: {
    prompt: 'Do the recorded documents state a volume of distribution?',
    module: 'pharmacokinetics.volumeOfDistribution',
    distinguishesNotEstablished: false,
    classify: (background) => fromValue(background.pharmacokinetics?.volumeOfDistribution),
  },
  mechanism_of_action: {
    prompt: 'Do the recorded documents describe how the medicine acts?',
    module: 'mechanism.statements',
    distinguishesNotEstablished: false,
    classify: (background) => {
      const statements = background.mechanism?.statements ?? []
      return fromSources(
        statements.length > 0,
        statements.map((statement) => statement.source),
      )
    },
  },
  molecular_identity: {
    prompt: 'Do the recorded documents state a molecular formula or molecular weight?',
    module: 'molecularIdentity',
    distinguishesNotEstablished: false,
    classify: (background) => {
      const formula = background.molecularIdentity?.molecularFormula
      const weight = background.molecularIdentity?.molecularWeight
      const sources = [formula?.source, weight?.source].filter(
        (source): source is BackgroundSource => source !== undefined,
      )
      return fromSources(sources.length > 0, sources)
    },
  },
  metabolic_handling: {
    prompt: 'Do the recorded documents name an enzyme or transporter that handles the medicine?',
    module: 'interactionSignals',
    distinguishesNotEstablished: false,
    classify: (background) => {
      const signals = background.interactionSignals ?? []
      return fromSources(
        signals.length > 0,
        signals.map((signal) => signal.source),
      )
    },
  },
  boxed_warning: {
    prompt: 'Do the recorded documents carry a boxed warning?',
    module: 'safety.boxedWarning',
    distinguishesNotEstablished: false,
    classify: (background) => {
      const boxed = background.safety?.boxedWarning
      return fromSources(boxed !== undefined, boxed ? [boxed.source] : [])
    },
  },
  contraindications: {
    prompt: 'Do the recorded documents list contraindications?',
    module: 'safety.contraindications',
    distinguishesNotEstablished: false,
    classify: (background) => {
      const statements = background.safety?.contraindications ?? []
      return fromSources(
        statements.length > 0,
        statements.map((statement) => statement.source),
      )
    },
  },
  most_common_adverse_reactions: {
    prompt: 'Do the recorded documents list the most common adverse reactions?',
    module: 'commonAdverseReactions',
    distinguishesNotEstablished: false,
    classify: (background) => {
      const reactions = background.commonAdverseReactions
      const present = reactions !== undefined && reactions.eventsAsRecorded.length > 0
      return fromSources(present, reactions ? [reactions.source] : [])
    },
  },
  population_pediatric: {
    prompt: 'Do the recorded documents address a pediatric population?',
    module: 'populationStatements[PEDIATRIC]',
    distinguishesNotEstablished: true,
    classify: classifyPopulation('PEDIATRIC'),
  },
  population_geriatric: {
    prompt: 'Do the recorded documents address a geriatric population?',
    module: 'populationStatements[GERIATRIC]',
    distinguishesNotEstablished: true,
    classify: classifyPopulation('GERIATRIC'),
  },
  population_pregnancy: {
    prompt: 'Do the recorded documents address use during pregnancy?',
    module: 'populationStatements[PREGNANCY]',
    distinguishesNotEstablished: true,
    classify: classifyPopulation('PREGNANCY'),
  },
  population_lactation: {
    prompt: 'Do the recorded documents address use during lactation?',
    module: 'populationStatements[LACTATION]',
    distinguishesNotEstablished: true,
    classify: classifyPopulation('LACTATION'),
  },
  population_hepatic_impairment: {
    prompt: 'Do the recorded documents address hepatic impairment?',
    module: 'populationStatements[HEPATIC_IMPAIRMENT]',
    distinguishesNotEstablished: true,
    classify: classifyPopulation('HEPATIC_IMPAIRMENT'),
  },
  population_renal_impairment: {
    prompt: 'Do the recorded documents address renal impairment?',
    module: 'populationStatements[RENAL_IMPAIRMENT]',
    distinguishesNotEstablished: true,
    classify: classifyPopulation('RENAL_IMPAIRMENT'),
  },
}

/** The question set as data, for a page that needs to show what was asked before what was found. */
export const SILENCE_QUESTIONS: readonly SilenceQuestion[] = SILENCE_QUESTION_IDS.map((id) => ({
  id,
  prompt: QUESTION_DEFINITIONS[id].prompt,
  module: QUESTION_DEFINITIONS[id].module,
  distinguishesNotEstablished: QUESTION_DEFINITIONS[id].distinguishesNotEstablished,
}))

/**
 * Compile-time proof that every studied population has a question. The population questions exist
 * to carry `PopulationEvidenceState` into the ledger, so a population added to the corpus without a
 * question here would silently drop its NOT_ESTABLISHED statements into nothing.
 */
const POPULATION_QUESTION_ID: Record<StudiedPopulation, SilenceQuestionId> = {
  PEDIATRIC: 'population_pediatric',
  GERIATRIC: 'population_geriatric',
  PREGNANCY: 'population_pregnancy',
  LACTATION: 'population_lactation',
  HEPATIC_IMPAIRMENT: 'population_hepatic_impairment',
  RENAL_IMPAIRMENT: 'population_renal_impairment',
}

/** The question that carries a given population's recorded evidence state. */
export function silenceQuestionForPopulation(population: StudiedPopulation): SilenceQuestionId {
  return POPULATION_QUESTION_ID[population]
}

/* ------------------------------------------------------------------------------------------- */
/* Review queue                                                                                 */
/* ------------------------------------------------------------------------------------------- */

/** How many of the highest-gap questions contribute review candidates. */
const QUEUE_QUESTION_LIMIT = 5
/** How many records are queued per gap question, so one question cannot fill the whole queue. */
const QUEUE_PER_QUESTION_LIMIT = 8
/** Source identifiers carried on a candidate, enough to find the record's documents again. */
const QUEUE_SOURCE_LIMIT = 5

function percent(share: number): string {
  return `${(share * 100).toFixed(1)}%`
}

/* ------------------------------------------------------------------------------------------- */
/* The agent                                                                                    */
/* ------------------------------------------------------------------------------------------- */

export const silenceLedgerAgent: DatasetAgent<SilenceLedger> = {
  name: 'silence-ledger',
  version: '1.0.0',
  description:
    'Classifies every record against a fixed question set as recorded, stated not established, or silent, and counts where the corpus holds no answer.',

  run(input: AgentInput): AgentRun<SilenceLedger> {
    const rng = createRng(input.seed)
    const medicines: MedicineSilenceLedger[] = []

    const recordedByQuestion = new Map<SilenceQuestionId, number>()
    const mentionOnlyByQuestion = new Map<SilenceQuestionId, number>()
    const notEstablishedByQuestion = new Map<SilenceQuestionId, number>()
    const silentByQuestion = new Map<SilenceQuestionId, number>()
    const recordedTierByQuestion = new Map<SilenceQuestionId, TierCounts>()
    const silentTierByQuestion = new Map<SilenceQuestionId, TierCounts>()
    for (const id of SILENCE_QUESTION_IDS) {
      recordedByQuestion.set(id, 0)
      notEstablishedByQuestion.set(id, 0)
      silentByQuestion.set(id, 0)
      recordedTierByQuestion.set(id, { curated: 0, extracted: 0 })
      silentTierByQuestion.set(id, { curated: 0, extracted: 0 })
    }

    let extractedRecords = 0
    let mixedRecordedStates = 0

    for (const entry of input.corpus) {
      // An absent tier means the record was assembled by a person; see the background contract.
      const isExtracted = entry.background.provenanceTier === 'extracted'
      if (isExtracted) extractedRecords += 1
      const tier: keyof TierCounts = isExtracted ? 'extracted' : 'curated'

      const entries: SilenceLedgerEntry[] = []
      let recorded = 0
      let notEstablished = 0
      let silent = 0

      for (const id of SILENCE_QUESTION_IDS) {
        const classification = QUESTION_DEFINITIONS[id].classify(entry.background)
        entries.push({
          questionId: id,
          state: classification.state,
          sources: classification.sources,
          ...(classification.mixedRecordedStates ? { mixedRecordedStates: true } : {}),
          ...(classification.mentionedWithoutFinding ? { mentionedWithoutFinding: true } : {}),
        })
        if (classification.mixedRecordedStates) mixedRecordedStates += 1

        if (classification.state === 'RECORDED') {
          recorded += 1
          recordedByQuestion.set(id, (recordedByQuestion.get(id) ?? 0) + 1)
          if (classification.mentionedWithoutFinding) {
            mentionOnlyByQuestion.set(id, (mentionOnlyByQuestion.get(id) ?? 0) + 1)
          }
          const counts = recordedTierByQuestion.get(id)
          if (counts) counts[tier] += 1
        } else if (classification.state === 'NOT_ESTABLISHED') {
          notEstablished += 1
          notEstablishedByQuestion.set(id, (notEstablishedByQuestion.get(id) ?? 0) + 1)
        } else {
          silent += 1
          silentByQuestion.set(id, (silentByQuestion.get(id) ?? 0) + 1)
          const counts = silentTierByQuestion.get(id)
          if (counts) counts[tier] += 1
        }
      }

      medicines.push({
        slug: entry.slug,
        name: entry.name,
        entries,
        recorded,
        notEstablished,
        silent,
      })
    }

    const total = medicines.length
    const questionCount = SILENCE_QUESTION_IDS.length

    const rollUp: SilenceQuestionRollUp[] = SILENCE_QUESTION_IDS.map((id) => {
      const recorded = recordedByQuestion.get(id) ?? 0
      const recordedMentionOnly = mentionOnlyByQuestion.get(id) ?? 0
      const notEstablished = notEstablishedByQuestion.get(id) ?? 0
      const silent = silentByQuestion.get(id) ?? 0
      const addressedShare = total > 0 ? (recorded + notEstablished) / total : 0
      return {
        questionId: id,
        prompt: QUESTION_DEFINITIONS[id].prompt,
        recorded,
        recordedMentionOnly,
        notEstablished,
        silent,
        medicines: total,
        addressedShare,
        silentShare: total > 0 ? silent / total : 0,
        gapScore: silent * addressedShare,
        recordedByTier: recordedTierByQuestion.get(id) ?? { curated: 0, extracted: 0 },
        silentByTier: silentTierByQuestion.get(id) ?? { curated: 0, extracted: 0 },
      }
    }).sort(
      (left, right) =>
        right.gapScore - left.gapScore || left.questionId.localeCompare(right.questionId),
    )

    const totals = medicines.reduce(
      (sums, ledger) => ({
        recorded: sums.recorded + ledger.recorded,
        notEstablished: sums.notEstablished + ledger.notEstablished,
        silent: sums.silent + ledger.silent,
      }),
      { recorded: 0, notEstablished: 0, silent: 0 },
    )

    const queue = buildQueue(medicines, rollUp, questionCount, rng)

    return {
      agent: silenceLedgerAgent.name,
      version: silenceLedgerAgent.version,
      runDate: input.runDate,
      seed: input.seed,
      parameters: {
        questionSetVersion: SILENCE_QUESTION_SET_VERSION,
        questions: questionCount,
        queueQuestionLimit: QUEUE_QUESTION_LIMIT,
        queuePerQuestionLimit: QUEUE_PER_QUESTION_LIMIT,
      },
      coverage: {
        considered: total,
        used: total,
        reason:
          'Every record is classified against every question, because an absence is one of the three states rather than a reason to leave a record out. Full coverage here therefore says nothing about how complete any record is; the roll-up is what says that.',
      },
      output: {
        questionSetVersion: SILENCE_QUESTION_SET_VERSION,
        questions: SILENCE_QUESTIONS,
        medicines,
        rollUp,
        totals: {
          medicines: total,
          questions: questionCount,
          pairs: total * questionCount,
          recorded: totals.recorded,
          notEstablished: totals.notEstablished,
          silent: totals.silent,
          extractedRecords,
          mixedRecordedStates,
        },
      },
      queue,
      caveats: buildCaveats(total, extractedRecords, rollUp),
    }
  },
}

function buildQueue(
  medicines: readonly MedicineSilenceLedger[],
  rollUp: readonly SilenceQuestionRollUp[],
  questionCount: number,
  rng: ReturnType<typeof createRng>,
): ReviewCandidate[] {
  const candidates: ReviewCandidate[] = []
  const gapQuestions = rollUp
    .filter((question) => question.gapScore > 0)
    .slice(0, QUEUE_QUESTION_LIMIT)

  for (const question of gapQuestions) {
    const forQuestion: Array<{ candidate: ReviewCandidate; priority: number }> = []

    for (const ledger of medicines) {
      const entry = ledger.entries.find((item) => item.questionId === question.questionId)
      if (!entry || entry.state !== 'SILENT') continue

      // A record that answers most other questions and is silent on a question the corpus usually
      // answers is the likeliest place for a section the extractor did not read. A near-empty
      // record is silent on almost everything, which says nothing about this question in
      // particular, so it ranks below.
      const otherAnswered = ledger.recorded + ledger.notEstablished
      const otherShare = questionCount > 1 ? otherAnswered / (questionCount - 1) : 0
      const priority = question.addressedShare * otherShare

      forQuestion.push({
        priority,
        candidate: {
          slug: ledger.slug,
          reason: 'COVERAGE_GAP',
          question: `${question.prompt} This record holds no answer, while ${question.recorded + question.notEstablished} of ${question.medicines} records in the corpus hold one. Check whether a source already fetched for this record states it in a section the extractor did not read.`,
          priority,
          basis: `Silent on a question ${percent(question.addressedShare)} of records answer, in a record that answers ${otherAnswered} of the other ${questionCount - 1} questions; ranked on those two shares, with ties broken by a seeded shuffle so the queue is not ordered by slug. Silence is a property of the documents recorded here, not of the medicine, and not a sign that anything is wrong with the record.`,
          sources: distinct(ledger.entries.flatMap((item) => item.sources)).slice(
            0,
            QUEUE_SOURCE_LIMIT,
          ),
        },
      })
    }

    // Shuffle first, then sort: the sort is stable, so equal priorities keep the shuffled order
    // instead of the corpus order, which would put the same alphabetically early slugs at the top
    // of every run.
    shuffleInPlace(forQuestion, rng)
    forQuestion.sort((left, right) => right.priority - left.priority)
    for (const item of forQuestion.slice(0, QUEUE_PER_QUESTION_LIMIT)) {
      candidates.push(item.candidate)
    }
  }

  return candidates.sort((left, right) => right.priority - left.priority)
}

function buildCaveats(
  total: number,
  extractedRecords: number,
  rollUp: readonly SilenceQuestionRollUp[],
): string[] {
  const populationQuestions = SILENCE_QUESTIONS.filter(
    (question) => question.distinguishesNotEstablished,
  ).length
  const boxed = rollUp.find((question) => question.questionId === 'boxed_warning')
  // The share of recorded population answers that only mention the group. Computed here rather
  // than asserted, so the caveat cannot drift away from the data it describes.
  const populationRollUps = rollUp.filter((question) =>
    question.questionId.startsWith('population_'),
  )
  const populationRecorded = populationRollUps.reduce((sum, question) => sum + question.recorded, 0)
  const populationMentionOnly = populationRollUps.reduce(
    (sum, question) => sum + question.recordedMentionOnly,
    0,
  )
  const mentionOnlyShare =
    populationRecorded > 0 ? Math.round((100 * populationMentionOnly) / populationRecorded) : 0

  return [
    'SILENT means no source in this corpus, in the sections that were read, states an answer. It is a fact about the documents recorded here and never a fact about the medicine.',
    'A record silent on a question is not evidence that no answer exists, and it is not evidence of safety or of danger in either direction. A label that never states a pediatric half-life is a label that never states one, nothing more.',
    'Section scoping is a real limit. A fact can sit in a section the extractor does not read, so every silence count should be read as "not recorded from the sections read" rather than "not stated anywhere".',
    boxed
      ? `Silence on the boxed-warning question is the clearest case of this: ${boxed.silent} of ${total} records hold no boxed-warning statement, which means no recorded document contributed one, not that no boxed warning exists.`
      : 'Silence on the boxed-warning question means no recorded document contributed one, not that no boxed warning exists.',
    `Only the ${populationQuestions} population questions can show NOT_ESTABLISHED, because only population statements carry a source-stated evidence state. On the other ${SILENCE_QUESTIONS.length - populationQuestions} questions a source sentence saying something was never determined, if one was printed, arrives here as a plain absence and is counted as SILENT.`,
    `${extractedRecords} of ${total} records were produced by the deterministic label parser rather than assembled by a person. The parser reads a fixed set of sections, so its silences are more often a limit of the parser than of the source; the roll-up splits recorded and silent counts by tier so the two are never added together blindly.`,
    `RECORDED on a population question merges two different answers: a source reporting a finding in the group, and a source that only raises the group without settling safety or effectiveness for it. ${mentionOnlyShare}% of recorded population answers here are the second kind, so a high recorded share on those questions is not a high share of settled answers. Entries of the second kind carry mentionedWithoutFinding and the roll-up counts them in recordedMentionOnly.`,
    'Where the recorded statements for one population disagree, one saying a group was studied and another saying the question was not established, the entry counts as RECORDED and is marked as holding mixed states. The disagreement is recorded and is not settled here.',
    'Counts are over the records this corpus holds, which is neither every medicine nor every revision of every document. The recorded share of a question is a property of this corpus on this run date.',
    'The review queue is one seeded sample of the records tied at the top of each question, not the canonical worst forty. Priorities tie in large groups, so a different seed surfaces different records and a record absent from the queue has not been ruled out.',
    'A queued item is not a claim that a record is wrong. Many silences are correct, because sources genuinely do not state many of these things; the queue only marks where a person looking again is most likely to find something.',
  ]
}

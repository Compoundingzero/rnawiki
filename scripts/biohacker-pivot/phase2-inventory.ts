import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'

import { Pool } from 'pg'

/**
 * PHASE 2 — inventory which of eight data types each canonical record actually has.
 *
 * EDITORIAL RULE. Everything written here is either a stored value carried across verbatim or a
 * count of stored values. No dose is recommended, no trial is judged to have failed, no evidence
 * grade is invented. Where a signal is not stored anywhere in the corpus, the output says so
 * rather than inferring it: animal-only and in-vitro-only evidence in particular are NOT
 * derivable, because ClinicalTrials.gov registers human studies only and the PubMed search stored
 * here was filtered to `clinical trial[pt]`.
 *
 *   npx tsx scripts/biohacker-pivot/phase2-inventory.ts [--force]
 *   npx tsx scripts/biohacker-pivot/phase2-inventory.ts --report   # re-summarise cached records
 *
 * A completed run prints `already done` and exits 0. `--report` rebuilds only the summary from
 * `phase2-records.ndjson`, adding the phase 1 strict/moderate/broad slices when
 * `phase1-records.ndjson` exists.
 */

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url))
const OUT_DIR = join(REPO_ROOT, 'data/biohacker-pivot')
const RECORDS_PATH = join(OUT_DIR, 'phase2-records.ndjson')
const SUMMARY_PATH = join(OUT_DIR, 'phase2-summary.json')
const STATE_PATH = join(OUT_DIR, 'state.json')
const PHASE1_RECORDS_PATH = join(OUT_DIR, 'phase1-records.ndjson')
const RAW_DIR = join(REPO_ROOT, 'data/trial-results/raw')
const STUDY_MAP_PATH = join(REPO_ROOT, 'data/trial-results/study-to-records.json')
const REGULATORY_REGISTRY_PATH = join(REPO_ROOT, 'data/registries/regulatory-approval.json')

const DATA_TYPES = [
  'evidenceTier',
  'humanDoseStudied',
  'trialFailures',
  'outcomeMeasures',
  'kinetics',
  'interactionPathways',
  'evidenceCeiling',
  'regulatoryDivergence',
] as const
type DataType = (typeof DATA_TYPES)[number]

/** Storage caps. Totals are always counted in full; only the carried verbatim list is capped. */
const MAX_DOSE_STRINGS = 12
const MAX_MEASURES = 40
const MAX_WHY_STOPPED = 10
const MAX_INTERACTIONS = 40
const DRUG_CHUNK = 200

// --- stored shapes we read (all optional: recorded_background is a sparse envelope) -------------

interface StoredSource {
  kind?: string
  label?: string
  identifier?: string
  locator?: string
  excerpt?: string
  retrievedAt?: string
}

interface StoredValue {
  display?: string
  numeric?: number
  unit?: string
  populationContext?: string
  concordance?: string
  source?: StoredSource
}

/**
 * The stored pharmacokinetics envelope. All nine keys observed in the corpus are named, because
 * availability used to test only halfLife, tMax and metabolismAsRecorded and therefore reported
 * 1,197 records as having kinetics while 1,405 hold a quantitative pharmacokinetic value. The 208
 * difference is records carrying volumeOfDistribution, proteinBinding, bioavailability or
 * eliminationAsRecorded and none of the original three.
 */
interface StoredPharmacokinetics {
  routeAsRecorded?: string
  steadyStateNote?: string
  halfLife?: StoredValue
  tMax?: StoredValue
  metabolismAsRecorded?: StoredValue
  proteinBinding?: StoredValue
  bioavailability?: StoredValue
  eliminationAsRecorded?: StoredValue
  volumeOfDistribution?: StoredValue
}

/** Every pharmacokinetics key that carries a measured value rather than a route or a note. */
const QUANTITATIVE_PK_KEYS = [
  'halfLife',
  'tMax',
  'metabolismAsRecorded',
  'proteinBinding',
  'bioavailability',
  'eliminationAsRecorded',
  'volumeOfDistribution',
] as const satisfies readonly (keyof StoredPharmacokinetics)[]

interface StoredTitrationStep {
  order?: number
  periodAsRecorded?: string
  amountAsRecorded?: string
  purposeAsRecorded?: string
}

interface StoredTitration {
  basis?: string
  steps?: StoredTitrationStep[]
  source?: StoredSource
}

interface StoredInteractionSignal {
  counterpartyAsRecorded?: string
  kind?: string
  roleAsRecorded?: string
  polarity?: string
  labelSection?: string
  source?: StoredSource
}

interface StoredRegulatoryApproval {
  applicationCount?: number
  earliestOriginalApprovalDate?: string
  applicationKindsAsRecorded?: string[]
  marketingStatusesAsRecorded?: string[]
  source?: StoredSource
}

interface RegistryFileEntry {
  regulatoryApproval?: StoredRegulatoryApproval
}

// --- rows we select ----------------------------------------------------------------------------

interface DrugRow {
  slug: string
  name: string | null
  titration: StoredTitration | null
  pharmacokinetics: StoredPharmacokinetics | null
  interaction_signals: StoredInteractionSignal[] | null
  regulatory_approval: StoredRegulatoryApproval | null
}

interface CountRow {
  drug_id: string
  result_count: number | null
  stored_count?: number | null
}

interface StudyRow {
  drug_id: string
  nct_id: string | null
  study_type: string | null
  allocation: string | null
  overall_status: string | null
  why_stopped: string | null
  enrollment_count: number | null
  enrollment_type: string | null
  start_date: string | null
  completion_date: string | null
  primary_completion_date: string | null
  time_frame: string | null
  measures: (string | null)[] | null
  matched_intervention_names: (string | null)[] | null
}

// --- raw registry payload (only the modules Phase 2 fetches were stored with) -------------------

interface RawStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string }
    statusModule?: {
      startDateStruct?: { date?: string }
      primaryCompletionDateStruct?: { date?: string }
      completionDateStruct?: { date?: string }
    }
    designModule?: { enrollmentInfo?: { count?: number; type?: string } }
    armsInterventionsModule?: {
      armGroups?: { label?: string; description?: string; interventionNames?: string[] }[]
      interventions?: {
        name?: string
        description?: string
        otherNames?: string[]
        armGroupLabels?: string[]
      }[]
    }
  }
}

// --- output shapes -----------------------------------------------------------------------------

/**
 * How a dose string was tied to THIS record rather than to another medicine in the same trial.
 * Arm text routinely describes a combination, so a mention is kept only where the registry's own
 * intervention naming ties it to this record. Everything else is counted, not stored.
 *
 * COMBINATION_NAME_NEARBY exists because an intervention whose other-names list enumerates several
 * medicines is a combination product, and the registry's naming then ties the description to all of
 * them at once. NCT01515839's single intervention "Multivitamin Supplement intervention" lists
 * eight ingredients, so "BID which contains Acetyl-L-Carnitine (HCL) 1000 mg," was stored under
 * Huperzine A, Phosphatidylserine and Vinpocetine as well, and Huperzine A's published range ran to
 * 1000 mg against its own registry strings of 100 mcg and 400 µg. On such an intervention the
 * record's own name must appear beside the amount, and the other ingredients count as competitors.
 */
type DoseAttribution =
  | 'INTERVENTION_NAME_MATCH'
  | 'ARM_SINGLE_INTERVENTION'
  | 'ARM_NAME_NEARBY'
  | 'COMBINATION_NAME_NEARBY'

interface DoseMention {
  textAsRecorded: string
  field: 'intervention.description' | 'armGroup.description'
  attribution: DoseAttribution
  interventionNameAsRecorded: string | null
  nctId: string
  enrolment: { count: number | null; type: string | null } | null
  startToPrimaryCompletionDays: number | null
  timeFrameAsRecorded: string | null
}

interface DoseRange {
  unitAsMatched: string
  /** 'kg', 'ml', 'm2' … when the registry wrote the amount per something; null for a bare amount. */
  perUnitAsMatched: string | null
  perKg: boolean
  min: number
  max: number
  trials: number
}

interface OutputRecord {
  slug: string
  name: string | null
  availability: Record<DataType, boolean>
  availableCount: number
  evidenceTier: {
    tier: string
    interventionalRandomizedStudies: number
    interventionalStudies: number
    observationalStudies: number
    expandedAccessStudies: number
    storedStudyCount: number
    registryTotalStudies: number
    storedListTruncated: boolean
    pubmedClinicalTrialCount: number
  }
  humanDoseStudied: {
    recordedSchedule: StoredTitration | null
    trialDoseStrings: DoseMention[]
    doseMentionCount: number
    trialsWithDoseText: number
    /** Trials where the intervention name the snapshot matched is name-related to this record. */
    trialsWithNameRelatedMatch: number
    corroboration: DoseCorroboration
    zeroAmountMentions: number
    unattributedDoseMentions: number
    rangesAcrossTrials: DoseRange[]
    startToPrimaryCompletionDaysAcrossTrials: { min: number; max: number } | null
  } | null
  trialFailures: {
    stoppedStudyCount: number
    byStatus: Record<string, number>
    whyStoppedRecorded: number
    whyStopped: { nctId: string; overallStatus: string; textAsRecorded: string }[]
  } | null
  outcomeMeasures: { distinctCount: number; measuresAsRecorded: string[] } | null
  kinetics: {
    halfLife: StoredValue | null
    tMax: StoredValue | null
    metabolism: StoredValue | null
    proteinBinding: StoredValue | null
    bioavailability: StoredValue | null
    elimination: StoredValue | null
    volumeOfDistribution: StoredValue | null
    valuesStored: string[]
    routeAsRecorded: string | null
  } | null
  interactionPathways: {
    signalCount: number
    distinctCount: number
    entries: InteractionEntry[]
  } | null
  evidenceCeiling: {
    maxEnrolment: { count: number; type: string | null; nctId: string } | null
    longestSpan: LongestSpan | null
    computedOverStoredStudies: number
    storedListTruncated: boolean
  } | null
  regulatoryDivergence: {
    jurisdictions: string[]
    statusesAsRecorded: string[]
    applicationKindsAsRecorded: string[]
    sources: string[]
  } | null
}

// --- small helpers -----------------------------------------------------------------------------

function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid] ?? null
  const low = sorted[mid - 1]
  const high = sorted[mid]
  if (low === undefined || high === undefined) return null
  return (low + high) / 2
}

/** Registry dates are 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'. Missing parts read as the first of. */
function registryDateMs(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = match[2] === undefined ? 1 : Number(match[2])
  const day = match[3] === undefined ? 1 : Number(match[3])
  const ms = Date.UTC(year, month - 1, day)
  return Number.isFinite(ms) ? ms : null
}

function spanDays(start: string | null | undefined, end: string | null | undefined): number | null {
  const a = registryDateMs(start)
  const b = registryDateMs(end)
  if (a === null || b === null) return null
  const days = Math.round((b - a) / 86_400_000)
  return days >= 0 ? days : null
}

// --- dose extraction ---------------------------------------------------------------------------

/**
 * A dose-like token: a number, a unit the registry writes, optionally per something. The unit list
 * is deliberately literal — nothing is converted between units, so `min`/`max` are only ever
 * compared inside one matched unit spelling.
 *
 * The per-something group used to capture `/kg` alone, which meant a concentration was read as a
 * dose and folded into the plain-mg bucket: Brimonidine's "2mg/mL One drop/eye administered twice a
 * day." (a 0.2% eye drop) published a 2 mg maximum, and 115 stored strings across 70 records carry
 * a per-millilitre concentration. Every per-unit spelling now has its own range bucket.
 */
const DOSE_PATTERN =
  /(?<![A-Za-z0-9.])(\d+(?:\.\d+)?)\s?(mg|mcg|µg|μg|g|IU|units?)\b(\s?\/\s?(kg|m2|m²|mL|ml|L|dL|dl|cm2))?/gi

/** Frequency words that make a dose token a studied schedule rather than a bare quantity. */
const FREQUENCY_PATTERN =
  /(\bonce\s+daily\b|\btwice\s+daily\b|\bthree\s+times\s+daily\b|\bfour\s+times\s+daily\b|\bonce\s+a\s+day\b|\btwice\s+a\s+day\b|\bdaily\b|\bper\s+day\b|\ba\s+day\b|\beach\s+day\b|\bb\.?i\.?d\.?\b|\bt\.?i\.?d\.?\b|\bq\.?i\.?d\.?\b|\bq\.?d\.?\b|\bqhs\b|\bonce\s+weekly\b|\btwice\s+weekly\b|\bweekly\b|\bmonthly\b|\bevery\s+other\s+day\b|\bevery\s+\d+\s*(?:hours?|hrs?|days?|weeks?|months?)\b|\bq\d+\s?h\b|\/\s?day\b|\/\s?d\b|\/\s?kg\s?\/\s?d\b)/gi

const DOSE_WINDOW = 60
const MAX_SNIPPET = 220

interface DoseHit {
  snippet: string
  amount: number
  unitAsMatched: string
  perUnitAsMatched: string | null
  perKg: boolean
  /** Offsets of the snippet inside the description it was cut from, for name proximity. */
  start: number
  end: number
}

interface DoseScan {
  hits: DoseHit[]
  /** Dose tokens with no frequency word nearby — counted, never stored as a schedule. */
  unpairedTokens: number
}

function scanForDoses(text: string): DoseScan {
  const frequencies: { start: number; end: number }[] = []
  FREQUENCY_PATTERN.lastIndex = 0
  for (let m = FREQUENCY_PATTERN.exec(text); m !== null; m = FREQUENCY_PATTERN.exec(text)) {
    frequencies.push({ start: m.index, end: m.index + m[0].length })
  }

  const hits: DoseHit[] = []
  let unpairedTokens = 0
  DOSE_PATTERN.lastIndex = 0
  for (let m = DOSE_PATTERN.exec(text); m !== null; m = DOSE_PATTERN.exec(text)) {
    const amountText = m[1]
    const unit = m[2]
    if (amountText === undefined || unit === undefined) continue
    const amount = Number(amountText)
    if (!Number.isFinite(amount)) continue
    const doseStart = m.index
    const doseEnd = m.index + m[0].length

    const nearby = frequencies.find(
      (f) => f.start - doseEnd <= DOSE_WINDOW && doseStart - f.end <= DOSE_WINDOW,
    )
    if (!nearby) {
      unpairedTokens += 1
      continue
    }

    let start = Math.min(doseStart, nearby.start)
    let end = Math.max(doseEnd, nearby.end)
    while (start > 0 && /\S/.test(text.charAt(start - 1))) start -= 1
    while (end < text.length && /\S/.test(text.charAt(end))) end += 1
    if (end - start > MAX_SNIPPET) end = start + MAX_SNIPPET
    const snippet = text.slice(start, end).trim()
    if (snippet.length === 0) continue

    const perUnit = m[4] === undefined ? null : m[4].toLowerCase()
    hits.push({
      snippet,
      amount,
      unitAsMatched: unit,
      perUnitAsMatched: perUnit,
      perKg: perUnit === 'kg',
      start,
      end,
    })
  }
  return { hits, unpairedTokens }
}

const INTERVENTION_TYPE_PREFIX =
  /^(drug|biological|dietary supplement|device|procedure|radiation|behavioral|genetic|diagnostic test|combination product|other)\s*:\s*/i

function normaliseName(value: string): string {
  return value.replace(INTERVENTION_TYPE_PREFIX, '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function namesOverlap(left: string[], right: string[]): boolean {
  for (const a of left) {
    if (a.length < 3) continue
    for (const b of right) {
      if (b.length < 3) continue
      if (a === b || a.includes(b) || b.includes(a)) return true
    }
  }
  return false
}

/**
 * Which canonical medicine names this registry name contains. Read over one-, two- and three-word
 * windows of the name rather than over the whole lexicon, so it stays cheap across 101,831 studies.
 * "Multivitamin Supplement intervention" with other-names listing eight ingredients returns those
 * ingredients; "Metformin (Glucophage)" returns one name.
 */
function corpusNamesInside(name: string, lexicon: Set<string>): string[] {
  const words = name.split(/[^a-z0-9-]+/i).filter((word) => word.length > 0)
  const found: string[] = []
  for (let index = 0; index < words.length; index += 1) {
    let window = ''
    for (let span = 0; span < 3 && index + span < words.length; span += 1) {
      window = span === 0 ? (words[index] ?? '') : `${window} ${words[index + span] ?? ''}`
      if (window.length < MIN_COMPETITOR_NAME) continue
      if (lexicon.has(window) && !found.includes(window)) found.push(window)
    }
  }
  return found
}

const NAME_PROXIMITY = 80
const COMPETITOR_WINDOW = 120
/** Short names are skipped: they collide with ordinary prose ('water', 'iron', 'gold'). */
const MIN_COMPETITOR_NAME = 6
const WORD_PATTERN = /[a-z][a-z0-9-]{3,}/g

/**
 * How close another medicine in the corpus is named to this dose text. Registry prose routinely
 * states background therapy inside a medicine's own intervention description ("... in addition to
 * the subject's stable pre-trial metformin, 1000mg/day to 3000mg/day"), and that amount is not the
 * amount this record was given.
 */
function nearestCorpusCompetitor(
  block: TextBlock,
  hit: DoseHit,
  lexicon: Set<string>,
  matchedNames: string[],
): { before: number; after: number } {
  const from = Math.max(0, hit.start - COMPETITOR_WINDOW)
  const to = Math.min(block.lowerText.length, hit.end + COMPETITOR_WINDOW)
  const window = block.lowerText.slice(from, to)
  let before = Number.POSITIVE_INFINITY
  let after = Number.POSITIVE_INFINITY
  const tokens: { text: string; start: number; end: number }[] = []
  WORD_PATTERN.lastIndex = 0
  for (let m = WORD_PATTERN.exec(window); m !== null; m = WORD_PATTERN.exec(window)) {
    tokens.push({ text: m[0], start: from + m.index, end: from + m.index + m[0].length })
  }
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (!token) continue
    const next = tokens[index + 1]
    const forms: { text: string; start: number; end: number }[] = [token]
    if (next) forms.push({ text: `${token.text} ${next.text}`, start: token.start, end: next.end })
    for (const form of forms) {
      if (form.text.length < MIN_COMPETITOR_NAME) continue
      if (!lexicon.has(form.text)) continue
      if (namesOverlap([form.text], matchedNames)) continue
      const isBefore = form.start < hit.end
      const gap = Math.max(isBefore ? hit.start - form.end : form.start - hit.end, 0)
      if (isBefore) before = Math.min(before, gap)
      else after = Math.min(after, gap)
    }
  }
  return { before, after }
}

/**
 * One intervention's names as the registry lists them: its own name plus its other-names list.
 *
 * `corpusMedicineNames` is the subset that names a medicine this corpus holds a record for, and a
 * group naming two or more of them is a combination product rather than one medicine under several
 * names. `names` excludes any other-name that is itself another intervention's own name in the same
 * study — NCT00108082 attaches otherNames ["carvedilol MR","atenolol"] to its `lisinopril`
 * intervention, which had collapsed three interventions into one alias group and let carvedilol's
 * "80 mg once daily" be stored under both atenolol and lisinopril.
 */
interface NameGroup {
  names: string[]
  corpusMedicineNames: string[]
  combination: boolean
}

/** One description from one study, scanned once and then attributed separately per record. */
interface TextBlock {
  field: DoseMention['field']
  text: string
  lowerText: string
  interventionNameAsRecorded: string | null
  /** One name group per intervention the registry attaches to this description. */
  nameGroups: NameGroup[]
  /** Every normalised intervention name the study declares, used to spot a partner medicine. */
  studyNames: string[]
  hits: DoseHit[]
}

/**
 * Returns how this dose string is tied to the record, or null when the registry does not tie it
 * to the record at all — in which case it belongs to some other medicine in the same trial.
 *
 * `ownNames` is what this record is called in this corpus (its recorded name and its slug read as
 * words), as distinct from `matchedNames`, which is what the snapshot matched in the registry and
 * can be another medicine's name entirely: for NCT04588441 the snapshot's matched name for
 * Lactobacillus Crispatus is literally "Adenosine".
 */
function attributeHit(
  block: TextBlock,
  matchedNames: string[],
  ownNames: string[],
  hit: DoseHit,
  lexicon: Set<string>,
): DoseAttribution | null {
  if (matchedNames.length === 0) return null

  // The registry can match this record through an alias, so a description's own alias group counts
  // as this record's names. Every other intervention in the study is a possible partner medicine.
  const selfGroups = block.nameGroups.filter((group) => namesOverlap(group.names, matchedNames))
  const otherGroups = block.nameGroups.filter((group) => !namesOverlap(group.names, matchedNames))
  /**
   * Two shapes where the intervention's description is not simply about this record, and the
   * record's own name has to appear beside the amount for the amount to be kept:
   *  - the alias group enumerates several medicines, i.e. a combination product;
   *  - the intervention is NAMED for a different medicine and this record was matched only through
   *    an other-name on it. NCT02142712 attaches the other-name "Diamox" to its `Dextromethorphan`
   *    intervention, whose description gives dextromethorphan's "60 mg QID".
   */
  const selfIsCombination = selfGroups.some((group) => group.combination)
  const selfIsNamedForAnotherMedicine = selfGroups.some((group) => {
    const own = group.names[0]
    if (own === undefined || namesOverlap([own], ownNames)) return false
    return group.corpusMedicineNames.some((name) => namesOverlap([name], [own]))
  })
  const requireOwnName = selfIsCombination || selfIsNamedForAnotherMedicine

  // On a combination intervention the alias group is a list of ingredients, so only this record's
  // own name speaks for it and every other ingredient it names is a competitor.
  const selfNames = requireOwnName
    ? [...new Set(ownNames)]
    : [...new Set([...matchedNames, ...selfGroups.flatMap((group) => group.names)])]
  const ingredientCompetitors = requireOwnName
    ? selfGroups.flatMap((group) => group.corpusMedicineNames)
    : []
  const otherNames = [
    ...new Set([
      ...otherGroups.flatMap((group) => group.names),
      ...block.studyNames,
      ...ingredientCompetitors,
    ]),
  ].filter((name) => !namesOverlap([name], selfNames))

  /**
   * How close the registry names this record to the dose text, and how close it names any other
   * medicine. Combination prose is common, so the nearer name wins — but a name BEFORE the amount
   * wins over a nearer name after it, because registry dosing prose is written "medicine, then its
   * amount". NCT00108082's arm reads "Carvedilol controlled release (CR) 20 to 80 mg once daily
   * (OD) plus lisinopril 20 mg OD.": lisinopril sits six characters after "80 mg once daily" and
   * carvedilol twenty-eight before it, and the 80 mg is carvedilol's.
   */
  let beforeMatched = Number.POSITIVE_INFINITY
  let beforeOther = Number.POSITIVE_INFINITY
  let afterMatched = Number.POSITIVE_INFINITY
  let afterOther = Number.POSITIVE_INFINITY
  for (const [names, isMatched] of [
    [selfNames, true],
    [otherNames, false],
  ] as const) {
    for (const name of names) {
      if (name.length < 3) continue
      for (
        let index = block.lowerText.indexOf(name);
        index !== -1;
        index = block.lowerText.indexOf(name, index + 1)
      ) {
        const before = index < hit.end
        const gap = Math.max(before ? hit.start - (index + name.length) : index - hit.end, 0)
        if (before) {
          if (isMatched) beforeMatched = Math.min(beforeMatched, gap)
          else beforeOther = Math.min(beforeOther, gap)
        } else if (isMatched) afterMatched = Math.min(afterMatched, gap)
        else afterOther = Math.min(afterOther, gap)
      }
    }
  }
  const competitor = nearestCorpusCompetitor(block, hit, lexicon, selfNames)
  beforeOther = Math.min(beforeOther, competitor.before)
  afterOther = Math.min(afterOther, competitor.after)

  // Whenever either side names a medicine in front of the amount and close to it, that naming
  // decides the amount; otherwise the nearest name in either direction does, as before.
  const precedingNameDecides = Math.min(beforeMatched, beforeOther) <= NAME_PROXIMITY
  const nearestMatched = precedingNameDecides
    ? beforeMatched
    : Math.min(beforeMatched, afterMatched)
  const nearestOther = precedingNameDecides ? beforeOther : Math.min(beforeOther, afterOther)
  // Another medicine is named closer to this amount than this record is: the amount is not ours.
  if (nearestOther <= NAME_PROXIMITY && nearestOther < nearestMatched) return null

  if (requireOwnName) {
    return nearestMatched <= NAME_PROXIMITY ? 'COMBINATION_NAME_NEARBY' : null
  }
  if (block.field === 'intervention.description') {
    return selfGroups.length > 0 ? 'INTERVENTION_NAME_MATCH' : null
  }
  if (block.nameGroups.length === 1 && selfGroups.length === 1) return 'ARM_SINGLE_INTERVENTION'
  return nearestMatched <= NAME_PROXIMITY ? 'ARM_NAME_NEARBY' : null
}

/**
 * How a record's parsed dose evidence is corroborated. A single parsed mention is not enough on its
 * own: the registry attaches other medicines' descriptions to a record through an other-names list,
 * so Butalbital's only dose string was Acetazolamide's "250 mg tablets daily." and Lactobacillus
 * Crispatus's was Adenosine's 9 mg. A single mention counts only where the intervention name the
 * snapshot matched is name-related to the record itself.
 */
type DoseCorroboration =
  | 'RECORDED_SCHEDULE'
  | 'REGISTRY_NAME_MATCHES_RECORD'
  | 'TWO_OR_MORE_TRIALS'
  | 'SINGLE_TRIAL_WITHOUT_NAME_MATCH'

// --- per-record accumulators ---------------------------------------------------------------------

interface LongestSpan {
  days: number
  nctId: string
  startDate: string
  endDate: string
  endField: 'completionDate' | 'primaryCompletionDate'
  /** Registry completion dates are often sponsor estimates that have not happened yet. */
  endsAfterToday: boolean
}

interface InteractionEntry {
  counterpartyAsRecorded: string
  kind: string | null
  roleAsRecorded: string | null
  polarity: string | null
  labelSection: string | null
  sourceIdentifier: string | null
  occurrences: number
}

interface StudyAccumulator {
  storedCount: number
  interventionalRandomized: number
  interventional: number
  observational: number
  expandedAccess: number
  stoppedByStatus: Map<string, number>
  whyStoppedCount: number
  whyStopped: { nctId: string; overallStatus: string; textAsRecorded: string }[]
  measures: Set<string>
  maxEnrolActual: { count: number; type: string | null; nctId: string } | null
  maxEnrolAny: { count: number; type: string | null; nctId: string } | null
  longestSpan: LongestSpan | null
}

function emptyStudyAccumulator(): StudyAccumulator {
  return {
    storedCount: 0,
    interventionalRandomized: 0,
    interventional: 0,
    observational: 0,
    expandedAccess: 0,
    stoppedByStatus: new Map(),
    whyStoppedCount: 0,
    whyStopped: [],
    measures: new Set(),
    maxEnrolActual: null,
    maxEnrolAny: null,
    longestSpan: null,
  }
}

interface DoseAccumulator {
  mentions: DoseMention[]
  seenText: Set<string>
  mentionCount: number
  trials: Set<string>
  /** Trials whose matched intervention name is name-related to this record's own name. */
  nameRelatedTrials: Set<string>
  ranges: Map<
    string,
    {
      unitAsMatched: string
      perUnitAsMatched: string | null
      perKg: boolean
      min: number
      max: number
      trials: Set<string>
    }
  >
  minDurationDays: number | null
  maxDurationDays: number | null
  zeroAmountMentions: number
  unattributed: number
}

function emptyDoseAccumulator(): DoseAccumulator {
  return {
    mentions: [],
    seenText: new Set(),
    mentionCount: 0,
    trials: new Set(),
    nameRelatedTrials: new Set(),
    ranges: new Map(),
    minDurationDays: null,
    maxDurationDays: null,
    zeroAmountMentions: 0,
    unattributed: 0,
  }
}

// --- the scan ------------------------------------------------------------------------------------

interface ScanMetadata {
  canonicalRecords: number
  ctgMatchedRecords: number
  pubmedMatchedRecords: number
  storedStudyRows: number
  rawStudiesRead: number
  rawStudiesMappedToCanonical: number
  doseTokensWithoutFrequencyWord: number
  recordsWithAttributedDoseText: number
  recordsWithDoseTextInTrialsButNoneAttributable: number
  studyRecordPairsWithDoseTextButNoAttribution: number
  studyRecordPairsWithoutStoredMatchedInterventionNames: number
  combinationInterventionsSeen: number
  otherNamesDroppedAsAnotherInterventionsName: number
  recordsWithDoseTextRefusedForSingleTrialWithoutNameMatch: number
  recordsWithStoredListTruncated: number
  expandedAccessOnlyRecordsWithoutPubmed: number
  registryFileRegulatoryEntries: number
  registryFileEntriesAgreeingWithDatabase: number
  jurisdictionValuesSeen: string[]
}

async function scan(): Promise<{ records: OutputRecord[]; scanMetadata: ScanMetadata }> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not set')
  if (connectionString.includes('rnawiki_dev')) {
    throw new Error('refusing to read rnawiki_dev; use the corpus-completion working database')
  }
  const pool = new Pool({ connectionString, max: 4 })

  try {
    const drugRows = await pool.query<DrugRow>(
      `select d.id as slug,
              d.name as name,
              d.recorded_background->'titration' as titration,
              d.recorded_background->'pharmacokinetics' as pharmacokinetics,
              d.recorded_background->'interactionSignals' as interaction_signals,
              d.recorded_background->'regulatoryApproval' as regulatory_approval
         from drugs d
         join inventory_resolutions i on i.drug_id = d.id
        where i.resolution_status = 'CANONICAL_ENTITY'
        order by d.id`,
    )
    const drugs = drugRows.rows
    const canonicalSlugs = new Set(drugs.map((row) => row.slug))
    // Every canonical medicine name, used only to notice a partner medicine named beside a dose.
    const corpusNameLexicon = new Set<string>()
    /** What each record is called here: its recorded name and its slug read as words. */
    const ownNamesBySlug = new Map<string, string[]>()
    for (const row of drugs) {
      const own: string[] = []
      for (const candidate of [row.name, row.slug.replace(/-/g, ' ')]) {
        if (!candidate) continue
        const normalised = normaliseName(candidate)
        if (normalised.length >= MIN_COMPETITOR_NAME) corpusNameLexicon.add(normalised)
        if (normalised.length >= 3 && !own.includes(normalised)) own.push(normalised)
      }
      ownNamesBySlug.set(row.slug, own)
    }

    const pubmedRows = await pool.query<CountRow>(
      `select r.drug_id, r.result_count
         from source_search_records r
         join inventory_resolutions i
           on i.drug_id = r.drug_id and i.resolution_status = 'CANONICAL_ENTITY'
        where r.search_kind = 'PUBMED_ESEARCH_CLINICAL_TRIAL'
          and coalesce(r.result_count, 0) > 0`,
    )
    const pubmedCounts = new Map<string, number>()
    for (const row of pubmedRows.rows) pubmedCounts.set(row.drug_id, row.result_count ?? 0)

    const ctgRows = await pool.query<CountRow>(
      `select r.drug_id,
              r.result_count,
              jsonb_array_length(coalesce(r.matched->0->'studies', '[]'::jsonb)) as stored_count
         from source_search_records r
         join inventory_resolutions i
           on i.drug_id = r.drug_id and i.resolution_status = 'CANONICAL_ENTITY'
        where r.search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
          and coalesce(r.result_count, 0) > 0`,
    )
    const ctgTotals = new Map<string, { registryTotal: number; storedCount: number }>()
    for (const row of ctgRows.rows) {
      ctgTotals.set(row.drug_id, {
        registryTotal: row.result_count ?? 0,
        storedCount: row.stored_count ?? 0,
      })
    }

    // Per-drug study aggregates, read in chunks so no single result set holds every study row.
    const studyAccumulators = new Map<string, StudyAccumulator>()
    const timeFrameByNct = new Map<string, string>()
    /** nctId -> slug -> the intervention names the snapshot matched for that record. */
    const matchedNamesByStudy = new Map<string, Map<string, string[]>>()
    let storedStudyRows = 0
    const ctgDrugIds = [...ctgTotals.keys()]
    for (let offset = 0; offset < ctgDrugIds.length; offset += DRUG_CHUNK) {
      const chunk = ctgDrugIds.slice(offset, offset + DRUG_CHUNK)
      const studyRows = await pool.query<StudyRow>(
        `select r.drug_id,
                s->>'nctId' as nct_id,
                s->>'studyType' as study_type,
                s->'design'->>'allocation' as allocation,
                s->>'overallStatus' as overall_status,
                nullif(btrim(coalesce(s->>'whyStopped', '')), '') as why_stopped,
                (s->'enrollment'->>'count')::int as enrollment_count,
                s->'enrollment'->>'type' as enrollment_type,
                s->>'startDate' as start_date,
                s->>'completionDate' as completion_date,
                s->>'primaryCompletionDate' as primary_completion_date,
                s->'primaryOutcomes'->0->>'timeFrame' as time_frame,
                s->'matchedInterventionNames' as matched_intervention_names,
                (select coalesce(
                          jsonb_agg(o->>'measure')
                            filter (where nullif(btrim(coalesce(o->>'measure', '')), '') is not null),
                          '[]'::jsonb)
                   from jsonb_array_elements(coalesce(s->'primaryOutcomes', '[]'::jsonb)) o
                ) as measures
           from source_search_records r
           cross join lateral jsonb_array_elements(r.matched->0->'studies') s
          where r.search_kind = 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION'
            and r.drug_id = any($1::text[])`,
        [chunk],
      )
      storedStudyRows += studyRows.rowCount ?? 0

      for (const row of studyRows.rows) {
        const nctId = row.nct_id
        if (!nctId) continue
        if (row.time_frame && !timeFrameByNct.has(nctId)) timeFrameByNct.set(nctId, row.time_frame)
        const matchedNames = (row.matched_intervention_names ?? [])
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
          .map(normaliseName)
        if (matchedNames.length > 0) {
          const byDrug = matchedNamesByStudy.get(nctId) ?? new Map<string, string[]>()
          byDrug.set(row.drug_id, matchedNames)
          matchedNamesByStudy.set(nctId, byDrug)
        }

        let acc = studyAccumulators.get(row.drug_id)
        if (!acc) {
          acc = emptyStudyAccumulator()
          studyAccumulators.set(row.drug_id, acc)
        }
        acc.storedCount += 1

        if (row.study_type === 'INTERVENTIONAL') {
          acc.interventional += 1
          if (row.allocation === 'RANDOMIZED') acc.interventionalRandomized += 1
        } else if (row.study_type === 'OBSERVATIONAL') {
          acc.observational += 1
        } else if (row.study_type === 'EXPANDED_ACCESS') {
          acc.expandedAccess += 1
        }

        const status = row.overall_status
        if (status === 'TERMINATED' || status === 'WITHDRAWN' || status === 'SUSPENDED') {
          acc.stoppedByStatus.set(status, (acc.stoppedByStatus.get(status) ?? 0) + 1)
          if (row.why_stopped) {
            acc.whyStoppedCount += 1
            if (acc.whyStopped.length < MAX_WHY_STOPPED) {
              acc.whyStopped.push({
                nctId,
                overallStatus: status,
                textAsRecorded: row.why_stopped,
              })
            }
          }
        }

        for (const measure of row.measures ?? []) {
          if (measure) acc.measures.add(measure)
        }

        const enrolment = row.enrollment_count
        if (typeof enrolment === 'number' && Number.isFinite(enrolment)) {
          const candidate = { count: enrolment, type: row.enrollment_type, nctId }
          if (acc.maxEnrolAny === null || enrolment > acc.maxEnrolAny.count) {
            acc.maxEnrolAny = candidate
          }
          if (
            row.enrollment_type === 'ACTUAL' &&
            (acc.maxEnrolActual === null || enrolment > acc.maxEnrolActual.count)
          ) {
            acc.maxEnrolActual = candidate
          }
        }

        const endField: 'completionDate' | 'primaryCompletionDate' = row.completion_date
          ? 'completionDate'
          : 'primaryCompletionDate'
        const endDate = row.completion_date ?? row.primary_completion_date
        const days = spanDays(row.start_date, endDate)
        if (days !== null && row.start_date && endDate) {
          if (acc.longestSpan === null || days > acc.longestSpan.days) {
            acc.longestSpan = {
              days,
              nctId,
              startDate: row.start_date,
              endDate,
              endField,
              endsAfterToday: (registryDateMs(endDate) ?? 0) > Date.now(),
            }
          }
        }
      }
    }

    // --- one streaming pass over the fetched registry payloads for studied-dose text ------------
    const studyToRecords = readJsonFile<Record<string, string[] | undefined>>(STUDY_MAP_PATH)
    const doseAccumulators = new Map<string, DoseAccumulator>()
    let rawStudiesRead = 0
    let rawStudiesMapped = 0
    let unpairedTokens = 0
    let unattributedStudyRecordPairs = 0
    let ownerPairsMissingMatchNames = 0
    let combinationInterventions = 0
    let droppedCrossNamedAliases = 0

    const batchFiles = readdirSync(RAW_DIR)
      .filter((name) => name.startsWith('batch-') && name.endsWith('.json.gz'))
      .sort()

    for (const file of batchFiles) {
      // One batch at a time; the parsed batch goes out of scope before the next is read.
      const parsed = JSON.parse(gunzipSync(readFileSync(join(RAW_DIR, file))).toString('utf8')) as {
        studies?: RawStudy[]
      }
      for (const study of parsed.studies ?? []) {
        rawStudiesRead += 1
        const protocol = study.protocolSection
        const nctId = protocol?.identificationModule?.nctId
        if (!nctId) continue
        const owners = (studyToRecords[nctId] ?? []).filter((slug) => canonicalSlugs.has(slug))
        if (owners.length === 0) continue
        rawStudiesMapped += 1

        const arms = protocol?.armsInterventionsModule
        const interventions = arms?.interventions ?? []
        const armGroups = arms?.armGroups ?? []

        /**
         * One name group per intervention, keyed by that intervention's OWN name only. Keying by
         * every alias let one intervention's other-names list overwrite another intervention's
         * entry, which collapsed the study's interventions into a single group and removed the
         * partner-medicine guard entirely. 2,895 multi-intervention studies carry that collision.
         */
        const ownNamesOfInterventions = new Set(
          interventions
            .map((intervention) => intervention.name)
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
            .map(normaliseName),
        )
        const buildNameGroup = (intervention: {
          name?: string
          otherNames?: string[]
        }): NameGroup => {
          const own = normaliseName(intervention.name ?? '')
          const aliases = (intervention.otherNames ?? [])
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
            .map(normaliseName)
            .filter((alias) => {
              // An other-name that names a DIFFERENT intervention in the same study is the
              // registry pointing at that intervention, not an alias of this one.
              for (const other of ownNamesOfInterventions) {
                if (other === own) continue
                if (alias === other || alias.includes(other)) {
                  droppedCrossNamedAliases += 1
                  return false
                }
              }
              return true
            })
          const names = [own, ...aliases].filter((value) => value.length > 0)
          const corpusMedicineNames: string[] = []
          for (const name of names) {
            for (const candidate of corpusNamesInside(name, corpusNameLexicon)) {
              if (corpusMedicineNames.some((kept) => namesOverlap([kept], [candidate]))) continue
              corpusMedicineNames.push(candidate)
            }
          }
          const group: NameGroup = {
            names,
            corpusMedicineNames,
            combination: corpusMedicineNames.length >= 2,
          }
          if (group.combination) combinationInterventions += 1
          return group
        }
        const groupByOwnName = new Map<string, NameGroup>()
        for (const intervention of interventions) {
          if (!intervention.name) continue
          const own = normaliseName(intervention.name)
          if (!groupByOwnName.has(own)) groupByOwnName.set(own, buildNameGroup(intervention))
        }

        // Which interventions the registry ties to each arm, read from both directions.
        const namesByArmLabel = new Map<string, Set<string>>()
        for (const intervention of interventions) {
          if (!intervention.name) continue
          for (const label of intervention.armGroupLabels ?? []) {
            const set = namesByArmLabel.get(label) ?? new Set<string>()
            set.add(normaliseName(intervention.name))
            namesByArmLabel.set(label, set)
          }
        }

        const studyNames = interventions
          .map((intervention) => intervention.name)
          .filter((value): value is string => typeof value === 'string' && value.length > 0)
          .map(normaliseName)

        const blocks: TextBlock[] = []
        for (const intervention of interventions) {
          if (!intervention.description) continue
          const group = groupByOwnName.get(normaliseName(intervention.name ?? ''))
          blocks.push({
            field: 'intervention.description',
            text: intervention.description,
            lowerText: intervention.description.toLowerCase(),
            interventionNameAsRecorded: intervention.name ?? null,
            nameGroups: group === undefined || group.names.length === 0 ? [] : [group],
            studyNames,
            hits: [],
          })
        }
        for (const arm of armGroups) {
          if (!arm.description) continue
          const listed = new Set<string>((arm.interventionNames ?? []).map(normaliseName))
          for (const name of namesByArmLabel.get(arm.label ?? '') ?? []) listed.add(name)
          const onlyIntervention = interventions[0]
          if (listed.size === 0 && interventions.length === 1 && onlyIntervention?.name) {
            listed.add(normaliseName(onlyIntervention.name))
          }
          const groups: NameGroup[] = []
          const seenGroups = new Set<string>()
          for (const name of listed) {
            const group = groupByOwnName.get(name) ?? {
              names: [name],
              corpusMedicineNames: [],
              combination: false,
            }
            const key = group.names.join('|')
            if (seenGroups.has(key)) continue
            seenGroups.add(key)
            groups.push(group)
          }
          blocks.push({
            field: 'armGroup.description',
            text: arm.description,
            lowerText: arm.description.toLowerCase(),
            interventionNameAsRecorded: null,
            nameGroups: groups,
            studyNames,
            hits: [],
          })
        }
        if (blocks.length === 0) continue

        let studyHasHits = false
        for (const block of blocks) {
          const scanned = scanForDoses(block.text)
          unpairedTokens += scanned.unpairedTokens
          block.hits = scanned.hits
          if (scanned.hits.length > 0) studyHasHits = true
        }
        if (!studyHasHits) continue

        const status = protocol?.statusModule
        const durationDays = spanDays(
          status?.startDateStruct?.date,
          status?.primaryCompletionDateStruct?.date ?? status?.completionDateStruct?.date,
        )
        const enrolmentInfo = protocol?.designModule?.enrollmentInfo
        const enrolment =
          enrolmentInfo === undefined
            ? null
            : { count: enrolmentInfo.count ?? null, type: enrolmentInfo.type ?? null }
        const timeFrame = timeFrameByNct.get(nctId) ?? null
        const matchedByDrug = matchedNamesByStudy.get(nctId)

        for (const slug of owners) {
          const matchedNames = matchedByDrug?.get(slug) ?? []
          if (matchedNames.length === 0) ownerPairsMissingMatchNames += 1
          const ownNames = ownNamesBySlug.get(slug) ?? []
          const registryNameMatchesRecord = namesOverlap(matchedNames, ownNames)

          let acc = doseAccumulators.get(slug)
          if (!acc) {
            acc = emptyDoseAccumulator()
            doseAccumulators.set(slug, acc)
          }

          let attributedInThisStudy = 0
          for (const block of blocks) {
            for (const hit of block.hits) {
              const attribution = attributeHit(
                block,
                matchedNames,
                ownNames,
                hit,
                corpusNameLexicon,
              )
              if (attribution === null) {
                acc.unattributed += 1
                continue
              }
              attributedInThisStudy += 1
              acc.mentionCount += 1

              if (hit.amount === 0) {
                // A zero amount is the absence of the medicine in that arm; it is counted, but it
                // is not a dose the trial gave, so it stays out of the range.
                acc.zeroAmountMentions += 1
              } else {
                const key = `${hit.unitAsMatched.toLowerCase()}${
                  hit.perUnitAsMatched === null ? '' : `/${hit.perUnitAsMatched}`
                }`
                const range = acc.ranges.get(key)
                if (range) {
                  range.min = Math.min(range.min, hit.amount)
                  range.max = Math.max(range.max, hit.amount)
                  range.trials.add(nctId)
                } else {
                  acc.ranges.set(key, {
                    unitAsMatched: hit.unitAsMatched.toLowerCase(),
                    perUnitAsMatched: hit.perUnitAsMatched,
                    perKg: hit.perKg,
                    min: hit.amount,
                    max: hit.amount,
                    trials: new Set([nctId]),
                  })
                }
              }

              const dedupe = hit.snippet.replace(/\s+/g, ' ').toLowerCase()
              if (acc.mentions.length < MAX_DOSE_STRINGS && !acc.seenText.has(dedupe)) {
                acc.seenText.add(dedupe)
                acc.mentions.push({
                  textAsRecorded: hit.snippet,
                  field: block.field,
                  attribution,
                  interventionNameAsRecorded: block.interventionNameAsRecorded,
                  nctId,
                  enrolment,
                  startToPrimaryCompletionDays: durationDays,
                  timeFrameAsRecorded: timeFrame,
                })
              }
            }
          }

          if (attributedInThisStudy === 0) {
            unattributedStudyRecordPairs += 1
            continue
          }
          acc.trials.add(nctId)
          if (registryNameMatchesRecord) acc.nameRelatedTrials.add(nctId)
          if (durationDays !== null) {
            acc.minDurationDays =
              acc.minDurationDays === null
                ? durationDays
                : Math.min(acc.minDurationDays, durationDays)
            acc.maxDurationDays =
              acc.maxDurationDays === null
                ? durationDays
                : Math.max(acc.maxDurationDays, durationDays)
          }
        }
      }
    }

    // --- the regulatory registry file, read alongside the database copy -------------------------
    const registryFile = existsSync(REGULATORY_REGISTRY_PATH)
      ? readJsonFile<Record<string, RegistryFileEntry | undefined>>(REGULATORY_REGISTRY_PATH)
      : {}
    const registryFileEntries = Object.keys(registryFile).length
    let registryAgreements = 0
    const jurisdictionValuesSeen = new Set<string>()

    // --- compose ---------------------------------------------------------------------------------
    const records: OutputRecord[] = []
    let truncatedRecords = 0
    let expandedAccessOnlyWithoutPubmed = 0
    let recordsWithOnlyUnattributedDoseText = 0
    let recordsWithAttributedDoseText = 0
    let refusedSingleTrialDoseRecords = 0

    for (const drug of drugs) {
      const slug = drug.slug
      const study = studyAccumulators.get(slug)
      const totals = ctgTotals.get(slug)
      const pubmed = pubmedCounts.get(slug) ?? 0
      const storedCount = study?.storedCount ?? 0
      const registryTotal = totals?.registryTotal ?? 0
      const truncated = registryTotal > storedCount && storedCount > 0
      if (truncated) truncatedRecords += 1

      /**
       * The lowest tier is named for what the stored search actually measured. The query was
       * `"<name>"[tiab] AND clinical trial[pt]`, so a hit means a clinical-trial-typed paper
       * mentions the recorded name in its title or abstract — not that the substance was studied.
       * Under the old name HUMAN_PUBLICATION_ONLY it read as human evidence, and it is the tier of
       * records named Muscle (36,401 hits), Lung, Brain, Complex, Date, Eye, DNA, Air and Capsule.
       */
      let tier = 'NONE_STORED'
      if ((study?.interventionalRandomized ?? 0) > 0) tier = 'HUMAN_RCT'
      else if ((study?.interventional ?? 0) > 0) tier = 'HUMAN_INTERVENTIONAL'
      else if ((study?.observational ?? 0) > 0) tier = 'HUMAN_OBSERVATIONAL'
      else if (pubmed > 0) tier = 'PUBMED_TITLE_ABSTRACT_MENTION_ONLY'
      if (tier === 'NONE_STORED' && (study?.expandedAccess ?? 0) > 0) {
        expandedAccessOnlyWithoutPubmed += 1
      }

      const dose = doseAccumulators.get(slug)
      const titration = drug.titration
      const parsedDoseStrings = dose?.mentions.length ?? 0
      /**
       * A single parsed mention with nothing tying the registry's own naming to this record is not
       * evidence of a dose this record was given, so it does not set the boolean. Butalbital's only
       * string was Acetazolamide's "250 mg tablets daily." and Lactobacillus Crispatus's was
       * Adenosine's 9 mg; both had exactly one mention from one trial.
       */
      const corroboration: DoseCorroboration = titration
        ? 'RECORDED_SCHEDULE'
        : (dose?.nameRelatedTrials.size ?? 0) > 0
          ? 'REGISTRY_NAME_MATCHES_RECORD'
          : (dose?.trials.size ?? 0) >= 2
            ? 'TWO_OR_MORE_TRIALS'
            : 'SINGLE_TRIAL_WITHOUT_NAME_MATCH'
      const doseCorroborated = corroboration !== 'SINGLE_TRIAL_WITHOUT_NAME_MATCH'
      const hasDose = Boolean(titration) || (parsedDoseStrings > 0 && doseCorroborated)
      if (parsedDoseStrings > 0 && !doseCorroborated && !titration) {
        refusedSingleTrialDoseRecords += 1
      }
      if (dose && dose.mentions.length === 0) recordsWithOnlyUnattributedDoseText += 1
      if (dose && dose.mentions.length > 0) recordsWithAttributedDoseText += 1
      const doseBlock: OutputRecord['humanDoseStudied'] = hasDose
        ? {
            recordedSchedule: titration ?? null,
            trialDoseStrings: dose?.mentions ?? [],
            doseMentionCount: dose?.mentionCount ?? 0,
            trialsWithDoseText: dose?.trials.size ?? 0,
            trialsWithNameRelatedMatch: dose?.nameRelatedTrials.size ?? 0,
            corroboration,
            zeroAmountMentions: dose?.zeroAmountMentions ?? 0,
            unattributedDoseMentions: dose?.unattributed ?? 0,
            rangesAcrossTrials: [...(dose?.ranges.values() ?? [])]
              .map((range) => ({
                unitAsMatched: range.unitAsMatched,
                perUnitAsMatched: range.perUnitAsMatched,
                perKg: range.perKg,
                min: range.min,
                max: range.max,
                trials: range.trials.size,
              }))
              .sort((a, b) => b.trials - a.trials),
            startToPrimaryCompletionDaysAcrossTrials:
              dose && dose.minDurationDays !== null && dose.maxDurationDays !== null
                ? { min: dose.minDurationDays, max: dose.maxDurationDays }
                : null,
          }
        : null

      const stoppedCount = [...(study?.stoppedByStatus.values() ?? [])].reduce((a, b) => a + b, 0)
      const failuresBlock: OutputRecord['trialFailures'] =
        stoppedCount > 0
          ? {
              stoppedStudyCount: stoppedCount,
              byStatus: Object.fromEntries(study?.stoppedByStatus ?? []),
              whyStoppedRecorded: study?.whyStoppedCount ?? 0,
              whyStopped: study?.whyStopped ?? [],
            }
          : null

      const measures = [...(study?.measures ?? [])]
      const measuresBlock: OutputRecord['outcomeMeasures'] =
        measures.length > 0
          ? { distinctCount: measures.length, measuresAsRecorded: measures.slice(0, MAX_MEASURES) }
          : null

      const pk = drug.pharmacokinetics
      const pkValuesStored = pk
        ? QUANTITATIVE_PK_KEYS.filter((key) => pk[key] !== undefined && pk[key] !== null)
        : []
      const kineticsBlock: OutputRecord['kinetics'] =
        pk && pkValuesStored.length > 0
          ? {
              halfLife: pk.halfLife ?? null,
              tMax: pk.tMax ?? null,
              metabolism: pk.metabolismAsRecorded ?? null,
              proteinBinding: pk.proteinBinding ?? null,
              bioavailability: pk.bioavailability ?? null,
              elimination: pk.eliminationAsRecorded ?? null,
              volumeOfDistribution: pk.volumeOfDistribution ?? null,
              valuesStored: [...pkValuesStored],
              routeAsRecorded: pk.routeAsRecorded ?? null,
            }
          : null

      const signals = drug.interaction_signals ?? []
      let interactionsBlock: OutputRecord['interactionPathways'] = null
      if (signals.length > 0) {
        const grouped = new Map<string, InteractionEntry>()
        for (const signal of signals) {
          const counterparty = signal.counterpartyAsRecorded
          if (!counterparty) continue
          const key = [
            counterparty,
            signal.kind ?? '',
            signal.roleAsRecorded ?? '',
            signal.polarity ?? '',
          ].join('|')
          const existing = grouped.get(key)
          if (existing) {
            existing.occurrences += 1
            continue
          }
          grouped.set(key, {
            counterpartyAsRecorded: counterparty,
            kind: signal.kind ?? null,
            roleAsRecorded: signal.roleAsRecorded ?? null,
            polarity: signal.polarity ?? null,
            labelSection: signal.labelSection ?? null,
            sourceIdentifier: signal.source?.identifier ?? null,
            occurrences: 1,
          })
        }
        const entries = [...grouped.values()].sort((a, b) => b.occurrences - a.occurrences)
        if (entries.length > 0) {
          interactionsBlock = {
            signalCount: signals.length,
            distinctCount: entries.length,
            entries: entries.slice(0, MAX_INTERACTIONS),
          }
        }
      }

      const maxEnrolment = study?.maxEnrolActual ?? study?.maxEnrolAny ?? null
      const longestSpan = study?.longestSpan ?? null
      const ceilingBlock: OutputRecord['evidenceCeiling'] =
        maxEnrolment !== null || longestSpan !== null
          ? {
              maxEnrolment,
              longestSpan,
              computedOverStoredStudies: storedCount,
              storedListTruncated: truncated,
            }
          : null

      const approval = drug.regulatory_approval
      const fileEntry = registryFile[slug]?.regulatoryApproval
      if (
        fileEntry &&
        approval &&
        JSON.stringify(fileEntry.marketingStatusesAsRecorded ?? []) ===
          JSON.stringify(approval.marketingStatusesAsRecorded ?? [])
      ) {
        registryAgreements += 1
      }
      const jurisdictions = new Set<string>()
      const sources: string[] = []
      const statuses = new Set<string>()
      const kinds = new Set<string>()
      for (const [entry, label] of [
        [approval, 'recorded_background.regulatoryApproval'],
        [fileEntry, 'data/registries/regulatory-approval.json'],
      ] as const) {
        if (!entry) continue
        sources.push(label)
        const kind = entry.source?.kind
        const jurisdiction =
          kind === 'FDA_DRUGSFDA' ? 'US_FDA' : kind ? `UNMAPPED_SOURCE_KIND:${kind}` : 'UNRECORDED'
        jurisdictions.add(jurisdiction)
        jurisdictionValuesSeen.add(jurisdiction)
        for (const status of entry.marketingStatusesAsRecorded ?? []) statuses.add(status)
        for (const applicationKind of entry.applicationKindsAsRecorded ?? []) {
          kinds.add(applicationKind)
        }
      }
      const regulatoryBlock: OutputRecord['regulatoryDivergence'] =
        jurisdictions.size > 0
          ? {
              jurisdictions: [...jurisdictions].sort(),
              statusesAsRecorded: [...statuses].sort(),
              applicationKindsAsRecorded: [...kinds].sort(),
              sources,
            }
          : null

      const availability: Record<DataType, boolean> = {
        evidenceTier: tier !== 'NONE_STORED',
        humanDoseStudied: doseBlock !== null,
        trialFailures: failuresBlock !== null,
        outcomeMeasures: measuresBlock !== null,
        kinetics: kineticsBlock !== null,
        interactionPathways: interactionsBlock !== null,
        evidenceCeiling: ceilingBlock !== null,
        // "Divergence" needs at least two jurisdictions on the record to be observable at all.
        regulatoryDivergence: (regulatoryBlock?.jurisdictions.length ?? 0) >= 2,
      }

      records.push({
        slug,
        name: drug.name,
        availability,
        availableCount: DATA_TYPES.filter((type) => availability[type]).length,
        evidenceTier: {
          tier,
          interventionalRandomizedStudies: study?.interventionalRandomized ?? 0,
          interventionalStudies: study?.interventional ?? 0,
          observationalStudies: study?.observational ?? 0,
          expandedAccessStudies: study?.expandedAccess ?? 0,
          storedStudyCount: storedCount,
          registryTotalStudies: registryTotal,
          storedListTruncated: truncated,
          pubmedClinicalTrialCount: pubmed,
        },
        humanDoseStudied: doseBlock,
        trialFailures: failuresBlock,
        outcomeMeasures: measuresBlock,
        kinetics: kineticsBlock,
        interactionPathways: interactionsBlock,
        evidenceCeiling: ceilingBlock,
        regulatoryDivergence: regulatoryBlock,
      })
    }

    const scanMetadata: ScanMetadata = {
      canonicalRecords: drugs.length,
      ctgMatchedRecords: ctgTotals.size,
      pubmedMatchedRecords: pubmedCounts.size,
      storedStudyRows,
      rawStudiesRead,
      rawStudiesMappedToCanonical: rawStudiesMapped,
      doseTokensWithoutFrequencyWord: unpairedTokens,
      recordsWithAttributedDoseText,
      recordsWithDoseTextInTrialsButNoneAttributable: recordsWithOnlyUnattributedDoseText,
      studyRecordPairsWithDoseTextButNoAttribution: unattributedStudyRecordPairs,
      studyRecordPairsWithoutStoredMatchedInterventionNames: ownerPairsMissingMatchNames,
      combinationInterventionsSeen: combinationInterventions,
      otherNamesDroppedAsAnotherInterventionsName: droppedCrossNamedAliases,
      recordsWithDoseTextRefusedForSingleTrialWithoutNameMatch: refusedSingleTrialDoseRecords,
      recordsWithStoredListTruncated: truncatedRecords,
      expandedAccessOnlyRecordsWithoutPubmed: expandedAccessOnlyWithoutPubmed,
      registryFileRegulatoryEntries: registryFileEntries,
      registryFileEntriesAgreeingWithDatabase: registryAgreements,
      jurisdictionValuesSeen: [...jurisdictionValuesSeen].sort(),
    }

    return { records, scanMetadata }
  } finally {
    await pool.end()
  }
}

// --- phase 1 slices ------------------------------------------------------------------------------

const SLICE_NAMES = ['strict', 'moderate', 'broad'] as const
type SliceName = (typeof SLICE_NAMES)[number]

interface Phase1Membership {
  bySlice: Record<SliceName, Set<string>>
  shape: string
  singleTierField: boolean
  rowsRead: number
  rowsWithoutSlice: number
}

/**
 * Phase 1 is written by a sibling script; its per-record field names are read tolerantly rather
 * than assumed. Whatever shape is found is named in the summary so the numbers can be checked.
 */
function readPhase1Membership(): Phase1Membership | null {
  if (!existsSync(PHASE1_RECORDS_PATH)) return null
  const bySlice: Record<SliceName, Set<string>> = {
    strict: new Set(),
    moderate: new Set(),
    broad: new Set(),
  }
  const shapes = new Set<string>()
  let rowsRead = 0
  let rowsWithoutSlice = 0
  let singleTierField = false

  const lines = readFileSync(PHASE1_RECORDS_PATH, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(trimmed) as Record<string, unknown>
    } catch {
      continue
    }
    rowsRead += 1
    const slug = typeof parsed.slug === 'string' ? parsed.slug : null
    if (!slug) {
      rowsWithoutSlice += 1
      continue
    }

    let matchedAny = false
    for (const name of SLICE_NAMES) {
      const flag = parsed[name]
      if (typeof flag === 'boolean') {
        shapes.add(`boolean:${name}`)
        if (flag) bySlice[name].add(slug)
        matchedAny = true
      }
    }
    for (const field of ['thresholds', 'slices', 'membership', 'tiers'] as const) {
      const value = parsed[field]
      if (typeof value !== 'object' || value === null || Array.isArray(value)) continue
      const nested = value as Record<string, unknown>
      for (const name of SLICE_NAMES) {
        const flag = nested[name]
        if (typeof flag === 'boolean') {
          shapes.add(`object:${field}.${name}`)
          if (flag) bySlice[name].add(slug)
          matchedAny = true
        }
      }
    }
    for (const field of ['tier', 'slice', 'band', 'classification', 'bucket'] as const) {
      const value = parsed[field]
      if (typeof value === 'string') {
        const lower = value.toLowerCase()
        for (const name of SLICE_NAMES) {
          if (lower === name || lower.includes(name)) {
            shapes.add(`string:${field}`)
            singleTierField = true
            bySlice[name].add(slug)
            matchedAny = true
          }
        }
      }
    }
    for (const field of ['tiers', 'slices'] as const) {
      const value = parsed[field]
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item !== 'string') continue
          const lower = item.toLowerCase()
          for (const name of SLICE_NAMES) {
            if (lower === name || lower.includes(name)) {
              shapes.add(`array:${field}`)
              bySlice[name].add(slug)
              matchedAny = true
            }
          }
        }
      }
    }
    if (!matchedAny) rowsWithoutSlice += 1
  }

  return {
    bySlice,
    shape: [...shapes].sort().join(', ') || 'no recognised slice field',
    singleTierField,
    rowsRead,
    rowsWithoutSlice,
  }
}

// --- summary --------------------------------------------------------------------------------------

interface DistributionBlock {
  records: number
  countOfEight: Record<string, number>
  median: number | null
  mean: number | null
}

function distribution(records: OutputRecord[]): DistributionBlock {
  const counts: Record<string, number> = {}
  for (let i = 0; i <= DATA_TYPES.length; i += 1) counts[String(i)] = 0
  const values: number[] = []
  for (const record of records) {
    const key = String(record.availableCount)
    counts[key] = (counts[key] ?? 0) + 1
    values.push(record.availableCount)
  }
  const mean =
    values.length === 0
      ? null
      : Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(3))
  return { records: records.length, countOfEight: counts, median: median(values), mean }
}

function buildSummary(
  records: OutputRecord[],
  scanMetadata: ScanMetadata | null,
): Record<string, unknown> {
  const coverage: Record<string, { records: number; pctOfPopulation: number }> = {}
  for (const type of DATA_TYPES) {
    const hit = records.filter((record) => record.availability[type]).length
    coverage[type] = {
      records: hit,
      pctOfPopulation: Number(((hit / Math.max(records.length, 1)) * 100).toFixed(2)),
    }
  }

  const tierDistribution: Record<string, number> = {}
  for (const record of records) {
    const tier = record.evidenceTier.tier
    tierDistribution[tier] = (tierDistribution[tier] ?? 0) + 1
  }

  const overall = distribution(records)
  const unreachableTypes = DATA_TYPES.filter((type) => (coverage[type]?.records ?? 0) === 0)
  const membership = readPhase1Membership()
  let slices: Record<string, unknown> | null = null
  if (membership) {
    const bySlice: Record<string, unknown> = {}
    const cumulative: Record<string, unknown> = {}
    const bySlug = new Map(records.map((record) => [record.slug, record]))
    const seenSoFar = new Set<string>()
    for (const name of SLICE_NAMES) {
      const slugs = membership.bySlice[name]
      const sliceRecords = [...slugs]
        .map((slug) => bySlug.get(slug))
        .filter((record): record is OutputRecord => record !== undefined)
      const sliceTiers: Record<string, number> = {}
      for (const record of sliceRecords) {
        const tier = record.evidenceTier.tier
        sliceTiers[tier] = (sliceTiers[tier] ?? 0) + 1
      }
      bySlice[name] = {
        ...distribution(sliceRecords),
        slugsInPhase1: slugs.size,
        slugsNotFoundInPhase2: slugs.size - sliceRecords.length,
        /**
         * Published next to the count-of-eight because the tier names invite the wrong reading:
         * phase 1's strict slice is a subset of its moderate slice and carries LESS stored evidence,
         * so these two blocks are how a reader sees that rather than inferring it from the name.
         */
        evidenceTierMix: sliceTiers,
        coverage: Object.fromEntries(
          DATA_TYPES.map((type) => [
            type,
            sliceRecords.filter((record) => record.availability[type]).length,
          ]),
        ),
      }
      for (const slug of slugs) seenSoFar.add(slug)
      const cumulativeRecords = [...seenSoFar]
        .map((slug) => bySlug.get(slug))
        .filter((record): record is OutputRecord => record !== undefined)
      cumulative[name] = distribution(cumulativeRecords)
    }
    slices = {
      phase1RecordsPath: 'data/biohacker-pivot/phase1-records.ndjson',
      detectedShape: membership.shape,
      rowsRead: membership.rowsRead,
      rowsWithoutRecognisedSlice: membership.rowsWithoutSlice,
      membershipInterpretation: 'exact — a record counts only in the slices phase 1 names for it',
      bySlice,
      cumulative: membership.singleTierField
        ? {
            note: 'assumes strict ⊂ moderate ⊂ broad; only meaningful if phase 1 names one tier per record',
            ...cumulative,
          }
        : null,
    }
  }

  /**
   * evidenceTier counts any stored signal, including a title/abstract name mention. The same figure
   * counted over registered studies only is published beside it, because those are different
   * claims and the difference is large.
   */
  const registeredStudyTiers = records.filter((record) =>
    ['HUMAN_RCT', 'HUMAN_INTERVENTIONAL', 'HUMAN_OBSERVATIONAL'].includes(record.evidenceTier.tier),
  ).length
  const kineticsRecords = records.filter((record) => record.kinetics !== null)
  const doseRecords = records.filter((record) => record.humanDoseStudied !== null)
  const coverageQualifications = {
    evidenceTierFromRegisteredStudiesOnly: {
      records: registeredStudyTiers,
      pctOfPopulation: Number(
        ((registeredStudyTiers / Math.max(records.length, 1)) * 100).toFixed(2),
      ),
      meaning:
        'A ClinicalTrials.gov study is stored for the record. The larger evidenceTier figure also ' +
        'counts PUBMED_TITLE_ABSTRACT_MENTION_ONLY, which means only that a clinical-trial-typed ' +
        'paper mentions the recorded name in its title or abstract.',
    },
    kineticsTestedKeys: {
      keys: QUANTITATIVE_PK_KEYS,
      meaning:
        'kinetics counts a record holding any of these stored pharmacokinetic values. Testing only ' +
        'halfLife, tMax and metabolismAsRecorded had undercounted it by 208 records.',
    },
    humanDoseStudiedCorroboration: Object.fromEntries(
      (
        [
          'RECORDED_SCHEDULE',
          'REGISTRY_NAME_MATCHES_RECORD',
          'TWO_OR_MORE_TRIALS',
        ] as DoseCorroboration[]
      ).map((kind) => [
        kind,
        doseRecords.filter((record) => record.humanDoseStudied?.corroboration === kind).length,
      ]),
    ),
    kineticsRecords: kineticsRecords.length,
  }

  return {
    generatedAt: new Date().toISOString(),
    population: records.length,
    dataTypes: DATA_TYPES,
    coverage,
    coverageQualifications,
    evidenceTierDistribution: tierDistribution,
    overall,
    maximumCountReachedByAnyRecord: records.reduce(
      (best, record) => Math.max(best, record.availableCount),
      0,
    ),
    dataTypesNoRecordHas: unreachableTypes,
    slices,
    scan: scanMetadata,
    notDerivable: [
      'Animal-only and in-vitro-only evidence. ClinicalTrials.gov registers human studies only and the stored PubMed search was filtered to "clinical trial[pt]"; no preclinical study store exists in the database or on disk. A record with tier NONE_STORED has no human study in stored data — it is not evidence that only animal work exists.',
      'Whether a substance has been studied in humans, for a record whose only signal is the PubMed count. The stored query is `"<name>"[tiab] AND clinical trial[pt]`, so a hit means a clinical-trial-typed paper mentions the recorded name in its title or abstract. The tier is named PUBMED_TITLE_ABSTRACT_MENTION_ONLY for that reason: it is the tier of records named Muscle (36,401 hits), Lung (31,289), Brain (30,542), Complex, Date, Eye, DNA, Air, Capsule and Cream, and 56 single-word-named records carry counts of 1,000 or more. coverageQualifications.evidenceTierFromRegisteredStudiesOnly gives the count that rests on a registered study instead.',
      "Whether a stopped trial failed. overallStatus and whyStopped are the sponsor's own words; no judged outcome is stored for any study.",
      'Regulatory divergence between jurisdictions. Every regulatoryApproval record carries source.kind FDA_DRUGSFDA (United States, Drugs@FDA); productVariants.jurisdiction is US_FDA on all 2,242 rows and costContext.jurisdiction is US on all 626. No EMA, MHRA, PMDA, Health Canada or TGA record exists, so the ≥2-jurisdiction test cannot be met by any record.',
      'A studied dose as a stored structured value for more than 27 records. The recorded dose-schedule module (recorded_background.titration) holds 27 records, all basis LABEL_SCHEDULE and none TRIAL_PROTOCOL. Every other dose string here is parsed out of free-text arm and intervention prose.',
      'A complete study list for records whose stored snapshot hit the 250-study cap; per-record study aggregates for those records are computed over the stored subset, flagged as storedListTruncated.',
    ],
    caveats: [
      "Dose strings are verbatim contiguous slices of registry free text, selected because a dose token and a frequency word appear within 60 characters of each other. They are what a trial says it gave, never a recommendation, and the parse is this script's, not the registry's.",
      "A dose string is kept only where the registry ties it to this record: the intervention name the snapshot matched, including the other names the registry lists for that intervention (INTERVENTION_NAME_MATCH); an arm the registry ties to exactly one matched intervention (ARM_SINGLE_INTERVENTION); a matched name within 80 characters of the dose text and closer to it than any other intervention the study names and than any other canonical medicine name in this corpus found beside the amount (ARM_NAME_NEARBY); or, on an intervention whose other-names list enumerates two or more medicines this corpus holds records for, this record's OWN name within 80 characters of the amount, with the other ingredients treated as competitors (COMBINATION_NAME_NEARBY). Amounts the registry ties to another medicine are counted in unattributedDoseMentions and never stored. The residual limit is prose: background therapy named only in narrative text, never as an intervention, can still leave its amount inside a kept string, which is why each string is carried whole with its trial id rather than reduced to a number.",
      'One intervention\'s other-names list no longer joins another intervention\'s alias group. An other-name that is itself a different intervention\'s own name in the same study is dropped, because the registry is pointing at that intervention rather than naming an alias: NCT00108082 lists otherNames ["carvedilol MR","atenolol"] on its lisinopril intervention, which had collapsed three interventions into one group and stored carvedilol\'s "80 mg once daily" under both atenolol and lisinopril. scan.otherNamesDroppedAsAnotherInterventionsName counts the drops.',
      "humanDoseStudied is not set by a single parsed mention alone. It needs a recorded dose schedule, or two or more trials, or an intervention name the snapshot matched that is name-related to the record itself; humanDoseStudied.corroboration says which. Without that bar a record could publish another medicine's amount as its whole dose evidence — Butalbital's only string was Acetazolamide's \"250 mg tablets daily.\" and Lactobacillus Crispatus's was Adenosine's 9 mg. scan.recordsWithDoseTextRefusedForSingleTrialWithoutNameMatch counts what the bar refuses.",
      'Zero amounts such as "0 mg daily" in a placebo arm are counted in zeroAmountMentions and kept out of the range, because they record the absence of the medicine rather than a dose given.',
      'Dose ranges are min/max of the parsed numbers inside one matched unit spelling. No unit is converted and the range spans trials with different populations and designs. A per-something amount keeps its own bucket and is never mixed with a bare amount: perUnitAsMatched carries kg, ml, l, dl, m2 or cm2 as the registry wrote it, so a per-millilitre concentration such as Brimonidine\'s "2mg/mL" is no longer read as a 2 mg dose.',
      'Trial duration is start date to primary completion date (falling back to completion date), computed from registry date strings that are sometimes month-precision only; the first of the month is assumed.',
      'Outcome measures are primary outcome titles only. No measured value is carried here.',
      'evidenceCeiling prefers an ACTUAL enrolment count and falls back to an ESTIMATED one, recording which type was used. The longest span can end on a sponsor-estimated completion date that has not happened yet; endsAfterToday says when it does.',
      'interactionPathways rows include polarity NEGATED, which means the label states the medicine is NOT a substrate or inhibitor. Filter on polarity before reading a row as a positive interaction.',
      'kinetics counts a record holding any stored quantitative pharmacokinetic value: half-life, tMax, metabolism, protein binding, bioavailability, elimination or volume of distribution. coverageQualifications.kineticsTestedKeys names them next to the count.',
      "The phase 1 slices are audience-fit filters, not a confidence ladder. slices.bySlice publishes each slice's count-of-eight distribution and evidence-tier mix because the strict slice is a subset of the moderate slice and carries less stored evidence than it: the gates strict adds are about availability and route, and they remove evidence-rich prescription medicines.",
    ],
  }
}

// --- state ----------------------------------------------------------------------------------------

interface PivotState {
  schema_version: number
  phase: string
  cursor: Record<string, unknown>
  counts: Record<string, unknown>
  decisions: unknown[]
  awaiting: unknown
  updated_at: string | null
}

function updateState(counts: Record<string, unknown>): void {
  const current: PivotState = existsSync(STATE_PATH)
    ? readJsonFile<PivotState>(STATE_PATH)
    : {
        schema_version: 1,
        phase: 'not-started',
        cursor: {},
        counts: {},
        decisions: [],
        awaiting: null,
        updated_at: null,
      }
  const next: PivotState = {
    ...current,
    phase: '2-inventoried',
    counts: { ...current.counts, phase2: counts },
    updated_at: new Date().toISOString(),
  }
  const temp = `${STATE_PATH}.tmp`
  writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`)
  renameSync(temp, STATE_PATH)
}

// --- io -------------------------------------------------------------------------------------------

function writeRecords(records: OutputRecord[]): void {
  const temp = `${RECORDS_PATH}.tmp`
  writeFileSync(temp, '')
  let buffer: string[] = []
  for (const record of records) {
    buffer.push(JSON.stringify(record))
    if (buffer.length >= 500) {
      appendFileSync(temp, `${buffer.join('\n')}\n`)
      buffer = []
    }
  }
  if (buffer.length > 0) appendFileSync(temp, `${buffer.join('\n')}\n`)
  renameSync(temp, RECORDS_PATH)
}

function readRecords(): OutputRecord[] {
  const records: OutputRecord[] = []
  for (const line of readFileSync(RECORDS_PATH, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue
    records.push(JSON.parse(trimmed) as OutputRecord)
  }
  return records
}

function printDistribution(summary: Record<string, unknown>): void {
  const overall = summary.overall as DistributionBlock
  const coverage = summary.coverage as Record<string, { records: number }>
  console.log(`population ${overall.records}`)
  console.log(
    `coverage ${DATA_TYPES.map((type) => `${type}:${coverage[type]?.records ?? 0}`).join(' ')}`,
  )
  console.log(
    `count-of-8 ${Object.entries(overall.countOfEight)
      .map(([count, records]) => `${count}:${records}`)
      .join(' ')}`,
  )
  console.log(`median ${overall.median ?? 'n/a'} mean ${overall.mean ?? 'n/a'}`)
  const slices = summary.slices as { bySlice?: Record<string, DistributionBlock> } | null
  if (slices?.bySlice) {
    for (const [name, block] of Object.entries(slices.bySlice)) {
      console.log(`slice ${name} n=${block.records} median ${block.median ?? 'n/a'}`)
    }
  } else {
    console.log('slices none (data/biohacker-pivot/phase1-records.ndjson not present)')
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const force = args.includes('--force')
  const reportOnly = args.includes('--report')
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  if (reportOnly) {
    if (!existsSync(RECORDS_PATH)) {
      throw new Error(`--report needs ${RECORDS_PATH}; run the scan first`)
    }
    const records = readRecords()
    // Scan-time facts cannot be recovered from the per-record cache; carry the previous ones over.
    const previous = existsSync(SUMMARY_PATH)
      ? readJsonFile<{ scan?: ScanMetadata }>(SUMMARY_PATH)
      : {}
    const summary = buildSummary(records, previous.scan ?? null)
    writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`)
    const overall = summary.overall as DistributionBlock
    const reportCoverage = summary.coverage as Record<string, { records: number }>
    updateState({
      records: records.length,
      median_count_of_eight: overall.median,
      coverage: Object.fromEntries(
        DATA_TYPES.map((type) => [type, reportCoverage[type]?.records ?? 0]),
      ),
      report_rebuilt_at: new Date().toISOString(),
    })
    printDistribution(summary)
    return
  }

  if (!force && existsSync(RECORDS_PATH) && existsSync(SUMMARY_PATH)) {
    console.log('already done')
    return
  }

  const { records, scanMetadata } = await scan()
  writeRecords(records)
  const summary = buildSummary(records, scanMetadata)
  writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`)
  const overall = summary.overall as DistributionBlock
  const coverage = summary.coverage as Record<string, { records: number }>
  updateState({
    records: records.length,
    median_count_of_eight: overall.median,
    coverage: Object.fromEntries(DATA_TYPES.map((type) => [type, coverage[type]?.records ?? 0])),
  })
  printDistribution(summary)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

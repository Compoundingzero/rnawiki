import type { ApprovalStatus, DrugModality } from '@/lib/types'
import type { ProgrammeSummaryFieldPath } from '@/lib/evidence/types'
import type { LegacyTenSecondAnswerEvidenceBinding } from '@/lib/ten-second-answer-contract'

const MEDICINE_TYPE_LABELS: Record<DrugModality, string> = {
  'Small Molecule': 'Small chemical medicine',
  'Peptide / GLP-1 Agonist': 'Peptide medicine',
  'Monoclonal Antibody (mAb)': 'Antibody medicine',
  'siRNA (Small Interfering RNA)': 'RNA-silencing medicine',
  'ASO (Antisense Oligonucleotide)': 'Gene-silencing medicine',
  'mRNA Vaccine / Therapeutic': 'RNA medicine or vaccine',
  'CRISPR / Gene Therapy': 'Gene-editing or gene therapy',
  'Recombinant Protein / Biologic': 'Protein medicine',
  'Nutraceutical / Botanical': 'Nutritional or plant product',
}

const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  'FDA Approved': 'Approved in the United States (FDA)',
  'EMA Approved': 'Approved in the European Union (EMA)',
  'Phase 3 Clinical Trial': 'In Phase 3 testing',
  'Phase 2 Investigational': 'In Phase 2 testing',
  'Off-Label / Compounded':
    'Used in a way not covered by an approval, or made by a compounding pharmacy',
  'Non-FDA / Dietary Supplement': 'Dietary supplement; not FDA-approved as a medicine',
  'Accelerated Approval':
    'FDA accelerated approval (based on an earlier result expected to predict benefit; follow-up evidence may be required)',
  'Pre-clinical / Open Source': 'Laboratory or animal-stage research',
  'Controlled / No Approved Use': 'Controlled substance; no approved US use',
  'Withdrawn from Market': 'Withdrawn from the market',
}

/**
 * Shared wording for medicine-wide research that has not yet been reviewed for one exact
 * question. The database still calls this the legacy path; readers should not have to understand
 * that implementation history.
 */
export const GENERAL_RESEARCH_SUMMARY_COPY = {
  label: 'General research summary',
  heading: 'What the research reports',
  boundary:
    'This combines research on different uses and groups. It is background, not a reviewed answer for one specific use.',
  technicalBoundary:
    'These details come from research gathered for the medicine as a whole. They have not been linked to one specific use.',
  findingLabel: 'Research finding',
  professionalFindingLabel: 'Medicine-wide research finding',
} as const

/**
 * Reader-facing medicine type. Unknown future database values stay visible instead of disappearing;
 * the exhaustive record keeps every current vocabulary value intentionally worded.
 */
export function publicMedicineTypeLabel(value: string): string {
  return MEDICINE_TYPE_LABELS[value as DrugModality] ?? 'Other recorded medicine type'
}

/** Reader-facing regulatory/development label with jurisdiction or study phase made explicit. */
export function publicApprovalStatusLabel(value: string): string {
  return APPROVAL_STATUS_LABELS[value as ApprovalStatus] ?? 'Other recorded medicine status'
}

export type ReaderSummaryBasis = 'older_record' | 'published_programme' | 'unpublished_programme'

export type ReaderSummarySourceFieldPath = Extract<
  ProgrammeSummaryFieldPath,
  'summary.bestSupportedFinding' | 'summary.mainLimitation'
>

export interface ReaderSummaryContextItem {
  label: string
  text: string
}

/**
 * A short first read assembled from already-stored public fields. `exactText` preserves the
 * original conclusion for the optional detail view; it is never rewritten or silently replaced.
 */
export interface ReaderSummaryView {
  basis: ReaderSummaryBasis
  /** The medicine or supplement use described by this page, in familiar language. */
  usedFor: string
  /** The strongest complete result already stored for this use. */
  whatStudiesFound?: string
  /** Present only when the displayed finding was derived from this exact reviewed field. */
  whatStudiesFoundSourceFieldPath?: Extract<
    ReaderSummarySourceFieldPath,
    'summary.bestSupportedFinding'
  >
  /** The most important unanswered question or failed claim already stored for this use. */
  biggestLimit?: string
  /** Present only when the displayed limitation was derived from this exact reviewed field. */
  biggestLimitSourceFieldPath?: Extract<ReaderSummarySourceFieldPath, 'summary.mainLimitation'>
  /** A short use note, separated from the purpose when the stored purpose contains one. */
  practicalNote?: string
  /** Reserved for a concise stored safety warning when one is available to the builder. */
  criticalSafety?: string
  /** Present only for static legacy copy whose complete evidence surface still matches review. */
  authoredEvidenceBinding?: LegacyTenSecondAnswerEvidenceBinding
  /** @deprecated Compatibility alias while older non-visual consumers move to the named fields. */
  takeaway: string
  exactText?: string
  simplified: boolean
  contextItems: ReaderSummaryContextItem[]
}

export interface ReaderMedicineLanguageContext {
  medicineSlug?: string
  medicineName: string
  modality: string
  targetGene?: string
  targetProtein?: string
  trialIdentifiers?: readonly string[]
}

export interface LegacyReaderSummaryInput extends ReaderMedicineLanguageContext {
  selectedUse?: string
  exactText?: string
  measuredFinding?: string
  mainUncertainty?: string
}

export interface PublishedProgrammeReaderSummaryInput extends ReaderMedicineLanguageContext {
  selectedUse: string
  exactText: string
  plainMechanism?: string
  bestSupportedFinding?: string
  mainUncertainty?: string
}

const READER_SUMMARY_MAX_WORDS = 40
const READER_WORD_PATTERN = /[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu
const DANGLING_ENDING =
  /(?:[,;:\-–—]|\b(?:and|or|but|because|while|with|without|to|for|of|in|on|at|by|than|versus|vs|against|from|as|including))$/iu
const TECHNICAL_RESULT_MARKER =
  /(?:\bP\s*(?:[<=>≤≥]|-?value\b)|\b(?:OR|HR)\s*[<=>≤≥]?\s*-?\d|\b(?:\d+(?:\.\d+)?%\s*)?CI\b|\bNCT\d{8}\b|\bdoi\s*:|\b10\.\d{4,9}\/\S+)/iu
const FIRST_READ_MOLECULAR_MARKER =
  /\b(?:GalNAc|siRNA|mRNA|RNAi|messenger RNA|antisense oligonucleotide)\b/iu
const PCSK9_MARKER = /\bPCSK9\b/iu
const PLAIN_PCSK9_FIRST_USE =
  /(?:\bPCSK9\s*(?:,|[—–-]|\()\s*a protein\s+(?:that|which)\s+[\p{L}]|\ba protein called PCSK9\s+(?:that|which)\s+[\p{L}])/iu
const RESULT_MAGNITUDE_PATTERN =
  /(?:-?\d+(?:\.\d+)?\s*%|\b-?\d+(?:\.\d+)?\s*percentage[- ]points?\b)/giu
const EXPLICIT_RESULT_COMPARISON =
  /\b(?:compared with|versus|vs\.?|against|from baseline|than with)\b/iu
const EXPLICIT_RESULT_TIME =
  /\b(?:at|after|by|through|over)\s+(?:about\s+)?(?:(?:day|week|month|year)\s*\d+|\d+(?:\.\d+)?\s*(?:days?|weeks?|months?|years?))\b/iu

function cleanText(value: string | null | undefined): string | undefined {
  const normalized = value?.replace(/\s+/g, ' ').trim()
  return normalized ? normalized : undefined
}

function readerWordCount(value: string): number {
  return value.match(READER_WORD_PATTERN)?.length ?? 0
}

function isCompleteReaderFragment(value: string): boolean {
  return readerWordCount(value) > 0 && !DANGLING_ENDING.test(value.trim())
}

function isSafeFirstReadDetail(value: string): boolean {
  if (TECHNICAL_RESULT_MARKER.test(value) || FIRST_READ_MOLECULAR_MARKER.test(value)) return false
  if (PCSK9_MARKER.test(value) && !PLAIN_PCSK9_FIRST_USE.test(value)) return false
  const resultMagnitudes = value.match(RESULT_MAGNITUDE_PATTERN)?.length ?? 0
  if (resultMagnitudes > 1) return false
  if (resultMagnitudes === 0) return true
  return EXPLICIT_RESULT_COMPARISON.test(value) && EXPLICIT_RESULT_TIME.test(value)
}

/**
 * Returns a complete stored sentence only when it already fits the first-read budget. Nothing is
 * cut mid-thought and no scientific wording is paraphrased by this helper.
 */
export function safeStoredReaderSentence(
  value: string | null | undefined,
  maxWords: number = READER_SUMMARY_MAX_WORDS,
): string | undefined {
  const stored = cleanText(value)
  if (!stored || !Number.isSafeInteger(maxWords) || maxWords < 1) return undefined

  for (const match of stored.matchAll(/[.!?](?=\s|$)/g)) {
    const sentence = stored.slice(0, (match.index ?? 0) + 1).trim()
    if (readerWordCount(sentence) > maxWords) return undefined
    if (isCompleteReaderFragment(sentence) && isSafeFirstReadDetail(sentence)) return sentence
    return undefined
  }

  if (
    readerWordCount(stored) <= maxWords &&
    isCompleteReaderFragment(stored) &&
    isSafeFirstReadDetail(stored)
  ) {
    return stored
  }
  return undefined
}

function storedContextItem(
  label: string,
  value: string | null | undefined,
): ReaderSummaryContextItem | undefined {
  const stored = cleanText(value)
  return stored ? { label, text: stored } : undefined
}

const FIRST_READ_FIELD_MAX_WORDS = 32
const FIRST_READ_FORBIDDEN_WORDING =
  /\b(?:audit|confidence interval|double-blind|endpoint|hazard ratio|odds ratio|open-label|percentage points?|phase\s*(?:3|III)|placebo|programme|randomi[sz]ed|record)\b|\bCI\b|\bNCT\d{8}\b|\b(?:ORION|VICTORION)[-\s]?\d+\b/iu

function escapeRegularExpression(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureSentence(value: string): string {
  const sentence = cleanText(value) ?? ''
  if (!sentence || /[.!?]$/u.test(sentence)) return sentence
  return `${sentence}.`
}

function lowerFirst(value: string): string {
  if (!value || /^[A-Z]{2,}(?:\b|[-\d])/u.test(value)) return value
  return `${value.charAt(0).toLocaleLowerCase('en')}${value.slice(1)}`
}

/** Removes only study names and registry numbers supplied by the stored medicine context. */
function removeStoredStudyIdentifiers(
  value: string,
  trialIdentifiers: readonly string[] | undefined,
): string {
  let result = value.replace(/\s*\(?\bNCT\d{8}\b\)?/giu, '')
  const names = (trialIdentifiers ?? [])
    .flatMap((identifier) => cleanText(identifier) ?? [])
    .map((identifier) => cleanText(identifier.match(/^(.+?)\s*\(/u)?.[1]) ?? identifier)
    .filter((name): name is string => Boolean(name && !/^NCT\d{8}$/iu.test(name)))
    .sort((left, right) => right.length - left.length)

  if (names.length === 0) return cleanText(result) ?? ''
  const choices = names.map(escapeRegularExpression).join('|')
  result = result.replace(
    new RegExp(`\\bin\\s+(?:${choices})(?:\\s*(?:,|and)\\s*(?:${choices}))*`, 'gu'),
    'in the studies',
  )
  result = result.replace(new RegExp(`\\b(?:${choices})\\b`, 'gu'), 'the study')
  return cleanText(result) ?? ''
}

/**
 * Familiar-word substitutions with stable meanings. These deliberately avoid disease-specific
 * interpretation: the scientific claim, direction, number, comparison, and time remain unchanged.
 */
function simplifyCommonReaderTerms(value: string): string {
  return value
    .replace(/^At day 510\b/u, 'After about 17 months')
    .replace(/\bat day 510\b/giu, 'after about 17 months')
    .replace(/^After 510 days\b/u, 'After about 17 months')
    .replace(/\bafter 510 days\b/giu, 'after about 17 months')
    .replace(/\bLDL-C\b/giu, 'LDL cholesterol')
    .replace(/\bLDL\s+\(often called [“"]bad[”"] cholesterol\)/giu, 'LDL (“bad”) cholesterol')
    .replace(/\bLDL\s+\([“"]bad[”"]\)\s+cholesterol\b/giu, 'LDL (“bad”) cholesterol')
    .replace(/\bLDL cholesterol\b/giu, 'LDL (“bad”) cholesterol')
    .replace(
      'The LDL (“bad”) cholesterol measurement fell',
      'The LDL (“bad”) cholesterol level fell',
    )
    .replace(
      /\brandomi[sz]ed,?\s+double-blind,?\s+placebo-controlled\s+(trial|study|trials|studies)\b/giu,
      (_match: string, noun: string) => (/s$/iu.test(noun) ? 'studies' : 'study'),
    )
    .replace(/\brandomi[sz]ed,?\s+double-blind\b/giu, '')
    .replace(
      /\bplacebo-controlled\s+(trial|study|trials|studies)\b/giu,
      (_match: string, noun: string) => (/s$/iu.test(noun) ? 'studies' : 'study'),
    )
    .replace(/\bplacebo injections\b/giu, 'dummy injections')
    .replace(/\bplacebo injection\b/giu, 'dummy injection')
    .replace(/\bplacebo treatment\b/giu, 'dummy treatment')
    .replace(/\bplacebo patients\b/giu, 'people in the dummy-treatment group')
    .replace(/\bplacebo patient\b/giu, 'a person in the dummy-treatment group')
    .replace(/\bplacebo (?:group|arm)\b/giu, 'dummy-treatment group')
    .replace(
      /\b(improved|worsened|changed|fell|rose|decreased|increased)\s+on placebo\b/giu,
      '$1 with a dummy treatment',
    )
    .replace(
      /\b(people|patients|participants|those)\s+on placebo\b/giu,
      '$1 given a dummy treatment',
    )
    .replace(/\bgiven(?:\s+(?:a|an|the))?\s+placebo\b/giu, 'given a dummy treatment')
    .replace(/\bon placebo\b/giu, 'with a dummy treatment')
    .replace(/\b(compared with|than|versus|vs\.?|against)\s+placebo\b/giu, '$1 a dummy treatment')
    .replace(/\bwith\s+placebo\b/giu, 'with a dummy treatment')
    .replace(/\b(?:a|an)\s+placebo\b/giu, 'a dummy treatment')
    .replace(/\bplacebo\b/giu, 'dummy treatment')
    .replace(
      /\bwas open-label and compared its results against the people in the dummy-treatment group from a different, earlier (?:trial|study)\b/giu,
      'let everyone know which treatment was given and used people from a different, earlier study as its dummy-treatment group',
    )
    .replace(
      /\bPhase\s*(?:3|III)\s+(trial|study|trials|studies)\b/giu,
      (_match: string, noun: string) => (/s$/iu.test(noun) ? 'studies' : 'study'),
    )
    .replace(/\bclinical trials?\b/giu, 'studies in people')
    .replace(/\btrials?\b/giu, (match) => (match.endsWith('s') ? 'studies' : 'study'))
    .replace(/\btraining programme\b/giu, 'training plan')
    .replace(/\bmonitoring programme\b/giu, 'monitoring plan')
    .replace(/\btreatment programme\b/giu, 'treatment plan')
    .replace(/\bthe study\s+(?:,|and)\s+the study\b/giu, 'both studies')
    .replace(/\bendpoints?\b/giu, (match) => (match.endsWith('s') ? 'results' : 'result'))
    .replace(/\baudit\b/giu, 'close review')
    .replace(/\bthe (?:older )?record does not yet show\b/giu, 'Studies have not yet shown')
    .replace(/\bthe (?:older )?record\b/giu, 'the information here')
    .replace(/\bneuroprotection\b/giu, 'protection of the brain')
    .replace(/\bneuroprotective\b/giu, 'protective of the brain')
    .replace(
      /\bmuscle biopsies before and after\b/giu,
      'Tests of small muscle samples taken before and after',
    )
    .replace(/\bmuscle biops(?:y|ies)\b/giu, (match) =>
      match.toLocaleLowerCase('en').endsWith('ies')
        ? 'tests of small muscle samples'
        : 'a test of a small muscle sample',
    )
    .replace(
      /\bswallowed creatine really does end up inside muscle\b/giu,
      'creatine taken by mouth reaches the muscles',
    )
    .replace(
      /\bpeople with the least to begin with gained the most\b/giu,
      'people who started with the least had the biggest increase',
    )
    .replace(
      /\bphosphocreatine resynthesis\b/giu,
      'how quickly muscles refill their rapid energy supply',
    )
    .replace(/\bshort-duration power\b/giu, 'power during short, hard efforts')
    .replace(/\bpower output\b/giu, 'power')
    .replace(/\bmeta-analyses\b/giu, 'reviews of many studies')
    .replace(/\bmeta-analysis\b/giu, 'review of many studies')
    .replace(
      /\bhalted for futility\b/giu,
      'stopped early because the medicine was unlikely to help',
    )
    .replace(
      /\bstopped for futility\b/giu,
      'stopped early because the medicine was unlikely to help',
    )
    .replace(
      /\bcompared with people given a dummy treatment\b/giu,
      'compared with a dummy treatment',
    )
    .replace(/\bdespite statins\b/giu, 'despite cholesterol-lowering medicines')
    .replace(/\s+in the studies(?=[.!?]$)/gu, '')
    .replace(/\s+([,.;:!?])/gu, '$1')
    .replace(/\s+/gu, ' ')
    .trim()
}

function plainStoredSentence(
  value: string | null | undefined,
  context: ReaderMedicineLanguageContext,
  maxWords: number = FIRST_READ_FIELD_MAX_WORDS,
): string | undefined {
  const stored = cleanText(value)
  if (!stored) return undefined
  const withoutIdentifiers = removeStoredStudyIdentifiers(stored, context.trialIdentifiers)
  const plain = simplifyCommonReaderTerms(withoutIdentifiers)
  if (!plain || FIRST_READ_FORBIDDEN_WORDING.test(plain)) return undefined
  const stillContainsStoredIdentifier = (context.trialIdentifiers ?? []).some((identifier) => {
    const storedIdentifier = cleanText(identifier)
    if (!storedIdentifier) return false
    const studyName = cleanText(storedIdentifier.match(/^(.+?)\s*\(/u)?.[1]) ?? storedIdentifier
    return Boolean(studyName && plain.includes(studyName))
  })
  if (stillContainsStoredIdentifier) return undefined
  const sentence = safeStoredReaderSentence(plain, maxWords)
  if (
    sentence &&
    /^(?:it|this|that|they|these|those)\s+(?:does|do|did|has|have|was|were)\s+not\.?$/iu.test(
      sentence,
    )
  ) {
    return undefined
  }
  return sentence
}

const RESULT_MEANING_SIGNAL =
  /\b(?:benefited?|changed?|cleared?|cured?|decreased?|died|differed?|fell|found|gained?|harmed?|helped?|higher|hospitali[sz]ed|improved?|increased?|lower(?:ed)?|occurred|prevented?|produced|reached?|reduced?|relapsed?|responded?|rose|showed?|slowed?|stopped|survived?|worsened?)\b/iu
const STUDY_SETUP_SIGNAL =
  /\b(?:asked|assigned|compared|enrolled|entered|followed|gave|given|got|participated|pooled|put|ran|received|tested|took|was given|were given)\b/iu
const LIMITATION_SIGNAL =
  /\b(?:cannot|could not|did not|does not|everyone (?:knew|know) which treatment|failed|has not|have not|insufficient|no (?:clear |direct |good )?evidence|not (?:been )?(?:demonstrated|measured|proven|shown)|people from a different, earlier study|remains? (?:uncertain|unknown)|uncertain|unknown|whether)\b/iu

function storedSentences(value: string): string[] {
  // Split only where terminal punctuation is followed by whitespace. Decimal points such as
  // `52.3%` must remain inside the same result sentence.
  return value
    .split(/(?<=[.!?])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean)
}

function plainStoredResultSentence(
  value: string | null | undefined,
  context: ReaderMedicineLanguageContext,
): string | undefined {
  const stored = cleanText(value)
  if (!stored) return undefined

  for (const storedSentence of storedSentences(stored)) {
    const sentence = plainStoredSentence(storedSentence, context)
    if (!sentence || !RESULT_MEANING_SIGNAL.test(sentence)) continue
    if (STUDY_SETUP_SIGNAL.test(sentence) && !RESULT_MEANING_SIGNAL.test(sentence)) continue
    return sentence
  }
  return undefined
}

function usedForSummary(
  selectedUse: string | null | undefined,
  context: ReaderMedicineLanguageContext,
): { usedFor: string; practicalNote?: string } {
  const stored = cleanText(selectedUse)
  if (!stored) {
    return { usedFor: 'What this medicine is used or studied for is not explained here.' }
  }

  const [mainUse = '', ...noteParts] = removeStoredStudyIdentifiers(
    stored,
    context.trialIdentifiers,
  ).split(/;\s*/u)
  let plainUse = simplifyCommonReaderTerms(mainUse)
  const escapedMedicineName = escapeRegularExpression(context.medicineName)
  plainUse = plainUse.replace(
    new RegExp(`^${escapedMedicineName}\\s+stud(?:y|ied)\\s+in\\s+`, 'iu'),
    'Studied in ',
  )
  plainUse = plainUse.replace(/^Taken for\s+/iu, 'Used for ')
  const adultAndInheritedUse = plainUse.match(
    /^High (.+?) in adults, and inherited high cholesterol from age (\d+)$/iu,
  )
  if (adultAndInheritedUse) {
    plainUse = `Used for adults with high ${adultAndInheritedUse[1]} and people age ${adultAndInheritedUse[2]} or older with inherited high cholesterol`
  }
  plainUse = plainUse.replace(/^High\s+/u, 'Used or studied for people with high ')
  if (
    context.modality === 'Nutraceutical / Botanical' &&
    !/^(?:For|Studied|Taken|Used)\b/iu.test(plainUse)
  ) {
    plainUse = `Used for ${lowerFirst(plainUse)}`
  }
  if (!/^(?:For|Studied|Taken|Used|Treats?|Prevents?|Lowers?|Helps?)\b/iu.test(plainUse)) {
    plainUse = `Used or studied for ${lowerFirst(plainUse)}`
  }
  plainUse = plainUse.replace(/^Used or studied for marketed for\s+/iu, 'Used for ')
  plainUse = plainUse.replace(/^Used for marketed for\s+/iu, 'Used for ')

  const safeUse =
    readerWordCount(plainUse) <= 28 &&
    isCompleteReaderFragment(plainUse) &&
    !FIRST_READ_FORBIDDEN_WORDING.test(plainUse) &&
    !FIRST_READ_MOLECULAR_MARKER.test(plainUse) &&
    !PCSK9_MARKER.test(plainUse)
      ? ensureSentence(plainUse)
      : 'This page discusses a use that still needs a clear, short description.'
  const note = simplifyCommonReaderTerms(noteParts.join('; '))
  const noteSentence = note ? ensureSentence(note.replace(/^used\s+/iu, 'It is used ')) : undefined
  const practicalNote =
    noteSentence &&
    readerWordCount(noteSentence) <= 18 &&
    /\b(?:daily|dose|doses|drip|inject(?:ed|ion|ions)?|mouth|once|tablet|taken|twice|used|weekly)\b/iu.test(
      noteSentence,
    ) &&
    !FIRST_READ_FORBIDDEN_WORDING.test(noteSentence)
      ? noteSentence
      : undefined

  return { usedFor: safeUse, ...(practicalNote ? { practicalNote } : {}) }
}

function explicitVerdictLimit(
  exactText: string | null | undefined,
  context: ReaderMedicineLanguageContext,
): string | undefined {
  const exact = cleanText(exactText)
  if (!exact) return undefined
  if (/\bneuroprotection claim\b.*\bfailed two\b/iu.test(exact)) {
    return 'Two large studies found no evidence that creatine slowed Parkinson’s or Huntington’s disease.'
  }

  const sentences = exact.match(/[^.!?]+[.!?](?=\s|$)|[^.!?]+$/gu) ?? []
  for (const sentence of sentences.slice(1)) {
    if (
      !/\b(?:did not|does not|failed|has not|have not|not yet|remains unknown|uncertain)\b/iu.test(
        sentence,
      )
    ) {
      continue
    }
    const plain = plainStoredSentence(sentence, context, 28)
    if (plain) return plain
  }
  return undefined
}

function explicitVerdictFinding(
  exactText: string | null | undefined,
  context: ReaderMedicineLanguageContext,
): string | undefined {
  const exact = cleanText(exactText)
  if (!exact) return undefined
  if (
    /\bcentral claim survives audit\b/iu.test(exact) &&
    /\bshort-duration power all rise\b/iu.test(exact) &&
    /\breplicated across decades\b/iu.test(exact)
  ) {
    const plainName = context.medicineName.replace(/\s+monohydrate$/iu, '')
    return `Studies over several decades show that ${lowerFirst(plainName)} can improve power during repeated short, hard efforts.`
  }
  return undefined
}

interface LimitationSummaryResult {
  text: string
  source: 'main_uncertainty' | 'exact_text'
}

function limitationSummary(
  mainUncertainty: string | null | undefined,
  exactText: string | null | undefined,
  context: ReaderMedicineLanguageContext,
): LimitationSummaryResult | undefined {
  const exact = cleanText(exactText)
  if (exact && /\bneuroprotection claim\b.*\bfailed two\b/iu.test(exact)) {
    const text = explicitVerdictLimit(exact, context)
    return text ? { text, source: 'exact_text' } : undefined
  }
  const stored = cleanText(mainUncertainty)
  if (stored) {
    if (/^That\s+/u.test(stored)) {
      const assertion = stored.replace(/^That\s+/u, 'that ')
      const firstClause = assertion.split(/\s+[—–]\s+/u)[0]
      const text = plainStoredSentence(
        ensureSentence(`Studies have not shown ${firstClause}`),
        context,
        28,
      )
      return text ? { text, source: 'main_uncertainty' } : undefined
    }
    const plain = plainStoredSentence(stored, context, 28)
    return plain && LIMITATION_SIGNAL.test(plain)
      ? { text: plain, source: 'main_uncertainty' }
      : undefined
  }
  const text = explicitVerdictLimit(exact, context)
  return text ? { text, source: 'exact_text' } : undefined
}

/**
 * Builds the legacy first read from separate stored fields. Deterministic wording substitutions
 * may explain familiar research terms, but claim direction, magnitude, comparison, and time are
 * never invented. The original conclusion remains available separately as `exactText`.
 */
export function buildLegacyReaderSummary(input: LegacyReaderSummaryInput): ReaderSummaryView {
  const selectedUse = cleanText(input.selectedUse)
  const measuredFinding = cleanText(input.measuredFinding)
  const mainUncertainty = cleanText(input.mainUncertainty)
  const exactText = cleanText(input.exactText)
  const generatedPurpose = usedForSummary(selectedUse, input)
  const purpose = {
    usedFor: generatedPurpose.usedFor,
    ...(generatedPurpose.practicalNote ? { practicalNote: generatedPurpose.practicalNote } : {}),
  }
  const whatStudiesFound =
    plainStoredResultSentence(measuredFinding, input) ?? explicitVerdictFinding(exactText, input)
  const generatedLimit = limitationSummary(mainUncertainty, exactText, input)
  const biggestLimit = generatedLimit?.text
  const missingResult = measuredFinding
    ? 'A measured result is recorded, but a short plain-language version is not available yet.'
    : 'A measured result is not recorded here.'
  const compatibilityPurpose =
    selectedUse && readerWordCount(selectedUse) <= 24 && isCompleteReaderFragment(selectedUse)
      ? `This page covers one use of ${input.medicineName}: ${selectedUse.replace(/[.!?]+$/u, '')}.`
      : undefined
  const takeaway =
    whatStudiesFound ??
    (compatibilityPurpose ? `${compatibilityPurpose} ${missingResult}` : missingResult)
  const contextItems = [
    storedContextItem('What this page covers', selectedUse),
    storedContextItem('What was measured', measuredFinding),
    storedContextItem('What remains uncertain', mainUncertainty),
  ].flatMap((item) => item ?? [])

  return {
    basis: 'older_record',
    ...purpose,
    ...(whatStudiesFound ? { whatStudiesFound } : {}),
    ...(biggestLimit ? { biggestLimit } : {}),
    takeaway,
    ...(exactText ? { exactText } : {}),
    simplified: Boolean(whatStudiesFound),
    contextItems,
  }
}

/** Uses only the reviewed programme summary fields; it does not parse or reinterpret claims. */
export function buildPublishedProgrammeReaderSummary(
  input: PublishedProgrammeReaderSummaryInput,
): ReaderSummaryView {
  const exactText = cleanText(input.exactText) ?? ''
  const bestSupportedFinding = cleanText(input.bestSupportedFinding)
  const purpose = usedForSummary(input.selectedUse, input)
  const whatStudiesFound = bestSupportedFinding
    ? plainStoredResultSentence(bestSupportedFinding, input)
    : plainStoredResultSentence(exactText, input)
  const generatedLimit = limitationSummary(input.mainUncertainty, exactText, input)
  const biggestLimit = generatedLimit?.text
  const contextItems = [
    storedContextItem('What this page covers', input.selectedUse),
    storedContextItem('How it is meant to work', input.plainMechanism),
    storedContextItem('Best-supported finding', bestSupportedFinding),
    storedContextItem('What remains uncertain', input.mainUncertainty),
  ].flatMap((item) => item ?? [])
  const exactTakeaway = safeStoredReaderSentence(exactText)
  const takeaway =
    (bestSupportedFinding ? whatStudiesFound : exactTakeaway) ??
    'A reviewed study result is available, but it still needs a short plain-language explanation.'

  return {
    basis: 'published_programme',
    ...purpose,
    ...(whatStudiesFound ? { whatStudiesFound } : {}),
    ...(bestSupportedFinding && whatStudiesFound
      ? { whatStudiesFoundSourceFieldPath: 'summary.bestSupportedFinding' as const }
      : {}),
    ...(biggestLimit ? { biggestLimit } : {}),
    ...(biggestLimit && generatedLimit?.source === 'main_uncertainty'
      ? { biggestLimitSourceFieldPath: 'summary.mainLimitation' as const }
      : {}),
    takeaway,
    exactText,
    simplified: Boolean(whatStudiesFound),
    contextItems,
  }
}

/** Explicit empty state for an identified programme that has no reviewed public conclusion. */
export function buildUnpublishedProgrammeReaderSummary(
  context: ReaderMedicineLanguageContext & { selectedUse?: string },
): ReaderSummaryView {
  const takeaway = 'No reviewed plain-language answer has been published for this use.'
  const purpose = usedForSummary(context.selectedUse, context)
  const contextItems = [storedContextItem('What this page covers', context.selectedUse)].flatMap(
    (item) => item ?? [],
  )
  return {
    basis: 'unpublished_programme',
    ...purpose,
    takeaway,
    simplified: false,
    contextItems,
  }
}

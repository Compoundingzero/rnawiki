import type { ApprovalStatus, DrugModality } from '@/lib/types'
import type { PublicMedicineContextItem } from '@/lib/public-medicine-context'
import {
  dedupePublicMedicineContextItems,
  detectPublicMedicineContextItems,
} from '@/lib/public-medicine-context'

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
  takeaway: string
  exactText?: string
  simplified: boolean
  contextItems: ReaderSummaryContextItem[]
  terms: PublicMedicineContextItem[]
}

export interface ReaderMedicineLanguageContext {
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
  /\b(?:at|after|by|through|over)\s+(?:(?:day|week|month|year)\s*\d+|\d+(?:\.\d+)?\s*(?:days?|weeks?|months?|years?))\b/iu

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

function withoutTerminalPunctuation(value: string): string {
  return value.replace(/[.!?]+$/u, '')
}

function safeStoredPurpose(value: string | undefined): string | undefined {
  if (!value || readerWordCount(value) > 24 || !isCompleteReaderFragment(value)) return undefined
  return value
}

function storedContextItem(
  label: string,
  value: string | null | undefined,
): ReaderSummaryContextItem | undefined {
  const stored = cleanText(value)
  return stored ? { label, text: stored } : undefined
}

function dynamicContextTerms(
  context: ReaderMedicineLanguageContext,
  visibleValues: readonly string[],
): PublicMedicineContextItem[] {
  const corpus = visibleValues.join('\n').toLocaleLowerCase('en')
  const items: PublicMedicineContextItem[] = []

  const gene = cleanText(context.targetGene)
  const protein = cleanText(context.targetProtein)
  const geneMentioned = Boolean(gene && corpus.includes(gene.toLocaleLowerCase('en')))
  const proteinMentioned = Boolean(protein && corpus.includes(protein.toLocaleLowerCase('en')))
  if (
    gene &&
    protein &&
    gene.toLocaleLowerCase('en') === protein.toLocaleLowerCase('en') &&
    (geneMentioned || proteinMentioned)
  ) {
    items.push({
      key: `target:${gene.toLocaleLowerCase('en')}`,
      plainMeaning: 'Gene and protein named as the medicine’s target',
      technicalTerm: gene,
      definition: `${gene} is the scientific name recorded for both a set of instructions inside cells and the protein made from those instructions. This medicine is intended to affect that target.`,
    })
  } else {
    if (gene && geneMentioned) {
      items.push({
        key: `gene:${gene.toLocaleLowerCase('en')}`,
        plainMeaning: 'Gene named as a target',
        technicalTerm: gene,
        definition: `${gene} is the scientific short name recorded for a set of instructions this medicine targets inside cells.`,
      })
    }
    if (protein && proteinMentioned) {
      items.push({
        key: `protein:${protein.toLocaleLowerCase('en')}`,
        plainMeaning: 'Protein named as a target',
        technicalTerm: protein,
        definition: `${protein} is the scientific name recorded for a protein this medicine targets. A protein is one of the working molecules made by cells.`,
      })
    }
  }

  const mentionedStudies: Array<{ name: string; registryNumber?: string }> = []
  for (const storedIdentifier of context.trialIdentifiers ?? []) {
    const identifier = cleanText(storedIdentifier)
    if (!identifier) continue
    const name = cleanText(identifier.match(/^(.+?)\s*\(/u)?.[1]) ?? identifier
    const registryNumber = identifier.match(/\bNCT\d{8}\b/iu)?.[0]
    if (
      !name ||
      (!corpus.includes(name.toLocaleLowerCase('en')) &&
        !(registryNumber && corpus.includes(registryNumber.toLocaleLowerCase('en'))))
    ) {
      continue
    }
    if (
      mentionedStudies.some(
        (study) => study.name.toLocaleLowerCase('en') === name.toLocaleLowerCase('en'),
      )
    ) {
      continue
    }
    mentionedStudies.push({ name, ...(registryNumber ? { registryNumber } : {}) })
  }
  if (mentionedStudies.length > 0) {
    for (const study of mentionedStudies) {
      items.push({
        key: `study:${study.name.toLocaleLowerCase('en')}`,
        plainMeaning: 'The name researchers gave one study',
        technicalTerm: study.name,
        definition: `${study.name} is a name used to identify one study; it is not a result.${study.registryNumber ? ` ${study.registryNumber} is that study’s public registry number.` : ''}`,
      })
    }
  }

  const galnacTagged = /\bGalNAc(?:-tagged|-conjugated)?\b/iu.test(corpus)
  const modalityDefinition: Record<DrugModality, string> = {
    'Small Molecule':
      'A small chemical medicine is compact enough to enter parts of the body that many larger medicines cannot reach.',
    'Peptide / GLP-1 Agonist':
      'A peptide medicine is a short chain of the same building blocks used to make proteins. It can copy or change a signal used by the body.',
    'Monoclonal Antibody (mAb)':
      'An antibody medicine is a laboratory-made protein designed to attach to one particular target.',
    'siRNA (Small Interfering RNA)': galnacTagged
      ? 'siRNA is a short piece of RNA designed to switch off one set of instructions inside cells. GalNAc is a sugar-based tag that helps this medicine enter liver cells.'
      : 'siRNA is a short piece of RNA designed to switch off one set of instructions inside cells.',
    'ASO (Antisense Oligonucleotide)':
      'An antisense medicine is a short strand designed to attach to one set of instructions inside cells and change how those instructions are used.',
    'mRNA Vaccine / Therapeutic':
      'Messenger RNA, or mRNA, carries temporary instructions that cells can read to make a protein.',
    'CRISPR / Gene Therapy':
      'Gene-editing and gene therapies are designed to change, replace, or add instructions inside cells.',
    'Recombinant Protein / Biologic':
      'A protein medicine supplies or copies a working molecule normally used by living cells.',
    'Nutraceutical / Botanical':
      'This category covers nutritional substances or products made from plants rather than an approved conventional medicine type.',
  }
  items.push({
    key: `modality:${context.modality}`,
    plainMeaning: galnacTagged
      ? `${publicMedicineTypeLabel(context.modality)} guided to liver cells`
      : publicMedicineTypeLabel(context.modality),
    technicalTerm:
      galnacTagged && context.modality === 'siRNA (Small Interfering RNA)'
        ? 'GalNAc-tagged siRNA (small interfering RNA)'
        : context.modality,
    definition:
      modalityDefinition[context.modality as DrugModality] ??
      'This is the scientific category recorded for the medicine. The shorter label describes the same category in everyday language.',
  })

  return items
}

function summaryTerms(
  context: ReaderMedicineLanguageContext,
  primaryValues: readonly (string | undefined)[],
  exactText?: string,
): PublicMedicineContextItem[] {
  const visibleValues = primaryValues.flatMap((value) => cleanText(value) ?? [])
  const exactValues = cleanText(exactText) ? [exactText!] : []
  const dynamic = dynamicContextTerms(context, [...visibleValues, ...exactValues])
  const detectedVisible = detectPublicMedicineContextItems(visibleValues)
  const detectedExact = detectPublicMedicineContextItems(exactValues)
  const hasContextualPercentage = [...detectedVisible, ...detectedExact].some(
    (item) =>
      item.key === 'percentage-versus-placebo' || item.key === 'percentage-points-versus-placebo',
  )
  const keepDetected = (item: PublicMedicineContextItem): boolean =>
    !hasContextualPercentage || item.key !== 'percentage'
  const detectedPrimary = detectedVisible.filter(keepDetected)
  const detectedExpansion = detectedExact.filter(
    (item) => keepDetected(item) && !detectedPrimary.some((primary) => primary.key === item.key),
  )
  return dedupePublicMedicineContextItems([...detectedPrimary, ...detectedExpansion, ...dynamic])
}

/**
 * Builds the legacy first read from separate stored fields. The measured finding is used verbatim
 * only when a complete sentence fits; the denser medicine-wide verdict remains available as exact
 * wording under expansion.
 */
export function buildLegacyReaderSummary(input: LegacyReaderSummaryInput): ReaderSummaryView {
  const selectedUse = cleanText(input.selectedUse)
  const measuredFinding = cleanText(input.measuredFinding)
  const safeFinding = safeStoredReaderSentence(measuredFinding)
  const mainUncertainty = cleanText(input.mainUncertainty)
  const exactText = cleanText(input.exactText)
  const missingResult = measuredFinding
    ? 'A measured result is recorded, but a short plain-language version is not available yet.'
    : 'A measured result is not recorded here.'
  const shortPurpose = safeStoredPurpose(selectedUse)
  const purposeLead = shortPurpose
    ? `This page covers one use of ${input.medicineName}: ${withoutTerminalPunctuation(shortPurpose)}.`
    : undefined
  const takeaway = safeFinding ?? (purposeLead ? `${purposeLead} ${missingResult}` : missingResult)
  const contextItems = [
    storedContextItem('What this page covers', selectedUse),
    storedContextItem('What was measured', measuredFinding),
    storedContextItem('What remains uncertain', mainUncertainty),
  ].flatMap((item) => item ?? [])

  return {
    basis: 'older_record',
    takeaway,
    ...(exactText ? { exactText } : {}),
    simplified: Boolean(safeFinding),
    contextItems,
    terms: summaryTerms(input, [takeaway, ...contextItems.map((item) => item.text)], exactText),
  }
}

/** Uses only the reviewed programme summary fields; it does not parse or reinterpret claims. */
export function buildPublishedProgrammeReaderSummary(
  input: PublishedProgrammeReaderSummaryInput,
): ReaderSummaryView {
  const exactText = cleanText(input.exactText) ?? ''
  const bestSupportedFinding = cleanText(input.bestSupportedFinding)
  const safeFinding = safeStoredReaderSentence(bestSupportedFinding)
  const safeExactText = safeStoredReaderSentence(exactText)
  const contextItems = [
    storedContextItem('What this page covers', input.selectedUse),
    storedContextItem('How it is meant to work', input.plainMechanism),
    storedContextItem('Best-supported finding', bestSupportedFinding),
    storedContextItem('What remains uncertain', input.mainUncertainty),
  ].flatMap((item) => item ?? [])
  const unavailable = 'A short plain-language result is not available yet.'
  const purpose = safeStoredPurpose(cleanText(input.selectedUse))
  const purposeLead = purpose
    ? `This page covers one use of ${input.medicineName}: ${withoutTerminalPunctuation(purpose)}.`
    : undefined
  const takeaway =
    safeFinding ?? safeExactText ?? (purposeLead ? `${purposeLead} ${unavailable}` : unavailable)

  return {
    basis: 'published_programme',
    takeaway,
    exactText,
    simplified: Boolean(safeFinding || (safeExactText && contextItems.length > 1)),
    contextItems,
    terms: summaryTerms(input, [takeaway, ...contextItems.map((item) => item.text)], exactText),
  }
}

/** Explicit empty state for an identified programme that has no reviewed public conclusion. */
export function buildUnpublishedProgrammeReaderSummary(
  context: ReaderMedicineLanguageContext & { selectedUse?: string },
): ReaderSummaryView {
  const takeaway = 'No reviewed plain-language answer has been published for this use.'
  const contextItems = [storedContextItem('What this page covers', context.selectedUse)].flatMap(
    (item) => item ?? [],
  )
  return {
    basis: 'unpublished_programme',
    takeaway,
    simplified: false,
    contextItems,
    terms: summaryTerms(context, [takeaway, ...contextItems.map((item) => item.text)]),
  }
}

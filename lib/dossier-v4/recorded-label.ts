/**
 * The label record, as sentences the page can show.
 *
 * The corpus holds a `medicine-background/v1` envelope for 9,855 of 9,859 medicines, and every
 * value in it was read out of a source sentence and stored beside that sentence. 1,874 of those
 * records carry a mechanism and 3,078 carry a recorded use — and the medicine page rendered none of
 * them. It read the curated `drugs` columns, which are populated for a few hundred flagship
 * records, and showed an absence for everything else.
 *
 * That was the single largest cause of empty pages, and it was not a retrieval failure: the text had
 * already been fetched, parsed and stored. It was a rendering gap.
 *
 * Everything this module returns is `textAsRecorded` — the printed sentence, unaltered, carrying the
 * identifier of the document it was printed in. Nothing is summarized, rewritten or composed. The
 * statements enter the page with the `stored_source` origin, which is the page's existing label for
 * "copied from a source RNAWiki stored, with the source named", so a reader can tell a quoted label
 * sentence from a sentence a person wrote.
 */
import type { SourceCitation } from '@/lib/dossier-v3/fields'
import type { BackgroundSource, MedicineRecordedBackground } from '@/lib/background/types'
import { resolveRecordedSourceLocator, resolveSafeSourceLocator } from '@/lib/source-locator'

export interface LabelSentence {
  text: string
  /** The document the sentence was printed in, for the page's own citation list. */
  citation: SourceCitation
}

/** How a source kind is named to a reader. Raw enum values never reach the page. */
const SOURCE_LABELS: Record<string, string> = {
  FDA_LABEL: 'US prescribing information',
  DAILYMED: 'DailyMed label',
  EMA_SMPC: 'EMA product information',
  PUBMED: 'Peer-reviewed publication',
  CLINICALTRIALS: 'ClinicalTrials.gov record',
  PUBCHEM: 'PubChem record',
  RXNORM: 'RxNorm record',
  FDA_DRUGSFDA: 'Drugs@FDA application register',
  FDA_UNII: 'FDA substance registry',
  FDA_NDC: 'FDA National Drug Code directory',
  NCBI_TAXONOMY: 'NCBI Taxonomy',
  DSLD: 'NIH Dietary Supplement Label Database',
}

function citationFor(source: BackgroundSource): SourceCitation {
  const kind = String((source as { kind?: string }).kind ?? '')
  const identifier = String((source as { identifier?: string }).identifier ?? '')
  const retrievedAt = (source as { retrievedAt?: string }).retrievedAt
  const url =
    resolveRecordedSourceLocator(kind, identifier)?.href ??
    (source.locator ? resolveSafeSourceLocator(source.locator)?.href : null)
  return {
    label: SOURCE_LABELS[kind] ?? 'Recorded source',
    ...(identifier ? { id: identifier } : {}),
    ...(url ? { url } : {}),
    ...(retrievedAt ? { date: retrievedAt } : {}),
    binding: 'record',
  }
}

function sentencesFrom(
  statements: ReadonlyArray<{ textAsRecorded: string; source: BackgroundSource }> | undefined,
  limit: number,
): LabelSentence[] {
  if (!statements) return []
  const seen = new Set<string>()
  const out: LabelSentence[] = []
  for (const statement of statements) {
    const text = statement.textAsRecorded.trim()
    // A label repeats itself across sections and across the products it covers.
    if (!text || seen.has(text)) continue
    seen.add(text)
    out.push({ text, citation: citationFor(statement.source) })
    if (out.length >= limit) break
  }
  return out
}

export interface RecordedLabel {
  /** What the label says the medicine is for. */
  uses: LabelSentence[]
  /** What the label says it does. */
  mechanism: LabelSentence[]
  /** Named molecular targets the label printed, indexed out of the mechanism sentences. */
  targets: string[]
  /** What the label warns about. */
  safety: LabelSentence[]
  /** What the label records about exposure over time. */
  pharmacokinetics: LabelSentence[]
  /** Reactions the label lists as common. */
  adverseReactions: LabelSentence[]
  /** Interactions the label names. */
  interactions: LabelSentence[]
  /** The boxed warning, where the label carries one. */
  boxedWarning: LabelSentence | null
  /** True when the record carries nothing at all. */
  empty: boolean
}

export const EMPTY_RECORDED_LABEL: RecordedLabel = {
  uses: [],
  mechanism: [],
  targets: [],
  safety: [],
  pharmacokinetics: [],
  adverseReactions: [],
  interactions: [],
  boxedWarning: null,
  empty: true,
}

type Envelope = MedicineRecordedBackground & Record<string, unknown>

function statementsOf(
  envelope: Envelope,
  module: string,
): Array<{
  textAsRecorded: string
  source: BackgroundSource
}> {
  const value = envelope[module] as
    { statements?: Array<{ textAsRecorded: string; source: BackgroundSource }> } | undefined
  return value?.statements ?? []
}

/**
 * Project the stored envelope into sentences the page renders.
 *
 * Caps are per module and deliberately small. A label's clinical-pharmacology section can run to
 * forty sentences, and printing all of them would bury the medicine rather than describe it; the
 * full record stays available in the technical disclosure at the foot of the page.
 */
export function recordedLabelFor(
  background: MedicineRecordedBackground | null | undefined,
): RecordedLabel {
  if (!background) return EMPTY_RECORDED_LABEL
  const envelope = background as Envelope

  const mechanism = sentencesFrom(statementsOf(envelope, 'mechanism'), 4)
  const rawTargets = (envelope['mechanism'] as { namedTargetsAsRecorded?: string[] } | undefined)
    ?.namedTargetsAsRecorded
  const label: RecordedLabel = {
    uses: sentencesFrom(statementsOf(envelope, 'recordedUses'), 3),
    mechanism,
    targets: rawTargets ?? [],
    safety: sentencesFrom(statementsOf(envelope, 'safety'), 4),
    pharmacokinetics: sentencesFrom(statementsOf(envelope, 'pharmacokinetics'), 4),
    adverseReactions: sentencesFrom(statementsOf(envelope, 'commonAdverseReactions'), 4),
    interactions: sentencesFrom(statementsOf(envelope, 'interactionSignals'), 4),
    boxedWarning: null,
    empty: false,
  }

  const boxed = (
    envelope['safety'] as
      { boxedWarning?: { textAsRecorded: string; source: BackgroundSource } } | undefined
  )?.boxedWarning
  if (boxed?.textAsRecorded) {
    label.boxedWarning = {
      text: boxed.textAsRecorded.trim(),
      citation: citationFor(boxed.source),
    }
  }

  label.empty =
    label.uses.length === 0 &&
    label.mechanism.length === 0 &&
    label.safety.length === 0 &&
    label.pharmacokinetics.length === 0 &&
    label.adverseReactions.length === 0 &&
    label.interactions.length === 0 &&
    label.boxedWarning === null

  return label
}

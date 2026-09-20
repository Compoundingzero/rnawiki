/**
 * A research candidate is not a published medicine statement. It preserves the exact source and
 * scope needed for a person to turn a useful excerpt into one short, defensible reader sentence.
 * Importers may leave fields empty; the assessment reports those gaps instead of filling them.
 */

export interface ResearchSource {
  id: string
  kind: 'FDA_SPL' | 'CLINICALTRIALS_GOV' | 'PRIMARY_PUBLICATION' | 'OTHER_PRIMARY'
  url: string
  title: string
  documentId: string
  version: string | null
  checkedAt: string
  /** Structured field path, label section, paper table, or other precise source location. */
  locator: string
  /** One verbatim passage or field value, not a stitched or paraphrased summary. */
  excerpt: string
}

export interface BoundField {
  value: string | null
  sourceId: string | null
  /** Exact words supporting this field, copied from that source's excerpt. */
  quote: string | null
}

export interface DraftSentence {
  text: string
  sourceId: string
  quote: string
  /** A first-read sentence has a shorter plain-language contract than technical detail. */
  layer: 'first_read' | 'detail'
}

interface BaseDraft {
  schemaVersion: 1
  status: 'DRAFT'
  subjectSlug: string
  subjectName: string
  sources: ResearchSource[]
  sentences: DraftSentence[]
}

export interface ProductLabelDraft extends BaseDraft {
  kind: 'product_label'
  jurisdiction: 'US'
  productSetId: string | null
  productName: BoundField
  activeIngredient: BoundField
  dosageForm: BoundField
  route: BoundField
  section:
    | 'indications_and_usage'
    | 'boxed_warning'
    | 'contraindications'
    | 'warnings_and_cautions'
    | 'drug_interactions'
    | 'use_in_specific_populations'
    | 'mechanism_of_action'
    | 'pharmacokinetics'
    | 'overdosage'
  /** A label is about this product. Never silently rewrite it as a whole-ingredient finding. */
  claimScope: 'this_product_only'
}

export interface TrialResultDraft extends BaseDraft {
  kind: 'trial_result'
  trialId: BoundField
  condition: BoundField
  intervention: BoundField
  dosageFormAndRoute: BoundField
  population: BoundField
  comparator: BoundField
  outcome: BoundField
  timepoint: BoundField
  result: BoundField
  uncertainty: BoundField
  /** A completed study result, not a registration or a medicine-wide verdict. */
  claimScope: 'this_study_only'
}

export type ResearchDraft = ProductLabelDraft | TrialResultDraft

export type DraftIssueCode =
  | 'missing_field'
  | 'missing_source'
  | 'unsafe_source_url'
  | 'source_record_mismatch'
  | 'quote_not_in_source'
  | 'unscoped_label'
  | 'unscoped_trial'
  | 'invalid_trial_id'
  | 'first_read_too_long'
  | 'no_reader_sentence'

export interface DraftIssue {
  code: DraftIssueCode
  field: string
  message: string
}

function normalized(value: string): string {
  return value.replace(/\s+/g, ' ').trim().toLowerCase()
}

function safeSourceUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && Boolean(url.hostname)
  } catch {
    return false
  }
}

/** Checks source binding and missing scope, not whether a medical interpretation is correct. */
export function assessResearchDraft(draft: ResearchDraft): DraftIssue[] {
  const issues: DraftIssue[] = []
  const sourceById = new Map(draft.sources.map((source) => [source.id, source]))
  const add = (code: DraftIssueCode, field: string, message: string): void => {
    issues.push({ code, field, message })
  }

  for (const [index, source] of draft.sources.entries()) {
    const field = `sources.${index}`
    if (!source.id || !source.documentId || !source.title || !source.locator || !source.excerpt) {
      add(
        'missing_source',
        field,
        'The source needs an identifier, title, locator and verbatim excerpt.',
      )
    }
    if (!safeSourceUrl(source.url)) {
      add('unsafe_source_url', `${field}.url`, 'Use a direct HTTPS source locator.')
    }
  }

  const checkField = (field: string, bound: BoundField): void => {
    if (!bound.value?.trim() || !bound.sourceId || !bound.quote?.trim()) {
      add('missing_field', field, 'The value, source ID and exact supporting words are required.')
      return
    }
    const source = sourceById.get(bound.sourceId)
    if (!source) {
      add('missing_source', field, 'The cited source is not in this draft.')
    } else if (!normalized(source.excerpt).includes(normalized(bound.quote))) {
      add('quote_not_in_source', field, 'The supporting words do not occur in the stored excerpt.')
    }
  }

  if (draft.kind === 'product_label') {
    if (draft.claimScope !== 'this_product_only' || !draft.productSetId?.trim()) {
      add('unscoped_label', 'productSetId', 'Bind the label to one product set ID.')
    }
    for (const field of ['productName', 'activeIngredient', 'dosageForm', 'route'] as const) {
      checkField(field, draft[field])
    }
    for (const [index, source] of draft.sources.entries()) {
      if (source.kind !== 'FDA_SPL' || source.documentId !== draft.productSetId) {
        add(
          'source_record_mismatch',
          `sources.${index}`,
          'The product label source must have the same SPL set ID as the draft.',
        )
      }
    }
  } else {
    if (draft.claimScope !== 'this_study_only') {
      add('unscoped_trial', 'claimScope', 'Keep the result scoped to this one study.')
    }
    for (const field of [
      'trialId',
      'condition',
      'intervention',
      'dosageFormAndRoute',
      'population',
      'comparator',
      'outcome',
      'timepoint',
      'result',
      'uncertainty',
    ] as const) {
      checkField(field, draft[field])
    }
    if (!/^NCT\d{8}$/i.test(draft.trialId.value?.trim() ?? '')) {
      add('invalid_trial_id', 'trialId', 'Use the exact NCT identifier of the tested study.')
    }
    for (const [index, source] of draft.sources.entries()) {
      if (
        source.kind === 'CLINICALTRIALS_GOV' &&
        source.documentId.toUpperCase() !== draft.trialId.value?.trim().toUpperCase()
      ) {
        add(
          'source_record_mismatch',
          `sources.${index}`,
          'The registry source must identify the same NCT study as the draft.',
        )
      }
    }
    const contextFields = [
      draft.trialId,
      draft.condition,
      draft.intervention,
      draft.dosageFormAndRoute,
      draft.population,
      draft.comparator,
      draft.outcome,
      draft.timepoint,
      draft.result,
    ]
    const contextRecords = new Set(
      contextFields
        .map((field) => sourceById.get(field.sourceId ?? ''))
        .filter((source): source is ResearchSource => Boolean(source))
        .map((source) => `${source.kind}:${source.documentId}`),
    )
    if (contextRecords.size > 1) {
      add(
        'source_record_mismatch',
        'trialContext',
        'The result and study context come from different records and need manual reconciliation.',
      )
    }
  }

  if (draft.sentences.length === 0) {
    add('no_reader_sentence', 'sentences', 'No beginner-facing sentence has been drafted yet.')
  }
  for (const [index, sentence] of draft.sentences.entries()) {
    const field = `sentences.${index}`
    const source = sourceById.get(sentence.sourceId)
    if (!sentence.text.trim() || !sentence.quote.trim() || !source) {
      add('missing_source', field, 'Each proposed sentence needs its own exact source passage.')
      continue
    }
    if (!normalized(source.excerpt).includes(normalized(sentence.quote))) {
      add('quote_not_in_source', field, 'The sentence quote is not in its cited source.')
    }
    if (sentence.layer === 'first_read' && sentence.text.trim().split(/\s+/).length > 30) {
      add('first_read_too_long', field, 'Split this first-read sentence into shorter ideas.')
    }
  }

  return issues
}

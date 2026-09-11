/**
 * The Decision Card fields and the shape every one of them resolves to.
 *
 * Every field on the card carries an explicit completion state (docs/dossier-information-
 * architecture.md, "No silent blank"). A field is never rendered from a raw pipeline value: it is
 * either filled by a reviewed claim, filled by a sourced regulatory or identity fact that names its
 * source, or shown in its absence state with the sentence that says why.
 */
import type { CompletionState, EvidenceClass } from './taxonomy'

export const DECISION_CARD_FIELDS = [
  { code: 'what_it_is', label: 'What it is', requiredForIndex: true },
  { code: 'why_people_use_it', label: 'Why people use it', requiredForIndex: true },
  { code: 'best_supported_result', label: 'Best-supported result', requiredForIndex: true },
  {
    code: 'most_important_common_problem',
    label: 'Most important common problem',
    requiredForIndex: true,
  },
  {
    code: 'most_important_serious_concern',
    label: 'Most important serious concern',
    requiredForIndex: false,
  },
  {
    code: 'biggest_unanswered_question',
    label: 'Biggest unanswered question',
    requiredForIndex: true,
  },
  { code: 'supervision_status', label: 'Supervision or regulatory status', requiredForIndex: true },
  { code: 'human_evidence_state', label: 'Human evidence', requiredForIndex: true },
  { code: 'last_evidence_check', label: 'Last evidence check', requiredForIndex: true },
] as const

export type DecisionCardField = (typeof DECISION_CARD_FIELDS)[number]['code']

export interface SourceCitation {
  label: string
  id?: string
  url?: string
  date?: string
  /** `snapshot` when the citation is an immutable source snapshot row; `record` when it is a
   * stored label + date string only (docs/rnawiki-biohacker-rebuild-audit.md, provenance finding). */
  binding: 'snapshot' | 'record'
}

export interface FieldValue {
  field: DecisionCardField
  label: string
  state: CompletionState
  /** The sentence a reader sees. Present in every state: an absence is a sentence too. */
  text: string
  /** True when `text` is a reviewed or sourced statement rather than an absence sentence. */
  filled: boolean
  evidenceClass?: EvidenceClass
  sources: SourceCitation[]
  /** What was searched, or why the field does not apply, in one sentence. */
  basis: string
  claimId?: string
}

export function fieldLabel(code: DecisionCardField): string {
  return DECISION_CARD_FIELDS.find((entry) => entry.code === code)?.label ?? code
}

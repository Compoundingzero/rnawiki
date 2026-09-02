import {
  DOSSIER_SECTION_IDS,
  isTerminalSectionState,
  type DossierCompletionStatus,
  type DossierSectionId,
  type SectionAssessment,
  type SectionState,
} from './types'

/**
 * Reader-facing labels for the completion contract. Raw state codes stay in the technical
 * disclosure; the main view uses these sentences. None of them turns an absence into a finding.
 */

export const SECTION_LABELS: Record<DossierSectionId, string> = {
  identity: 'What this record is',
  'regulatory-status': 'Regulatory and market status',
  'recorded-uses': 'What sources say it is used for',
  mechanism: 'How it is meant to work',
  pharmacokinetics: 'What the body does with it',
  'molecular-identity': 'Chemical identity',
  'safety-statements': 'Boxed warning and contraindications',
  'population-statements': 'Groups the sources address',
  'adverse-reactions': 'Most common adverse reactions',
  'interaction-signals': 'Enzyme and transporter handling',
  'product-variants': 'Marketed products and forms',
  'cost-context': 'Recorded acquisition cost',
  'source-consensus': 'Agreement between source documents',
  'biological-identity': 'Organism identity',
  'supplement-market': 'Supplement label listings',
  'trial-registry': 'Registered clinical trials',
  'trial-results': 'Posted trial results',
  'trial-eligibility': 'Who the registered trials enrolled',
  'literature-search': 'Published clinical-trial reports',
  'reviewed-conclusion': 'Reviewed conclusion for one use',
}

export const SECTION_STATE_LABELS: Record<SectionState, string> = {
  EXACT_SOURCE_BACKED: 'Recorded from a saved source sentence',
  EXACT_STRUCTURED_SOURCE_DATA: 'Recorded as structured source data',
  REVIEWED_INTERPRETATION: 'Reviewed and published',
  SOURCE_STATED_NOT_ESTABLISHED: 'A source states this was not established',
  NO_QUALIFYING_EVIDENCE_AFTER_SEARCH: 'Searched; no qualifying record found',
  RESULTS_NOT_POSTED: 'Registered; results not posted',
  NOT_MEASURED: 'Not measured in the recorded sources',
  NOT_APPLICABLE: 'Does not apply to this kind of record',
  SOURCE_CONFLICT: 'Sources differ',
  SOURCE_UNAVAILABLE: 'Source could not be reached',
  UNASSESSED: 'Not yet assessed',
  SEARCH_PENDING: 'Search scheduled; not yet run',
  PARSER_FAILED: 'Source read failed',
  IDENTITY_UNRESOLVED: 'Identity not yet resolved',
  ATTRIBUTION_UNRESOLVED: 'Attribution not yet resolved',
  BLOCKED_HUMAN_REVIEW: 'Waiting for a person to review',
}

/** Short, neutral explanation shown once at the top of the completeness section. */
export const COMPLETION_STATUS_COPY: Record<DossierCompletionStatus, string> = {
  COMPLETE:
    'Every section that applies to this record has an explicit state. A state such as "searched; no qualifying record found" describes the sources RNAWiki read, never the medicine.',
  INCOMPLETE:
    'At least one section that applies to this record has not reached an explicit state yet. Those sections are listed with what still has to happen.',
}

export interface DossierCompletionSectionView {
  id: DossierSectionId
  label: string
  state: SectionState
  stateLabel: string
  terminal: boolean
  basisKind: SectionAssessment['basisKind']
  basis: string
  sourceRefs: SectionAssessment['sourceRefs']
  counts?: Record<string, number>
  humanReadSuggested: boolean
  blockedReason?: string
}

export interface DossierCompletionAssessmentView {
  status: DossierCompletionStatus
  statusCopy: string
  resolverVersion: string
  inputDigest: string
  /** ISO date of the last input change, which is the page's public content date. */
  contentChangedAt: string
  assessedAt: string
  applicableSectionCount: number
  terminalSectionCount: number
  sections: DossierCompletionSectionView[]
}

export interface StoredDossierCompletionAssessment {
  resolverVersion: string
  status: DossierCompletionStatus
  inputDigest: string
  sections: SectionAssessment[]
  applicableSectionCount: number
  terminalSectionCount: number
  contentChangedAt: Date | string
  assessedAt: Date | string
}

function isoDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}

const SECTION_ORDER = new Map(DOSSIER_SECTION_IDS.map((id, index) => [id, index] as const))

export function dossierCompletionAssessmentView(
  stored: StoredDossierCompletionAssessment,
): DossierCompletionAssessmentView {
  const sections = [...stored.sections]
    .sort(
      (left, right) =>
        (SECTION_ORDER.get(left.sectionId) ?? 999) - (SECTION_ORDER.get(right.sectionId) ?? 999),
    )
    .map(
      (section): DossierCompletionSectionView => ({
        id: section.sectionId,
        label: SECTION_LABELS[section.sectionId],
        state: section.state,
        stateLabel: SECTION_STATE_LABELS[section.state],
        terminal: isTerminalSectionState(section.state),
        basisKind: section.basisKind,
        basis: section.basis,
        sourceRefs: section.sourceRefs,
        counts: section.counts,
        humanReadSuggested: section.humanReadSuggested === true,
        blockedReason: section.blockedReason,
      }),
    )
  return {
    status: stored.status,
    statusCopy: COMPLETION_STATUS_COPY[stored.status],
    resolverVersion: stored.resolverVersion,
    inputDigest: stored.inputDigest,
    contentChangedAt: isoDate(stored.contentChangedAt),
    assessedAt: isoDate(stored.assessedAt),
    applicableSectionCount: stored.applicableSectionCount,
    terminalSectionCount: stored.terminalSectionCount,
    sections,
  }
}

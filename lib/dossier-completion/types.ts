/**
 * The dossier-completion contract.
 *
 * A dossier is complete when every section that applies to its entity class resolves to one
 * terminal state. Terminal states are the ten honest outcomes a source-bound record can reach; a
 * non-terminal state is visible on the page but keeps the dossier incomplete. Nothing here ever
 * fills a section with content: the resolver only reads what is stored, what the local archives
 * hold, and what a dated registry search returned, and it records which of those it found.
 *
 * "Complete" therefore never means "every field holds a positive clinical fact". A record whose
 * sections are all `NOT_APPLICABLE`, `NO_QUALIFYING_EVIDENCE_AFTER_SEARCH` and
 * `EXACT_STRUCTURED_SOURCE_DATA` is complete, and it is honest.
 */

export const DOSSIER_COMPLETION_RESOLVER_VERSION = 'dossier-completion/v1' as const

/** The ten terminal outcomes, in the order the mission defines them. */
export const TERMINAL_SECTION_STATES = [
  'EXACT_SOURCE_BACKED',
  'EXACT_STRUCTURED_SOURCE_DATA',
  'REVIEWED_INTERPRETATION',
  'SOURCE_STATED_NOT_ESTABLISHED',
  'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
  'RESULTS_NOT_POSTED',
  'NOT_MEASURED',
  'NOT_APPLICABLE',
  'SOURCE_CONFLICT',
  'SOURCE_UNAVAILABLE',
] as const
export type TerminalSectionState = (typeof TERMINAL_SECTION_STATES)[number]

/** States that keep a dossier incomplete. Each is shown, never hidden. */
export const NON_TERMINAL_SECTION_STATES = [
  'UNASSESSED',
  'SEARCH_PENDING',
  'PARSER_FAILED',
  'IDENTITY_UNRESOLVED',
  'ATTRIBUTION_UNRESOLVED',
  'BLOCKED_HUMAN_REVIEW',
] as const
export type NonTerminalSectionState = (typeof NON_TERMINAL_SECTION_STATES)[number]

export const SECTION_STATES = [...TERMINAL_SECTION_STATES, ...NON_TERMINAL_SECTION_STATES] as const
export type SectionState = (typeof SECTION_STATES)[number]

export function isTerminalSectionState(state: SectionState): state is TerminalSectionState {
  return (TERMINAL_SECTION_STATES as readonly string[]).includes(state)
}

/** Every dossier section the resolver assesses, in reading order. */
export const DOSSIER_SECTION_IDS = [
  'identity',
  'regulatory-status',
  'recorded-uses',
  'mechanism',
  'pharmacokinetics',
  'molecular-identity',
  'safety-statements',
  'population-statements',
  'adverse-reactions',
  'interaction-signals',
  'product-variants',
  'cost-context',
  'source-consensus',
  'biological-identity',
  'supplement-market',
  'trial-registry',
  'trial-results',
  'trial-eligibility',
  'literature-search',
  'reviewed-conclusion',
] as const
export type DossierSectionId = (typeof DOSSIER_SECTION_IDS)[number]

/**
 * What the state rests on. The kind names the exact evidence route so a reader can reproduce the
 * decision; the free fields carry the identifiers needed to do so.
 */
export const SECTION_BASIS_KINDS = [
  'RECORDED_MODULE',
  'RECORDED_MODULE_ON_DUPLICATE_RECORD',
  'LEGACY_RECORD_FIELD',
  'REGISTRY_IDENTIFIER',
  'LABEL_ARCHIVE_SEARCH',
  'LABEL_SECTION_READ_NO_QUALIFYING_STATEMENT',
  'SUPPLEMENT_DATABASE_RECORD',
  'PRICING_FILE_SEARCH',
  'COMPOUND_DATABASE_SEARCH',
  'TAXONOMY_RECORD',
  'CLINICALTRIALS_SNAPSHOT_EXACT_MATCH',
  'CLINICALTRIALS_SNAPSHOT_NO_EXACT_MATCH',
  'PUBMED_SEARCH_RECORD',
  'PROGRAMME_PUBLICATION',
  'NO_PROGRAMME_DEFINED',
  'ENTITY_CLASS_RULE',
  'SOURCE_FETCH_HISTORY',
  'NOT_YET_RUN',
] as const
export type SectionBasisKind = (typeof SECTION_BASIS_KINDS)[number]

export interface SectionSourceRef {
  /** Source kind as recorded on the background envelope, or the search kind. */
  kind: string
  identifier: string
  label?: string
  /** ISO date the source or search result was retrieved, when recorded. */
  retrievedAt?: string
}

export interface SectionAssessment {
  sectionId: DossierSectionId
  state: SectionState
  basisKind: SectionBasisKind
  /** One ordinary-language sentence saying what was found or not found and where. */
  basis: string
  /** Exact identifiers behind the basis: label set ids, NCT ids, search records, module paths. */
  sourceRefs: SectionSourceRef[]
  /** Counts the basis rests on, e.g. labels read, exact registry matches, search hits. */
  counts?: Record<string, number>
  /** True when a person reading the named source could add something the parser did not. */
  humanReadSuggested?: boolean
  /** Present only for a non-terminal state: what must happen before the section can resolve. */
  blockedReason?: string
}

export const DOSSIER_COMPLETION_STATUSES = ['COMPLETE', 'INCOMPLETE'] as const
export type DossierCompletionStatus = (typeof DOSSIER_COMPLETION_STATUSES)[number]

export interface DossierCompletionAssessment {
  drugId: string
  canonicalSlug: string
  entityClass: string
  resolverVersion: typeof DOSSIER_COMPLETION_RESOLVER_VERSION
  /** SHA-256 over every input the resolver read for this record, so re-runs are comparable. */
  inputDigest: string
  status: DossierCompletionStatus
  sections: SectionAssessment[]
  applicableSectionCount: number
  terminalSectionCount: number
  /** Section ids still non-terminal, in reading order. Empty exactly when status is COMPLETE. */
  nonTerminalSectionIds: DossierSectionId[]
  /** Sections a person could improve by reading a named source. Never blocks completion. */
  humanReadSuggestedSectionIds: DossierSectionId[]
}

export interface DossierCompletionSummary {
  resolverVersion: typeof DOSSIER_COMPLETION_RESOLVER_VERSION
  assessedRecords: number
  complete: number
  incomplete: number
  byState: Record<SectionState, number>
  bySection: Record<DossierSectionId, Record<SectionState, number>>
  nonTerminalBySection: Record<DossierSectionId, number>
  humanReadSuggestedRecords: number
}

/**
 * Evidence reading units: the smallest thing this corpus can hand back as an answer.
 *
 * A dossier page is a document. A question is not asked of a document, it is asked of one recorded
 * reading — a half-life with its measurement context, a boxed warning sentence, a source-stated
 * "not established" for children, a dated registry search that returned nothing. The projector
 * below turns the stored envelope, the completion assessment and the recorded searches into those
 * units, one row each, and nothing else.
 *
 * Four rules hold everywhere in this file:
 *
 *  1. No unit text is written about a medicine. Text is either wording copied from a source
 *     (`textAsRecorded`, `excerpt`, the basis sentence the resolver already composed from stored
 *     counts) or a fixed template that joins stored fields under stated labels. Nothing is
 *     summarised, ranked or explained.
 *  2. An absence is a unit. A section that resolved to `NOT_APPLICABLE`,
 *     `NO_QUALIFYING_EVIDENCE_AFTER_SEARCH`, `RESULTS_NOT_POSTED` or `NOT_MEASURED` produces an
 *     `ABSENT` unit carrying the resolver's basis sentence, so a reader can be handed the recorded
 *     absence instead of an empty result set that looks like a lookup failure.
 *  3. A denial stays a denial. A population statement the source itself marks `NOT_ESTABLISHED`,
 *     and a section that resolved to `SOURCE_STATED_NOT_ESTABLISHED`, become `NEGATED` units. An
 *     enzyme or transporter role recorded with negated polarity does too.
 *  4. Every unit names its sources exactly. `sourceRefs` is the recorded source list for that one
 *     reading, in recorded order, so any returned unit can be taken back to the fetched artifact.
 *
 * The projector is pure: same inputs, same units, same ids. `id` is a SHA-256 over the identity of
 * the reading (which record, which section, which field path, which scopes, which text, which
 * sources). `contentDigest` covers the same payload plus the projector version, so a rendering
 * change moves the digest while the reading keeps a stable identity only when its content is
 * genuinely unchanged.
 */

import { createHash } from 'node:crypto'

import type { ReadingComparisonState } from '@/lib/background/reading-comparison'
import type {
  BackgroundSource,
  MedicineRecordedBackground,
  RecordedInteractionSignal,
  RecordedPopulationStatement,
  RecordedStatement,
  RecordedValue,
  StudiedPopulation,
} from '@/lib/background/types'
import {
  DOSSIER_SECTION_IDS,
  type DossierSectionId,
  type SectionAssessment,
  type SectionSourceRef,
} from '@/lib/dossier-completion/types'
import { stableJsonStringify } from '@/lib/stable-json'

export const SEMANTIC_PROJECTOR_VERSION = 'semantic-units/v1' as const

export const UNIT_KINDS = [
  'RECORDED_VALUE',
  'RECORDED_STATEMENT',
  'POPULATION_STATEMENT',
  'ADVERSE_REACTION_LIST',
  'CONSENSUS_READING',
  'SEARCH_RESULT',
  'SECTION_STATE',
] as const
export type UnitKind = (typeof UNIT_KINDS)[number]

/**
 * What the unit does to the question it answers.
 *
 * `ASSERTED` — a source states this reading. `NEGATED` — a source states the question was not
 * settled, or that a role does not apply. `ABSENT` — nothing qualifying was found, and the unit
 * records where that was looked for. The three are never folded together, in storage or in a
 * result set.
 */
export const UNIT_ASSERTIONS = ['ASSERTED', 'NEGATED', 'ABSENT'] as const
export type UnitAssertion = (typeof UNIT_ASSERTIONS)[number]

/** Completion states that mean the record holds no qualifying content for that section. */
export const ABSENCE_SECTION_STATES = [
  'NOT_APPLICABLE',
  'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH',
  'RESULTS_NOT_POSTED',
  'NOT_MEASURED',
] as const

export interface UnitSourceRef {
  kind: string
  identifier: string
  label?: string
  locator?: string
  retrievedAt?: string
}

export interface EvidenceReadingUnit {
  /** SHA-256 over the reading's identity payload. Stable across re-projection of equal content. */
  id: string
  drugId: string
  canonicalSlug: string
  unitKind: UnitKind
  assertion: UnitAssertion
  sectionId: DossierSectionId
  /** Path into the recorded envelope, the assessment, or the recorded search that produced it. */
  fieldPath: string
  /** One of the fixed population scopes, when the recorded context names exactly one. */
  populationScope: string | null
  /** One of the fixed formulation scopes, when the recorded context names exactly one. */
  formulationScope: string | null
  /** Source wording, or a fixed template over stored fields. Never composed medical prose. */
  text: string
  sourceRefs: UnitSourceRef[]
  comparisonState: ReadingComparisonState | null
  projectorVersion: typeof SEMANTIC_PROJECTOR_VERSION
  contentDigest: string
}

/* ------------------------------------------------------------------------------------------- */
/* Scope vocabularies                                                                            */
/* ------------------------------------------------------------------------------------------- */

/**
 * The population scopes a query may narrow to, and the words that name each one.
 *
 * A scope is assigned only when the recorded context names exactly one of them. Two scopes in one
 * sentence, or none, leaves the column null — an unscoped reading is never quietly filed under a
 * group it was not measured in.
 */
export const POPULATION_SCOPES = [
  'PEDIATRIC',
  'GERIATRIC',
  'PREGNANCY',
  'LACTATION',
  'HEPATIC_IMPAIRMENT',
  'RENAL_IMPAIRMENT',
] as const
export type PopulationScope = (typeof POPULATION_SCOPES)[number]

export const POPULATION_SCOPE_WORDS: Readonly<Record<PopulationScope, readonly string[]>> = {
  PEDIATRIC: ['pediatric', 'paediatric', 'children', 'child', 'infant', 'infants', 'neonate'],
  GERIATRIC: ['geriatric', 'elderly', 'older adults', 'older patients'],
  PREGNANCY: ['pregnancy', 'pregnant'],
  LACTATION: ['lactation', 'breastfeeding', 'nursing mothers', 'breast milk'],
  HEPATIC_IMPAIRMENT: ['hepatic impairment', 'liver impairment', 'hepatic'],
  RENAL_IMPAIRMENT: ['renal impairment', 'kidney impairment', 'renal', 'kidney'],
}

export const POPULATION_SCOPE_LABELS: Readonly<Record<PopulationScope, string>> = {
  PEDIATRIC: 'children',
  GERIATRIC: 'older adults',
  PREGNANCY: 'pregnancy',
  LACTATION: 'breastfeeding',
  HEPATIC_IMPAIRMENT: 'liver impairment',
  RENAL_IMPAIRMENT: 'kidney impairment',
}

export const FORMULATION_SCOPES = [
  'EXTENDED_RELEASE',
  'IMMEDIATE_RELEASE',
  'ORAL',
  'INTRAVENOUS',
  'SUBCUTANEOUS',
  'TOPICAL',
  'INHALATION',
  'OPHTHALMIC',
] as const
export type FormulationScope = (typeof FORMULATION_SCOPES)[number]

export const FORMULATION_SCOPE_WORDS: Readonly<Record<FormulationScope, readonly string[]>> = {
  EXTENDED_RELEASE: [
    'extended-release',
    'extended release',
    'modified release',
    'sustained release',
  ],
  IMMEDIATE_RELEASE: ['immediate-release', 'immediate release'],
  ORAL: ['oral', 'tablet', 'tablets', 'capsule', 'capsules', 'by mouth'],
  INTRAVENOUS: ['intravenous', 'infusion'],
  SUBCUTANEOUS: ['subcutaneous'],
  TOPICAL: ['topical', 'cream', 'ointment'],
  INHALATION: ['inhalation', 'inhaled', 'nebulised', 'nebulized'],
  OPHTHALMIC: ['ophthalmic', 'eye drops'],
}

export const FORMULATION_SCOPE_LABELS: Readonly<Record<FormulationScope, string>> = {
  EXTENDED_RELEASE: 'extended release',
  IMMEDIATE_RELEASE: 'immediate release',
  ORAL: 'oral',
  INTRAVENOUS: 'intravenous',
  SUBCUTANEOUS: 'subcutaneous',
  TOPICAL: 'topical',
  INHALATION: 'inhalation',
  OPHTHALMIC: 'ophthalmic',
}

function matchesWord(haystack: string, word: string): boolean {
  const index = haystack.indexOf(word)
  if (index < 0) return false
  const before = index === 0 ? ' ' : haystack[index - 1]!
  const after = index + word.length >= haystack.length ? ' ' : haystack[index + word.length]!
  return !/[a-z0-9]/u.test(before) && !/[a-z0-9]/u.test(after)
}

function soleMatch<T extends string>(
  text: string | undefined,
  vocabulary: Readonly<Record<T, readonly string[]>>,
  order: readonly T[],
): T | null {
  if (!text) return null
  const haystack = text.toLowerCase()
  const hits = order.filter((scope) =>
    vocabulary[scope].some((word) => matchesWord(haystack, word)),
  )
  return hits.length === 1 ? hits[0]! : null
}

/** The population scope a recorded context names, or null when it names none or several. */
export function populationScopeOf(text: string | undefined): PopulationScope | null {
  return soleMatch(text, POPULATION_SCOPE_WORDS, POPULATION_SCOPES)
}

/** The formulation scope a recorded context names, or null when it names none or several. */
export function formulationScopeOf(text: string | undefined): FormulationScope | null {
  return soleMatch(text, FORMULATION_SCOPE_WORDS, FORMULATION_SCOPES)
}

/* ------------------------------------------------------------------------------------------- */
/* Labels                                                                                       */
/* ------------------------------------------------------------------------------------------- */

export const SECTION_LABELS: Readonly<Record<DossierSectionId, string>> = {
  identity: 'identity',
  'regulatory-status': 'regulatory status',
  'recorded-uses': 'recorded uses',
  mechanism: 'how it acts',
  pharmacokinetics: 'pharmacokinetics',
  'molecular-identity': 'molecular identity',
  'safety-statements': 'safety statements',
  'population-statements': 'population statements',
  'adverse-reactions': 'adverse reactions',
  'interaction-signals': 'enzyme and transporter signals',
  'product-variants': 'product variants',
  'cost-context': 'cost context',
  'source-consensus': 'source agreement',
  'biological-identity': 'biological identity',
  'supplement-market': 'supplement market',
  'trial-registry': 'registered trials',
  'trial-results': 'posted trial results',
  'trial-eligibility': 'trial eligibility',
  'literature-search': 'published literature',
  'reviewed-conclusion': 'reviewed conclusion',
}

/** Ordinary-language name for each projected field path, used in unit text and in query templates. */
export const FIELD_LABELS: Readonly<Record<string, string>> = {
  'pharmacokinetics.halfLife': 'elimination half-life',
  'pharmacokinetics.bioavailability': 'bioavailability',
  'pharmacokinetics.tMax': 'time to maximum concentration',
  'pharmacokinetics.proteinBinding': 'plasma protein binding',
  'pharmacokinetics.volumeOfDistribution': 'volume of distribution',
  'pharmacokinetics.metabolismAsRecorded': 'metabolism',
  'pharmacokinetics.eliminationAsRecorded': 'elimination route',
  'molecularIdentity.molecularFormula': 'molecular formula',
  'molecularIdentity.molecularWeight': 'molecular weight',
  'mechanism.statements': 'how it acts',
  'recordedUses.statements': 'recorded use',
  'safety.boxedWarning': 'boxed warning',
  'safety.contraindications': 'contraindication',
  interactionSignals: 'enzyme and transporter signal',
  populationStatements: 'population statement',
  commonAdverseReactions: 'most common adverse reactions',
  sourceConsensus: 'source agreement',
}

const POPULATION_STATE_LABELS: Readonly<Record<string, string>> = {
  STUDIED: 'studied',
  NOT_ESTABLISHED: 'not established',
  STATEMENT_ONLY: 'discussed without a finding',
}

/* ------------------------------------------------------------------------------------------- */
/* Rendering                                                                                    */
/* ------------------------------------------------------------------------------------------- */

function lines(...parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => (typeof part === 'string' ? part.trim() : ''))
    .filter((part) => part.length > 0)
    .join('\n')
}

function sourceRef(source: BackgroundSource): UnitSourceRef {
  const ref: UnitSourceRef = { kind: source.kind, identifier: source.identifier }
  if (source.label) ref.label = source.label
  if (source.locator) ref.locator = source.locator
  if (source.retrievedAt) ref.retrievedAt = source.retrievedAt
  return ref
}

function assessmentRef(ref: SectionSourceRef): UnitSourceRef {
  const out: UnitSourceRef = { kind: ref.kind, identifier: ref.identifier }
  if (ref.label) out.label = ref.label
  if (ref.retrievedAt) out.retrievedAt = ref.retrievedAt
  return out
}

interface DraftUnit {
  unitKind: UnitKind
  assertion: UnitAssertion
  sectionId: DossierSectionId
  fieldPath: string
  populationScope: string | null
  formulationScope: string | null
  text: string
  sourceRefs: UnitSourceRef[]
  comparisonState: ReadingComparisonState | null
}

function digestOf(payload: unknown): string {
  return createHash('sha256').update(stableJsonStringify(payload)).digest('hex')
}

function finalize(drug: ProjectorDrugInput, draft: DraftUnit): EvidenceReadingUnit {
  const identity = {
    drugId: drug.id,
    canonicalSlug: drug.canonicalSlug,
    unitKind: draft.unitKind,
    assertion: draft.assertion,
    sectionId: draft.sectionId,
    fieldPath: draft.fieldPath,
    populationScope: draft.populationScope,
    formulationScope: draft.formulationScope,
    text: draft.text,
    sourceRefs: draft.sourceRefs,
    comparisonState: draft.comparisonState,
  }
  return {
    id: digestOf(identity),
    ...identity,
    projectorVersion: SEMANTIC_PROJECTOR_VERSION,
    contentDigest: digestOf({ ...identity, projectorVersion: SEMANTIC_PROJECTOR_VERSION }),
  }
}

/* ------------------------------------------------------------------------------------------- */
/* Input                                                                                        */
/* ------------------------------------------------------------------------------------------- */

export interface ProjectorDrugInput {
  id: string
  canonicalSlug: string
  name: string
  recordedBackground: MedicineRecordedBackground | null
}

export interface ProjectorSearchInput {
  searchKind: string
  sourceIdentifier: string
  query: string
  /** ISO timestamp the search was made. */
  requestedAt: string
  status: 'SUCCEEDED' | 'UNREACHABLE' | 'FAILED'
  resultCount: number | null
  matched: unknown[]
  error: string | null
}

export interface UnitProjectionInput {
  drug: ProjectorDrugInput
  /** The stored completion assessment for this record, when one has been written. */
  sections: SectionAssessment[]
  searches: ProjectorSearchInput[]
}

/** Which section a recorded search belongs to. Anything else is filed under the literature search. */
const SEARCH_SECTIONS: Readonly<Record<string, DossierSectionId>> = {
  CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION: 'trial-registry',
  PUBMED_ESEARCH_CLINICAL_TRIAL: 'literature-search',
}

export const SEARCH_LABELS: Readonly<Record<string, string>> = {
  CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION: 'registered trials',
  PUBMED_ESEARCH_CLINICAL_TRIAL: 'published clinical trial literature',
}

/* ------------------------------------------------------------------------------------------- */
/* The projector                                                                                */
/* ------------------------------------------------------------------------------------------- */

function valueDrafts(name: string, background: MedicineRecordedBackground): DraftUnit[] {
  const pk = background.pharmacokinetics
  const molecular = background.molecularIdentity
  const entries: Array<[DossierSectionId, string, RecordedValue | undefined]> = [
    ['pharmacokinetics', 'pharmacokinetics.halfLife', pk?.halfLife],
    ['pharmacokinetics', 'pharmacokinetics.bioavailability', pk?.bioavailability],
    ['pharmacokinetics', 'pharmacokinetics.tMax', pk?.tMax],
    ['pharmacokinetics', 'pharmacokinetics.proteinBinding', pk?.proteinBinding],
    ['pharmacokinetics', 'pharmacokinetics.volumeOfDistribution', pk?.volumeOfDistribution],
    ['pharmacokinetics', 'pharmacokinetics.metabolismAsRecorded', pk?.metabolismAsRecorded],
    ['pharmacokinetics', 'pharmacokinetics.eliminationAsRecorded', pk?.eliminationAsRecorded],
    ['molecular-identity', 'molecularIdentity.molecularFormula', molecular?.molecularFormula],
    ['molecular-identity', 'molecularIdentity.molecularWeight', molecular?.molecularWeight],
  ]
  const drafts: DraftUnit[] = []
  for (const [sectionId, fieldPath, value] of entries) {
    if (!value) continue
    const label = FIELD_LABELS[fieldPath] ?? fieldPath
    const context = [value.populationContext, pk?.routeAsRecorded].filter(Boolean).join(' · ')
    const refs = [sourceRef(value.source)]
    if (value.alternateValue) refs.push(sourceRef(value.alternateValue.source))
    drafts.push({
      unitKind: 'RECORDED_VALUE',
      assertion: 'ASSERTED',
      sectionId,
      fieldPath,
      populationScope: populationScopeOf(value.populationContext),
      formulationScope: formulationScopeOf(context),
      text: lines(
        `${name} — ${label}: ${value.display}`,
        value.populationContext ? `Measurement context: ${value.populationContext}` : undefined,
        value.source.excerpt,
        value.alternateValue
          ? `Second recorded reading: ${value.alternateValue.display}`
          : undefined,
      ),
      sourceRefs: refs,
      comparisonState: null,
    })
  }
  return drafts
}

function statementDraft(
  name: string,
  sectionId: DossierSectionId,
  fieldPath: string,
  statement: RecordedStatement,
): DraftUnit {
  const label = FIELD_LABELS[fieldPath.replace(/\[\d+\]$/u, '')] ?? fieldPath
  return {
    unitKind: 'RECORDED_STATEMENT',
    assertion: 'ASSERTED',
    sectionId,
    fieldPath,
    populationScope: populationScopeOf(statement.textAsRecorded),
    formulationScope: formulationScopeOf(statement.textAsRecorded),
    text: lines(`${name} — ${label}: ${statement.textAsRecorded}`),
    sourceRefs: [sourceRef(statement.source)],
    comparisonState: null,
  }
}

function interactionDraft(
  name: string,
  index: number,
  signal: RecordedInteractionSignal,
): DraftUnit {
  const parts = [signal.kind.toLowerCase()]
  if (signal.roleAsRecorded) parts.push(`role: ${signal.roleAsRecorded.toLowerCase()}`)
  if (signal.polarity) parts.push(`polarity: ${signal.polarity.toLowerCase()}`)
  return {
    unitKind: 'RECORDED_STATEMENT',
    assertion: signal.polarity === 'NEGATED' ? 'NEGATED' : 'ASSERTED',
    sectionId: 'interaction-signals',
    fieldPath: `interactionSignals[${index}]`,
    populationScope: null,
    formulationScope: null,
    text: lines(
      `${name} — enzyme and transporter signal: ${signal.counterpartyAsRecorded} (${parts.join('; ')})`,
      signal.source.excerpt,
    ),
    sourceRefs: [sourceRef(signal.source)],
    comparisonState: null,
  }
}

function populationDraft(
  name: string,
  index: number,
  statement: RecordedPopulationStatement,
): DraftUnit {
  const scope = statement.population as StudiedPopulation
  const label = POPULATION_SCOPE_LABELS[scope as PopulationScope] ?? scope.toLowerCase()
  const stateLabel = POPULATION_STATE_LABELS[statement.state] ?? statement.state
  return {
    unitKind: 'POPULATION_STATEMENT',
    assertion: statement.state === 'NOT_ESTABLISHED' ? 'NEGATED' : 'ASSERTED',
    sectionId: 'population-statements',
    fieldPath: `populationStatements[${index}]`,
    populationScope: scope,
    formulationScope: formulationScopeOf(statement.textAsRecorded),
    text: lines(
      `${name} — population statement for ${label}: ${statement.textAsRecorded}`,
      `Recorded evidence state: ${stateLabel}`,
    ),
    sourceRefs: [sourceRef(statement.source)],
    comparisonState: null,
  }
}

function consensusDrafts(name: string, background: MedicineRecordedBackground): DraftUnit[] {
  const consensus = background.sourceConsensus
  if (!consensus) return []
  const drafts: DraftUnit[] = []
  for (const [fieldIndex, field] of consensus.fields.entries()) {
    for (const [readingIndex, reading] of field.readings.entries()) {
      drafts.push({
        unitKind: 'CONSENSUS_READING',
        assertion: 'ASSERTED',
        sectionId: 'source-consensus',
        fieldPath: `sourceConsensus.fields[${fieldIndex}].readings[${readingIndex}]`,
        populationScope: populationScopeOf(reading.populationContext),
        formulationScope: formulationScopeOf(reading.populationContext),
        text: lines(
          `${name} — source agreement on ${field.field}: ${reading.display}`,
          `Stated by ${reading.sourceCount} of ${field.sourceCount} recorded source(s).`,
          reading.populationContext
            ? `Measurement context: ${reading.populationContext}`
            : undefined,
        ),
        sourceRefs: reading.sources.map(sourceRef),
        comparisonState: field.comparisonState ?? null,
      })
    }
  }
  return drafts
}

function searchDraft(name: string, search: ProjectorSearchInput): DraftUnit {
  const sectionId = SEARCH_SECTIONS[search.searchKind] ?? 'literature-search'
  const label = SEARCH_LABELS[search.searchKind] ?? search.searchKind
  const outcome =
    search.status === 'SUCCEEDED'
      ? `${search.resultCount ?? 0} exact match(es)`
      : `search ${search.status.toLowerCase()}`
  const matched = search.matched
    .map((entry) => (typeof entry === 'string' ? entry : stableJsonStringify(entry)))
    .slice(0, 20)
  return {
    unitKind: 'SEARCH_RESULT',
    assertion: 'ASSERTED',
    sectionId,
    fieldPath: `sourceSearchRecords[${search.searchKind}]`,
    populationScope: null,
    formulationScope: null,
    text: lines(
      `${name} — ${label}: ${outcome}`,
      `Search space: ${search.sourceIdentifier}`,
      `Query as run: ${search.query}`,
      `Requested on ${search.requestedAt.slice(0, 10)}`,
      search.error ? `Recorded error: ${search.error}` : undefined,
      matched.length > 0 ? `Matched records: ${matched.join(', ')}` : undefined,
    ),
    sourceRefs: [
      {
        kind: search.searchKind,
        identifier: search.sourceIdentifier,
        retrievedAt: search.requestedAt.slice(0, 10),
      },
    ],
    comparisonState: null,
  }
}

function sectionAssertion(state: string): UnitAssertion {
  if ((ABSENCE_SECTION_STATES as readonly string[]).includes(state)) return 'ABSENT'
  if (state === 'SOURCE_STATED_NOT_ESTABLISHED') return 'NEGATED'
  return 'ASSERTED'
}

function sectionDraft(name: string, section: SectionAssessment): DraftUnit {
  return {
    unitKind: 'SECTION_STATE',
    assertion: sectionAssertion(section.state),
    sectionId: section.sectionId,
    fieldPath: `sections[${section.sectionId}].state`,
    populationScope: null,
    formulationScope: null,
    text: lines(`${name} — ${SECTION_LABELS[section.sectionId]}: ${section.basis}`),
    sourceRefs: section.sourceRefs.map(assessmentRef),
    comparisonState: null,
  }
}

const SECTION_ORDER = new Map(DOSSIER_SECTION_IDS.map((id, index) => [id, index]))
const KIND_ORDER = new Map(UNIT_KINDS.map((kind, index) => [kind, index]))

/**
 * Projects one record into its reading units, in a fixed order: section reading order, then unit
 * kind, then field path, then id.
 */
export function projectEvidenceUnits(input: UnitProjectionInput): EvidenceReadingUnit[] {
  const { drug } = input
  const name = drug.name
  const background = drug.recordedBackground
  const drafts: DraftUnit[] = []

  if (background) {
    drafts.push(...valueDrafts(name, background))
    for (const [index, statement] of (background.mechanism?.statements ?? []).entries()) {
      drafts.push(statementDraft(name, 'mechanism', `mechanism.statements[${index}]`, statement))
    }
    for (const [index, statement] of (background.recordedUses?.statements ?? []).entries()) {
      drafts.push(
        statementDraft(name, 'recorded-uses', `recordedUses.statements[${index}]`, statement),
      )
    }
    if (background.safety?.boxedWarning) {
      drafts.push(
        statementDraft(
          name,
          'safety-statements',
          'safety.boxedWarning',
          background.safety.boxedWarning,
        ),
      )
    }
    for (const [index, statement] of (background.safety?.contraindications ?? []).entries()) {
      drafts.push(
        statementDraft(name, 'safety-statements', `safety.contraindications[${index}]`, statement),
      )
    }
    for (const [index, signal] of (background.interactionSignals ?? []).entries()) {
      drafts.push(interactionDraft(name, index, signal))
    }
    for (const [index, statement] of (background.populationStatements ?? []).entries()) {
      drafts.push(populationDraft(name, index, statement))
    }
    const adverse = background.commonAdverseReactions
    if (adverse) {
      drafts.push({
        unitKind: 'ADVERSE_REACTION_LIST',
        assertion: 'ASSERTED',
        sectionId: 'adverse-reactions',
        fieldPath: 'commonAdverseReactions',
        populationScope: null,
        formulationScope: null,
        text: lines(
          `${name} — most common adverse reactions (${adverse.thresholdAsRecorded}): ${adverse.eventsAsRecorded.join(', ')}`,
          adverse.source.excerpt,
        ),
        sourceRefs: [sourceRef(adverse.source)],
        comparisonState: null,
      })
    }
    drafts.push(...consensusDrafts(name, background))
  }

  for (const search of [...input.searches].sort((left, right) =>
    left.searchKind.localeCompare(right.searchKind),
  )) {
    drafts.push(searchDraft(name, search))
  }

  for (const section of input.sections) {
    drafts.push(sectionDraft(name, section))
  }

  const units = drafts.map((draft) => finalize(drug, draft))
  const seen = new Set<string>()
  const deduped = units.filter((unit) => {
    if (seen.has(unit.id)) return false
    seen.add(unit.id)
    return true
  })
  return deduped.sort((left, right) => {
    const section =
      (SECTION_ORDER.get(left.sectionId) ?? 0) - (SECTION_ORDER.get(right.sectionId) ?? 0)
    if (section !== 0) return section
    const kind = (KIND_ORDER.get(left.unitKind) ?? 0) - (KIND_ORDER.get(right.unitKind) ?? 0)
    if (kind !== 0) return kind
    const path = left.fieldPath.localeCompare(right.fieldPath)
    if (path !== 0) return path
    return left.id.localeCompare(right.id)
  })
}

/** SHA-256 over the projector inputs for one record, so a re-projection can skip unchanged rows. */
export function projectionInputDigest(input: UnitProjectionInput): string {
  return digestOf({
    projectorVersion: SEMANTIC_PROJECTOR_VERSION,
    drug: input.drug,
    sections: input.sections,
    searches: input.searches,
  })
}

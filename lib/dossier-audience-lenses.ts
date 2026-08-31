import type { DossierNavigatorSection } from '@/components/dossier/DossierSectionNavigator'
import type { RecordedSourceView } from '@/lib/medicine-background-view'
import { dossierNavigatorSections } from '@/lib/dossier-navigator-sections'
import {
  buildDossierQuestionRegistry,
  type DossierQuestionIntent,
  type DossierQuestionPassage,
} from '@/lib/dossier-question-registry'
import type {
  DossierFreshnessState,
  EvidenceSourceView,
  MedicineDossierViewModel,
} from '@/lib/medicine-dossier-view-model'

/** The four supported projections over one canonical medicine dossier. */
export const DOSSIER_AUDIENCE_LENSES = ['ordinary', 'biotech', 'chemist', 'quantitative'] as const

export type DossierAudienceLens = (typeof DOSSIER_AUDIENCE_LENSES)[number]

export type DossierAudienceEvidenceState =
  | 'recorded'
  | 'measured'
  | 'derived'
  | 'reviewed'
  | 'not_recorded'
  | 'ambiguous'
  | 'conflicting'
  | 'stale'

/** A source is copied from the canonical view model; absent version/freshness stays explicit. */
export interface DossierAudienceSourceProjection {
  id: string
  label: string
  href?: string
  identifier?: string
  snapshotHash?: string
  version?: string
  effectiveDate?: string
  retrievedAt?: string
  verifiedAt?: string
  freshness: DossierFreshnessState | 'not_recorded'
  excerpt?: string
}

export interface DossierAudienceProjectionFact {
  label: string
  value: string
}

/**
 * Why a row may be rendered without an exact medical source binding.
 *
 * Medical/evidence is the fail-closed default: a row in that class is converted to an explicit
 * `missing` coverage row when none of its saved source ids resolves against the canonical dossier.
 * Identity is restricted to the selected medicine/programme routing keys. Scientific identity is
 * medical/evidence and therefore source-required. Operational rows describe RNAWiki's own
 * review/freshness process rather than making a medical or evidential claim.
 */
export type DossierAudienceProjectionRecordKind =
  'medical_evidence' | 'identity' | 'operational' | 'missing'

/** One exact canonical value (or one explicit absence) inside an audience projection. */
export interface DossierAudienceProjectionRecord {
  id: string
  recordKind: DossierAudienceProjectionRecordKind
  heading: string
  summary?: string
  facts: readonly DossierAudienceProjectionFact[]
  canonicalFields: readonly string[]
  scope: string
  evidenceState: DossierAudienceEvidenceState
  evidenceStateLabel: string
  sources: readonly DossierAudienceSourceProjection[]
  provenanceNote?: string
}

export interface DossierAudienceProjectionSection {
  id: string
  heading: string
  description: string
  requiredFields: readonly string[]
  records: readonly DossierAudienceProjectionRecord[]
}

export interface DossierAudienceLensProjection {
  lens: DossierAudienceLens
  label: string
  description: string
  /** The first useful canonical anchor for this record, with an always-rendered fallback. */
  href: `#${string}`
  /** The complete canonical section index, reordered but never filtered. */
  orderedSections: readonly DossierNavigatorSection[]
  /** Source-bound medical/evidence rows only; identity, operations, and coverage gaps never count. */
  sourceBoundMedicalEvidenceRecords: number
  /** A selectable reader projection built only from the supplied canonical view model. */
  sections: readonly DossierAudienceProjectionSection[]
}

interface LensDefinition {
  label: string
  description: string
  preferredAnchors: readonly string[]
  fallbackAnchor: string
  prioritySectionIds: readonly string[]
}

const LENS_DEFINITIONS: Record<DossierAudienceLens, LensDefinition> = {
  ordinary: {
    label: 'Ordinary reader',
    description: 'Six everyday questions, limits and safety',
    preferredAnchors: ['what-it-is'],
    fallbackAnchor: 'what-it-is',
    prioritySectionIds: [
      'recorded-uses',
      'recorded-harms',
      'commonly-reported',
      'recorded-populations',
      'who-was-studied',
      'evidence-support',
    ],
  },
  biotech: {
    label: 'Biotech researcher',
    description: 'Programme, trials, evidence gaps and review history',
    preferredAnchors: [
      'mechanism-map',
      'evidence-support',
      'recorded-mechanism',
      'handled-by',
      'where-it-acts-map',
    ],
    fallbackAnchor: 'q-mechanism',
    prioritySectionIds: [
      'evidence-support',
      'recorded-mechanism',
      'handled-by',
      'where-it-acts-map',
      'studies',
      'development-timeline',
    ],
  },
  chemist: {
    label: 'Chemist',
    description: 'Entity, composition, structure and identity gaps',
    preferredAnchors: [
      'chemical-identity',
      'molecular-record',
      'what-is-in-it',
      'what-kind-of-material',
      'after-a-dose',
    ],
    fallbackAnchor: 'q-identity',
    prioritySectionIds: [
      'chemical-identity',
      'molecular-record',
      'what-is-in-it',
      'what-kind-of-material',
      'after-a-dose',
      'handled-by',
    ],
  },
  quantitative: {
    label: 'Physicist or quantitative scientist',
    description: 'Measurements, units, uncertainty and source readings',
    preferredAnchors: [
      'key-outcomes',
      'study-measurements',
      'after-a-dose',
      'what-every-label-says',
      'studies',
    ],
    fallbackAnchor: 'q-measurement',
    prioritySectionIds: [
      'key-outcomes',
      'studies',
      'after-a-dose',
      'what-every-label-says',
      'evidence-support',
      'development-timeline',
    ],
  },
}

function sectionHasContent(section: DossierNavigatorSection): boolean {
  return (
    section.coverage === 'answered' ||
    section.coverage === 'conflicting' ||
    section.coverage === 'stale'
  )
}

function hasReadyModule(module: { status: 'ready' | 'absent' | 'hidden' } | undefined): boolean {
  return module?.status === 'ready'
}

/** Anchors outside the coverage navigator that are still guaranteed by `MedicineDossierV2`. */
function directAnchorIsRendered(dossier: MedicineDossierViewModel, anchor: string): boolean {
  if (
    anchor === 'what-it-is' ||
    anchor === 'sources' ||
    anchor === 'questions-this-evidence-can-answer' ||
    anchor.startsWith('q-')
  ) {
    return true
  }
  if (anchor === 'mechanism-map') {
    return (
      dossier.mechanismSteps.length > 0 ||
      Boolean(
        dossier.mechanismSummary.where ||
        dossier.mechanismSummary.change ||
        dossier.mechanismSummary.observed,
      ) ||
      hasReadyModule(dossier.dynamicModules?.pharmacokinetics)
    )
  }
  if (anchor === 'study-measurements') {
    return (
      dossier.keyOutcomes.length > 0 ||
      dossier.studies.length > 0 ||
      hasReadyModule(dossier.dynamicModules?.safety)
    )
  }
  if (anchor === 'evidence-support') {
    return Boolean(
      dossier.readerSummary.exactText ||
      dossier.conclusion ||
      dossier.evidenceNodes.length > 0 ||
      hasReadyModule(dossier.dynamicModules?.programmeFailure),
    )
  }
  return false
}

function orderSections(
  sections: readonly DossierNavigatorSection[],
  prioritySectionIds: readonly string[],
): DossierNavigatorSection[] {
  const priority = new Map(prioritySectionIds.map((id, index) => [id, index]))
  return sections
    .map((section, canonicalIndex) => ({ section, canonicalIndex }))
    .sort((left, right) => {
      const leftPriority = priority.get(left.section.id)
      const rightPriority = priority.get(right.section.id)
      if (leftPriority !== undefined || rightPriority !== undefined) {
        if (leftPriority === undefined) return 1
        if (rightPriority === undefined) return -1
        return leftPriority - rightPriority
      }
      return left.canonicalIndex - right.canonicalIndex
    })
    .map(({ section }) => section)
}

function text(value: string | number | null | undefined): string | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : undefined
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function facts(
  values: ReadonlyArray<{ label: string; value: string | number | null | undefined }>,
): DossierAudienceProjectionFact[] {
  return values.flatMap(({ label, value }) => {
    const recorded = text(value)
    return recorded ? [{ label, value: recorded }] : []
  })
}

function evidenceSource(source: EvidenceSourceView): DossierAudienceSourceProjection {
  return {
    id: source.id,
    label: source.label,
    href: source.href,
    identifier: source.identifier ?? source.canonicalLocator,
    snapshotHash: source.snapshotHash,
    retrievedAt: source.retrievedAt,
    verifiedAt: source.verifiedAt,
    freshness: source.freshness,
  }
}

function recordedSource(source: RecordedSourceView): DossierAudienceSourceProjection {
  return {
    id: `${source.kindLabel}:${source.identifier}:${source.retrievedAt}`,
    label: source.label,
    href: source.href,
    identifier: source.identifier,
    ...(source.version ? { version: source.version } : {}),
    ...(source.effectiveDate ? { effectiveDate: source.effectiveDate } : {}),
    retrievedAt: source.retrievedAt,
    freshness: 'not_recorded',
    excerpt: source.excerpt,
  }
}

function medicineRecordSource(source: {
  label: string
  identifier?: string
  href?: string
}): DossierAudienceSourceProjection {
  return {
    id: `medicine-record:${source.identifier ?? source.label}`,
    label: source.label,
    href: source.href,
    identifier: source.identifier,
    freshness: 'not_recorded',
  }
}

function deduplicateSources(
  sources: readonly DossierAudienceSourceProjection[],
): DossierAudienceSourceProjection[] {
  const byId = new Map<string, DossierAudienceSourceProjection>()
  for (const source of sources) byId.set(source.id, source)
  return [...byId.values()]
}

function sourcesById(
  dossier: MedicineDossierViewModel,
  ids: readonly string[],
): DossierAudienceSourceProjection[] {
  const wanted = new Set(ids)
  return dossier.sources.filter((source) => wanted.has(source.id)).map(evidenceSource)
}

type ProjectionRecordInput = Omit<
  DossierAudienceProjectionRecord,
  'facts' | 'sources' | 'recordKind'
> & {
  facts?: readonly DossierAudienceProjectionFact[]
  sources?: readonly DossierAudienceSourceProjection[]
}

/**
 * Builds a claim-bearing row. This factory deliberately has no caller-selected `recordKind`:
 * scientific, chemical, medical and evidence producers cannot opt themselves out of exact-source
 * enforcement by labelling their own output as identity or operational.
 */
function record(input: ProjectionRecordInput): DossierAudienceProjectionRecord {
  const sources = deduplicateSources(input.sources ?? [])
  if (sources.length === 0) {
    return {
      id: input.id,
      recordKind: 'missing',
      heading: 'Source-bound evidence not available',
      summary:
        'This field is not shown as answered because no exact source binding resolves in this projection.',
      facts: [],
      canonicalFields: input.canonicalFields,
      scope: input.scope,
      evidenceState: 'not_recorded',
      evidenceStateLabel: 'Exact source binding not recorded',
      sources: [],
      provenanceNote:
        'The canonical medical or evidence text remains unchanged and is not projected until an exact saved source binding resolves.',
    }
  }
  return {
    ...input,
    recordKind: 'medical_evidence',
    facts: input.facts ?? [],
    sources,
  }
}

function coverageRecord(
  input: Omit<ProjectionRecordInput, 'sources'>,
): DossierAudienceProjectionRecord {
  return {
    ...input,
    recordKind: 'missing',
    facts: input.facts ?? [],
    sources: [],
  }
}

const SOURCE_FREE_OPERATIONAL_RECORD_IDS = new Set([
  'lens-q-freshness-record',
  'biotech-review-history',
])

function operationalRecord(input: ProjectionRecordInput): DossierAudienceProjectionRecord {
  const sources = deduplicateSources(input.sources ?? [])
  if (sources.length === 0 && !SOURCE_FREE_OPERATIONAL_RECORD_IDS.has(input.id)) {
    return record(input)
  }
  return {
    ...input,
    recordKind: 'operational',
    facts: input.facts ?? [],
    sources,
  }
}

/** The only source-exempt identity row for a selected research programme. */
function programmeIdentityRecord(
  dossier: MedicineDossierViewModel,
  scope: string,
): DossierAudienceProjectionRecord {
  return {
    id: 'biotech-programme-identity',
    recordKind: 'identity',
    heading: dossier.selectedProgrammeLabel,
    facts: facts([{ label: 'Programme id', value: dossier.selectedProgrammeId }]),
    canonicalFields: ['selectedProgrammeId', 'selectedProgrammeLabel'],
    scope,
    evidenceState: 'recorded',
    evidenceStateLabel: 'Selected programme record',
    sources: [],
    provenanceNote:
      'This row is a routing identity for the selected programme; it is not evidence.',
  }
}

/** The only source-exempt identity row for a selected medicine record. */
function medicineIdentityRecord(
  dossier: MedicineDossierViewModel,
  scope: string,
): DossierAudienceProjectionRecord {
  return {
    id: 'chemist-record-identity',
    recordKind: 'identity',
    heading: dossier.name,
    facts: [{ label: 'Record key', value: dossier.slug }],
    canonicalFields: ['slug', 'name'],
    scope,
    evidenceState: 'recorded',
    evidenceStateLabel: 'Selected medicine record',
    sources: [],
    provenanceNote: 'This row is a routing identity for the selected record; it is not evidence.',
  }
}

function missingRecord(
  id: string,
  heading: string,
  canonicalFields: readonly string[],
  scope: string,
  summary = 'This canonical record does not contain this information.',
): DossierAudienceProjectionRecord {
  return coverageRecord({
    id,
    heading,
    summary,
    canonicalFields,
    scope,
    evidenceState: 'not_recorded',
    evidenceStateLabel: 'Not recorded',
    provenanceNote: 'No exact source binding is recorded for this field.',
  })
}

function ensureRecords(
  records: readonly DossierAudienceProjectionRecord[],
  fallback: DossierAudienceProjectionRecord,
): readonly DossierAudienceProjectionRecord[] {
  return records.length > 0 ? records : [fallback]
}

function issueState(passage: DossierQuestionPassage): {
  evidenceState: DossierAudienceEvidenceState
  evidenceStateLabel: string
} {
  if (passage.issues?.includes('stale') || passage.coverage === 'stale') {
    return { evidenceState: 'stale', evidenceStateLabel: 'Exact source needs rechecking' }
  }
  if (passage.issues?.includes('conflicting') || passage.coverage === 'conflicting') {
    return { evidenceState: 'conflicting', evidenceStateLabel: 'Comparable sources differ' }
  }
  if (passage.coverage === 'answered') {
    return { evidenceState: 'recorded', evidenceStateLabel: 'Recorded in this dossier' }
  }
  return { evidenceState: 'not_recorded', evidenceStateLabel: 'Not recorded' }
}

function passageIsOperational(intent: DossierQuestionIntent): boolean {
  return (
    intent === 'sources' ||
    intent === 'review-provenance' ||
    intent === 'freshness' ||
    intent === 'corrections'
  )
}

function passageRecords(
  dossier: MedicineDossierViewModel,
  passages: readonly DossierQuestionPassage[],
  canonicalFields: readonly string[],
  scope: string,
): DossierAudienceProjectionRecord[] {
  return passages.flatMap((passage) => {
    const issue = issueState(passage)
    const state =
      issue.evidenceState === 'recorded' &&
      dossier.bindingState === 'published_programme' &&
      ['purpose', 'bottom-line', 'meaning-limitations', 'unknowns'].includes(passage.intent)
        ? ({
            evidenceState: 'reviewed',
            evidenceStateLabel: 'Reviewed RNAWiki statement',
          } as const)
        : issue.evidenceState === 'recorded' &&
            (passage.intent === 'measurement' || passage.intent === 'results-magnitude')
          ? ({ evidenceState: 'measured', evidenceStateLabel: 'Measured result' } as const)
          : issue
    if (passage.items.length === 0) {
      return [
        coverageRecord({
          id: `lens-${passage.id}`,
          heading: passage.question,
          summary:
            passage.coverageNote ?? passage.answerLead ?? 'This question is not answered here.',
          canonicalFields,
          scope,
          evidenceState: 'not_recorded',
          evidenceStateLabel: 'Not recorded',
          provenanceNote: 'No exact source binding is recorded for this projected answer.',
        }),
      ]
    }
    return passage.items.map((item) => {
      const itemSources = sourcesById(
        dossier,
        item.sourceBindings.map((binding) => binding.sourceId),
      )
      const input = {
        id: `lens-${item.id}`,
        heading: item.heading,
        summary: item.summary,
        facts: item.facts,
        canonicalFields,
        scope,
        ...state,
        sources: itemSources,
        provenanceNote:
          itemSources.length > 0
            ? 'Exact source binding retained from the canonical claim.'
            : 'No exact source binding is recorded for this projected answer.',
      }
      return passageIsOperational(passage.intent) ? operationalRecord(input) : record(input)
    })
  })
}

function ordinaryProjection(dossier: MedicineDossierViewModel): DossierAudienceProjectionSection[] {
  const registry = buildDossierQuestionRegistry(dossier)
  const byIntent = new Map(registry.map((passage) => [passage.intent, passage]))
  const selectedScope = `Selected programme: ${dossier.selectedProgrammeLabel}`
  const backgroundScope = 'Medicine-wide recorded background'
  const select = (intents: readonly DossierQuestionIntent[]) =>
    intents.flatMap((intent) => byIntent.get(intent) ?? [])
  const background = dossier.medicineRecord.background

  const recordedUses = (background?.recordedUses?.statements ?? []).map((statement, index) =>
    record({
      id: `ordinary-purpose-recorded-use-${index + 1}`,
      heading: statement.text,
      canonicalFields: ['medicineRecord.background.recordedUses.statements[].text'],
      scope: backgroundScope,
      evidenceState: 'recorded',
      evidenceStateLabel: 'Recorded label statement, not an RNAWiki conclusion',
      sources: [recordedSource(statement.source)],
      provenanceNote: 'Exact statement and source from the recorded-background envelope.',
    }),
  )

  const pivotalResults = (background?.pivotalResults ?? []).map((result, index) =>
    record({
      id: `ordinary-people-result-${index + 1}`,
      heading: result.endpoint,
      facts: facts([
        { label: 'Trial or registry id', value: result.trialIdentifier },
        { label: 'Recorded result', value: result.activeResult },
        { label: 'Comparator result', value: result.comparatorResult },
        { label: 'Recorded difference', value: result.difference },
        { label: 'Uncertainty', value: result.uncertainty },
        { label: 'Time point', value: result.timepoint },
      ]),
      canonicalFields: ['medicineRecord.background.pivotalResults[]'],
      scope: backgroundScope,
      evidenceState: 'measured',
      evidenceStateLabel: 'Recorded study or label result',
      sources: [recordedSource(result.source)],
      provenanceNote: 'Exact result wording retained; no outcome type is inferred.',
    }),
  )

  const safety = [
    ...(background?.safety?.boxedWarning
      ? [
          record({
            id: 'ordinary-harm-boxed-warning',
            heading: 'Recorded boxed warning',
            summary: background.safety.boxedWarning.text,
            canonicalFields: ['medicineRecord.background.safety.boxedWarning.text'],
            scope: backgroundScope,
            evidenceState: 'recorded' as const,
            evidenceStateLabel: 'Recorded label statement',
            sources: [recordedSource(background.safety.boxedWarning.source)],
          }),
        ]
      : []),
    ...(background?.safety?.contraindications ?? []).map((entry, index) =>
      record({
        id: `ordinary-harm-contraindication-${index + 1}`,
        heading: 'Recorded contraindication',
        summary: entry.text,
        canonicalFields: ['medicineRecord.background.safety.contraindications[]'],
        scope: backgroundScope,
        evidenceState: 'recorded',
        evidenceStateLabel: 'Recorded label statement',
        sources: [recordedSource(entry.source)],
      }),
    ),
  ]

  const applicability = background?.applicability
    ? [
        record({
          id: 'ordinary-applicability-recorded',
          heading: `Recorded study group for ${background.applicability.trialIdentifier}`,
          summary: background.applicability.studiedGroup,
          facts: facts([
            ...background.applicability.included.map((value, index) => ({
              label: `Included criterion ${index + 1}`,
              value,
            })),
            ...background.applicability.excluded.map((value, index) => ({
              label: `Excluded criterion ${index + 1}`,
              value,
            })),
          ]),
          canonicalFields: ['medicineRecord.background.applicability'],
          scope: backgroundScope,
          evidenceState: 'recorded',
          evidenceStateLabel: 'Recorded registry statement',
          sources: [recordedSource(background.applicability.source)],
        }),
      ]
    : []

  const sourceIssues: DossierAudienceProjectionRecord[] = [
    ...(background?.sourceConsensus?.fields ?? [])
      .filter((field) => field.comparisonState === 'differ')
      .map((field) =>
        record({
          id: `ordinary-source-conflict-${field.field}`,
          heading: field.fieldLabel,
          summary: field.disagreementNote,
          facts: field.readings.map((reading) => ({
            label: reading.supportLabel,
            value: reading.display,
          })),
          canonicalFields: [`medicineRecord.background.sourceConsensus.fields.${field.field}`],
          scope: backgroundScope,
          evidenceState: 'conflicting',
          evidenceStateLabel: 'Comparable sources differ; no winner selected',
          sources: field.readings.flatMap((reading) =>
            reading.sources.map((source) => recordedSource(source)),
          ),
        }),
      ),
    ...(background?.driftedSources ?? []).map((drift) =>
      operationalRecord({
        id: `ordinary-source-drift-${drift.bindingId}`,
        heading: drift.fieldPath,
        facts: facts([
          { label: 'Source', value: drift.sourceLabel },
          { label: 'Source identifier', value: drift.sourceIdentifier },
          { label: 'Recorded at', value: drift.recordedAt },
          { label: 'Confirmed assertion check', value: drift.assertionCheckId },
        ]),
        canonicalFields: [drift.fieldPath],
        scope: selectedScope,
        evidenceState: 'stale',
        evidenceStateLabel: 'Exact persisted source binding needs rechecking',
        sources: [
          {
            id: `drift:${drift.bindingId}`,
            label: drift.sourceLabel,
            identifier: drift.sourceIdentifier,
            freshness: 'stale',
          },
        ],
      }),
    ),
  ]

  return [
    {
      id: 'ordinary-purpose',
      heading: '1. What is this medicine used or studied for?',
      description:
        'A reviewed programme scope and any exact recorded-use statements stay separate.',
      requiredFields: ['conclusion.scope.indication', 'medicineRecord.background.recordedUses'],
      records: ensureRecords(
        [
          ...passageRecords(
            dossier,
            select(['purpose']),
            ['conclusion.scope.indication'],
            selectedScope,
          ),
          ...recordedUses,
        ],
        missingRecord(
          'ordinary-purpose-missing',
          'Use or study purpose',
          ['conclusion.scope.indication'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'ordinary-people-result',
      heading: '2. What happened to people in the cited study or label?',
      description: 'Measured findings remain distinct from a reviewed RNAWiki conclusion.',
      requiredFields: ['keyOutcomes[]', 'medicineRecord.background.pivotalResults[]'],
      records: ensureRecords(
        [
          ...passageRecords(
            dossier,
            select(['bottom-line', 'measurement']),
            ['keyOutcomes[]', 'conclusion'],
            selectedScope,
          ),
          ...pivotalResults,
        ],
        missingRecord(
          'ordinary-people-result-missing',
          'Result in people',
          ['keyOutcomes[]'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'ordinary-result-size',
      heading: '3. How large was the measured result?',
      description:
        'A number remains attached to its unit, time point and uncertainty when recorded.',
      requiredFields: [
        'keyOutcomes[].numericValue',
        'keyOutcomes[].numericUnit',
        'keyOutcomes[].uncertaintyInterval',
      ],
      records: ensureRecords(
        [
          ...passageRecords(
            dossier,
            select(['results-magnitude']),
            ['keyOutcomes[]'],
            selectedScope,
          ),
          ...pivotalResults,
        ],
        missingRecord(
          'ordinary-result-size-missing',
          'Measured result size',
          ['keyOutcomes[].numericValue'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'ordinary-harm-limit',
      heading: '4. What important harm or limitation was recorded?',
      description: 'Safety statements and limits retain their original scope and provenance.',
      requiredFields: [
        'dynamicModules.safety',
        'mainLimitation',
        'medicineRecord.background.safety',
      ],
      records: ensureRecords(
        [
          ...passageRecords(
            dossier,
            select(['harms', 'meaning-limitations']),
            ['dynamicModules.safety', 'mainLimitation'],
            selectedScope,
          ),
          ...safety,
        ],
        missingRecord(
          'ordinary-harm-limit-missing',
          'Important harm or limitation',
          ['mainLimitation'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'ordinary-applicability',
      heading: '5. Who might this evidence not apply to?',
      description:
        'Recorded inclusion and exclusion criteria describe evidence boundaries, not advice.',
      requiredFields: ['medicineRecord.background.applicability', 'conclusion.scope.population'],
      records: ensureRecords(
        [
          ...passageRecords(
            dossier,
            select(['applicability']),
            ['medicineRecord.background.applicability'],
            selectedScope,
          ),
          ...applicability,
        ],
        missingRecord(
          'ordinary-applicability-missing',
          'Applicability',
          ['medicineRecord.background.applicability'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'ordinary-unknowns',
      heading: '6. What is unknown, conflicting or stale?',
      description:
        'An unknown, a comparable disagreement and confirmed source drift are different states.',
      requiredFields: [
        'conclusion.whatRemainsUnknown[]',
        'medicineRecord.background.sourceConsensus',
        'medicineRecord.background.driftedSources',
      ],
      records: ensureRecords(
        [
          ...passageRecords(
            dossier,
            select(['unknowns', 'freshness']),
            ['conclusion.whatRemainsUnknown[]', 'freshness'],
            selectedScope,
          ),
          ...sourceIssues,
        ],
        missingRecord(
          'ordinary-unknowns-missing',
          'Unknown, conflicting or stale evidence',
          ['conclusion.whatRemainsUnknown[]'],
          selectedScope,
        ),
      ),
    },
  ]
}

function biotechProjection(dossier: MedicineDossierViewModel): DossierAudienceProjectionSection[] {
  const selectedScope = `Selected programme: ${dossier.selectedProgrammeLabel}`
  const backgroundScope = 'Medicine-wide recorded background'
  const background = dossier.medicineRecord.background
  const programme = programmeIdentityRecord(dossier, selectedScope)
  const programmeStatus = missingRecord(
    'biotech-programme-status',
    'Selected programme status',
    ['selectedProgrammeStatus', 'bindingState'],
    selectedScope,
    'The recorded programme or regulatory status is not shown because no exact supporting source binding resolves in this projection.',
  )
  const programmeScope = dossier.conclusion
    ? record({
        id: 'biotech-programme-scope',
        heading: 'Reviewed programme scope',
        facts: facts([
          { label: 'Indication', value: dossier.conclusion.scope.indication },
          { label: 'Population', value: dossier.conclusion.scope.population },
          { label: 'Dose or exposure', value: dossier.conclusion.scope.doseExposure },
          { label: 'Time covered', value: dossier.conclusion.scope.period },
        ]),
        canonicalFields: ['conclusion.scope'],
        scope: selectedScope,
        evidenceState: 'reviewed',
        evidenceStateLabel: 'Reviewed programme scope',
      })
    : missingRecord(
        'biotech-programme-scope',
        'Programme scope',
        ['conclusion.scope'],
        selectedScope,
      )

  const studies = dossier.studies.map((study) =>
    record({
      id: `biotech-study-${study.id}`,
      heading: study.title ?? study.id,
      facts: facts([
        { label: 'Trial or registry id', value: study.id },
        { label: 'Phase', value: study.phase },
        { label: 'Study type', value: study.studyType },
        { label: 'Population denominator', value: study.sampleSize },
        { label: 'Endpoint', value: study.endpoint },
        { label: 'Endpoint hierarchy', value: study.endpointHierarchy },
        { label: 'Result', value: study.result },
        { label: 'Technical result or availability', value: study.technicalResult },
      ]),
      canonicalFields: [`studies.${study.id}`],
      scope: selectedScope,
      evidenceState: study.state === 'measured' ? 'measured' : 'not_recorded',
      evidenceStateLabel:
        study.state === 'measured' ? 'Measured study record' : `Study state: ${study.state}`,
      sources: sourcesById(dossier, [
        ...(study.sourceIds ?? []),
        ...(study.registrySourceId ? [study.registrySourceId] : []),
      ]),
    }),
  )

  const applicability = background?.applicability
    ? [
        record({
          id: 'biotech-applicability',
          heading: `Population and exclusions — ${background.applicability.trialIdentifier}`,
          summary: background.applicability.studiedGroup,
          facts: facts([
            ...background.applicability.included.map((value, index) => ({
              label: `Included ${index + 1}`,
              value,
            })),
            ...background.applicability.excluded.map((value, index) => ({
              label: `Excluded ${index + 1}`,
              value,
            })),
          ]),
          canonicalFields: ['medicineRecord.background.applicability'],
          scope: backgroundScope,
          evidenceState: 'recorded',
          evidenceStateLabel: 'Recorded registry criteria',
          sources: [recordedSource(background.applicability.source)],
        }),
      ]
    : []

  const routes = background?.pharmacokinetics
    ? [
        record({
          id: 'biotech-route',
          heading: 'Route as recorded',
          summary: background.pharmacokinetics.routeAsRecorded,
          canonicalFields: ['medicineRecord.background.pharmacokinetics.routeAsRecorded'],
          scope: backgroundScope,
          evidenceState: 'recorded',
          evidenceStateLabel: 'Recorded source value',
          sources: background.pharmacokinetics.values.map((value) => recordedSource(value.source)),
        }),
      ]
    : []

  const outcomes = dossier.keyOutcomes.map((outcome) =>
    record({
      id: `biotech-outcome-${outcome.id}`,
      heading: outcome.label,
      facts: facts([
        { label: 'Endpoint', value: outcome.endpoint },
        { label: 'Endpoint hierarchy', value: outcome.endpointHierarchy },
        { label: 'Comparator', value: outcome.comparator },
        { label: 'Result estimate', value: outcome.numericValue },
        { label: 'Unit', value: outcome.numericUnit },
        { label: 'Uncertainty', value: outcome.uncertaintyInterval },
        { label: 'Time point', value: outcome.timepoint },
        { label: 'Outcome type', value: outcome.outcomeType },
      ]),
      canonicalFields: [`keyOutcomes.${outcome.id}`],
      scope: selectedScope,
      evidenceState:
        outcome.state === 'measured'
          ? 'measured'
          : outcome.state === 'inferred'
            ? 'derived'
            : 'recorded',
      evidenceStateLabel:
        outcome.state === 'measured'
          ? 'Measured'
          : outcome.state === 'inferred'
            ? 'Derived or inferred'
            : `Recorded state: ${outcome.state}`,
      sources: sourcesById(
        dossier,
        outcome.sourceClaimBindings?.map((binding) => binding.sourceId) ?? outcome.sourceIds,
      ),
    }),
  )

  const safety =
    dossier.dynamicModules?.safety.status === 'ready'
      ? dossier.dynamicModules.safety.data.findings.map((finding) =>
          record({
            id: `biotech-safety-${finding.id}`,
            heading: finding.endpoint ?? 'Recorded adverse event or safety finding',
            summary: finding.statement,
            facts: facts([
              { label: 'Result', value: finding.exactResult },
              { label: 'Uncertainty', value: finding.uncertaintyInterval },
              { label: 'Population', value: finding.population },
              { label: 'Comparator', value: finding.comparator },
              { label: 'Time point', value: finding.timepoint },
            ]),
            canonicalFields: [`dynamicModules.safety.findings.${finding.id}`],
            scope: selectedScope,
            evidenceState: finding.claimNature === 'MEASURED' ? 'measured' : 'recorded',
            evidenceStateLabel: `Claim nature: ${finding.claimNature
              .toLowerCase()
              .replaceAll('_', ' ')}`,
            sources: sourcesById(dossier, finding.sourceIds),
          }),
        )
      : []

  const negativeFindings = dossier.evidenceNodes
    .filter((node) => node.state === 'contradicted')
    .map((node) =>
      record({
        id: `biotech-negative-${node.id}`,
        heading: node.title,
        summary: node.summary,
        canonicalFields: [`evidenceNodes.${node.id}`],
        scope: selectedScope,
        evidenceState: node.claimNature === 'measured' ? 'measured' : 'recorded',
        evidenceStateLabel: `Recorded evidence points against this step · ${node.claimNature.replaceAll('_', ' ')}`,
        sources: sourcesById(dossier, node.sourceIds),
      }),
    )

  const failure =
    dossier.dynamicModules?.programmeFailure.status === 'ready'
      ? [
          record({
            id: 'biotech-programme-failure',
            heading: dossier.dynamicModules.programmeFailure.data.readerLabel,
            summary: dossier.dynamicModules.programmeFailure.data.reason,
            facts: facts([
              {
                label: 'Professional classification',
                value: dossier.dynamicModules.programmeFailure.data.professionalLabel,
              },
              {
                label: 'Stopping reason',
                value: dossier.dynamicModules.programmeFailure.data.stoppingReasonCategory,
              },
            ]),
            canonicalFields: ['dynamicModules.programmeFailure'],
            scope: selectedScope,
            evidenceState: 'reviewed',
            evidenceStateLabel: 'Reviewed development-failure classification',
            sources: sourcesById(dossier, dossier.dynamicModules.programmeFailure.data.sourceIds),
          }),
        ]
      : []

  const unreported = [
    ...dossier.evidenceNodes
      .filter(
        (node) =>
          node.state === 'not_measured' || node.state === 'unknown' || node.state === 'mixed',
      )
      .map((node) =>
        record({
          id: `biotech-gap-${node.id}`,
          heading: node.title,
          summary: node.summary,
          canonicalFields: [`evidenceNodes.${node.id}`],
          scope: selectedScope,
          evidenceState: node.state === 'mixed' ? 'ambiguous' : 'not_recorded',
          evidenceStateLabel:
            node.state === 'not_measured'
              ? 'Not measured'
              : node.state === 'mixed'
                ? 'Mixed evidence'
                : 'Unknown',
          sources: sourcesById(dossier, node.sourceIds),
        }),
      ),
    ...dossier.studies.flatMap((study) =>
      (study.interpretability ?? [])
        .filter(
          (assessment) => assessment.state === 'not_reported' || assessment.state === 'unclear',
        )
        .map((assessment) =>
          record({
            id: `biotech-unreported-${study.id}-${assessment.id}`,
            heading: assessment.question,
            summary: assessment.explanation,
            facts: facts([
              { label: 'Trial or registry id', value: study.id },
              { label: 'Professional criterion', value: assessment.professionalTerm },
            ]),
            canonicalFields: [`studies.${study.id}.interpretability.${assessment.id}`],
            scope: selectedScope,
            evidenceState: assessment.state === 'unclear' ? 'ambiguous' : 'not_recorded',
            evidenceStateLabel: assessment.state === 'unclear' ? 'Unclear' : 'Not reported',
            sources: sourcesById(dossier, assessment.sourceIds),
          }),
        ),
    ),
  ]

  const consensus = (background?.sourceConsensus?.fields ?? []).map((field) =>
    record({
      id: `biotech-consensus-${field.field}`,
      heading: field.fieldLabel,
      facts: [
        { label: 'Agreement', value: field.agreementLabel },
        { label: 'Comparability', value: field.comparisonState ?? 'Not recorded' },
        ...field.readings.map((reading) => ({
          label: reading.supportLabel,
          value: reading.display,
        })),
      ],
      canonicalFields: [`medicineRecord.background.sourceConsensus.fields.${field.field}`],
      scope: backgroundScope,
      evidenceState:
        field.comparisonState === 'differ'
          ? 'conflicting'
          : field.comparisonState === 'not_comparable' ||
              field.comparisonState === 'insufficient_context'
            ? 'ambiguous'
            : 'recorded',
      evidenceStateLabel:
        field.comparisonState === 'differ'
          ? 'Comparable sources differ; no winner selected'
          : `Comparability: ${field.comparisonState ?? 'not recorded'}`,
      sources: field.readings.flatMap((reading) => reading.sources.map(recordedSource)),
    }),
  )

  const drift = (background?.driftedSources ?? []).map((item) =>
    operationalRecord({
      id: `biotech-drift-${item.bindingId}`,
      heading: item.fieldPath,
      facts: facts([
        { label: 'Source', value: item.sourceLabel },
        { label: 'Source identifier', value: item.sourceIdentifier },
        { label: 'Recorded at', value: item.recordedAt },
        { label: 'Assertion check', value: item.assertionCheckId },
      ]),
      canonicalFields: [item.fieldPath],
      scope: selectedScope,
      evidenceState: 'stale',
      evidenceStateLabel: 'Confirmed drift on an exact persisted binding',
      sources: [
        {
          id: `drift:${item.bindingId}`,
          label: item.sourceLabel,
          identifier: item.sourceIdentifier,
          freshness: 'stale',
        },
      ],
    }),
  )

  const review = operationalRecord({
    id: 'biotech-review-history',
    heading: 'Recorded review history',
    facts: facts([
      { label: 'Revision id', value: dossier.review.revisionId },
      { label: 'Published', value: dossier.review.publishedAt },
      { label: 'Reviewed', value: dossier.review.reviewedAt },
      { label: 'Reviewer label', value: dossier.review.reviewerLabel },
      { label: 'Independent reviewers', value: dossier.conclusion?.independentReviewCount },
      { label: 'Engine version', value: dossier.review.engineVersion },
      { label: 'Input digest', value: dossier.review.inputDigest },
    ]),
    canonicalFields: ['review', 'conclusion.reviewers'],
    scope: selectedScope,
    evidenceState: dossier.review.reviewedAt ? 'reviewed' : 'not_recorded',
    evidenceStateLabel: dossier.review.reviewedAt
      ? 'Recorded human review'
      : 'Completed review not recorded',
    provenanceNote: `Full history: ${dossier.review.historyHref}`,
  })

  return [
    {
      id: 'biotech-programme',
      heading: 'Programme, indication and study population',
      description: 'Programme scope is kept separate from medicine-wide background.',
      requiredFields: ['programme', 'indication', 'population', 'exclusions', 'dose', 'route'],
      records: [programme, programmeStatus, programmeScope, ...applicability, ...routes],
    },
    {
      id: 'biotech-trials',
      heading: 'Trials, endpoints and results',
      description:
        'Registry ids, denominators, comparators, endpoint hierarchy, result and uncertainty remain together.',
      requiredFields: [
        'trial and registry ids',
        'comparator',
        'endpoint',
        'endpoint hierarchy',
        'result',
        'uncertainty',
        'denominator',
      ],
      records: ensureRecords(
        studies.length > 0 || outcomes.length > 0 ? [...studies, ...outcomes] : [],
        missingRecord(
          'biotech-trials-missing',
          'Trials and measured results',
          ['studies[]', 'keyOutcomes[]'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'biotech-outcomes-gaps',
      heading: 'Adverse events, negative findings and evidence gaps',
      description:
        'Development failure, unreported outcomes and negative findings remain distinct.',
      requiredFields: [
        'adverse events',
        'negative findings',
        'development failures',
        'unreported outcomes',
      ],
      records: ensureRecords(
        [...safety, ...negativeFindings, ...failure, ...unreported],
        missingRecord(
          'biotech-gaps-missing',
          'Adverse events and evidence gaps',
          ['dynamicModules.safety', 'evidenceNodes[]', 'dynamicModules.programmeFailure'],
          selectedScope,
        ),
      ),
    },
    {
      id: 'biotech-provenance',
      heading: 'Source agreement, drift and review history',
      description:
        'Comparable disagreement, freshness drift and human review are shown as separate states.',
      requiredFields: ['source agreement', 'source drift', 'review history'],
      records: [...consensus, ...drift, review],
    },
  ]
}

function chemistProjection(dossier: MedicineDossierViewModel): DossierAudienceProjectionSection[] {
  const scope = 'Medicine identity and medicine-wide recorded background'
  const background = dossier.medicineRecord.background
  const sourceMaterial = background?.sourceMaterial
  const composition = background?.composition
  const molecularValues = background?.molecularIdentity?.values ?? []
  const legacyMolecular = dossier.medicineRecord.molecular
  const structureSource = legacyMolecular?.source
    ? medicineRecordSource(legacyMolecular.source)
    : undefined

  const entity = medicineIdentityRecord(dossier, scope)

  const sourceMaterialRecord = sourceMaterial
    ? record({
        id: 'chemist-source-material',
        heading: 'Recorded material identity',
        facts: facts([
          { label: 'Represented entity type', value: sourceMaterial.substanceClassLabel },
          { label: 'Parent substance', value: sourceMaterial.parentSubstance },
          { label: 'Origin', value: sourceMaterial.originLabel },
          { label: 'Recorded parts', value: sourceMaterial.parts.join('; ') },
        ]),
        canonicalFields: ['medicineRecord.background.sourceMaterial'],
        scope,
        evidenceState: 'recorded',
        evidenceStateLabel: 'Source-bound material identity',
        sources: [recordedSource(sourceMaterial.source)],
      })
    : missingRecord(
        'chemist-source-material-missing',
        'Material identity',
        ['medicineRecord.background.sourceMaterial'],
        scope,
        'No exact source-bound material identity is recorded in this canonical view.',
      )

  const parentSalt = sourceMaterial?.parentSubstance
    ? record({
        id: 'chemist-parent-salt-solvate',
        heading: 'Recorded parent-substance relationship',
        facts: [{ label: 'Parent substance', value: sourceMaterial.parentSubstance }],
        canonicalFields: ['medicineRecord.background.sourceMaterial.parentSubstance'],
        scope,
        evidenceState: 'recorded',
        evidenceStateLabel: 'Source-bound parent substance',
        sources: [recordedSource(sourceMaterial.source)],
      })
    : missingRecord(
        'chemist-parent-salt-solvate',
        'Parent, salt, hydrate or solvate state',
        ['medicineRecord.background.sourceMaterial.parentSubstance', 'medicineRecord.molecular'],
        scope,
        'No exact source-bound parent, salt, hydrate, solvate or stereochemistry relationship is recorded in this canonical view.',
      )

  const identityCoverage = coverageRecord({
    id: 'chemist-identity-state-coverage',
    heading: 'Identity fields not separately recorded',
    facts: facts([
      { label: 'Salt state', value: 'Not recorded as a separate canonical field' },
      { label: 'Hydrate or solvate state', value: 'Not recorded as a separate canonical field' },
      { label: 'Stereochemistry state', value: 'Not recorded as a separate canonical field' },
    ]),
    canonicalFields: ['medicineRecord.background.sourceMaterial', 'medicineRecord.molecular'],
    scope,
    evidenceState: 'not_recorded',
    evidenceStateLabel: 'Not recorded as separate canonical fields',
    provenanceNote: 'No identity relationship is inferred from the medicine name or structure.',
  })

  const compositionRecords = composition
    ? composition.ingredients.map((ingredient, index) =>
        record({
          id: `chemist-composition-${index + 1}`,
          heading: ingredient.name,
          facts: facts([
            { label: 'Strength', value: ingredient.strength },
            { label: 'Substance-data state', value: ingredient.dataStateLabel },
          ]),
          canonicalFields: [`medicineRecord.background.composition.ingredients.${index}`],
          scope,
          evidenceState: 'recorded',
          evidenceStateLabel: 'Recorded composition entry',
          // Ingredient-level use or molecular sources do not bind the product's composition claim.
          // The composition schema does not yet retain that exact label binding, so fail closed.
          sources: [],
          provenanceNote: composition.summary,
        }),
      )
    : []

  const registry = background?.registryIdentifiers
  const identityRows =
    registry?.rows.filter((row) =>
      /pubchem|rxnorm|rxcui|compound id|\bcid\b/iu.test(`${row.label} ${row.value}`),
    ) ?? []
  const identityRegistry = identityRows.map((row, index) =>
    record({
      id: `chemist-registry-${index + 1}`,
      heading: row.label,
      summary: row.value,
      canonicalFields: ['medicineRecord.background.registryIdentifiers.rows[]'],
      scope,
      evidenceState: 'recorded',
      evidenceStateLabel: 'Recorded external identity pointer',
      sources: registry ? [recordedSource(registry.source)] : [],
    }),
  )

  const molecular = [
    ...molecularValues.map((value, index) =>
      record({
        id: `chemist-molecular-${index + 1}`,
        heading: value.label,
        summary: value.display,
        facts: facts([
          { label: 'Population or material context', value: value.populationContext },
          { label: 'Provenance tier', value: value.provenanceLabel },
          { label: 'Source agreement', value: value.concordanceLabel },
        ]),
        canonicalFields: [`medicineRecord.background.molecularIdentity.values.${index}`],
        scope,
        evidenceState: value.discrepantAlternate ? 'conflicting' : 'recorded',
        evidenceStateLabel: value.discrepantAlternate
          ? 'Recorded sources differ'
          : 'Direct or calculated status is not separately recorded',
        sources: [
          recordedSource(value.source),
          ...(value.discrepantAlternate ? [recordedSource(value.discrepantAlternate.source)] : []),
        ],
      }),
    ),
    ...(legacyMolecular?.identifiers ?? []).map((identifier, index) =>
      record({
        id: `chemist-legacy-molecular-${index + 1}`,
        heading: identifier.label,
        summary: identifier.value,
        facts: facts([{ label: 'Stored representation kind', value: identifier.kind }]),
        canonicalFields: [`medicineRecord.molecular.identifiers.${index}`],
        scope,
        evidenceState: 'recorded',
        evidenceStateLabel: 'Recorded molecular representation',
        sources: structureSource ? [structureSource] : [],
      }),
    ),
  ]

  const warnings: DossierAudienceProjectionRecord[] = [
    ...(background?.nameFamily
      ? [
          record({
            id: 'chemist-name-ambiguity',
            heading: 'Unresolved identity warning',
            summary: background.nameFamily.summary,
            facts: facts([
              ...background.nameFamily.members.map((member) => ({
                label: member.name,
                value: `${member.unii} · ${member.marketLabel}`,
              })),
              {
                label: 'Additional possible identities',
                value: background.nameFamily.moreCount,
              },
            ]),
            canonicalFields: ['medicineRecord.background.nameFamily'],
            scope,
            evidenceState: 'ambiguous',
            evidenceStateLabel: 'Name does not resolve to one substance',
            sources: [recordedSource(background.nameFamily.source)],
          }),
        ]
      : []),
    ...(legacyMolecular
      ? [
          operationalRecord({
            id: 'chemist-structure-check',
            heading: 'Recorded structure check',
            facts: facts([
              { label: 'Check state', value: legacyMolecular.structureCheck },
              { label: 'Checked at', value: legacyMolecular.checkedAt },
              { label: 'Structure source', value: legacyMolecular.source?.label },
            ]),
            canonicalFields: ['medicineRecord.molecular.structureCheck'],
            scope,
            evidenceState: legacyMolecular.structureCheck === 'passed' ? 'recorded' : 'ambiguous',
            evidenceStateLabel:
              legacyMolecular.structureCheck === 'passed'
                ? 'Recorded check passed'
                : 'Recorded structure check did not pass',
            sources: structureSource ? [structureSource] : [],
          }),
        ]
      : []),
  ]

  return [
    {
      id: 'chemist-entity-scope',
      heading: 'Represented entity and composition',
      description:
        'The medicine row, substance relationship and each recorded ingredient remain distinct.',
      requiredFields: [
        'represented entity type',
        'active substance',
        'parent versus salt',
        'hydrate or solvate',
        'mixture or multi-substance state',
      ],
      records: [
        entity,
        sourceMaterialRecord,
        parentSalt,
        identityCoverage,
        ...ensureRecords(
          compositionRecords,
          missingRecord(
            'chemist-composition-missing',
            'Mixture or multi-substance composition',
            ['medicineRecord.background.composition'],
            scope,
          ),
        ),
      ],
    },
    {
      id: 'chemist-identifiers',
      heading: 'External identity pointers',
      description:
        'PubChem and RxNorm identifiers appear only when the canonical record contains them.',
      requiredFields: ['PubChem identity', 'RxNorm identity'],
      records: ensureRecords(
        identityRegistry,
        missingRecord(
          'chemist-registry-missing',
          'PubChem or RxNorm identity',
          ['medicineRecord.background.registryIdentifiers'],
          scope,
        ),
      ),
    },
    {
      id: 'chemist-molecular',
      heading: 'Formula, weight and structure provenance',
      description: 'Each representation retains its source; calculation status is not guessed.',
      requiredFields: [
        'formula',
        'weight',
        'structure source',
        'direct versus calculated descriptors',
      ],
      records: ensureRecords(
        molecular,
        missingRecord(
          'chemist-molecular-missing',
          'Molecular formula, weight or structure',
          ['medicineRecord.background.molecularIdentity', 'medicineRecord.molecular'],
          scope,
        ),
      ),
    },
    {
      id: 'chemist-ambiguity',
      heading: 'Stereochemistry and unresolved identity',
      description: 'An absent or unresolved identity is shown without attempting a repair.',
      requiredFields: ['stereochemistry state', 'unresolved identity warnings'],
      records: ensureRecords(
        warnings,
        missingRecord(
          'chemist-warning-missing',
          'Identity ambiguity and stereochemistry',
          ['medicineRecord.background.nameFamily', 'medicineRecord.molecular.structureCheck'],
          scope,
          'No separate stereochemistry state or unresolved identity warning is recorded in this canonical view.',
        ),
      ),
    },
  ]
}

function quantitativeProjection(
  dossier: MedicineDossierViewModel,
): DossierAudienceProjectionSection[] {
  const selectedScope = `Selected programme: ${dossier.selectedProgrammeLabel}`
  const backgroundScope = 'Medicine-wide recorded background'
  const background = dossier.medicineRecord.background
  const measurements = dossier.keyOutcomes.map((outcome) => {
    const measured = outcome.state === 'measured' && outcome.claimNature === 'measured'
    const derived = outcome.state === 'inferred'
    return record({
      id: `quantitative-outcome-${outcome.id}`,
      heading: outcome.label,
      facts: facts([
        { label: 'Measured property', value: outcome.endpoint ?? outcome.label },
        { label: 'Estimate', value: outcome.numericValue },
        { label: 'Unit', value: outcome.numericUnit },
        { label: 'Dispersion or interval', value: outcome.uncertaintyInterval },
        {
          label: 'Uncertainty type',
          value: outcome.uncertaintyInterval ? 'As printed by the source' : 'Not recorded',
        },
        { label: 'Route', value: 'Not linked to this measurement' },
        { label: 'Time point', value: outcome.timepoint },
        { label: 'Comparator', value: outcome.comparator },
        { label: 'Sample size', value: 'Not linked to this measurement' },
        {
          label: 'Observed or derived',
          value: measured
            ? 'Observed or measured'
            : derived
              ? 'Derived or inferred'
              : (outcome.claimNature ?? outcome.state),
        },
        {
          label: 'Formula for a derived value',
          value: derived ? 'Not recorded' : 'Not applicable to this recorded result',
        },
        {
          label: 'Assumptions',
          value: derived ? 'Not recorded' : 'No derived-value assumptions recorded',
        },
      ]),
      canonicalFields: [`keyOutcomes.${outcome.id}`],
      scope: selectedScope,
      evidenceState: measured ? 'measured' : derived ? 'derived' : 'recorded',
      evidenceStateLabel: measured
        ? 'Observed or measured'
        : derived
          ? 'Derived or inferred'
          : `Recorded state: ${outcome.state}`,
      sources: sourcesById(
        dossier,
        outcome.sourceClaimBindings?.map((binding) => binding.sourceId) ?? outcome.sourceIds,
      ),
      provenanceNote:
        outcome.numericValue && !outcome.numericUnit
          ? 'Incomplete quantitative context: a number is recorded without a unit.'
          : undefined,
    })
  })

  const backgroundResults = (background?.pivotalResults ?? []).map((result, index) =>
    record({
      id: `quantitative-recorded-result-${index + 1}`,
      heading: result.endpoint,
      facts: facts([
        { label: 'Measured property', value: result.endpoint },
        { label: 'Estimate', value: result.activeResult },
        { label: 'Comparator estimate', value: result.comparatorResult },
        { label: 'Difference', value: result.difference },
        { label: 'Dispersion or interval', value: result.uncertainty },
        {
          label: 'Uncertainty type',
          value: result.uncertainty ? 'As printed by the source' : 'Not recorded',
        },
        { label: 'Trial or registry id', value: result.trialIdentifier },
        { label: 'Time point', value: result.timepoint },
        { label: 'Observed or derived', value: 'Recorded source result' },
        {
          label: 'Formula for a derived value',
          value: 'Not applicable to this recorded source result',
        },
      ]),
      canonicalFields: ['medicineRecord.background.pivotalResults[]'],
      scope: backgroundScope,
      evidenceState: 'measured',
      evidenceStateLabel: 'Recorded source result',
      sources: [recordedSource(result.source)],
    }),
  )

  const pharmacokinetics = (background?.pharmacokinetics?.values ?? []).map((value, index) =>
    record({
      id: `quantitative-pharmacokinetics-${index + 1}`,
      heading: value.label,
      summary: value.display,
      facts: facts([
        { label: 'Population', value: value.populationContext },
        { label: 'Route', value: background?.pharmacokinetics?.routeAsRecorded },
        { label: 'Observed or derived', value: 'Recorded source value' },
        { label: 'Provenance tier', value: value.provenanceLabel },
        { label: 'Source agreement', value: value.concordanceLabel },
      ]),
      canonicalFields: [`medicineRecord.background.pharmacokinetics.values.${index}`],
      scope: backgroundScope,
      evidenceState: value.discrepantAlternate ? 'conflicting' : 'measured',
      evidenceStateLabel: value.discrepantAlternate
        ? 'Recorded sources differ'
        : 'Recorded source measurement',
      sources: [
        recordedSource(value.source),
        ...(value.discrepantAlternate ? [recordedSource(value.discrepantAlternate.source)] : []),
      ],
    }),
  )

  const steadyState = background?.pharmacokinetics?.steadyStateNote
    ? [
        record({
          id: 'quantitative-steady-state-derived',
          heading: 'Estimated time to steady state',
          summary: background.pharmacokinetics.steadyStateNote,
          facts: [
            { label: 'Observed or derived', value: 'Derived' },
            { label: 'Formula', value: 'Approximately 5 × the recorded half-life' },
            {
              label: 'Assumption',
              value: 'Uses the recorded half-life value in this canonical record',
            },
          ],
          canonicalFields: ['medicineRecord.background.pharmacokinetics.steadyStateNote'],
          scope: backgroundScope,
          evidenceState: 'derived',
          evidenceStateLabel: 'Deterministically derived; not a separate source reading',
          sources: background.pharmacokinetics.values
            .filter((value) => value.label.toLocaleLowerCase('en').includes('half'))
            .map((value) => recordedSource(value.source)),
        }),
      ]
    : []

  const consensus = (background?.sourceConsensus?.fields ?? []).flatMap((field) =>
    field.readings.map((reading, index) =>
      record({
        id: `quantitative-consensus-${field.field}-${index + 1}`,
        heading: `${field.fieldLabel} — source reading ${index + 1}`,
        summary: reading.display,
        facts: facts([
          { label: 'Support', value: reading.supportLabel },
          { label: 'Agreement', value: field.agreementLabel },
          { label: 'Comparability state', value: field.comparisonState ?? 'Not recorded' },
          { label: 'Comparison reasons', value: field.comparisonReasons?.join('; ') },
        ]),
        canonicalFields: [
          `medicineRecord.background.sourceConsensus.fields.${field.field}.readings.${index}`,
        ],
        scope: backgroundScope,
        evidenceState:
          field.comparisonState === 'differ'
            ? 'conflicting'
            : field.comparisonState === 'not_comparable' ||
                field.comparisonState === 'insufficient_context'
              ? 'ambiguous'
              : 'recorded',
        evidenceStateLabel:
          field.comparisonState === 'differ'
            ? 'Comparable sources differ; no winner selected'
            : `Comparability: ${field.comparisonState ?? 'not recorded'}`,
        sources: reading.sources.map(recordedSource),
      }),
    ),
  )

  return [
    {
      id: 'quantitative-measurements',
      heading: 'Measurements and context',
      description:
        'Every estimate keeps its unit, interval, population, route, time point and observed-versus-derived state when recorded.',
      requiredFields: [
        'measured property',
        'estimate',
        'unit',
        'dispersion',
        'uncertainty type',
        'range or interval',
        'sample size',
        'population',
        'route',
        'time point',
        'observed versus derived',
      ],
      records: ensureRecords(
        [...measurements, ...backgroundResults, ...pharmacokinetics, ...steadyState],
        missingRecord(
          'quantitative-measurements-missing',
          'Quantitative measurements',
          [
            'keyOutcomes[]',
            'medicineRecord.background.pivotalResults',
            'medicineRecord.background.pharmacokinetics',
          ],
          selectedScope,
          'No source-bound quantitative measurement is recorded in this canonical view.',
        ),
      ),
    },
    {
      id: 'quantitative-derived',
      heading: 'Derivations and assumptions',
      description:
        'A derived value must expose its formula and assumptions; absent derivation metadata stays absent.',
      requiredFields: ['formula for derived values', 'assumptions'],
      records: ensureRecords(
        [...measurements, ...steadyState].filter((item) => item.evidenceState === 'derived'),
        missingRecord(
          'quantitative-derived-missing',
          'Derived values, formula and assumptions',
          ['keyOutcomes[].state', 'medicineRecord.background.pharmacokinetics.steadyStateNote'],
          selectedScope,
          'No derived quantitative value is recorded in this canonical view.',
        ),
      ),
    },
    {
      id: 'quantitative-readings',
      heading: 'Comparability and all recorded source readings',
      description:
        'Every retained reading is shown; not comparable is never presented as disagreement.',
      requiredFields: ['comparability state', 'all source readings'],
      records: ensureRecords(
        consensus,
        missingRecord(
          'quantitative-consensus-missing',
          'Source comparability and readings',
          ['medicineRecord.background.sourceConsensus'],
          backgroundScope,
          'No cross-source reading comparison is recorded in this canonical view.',
        ),
      ),
    },
  ]
}

function projectionSections(
  lens: DossierAudienceLens,
  dossier: MedicineDossierViewModel,
): DossierAudienceProjectionSection[] {
  if (lens === 'ordinary') return ordinaryProjection(dossier)
  if (lens === 'biotech') return biotechProjection(dossier)
  if (lens === 'chemist') return chemistProjection(dossier)
  return quantitativeProjection(dossier)
}

/**
 * Builds four selectable views over the same immutable `MedicineDossierViewModel`. The function
 * only groups and labels canonical fields. It never rewrites a medicine value, selects a source,
 * resolves a disagreement or mutates the supplied record.
 */
export function dossierAudienceLensProjections(
  dossier: MedicineDossierViewModel,
): DossierAudienceLensProjection[] {
  const canonicalSections = dossierNavigatorSections(dossier)
  const sectionsById = new Map(canonicalSections.map((section) => [section.id, section]))

  return DOSSIER_AUDIENCE_LENSES.map((lens) => {
    const definition = LENS_DEFINITIONS[lens]
    const firstAvailable = definition.preferredAnchors.find((anchor) => {
      const section = sectionsById.get(anchor)
      return (
        Boolean(section && sectionHasContent(section)) || directAnchorIsRendered(dossier, anchor)
      )
    })
    const sections = projectionSections(lens, dossier)
    const sourceBoundMedicalEvidenceRecords = sections
      .flatMap((section) => section.records)
      .filter((item) => item.recordKind === 'medical_evidence' && item.sources.length > 0).length

    return {
      lens,
      label: definition.label,
      description: definition.description,
      href: `#${firstAvailable ?? definition.fallbackAnchor}`,
      orderedSections: orderSections(canonicalSections, definition.prioritySectionIds),
      sourceBoundMedicalEvidenceRecords,
      sections,
    }
  })
}

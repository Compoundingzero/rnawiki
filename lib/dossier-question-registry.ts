import type {
  EvidenceNodeState,
  KeyOutcomeView,
  MedicineDossierViewModel,
  ProgrammeSourceClaimBindingView,
} from '@/lib/medicine-dossier-view-model'
import { publicApprovalStatusLabel, publicMedicineTypeLabel } from '@/lib/public-medicine-language'
import {
  buildQuestionIssueIndex,
  primaryIssueCoverage,
  type DossierQuestionIssue,
} from '@/lib/dossier-question-issues'

export type DossierQuestionIntent =
  | 'identity'
  | 'purpose'
  | 'regulatory-status'
  | 'bottom-line'
  | 'evidence-scope'
  | 'measurement'
  | 'results-magnitude'
  | 'meaning-limitations'
  | 'applicability'
  | 'harms'
  | 'mechanism'
  | 'evidence-certainty'
  | 'programme-history'
  | 'failure-analysis'
  | 'unknowns'
  | 'sources'
  | 'review-provenance'
  | 'freshness'
  | 'corrections'

export type DossierQuestionCoverageState =
  | 'answered'
  | 'not_yet_documented'
  | 'not_reported'
  | 'not_applicable'
  | 'awaiting_review'
  /** Recorded sources print different values that WERE comparable. Never inferred from a unit mismatch. */
  | 'conflicting'
  /** A source supporting this question no longer reproduces what was recorded from it. */
  | 'stale'

export interface DossierQuestionFact {
  label: string
  value: string
}

export interface DossierQuestionAnswerItem {
  id: string
  heading: string
  summary?: string
  facts: DossierQuestionFact[]
  sourceBindings: ProgrammeSourceClaimBindingView[]
}

export interface DossierQuestionPassage {
  /** Stable kebab-case id, also used as the DOM anchor for this question. */
  id: string
  intent: DossierQuestionIntent
  intentLabel: string
  question: string
  coverage: DossierQuestionCoverageState
  /**
   * Every problem this question carries, not only the one shown as `coverage`.
   *
   * A question can be both conflicting and stale. `coverage` collapses that to one value for
   * consumers that can show only one, and this array keeps both so the navigator can badge both.
   */
  issues?: readonly DossierQuestionIssue[]
  /** Fixed explanation of an absence or evidence issue; an issue note may accompany an answer. */
  coverageNote?: string
  /** Self-contained lead naming the medicine and scope, present exactly when answered. */
  answerLead?: string
  items: DossierQuestionAnswerItem[]
}

interface QuestionDefinition {
  intent: DossierQuestionIntent
  intentLabel: string
  question: string
}

const QUESTION_DEFINITIONS: readonly QuestionDefinition[] = [
  { intent: 'identity', intentLabel: 'Identity', question: 'What medicine is this page about?' },
  {
    intent: 'purpose',
    intentLabel: 'Purpose',
    question: 'What use or condition does this page cover?',
  },
  {
    intent: 'regulatory-status',
    intentLabel: 'Status',
    question: 'What is its recorded approval or study status?',
  },
  {
    intent: 'bottom-line',
    intentLabel: 'Bottom line',
    question: 'What is the reviewed bottom line for this use?',
  },
  {
    intent: 'evidence-scope',
    intentLabel: 'Study scope',
    question: 'Who was studied, compared with what, and for how long?',
  },
  {
    intent: 'measurement',
    intentLabel: 'Measurement',
    question: 'What exactly did the studies measure?',
  },
  {
    intent: 'results-magnitude',
    intentLabel: 'Result size',
    question: 'How large was the measured result?',
  },
  {
    intent: 'meaning-limitations',
    intentLabel: 'Meaning and limits',
    question: 'What are the limits of this result?',
  },
  {
    intent: 'applicability',
    intentLabel: 'Applicability',
    question: 'Who was excluded, and who might this answer not apply to?',
  },
  { intent: 'harms', intentLabel: 'Safety', question: 'What side effects or harms were recorded?' },
  {
    intent: 'mechanism',
    intentLabel: 'Mechanism',
    question: 'How is it meant to work in the body?',
  },
  {
    intent: 'evidence-certainty',
    intentLabel: 'Certainty',
    question: 'How certain is the evidence?',
  },
  {
    intent: 'programme-history',
    intentLabel: 'History',
    question: 'What happened across this research over time?',
  },
  {
    intent: 'failure-analysis',
    intentLabel: 'Failure analysis',
    question: 'If research on this use stopped, why?',
  },
  {
    intent: 'unknowns',
    intentLabel: 'Open questions',
    question: 'What remains unknown for this use?',
  },
  {
    intent: 'sources',
    intentLabel: 'Sources',
    question: 'What saved sources support this record?',
  },
  {
    intent: 'review-provenance',
    intentLabel: 'Review',
    question: 'Who reviewed this answer, and when?',
  },
  {
    intent: 'freshness',
    intentLabel: 'Freshness',
    question: 'How recently was this record checked against its sources?',
  },
  {
    intent: 'corrections',
    intentLabel: 'Corrections',
    question: 'How are errors in this record corrected?',
  },
]

/**
 * How far the selected record has come through review. `reviewed_publication` is the only state
 * that may answer evidence questions; the other states resolve those questions honestly.
 */
type QuestionReviewState =
  'reviewed_publication' | 'published_unreviewed' | 'programme_unpublished' | 'legacy_record'

interface QuestionBuildContext {
  dossier: MedicineDossierViewModel
  availableSourceIds: ReadonlySet<string>
  reviewState: QuestionReviewState
  scopeLabel: string
}

function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

/** Stored record ids become DOM anchors; whitespace would make the id attribute invalid HTML. */
function domSafeId(value: string): string {
  return value.replace(/\s+/gu, '-')
}

function readableStoredLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/gu, ' ')
    .replace(/^./u, (letter) => letter.toUpperCase())
}

type WithSourceClaimBindings = {
  sourceClaimBindings?: ProgrammeSourceClaimBindingView[]
}

function exactSourceClaimBindings(
  value: WithSourceClaimBindings,
  expectedClaimIds: ReadonlySet<string>,
  availableSourceIds: ReadonlySet<string>,
): ProgrammeSourceClaimBindingView[] {
  const byKey = new Map<string, ProgrammeSourceClaimBindingView>()
  for (const binding of value.sourceClaimBindings ?? []) {
    if (
      !availableSourceIds.has(binding.sourceId) ||
      !expectedClaimIds.has(binding.claimId) ||
      !nonEmpty(binding.statement)
    ) {
      continue
    }
    byKey.set(`${binding.sourceId}:${binding.claimId}:${binding.relationship}`, binding)
  }
  return [...byKey.values()]
}

function hasSupportingSourceBinding(bindings: readonly ProgrammeSourceClaimBindingView[]): boolean {
  return bindings.some((binding) => binding.relationship === 'SUPPORTS')
}

function exactResult(value?: string, unit?: string): string | undefined {
  const number = nonEmpty(value)
  if (!number) return undefined
  const recordedUnit = nonEmpty(unit)
  return recordedUnit ? `${number} ${recordedUnit}` : number
}

function facts(
  values: ReadonlyArray<{ label: string; value: string | number | null | undefined }>,
): DossierQuestionFact[] {
  return values.flatMap(({ label, value }) => {
    const recorded = typeof value === 'number' ? String(value) : nonEmpty(value)
    return recorded ? [{ label, value: recorded }] : []
  })
}

function deduplicateItems(
  items: readonly DossierQuestionAnswerItem[],
): DossierQuestionAnswerItem[] {
  const seen = new Set<string>()
  const result: DossierQuestionAnswerItem[] = []

  for (const item of items) {
    const key = [item.heading, item.summary, ...item.facts.map((fact) => fact.value)]
      .join('\u0000')
      .trim()
      .toLocaleLowerCase('en')
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(item)
  }
  return result
}

function evidenceNodeStateLabel(state: EvidenceNodeState): string {
  if (state === 'contradicted') return 'Evidence points against this step'
  if (state === 'mixed') return 'Studies point in different directions'
  if (state === 'not_measured') return 'Not measured'
  if (state === 'unknown') return 'Not enough information'
  if (state === 'recorded_context') return 'General background, not reviewed for this use'
  return 'Evidence supports this step'
}

function interpretabilityStateLabel(state: 'yes' | 'no' | 'unclear' | 'not_reported'): string {
  if (state === 'yes') return 'Yes'
  if (state === 'no') return 'No'
  if (state === 'unclear') return 'Unclear'
  return 'Not reported'
}

function mechanismBasisLabel(
  basis: MedicineDossierViewModel['mechanismSteps'][number]['evidenceBasis'],
): string | undefined {
  if (basis === 'MEASURED_IN_PEOPLE') return 'Measured in people'
  if (basis === 'MEASURED_OUTSIDE_PEOPLE') return 'Measured outside people'
  if (basis === 'PREDICTED') return 'Predicted'
  if (basis === 'UNKNOWN') return 'Not known'
  return undefined
}

function passage(
  definition: QuestionDefinition,
  resolution:
    | { coverage: 'answered'; answerLead: string; items: DossierQuestionAnswerItem[] }
    | { coverage: Exclude<DossierQuestionCoverageState, 'answered'>; coverageNote: string },
): DossierQuestionPassage {
  const base = {
    id: `q-${definition.intent}`,
    intent: definition.intent,
    intentLabel: definition.intentLabel,
    question: definition.question,
  }
  return resolution.coverage === 'answered'
    ? { ...base, coverage: 'answered', answerLead: resolution.answerLead, items: resolution.items }
    : { ...base, coverage: resolution.coverage, coverageNote: resolution.coverageNote, items: [] }
}

/** Honest resolution for an evidence question that this record cannot answer yet. */
function unansweredEvidence(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
  reviewedNote: string,
): DossierQuestionPassage {
  if (context.reviewState === 'legacy_record') {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote:
        'This older medicine-wide record has not been reviewed as an answer for one specific use.',
    })
  }
  if (context.reviewState === 'programme_unpublished') {
    return passage(definition, {
      coverage: 'awaiting_review',
      coverageNote:
        'A specific use and its studies have been identified, but reviewers have not published an answer yet.',
    })
  }
  if (context.reviewState === 'published_unreviewed') {
    return passage(definition, {
      coverage: 'awaiting_review',
      coverageNote:
        'A record exists for this use, but a completed independent review is not recorded for it.',
    })
  }
  return passage(definition, { coverage: 'not_yet_documented', coverageNote: reviewedNote })
}

function identityQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  return passage(definition, {
    coverage: 'answered',
    answerLead: `This page is the RNAWiki record for ${dossier.name}.`,
    items: [
      {
        id: 'q-identity-record',
        heading: dossier.tradeName
          ? `${dossier.name} (sold as ${dossier.tradeName})`
          : dossier.name,
        facts: facts([
          { label: 'Medicine name', value: dossier.name },
          { label: 'Trade name', value: dossier.tradeName },
          { label: 'Medicine type', value: publicMedicineTypeLabel(dossier.modality) },
        ]),
        sourceBindings: [],
      },
    ],
  })
}

function purposeQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  const coveredUse =
    nonEmpty(dossier.conclusion?.scope.indication) ??
    nonEmpty(
      dossier.readerSummary.contextItems.find((item) => item.label === 'What this page covers')
        ?.text,
    )
  if (!coveredUse) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'This record does not yet document what this medicine was used or studied for.',
    })
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `The one use of ${dossier.name} covered by this page.`,
    items: [
      {
        id: 'q-purpose-covered-use',
        heading: coveredUse,
        summary:
          dossier.readerSummary.usedFor === coveredUse ? undefined : dossier.readerSummary.usedFor,
        facts: facts([{ label: 'Group covered', value: dossier.conclusion?.scope.population }]),
        sourceBindings: [],
      },
    ],
  })
}

function regulatoryStatusQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  const label =
    dossier.statusBadge.kind === 'medicine_approval'
      ? publicApprovalStatusLabel(dossier.statusBadge.value)
      : `Research status: ${readableStoredLabel(dossier.statusBadge.value)}`
  return passage(definition, {
    coverage: 'answered',
    answerLead: `The exact recorded status for ${dossier.name}, as shown at the top of this page.`,
    items: [
      {
        id: 'q-regulatory-status-record',
        heading: label,
        facts: [],
        sourceBindings: [],
      },
    ],
  })
}

function bottomLineQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  const conclusion = dossier.conclusion
  if (context.reviewState !== 'reviewed_publication' || !conclusion) {
    return unansweredEvidence(
      definition,
      context,
      'A reviewed conclusion has not been recorded for this use yet.',
    )
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `The reviewed conclusion for ${dossier.name} — ${context.scopeLabel}. It applies only to this use.`,
    items: [
      {
        id: 'q-bottom-line-conclusion',
        heading: conclusion.publicLabel,
        summary: nonEmpty(conclusion.reason),
        facts: facts([
          { label: 'Reviewed confidence', value: conclusion.confidence },
          { label: 'Applies to', value: conclusion.scope.indication },
          { label: 'Main limitation', value: dossier.mainLimitation },
        ]),
        sourceBindings: [],
      },
    ],
  })
}

function evidenceScopeQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  const scope = dossier.conclusion?.scope
  const scopeFacts = scope
    ? facts([
        { label: 'Who was studied', value: scope.population },
        { label: 'Dose or exposure', value: scope.doseExposure },
        { label: 'Study period', value: scope.period },
        { label: 'Studies covered', value: scope.trials },
        { label: 'Outcome asked about', value: scope.outcome },
      ])
    : []
  if (context.reviewState !== 'reviewed_publication' || scopeFacts.length === 0) {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document who was studied for this use.',
    )
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `The reviewed scope of the answer for ${dossier.name} — ${context.scopeLabel}.`,
    items: [
      {
        id: 'q-evidence-scope-reviewed',
        heading: 'Reviewed study scope',
        facts: scopeFacts,
        sourceBindings: [],
      },
    ],
  })
}

function measuredOutcomes(dossier: MedicineDossierViewModel): KeyOutcomeView[] {
  return dossier.keyOutcomes.filter(
    (outcome) =>
      outcome.state === 'measured' &&
      outcome.claimNature === 'measured' &&
      Boolean(nonEmpty(outcome.label)),
  )
}

function boundMeasuredOutcomes(
  context: QuestionBuildContext,
): Array<{ outcome: KeyOutcomeView; sourceBindings: ProgrammeSourceClaimBindingView[] }> {
  return measuredOutcomes(context.dossier).flatMap((outcome) => {
    const sourceBindings = exactSourceClaimBindings(
      outcome,
      new Set([outcome.id]),
      context.availableSourceIds,
    )
    return hasSupportingSourceBinding(sourceBindings) ? [{ outcome, sourceBindings }] : []
  })
}

function measurementQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document what the studies measured for this use.',
    )
  }
  const items = deduplicateItems(
    boundMeasuredOutcomes(context).map(({ outcome, sourceBindings }) => ({
      id: `q-measurement-${domSafeId(outcome.id)}`,
      heading: outcome.label,
      facts: facts([
        { label: 'Measurement', value: outcome.endpoint },
        {
          label: 'Type of result',
          value: outcome.endpointHierarchy
            ? readableStoredLabel(outcome.endpointHierarchy)
            : undefined,
        },
        { label: 'Compared with', value: outcome.comparator },
        { label: 'When measured', value: outcome.timepoint },
      ]),
      sourceBindings,
    })),
  )
  if (items.length > 0) {
    return passage(definition, {
      coverage: 'answered',
      answerLead: `Reviewed measurements for ${context.dossier.name} — ${context.scopeLabel}. Each keeps its exact saved-source link.`,
      items,
    })
  }
  if (measuredOutcomes(context.dossier).length > 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote:
        'A measurement is recorded for this use, but it is not yet linked to an exact saved source.',
    })
  }
  return passage(definition, {
    coverage: 'not_yet_documented',
    coverageNote: 'This record does not yet document what the studies measured for this use.',
  })
}

function resultsMagnitudeQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document a result size for this use.',
    )
  }
  const bound = boundMeasuredOutcomes(context)
  const items = deduplicateItems(
    bound.flatMap(({ outcome, sourceBindings }) => {
      const recordedResult = exactResult(outcome.numericValue, outcome.numericUnit)
      if (!recordedResult) return []
      return [
        {
          id: `q-results-magnitude-${domSafeId(outcome.id)}`,
          heading: outcome.label,
          facts: facts([
            { label: 'Exact result', value: recordedResult },
            { label: 'Uncertainty range', value: outcome.uncertaintyInterval },
            { label: 'Compared with', value: outcome.comparator },
            { label: 'When measured', value: outcome.timepoint },
          ]),
          sourceBindings,
        },
      ]
    }),
  )
  if (items.length > 0) {
    return passage(definition, {
      coverage: 'answered',
      answerLead: `Exact measured result sizes for ${context.dossier.name} — ${context.scopeLabel}.`,
      items,
    })
  }
  if (bound.length > 0) {
    return passage(definition, {
      coverage: 'not_reported',
      coverageNote:
        'The reviewed measurements linked to this record do not include an exact result size.',
    })
  }
  if (measuredOutcomes(context.dossier).length > 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote:
        'A measurement is recorded for this use, but it is not yet linked to an exact saved source.',
    })
  }
  return passage(definition, {
    coverage: 'not_yet_documented',
    coverageNote: 'This record does not yet document a result size for this use.',
  })
}

function meaningLimitationsQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document the limits of this result.',
    )
  }
  const mainLimitation = nonEmpty(dossier.mainLimitation)
  const limitationEvidence = dossier.summaryEvidence?.['summary.mainLimitation']
  const limitationItem: DossierQuestionAnswerItem[] = mainLimitation
    ? [
        {
          id: 'q-meaning-limitations-main',
          heading: 'Main limitation of the reviewed answer',
          summary: mainLimitation,
          facts: [],
          sourceBindings: limitationEvidence
            ? exactSourceClaimBindings(
                limitationEvidence,
                new Set(limitationEvidence.claimIds),
                context.availableSourceIds,
              )
            : [],
        },
      ]
    : []
  const boundaryStates = new Set<EvidenceNodeState>([
    'contradicted',
    'mixed',
    'not_measured',
    'unknown',
  ])
  const boundaryItems = [...dossier.evidenceNodes]
    .sort((left, right) => left.order - right.order)
    .flatMap((node) => {
      const heading = nonEmpty(node.title)
      const summary = nonEmpty(node.summary)
      const nodeClaims = (node.claims ?? []).filter(
        (claim) => (claim.nodeRelationships?.length ?? 0) > 0,
      )
      const sourceBindings = nodeClaims.flatMap((claim) =>
        exactSourceClaimBindings(claim, new Set([claim.id]), context.availableSourceIds),
      )
      if (
        !boundaryStates.has(node.state) ||
        !heading ||
        !summary ||
        !hasSupportingSourceBinding(sourceBindings)
      ) {
        return []
      }
      return [
        {
          id: `q-meaning-limitations-${domSafeId(node.id)}`,
          heading,
          summary,
          facts: facts([{ label: 'Evidence status', value: evidenceNodeStateLabel(node.state) }]),
          sourceBindings,
        },
      ]
    })
  const items = deduplicateItems([...limitationItem, ...boundaryItems])
  if (items.length === 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'This record does not yet document the limits of this result.',
    })
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `Where the reviewed evidence for ${context.dossier.name} — ${context.scopeLabel} — stops or stays qualified.`,
    items,
  })
}

function applicabilityQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  // Eligibility criteria become answerable only through the recorded background layer, where
  // they were fetched from the study register with their identifier and excerpt at authoring
  // time. Records without that layer stay honestly unanswered.
  const applicability = context.dossier.medicineRecord.background?.applicability
  if (!applicability || applicability.included.length === 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'This record does not yet document who was excluded from the studies.',
    })
  }
  const items: DossierQuestionAnswerItem[] = [
    {
      id: 'q-applicability-included',
      heading: 'Included, as the study register records it',
      summary: applicability.studiedGroup,
      facts: applicability.included.map((criterion, index) => ({
        label: `Criterion ${index + 1}`,
        value: criterion,
      })),
      sourceBindings: [],
    },
    ...(applicability.excluded.length > 0
      ? [
          {
            id: 'q-applicability-excluded',
            heading: 'Excluded, as the study register records it',
            facts: applicability.excluded.map((criterion, index) => ({
              label: `Criterion ${index + 1}`,
              value: criterion,
            })),
            sourceBindings: [],
          },
        ]
      : []),
  ]
  return passage(definition, {
    coverage: 'answered',
    answerLead: `Who the main study of ${context.dossier.name} (${applicability.trialIdentifier}) recorded as eligible and excluded. A group the study left out is a boundary of the evidence, not a judgement about anyone.`,
    items,
  })
}

function harmsQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const safety = context.dossier.dynamicModules?.safety
  if (safety?.status === 'ready') {
    const items = deduplicateItems(
      safety.data.findings.flatMap((finding) => {
        const summary = nonEmpty(finding.statement)
        const sourceBindings = exactSourceClaimBindings(
          finding,
          new Set([finding.id]),
          context.availableSourceIds,
        )
        if (!summary || !hasSupportingSourceBinding(sourceBindings)) return []
        return [
          {
            id: `q-harms-${domSafeId(finding.id)}`,
            heading: nonEmpty(finding.endpoint) ?? 'Recorded safety finding',
            summary,
            facts: facts([
              { label: 'Exact result', value: finding.exactResult },
              { label: 'Group studied', value: finding.population },
              { label: 'Compared with', value: finding.comparator },
              { label: 'When measured', value: finding.timepoint },
            ]),
            sourceBindings,
          },
        ]
      }),
    )
    if (items.length > 0) {
      const withheld =
        safety.data.withheldFindingCount > 0
          ? ` ${safety.data.withheldFindingCount} further safety statement${
              safety.data.withheldFindingCount === 1 ? ' was' : 's were'
            } withheld because an exact supporting source was absent.`
          : ''
      return passage(definition, {
        coverage: 'answered',
        answerLead: `Safety findings recorded for ${context.dossier.name} — ${context.scopeLabel}.${withheld}`,
        items,
      })
    }
  }
  if (
    safety?.status === 'hidden' &&
    safety.reason === 'medicine_wide_context_not_programme_reviewed'
  ) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote:
        'Safety information recorded for the medicine as a whole has not been reviewed for this specific use.',
    })
  }
  return unansweredEvidence(
    definition,
    context,
    'This record does not yet document side-effect findings for this use.',
  )
}

function mechanismQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  const orderedSteps = [...dossier.mechanismSteps].sort((left, right) => left.order - right.order)

  if (context.reviewState === 'legacy_record') {
    // Legacy records already show these steps on the page without claim-level links; this answer
    // mirrors them and labels their medicine-wide basis instead of restating them differently.
    const items = deduplicateItems(
      orderedSteps.flatMap((step) => {
        const heading = nonEmpty(step.title)
        const summary = nonEmpty(step.plainLanguage)
        if (!heading || !summary) return []
        return [
          {
            id: `q-mechanism-${domSafeId(step.id)}`,
            heading,
            summary,
            facts: facts([
              { label: 'Evidence for this step', value: mechanismBasisLabel(step.evidenceBasis) },
            ]),
            sourceBindings: [],
          },
        ]
      }),
    )
    if (items.length === 0) {
      return unansweredEvidence(
        definition,
        context,
        'This record does not yet document how this medicine is meant to work.',
      )
    }
    return passage(definition, {
      coverage: 'answered',
      answerLead: `How ${dossier.name} is meant to work, from the medicine-wide research record rather than a reviewed answer for one use.`,
      items,
    })
  }

  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document how this medicine is meant to work.',
    )
  }
  const items = deduplicateItems(
    orderedSteps.flatMap((step) => {
      const heading = nonEmpty(step.title)
      const summary = nonEmpty(step.plainLanguage)
      const sourceBindings = exactSourceClaimBindings(
        step,
        new Set(step.claimIds),
        context.availableSourceIds,
      )
      if (!heading || !summary || !hasSupportingSourceBinding(sourceBindings)) return []
      return [
        {
          id: `q-mechanism-${domSafeId(step.id)}`,
          heading,
          summary,
          facts: facts([
            { label: 'Evidence for this step', value: mechanismBasisLabel(step.evidenceBasis) },
          ]),
          sourceBindings,
        },
      ]
    }),
  )
  if (items.length > 0) {
    return passage(definition, {
      coverage: 'answered',
      answerLead: `How ${dossier.name} is meant to work for this use. Each step separates what was measured from what is predicted.`,
      items,
    })
  }
  if (orderedSteps.length > 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote:
        'A mechanism is recorded, but its steps are not yet linked to exact saved sources.',
    })
  }
  return passage(definition, {
    coverage: 'not_yet_documented',
    coverageNote: 'This record does not yet document how this medicine is meant to work.',
  })
}

function evidenceCertaintyQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document how certain the evidence is for this use.',
    )
  }
  const confidence = nonEmpty(dossier.conclusion?.confidence)
  const confidenceItem: DossierQuestionAnswerItem[] = confidence
    ? [
        {
          id: 'q-evidence-certainty-confidence',
          heading: 'Reviewed confidence in this answer',
          summary: nonEmpty(dossier.conclusion?.confidenceExplanation),
          facts: facts([{ label: 'Recorded confidence', value: confidence }]),
          sourceBindings: [],
        },
      ]
    : []
  const assessmentItems = dossier.studies.flatMap((study) => {
    const studyLabel = nonEmpty(study.title) ?? nonEmpty(study.id)
    if (!studyLabel) return []
    return (study.interpretability ?? []).flatMap((assessment) => {
      const heading = nonEmpty(assessment.question)
      const sourceBindings = exactSourceClaimBindings(
        assessment,
        new Set(assessment.claimIds),
        context.availableSourceIds,
      )
      if (!heading || !hasSupportingSourceBinding(sourceBindings)) return []
      return [
        {
          id: `q-evidence-certainty-${domSafeId(`${study.id}-${assessment.id}`)}`,
          heading,
          summary: nonEmpty(assessment.explanation),
          facts: facts([
            { label: 'Study', value: studyLabel },
            { label: 'Recorded answer', value: interpretabilityStateLabel(assessment.state) },
          ]),
          sourceBindings,
        },
      ]
    })
  })
  const items = deduplicateItems([...confidenceItem, ...assessmentItems])
  if (items.length === 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'This record does not yet document how certain the evidence is for this use.',
    })
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `Recorded checks on how far the studies of ${dossier.name} — ${context.scopeLabel} — can carry their answer.`,
    items,
  })
}

function programmeHistoryQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document a sourced timeline for this research.',
    )
  }
  const sourceEvents = dossier.timelineEvents.filter((event) => event.provenance === 'source')
  const items = deduplicateItems(
    sourceEvents.flatMap((event) => {
      const heading = nonEmpty(event.title)
      const summary = nonEmpty(event.description)
      const sourceBindings = exactSourceClaimBindings(
        event,
        new Set(event.claimIds),
        context.availableSourceIds,
      )
      if (!heading || !summary || !hasSupportingSourceBinding(sourceBindings)) return []
      return [
        {
          id: `q-programme-history-${domSafeId(event.id)}`,
          heading,
          summary,
          facts: facts([{ label: 'Date', value: event.date }]),
          sourceBindings,
        },
      ]
    }),
  )
  if (items.length > 0) {
    return passage(definition, {
      coverage: 'answered',
      answerLead: `Dated events recorded for ${dossier.name} — ${context.scopeLabel} — each with an exact saved source.`,
      items,
    })
  }
  if (sourceEvents.length > 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote:
        'Timeline events are recorded, but they are not yet linked to exact saved sources.',
    })
  }
  return passage(definition, {
    coverage: 'not_yet_documented',
    coverageNote: 'This record does not yet document a sourced timeline for this research.',
  })
}

function failureAnalysisQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const failure = context.dossier.dynamicModules?.programmeFailure
  if (failure?.status === 'ready') {
    const bindings = exactSourceClaimBindings(
      failure.data,
      new Set(failure.data.sourceClaimBindings.map((binding) => binding.claimId)),
      context.availableSourceIds,
    )
    return passage(definition, {
      coverage: 'answered',
      answerLead: `The reviewed failure classification for ${context.dossier.name} — ${context.scopeLabel}.`,
      items: [
        {
          id: 'q-failure-analysis-classification',
          heading: failure.data.readerLabel,
          summary: nonEmpty(failure.data.reason),
          facts: facts([
            { label: 'Professional term', value: failure.data.professionalLabel },
            {
              label: 'Recorded stopping reason',
              value: failure.data.stoppingReasonCategory
                ? readableStoredLabel(failure.data.stoppingReasonCategory)
                : undefined,
            },
          ]),
          sourceBindings: bindings,
        },
      ],
    })
  }
  if (failure?.status === 'absent' && failure.reason === 'not_applicable') {
    return passage(definition, {
      coverage: 'not_applicable',
      coverageNote:
        'This record does not describe stopped research, so a failure analysis does not apply.',
    })
  }
  return unansweredEvidence(
    definition,
    context,
    'This record does not yet document a reviewed failure analysis for this use.',
  )
}

function unknownsQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  if (context.reviewState !== 'reviewed_publication') {
    return unansweredEvidence(
      definition,
      context,
      'This record does not yet document what remains unknown for this use.',
    )
  }
  const items = deduplicateItems(
    (dossier.conclusion?.whatRemainsUnknown ?? []).flatMap((entry, index) => {
      const heading = nonEmpty(entry)
      if (!heading) return []
      return [
        {
          id: `q-unknowns-${index + 1}`,
          heading,
          facts: [],
          sourceBindings: [],
        },
      ]
    }),
  )
  if (items.length === 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'This record does not yet document what remains unknown for this use.',
    })
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `What the reviewed answer for ${dossier.name} — ${context.scopeLabel} — records as still unknown.`,
    items,
  })
}

function sourcesQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  if (dossier.sources.length === 0) {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'No saved source snapshots are linked to this record yet.',
    })
  }
  const items = deduplicateItems(
    dossier.sources.flatMap((source) => {
      const heading = nonEmpty(source.label)
      if (!heading) return []
      return [
        {
          id: `q-sources-${domSafeId(source.id)}`,
          heading,
          facts: facts([
            { label: 'Identifier', value: source.identifier },
            { label: 'Saved', value: source.retrievedAt },
            { label: 'Last checked', value: source.verifiedAt },
          ]),
          sourceBindings: [],
        },
      ]
    }),
  )
  const count = dossier.sources.length
  return passage(definition, {
    coverage: 'answered',
    answerLead: `${count === 1 ? 'One saved source is' : `${count} saved sources are`} linked to this record for ${dossier.name}. The full list, with links, appears in the sources section of this page.`,
    items,
  })
}

function reviewProvenanceQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  const conclusion = dossier.conclusion
  if (context.reviewState !== 'reviewed_publication' || !conclusion) {
    return unansweredEvidence(
      definition,
      context,
      'A completed independent review is not recorded for this use.',
    )
  }
  return passage(definition, {
    coverage: 'answered',
    answerLead: `The recorded review behind the published answer for ${dossier.name} — ${context.scopeLabel}.`,
    items: [
      {
        id: 'q-review-provenance-record',
        heading: 'Recorded review of this answer',
        facts: facts([
          { label: 'Published', value: dossier.review.publishedAt },
          { label: 'Reviewed', value: dossier.review.reviewedAt },
          { label: 'Independent reviewers', value: conclusion.independentReviewCount },
          { label: 'Answer author', value: conclusion.authorName },
          { label: 'Declared conflicts of interest', value: conclusion.conflictsOfInterest },
        ]),
        sourceBindings: [],
      },
    ],
  })
}

function freshnessQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const { dossier } = context
  if (dossier.freshness === 'unknown') {
    return passage(definition, {
      coverage: 'not_yet_documented',
      coverageNote: 'This record has not yet been checked for freshness against its saved sources.',
    })
  }
  const stateLabel =
    dossier.freshness === 'current'
      ? 'Checked and current'
      : dossier.freshness === 'stale'
        ? 'May be out of date'
        : 'A source change needs review'
  return passage(definition, {
    coverage: 'answered',
    answerLead: `The recorded update status for this page about ${dossier.name}.`,
    items: [
      {
        id: 'q-freshness-record',
        heading: dossier.freshnessLabel,
        facts: facts([{ label: 'Update status', value: stateLabel }]),
        sourceBindings: [],
      },
    ],
  })
}

function correctionsQuestion(
  definition: QuestionDefinition,
  context: QuestionBuildContext,
): DossierQuestionPassage {
  const summary =
    context.reviewState === 'legacy_record'
      ? 'Signed-in readers may propose a medicine-name or trade-name correction with a public source and an explanation. A different trusted person decides it, and recorded decisions are kept.'
      : 'Signed-in readers may propose a sourced correction or challenge. Independent reviewers decide it, and no accepted change rewrites this page without a new reviewed publication. Every published change stays in the review history.'
  return passage(definition, {
    coverage: 'answered',
    answerLead: `How changes to this record for ${context.dossier.name} are proposed and decided.`,
    items: [
      {
        id: 'q-corrections-process',
        heading: 'Corrections go through recorded review',
        summary,
        facts: [],
        sourceBindings: [],
      },
    ],
  })
}

function questionReviewState(dossier: MedicineDossierViewModel): QuestionReviewState {
  if (dossier.bindingState === 'legacy_record') return 'legacy_record'
  if (dossier.bindingState === 'programme_unpublished') return 'programme_unpublished'
  const reviewed =
    Boolean(dossier.review.publishedAt) && (dossier.conclusion?.independentReviewCount ?? 0) > 0
  return reviewed ? 'reviewed_publication' : 'published_unreviewed'
}

const QUESTION_BUILDERS: Record<
  DossierQuestionIntent,
  (definition: QuestionDefinition, context: QuestionBuildContext) => DossierQuestionPassage
> = {
  identity: identityQuestion,
  purpose: purposeQuestion,
  'regulatory-status': regulatoryStatusQuestion,
  'bottom-line': bottomLineQuestion,
  'evidence-scope': evidenceScopeQuestion,
  measurement: measurementQuestion,
  'results-magnitude': resultsMagnitudeQuestion,
  'meaning-limitations': meaningLimitationsQuestion,
  applicability: applicabilityQuestion,
  harms: harmsQuestion,
  mechanism: mechanismQuestion,
  'evidence-certainty': evidenceCertaintyQuestion,
  'programme-history': programmeHistoryQuestion,
  'failure-analysis': failureAnalysisQuestion,
  unknowns: unknownsQuestion,
  sources: sourcesQuestion,
  'review-provenance': reviewProvenanceQuestion,
  freshness: freshnessQuestion,
  corrections: correctionsQuestion,
}

/**
 * This is a presentation registry over a fixed question universe, not a text generator. Every
 * question resolves either to an answer assembled from already-published view-model fields with
 * their existing source bindings, or to an honest coverage state with a fixed sentence. It never
 * invents measurements, reviewers, dates or conclusions, and it emits no routes or schema markup.
 */
export function buildDossierQuestionRegistry(
  dossier: MedicineDossierViewModel,
): DossierQuestionPassage[] {
  const context: QuestionBuildContext = {
    dossier,
    availableSourceIds: new Set(dossier.sources.map((source) => source.id)),
    reviewState: questionReviewState(dossier),
    scopeLabel:
      nonEmpty(dossier.conclusion?.scope.indication) ??
      nonEmpty(dossier.selectedProgrammeLabel) ??
      dossier.name,
  }
  /*
   * Issues are applied after each question resolves, not inside the builders. A disagreement between
   * sources is a property of the recorded evidence, not of how any one question was answered, so
   * deriving it once and stamping it keeps every question consistent with every other.
   */
  const issueIndex = buildQuestionIssueIndex({
    consensusFields: dossier.medicineRecord?.background?.sourceConsensus?.fields,
    driftedSources: dossier.medicineRecord?.background?.driftedSources,
  })

  return QUESTION_DEFINITIONS.map((definition) => {
    const passage = QUESTION_BUILDERS[definition.intent](definition, context)
    const issues = issueIndex.byIntent.get(definition.intent)
    if (!issues || issues.length === 0) return passage
    const primary = primaryIssueCoverage(issues)
    return {
      ...passage,
      issues,
      /*
       * A conflict or a drifted source overrides `answered`, because a reader told only "answered"
       * would take the recorded value as settled when the sources behind it do not agree.
       */
      ...(primary
        ? {
            coverage: primary,
            coverageNote: issues.map((issue) => ISSUE_NOTES[issue]).join(' '),
          }
        : {}),
    }
  })
}

/**
 * Reader-facing wording for the two issue states.
 *
 * Both sentences do the same job: state the fact and stop. Neither says a recorded value is wrong,
 * because neither the disagreement nor the drift establishes that, and saying so would be RNAWiki
 * deciding something no source decided.
 */
const ISSUE_NOTES: Record<DossierQuestionIssue, string> = {
  conflicting:
    'Independent sources print different values here that can be compared directly. Every reading is kept exactly as printed. RNAWiki does not choose which source is right, and a disagreement is not proof that either one is wrong.',
  stale:
    'A source behind this answer no longer reproduces the wording it was recorded from, so it needs rechecking. The recorded statement is not automatically wrong; it has not yet been confirmed against the current source.',
}

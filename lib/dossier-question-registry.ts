import type {
  EvidenceNodeState,
  MedicineDossierViewModel,
  ProgrammeSourceClaimBindingView,
} from '@/lib/medicine-dossier-view-model'

export type DossierQuestionKind =
  'measurements' | 'study-reliability' | 'mechanism' | 'evidence-boundary'

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
  id: string
  kind: DossierQuestionKind
  question: string
  answerLead: string
  items: DossierQuestionAnswerItem[]
}

const MAX_ITEMS_PER_QUESTION = 3

function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
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
    if (result.length === MAX_ITEMS_PER_QUESTION) break
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

function measurementQuestion(
  dossier: MedicineDossierViewModel,
  availableSourceIds: ReadonlySet<string>,
): DossierQuestionPassage | null {
  const items = deduplicateItems(
    dossier.keyOutcomes.flatMap((outcome) => {
      const heading = nonEmpty(outcome.label)
      if (outcome.state !== 'measured' || outcome.claimNature !== 'measured') return []
      const sourceBindings = exactSourceClaimBindings(
        outcome,
        new Set([outcome.id]),
        availableSourceIds,
      )
      if (!heading || !hasSupportingSourceBinding(sourceBindings)) return []

      return [
        {
          id: `measurement-${outcome.id}`,
          heading,
          facts: facts([
            {
              label: 'Exact result',
              value: exactResult(outcome.numericValue, outcome.numericUnit),
            },
            { label: 'Measurement', value: outcome.endpoint },
            { label: 'Compared with', value: outcome.comparator },
            { label: 'When measured', value: outcome.timepoint },
          ]),
          sourceBindings,
        },
      ]
    }),
  )

  return items.length > 0
    ? {
        id: 'what-did-the-studies-measure',
        kind: 'measurements',
        question: 'What exactly did the studies measure?',
        answerLead: 'These are the reviewed measurements that have an exact source link.',
        items,
      }
    : null
}

function reliabilityQuestion(
  dossier: MedicineDossierViewModel,
  availableSourceIds: ReadonlySet<string>,
): DossierQuestionPassage | null {
  const items = deduplicateItems(
    dossier.studies.flatMap((study) => {
      const studyLabel = nonEmpty(study.title) ?? nonEmpty(study.id)
      if (!studyLabel) return []
      return (study.interpretability ?? []).flatMap((assessment) => {
        const heading = nonEmpty(assessment.question)
        const sourceBindings = exactSourceClaimBindings(
          assessment,
          new Set(assessment.claimIds),
          availableSourceIds,
        )
        if (!heading || !hasSupportingSourceBinding(sourceBindings)) return []
        return [
          {
            id: `reliability-${study.id}-${assessment.id}`,
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
    }),
  )

  return items.length > 0
    ? {
        id: 'could-the-studies-answer-the-question',
        kind: 'study-reliability',
        question: 'Could the studies answer the research question?',
        answerLead:
          'Reviewers recorded these checks about whether the studies could support the answer.',
        items,
      }
    : null
}

function mechanismQuestion(
  dossier: MedicineDossierViewModel,
  availableSourceIds: ReadonlySet<string>,
): DossierQuestionPassage | null {
  const items = deduplicateItems(
    [...dossier.mechanismSteps]
      .sort((left, right) => left.order - right.order)
      .flatMap((step) => {
        const heading = nonEmpty(step.title)
        const summary = nonEmpty(step.plainLanguage)
        const sourceBindings = exactSourceClaimBindings(
          step,
          new Set(step.claimIds),
          availableSourceIds,
        )
        if (!heading || !summary || !hasSupportingSourceBinding(sourceBindings)) return []
        return [
          {
            id: `mechanism-${step.id}`,
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

  return items.length > 0
    ? {
        id: 'how-does-it-work-in-the-body',
        kind: 'mechanism',
        question: 'How does it work in the body?',
        answerLead:
          'These source-linked steps distinguish what was measured from what is predicted or unknown.',
        items,
      }
    : null
}

function evidenceBoundaryQuestion(
  dossier: MedicineDossierViewModel,
  availableSourceIds: ReadonlySet<string>,
): DossierQuestionPassage | null {
  const boundaryStates = new Set<EvidenceNodeState>([
    'contradicted',
    'mixed',
    'not_measured',
    'unknown',
  ])
  const items = deduplicateItems(
    [...dossier.evidenceNodes]
      .sort((left, right) => left.order - right.order)
      .flatMap((node) => {
        const heading = nonEmpty(node.title)
        const summary = nonEmpty(node.summary)
        const nodeClaims = (node.claims ?? []).filter(
          (claim) => (claim.nodeRelationships?.length ?? 0) > 0,
        )
        const sourceBindings = nodeClaims.flatMap((claim) =>
          exactSourceClaimBindings(claim, new Set([claim.id]), availableSourceIds),
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
            id: `boundary-${node.id}`,
            heading,
            summary,
            facts: facts([{ label: 'Evidence status', value: evidenceNodeStateLabel(node.state) }]),
            sourceBindings,
          },
        ]
      }),
  )

  return items.length > 0
    ? {
        id: 'where-does-the-evidence-stop',
        kind: 'evidence-boundary',
        question: 'Where does the evidence stop or remain uncertain?',
        answerLead:
          'These reviewed steps show where the available evidence is limited or qualified.',
        items,
      }
    : null
}

/**
 * This is a presentation registry, not a text generator. It emits only controlled reader questions
 * backed by exact, already-published view-model fields and source snapshots already visible on the
 * dossier. It creates no routes, schema markup, medical recommendations or missing answers.
 */
export function buildDossierQuestionRegistry(
  dossier: MedicineDossierViewModel,
): DossierQuestionPassage[] {
  const isReviewedPublication =
    dossier.bindingState === 'published_programme' &&
    Boolean(dossier.review.publishedAt) &&
    (dossier.conclusion?.independentReviewCount ?? 0) > 0
  if (!isReviewedPublication) return []

  const availableSourceIds = new Set(dossier.sources.map((source) => source.id))
  if (availableSourceIds.size === 0) return []

  return [
    measurementQuestion(dossier, availableSourceIds),
    reliabilityQuestion(dossier, availableSourceIds),
    mechanismQuestion(dossier, availableSourceIds),
    evidenceBoundaryQuestion(dossier, availableSourceIds),
  ].flatMap((question) => question ?? [])
}

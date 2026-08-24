import type {
  ClaimNature,
  EvidenceNodeType,
  ProgrammeEvidenceReadModel,
  ProgrammeFreshnessReadModel,
  ProgrammePresentationReadModel,
  ProgrammePresentationPublicationReadModel,
  PublishedClaimReadModel,
  SourceFreshnessStatus,
  StudyInterpretabilityCriterion,
} from '@/lib/evidence/types'
import {
  legacyMedicineDossierView,
  normalizedMedicineDossierView,
  type DossierFreshnessState,
  type EvidenceClaimNature,
  type EvidenceDisplayState,
  type EvidenceNodeView,
  type EvidenceSourceView,
  type MedicineDossierViewModel,
  type MechanismStepView,
  type ProgrammeTimelineEventView,
  type StudyInterpretabilityView,
} from '@/lib/medicine-dossier-view-model'
import { buildUnpublishedProgrammeReaderSummary } from '@/lib/public-medicine-language'
import { resolveSafeSourceLocator } from '@/lib/source-locator'
import type { DrugDossier } from '@/lib/types'

const NODE_PRESENTATION: Record<
  EvidenceNodeType,
  { order: number; label: string; professionalLabel: string; question: string }
> = {
  HUMAN_EXPOSURE: {
    order: 1,
    label: 'Human exposure',
    professionalLabel: 'Human exposure',
    question: 'Was it given to people?',
  },
  USEFUL_EXPOSURE: {
    order: 2,
    label: 'Reaching the right place',
    professionalLabel: 'Pharmacokinetics and tissue exposure',
    question: 'Did enough reach the right place?',
  },
  TARGET_ENGAGEMENT: {
    order: 3,
    label: 'Reaching its target',
    professionalLabel: 'Target engagement',
    question: 'Did it hit the intended target?',
  },
  BIOLOGICAL_RESPONSE: {
    order: 4,
    label: 'Change measured in the body',
    professionalLabel: 'Pharmacodynamic or biomarker effect',
    question: 'Did the body change as expected?',
  },
  PATIENT_OUTCOME: {
    order: 5,
    label: 'What changed for patients',
    professionalLabel: 'Clinical outcome',
    question: 'Did patients actually benefit?',
  },
}

const INTERPRETABILITY_PRESENTATION: Record<
  StudyInterpretabilityCriterion,
  { question: string; professionalTerm: string }
> = {
  STATISTICAL_POWER: {
    question: 'Did it enrol enough people?',
    professionalTerm: 'Statistical power',
  },
  POPULATION_SELECTION: {
    question: 'Were the right people studied?',
    professionalTerm: 'Population selection',
  },
  DOSE_EXPOSURE_ADEQUACY: {
    question: 'Did enough drug reach them?',
    professionalTerm: 'Dose and exposure adequacy',
  },
  ENDPOINT_VALIDITY: {
    question: 'Was the right outcome measured?',
    professionalTerm: 'Endpoint validity',
  },
  DURATION_OPERATIONAL_INTEGRITY: {
    question: 'Did the study run long enough and as planned?',
    professionalTerm: 'Duration and operational integrity',
  },
}

function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function safeSourceHref(value: string): string | undefined {
  return resolveSafeSourceLocator(value)?.href ?? undefined
}

function hasSafeSourceLocator(value: string): boolean {
  return resolveSafeSourceLocator(value) !== null
}

function displayNumericValue(value: string | null | undefined): string | undefined {
  const stored = text(value)
  if (!stored || !/^-?\d+\.\d+$/.test(stored)) return stored
  const withoutPadding = stored.replace(/\.?0+$/, '')
  return withoutPadding === '-0' ? '0' : withoutPadding
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function humanStudyType(value: 'YES' | 'NO' | 'UNKNOWN'): string {
  if (value === 'YES') return 'Human study'
  if (value === 'NO') return 'Not a human study'
  return 'Human-study status not recorded'
}

function claimNature(value: ClaimNature): EvidenceClaimNature {
  const map: Record<ClaimNature, EvidenceClaimNature> = {
    MEASURED: 'measured',
    SPONSOR_REPORTED: 'sponsor_reported',
    REGULATORY_FINDING: 'regulatory_finding',
    RNAWIKI_JUDGEMENT: 'rnawiki_judgement',
    UNKNOWN: 'unknown',
  }
  return map[value]
}

const RESULT_DIRECTIONS = new Set<PublishedClaimReadModel['direction']>([
  'INCREASE',
  'DECREASE',
  'NO_CHANGE',
  'MIXED',
])

function normalizedOutcomeType(claim: PublishedClaimReadModel): string | undefined {
  return text(claim.outcomeType)
    ?.replace(/[\s-]+/g, '_')
    .toUpperCase()
}

function isStructuredMeasuredOutcomeClaim(claim: PublishedClaimReadModel): boolean {
  if (claim.nature !== 'MEASURED') return false
  const outcomeType = normalizedOutcomeType(claim)
  const namesMeasuredOutcome = Boolean(text(claim.endpoint) || outcomeType)
  const recordsObservedResult =
    Boolean(displayNumericValue(claim.numericValue)) || RESULT_DIRECTIONS.has(claim.direction)

  return namesMeasuredOutcome && recordsObservedResult
}

/**
 * A study card is allowed to say that it has a result only when the published claim carries both
 * an explicit measured nature and structured result semantics. A dose-received count or an
 * operational note can remain a measured key outcome without becoming the study's headline
 * result. Structured safety outcomes are real study results and must not be relabelled as context.
 */
function isMeasuredStudyResultClaim(claim: PublishedClaimReadModel): boolean {
  if (!isStructuredMeasuredOutcomeClaim(claim) || claim.evidenceNodeType === 'HUMAN_EXPOSURE') {
    return false
  }
  return normalizedOutcomeType(claim) !== 'OPERATIONAL'
}

function keyOutcomeDisplayState(claim: PublishedClaimReadModel): EvidenceDisplayState {
  if (isStructuredMeasuredOutcomeClaim(claim)) return 'measured'
  if (claim.nature === 'UNKNOWN') return 'unknown'

  // The normalized read model has no dedicated, reviewed inference relationship. Sponsor reports,
  // regulatory findings and reviewer judgements therefore stay neutral instead of being relabelled
  // as inferred merely because of who recorded or interpreted them.
  return 'recorded_context'
}

function freshnessState(status: SourceFreshnessStatus): DossierFreshnessState {
  if (status === 'CURRENT') return 'current'
  if (status === 'NEW_EVIDENCE' || status === 'REVIEW_IN_PROGRESS') return 'review_required'
  if (
    status === 'DUE' ||
    status === 'STALE' ||
    status === 'SOURCE_UNAVAILABLE' ||
    status === 'CHECK_FAILED'
  ) {
    return 'stale'
  }
  return 'unknown'
}

function effectiveFreshnessState(
  state: ProgrammeFreshnessReadModel,
  now: Date,
): DossierFreshnessState {
  if (
    state.freshnessStatus === 'CURRENT' &&
    state.nextCheckDueAt !== null &&
    Date.parse(state.nextCheckDueAt) <= now.getTime()
  ) {
    return 'stale'
  }
  return freshnessState(state.freshnessStatus)
}

function aggregateFreshness(
  states: readonly ProgrammeFreshnessReadModel[],
  now: Date,
): DossierFreshnessState {
  const mapped = states.map((state) => effectiveFreshnessState(state, now))
  if (mapped.includes('review_required')) return 'review_required'
  if (mapped.includes('stale')) return 'stale'
  if (mapped.length > 0 && mapped.every((state) => state === 'current')) return 'current'
  return 'unknown'
}

function newestDate(values: Array<string | null>): string | undefined {
  return values
    .flatMap((value) => (value ? [value] : []))
    .sort((left, right) => right.localeCompare(left))[0]
}

function freshnessLabel(
  states: readonly ProgrammeFreshnessReadModel[],
  aggregate: DossierFreshnessState,
): string {
  if (states.some((state) => state.freshnessStatus === 'NEW_EVIDENCE')) return 'New evidence found'
  if (states.some((state) => state.freshnessStatus === 'REVIEW_IN_PROGRESS')) {
    return 'Review in progress'
  }
  if (states.some((state) => state.freshnessStatus === 'SOURCE_UNAVAILABLE')) {
    return 'Source unavailable'
  }
  if (aggregate === 'stale') return 'Evidence may be out of date'
  const verifiedAt = newestDate(states.map((state) => state.lastVerifiedAt))
  if (aggregate === 'current' && verifiedAt) return `Checked on ${verifiedAt.slice(0, 10)}`
  return 'Source check not completed'
}

function exactResult(claim: PublishedClaimReadModel): string | undefined {
  const value = displayNumericValue(claim.numericValue)
  if (!value) return undefined
  const unit = text(claim.numericUnit)
  return unit ? `${value} ${unit}` : value
}

function sourceViews(
  evidence: NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>,
  now: Date,
): EvidenceSourceView[] {
  const freshnessBySource = new Map(evidence.freshness.map((state) => [state.sourceId, state]))
  const bySnapshot = new Map<string, EvidenceSourceView>()

  for (const claim of evidence.claims) {
    for (const source of claim.sources) {
      if (bySnapshot.has(source.id)) continue
      const sourceFreshness = freshnessBySource.get(source.sourceId)
      bySnapshot.set(source.id, {
        id: source.id,
        label: text(source.title) ?? text(source.externalIdentifier) ?? source.canonicalLocator,
        href: safeSourceHref(source.canonicalLocator),
        canonicalLocator: source.canonicalLocator,
        identifier: text(source.externalIdentifier),
        snapshotHash: source.contentHash,
        retrievedAt: source.retrievedAt,
        verifiedAt: source.lastVerifiedAt ?? sourceFreshness?.lastVerifiedAt ?? undefined,
        freshness: sourceFreshness ? effectiveFreshnessState(sourceFreshness, now) : 'unknown',
      })
    }
  }

  for (const trial of evidence.trials) {
    const source = trial.registrySnapshot
    if (!source || bySnapshot.has(source.snapshotId)) continue
    const sourceFreshness = freshnessBySource.get(source.sourceId)
    bySnapshot.set(source.snapshotId, {
      id: source.snapshotId,
      label: text(source.sourceTitle) ?? text(source.externalIdentifier) ?? source.canonicalLocator,
      href: safeSourceHref(source.canonicalLocator),
      canonicalLocator: source.canonicalLocator,
      identifier: text(source.externalIdentifier),
      snapshotHash: source.contentHash,
      retrievedAt: source.retrievedAt,
      verifiedAt: source.lastVerifiedAt ?? sourceFreshness?.lastVerifiedAt ?? undefined,
      freshness: sourceFreshness ? effectiveFreshnessState(sourceFreshness, now) : 'unknown',
    })
  }

  const presentationSources = evidence.presentation
    ? [
        ...evidence.presentation.mechanismSteps.flatMap((step) => step.sources),
        ...evidence.presentation.timelineEvents.map((event) => event.source),
      ]
    : []
  for (const source of presentationSources) {
    if (bySnapshot.has(source.sourceSnapshotId)) continue
    const sourceFreshness = freshnessBySource.get(source.sourceId)
    bySnapshot.set(source.sourceSnapshotId, {
      id: source.sourceSnapshotId,
      label: text(source.title) ?? text(source.externalIdentifier) ?? source.canonicalLocator,
      href: safeSourceHref(source.canonicalLocator),
      canonicalLocator: source.canonicalLocator,
      identifier: text(source.externalIdentifier),
      snapshotHash: source.contentHash,
      retrievedAt: source.retrievedAt,
      verifiedAt: sourceFreshness?.lastVerifiedAt ?? undefined,
      freshness: sourceFreshness ? effectiveFreshnessState(sourceFreshness, now) : 'unknown',
    })
  }

  return [...bySnapshot.values()]
}

function evidenceNodes(
  evidence: NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>,
): EvidenceNodeView[] {
  const claimById = new Map(evidence.claims.map((claim) => [claim.id, claim]))

  return evidence.evidenceNodes
    .map((node): EvidenceNodeView => {
      const presentation = NODE_PRESENTATION[node.nodeType]
      const claimIds = [
        ...node.supportingClaimIds,
        ...node.contradictingClaimIds,
        ...node.qualifyingClaimIds,
      ]
      const linkedClaims = claimIds.flatMap((id) => {
        const claim = claimById.get(id)
        return claim ? [claim] : []
      })
      const knownNatures = new Set(
        linkedClaims
          .map((claim) => claimNature(claim.nature))
          .filter((nature) => nature !== 'unknown'),
      )
      const displayedNature: EvidenceClaimNature =
        knownNatures.size > 1
          ? 'mixed'
          : knownNatures.size === 1
            ? [...knownNatures][0]!
            : 'unknown'
      const state: EvidenceNodeView['state'] = node.state.toLowerCase() as EvidenceNodeView['state']

      return {
        id: node.id,
        order: presentation.order,
        label: presentation.label,
        professionalLabel: presentation.professionalLabel,
        title: presentation.question,
        summary:
          text(node.plainSummary) ??
          text(node.rationale) ??
          'No reviewed plain-language summary was published for this evidence node.',
        state,
        claimNature: displayedNature,
        sourceIds: [
          ...new Set(linkedClaims.flatMap((claim) => claim.sources.map((source) => source.id))),
        ],
        machineChecked: true,
        findingCodes: [],
        claims: linkedClaims.map((claim) => ({
          id: claim.id,
          nature: claimNature(claim.nature),
          text: claim.plainLanguageText,
          technicalText: text(claim.technicalText),
          population: text(claim.population),
          intervention: text(claim.intervention),
          comparator: text(claim.comparator),
          dose: text(claim.dose),
          route: text(claim.route),
          duration: text(claim.duration),
          endpoint: text(claim.endpoint),
          endpointHierarchy: text(claim.endpointHierarchy),
          outcomeType: text(claim.outcomeType),
          direction: claim.direction,
          timepoint: text(claim.timepoint),
          exactResult: exactResult(claim),
          uncertaintyInterval: text(claim.uncertaintyInterval),
          lastVerifiedAt: claim.lastVerifiedAt ?? undefined,
          sourceIds: [...new Set(claim.sources.map((source) => source.id))],
        })),
      }
    })
    .sort((left, right) => left.order - right.order)
}

function interpretability(
  trial: NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>['trials'][number],
  claimById: ReadonlyMap<string, PublishedClaimReadModel>,
): StudyInterpretabilityView[] {
  return trial.interpretability.map((assessment) => {
    const presentation = INTERPRETABILITY_PRESENTATION[assessment.criterion]
    const claimIds = [
      ...assessment.supportingClaimIds,
      ...assessment.contradictingClaimIds,
      ...assessment.qualifyingClaimIds,
    ]
    return {
      id: assessment.id,
      question: presentation.question,
      professionalTerm: presentation.professionalTerm,
      state: assessment.state.toLowerCase() as StudyInterpretabilityView['state'],
      explanation: text(assessment.explanation),
      claimIds: [...new Set(claimIds)],
      sourceIds: [
        ...new Set(
          claimIds.flatMap(
            (claimId) => claimById.get(claimId)?.sources.map((source) => source.id) ?? [],
          ),
        ),
      ],
    }
  })
}

function programmeOptions(model: ProgrammeEvidenceReadModel) {
  return model.programmes.map((programme) => ({
    id: programme.slug,
    label: programme.title,
    status: humanize(programme.status),
    href: `?programme=${encodeURIComponent(programme.slug)}`,
  }))
}

function presentationMechanismSteps(
  presentation: ProgrammePresentationReadModel | null,
): MechanismStepView[] {
  if (!presentation) return []
  const steps = [...presentation.mechanismSteps].sort(
    (left, right) => left.stepOrder - right.stepOrder || left.stepKey.localeCompare(right.stepKey),
  )
  const complete =
    steps.length >= 3 &&
    steps.length <= 5 &&
    steps.every(
      (step, index) =>
        step.stepOrder === index + 1 &&
        Boolean(text(step.plainTitle)) &&
        Boolean(text(step.plainDescription)) &&
        step.claimLinks.some(
          (link) => link.relationship === 'SUPPORTS' || link.relationship === 'QUALIFIES',
        ) &&
        step.sources.length > 0 &&
        step.sources.every(
          (source) =>
            hasSafeSourceLocator(source.canonicalLocator) &&
            source.claimBindings.every((binding) =>
              step.claimLinks.some(
                (link) =>
                  link.claimId === binding.claimId && link.relationship === binding.relationship,
              ),
            ),
        ) &&
        step.claimLinks.every((link) =>
          step.sources.some((source) =>
            source.claimBindings.some(
              (binding) =>
                binding.claimId === link.claimId && binding.relationship === link.relationship,
            ),
          ),
        ),
    )
  if (!complete) return []

  return steps.map((step) => ({
    id: step.stepKey,
    order: step.stepOrder,
    title: step.plainTitle,
    plainLanguage: step.plainDescription,
    technicalDetail: text(step.technicalDescription),
    evidenceBasis: step.evidenceBasis,
    claimIds: uniqueSorted(step.claimLinks.map((link) => link.claimId)),
    sourceIds: uniqueSorted(step.sources.map((source) => source.sourceSnapshotId)),
    sourceClaimBindings: step.sources.flatMap((source) =>
      source.claimBindings.map((binding) => ({
        sourceId: source.sourceSnapshotId,
        claimId: binding.claimId,
        relationship: binding.relationship,
        statement: binding.plainLanguageText,
      })),
    ),
  }))
}

function presentationTimelineEvents(
  presentation: ProgrammePresentationReadModel | null,
  publicationHistory: readonly ProgrammePresentationPublicationReadModel[],
): ProgrammeTimelineEventView[] {
  if (!presentation) return []
  const sourceEvents: ProgrammeTimelineEventView[] = presentation.timelineEvents.flatMap(
    (event) => {
      const title = text(event.plainTitle)
      const description = text(event.plainDescription)
      const hasSupportingClaim = event.claimLinks.some((link) => link.relationship === 'SUPPORTS')
      if (
        !title ||
        !description ||
        !hasSupportingClaim ||
        !event.source.sourceSnapshotId ||
        event.source.sourceSnapshotId !== event.sourceSnapshotId ||
        event.source.sourceId !== event.sourceId ||
        !hasSafeSourceLocator(event.source.canonicalLocator) ||
        !event.source.claimBindings.every((binding) =>
          event.claimLinks.some(
            (link) =>
              link.claimId === binding.claimId && link.relationship === binding.relationship,
          ),
        ) ||
        !event.source.claimBindings.some((binding) => binding.relationship === 'SUPPORTS')
      ) {
        return []
      }
      return [
        {
          id: `source:${event.eventKey}`,
          date: event.eventDate,
          provenance: 'source' as const,
          eventType: event.eventType,
          dateBasis: event.dateBasis,
          title,
          description,
          technicalDetail: text(event.technicalDescription),
          programmeTrialId: text(event.programmeTrialId),
          claimIds: uniqueSorted(event.claimLinks.map((link) => link.claimId)),
          sourceIds: [event.sourceSnapshotId],
          sourceClaimBindings: event.source.claimBindings.map((binding) => ({
            sourceId: event.sourceSnapshotId,
            claimId: binding.claimId,
            relationship: binding.relationship,
            statement: binding.plainLanguageText,
          })),
        },
      ]
    },
  )
  // An administrative date is useful only when the programme already has a source-authored event.
  // This prevents an RNAWiki-only activity feed from masquerading as development history.
  if (sourceEvents.length === 0) return []

  const sortedHistory = [...publicationHistory].sort(
    (left, right) =>
      left.revisionNumber - right.revisionNumber ||
      left.publishedAt.localeCompare(right.publishedAt),
  )
  const rnawikiEvents: ProgrammeTimelineEventView[] = sortedHistory.flatMap((revision, index) => {
    const publishedAt = text(revision.publishedAt)
    if (!publishedAt) return []
    const isFirst = index === 0
    return [
      {
        id: `rnawiki:${revision.revisionId}`,
        date: publishedAt,
        provenance: 'rnawiki' as const,
        eventType: isFirst ? ('PUBLICATION' as const) : ('REVISION' as const),
        title: isFirst
          ? 'RNAWiki published the first reviewed conclusion'
          : `RNAWiki published reviewed conclusion ${revision.revisionNumber}`,
        description: isFirst
          ? 'This reviewed version became the first public conclusion for the selected use.'
          : 'This reviewed version replaced the earlier public conclusion for the selected use.',
        claimIds: [],
        sourceIds: [],
        sourceClaimBindings: [],
      },
    ]
  })

  return [...sourceEvents, ...rnawikiEvents].sort(
    (left, right) => left.date.localeCompare(right.date) || left.id.localeCompare(right.id),
  )
}

/**
 * Converts only the authoritative published programme graph into public UI data. An identified
 * programme without a current verdict gets an explicit empty audit state; legacy medicine prose
 * is never silently relabelled as that programme's conclusion.
 */
export function programmeEvidenceMedicineDossierView(
  drug: DrugDossier,
  model: ProgrammeEvidenceReadModel,
  now: Date = new Date(),
): MedicineDossierViewModel {
  const selected = model.selectedProgramme
  if (!selected) return legacyMedicineDossierView(drug)

  const programmes = programmeOptions(model)
  const aggregate = aggregateFreshness(selected.freshness, now)
  const aggregateLabel = freshnessLabel(selected.freshness, aggregate)
  const claimById = new Map(selected.claims.map((claim) => [claim.id, claim]))

  if (!selected.verdict) {
    const legacy = legacyMedicineDossierView(drug)
    return {
      ...legacy,
      programmes: programmes.map((programme) => ({
        ...programme,
        selected: programme.id === selected.slug,
      })),
      selectedProgrammeId: selected.slug,
      selectedProgrammeLabel: selected.title,
      selectedProgrammeStatus: humanize(selected.status),
      approvalStatus: humanize(selected.status),
      statusBadge: { kind: 'programme_status', value: selected.status },
      bindingState: 'programme_unpublished',
      verdict: '',
      readerSummary: buildUnpublishedProgrammeReaderSummary({
        medicineName: drug.name,
        modality: drug.modality,
        targetGene: text(drug.targetGene),
        targetProtein: text(drug.targetProtein),
        trialIdentifiers: selected.trials.map((trial) => trial.trialIdentifier),
        selectedUse: selected.title,
      }),
      mechanismSummary: {},
      mainLimitation: undefined,
      tenSecondWordCount: 0,
      evidenceNodes: [],
      studies: selected.trials.map((trial) => ({
        id: trial.trialIdentifier,
        title: text(trial.title),
        phase: text(trial.phase),
        status: humanize(trial.status),
        studyType: humanStudyType(trial.humanStudyStatus),
        startDate: text(trial.startDate),
        completionDate: text(trial.completionDate),
        sampleSize: trial.enrolment && trial.enrolment > 0 ? trial.enrolment : undefined,
        enrolmentType: trial.enrolmentType,
        state: 'unknown' as const,
        registrySourceId: trial.registrySnapshot?.snapshotId,
        sourceIds: trial.registrySnapshot ? [trial.registrySnapshot.snapshotId] : [],
        interpretability: interpretability(trial, claimById),
      })),
      keyOutcomes: [],
      mechanismSteps: [],
      timelineEvents: [],
      sources: sourceViews(selected, now),
      freshness: aggregate,
      freshnessLabel: aggregateLabel,
      review: {
        historyHref: `/d/${encodeURIComponent(drug.id)}/programme/${encodeURIComponent(selected.slug)}/history`,
      },
      conclusion: undefined,
      machineFindingCodes: ['PROGRAMME_VERDICT_NOT_PUBLISHED'],
    }
  }

  const verdict = selected.verdict
  const claimByTrial = new Map<string, PublishedClaimReadModel[]>()
  for (const claim of selected.claims) {
    if (!claim.programmeTrialId) continue
    const claims = claimByTrial.get(claim.programmeTrialId) ?? []
    claims.push(claim)
    claimByTrial.set(claim.programmeTrialId, claims)
  }

  const studies = selected.trials.map((trial) => {
    const claims = claimByTrial.get(trial.id) ?? []
    const measuredResultClaims = claims.filter(isMeasuredStudyResultClaim)
    const resultClaim =
      measuredResultClaims.find((claim) => normalizedOutcomeType(claim) !== 'SAFETY') ??
      measuredResultClaims[0]
    const endpointClaim =
      resultClaim && text(resultClaim.endpoint)
        ? resultClaim
        : claims.find((claim) => text(claim.endpoint))
    const sourceIds = [
      ...(trial.registrySnapshot ? [trial.registrySnapshot.snapshotId] : []),
      ...claims.flatMap((claim) => claim.sources.map((source) => source.id)),
    ]
    return {
      id: trial.trialIdentifier,
      title: text(trial.title),
      phase: text(trial.phase),
      status: humanize(trial.status),
      studyType: humanStudyType(trial.humanStudyStatus),
      startDate: text(trial.startDate),
      completionDate: text(trial.completionDate),
      sampleSize: trial.enrolment && trial.enrolment > 0 ? trial.enrolment : undefined,
      enrolmentType: trial.enrolmentType,
      endpoint: text(endpointClaim?.endpoint),
      endpointHierarchy: text(endpointClaim?.endpointHierarchy),
      result: resultClaim?.plainLanguageText,
      state: resultClaim ? ('measured' as const) : ('unknown' as const),
      sourceIds: [...new Set(sourceIds)],
      registrySourceId: trial.registrySnapshot?.snapshotId,
      interpretability: interpretability(trial, claimById),
    }
  })

  const outcomeClaims = selected.claims
    .filter((claim) => claim.endpoint || claim.outcomeType || claim.numericValue)
    .slice(0, 5)

  return normalizedMedicineDossierView(drug, {
    selected: {
      id: selected.slug,
      label: selected.title,
      status: humanize(selected.status),
      statusBadge: { kind: 'programme_status', value: selected.status },
      href: `?programme=${encodeURIComponent(selected.slug)}`,
      verdict: verdict.oneSentenceReason,
      mechanismSummary: {
        change: verdict.plainMechanism,
        observed: verdict.bestSupportedFinding,
      },
      mainLimitation: verdict.mainLimitation,
      evidenceNodes: evidenceNodes(selected),
      studies,
      keyOutcomes: outcomeClaims.map((claim) => ({
        id: claim.id,
        label: claim.plainLanguageText,
        state: keyOutcomeDisplayState(claim),
        claimNature: claimNature(claim.nature),
        endpoint: text(claim.endpoint),
        endpointHierarchy: text(claim.endpointHierarchy),
        intervention: text(claim.intervention),
        comparator: text(claim.comparator),
        numericValue: displayNumericValue(claim.numericValue),
        numericUnit: text(claim.numericUnit),
        uncertaintyInterval: text(claim.uncertaintyInterval),
        direction: claim.direction,
        timepoint: text(claim.timepoint),
        outcomeType: text(claim.outcomeType),
        sourceIds: [...new Set(claim.sources.map((source) => source.id))],
      })),
      mechanismSteps: presentationMechanismSteps(selected.presentation),
      timelineEvents: presentationTimelineEvents(
        selected.presentation,
        selected.publicationHistory,
      ),
      sources: sourceViews(selected, now),
      freshness: aggregate,
      freshnessLabel: aggregateLabel,
      review: {
        revisionId: verdict.id,
        publishedAt: verdict.publishedAt,
        reviewedAt: verdict.reviewedAt,
        reviewerLabel:
          verdict.reviewers
            .filter((reviewer) => reviewer.decision === 'APPROVE' && reviewer.isIndependent)
            .map((reviewer) => reviewer.reviewerName)
            .join(', ') || verdict.authorName,
        engineVersion: verdict.engineVersion,
        inputDigest: verdict.inputDigest,
        historyHref: `/d/${encodeURIComponent(drug.id)}/programme/${encodeURIComponent(selected.slug)}/history`,
      },
      conclusion: {
        code: verdict.verdictCode ?? undefined,
        publicLabel: verdict.publicLabel,
        professionalLabel: verdict.professionalLabel,
        reason: verdict.oneSentenceReason,
        scope: {
          indication: verdict.indicationScope,
          population: verdict.populationScope,
          doseExposure: verdict.doseExposureScope,
          period: verdict.periodScope,
          trials: verdict.trialScope,
          outcome: verdict.outcomeScope,
        },
        whatWasDisproven: verdict.whatWasDisproven,
        whatWasNotDisproven: verdict.whatWasNotDisproven,
        whatRemainsUnknown: verdict.whatRemainsUnknown,
        confidence: humanize(verdict.confidence),
        confidenceExplanation: text(verdict.confidenceExplanation),
        conditionsThatWouldChangeVerdict: verdict.conditionsThatWouldChangeVerdict,
        authorName: verdict.authorName,
        conflictsOfInterest: text(verdict.conflictsOfInterest),
        reviewers: verdict.reviewers.map((reviewer) => ({
          id: reviewer.id,
          name: reviewer.reviewerName,
          orcid: text(reviewer.reviewerOrcidSnapshot),
          expertiseTags: reviewer.expertiseTags,
          decision: humanize(reviewer.decision),
          reviewedAt: reviewer.reviewedAt,
          independent: reviewer.isIndependent,
          conflictsOfInterest: text(reviewer.conflictsOfInterest),
        })),
      },
      machineFindingCodes: [],
    },
    programmes,
  })
}

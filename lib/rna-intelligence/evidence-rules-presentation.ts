import type { EvidenceEntityType } from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import { addFinding, parseIsoDate, ref } from './evidence-rule-utils'

function presentationEntityId(
  verdictRevisionId: string,
  kind: 'mechanism' | 'timeline',
  key: string,
): string {
  return `${verdictRevisionId}:${kind}:${key}`
}

function hasDependency(
  ctx: EvidenceRuleContext,
  claimIds: readonly string[],
  type: EvidenceEntityType,
  id: string,
): boolean {
  return ctx.dependencies.some(
    (dependency) =>
      dependency.from.type === 'CLAIM' &&
      claimIds.includes(dependency.from.id) &&
      dependency.to.type === type &&
      dependency.to.id === id &&
      dependency.impact !== 'LOW_RISK_EXACT_DATA',
  )
}

/** Deterministic presentation/v1 validation. Scientific meaning remains a reviewer decision. */
export function runPresentationRules(ctx: EvidenceRuleContext): void {
  const presentation = ctx.input.presentation
  if (!presentation) return

  const stepKeys = presentation.mechanismSteps.map((step) => step.id)
  const orders = presentation.mechanismSteps.map((step) => step.order).sort((a, b) => a - b)
  if (
    presentation.mechanismSteps.length < 3 ||
    presentation.mechanismSteps.length > 5 ||
    new Set(stepKeys).size !== stepKeys.length ||
    new Set(orders).size !== orders.length ||
    orders.some((order, index) => order !== index + 1) ||
    presentation.mechanismSteps.some((step) => step.programmeId !== presentation.programmeId)
  ) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'B',
      code: 'B_PRESENTATION_STRUCTURE_INVALID',
      message: 'The mechanism map is not one ordered sequence of three to five unique stages.',
      entity: ref('VERDICT', presentation.verdictRevisionId),
      field: 'presentation.mechanismSteps',
      correctiveAction:
        'Provide three to five unique stages, ordered contiguously from one, for this programme.',
    })
  }

  for (const step of [...presentation.mechanismSteps].sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  )) {
    const entityId = presentationEntityId(presentation.verdictRevisionId, 'mechanism', step.id)
    const justifyingLinks = step.claimLinks.filter(
      (link) => link.relationship === 'SUPPORTS' || link.relationship === 'QUALIFIES',
    )
    if (new Set(step.claimLinks.map((link) => link.claimId)).size !== step.claimLinks.length) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_PRESENTATION_RELATIONSHIP_CONFLICT',
        message: 'One mechanism claim is linked to the same stage more than once.',
        entity: ref('MECHANISM_STEP', entityId),
        field: 'claimLinks',
        correctiveAction:
          'Choose one reviewed relationship for each claim and mechanism stage; do not describe the same link in conflicting ways.',
      })
    }
    const claimsResolve = step.claimLinks.every((link) => {
      const claim = ctx.claims.get(link.claimId)
      return claim?.programmeId === presentation.programmeId
    })
    if (justifyingLinks.length === 0 || !claimsResolve) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_PRESENTATION_CLAIM_UNSUPPORTED',
        message: 'This mechanism stage has no in-scope claim that supports or qualifies its text.',
        entity: ref('MECHANISM_STEP', entityId),
        field: 'claimLinks',
        correctiveAction:
          'Link at least one exact in-programme SUPPORTS or QUALIFIES claim; contradiction alone cannot justify displayed mechanism text.',
      })
    }
    if (
      step.claimLinks.some(
        (link) =>
          link.supportingSourceSnapshotIds.length === 0 ||
          link.supportingSourceSnapshotIds.some((snapshotId) => !ctx.snapshots.has(snapshotId)),
      )
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_PRESENTATION_SOURCE_UNBOUND',
        message: 'A mechanism claim does not resolve to every exact cited source snapshot.',
        entity: ref('MECHANISM_STEP', entityId),
        field: 'claimLinks.supportingSourceSnapshotIds',
        correctiveAction:
          'Bind every mechanism claim to immutable, reviewed source snapshots that support that claim.',
      })
    }
    if (step.evidenceBasis === 'MEASURED_IN_PEOPLE') {
      const supportedByHumanMeasurement = justifyingLinks.some((link) => {
        const claim = ctx.claims.get(link.claimId)
        const trial = claim?.trialId ? ctx.trials.get(claim.trialId) : undefined
        return (
          trial?.programmeId === presentation.programmeId &&
          trial.subjectType === 'HUMAN' &&
          ['MEASURED', 'REGULATORY_FINDING'].includes(claim?.nature ?? '')
        )
      })
      if (!supportedByHumanMeasurement) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'E',
          code: 'E_MEASURED_IN_PEOPLE_UNSUPPORTED',
          message:
            'This stage is labelled measured in people without a measured human-study claim.',
          entity: ref('MECHANISM_STEP', entityId),
          field: 'evidenceBasis',
          correctiveAction:
            'Link a measured claim from an exact scoped human trial or choose a less direct evidence basis.',
        })
      }
    }
    if (step.evidenceBasis === 'MEASURED_OUTSIDE_PEOPLE') {
      const supportedByNonHumanMeasurement = justifyingLinks.some((link) => {
        const claim = ctx.claims.get(link.claimId)
        const trial = claim?.trialId ? ctx.trials.get(claim.trialId) : undefined
        return (
          trial?.programmeId === presentation.programmeId &&
          ['ANIMAL', 'IN_VITRO', 'OTHER'].includes(trial.subjectType) &&
          claim?.nature === 'MEASURED'
        )
      })
      if (!supportedByNonHumanMeasurement) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'E',
          code: 'E_MEASURED_OUTSIDE_PEOPLE_UNSUPPORTED',
          message:
            'This stage is labelled measured outside people without a measured non-human or laboratory-study claim.',
          entity: ref('MECHANISM_STEP', entityId),
          field: 'evidenceBasis',
          correctiveAction:
            'Link a measured claim from an exact scoped non-human or laboratory study, or choose a different evidence basis.',
        })
      }
    }
    if (
      !hasDependency(
        ctx,
        justifyingLinks.map((link) => link.claimId),
        'MECHANISM_STEP',
        entityId,
      )
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'H',
        code: 'H_PRESENTATION_DEPENDENCY_MISSING',
        message: 'This mechanism stage is absent from the reviewed claim-to-surface graph.',
        entity: ref('MECHANISM_STEP', entityId),
        field: 'dependencies',
        correctiveAction:
          'Add an exact verdict-scoped dependency from a justifying claim to this mechanism stage.',
      })
    }
  }

  const asOfDate = parseIsoDate(ctx.input.asOfDate)
  const eventIds = presentation.timelineEvents.map((event) => event.id)
  for (const event of [...presentation.timelineEvents].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  )) {
    const entityId = presentationEntityId(presentation.verdictRevisionId, 'timeline', event.id)
    if (new Set(event.claimLinks.map((link) => link.claimId)).size !== event.claimLinks.length) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_PRESENTATION_RELATIONSHIP_CONFLICT',
        message: 'One timeline claim is linked to the same event more than once.',
        entity: ref('TIMELINE_EVENT', entityId),
        field: 'claimLinks',
        correctiveAction:
          'Choose one reviewed relationship for each claim and timeline event; do not describe the same link in conflicting ways.',
      })
    }
    const eventDate = parseIsoDate(event.date)
    if (
      eventDate === null ||
      (event.dateBasis !== 'PLANNED' && asOfDate !== null && eventDate > asOfDate)
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_TIMELINE_DATE_INVALID',
        message: 'This timeline date is invalid or reports a future event as already observed.',
        entity: ref('TIMELINE_EVENT', entityId),
        field: 'date',
        correctiveAction:
          'Use a valid ISO date and mark future milestones as PLANNED; do not present them as actual or unclear past events.',
      })
    }
    const snapshot = ctx.snapshots.get(event.sourceSnapshotId)
    const supportingLinks = event.claimLinks.filter((link) => link.relationship === 'SUPPORTS')
    const exactCitation = supportingLinks.some((link) =>
      link.supportingSourceSnapshotIds.includes(event.sourceSnapshotId),
    )
    if (
      snapshot?.sourceId !== event.sourceId ||
      !ctx.sources.has(event.sourceId) ||
      !exactCitation
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_PRESENTATION_SOURCE_UNBOUND',
        message: 'This event is not bound to the exact source snapshot cited by a SUPPORTS claim.',
        entity: ref('TIMELINE_EVENT', entityId),
        field: 'sourceSnapshotId',
        correctiveAction:
          'Use the same source and immutable snapshot on the event and one linked SUPPORTS claim.',
        sourceId: event.sourceId,
      })
    }
    const claimsResolve = supportingLinks.some(
      (link) => ctx.claims.get(link.claimId)?.programmeId === presentation.programmeId,
    )
    if (!claimsResolve) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_PRESENTATION_CLAIM_UNSUPPORTED',
        message: 'This timeline event has no in-scope supporting claim.',
        entity: ref('TIMELINE_EVENT', entityId),
        field: 'claimLinks',
        correctiveAction: 'Link an exact in-programme SUPPORTS claim for this event.',
      })
    }
    if (
      !hasDependency(
        ctx,
        supportingLinks.map((link) => link.claimId),
        'TIMELINE_EVENT',
        entityId,
      )
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'H',
        code: 'H_PRESENTATION_DEPENDENCY_MISSING',
        message: 'This timeline event is absent from the reviewed claim-to-surface graph.',
        entity: ref('TIMELINE_EVENT', entityId),
        field: 'dependencies',
        correctiveAction:
          'Add an exact verdict-scoped dependency from its supporting claim to this event.',
      })
    }
  }
  if (new Set(eventIds).size !== eventIds.length) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'B',
      code: 'B_PRESENTATION_STRUCTURE_INVALID',
      message: 'Timeline event keys must be unique inside one presentation.',
      entity: ref('VERDICT', presentation.verdictRevisionId),
      field: 'presentation.timelineEvents',
      correctiveAction: 'Give every source event one stable unique key.',
    })
  }
}

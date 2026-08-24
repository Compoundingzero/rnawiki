import type { DevelopmentPhase, ProgrammePhaseEvent } from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import {
  addFinding,
  duplicateValues,
  hasText,
  parseIsoDate,
  ref,
  sortedById,
} from './evidence-rule-utils'

const PHASE_RANK: Record<DevelopmentPhase, number> = {
  DISCOVERY: 0,
  PRECLINICAL: 1,
  PHASE_1: 2,
  PHASE_2: 3,
  PHASE_3: 4,
  REGULATORY: 5,
  APPROVED: 6,
}

function validateDateField(
  ctx: EvidenceRuleContext,
  entityType: 'PROGRAMME' | 'TRIAL' | 'CLAIM' | 'SOURCE' | 'SOURCE_SNAPSHOT',
  entityId: string,
  field: string,
  value: string | undefined,
): number | null {
  if (value === undefined) return null
  const parsed = parseIsoDate(value)
  if (parsed === null) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'D',
      code: 'D_DATE_INVALID',
      message: `${entityType.toLocaleLowerCase('en-US')} "${entityId}" has an invalid ${field} date.`,
      entity: ref(entityType, entityId, field),
      field,
      correctiveAction: 'Use a sourced ISO date or leave the field unset when the date is unknown.',
    })
  }
  return parsed
}

function orderedPhaseEvents(events: readonly ProgrammePhaseEvent[]): ProgrammePhaseEvent[] {
  return [...events].sort((a, b) => {
    const date = a.date.localeCompare(b.date)
    return date === 0 ? a.id.localeCompare(b.id) : date
  })
}

export function runGroupDChronology(ctx: EvidenceRuleContext): void {
  const asOf = parseIsoDate(ctx.input.asOfDate)

  for (const programme of sortedById(ctx.input.programmes)) {
    const start = validateDateField(
      ctx,
      'PROGRAMME',
      programme.id,
      'startDate',
      programme.startDate,
    )
    const end = validateDateField(ctx, 'PROGRAMME', programme.id, 'endDate', programme.endDate)
    if (start !== null && end !== null && end < start) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_PROGRAMME_END_BEFORE_START',
        message: `Programme "${programme.id}" ends before it starts.`,
        entity: ref('PROGRAMME', programme.id, 'endDate'),
        field: 'endDate',
        correctiveAction: 'Correct the sourced programme dates.',
      })
    }

    const phaseEvents = programme.phaseEvents ?? []
    for (const duplicate of duplicateValues(phaseEvents.map((event) => event.id))) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_DUPLICATE_PHASE_EVENT_ID',
        message: `Programme "${programme.id}" uses phase-event identifier "${duplicate}" more than once.`,
        entity: ref('PROGRAMME', programme.id, 'phaseEvents'),
        field: 'phaseEvents',
        correctiveAction: 'Assign every programme milestone a unique identifier.',
      })
    }

    const events = orderedPhaseEvents(phaseEvents)
    for (const event of events) {
      validateDateField(ctx, 'PROGRAMME', programme.id, `phaseEvents.${event.id}.date`, event.date)
    }
    for (let index = 1; index < events.length; index += 1) {
      const previous = events[index - 1]
      const current = events[index]
      if (!previous || !current || PHASE_RANK[current.phase] >= PHASE_RANK[previous.phase]) continue

      if (hasText(current.orderingExceptionReason)) {
        addFinding(ctx, {
          level: 'WARNING',
          group: 'D',
          code: 'D_PHASE_ORDER_EXCEPTION_RECORDED',
          message: `Programme "${programme.id}" moves from ${previous.phase} to ${current.phase}; an exception explanation is recorded.`,
          entity: ref('PROGRAMME', programme.id, `phaseEvents.${current.id}.phase`),
          field: `phaseEvents.${current.id}.phase`,
          correctiveAction:
            'Have a reviewer confirm that the overlapping or retrospective phase history is accurately sourced.',
        })
      } else {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'D',
          code: 'D_PHASE_ORDER_IMPOSSIBLE',
          message: `Programme "${programme.id}" moves backwards from ${previous.phase} to ${current.phase} without explanation.`,
          entity: ref('PROGRAMME', programme.id, `phaseEvents.${current.id}.phase`),
          field: `phaseEvents.${current.id}.phase`,
          correctiveAction:
            'Correct the milestone dates or record the sourced overlapping-phase exception.',
        })
      }
    }
  }

  for (const duplicate of duplicateValues(ctx.input.trials.map((trial) => trial.registrationId))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'D',
      code: 'D_DUPLICATE_TRIAL_IDENTIFIER',
      message: `Trial registration identifier "${duplicate}" appears more than once.`,
      entity: ref('TRIAL', duplicate, 'registrationId'),
      field: 'registrationId',
      correctiveAction:
        'Merge duplicate registrations or correct the identifier assigned to the wrong trial.',
    })
  }

  for (const trial of sortedById(ctx.input.trials)) {
    if (!hasText(trial.registrationId)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_TRIAL_IDENTIFIER_MISSING',
        message: `Trial "${trial.id}" has no registration identifier.`,
        entity: ref('TRIAL', trial.id, 'registrationId'),
        field: 'registrationId',
        correctiveAction: 'Add the registry identifier or a stable regulatory study identifier.',
      })
    }
    const start = validateDateField(ctx, 'TRIAL', trial.id, 'startDate', trial.startDate)
    const end = validateDateField(ctx, 'TRIAL', trial.id, 'endDate', trial.endDate)
    if (start !== null && end !== null && end < start) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_TRIAL_END_BEFORE_START',
        message: `Trial "${trial.registrationId}" ends before it starts.`,
        entity: ref('TRIAL', trial.id, 'endDate'),
        field: 'endDate',
        correctiveAction: 'Correct the trial dates from the registry or primary record.',
      })
    }
  }

  for (const duplicate of duplicateValues(ctx.input.claims.map((claim) => claim.id))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'D',
      code: 'D_DUPLICATE_CLAIM_ID',
      message: `More than one evidence claim uses the identifier "${duplicate}".`,
      entity: ref('CLAIM', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign every immutable claim revision a unique identifier.',
      claimId: duplicate,
    })
  }

  for (const claim of sortedById(ctx.input.claims)) {
    const resultDate = validateDateField(ctx, 'CLAIM', claim.id, 'resultDate', claim.resultDate)
    const trial = claim.trialId ? ctx.trials.get(claim.trialId) : undefined

    if (claim.trialId && !trial) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_CLAIM_TRIAL_NOT_FOUND',
        message: `Claim "${claim.id}" links to missing trial "${claim.trialId}".`,
        entity: ref('CLAIM', claim.id, 'trialId'),
        field: 'trialId',
        correctiveAction: 'Link the claim to the trial that produced the result.',
        claimId: claim.id,
      })
    }

    if (trial) {
      const trialStart = parseIsoDate(trial.startDate)
      if (resultDate !== null && trialStart !== null && resultDate < trialStart) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'D',
          code: 'D_RESULT_BEFORE_TRIAL_START',
          message: `Claim "${claim.id}" reports a result dated before trial "${trial.registrationId}" began.`,
          entity: ref('CLAIM', claim.id, 'resultDate'),
          field: 'resultDate',
          correctiveAction: 'Correct the result date or trial link from the source record.',
          claimId: claim.id,
        })
      }
      if (claim.programmeId && trial.programmeId !== claim.programmeId) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'D',
          code: 'D_CLAIM_TRIAL_PROGRAMME_MISMATCH',
          message: `Claim "${claim.id}" and trial "${trial.registrationId}" belong to different programmes.`,
          entity: ref('CLAIM', claim.id, 'trialId'),
          field: 'trialId',
          correctiveAction: 'Link the claim to the trial in the same development programme.',
          claimId: claim.id,
        })
      }
      if (claim.participantOutcome === true && trial.subjectType !== 'HUMAN') {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'D',
          code: 'D_PARTICIPANT_OUTCOME_ON_NON_HUMAN_TRIAL',
          message: `Claim "${claim.id}" presents a participant outcome from a ${trial.subjectType.toLocaleLowerCase('en-US')} record.`,
          entity: ref('CLAIM', claim.id, 'participantOutcome'),
          field: 'participantOutcome',
          correctiveAction:
            'Classify the outcome as preclinical or link it to the correct human trial.',
          claimId: claim.id,
        })
      }
    }

    if (claim.comparatorResult && !hasText(claim.comparatorResult.group)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_COMPARATOR_GROUP_MISSING',
        message: `Claim "${claim.id}" gives a comparator result without identifying the comparator group.`,
        entity: ref('CLAIM', claim.id, 'comparatorResult.group'),
        field: 'comparatorResult.group',
        correctiveAction:
          'Name the placebo, active comparator, baseline, or control group reported by the source.',
        claimId: claim.id,
      })
    }

    if (asOf !== null && resultDate !== null && resultDate > asOf) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'D',
        code: 'D_RESULT_DATE_IN_FUTURE',
        message: `Claim "${claim.id}" has a result date after the evidence review date.`,
        entity: ref('CLAIM', claim.id, 'resultDate'),
        field: 'resultDate',
        correctiveAction:
          'Correct the result date or advance the explicit review date only after the source is available.',
        claimId: claim.id,
      })
    }
  }

  for (const source of sortedById(ctx.input.sources)) {
    const publication = validateDateField(
      ctx,
      'SOURCE',
      source.id,
      'publicationDate',
      source.publicationDate,
    )
    const snapshots = ctx.snapshotsBySource.get(source.id) ?? []
    for (const snapshot of snapshots) {
      const retrieved = parseIsoDate(snapshot.retrievedAt)
      if (publication !== null && retrieved !== null && publication > retrieved) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'D',
          code: 'D_SOURCE_PUBLISHED_AFTER_RETRIEVAL',
          message: `Source "${source.id}" is dated after snapshot "${snapshot.id}" says it was retrieved.`,
          entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'retrievedAt'),
          field: 'retrievedAt',
          correctiveAction: 'Correct the publication or retrieval date from the source metadata.',
          sourceId: source.id,
        })
      }
      if (asOf !== null && retrieved !== null && retrieved > asOf) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'D',
          code: 'D_SNAPSHOT_DATE_IN_FUTURE',
          message: `Snapshot "${snapshot.id}" was retrieved after the evidence review date.`,
          entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'retrievedAt'),
          field: 'retrievedAt',
          correctiveAction:
            'Correct the retrieval date or use the review date that includes this snapshot.',
          sourceId: source.id,
        })
      }
      if (snapshot.previousSnapshotId) {
        const previous = ctx.snapshots.get(snapshot.previousSnapshotId)
        const previousDate = parseIsoDate(previous?.retrievedAt)
        if (retrieved !== null && previousDate !== null && previousDate >= retrieved) {
          addFinding(ctx, {
            level: 'BLOCK',
            group: 'D',
            code: 'D_SNAPSHOT_CHAIN_NOT_CHRONOLOGICAL',
            message: `Snapshot "${snapshot.id}" does not come after its previous snapshot.`,
            entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'previousSnapshotId'),
            field: 'previousSnapshotId',
            correctiveAction:
              'Link snapshots in retrieval order without rewriting earlier versions.',
            sourceId: source.id,
          })
        }
      }
    }
  }
}

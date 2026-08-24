import type { EvidenceRuleContext } from './evidence-rule-utils'
import { addFinding, duplicateValues, hasText, ref, sortedById } from './evidence-rule-utils'

const STOPPED_STATUSES = new Set(['STOPPED', 'WITHDRAWN'])

function sameScopeText(a: string, b: string): boolean {
  return a.trim().toLocaleLowerCase('en-US') === b.trim().toLocaleLowerCase('en-US')
}

export function runGroupBProgrammeScope(ctx: EvidenceRuleContext): void {
  const medicineId = ctx.input.medicine.id

  for (const duplicate of duplicateValues(ctx.input.programmes.map((item) => item.id))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'B',
      code: 'B_DUPLICATE_PROGRAMME_ID',
      message: `More than one development programme uses the identifier "${duplicate}".`,
      entity: ref('PROGRAMME', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign one stable, unique identifier to each development programme.',
    })
  }

  for (const programme of sortedById(ctx.input.programmes)) {
    if (programme.medicineId !== medicineId) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_PROGRAMME_MEDICINE_MISMATCH',
        message: `Programme "${programme.id}" belongs to medicine "${programme.medicineId}", not the medicine being checked.`,
        entity: ref('PROGRAMME', programme.id, 'medicineId'),
        field: 'medicineId',
        correctiveAction: 'Link the programme to the medicine record that owns it.',
      })
    }

    const normalizedPopulation = programme.population.trim().toLocaleLowerCase('en-US')
    if (
      !hasText(programme.population) ||
      ctx.policy.vaguePopulationLabels.some(
        (label) => label.trim().toLocaleLowerCase('en-US') === normalizedPopulation,
      )
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'B',
        code: 'B_POPULATION_SCOPE_VAGUE',
        message: `Programme "${programme.id}" does not identify a sufficiently specific population.`,
        entity: ref('PROGRAMME', programme.id, 'population'),
        field: 'population',
        correctiveAction:
          'Describe the relevant population without implying the result applies to everyone.',
      })
    }

    if (!hasText(programme.doseOrExposure)) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'B',
        code: 'B_DOSE_CONTEXT_MISSING',
        message: `Programme "${programme.id}" has no dose or exposure context.`,
        entity: ref('PROGRAMME', programme.id, 'doseOrExposure'),
        field: 'doseOrExposure',
        correctiveAction:
          'Add the studied dose, route, or exposure range when a source provides it.',
      })
    }

    if (programme.approvalIsJurisdictionSpecific === true && !hasText(programme.jurisdiction)) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'B',
        code: 'B_APPROVAL_JURISDICTION_MISSING',
        message: `Programme "${programme.id}" presents a jurisdiction-specific approval without naming the jurisdiction.`,
        entity: ref('PROGRAMME', programme.id, 'jurisdiction'),
        field: 'jurisdiction',
        correctiveAction:
          'Name the regulator or jurisdiction to which the approval statement applies.',
      })
    }

    if (programme.combinesDistinctPopulations === true) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'B',
        code: 'B_DISTINCT_POPULATIONS_COMBINED',
        message: `Programme "${programme.id}" combines populations that may require separate evidence scopes.`,
        entity: ref('PROGRAMME', programme.id, 'population'),
        field: 'population',
        correctiveAction:
          'Split materially different populations or explain why one scope is valid.',
      })
    }

    if (programme.currentVerdictId) {
      const verdict = ctx.verdicts.get(programme.currentVerdictId)
      if (!verdict) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'B',
          code: 'B_CURRENT_VERDICT_NOT_FOUND',
          message: `Programme "${programme.id}" points to verdict "${programme.currentVerdictId}", which is not present.`,
          entity: ref('PROGRAMME', programme.id, 'currentVerdictId'),
          field: 'currentVerdictId',
          correctiveAction:
            'Link the programme to a stored verdict revision or clear the invalid pointer.',
        })
      } else if (verdict.programmeId !== programme.id) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'B',
          code: 'B_CURRENT_VERDICT_PROGRAMME_MISMATCH',
          message: `Programme "${programme.id}" points to a verdict owned by a different programme.`,
          entity: ref('PROGRAMME', programme.id, 'currentVerdictId'),
          field: 'currentVerdictId',
          correctiveAction: 'Use a verdict revision created for this programme.',
        })
      }
    }
  }

  for (const sharedVerdictId of duplicateValues(
    ctx.input.programmes
      .map((programme) => programme.currentVerdictId ?? '')
      .filter((id) => id.length > 0),
  )) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'B',
      code: 'B_MUTABLE_VERDICT_SHARED',
      message: `Verdict "${sharedVerdictId}" is the current mutable verdict for more than one programme.`,
      entity: ref('VERDICT', sharedVerdictId, 'programmeId'),
      field: 'programmeId',
      correctiveAction: 'Create independent verdict revisions for each development programme.',
    })
  }

  for (const claim of sortedById(ctx.input.claims)) {
    if (claim.isProgrammeLevel && !hasText(claim.programmeId)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_PROGRAMME_CLAIM_MISSING_PROGRAMME',
        message: `Programme-level claim "${claim.id}" has no programme identifier.`,
        entity: ref('CLAIM', claim.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Select the development programme to which this claim applies.',
        claimId: claim.id,
      })
      continue
    }

    if (claim.programmeId) {
      const programme = ctx.programmes.get(claim.programmeId)
      if (!programme) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'B',
          code: 'B_CLAIM_PROGRAMME_NOT_FOUND',
          message: `Claim "${claim.id}" links to missing programme "${claim.programmeId}".`,
          entity: ref('CLAIM', claim.id, 'programmeId'),
          field: 'programmeId',
          correctiveAction: 'Link the claim to a stored programme.',
          claimId: claim.id,
        })
      } else if (claim.medicineId !== programme.medicineId) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'B',
          code: 'B_CLAIM_MEDICINE_MISMATCH',
          message: `Claim "${claim.id}" and programme "${programme.id}" name different medicines.`,
          entity: ref('CLAIM', claim.id, 'medicineId'),
          field: 'medicineId',
          correctiveAction: 'Correct the claim or programme medicine link before publication.',
          claimId: claim.id,
        })
      }
    }
  }

  for (const duplicate of duplicateValues(ctx.input.trials.map((trial) => trial.id))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'B',
      code: 'B_DUPLICATE_TRIAL_ID',
      message: `More than one trial uses the internal identifier "${duplicate}".`,
      entity: ref('TRIAL', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign one stable internal identifier to each trial.',
    })
  }

  for (const trial of sortedById(ctx.input.trials)) {
    const programme = ctx.programmes.get(trial.programmeId)
    if (!programme) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_TRIAL_PROGRAMME_NOT_FOUND',
        message: `Trial "${trial.id}" links to missing programme "${trial.programmeId}".`,
        entity: ref('TRIAL', trial.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Link the trial to a stored development programme.',
      })
      continue
    }
    if (trial.medicineId !== programme.medicineId) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_TRIAL_MEDICINE_MISMATCH',
        message: `Trial "${trial.id}" and programme "${programme.id}" name different medicines.`,
        entity: ref('TRIAL', trial.id, 'medicineId'),
        field: 'medicineId',
        correctiveAction: 'Correct the trial medicine or programme link.',
      })
    }
    if (
      hasText(trial.indication) &&
      hasText(programme.indication) &&
      !sameScopeText(trial.indication, programme.indication)
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_TRIAL_INDICATION_MISMATCH',
        message: `Trial "${trial.id}" is labelled for a different indication than programme "${programme.id}".`,
        entity: ref('TRIAL', trial.id, 'indication'),
        field: 'indication',
        correctiveAction: 'Link the trial to the programme for the indication it actually studied.',
      })
    }
  }

  for (const duplicate of duplicateValues(ctx.input.verdicts.map((verdict) => verdict.id))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'B',
      code: 'B_DUPLICATE_VERDICT_ID',
      message: `More than one verdict revision uses the identifier "${duplicate}".`,
      entity: ref('VERDICT', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign an immutable, unique identifier to each verdict revision.',
    })
  }

  for (const verdict of sortedById(ctx.input.verdicts)) {
    if (!hasText(verdict.programmeId)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_ATTACHED_TO_MEDICINE',
        message: `Verdict "${verdict.id}" is attached to a medicine rather than a development programme.`,
        entity: ref('VERDICT', verdict.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Select the exact development programme this verdict evaluates.',
      })
      continue
    }

    const programme = ctx.programmes.get(verdict.programmeId)
    if (!programme) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_PROGRAMME_NOT_FOUND',
        message: `Verdict "${verdict.id}" links to missing programme "${verdict.programmeId}".`,
        entity: ref('VERDICT', verdict.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Link the verdict to a stored development programme.',
      })
      continue
    }

    if (verdict.medicineId !== programme.medicineId) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_MEDICINE_MISMATCH',
        message: `Verdict "${verdict.id}" and programme "${programme.id}" name different medicines.`,
        entity: ref('VERDICT', verdict.id, 'medicineId'),
        field: 'medicineId',
        correctiveAction: 'Correct the verdict medicine link.',
      })
    }

    if (!hasText(verdict.scope.indication)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_INDICATION_SCOPE_MISSING',
        message: `Verdict "${verdict.id}" does not state the intended use it evaluates.`,
        entity: ref('VERDICT', verdict.id, 'scope.indication'),
        field: 'scope.indication',
        correctiveAction: 'Add the indication scope supported by the programme evidence.',
      })
    } else if (
      hasText(programme.indication) &&
      !sameScopeText(verdict.scope.indication, programme.indication)
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_INDICATION_SCOPE_MISMATCH',
        message: `Verdict "${verdict.id}" names a different intended use than programme "${programme.id}".`,
        entity: ref('VERDICT', verdict.id, 'scope.indication'),
        field: 'scope.indication',
        correctiveAction:
          'Use the programme indication or attach the verdict to the programme for the intended use it evaluates.',
      })
    }
    if (!hasText(verdict.scope.population)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_POPULATION_SCOPE_MISSING',
        message: `Verdict "${verdict.id}" does not state the population it evaluates.`,
        entity: ref('VERDICT', verdict.id, 'scope.population'),
        field: 'scope.population',
        correctiveAction: 'Add the population scope supported by the programme evidence.',
      })
    }
    if (!hasText(verdict.scope.doseOrExposure)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_DOSE_SCOPE_MISSING',
        message: `Verdict "${verdict.id}" does not state the dose or exposure range it evaluates.`,
        entity: ref('VERDICT', verdict.id, 'scope.doseOrExposure'),
        field: 'scope.doseOrExposure',
        correctiveAction: 'Add the sourced dose, route, or exposure scope for this conclusion.',
      })
    }
    if (!hasText(verdict.scope.period)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_PERIOD_SCOPE_MISSING',
        message: `Verdict "${verdict.id}" does not state the evidence period it evaluates.`,
        entity: ref('VERDICT', verdict.id, 'scope.period'),
        field: 'scope.period',
        correctiveAction: 'Add the studied duration or programme period supported by the sources.',
      })
    }
    if (verdict.scope.trialIds.length === 0) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_TRIAL_SCOPE_MISSING',
        message: `Verdict "${verdict.id}" does not identify the trial or trial collection it evaluates.`,
        entity: ref('VERDICT', verdict.id, 'scope.trialIds'),
        field: 'scope.trialIds',
        correctiveAction: 'Link the trials that define this verdict scope.',
      })
    }
    if (!hasText(verdict.scope.outcome)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_VERDICT_OUTCOME_SCOPE_MISSING',
        message: `Verdict "${verdict.id}" does not name the outcome it evaluates.`,
        entity: ref('VERDICT', verdict.id, 'scope.outcome'),
        field: 'scope.outcome',
        correctiveAction: 'Name the measured or unanswered outcome that the verdict concerns.',
      })
    }

    if (!STOPPED_STATUSES.has(programme.status)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'B',
        code: 'B_STOPPED_VERDICT_ON_ACTIVE_PROGRAMME',
        message: `Stopped-programme verdict "${verdict.code}" cannot be assigned while programme "${programme.id}" is ${programme.status}.`,
        entity: ref('VERDICT', verdict.id, 'code'),
        field: 'code',
        correctiveAction:
          'Correct the programme status or use a conclusion type appropriate to an active programme.',
      })
    }

    for (const trialId of [...verdict.scope.trialIds].sort()) {
      const trial = ctx.trials.get(trialId)
      if (!trial || trial.programmeId !== programme.id) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'B',
          code: 'B_VERDICT_TRIAL_SCOPE_MISMATCH',
          message: `Verdict "${verdict.id}" cites trial "${trialId}", which is not part of programme "${programme.id}".`,
          entity: ref('VERDICT', verdict.id, 'scope.trialIds'),
          field: 'scope.trialIds',
          correctiveAction: 'Remove the trial or link the verdict to the programme that owns it.',
        })
      }
    }
  }
}

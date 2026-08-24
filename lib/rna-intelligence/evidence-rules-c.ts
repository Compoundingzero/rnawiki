import type { EvidenceClaim } from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import {
  addFinding,
  duplicateValues,
  elapsedDays,
  hasText,
  isValidCanonicalLocator,
  parseIsoDate,
  ref,
  sortedById,
  uniqueSorted,
} from './evidence-rule-utils'

function latestSnapshot(ctx: EvidenceRuleContext, sourceId: string) {
  return ctx.snapshotsBySource.get(sourceId)?.at(-1)
}

function matchingPrimaryExists(ctx: EvidenceRuleContext, claim: EvidenceClaim): boolean {
  const cited = new Set(claim.sourceIds)
  return ctx.input.sources.some((source) => {
    if (source.hierarchy !== 'PRIMARY' || cited.has(source.id)) return false
    if (claim.trialId && source.trialId === claim.trialId) return true
    return Boolean(claim.programmeId && source.programmeId === claim.programmeId)
  })
}

export function runGroupCCitationProvenance(ctx: EvidenceRuleContext): void {
  const asOf = parseIsoDate(ctx.input.asOfDate)

  for (const duplicate of duplicateValues(ctx.input.sources.map((source) => source.id))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'C',
      code: 'C_DUPLICATE_SOURCE_ID',
      message: `More than one source record uses the identifier "${duplicate}".`,
      entity: ref('SOURCE', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Give every source record one stable identifier.',
      sourceId: duplicate,
    })
  }

  for (const source of sortedById(ctx.input.sources)) {
    if (!hasText(source.externalIdentifier)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_IDENTIFIER_MISSING',
        message: `Source "${source.id}" has no external identifier.`,
        entity: ref('SOURCE', source.id, 'externalIdentifier'),
        field: 'externalIdentifier',
        correctiveAction:
          'Add the DOI, PMID, NCT number, regulatory identifier, or equivalent stable identifier.',
        sourceId: source.id,
      })
    }

    if (!isValidCanonicalLocator(source.canonicalLocator)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_LOCATOR_MALFORMED',
        message: `Source "${source.id}" has a malformed canonical locator.`,
        entity: ref('SOURCE', source.id, 'canonicalLocator'),
        field: 'canonicalLocator',
        correctiveAction: 'Use a resolvable HTTP(S), DOI, PMID, NCT, or URN locator.',
        sourceId: source.id,
      })
    }

    if (!hasText(source.title) || !hasText(source.publisher)) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'C',
        code: 'C_SOURCE_METADATA_INCOMPLETE',
        message: `Source "${source.id}" is missing a title or publisher.`,
        entity: ref('SOURCE', source.id, !hasText(source.title) ? 'title' : 'publisher'),
        field: !hasText(source.title) ? 'title' : 'publisher',
        correctiveAction:
          'Copy the source title and publisher from the authoritative record when available.',
        sourceId: source.id,
      })
    }

    const assignedProgramme = source.programmeId
      ? ctx.programmes.get(source.programmeId)
      : undefined
    if (source.programmeId && !assignedProgramme) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_PROGRAMME_NOT_FOUND',
        message: `Source "${source.id}" is assigned to missing programme "${source.programmeId}".`,
        entity: ref('SOURCE', source.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Link the source to a stored programme or clear the invalid assignment.',
        sourceId: source.id,
      })
    }

    const assignedTrial = source.trialId ? ctx.trials.get(source.trialId) : undefined
    if (source.trialId && !assignedTrial) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_TRIAL_NOT_FOUND',
        message: `Source "${source.id}" is assigned to missing trial "${source.trialId}".`,
        entity: ref('SOURCE', source.id, 'trialId'),
        field: 'trialId',
        correctiveAction: 'Link the source to the stored trial it describes.',
        sourceId: source.id,
      })
    } else if (
      assignedTrial &&
      source.programmeId &&
      assignedTrial.programmeId !== source.programmeId
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_TRIAL_PROGRAMME_MISMATCH',
        message: `Source "${source.id}" is assigned to a trial and programme that do not belong together.`,
        entity: ref('SOURCE', source.id, 'trialId'),
        field: 'trialId',
        correctiveAction: 'Assign the source to the programme that owns the linked trial.',
        sourceId: source.id,
      })
    }

    if (source.resolutionStatus === 'UNRESOLVABLE') {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_UNRESOLVABLE',
        message: `Source "${source.id}" is recorded as unresolvable.`,
        entity: ref('SOURCE', source.id, 'resolutionStatus'),
        field: 'resolutionStatus',
        correctiveAction: 'Correct the identifier or replace it with a stored, resolvable source.',
        sourceId: source.id,
      })
    } else if (source.resolutionStatus === 'TEMPORARILY_UNAVAILABLE') {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'C',
        code: 'C_SOURCE_TEMPORARILY_UNAVAILABLE',
        message: `Source "${source.id}" could not be reached during the latest check.`,
        entity: ref('SOURCE', source.id, 'resolutionStatus'),
        field: 'resolutionStatus',
        correctiveAction: 'Keep the current published evidence visible and retry the source check.',
        sourceId: source.id,
      })
    }

    if (
      source.correctionStatus === 'CORRECTED' ||
      source.correctionStatus === 'RETRACTED' ||
      source.correctionStatus === 'EXPRESSION_OF_CONCERN'
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'C',
        code: 'C_SOURCE_CORRECTION_OR_RETRACTION',
        message: `Source "${source.id}" carries the status ${source.correctionStatus}.`,
        entity: ref('SOURCE', source.id, 'correctionStatus'),
        field: 'correctionStatus',
        correctiveAction:
          'Review every dependent claim and record how the source status affects it.',
        sourceId: source.id,
      })
    }

    const latest = latestSnapshot(ctx, source.id)
    if (!latest) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_SNAPSHOT_MISSING',
        message: `Source "${source.id}" has no immutable retrieval snapshot.`,
        entity: ref('SOURCE', source.id, 'snapshots'),
        field: 'snapshots',
        correctiveAction:
          'Fetch and store source metadata as a hashed snapshot before publication.',
        sourceId: source.id,
      })
    } else if (asOf !== null) {
      const retrieved = parseIsoDate(latest.retrievedAt)
      if (retrieved !== null) {
        const maxAge =
          ctx.policy.freshness.maxAgeDaysBySourceType?.[source.sourceType] ??
          ctx.policy.freshness.defaultMaxAgeDays
        const age = elapsedDays(asOf, retrieved)
        if (age > maxAge) {
          addFinding(ctx, {
            level: 'WARNING',
            group: 'C',
            code: 'C_SOURCE_STALE',
            message: `Source "${source.id}" was last checked ${age} days ago; policy allows ${maxAge}.`,
            entity: ref('SOURCE', source.id, 'lastCheckedDate'),
            field: 'lastCheckedDate',
            correctiveAction:
              'Schedule a new source check and label dependent public content as potentially out of date.',
            sourceId: source.id,
          })
        }
      }
    }
  }

  for (const duplicate of duplicateValues(
    ctx.input.sourceSnapshots.map((snapshot) => snapshot.id),
  )) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'C',
      code: 'C_DUPLICATE_SNAPSHOT_ID',
      message: `More than one source snapshot uses the identifier "${duplicate}".`,
      entity: ref('SOURCE_SNAPSHOT', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign every immutable source snapshot a unique identifier.',
    })
  }

  for (const snapshot of sortedById(ctx.input.sourceSnapshots)) {
    if (!ctx.sources.has(snapshot.sourceId)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SNAPSHOT_SOURCE_NOT_FOUND',
        message: `Snapshot "${snapshot.id}" links to missing source "${snapshot.sourceId}".`,
        entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'sourceId'),
        field: 'sourceId',
        correctiveAction: 'Link the snapshot to its stored source record.',
        sourceId: snapshot.sourceId,
      })
    }
    if (parseIsoDate(snapshot.retrievedAt) === null) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SNAPSHOT_RETRIEVED_DATE_INVALID',
        message: `Snapshot "${snapshot.id}" has no valid ISO retrieval date.`,
        entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'retrievedAt'),
        field: 'retrievedAt',
        correctiveAction: 'Record the date the source was retrieved in ISO format.',
        sourceId: snapshot.sourceId,
      })
    }
    if (!hasText(snapshot.contentHash)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SNAPSHOT_HASH_MISSING',
        message: `Snapshot "${snapshot.id}" has no content or metadata hash.`,
        entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'contentHash'),
        field: 'contentHash',
        correctiveAction:
          'Hash the normalized source snapshot before it enters the evidence chain.',
        sourceId: snapshot.sourceId,
      })
    }
    if (snapshot.previousSnapshotId) {
      const previous = ctx.snapshots.get(snapshot.previousSnapshotId)
      if (!previous) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_PREVIOUS_SNAPSHOT_NOT_FOUND',
          message: `Snapshot "${snapshot.id}" points to missing previous snapshot "${snapshot.previousSnapshotId}".`,
          entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'previousSnapshotId'),
          field: 'previousSnapshotId',
          correctiveAction:
            'Restore the previous immutable snapshot link or remove the invalid reference.',
          sourceId: snapshot.sourceId,
        })
      } else if (previous.sourceId !== snapshot.sourceId) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_PREVIOUS_SNAPSHOT_SOURCE_MISMATCH',
          message: `Snapshot "${snapshot.id}" links to a previous snapshot from another source.`,
          entity: ref('SOURCE_SNAPSHOT', snapshot.id, 'previousSnapshotId'),
          field: 'previousSnapshotId',
          correctiveAction: 'Link snapshot history only within the same source record.',
          sourceId: snapshot.sourceId,
        })
      }
    }
  }

  for (const claim of sortedById(ctx.input.claims)) {
    if (claim.nature === 'MEASURED' && claim.sourceIds.length === 0) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_MEASURED_CLAIM_SOURCE_MISSING',
        message: `Measured claim "${claim.id}" has no source.`,
        entity: ref('CLAIM', claim.id, 'sourceIds'),
        field: 'sourceIds',
        correctiveAction:
          'Attach the primary result, registry, or regulatory source that reports the measurement.',
        claimId: claim.id,
      })
    }

    if (
      claim.numericValue !== undefined &&
      claim.numericUnitRequired === true &&
      !hasText(claim.unit)
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_NUMERIC_CLAIM_UNIT_MISSING',
        message: `Numeric claim "${claim.id}" requires a unit but has none.`,
        entity: ref('CLAIM', claim.id, 'unit'),
        field: 'unit',
        correctiveAction: 'Add the unit exactly as reported by the source.',
        claimId: claim.id,
      })
    }

    let citesSecondary = false
    for (const sourceId of uniqueSorted(claim.sourceIds)) {
      const source = ctx.sources.get(sourceId)
      if (!source) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_CLAIM_SOURCE_NOT_FOUND',
          message: `Claim "${claim.id}" cites missing source "${sourceId}".`,
          entity: ref('CLAIM', claim.id, 'sourceIds'),
          field: 'sourceIds',
          correctiveAction: 'Store the source record or remove the invalid citation.',
          sourceId,
          claimId: claim.id,
        })
        continue
      }

      if (!latestSnapshot(ctx, sourceId)) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_CLAIM_SOURCE_SNAPSHOT_MISSING',
          message: `Claim "${claim.id}" cites source "${sourceId}" without a stored snapshot.`,
          entity: ref('CLAIM', claim.id, 'sourceIds'),
          field: 'sourceIds',
          correctiveAction: 'Capture the cited source snapshot before publishing the claim.',
          sourceId,
          claimId: claim.id,
        })
      }

      if (claim.trialId && source.trialId && source.trialId !== claim.trialId) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_SOURCE_TRIAL_MISMATCH',
          message: `Claim "${claim.id}" cites a source assigned to a different trial.`,
          entity: ref('CLAIM', claim.id, 'sourceIds'),
          field: 'sourceIds',
          correctiveAction: 'Use the source for the trial that produced the claim.',
          sourceId,
          claimId: claim.id,
        })
      }
      if (claim.programmeId && source.programmeId && source.programmeId !== claim.programmeId) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_SOURCE_PROGRAMME_MISMATCH',
          message: `Claim "${claim.id}" cites a source assigned to a different programme.`,
          entity: ref('CLAIM', claim.id, 'sourceIds'),
          field: 'sourceIds',
          correctiveAction: 'Use a source linked to the programme evaluated by the claim.',
          sourceId,
          claimId: claim.id,
        })
      }
      if (source.hierarchy === 'SECONDARY') citesSecondary = true
    }

    if (citesSecondary && matchingPrimaryExists(ctx, claim)) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'C',
        code: 'C_SECONDARY_SOURCE_WHEN_PRIMARY_AVAILABLE',
        message: `Claim "${claim.id}" cites a secondary source although a linked primary source is available.`,
        entity: ref('CLAIM', claim.id, 'sourceIds'),
        field: 'sourceIds',
        correctiveAction:
          'Prefer the existing primary source or explain why the secondary source is necessary.',
        claimId: claim.id,
      })
    }

    for (const conflictingId of uniqueSorted(claim.conflictsWithClaimIds ?? [])) {
      if (!ctx.claims.has(conflictingId)) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_CONFLICTING_CLAIM_NOT_FOUND',
          message: `Claim "${claim.id}" points to missing conflicting claim "${conflictingId}".`,
          entity: ref('CLAIM', claim.id, 'conflictsWithClaimIds'),
          field: 'conflictsWithClaimIds',
          correctiveAction: 'Restore the conflicting claim revision or remove the invalid link.',
          claimId: claim.id,
        })
      } else {
        addFinding(ctx, {
          level: 'WARNING',
          group: 'C',
          code: 'C_IMPORTANT_SOURCES_CONFLICT',
          message: `Claim "${claim.id}" conflicts with claim "${conflictingId}".`,
          entity: ref('CLAIM', claim.id, 'conflictsWithClaimIds'),
          field: 'conflictsWithClaimIds',
          correctiveAction: 'Show both claims and require a reviewer to explain the conflict.',
          claimId: claim.id,
        })
      }
    }
  }

  for (const verdict of sortedById(ctx.input.verdicts)) {
    if ((verdict.sourceDependent ?? true) && verdict.supportingClaimIds.length === 0) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'C',
        code: 'C_SOURCE_DEPENDENT_VERDICT_NO_CLAIMS',
        message: `Verdict "${verdict.id}" has no supporting evidence claims.`,
        entity: ref('VERDICT', verdict.id, 'supportingClaimIds'),
        field: 'supportingClaimIds',
        correctiveAction:
          'Link the measured, reported, regulatory, and judgement claims that justify the verdict.',
      })
    }
    for (const claimId of uniqueSorted([
      ...verdict.supportingClaimIds,
      ...verdict.contradictoryClaimIds,
      ...verdict.candidateLimitationClaimIds,
    ])) {
      if (!ctx.claims.has(claimId)) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_VERDICT_CLAIM_NOT_FOUND',
          message: `Verdict "${verdict.id}" links to missing claim "${claimId}".`,
          entity: ref('VERDICT', verdict.id, 'supportingClaimIds'),
          field: 'supportingClaimIds',
          correctiveAction: 'Restore the immutable claim revision or remove the invalid link.',
          claimId,
        })
      }
    }
  }

  for (const programme of sortedById(ctx.input.programmes)) {
    const stoppingClaimIds = uniqueSorted(programme.stoppingReasonClaimIds ?? [])
    const stoppingClaims: EvidenceClaim[] = []
    for (const claimId of stoppingClaimIds) {
      const claim = ctx.claims.get(claimId)
      if (!claim) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'C',
          code: 'C_STOPPING_REASON_CLAIM_NOT_FOUND',
          message: `Programme "${programme.id}" links to missing stopping-reason claim "${claimId}".`,
          entity: ref('PROGRAMME', programme.id, 'stoppingReasonClaimIds'),
          field: 'stoppingReasonClaimIds',
          correctiveAction:
            'Restore the immutable claim or remove the invalid stopping-reason link.',
          claimId,
        })
      } else {
        stoppingClaims.push(claim)
      }
    }
    if (
      stoppingClaims.length > 0 &&
      stoppingClaims.every((claim) => claim.nature === 'SPONSOR_REPORTED')
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'C',
        code: 'C_STOPPING_REASON_SPONSOR_ONLY',
        message: `Programme "${programme.id}" has a stopping reason supported only by statements from the study sponsor.`,
        entity: ref('PROGRAMME', programme.id, 'stoppingReasonClaimIds'),
        field: 'stoppingReasonClaimIds',
        correctiveAction:
          'Label the reason as sponsor reported and look for an independent or regulatory source.',
      })
    }
  }

  for (const trial of sortedById(ctx.input.trials)) {
    if (trial.resultsStatus === 'UNAVAILABLE' || trial.resultsStatus === 'NOT_POSTED') {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'C',
        code: 'C_PRIMARY_RESULTS_UNAVAILABLE',
        message: `Primary results are not publicly available for trial "${trial.registrationId}".`,
        entity: ref('TRIAL', trial.id, 'resultsStatus'),
        field: 'resultsStatus',
        correctiveAction:
          'Keep the outcome unknown and monitor the registry or regulatory record for results.',
      })
    }
  }
}

/**
 * Load everything the dossier v3 view model reads for one slug, in one fan-out on top of the
 * corpus record (docs/dossier-information-architecture.md, "Data flow").
 *
 * The corpus record comes from `loadCorpusDossier` unchanged. The v3 tables (reviewed claims,
 * field states, the role-aware registry aggregate, the corrections ledger) and the stored label
 * fields are read beside it. Draft claims are loaded so the model can say "awaiting review", but
 * only reviewed claims ever reach a sentence.
 */
import { desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import {
  dossierCompletionAssessments,
  dossierFieldStates,
  drugs,
  entityCorrections,
  hubMembers,
  hubs,
  inventoryResolutions,
  pageFields,
  pageRegistryAggregate,
  pageRegistryRoleAggregates,
  reviewedClaims,
} from '@/db/schema'
import { loadCorpusDossier } from '@/lib/corpus/dossier-page'

import type { RoleAwareRegistryAggregate } from './trial-roles'
import { buildDossierV3, type DossierV3Inputs, type DossierV3ViewModel } from './view-model'

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

export async function loadDossierV3Inputs(slug: string): Promise<DossierV3Inputs | null> {
  const corpus = await loadCorpusDossier(slug)
  if (!corpus) return null
  const key = corpus.key

  const [
    claimRows,
    stateRows,
    roleRows,
    aggregateRows,
    correctionRows,
    fieldRows,
    legacyRows,
    hubRows,
  ] = await Promise.all([
    db
      .select()
      .from(reviewedClaims)
      .where(eq(reviewedClaims.subjectKey, key))
      .orderBy(desc(reviewedClaims.contentVersion)),
    db.select().from(dossierFieldStates).where(eq(dossierFieldStates.key, key)),
    db
      .select({ aggregate: pageRegistryRoleAggregates.aggregate })
      .from(pageRegistryRoleAggregates)
      .where(eq(pageRegistryRoleAggregates.key, key)),
    db
      .select({ aggregate: pageRegistryAggregate.aggregate })
      .from(pageRegistryAggregate)
      .where(eq(pageRegistryAggregate.key, key)),
    db
      .select()
      .from(entityCorrections)
      .where(eq(entityCorrections.subjectKey, key))
      .orderBy(desc(entityCorrections.recordedAt)),
    db
      .select({
        field: pageFields.field,
        state: pageFields.state,
        value: pageFields.value,
        sourceKind: pageFields.sourceKind,
        sourceId: pageFields.sourceId,
        sourceUrl: pageFields.sourceUrl,
        sourceDate: pageFields.sourceDate,
      })
      .from(pageFields)
      .where(eq(pageFields.key, key)),
    db
      .select({
        id: drugs.id,
        modality: drugs.modality,
        approvalStatus: drugs.approvalStatus,
        indication: drugs.indication,
        sourceProvenance: drugs.sourceProvenance,
      })
      .from(drugs)
      .where(eq(drugs.slug, slug))
      .limit(1),
    db
      .select({ type: hubs.type, name: hubs.name, slug: hubs.slug })
      .from(hubMembers)
      .innerJoin(hubs, eq(hubs.hubId, hubMembers.hubId))
      .where(eq(hubMembers.key, key)),
  ])

  const legacy = legacyRows[0]
  const [entityClassRows, assessmentRows] = legacy
    ? await Promise.all([
        db
          .select({ entityClass: inventoryResolutions.entityClass })
          .from(inventoryResolutions)
          .where(eq(inventoryResolutions.drugId, legacy.id))
          .limit(1),
        db
          .select({ sections: dossierCompletionAssessments.sections })
          .from(dossierCompletionAssessments)
          .where(eq(dossierCompletionAssessments.drugId, legacy.id))
          .limit(1),
      ])
    : [[], []]

  const aggregate = asRecord(aggregateRows[0]?.aggregate)
  const conditions = Array.isArray(aggregate?.conditions)
    ? (aggregate.conditions as unknown[]).filter((item): item is string => typeof item === 'string')
    : []
  const completedNoResults = Array.isArray(aggregate?.completedOverTwoYearsWithoutResults)
    ? (aggregate.completedOverTwoYearsWithoutResults as unknown[])
        .map((item) => asRecord(item))
        .filter((item): item is Record<string, unknown> => item !== undefined)
        .map((item) => ({
          nct: String(item.nct ?? ''),
          completionDate: typeof item.completionDate === 'string' ? item.completionDate : null,
        }))
        .filter((item) => /^NCT\d{8}$/.test(item.nct))
    : []

  const sections = Array.isArray(assessmentRows[0]?.sections)
    ? (assessmentRows[0]?.sections as unknown[])
    : []
  const reviewedConclusion = sections
    .map((section) => asRecord(section))
    .find((section) => section?.sectionId === 'reviewed-conclusion')

  const fields: DossierV3Inputs['fields'] = {}
  for (const row of fieldRows) {
    fields[row.field] = {
      state: row.state,
      value: row.value,
      ...(row.sourceKind ? { sourceKind: row.sourceKind } : {}),
      ...(row.sourceId ? { sourceId: row.sourceId } : {}),
      ...(row.sourceUrl ? { sourceUrl: row.sourceUrl } : {}),
      ...(row.sourceDate ? { sourceDate: row.sourceDate } : {}),
    }
  }

  return {
    corpus,
    claims: claimRows.map((row) => ({
      id: row.id,
      kind: row.kind,
      predicate: row.predicate,
      objectText: row.objectText,
      plainLanguageVersion: row.plainLanguageVersion,
      technicalVersion: row.technicalVersion,
      analogy: row.analogy,
      analogyBreaks: row.analogyBreaks,
      evidenceClass: row.evidenceClass,
      outcomeClass: row.outcomeClass,
      claimStrength: row.claimStrength,
      trialIdentifier: row.trialIdentifier,
      trialRole: row.trialRole,
      participants: row.participants,
      applicablePopulation: row.applicablePopulation,
      indicationOrGoal: row.indicationOrGoal,
      formulation: row.formulation,
      route: row.route,
      doseAsStudied: row.doseAsStudied,
      duration: row.duration,
      comparator: row.comparator,
      direction: row.direction,
      effectScale: row.effectScale,
      baselineValue: row.baselineValue,
      comparatorValue: row.comparatorValue,
      effectEstimate: row.effectEstimate,
      absoluteEffect: row.absoluteEffect,
      ciLow: row.ciLow,
      ciHigh: row.ciHigh,
      ciLevel: row.ciLevel,
      studyDesign: row.studyDesign,
      causality: row.causality,
      uncertainty: row.uncertainty,
      uncertaintyReasons: row.uncertaintyReasons,
      sourceSnapshotIds: row.sourceSnapshotIds,
      sourceLocators: row.sourceLocators,
      contradictionState: row.contradictionState,
      reviewerState: row.reviewerState,
      structure: row.structure,
      riskTier: row.riskTier,
      contentVersion: row.contentVersion,
      lastCheckedAt: row.lastCheckedAt,
    })),
    fieldStates: stateRows.map((row) => ({
      field: row.field,
      state: row.state,
      claimId: row.claimId,
      basis: row.basis,
      sourcesChecked: row.sourcesChecked,
      checkedAt: row.checkedAt,
    })),
    roleAggregate:
      (asRecord(roleRows[0]?.aggregate) as RoleAwareRegistryAggregate | undefined) ?? null,
    registryConditions: conditions,
    registryCompletedNoResults: completedNoResults,
    corrections: correctionRows.map((row) => ({
      id: row.id,
      subjectKind: row.subjectKind,
      subjectRef: row.subjectRef,
      action: row.action,
      reason: row.reason,
      before: row.before,
      after: row.after,
      recordedAt: row.recordedAt,
      ruleOrClassifierVersion: row.ruleOrClassifierVersion,
    })),
    legacy: legacy
      ? {
          modality: legacy.modality,
          approvalStatus: legacy.approvalStatus,
          indication: legacy.indication,
          entityClass: entityClassRows[0]?.entityClass ?? null,
          sourceProvenance: Array.isArray(legacy.sourceProvenance)
            ? (legacy.sourceProvenance as unknown[]).filter(
                (item): item is string => typeof item === 'string',
              )
            : [],
        }
      : null,
    fields,
    reviewedConclusionState:
      typeof reviewedConclusion?.state === 'string' ? reviewedConclusion.state : null,
    hubs: hubRows,
    now: new Date(),
  }
}

export async function loadDossierV3(slug: string): Promise<DossierV3ViewModel | null> {
  const inputs = await loadDossierV3Inputs(slug)
  return inputs ? buildDossierV3(inputs) : null
}

/** The slugs the v3 rendering is switched on for (docs/dossier-information-architecture.md, "Flag"). */
export function dossierV3Enabled(slug: string): boolean {
  const raw = process.env.DOSSIER_V3_SLUGS?.trim()
  if (!raw) return false
  if (raw === '*' || raw.toLowerCase() === 'all') return true
  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(slug.toLowerCase())
}

import { and, asc, eq, isNotNull, isNull, lte, or, sql } from 'drizzle-orm'

import type { Db } from '@/db'
import { evidenceSources, programmeFreshnessStates, programmeTrials } from '@/db/schema'
import type {
  DueClinicalTrialsSource,
  QueryDueClinicalTrialsSourcesInput,
} from './clinical-trials-source-sync'

/**
 * Reads normalized programme/trial/source links only. Missing freshness rows are initial checks;
 * otherwise a row is due only when an initial check has no deadline or a persisted deadline elapsed.
 * A terminal failed row with no next deadline is deliberately left for operator intervention.
 */
export function buildDueClinicalTrialsSourcesQuery(
  database: Db,
  input: QueryDueClinicalTrialsSourcesInput,
) {
  return database
    .selectDistinct({
      programmeId: programmeTrials.programmeId,
      sourceId: evidenceSources.id,
      externalIdentifier: evidenceSources.externalIdentifier,
      lastSuccessfulCheckAt: programmeFreshnessStates.lastSuccessfulCheckAt,
      nextCheckDueAt: programmeFreshnessStates.nextCheckDueAt,
    })
    .from(programmeTrials)
    .innerJoin(evidenceSources, eq(evidenceSources.id, programmeTrials.registrySourceId))
    .leftJoin(
      programmeFreshnessStates,
      and(
        eq(programmeFreshnessStates.programmeId, programmeTrials.programmeId),
        eq(programmeFreshnessStates.sourceId, evidenceSources.id),
      ),
    )
    .where(
      and(
        eq(evidenceSources.sourceType, 'CLINICAL_TRIAL_REGISTRY'),
        isNotNull(evidenceSources.externalIdentifier),
        sql<boolean>`upper(trim(${evidenceSources.externalIdentifier})) ~ '^NCT[0-9]{8}$'`,
        or(
          isNull(programmeFreshnessStates.programmeId),
          and(
            eq(programmeFreshnessStates.checkStatus, 'NOT_CHECKED'),
            isNull(programmeFreshnessStates.nextCheckDueAt),
          ),
          lte(programmeFreshnessStates.nextCheckDueAt, input.observedAt),
        ),
      ),
    )
    .orderBy(
      asc(programmeFreshnessStates.nextCheckDueAt),
      asc(programmeTrials.programmeId),
      asc(evidenceSources.id),
    )
    .limit(input.limit)
}

export async function queryDueClinicalTrialsSources(
  database: Db,
  input: QueryDueClinicalTrialsSourcesInput,
): Promise<DueClinicalTrialsSource[]> {
  const rows = await buildDueClinicalTrialsSourcesQuery(database, input)

  return rows.map((row) => {
    if (row.externalIdentifier === null) {
      throw new Error(`Due evidence source ${row.sourceId} has no external identifier.`)
    }
    return {
      programmeId: row.programmeId,
      sourceId: row.sourceId,
      externalIdentifier: row.externalIdentifier.trim().toUpperCase(),
      lastSuccessfulCheckAt: row.lastSuccessfulCheckAt,
      nextCheckDueAt: row.nextCheckDueAt,
    }
  })
}

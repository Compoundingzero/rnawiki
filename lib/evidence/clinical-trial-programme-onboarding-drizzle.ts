import { createHash } from 'node:crypto'

import { and, desc, eq, or, sql } from 'drizzle-orm'

import type { Db } from '@/db'
import {
  developmentProgrammes,
  drugAliases,
  drugs,
  evidenceSources,
  programmeFreshnessStates,
  programmeTrials,
  sourceSnapshots,
} from '@/db/schema'
import {
  ClinicalTrialProgrammeOnboardingError,
  type ClinicalTrialProgrammeOnboardingPlan,
  type ClinicalTrialProgrammeOnboardingStore,
  type OnboardingMedicineIdentity,
  type OnboardingPersistenceResult,
} from '@/lib/evidence/clinical-trial-programme-onboarding'

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]

function conflict(message: string): never {
  throw new ClinicalTrialProgrammeOnboardingError('PERSISTENCE_CONFLICT', message)
}

function stableId(prefix: string, parts: readonly string[]): string {
  const material = parts.map((part) => `${part.length}:${part}`).join('|')
  return `${prefix}_${createHash('sha256').update(material, 'utf8').digest('hex').slice(0, 48)}`
}

function uniqueById<T extends { id: string }>(rows: readonly T[]): T[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()]
}

async function lockMedicine(tx: Transaction, plan: ClinicalTrialProgrammeOnboardingPlan) {
  const rows = await tx
    .select({ id: drugs.id, slug: drugs.slug })
    .from(drugs)
    .where(eq(drugs.id, plan.medicine.id))
    .limit(1)
    .for('update')
  const medicine = rows[0]
  if (!medicine || medicine.slug !== plan.medicine.slug) {
    conflict(`Medicine ${plan.medicine.slug} changed or disappeared before onboarding.`)
  }
}

async function findSource(tx: Transaction, plan: ClinicalTrialProgrammeOnboardingPlan) {
  const rows = uniqueById(
    await tx
      .select()
      .from(evidenceSources)
      .where(
        or(
          eq(evidenceSources.id, plan.source.id),
          and(
            eq(evidenceSources.sourceType, 'CLINICAL_TRIAL_REGISTRY'),
            sql<boolean>`upper(trim(${evidenceSources.externalIdentifier})) = ${plan.source.externalIdentifier}`,
          ),
        ),
      )
      .for('update'),
  )
  const byId = rows.find((row) => row.id === plan.source.id)
  const byNaturalKey = rows.find(
    (row) =>
      row.sourceType === 'CLINICAL_TRIAL_REGISTRY' &&
      row.externalIdentifier?.trim().toUpperCase() === plan.source.externalIdentifier,
  )
  if (
    byId &&
    (byId.sourceType !== 'CLINICAL_TRIAL_REGISTRY' ||
      byId.externalIdentifier?.trim().toUpperCase() !== plan.source.externalIdentifier)
  ) {
    conflict(`Stable source ID ${plan.source.id} is already bound to another source.`)
  }
  if (byId && byNaturalKey && byId.id !== byNaturalKey.id) {
    conflict(`ClinicalTrials.gov source ${plan.source.externalIdentifier} has conflicting rows.`)
  }
  if (byNaturalKey && byNaturalKey.canonicalLocator !== plan.source.canonicalLocator) {
    conflict(
      `ClinicalTrials.gov source ${plan.source.externalIdentifier} has a non-canonical locator and will not be reused.`,
    )
  }
  return byNaturalKey ?? byId ?? null
}

async function findProgramme(tx: Transaction, plan: ClinicalTrialProgrammeOnboardingPlan) {
  const rows = uniqueById(
    await tx
      .select()
      .from(developmentProgrammes)
      .where(
        or(
          eq(developmentProgrammes.id, plan.programme.id),
          and(
            eq(developmentProgrammes.drugId, plan.medicine.id),
            eq(developmentProgrammes.slug, plan.programme.slug),
          ),
        ),
      )
      .for('update'),
  )
  const byId = rows.find((row) => row.id === plan.programme.id)
  const byNaturalKey = rows.find(
    (row) => row.drugId === plan.medicine.id && row.slug === plan.programme.slug,
  )
  if (byId && (byId.drugId !== plan.medicine.id || byId.slug !== plan.programme.slug)) {
    conflict(`Stable programme ID ${plan.programme.id} is already bound to another programme.`)
  }
  if (byId && byNaturalKey && byId.id !== byNaturalKey.id) {
    conflict(`Programme slug ${plan.programme.slug} has conflicting rows.`)
  }
  if (byNaturalKey && byNaturalKey.id !== plan.programme.id) {
    conflict(
      `Programme slug ${plan.programme.slug} already exists outside the stable onboarding lineage.`,
    )
  }
  return byNaturalKey ?? byId ?? null
}

async function findTrial(
  tx: Transaction,
  plan: ClinicalTrialProgrammeOnboardingPlan,
  programmeId: string,
) {
  const rows = uniqueById(
    await tx
      .select()
      .from(programmeTrials)
      .where(
        or(
          eq(programmeTrials.id, plan.trial.id),
          and(
            eq(programmeTrials.programmeId, programmeId),
            eq(programmeTrials.trialIdentifier, plan.trial.trialIdentifier),
          ),
        ),
      )
      .for('update'),
  )
  const byId = rows.find((row) => row.id === plan.trial.id)
  const byNaturalKey = rows.find(
    (row) => row.programmeId === programmeId && row.trialIdentifier === plan.trial.trialIdentifier,
  )
  if (
    byId &&
    (byId.programmeId !== programmeId || byId.trialIdentifier !== plan.trial.trialIdentifier)
  ) {
    conflict(`Stable trial ID ${plan.trial.id} is already bound to another trial.`)
  }
  if (byId && byNaturalKey && byId.id !== byNaturalKey.id) {
    conflict(`Trial ${plan.trial.trialIdentifier} has conflicting programme rows.`)
  }
  if (byNaturalKey && byNaturalKey.id !== plan.trial.id) {
    conflict(
      `Trial ${plan.trial.trialIdentifier} already exists outside the stable onboarding lineage.`,
    )
  }
  return byNaturalKey ?? byId ?? null
}

async function findSnapshot(
  tx: Transaction,
  sourceId: string,
  contentHash: string,
): Promise<typeof sourceSnapshots.$inferSelect | null> {
  const rows = await tx
    .select()
    .from(sourceSnapshots)
    .where(
      and(eq(sourceSnapshots.sourceId, sourceId), eq(sourceSnapshots.contentHash, contentHash)),
    )
    .limit(1)
  return rows[0] ?? null
}

async function findLatestSnapshot(
  tx: Transaction,
  sourceId: string,
): Promise<typeof sourceSnapshots.$inferSelect | null> {
  const rows = await tx
    .select()
    .from(sourceSnapshots)
    .where(eq(sourceSnapshots.sourceId, sourceId))
    .orderBy(desc(sourceSnapshots.retrievedAt), desc(sourceSnapshots.id))
    .limit(1)
  return rows[0] ?? null
}

async function existingProgrammeResult(
  tx: Transaction,
  plan: ClinicalTrialProgrammeOnboardingPlan,
  source: typeof evidenceSources.$inferSelect | null,
  commit: boolean,
): Promise<OnboardingPersistenceResult> {
  const trial = await findTrial(tx, plan, plan.programme.id)
  if (!trial) {
    conflict(
      `Programme ${plan.programme.slug} already exists without the exact registry trial binding; onboarding will not mutate it.`,
    )
  }
  if (!source || trial.registrySourceId !== source.id || !trial.registrySnapshotId) {
    conflict(
      `Programme ${plan.programme.slug} has a different source lineage; onboarding will not mutate it.`,
    )
  }
  const snapshotRows = await tx
    .select()
    .from(sourceSnapshots)
    .where(eq(sourceSnapshots.id, trial.registrySnapshotId))
    .limit(1)
  const trialSnapshot = snapshotRows[0]
  if (!trialSnapshot || trialSnapshot.sourceId !== source.id) {
    conflict(`Programme ${plan.programme.slug} points to an invalid registry snapshot.`)
  }

  const freshnessRows = await tx
    .select()
    .from(programmeFreshnessStates)
    .where(
      and(
        eq(programmeFreshnessStates.programmeId, plan.programme.id),
        eq(programmeFreshnessStates.sourceId, source.id),
      ),
    )
    .limit(1)
    .for('update')
  const needsFreshness = freshnessRows.length === 0
  if (needsFreshness && trialSnapshot.contentHash !== plan.snapshot.contentHash) {
    conflict(
      `Programme ${plan.programme.slug} lacks monitoring state and its saved snapshot is no longer current; run source monitoring before repairing it.`,
    )
  }
  if (commit && needsFreshness) {
    await tx.insert(programmeFreshnessStates).values({
      programmeId: plan.programme.id,
      sourceId: source.id,
      currentSnapshotId: trialSnapshot.id,
      checkStatus: 'SUCCEEDED',
      freshnessStatus: 'CURRENT',
      lastCheckAttemptAt: plan.freshness.checkedAt,
      lastSuccessfulCheckAt: plan.freshness.checkedAt,
      lastVerifiedAt: plan.freshness.checkedAt,
      nextCheckDueAt: plan.freshness.nextCheckDueAt,
      consecutiveFailures: 0,
      updatedAt: plan.freshness.checkedAt,
    })
  }

  return {
    outcome: 'ALREADY_ONBOARDED',
    records: {
      sourceId: source.id,
      snapshotId: trialSnapshot.id,
      programmeId: plan.programme.id,
      programmeSlug: plan.programme.slug,
      trialId: trial.id,
    },
    writes: {
      source: false,
      snapshot: false,
      programme: false,
      trial: false,
      freshness: needsFreshness,
    },
  }
}

async function applyInTransaction(
  tx: Transaction,
  plan: ClinicalTrialProgrammeOnboardingPlan,
  commit: boolean,
): Promise<OnboardingPersistenceResult> {
  // The lock key is deterministic and scoped to one medicine/NCT pair. It prevents two operator
  // invocations from both passing the empty-state checks before either inserts the programme.
  await tx.execute(
    sql`select pg_advisory_xact_lock(hashtextextended(${`${plan.medicine.id}:${plan.trial.trialIdentifier}`}, 0))`,
  )
  await lockMedicine(tx, plan)

  let source = await findSource(tx, plan)
  const sourceWasMissing = source === null
  let sourceInserted = false
  const programme = await findProgramme(tx, plan)
  if (programme) return existingProgrammeResult(tx, plan, source, commit)

  const collidingTrial = await findTrial(tx, plan, plan.programme.id)
  if (collidingTrial) {
    conflict(`Stable trial ID ${plan.trial.id} exists without its stable programme.`)
  }

  if (!source && commit) {
    const inserted = await tx
      .insert(evidenceSources)
      .values({
        id: plan.source.id,
        sourceType: 'CLINICAL_TRIAL_REGISTRY',
        externalIdentifier: plan.source.externalIdentifier,
        canonicalLocator: plan.source.canonicalLocator,
        title: plan.source.title,
        publisher: 'ClinicalTrials.gov',
        sponsor: plan.source.sponsor,
        correctionStatus: 'UNKNOWN',
        hierarchy: 'PRIMARY',
        createdAt: plan.freshness.checkedAt,
        updatedAt: plan.freshness.checkedAt,
      })
      .onConflictDoNothing()
      .returning({ id: evidenceSources.id })
    sourceInserted = inserted.length === 1
    source = await findSource(tx, plan)
    if (!source)
      conflict(`ClinicalTrials.gov source ${plan.source.externalIdentifier} was not saved.`)
  }

  const sourceId = source?.id ?? plan.source.id
  const snapshotId = stableId('snapshot', [sourceId, plan.snapshot.contentHash])
  let snapshot = source ? await findSnapshot(tx, sourceId, plan.snapshot.contentHash) : null
  let snapshotInserted = false
  const latestSnapshot = source ? await findLatestSnapshot(tx, sourceId) : null
  if (latestSnapshot && !snapshot && latestSnapshot.contentHash !== plan.snapshot.contentHash) {
    conflict(
      `ClinicalTrials.gov source ${plan.source.externalIdentifier} already has a different snapshot lineage; run its source monitor before onboarding another programme.`,
    )
  }

  const writes = {
    source: commit ? sourceInserted : sourceWasMissing,
    snapshot: snapshot === null,
    programme: true,
    trial: true,
    freshness: true,
  }
  if (!commit) {
    return {
      outcome: 'WOULD_CREATE',
      records: {
        sourceId,
        snapshotId,
        programmeId: plan.programme.id,
        programmeSlug: plan.programme.slug,
        trialId: plan.trial.id,
      },
      writes,
    }
  }

  if (!source) conflict('The evidence source disappeared during onboarding.')
  if (!snapshot) {
    const inserted = await tx
      .insert(sourceSnapshots)
      .values({
        id: snapshotId,
        sourceId: source.id,
        previousSnapshotId: null,
        retrievedAt: plan.snapshot.retrievedAt,
        lastVerifiedAt: plan.freshness.checkedAt,
        hashAlgorithm: 'sha256',
        contentHash: plan.snapshot.contentHash,
        structuredData: plan.snapshot.structuredData,
        rawSnapshotLocator: plan.snapshot.rawSnapshotLocator,
        createdAt: plan.freshness.checkedAt,
      })
      .onConflictDoNothing()
      .returning({ id: sourceSnapshots.id })
    snapshotInserted = inserted.length === 1
    snapshot = await findSnapshot(tx, source.id, plan.snapshot.contentHash)
    if (!snapshot) conflict(`Snapshot ${snapshotId} was not saved.`)
    writes.snapshot = snapshotInserted
  }

  await tx.insert(developmentProgrammes).values({
    id: plan.programme.id,
    drugId: plan.medicine.id,
    slug: plan.programme.slug,
    title: plan.programme.title,
    indication: plan.programme.indication,
    sponsor: plan.programme.sponsor,
    status: plan.programme.status,
    highestPhaseReached: plan.programme.highestPhaseReached,
    startDate: plan.programme.startDate,
    endDate: plan.programme.endDate,
    updateStatus: 'CURRENT',
    createdAt: plan.freshness.checkedAt,
    updatedAt: plan.freshness.checkedAt,
  })

  await tx.insert(programmeTrials).values({
    id: plan.trial.id,
    programmeId: plan.programme.id,
    trialIdentifier: plan.trial.trialIdentifier,
    title: plan.trial.title,
    phase: plan.trial.phase,
    status: plan.trial.status,
    resultsStatus: plan.trial.resultsStatus,
    enrolment: plan.trial.enrolment,
    enrolmentType: plan.trial.enrolmentType,
    startDate: plan.trial.startDate,
    primaryCompletionDate: plan.trial.primaryCompletionDate,
    completionDate: plan.trial.completionDate,
    humanStudyStatus: 'UNKNOWN',
    registrySourceId: source.id,
    registrySnapshotId: snapshot.id,
    lastVerifiedAt: plan.freshness.checkedAt,
    createdAt: plan.freshness.checkedAt,
    updatedAt: plan.freshness.checkedAt,
  })

  await tx.insert(programmeFreshnessStates).values({
    programmeId: plan.programme.id,
    sourceId: source.id,
    currentSnapshotId: snapshot.id,
    checkStatus: 'SUCCEEDED',
    freshnessStatus: 'CURRENT',
    lastCheckAttemptAt: plan.freshness.checkedAt,
    lastSuccessfulCheckAt: plan.freshness.checkedAt,
    lastVerifiedAt: plan.freshness.checkedAt,
    nextCheckDueAt: plan.freshness.nextCheckDueAt,
    consecutiveFailures: 0,
    updatedAt: plan.freshness.checkedAt,
  })

  return {
    outcome: 'CREATED',
    records: {
      sourceId: source.id,
      snapshotId: snapshot.id,
      programmeId: plan.programme.id,
      programmeSlug: plan.programme.slug,
      trialId: plan.trial.id,
    },
    writes,
  }
}

export class DrizzleClinicalTrialProgrammeOnboardingStore implements ClinicalTrialProgrammeOnboardingStore {
  constructor(private readonly database: Db) {}

  async findMedicineBySlug(slug: string): Promise<OnboardingMedicineIdentity | null> {
    const medicineRows = await this.database
      .select({ id: drugs.id, slug: drugs.slug, name: drugs.name, tradeName: drugs.tradeName })
      .from(drugs)
      .where(eq(drugs.slug, slug))
      .limit(1)
    const medicine = medicineRows[0]
    if (!medicine) return null

    const aliases = await this.database
      .select({ alias: drugAliases.alias })
      .from(drugAliases)
      .where(eq(drugAliases.drugId, medicine.id))
      .orderBy(drugAliases.alias)
    return {
      id: medicine.id,
      slug: medicine.slug,
      name: medicine.name,
      aliases: [
        ...aliases.map((row) => row.alias),
        ...(medicine.tradeName?.trim() ? [medicine.tradeName.trim()] : []),
      ],
    }
  }

  apply(
    plan: ClinicalTrialProgrammeOnboardingPlan,
    options: { commit: boolean },
  ): Promise<OnboardingPersistenceResult> {
    return this.database.transaction((tx) => applyInTransaction(tx, plan, options.commit))
  }
}

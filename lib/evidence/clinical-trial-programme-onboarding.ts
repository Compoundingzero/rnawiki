import { createHash } from 'node:crypto'

import type {
  ProgrammeStatus,
  TrialEnrolmentType,
  TrialResultsStatus,
  TrialStatus,
} from '@/lib/evidence/types'
import type { EvidenceSourceAdapter, SourceSnapshot } from '@/lib/evidence/source-adapter'

const NCT_PATTERN = /^NCT\d{8}$/i
const ONE_DAY_MS = 24 * 60 * 60 * 1_000

export const CLINICAL_TRIAL_PROGRAMME_ONBOARDING_SCHEMA_VERSION =
  'clinical-trial-programme-onboarding/v1' as const

export type ClinicalTrialProgrammeOnboardingErrorCode =
  | 'INVALID_MEDICINE_SLUG'
  | 'INVALID_NCT_ID'
  | 'MEDICINE_NOT_FOUND'
  | 'ADAPTER_UNSUPPORTED'
  | 'INVALID_REGISTRY_PAYLOAD'
  | 'REGISTRY_IDENTIFIER_MISMATCH'
  | 'MEDICINE_INTERVENTION_MISMATCH'
  | 'REGISTRY_FIELD_TOO_LONG'
  | 'REGISTRY_DATE_ORDER_INVALID'
  | 'PERSISTENCE_CONFLICT'

export class ClinicalTrialProgrammeOnboardingError extends Error {
  readonly code: ClinicalTrialProgrammeOnboardingErrorCode

  constructor(code: ClinicalTrialProgrammeOnboardingErrorCode, message: string) {
    super(message)
    this.name = 'ClinicalTrialProgrammeOnboardingError'
    this.code = code
  }
}

export interface OnboardingMedicineIdentity {
  id: string
  slug: string
  name: string
  aliases: string[]
}

export interface RegistryInterventionMatch {
  name: string
  type: string | null
  otherNames: string[]
  matchedMedicineName: string
}

export interface ClinicalTrialsRegistryFacts {
  nctId: string
  acronym: string | null
  briefTitle: string
  officialTitle: string | null
  conditions: string[]
  sponsor: string | null
  sponsorClass: string | null
  phases: string[]
  overallStatus: string | null
  enrollmentCount: number | null
  enrollmentType: string | null
  startDate: string | null
  primaryCompletionDate: string | null
  completionDate: string | null
  hasResults: boolean | null
  intervention: RegistryInterventionMatch
}

export interface ClinicalTrialProgrammeOnboardingPlan {
  medicine: OnboardingMedicineIdentity
  source: {
    id: string
    externalIdentifier: string
    canonicalLocator: string
    title: string
    sponsor: string | null
  }
  snapshot: {
    id: string
    retrievedAt: Date
    contentHash: string
    structuredData: Record<string, unknown>
    rawSnapshotLocator: string
  }
  programme: {
    id: string
    slug: string
    title: string
    indication: string | null
    sponsor: string | null
    status: ProgrammeStatus
    highestPhaseReached: string | null
    startDate: string | null
    endDate: string | null
  }
  trial: {
    id: string
    trialIdentifier: string
    title: string
    phase: string | null
    status: TrialStatus
    resultsStatus: TrialResultsStatus
    enrolment: number | null
    enrolmentType: TrialEnrolmentType
    startDate: string | null
    primaryCompletionDate: string | null
    completionDate: string | null
  }
  freshness: {
    checkedAt: Date
    nextCheckDueAt: Date
  }
  facts: ClinicalTrialsRegistryFacts
}

export interface OnboardingPersistenceResult {
  outcome: 'WOULD_CREATE' | 'CREATED' | 'ALREADY_ONBOARDED'
  records: {
    sourceId: string
    snapshotId: string
    programmeId: string
    programmeSlug: string
    trialId: string
  }
  writes: {
    source: boolean
    snapshot: boolean
    programme: boolean
    trial: boolean
    freshness: boolean
  }
}

export interface ClinicalTrialProgrammeOnboardingStore {
  findMedicineBySlug(slug: string): Promise<OnboardingMedicineIdentity | null>
  apply(
    plan: ClinicalTrialProgrammeOnboardingPlan,
    options: { commit: boolean },
  ): Promise<OnboardingPersistenceResult>
}

export interface OnboardClinicalTrialProgrammeInput {
  medicineSlug: string
  nctId: string
  commit?: boolean
  adapter: EvidenceSourceAdapter
  store: ClinicalTrialProgrammeOnboardingStore
}

export interface ClinicalTrialProgrammeOnboardingResult {
  schemaVersion: typeof CLINICAL_TRIAL_PROGRAMME_ONBOARDING_SCHEMA_VERSION
  mode: 'DRY_RUN' | 'COMMIT'
  outcome: OnboardingPersistenceResult['outcome']
  medicine: { id: string; slug: string; name: string }
  registry: ClinicalTrialsRegistryFacts
  records: OnboardingPersistenceResult['records']
  writes: OnboardingPersistenceResult['writes']
  checkedAt: string
  nextCheckDueAt: string
  safety: {
    createsClaims: false
    createsEvidenceNodes: false
    createsVerdict: false
    createsReviewers: false
    publishesConclusion: false
  }
}

interface RegistryIntervention {
  name: string
  type: string | null
  otherNames: string[]
}

function stableId(prefix: string, parts: readonly string[]): string {
  const material = parts.map((part) => `${part.length}:${part}`).join('|')
  return `${prefix}_${createHash('sha256').update(material, 'utf8').digest('hex').slice(0, 48)}`
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function child(value: unknown, key: string): Record<string, unknown> | null {
  return record(record(value)?.[key])
}

function stringValue(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const parsed = stringValue(item)
    return parsed ? [parsed] : []
  })
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function enrollmentCount(value: unknown): number | null {
  if (value === undefined || value === null) return null
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > 2_147_483_647) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'ClinicalTrials.gov returned an invalid enrollment count.',
    )
  }
  return value as number
}

function normalizeMedicineName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function containsWholeName(registryName: string, medicineName: string): boolean {
  if (registryName === medicineName) return true
  if (medicineName.length < 4) return false
  return ` ${registryName} `.includes(` ${medicineName} `)
}

function interventionsFromPayload(protocol: Record<string, unknown>): RegistryIntervention[] {
  const interventionModule = child(protocol, 'armsInterventionsModule')
  const interventions = interventionModule?.interventions
  if (!Array.isArray(interventions)) return []

  return interventions.flatMap((value) => {
    const item = record(value)
    const name = stringValue(item?.name)
    if (!item || !name) return []
    return [
      {
        name,
        type: stringValue(item.type),
        otherNames: stringList(item.otherNames),
      },
    ]
  })
}

function findInterventionMatch(
  interventions: readonly RegistryIntervention[],
  medicine: OnboardingMedicineIdentity,
): RegistryInterventionMatch | null {
  const candidates = [...new Set([medicine.name, ...medicine.aliases].map((name) => name.trim()))]
    .map((display) => ({ display, normalized: normalizeMedicineName(display) }))
    .filter((candidate) => candidate.normalized.length > 0)

  for (const intervention of interventions) {
    const registeredNames = [intervention.name, ...intervention.otherNames].map((name) =>
      normalizeMedicineName(name),
    )
    for (const candidate of candidates) {
      if (
        registeredNames.some((registeredName) =>
          containsWholeName(registeredName, candidate.normalized),
        )
      ) {
        return { ...intervention, matchedMedicineName: candidate.display }
      }
    }
  }
  return null
}

export function clinicalTrialsExactDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      `ClinicalTrials.gov returned an invalid full date: ${value}`,
    )
  }
  return value
}

export function clinicalTrialsProgrammeStatus(value: string | null): ProgrammeStatus {
  const mapping: Partial<Record<string, ProgrammeStatus>> = {
    NOT_YET_RECRUITING: 'PLANNED',
    RECRUITING: 'RECRUITING',
    ENROLLING_BY_INVITATION: 'RECRUITING',
    ACTIVE_NOT_RECRUITING: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    SUSPENDED: 'PAUSED',
    TERMINATED: 'STOPPED',
    WITHDRAWN: 'WITHDRAWN',
  }
  return (value && mapping[value]) || 'UNKNOWN'
}

export function clinicalTrialsTrialStatus(value: string | null): TrialStatus {
  const supported = new Set<TrialStatus>([
    'NOT_YET_RECRUITING',
    'RECRUITING',
    'ENROLLING_BY_INVITATION',
    'ACTIVE_NOT_RECRUITING',
    'COMPLETED',
    'SUSPENDED',
    'TERMINATED',
    'WITHDRAWN',
  ])
  return value && supported.has(value as TrialStatus) ? (value as TrialStatus) : 'UNKNOWN'
}

export function clinicalTrialsEnrollmentType(value: string | null): TrialEnrolmentType {
  if (value === 'ACTUAL' || value === 'ESTIMATED') return value
  return 'UNKNOWN'
}

export function clinicalTrialsResultsStatus(value: boolean | null): TrialResultsStatus {
  if (value === true) return 'AVAILABLE'
  if (value === false) return 'NOT_POSTED'
  return 'UNKNOWN'
}

export function clinicalTrialsPhaseLabel(phases: readonly string[]): string | null {
  const labels: Record<string, string> = {
    NA: 'Not applicable',
    EARLY_PHASE1: 'Early Phase 1',
    PHASE1: 'Phase 1',
    PHASE2: 'Phase 2',
    PHASE3: 'Phase 3',
    PHASE4: 'Phase 4',
  }
  if (phases.length === 0) return null
  return phases.map((phase) => labels[phase] ?? phase).join(' / ')
}

function assertLength(value: string | null, max: number, field: string): void {
  if (value && value.length > max) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'REGISTRY_FIELD_TOO_LONG',
      `ClinicalTrials.gov ${field} exceeds RNAWiki's ${max}-character storage limit.`,
    )
  }
}

export function parseClinicalTrialsRegistryFacts(
  snapshot: SourceSnapshot,
  requestedNctId: string,
  medicine: OnboardingMedicineIdentity,
): ClinicalTrialsRegistryFacts {
  const payload = record(snapshot.payload)
  const protocol = child(payload, 'protocolSection')
  if (!payload || !protocol) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'ClinicalTrials.gov returned a record without a protocol section.',
    )
  }

  const identification = child(protocol, 'identificationModule')
  const returnedNctId = stringValue(identification?.nctId)?.toUpperCase()
  if (!returnedNctId) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'ClinicalTrials.gov returned a record without an NCT identifier.',
    )
  }
  if (returnedNctId !== requestedNctId) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'REGISTRY_IDENTIFIER_MISMATCH',
      `ClinicalTrials.gov returned ${returnedNctId} for requested ${requestedNctId}.`,
    )
  }

  const briefTitle = stringValue(identification?.briefTitle)
  if (!briefTitle) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      `ClinicalTrials.gov record ${requestedNctId} has no brief title.`,
    )
  }

  const status = child(protocol, 'statusModule')
  const sponsorModule = child(protocol, 'sponsorCollaboratorsModule')
  const sponsor = child(sponsorModule, 'leadSponsor')
  const design = child(protocol, 'designModule')
  const enrollment = child(design, 'enrollmentInfo')
  const conditions = child(protocol, 'conditionsModule')
  const intervention = findInterventionMatch(interventionsFromPayload(protocol), medicine)
  if (!intervention) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'MEDICINE_INTERVENTION_MISMATCH',
      `Neither ${medicine.name} nor one of its saved aliases appears in a registered intervention for ${requestedNctId}.`,
    )
  }

  return {
    nctId: returnedNctId,
    acronym: stringValue(identification?.acronym),
    briefTitle,
    officialTitle: stringValue(identification?.officialTitle),
    conditions: stringList(conditions?.conditions),
    sponsor: stringValue(sponsor?.name),
    sponsorClass: stringValue(sponsor?.class),
    phases: stringList(design?.phases),
    overallStatus: stringValue(status?.overallStatus)?.toUpperCase() ?? null,
    enrollmentCount: enrollmentCount(enrollment?.count),
    enrollmentType: stringValue(enrollment?.type)?.toUpperCase() ?? null,
    startDate: stringValue(child(status, 'startDateStruct')?.date),
    primaryCompletionDate: stringValue(child(status, 'primaryCompletionDateStruct')?.date),
    completionDate: stringValue(child(status, 'completionDateStruct')?.date),
    hasResults: booleanValue(payload.hasResults),
    intervention,
  }
}

function buildPlan(
  medicine: OnboardingMedicineIdentity,
  snapshot: SourceSnapshot,
  facts: ClinicalTrialsRegistryFacts,
): ClinicalTrialProgrammeOnboardingPlan {
  const retrievedAt = new Date(snapshot.retrievedAt)
  if (Number.isNaN(retrievedAt.getTime())) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'The ClinicalTrials.gov adapter returned an invalid retrieval time.',
    )
  }
  if (!/^[0-9a-f]{64}$/.test(snapshot.contentHash)) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'The ClinicalTrials.gov adapter returned an invalid SHA-256 content hash.',
    )
  }
  const structuredData = record(snapshot.payload)
  if (!structuredData) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'The ClinicalTrials.gov adapter returned a non-object payload.',
    )
  }

  const sourceId = stableId('ctsource', [facts.nctId])
  const programmeId = stableId('programme', [medicine.id, facts.nctId])
  const trialId = stableId('trial', [programmeId, facts.nctId])
  const snapshotId = stableId('snapshot', [sourceId, snapshot.contentHash])
  const phase = clinicalTrialsPhaseLabel(facts.phases)
  const indication = facts.conditions.length > 0 ? facts.conditions.join('; ') : null
  const startDate = clinicalTrialsExactDate(facts.startDate)
  const primaryCompletionDate = clinicalTrialsExactDate(facts.primaryCompletionDate)
  const completionDate = clinicalTrialsExactDate(facts.completionDate)

  assertLength(facts.briefTitle, 300, 'brief title')
  assertLength(facts.sponsor, 300, 'lead sponsor')
  assertLength(phase, 80, 'phase')
  if (startDate && completionDate && completionDate < startDate) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'REGISTRY_DATE_ORDER_INVALID',
      `ClinicalTrials.gov reports completion before start for ${facts.nctId}.`,
    )
  }

  return {
    medicine,
    source: {
      id: sourceId,
      externalIdentifier: facts.nctId,
      canonicalLocator: snapshot.canonicalLocator,
      title: facts.briefTitle,
      sponsor: facts.sponsor,
    },
    snapshot: {
      id: snapshotId,
      retrievedAt,
      contentHash: snapshot.contentHash,
      structuredData,
      rawSnapshotLocator: snapshot.canonicalLocator,
    },
    programme: {
      id: programmeId,
      slug: facts.nctId.toLowerCase(),
      title: facts.briefTitle,
      indication,
      sponsor: facts.sponsor,
      status: clinicalTrialsProgrammeStatus(facts.overallStatus),
      highestPhaseReached: phase,
      startDate,
      endDate: completionDate,
    },
    trial: {
      id: trialId,
      trialIdentifier: facts.nctId,
      title: facts.briefTitle,
      phase,
      status: clinicalTrialsTrialStatus(facts.overallStatus),
      resultsStatus: clinicalTrialsResultsStatus(facts.hasResults),
      enrolment: facts.enrollmentCount,
      enrolmentType: clinicalTrialsEnrollmentType(facts.enrollmentType),
      startDate,
      primaryCompletionDate,
      completionDate,
    },
    freshness: {
      checkedAt: retrievedAt,
      nextCheckDueAt: new Date(retrievedAt.getTime() + ONE_DAY_MS),
    },
    facts,
  }
}

export async function onboardClinicalTrialProgramme(
  input: OnboardClinicalTrialProgrammeInput,
): Promise<ClinicalTrialProgrammeOnboardingResult> {
  const medicineSlug = input.medicineSlug.trim()
  if (!medicineSlug) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_MEDICINE_SLUG',
      'A medicine slug is required.',
    )
  }
  const nctId = input.nctId.trim().toUpperCase()
  if (!NCT_PATTERN.test(nctId)) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_NCT_ID',
      'The registry identifier must use the NCT######## format.',
    )
  }

  const medicine = await input.store.findMedicineBySlug(medicineSlug)
  if (!medicine) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'MEDICINE_NOT_FOUND',
      `RNAWiki has no medicine with slug ${medicineSlug}.`,
    )
  }
  const identifier = { kind: 'NCT' as const, value: nctId }
  if (input.adapter.key !== 'clinicaltrials.gov/v2' || !input.adapter.supports(identifier)) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'ADAPTER_UNSUPPORTED',
      `The configured source adapter does not support ${nctId}.`,
    )
  }

  const snapshot = await input.adapter.fetch(identifier)
  if (
    snapshot.adapterKey !== input.adapter.key ||
    snapshot.identifier.kind !== 'NCT' ||
    snapshot.identifier.value.trim().toUpperCase() !== nctId ||
    snapshot.canonicalLocator !== `https://clinicaltrials.gov/study/${nctId}`
  ) {
    throw new ClinicalTrialProgrammeOnboardingError(
      'INVALID_REGISTRY_PAYLOAD',
      'The ClinicalTrials.gov adapter returned source identity metadata that does not match the request.',
    )
  }
  const facts = parseClinicalTrialsRegistryFacts(snapshot, nctId, medicine)
  const plan = buildPlan(medicine, snapshot, facts)
  const commit = input.commit === true
  const persistence = await input.store.apply(plan, { commit })

  return {
    schemaVersion: CLINICAL_TRIAL_PROGRAMME_ONBOARDING_SCHEMA_VERSION,
    mode: commit ? 'COMMIT' : 'DRY_RUN',
    outcome: persistence.outcome,
    medicine: { id: medicine.id, slug: medicine.slug, name: medicine.name },
    registry: facts,
    records: persistence.records,
    writes: persistence.writes,
    checkedAt: plan.freshness.checkedAt.toISOString(),
    nextCheckDueAt: plan.freshness.nextCheckDueAt.toISOString(),
    safety: {
      createsClaims: false,
      createsEvidenceNodes: false,
      createsVerdict: false,
      createsReviewers: false,
      publishesConclusion: false,
    },
  }
}

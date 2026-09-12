/**
 * Deterministic trial-role classification and role-aware registry aggregates
 * (docs/entity-resolution-and-trial-role-spec.md).
 *
 * The corpus matched a page to a registered study whenever one of the study's intervention names
 * or other-names reduced to the page's name (scripts/corpus-20k/registry/match.ts). That is a fact
 * about registration and nothing more: the 887,132-person "largest trial" of semaglutide on the
 * live site is NCT07096063, an OBSERVATIONAL comparative-effectiveness study that lists four
 * drugs as cohort exposures; the "31-year" longest inclisiran trial is a study registered to end in
 * 2049. Neither is a trial that tested the substance for that long or on that many people.
 *
 * This module reads what the 2026-09-01 snapshot actually holds — study type, the intervention
 * entries with their types, enrolment count and type, status and dates — and assigns each match one
 * role from `TRIAL_ROLES`. It never guesses: where the snapshot cannot decide between "tested
 * treatment" and "active comparator" (several active interventions, no arm groups in the fetched
 * fields), the role is `administered_role_unclear`, and only `experimental_intervention` may support
 * the sentence that a trial tested the substance.
 *
 * Nothing here reads a result. A role says what a substance was in a study, not what happened.
 */
import { normalizeInterventionName } from '@/lib/dossier-completion/trial-registry-match'
import { trialRoleSupportsTestedClaim, type TrialRole } from './taxonomy'

export const TRIAL_ROLE_CLASSIFIER_VERSION = 'trial-role-classifier/v1' as const

export interface RegistryInterventionEntry {
  type: string | null
  name: string | null
  otherNames: string[]
}

/** The fields of one registered study the classifier and the aggregate read. */
export interface RegistryStudyForRoles {
  nctId: string
  briefTitle: string | null
  studyType: string | null
  overallStatus: string | null
  phases: string[]
  startDate: string | null
  primaryCompletionDate: string | null
  completionDate: string | null
  enrollment: { count: number | null; type: string | null }
  interventions: RegistryInterventionEntry[]
  whyStopped: string | null
  hasResults: boolean
}

/** How the corpus recorded the match (`page_registry_studies.role`). */
export type LegacyMatchKind = 'intervention' | 'otherName' | 'stored'

export interface TrialRoleAssignment {
  nctId: string
  role: TrialRole
  /** One sentence, in the snapshot's own terms, saying why this role and not another. */
  basis: string
  administered: boolean
  supportsTestedClaim: boolean
  /** The match came through a synonym rather than the page's own name. */
  synonymMatched: boolean
  /** Withdrawn, or registered with zero or no enrolment: kept out of every size statistic. */
  excludedFromSizeStatistics: boolean
  /** The registered completion date lies after the snapshot date, or the study has not completed. */
  completionIsPlanned: boolean
  classifierVersion: typeof TRIAL_ROLE_CLASSIFIER_VERSION
}

const PLACEBO_LIKE = /\b(placebo|sham|vehicle|saline|dummy|no intervention|no treatment)\b/i
const ACTIVE_INTERVENTION_TYPES = new Set([
  'DRUG',
  'BIOLOGICAL',
  'DIETARY_SUPPLEMENT',
  'COMBINATION_PRODUCT',
  'GENETIC',
  'RADIATION',
  'DEVICE',
  'PROCEDURE',
  'BEHAVIORAL',
  'OTHER',
])

function isPlaceboLike(entry: RegistryInterventionEntry): boolean {
  const names = [entry.name ?? '', ...entry.otherNames]
  return names.length > 0 && names.every((name) => name === '' || PLACEBO_LIKE.test(name))
}

function keysOf(entry: RegistryInterventionEntry): string[] {
  return [entry.name ?? '', ...entry.otherNames]
    .filter((name) => name.trim().length > 0)
    .map((name) => normalizeInterventionName(name))
}

/** Parse the registry's `YYYY`, `YYYY-MM` or `YYYY-MM-DD` date into a UTC timestamp. */
export function parseRegistryDate(value: string | null | undefined): number | null {
  if (!value) return null
  const match = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = match[2] ? Number(match[2]) - 1 : 0
  const day = match[3] ? Number(match[3]) : 1
  const timestamp = Date.UTC(year, month, day)
  return Number.isFinite(timestamp) ? timestamp : null
}

const COMPLETED_STATUSES = new Set(['COMPLETED', 'TERMINATED'])

export function completionIsPlanned(study: RegistryStudyForRoles, snapshotDate: string): boolean {
  const end = parseRegistryDate(study.completionDate)
  const snapshot = parseRegistryDate(snapshotDate)
  if (end === null || snapshot === null) return true
  if (end > snapshot) return true
  return !COMPLETED_STATUSES.has(study.overallStatus ?? '')
}

/**
 * Assign one role to one (page, study) match.
 *
 * `matchedNames` are the registered names the corpus equated with the page, exactly as printed.
 */
export function classifyTrialRole(
  study: RegistryStudyForRoles,
  matchedNames: readonly string[],
  matchKind: LegacyMatchKind,
  snapshotDate: string,
): TrialRoleAssignment {
  const matchedKeys = new Set(matchedNames.map((name) => normalizeInterventionName(name)))
  const entries = study.interventions
  const matchedEntries = entries.filter((entry) =>
    keysOf(entry).some((key) => matchedKeys.has(key)),
  )
  const synonymMatched = matchKind === 'otherName'
  const excluded =
    study.overallStatus === 'WITHDRAWN' ||
    study.enrollment.count === null ||
    study.enrollment.count <= 0
  const planned = completionIsPlanned(study, snapshotDate)

  const finish = (role: TrialRole, basis: string): TrialRoleAssignment => ({
    nctId: study.nctId,
    role,
    basis,
    administered:
      role === 'experimental_intervention' ||
      role === 'active_comparator' ||
      role === 'administered_role_unclear' ||
      role === 'background_therapy',
    supportsTestedClaim: trialRoleSupportsTestedClaim(role),
    synonymMatched,
    excludedFromSizeStatistics: excluded,
    completionIsPlanned: planned,
    classifierVersion: TRIAL_ROLE_CLASSIFIER_VERSION,
  })

  if (matchedEntries.length === 0) {
    return finish(
      'unclear',
      matchKind === 'stored'
        ? 'The match was carried over from an earlier record and no registered intervention entry in this snapshot names the substance.'
        : 'No registered intervention entry in this snapshot reduces to the matched name.',
    )
  }

  if (matchedEntries.every(isPlaceboLike)) {
    return finish(
      'placebo',
      'The only registered entry naming the substance is a placebo or sham arm.',
    )
  }

  const studyType = (study.studyType ?? '').toUpperCase()
  if (studyType === 'OBSERVATIONAL') {
    return finish(
      'observational_exposure',
      'The registry records this as an observational study; the substance is a cohort exposure, not a treatment the study assigned.',
    )
  }
  if (studyType && studyType !== 'INTERVENTIONAL') {
    return finish(
      'unclear',
      `The registry records the study type as ${studyType}, which does not describe an assigned treatment.`,
    )
  }

  const activeEntries = entries.filter(
    (entry) =>
      !isPlaceboLike(entry) &&
      (entry.type === null || ACTIVE_INTERVENTION_TYPES.has(entry.type.toUpperCase())),
  )
  const otherActive = activeEntries.filter((entry) => !matchedEntries.includes(entry))

  if (otherActive.length === 0) {
    return finish(
      'experimental_intervention',
      matchedEntries.length === 1
        ? 'The substance is the only active registered intervention; every other entry is a placebo, sham or no-treatment arm.'
        : 'Every active registered intervention entry names the substance; the rest are placebo, sham or no-treatment arms.',
    )
  }

  return finish(
    'administered_role_unclear',
    `${otherActive.length} other active ${otherActive.length === 1 ? 'intervention is' : 'interventions are'} registered (${otherActive
      .map((entry) => entry.name ?? '')
      .filter(Boolean)
      .slice(0, 3)
      .join(
        ', ',
      )}) and the snapshot holds no arm groups, so the substance may be the tested treatment, an active comparator or one part of a combination.`,
  )
}

/* ------------------------------------------------------------------ role-aware aggregate */

export interface RoleAwareStudyRow {
  nctId: string
  role: TrialRole
  enrollment: number | null
  enrollmentType: string | null
  status: string | null
  startDate: string | null
  completionDate: string | null
  completionIsPlanned: boolean
  phases: string[]
  synonymMatched: boolean
}

export interface RoleAwareRegistryAggregate {
  classifierVersion: typeof TRIAL_ROLE_CLASSIFIER_VERSION
  snapshotDate: string
  matchedStudies: number
  byRole: Partial<Record<TrialRole, number>>
  synonymMatched: number
  excludedFromSizeStatistics: number
  /** Studies whose registered completion lies after the snapshot: never a "longest trial". */
  plannedCompletionIgnored: number
  tested: {
    studies: number
    /** Largest by registered enrolment among tested studies with an enrolment above zero. */
    largest: { nctId: string; enrollment: number; enrollmentType: string | null } | null
    /**
     * Longest registered window among tested studies that have completed. It is the span from the
     * registered start to the registered completion date. It is not the time anyone took the
     * substance.
     */
    longestCompletedWindow: {
      nctId: string
      days: number
      startDate: string
      completionDate: string
    } | null
    medianEnrollment: number | null
    completedWithPostedResults: number
  }
  administeredRoleUnclear: number
  observationalExposure: number
  rows: RoleAwareStudyRow[]
}

function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[middle]!
    : Math.round(((sorted[middle - 1]! + sorted[middle]!) / 2) * 100) / 100
}

export function roleAwareRegistryAggregate(
  entries: ReadonlyArray<{ study: RegistryStudyForRoles; assignment: TrialRoleAssignment }>,
  snapshotDate: string,
): RoleAwareRegistryAggregate {
  const byRole: Partial<Record<TrialRole, number>> = {}
  const rows: RoleAwareStudyRow[] = []
  let synonymMatched = 0
  let excluded = 0
  let planned = 0
  let testedStudies = 0
  let largest: RoleAwareRegistryAggregate['tested']['largest'] = null
  let longest: RoleAwareRegistryAggregate['tested']['longestCompletedWindow'] = null
  const testedEnrolments: number[] = []
  let completedWithResults = 0

  for (const { study, assignment } of entries) {
    byRole[assignment.role] = (byRole[assignment.role] ?? 0) + 1
    if (assignment.synonymMatched) synonymMatched += 1
    if (assignment.excludedFromSizeStatistics) excluded += 1
    if (assignment.completionIsPlanned) planned += 1
    rows.push({
      nctId: study.nctId,
      role: assignment.role,
      enrollment: study.enrollment.count,
      enrollmentType: study.enrollment.type,
      status: study.overallStatus,
      startDate: study.startDate,
      completionDate: study.completionDate,
      completionIsPlanned: assignment.completionIsPlanned,
      phases: study.phases,
      synonymMatched: assignment.synonymMatched,
    })
    if (!assignment.supportsTestedClaim) continue
    testedStudies += 1
    if (study.hasResults && study.overallStatus === 'COMPLETED') completedWithResults += 1
    if (!assignment.excludedFromSizeStatistics && study.enrollment.count !== null) {
      testedEnrolments.push(study.enrollment.count)
      if (!largest || study.enrollment.count > largest.enrollment) {
        largest = {
          nctId: study.nctId,
          enrollment: study.enrollment.count,
          enrollmentType: study.enrollment.type,
        }
      }
    }
    if (!assignment.completionIsPlanned && study.startDate && study.completionDate) {
      const start = parseRegistryDate(study.startDate)
      const end = parseRegistryDate(study.completionDate)
      if (start !== null && end !== null && end >= start) {
        const days = Math.round((end - start) / 86_400_000)
        if (!longest || days > longest.days) {
          longest = {
            nctId: study.nctId,
            days,
            startDate: study.startDate,
            completionDate: study.completionDate,
          }
        }
      }
    }
  }

  return {
    classifierVersion: TRIAL_ROLE_CLASSIFIER_VERSION,
    snapshotDate,
    matchedStudies: entries.length,
    byRole,
    synonymMatched,
    excludedFromSizeStatistics: excluded,
    plannedCompletionIgnored: planned,
    tested: {
      studies: testedStudies,
      largest,
      longestCompletedWindow: longest,
      medianEnrollment: median(testedEnrolments),
      completedWithPostedResults: completedWithResults,
    },
    administeredRoleUnclear: byRole.administered_role_unclear ?? 0,
    observationalExposure: byRole.observational_exposure ?? 0,
    rows,
  }
}

/** Read the classifier's study shape out of a raw ClinicalTrials.gov API v2 record. */
export function registryStudyForRoles(raw: unknown): RegistryStudyForRoles | null {
  const study = raw as {
    hasResults?: boolean
    protocolSection?: {
      identificationModule?: { nctId?: string; briefTitle?: string }
      statusModule?: {
        overallStatus?: string
        whyStopped?: string
        startDateStruct?: { date?: string }
        primaryCompletionDateStruct?: { date?: string }
        completionDateStruct?: { date?: string }
      }
      designModule?: {
        studyType?: string
        phases?: string[]
        enrollmentInfo?: { count?: number; type?: string }
      }
      armsInterventionsModule?: {
        interventions?: Array<{ type?: string; name?: string; otherNames?: string[] }>
      }
    }
  }
  const protocol = study?.protocolSection
  const nctId = protocol?.identificationModule?.nctId
  if (typeof nctId !== 'string' || !/^NCT\d{8}$/u.test(nctId)) return null
  const text = (value: unknown): string | null =>
    typeof value === 'string' && value.trim() ? value.trim() : null
  return {
    nctId,
    briefTitle: text(protocol?.identificationModule?.briefTitle),
    studyType: text(protocol?.designModule?.studyType),
    overallStatus: text(protocol?.statusModule?.overallStatus),
    phases: (protocol?.designModule?.phases ?? []).filter(
      (phase): phase is string => typeof phase === 'string',
    ),
    startDate: text(protocol?.statusModule?.startDateStruct?.date),
    primaryCompletionDate: text(protocol?.statusModule?.primaryCompletionDateStruct?.date),
    completionDate: text(protocol?.statusModule?.completionDateStruct?.date),
    enrollment: {
      count:
        typeof protocol?.designModule?.enrollmentInfo?.count === 'number'
          ? protocol.designModule.enrollmentInfo.count
          : null,
      type: text(protocol?.designModule?.enrollmentInfo?.type),
    },
    interventions: (protocol?.armsInterventionsModule?.interventions ?? []).map((entry) => ({
      type: text(entry?.type),
      name: text(entry?.name),
      otherNames: (entry?.otherNames ?? []).filter(
        (name): name is string => typeof name === 'string' && name.trim().length > 0,
      ),
    })),
    whyStopped: text(protocol?.statusModule?.whyStopped),
    hasResults: study?.hasResults === true,
  }
}

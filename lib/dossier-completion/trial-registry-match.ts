import { normalizeContentName } from '@/lib/background/name-normalization'

/**
 * Exact-name matching between corpus entities and registered interventions.
 *
 * The registry names an intervention however the sponsor typed it: "MetFORMIN 500 Mg Oral
 * Tablet", "Metformin Hydrochloride", "metformin". Content normalization strips salt, ester and
 * dosage-form words; this module additionally strips printed dose amounts, so all three reduce to
 * the same key as the corpus name "Metformin". A study matches an entity only when one of its
 * intervention names or registered other-names reduces to exactly the same key as the entity's
 * recorded name or one of its unambiguous aliases. Nothing fuzzy: no substring, no token overlap,
 * no similarity score. The registered name that matched is kept, so a reader sees what the
 * sponsor wrote and which corpus name it was equated with.
 *
 * A match is a registry fact about registration. It is never a result, and the presence of a
 * posted-results flag is recorded as a flag, not read as an outcome.
 */

export const TRIAL_MATCH_NORMALIZATION_VERSION = 'trial-intervention-match/v1' as const

/** Printed strengths and doses, which a registered intervention name often carries. */
const DOSE_PATTERN =
  /\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|µg|ug|g|kg|ml|l|iu|units?|%|mmol|meq|mg\/kg|mg\/ml|mcg\/ml|mg\/m2)\b/giu

export function normalizeInterventionName(value: string): string {
  return normalizeContentName(value.replace(DOSE_PATTERN, ' ')).replace(/\s+/gu, ' ').trim()
}

/** Keys shorter than this match too much by accident (initialisms, fragments) and are refused. */
export const MINIMUM_MATCH_KEY_LENGTH = 4

export interface EntityMatchNames {
  drugId: string
  canonicalSlug: string
  /** Each key with the corpus name it came from and how that name is recorded. */
  keys: ReadonlyArray<{
    key: string
    name: string
    via: 'name' | 'inn' | 'salt_form' | 'common_name' | 'brand' | 'duplicate_record'
  }>
}

export interface RegistryStudySummary {
  nctId: string
  briefTitle: string | null
  overallStatus: string | null
  studyType: string | null
  phases: string[]
  hasResults: boolean
  resultsFirstPostDate: string | null
  startDate: string | null
  primaryCompletionDate: string | null
  completionDate: string | null
  lastUpdatePostDate: string | null
  whyStopped: string | null
  enrollment: { count: number | null; type: string | null }
  leadSponsor: { name: string | null; class: string | null }
  conditions: string[]
  /** The registered intervention names (and other-names) that matched, exactly as printed. */
  matchedInterventionNames: string[]
  eligibility: {
    sex: string | null
    minimumAge: string | null
    maximumAge: string | null
    stdAges: string[]
    healthyVolunteers: boolean | null
  }
  primaryOutcomes: Array<{ measure: string; timeFrame: string | null }>
  design: { allocation: string | null; masking: string | null; primaryPurpose: string | null }
}

export interface EntityRegistryMatch {
  drugId: string
  canonicalSlug: string
  /** Every distinct study that matched, ordered by NCT id. */
  studies: RegistryStudySummary[]
  /** Which corpus keys produced at least one match. */
  matchedKeys: Array<{ key: string; name: string; via: string; studies: number }>
}

type RawStudy = {
  hasResults?: boolean
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string }
    statusModule?: {
      overallStatus?: string
      whyStopped?: string
      startDateStruct?: { date?: string }
      primaryCompletionDateStruct?: { date?: string }
      completionDateStruct?: { date?: string }
      resultsFirstPostDateStruct?: { date?: string }
      lastUpdatePostDateStruct?: { date?: string }
    }
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string; class?: string } }
    conditionsModule?: { conditions?: string[] }
    designModule?: {
      studyType?: string
      phases?: string[]
      enrollmentInfo?: { count?: number; type?: string }
      designInfo?: {
        allocation?: string
        primaryPurpose?: string
        maskingInfo?: { masking?: string }
      }
    }
    armsInterventionsModule?: {
      interventions?: Array<{ type?: string; name?: string; otherNames?: string[] }>
    }
    outcomesModule?: { primaryOutcomes?: Array<{ measure?: string; timeFrame?: string }> }
    eligibilityModule?: {
      sex?: string
      minimumAge?: string
      maximumAge?: string
      stdAges?: string[]
      healthyVolunteers?: boolean
    }
  }
}

const MAX_CONDITIONS = 10
const MAX_OUTCOMES = 10

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export function summarizeStudy(
  raw: unknown,
  matchedInterventionNames: string[],
): RegistryStudySummary | null {
  const study = raw as RawStudy
  const protocol = study.protocolSection
  const nctId = text(protocol?.identificationModule?.nctId)
  if (!nctId || !/^NCT\d{8}$/u.test(nctId)) return null
  const status = protocol?.statusModule
  const design = protocol?.designModule
  const eligibility = protocol?.eligibilityModule
  return {
    nctId,
    briefTitle: text(protocol?.identificationModule?.briefTitle),
    overallStatus: text(status?.overallStatus),
    studyType: text(design?.studyType),
    phases: (design?.phases ?? []).filter((phase): phase is string => typeof phase === 'string'),
    hasResults: study.hasResults === true,
    resultsFirstPostDate: text(status?.resultsFirstPostDateStruct?.date),
    startDate: text(status?.startDateStruct?.date),
    primaryCompletionDate: text(status?.primaryCompletionDateStruct?.date),
    completionDate: text(status?.completionDateStruct?.date),
    lastUpdatePostDate: text(status?.lastUpdatePostDateStruct?.date),
    whyStopped: text(status?.whyStopped),
    enrollment: {
      count: typeof design?.enrollmentInfo?.count === 'number' ? design.enrollmentInfo.count : null,
      type: text(design?.enrollmentInfo?.type),
    },
    leadSponsor: {
      name: text(protocol?.sponsorCollaboratorsModule?.leadSponsor?.name),
      class: text(protocol?.sponsorCollaboratorsModule?.leadSponsor?.class),
    },
    conditions: (protocol?.conditionsModule?.conditions ?? [])
      .filter((condition): condition is string => typeof condition === 'string')
      .slice(0, MAX_CONDITIONS),
    matchedInterventionNames: [...new Set(matchedInterventionNames)].sort(),
    eligibility: {
      sex: text(eligibility?.sex),
      minimumAge: text(eligibility?.minimumAge),
      maximumAge: text(eligibility?.maximumAge),
      stdAges: (eligibility?.stdAges ?? []).filter((age): age is string => typeof age === 'string'),
      healthyVolunteers:
        typeof eligibility?.healthyVolunteers === 'boolean' ? eligibility.healthyVolunteers : null,
    },
    primaryOutcomes: (protocol?.outcomesModule?.primaryOutcomes ?? [])
      .flatMap((outcome) => {
        const measure = text(outcome?.measure)
        return measure ? [{ measure, timeFrame: text(outcome?.timeFrame) }] : []
      })
      .slice(0, MAX_OUTCOMES),
    design: {
      allocation: text(design?.designInfo?.allocation),
      masking: text(design?.designInfo?.maskingInfo?.masking),
      primaryPurpose: text(design?.designInfo?.primaryPurpose),
    },
  }
}

/** Every registered intervention name and other-name on a study, exactly as printed. */
export function interventionNames(raw: unknown): string[] {
  const study = raw as RawStudy
  const names: string[] = []
  for (const intervention of study.protocolSection?.armsInterventionsModule?.interventions ?? []) {
    const name = text(intervention?.name)
    if (name) names.push(name)
    for (const other of intervention?.otherNames ?? []) {
      const otherName = text(other)
      if (otherName) names.push(otherName)
    }
  }
  return names
}

/**
 * Streams studies through a fixed set of wanted keys and collects matches per entity. The caller
 * feeds every study once; memory holds only matched studies and the wanted-key table.
 */
export class RegistryMatcher {
  private readonly wanted = new Map<string, EntityMatchNames[]>()
  private readonly matches = new Map<
    string,
    Map<string, { study: RegistryStudySummary; keys: Set<string> }>
  >()
  private readonly keyHits = new Map<string, Map<string, number>>()

  constructor(entities: readonly EntityMatchNames[]) {
    for (const entity of entities) {
      this.matches.set(entity.drugId, new Map())
      this.keyHits.set(entity.drugId, new Map())
      for (const { key } of entity.keys) {
        if (key.length < MINIMUM_MATCH_KEY_LENGTH) continue
        const owners = this.wanted.get(key) ?? []
        if (!owners.some((owner) => owner.drugId === entity.drugId)) owners.push(entity)
        this.wanted.set(key, owners)
      }
    }
  }

  get wantedKeyCount(): number {
    return this.wanted.size
  }

  offer(raw: unknown): void {
    const names = interventionNames(raw)
    if (names.length === 0) return
    const hitsByEntity = new Map<string, { names: string[]; keys: Set<string> }>()
    for (const name of names) {
      const key = normalizeInterventionName(name)
      const owners = this.wanted.get(key)
      if (!owners) continue
      for (const owner of owners) {
        const hit = hitsByEntity.get(owner.drugId) ?? { names: [], keys: new Set<string>() }
        hit.names.push(name)
        hit.keys.add(key)
        hitsByEntity.set(owner.drugId, hit)
      }
    }
    if (hitsByEntity.size === 0) return
    for (const [drugId, hit] of hitsByEntity) {
      const summary = summarizeStudy(raw, hit.names)
      if (!summary) continue
      const perEntity = this.matches.get(drugId)!
      const existing = perEntity.get(summary.nctId)
      if (existing) {
        for (const key of hit.keys) existing.keys.add(key)
      } else {
        perEntity.set(summary.nctId, { study: summary, keys: new Set(hit.keys) })
      }
      const hits = this.keyHits.get(drugId)!
      for (const key of hit.keys) hits.set(key, (hits.get(key) ?? 0) + 1)
    }
  }

  results(entities: readonly EntityMatchNames[]): EntityRegistryMatch[] {
    return entities.map((entity) => {
      const perEntity = this.matches.get(entity.drugId) ?? new Map()
      const hits = this.keyHits.get(entity.drugId) ?? new Map<string, number>()
      const studies = [...perEntity.values()]
        .map((entry) => entry.study)
        .sort((left, right) => left.nctId.localeCompare(right.nctId))
      const matchedKeys = entity.keys
        .filter(({ key }) => hits.has(key))
        .map(({ key, name, via }) => ({ key, name, via, studies: hits.get(key) ?? 0 }))
      return { drugId: entity.drugId, canonicalSlug: entity.canonicalSlug, studies, matchedKeys }
    })
  }
}

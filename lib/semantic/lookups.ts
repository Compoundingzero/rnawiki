/**
 * Deterministic lookups: the answers that need no retrieval model at all.
 *
 * Most of what a person asks this corpus is addressed, not searched. "What does the label say about
 * children for this record" names a record and a question, and the record either holds a statement
 * or it does not. Running that through a ranking model would add a chance of returning another
 * record's sentence in exchange for nothing.
 *
 * So the lookups below take an exact slug or an unambiguous alias plus a section id or one of the
 * seventeen silence-ledger questions, and return stored units. Three outcomes are kept apart and
 * never merged:
 *
 *   FOUND         units answering the question, with their sources;
 *   ABSENT        the record's own recorded absence for that section, with the resolver's basis;
 *   NOT_PROJECTED no unit exists for the question, which is a statement about this projection and
 *                 not about the medicine.
 *
 * An ambiguous name is refused. That is the same rule the identity model runs on, and the reason it
 * exists is that guessing attaches one record's sources to another record's name.
 */

import { SILENCE_QUESTION_IDS, type SilenceQuestionId } from '@/lib/agents/dataset/silence-ledger'
import type { DossierSectionId } from '@/lib/dossier-completion/types'
import { DOSSIER_SECTION_IDS } from '@/lib/dossier-completion/types'
import {
  FORMULATION_SCOPE_LABELS,
  POPULATION_SCOPE_LABELS,
  type EvidenceReadingUnit,
  type FormulationScope,
  type PopulationScope,
} from '@/lib/semantic/units'

export const LOOKUP_VERSION = 'semantic-lookups/v1' as const

export interface EntityResolution {
  status: 'RESOLVED' | 'AMBIGUOUS' | 'NOT_FOUND'
  slug: string | null
  candidates: string[]
}

/** What a lookup reads. Implemented over the database by scripts, and in memory by tests. */
export interface UnitLookupSource {
  /** Exact slug, or a name/alias that answers to exactly one record. */
  resolveEntity(nameOrSlug: string): EntityResolution
  unitsForSlug(slug: string): readonly EvidenceReadingUnit[]
}

export const LOOKUP_STATUSES = ['FOUND', 'ABSENT', 'NOT_PROJECTED', 'REFUSED'] as const
export type LookupStatus = (typeof LOOKUP_STATUSES)[number]

export interface LookupResult {
  status: LookupStatus
  slug: string | null
  /** Units answering the question, in projection order. Empty unless the status is FOUND. */
  units: EvidenceReadingUnit[]
  /** The record's own recorded absence for the section, when one is stored. */
  absence: EvidenceReadingUnit | null
  /** Ordinary-language statement of what was found, or why nothing was returned. */
  explanation: string
  candidates: string[]
  lookupVersion: typeof LOOKUP_VERSION
}

function refusal(resolution: EntityResolution, nameOrSlug: string): LookupResult {
  const explanation =
    resolution.status === 'AMBIGUOUS'
      ? `The name "${nameOrSlug}" answers to more than one record (${resolution.candidates.join(', ')}). Name one of them exactly.`
      : `No record answers to "${nameOrSlug}".`
  return {
    status: 'REFUSED',
    slug: null,
    units: [],
    absence: null,
    explanation,
    candidates: resolution.candidates,
    lookupVersion: LOOKUP_VERSION,
  }
}

function absenceUnitFor(
  units: readonly EvidenceReadingUnit[],
  sectionId: DossierSectionId,
): EvidenceReadingUnit | null {
  return (
    units.find(
      (unit) =>
        unit.sectionId === sectionId &&
        unit.unitKind === 'SECTION_STATE' &&
        unit.assertion === 'ABSENT',
    ) ?? null
  )
}

function sectionStateUnit(
  units: readonly EvidenceReadingUnit[],
  sectionId: DossierSectionId,
): EvidenceReadingUnit | null {
  return (
    units.find((unit) => unit.sectionId === sectionId && unit.unitKind === 'SECTION_STATE') ?? null
  )
}

function resolveOrRefuse(
  source: UnitLookupSource,
  nameOrSlug: string,
): { slug: string } | { refused: LookupResult } {
  const resolution = source.resolveEntity(nameOrSlug)
  if (resolution.status !== 'RESOLVED' || !resolution.slug) {
    return { refused: refusal(resolution, nameOrSlug) }
  }
  return { slug: resolution.slug }
}

function finish(
  slug: string,
  matches: EvidenceReadingUnit[],
  absence: EvidenceReadingUnit | null,
  sectionLabel: string,
  stateUnit: EvidenceReadingUnit | null,
): LookupResult {
  if (matches.length > 0) {
    return {
      status: 'FOUND',
      slug,
      units: matches,
      absence,
      explanation: `${matches.length} recorded reading(s) for ${sectionLabel} on ${slug}.`,
      candidates: [],
      lookupVersion: LOOKUP_VERSION,
    }
  }
  if (absence) {
    return {
      status: 'ABSENT',
      slug,
      units: [],
      absence,
      explanation: absence.text,
      candidates: [],
      lookupVersion: LOOKUP_VERSION,
    }
  }
  return {
    status: 'NOT_PROJECTED',
    slug,
    units: [],
    absence: null,
    explanation: stateUnit
      ? `No reading unit for ${sectionLabel} on ${slug}. The recorded section state says: ${stateUnit.text}`
      : `No reading unit for ${sectionLabel} on ${slug}, and no section state has been assessed for it.`,
    candidates: [],
    lookupVersion: LOOKUP_VERSION,
  }
}

/** Every unit a record holds for one dossier section, or the record's recorded absence for it. */
export function lookupSection(
  source: UnitLookupSource,
  nameOrSlug: string,
  sectionId: DossierSectionId,
): LookupResult {
  const resolved = resolveOrRefuse(source, nameOrSlug)
  if ('refused' in resolved) return resolved.refused
  const units = source.unitsForSlug(resolved.slug)
  const matches = units.filter(
    (unit) => unit.sectionId === sectionId && unit.unitKind !== 'SECTION_STATE',
  )
  return finish(
    resolved.slug,
    matches,
    absenceUnitFor(units, sectionId),
    sectionId,
    sectionStateUnit(units, sectionId),
  )
}

/**
 * Where each silence-ledger question is answered from: the section it belongs to, the field paths
 * that answer it, and the population scope when the question is about one group.
 */
interface QuestionRoute {
  sectionId: DossierSectionId
  fieldPaths?: readonly string[]
  populationScope?: PopulationScope
  label: string
}

export const SILENCE_QUESTION_ROUTES: Readonly<Record<SilenceQuestionId, QuestionRoute>> = {
  half_life: {
    sectionId: 'pharmacokinetics',
    fieldPaths: ['pharmacokinetics.halfLife'],
    label: 'an elimination half-life',
  },
  bioavailability: {
    sectionId: 'pharmacokinetics',
    fieldPaths: ['pharmacokinetics.bioavailability'],
    label: 'a bioavailability',
  },
  t_max: {
    sectionId: 'pharmacokinetics',
    fieldPaths: ['pharmacokinetics.tMax'],
    label: 'a time to maximum concentration',
  },
  protein_binding: {
    sectionId: 'pharmacokinetics',
    fieldPaths: ['pharmacokinetics.proteinBinding'],
    label: 'plasma protein binding',
  },
  volume_of_distribution: {
    sectionId: 'pharmacokinetics',
    fieldPaths: ['pharmacokinetics.volumeOfDistribution'],
    label: 'a volume of distribution',
  },
  mechanism_of_action: { sectionId: 'mechanism', label: 'how the medicine acts' },
  molecular_identity: { sectionId: 'molecular-identity', label: 'a molecular formula or weight' },
  metabolic_handling: {
    sectionId: 'pharmacokinetics',
    fieldPaths: ['pharmacokinetics.metabolismAsRecorded', 'pharmacokinetics.eliminationAsRecorded'],
    label: 'metabolism or elimination',
  },
  boxed_warning: {
    sectionId: 'safety-statements',
    fieldPaths: ['safety.boxedWarning'],
    label: 'a boxed warning',
  },
  contraindications: {
    sectionId: 'safety-statements',
    fieldPaths: ['safety.contraindications'],
    label: 'a contraindication',
  },
  most_common_adverse_reactions: {
    sectionId: 'adverse-reactions',
    label: 'the most common adverse reactions',
  },
  population_pediatric: {
    sectionId: 'population-statements',
    populationScope: 'PEDIATRIC',
    label: 'a statement about children',
  },
  population_geriatric: {
    sectionId: 'population-statements',
    populationScope: 'GERIATRIC',
    label: 'a statement about older adults',
  },
  population_pregnancy: {
    sectionId: 'population-statements',
    populationScope: 'PREGNANCY',
    label: 'a statement about pregnancy',
  },
  population_lactation: {
    sectionId: 'population-statements',
    populationScope: 'LACTATION',
    label: 'a statement about breastfeeding',
  },
  population_hepatic_impairment: {
    sectionId: 'population-statements',
    populationScope: 'HEPATIC_IMPAIRMENT',
    label: 'a statement about liver impairment',
  },
  population_renal_impairment: {
    sectionId: 'population-statements',
    populationScope: 'RENAL_IMPAIRMENT',
    label: 'a statement about kidney impairment',
  },
}

export function isSilenceQuestionId(value: string): value is SilenceQuestionId {
  return (SILENCE_QUESTION_IDS as readonly string[]).includes(value)
}

export function isDossierSectionId(value: string): value is DossierSectionId {
  return (DOSSIER_SECTION_IDS as readonly string[]).includes(value)
}

/** The units answering one of the seventeen fixed silence-ledger questions for one record. */
export function lookupSilenceQuestion(
  source: UnitLookupSource,
  nameOrSlug: string,
  questionId: SilenceQuestionId,
): LookupResult {
  const resolved = resolveOrRefuse(source, nameOrSlug)
  if ('refused' in resolved) return resolved.refused
  const route = SILENCE_QUESTION_ROUTES[questionId]
  const units = source.unitsForSlug(resolved.slug)
  const matches = units.filter((unit) => {
    if (unit.sectionId !== route.sectionId) return false
    if (unit.unitKind === 'SECTION_STATE') return false
    if (route.populationScope) return unit.populationScope === route.populationScope
    if (route.fieldPaths) {
      return route.fieldPaths.some(
        (path) => unit.fieldPath === path || unit.fieldPath.startsWith(`${path}[`),
      )
    }
    return true
  })
  return finish(
    resolved.slug,
    matches,
    absenceUnitFor(units, route.sectionId),
    route.label,
    sectionStateUnit(units, route.sectionId),
  )
}

/* ------------------------------------------------------------------------------------------- */
/* Boundary lookups                                                                             */
/* ------------------------------------------------------------------------------------------- */

export interface BoundaryResult {
  status: 'WITHIN_RECORDED_SCOPE' | 'OUTSIDE_RECORDED_SCOPE' | 'REFUSED'
  slug: string | null
  /** Units recorded for the asked scope. Empty when the scope is outside what the sources cover. */
  units: EvidenceReadingUnit[]
  /** The scopes the record's stored statements do cover, as ordinary-language labels. */
  recordedScopes: string[]
  /** One sentence built from the stored statements. Never an inference about the medicine. */
  statement: string
  candidates: string[]
  lookupVersion: typeof LOOKUP_VERSION
}

function listPhrase(items: readonly string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]!
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]!}`
}

/**
 * What the record does and does not record for one population scope.
 *
 * Built only from stored population statements. Where nothing is recorded for the asked group, the
 * sentence names the groups that ARE recorded, so a reader learns the boundary of the record rather
 * than reading an empty result as an answer about the medicine.
 */
export function populationBoundary(
  source: UnitLookupSource,
  nameOrSlug: string,
  scope: PopulationScope,
): BoundaryResult {
  const resolution = source.resolveEntity(nameOrSlug)
  if (resolution.status !== 'RESOLVED' || !resolution.slug) {
    return {
      status: 'REFUSED',
      slug: null,
      units: [],
      recordedScopes: [],
      statement: refusal(resolution, nameOrSlug).explanation,
      candidates: resolution.candidates,
      lookupVersion: LOOKUP_VERSION,
    }
  }
  const units = source.unitsForSlug(resolution.slug)
  const statements = units.filter((unit) => unit.unitKind === 'POPULATION_STATEMENT')
  const matching = statements.filter((unit) => unit.populationScope === scope)
  const label = POPULATION_SCOPE_LABELS[scope]
  const recordedScopes = [
    ...new Set(
      statements
        .map((unit) => unit.populationScope)
        .filter((value): value is PopulationScope => value !== null)
        .map((value) => POPULATION_SCOPE_LABELS[value]),
    ),
  ].sort()

  if (matching.length > 0) {
    return {
      status: 'WITHIN_RECORDED_SCOPE',
      slug: resolution.slug,
      units: matching,
      recordedScopes,
      statement: `${matching.length} recorded statement(s) for ${label} on ${resolution.slug}.`,
      candidates: [],
      lookupVersion: LOOKUP_VERSION,
    }
  }
  const statement =
    recordedScopes.length > 0
      ? `No recorded statement for ${label}; the recorded statements cover ${listPhrase(recordedScopes)} only.`
      : `No recorded statement for ${label}; this record holds no recorded population statement at all.`
  return {
    status: 'OUTSIDE_RECORDED_SCOPE',
    slug: resolution.slug,
    units: [],
    recordedScopes,
    statement,
    candidates: [],
    lookupVersion: LOOKUP_VERSION,
  }
}

/** The same boundary question for a formulation scope, built only from stored formulation scopes. */
export function formulationBoundary(
  source: UnitLookupSource,
  nameOrSlug: string,
  scope: FormulationScope,
): BoundaryResult {
  const resolution = source.resolveEntity(nameOrSlug)
  if (resolution.status !== 'RESOLVED' || !resolution.slug) {
    return {
      status: 'REFUSED',
      slug: null,
      units: [],
      recordedScopes: [],
      statement: refusal(resolution, nameOrSlug).explanation,
      candidates: resolution.candidates,
      lookupVersion: LOOKUP_VERSION,
    }
  }
  const units = source.unitsForSlug(resolution.slug)
  const matching = units.filter((unit) => unit.formulationScope === scope)
  const label = FORMULATION_SCOPE_LABELS[scope]
  const recordedScopes = [
    ...new Set(
      units
        .map((unit) => unit.formulationScope)
        .filter((value): value is FormulationScope => value !== null)
        .map((value) => FORMULATION_SCOPE_LABELS[value]),
    ),
  ].sort()

  if (matching.length > 0) {
    return {
      status: 'WITHIN_RECORDED_SCOPE',
      slug: resolution.slug,
      units: matching,
      recordedScopes,
      statement: `${matching.length} recorded reading(s) for the ${label} form on ${resolution.slug}.`,
      candidates: [],
      lookupVersion: LOOKUP_VERSION,
    }
  }
  const statement =
    recordedScopes.length > 0
      ? `No recorded reading for the ${label} form; the recorded readings name ${listPhrase(recordedScopes)} only.`
      : `No recorded reading names a form for this record.`
  return {
    status: 'OUTSIDE_RECORDED_SCOPE',
    slug: resolution.slug,
    units: [],
    recordedScopes,
    statement,
    candidates: [],
    lookupVersion: LOOKUP_VERSION,
  }
}

/** An in-memory lookup source, used by tests and by the operator query script. */
export function createUnitLookupSource(
  units: readonly EvidenceReadingUnit[],
  aliases: ReadonlyMap<string, readonly string[]>,
): UnitLookupSource {
  const bySlug = new Map<string, EvidenceReadingUnit[]>()
  for (const unit of units) {
    const list = bySlug.get(unit.canonicalSlug) ?? []
    list.push(unit)
    bySlug.set(unit.canonicalSlug, list)
  }
  return {
    resolveEntity(nameOrSlug: string): EntityResolution {
      const key = nameOrSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/gu, ' ')
        .trim()
      const direct = [...bySlug.keys()].filter(
        (slug) => slug.replace(/[^a-z0-9]+/gu, ' ').trim() === key,
      )
      if (direct.length === 1) return { status: 'RESOLVED', slug: direct[0]!, candidates: direct }
      const owners = aliases.get(key) ?? []
      if (owners.length === 1)
        return { status: 'RESOLVED', slug: owners[0]!, candidates: [...owners] }
      if (owners.length > 1) {
        return { status: 'AMBIGUOUS', slug: null, candidates: [...owners].sort() }
      }
      return { status: 'NOT_FOUND', slug: null, candidates: [] }
    },
    unitsForSlug(slug: string) {
      return bySlug.get(slug) ?? []
    },
  }
}

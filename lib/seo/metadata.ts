import type { DossierSectionId, SectionState } from '@/lib/dossier-completion/types'
import type { EntityClass } from '@/lib/inventory/entity-class-types'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { decideDossierIndexability } from '@/lib/seo/dossier-indexability'
import type { MedicineIndexabilityDecision } from '@/lib/seo/indexability'
import type { DrugDossier } from '@/lib/types'

const TITLE_LIMIT = 64
const DESCRIPTION_LIMIT = 158
/** Bound for the one finding sentence rendered on the generated social-card image. */
const SOCIAL_FINDING_LIMIT = 220

function compact(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function truncate(value: string, limit: number): string {
  const normalized = compact(value)
  if (normalized.length <= limit) return normalized

  const candidate = normalized.slice(0, Math.max(1, limit - 1))
  const boundary = candidate.lastIndexOf(' ')
  const safe = boundary >= Math.floor(limit * 0.65) ? candidate.slice(0, boundary) : candidate
  return `${safe.replace(/[\s,;:–—-]+$/u, '')}…`
}

/** Page title without the site-name suffix supplied by app/layout.tsx. */
export function dossierMetadataTitle(name: string): string {
  const entity = compact(name) || 'Medicine'
  const intent = ': Evidence, Trial Results & What Remains Unknown'
  return `${truncate(entity, TITLE_LIMIT - intent.length)}${intent}`
}

/**
 * Ordinary-language phrase for each recorded entity class. These name what kind of record the page
 * holds. None of them grades the substance or implies that anything was shown to work.
 */
export const ENTITY_CLASS_PHRASES: Record<EntityClass, string> = {
  APPROVED_MEDICINE: 'an approved medicine record',
  APPROVED_BIOLOGIC: 'an approved biologic medicine record',
  INVESTIGATIONAL_MEDICINE: 'an investigational medicine record',
  OFF_LABEL_OR_COMPOUNDED: 'a record of off-label or compounded use',
  WITHDRAWN_MEDICINE: 'a withdrawn medicine record',
  CONTROLLED_NO_APPROVED_USE: 'a controlled substance with no approved medical use',
  COMBINATION_PRODUCT: 'a combination product record',
  BOTANICAL_OR_ORGANISM_PREPARATION: 'a botanical or organism preparation record',
  SUPPLEMENT_INGREDIENT: 'a supplement ingredient record',
  MARKETED_PRODUCT_INGREDIENT: 'an ingredient of marketed products',
  REGISTRY_ONLY_IDENTITY: 'a registry identity record',
  PLACEHOLDER: 'a placeholder record',
}

export function entityClassPhrase(entityClass: string): string {
  return ENTITY_CLASS_PHRASES[entityClass as EntityClass] ?? 'a medicine record'
}

/**
 * Scalar completeness projection for the canonical-record description. It carries counts and two
 * search outcomes; it carries no section prose, so a description cannot quote a source sentence.
 */
export interface CanonicalRecordDescriptionInput {
  entityClass: string
  applicableSectionCount: number
  terminalSectionCount: number
  /**
   * `true` when the trial-registry section rests on exact matches in the ClinicalTrials.gov
   * snapshot, `false` when that snapshot was searched and matched nothing, `null` when the section
   * was not asked of this record. `false` describes the search, not the medicine.
   */
  registeredTrials: boolean | null
  /** True only when the reviewed-conclusion section holds a published reviewed interpretation. */
  reviewedConclusion: boolean
}

export interface DossierMetadataDescriptionInput {
  name: string
  reviewed: boolean
  /** Exact authored legacy answer still bound to its approved v2 evidence fingerprint. */
  provenanceBoundLegacy?: boolean
  usedFor?: string
  finding?: string
  limitation?: string
  /** Present when the record carries a stored inventory resolution and completeness assessment. */
  canonicalRecord?: CanonicalRecordDescriptionInput | null
}

/**
 * One sentence pair describing what the record is and how much of it has a stated state. Every
 * discovery surface that needs canonical-record wording builds it here, so the meta description
 * and the social card cannot describe the same URL differently.
 */
export function dossierCanonicalRecordSummary(
  name: string,
  record: CanonicalRecordDescriptionInput,
): string {
  const subject = compact(name) || 'This medicine'
  const clauses = [
    `${record.terminalSectionCount}/${record.applicableSectionCount} sections have a recorded state`,
  ]
  if (record.registeredTrials === true) clauses.push('registry snapshot searched, trials found')
  if (record.registeredTrials === false) clauses.push('registry snapshot searched, none found')
  clauses.push(
    record.reviewedConclusion ? 'a reviewed conclusion is published' : 'no reviewed conclusion yet',
  )
  return `${subject}: ${entityClassPhrase(record.entityClass)}. ${clauses.join('; ')}.`
}

/**
 * Deterministic description made only from the visible first-read answer. Programme answers must
 * be reviewed publications; a finite flagship legacy answer may enter only through its exact v2
 * evidence fingerprint. A record with neither is described by what it is and how much of it has a
 * stated state, never by a finding. Dosage, acquisition, protocol and community text are absent
 * from the input type, so callers cannot accidentally promote them into a search snippet.
 */
export function dossierMetadataDescription(input: DossierMetadataDescriptionInput): string {
  const name = compact(input.name) || 'This medicine'
  if (!input.reviewed && !input.provenanceBoundLegacy) {
    if (input.canonicalRecord) {
      return truncate(dossierCanonicalRecordSummary(name, input.canonicalRecord), DESCRIPTION_LIMIT)
    }
    return truncate(
      `${name} medicine record. No reviewed conclusion for a specific use and group of people is published on this page yet.`,
      DESCRIPTION_LIMIT,
    )
  }

  const sentences = [
    compact(input.usedFor) ? `${name}: ${compact(input.usedFor)}` : name,
    compact(input.finding),
    compact(input.limitation) ? `Main limitation: ${compact(input.limitation)}` : '',
  ].filter(Boolean)
  return truncate(sentences.join('. ').replace(/\.\./g, '.'), DESCRIPTION_LIMIT)
}

const TRIAL_REGISTRY_MATCHED_STATES: ReadonlySet<SectionState> = new Set([
  'EXACT_STRUCTURED_SOURCE_DATA',
  'EXACT_SOURCE_BACKED',
])

/** Read the two scalar section outcomes the description quotes. Never reads section prose. */
function canonicalRecordDescriptionInput(
  drug: DrugDossier,
): CanonicalRecordDescriptionInput | null {
  const assessment = drug.completionAssessment
  const resolution = drug.inventoryResolution
  if (!assessment || !resolution) return null

  const stateOf = (id: DossierSectionId): SectionState | null =>
    assessment.sections.find((section) => section.id === id)?.state ?? null
  const registry = stateOf('trial-registry')

  return {
    entityClass: resolution.entityClass,
    applicableSectionCount: assessment.applicableSectionCount,
    terminalSectionCount: assessment.terminalSectionCount,
    registeredTrials:
      registry === null
        ? null
        : TRIAL_REGISTRY_MATCHED_STATES.has(registry)
          ? true
          : registry === 'NO_QUALIFYING_EVIDENCE_AFTER_SEARCH'
            ? false
            : null,
    reviewedConclusion: stateOf('reviewed-conclusion') === 'REVIEWED_INTERPRETATION',
  }
}

export interface DossierDiscoveryProjection {
  /** The shared fail-closed policy result for the canonical (no query parameter) route. */
  decision: MedicineIndexabilityDecision | null
  /** The exact field set every discovery surface (description, social image) renders from. */
  input: DossierMetadataDescriptionInput
}

/**
 * One shared projection of a dossier's first-read answer for every discovery surface. The meta
 * description and the generated social-card image both read this structure, built from the same
 * dossier view model and the same shared indexability decision, so the two surfaces cannot gate
 * on different review states or quote different stored answer fields for the same URL.
 */
export function dossierDiscoveryProjection(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel | null,
): DossierDiscoveryProjection {
  const decision = dossier ? decideDossierIndexability(drug, dossier) : null
  return {
    decision,
    input: {
      name: drug.name,
      reviewed: decision?.reason === 'indexable_reviewed_publication',
      provenanceBoundLegacy: decision?.reason === 'indexable_provenance_bound_legacy_flagship',
      usedFor: dossier?.readerSummary.usedFor,
      finding: dossier?.readerSummary.whatStudiesFound,
      limitation: dossier?.readerSummary.biggestLimit ?? dossier?.mainLimitation,
      canonicalRecord: canonicalRecordDescriptionInput(drug),
    },
  }
}

export interface DossierSocialPreview {
  /** True only when the shared policy confirmed the reviewed programme publication. */
  reviewedAnswer: boolean
  badgeLabel: 'Reviewed evidence answer' | 'Medicine evidence record'
  /** The same first-read finding sentence the meta description quotes, or null. */
  finding: string | null
}

/**
 * Social-card projection of the exact input `dossierMetadataDescription` renders. The finding is
 * admitted under the identical gate — a policy-confirmed reviewed publication, or the exact
 * provenance-bound legacy flagship answer — so an unreviewed, stale or unpublished record shows
 * no answer text, and only the policy-confirmed reviewed publication earns the reviewed badge.
 */
export function dossierSocialPreview(input: DossierMetadataDescriptionInput): DossierSocialPreview {
  const bound = input.reviewed || input.provenanceBoundLegacy === true
  const finding = bound ? compact(input.finding) : ''
  return {
    reviewedAnswer: input.reviewed,
    badgeLabel: input.reviewed ? 'Reviewed evidence answer' : 'Medicine evidence record',
    finding: finding ? truncate(finding, SOCIAL_FINDING_LIMIT) : null,
  }
}

export const HOME_METADATA = {
  title: 'Medicine Evidence & Clinical Trial Results, Explained',
  description:
    'Source-linked medicine evidence in plain English: what researchers measured, what studies found, and what remains unknown.',
} as const

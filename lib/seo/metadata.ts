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

export interface DossierMetadataDescriptionInput {
  name: string
  reviewed: boolean
  /** Exact authored legacy answer still bound to its approved v2 evidence fingerprint. */
  provenanceBoundLegacy?: boolean
  usedFor?: string
  finding?: string
  limitation?: string
}

/**
 * Deterministic description made only from the visible first-read answer. Programme answers must
 * be reviewed publications; a finite flagship legacy answer may enter only through its exact v2
 * evidence fingerprint. Dosage, acquisition, protocol and community text are absent from the
 * input type, so callers cannot accidentally promote them into a search snippet.
 */
export function dossierMetadataDescription(input: DossierMetadataDescriptionInput): string {
  const name = compact(input.name) || 'This medicine'
  if (!input.reviewed && !input.provenanceBoundLegacy) {
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

// The public serialization boundary for a drug dossier.
//
// Laboratory workflows contain operational protocol detail. They remain available to the
// stewards and administrators who need to reload the editor, but they are not part of the public
// API or dataset. Redaction happens here rather than by replacing the workflow with `[]`: an empty
// array would falsely say that RNAWiki recorded no workflow, while an omitted field plus explicit
// access metadata says that the field was intentionally withheld.

import type {
  CommentUser,
  ConventionalSubstitute,
  DrugDossier,
  DrugSubstitutes,
  MolecularSchema,
} from '@/lib/types'

export type PublicMolecularSchema = Omit<MolecularSchema, 'laboratoryWorkflow'>

export type PublicDrugDossier = Omit<DrugDossier, 'molecularSchema'> & {
  molecularSchema?: PublicMolecularSchema
}

export type LaboratoryWorkflowAccess =
  | { status: 'full'; included: true }
  | {
      status: 'restricted'
      included: false
      reason: 'steward_or_admin_required'
    }

export interface DossierAccessMetadata {
  laboratoryWorkflow: LaboratoryWorkflowAccess
}

export interface PublicDossierReadPayload {
  drug: PublicDrugDossier
  access: {
    laboratoryWorkflow: Extract<LaboratoryWorkflowAccess, { status: 'restricted' }>
  }
}

export interface FullDossierReadPayload {
  drug: DrugDossier
  access: {
    laboratoryWorkflow: Extract<LaboratoryWorkflowAccess, { status: 'full' }>
  }
}

export type DossierReadPayload = PublicDossierReadPayload | FullDossierReadPayload

export type ProgrammeScopedDossierReadPayload<T extends DossierReadPayload = DossierReadPayload> =
  Omit<T, 'drug'> & {
    drug: Omit<T['drug'], 'oneSentenceVerdict'>
  }

/** Stable identity and technical-identity fields that do not claim a result for a particular use. */
export interface ProgrammeScopedMedicineIdentity {
  id: string
  name: string
  tradeName?: string
  modality: DrugDossier['modality']
  molecularSchema?: PublicMolecularSchema | MolecularSchema
  dossierDepth?: DrugDossier['dossierDepth']
  sourceProvenance?: string[]
  revisionCount?: number
  lastEditedAt?: string
  lastEditedBy?: string
  isMachineVerifiedStructure?: boolean
  viewCount?: number
}

export interface LegacyMedicineEvidenceBoundary {
  status: 'legacy_unscoped_not_authoritative'
  authoritativeForSelectedProgramme: false
  warning: string
  /**
   * Preserved for compatibility and audit only. The field names retain the older API vocabulary,
   * but their containing object makes their unscoped status explicit.
   */
  fields: Omit<DrugDossier, keyof ProgrammeScopedMedicineIdentity>
}

export interface SeparatedProgrammeDossierReadPayload<T extends DossierReadPayload> {
  payload: Omit<T, 'drug'> & { drug: ProgrammeScopedMedicineIdentity }
  legacyMedicineRecord: LegacyMedicineEvidenceBoundary
}

type WorkflowViewer = Pick<CommentUser, 'isAdmin' | 'trustTier'>

/** Only an authenticated steward or administrator may receive operational workflow detail. */
export function hasFullLaboratoryWorkflowAccess(
  viewer: WorkflowViewer | null | undefined,
): boolean {
  return viewer?.isAdmin === true || viewer?.trustTier === 'steward'
}

function omitLaboratoryWorkflow(schema: MolecularSchema): PublicMolecularSchema {
  // Delete from a fresh shallow copy. The database-backed source object is never changed.
  const copy: Partial<MolecularSchema> = { ...schema }
  delete copy.laboratoryWorkflow
  return copy as PublicMolecularSchema
}

/**
 * Removes the two parts of `substitutes` that no public surface may carry.
 *
 * `homeRemedies` does not describe remedies. Its `action` field addresses the reader in the
 * imperative — "Request that body weight be recorded at each visit", "If you are admitted to
 * hospital while taking dabigatran, say so explicitly" — across 892 recorded entries. That is a
 * patient action named in RNAWiki's own voice, which no phrasing makes permissible. It reaches no
 * page, because the dossier view model never projected it, so this endpoint was its only exit.
 *
 * `prosAndCons` weighs named alternative medicines against each other in RNAWiki's own voice
 * ("Pros: decades of accumulated data … Cons: abacavir requires HLA-B*5701 testing"). The
 * surrounding section is careful — it is titled "Other medical treatments for the same goal" and
 * states that the list is alphabetical and not a ranking — but a per-item pros-and-cons line IS the
 * ranking that copy disclaims.
 *
 * What stays is deliberate. `howItCompares` is overwhelmingly a recorded fact about one trial's own
 * comparator arm ("the comparator in registration trial GS-US-380-1489; 93.0% of 315 against 92.4%
 * of 314"), which is a statement about a single programme rather than a comparison RNAWiki is
 * making. `class` and `typicalCost` are recorded identity and recorded price.
 *
 * The stored rows are not modified. Authoring keeps whatever a curator wrote; the public boundary
 * decides what leaves.
 */
function omitUnpublishableSubstitutes(substitutes: DrugSubstitutes): DrugSubstitutes {
  return {
    ...substitutes,
    homeRemedies: [],
    conventionalRx: substitutes.conventionalRx.map((entry) => {
      const copy: Partial<ConventionalSubstitute> = { ...entry }
      delete copy.prosAndCons
      return copy as ConventionalSubstitute
    }),
  }
}

/** Serialize a dossier for an anonymous/public consumer. */
export function serializePublicDossier(dossier: DrugDossier): PublicDossierReadPayload {
  const withoutWorkflow: DrugDossier = dossier.molecularSchema
    ? {
        ...dossier,
        molecularSchema: omitLaboratoryWorkflow(dossier.molecularSchema) as MolecularSchema,
      }
    : { ...dossier }
  const drug: PublicDrugDossier = (
    withoutWorkflow.substitutes
      ? {
          ...withoutWorkflow,
          substitutes: omitUnpublishableSubstitutes(withoutWorkflow.substitutes),
        }
      : withoutWorkflow
  ) as PublicDrugDossier

  return {
    drug,
    access: {
      laboratoryWorkflow: {
        status: 'restricted',
        included: false,
        reason: 'steward_or_admin_required',
      },
    },
  }
}

/**
 * Serialize a dossier for an API viewer. Full detail is returned only when the viewer's current
 * database-backed account carries the steward tier or administrator flag.
 */
export function serializeDossierForViewer(
  dossier: DrugDossier,
  viewer: WorkflowViewer | null | undefined,
): DossierReadPayload {
  if (!hasFullLaboratoryWorkflowAccess(viewer)) return serializePublicDossier(dossier)

  return {
    // Clone the containers at the boundary so the serializer never hands callers the exact
    // database-backed objects it received. The workflow is included unchanged in meaning.
    drug: {
      ...dossier,
      ...(dossier.molecularSchema
        ? {
            molecularSchema: {
              ...dossier.molecularSchema,
              laboratoryWorkflow: dossier.molecularSchema.laboratoryWorkflow.map((step) => ({
                ...step,
              })),
            },
          }
        : {}),
    },
    access: { laboratoryWorkflow: { status: 'full', included: true } },
  }
}

/**
 * Remove the old medicine-wide conclusion when a programme-based record is available. Returning
 * both would give API consumers two conclusions with different scopes and no safe way to combine
 * them. The programme dossier remains the only conclusion-bearing object in that response.
 */
export function omitLegacyMedicineConclusion<T extends DossierReadPayload>(
  payload: T,
): ProgrammeScopedDossierReadPayload<T> {
  const drug: Partial<T['drug']> = { ...payload.drug }
  delete drug.oneSentenceVerdict
  return { ...payload, drug } as ProgrammeScopedDossierReadPayload<T>
}

/**
 * Separate unscoped legacy evidence from the selected programme's authoritative public view.
 *
 * An allow-list builds `drug`, so a future evidence-bearing field added to `DrugDossier` cannot
 * silently leak into a programme-scoped response. Everything else remains available inside an
 * explicitly non-authoritative compatibility object.
 */
export function separateLegacyMedicineEvidence<T extends DossierReadPayload>(
  payload: T,
): SeparatedProgrammeDossierReadPayload<T> {
  const {
    id,
    name,
    tradeName,
    modality,
    molecularSchema,
    dossierDepth,
    sourceProvenance,
    revisionCount,
    lastEditedAt,
    lastEditedBy,
    isMachineVerifiedStructure,
    viewCount,
    ...legacyFields
  } = payload.drug

  const drug: ProgrammeScopedMedicineIdentity = {
    id,
    name,
    modality,
    ...(tradeName ? { tradeName } : {}),
    ...(molecularSchema ? { molecularSchema } : {}),
    ...(dossierDepth ? { dossierDepth } : {}),
    ...(sourceProvenance ? { sourceProvenance: [...sourceProvenance] } : {}),
    ...(typeof revisionCount === 'number' ? { revisionCount } : {}),
    ...(lastEditedAt ? { lastEditedAt } : {}),
    ...(lastEditedBy ? { lastEditedBy } : {}),
    ...(typeof isMachineVerifiedStructure === 'boolean' ? { isMachineVerifiedStructure } : {}),
    ...(typeof viewCount === 'number' ? { viewCount } : {}),
  }

  return {
    payload: { ...payload, drug },
    legacyMedicineRecord: {
      status: 'legacy_unscoped_not_authoritative',
      authoritativeForSelectedProgramme: false,
      warning:
        'These fields belong to a general research summary covering the medicine as a whole. They were not reviewed for this specific use and are kept separate from the reviewed answer for that use.',
      fields: legacyFields as Omit<DrugDossier, keyof ProgrammeScopedMedicineIdentity>,
    },
  }
}

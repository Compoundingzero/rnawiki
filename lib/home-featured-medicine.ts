import type { ProgrammeEvidenceReadModel } from '@/lib/evidence/types'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { programmeEvidenceMedicineDossierView } from '@/lib/programme-dossier-view'
import type { DrugDossier } from '@/lib/types'

export interface HomeFeaturedMedicineAnswer {
  href: string
  usedFor: string
  /** Present only when the first read is bound to one normalized medicine use. */
  answerFor?: string
}

type FeaturedDossierFields = Pick<
  MedicineDossierViewModel,
  'slug' | 'bindingState' | 'selectedProgrammeLabel' | 'readerSummary'
>

/** Keeps the homepage copy byte-for-byte aligned with the already-built dossier first read. */
export function homeFeaturedAnswerFromDossier(
  dossier: FeaturedDossierFields,
): HomeFeaturedMedicineAnswer {
  return {
    href: `/d/${encodeURIComponent(dossier.slug)}`,
    usedFor: dossier.readerSummary.usedFor,
    ...(dossier.bindingState !== 'legacy_record'
      ? { answerFor: dossier.selectedProgrammeLabel }
      : {}),
  }
}

/**
 * Builds the homepage answer through the same canonical mapper as `/d/[slug]`.
 *
 * In particular, this function does not reuse a card-summary conclusion as a purpose statement.
 * `usedFor` is the exact `readerSummary.usedFor` value that the dossier itself would render for
 * the default selected programme. A legacy medicine honestly follows the same legacy fallback as
 * the dossier route and does not acquire a made-up programme label.
 */
export function homeFeaturedMedicineAnswer(
  drug: DrugDossier,
  programmeEvidence: ProgrammeEvidenceReadModel | null,
): HomeFeaturedMedicineAnswer {
  const dossier = programmeEvidenceMedicineDossierView(
    drug,
    programmeEvidence ?? {
      medicine: {
        id: drug.id,
        slug: drug.id,
        name: drug.name,
        modality: drug.modality,
      },
      programmes: [],
      selectedProgramme: null,
    },
  )

  return homeFeaturedAnswerFromDossier(dossier)
}

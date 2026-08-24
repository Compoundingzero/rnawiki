import { getPublicMedicineProjections } from '@/lib/queries/public-medicine-projection'
import { publicMedicineSummaryContext } from '@/lib/public-medicine-projection'

export interface PublicSearchSummaryBinding {
  type: 'programme_publication' | 'programme' | 'medicine_identity'
  programmeSlug?: string
  programmeTitle?: string
  verdictRevisionId?: string
  inputDigest?: string
}

/**
 * Give every compact search/list result the same scoped summary selected for home, browse and the
 * dataset export. A programme summary also carries the programme URL binding, so clicking the row
 * opens the evidence record that supplied the text.
 */
export async function bindPublicSearchSummaries<
  T extends { slug: string; patientFriendlyIndication: string },
>(
  hits: readonly T[],
): Promise<
  Array<
    T & {
      summaryBinding: PublicSearchSummaryBinding
      summaryContext: string | null
    }
  >
> {
  if (hits.length === 0) return []

  const projections = await getPublicMedicineProjections(hits.map((hit) => hit.slug))
  return hits.map((hit) => {
    const summary = projections.get(hit.slug)?.cardSummary
    if (!summary) {
      return {
        ...hit,
        summaryBinding: { type: 'medicine_identity' },
        summaryContext: null,
      }
    }

    const summaryContext = publicMedicineSummaryContext(summary)

    if (summary.kind === 'reviewed_programme') {
      return {
        ...hit,
        patientFriendlyIndication: summary.text,
        summaryBinding: {
          type: summary.binding.type,
          programmeSlug: summary.binding.programmeSlug,
          programmeTitle: summary.programmeTitle,
          verdictRevisionId: summary.binding.verdictRevisionId,
          inputDigest: summary.binding.inputDigest,
        },
        summaryContext,
      }
    }

    if (summary.kind === 'programme_indication') {
      return {
        ...hit,
        patientFriendlyIndication: summary.text,
        summaryBinding: {
          type: summary.binding.type,
          programmeSlug: summary.binding.programmeSlug,
          programmeTitle: summary.programmeTitle,
        },
        summaryContext,
      }
    }

    return {
      ...hit,
      patientFriendlyIndication: summary.text ?? '',
      summaryBinding: { type: 'medicine_identity' },
      summaryContext,
    }
  })
}
